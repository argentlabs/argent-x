import { networkService } from "../../../shared/network/service"

export async function restoreDefaultNetworks() {
  await networkService.restoreDefaults()
}
