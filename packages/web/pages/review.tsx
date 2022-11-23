import { Button, H5, P4 } from "@argent/ui"
import { Box, Flex } from "@chakra-ui/react"
import { UnsecuredJWT } from "jose"
import Image from "next/image"
import { useRouter } from "next/router"
import { useMemo } from "react"
import { useForm } from "react-hook-form"
import { Call, hash, stark } from "starknet"

import { InpageLayout } from "../components/InpageLayout"
import { Navigate } from "../components/Navigate"
import { TransactionReview } from "../components/Review"
import { useFeeTokenBalance } from "../hooks/balance"
import {
  useEstimateDeployment,
  useEstimateTransactions,
  useReview,
} from "../hooks/transactions"
import {
  ACCOUNT_IMPLEMENTATION_CLASS_HASH,
  PROXY_CLASS_HASH,
  getAccount,
} from "../services/account"
import { getAccounts } from "../services/backend/account"

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

  const deploymentFees = useEstimateDeployment()
  const executionFees = useEstimateTransactions(transactions)
  const review = useReview(transactions)
  const feeTokenBalance = useFeeTokenBalance()

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({})

  const balanceTooLowToPayFees = useMemo(() => {
    if (!feeTokenBalance || !executionFees) {
      return false
    }
    const deploymentFee = deploymentFees?.needsDeploy
      ? deploymentFees?.maxFee
      : 0n
    const executionFee = executionFees.maxFee
    const totalFee = deploymentFee + executionFee
    return feeTokenBalance.balance <= totalFee
  }, [deploymentFees, executionFees, feeTokenBalance])

  const stillLoading =
    !deploymentFees || !executionFees || !review || !feeTokenBalance

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
        as="form"
        onSubmit={handleSubmit(async () => {
          const account = await getAccount()
          const [beAccount] = await getAccounts()
          if (!account || !beAccount) {
            return
          }

          if (deploymentFees?.needsDeploy) {
            const deploymentTx = await account.deployAccount(
              {
                classHash: PROXY_CLASS_HASH,
                constructorCalldata: stark.compileCalldata({
                  implementation: ACCOUNT_IMPLEMENTATION_CLASS_HASH,
                  selector: hash.getSelectorFromName("initialize"),
                  calldata: stark.compileCalldata({
                    signer: beAccount.ownerAddress,
                    guardian: "0",
                  }),
                }),
                addressSalt: beAccount.salt,
              },
              {
                maxFee: deploymentFees?.maxFee,
              },
            )
            console.log("deploymentTx", deploymentTx)
          }

          const signed = await account.execute(transactions, undefined, {
            maxFee: executionFees?.maxFee,
          })

          console.log("TX:", signed.transaction_hash)

          return navigate.push(`/dashboard`)
        })}
      >
        <Image src="/dapp-logo.svg" width={80} height={80} alt="Dapp logo" />
        <H5 mt={3}>Confirm transaction</H5>
        <P4 color="#8C8C8C" mb={6}>
          somecooldapp.xyz
        </P4>
        <TransactionReview
          review={review}
          executionFees={executionFees}
          deploymentFees={deploymentFees}
          balanceTooLowToPayFees={balanceTooLowToPayFees}
        />
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
            type="submit"
            isDisabled={isSubmitting || stillLoading || balanceTooLowToPayFees}
            isLoading={isSubmitting}
          >
            Confirm
          </Button>
        </Flex>
      </Box>
    </InpageLayout>
  )
}
