// FIXME: remove when depricated accounts do not longer work
import { FC } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { useAppState } from "../../app.state"
import { Button } from "../../components/Button"
import { OpenInNewIcon } from "../../components/Icons/MuiIcons"
import { routes } from "../../routes"
import { selectAccount } from "../../services/backgroundAccounts"
import { H2, P } from "../../theme/Typography"
import { createAccount } from "../accounts/accounts.service"
import { recover } from "../recovery/recovery.service"

const Container = styled.div`
  padding: 88px 40px 24px 40px;
  display: flex;
  flex-direction: column;
  flex: 1;
  ${P} {
    font-weight: 600;
    margin-top: 15px;
  }

  a {
    color: ${({ theme }) => theme.red3};
    text-decoration: none;
  }
`

const ButtonSpacer = styled.div`
  display: flex;
  flex: 1;
`

export const MigrationDisclaimerScreen: FC = () => {
  const navigate = useNavigate()
  const { switcherNetworkId } = useAppState()

  const handleAddAccount = async () => {
    useAppState.setState({ isLoading: true })
    try {
      const newAccount = await createAccount(switcherNetworkId)
      selectAccount(newAccount)
      navigate(await recover())
    } catch (error: any) {
      useAppState.setState({ error: `${error}` })
      navigate(routes.error())
    } finally {
      useAppState.setState({ isLoading: false })
    }
  }

  return (
    <Container>
      <H2>Please migrate your funds</H2>
      <P>
        StarkNet is in Alpha and its testnet has made breaking changes. Mainnet
        will follow soon.
      </P>
      <P>
        Please create a new account and send all your assets from your old
        account(s) to this new one. You may need to use a dapp to do this.
      </P>
      <P>
        Old accounts will not be recoverable with your backup or seed phrase.
      </P>
      <P>
        <a
          href="https://starkware.notion.site/Contracts-As-Classes-641060360aef4d048f7cb172afd57866"
          target="_blank"
          rel="noreferrer"
        >
          Read more about this change <OpenInNewIcon style={{ fontSize: 14 }} />
        </a>
      </P>
      <ButtonSpacer />
      <Button onClick={handleAddAccount}>Create new account</Button>
    </Container>
  )
}
