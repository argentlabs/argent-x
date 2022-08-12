import { SessionPluginIcon } from "../../components/Icons/SessionPluginIcon"

export interface IPlugin {
  classHash: string
  title: string
  description?: string
  icon: React.ReactNode
}

export const plugins: IPlugin[] = [
  {
    classHash:
      "0x6a184757e350de1fe3a544037efbef6434724980a572f294c90555dadc20052",
    title: "User sessions",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lectus nisl, diam iaculis porttitor.",
    icon: <SessionPluginIcon />,
  },
]
