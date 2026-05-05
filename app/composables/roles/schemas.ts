import { z } from 'zod'

export const roleSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  title: z.string().max(255).optional(),
})

export type RoleSchema = z.infer<typeof roleSchema>
