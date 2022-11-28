import { ChildHandshake, WindowMessenger } from "post-me"

import { ConnectionOptions, LocalConnection } from "./types"

const getConnection = async (options: ConnectionOptions) => {
  const messenger = new WindowMessenger(options)

  const handshake = ChildHandshake(messenger)

  return handshake
}

export const getLocalHandle = async (
  options: ConnectionOptions,
): Promise<LocalConnection> => {
  const connection = await getConnection(options)
  const handle: LocalConnection = connection.localHandle()

  return handle
}
