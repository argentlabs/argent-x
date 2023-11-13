import { autoConnect } from "trpc-browser/shared/chrome"
import { IUIService } from "../../../shared/__new/services/ui/interface"
import { DeepPick } from "../../../shared/types/deepPick"
import { IClientUIService } from "./interface"

type MinimalBrowser = DeepPick<typeof chrome, "runtime.connect">

export default class ClientUIService implements IClientUIService {
  constructor(private browser: MinimalBrowser, private uiService: IUIService) {}

  registerUIProcess() {
    /** connect to the background port from the UI */
    void autoConnect(
      () => this.browser.runtime.connect({ name: this.uiService.connectId }),
      () => {}, // just ignore the new port, the important part is that the connection got established
    )
  }
}
