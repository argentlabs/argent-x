import { networkService } from "../../../shared/network/service"

export async function runRemoveTestnet2Migration() {
  await networkService.restoreDefaults()
}
