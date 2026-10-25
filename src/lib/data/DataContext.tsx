import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import tufeBuilt from '../../../public/data/tufe.json'
import yasalBuilt from '../../../public/data/yasal-oranlar.json'
import { tufeSchema, yasalSchema, type TufeData, type YasalData } from './schemas'

interface DataState {
  tufe: TufeData | null
  yasal: YasalData | null
  /** True once loading finished and at least one file failed. */
  error: boolean
}

// The data files as of the build. They make the prerendered pages complete and avoid layout shifts;
// the live files are fetched after load and replace them (see DataProvider).
const tufeInitial = tufeSchema.safeParse(tufeBuilt)
const yasalInitial = yasalSchema.safeParse(yasalBuilt)
const initial: DataState = {
  tufe: tufeInitial.success ? tufeInitial.data : null,
  yasal: yasalInitial.success ? yasalInitial.data : null,
  error: false,
}

const DataContext = createContext<DataState>(initial)

async function load<T>(file: string, parse: (json: unknown) => T): Promise<T | null> {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}data/${file}`)
    return parse(await res.json())
  } catch {
    return null
  }
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DataState>(initial)

  useEffect(() => {
    let cancelled = false
    Promise.all([
      load('tufe.json', (j) => tufeSchema.parse(j)),
      load('yasal-oranlar.json', (j) => yasalSchema.parse(j)),
    ]).then(([tufe, yasal]) => {
      if (cancelled) return
      // keep the built-in copy when a fetch fails (for example when offline without a cached file)
      setState((prev) => ({
        tufe: tufe ?? prev.tufe,
        yasal: yasal ?? prev.yasal,
        error: !tufe || !yasal,
      }))
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
