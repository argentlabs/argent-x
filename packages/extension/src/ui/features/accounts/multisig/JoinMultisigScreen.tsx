import { AbsoluteBox, H5, NavigationContainer, P3 } from "@argent/ui"
import { Box, Button, Flex } from "@chakra-ui/react"
import { FC } from "react"
import { useNavigate } from "react-router-dom"

import { routes } from "../../../routes"

export const JoinMultisigScreen: FC = () => {
  const navigate = useNavigate()

  return (
    <NavigationContainer title="Join existing multisig">
      <Flex
        align="center"
        justify="center"
        direction="column"
        textAlign="center"
        pt="44px"
        pb={6}
        px={4}
        gap={6}
      >
        <H5>Share your signer key with the multisig creator</H5>
        <Box
          borderRadius="xl"
          bg="neutrals.800"
          p={4}
          mb={4.5}
          boxSizing="border-box"
          w="full"
        >
          <P3 fontWeight="bold" color="white50">
            Whh3pvMGvDTvpJWCymNpcYQ8tf7nkWF4efDwr7jQ9ie
          </P3>
        </Box>
      </Flex>

      <Box position="absolute" w="full" bottom={6} px={4}>
        <Button
          bg="primary.500"
          w="full"
          onClick={() => navigate(routes.accounts())}
        >
          Done
        </Button>
      </Box>
    </NavigationContainer>
  )
}
