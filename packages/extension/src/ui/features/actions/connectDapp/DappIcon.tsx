import { Circle, SquareProps } from "@chakra-ui/react"
import { FC } from "react"

import { useDappDisplayAttributes } from "./useDappDisplayAttributes"

interface DappIconProps extends SquareProps {
  host: string
  useDappDisplayAttributesImpl?: typeof useDappDisplayAttributes
}

export const DappIcon: FC<DappIconProps> = ({
  host,
  useDappDisplayAttributesImpl = useDappDisplayAttributes,
  ...rest
}) => {
  const dappDisplayAttributes = useDappDisplayAttributesImpl(host)
  return (
    <Circle
      size={"full"}
      backgroundSize={"cover"}
      /** https://github.com/chakra-ui/chakra-ui/issues/7548 */
      background={
        dappDisplayAttributes?.iconUrl
          ? `url(${dappDisplayAttributes.iconUrl})`
          : "none"
      }
      backgroundColor={
        dappDisplayAttributes?.iconUrl ? "white" : "rgba(255, 255, 255, 0.15)"
      }
      {...rest}
    />
  )
}
