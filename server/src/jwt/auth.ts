import { generateToken, verifyToken } from './jwt'
import { UserSession } from './types/auth'
import constants from './constants'

export const generateAccessToken = (payload: UserSession): string => {
  // If environment variable is not set, throw an error
  if (!constants.JWT_ACCESS_TOKEN_SECRET) {
    throw new Error('ACCESS_TOKEN_SECRET is not set')
  }

  if (!constants.JWT_ACCESS_TOKEN_EXPIRATION) {
    throw new Error('ACCESS_TOKEN_EXPIRATION is not set')
  }

  return generateToken(
    payload,
    constants.JWT_ACCESS_TOKEN_SECRET as string,
    constants.JWT_ACCESS_TOKEN_EXPIRATION
  )
}

export const generateRefreshToken = (payload: UserSession): string => {
  // If environment variable is not set, throw an error
  if (!constants.JWT_REFRESH_TOKEN_SECRET) {
    throw new Error('JWT_REFRESH_TOKEN_SECRET is not set')
  }

  if (!constants.JWT_REFRESH_TOKEN_EXPIRATION) {
    throw new Error('JWT_REFRESH_TOKEN_EXPIRATION is not set')
  }

  return generateToken(
    payload,
    constants.JWT_REFRESH_TOKEN_SECRET as string,
    constants.JWT_REFRESH_TOKEN_EXPIRATION
  )
}

export const verifyAccessToken = (token: string) => {
  // If environment variable is not set, throw an error
  if (!constants.JWT_ACCESS_TOKEN_SECRET) {
    throw new Error('ACCESS_TOKEN_SECRET is not set')
  }

  return verifyToken(token, constants.JWT_ACCESS_TOKEN_SECRET)
}
