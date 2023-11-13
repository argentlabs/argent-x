export function generateFakeWords(wordlist: string[], junkMultiplier = 12) {
  return [...Array(junkMultiplier)]
    .map(() => {
      const randomIndex = Math.floor(Math.random() * wordlist.length)
      return wordlist[randomIndex]
    })
    .filter(Boolean)
}
