import type { ApiResponse } from '~/types/api'
import type { Project, CreateProjectPayload, UpdateProjectPayload } from '~/types/projects'

export type ProjectsQuery = { q?: string; page?: number; limit?: number }

export const useProjectsService = () => {
  const { api } = useApi()
  return {
    getAll: (query: ProjectsQuery = {}) => api<ApiResponse<Project[]>>('/projects', { query }),

    getOne: (id: string) => api<ApiResponse<Project>>(`/projects/${id}`),

    create: (body: CreateProjectPayload) =>
      api<ApiResponse<Project>>('/projects', { method: 'POST', body }),

    update: (id: string, body: UpdateProjectPayload) =>
      api<ApiResponse<Project>>(`/projects/${id}`, { method: 'PUT', body }),

    remove: (id: string) =>
      api<ApiResponse<{ id: string; title: string }>>(`/projects/${id}`, { method: 'DELETE' }),

    updatePosition: (body: { projectId: string; originalPosition: number; newPosition: number }) =>
      api<ApiResponse<Project>>('/projects/position', { method: 'PATCH', body }),
  }
}
