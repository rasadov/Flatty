export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="animate-pulse">
        {/* Header */}
        <div className="h-16 bg-white border-b" />
        
        {/* Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Image Skeleton */}
            <div className="space-y-4">
              <div className="aspect-[16/9] bg-gray-200 rounded-xl" />
              <div className="grid grid-cols-4 gap-2">
                {[1,2,3,4].map((i) => (
                  <div key={i} className="aspect-square bg-gray-200 rounded-lg" />
                ))}
              </div>
            </div>

            {/* Info Skeleton */}
            <div className="space-y-6">
              <div>
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>

              <div className="p-6 bg-gray-100 rounded-xl space-y-4">
                <div className="h-8 bg-gray-200 rounded w-1/3" />
                <div className="grid grid-cols-3 gap-4 py-4">
                  {[1,2,3].map((i) => (
                    <div key={i} className="h-16 bg-gray-200 rounded" />
                  ))}
                </div>
                <div className="h-12 bg-gray-200 rounded" />
              </div>

              <div className="space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/4" />
                <div className="grid grid-cols-2 gap-3">
                  {[1,2,3,4].map((i) => (
                    <div key={i} className="h-4 bg-gray-200 rounded" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 