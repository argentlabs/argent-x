import type { FlexProps } from "@chakra-ui/react"
import { Flex } from "@chakra-ui/react"
import { TransactionIcon } from "./icon/TransactionIcon"
import { TransactionTitle } from "./TransactionTitle"
import type { FC } from "react"
import { useDappDisplayAttributes } from "../../../../services/knownDapps/useDappDisplayAttributes"
import type { TransactionIconKeys } from "../../../../../shared/actionQueue/schema"

export interface SessionKeyHeaderProps extends FlexProps {
  title?: string
  dappLogoUrl?: string
  subtitle?: string
  iconKey?: TransactionIconKeys
  dappHost?: string
  isInfluence: boolean
}

export const SessionKeyHeader: FC<SessionKeyHeaderProps> = ({
  title,
  dappLogoUrl,
  subtitle,
  iconKey = "NetworkSecondaryIcon",
  dappHost,
  isInfluence,
  ...rest
}) => {
  return (
    <Flex
      alignItems={"center"}
      px={4}
      pt={isInfluence ? 30 : 4}
      pb={3}
      gap={4}
      background={
        isInfluence
          ? 'linear-gradient(to bottom, rgba(0,0,0,0) 50%, #000000 100%), url("../../../assets/influence.png")'
          : ""
      }
      backgroundSize="cover"
      backgroundPosition="bottom"
      {...rest}
    >
      {dappHost ? (
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
