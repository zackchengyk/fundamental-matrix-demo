const c = 7

export function limitDpHelper(n: number): string {
  if (Math.abs(n) < 0.0001) return '0'
  const s: string = n.toString()
  return s.length > c ? s.slice(0, c - 1) + '\u2026' : s.slice(0, c)
}
