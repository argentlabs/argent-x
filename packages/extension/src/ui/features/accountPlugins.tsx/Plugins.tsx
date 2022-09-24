import { SESSION_PLUGIN_CLASS_HASH } from "@argent/x-sessions"

import { SessionPluginIcon } from "../../components/Icons/SessionPluginIcon"

export interface IPlugin {
  classHash: string
  title: string
  description?: string
  icon: React.ReactNode
}

export const plugins: IPlugin[] = [
  {
    classHash: SESSION_PLUGIN_CLASS_HASH,
    title: "User sessions",
    description:
      "In supported dapps, you will be able to allow the dapp to perform certain transactions on your behalf without needing further confirmation",
    icon: <SessionPluginIcon />,
  },
]
