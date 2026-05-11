import { requireUser } from '@/lib/auth/session'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireUser('/dashboard')

  return children
}
