import type { YasalData } from '../data/schemas'

/** Statutory interest rate in effect on a given ISO date, or null if the timeline has no entry. */
export function legalInterestOn(
  data: Pick<YasalData, 'yasalFaiz'>,
  isoDate: string,
): number | null {
  const hit = data.yasalFaiz
    .filter((r) => r.baslangic <= isoDate && (r.bitis === null || isoDate <= r.bitis))
    .sort((a, b) => b.baslangic.localeCompare(a.baslangic))[0]
  return hit ? hit.oran : null
}
