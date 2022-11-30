<script lang="ts">
  import type { ConnectionOptions, RemoteConnection } from "@argent/x-window"
  import retry from "async-retry"
  import type { StarknetWindowObject } from "get-starknet-core"
  import type { ProviderInterface } from "starknet"
  import { onMount } from "svelte"
  import { field, form } from "svelte-forms"
  import { email } from "svelte-forms/validators"

  import type { WalletProviderWithStoreVersion } from "."

  export const globalWindow = typeof window !== "undefined" ? window : null

  export let enableArgentWebWallet: boolean = true
  export let dappName: string = window.document.title ?? "Some cool Dapp"
  export let lastWallet: StarknetWindowObject | null = null
  export let installedWallets: StarknetWindowObject[] = []
  export let preAuthorizedWallets: StarknetWindowObject[] = []
  export let discoveryWallets: WalletProviderWithStoreVersion[] = []
  export let callback: (
    value: StarknetWindowObject | null,
  ) => Promise<void> = async () => {}
  export let theme: "light" | "dark" | null = null

  let loadingItem: string | false = false

  let setLoadingItem = (item: string | false) => {
    loadingItem = item
  }

  let cb = async (value: StarknetWindowObject | null) => {
    setLoadingItem(value?.id ?? false)
    await callback(value)
      .catch(() => {})
      .then((e) => console.log("callback done", e))
    setLoadingItem(false)
  }

  let darkModeControlClass = ""
  if (
    theme === "dark" ||
    (theme === null &&
      globalWindow?.matchMedia("(prefers-color-scheme: dark)").matches)
  ) {
    darkModeControlClass = "dark"
  } else {
    darkModeControlClass = ""
  }
  const handler = (event: MediaQueryListEvent) => {
    darkModeControlClass = event.matches ? "dark" : ""
  }

  const mail = field("email", "", [email()], {
    stopAtFirstError: true,
    validateOnChange: false,
  })
  const mailForm = form(mail)

  const walletOptions = {
    host: window.location.origin,
    id: "argentWebWallet" as const,
    icon: "https://www.argent.xyz/favicon.ico",
    name: "Argent Web Wallet",
    version: "1.0.0",
  }
  let starknetWindowObject: StarknetWindowObject | null = null
  let provider: ProviderInterface | null = null
  let getRemoteHandle: (
    options: ConnectionOptions,
  ) => Promise<RemoteConnection> | null = null
  let webWalletEmail: string | false | null = null
  let wormholeConnection: RemoteConnection | null = null
  let hasSession = false

  onMount(async () => {
    const { getArgentStarknetWindowObject, getRemoteHandle: _getRemoteHandle } =
      await import("@argent/x-window")
    const { defaultProvider } = await import("starknet")
    const {
      createIframe,
      loadIframe,
      getIframeConnection,
      getMemorizedLoginStatus,
      applyInlineStyle,
      applyModalStyle,
      applyHideStyle,
    } = await import("../wormhole")

    provider = defaultProvider
    getRemoteHandle = _getRemoteHandle
    const iframe = await createIframe(target)

    globalWindow.document
      .getElementById("aww__wormhole")
      .appendChild(applyInlineStyle(iframe))
    await loadIframe(iframe)
    globalWindow.document.getElementById("aww__wormhole__loading")?.remove()

    wormholeConnection = await getIframeConnection(iframe)

    // wormholeConnection.addEventListener(
    //   "ARGENT_WEB_WALLET::SHOULD_SHOW",
    //   () => {
    //     modalIframe.style.display = "block"
    //   },
    // )
    // wormholeConnection.addEventListener(
    //   "ARGENT_WEB_WALLET::SHOULD_HIDE",
    //   () => {
    //     modalIframe.style.display = "none"
    //   },
    // )
    // wormholeConnection.addEventListener(
    //   "ARGENT_WEB_WALLET::HEIGHT_CHANGED",
    //   (height) => {
    //     modalIframe.style.height = `min(${height || 420}px, 100%)`
    //   },
    // )

    const loginStatus = await getMemorizedLoginStatus(wormholeConnection)

    webWalletEmail = loginStatus.isLoggedIn ? loginStatus.email : false
    hasSession = loginStatus.isLoggedIn && loginStatus.hasSession

    starknetWindowObject = getArgentStarknetWindowObject(
      walletOptions,
      provider,
      wormholeConnection,
    )

    if (theme === null) {
      globalWindow
        ?.matchMedia("(prefers-color-scheme: dark)")
        .addEventListener("change", handler)
    }
  })

  let windowRef: Window | null = null
  const origin = "http://localhost:3005"
  const submitGoalUrl = `${origin}/email`
  const target = `${origin}/iframes/modal?darkmode=${Boolean(
    darkModeControlClass,
  )}`

  const wallets = [
    lastWallet,
    ...preAuthorizedWallets,
    ...installedWallets,
  ].filter(Boolean)

  export async function onWebWallet() {
    setLoadingItem("argentWebWallet")

    const h = 600
    const w = 500

    // parent is the window that opened this window; if not detected then it falls back to the current screen
    const parentWidth =
      globalWindow?.outerWidth ??
      globalWindow?.innerWidth ??
      globalWindow?.screen.width ??
      0
    const parentHeight =
      globalWindow?.outerHeight ??
      globalWindow?.innerHeight ??
      globalWindow?.screen.height ??
      0
    const parentLeft = globalWindow?.screenLeft ?? globalWindow?.screenX ?? 0
    const parentTop = globalWindow?.screenTop ?? globalWindow?.screenY ?? 0

    const y = parentTop + parentHeight / 2 - h / 2
    const x = parentLeft + parentWidth / 2 - w / 2

    if (!hasSession) {
      // open popup window
      windowRef = window.open(
        !webWalletEmail
          ? submitGoalUrl + "?email=" + encodeURIComponent($mail.value)
          : origin,
        "Argent",
        `width=${w},height=${h},top=${y},left=${x},toolbar=no,menubar=no,scrollbars=no,location=yes,status=no`,
      )

      // callback if popup is closed
      const interval = setInterval(() => {
        if (windowRef?.closed) {
          clearInterval(interval)
          setLoadingItem(false)
          windowRef = null
        }
      }, 500)

      // wait for message from popup
      const messageHandler = await retry(
        () =>
          getRemoteHandle({
            localWindow: globalWindow,
            remoteWindow: windowRef,
            remoteOrigin: "*",
          }),
        {
          maxRetryTime: 5,
          minTimeout: 500,
        },
      ).catch((cause) => {
        throw Error("Failed to connect to popup", { cause })
      })

      await messageHandler.once("ARGENT_WEB_WALLET::CONNECT")

      // close popup
      if (!windowRef?.closed) {
        clearInterval(interval)
        setLoadingItem(false)
        windowRef = null
      }

      await wormholeConnection.call("reloadData")
    }

    cb(starknetWindowObject)
  }
