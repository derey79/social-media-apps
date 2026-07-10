'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { axiosInstance } from '@/lib/axios';
import axios from 'axios';
import Link from 'next/link';
import { loginSchema, LoginInput } from '@/schema/authSchema';

// 💡 IMPOR UNTUK MENYUNTIKKAN STATE GLOBAL
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/features/auth/store/authSlice';

// IMPOR ELEMEN PRIMITIF SHADCN/UI
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function LoginForm() {
  const router = useRouter();
  const dispatch = useDispatch(); // 💡 Inisialisasi kurir dispatch Redux

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
      // 💡 Menyesuaikan struktur data bersarang sesuai respons asli database Railway Anda
      const token = data?.data?.token || data?.token;
      const userData = data?.data?.user || data?.user;

      if (token && userData) {
        // 💡 1. SUNTIKKAN DATA PROFIL ASLI API KE REDUX STORE GLOBAL (Seketika mengubah Navbar)
        dispatch(
          setCredentials({
            token: token,
            user: {
              id: String(userData.id), // Konversi aman number ke string
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
        router.push('/feed'); // Diarahkan ke feed privat
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
      className='space-y-5 w-full max-w-md p-8 bg-white rounded-[24px] shadow-sm border border-neutral-100 text-left'
    >
      <div className='space-y-1'>
        <h2 className='text-2xl font-extrabold text-neutral-900 tracking-tight'>
          Welcome Back
        </h2>
        <p className='text-sm text-neutral-500'>
          Sign in to stay connected with your friends.
        </p>
      </div>

      {/* FIELD EMAIL ADDRESS */}
      <div className='space-y-1.5'>
        <Label
          htmlFor='email'
          className='text-xs font-bold text-neutral-700 tracking-wide'
        >
          Email Address
        </Label>
        <Input
          id='email'
          type='email'
          placeholder='john@email.com'
          className='h-11 rounded-xl border-neutral-200 focus-visible:ring-blue-500'
          {...register('email')}
        />
        {errors.email && (
          <p className='text-xs font-medium text-red-500'>
            {errors.email.message}
          </p>
        )}
      </div>

      {/* FIELD PASSWORD */}
      <div className='space-y-1.5'>
        <Label
          htmlFor='password'
          className='text-xs font-bold text-neutral-700 tracking-wide'
        >
          Password
        </Label>
        <Input
          id='password'
          type='password'
          placeholder='••••••••'
          className='h-11 rounded-xl border-neutral-200 focus-visible:ring-blue-500'
          {...register('password')}
        />
        {errors.password && (
          <p className='text-xs font-medium text-red-500'>
            {errors.password.message}
          </p>
        )}
      </div>

      {/* BUTTON SUBMIT */}
      <Button
        type='submit'
        disabled={mutation.isPending}
        className='w-full h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all text-sm shadow-sm'
      >
        {mutation.isPending ? 'Signing in...' : 'Sign In'}
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
