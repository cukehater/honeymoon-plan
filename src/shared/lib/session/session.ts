import { jwtVerify, SignJWT } from 'jose'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export const SESSION_COOKIE = 'session'
const MAX_AGE = 60 * 60 * 24 * 30 // 30일

const key = () => {
  const secret = process.env.SESSION_SECRET
  if (!secret || secret.length < 32)
    throw new Error('SESSION_SECRET must be at least 32 characters')
  return new TextEncoder().encode(secret)
}

export const verifySession = async (
  token: string | undefined,
): Promise<{ userId: number } | null> => {
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, key(), { algorithms: ['HS256'] })
    return typeof payload.userId === 'number' ? { userId: payload.userId } : null
  } catch {
    return null
  }
}

export const createSession = async (userId: number) => {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(key())
  ;(await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    // dev에서 테일스케일 IP 같은 비-localhost HTTP로 접속하면 Secure 쿠키가 저장되지 않는다.
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE,
  })
}

// Server Action·Server Component용. 세션이 없으면 /login으로 보낸다.
export const getSession = async () => {
  const session = await verifySession((await cookies()).get(SESSION_COOKIE)?.value)
  if (!session) redirect('/login')
  return session
}

export const destroySession = async () => {
  ;(await cookies()).delete(SESSION_COOKIE)
}
