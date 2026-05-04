import { z } from 'zod'

export const credentialsSchema = z.object({
  identifier: z.string().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required'),
})

export const otpSchema = z.object({
  pin: z.array(z.string()).length(6, 'Enter all 6 digits'),
})

export type CredentialsSchema = z.infer<typeof credentialsSchema>
export type OtpSchema = z.infer<typeof otpSchema>
