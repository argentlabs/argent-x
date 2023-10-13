export type ParameterField =
  | {
      name: string
      type: `felt` | `Uint256`
      value: string
    }
  | {
      name: string
      type: `felt*`
      value: string[]
    }

export interface FieldValues {
  account: string
  classHash: string
  network: string
  parameters: ParameterField[]
  salt: string
  unique: boolean
}