</script>

<div
  class={"backdrop-blur-sm fixed inset-0 flex items-center justify-center bg-black/25 z-40 " +
    darkModeControlClass}
  on:click={() => cb(null)}
  on:keyup={(e) => {
    if (e.key === "Escape") {
      cb(null)
    }
  }}
>
  <main
    role="dialog"
    class={"bg-slate-50 rounded-3xl shadow-modal dark:shadow-none w-full max-w-[380px] mx-6 p-6 pb-8 text-center z-50 dark:bg-neutral-900 dark:text-white"}
    on:click={(e) => e.stopPropagation()}
    on:keyup={(e) => {
      e.stopPropagation()
    }}
  >
    <header class="flex items-center justify-center flex-col mb-2 relative">
      <h2 class="text-sm text-gray-400 font-semibold">Connect to</h2>
      <h1
        class="text-xl font-semibold mb-6 max-w-[240px] overflow-hidden whitespace-nowrap text-ellipsis"
      >
        {dappName}
      </h1>
      <span
        class="absolute top-0 right-0 p-2 cursor-pointer rounded-full bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:focus:ring-neutral-700 transition-colors"
        role="button"
        tabindex="0"
        alt="Close"
        on:click={() => cb(null)}
        on:keyup={(e) => {
          if (e.key === "Enter") {
            cb(null)
          }
        }}
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9.77275 3.02275C9.99242 2.80308 9.99242 2.44692 9.77275 2.22725C9.55308 2.00758 9.19692 2.00758 8.97725 2.22725L6 5.20451L3.02275 2.22725C2.80308 2.00758 2.44692 2.00758 2.22725 2.22725C2.00758 2.44692 2.00758 2.80308 2.22725 3.02275L5.20451 6L2.22725 8.97725C2.00758 9.19692 2.00758 9.55308 2.22725 9.77275C2.44692 9.99242 2.80308 9.99242 3.02275 9.77275L6 6.79549L8.97725 9.77275C9.19692 9.99242 9.55308 9.99242 9.77275 9.77275C9.99242 9.55308 9.99242 9.19692 9.77275 8.97725L6.79549 6L9.77275 3.02275Z"
            fill="currentColor"
          />
        </svg>
      </span>
    </header>

    {#if enableArgentWebWallet}
      <!-- webwallet -->
      <main id="aww__wormhole" class="-m-3 overflow-hidden h-[104px]">
        <!-- Loading -->
        <div id="aww__wormhole__loading" class="p-3">
          <li
            class="mb-2 flex justify-center items-center p-3 rounded-md cursor-pointer shadow-list-item dark:shadow-none dark:bg-neutral-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:focus:ring-neutral-700 transition-colors"
            on:click={() => {
              windowRef?.focus()
            }}
            on:keydown={(e) => {
              if (e.key === "Enter") {
                windowRef?.focus()
              }
            }}
          >
            <div role="status">
              <svg
                aria-hidden="true"
                class="w-8 h-8 text-neutral-300 animate-spin dark:text-neutral-600 fill-neutral-600 dark:fill-neutral-300"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="currentColor"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentFill"
                />
              </svg>
              <span class="sr-only">Loading...</span>
            </div>
          </li>

          <div class="flex items-center justify-between px-2">
            <div />
            <div
              class="text-xs text-gray-400 inline-flex items-center justify-center gap-[6px] font-medium"
              style="line-height: 14px;"
            >
              <p>Powered by Argent</p>
              <!-- ? icon -->
              <div
                class="cursor-pointer rounded-full focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:focus:ring-neutral-700 transition-colors"
                role="button"
                tabindex="0"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  ><path
                    d="M7 11C7 11.5523 7.44772 12 8 12C8.55229 12 9 11.5523 9 11C9 10.4477 8.55229 10 8 10C7.44772 10 7 10.4477 7 11Z"
                    fill="currentColor"
                  /><path
                    d="M8.48773 4.29804C8.00277 4.20157 7.50011 4.25108 7.04329 4.4403C6.58648 4.62952 6.19603 4.94995 5.92133 5.36107C5.64662 5.7722 5.5 6.25555 5.5 6.75C5.5 7.16421 5.83579 7.5 6.25 7.5C6.66421 7.5 7 7.16421 7 6.75C7 6.55222 7.05865 6.35888 7.16853 6.19443C7.27841 6.02998 7.43459 5.90181 7.61732 5.82612C7.80004 5.75043 8.00111 5.73063 8.19509 5.76921C8.38907 5.8078 8.56725 5.90304 8.70711 6.04289C8.84696 6.18275 8.9422 6.36093 8.98079 6.55491C9.01937 6.74889 8.99957 6.94996 8.92388 7.13268C8.84819 7.31541 8.72002 7.47159 8.55557 7.58147C8.39112 7.69135 8.19778 7.75 8 7.75C7.58579 7.75 7.25 8.08579 7.25 8.5C7.25 8.91421 7.58579 9.25 8 9.25C8.49445 9.25 8.9778 9.10338 9.38893 8.82867C9.80005 8.55397 10.1205 8.16352 10.3097 7.70671C10.4989 7.24989 10.5484 6.74723 10.452 6.26227C10.3555 5.77732 10.1174 5.33186 9.76777 4.98223C9.41814 4.6326 8.97268 4.3945 8.48773 4.29804Z"
                    fill="currentColor"
                  /><path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M1.25 8C1.25 4.27208 4.27208 1.25 8 1.25C11.7279 1.25 14.75 4.27208 14.75 8C14.75 11.7279 11.7279 14.75 8 14.75C4.27208 14.75 1.25 11.7279 1.25 8ZM8 2.75C5.10051 2.75 2.75 5.10051 2.75 8C2.75 10.8995 5.10051 13.25 8 13.25C10.8995 13.25 13.25 10.8995 13.25 8C13.25 5.10051 10.8995 2.75 8 2.75Z"
                    fill="currentColor"
                  /></svg
                >
              </div>
            </div>
          </div>
        </div>
      </main>
      <!-- or -->
      <div class="flex items-center justify-center mt-5 mb-6">
        <div class="w-full border-b border-gray-200 dark:border-gray-800" />
        <div class="mx-5 text-xs text-gray-400 uppercase">or</div>
        <div class="w-full border-b border-gray-200 dark:border-gray-800" />
      </div>
    {/if}

    <!-- create one entry per wallet -->
    <ul class="flex flex-col gap-3">
      {#each wallets as wallet}
        <li
          class="flex flex-row-reverse justify-between items-center p-3 rounded-md cursor-pointer shadow-list-item dark:shadow-none dark:bg-neutral-800 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:focus:ring-neutral-700 transition-colors"
          role="button"
          tabindex="0"
          on:click={() => cb(wallet)}
          on:keyup={(e) => {
            if (e.key === "Enter") {
              cb(wallet)
            }
          }}
        >
          <span class="w-8 h-8" />
          <p class="font-semibold text-base">
            {wallet.name}
          </p>
          {#if loadingItem === wallet.id}
            <div role="status">
              <svg
                aria-hidden="true"
                class="w-8 h-8 text-neutral-300 animate-spin dark:text-neutral-600 fill-neutral-600 dark:fill-neutral-300"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="currentColor"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentFill"
                />
              </svg>
              <span class="sr-only">Loading...</span>
            </div>
          {:else}
            <img
              alt={wallet.name}
              src={wallet.icon}
              class="w-8 h-8 rounded-full"
            />
          {/if}
        </li>
      {/each}
      {#each discoveryWallets as discoveryWallet}
        <a
          alt={discoveryWallet.name + " download link"}
          href={discoveryWallet.download}
          target="_blank"
          rel="noopener noreferrer"
          class="rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:focus:ring-neutral-700 transition-colors"
        >
          <li
            class="flex flex-row-reverse justify-between items-center p-3 rounded-md cursor-pointer shadow-list-item dark:shadow-none dark:bg-neutral-800 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-700"
            on:click={() => cb(null)}
            on:keyup={(e) => {
              if (e.key === "Enter") {
                cb(null)
              }
            }}
          >
            <span class="w-8 h-8" />
            <p class="font-semibold text-base">
              Install {discoveryWallet.name}
            </p>
            <img
              alt={discoveryWallet.name}
              src={discoveryWallet.icon}
              class="w-8 h-8 rounded-full"
            />
          </li>
        </a>
      {/each}
    </ul>
  </main>
</div>

<style>
  @tailwind utilities;
  @tailwind components;
  @tailwind base;

  @import url("https://fonts.googleapis.com/css2?family=Barlow:wght@500;600&display=swap");

  * {
    font-family: "Barlow", -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
      Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
      sans-serif;
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
    text-size-adjust: 100%;
    font-feature-settings: "kern";
  }
</style>
