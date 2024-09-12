export const sessionKeysWhitelistedDomains = [
  "http://localhost:3000",
  // argent development demo dapp
  "https://dapp-ruby.vercel.app", // hydrogen
  "https://dapp-argentlabs-staging.vercel.app", // staging
  "https://dapp-argentlabs.vercel.app", // production
  "https://game.influenceth.io",
  "https://game-prerelease.influenceth.io",
  "https://assets.influenceth.io",
  "https://assets-prerelease.influenceth.io",
]

export const isSessionKeysWhitelistedDomain = (domain?: string) => {
  return domain && sessionKeysWhitelistedDomains.includes(domain)
}
