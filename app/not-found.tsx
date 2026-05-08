import { Suspense } from 'react'

function NotFoundContent() {
  return (
    <div>
      <h2>Page Not Found</h2>
    </div>
  )
}

export default function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '100px 20px' }}>
      <h1>404</h1>
      <p>الصفحة مش موجودة</p>
      <a href="/">ارجع للرئيسية</a>
    </div>
  )
}

export const dynamic = 'force-dynamic'