import { Button, H5, P4 } from "@argent/ui"
import { Box, Flex } from "@chakra-ui/react"
import { UnsecuredJWT } from "jose"
import Image from "next/image"
import { useRouter } from "next/router"
import { useMemo } from "react"
import { Call } from "starknet"

import { InpageLayout } from "../components/InpageLayout"
import { Navigate } from "../components/Navigate"
import { TransactionReview } from "../components/Review"

export default function ReviewScreen() {
  const navigate = useRouter()

  const transactionsString = navigate.query["transactions"]
  const transactions: Call[] = useMemo(() => {
    if (typeof transactionsString !== "string") {
      return []
    }
    try {
      const decoded = UnsecuredJWT.decode(transactionsString)
      return decoded.payload.transactions as Call[]
    } catch (error) {
      return []
    }
  }, [transactionsString])

  if (transactions.length === 0) {
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
      >
        <Image src="/dapp-logo.svg" width={80} height={80} alt="Dapp logo" />
        <H5 mt={3}>Confirm transaction</H5>
        <P4 color="#8C8C8C" mb={6}>
          somecooldapp.xyz
        </P4>
        <TransactionReview transactions={transactions} />
        <Flex w="100%" alignItems="center" gap={2}>
          <Button
            variant="outline"
            colorScheme="accent"
            w="100%"
            onClick={() => navigate.push("/dashboard")}
          >
            Cancel
          </Button>
          <Button
            variant="solid"
            colorScheme="accent"
            w="100%"
            onClick={async () => {
              navigate.push(`/dashboard`)
            }}
          >
            Confirm
          </Button>
        </Flex>
      </Box>
    </InpageLayout>
  )
}
