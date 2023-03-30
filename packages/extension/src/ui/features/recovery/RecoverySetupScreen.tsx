import { BarCloseButton, NavigationContainer, icons } from "@argent/ui"
import { FC } from "react"
import { Link, useNavigate } from "react-router-dom"
import styled from "styled-components"

import { Option, OptionsWrapper } from "../../components/Options"
import { PageWrapper, Paragraph, Title } from "../../components/Page"
import { routes, useReturnTo } from "../../routes"

const { RestoreIcon } = icons

const CircleIconContainer = styled.div`
  border-radius: 500px;
  display: flex;
  font-size: 24px;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  color: ${({ theme }) => theme.neutrals600};
  background-color: ${({ theme }) => theme.white};
`

export const RecoverySetupScreen: FC = () => {
  const navigate = useNavigate()
  const returnTo = useReturnTo()
  return (
    <NavigationContainer
      rightButton={
        <BarCloseButton
          onClick={() => navigate(returnTo || routes.accountTokens())}
        />
      }
    >
      <PageWrapper>
        <Title>Set up account recovery</Title>
        <Paragraph>
          Choose one or more of the methods below to ensure you can access your
          accounts.
        </Paragraph>
        <OptionsWrapper>
          <Option
            title="With Argent guardian"
            description="Coming soon"
            disabled
            icon={
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M17.6027 3H10.3973C10.1565 3 9.96357 3.21088 9.95833 3.47301C9.81274 10.8412 6.27253 17.8344 0.179092 22.7878C-0.0143651 22.945 -0.0584389 23.2404 0.082996 23.4532L4.29877 29.8005C4.44219 30.0165 4.72163 30.0653 4.91833 29.9066C8.72841 26.8296 11.793 23.1177 14 19.0035C16.2069 23.1177 19.2717 26.8296 23.0818 29.9066C23.2783 30.0653 23.5578 30.0165 23.7014 29.8005L27.9171 23.4532C28.0584 23.2404 28.0143 22.945 27.821 22.7878C21.7274 17.8344 18.1872 10.8412 18.0418 3.47301C18.0366 3.21088 17.8435 3 17.6027 3Z"
                  fill="currentColor"
                />
                <path
                  d="M26.6795 10.7416L25.8668 8.23068C25.7015 7.72091 25.2988 7.32382 24.7862 7.16683L22.2631 6.39111C21.9149 6.28397 21.9112 5.79176 22.2585 5.68002L24.7687 4.86735C25.2785 4.70205 25.6766 4.29849 25.8336 3.78687L26.6084 1.2639C26.7156 0.914821 27.2078 0.91112 27.3205 1.25837L28.1332 3.76931C28.2985 4.27908 28.7012 4.67618 29.2137 4.8341L31.7369 5.6089C32.0851 5.71604 32.0888 6.20825 31.7415 6.32092L29.2313 7.13359C28.7215 7.29796 28.3235 7.70152 28.1664 8.21407L27.3916 10.7361C27.2845 11.0852 26.7922 11.0889 26.6795 10.7416Z"
                  fill="currentColor"
                />
              </svg>
            }
          />
          <Link to={routes.settingsSeed(returnTo)}>
            <Option
              title="Save the recovery phrase"
              icon={
                <CircleIconContainer>
                  <RestoreIcon />
                </CircleIconContainer>
              }
            />
          </Link>
        </OptionsWrapper>
      </PageWrapper>
    </NavigationContainer>
  )
}
