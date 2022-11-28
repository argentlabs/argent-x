import { ParentHandshake, WindowMessenger } from "post-me"

import { ConnectionOptions, RemoteConnection } from "./types"

const getConnection = async (options: ConnectionOptions) => {
  const messenger = new WindowMessenger(options)

  const handshake = ParentHandshake(messenger)

  return handshake
}

export const getRemoteHandle = async (
  options: ConnectionOptions,
): Promise<RemoteConnection> => {
  const connection = await getConnection(options)
  const handle: RemoteConnection = connection.remoteHandle()

  return handle
}
