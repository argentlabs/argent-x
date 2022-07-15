import { Collapse } from "@mui/material"
import { FC, useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { Network, addNetwork, networkSchema } from "../../../shared/network"
import { useAppState } from "../../app.state"
import { IconBar } from "../../components/IconBar"
import { IconButton } from "../../components/IconButton"
import { ArrowBackIosNewIcon } from "../../components/Icons/MuiIcons"
import { ControlledInputText } from "../../components/InputText"
import { makeClickable } from "../../services/a11y"
import { A, FormError, P } from "../../theme/Typography"
import { ConfirmScreen } from "../actions/ConfirmScreen"
import { slugify } from "./slugify"
import { useYupValidationResolver } from "./useYupValidationResolver"

const ExtendableControl = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
`

const Wrapper = styled.div`
  margin-top: -8px;
  display: flex;
  flex-direction: column;
  > * + * {
    margin-top: 8px;
  }
  > ${ExtendableControl} + * {
    margin-top: 0;
  }
`

type NetworkSettingsFormScreenProps =
  | {
      mode: "add"
    }
  | {
      mode: "edit"
      network: Network
    }

export const NetworkSettingsFormScreen: FC<NetworkSettingsFormScreenProps> = (
  props,
) => {
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState(false)
  const defaultNetwork = useMemo<Network>(() => {
    if (props.mode === "add") {
      return { id: "", name: "", chainId: "", baseUrl: "" }
    }
    return props.network
    // due to an or type we need to check different values depending on the mode
  }, [props.mode === "add" || props.network]) // eslint-disable-line react-hooks/exhaustive-deps

  const yupSchemaValidator = useYupValidationResolver(networkSchema)
  const {
    handleSubmit,
    formState: { errors },
    control,
    watch,
    setValue,
  } = useForm<Network>({
    defaultValues: defaultNetwork,
    resolver: yupSchemaValidator,
  })

  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      if (type === "change" && name === "name") {
        setValue("id", slugify(value.name || ""))
      }
    })
    return subscription.unsubscribe
    // on mount
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <IconBar back />
      <ConfirmScreen
        title={props.mode === "add" ? "Add network" : "Edit network"}
        singleButton
        confirmButtonText={props.mode === "add" ? "Create" : "Save"}
        smallTopPadding
        confirmButtonDisabled={defaultNetwork.readonly}
        onSubmit={handleSubmit(async (network) => {
          try {
            useAppState.setState({ isLoading: true })
            await addNetwork(network)
            navigate(-1)
          } finally {
            useAppState.setState({ isLoading: false })
          }
        })}
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
            placeholder="Chain ID (e.g. SN_GOERLI)"
            defaultValue="SN_GOERLI"
            name="chainId"
            type="text"
            disabled={defaultNetwork.readonly}
          />
          <ControlledInputText
            autoComplete="off"
            control={control}
            placeholder="Base URL"
            name="baseUrl"
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
              placeholder="Explorer URL"
              name="explorerUrl"
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
              placeholder="Account class hash"
              name="accountClassHash"
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
              placeholder="Multicall Address"
              name="multicallAddress"
              type="text"
              disabled={defaultNetwork.readonly}
            />
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
    </>
  )
}
