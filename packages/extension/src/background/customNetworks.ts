import {
  Network,
  NetworkSchema,
  defaultNetworks,
  getNetwork as getNetworkUtil,
} from "../shared/networks"
import { Storage } from "./storage"

type ArrayOfOrType<T> = T | T[]

interface NetworksState {
  networks: Network[]
}

const networksStore = new Storage<NetworksState>(
  {
    networks: defaultNetworks,
  },
  "networks",
)

export const getNetworks = (): Promise<Network[]> =>
  networksStore.getItem("networks")

export const getNetwork = async (networkId: string): Promise<Network> => {
  const networks = await getNetworks()
  return getNetworkUtil(networkId, networks)
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

  const newNetworks = [
    ...networksArray.filter((newNetwork) => !newNetwork.readonly), // dont allow readonly networks to be added
    ...prevNetworks,
  ].filter(
    // remove duplicates and keep new ones
    (network, index, self) =>
      self.findIndex((n) => n.id === network.id) === index,
  )

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
      network.readonly || !networksArray.find((id) => id === network.id),
  )
  await networksStore.setItem("networks", newNetworks)

  // find difference between prevNetworks and newNetworks
  const removedNetworks = prevNetworks.filter(
    (prevNetwork) =>
      !newNetworks.find((newNetwork) => newNetwork.id === prevNetwork.id),
  )

  return removedNetworks
}
