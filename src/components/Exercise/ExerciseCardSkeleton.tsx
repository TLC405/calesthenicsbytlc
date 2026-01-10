import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export function ExerciseCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-video w-full" />
      <CardContent className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <div className="flex gap-1">
          <Skeleton className="h-4 w-12 rounded" />
          <Skeleton className="h-4 w-14 rounded" />
          <Skeleton className="h-4 w-10 rounded" />
        </div>
      </CardContent>
    </Card>
  );
}

export function ExerciseCardSkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: count }, (_, i) => (
        <ExerciseCardSkeleton key={i} />
      ))}
    </div>
  );
}