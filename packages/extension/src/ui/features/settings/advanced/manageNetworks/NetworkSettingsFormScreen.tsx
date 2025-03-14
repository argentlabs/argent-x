import { ChevronRightSecondaryIcon } from "@argent/x-ui/icons"
import {
  BarBackButton,
  CellStack,
  FieldError,
  HeaderCell,
  NavigationContainer,
  SpacerCell,
} from "@argent/x-ui"
import { Button, Collapse } from "@chakra-ui/react"
import type { FC } from "react"
import type { Control, FieldErrors } from "react-hook-form"

import type { Network } from "../../../../../shared/network"
import { ConfirmScreen } from "../../../actions/transaction/ApproveTransactionScreen/ConfirmScreen"
import { ControlledInput } from "../../../../components/ControlledInput"

interface NetworkSettingsFormScreenProps {
  mode: "add" | "edit"
  defaultNetwork: Network
  control: Control<Network>
  expanded: boolean
  setExpanded: React.Dispatch<React.SetStateAction<boolean>>
  errors: FieldErrors<Network>
  onSubmit: ((e: React.FormEvent<HTMLFormElement>) => void) | undefined
}

export const NetworkSettingsFormScreen: FC<NetworkSettingsFormScreenProps> = ({
  mode,
  defaultNetwork,
  control,
  expanded,
  setExpanded,
  errors,
  onSubmit,
}) => {
  return (
    <NavigationContainer leftButton={<BarBackButton />} title={"Networks"}>
      <ConfirmScreen
        title={mode === "add" ? "Add network" : "Edit network"}
        singleButton
        confirmButtonText={mode === "add" ? "Create" : "Save"}
        confirmButtonDisabled={defaultNetwork.readonly}
        onSubmit={onSubmit}
      >
        <CellStack p={0}>
          <HeaderCell>
            Here you can add your own custom network to Argent X
          </HeaderCell>
          {/* <ControlledInputText
            autoFocus
            autoComplete="off"
            control={control}
            placeholder="Network name"
            name="name"
            type="text"
            disabled={defaultNetwork.readonly}
          /> */}
          <HeaderCell>Network name</HeaderCell>
          <ControlledInput
            autoFocus
            autoComplete="off"
            control={control}
            placeholder="My Network"
            name="name"
            type="text"
            isDisabled={defaultNetwork.readonly}
          />
          <HeaderCell>Internal ID</HeaderCell>
          <ControlledInput
            autoComplete="off"
            control={control}
            placeholder="my-network"
            name="id"
            type="text"
            isDisabled
          />
          <HeaderCell>Chain ID</HeaderCell>
          <ControlledInput
            autoComplete="off"
            control={control}
            placeholder="SN_SEPOLIA"
            defaultValue="SN_SEPOLIA"
            name="chainId"
            type="text"
            isDisabled={defaultNetwork.readonly}
          />
          <HeaderCell>RPC URL</HeaderCell>
          <ControlledInput
            autoComplete="off"
            control={control}
            placeholder="https://rpc.example.com"
            name="rpcUrl"
            type="url"
            isDisabled={defaultNetwork.readonly}
          />
          <HeaderCell>Sequencer URL</HeaderCell>
          <ControlledInput
            autoComplete="off"
            control={control}
            placeholder="https://sequencer.example.com"
            name="sequencerUrl"
            type="url"
            isDisabled={defaultNetwork.readonly}
          />
          <SpacerCell />
          <Button
            mr="auto"
            size="2xs"
            color="text-secondary"
            leftIcon={
              <ChevronRightSecondaryIcon
                transition="transform 0.2s ease-in-out"
                transform={expanded ? "rotate(90deg)" : "rotate(0)"}
                fontSize="2xs"
              />
            }
            onClick={() => setExpanded((x) => !x)}
          >
            Advanced settings
          </Button>
          <Collapse in={expanded}>
            <CellStack p={0}>
              <SpacerCell />
              <HeaderCell>Account class hash</HeaderCell>
              <ControlledInput
                autoComplete="off"
                control={control}
                placeholder="0x0123"
                name="accountClassHash.standard"
                type="text"
                isDisabled={defaultNetwork.readonly}
              />
              <HeaderCell>Fee Token Address</HeaderCell>
              <ControlledInput
                autoComplete="off"
                control={control}
                placeholder="0x0123"
                name="possibleFeeTokenAddresses[0]"
                type="text"
                isDisabled={defaultNetwork.readonly}
              />
              <HeaderCell>Multicall Address</HeaderCell>
              <ControlledInput
                autoComplete="off"
                control={control}
                placeholder="0x0123"
                name="multicallAddress"
                type="text"
                isDisabled={defaultNetwork.readonly}
              />
              <HeaderCell>Block explorer URL</HeaderCell>
              <ControlledInput
                autoComplete="off"
                control={control}
                placeholder="https://explorer.example.com"
                name="blockExplorerUrl"
                type="url"
                isDisabled={defaultNetwork.readonly}
              />
              <HeaderCell>Account implementation address</HeaderCell>
              <ControlledInput
                autoComplete="off"
                control={control}
                placeholder="0x123"
                name="accountImplementation"
                type="text"
                isDisabled={defaultNetwork.readonly}
              />
              <HeaderCell>Plugin account class hash</HeaderCell>
              <ControlledInput
                autoComplete="off"
                control={control}
                placeholder="0x123"
                name="accountClassHash.plugin"
                type="text"
                isDisabled={defaultNetwork.readonly}
              />
            </CellStack>
          </Collapse>

          {Object.keys(errors).length > 0 && (
            <HeaderCell>
              <FieldError>
                {Object.values(errors)
                  .map((x) => x.message)
                  .join(". ")}
              </FieldError>
            </HeaderCell>
          )}
        </CellStack>
      </ConfirmScreen>
    </NavigationContainer>
  )
}
