<script>
  import Modal from "./Modal.svelte"

  let showModal = true
</script>

{#if showModal}
  <Modal on:close={() => (showModal = false)}>
    <h2 slot="header">No Wallet Detected</h2>

    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer dui quam,
      malesuada porta fringilla ac, consequat a lectus. Ut iaculis enim in orci
      tempor accumsan.
    </p>

    <a
      href="https://chrome.google.com/webstore/category/extensions"
      target="_blank">Download ArgentX now!</a
    >
  </Modal>
{/if}

<style>
  a {
    color: blue;
    background-color: transparent;
    text-decoration: none;
  }
</style>
