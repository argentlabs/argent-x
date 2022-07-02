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
  justify-content: space-between;
  padding: 18px;

  hr {
    margin: 0 auto;
    visibility: hidden;
  }
`

interface IconBarProps {
  back?: boolean | string
  close?: boolean | string
}

export const IconBar: FC<IconBarProps> = ({ back, close }) => (
  <Bar>
    {back && (
      <BackLink aria-label="Back">
        <BackIcon />
      </BackLink>
    )}
    <hr />
    {close && (
      <Link
        to={isString(close) ? close : routes.accountTokens()}
        aria-label="Close"
      >
        <CloseIcon />
      </Link>
    )}
  </Bar>
)
