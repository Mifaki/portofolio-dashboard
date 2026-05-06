import { createRouteHandler } from 'uploadthing/h3'
import { uploadRouter } from '../uploadthing'

export default defineEventHandler((event) => {
  return createRouteHandler({ router: uploadRouter })(event)
})
