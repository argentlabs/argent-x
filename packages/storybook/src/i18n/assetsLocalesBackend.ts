import resourcesToBackend from "i18next-resources-to-backend"

/**
 * This backend is used to load translations at runtime from the extension's assets folder,
 * so we don't need to bundle them in the extension code
 */

export const assetsLocalesBackend = resourcesToBackend(
  async (language: string, namespace: string) => {
    const url = `assets/locales/${language}/${namespace}.json`
    return fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load locale ${language}/${namespace}`)
        }
        return response.json()
      })
      .catch((error) => {
        console.error(`Failed to load ${language}/${namespace}:`, error)
        return null
      })
  },
)
