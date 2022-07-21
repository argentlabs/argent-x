/** baked initially from the url, e.g. ...indeh.html?popup&host=foobar.xyz */

export const EXTENSION_IS_POPUP = new URLSearchParams(
  window.location.search,
).has("popup")

/** popup loses context of originating host so it is passed in query */

const host = new URLSearchParams(window.location.search).get("host")

export const EXTENSION_POPUP_ORIGINATING_HOST = host
  ? decodeURIComponent(host)
  : undefined
