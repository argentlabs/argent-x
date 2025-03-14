import { ExpandIcon } from "@argent/x-ui/icons"
import { Button } from "@argent/x-ui"
import type { ButtonProps } from "@chakra-ui/react"
import type { ComponentPropsWithoutRef, FC } from "react"

export const ARGENT_GUARDIAN_LINK =
  "https://support.argent.xyz/hc/en-us/articles/9950649206685"

export const ESCAPE_GUARDIAN_LINK =
  "https://support.argent.xyz/hc/en-us/articles/9950526113181"

export const SmartAccountExternalLinkButton: FC<
  ButtonProps & ComponentPropsWithoutRef<"a">
> = (props) => {
  return (
    <Button
      mt={8}
      as={"a"}
      target="_blank"
      rel="noreferrer"
      size="sm"
      colorScheme="transparent"
      color="neutrals.400"
      rightIcon={<ExpandIcon />}
      {...props}
    />
  )
}
