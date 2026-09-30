import { Skeleton } from '../../../components/ui/Skeleton.jsx';

/** Loading stand-in for the details page, in its layout. Not in Figma. */
export function PropertyDetailsSkeleton() {
  return (
    <div aria-busy="true" className="flex flex-col gap-4 p-4 xl:px-20 xl:pt-[26px] xl:pb-[60px]">
      <Skeleton className="h-[250px] rounded-none xl:hidden" />
      <Skeleton className="h-8 w-2/3 xl:h-12 xl:w-1/3" />
      <Skeleton className="h-5 w-1/2 xl:w-1/4" />
      <Skeleton className="hidden h-[522px] rounded-[18px] xl:block" />
      <div className="flex gap-[26px]">
        <Skeleton className="h-40 flex-1 rounded-lg" />
        <Skeleton className="hidden h-40 w-[360px] rounded-lg xl:block" />
      </div>
    </div>
  );
}
