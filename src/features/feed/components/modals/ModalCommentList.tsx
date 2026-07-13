'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { axiosInstance } from '@/lib/axios';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import CommentSkeleton from '@/components/ui/CommentSkeleton';

export interface CommentAuthor {
  id: number;
  username: string;
  name: string;
  avatarUrl: string | null;
}

export interface CommentItem {
  id: number;
  text: string;
  createdAt: string;
  author: CommentAuthor;
}

interface CommentsApiResponse {
  success: boolean;
  message: string;
  data: {
    comments: CommentItem[];
  };
}

interface ModalCommentListProps {
  postId: number;
  getInitials: (name: string) => string;
  formatCommentTime: (dateStr: string) => string;
}

export default function ModalCommentList({
  postId,
  getInitials,
  formatCommentTime,
}: ModalCommentListProps) {
  const queryClient = useQueryClient();

  const { user: currentUser } = useSelector((state: RootState) => state.auth);

  const { data: commentsData, isLoading: isCommentsLoading } =
    useQuery<CommentsApiResponse>({
      queryKey: ['posts', 'comments', postId],
      queryFn: async () => {
        const response = await axiosInstance.get(`/posts/${postId}/comments`);
        return response.data;
      },
      enabled: !!postId,
    });

  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: number) => {
      const response = await axiosInstance.delete(`/comments/${commentId}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Comment deleted successfully!');

      queryClient.invalidateQueries({
        queryKey: ['posts', 'comments', postId],
      });

      queryClient.invalidateQueries({ queryKey: ['posts', 'list'] });
    },
    onError: () => {
      toast.error('Failed to delete comment. Please try again.');
    },
  });

  const handleDeleteClick = (commentId: number) => {
    // if (window.confirm('Are you sure you want to delete this comment?')) {
    deleteCommentMutation.mutate(commentId);
    // }
  };

  const commentsList = commentsData?.data?.comments || [];

  if (isCommentsLoading) {
    return (
      <div className='w-full py-2'>
        <CommentSkeleton count={4} />
      </div>
    );
  }

  if (commentsList.length === 0) {
    return (
      <div className='py-12 text-center text-sm text-neutral-500'>
        No comments yet. Be the first to start the conversation! 💬
      </div>
    );
  }

  return (
    <div className='space-y-5 w-full'>
      {commentsList.map((comment: CommentItem) => {
        const isMyComment =
          currentUser && Number(currentUser.id) === comment.author.id;

        return (
          <div
            key={comment.id}
            className='flex items-start justify-between gap-3 text-sm animate-in fade-in slide-in-from-bottom-2 duration-200 group w-full'
          >
            <div className='flex items-start gap-3 min-w-0 flex-1 text-left'>
              <Avatar className='h-8 w-8 border border-[#181D27] shrink-0 mt-0.5'>
                <AvatarImage src={comment.author.avatarUrl || undefined} />
                <AvatarFallback className='bg-neutral-800 text-white font-bold text-[10px]'>
                  {getInitials(comment.author.name)}
                </AvatarFallback>
              </Avatar>
              <div className='flex flex-col space-y-0.5 min-w-0 flex-1'>
                <div className='leading-relaxed wrap-break-words'>
                  <span className='font-bold text-white mr-2 hover:underline cursor-pointer'>
                    {comment.author.name}
                  </span>
                  <span className='text-neutral-300'>{comment.text}</span>
                </div>
                <span className='text-[10px] text-neutral-500 font-medium'>
                  {formatCommentTime(comment.createdAt)}
                </span>
              </div>
            </div>

            {isMyComment && (
              <button
                onClick={() => handleDeleteClick(comment.id)}
                disabled={deleteCommentMutation.isPending}
                className='shrink-0 p-1 text-neutral-500 hover:text-red-400 disabled:text-neutral-700 transition rounded-md ml-auto cursor-pointer'
                title='Delete comment'
              >
                <Trash2 className='h-3.5 w-3.5' />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
