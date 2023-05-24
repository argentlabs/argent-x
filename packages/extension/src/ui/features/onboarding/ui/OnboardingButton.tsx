import { Button } from "@argent/ui"
import { ComponentProps, FC } from "react"

export const OnboardingButton: FC<ComponentProps<typeof Button>> = (props) => {
  return <Button colorScheme={"primary"} minWidth={"200px"} {...props} />
}
