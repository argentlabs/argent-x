import { Schema, boolean, object, string } from "yup"

import { Network } from "./type"

const REGEX_HEXSTRING = /^0x[a-f0-9]+$/i
const REGEX_URL_WITH_LOCAL =
  /^(https?:\/\/)(?:\S+(?::\S*)?@)?(?:(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/

export const networkSchema: Schema<Network> = object()
  .required()
  .shape({
    id: string().required().min(2).max(31),
    name: string().required().min(2).max(128),
    chainId: string()
      .required()
      .min(2)
      .max(31) // max 31 characters as required by starknet short strings
      .matches(/^[a-zA-Z0-9_]+$/, {
        message:
          "${path} must be hexadecimal string, uppercase alphanumeric or underscore, like 'SN_GOERLI'",
      }),
    baseUrl: string()
      .required()
      .matches(REGEX_URL_WITH_LOCAL, "${path} must be a valid URL"),
    accountImplementation: string().optional().matches(REGEX_HEXSTRING),
    accountClassHash: object({
      standard: string()
        .label("Account class hash")
        .required()
        .matches(REGEX_HEXSTRING),
      plugin: string()
        .label("Plugin account class hash")
        .optional()
        .matches(REGEX_HEXSTRING),
    }).default(
      undefined,
    ) /** default(undefined) for an optional object with required children {@see https://github.com/jquense/yup/issues/772#issuecomment-743270211} */,
    explorerUrl: string()
      .optional()
      .matches(REGEX_URL_WITH_LOCAL, "${path} must be a valid URL"),
    blockExplorerUrl: string()
      .optional()
      .matches(REGEX_URL_WITH_LOCAL, "${path} must be a valid URL"),
    rpcUrl: string()
      .optional()
      .matches(REGEX_URL_WITH_LOCAL, "${path} must be a valid URL"),
    multicallAddress: string().optional().matches(REGEX_HEXSTRING),
    readonly: boolean().optional(),
  })
