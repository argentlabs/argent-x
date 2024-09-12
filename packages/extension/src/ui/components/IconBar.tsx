import { isString } from "lodash-es"
import { FC } from "react"
import { Link } from "react-router-dom"
import styled from "styled-components"

import { routes } from "../../shared/ui/routes"
import { BackLink } from "./BackLink"
import { BackIcon } from "./Icons/BackIcon"
import { CloseIcon } from "./Icons/CloseIcon"

const Bar = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 18px;

  a {
    flex: 1;
    svg {
      display: inline;
    }
  }

  hr {
    margin: 0 auto;
    visibility: hidden;
    flex: 1;
  }
`

interface IconBarProps {
  back?: boolean | string
  close?: boolean | string
  childAfter?: React.ReactNode
  children?: React.ReactNode
  onClick?: () => void
}

export const IconBar: FC<IconBarProps> = ({
  back,
  close,
  childAfter,
  children,
  onClick,
  ...rest
}) => (
  <Bar {...rest}>
    {back ? (
      <BackLink aria-label="Back" onClick={onClick}>
        <BackIcon />
      </BackLink>
    ) : (
      <hr />
    )}

    {children}

    {childAfter ? (
      <>{childAfter}</>
    ) : close ? (
      <Link
        to={isString(close) ? close : routes.accountTokens()}
        aria-label="Close"
        style={{ textAlign: "right" }}
        onClick={onClick}
      >
        <CloseIcon />
      </Link>
    ) : (
      <hr />
    )}
  </Bar>
)
