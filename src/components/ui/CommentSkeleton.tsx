'use client';

interface CommentSkeletonProps {
  count?: number;
}

export default function CommentSkeleton({ count = 3 }: CommentSkeletonProps) {
  return (
    <div className='space-y-5 w-full'>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className='flex items-start justify-between gap-3 w-full animate-pulse'
        >
          <div className='flex items-start gap-3 min-w-0 flex-1'>
            <div className='h-8 w-8 bg-neutral-900 border border-[#181D27] rounded-full shrink-0 mt-0.5' />

            <div className='flex flex-col space-y-2 flex-1 pt-1'>
              <div className='h-3 w-24 bg-neutral-900 rounded-md' />
              <div className='h-3 w-full max-w-[85%] bg-neutral-900 rounded-md' />
              <div className='h-2 w-12 bg-neutral-950 rounded-md pt-0.5' />
            </div>
          </div>

          <div className='h-4 w-4 bg-neutral-950 rounded-md shrink-0 mt-1' />
        </div>
      ))}
    </div>
  );
}
