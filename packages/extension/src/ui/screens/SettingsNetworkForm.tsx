import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew"
import { Collapse } from "@mui/material"
import { FC, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import styled from "styled-components"

import { CustomNetwork, CustomNetworkSchema } from "../../shared/customNetworks"
import { BackButton } from "../components/BackButton"
import { Header } from "../components/Header"
import { IconButton } from "../components/IconButton"
import { ControlledInputText } from "../components/InputText"
import { A, FormError, P } from "../components/Typography"
import { useAppState } from "../states/app"
import { makeClickable } from "../utils/a11y"
import { addCustomNetworks } from "../utils/messaging"
import { useYupValidationResolver } from "../utils/useYupValidationResolver"
import { ConfirmScreen } from "./ConfirmScreen"

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

type SettingsNetworkFormProps =
  | {
      mode: "add"
    }
  | {
      mode: "edit"
      network: CustomNetwork
    }

export const SettingsNetworkFormScreen: FC<SettingsNetworkFormProps> = (
  props,
) => {
  const defaultNetwork = useMemo<CustomNetwork>(() => {
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

  const yupSchemaValidator =
    useYupValidationResolver<CustomNetwork>(CustomNetworkSchema)
  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<CustomNetwork>({
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
        onSubmit={handleSubmit(async (network) => {
          try {
            useAppState.setState({ isLoading: true })
            await addCustomNetworks([network])
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
          />
          <ControlledInputText
            autoComplete="off"
            control={control}
            placeholder="Name"
            name="name"
            type="text"
          />
          <ControlledInputText
            autoComplete="off"
            control={control}
            placeholder="Chain ID"
            name="chainId"
            type="text"
          />
          <ControlledInputText
            autoComplete="off"
            control={control}
            placeholder="Base URL"
            name="baseUrl"
            type="url"
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
            />
            <ControlledInputText
              autoComplete="off"
              control={control}
              placeholder="Account Implementation Address"
              name="accountImplementation"
              type="text"
            />
            <ControlledInputText
              autoComplete="off"
              control={control}
              placeholder="RPC URL"
              name="rpcUrl"
              type="url"
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
