import { ComponentProps, FC } from "react"
import { Link } from "react-router-dom"

interface BackLinkProps extends Omit<ComponentProps<typeof Link>, "to"> {
  to?: string
}

export const BackLink: FC<BackLinkProps> = ({ to, ...props }) => (
  <Link {...props} to={to ?? (-1 as any)} />
)
