import { FC } from "react"
import { Link } from "react-router-dom"
import styled from "styled-components"

import { IconBar } from "../../components/IconBar"
import { Option, OptionsWrapper } from "../../components/Options"
import { PageWrapper } from "../../components/Page"
import { routes } from "../../routes"
import CardSvg from "./card.svg"
import EthereumSvg from "./ethereum.svg"
import StarkNetSvg from "./starknet.svg"

const Title = styled.h1`
  font-style: normal;
  font-weight: 500;
  font-size: 20px;
  line-height: 25px;
  text-align: center;
  margin: 0 0 36px 0;
`

export const FundingScreen: FC = () => (
  <>
    <IconBar close />
    <PageWrapper>
      <Title>How would you like to fund your account?</Title>
      <OptionsWrapper>
        <Option
          title="Buy with card or bank transfer"
          description="Coming soon"
          icon={<CardSvg />}
          disabled
          hideArrow
        />
        <Link to={routes.fundingQrCode()}>
          <Option
            title="From another StarkNet account"
            icon={<StarkNetSvg />}
          />
        </Link>
        <a href="https://stargate.io" target="_blank">
          <Option title="Bridge from Ethereum" icon={<EthereumSvg />} />
        </a>
      </OptionsWrapper>
    </PageWrapper>
  </>
)
