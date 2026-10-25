import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { tufeSchema, yasalSchema, type TufeData, type YasalData } from './schemas'

interface DataState {
  tufe: TufeData | null
  yasal: YasalData | null
  /** True once loading finished and at least one file failed. */
  error: boolean
}

const DataContext = createContext<DataState>({ tufe: null, yasal: null, error: false })

async function load<T>(file: string, parse: (json: unknown) => T): Promise<T | null> {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}data/${file}`)
    return parse(await res.json())
  } catch {
    return null
  }
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DataState>({ tufe: null, yasal: null, error: false })

  useEffect(() => {
    let cancelled = false
    Promise.all([
      load('tufe.json', (j) => tufeSchema.parse(j)),
      load('yasal-oranlar.json', (j) => yasalSchema.parse(j)),
    ]).then(([tufe, yasal]) => {
      if (!cancelled) setState({ tufe, yasal, error: !tufe || !yasal })
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
