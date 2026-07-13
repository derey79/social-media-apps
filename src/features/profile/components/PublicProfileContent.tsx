'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PublicProfileHeader from './PublicProfileHeader';
import PublicProfileStats from './PublicProfileStats';
import PostCard from '@/features/feed/components/PostCard';
import { PostItem } from '@/types/types';

// Daftarkan kontrak tipe data parameter properti masuk
interface PublicProfileContentProps {
  foundUser: {
    id: number;
    username: string;
    name: string;
    avatarUrl: string | null;
    isFollowedByMe: boolean;
    _count?: {
      followers: number;
      following: number;
    };
  };
  userRealPosts: PostItem[];
  realFollowersCount: number;
  realFollowingCount: number;
  totalReceivedLikes: number;
  isClient: boolean;
}

export default function PublicProfileContent({
  foundUser,
  userRealPosts,
  realFollowersCount,
  realFollowingCount,
  totalReceivedLikes,
  isClient,
}: PublicProfileContentProps) {
  const livePublicStats = {
    posts: userRealPosts.length,
    followers: realFollowersCount,
    following: realFollowingCount,
    likes: totalReceivedLikes,
  };

  return (
    <div className='w-full max-w-2xl mx-auto space-y-10 pt-4 text-left'>
      {/* HEADER PROFIL PUBLIK */}
      <PublicProfileHeader
        userId={foundUser.id}
        username={foundUser.username}
        name={foundUser.name}
        avatarUrl={foundUser.avatarUrl}
        isFollowedByMe={foundUser.isFollowedByMe}
        isClient={isClient}
      />

      {/* MATRIKS STATISTIK COUNTER ANGKA */}
      <PublicProfileStats stats={livePublicStats} isClient={isClient} />

      {/* TAB AREA LIST POSTINGAN BAWAH */}
      <Tabs defaultValue='user-posts' className='w-full'>
        <TabsList className='w-full justify-start bg-transparent border-b border-[#181D27] rounded-none p-0 h-auto gap-8'>
          <TabsTrigger
            value='user-posts'
            className='data-[state=active]:border-b-2 data-[state=active]:border-white data-[state=active]:text-white rounded-none bg-transparent p-0 pb-3 text-sm font-semibold text-neutral-400 border-b-2 border-transparent transition-all flex items-center gap-2'
          >
            <span>Posts ({userRealPosts.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value='user-posts'
          className='pt-6 focus-visible:outline-none space-y-4'
        >
          {userRealPosts.length === 0 ? (
            <p className='text-sm text-neutral-400 tracking-wide font-medium text-center py-12'>
              {`@${foundUser.username} hasn't posted anything yet.`}
            </p>
          ) : (
            userRealPosts.map((postItem) => (
              <PostCard key={postItem.id} post={postItem} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
