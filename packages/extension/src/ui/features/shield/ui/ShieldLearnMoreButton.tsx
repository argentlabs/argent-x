import { Button, icons } from "@argent/ui"
import { FC } from "react"

const { ExpandIcon } = icons

export const ShieldLearnMoreButton: FC = () => {
  return (
    <Button
      mt={8}
      as={"a"}
      href={"https://www.argent.xyz/argent-x/"}
      target="_blank"
      rel="noreferrer"
      size="sm"
      colorScheme="transparent"
      color="neutrals.400"
      rightIcon={<ExpandIcon />}
    >
      Learn more about Argent Shield
    </Button>
  )
}
