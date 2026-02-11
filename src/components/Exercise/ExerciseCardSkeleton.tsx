import { Skeleton } from '@/components/ui/skeleton';

export function ExerciseCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <Skeleton className="aspect-video w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-3 w-12 rounded-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex gap-1.5">
          <Skeleton className="h-4 w-14 rounded-full" />
          <Skeleton className="h-4 w-16 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function ExerciseCardSkeletonGrid({ count = 9 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }, (_, i) => (
        <ExerciseCardSkeleton key={i} />
      ))}
    </div>
  );
}
