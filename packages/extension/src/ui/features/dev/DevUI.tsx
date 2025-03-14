import {
  DropdownDownIcon,
  SettingsSecondaryIcon,
  RefreshPrimaryIcon,
  CheckmarkSecondaryIcon,
} from "@argent/x-ui/icons"

import { TabBarHeight } from "@argent/x-ui"
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
import { useEffect } from "react"

import { devStore } from "../../../shared/dev/store"
import { useGetSetKeyValueStorage } from "../../hooks/useStorage"
import { useHardReload, useSoftReload } from "../../services/resetAndReload"
import { useOpenExtensionInTab } from "../browser/tabs"

import "jotai-devtools/styles.css"
import { setupLocationLogger } from "./locationLogger"
import i18n from "../../i18n"
import { I18N_ENABLED, availableLng } from "../../../shared/i18n/constants"

function UseAtomsDebugValue() {
  useAtomsDebugValue()
  return null
}

function UseLocationLogger() {
  useEffect(() => {
    const cleanup = setupLocationLogger()
    return () => {
      cleanup()
    }
  }, [])
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
  const [locationLoggerEnabled, setLocationLoggerEnabled] =
    useGetSetKeyValueStorage(devStore, "locationLoggerEnabled")

  return (
    <>
      {atomsDevToolsEnabled && <DevTools />}
      {atomsDebugValueEnabled && <UseAtomsDebugValue />}
      {locationLoggerEnabled && <UseLocationLogger />}
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
              <MenuItem
                icon={
                  locationLoggerEnabled ? (
                    <CheckmarkSecondaryIcon />
                  ) : (
                    <UncheckedIcon />
                  )
                }
                onClick={() => setLocationLoggerEnabled(!locationLoggerEnabled)}
              >
                Log URL changes
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
        {I18N_ENABLED && (
          <Menu size={"2xs"}>
            <MenuButton as={Button} size="2xs" rightIcon={<DropdownDownIcon />}>
              {i18n.language}
            </MenuButton>
            <MenuList>
              {availableLng.map((lng) => (
                <MenuItem
                  key={lng}
                  icon={
                    i18n.language === lng ? (
                      <CheckmarkSecondaryIcon />
                    ) : (
                      <UncheckedIcon />
                    )
                  }
                  onClick={() => {
                    void i18n.changeLanguage(lng)
                  }}
                >
                  {lng}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
        )}
      </Flex>
    </>
  )
}
