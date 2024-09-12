import { Button, iconsDeprecated } from "@argent/x-ui"
import { ButtonProps } from "@chakra-ui/react"
import { ComponentPropsWithoutRef, FC } from "react"

const { ExpandIcon } = iconsDeprecated

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
