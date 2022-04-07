import { FC } from "react"
import styled from "styled-components"

import { IconBarWithIcons } from "../components/Recovery/IconBar"
import { Option, OptionsWrapper } from "../components/Recovery/Options"

const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 18px 24px;
`

const Title = styled.h1`
  font-weight: 700;
  font-weight: 700;
  font-size: 34px;
  line-height: 41px;
  margin: 0;
  margin-bottom: 24px;
`

const Paragraph = styled.p`
  font-weight: 600;
  font-size: 16px;
  line-height: 21px;
  margin: 0;
  margin-bottom: 40px;
`

export const SetupRecoveryPage: FC = () => {
  return (
    <>
      <IconBarWithIcons />
      <PageWrapper>
        <Title>Set up account recovery</Title>
        <Paragraph>
          Choose one or more of the methods below to ensure you can access your
          accounts.
        </Paragraph>
        <OptionsWrapper>
          <Option
            title="No-password restore"
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
                  fill="white"
                />
                <path
                  d="M26.6795 10.7416L25.8668 8.23068C25.7015 7.72091 25.2988 7.32382 24.7862 7.16683L22.2631 6.39111C21.9149 6.28397 21.9112 5.79176 22.2585 5.68002L24.7687 4.86735C25.2785 4.70205 25.6766 4.29849 25.8336 3.78687L26.6084 1.2639C26.7156 0.914821 27.2078 0.91112 27.3205 1.25837L28.1332 3.76931C28.2985 4.27908 28.7012 4.67618 29.2137 4.8341L31.7369 5.6089C32.0851 5.71604 32.0888 6.20825 31.7415 6.32092L29.2313 7.13359C28.7215 7.29796 28.3235 7.70152 28.1664 8.21407L27.3916 10.7361C27.2845 11.0852 26.7922 11.0889 26.6795 10.7416Z"
                  fill="white"
                />
              </svg>
            }
          />
          <Option
            title="Unencrypted"
            description="Save a backup phrase"
            backgroundColor="#C12026"
            icon={
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M32 16C32 24.8366 24.8366 32 16 32C7.16344 32 0 24.8366 0 16C0 7.16344 7.16344 0 16 0C24.8366 0 32 7.16344 32 16ZM14.6668 16.6667V8.66667C14.6668 8.31305 14.8073 7.97391 15.0573 7.72386C15.3073 7.47381 15.6465 7.33334 16.0001 7.33334C16.3537 7.33334 16.6929 7.47381 16.9429 7.72386C17.193 7.97391 17.3334 8.31305 17.3334 8.66667V16.6667C17.3334 17.0203 17.193 17.3594 16.9429 17.6095C16.6929 17.8595 16.3537 18 16.0001 18C15.6465 18 15.3073 17.8595 15.0573 17.6095C14.8073 17.3594 14.6668 17.0203 14.6668 16.6667ZM14.1254 21.2891C14.0331 21.5338 13.9905 21.7946 14.0001 22.056C14.0204 22.5816 14.243 23.0789 14.6215 23.4442C14.9999 23.8095 15.5048 24.0143 16.0308 24.016H16.0668C16.3284 24.0116 16.5865 23.955 16.826 23.8495C17.0655 23.7441 17.2815 23.5919 17.4614 23.4019C17.6413 23.212 17.7815 22.988 17.8738 22.7431C17.9661 22.4983 18.0086 22.2375 17.9988 21.976C17.9791 21.4502 17.7567 20.9525 17.3781 20.5871C16.9996 20.2217 16.4943 20.017 15.9681 20.016H15.9321C15.6705 20.0206 15.4125 20.0773 15.1731 20.1828C14.9337 20.2883 14.7178 20.4405 14.5379 20.6304C14.358 20.8204 14.2178 21.0443 14.1254 21.2891Z"
                  fill="white"
                />
              </svg>
            }
          />
        </OptionsWrapper>
      </PageWrapper>
    </>
  )
}
