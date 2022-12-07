import { BarCloseButton, NavigationContainer } from "@argent/ui"
import { FC } from "react"
import { useParams } from "react-router-dom"
import styled from "styled-components"

import { AutoColumn } from "../../components/Column"
import { H2 } from "../../theme/Typography"
import { Plugin } from "./Plugin"
import { plugins } from "./Plugins"

const Container = styled.div`
  padding: 24px;
`

export const AddPluginScreen: FC = () => {
  const { accountAddress } = useParams<{ accountAddress: string }>()

  if (!accountAddress) {
    return <></>
  }

  return (
    <NavigationContainer rightButton={<BarCloseButton />}>
      <Container>
        <H2>Add a plugin</H2>
        <AutoColumn>
          {plugins.map(({ title, icon, classHash, description }) => (
            <Plugin
              key={classHash}
              accountAddress={accountAddress}
              title={title}
              classHash={classHash}
              icon={icon}
              description={description}
            />
          ))}
        </AutoColumn>
      </Container>
    </NavigationContainer>
  )
}
