import styled from "styled-components"

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

export const P = styled.p`
  font-size: 16px;
  line-height: 19px;
  color: #fff;
`

export const FormError = styled.p`
  margin-top: 2px;
  font-size: 12px;
  line-height: 16px;
  color: #ff675c;
  text-align: left;
`

export const A = styled.a`
  display: inline-block;
  text-decoration: none;
  color: #29c5ff;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 4px;
  transition: all 200ms ease-in-out;

  &:visited {
    color: #29c5ff;
  }

  &:hover {
    color: #94e2ff;
    outline: 0;
    border: 0;
  }
  &:focus {
    background: rgba(255, 255, 255, 0.15);
    color: #94e2ff;
    outline: 0;
    border: 0;
  }
`
