'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { X, UserPlus, UserMinus } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { FollowApiResponse, FollowModalProps } from '@/types/types';

export default function FollowModal({
  username,
  type,
  onClose,
  isMyProfile = false,
}: FollowModalProps) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const endpointPath = isMyProfile
    ? `/me/${type}`
    : `/users/${username}/${type}`;

  const { data, isLoading, isError } = useQuery<FollowApiResponse>({
    queryKey: ['user', `public-${type}-list`, username, isMyProfile],
    queryFn: async () => {
      const res = await axiosInstance.get(`${endpointPath}?page=1&limit=30`);
      return res.data;
    },
    enabled: !!username,
  });

  const userList = data?.data?.users || [];
  // eksekusi follow unfollow
  const toggleFollowInListMutation = useMutation({
    mutationFn: async ({
      targetUser,
      isFollowing,
    }: {
      targetUser: string;
      isFollowing: boolean;
    }) => {
      if (isFollowing) {
        return (await axiosInstance.delete(`/follow/${targetUser}`)).data;
      } else {
        return (await axiosInstance.post(`/follow/${targetUser}`)).data;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['user', `public-${type}-list`, username, isMyProfile],
      });

      queryClient.invalidateQueries({
        queryKey: ['user', 'public-profile-detail', username],
      });
      queryClient.invalidateQueries({ queryKey: ['user', 'public-followers'] });
      queryClient.invalidateQueries({ queryKey: ['user', 'public-following'] });

      queryClient.invalidateQueries({ queryKey: ['user', 'my-followers'] });
      queryClient.invalidateQueries({ queryKey: ['user', 'my-following'] });

      queryClient.invalidateQueries({ queryKey: ['posts', 'home-feed-list'] });

      toast.success(
        variables.isFollowing
          ? `Unfollowed @${variables.targetUser}`
          : `You are now following @${variables.targetUser} `
      );
    },
    onError: () => {
      toast.error('Failed to sync relationship status with server.');
    },
  });

  const handleUserNavigate = (targetUsername: string) => {
    onClose();
    queryClient.invalidateQueries({
      queryKey: ['user', 'public-profile-detail', targetUsername],
    });

    const safeUsername = encodeURIComponent(targetUsername);
    router.push(`/profile/${safeUsername}`);
  };

  const getInitials = (nameStr: string) => {
    if (!nameStr) return '??';
    return nameStr.split(' ').slice(0, 2).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200'>
      <div className='relative w-full max-w-md bg-[#0F121A] border border-[#181D27] rounded-[24px] shadow-2xl flex flex-col max-h-[70vh] animate-in zoom-in-95 duration-200'>
        <div className='flex items-center justify-between px-6 py-4 border-b border-[#181D27]/60'>
          <h3 className='text-sm font-bold text-white tracking-tight capitalize'>
            {type === 'followers' ? 'Followers' : 'Following'}
          </h3>
          <button
            onClick={onClose}
            className='p-1.5 text-neutral-400 hover:text-white bg-neutral-900/40 hover:bg-neutral-800 rounded-full transition cursor-pointer'
          >
            <X className='h-4 w-4' />
          </button>
        </div>

        <div className='flex-1 overflow-y-auto p-4 custom-scrollbar space-y-3'>
          {isLoading ? (
            // skeleton
            <div className='space-y-4 py-2'>
              {Array.from({ length: 4 }).map((_, idx) => (
                <div
                  key={idx}
                  className='flex items-center justify-between p-2 animate-pulse'
                >
                  <div className='flex items-center gap-3 w-full'>
                    <div className='h-10 w-10 bg-neutral-900 border border-[#181D27] rounded-full shrink-0' />
                    <div className='space-y-2 w-1/2'>
                      <div className='h-3.5 bg-neutral-900 rounded-md w-3/4' />
                      <div className='h-2.5 bg-neutral-900 rounded-md w-1/2' />
                    </div>
                  </div>
                  <div className='h-8 w-20 bg-neutral-900 rounded-full shrink-0' />
                </div>
              ))}
            </div>
          ) : isError ? (
            <p className='text-center text-xs font-semibold text-red-400 py-8'>
              Failed to fetch network graph.
            </p>
          ) : userList.length === 0 ? (
            <p className='text-center text-sm text-neutral-500 py-12 font-medium'>
              {type === 'followers'
                ? 'No followers yet.'
                : 'Not following anyone yet.'}
            </p>
          ) : (
            userList.map((item) => (
              <div
                key={item.id}
                className='flex items-center justify-between p-2 rounded-xl hover:bg-neutral-900/30 transition-all group'
              >
                <div
                  onClick={() => handleUserNavigate(item.username)}
                  className='flex items-center gap-3 min-w-0 cursor-pointer select-none'
                >
                  <Avatar className='h-10 w-10 border border-[#181D27] shrink-0'>
                    <AvatarImage
                      src={item.avatarUrl || undefined}
                      alt={item.name}
                    />
                    <AvatarFallback className='bg-neutral-800 text-white font-bold text-xs'>
                      {getInitials(item.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className='flex flex-col min-w-0 text-left'>
                    <span className='text-sm font-bold text-white tracking-tight truncate group-hover:text-blue-400 transition-colors'>
                      {item.name}
                    </span>
                    <span className='text-xs text-neutral-400 truncate mt-0.5'>
                      @{item.username}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={() =>
                    toggleFollowInListMutation.mutate({
                      targetUser: item.username,
                      isFollowing: item.isFollowedByMe,
                    })
                  }
                  disabled={toggleFollowInListMutation.isPending}
                  size='sm'
                  className={`rounded-full px-4 h-8 font-bold text-xs flex items-center gap-1 transition-all select-none cursor-pointer shrink-0 ${
                    item.isFollowedByMe
                      ? 'bg-neutral-900 text-neutral-300 border border-[#181D27] hover:bg-neutral-800 hover:border-red-900/50 hover:text-red-400'
                      : 'bg-[#633BF3] hover:bg-[#522ed1] text-white shadow-md'
                  }`}
                >
                  {item.isFollowedByMe ? (
                    <UserMinus className='h-3 w-3' />
                  ) : (
                    <UserPlus className='h-3 w-3' />
                  )}
                  <span>{item.isFollowedByMe ? 'Following' : 'Follow'}</span>
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
