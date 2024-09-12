import { BarBackButton, NavigationContainer } from "@argent/x-ui"
import { Collapse } from "@mui/material"
import { FC } from "react"
import { Control, FieldErrors } from "react-hook-form"
import styled from "styled-components"

import { Network } from "../../../../../shared/network"
import { IconButton } from "../../../../components/IconButton"
import { ArrowBackIosNewIcon } from "../../../../components/Icons/MuiIcons"
import { ControlledInputText } from "../../../../components/InputText"
import { makeClickable } from "../../../../services/a11y"
import { A, FormError, P } from "../../../../theme/Typography"
import { ConfirmScreen } from "../../../actions/transaction/ApproveTransactionScreen/ConfirmScreen"

const ExtendableControl = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-top: 8px;
`

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

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
        <Wrapper>
          <P>Here you can add your own custom network to Argent X.</P>
          <ControlledInputText
            autoFocus
            autoComplete="off"
            control={control}
            placeholder="Network name"
            name="name"
            type="text"
            disabled={defaultNetwork.readonly}
          />
          <ControlledInputText
            autoComplete="off"
            control={control}
            placeholder="Internal ID"
            name="id"
            type="text"
            disabled
          />
          <ControlledInputText
            autoComplete="off"
            control={control}
            placeholder="Chain ID (e.g. SN_SEPOLIA)"
            defaultValue="SN_SEPOLIA"
            name="chainId"
            type="text"
            disabled={defaultNetwork.readonly}
          />
          <ControlledInputText
            autoComplete="off"
            control={control}
            placeholder="RPC URL"
            name="rpcUrl"
            type="url"
            disabled={defaultNetwork.readonly}
          />
          <ControlledInputText
            autoComplete="off"
            control={control}
            placeholder="Sequencer URL"
            name="sequencerUrl"
            type="url"
            disabled={defaultNetwork.readonly}
          />
          {/* collapseable area with some extra inputs */}
          <ExtendableControl {...makeClickable(() => setExpanded((x) => !x))}>
            <IconButton size={18}>
              <ArrowBackIosNewIcon
                style={{
                  transition: "transform 0.2s ease-in-out",
                  transform: expanded ? "rotate(-90deg)" : "rotate(-180deg)",
                  height: 12,
                  width: 12,
                }}
              />
            </IconButton>
            <A>Advanced settings</A>
          </ExtendableControl>
          <Collapse in={expanded} timeout="auto">
            <ControlledInputText
              autoComplete="off"
              control={control}
              placeholder="Account class hash"
              name="accountClassHash.standard"
              type="text"
              disabled={defaultNetwork.readonly}
            />
            <ControlledInputText
              autoComplete="off"
              control={control}
              placeholder="Fee Token Address"
              name="possibleFeeTokenAddresses[0]"
              type="text"
              disabled={defaultNetwork.readonly}
            />
            <ControlledInputText
              autoComplete="off"
              control={control}
              placeholder="Multicall Address"
              name="multicallAddress"
              type="text"
              disabled={defaultNetwork.readonly}
            />
            <Wrapper>
              {/** TODO: Add back when we are not using backend explorer api anymore */}
              {/* <ControlledInputText
                autoComplete="off"
                control={control}
                placeholder="Explorer API URL"
                name="explorerUrl"
                type="url"
                disabled={defaultNetwork.readonly}
              /> */}
              <ControlledInputText
                autoComplete="off"
                control={control}
                placeholder="Block explorer URL"
                name="blockExplorerUrl"
                type="url"
                disabled={defaultNetwork.readonly}
              />
              <ControlledInputText
                autoComplete="off"
                control={control}
                placeholder="Account implementation address"
                name="accountImplementation"
                type="text"
                disabled={defaultNetwork.readonly}
              />
              <ControlledInputText
                autoComplete="off"
                control={control}
                placeholder="Plugin account class hash"
                name="accountClassHash.plugin"
                type="text"
                disabled={defaultNetwork.readonly}
              />
            </Wrapper>
          </Collapse>

          {Object.keys(errors).length > 0 && (
            <FormError>
              {Object.values(errors)
                .map((x) => x.message)
                .join(". ")}
            </FormError>
          )}
        </Wrapper>
      </ConfirmScreen>
    </NavigationContainer>
  )
}
