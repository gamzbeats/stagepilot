'use client'

import Link from 'next/link'
import { Application, STATUS_LABELS, STATUS_COLORS } from '@/types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface ApplicationTableProps {
  applications: Application[]
}

export function ApplicationTable({ applications }: ApplicationTableProps) {
  if (applications.length === 0) {
    return (
      <div className="text-center py-16 text-slate-500">
        <svg
          className="w-12 h-12 mx-auto mb-4 text-slate-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="font-medium">No applications yet</p>
        <p className="text-sm mt-1">Add your first application to get started</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Company</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Date added</TableHead>
          <TableHead>Notes</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {applications.map((app) => (
          <TableRow key={app.id} className="hover:bg-slate-50">
            <TableCell className="font-medium">
              <Link
                href={`/applications/${app.id}`}
                className="hover:text-blue-600 hover:underline"
              >
                {app.company}
              </Link>
            </TableCell>
            <TableCell className="text-slate-600">{app.role}</TableCell>
            <TableCell>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  STATUS_COLORS[app.status]
                }`}
              >
                {STATUS_LABELS[app.status]}
              </span>
            </TableCell>
            <TableCell className="text-slate-500 text-sm">
              {new Date(app.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </TableCell>
            <TableCell className="text-slate-500 text-sm max-w-xs truncate">
              {app.notes || '—'}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
