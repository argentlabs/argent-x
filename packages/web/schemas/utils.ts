import { FieldValues, FormState } from "react-hook-form"

export const isSubmitDisabled = ({
  isSubmitting,
  isDirty,
  submitCount,
}: Pick<
  FormState<FieldValues>,
  "isSubmitting" | "isDirty" | "submitCount"
>): boolean => {
  return isSubmitting || (!isDirty && submitCount !== 0)
}
