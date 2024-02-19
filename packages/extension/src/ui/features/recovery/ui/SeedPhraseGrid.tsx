import { B3 } from "@argent/ui"
import { Box, Center, Flex } from "@chakra-ui/react"
import { FC, PropsWithChildren, useState } from "react"
import { icons } from "@argent/ui"

const { HideIcon } = icons
export const SeedPhraseGrid: FC<PropsWithChildren> = ({
  children,
  ...props
}) => {
  const [isBlurred, setIsBlurred] = useState(true)

  const handleClick = () => {
    setIsBlurred(!isBlurred)
  }

  return (
    <Box position="relative" onClick={handleClick}>
      <Flex
        display="grid"
        gridTemplateColumns="repeat(3, 1fr)"
        gridTemplateRows="repeat(4, 1fr)"
        gridGap="12px"
        marginBottom={1}
        onClick={handleClick}
        filter={isBlurred ? "blur(5px)" : "none"}
        transition="filter 0.3s ease-in-out"
        {...props}
      >
        {children}
      </Flex>
      {isBlurred && (
        <Center
          position="absolute"
          top="0"
          right="0"
          left="0"
          bottom="0"
          alignItems="center"
          justifyContent="center"
          filter="none"
          onClick={handleClick}
          cursor="pointer"
          flexDirection="column"
        >
          <HideIcon fontSize="2xl" mb={2} />
          <B3 fontWeight="bold">Click to reveal recovery phrase</B3>
        </Center>
      )}
    </Box>
  )
}
