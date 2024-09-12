import { TabBarHeight } from "@argent/x-ui"
import { CheckIcon, ChevronDownIcon } from "@chakra-ui/icons"
import {
  Button,
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from "@chakra-ui/react"
import { useAtom } from "jotai"
import { DevTools, useAtomsDebugValue } from "jotai-devtools"
import { atomWithStorage } from "jotai/utils"
import { FC } from "react"

import {
  useHardReload,
  useResetCache,
  useSoftReload,
} from "../../services/resetAndReload"
import { useDevStorageUI } from "./useDevStorageUI"

import "jotai-devtools/styles.css"

const atomsDevToolsEnabledAtom = atomWithStorage("atomsDevToolsEnabled", false)

const atomsDebugValueEnabledAtom = atomWithStorage(
  "atomsDebugValueEnabled",
  false,
)

function UseAtomsDebugValue() {
  useAtomsDebugValue()
  return null
}

export const DevUI: FC = () => {
  const resetCache = useResetCache()
  const softReload = useSoftReload()
  const hardReload = useHardReload()
  const {
    incrementStorage1Mb,
    setStorage4Mb,
    pruneStorage,
    prettyStorageUsed,
    updateStorageUsed,
  } = useDevStorageUI()

  const [atomsDevToolsEnabled, setAtomsDevToolsEnabled] = useAtom(
    atomsDevToolsEnabledAtom,
  )
  const [atomsDebugValueEnabled, setAtomsDebugValueEnabled] = useAtom(
    atomsDebugValueEnabledAtom,
  )

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
          <MenuButton as={Button} size="2xs" rightIcon={<ChevronDownIcon />}>
            Reload
          </MenuButton>
          <MenuList>
            <MenuItem onClick={softReload}>Reload UI</MenuItem>
            <MenuItem onClick={hardReload}>Reload HTML</MenuItem>
          </MenuList>
        </Menu>
        <Menu size={"2xs"} closeOnSelect={false}>
          <MenuButton as={Button} size="2xs" rightIcon={<ChevronDownIcon />}>
            Storage
          </MenuButton>
          <MenuList>
            <MenuItem onClick={updateStorageUsed}>{prettyStorageUsed}</MenuItem>
            <MenuItem onClick={resetCache}>Reset cache</MenuItem>
            <MenuItem onClick={pruneStorage}>Prune</MenuItem>
            <MenuItem onClick={incrementStorage1Mb}>A: Increment 1Mb</MenuItem>
            <MenuItem onClick={setStorage4Mb}>B: Set 4Mb</MenuItem>
          </MenuList>
        </Menu>
        <Menu size={"2xs"}>
          <MenuButton as={Button} size="2xs" rightIcon={<ChevronDownIcon />}>
            Atoms
          </MenuButton>
          <MenuList>
            <MenuItem
              icon={atomsDevToolsEnabled ? <CheckIcon /> : undefined}
              onClick={() => setAtomsDevToolsEnabled(!atomsDevToolsEnabled)}
            >
              Atoms Dev Tools
            </MenuItem>
            <MenuItem
              icon={atomsDebugValueEnabled ? <CheckIcon /> : undefined}
              onClick={() => setAtomsDebugValueEnabled(!atomsDebugValueEnabled)}
            >
              Debug Atom Values (slow)
            </MenuItem>
          </MenuList>
        </Menu>
      </Flex>
    </>
  )
}
