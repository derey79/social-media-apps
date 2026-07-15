'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';

import { axiosInstance } from '@/lib/axios';
import { RootState } from '@/lib/store';
import { updateUser } from '@/features/auth/store/authSlice';

import { ArrowLeft, Camera } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

import EditProfileForm, {
  EditProfileFormValues,
} from '@/features/profile/components/EditProfileForm';

interface UpdateUserApiResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    username: string;
    name: string;
    email: string;
    avatarUrl: string | null;
    bio: string | null;
    phoneNumber?: string;
  };
}

interface ExtendedUser {
  id: number;
  username: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  bio: string | null;
  phoneNumber?: string;
}

interface BackendErrorResponse {
  success: boolean;
  message: string;
}

export default function EditProfilePage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentUser = useSelector(
    (state: RootState) => state.auth.user
  ) as ExtendedUser | null;

  const currentUserStats = useSelector((state: RootState) => state.auth.stats);

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const uploadToCloudinary = async (file: File): Promise<string> => {
    // const cloudName =
    //   process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'rahr4o0y';
    const uploadPreset =
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ||
      'sociality_preset_cloud';

    const formData = new FormData();
    formData.append('file', file, file.name);
    formData.append('upload_preset', uploadPreset);

    // Variabel cloudName dipanggil secara aktif dan legal menggunakan backtick!
    const response = await fetch(
      `https://cloudinary.com{cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData?.error?.message || 'Cloudinary network transmission failed.'
      );
    }

    const data = await response.json();
    return data.secure_url;
  };

  const updateProfileMutation = useMutation<
    UpdateUserApiResponse,
    Error,
    Partial<EditProfileFormValues> & { avatarUrl?: string }
  >({
    mutationFn: async (payload) => {
      const response = await axiosInstance.patch('/me', payload);
      return response.data;
    },
    onSuccess: (responseData) => {
      const updatedUser = responseData?.data || responseData;

      const normalizedUser = {
        ...updatedUser,
        id: updatedUser.id.toString(),
      };

      dispatch(
        updateUser({
          user: normalizedUser,
          stats: currentUserStats || {
            posts: 0,
            followers: 0,
            following: 0,
            likes: 0,
          },
        })
      );

      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });

      toast.success('Profile credentials updated successfully! ✨');
      router.push('/profile');
    },
    onError: (error) => {
      const axiosError = error as AxiosError<BackendErrorResponse>;
      const serverMessage = axiosError.response?.data?.message || error.message;

      toast.error(
        serverMessage || 'Failed to persist updates with backend server 💔'
      );
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file || !(file instanceof File)) {
      return;
    }

    if (file.size > 1024 * 1024 * 2) {
      toast.error('File size rejected', {
        description: 'Image size must be smaller than 2MB.',
      });
      return;
    }

    setSelectedFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleFormSubmit = async (values: EditProfileFormValues) => {
    try {
      let finalAvatarUrl = currentUser?.avatarUrl || null;

      if (selectedFile) {
        setIsUploadingImage(true);
        finalAvatarUrl = await uploadToCloudinary(selectedFile);
        setIsUploadingImage(false);
      }

      updateProfileMutation.mutate({
        name: values.name,
        username: values.username,
        email: values.email,
        phoneNumber: values.phoneNumber,
        bio: values.bio,
        ...(selectedFile && { avatarUrl: finalAvatarUrl as string }),
      });
    } catch (uploadError: unknown) {
      setIsUploadingImage(false);
      if (axios.isAxiosError(uploadError)) {
        console.error(
          '[Cloudinary Error Object]:',
          uploadError.response?.data || uploadError.message
        );

        const cloudinaryErrorMessage =
          uploadError.response?.data?.error?.message || uploadError.message;

        toast.error('Cloudinary Storage Rejected', {
          description: `Reason: ${cloudinaryErrorMessage} 💔`,
        });
      } else {
        // Antisipasi jika ada error non-network/runtime javascript biasa
        const fallbackMessage =
          uploadError instanceof Error ? uploadError.message : 'Unknown error';
        console.error('❌ [Runtime JavaScript Error]:', fallbackMessage);

        toast.error('Profile Update Interrupted', {
          description: fallbackMessage,
        });
      }
    }
  };

  const getInitials = (nameStr: string) => {
    if (!nameStr) return '??';
    return nameStr.split(' ').slice(0, 2).join('').toUpperCase().slice(0, 2);
  };

  const initialFormValues = {
    name: currentUser?.name || '',
    username: currentUser?.username || '',
    email: currentUser?.email || '',
    phoneNumber: currentUser?.phoneNumber || '',
    bio: currentUser?.bio || '',
  };

  return (
    <div className='w-full max-w-3xl mx-auto pt-6 px-4 pb-36 space-y-8 text-left bg-black text-white min-h-screen'>
      <div className='flex items-center gap-3 select-none'>
        <button
          onClick={() => router.back()}
          className='p-2 hover:bg-neutral-900 rounded-full transition cursor-pointer text-neutral-400 hover:text-white'
        >
          <ArrowLeft className='h-5 w-5' />
        </button>
        <h1 className='text-xl font-bold tracking-tight'>Edit Profile</h1>
      </div>

      <div className='w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-start pt-4'>
        <div className='md:col-span-4 flex flex-col items-center space-y-4'>
          <div className='relative group w-28 h-28 rounded-full overflow-hidden border border-[#181D27] bg-neutral-900 shadow-xl'>
            <Avatar className='w-full h-full'>
              <AvatarImage
                src={avatarPreview || currentUser?.avatarUrl || undefined}
                className='object-cover'
              />
              <AvatarFallback className='bg-neutral-800 text-white font-bold text-3xl'>
                {currentUser?.name ? getInitials(currentUser.name) : '??'}
              </AvatarFallback>
            </Avatar>
          </div>
          <input
            type='file'
            ref={fileInputRef}
            onChange={handleFileChange}
            accept='image/*'
            className='hidden'
          />
          <Button
            type='button'
            variant='outline'
            disabled={isUploadingImage || updateProfileMutation.isPending}
            onClick={() => fileInputRef.current?.click()}
            className='h-9 px-4 rounded-full border-[#181D27] bg-transparent text-xs font-bold text-white hover:bg-neutral-900 transition flex items-center gap-1.5 cursor-pointer'
          >
            <Camera className='h-3.5 w-3.5' />
            <span>Change Photo</span>
          </Button>
        </div>
        <div className='md:col-span-8'>
          <EditProfileForm
            initialValues={initialFormValues}
            onSubmit={handleFormSubmit}
            isPending={isUploadingImage || updateProfileMutation.isPending}
          />
        </div>
      </div>
    </div>
  );
}
