type User = {
  id: string
  name: string
  email: string
  refreshToken: string
}

export type UserSession = Omit<User, 'refreshToken'>
