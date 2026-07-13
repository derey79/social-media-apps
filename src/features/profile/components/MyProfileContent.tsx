'use client';

import { useSyncExternalStore } from 'react';
import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';
import { RootState } from '@/lib/store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Grid3X3, Settings, Loader2 } from 'lucide-react';
import { PostItem } from '@/types/types';

import PublicProfileStats from '@/features/profile/components/PublicProfileStats';
import PostCard from '@/features/feed/components/PostCard';

interface UserPostsApiResponse {
  success: boolean;
  message: string;
  data: {
    posts: PostItem[];
    pagination: {
      total: number;
    };
  };
}

const emptySubscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export default function MyProfileContent() {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    getSnapshot,
    getServerSnapshot
  );

  // Ambil data profil dasar visual langsung dari Redux global memori browser
  const { user: currentUser } = useSelector((state: RootState) => state.auth);

  // 💡 KUERI 1: Tarik daftar postingan milik saya (Untuk hitung Posts & Likes)
  const { data: postsData, isLoading: isPostsLoading } =
    useQuery<UserPostsApiResponse>({
      queryKey: ['user', 'my-posts', currentUser?.username],
      queryFn: async () => {
        const res = await axiosInstance.get(
          `/users/${currentUser?.username}/posts?page=1&limit=50`
        );
        return res.data;
      },
      enabled: !!currentUser?.username,
    });

  // 💡 KUERI 2: Tarik total Followers riil saya dari server Railway
  const { data: myFollowersData, isLoading: isFollowersLoading } =
    useQuery<UserPostsApiResponse>({
      queryKey: ['user', 'my-followers', currentUser?.username],
      queryFn: async () => {
        const res = await axiosInstance.get(
          `/users/${currentUser?.username}/followers?page=1&limit=1`
        );
        return res.data;
      },
      enabled: !!currentUser?.username,
    });

  // 💡 KUERI 3: Tarik total Following riil saya dari server Railway
  const { data: myFollowingData, isLoading: isFollowingLoading } =
    useQuery<UserPostsApiResponse>({
      queryKey: ['user', 'my-following', currentUser?.username],
      queryFn: async () => {
        const res = await axiosInstance.get(
          `/users/${currentUser?.username}/following?page=1&limit=1`
        );
        return res.data;
      },
      enabled: !!currentUser?.username,
    });

  const getInitials = (nameStr: string) => {
    if (!nameStr) return '??';
    return nameStr.split(' ').slice(0, 2).join('').toUpperCase().slice(0, 2);
  };

  // Gabungkan status loading seluruh kueri paralel agar tidak berkedip patah-patah
  if (isPostsLoading || isFollowersLoading || isFollowingLoading) {
    return (
      <div className='py-24 flex flex-col items-center justify-center gap-3 text-white'>
        <Loader2 className='h-8 w-8 text-blue-500 animate-spin' />
        <p className='text-sm text-neutral-400 font-medium'>
          Streaming your live network stats...
        </p>
      </div>
    );
  }

  const myRealPosts = postsData?.data?.posts || [];

  // EXTRAK HITUNGAN NUMERIK TOTAL LANGSUNG DARI STRUKTUR PAGINATION API SWAGGER ANDA
  const totalReceivedLikes = myRealPosts.reduce(
    (acc, curr) => acc + (curr.likeCount || 0),
    0
  );
  const realMyFollowers = myFollowersData?.data?.pagination?.total || 0;
  const realMyFollowing = myFollowingData?.data?.pagination?.total || 0;

  const liveMyStats = {
    posts: myRealPosts.length,
    followers: realMyFollowers,
    following: realMyFollowing,
    likes: totalReceivedLikes,
  };

  return (
    // =========================================================================
    // 💡 pb-36 MENJAMIN DOCK FLATING NAV TIDAK MENUTUPI POSTINGAN TERBAWAH ANDA
    // =========================================================================
    <div className='w-full max-w-2xl mx-auto space-y-10 pt-4 text-left pb-36'>
      {/* HEADER SECTION */}
      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-[#181D27]'>
        <div className='flex items-center gap-5'>
          <Avatar className='h-24 w-24 border-2 border-[#181D27]'>
            <AvatarImage
              src={isClient ? currentUser?.avatarUrl || undefined : undefined}
              alt={currentUser?.name}
            />
            <AvatarFallback className='bg-neutral-800 text-white font-bold text-2xl'>
              {isClient && currentUser?.name
                ? getInitials(currentUser.name)
                : '??'}
            </AvatarFallback>
          </Avatar>

          <div className='space-y-1'>
            <h2 className='text-xl font-bold text-white tracking-tight'>
              {isClient ? currentUser?.username : '...'}
            </h2>
            <p className='text-sm text-neutral-400'>
              {isClient ? currentUser?.name : '...'}
            </p>
            {isClient && currentUser?.bio && (
              <p className='text-xs text-neutral-500 pt-1 max-w-sm'>
                {currentUser.bio}
              </p>
            )}
          </div>
        </div>

        {/* Murni hanya tombol Edit Profile tanpa duplikasi Logout */}
        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            className='rounded-full px-4 h-9 font-bold text-xs border-[#181D27] bg-transparent text-white hover:bg-neutral-900 transition flex items-center gap-1.5 cursor-pointer'
          >
            <Settings className='h-3.5 w-3.5' />
            <span>Edit Profile</span>
          </Button>
        </div>
      </div>

      {/* RENDER COMPONENT MATRIKS STATISTIK COUNTER */}
      <PublicProfileStats stats={liveMyStats} isClient={isClient} />

      {/* AREA TAB LAYOUT BAWAH */}
      <Tabs defaultValue='my-posts' className='w-full'>
        <TabsList className='w-full justify-start bg-transparent border-b border-[#181D27] rounded-none p-0 h-auto gap-8'>
          <TabsTrigger
            value='my-posts'
            className='data-[state=active]:border-b-2 data-[state=active]:border-white data-[state=active]:text-white rounded-none bg-transparent p-0 pb-3 text-sm font-semibold text-neutral-400 border-b-2 border-transparent transition-all flex items-center gap-2'
          >
            <Grid3X3 className='h-4 w-4' />
            <span>My Stories ({myRealPosts.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value='my-posts'
          className='pt-6 focus-visible:outline-none space-y-4'
        >
          {myRealPosts.length === 0 ? (
            <p className='text-sm text-neutral-400 tracking-wide font-medium text-center py-12'>
              You haven&apos;t published any stories yet. Go to home feed to
              start writing! 🚀
            </p>
          ) : (
            myRealPosts.map((postItem: PostItem) => (
              <PostCard key={postItem.id} post={postItem} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
