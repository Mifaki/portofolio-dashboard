export interface Role {
  id: string
  name: string
  title: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateRolePayload {
  name: string
  title?: string
}

export interface UpdateRolePayload {
  name?: string
  title?: string
}
