import { Link } from "react-router-dom"
import styled, { css } from "styled-components"

export const H1 = styled.h1`
  font-weight: bold;
  font-size: 40px;
  text-align: center;
  color: #fff;
  margin: 12px 0;
`

export const H2 = styled.h2`
  font-weight: bold;
  font-size: 34px;
  line-height: 41px;
  color: #ffffff;
  margin: 0 0 16px 0;
`

export const H3 = styled.h3`
  font-weight: bold;
  font-size: 22px;
  line-height: 28px;
  color: #ffffff;
`

export const H4 = styled.h4`
  font-weight: bold;
  font-size: 20px;
  line-height: 25px;
  color: #ffffff;
`

export const H5 = styled.h5`
  font-weight: 600;
  font-size: 17px;
  line-height: 22px;
  color: #ffffff;
`

export const P = styled.p`
  font-size: 16px;
  line-height: 19px;
  color: #fff;
`

export const FormError = styled.p`
  margin-top: 2px;
  font-size: 12px;
  line-height: 16px;
  color: ${({ theme }) => theme.red2};
  text-align: left;
`

const anchorCss = css`
  display: inline-block;
  text-decoration: none;
  color: ${({ theme }) => theme.blue1};
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 4px;
  transition: all 200ms ease-in-out;

  &:visited {
    color: ${({ theme }) => theme.blue1};
  }

  &:hover {
    color: ${({ theme }) => theme.blue2};
    outline: 0;
    border: 0;
  }
  &:focus {
    background: rgba(255, 255, 255, 0.15);
    color: ${({ theme }) => theme.blue2};
    outline: 0;
    border: 0;
  }
`

export const A = styled.a`
  ${anchorCss}
`

export const StyledLink = styled(Link)`
  ${anchorCss}
`
