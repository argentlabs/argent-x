import { Button, H5, icons } from "@argent/x-ui"
import type { FC } from "react"

const { MinusPrimaryIcon } = icons

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
      <H5 overflow={"hidden"} textOverflow={"ellipsis"} mr={"auto"}>
        {host}
      </H5>
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
          <MinusPrimaryIcon fontSize={"xl"} />
        </Button>
      )}
    </Button>
  )
}
