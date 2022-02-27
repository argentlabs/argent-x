import { FC, useCallback, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { getWhitelist } from "../../background/whitelist"
import { sendMessage } from "../../shared/messages"
import { BackButton } from "../components/BackButton"
import { Button } from "../components/Button"
import { DappConnection } from "../components/DappConnection"
import { Header } from "../components/Header"
import { H2, P } from "../components/Typography"
import { removeFromWhitelist } from "../utils/messaging"

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 32px 24px 32px;

  ${P} {
    margin: 16px 0;
  }

  ${Button} {
    margin-top: 10px;
  }
`

export const SettingsDappConnectionsScreen: FC = () => {
  const navigate = useNavigate()
  const [dappsWhitelist, setDappsWhitelist] = useState<string[]>([])

  const getWhitelistDapps = useCallback(async () => {
    setDappsWhitelist(await getWhitelist())
  }, [])

  useEffect(() => {
    getWhitelistDapps()
  }, [])

  return (
    <>
      <Header>
        <BackButton />
      </Header>
      <Wrapper>
        <H2>Dapp connections</H2>
        {dappsWhitelist.length === 0 ? (
          <P>You haven&apos;t connected to any dapp yet.</P>
        ) : (
          <>
            {dappsWhitelist.map((dapp) => (
              <DappConnection
                key={dapp}
                host={dapp}
                onClick={async () => {
                  await removeFromWhitelist(dapp)
                  getWhitelistDapps()
                }}
              />
            ))}

            <P>Require all dapps to request a new connection to your wallet?</P>
            <Button
              onClick={() => {
                sendMessage({ type: "RESET_WHITELIST" })
                navigate(-1)
              }}
            >
              Reset all dapp connections
            </Button>
          </>
        )}
      </Wrapper>
    </>
  )
}
