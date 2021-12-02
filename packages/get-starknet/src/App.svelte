<script>
  import Modal from "./Modal.svelte"
  import DownloadSvg from "./button-download.svg"

  let showModal = true
</script>

{#if showModal}
  <Modal on:close={() => (showModal = false)}>
    <h2 slot="header">No Wallet Detected</h2>

    <p>
      Please download ArgentX to use this dapp, which runs on StarkNet, a
      ZK-Rollup Layer-2 network on Ethereum.
    </p>
    <a
      href="https://chrome.google.com/webstore/detail/argent-x-starknet-wallet/dlcobpjiigpikoobohmabehhmhfoodbb/"
      target="_blank"
    >
      <DownloadSvg />
    </a>
  </Modal>
{/if}

<style>
  a {
    display: inline-block;
    color: orange;
    background-color: transparent;
    text-decoration: none;
    margin-top: 32px;
  }

  h2 {
    font-size: 48px;
  }

  h2:first-child {
    margin-top: 0;
  }
</style>
