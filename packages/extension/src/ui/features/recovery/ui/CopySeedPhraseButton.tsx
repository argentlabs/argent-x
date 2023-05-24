import { Button } from "@chakra-ui/button"
import { useColorModeValue } from "@chakra-ui/color-mode"
import { FC, PropsWithChildren } from "react"

export const CopySeedPhraseButton: FC<
  PropsWithChildren & { active: boolean }
> = ({ active, children, ...props }) => {
  const buttonBg = useColorModeValue(
    active ? "#FFFFFF" : "rgba(255, 255, 255, 0.25)",
    active ? "#FFFFFF" : "rgba(255, 255, 255, 0.25)",
  )
  const buttonColor = useColorModeValue(
    active ? "#000" : "#fff",
    active ? "#000" : "#fff",
  )

  return (
    <Button
      py="0"
      px="4"
      bg={buttonBg}
      color={buttonColor}
      borderRadius="full"
      fontWeight="semibold"
      fontSize="sm"
      display="flex"
      alignItems="center"
      justifyContent="center"
      gap="2"
      _active={{ bg: buttonBg }}
      _focus={{ outline: "none", boxShadow: "none" }}
      {...props}
    >
      {children}
    </Button>
  )
}
