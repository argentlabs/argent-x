import { AnchorHTMLAttributes, FC, PropsWithChildren } from "react"
import { Link } from "react-router-dom"

type BackLinkProps = PropsWithChildren<AnchorHTMLAttributes<HTMLAnchorElement>>

export const BackLink: FC<BackLinkProps> = (props) => (
  <Link to={-1 as any} {...props} />
)
