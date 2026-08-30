import { getCurrentUser } from '../queries'
import { AccountMenu } from './account-menu'

/** Reads the session so `AccountMenu` can stay presentational. */
export async function AccountGate() {
  const user = await getCurrentUser()
  if (!user) return null

  return <AccountMenu user={user} />
}
