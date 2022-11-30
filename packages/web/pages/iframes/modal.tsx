import { H6, Input, L1, L2 } from "@argent/ui"
import { Box, DarkMode, Flex, IconButton, LightMode } from "@chakra-ui/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/router"
import { FC, PropsWithChildren, useCallback, useMemo } from "react"
import { useForm } from "react-hook-form"

import { useBackendAccount } from "../../hooks/account"
import { useLocalHandle } from "../../hooks/usePageGuard"
import { enterEmailFormSchema } from "../../schemas/forms/email"
import { isSubmitDisabled } from "../../schemas/utils"

const GlobalStyle: FC<{ darkmode: boolean }> = ({ darkmode }) => (
  <style jsx global>{`
    html,
    body {
      background-color: ${darkmode ? "#171717" : "white"};
      color: ${darkmode ? "white" : "black"};
    }
  `}</style>
)

const InfoIcon: FC = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    style={{
      cursor: "pointer",
    }}
    role="button"
    tabIndex={0}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M7 11C7 11.5523 7.44772 12 8 12C8.55229 12 9 11.5523 9 11C9 10.4477 8.55229 10 8 10C7.44772 10 7 10.4477 7 11Z"
      fill="currentColor"
    ></path>
    <path
      d="M8.48773 4.29804C8.00277 4.20157 7.50011 4.25108 7.04329 4.4403C6.58648 4.62952 6.19603 4.94995 5.92133 5.36107C5.64662 5.7722 5.5 6.25555 5.5 6.75C5.5 7.16421 5.83579 7.5 6.25 7.5C6.66421 7.5 7 7.16421 7 6.75C7 6.55222 7.05865 6.35888 7.16853 6.19443C7.27841 6.02998 7.43459 5.90181 7.61732 5.82612C7.80004 5.75043 8.00111 5.73063 8.19509 5.76921C8.38907 5.8078 8.56725 5.90304 8.70711 6.04289C8.84696 6.18275 8.9422 6.36093 8.98079 6.55491C9.01937 6.74889 8.99957 6.94996 8.92388 7.13268C8.84819 7.31541 8.72002 7.47159 8.55557 7.58147C8.39112 7.69135 8.19778 7.75 8 7.75C7.58579 7.75 7.25 8.08579 7.25 8.5C7.25 8.91421 7.58579 9.25 8 9.25C8.49445 9.25 8.9778 9.10338 9.38893 8.82867C9.80005 8.55397 10.1205 8.16352 10.3097 7.70671C10.4989 7.24989 10.5484 6.74723 10.452 6.26227C10.3555 5.77732 10.1174 5.33186 9.76777 4.98223C9.41814 4.6326 8.97268 4.3945 8.48773 4.29804Z"
      fill="currentColor"
    ></path>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M1.25 8C1.25 4.27208 4.27208 1.25 8 1.25C11.7279 1.25 14.75 4.27208 14.75 8C14.75 11.7279 11.7279 14.75 8 14.75C4.27208 14.75 1.25 11.7279 1.25 8ZM8 2.75C5.10051 2.75 2.75 5.10051 2.75 8C2.75 10.8995 5.10051 13.25 8 13.25C10.8995 13.25 13.25 10.8995 13.25 8C13.25 5.10051 10.8995 2.75 8 2.75Z"
      fill="currentColor"
    ></path>
  </svg>
)

const ErrorWrapper: FC<
  PropsWithChildren<{ error?: string; darkmode: boolean }>
> = ({ error = "", darkmode, children }) => {
  const ForceMode = useMemo(() => {
    return darkmode ? DarkMode : LightMode
  }, [darkmode])

  return (
    <ForceMode>
      <Box p={3}>
        <GlobalStyle darkmode={darkmode} />
        {children}
        <Flex
          alignItems={"center"}
          justifyContent={"space-between"}
          mt={2}
          mb={8}
          px={2}
          gap={2}
        >
          <L1 color="red.500">{error}</L1>
          <L2 display={"inline-flex"} alignContent="center" gap={1}>
            Powered by Argent
            <InfoIcon />
          </L2>
        </Flex>
      </Box>
    </ForceMode>
  )
}

const boxShadow = "rgba(0,0,0,0.12) 0px 2px 12px 0px"

