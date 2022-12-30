import { Box, InputElementProps, Text } from "@chakra-ui/react"
import { forwardRef } from "react"

import { SearchIcon } from "./icons"
import { Input } from "./Input"

const SearchInput = forwardRef<HTMLInputElement, InputElementProps>(
  ({ ...props }, ref) => {
    return (
      <Box position="relative" w="100%">
        <Text
          position="absolute"
          top="50%"
          left="3"
          transform="translateY(-50%)"
          fontSize="base"
          zIndex={10}
        >
          <SearchIcon />
        </Text>
        <Input
          autoComplete="off"
          type="text"
          {...props}
          autoFocus
          ref={ref}
          pl="8"
        />
      </Box>
    )
  },
)

SearchInput.displayName = "SearchInput"

export { SearchInput }
