import browser from "webextension-polyfill"

const container = document.head || document.documentElement
const script = document.createElement("script")

script.src = browser.runtime.getURL("inpage.js")

container.insertBefore(script, container.children[0])
