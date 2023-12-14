import { Divider } from "@chakra-ui/react"
import { FC, ReactNode } from "react"
import { typedData } from "starknet"

import {
  ConfirmScreen,
  ConfirmScreenProps,
} from "../transaction/ApproveTransactionScreen/ConfirmScreen"
import { AccountDetails } from "./TransactionHeader/AccountDetails"
import { TransactionHeader } from "./TransactionHeader"
import { TransactionReviewSignAction } from "./action/TransactionReviewSignAction"

interface SignActionScreenV2Props extends ConfirmScreenProps {
  dataToSign: typedData.TypedData
  actionIsApproving?: boolean
  footer?: ReactNode
  subtitle?: string
  dappLogoUrl?: string
  dappHost: string
}

export const SignActionScreenV2: FC<SignActionScreenV2Props> = ({
  dataToSign,
  actionIsApproving,
  title = "Review signature request",
  subtitle,
  dappHost,
  dappLogoUrl,
  ...rest
}) => {
  const navigationBar = (
    <>
      <AccountDetails />
      <Divider color="neutrals.700" />
    </>
  )
  return (
    <ConfirmScreen
      confirmButtonText="Sign"
      confirmButtonLoadingText="Sign"
      confirmButtonDisabled={actionIsApproving}
      confirmButtonIsLoading={actionIsApproving}
      navigationBar={navigationBar}
      {...rest}
    >
      <TransactionHeader
        title={title}
        dappLogoUrl={dappLogoUrl}
        subtitle={subtitle}
        dappHost={dappHost}
        px={0}
      />
      <TransactionReviewSignAction dataToSign={dataToSign} />
    </ConfirmScreen>
  )
}
