import { Application } from '@/types'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface FollowUpAlertProps {
  applications: Application[]
}

export function FollowUpAlert({ applications }: FollowUpAlertProps) {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const needsFollowUp = applications.filter(
    (app) =>
      app.status === 'applied' && new Date(app.created_at) < sevenDaysAgo
  )

  if (needsFollowUp.length === 0) return null

  return (
    <Alert className="border-yellow-200 bg-yellow-50 mb-6">
      <svg
        className="w-4 h-4 text-yellow-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
      <AlertTitle className="text-yellow-800 font-semibold">
        Follow-up recommended
      </AlertTitle>
      <AlertDescription className="text-yellow-700">
        You should follow up on{' '}
        <strong>
          {needsFollowUp.length} application{needsFollowUp.length > 1 ? 's' : ''}
        </strong>
        :{' '}
        {needsFollowUp
          .map((app) => `${app.company} (${app.role})`)
          .join(', ')}
        .
      </AlertDescription>
    </Alert>
  )
}
