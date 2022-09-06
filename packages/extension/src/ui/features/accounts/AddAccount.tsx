import { FC, useState } from "react"
import { useNavigate } from "react-router-dom"
import A from "tracking-link"

import { useAppState } from "../../app.state"
import { IconBar } from "../../components/IconBar"
import { ArgentXIcon } from "../../components/Icons/ArgentXIcon"
import { LedgerIcon } from "../../components/Icons/LedgerIcon"
import { Option, OptionsWrapper } from "../../components/Options"
import { PageWrapper, Title } from "../../components/Page"
import { connectAccount } from "../../services/backgroundAccounts"
import { FormError } from "../../theme/Typography"
import { recover } from "../recovery/recovery.service"
import { deployAccount } from "./accounts.service"

export const AddAccount: FC = () => {
  const switcherNetworkId = useAppState((x) => x.switcherNetworkId)
  const navigate = useNavigate()
  const [hasError, setHasError] = useState(false)
  return (
    <>
      <IconBar close />
      <PageWrapper>
        <Title>Add a new account</Title>
        <OptionsWrapper>
          <Option
            title="Create new ArgentX account"
            icon={<ArgentXIcon />}
            description="Generate a new wallet address"
            hideArrow
            onClick={async () => {
              try {
                useAppState.setState({ isLoading: true })
                const newAccount = await deployAccount(switcherNetworkId)
                connectAccount(newAccount)
                navigate(await recover())
              } catch (e) {
                console.error(e)
                setHasError(true)
              } finally {
                useAppState.setState({ isLoading: false })
              }
            }}
          />
          <A
            href="/index.html?goto=ledger"
            targetBlank
            onClick={async () => {
              // somehow this just works if this function is provided
            }}
          >
            <Option
              title="Connect Ledger"
              description="Use a Ledger hardware wallet"
              icon={<LedgerIcon />}
              hideArrow
            />
          </A>
        </OptionsWrapper>
        {hasError && (
          <FormError>
            There was an error creating your account. Please try again.
          </FormError>
        )}
      </PageWrapper>
    </>
  )
}
