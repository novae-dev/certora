import { useOutletContext } from 'react-router-dom'

export type Profile = {
  full_name: string | null
  organization_id: string | null
}

export type DashboardContextValue = {
  profile: Profile | null
  organizationId: string | null
  isProfileLoading: boolean
  profileError: string | null
  refreshProfile: () => Promise<void>
}

export function useDashboard() {
  return useOutletContext<DashboardContextValue>()
}
