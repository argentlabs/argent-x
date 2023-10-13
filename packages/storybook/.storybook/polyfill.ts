import { chromeStorageMock } from "@argent-x/extension/src/shared/storage/__test__/chrome-storage.mock"
import { noop } from "lodash-es"

/** polyfill browser */
global.chrome = {
  ...global.chrome,
  runtime: {
    ...global.chrome.runtime,
    id: "test",
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    connect: noop,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    onConnect: {
      addListener: noop,
    },
  },
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  storage: chromeStorageMock,
}
