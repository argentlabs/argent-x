<script>
  import { createEventDispatcher, onDestroy } from "svelte"
  import CloseSvg from "./close.svg"

  const dispatch = createEventDispatcher()
  const close = () => dispatch("close")

  let modal

  const handle_keydown = (e) => {
    if (e.key === "Escape") {
      close()
      return
    }

    if (e.key === "Tab") {
      // trap focus
      const nodes = modal.querySelectorAll("*")
      const tabbable = Array.from(nodes).filter((n) => n.tabIndex >= 0)

      let index = tabbable.indexOf(document.activeElement)
      if (index === -1 && e.shiftKey) index = 0

      index += tabbable.length + (e.shiftKey ? -1 : 1)
      index %= tabbable.length

      tabbable[index].focus()
      e.preventDefault()
    }
  }

  const previously_focused =
    typeof document !== "undefined" && document.activeElement

  if (previously_focused) {
    onDestroy(() => {
      previously_focused.focus()
    })
  }
</script>

<svelte:window on:keydown={handle_keydown} />

<div class="modal-background" on:click={close} />

<div class="modal" role="dialog" aria-modal="true" bind:this={modal}>
  <slot name="header" />
  <slot />

  <!-- svelte-ignore a11y-autofocus -->
  <button
    autofocus
    on:click={close}
    class="modal-close"
    aria-label="Close modal"
  >
    <CloseSvg />
  </button>
</div>

<style>
  .modal-background {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
  }

  .modal {
    box-sizing: border-box;
    position: absolute;
    left: 50%;
    top: 50%;
    width: calc(100vw - 4em);
    max-width: 640px;
    max-height: calc(100vh - 4em);
    transform: translate(-50%, -50%);
    padding: 80px 64px;
    border-radius: 16px;
    background: #000;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);

    font-size: 1.25em;
    font-weight: 300;
    line-height: 1.4;
    text-align: center;
    color: #fff;
  }

  .modal-close {
    display: flex;
    justify-content: center;
    align-items: center;

    width: 40px;
    height: 40px;
    position: absolute;
    top: 20px;
    right: 20px;
    border: 0;
    border-radius: 50%;

    background: rgba(255, 255, 255, 0.15);
    color: #fff;
    cursor: pointer;
  }
</style>
