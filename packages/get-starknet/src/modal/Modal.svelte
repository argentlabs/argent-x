<script lang="ts">
  import type { StarknetWindowObject } from "get-starknet-core"
  import { onMount } from "svelte"

  import type { WalletProviderWithStoreVersion } from "."

  export let chainId: string | number
  export let projectId: string
  export let enableArgentWebWallet: boolean = true
  export let dappName: string = window.document.title ?? ""
  export let lastWallet: StarknetWindowObject | null = null
  export let installedWallets: StarknetWindowObject[] = []
  export let preAuthorizedWallets: StarknetWindowObject[] = []
  export let discoveryWallets: WalletProviderWithStoreVersion[] = []
  export let enableArgentMobile: boolean = false
  export let callback: (
    value: StarknetWindowObject | null,
  ) => Promise<void> = async () => {}
  export let theme: "light" | "dark" | null = null
  export let starknetAppearance: "email_only" | "all" = "all"
  export let origin: string

  let loadingItem: string | false = false
  let starknetMobileArgentX =
    window?.starknet_argentX as StarknetWindowObject & {
      isInAppBrowser: boolean
    }
  let isInAppBrowser = starknetMobileArgentX?.isInAppBrowser

  const setLoadingItem = (item: string | false) => {
    loadingItem = item
  }

  let cb = async (value: StarknetWindowObject | null) => {
    setLoadingItem(value?.id ?? false)
    await callback(value).catch((e) => {
      console.error(e)
    })
    setLoadingItem(false)
  }

  let darkModeControlClass = theme === "dark" ? "dark" : ""

  let target = `${origin}/iframes/modal?darkmode=${Boolean(
    darkModeControlClass,
  )}`
  onMount(async () => {
    if (
      theme === "dark" ||
      (theme === null &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      darkModeControlClass = "dark"
    } else {
      darkModeControlClass = ""
    }

    if (isInAppBrowser) {
      try {
        cb(window?.starknet_argentX)
      } catch {}
      return
    }

    if (starknetAppearance === "email_only") {
      openPopup()
    }
  })

  const openPopup = async () => {
    const { trpcProxyClient } = await import("@argent/web-sdk")
    const { getWebWalletStarknetObject } = await import("@argent/web-sdk")
    const starknetWindowObject = await getWebWalletStarknetObject(
      origin,
      trpcProxyClient({ origin }),
    )

    cb(starknetWindowObject)
  }

  const argentMobile = async () => {
    const { getStarknetWindowObject } = await import("./argentMobile")
    const options = {
      chainId,
      name: dappName,
      projectId,
    }

    const starknetWindowObject = await getStarknetWindowObject(options)
    try {
      cb(starknetWindowObject)
    } catch {}
  }

  const wallets = [
    lastWallet,
    ...preAuthorizedWallets,
    ...installedWallets,
  ].filter(Boolean)
</script>

{#if !isInAppBrowser && starknetAppearance === "all"}
  <div
    class={"backdrop-blur-sm fixed inset-0 flex items-center justify-center bg-black/25 z-[9999] " +
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
      class={`bg-slate-50 rounded-3xl shadow-modal dark:shadow-none w-full max-w-[380px] mx-6 p-6 pb-8 text-center z-50 dark:bg-neutral-900 text-neutral-900 dark:text-white`}
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
          aria-label="Close"
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

      <ul class="flex flex-col gap-3">
        {#if enableArgentWebWallet}
          <!-- svelte-ignore a11y-no-noninteractive-element-to-interactive-role -->
          <li
            class="flex flex-row-reverse justify-between items-center p-3 rounded-md cursor-pointer shadow-list-item dark:shadow-none dark:bg-neutral-800 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:focus:ring-neutral-700 transition-colors"
            role="button"
            tabindex="0"
            on:keyup={(e) => {
              if (e.key === "Enter") {
                openPopup()
              }
            }}
            on:click={() => {
              openPopup()
            }}
          >
            <span class="w-8 h-8" />
            <div class="flex flex-col justify-center items-center">
              <p class="font-semibold text-base">Continue with email</p>
              <p class="l2" style="text-align: center;">Powered by Argent</p>
            </div>
            <div style="position: relative;">
              <svg
                width="32"
                height="28"
                viewBox="0 0 18 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M1.5 0.4375C0.982233 0.4375 0.5625 0.857233 0.5625 1.375V12C0.5625 12.4144 0.72712 12.8118 1.02015 13.1049C1.31317 13.3979 1.7106 13.5625 2.125 13.5625H15.875C16.2894 13.5625 16.6868 13.3979 16.9799 13.1049C17.2729 12.8118 17.4375 12.4144 17.4375 12V1.375C17.4375 0.857233 17.0178 0.4375 16.5 0.4375H1.5ZM2.4375 3.50616V11.6875H15.5625V3.50616L9.63349 8.94108C9.27507 9.26964 8.72493 9.26964 8.36651 8.94108L2.4375 3.50616ZM14.0899 2.3125H3.91013L9 6.97822L14.0899 2.3125Z"
                  fill="currentColor"
                />
              </svg>
            </div>
          </li>
        {/if}

        {#if starknetAppearance === "all" || !enableArgentWebWallet}
          {#each wallets as wallet}
            <!-- svelte-ignore a11y-no-noninteractive-element-to-interactive-role -->
            <li
              class="flex flex-row-reverse justify-between items-center p-3 rounded-md cursor-pointer shadow-list-item dark:shadow-none dark:bg-neutral-800 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:focus:ring-neutral-700 transition-colors"
              role="button"
              tabindex="0"
              on:click={() => {
                cb(wallet)
              }}
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
                  class="w-8 h-8 rounded"
                />
              {/if}
            </li>
          {/each}
          {#each discoveryWallets as discoveryWallet}
            <a
              aria-label={discoveryWallet.name + " download link"}
              href={discoveryWallet.download}
              target="_blank"
              rel="noopener noreferrer"
              class="rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:focus:ring-neutral-700 transition-colors"
            >
              <li
                class="flex flex-row-reverse justify-between items-center p-3 rounded-md cursor-pointer shadow-list-item dark:shadow-none dark:bg-neutral-800 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-700"
                on:click={() => {
                  cb(null)
                }}
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
          {#if enableArgentMobile}
            <li
              class="flex flex-row-reverse justify-between items-center p-3 rounded-md cursor-pointer shadow-list-item dark:shadow-none dark:bg-neutral-800 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:focus:ring-neutral-700 transition-colors"
              on:click={() => {
                argentMobile()
              }}
              on:keyup={(e) => {
                argentMobile()
              }}
            >
              <span class="w-8 h-8" />
              <p class="font-semibold text-base">Argent mobile</p>
              <svg
                width="40"
                height="40"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="32" height="32" rx="8" fill="#FF875B" />
                <path
                  d="M18.316 8H13.684C13.5292 8 13.4052 8.1272 13.4018 8.28531C13.3082 12.7296 11.0323 16.9477 7.11513 19.9355C6.99077 20.0303 6.96243 20.2085 7.05335 20.3369L9.76349 24.1654C9.85569 24.2957 10.0353 24.3251 10.1618 24.2294C12.6111 22.3734 14.5812 20.1345 16 17.6529C17.4187 20.1345 19.389 22.3734 21.8383 24.2294C21.9646 24.3251 22.1443 24.2957 22.2366 24.1654L24.9467 20.3369C25.0375 20.2085 25.0092 20.0303 24.885 19.9355C20.9676 16.9477 18.6918 12.7296 18.5983 8.28531C18.5949 8.1272 18.4708 8 18.316 8Z"
                  fill="white"
                />
              </svg>
            </li>
          {/if}
        {/if}
      </ul>
    </main>
  </div>
{/if}

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

  .l2 {
    color: #8c8c8c;
    font-size: 12px;
    font-weight: 500;
    line-height: 14px;
    letter-spacing: 0em;
    text-align: left;
  }

  .logo-container {
    position: absolute;
    bottom: 0;
    right: 0;
    background: #ff875b;
    border-radius: 3px;
    bottom: -2px;
    right: -2px;
    height: 10px;
    width: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>
