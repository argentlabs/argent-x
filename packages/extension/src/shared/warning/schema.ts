import { z } from "zod"

export const severitySchema = z.union([
  z.literal("critical"),
  z.literal("high"),
  z.literal("caution"),
  z.literal("info"),
])
export const reasonsSchema = z.union([
  z.literal("account_upgrade_to_unknown_implementation"),
  z.literal("account_state_change"),
  z.literal("contract_is_black_listed"),
  z.literal("amount_mismatch_too_low"),
  z.literal("amount_mismatch_too_high"),
  z.literal("dst_token_black_listed"),
  z.literal("internal_service_issue"),
  z.literal("recipient_is_not_current_account"),
  z.literal("recipient_is_token_address"),
  z.literal("recipient_is_black_listed"),
  z.literal("spender_is_black_listed"),
  z.literal("operator_is_black_listed"),
  z.literal("src_token_black_listed"),
  z.literal("unknown_token"),
  z.literal("undeployed_account"),
  z.literal("contract_is_not_verified"),
  z.literal("token_a_black_listed"),
  z.literal("token_b_black_listed"),
  z.literal("approval_too_high"),
  z.literal("domain_is_black_listed"),
  z.literal("similar_to_existing_dapp_url"),
])
export type Reason = z.infer<typeof reasonsSchema>
export type Severity = z.infer<typeof severitySchema>
