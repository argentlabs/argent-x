import { Preview } from "@storybook/react"

export const globalTypes: Preview["globalTypes"] = {
  colorMode: {
    title: "Color Mode",
    defaultValue: "dark",
    toolbar: {
      items: [
        { title: "Light", value: "light" },
        { title: "Dark", value: "dark" },
      ],
      dynamicTitle: true,
    },
  },
}
