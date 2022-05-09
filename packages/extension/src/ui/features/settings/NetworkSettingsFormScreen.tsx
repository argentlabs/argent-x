import { Collapse } from "@mui/material"
import { FC, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { Network, NetworkSchema } from "../../../shared/networks"
import { BackButton } from "../../components/BackButton"
import { Header } from "../../components/Header"
import { IconButton } from "../../components/IconButton"
import { ArrowBackIosNewIcon } from "../../components/Icons/MuiIcons"
import { ControlledInputText } from "../../components/InputText"
import { A, FormError, P } from "../../components/Typography"
import { ConfirmScreen } from "../../screens/ConfirmScreen"
import { useAppState } from "../../states/app"
import { makeClickable } from "../../utils/a11y"
import { addNetworks } from "../../utils/messaging"
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
  const defaultNetwork = useMemo<Network>(() => {
    if (props.mode === "add") {
      return {
        id: "",
        name: "",
        chainId: "",
        baseUrl: "",
      }
    }
    return props.network
  }, [props])

  const yupSchemaValidator = useYupValidationResolver<Network>(NetworkSchema)
  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<Network>({
    defaultValues: defaultNetwork,
    resolver: yupSchemaValidator,
  })
  const [expanded, setExpanded] = useState(false)
  const navigate = useNavigate()

  return (
    <>
      <Header>
        <BackButton />
      </Header>
      <ConfirmScreen
        title={props.mode === "add" ? "Add Network" : "Edit Network"}
        singleButton
        confirmButtonText={props.mode === "add" ? "Create" : "Save"}
        smallTopPadding
        confirmButtonDisabled={defaultNetwork.readonly}
        onSubmit={handleSubmit(async (network) => {
          try {
            useAppState.setState({ isLoading: true })
            await addNetworks([network])
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
            placeholder="Network ID"
            name="id"
            type="text"
            disabled={defaultNetwork.readonly}
          />
          <ControlledInputText
            autoComplete="off"
            control={control}
            placeholder="Name"
            name="name"
            type="text"
            disabled={defaultNetwork.readonly}
          />
          <ControlledInputText
            autoComplete="off"
            control={control}
            placeholder="Chain ID"
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
          <ExtendableControl
            {...makeClickable(() => setExpanded((x) => !x), 99)}
          >
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
              placeholder="Account Implementation Address"
              name="accountImplementation"
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
