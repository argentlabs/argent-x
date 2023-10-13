import { Account } from "starknet"
import { Account as AccountV4__deprecated } from "starknet4-deprecated"

export function isAccountV5(account: any): account is Account {
  // simulateTransaction is a property of Account but not AccountV4
  return "simulateTransaction" in account
}

export function isAccountV4(account: any): account is AccountV4__deprecated {
  // simulateTransaction is a property of Account but not AccountV4
  return !("simulateTransaction" in account)
}
