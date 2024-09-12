import { StarknetClient } from "@ledgerhq/hw-app-starknet"
import {
  RecordStore,
  openTransportReplayer,
} from "@ledgerhq/hw-transport-mocker"

export async function getMockLedgerClient(): Promise<StarknetClient> {
  const replay: string = "=> 5a00000000" + "\n" + "<= 0100009000" + "\n"

  const transport = await openTransportReplayer(RecordStore.fromString(replay))
  return new StarknetClient(transport)
}
