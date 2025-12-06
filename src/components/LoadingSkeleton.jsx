export default function LoadingSkeleton() {
  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
      {/* User Message Skeleton */}
      <div className="flex justify-end">
        <div className="max-w-[85%] sm:max-w-[80%]">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl sm:rounded-2xl rounded-br-none p-3 sm:p-4">
            <div className="h-4 bg-white/30 rounded animate-pulse w-32"></div>
          </div>
          <div className="flex items-center gap-2 mt-2 justify-end">
            <div className="h-6 w-6 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="h-6 w-6 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>
      {/* AI Message Skeleton */}
      <div className="flex justify-start">
        <div className="max-w-[85%] sm:max-w-[80%]">
          <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl shadow-sm p-3 sm:p-4">
            <div className="mb-2 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-purple-600 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-20"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-4/6"></div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <div className="h-6 w-6 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="h-6 w-6 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="h-6 w-6 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="h-6 w-6 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
      {/* Another User Message Skeleton */}
      <div className="flex justify-end">
        <div className="max-w-[85%] sm:max-w-[80%]">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl sm:rounded-2xl rounded-br-none p-3 sm:p-4">
            <div className="space-y-2">
              <div className="h-4 bg-white/30 rounded animate-pulse w-full"></div>
              <div className="h-4 bg-white/30 rounded animate-pulse w-3/4"></div>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2 justify-end">
            <div className="h-6 w-6 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="h-6 w-6 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>
      {/* Another AI Message Skeleton */}
      <div className="flex justify-start">
        <div className="max-w-[85%] sm:max-w-[80%]">
          <div className="bg-white border border-gray-200 rounded-xl sm:rounded-2xl shadow-sm p-3 sm:p-4">
            <div className="mb-2 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-purple-600 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse w-4/5"></div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <div className="h-6 w-6 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="h-6 w-6 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="h-6 w-6 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="h-6 w-6 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

