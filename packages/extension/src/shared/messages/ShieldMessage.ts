export type ShieldMessage =
  | { type: "SHIELD_MAYBE_ADD_ACCOUNT" }
  | {
      type: "SHIELD_MAYBE_ADD_ACCOUNT_RES"
      data: { guardianAddress: string }
    }
  | { type: "SHIELD_MAYBE_ADD_ACCOUNT_REJ"; data: string }
