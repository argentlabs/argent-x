<script lang="ts">
  import type { StarknetWindowObject } from "get-starknet-core"
  import { onMount } from "svelte"

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

  let cb = async (value: StarknetWindowObject | null) => {
    loadingItem = value?.id ?? false
    await callback(value).catch(() => {})
    loadingItem = false
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

  onMount(() => {
    if (theme === null) {
      globalWindow
        ?.matchMedia("(prefers-color-scheme: dark)")
        .addEventListener("change", handler)
      return () => {
        globalWindow
          ?.matchMedia("(prefers-color-scheme: dark)")
          .removeEventListener("change", handler)
      }
    }
  })

  const wallets = [
    lastWallet,
    ...preAuthorizedWallets,
    ...installedWallets,
  ].filter(Boolean)
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
        class="absolute top-0 right-0 p-2 cursor-pointer rounded-full bg-neutral-200 text-neutral-400 dark:bg-neutral-800 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
        role="button"
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
    <!-- create one entry per wallet -->
    <ul class="flex flex-col gap-3">
      {#each wallets as wallet}
        <li
          class="flex flex-row-reverse justify-between items-center p-3 rounded-md cursor-pointer shadow-list-item dark:shadow-none dark:bg-neutral-800 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
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
        >
          <li
            class="flex flex-row-reverse justify-between items-center p-3 rounded-md cursor-pointer shadow-list-item dark:shadow-none dark:bg-neutral-800 dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
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
  }
</style>
