'use client';

import {
  use,
  useSyncExternalStore,
  useEffect,
  Suspense,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';
import { RootState } from '@/lib/store';
import { Loader2 } from 'lucide-react';
import { useScrollDirection } from '@/features/auth/hooks/useScrollDirection';
import { toast } from 'sonner';

// 💡 IMPOR SUB-KOMPONEN MODULAR UTAN
import PublicProfileContent from '@/features/profile/components/PublicProfileContent';
import MyProfileContent from '@/features/profile/components/MyProfileContent';
// import MyProfileContent from '@/features/feed/components/MyProfileContent';
import FeedBottomNav from '@/features/feed/components/FeedBottomNav';
import CreatePostModal from '@/features/feed/components/CreatePostModal';
import { PostItem } from '@/types/types';

interface ProfilePageProps {
  params: Promise<{ username?: string[] }>;
}

export default function ProfileOrchestratorPage({ params }: ProfilePageProps) {
  const resolvedParams = use(params);
  const targetUsername = resolvedParams.username?.[0] || null;

  return (
    <Suspense
      fallback={
        <div className='py-24 flex flex-col items-center justify-center gap-3 text-white'>
          <Loader2 className='h-8 w-8 text-blue-500 animate-spin' />
          <p className='text-sm text-neutral-400 font-medium'>
            Loading profile shell...
          </p>
        </div>
      }
    >
      <ProfileSwitcher targetUsername={targetUsername} />
    </Suspense>
  );
}

function ProfileSwitcher({
  targetUsername,
}: {
  targetUsername: string | null;
}) {
  const router = useRouter();
  const isVisible = useScrollDirection();
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const { user: currentUser, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const isMyOwnProfile =
    !targetUsername ||
    (currentUser &&
      currentUser.username.toLowerCase() === targetUsername.toLowerCase());

  useEffect(() => {
    if (
      isClient &&
      targetUsername &&
      currentUser &&
      currentUser.username.toLowerCase() === targetUsername.toLowerCase()
    ) {
      router.replace('/profile');
    }
  }, [isClient, targetUsername, currentUser, router]);

  // 💡 KUERI PARALEL SERVER (Murni hanya mengurus Data Fetching)
  const {
    data: profileResponse,
    isLoading: isUserLoading,
    isError,
  } = useQuery({
    queryKey: ['user', 'public-profile-detail', targetUsername],
    queryFn: async () =>
      (await axiosInstance.get(`/users/${targetUsername}`)).data,
    enabled: !isMyOwnProfile && !!targetUsername,
  });

  const foundUser = profileResponse?.data;

  const { data: postsData, isLoading: isPostsLoading } = useQuery({
    queryKey: ['user', 'public-posts', targetUsername],
    queryFn: async () =>
      (
        await axiosInstance.get(
          `/users/${targetUsername}/posts?page=1&limit=50`
        )
      ).data,
    enabled: !!foundUser?.id && !isMyOwnProfile,
  });

  const { data: followersData, isLoading: isFollowersLoading } = useQuery({
    queryKey: ['user', 'public-followers', targetUsername],
    queryFn: async () =>
      (
        await axiosInstance.get(
          `/users/${targetUsername}/followers?page=1&limit=1`
        )
      ).data,
    enabled: !!targetUsername && !isMyOwnProfile,
  });

  const { data: followingData, isLoading: isFollowingLoading } = useQuery({
    queryKey: ['user', 'public-following', targetUsername],
    queryFn: async () =>
      (
        await axiosInstance.get(
          `/users/${targetUsername}/following?page=1&limit=1`
        )
      ).data,
    enabled: !!targetUsername && !isMyOwnProfile,
  });

  const handlePlusAction = () => {
    if (!isAuthenticated) {
      toast.warning('Authentication Required', {
        description: 'Please sign in to publish your stories!',
      });
      router.push('/login');
    } else {
      setIsCreateOpen(true);
    }
  };

  // State loading terpadu untuk tampilan profil publik
  const isDataLoading =
    isUserLoading || isPostsLoading || isFollowersLoading || isFollowingLoading;

  return (
    <div className='w-full min-h-screen text-center relative pb-32'>
      {/* 🔳 KONDISI RENDERING YANG SUPER RINGKAS & INDAH */}
      {isMyOwnProfile ? (
        <MyProfileContent />
      ) : isDataLoading ? (
        <div className='py-24 flex flex-col items-center justify-center gap-3 text-white'>
          <Loader2 className='h-8 w-8 text-blue-500 animate-spin' />
          <p className='text-sm text-neutral-400 font-medium'>
            Streaming user profile data...
          </p>
        </div>
      ) : isError || !foundUser ? (
        <div className='p-8 bg-red-950/20 border border-red-900/40 rounded-2xl text-center text-red-400 font-semibold max-w-xl mx-auto mt-10'>
          User @{targetUsername} could not be found in the system database.
        </div>
      ) : (
        /* 🚀 SALURKAN DATA SECARA BERSIH KE SUB-KOMPONEN MODULAR BARU ANDA */
        <PublicProfileContent
          foundUser={foundUser}
          userRealPosts={postsData?.data?.posts || []}
          realFollowersCount={followersData?.data?.pagination?.total || 0}
          realFollowingCount={followingData?.data?.pagination?.total || 0}
          // 💡 KUNCI FIX: Ubah 'any' menjadi 'PostItem' secara eksplisit
          totalReceivedLikes={(postsData?.data?.posts || []).reduce(
            (acc: number, curr: PostItem) => acc + (curr.likeCount || 0),
            0
          )}
          isClient={isClient}
        />
      )}

      {/* MASTER NAV BAR BAWAH */}
      <FeedBottomNav
        isVisible={isVisible}
        handlePlusAction={handlePlusAction}
      />

      {/* MODAL CREATION STATUS OVERLAY */}
      {isCreateOpen && (
        <CreatePostModal onClose={() => setIsCreateOpen(false)} />
      )}
    </div>
  );
}
