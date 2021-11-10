<script>
  import Modal from "./Modal.svelte"

  let showModal = true
  let downloadButton = 'button-download.svg';
</script>

{#if showModal}
  <Modal on:close={() => (showModal = false)}>
    <h2 slot="header">No Wallet Detected</h2>

    <p>Please download ArgentX to use this dapp, which runs on StarkNet, a ZK-Rollup Layer-2 network on Ethereum.</p>
    <a
      href="https://chrome.google.com/webstore/category/extensions"
      target="_blank">
      <img src={downloadButton} alt="Download ArgentX for StarkNet">
    </a>
  </Modal>
{/if}

<style>
  a {
    color: orange;
    background-color: transparent;
    text-decoration: none;
  }

  h2 {
    font-size: 48px;
  }

  h2:first-child {
    margin-top: 0;
  }
</style>
