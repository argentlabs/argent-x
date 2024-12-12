import { TabBarHeight, icons } from "@argent/x-ui"
import {
  Button,
  Flex,
  Menu,
  MenuButton,
  MenuGroup,
  MenuItem,
  MenuList,
} from "@chakra-ui/react"
import { DevTools, useAtomsDebugValue } from "jotai-devtools"
import type { FC } from "react"

import { devStore } from "../../../shared/dev/store"
import { useGetSetKeyValueStorage } from "../../hooks/useStorage"
import { useHardReload, useSoftReload } from "../../services/resetAndReload"
import { useOpenExtensionInTab } from "../browser/tabs"

import "jotai-devtools/styles.css"

const {
  DropdownDownIcon,
  SettingsSecondaryIcon,
  RefreshPrimaryIcon,
  CheckmarkSecondaryIcon,
} = icons

function UseAtomsDebugValue() {
  useAtomsDebugValue()
  return null
}

const UncheckedIcon = () => <>{"\u2003"}</>

export const DevUI: FC = () => {
  const softReload = useSoftReload()
  const hardReload = useHardReload()
  const openExtensionInTab = useOpenExtensionInTab()

  const [openInExtendedView, setOpenInExtendedView] = useGetSetKeyValueStorage(
    devStore,
    "openInExtendedView",
  )

  const [atomsDevToolsEnabled, setAtomsDevToolsEnabled] =
    useGetSetKeyValueStorage(devStore, "atomsDevToolsEnabled")
  const [atomsDebugValueEnabled, setAtomsDebugValueEnabled] =
    useGetSetKeyValueStorage(devStore, "atomsDebugValueEnabled")

  return (
    <>
      {atomsDevToolsEnabled && <DevTools />}
      {atomsDebugValueEnabled && <UseAtomsDebugValue />}
      <Flex
        gap={2}
        m={2}
        position={"fixed"}
        justifyContent={"center"}
        bottom={TabBarHeight + 1}
        left={0}
        right={0}
        zIndex={123}
        pointerEvents={"none"}
        sx={{
          ">*": {
            pointerEvents: "auto",
          },
        }}
      >
        <Menu size={"2xs"}>
          <MenuButton
            as={Button}
            size="2xs"
            leftIcon={<SettingsSecondaryIcon />}
            rightIcon={<DropdownDownIcon />}
          >
            Dev
          </MenuButton>
          <MenuList>
            <MenuGroup title="Development">
              <MenuItem
                icon={
                  openInExtendedView ? (
                    <CheckmarkSecondaryIcon />
                  ) : (
                    <UncheckedIcon />
                  )
                }
                onClick={() => {
                  setOpenInExtendedView(!openInExtendedView)
                  if (!openInExtendedView) {
                    void openExtensionInTab()
                  }
                }}
              >
                Open in Extended View
              </MenuItem>
            </MenuGroup>
            <MenuGroup title="Jotai">
              <MenuItem
                icon={
                  atomsDevToolsEnabled ? (
                    <CheckmarkSecondaryIcon />
                  ) : (
                    <UncheckedIcon />
                  )
                }
                onClick={() => setAtomsDevToolsEnabled(!atomsDevToolsEnabled)}
              >
                Atoms Dev Tools
              </MenuItem>
              <MenuItem
                icon={
                  atomsDebugValueEnabled ? (
                    <CheckmarkSecondaryIcon />
                  ) : (
                    <UncheckedIcon />
                  )
                }
                onClick={() =>
                  setAtomsDebugValueEnabled(!atomsDebugValueEnabled)
                }
              >
                Debug Atom Values (slow)
              </MenuItem>
            </MenuGroup>
          </MenuList>
        </Menu>
        <Menu size={"2xs"}>
          <MenuButton
            as={Button}
            size="2xs"
            leftIcon={<RefreshPrimaryIcon />}
            rightIcon={<DropdownDownIcon />}
          >
            Reload
          </MenuButton>
          <MenuList>
            <MenuItem onClick={hardReload}>Reload HTML</MenuItem>
            <MenuItem onClick={softReload}>Reload React UI</MenuItem>
          </MenuList>
        </Menu>
      </Flex>
    </>
  )
}
