'use client'

import { useState } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { createClient } from '@/lib/supabase/client'
import { Application, ApplicationStatus } from '@/types'
import { KanbanColumn } from './kanban-column'
import { ApplicationCard } from './application-card'

const COLUMNS: ApplicationStatus[] = ['saved', 'applied', 'interview', 'rejected', 'offer']

interface KanbanBoardProps {
  initialApplications: Application[]
}

export function KanbanBoard({ initialApplications }: KanbanBoardProps) {
  const [applications, setApplications] = useState(initialApplications)
  const [activeApp, setActiveApp] = useState<Application | null>(null)
  const supabase = createClient()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const followUpIds = new Set(
    applications
      .filter((a) => a.status === 'applied' && new Date(a.created_at) < sevenDaysAgo)
      .map((a) => a.id)
  )

  function handleDragStart(event: DragStartEvent) {
    const app = applications.find((a) => a.id === event.active.id)
    if (app) setActiveApp(app)
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveApp(null)
    const { active, over } = event
    if (!over) return

    const draggedApp = applications.find((a) => a.id === active.id)
    if (!draggedApp) return

    // over.id can be either a status (column drop) or an application id (card drop)
    let newStatus: ApplicationStatus

    if (COLUMNS.includes(over.id as ApplicationStatus)) {
      newStatus = over.id as ApplicationStatus
    } else {
      const targetApp = applications.find((a) => a.id === over.id)
      if (!targetApp || targetApp.status === draggedApp.status) return
      newStatus = targetApp.status
    }

    if (newStatus === draggedApp.status) return

    // Optimistic update
    setApplications((prev) =>
      prev.map((a) => (a.id === draggedApp.id ? { ...a, status: newStatus } : a))
    )

    // Persist to DB
    await supabase
      .from('applications')
      .update({ status: newStatus })
      .eq('id', draggedApp.id)
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            applications={applications.filter((a) => a.status === status)}
            followUpIds={followUpIds}
          />
        ))}
      </div>

      <DragOverlay>
        {activeApp ? (
          <ApplicationCard application={activeApp} showFollowUp={followUpIds.has(activeApp.id)} />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
