import { generateVueHelpers } from '@uploadthing/vue'
import type { OurFileRouter } from '~~/server/uploadthing'

export const { useUploadThing } = generateVueHelpers<OurFileRouter>({
  url: '/api/uploadthing',
})
