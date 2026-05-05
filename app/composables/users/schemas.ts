import { z } from 'zod'

export const createUserSchema = z.object({
  email: z.email('Invalid email').min(1, 'Email is required'),
  username: z.string().min(1, 'Username is required').max(255),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  roleId: z.string().optional(),
})

export const editUserSchema = z.object({
  email: z.email('Invalid email').min(1, 'Email is required'),
  username: z.string().min(1, 'Username is required').max(255),
  password: z
    .string()
    .refine((v) => v === '' || v.length >= 6, 'Password must be at least 6 characters'),
  roleId: z.string().optional(),
})

export type CreateUserSchema = z.infer<typeof createUserSchema>
export type EditUserSchema = z.infer<typeof editUserSchema>
