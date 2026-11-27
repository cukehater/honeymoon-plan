'use server'

import { redirect } from 'next/navigation'

import { destroySession, getSession } from '@/shared/lib/session'

export const logout = async () => {
  await getSession()
  await destroySession()
  redirect('/login')
}
