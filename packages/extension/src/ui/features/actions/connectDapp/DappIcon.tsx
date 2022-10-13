import { FC } from "react"
import styled from "styled-components"

import { useDappDisplayAttributes } from "./useDappDisplayAttributes"

interface IDappIcon {
  host: string
  useDappDisplayAttributesImpl?: typeof useDappDisplayAttributes
}

interface IContainer {
  iconUrl?: string
}

const Container = styled.div<IContainer>`
  width: 100%;
  height: 100%;
  border-radius: 500px;
  background-color: ${({ iconUrl }) =>
    iconUrl ? "white" : "rgba(255, 255, 255, 0.15)"};
  background-size: cover;
  background-image: ${({ iconUrl }) => (iconUrl ? `url(${iconUrl})` : "none")};
`

export const DappIcon: FC<IDappIcon> = ({
  host,
  useDappDisplayAttributesImpl = useDappDisplayAttributes,
  ...rest
}) => {
  const dappDisplayAttributes = useDappDisplayAttributesImpl(host)
  return <Container iconUrl={dappDisplayAttributes?.iconUrl} {...rest} />
}
