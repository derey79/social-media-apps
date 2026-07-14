'use client';

import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatPostTimestamp } from '@/constanta/formatPostTimestamp';
import { PostHeaderProps } from '@/types/types';

export default function PostHeader({ author, createdAt }: PostHeaderProps) {
  const router = useRouter();

  const getInitials = (name: string) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map((n) => n)
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleNavigate = (e: React.MouseEvent) => {
    e.stopPropagation();
    const safeUsername = encodeURIComponent(author.username);

    router.push(`/profile/${safeUsername}`);
  };

  return (
    <div
      onClick={handleNavigate}
      className='flex items-center gap-3 cursor-pointer group select-none'
    >
      <Avatar className='h-10 w-10 border border-[#181D27] group-hover:opacity-80 transition'>
        <AvatarImage src={author.avatarUrl || undefined} alt={author.name} />
        <AvatarFallback className='bg-neutral-800 font-bold text-xs text-white'>
          {getInitials(author.name)}
        </AvatarFallback>
      </Avatar>
      <div className='flex flex-col text-left'>
        <span className='text-sm font-bold text-white tracking-tight group-hover:underline'>
          {author.name}
        </span>
        <span className='text-xs text-neutral-500 mt-0.5'>
          {formatPostTimestamp(createdAt)}
        </span>
      </div>
    </div>
  );
}
