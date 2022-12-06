import { Button, H5, P4, icons } from "@argent/ui"
import { Box, Flex } from "@chakra-ui/react"
import Image from "next/image"
import { useRouter } from "next/router"
import { useForm } from "react-hook-form"

import { InpageLayout } from "../components/InpageLayout"
import { Navigate } from "../components/Navigate"
import { Block, BlockContent, Row } from "../components/Review"
import { actionEmitter } from "../hooks/useMessages"
import { usePreAuthorized } from "../states/preAuthorized"

const { TickIcon } = icons

export default function ConnectScreen() {
  const navigate = useRouter()
  const origin = navigate.query.origin
  const { addPreAuthorizedOrigin } = usePreAuthorized()
  const {
    handleSubmit,
    formState: { isSubmitting },
  } = useForm()

  if (typeof origin !== "string" || !origin) {
    return <Navigate to="/" />
  }

  return (
    <InpageLayout>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        padding={6}
        as="form"
        onSubmit={handleSubmit(() => {
          if (typeof origin !== "string" || !origin) return
          addPreAuthorizedOrigin(origin)
          actionEmitter.emit("enable", {
            success: true,
          })
          navigate.push("/")
        })}
      >
        <Image
          priority
          src="/dapp-logo.svg"
          width={80}
          height={80}
          alt="Dapp logo"
        />
        <H5 mt={3}>Connect to Some Cool Dapp</H5>
        <P4 color="#8C8C8C" mb={6}>
          {origin}
        </P4>

        {/* Content */}
        <Block mb={8}>
          <BlockContent>
            <Row mb={2}>
              <P4 fontWeight="bold">This app will be able to:</P4>
            </Row>
            <Row justifyContent={"normal"}>
              <TickIcon color="#08A681" />
              <P4 ml={3}>View your wallet balance and activity</P4>
            </Row>
            <Row justifyContent={"normal"}>
              <TickIcon color="#08A681" />
              <P4 ml={3}>Request approval for transactions</P4>
            </Row>
          </BlockContent>
        </Block>

        <Flex w="100%" alignItems="center" gap={2}>
          <Button
            variant="outline"
            colorScheme="accent"
            w="100%"
            onClick={() => {
              actionEmitter.emit("enable", {
                success: false,
              })
              navigate.push("/dashboard")
            }}
          >
            Cancel
          </Button>
          <Button
            variant="solid"
            colorScheme="accent"
            w="100%"
            type="submit"
            isDisabled={isSubmitting}
            isLoading={isSubmitting}
          >
            Connect
          </Button>
        </Flex>
      </Box>
    </InpageLayout>
  )
}
