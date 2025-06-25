export default function Loading() {
  return (
    <div className="w-full px-16 min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-100 rounded w-64 mb-12"></div>
          <div className="flex">
            <div className="w-64 space-y-4">
              <div className="h-4 bg-gray-100 rounded w-full"></div>
              <div className="h-4 bg-gray-100 rounded w-3/4"></div>
              <div className="h-4 bg-gray-100 rounded w-1/2"></div>
            </div>
            <div className="flex-1 ml-16 space-y-4">
              <div className="h-64 bg-gray-100 rounded w-full"></div>
              <div className="h-64 bg-gray-100 rounded w-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 