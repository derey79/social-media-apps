'use client';

import { use, useEffect, useSyncExternalStore, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';
import { RootState } from '@/lib/store';
import { ArrowLeft, Loader2 } from 'lucide-react';

// 💡 IMPOR REUSABLE PARTS MODULAR BARU ANDA
import PublicProfileHeader from '@/features/profile/components/PublicProfileHeader';
import PublicProfileStats from '@/features/profile/components/PublicProfileStats';
import PublicProfileTabs from '@/features/profile/components/PublicProfileTabs';

interface UserPageProps {
  params: Promise<{ username: string }>;
}

interface SearchedUser {
  id: number;
  username: string;
  name: string;
  avatarUrl: string | null;
  isFollowedByMe: boolean;
}

interface SearchApiResponse {
  success: boolean;
  message: string;
  data: {
    users: SearchedUser[];
  };
}

const emptySubscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export default function PublicProfilePage({ params }: UserPageProps) {
  const { username } = use(params);

  return (
    <Suspense
      fallback={
        <div className='py-24 flex flex-col items-center justify-center gap-3 text-white'>
          <Loader2 className='h-8 w-8 text-blue-500 animate-spin' />
          <p className='text-sm text-neutral-400 font-medium'>
            Streaming profile layout...
          </p>
        </div>
      }
    >
      <ProfileContent username={username} />
    </Suspense>
  );
}

// 💡 Hanya bertugas sebagai data-fetcher dan orchestrator penyalur props
function ProfileContent({ username }: { username: string }) {
  const router = useRouter();
  const isClient = useSyncExternalStore(
    emptySubscribe,
    getSnapshot,
    getServerSnapshot
  );
  const { user: currentUser } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (isClient && currentUser?.username === username) {
      router.replace('/profile');
    }
  }, [isClient, currentUser, username, router]);

  const {
    data: searchData,
    isLoading,
    isError,
    refetch,
  } = useQuery<SearchApiResponse>({
    queryKey: ['user', 'public-profile', username],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/users/search?q=${username}&page=1&limit=1`
      );
      return res.data;
    },
    enabled: !!username && currentUser?.username !== username,
  });

  const foundUser = searchData?.data?.users?.find(
    (u) => u.username.toLowerCase() === username.toLowerCase()
  );

  if (isClient && currentUser?.username === username) {
    return null;
  }

  if (isLoading) {
    return (
      <div className='py-24 flex flex-col items-center justify-center gap-3 text-white'>
        <Loader2 className='h-8 w-8 text-blue-500 animate-spin' />
        <p className='text-sm text-neutral-400 font-medium'>
          Streaming user database profile...
        </p>
      </div>
    );
  }

  if (isError || !foundUser) {
    return (
      <div className='w-full max-w-2xl mx-auto pt-4 text-left space-y-4'>
        <button
          onClick={() => router.back()}
          className='flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white transition'
        >
          <ArrowLeft className='h-4 w-4' />
          <span>Back</span>
        </button>
        <div className='p-8 bg-red-950/20 border border-red-900/40 rounded-2xl text-center space-y-3'>
          <p className='text-sm font-semibold text-red-400'>
            User @{username} could not be found in the database.
          </p>
          <button
            onClick={() => refetch()}
            className='rounded-md px-3 h-8 border border-red-900 text-xs bg-transparent text-white hover:bg-neutral-900 transition'
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const mockStats = { posts: 0, followers: 0, following: 0, likes: 0 };

  return (
    <div className='w-full max-w-2xl mx-auto space-y-10 pt-4 text-left'>
      <button
        onClick={() => router.back()}
        className='flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white transition'
      >
        <ArrowLeft className='h-4 w-4' />
        <span>Back to Feed</span>
      </button>

      {/* 💡 REUSABLE PART 1: HEADER & MUTATION FOLLOW */}
      <PublicProfileHeader
        userId={foundUser.id}
        username={foundUser.username}
        name={foundUser.name}
        avatarUrl={foundUser.avatarUrl}
        isFollowedByMe={foundUser.isFollowedByMe}
        isClient={isClient}
      />

      {/* 💡 REUSABLE PART 2: MATRIKS STATS COUNTER */}
      <PublicProfileStats stats={mockStats} isClient={isClient} />

      {/* 💡 REUSABLE PART 3: NAVIGASI TAB POSTS */}
      <PublicProfileTabs username={foundUser.username} />
    </div>
  );
}
