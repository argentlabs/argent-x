import {
  BarBackButton,
  BarCloseButton,
  CopyTooltip,
  H4,
  NavigationContainer,
  P2,
  icons,
} from "@argent/x-ui"
import { Button, Flex } from "@chakra-ui/react"
import { FC, useCallback, useRef } from "react"

import { formatFullAddress, normalizeAddress } from "@argent/x-shared"
import { QrCode } from "../../components/QrCode"

const { CopyIcon } = icons

interface FundingQrCodeScreenProps {
  onClose?: () => void
  accountName: string
  accountAddress: string
}

export const FundingQrCodeScreen: FC<FundingQrCodeScreenProps> = ({
  onClose,
  accountName,
  accountAddress,
}) => {
  const normalizedAddress = normalizeAddress(accountAddress)
  const formattedAddress = formatFullAddress(accountAddress)

  const addressRef = useRef<HTMLParagraphElement | null>(null)

  /** Intercept 'mouseup' and automatically select the entire address */
  const onSelectAddress = useCallback((_e: Event) => {
    const selection = window.getSelection()
    if (selection && addressRef.current) {
      selection.setBaseAndExtent(addressRef.current, 0, addressRef.current, 1)
    }
  }, [])

  /** Add / remove events when ref changes */
  const setAddressRef = useCallback(
    (ref: HTMLParagraphElement) => {
      if (addressRef.current) {
        addressRef.current.removeEventListener("mouseup", onSelectAddress)
      }
      addressRef.current = ref
      if (addressRef.current) {
        addressRef.current.addEventListener("mouseup", onSelectAddress)
      }
    },
    [onSelectAddress],
  )

  return (
    <NavigationContainer
      leftButton={<BarBackButton />}
      rightButton={<BarCloseButton onClick={onClose} />}
    >
      <Flex
        p={4}
        direction={"column"}
        gap={6}
        flex={1}
        alignItems={"center"}
        textAlign={"center"}
      >
        <QrCode
          size={220}
          data={normalizedAddress}
          data-address={normalizedAddress}
        />
        <H4>{accountName}</H4>
        <P2
          color={"neutrals.300"}
          ref={setAddressRef}
          aria-label="Full account address"
        >
          {formattedAddress}
        </P2>
        <CopyTooltip
          prompt="Click to copy address"
          copyValue={normalizedAddress}
        >
          <Button size={"sm"} leftIcon={<CopyIcon />}>
            Copy address
          </Button>
        </CopyTooltip>
      </Flex>
    </NavigationContainer>
  )
}
