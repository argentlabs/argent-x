import { chromeStorageMock } from "@argent-x/extension/src/shared/storage/__test__/chrome-storage.mock"
import { noop } from "lodash-es"

/** mock `import browser from "webextension-polyfill"` */

const mock = {
  runtime: {
    id: "test",
    connect: () => ({
      onDisconnect: {
        addListener: noop,
      },
    }),
    onConnect: {
      addListener: noop,
    },
    onMessage: {
      addListener: noop,
    },
  },
  storage: chromeStorageMock,
}

export default mock
