export function LoadingSkeleton({ type = 'card' }: { type?: 'card' | 'text' | 'chart' }) {
  if (type === 'card') {
    return (
      <div className="animate-pulse bg-gray-200 rounded-lg p-6 space-y-4">
        <div className="h-4 bg-gray-300 rounded w-3/4" />
        <div className="h-8 bg-gray-300 rounded w-1/2" />
      </div>
    );
  }

  if (type === 'text') {
    return (
      <div className="animate-pulse space-y-2">
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-5/6" />
        <div className="h-4 bg-gray-200 rounded w-4/6" />
      </div>
    );
  }

  if (type === 'chart') {
    return (
      <div className="animate-pulse bg-gray-200 rounded-lg p-6">
        <div className="h-4 bg-gray-300 rounded w-1/4 mb-4" />
        <div className="h-64 bg-gray-300 rounded" />
      </div>
    );
  }

  return null;
}

