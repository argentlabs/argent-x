import { CustomNetwork, CustomNetworkSchema } from "../shared/customNetworks"
import { Storage } from "./storage"

type ArrayOfOrType<T> = T | T[]

interface CustomNetworksState {
  customNetworks: CustomNetwork[]
}

const customNetworksStore = new Storage<CustomNetworksState>(
  {
    customNetworks: [],
  },
  "customNetworks",
)

export const getCustomNetworks = (): Promise<CustomNetwork[]> =>
  customNetworksStore.getItem("customNetworks")

export const addCustomNetworks = async (
  networks: ArrayOfOrType<CustomNetwork>,
): Promise<CustomNetwork[]> => {
  const networksArray = Array.isArray(networks) ? networks : [networks]
  // validate all networks
  await Promise.all(
    networksArray.map((network) => CustomNetworkSchema.validate(network)),
  )

  const customNetworks = await getCustomNetworks()
  const newCustomNetworks = [...networksArray, ...customNetworks].filter(
    // remove duplicates and keep new ones
    (network, index, self) =>
      self.findIndex((n) => n.id === network.id) === index,
  )

  await customNetworksStore.setItem("customNetworks", newCustomNetworks)
  return newCustomNetworks
}

export const removeCustomNetworks = async (
  networks: ArrayOfOrType<CustomNetwork["id"]>,
): Promise<CustomNetwork[]> => {
  const networksArray = Array.isArray(networks) ? networks : [networks]
  const customNetworks = await getCustomNetworks()
  const newCustomNetworks = customNetworks.filter(
    (network) => !networksArray.find((id) => id === network.id),
  )
  await customNetworksStore.setItem("customNetworks", newCustomNetworks)
  return newCustomNetworks
}
