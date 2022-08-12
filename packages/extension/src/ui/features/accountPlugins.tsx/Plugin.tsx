import { FC, useCallback } from "react"
import styled from "styled-components"

import { ButtonOutline } from "../../components/Button"
import Column from "../../components/Column"
import { CheckIcon } from "../../components/Icons/CheckIcon"
import { AddRoundedIcon } from "../../components/Icons/MuiIcons"
import Row, { RowBetween } from "../../components/Row"
import { Spinner } from "../../components/Spinner"
import { H5 } from "../../theme/Typography"
import { useAccount } from "../accounts/accounts.state"
import { useCurrentNetwork } from "../networks/useNetworks"
import { PluginAccount } from "./PluginAccount"
import { IPlugin } from "./Plugins"
import { useIsPlugin } from "./useIsPlugin"

const Container = styled(Row)`
  padding: 16px 20px 16px 16px;
  gap: 12px;

  background-color: ${({ theme }) => theme.bg2};
  align-items: flex-start;
  border-radius: 4px;
`

const CaptionText = styled.p`
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;

  color: ${({ theme }) => theme.text2};
  padding-right: 5px;
`

const AddButton = styled(ButtonOutline)<{ filled?: boolean }>`
  background-color: ${({ filled, theme }) => filled && theme.white};
  padding: 6px;
  width: auto;
  line-height: 100%;

  svg {
    fill: ${({ theme, filled }) => filled && theme.bg2};
  }

  &:hover {
    background-color: ${({ theme }) => theme.white};

    svg {
      fill: ${({ theme }) => theme.bg2};
    }
  }
`

export const Plugin: FC<IPlugin & { accountAddress: string }> = ({
  classHash,
  title,
  description,
  icon,
  accountAddress,
}) => {
  const networkId = useCurrentNetwork().id
  const account = useAccount({ address: accountAddress, networkId })

  const pluginAccount = PluginAccount.accountToPluginAccount(account)

  const {
    data: isPlugin,
    error: isPluginError,
    isValidating: isPluginLoading,
  } = useIsPlugin(classHash, pluginAccount)
  console.log("🚀 ~ file: Plugin.tsx ~ line 59 ~ isPlugin", isPlugin)

  if (isPluginError) {
    throw new Error("Unable to fetch plugin data")
  }

  const handleAddRemovePlugin = useCallback(async () => {
    if (isPlugin) {
      return await pluginAccount.removePlugin(classHash)
    }
    return await pluginAccount.addPlugin(classHash)
  }, [classHash, isPlugin, pluginAccount])

  return (
    <Container>
      {icon}
      <RowBetween>
        <Column gap="2px">
          <H5>{title}</H5>
          <CaptionText>{description}</CaptionText>
        </Column>

        <AddButton
          disabled={isPluginLoading}
          filled={isPlugin && !isPluginLoading}
          onClick={handleAddRemovePlugin}
        >
          {isPluginLoading ? (
            <Spinner size="20px" />
          ) : isPlugin ? (
            <CheckIcon />
          ) : (
            <AddRoundedIcon style={{ fontSize: "20px" }} />
          )}
        </AddButton>
      </RowBetween>
    </Container>
  )
}
