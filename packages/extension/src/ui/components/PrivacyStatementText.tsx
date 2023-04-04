import { FC } from "react"
import styled from "styled-components"

import { A } from "../theme/Typography"

const Container = styled.span`
  font-size: 16px;
  line-height: 21px;
  > ${A} {
    padding: 0;
  }
`

export const PrivacyStatementText: FC = () => {
  return (
    <Container aria-label="privacyStatementText">
      GDPR statement for browser extension wallet: Argent takes the privacy and
      security of individuals very seriously and takes every reasonable measure
      and precaution to protect and secure the personal data that we process.
      The browser extension wallet&nbsp;
      <span style={{ fontWeight: "bold" }}>
        does not collect any personal information&nbsp;
      </span>
      nor does it correlate any of your personal information with anonymous data
      processed as part of its services. On top of this Argent has robust
      information security policies and procedures in place to make sure any
      processing complies with applicable laws. If you would like to know more
      or have any questions then please visit our website at{" "}
      <A href="https://www.argent.xyz/" target="_blank">
        https://www.argent.xyz/
      </A>
    </Container>
  )
}
