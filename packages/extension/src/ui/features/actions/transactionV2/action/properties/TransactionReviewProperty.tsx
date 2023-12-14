import { formatTruncatedAddress, isUnlimitedAmount } from "@argent/shared"
import { ModalDialogData, icons, CopyTooltip, LabelValueRow } from "@argent/ui"
import { Button, Flex, Text, Tooltip, useDisclosure } from "@chakra-ui/react"
import { useCallback, useMemo } from "react"

import type { Property } from "../../../../../../shared/transactionReview/schema"
import { TokenIcon } from "../../../../accountTokens/TokenIcon"
import { PrettyAccountAddressArgentX } from "../../../../accounts/PrettyAccountAddressArgentX"
import { useCurrentNetwork } from "../../../../networks/hooks/useCurrentNetwork"
import {
  openBlockExplorerAddress,
  useBlockExplorerTitle,
} from "../../../../../services/blockExplorer.service"
import { formatDateTime } from "../../../../../services/dates"
import { prettifyTokenAmount } from "../../../../../../shared/token/price"
import { TransactionReviewLabel } from "../../TransactionReviewLabel"

const { CopyIcon, ExpandIcon } = icons

export function TransactionReviewProperty(property: Property) {
  const value = useMemo(() => {
    switch (property.type) {
      case "amount":
        return AmountProperty(property)
      case "address":
        return <AddressProperty {...property} />
      case "token_address":
        return TokenAddressProperty(property)
      case "calldata":
        return <CallDataProperty {...property} />
      case "text":
        return TextProperty(property)
      case "timestamp":
        return TimeStampProperty(property)
    }
    /** ensures all cases are handled */
    property satisfies never
  }, [property])
  return (
    <LabelValueRow
      label={<TransactionReviewLabel label={property.label} />}
      value={value}
    />
  )
}

function AmountProperty(property: Extract<Property, { type: "amount" }>) {
  const { amount, token } = property
  const value = prettifyTokenAmount({
    amount: amount,
    decimals: token.decimals,
    symbol: token.symbol,
  })
  let color = undefined
  if (isUnlimitedAmount(amount)) {
    color = "warning.500"
  }
  return (
    <Flex
      gap="1"
      alignItems={"center"}
      ml={"auto"}
      justifyContent={"flex-end"}
      textAlign={"right"}
    >
      <TokenIcon url={token.iconUrl} name={token.name} size={4} />
      <Text color={color}>{value}</Text>
    </Flex>
  )
}

function AddressProperty(property: Extract<Property, { type: "address" }>) {
  const network = useCurrentNetwork()
  const blockExplorerTitle = useBlockExplorerTitle()
  const { addressName, address } = property
  const onOpen = useCallback(
    () => void openBlockExplorerAddress(network, address),
    [address, network],
  )
  const value = useMemo(() => {
    if (addressName) {
      const tooltip = formatTruncatedAddress(address)
      return (
        <Tooltip label={tooltip} placement="top">
          <Text
            onClick={onOpen}
            cursor={"pointer"}
            _hover={{
              textDecoration: "underline",
              color: "text.secondary",
            }}
          >
            {addressName}
          </Text>
        </Tooltip>
      )
    }
    return (
      <PrettyAccountAddressArgentX
        accountAddress={address}
        networkId={network.id}
        size={5}
      />
    )
  }, [address, addressName, network.id, onOpen])

  return (
    <Flex
      flex="1"
      gap="1"
      alignItems={"center"}
      justifyContent={"flex-end"}
      role="group"
    >
      <Flex
        gap="1"
        alignItems={"center"}
        opacity={0}
        transitionProperty={"common"}
        transitionDuration={"fast"}
        _groupHover={{ opacity: 1 }}
      >
        <CopyTooltip copyValue={address} placement="top">
          <Button
            size="auto"
            color="neutrals.300"
            p={0.5}
            rounded="sm"
            _hover={{
              color: "white",
              bg: "neutrals.600",
            }}
          >
            <CopyIcon />
          </Button>
        </CopyTooltip>
        <Tooltip label={`View on ${blockExplorerTitle}`} placement="top">
          <Button
            onClick={onOpen}
            size="auto"
            color="neutrals.300"
            p={0.5}
            rounded="sm"
            _hover={{
              color: "white",
              bg: "neutrals.600",
            }}
          >
            <ExpandIcon />
          </Button>
        </Tooltip>
      </Flex>
      {value}
    </Flex>
  )
}

function TokenAddressProperty(
  property: Extract<Property, { type: "token_address" }>,
) {
  const { token } = property
  return (
    <Flex
      gap="1"
      alignItems={"center"}
      ml={"auto"}
      justifyContent={"flex-end"}
      textAlign={"right"}
    >
      <TokenIcon url={token.iconUrl} name={token.name} size={4} />
      <Text>{token.symbol}</Text>
    </Flex>
  )
}

function CallDataProperty(property: Extract<Property, { type: "calldata" }>) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const calldata = JSON.stringify(property.calldata, null, 2)
  return (
    <CallDataModal
      calldata={calldata}
      label={property.entrypoint}
      title="Transaction call data"
      isOpen={isOpen}
      onClose={onClose}
      onOpen={onOpen}
    />
  )
}

export function CallDataModal({
  calldata,
  isOpen,
  onClose,
  onOpen,
  label,
  title,
  alignRight = true,
}: {
  calldata: string
  label: string
  title: string
  isOpen: boolean
  onClose: () => void
  onOpen: () => void
  alignRight?: boolean
}) {
  return (
    <Flex gap="1" alignItems={"center"} ml={alignRight ? "auto" : undefined}>
      <ModalDialogData
        title={title}
        data={calldata}
        isOpen={isOpen}
        onClose={onClose}
      />
      <Text
        textDecoration="underline"
        cursor="pointer"
        onClick={onOpen}
        textAlign={"right"}
        transitionProperty={"common"}
        transitionDuration={"fast"}
        _hover={{
          color: "text.secondary",
        }}
      >
        {label}
      </Text>
    </Flex>
  )
}

function TextProperty(property: Extract<Property, { type: "text" }>) {
  return property.text
}

function TimeStampProperty(property: Extract<Property, { type: "timestamp" }>) {
  const value = formatDateTime(new Date(parseInt(property.value) * 1000))
  return value
}
