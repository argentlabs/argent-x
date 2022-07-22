import * as yup from "yup"

import { AddressBookContact } from "./type"

export const addressBookContactSchema: yup.Schema<AddressBookContact> = yup
  .object()
  .required("Contact is required")
  .shape({
    id: yup.string().required(),
    name: yup.string().required("Contact Name is required"),
    networkId: yup.string().required("Contact Network is required"),
    address: yup.string().required("Contact Address is required"),
  })
