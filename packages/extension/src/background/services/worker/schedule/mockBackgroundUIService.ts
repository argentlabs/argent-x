import Emittery from "emittery"
import { MinimalIBackgroundUIService } from "./decorators"
import { Events, Opened } from "../../ui/IBackgroundUIService"

interface MockBackgroundUIServiceManager {
  setOpened(opened: boolean): Promise<void>
}

export const getMockBackgroundUIService = (): [
  MockBackgroundUIServiceManager,
  MinimalIBackgroundUIService,
] => {
  const emitter = new Emittery<Events>()
  let opened = false
  const setOpened = (newOpened: boolean) => {
    opened = newOpened
    return emitter.emit(Opened, opened)
  }
  const backgroundUIService: MinimalIBackgroundUIService = {
    get opened() {
      return opened
    },
    emitter,
  }
  return [
    {
      setOpened,
    },
    backgroundUIService,
  ]
}
