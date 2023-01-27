import { H2, P3, SpacerCell, icons } from "@argent/ui"
import { Text } from "@chakra-ui/react"
import { FC } from "react"

const { ShieldIcon } = icons

interface ShieldHeaderProps {
  title: string
  subtitle?: string
}

export const ShieldHeader: FC<ShieldHeaderProps> = ({ title, subtitle }) => {
  return (
    <>
      <Text fontSize={"6xl"}>
        <ShieldIcon />
      </Text>
      <H2>{title}</H2>
      <SpacerCell />
      {subtitle && (
        <>
          <P3 fontWeight={"bold"}>{subtitle}</P3>
          <SpacerCell />
        </>
      )}
    </>
  )
}
