import { BarBackButton, NavigationContainer } from "@argent/ui"
import { Radio } from "@mui/material"
import { FC, Fragment } from "react"
import styled from "styled-components"

import { settingsStore } from "../../../shared/settings"
import {
  BlockExplorerKey,
  defaultBlockExplorerKey,
  defaultBlockExplorers,
} from "../../../shared/settings/defaultBlockExplorers"
import { useKeyValueStorage } from "../../../shared/storage/hooks"
import { SettingsItem, SettingsScreenWrapper, Title } from "./SettingsScreen"

const Default = styled.div`
  color: ${({ theme }) => theme.text2};
  font-size: 12px;
  font-weight: 400;
`

const StyledRadio = styled(Radio)`
  .MuiSvgIcon-root {
    color: ${({ theme }) => theme.white};
    font-size: 28px;
  }
`

export const BlockExplorerSettingsScreen: FC = () => {
  const blockExplorerKey = useKeyValueStorage(settingsStore, "blockExplorerKey")
  return (
    <NavigationContainer
      leftButton={<BarBackButton />}
      title={"Block explorer"}
    >
      <SettingsScreenWrapper>
        <hr />
        {Object.entries(defaultBlockExplorers).map(([key, blockExplorer]) => {
          const { title } = blockExplorer
          const checked = blockExplorerKey === key
          const isDefault = defaultBlockExplorerKey === key
          return (
            <Fragment key={key}>
              <SettingsItem>
                <Title>
                  <span>
                    {title}
                    {isDefault && <Default>Default</Default>}
                  </span>
                  <StyledRadio
                    checked={checked}
                    onClick={() =>
                      settingsStore.set(
                        "blockExplorerKey",
                        key as BlockExplorerKey,
                      )
                    }
                    inputProps={{ "aria-label": title }}
                  />
                </Title>
              </SettingsItem>
              <hr />
            </Fragment>
          )
        })}
      </SettingsScreenWrapper>
    </NavigationContainer>
  )
}
