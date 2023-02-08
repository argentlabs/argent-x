export type ShieldMessage =
  | { type: "SHIELD_VALIDATE_ACCOUNT" }
  | {
      type: "SHIELD_VALIDATE_ACCOUNT_RES"
      data: { guardianAddress: string }
    }
  | { type: "SHIELD_VALIDATE_ACCOUNT_REJ"; data: string }
