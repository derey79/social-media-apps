'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';

// 🔳 ZOD SCHEMA (TETAP SINKRON 100% DENGAN ATURAN BISNIS)
const editProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers and underscores allowed'),
  email: z.string().email('Invalid email address format'),
  phoneNumber: z
    .string()
    .min(9, 'Phone number is too short')
    .max(15, 'Phone number is too long')
    .optional()
    .or(z.literal('')),
  bio: z
    .string()
    .max(160, 'Bio cannot exceed 160 characters')
    .optional()
    .or(z.literal('')),
});

export type EditProfileFormValues = z.infer<typeof editProfileSchema>;

interface EditProfileFormProps {
  initialValues: EditProfileFormValues;
  onSubmit: (values: EditProfileFormValues) => void;
  isPending: boolean;
}

export default function EditProfileForm({
  initialValues,
  onSubmit,
  isPending,
}: EditProfileFormProps) {
  // =========================================================================
  // 👑 KUNCI STANDALONE FORM (NATIVE HOOK CONNECTION):
  // Kita hubungkan React Hook Form langsung menggunakan register, formState, dan errors.
  // Metode ini menghancurkan error missing module Shadcn selamanya!
  // =========================================================================
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditProfileFormValues>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: initialValues,
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className='space-y-5 text-left w-full'
    >
      {/* FIELD 1: NAME */}
      <div className='space-y-1.5 w-full'>
        <label className='text-xs font-bold text-neutral-400 block select-none'>
          Name
        </label>
        <input
          type='text'
          placeholder='Your full name'
          disabled={isPending}
          {...register('name')}
          className='w-full h-11 px-4 bg-[#090F17]/40 border border-[#181D27] text-sm text-white rounded-xl placeholder:text-neutral-600 focus:outline-none focus:border-neutral-700 transition-all disabled:opacity-50'
        />
        {errors.name && (
          <p className='text-xs text-rose-500 font-semibold mt-1 animate-in fade-in duration-200'>
            {errors.name.message}
          </p>
        )}
      </div>

      {/* FIELD 2: USERNAME */}
      <div className='space-y-1.5 w-full'>
        <label className='text-xs font-bold text-neutral-400 block select-none'>
          Username
        </label>
        <input
          type='text'
          placeholder='username'
          disabled={isPending}
          {...register('username')}
          className='w-full h-11 px-4 bg-[#090F17]/40 border border-[#181D27] text-sm text-white rounded-xl placeholder:text-neutral-600 focus:outline-none focus:border-neutral-700 transition-all disabled:opacity-50'
        />
        {errors.username && (
          <p className='text-xs text-rose-500 font-semibold mt-1 animate-in fade-in duration-200'>
            {errors.username.message}
          </p>
        )}
      </div>

      {/* FIELD 3: EMAIL */}
      <div className='space-y-1.5 w-full'>
        <div className='flex items-center justify-between'>
          <label className='text-xs font-bold text-neutral-400 block select-none'>
            Email
          </label>
          {/* Tag penanda tambahan agar user tidak bingung */}
          <span className='text-[10px] text-neutral-600 font-bold uppercase tracking-wider select-none'>
            Account ID Key
          </span>
        </div>
        <input
          type='email'
          placeholder='you@email.com'
          disabled={true}
          {...register('email')}
          className='w-full h-11 px-4 bg-[#090F17]/20 border border-[#181D27] text-sm text-neutral-500 rounded-xl placeholder:text-neutral-600 opacity-50 cursor-not-allowed focus:outline-none select-none'
        />
        {errors.email && (
          <p className='text-xs text-rose-500 font-semibold mt-1'>
            {errors.email.message}
          </p>
        )}
      </div>

      {/* FIELD 4: NUMBER PHONE */}
      <div className='space-y-1.5 w-full'>
        <label className='text-xs font-bold text-neutral-400 block select-none'>
          Number Phone
        </label>
        <input
          type='text'
          placeholder='081234567890'
          disabled={isPending}
          {...register('phoneNumber')}
          className='w-full h-11 px-4 bg-[#090F17]/40 border border-[#181D27] text-sm text-white rounded-xl placeholder:text-neutral-600 focus:outline-none focus:border-neutral-700 transition-all disabled:opacity-50'
        />
        {errors.phoneNumber && (
          <p className='text-xs text-rose-500 font-semibold mt-1 animate-in fade-in duration-200'>
            {errors.phoneNumber.message}
          </p>
        )}
      </div>

      {/* FIELD 5: BIO */}
      <div className='space-y-1.5 w-full'>
        <label className='text-xs font-bold text-neutral-400 block select-none'>
          Bio
        </label>
        <textarea
          placeholder='Tell something about yourself...'
          disabled={isPending}
          {...register('bio')}
          className='w-full min-h-25 p-4 bg-[#090F17]/40 border border-[#181D27] text-sm text-white rounded-xl placeholder:text-neutral-600 focus:outline-none focus:border-neutral-700 transition-all resize-none leading-relaxed disabled:opacity-50'
        />
        {errors.bio && (
          <p className='text-xs text-rose-500 font-semibold mt-1 animate-in fade-in duration-200'>
            {errors.bio.message}
          </p>
        )}
      </div>

      {/* TOMBOL SUBMIT UNGU FIGMA */}
      <div className='pt-4 w-full'>
        <Button
          type='submit'
          disabled={isPending}
          className='w-full h-11 rounded-full bg-[#6366F1] hover:bg-[#4F46E5] text-white text-sm font-bold shadow-lg shadow-indigo-600/10 cursor-pointer transition-all active:scale-[0.99] flex items-center justify-center gap-2'
        >
          {isPending ? (
            <>
              <Loader2 className='h-4 w-4 animate-spin' />
              <span>Processing...</span>
            </>
          ) : (
            <span>Save Changes</span>
          )}
        </Button>
      </div>
    </form>
  );
}
