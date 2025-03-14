import type { CustomButtonCellProps } from "../../../components/CustomButtonCell"
import type { FC } from "react"
import React, { useMemo } from "react"
import { Button, Flex } from "@chakra-ui/react"
import { H5, P3 } from "@argent/x-ui"
import type { MultisigPendingOffchainSignature } from "../../../../shared/multisig/pendingOffchainSignaturesStore"
import { isString } from "lodash-es"
import { useDappFromKnownDappsByName } from "../../../services/knownDapps"
import { DappIcon } from "../../actions/connectDapp/DappIcon"
import { TransactionIcon } from "./ui/TransactionIcon"
import { getDapplandUrlForDapp } from "@argent/x-shared"
import type { DappDisplayAttributes } from "../../../services/knownDapps/types"

import { buttonHoverStyle, typographyStyles } from "@argent/x-ui/theme"

interface OffchainSignatureListItemProps extends CustomButtonCellProps {
  pendingOffchainSignature: MultisigPendingOffchainSignature
  isHighlighted?: boolean
  additionalInfo?: React.ReactNode
}

// TODO: Most of the UI elements are taken from ActivityRow but it doesn't support OffchainSignatures
// We should refactor ActivityRow to support OffchainSignatures and refactor this component
export const OffchainSignatureListItem: FC<OffchainSignatureListItemProps> = ({
  pendingOffchainSignature,
  onClick,
  _active,
  children,
  isHighlighted,
  additionalInfo,
  ...rest
}) => {
  const name = isString(pendingOffchainSignature.message.content.domain.name)
    ? pendingOffchainSignature.message.content.domain.name
    : undefined
  const dapp = useDappFromKnownDappsByName(name)
  const dappName = dapp?.name || name

  const dappIcon = useMemo(() => {
    const dappDisplayAttributes: DappDisplayAttributes = {
      title: dapp?.name,
      iconUrl: dapp?.logoUrl,
      isKnown: !!dapp,
      dapplandUrl: getDapplandUrlForDapp(dapp),
      verified: dapp?.argentVerified,
    }
    return (
      <DappIcon dappDisplayAttributes={dappDisplayAttributes} h={9} w={9} />
    )
  }, [dapp])

  const boxShadow = isHighlighted ? buttonHoverStyle.boxShadow : undefined

  return (
    <Button
      data-msg-hash={pendingOffchainSignature.messageHash}
      boxShadow={boxShadow}
      p={0}
      h="initial"
      textAlign="left"
      fontWeight="initial"
      rounded="xl"
      justifyContent="initial"
      w="full"
      flexDirection="column"
      onClick={onClick}
      {...rest}
    >
      <Flex p={4} w="full" gap="1">
        <Flex gap="2" alignItems="center" overflow="hidden">
          <TransactionIcon iconComponent={dappIcon} size={9} />
          <Flex direction="column" gap={0.5} overflow="hidden">
            <H5
              sx={{ textDecorationThickness: "1px" }}
              overflow="hidden"
              textOverflow="ellipsis"
            >
              Off-chain signature
            </H5>
            <P3
              color="text-secondary"
              fontWeight="semibold"
              overflow="hidden"
              textOverflow="ellipsis"
              sx={{ textDecorationThickness: "1px" }}
            >
              {dappName}
            </P3>
          </Flex>
        </Flex>
      </Flex>
      {additionalInfo && (
        <Flex
          borderTop="1px solid"
          borderTopColor="surface-default"
          px={4}
          py={2}
          w="full"
          color="text-secondary"
          alignItems="center"
          justifyContent="space-between"
          {...typographyStyles.L2Bold}
        >
          {additionalInfo}
        </Flex>
      )}
    </Button>
  )
}
