import { useMemo, useState } from 'react'
import { useData } from './data/DataContext'
import { rateOptions, type RateOption } from './rent/cpi'
import { parseNumber } from './rent/money'

export interface RateChoice {
  options: RateOption[]
  /** Selected renewal month, or '' for the newest. */
  selected: string
  setSelected: (renewalMonth: string) => void
  option: RateOption | null
  rateText: string
  setRateText: (v: string) => void
  rate: number | null
  /** True when the user typed a rate that differs from the selected month's rate. */
  overridden: boolean
}

const fmt = (n: number) => n.toFixed(2).replace('.', ',')

/** Rate selection shared by the home page and the increase calculator. */
export function useRateChoice(): RateChoice {
  const { tufe } = useData()
  const options = useMemo(() => (tufe ? rateOptions(tufe, 12) : []), [tufe])
  const [selected, setSelectedState] = useState('')
  const [override, setOverride] = useState<string | null>(null)

  const option = options.find((o) => o.renewalMonth === selected) ?? options[0] ?? null
  const rateText = override ?? (option ? fmt(option.rate) : '')

  return {
    options,
    selected: option?.renewalMonth ?? '',
    setSelected: (m) => {
      setSelectedState(m)
      setOverride(null)
    },
    option,
    rateText,
    setRateText: setOverride,
    rate: parseNumber(rateText),
    overridden: override !== null,
  }
}

export { fmt as formatRateInput }
