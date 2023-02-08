import { Button, icons } from "@argent/ui"
import { ButtonProps } from "@chakra-ui/react"
import { ComponentPropsWithoutRef, FC } from "react"

const { ExpandIcon } = icons

export const ShieldExternalLinkButton: FC<
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
