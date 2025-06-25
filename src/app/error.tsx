'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="w-full px-16 min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-lg mb-4">Something went wrong!</h2>
        <button
          className="px-4 py-2 border border-black hover:bg-black hover:text-white transition-colors"
          onClick={() => reset()}
        >
          Try again
        </button>
      </div>
    </div>
  )
} 