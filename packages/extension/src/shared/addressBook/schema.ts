import * as yup from "yup"

import { AddressBookAccount } from "./type"

export const addressBookAccountSchema: yup.Schema<AddressBookAccount> = yup
  .object()
  .required("Account is required")
  .shape({
    name: yup.string().required("Account Name is required"),
    networkId: yup.string().required("Account Network is required"),
    address: yup.string().required("Account Address is required"),
  })
