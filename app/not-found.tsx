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
    <Suspense>
      <NotFoundContent />
    </Suspense>
  )
}