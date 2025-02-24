export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="animate-pulse">
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Image Gallery Skeleton */}
            <div className="space-y-4">
              <div className="aspect-[16/9] bg-gray-200 rounded-xl" />
              <div className="overflow-x-auto pb-2">
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div 
                      key={i} 
                      className="flex-shrink-0 w-24 h-24 bg-gray-200 rounded-lg"
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Info Skeleton */}
            <div className="space-y-6">
              <div>
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-100 rounded-lg">
                {[1, 2].map((i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded" />
                ))}
              </div>

              <div className="space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/4" />
                <div className="grid grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-4 bg-gray-200 rounded" />
                  ))}
                </div>
              </div>

              <div className="bg-gray-100 p-4 rounded-xl space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/3" />
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 