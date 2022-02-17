import { FC, FormEventHandler } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { BackButton } from "../components/BackButton"
import { Button } from "../components/Button"
import { Header } from "../components/Header"
import { InputText } from "../components/Input"
import { StickyArgentFooter } from "../components/StickyArgentFooter"
import { FormError, H2, P } from "../components/Typography"
import { routes } from "../routes"
import { useAccount } from "../states/account"
import { useAppState } from "../states/app"
import { deployWallet } from "../utils/wallets"

const NewWalletScreenWrapper = styled.div`
  padding: 48px 40px 24px;
  display: flex;
  flex-direction: column;

  ${InputText} {
    margin-top: 15px;
  }
  ${Button} {
    margin-top: 116px;
  }
`

interface BackupDownloadScreenProps {
  hideBackButton?: boolean
}

export const BackupDownloadScreen: FC<BackupDownloadScreenProps> = ({
  hideBackButton,
}) => {
  const navigate = useNavigate()

  const handleDownload: FormEventHandler = async (e) => {
    try {
    } catch {
      // pass
    }
  }

  return (
    <>
      <Header hide={hideBackButton}>
        <BackButton />
      </Header>

      <NewWalletScreenWrapper>
        <BackButton />
        <H2>New password</H2>
        <P>Enter a password to protect your wallet</P>
        <form onSubmit={handleDownload}>
          <Button type="submit">Create wallet</Button>
        </form>
        <StickyArgentFooter />
      </NewWalletScreenWrapper>
    </>
  )
}
