export interface AboutDescription {
  id: string
  content: string
  position: number
}

export interface AboutTechStack {
  id: string
  name: string
  iconUrl: string
  percentage: number
  position: number
}

export interface AboutImage {
  id: string
  imageUrl: string
  position: number
}

export interface WorkExperience {
  id: string
  company: string
  role: string
  description: string | null
  location: string | null
  startMonth: number
  startYear: number
  endMonth: number | null
  endYear: number | null
  position: number
}

export interface About {
  id: string
  name: string
  instagram: string | null
  github: string | null
  linkedin: string | null
  descriptions: AboutDescription[]
  techStacks: AboutTechStack[]
  images: AboutImage[]
  workExperiences: WorkExperience[]
  createdAt: string
  modifiedAt: string
}

export interface DescriptionInput {
  content: string
  position: number
}

export interface TechStackInput {
  name: string
  iconUrl: string
  percentage: number
  position: number
}

export interface AboutImageInput {
  imageUrl: string
  position: number
}

export interface WorkExperienceInput {
  company: string
  role: string
  description?: string
  location?: string
  startMonth: number
  startYear: number
  endMonth?: number
  endYear?: number
  position: number
}

export interface CreateAboutPayload {
  name: string
  instagram?: string
  github?: string
  linkedin?: string
  descriptions?: DescriptionInput[]
  techStacks?: TechStackInput[]
  images?: AboutImageInput[]
  workExperiences?: WorkExperienceInput[]
}

export interface UpdateAboutPayload {
  name?: string
  instagram?: string | null
  github?: string | null
  linkedin?: string | null
  descriptions?: DescriptionInput[]
  techStacks?: TechStackInput[]
  images?: AboutImageInput[]
  workExperiences?: WorkExperienceInput[]
}
