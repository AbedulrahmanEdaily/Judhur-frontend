import { Skeleton } from '../../../components/ui/Skeleton.jsx';

/** Loading stand-in with the PropertyCard frame. Not in Figma. */
export function PropertyCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-border bg-raised">
      <Skeleton className="h-[150px] rounded-none xl:h-[186px]" />
      <div className="flex flex-col gap-3 p-4">
        <Skeleton className="h-6 w-28 rounded-full" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-7 w-24" />
      </div>
    </div>
  );
}
