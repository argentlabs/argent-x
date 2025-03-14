import { AuthorizedDappsScreen } from "@argent-x/extension/src/ui/features/settings/authorizedDapps/AuthorizedDappsScreen"

import { decorators } from "../../decorators/routerDecorators"

import backendSession from "./__fixtures__/backend-session.json"

export default {
  component: AuthorizedDappsScreen,
  decorators,
}

export const Default = {
  args: {
    networkId: "mainnet-alpha",
    isSignedIn: true,
    isSmartAccount: true,
    preAuthorizations: [
      {
        host: "https://app.starknet.id",
      },
      {
        host: "http://examples.com",
      },
      {
        host: "http://lorem-ipsum-dolor-sit-amet.com",
      },
    ],
    activeSessions: [
      backendSession,
      backendSession,
      backendSession,
      backendSession,
    ],
  },
}

export const SignedOut = {
  args: {
    ...Default.args,
    isSignedIn: false,
    activeSessions: [],
  },
}

export const NotSmartAccount = {
  args: {
    ...Default.args,
    isSmartAccount: false,
  },
}

export const NoConnectedDapps = {
  args: {
    ...Default.args,
    preAuthorizations: [],
  },
}

export const NoActiveSessions = {
  args: {
    ...Default.args,
    activeSessions: [],
  },
}

export const NoContent = {
  args: {
    ...Default.args,
    preAuthorizations: [],
    activeSessions: [],
  },
}

export const NoContentSignedOut = {
  args: {
    ...Default.args,
    isSignedIn: false,
    preAuthorizations: [],
    activeSessions: [],
  },
}
