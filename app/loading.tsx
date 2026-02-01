// app/loading.tsx
export default function Loading() {
  return (
    <div className="flex min-h-screen p-8 bg-gray-50">
      <div className="w-80 hidden md:block bg-gray-200 animate-pulse rounded-lg mr-8 h-screen" />
      <div className="flex-1 space-y-4">
        <div className="h-10 bg-gray-200 animate-pulse rounded-lg mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-64 bg-gray-200 animate-pulse rounded-xl"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
