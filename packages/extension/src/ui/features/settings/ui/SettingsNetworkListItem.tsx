import { Button, H6, iconsDeprecated } from "@argent/x-ui"
import { FC } from "react"

const { RemoveIcon } = iconsDeprecated

interface SettingsNetworkListItemProps {
  host: string
  hideRemove?: boolean
  onClick?: () => void
  onRemoveClick?: () => void
}

export const SettingsNetworkListItem: FC<SettingsNetworkListItemProps> = ({
  host,
  hideRemove = false,
  onClick,
  onRemoveClick,
  ...props
}) => {
  return (
    <Button
      width={"full"}
      overflow={"hidden"}
      rounded={"lg"}
      textAlign={"left"}
      p={4}
      onClick={onClick}
      size={"auto"}
      {...props}
    >
      <H6 overflow={"hidden"} textOverflow={"ellipsis"} mr={"auto"}>
        {host}
      </H6>
      {!hideRemove && (
        <Button
          rounded={"full"}
          size={"auto"}
          p={2.5}
          bg={"neutrals.600"}
          _hover={{ bg: "neutrals.500" }}
          ml={4}
          onClick={(e) => {
            e.stopPropagation()
            onRemoveClick?.()
          }}
        >
          <RemoveIcon fontSize={"xl"} />
        </Button>
      )}
    </Button>
  )
}