export default function Modal() {
  const navigate = useRouter()
  const localHandle = useLocalHandle()
  const { account } = useBackendAccount({
    onSuccess: () => {
      localHandle?.emit("ARGENT_WEB_WALLET::LOADED", undefined)
    },
    onError: () => {
      localHandle?.emit("ARGENT_WEB_WALLET::LOADED", undefined)
    },
  })

  const darkmode = navigate.query["darkmode"] === "true"

  const { formState, handleSubmit, register } = useForm({
    defaultValues: {
      email: "",
    },
    resolver: zodResolver(enterEmailFormSchema),
  })
  const { isSubmitting } = formState
  const canSubmit = !isSubmitDisabled(formState)

  const onWebWallet = useCallback(() => {
    localHandle?.emit("ARGENT_WEB_WALLET::CONNECT", undefined)
  }, [localHandle])

  if (account?.email) {
    return (
      <ErrorWrapper darkmode={darkmode}>
        <Box
          mb={2}
          display="flex"
          alignItems="center"
          justifyContent="center"
          height="56px" // needs to be fixed to avoid jumping
          rounded="md"
          cursor="pointer"
          boxShadow={boxShadow}
          backgroundColor={darkmode ? "#262626" : "white"}
          _hover={{
            backgroundColor: darkmode ? "#404040" : "#f5f5f5",
          }}
          transition="all 0.2s"
          role="button"
          tabIndex={0}
          onClick={onWebWallet}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              onWebWallet()
            }
          }}
        >
          <H6
            display="flex"
            justifyContent="center"
            alignItems="center"
            gap={2}
          >
            <svg
              width="18"
              height="17"
              viewBox="0 0 18 17"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M5.42912 11.244C3.99182 10.1604 3.06266 8.4387 3.06266 6.5C3.06266 3.22081 5.72097 0.5625 9.00016 0.5625C12.2793 0.5625 14.9377 3.22081 14.9377 6.5C14.9377 8.4387 14.0085 10.1604 12.5712 11.244C13.0085 11.4174 13.4341 11.623 13.8443 11.8599C15.3171 12.7103 16.54 13.9334 17.3902 15.4063C17.6491 15.8547 17.4954 16.4281 17.047 16.6869C16.5985 16.9458 16.0252 16.7921 15.7663 16.3437C15.0807 15.1559 14.0944 14.1695 12.9067 13.4837C11.7389 12.8093 10.4168 12.449 9.06905 12.4371C9.04612 12.4374 9.02315 12.4375 9.00016 12.4375C8.97716 12.4375 8.9542 12.4374 8.93126 12.4371C7.58356 12.449 6.26143 12.8093 5.0936 13.4837C3.90587 14.1695 2.91962 15.1559 2.23397 16.3437C1.97513 16.7921 1.40178 16.9458 0.953356 16.6869C0.504933 16.4281 0.351247 15.8547 0.61009 15.4063C1.46029 13.9334 2.68324 12.7103 4.15602 11.8599C4.56624 11.623 4.99182 11.4174 5.42912 11.244ZM4.93766 6.5C4.93766 4.25634 6.7565 2.4375 9.00016 2.4375C11.2438 2.4375 13.0627 4.25634 13.0627 6.5C13.0627 8.72244 11.278 10.5281 9.06369 10.562C9.04252 10.5619 9.02134 10.5618 9.00016 10.5618C8.97897 10.5618 8.9578 10.5619 8.93663 10.562C6.72227 10.5281 4.93766 8.72244 4.93766 6.5Z"
                fill="currentColor"
              />
            </svg>
            {account.email}
          </H6>
        </Box>
      </ErrorWrapper>
    )
  }

  return (
    <ErrorWrapper
      darkmode={darkmode}
      error={formState.errors.email?.message ?? ""}
    >
      <Box
        as="form"
        position={"relative"}
        onSubmit={handleSubmit(({ email }) => {
          console.log(email)
        })}
      >
        <Input
          autoFocus
          backgroundColor={darkmode ? undefined : "#f5f5f5"}
          placeholder="Email"
          type="text"
          {...register("email")}
          className={canSubmit ? "peer" : ""}
          disabled={isSubmitting}
        />
        <IconButton
          aria-label="Continue"
          position="absolute"
          zIndex={1}
          right={4}
          top="50%"
          size={"sm"}
          minHeight="fit-content"
          icon={
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4.5 10.5L8.5 6.5L4.5 2.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
          transform="translateY(-50%) scale(0)"
          opacity={0}
          sx={{
            ".peer:not(:placeholder-shown) + &": {
              transform: "translateY(-50%) scale(1)",
              opacity: 1,
            },
          }}
          transition="all 300ms"
          type="submit"
        />
      </Box>
    </ErrorWrapper>
  )
}
