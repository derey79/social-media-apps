'use client';

interface PublicProfileStatsProps {
  stats: {
    posts: number;
    followers: number;
    following: number;
    likes: number;
  };
  isClient: boolean;
}

export default function PublicProfileStats({
  stats,
  isClient,
}: PublicProfileStatsProps) {
  return (
    <div className='grid grid-cols-4 gap-2 text-center py-4 bg-[#0B0F17]/40 border border-[#181D27]/60 rounded-2xl'>
      {Object.entries(stats).map(([key, value]) => (
        <div key={key} className='space-y-0.5'>
          <p className='text-xl font-extrabold text-white tracking-tight'>
            {isClient ? value : 0}
          </p>
          <p className='text-xs text-neutral-400 font-medium tracking-wide capitalize'>
            {key}
          </p>
        </div>
      ))}
    </div>
  );
}
