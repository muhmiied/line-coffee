import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function AuthErrorPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center">
        <h1 className="font-serif text-2xl font-bold">Authentication link expired</h1>
        <p className="text-muted-foreground mt-3">
          Please request a new login, verification, or password reset link.
        </p>
        <Button asChild className="mt-6">
          <Link href="/auth/login">Back to login</Link>
        </Button>
      </div>
    </div>
  )
}
