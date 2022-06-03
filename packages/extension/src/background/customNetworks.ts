import {
  Network,
  NetworkSchema,
  defaultNetwork,
  defaultNetworks,
} from "../shared/networks"
import { Storage } from "./storage"

type ArrayOfOrType<T> = T | T[]

interface NetworksState {
  networks: Network[]
}

const getNetworksByReadOnly = (
  networks: Network[],
  readonly = true,
): Network[] => {
  return networks.filter((network) =>
    readonly ? network.readonly : !network.readonly,
  )
}

const networksStore = new Storage<NetworksState>(
  {
    networks: getNetworksByReadOnly(defaultNetworks, false), // persist only editable networks, as we want to keep full control about read only networks to upgrade implementations
  },
  "networks",
)

export const getNetworks = async (): Promise<Network[]> => {
  const storedNetworks = await networksStore.getItem("networks")
  const readOnlyNetworks = getNetworksByReadOnly(defaultNetworks, true)

  return [...readOnlyNetworks, ...storedNetworks]
}

export const getNetwork = async (networkId: string): Promise<Network> => {
  const allNetworks = await getNetworks()
  return allNetworks.find(({ id }) => id === networkId) || defaultNetwork
}

export const getNetworkByChainId = async (
  chainId: string,
): Promise<Network | undefined> => {
  const allNetworks = await getNetworks()
  return allNetworks.find((network) => network.chainId === chainId)
}

export const addNetworks = async (
  networks: ArrayOfOrType<Network>,
): Promise<Network[]> => {
  const networksArray = Array.isArray(networks) ? networks : [networks]
  // validate all networks
  await Promise.all(
    networksArray.map((network) => NetworkSchema.validate(network)),
  )

  const prevNetworks = await getNetworks()

  if (
    prevNetworks
      .filter(({ readonly }) => readonly)
      .find(({ id }) => networksArray.map(({ id }) => id).includes(id))
  ) {
    throw new Error("Network already exists")
  }

  const newNetworks = [...networksArray, ...prevNetworks]
    .filter(
      // remove duplicates and keep new ones
      (network, index, self) =>
        self.findIndex((n) => n.id === network.id) === index,
    )
    .filter((newNetwork) => !newNetwork.readonly) // dont allow readonly networks to be added

  await networksStore.setItem("networks", newNetworks)

  // find difference between prevNetworks and newNetworks
  const addedNetworks = newNetworks.filter(
    (newNetwork) =>
      !prevNetworks.find((prevNetwork) => prevNetwork.id === newNetwork.id),
  )

  return addedNetworks
}

export const removeNetworks = async (
  networks: ArrayOfOrType<Network["id"]>,
): Promise<Network[]> => {
  const networksArray = Array.isArray(networks) ? networks : [networks]
  const prevNetworks = await getNetworks()
  const newNetworks = prevNetworks.filter(
    (network) =>
      !network.readonly && !networksArray.find((id) => id === network.id),
  )
  await networksStore.setItem("networks", newNetworks)

  // find difference between prevNetworks and newNetworks
  const removedNetworks = prevNetworks.filter(
    (prevNetwork) =>
      !newNetworks.find((newNetwork) => newNetwork.id === prevNetwork.id),
  )

  return removedNetworks
}

export const hasNetwork = async (networkChainId: Network["chainId"]) => {
  const networks = await getNetworks()

  return networks.some((network) => network.chainId === networkChainId)
}
