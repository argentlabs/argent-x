import { Center, Circle } from "@chakra-ui/react"
import type { FC } from "react"

interface AvatarBackgroundPickerProps {
  bgColor?: string
  onBgColorChange: (color: string) => void
}

const colors = [
  "surface-sunken",
  "accent-brand",
  "accent-hot-pink",
  "accent-yellow",
  "accent-green",
  "accent-sky-blue",
]

export const AvatarBackgroundPicker: FC<AvatarBackgroundPickerProps> = ({
  bgColor = colors[0],
  onBgColorChange,
}: AvatarBackgroundPickerProps) => {
  return (
    <Center gap="4" mt={6}>
      {colors.map((color) => (
        <Circle
          key={color}
          size={8}
          bgColor={color}
          onClick={() => onBgColorChange(color)}
          cursor={"pointer"}
          outline={bgColor === color ? "2px solid" : "none"}
        />
      ))}
    </Center>
  )
}
