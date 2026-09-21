export function getSubOptionFromName(name: string, suboptionMap: Record<string, string>): string | undefined {
  const lower = name.toLowerCase()
  for (const [key, sub] of Object.entries(suboptionMap)) {
    if (lower.includes(key)) return sub
  }
  return undefined
}
