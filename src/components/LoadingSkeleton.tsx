/**
 * Loading skeleton component.
 * Shows animated placeholder during data loading.
 */
export function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Calendar skeleton */}
      <div className="bg-muted/50 rounded-lg p-6 space-y-4">
        <div className="h-8 bg-muted rounded w-48 mx-auto" />
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="h-10 bg-muted rounded" />
          ))}
        </div>
      </div>

      {/* Stats skeleton */}
      <div className="bg-muted/50 rounded-lg p-6 space-y-3">
        <div className="h-6 bg-muted rounded w-32" />
        <div className="h-4 bg-muted rounded w-24" />
        <div className="h-4 bg-muted rounded w-28 mt-4" />
      </div>
    </div>
  );
}
