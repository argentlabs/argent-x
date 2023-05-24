import { Textarea, theme } from "@argent/ui"
import { getThemingArgTypes } from "@chakra-ui/storybook-addon"

export default {
  component: Textarea,
  argTypes: {
    isDisabled: {
      control: "boolean",
      defaultValue: false,
    },
    isInvalid: {
      control: "boolean",
      defaultValue: false,
    },
    ...getThemingArgTypes(theme, "Textarea"),
  },
}

/** Same stories as Input */

export {
  Default,
  Filled,
  FilledIsInvalid,
  Outline,
  OutlineIsInvalid,
} from "./Input.stories"
