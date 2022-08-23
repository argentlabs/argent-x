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
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lectus nisl, diam iaculis porttitor.",
    icon: <SessionPluginIcon />,
  },
]
