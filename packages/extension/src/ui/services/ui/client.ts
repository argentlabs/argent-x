import { IUIService } from "../../../shared/__new/services/ui/interface"
import { DeepPick } from "../../../shared/types/deepPick"
import { IClientUIService } from "./interface"

type MinimalBrowser = DeepPick<typeof chrome, "runtime.connect">

export default class ClientUIService implements IClientUIService {
  constructor(private browser: MinimalBrowser, private uiService: IUIService) {}

  registerUIProcess() {
    /** connect to the background port from the UI */
    this.browser.runtime.connect({ name: this.uiService.connectId })
  }
}
