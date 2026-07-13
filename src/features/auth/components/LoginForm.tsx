'use client';

import { useState } from 'react'; // 💡 Impor useState untuk toggle eye
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { axiosInstance } from '@/lib/axios';
import axios from 'axios';
import Link from 'next/link';
import { loginSchema, LoginInput } from '@/schema/authSchema';
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/features/auth/store/authSlice';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2 } from 'lucide-react'; // 💡 Impor ikon mata & loader

export default function LoginForm() {
  const router = useRouter();
  const dispatch = useDispatch();

  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const mutation = useMutation({
    mutationFn: async (payload: LoginInput) => {
      const response = await axiosInstance.post('/auth/login', payload);
      return response.data;
    },
    onSuccess: (data) => {
      const token = data?.data?.token || data?.token;
      const userData = data?.data?.user || data?.user;

      if (token && userData) {
        dispatch(
          setCredentials({
            token: token,
            user: {
              id: String(userData.id),
              name: userData.name,
              username: userData.username,
              email: userData.email,
              phone: userData.phone,
              avatarUrl: userData.avatarUrl || null,
              bio: userData.bio || null,
            },
          })
        );

        toast.success(`Welcome back, ${userData.name}! 👋`, {
          description: 'You have logged in successfully.',
        });
        router.push('/feed');
      } else {
        toast.error('Format payload data server tidak sesuai.');
      }
    },
    onError: (error) => {
      let serverMessage = 'Email atau password salah.';
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data as
          | { message?: string }
          | undefined;
        serverMessage = errorData?.message || serverMessage;
      }
      toast.error('Authentication Failed', {
        description: serverMessage,
      });
    },
  });

  const onSubmit = (data: LoginInput) => {
    mutation.mutate(data);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className='space-y-5 w-full max-w-md p-8 rounded-[24px] shadow-lg border border-neutral-800 text-center bg-[#0B0F17]'
    >
      <div className='space-y-1'>
        <h2 className='text-2xl font-extrabold text-white tracking-tight'>
          Welcome Back
        </h2>
        <p className='text-sm text-neutral-400'>
          Sign in to stay connected with your friends.
        </p>
      </div>

      {/* email address */}
      <div className='space-y-1.5'>
        <Label
          htmlFor='email'
          className='text-xs font-bold tracking-wide text-neutral-300'
        >
          Email
        </Label>
        <Input
          id='email'
          type='email'
          placeholder='enter your email'
          className='h-11 rounded-xl border-neutral-800 bg-neutral-900/50 text-white focus-visible:ring-neutral-800'
          {...register('email')}
          suppressHydrationWarning={true}
        />
        {errors.email && (
          <p className='text-xs font-medium text-red-500'>
            {errors.email.message}
          </p>
        )}
      </div>

      {/* password */}
      <div className='space-y-1.5'>
        <Label
          htmlFor='password'
          className='text-xs font-bold tracking-wide text-neutral-300'
        >
          Password
        </Label>

        {/* Container relative agar posisi tombol mata pas di dalam input */}
        <div className='relative w-full'>
          <Input
            id='password'
            type={showPassword ? 'text' : 'password'} // 💡 Tipe input dinamis
            placeholder='••••••••'
            className='h-11 w-full rounded-xl border-neutral-800 bg-neutral-900/50 text-white pr-11 focus-visible:ring-neutral-800' // pr-11 memberi ruang agar teks tidak tertimpa ikon
            {...register('password')}
            suppressHydrationWarning={true}
          />

          {/* Ghost Eye Button */}
          <button
            type='button' // Wajib type="button" agar tidak memicu submit form secara tidak sengaja
            onClick={() => setShowPassword((prev) => !prev)}
            className='absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200 transition-colors p-1 rounded-md focus:outline-none'
          >
            {showPassword ? (
              <EyeOff className='h-4 w-4' />
            ) : (
              <Eye className='h-4 w-4' />
            )}
          </button>
        </div>

        {errors.password && (
          <p className='text-xs font-medium text-red-500'>
            {errors.password.message}
          </p>
        )}
      </div>

      {/* button login */}
      <Button
        type='submit'
        disabled={mutation.isPending}
        className='w-full h-11 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800/80 disabled:opacity-70 text-white rounded-xl font-bold transition-all text-sm shadow-sm cursor-pointer flex items-center justify-center gap-2'
      >
        {mutation.isPending && <Loader2 className='h-4 w-4 animate-spin' />}
        <span>{mutation.isPending ? 'Logging in...' : 'Login'}</span>
      </Button>

      <p className='text-center text-sm text-neutral-500 pt-2'>
        Don&apos;t have an account?{' '}
        <Link
          href='/register'
          className='font-bold text-blue-600 hover:underline'
        >
          Register here
        </Link>
      </p>
    </form>
  );
}
