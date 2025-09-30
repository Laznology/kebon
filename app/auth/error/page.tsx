import Link from 'next/link'
import { AlertCircle, Home, ArrowLeft } from 'lucide-react'

const errorMessages = {
  Configuration: 'There is a problem with the server configuration.',
  AccessDenied: 'Access denied. You do not have permission to sign in.',
  Verification: 'The verification token has expired or has already been used.',
  Default: 'An error occurred during authentication.',
}

interface AuthErrorPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function AuthErrorPage({ searchParams }: AuthErrorPageProps) {
  const params = await searchParams
  const error = params.error as keyof typeof errorMessages

  const errorMessage = errorMessages[error] || errorMessages.Default
  const isAccessDenied = error === 'AccessDenied'

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-destructive/10">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>

          <h1 className="mt-6 text-3xl font-bold tracking-tight text-foreground">
            Authentication Error
          </h1>

          <p className="mt-4 text-muted-foreground">
            {errorMessage}
          </p>

          {isAccessDenied && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Your email address is not authorized to access this application.
                Please contact the administrator for access.
              </p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <Link
            href="/signin"
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Try Again
          </Link>

          <Link
            href="/"
            className="group relative w-full flex justify-center py-2 px-4 border border-border text-sm font-medium rounded-md text-foreground bg-background hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
          >
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </Link>
        </div>

        {process.env.NODE_ENV === 'development' && error && (
          <div className="mt-8 p-4 bg-muted rounded-lg">
            <h3 className="text-sm font-medium text-foreground mb-2">
              Debug Information
            </h3>
            <p className="text-xs text-muted-foreground font-mono">
              Error Code: {error}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}