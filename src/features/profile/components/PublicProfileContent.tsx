'use client';

import { PostItem } from '@/types/types';
import PublicProfileHeader from '@/features/profile/components/PublicProfileHeader';
import PublicProfileStats from '@/features/profile/components/PublicProfileStats';
import ProfileTabs from '@/features/profile/components/ProfileTabs'; // 💡 SUNTIKKAN: Impor komponen modular baru kita!

interface PublicProfileContentProps {
  foundUser: {
    id: number;
    username: string;
    name: string;
    avatarUrl: string | null;
    bio: string | null;
    isFollowedByMe: boolean;
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
    <div className='w-full max-w-2xl mx-auto space-y-10 pt-4 text-left pb-36 px-4'>
      <PublicProfileHeader
        username={foundUser.username}
        name={foundUser.name}
        avatarUrl={foundUser.avatarUrl}
        isFollowedByMe={foundUser.isFollowedByMe}
        isClient={isClient}
      />

      <PublicProfileStats
        stats={livePublicStats}
        isClient={isClient}
        username={foundUser.username}
        isMyProfile={false}
      />

      <ProfileTabs
        username={foundUser.username}
        isMyProfile={false}
        initialPosts={userRealPosts}
      />
    </div>
  );
}
