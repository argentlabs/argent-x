import type { FlexProps } from "@chakra-ui/react"
import { Flex } from "@chakra-ui/react"
import { TransactionIcon } from "./icon/TransactionIcon"
import { TransactionTitle } from "./TransactionTitle"
import type { FC } from "react"
import { useDappDisplayAttributes } from "../../../../services/knownDapps/useDappDisplayAttributes"
import { TransactionType } from "starknet"
import type { TransactionIconKeys } from "../../../../../shared/actionQueue/schema"

export interface TransactionHeaderProps extends FlexProps {
  title?: string
  dappLogoUrl?: string
  subtitle?: string
  iconKey?: TransactionIconKeys
  dappHost?: string
  transactionType?: TransactionType
  hideIcon?: boolean
}

export const TransactionHeader: FC<TransactionHeaderProps> = ({
  title,
  dappLogoUrl,
  subtitle,
  iconKey = "NetworkSecondaryIcon",
  dappHost,
  transactionType,
  hideIcon,
  ...rest
}) => {
  return (
    <Flex
      alignItems={"center"}
      p={hideIcon ? "0 0 6px 0" : 4}
      gap={4}
      {...rest}
    >
      {!hideIcon && (
        <>
          {dappHost && transactionType === TransactionType.INVOKE ? (
            <TransactionIconContainer dappHost={dappHost} />
          ) : (
            <TransactionIcon
              dappLogoUrl={dappLogoUrl}
              iconKey={iconKey}
              boxShadow={"menu"}
              height={12}
              width={12}
              flexShrink={0}
            />
          )}
        </>
      )}
      {title && (
        <TransactionTitle
          title={title}
          subtitle={subtitle}
          dappHost={dappHost}
        />
      )}
    </Flex>
  )
}

const TransactionIconContainer = ({ dappHost }: { dappHost: string }) => {
  const { iconUrl } = useDappDisplayAttributes(dappHost)

  return (
    <TransactionIcon
      dappLogoUrl={iconUrl}
      boxShadow={"menu"}
      height={12}
      width={12}
      flexShrink={0}
    />
  )
}
