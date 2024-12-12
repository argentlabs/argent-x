import type {
  DeclareSignerDetails,
  DeployAccountSignerDetails,
  InvocationsDetails,
  InvocationsSignerDetails,
} from "starknet"

type BuilderOmitionKeys = "maxFee" | "resourceBounds" | "version"
type BuilderOmit<T> = Omit<T, BuilderOmitionKeys>

export type DeployAccountSignerBuilderPayload =
  BuilderOmit<DeployAccountSignerDetails>
export type DeclareSignerBuilderPayload = BuilderOmit<DeclareSignerDetails>
export type InvocationsSignerBuilderPayload = BuilderOmit<
  InvocationsSignerDetails & Required<InvocationsDetails>
>
