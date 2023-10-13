import { Button, chakra } from "@chakra-ui/react"
import * as _ from "@chakra-ui/button" /** Fixes 'cannot be named without a reference' type error */

export const ButtonRect = chakra(Button, {
  baseStyle: {
    rounded: "base",
  },
})
