import * as z from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal harus 6 karakter'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Nama minimal harus 2 karakter'),
  username: z
    .string()
    .min(3, 'Username minimal harus 3 karakter')
    .toLowerCase(),
  email: z.string().email('Format email tidak valid'),
  phone: z.string().min(10, 'Nomor telepon minimal harus 10 digit'),
  password: z.string().min(6, 'Password minimal harus 6 karakter'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
