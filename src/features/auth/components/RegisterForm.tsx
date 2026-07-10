'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { axiosInstance } from '@/lib/axios';
import axios from 'axios';
import Link from 'next/link';
import { registerSchema, RegisterInput } from '@/schema/authSchema';

// 💡 IMPOR UNTUK MENYUNTIKKAN STATE GLOBAL REDUX
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/features/auth/store/authSlice';

// 💡 IMPOR ELEMEN PRIMITIF SHADCN/UI
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function RegisterForm() {
  const router = useRouter();
  const dispatch = useDispatch(); // 💡 Inisialisasi kurir dispatch Redux

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const mutation = useMutation({
    mutationFn: async (payload: RegisterInput) => {
      const response = await axiosInstance.post('/auth/register', payload);
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

        toast.success('Account Created Successfully! 🎉', {
          description: `Welcome to the community, @${userData.username}!`,
        });
        router.push('/feed');
      } else if (token) {
        localStorage.setItem('social_auth_token', token);
        alert('Registrasi berhasil! Memulihkan data profil...');
        router.push('/feed');
      } else {
        toast.error('Format payload data server tidak sesuai.');
      }
    },
    onError: (error) => {
      let serverMessage = 'Gagal mendaftar akun baru.';
      if (axios.isAxiosError(error)) {
        const responseData = error.response?.data;
        if (responseData && typeof responseData === 'object') {
          if (
            'message' in responseData &&
            typeof responseData.message === 'string'
          ) {
            serverMessage = responseData.message;
          } else if (
            'error' in responseData &&
            typeof responseData.error === 'string'
          ) {
            serverMessage = responseData.error;
          }
        }
      }

      toast.error('Registration Failed', {
        description: serverMessage,
      });
    },
  });

  const onSubmit = (data: RegisterInput) => {
    mutation.mutate(data);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className='space-y-4 w-full max-w-md p-8 bg-white rounded-[24px] shadow-sm border border-neutral-100 text-left'
    >
      <div className='space-y-1 mb-2'>
        <h2 className='text-2xl font-extrabold text-neutral-900 tracking-tight'>
          Create your Account
        </h2>
        <p className='text-sm text-neutral-500'>
          Join us to explore amazing stories.
        </p>
      </div>

      {/* FULL NAME */}
      <div className='space-y-1'>
        <Label htmlFor='name' className='text-xs font-bold text-neutral-700'>
          Full Name
        </Label>
        <Input
          id='name'
          placeholder='John Doe'
          className='h-10 rounded-xl border-neutral-200'
          {...register('name')}
        />
        {errors.name && (
          <p className='text-xs font-medium text-red-500'>
            {errors.name.message}
          </p>
        )}
      </div>

      {/* USERNAME */}
      <div className='space-y-1'>
        <Label
          htmlFor='username'
          className='text-xs font-bold text-neutral-700'
        >
          Username
        </Label>
        <Input
          id='username'
          placeholder='johndoe'
          className='h-10 rounded-xl border-neutral-200'
          {...register('username')}
        />
        {errors.username && (
          <p className='text-xs font-medium text-red-500'>
            {errors.username.message}
          </p>
        )}
      </div>

      {/* EMAIL ADDRESS */}
      <div className='space-y-1'>
        <Label htmlFor='email' className='text-xs font-bold text-neutral-700'>
          Email Address
        </Label>
        <Input
          id='email'
          type='email'
          placeholder='john@email.com'
          className='h-10 rounded-xl border-neutral-200'
          {...register('email')}
        />
        {errors.email && (
          <p className='text-xs font-medium text-red-500'>
            {errors.email.message}
          </p>
        )}
      </div>

      {/* PHONE NUMBER */}
      <div className='space-y-1'>
        <Label htmlFor='phone' className='text-xs font-bold text-neutral-700'>
          Phone Number
        </Label>
        <Input
          id='phone'
          placeholder='081234567890'
          className='h-10 rounded-xl border-neutral-200'
          {...register('phone')}
        />
        {errors.phone && (
          <p className='text-xs font-medium text-red-500'>
            {errors.phone.message}
          </p>
        )}
      </div>

      {/* PASSWORD */}
      <div className='space-y-1'>
        <Label
          htmlFor='password'
          className='text-xs font-bold text-neutral-700'
        >
          Password
        </Label>
        <Input
          id='password'
          type='password'
          placeholder='••••••••'
          className='h-10 rounded-xl border-neutral-200'
          {...register('password')}
        />
        {errors.password && (
          <p className='text-xs font-medium text-red-500'>
            {errors.password.message}
          </p>
        )}
      </div>

      <Button
        type='submit'
        disabled={mutation.isPending}
        className='w-full h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all text-sm shadow-sm mt-2'
      >
        {mutation.isPending ? 'Registering...' : 'Register'}
      </Button>

      <p className='text-center text-sm text-neutral-500 pt-2'>
        Already have an account?{' '}
        <Link href='/login' className='font-bold text-blue-600 hover:underline'>
          Sign In here
        </Link>
      </p>
    </form>
  );
}
