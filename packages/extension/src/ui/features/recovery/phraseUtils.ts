export function splitPhrase(phrase: string): string[] {
  return phrase.toLowerCase().split(/\s+/g)
}
