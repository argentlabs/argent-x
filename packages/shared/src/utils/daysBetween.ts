/** Rounded down whole days between date1 and date2 */
export function daysBetween(date1: Date, date2: Date) {
  const ms1 = date1.getTime()
  const ms2 = date2.getTime()
  const diff = Math.abs(ms1 - ms2)
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  return days
}
