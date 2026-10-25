import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { tufeSchema, type TufeData } from './schemas'

interface DataState {
  tufe: TufeData | null
  error: boolean
}

const DataContext = createContext<DataState>({ tufe: null, error: false })

export function DataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DataState>({ tufe: null, error: false })

  useEffect(() => {
    let cancelled = false
    fetch(`${import.meta.env.BASE_URL}data/tufe.json`)
      .then((r) => r.json())
      .then((json) => {
        const parsed = tufeSchema.parse(json)
        if (!cancelled) setState({ tufe: parsed, error: false })
      })
      .catch(() => {
        if (!cancelled) setState({ tufe: null, error: true })
      })
    return () => {
      cancelled = true
    }
  }, [])

  return <DataContext.Provider value={state}>{children}</DataContext.Provider>
}

export function useData(): DataState {
  return useContext(DataContext)
}
