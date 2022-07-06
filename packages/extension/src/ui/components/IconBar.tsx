import { isString } from "lodash-es"
import { FC } from "react"
import { Link } from "react-router-dom"
import styled from "styled-components"

import { routes } from "../routes"
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
  children?: React.ReactNode
}

export const IconBar: FC<IconBarProps> = ({ back, close, children }) => (
  <Bar>
    {back ? (
      <BackLink>
        <BackIcon />
      </BackLink>
    ) : (
      <hr />
    )}

    {children}

    {close ? (
      <Link
        to={isString(close) ? close : routes.accountTokens()}
        style={{ textAlign: "right" }}
      >
        <CloseIcon />
      </Link>
    ) : (
      <hr />
    )}
  </Bar>
)
