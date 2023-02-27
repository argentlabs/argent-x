export type ShieldMessage =
  | { type: "SHIELD_VALIDATE_ACCOUNT" }
  | {
      type: "SHIELD_VALIDATE_ACCOUNT_RES"
    }
  | { type: "SHIELD_VALIDATE_ACCOUNT_REJ"; data: string }
  | { type: "SHIELD_ADD_ACCOUNT" }
  | {
      type: "SHIELD_ADD_ACCOUNT_RES"
      data: { guardianAddress: string }
    }
  | { type: "SHIELD_ADD_ACCOUNT_REJ"; data: string }
  | { type: "SHIELD_REQUEST_EMAIL"; data: string }
  | {
      type: "SHIELD_REQUEST_EMAIL_RES"
    }
  | { type: "SHIELD_REQUEST_EMAIL_REJ"; data: string }
  | { type: "SHIELD_CONFIRM_EMAIL"; data: string }
  | {
      type: "SHIELD_CONFIRM_EMAIL_RES"
    }
  | { type: "SHIELD_CONFIRM_EMAIL_REJ"; data: string }
  | { type: "SHIELD_IS_TOKEN_EXPIRED" }
  | {
      type: "SHIELD_IS_TOKEN_EXPIRED_RES"
      data: boolean
    }
