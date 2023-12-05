import { sign, verify } from 'jsonwebtoken'
import { UserSession } from './types/auth'
import constants from './constants'

export function verifyTokenWithType(token: string, tokenType: string) {
  if (!token || !tokenType) {
    return null;
  }

  if (tokenType === "tempToken") {
    return verifyToken(token, constants.JWT_TEMP_TOKEN_SECRET);
  } else if (tokenType === "accessToken") {
    return verifyToken(token, constants.JWT_ACCESS_TOKEN_SECRET);
  } else if (tokenType === "refreshToken") {
    return verifyToken(token, constants.JWT_REFRESH_TOKEN_SECRET);
  }

  return null;
}

export const verifyAccessToken = (token: string) => {
  if (!token) {
    return null;
  }
  
  return verifyToken(token, constants.JWT_ACCESS_TOKEN_SECRET);
}

export const verifyToken = (token: string, secret: string): UserSession | null => {
  try {
    const decoded = verify(token, secret)
      
    const userDecoded = decoded as UserSession
    
    // Now, convert decoded to UserSession by removing additional properties
    const userSession: UserSession = {
       id: userDecoded.id,
       email: userDecoded.email,
       name: userDecoded.name,
    }
    return userSession;  
  } catch(err) {
    console.log("verify failed! invalid access token: ", token, err)
  }

  return null;
}