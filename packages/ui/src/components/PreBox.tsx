import { TextProps } from "@chakra-ui/react"
import { FC, useMemo } from "react"

import { P4 } from "./Typography"

export interface PreJsonStringifyProps extends TextProps {
  json: Parameters<typeof JSON.stringify>[0]
}

export const PreBoxJsonStringify: FC<PreJsonStringifyProps> = ({
  json,
  ...rest
}) => {
  const stringified = useMemo(() => {
    try {
      return JSON.stringify(json, null, 2)
    } catch (e) {
      return String(e)
    }
  }, [json])
  return <PreBox {...rest}>{stringified}</PreBox>
}

export const PreBox: FC<TextProps> = (props) => {
  return (
    <P4
      as="pre"
      mt={2}
      p={2}
      rounded={"base"}
      backgroundColor={"neutrals.600"}
      overflowX={"hidden"}
      whiteSpace={"pre-wrap"}
      {...props}
    />
  )
}
