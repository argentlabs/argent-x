import { addons } from "@storybook/manager-api"
import { create } from "@storybook/theming/create"

const theme = create({
  base: "light",
  brandUrl: "https://www.argent.xyz/",
  brandTitle: `<img style="display:block; width:1.5em; height:1.5em" src="https://images.prismic.io/argentwebsite/313db37e-055d-42ee-9476-a92bda64e61d_logo.svg" alt="Argent X Storybook"/>`,
  brandTarget: "_blank",
})

addons.setConfig({
  theme,
})
