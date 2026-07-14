'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';
import { Smile, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ModalCommentFormProps {
  postId: number;
}

export default function ModalCommentForm({ postId }: ModalCommentFormProps) {
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState('');

  const addCommentMutation = useMutation({
    mutationFn: async (text: string) => {
      const response = await axiosInstance.post(`/posts/${postId}/comments`, {
        text: text,
      });
      return response.data;
    },
    onSuccess: () => {
      setCommentText('');
      queryClient.invalidateQueries({
        queryKey: ['posts', 'comments', postId],
      });
      queryClient.invalidateQueries({ queryKey: ['posts', 'list'] });
      toast.success('Comment shared securely!');
    },
    onError: () => {
      toast.error('Failed to post comment. Please try again.');
    },
  });

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || addCommentMutation.isPending) return;
    addCommentMutation.mutate(commentText);
  };

  return (
    <form
      onSubmit={handleCommentSubmit}
      className='p-4 bg-[#0B0F17] border-t border-[#181D27] flex items-center gap-3'
    >
      <div className='relative flex-1'>
        <input
          type='text'
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          disabled={addCommentMutation.isPending}
          placeholder={
            addCommentMutation.isPending
              ? 'Sharing comment...'
              : 'Add Comment...'
          }
          className='w-full h-11 pl-4 pr-10 bg-[#070A10] border border-[#181D27] text-sm text-white rounded-xl placeholder:text-neutral-500 focus:outline-none focus:border-neutral-700 transition-all disabled:opacity-50'
        />
        <button
          type='button'
          className='absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition'
        >
          <Smile className='h-4 w-4' />
        </button>
      </div>

      <button
        type='submit'
        disabled={!commentText.trim() || addCommentMutation.isPending}
        className='text-sm font-bold text-blue-500 hover:text-blue-400 disabled:text-neutral-600 transition disabled:cursor-not-allowed px-2 h-11 flex items-center gap-1 shrink-0'
      >
        {addCommentMutation.isPending && (
          <Loader2 className='h-3 w-3 animate-spin' />
        )}
        <span>Post</span>
      </button>
    </form>
  );
}
