import { Button } from "@argent/x-ui"
import type { ComponentProps, FC } from "react"

export const OnboardingButton: FC<ComponentProps<typeof Button>> = (props) => {
  return <Button colorScheme={"primary"} minWidth={"12.5rem"} {...props} />
}
