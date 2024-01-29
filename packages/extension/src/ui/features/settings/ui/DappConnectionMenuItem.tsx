import { FC } from "react"
import { DappIcon } from "../../actions/connectDapp/DappIcon"
import { useDappDisplayAttributes } from "../../actions/connectDapp/useDappDisplayAttributes"
import {
  SettingsMenuItemRemove,
  SettingsMenuItemRemoveProps,
} from "./SettingsMenuItem"

interface DappConnectionMenuItemProps
  extends Omit<SettingsMenuItemRemoveProps, "title"> {
  host: string
}

export const DappConnectionMenuItem: FC<DappConnectionMenuItemProps> = ({
  host,
  ...rest
}) => {
  const hostName = new URL(host).hostname
  const dappDisplayAttributes = useDappDisplayAttributes(host)
  const title = dappDisplayAttributes.title ?? hostName
  const subtitle = dappDisplayAttributes.title ? hostName : undefined
  return (
    <SettingsMenuItemRemove
      leftIcon={
        <DappIcon
          dappDisplayAttributes={dappDisplayAttributes}
          rounded="xl"
          w={10}
          h={10}
        />
      }
      title={title}
      subtitle={subtitle}
      {...rest}
    />
  )
}
