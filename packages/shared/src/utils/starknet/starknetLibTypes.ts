// Taken from starknet.js to convert to schemas
type Builtins = string[]
type ContractEntryPointFields = {
  selector: string
  offset: string
  builtins?: Builtins
}
type EntryPointsByType = {
  CONSTRUCTOR: ContractEntryPointFields[]
  EXTERNAL: ContractEntryPointFields[]
  L1_HANDLER: ContractEntryPointFields[]
}
type CompressedProgram = string
type AbiEntry = {
  name: string
  type: "felt" | "felt*" | string
}
export enum FunctionAbiType {
  "function" = 0,
  "l1_handler" = 1,
  "constructor" = 2,
}
type FunctionAbi = {
  inputs: AbiEntry[]
  name: string
  outputs: AbiEntry[]
  stateMutability?: "view"
  state_mutability?: string
  type: FunctionAbiType
}
type EventEntry = {
  name: string
  type: "felt" | "felt*" | string
  kind: "key" | "data"
}
type LegacyEvent = {
  name: string
  type: "event"
  data: EventEntry[]
  keys: EventEntry[]
}
type Cairo1Event = {
  name: string
  members: EventEntry[]
  kind: "struct"
  type: "event"
}
type StructAbi = {
  members: (AbiEntry & {
    offset: number
  })[]
  name: string
  size: number
  type: "struct"
}
type EventAbi = Cairo1Event | LegacyEvent
type Abi = Array<FunctionAbi | EventAbi | StructAbi | any>

type LegacyContractClass = {
  program: CompressedProgram
  entry_points_by_type: EntryPointsByType
  abi: Abi
}
interface Program extends Record<string, any> {
  builtins: string[]
  data: string[]
}
type LegacyCompiledContract = Omit<LegacyContractClass, "program"> & {
  program: Program
}
type ByteCode = string[]
type SierraProgramDebugInfo = {
  type_names: [number, string][]
  libfunc_names: [number, string][]
  user_func_names: [number, string][]
}
type SierraContractEntryPointFields = {
  selector: string
  function_idx: number
}
type SierraEntryPointsByType = {
  CONSTRUCTOR: SierraContractEntryPointFields[]
  EXTERNAL: SierraContractEntryPointFields[]
  L1_HANDLER: SierraContractEntryPointFields[]
}
type CompiledSierra = {
  sierra_program: ByteCode
  sierra_program_debug_info?: SierraProgramDebugInfo
  contract_class_version: string
  entry_points_by_type: SierraEntryPointsByType
  abi: Abi
}
type PythonicHints = [number, string[]][]
type CairoAssembly = {
  prime: string
  compiler_version: string
  bytecode: ByteCode
  hints: any[]
  pythonic_hints: PythonicHints
  entry_points_by_type: EntryPointsByType
}
type CompiledSierraCasm = CairoAssembly
type CompiledContract = LegacyCompiledContract | CompiledSierra
export type DeclareContractPayload = {
  contract: CompiledContract | string
  classHash?: string
  casm?: CompiledSierraCasm
  compiledClassHash?: string
}
