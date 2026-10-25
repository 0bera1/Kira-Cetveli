import { createContext, useContext, useState, type ReactNode } from 'react'

export type Role = 'tenant' | 'landlord'

const RoleContext = createContext<[Role, (r: Role) => void]>(['tenant', () => {}])

export function RoleProvider({ children }: { children: ReactNode }) {
  const state = useState<Role>('tenant')
  return <RoleContext.Provider value={state}>{children}</RoleContext.Provider>
}

export function useRole() {
  return useContext(RoleContext)
}
