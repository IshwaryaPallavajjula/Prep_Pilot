import { useContext } from 'react'
import { AppContext } from '../context/AppContext'

export function useAuth() {
  const ctx = useContext(AppContext)

  if (!ctx) {
    throw new Error('useAuth must be used within AppProvider')
  }

  return ctx
}
