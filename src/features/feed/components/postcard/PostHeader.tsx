'use client';

import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatPostTimestamp } from '@/constanta/formatPostTimestamp';

interface PostHeaderProps {
  author: {
    id: number;
    name: string;
    username: string;
    avatarUrl: string | null;
  };
  createdAt: string;
  likedByMe?: boolean;
}

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
    e.stopPropagation(); // Mencegah pemicu klik kartu terluar

    // 💡 SOLUSI REVISI PRESET: Hapus seluruh Query Parameters (?id=...&name=...)
    // karena halaman ProfileContent kita sudah ditenagai TanStack Query asinkronus
    // yang otomatis menarik data profile dari database berdasarkan username di URL bersih!
    const safeUsername = encodeURIComponent(author.username);

    // 🚀 Navigasi murni ke URL yang super bersih dan indah!
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
