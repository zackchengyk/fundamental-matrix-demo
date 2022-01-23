export function limitDpHelper(n: number): string {
  return Math.ceil(Math.log10(n)) + 7 + 'ch'
}
