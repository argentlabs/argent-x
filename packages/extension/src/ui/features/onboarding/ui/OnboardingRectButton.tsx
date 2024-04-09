import { Button } from "@argent/x-ui"
import { ComponentProps, FC } from "react"

export const OnboardingRectButton: FC<ComponentProps<typeof Button>> = (
  props,
) => {
  return (
    <Button
      display={"flex"}
      flexDirection={"column"}
      rounded={"lg"}
      minHeight={"172px"}
      gap={2}
      py={9}
      px={4.5}
      {...props}
    />
  )
}
