export interface HideOrDeleteAccountConfirmScreenContainerProps {
  mode: "hide" | "delete"
}

export interface HideOrDeleteAccountConfirmScreenProps
  extends HideOrDeleteAccountConfirmScreenContainerProps {
  accountName: string
  accountAddress: string
  onSubmit: () => void
  onReject: () => void
  networkId: string
}
