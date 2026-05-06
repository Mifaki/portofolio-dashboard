export interface ProjectText {
  id: string
  type: 'headline' | 'regular'
  position: number
  content: string
}

export interface ProjectTextPayload {
  content: string
  position: number
}

export interface ProjectImage {
  id: string
  type: 'thumbnail' | 'normal'
  orientation: 'landscape' | 'portrait'
  imageUrl: string
}

export interface Project {
  id: string
  position: number
  title: string
  category: string
  type: string
  year: string
  texts: ProjectText[]
  images: ProjectImage[]
  createdAt: string
  modifiedAt: string
}

export interface ProjectImagePayload {
  imageUrl: string
  type: 'thumbnail' | 'normal'
  orientation: 'landscape' | 'portrait'
}

export interface CreateProjectPayload {
  position: number
  title: string
  category: string
  type: string
  year: string
  texts?: ProjectTextPayload[]
  images?: ProjectImagePayload[]
}

export type UpdateProjectPayload = Partial<CreateProjectPayload>
