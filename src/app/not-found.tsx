import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="w-full px-16 min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-lg mb-4">Page Not Found</h2>
        <p className="text-sm text-gray-500 mb-8">Could not find requested resource</p>
        <Link 
          href="/"
          className="px-4 py-2 border border-black hover:bg-black hover:text-white transition-colors"
        >
          Return Home
        </Link>
      </div>
    </div>
  )
} 