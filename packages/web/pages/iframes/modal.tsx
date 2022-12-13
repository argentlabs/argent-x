import { H6, Input, L1, L2 } from "@argent/ui"
import {
  IframeMethods,
  MessageExchange,
  WindowMessenger,
} from "@argent/x-window"
import { Box, DarkMode, Flex, IconButton, LightMode } from "@chakra-ui/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { withIronSessionSsr } from "iron-session/next"
import { useRouter } from "next/router"
import {
  FC,
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react"
import { useForm } from "react-hook-form"

import { useAccount, useBackendAccount } from "../../hooks/account"
import { triggerRefresh, useLocalHandle } from "../../hooks/useMessages"
import { settings } from "../../iron-session"
import { enterEmailFormSchema } from "../../schemas/forms/email"
import { isSubmitDisabled } from "../../schemas/utils"
import { retrieveAccountFromSession } from "../../services/account"
import { ERROR_MESSAGE_NOT_LOGGED_IN } from "../../services/backend/account"

interface ModalProps {
  defaultLoggedIn?: boolean
  defaultEmail?: string
  defaultMode?: "light" | "dark"
  [key: string]: unknown
}

// This part (SSR) should always be optional
// It was introduced to avoid long loading times in the modal
export const getServerSideProps = withIronSessionSsr<ModalProps>(
  async function getServerSideProps({ req, query }) {
    console.log(req.session.modalValues)
    const defaultLoggedIn = req.session.modalValues?.loggedIn
    // get default email (and login status) from session
    const defaultEmail =
      req.session.modalValues?.loggedIn && req.session.modalValues.email
    // get default mode from search params
    const defaultMode = query["darkmode"] === "true" ? "dark" : "light"

    return {
      props: {
        ...(defaultLoggedIn !== undefined && { defaultLoggedIn }),
        ...(defaultEmail && { defaultEmail }),
        defaultMode,
      },
    }
  },
  settings,
)

async function saveSSRState(loggedIn: boolean, email?: string) {
  // save default email in session
  await fetch("/api/storeModalValues", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      loggedIn,
      // stringify does not output undefined
      email,
    }),
  })
}
// SSR part ends here

const GlobalStyle: FC<{ darkmode: boolean }> = ({ darkmode }) => (
  <style jsx global>{`
    html,
    body {
      background-color: ${darkmode ? "#171717" : "#f8fafc"} !important;
      height: 104px !important;
      overflow: hidden !important;
      color: ${darkmode ? "white" : "black"} !important;
      width: 100%;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `}</style>
)

const InfoIcon: FC = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
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
          <L2
            display={"inline-flex"}
            alignContent="center"
            gap={"6px"}
            color="#9ca3af"
          >
            <p style={{ marginTop: "1px" }}>Powered by Argent</p>
            <Box
              role="button"
              tabIndex={0}
              borderRadius="100%"
              _focus={{
                outline: "none",
                boxShadow: darkmode
                  ? "#404040 0px 0px 0px 2px"
                  : "#e5e5e5 0px 0px 0px 2px",
              }}
            >
              <InfoIcon />
            </Box>
          </L2>
        </Flex>
      </Box>
    </ForceMode>
  )
}

export default function Modal({
  defaultLoggedIn,
  defaultEmail,
  defaultMode,
}: ModalProps) {
  const navigate = useRouter()
  const localHandle = useLocalHandle()
  const { account, mutate } = useAccount()
  const { account: beAccount, error } = useBackendAccount()
  useEffect(() => {
    if (beAccount) {
      retrieveAccountFromSession(beAccount.accounts[0])
        .then(() => {
          mutate()

          if (defaultLoggedIn !== true || defaultEmail !== beAccount.email) {
            return saveSSRState(true, beAccount.email)
          }
        })
        .catch(() => {}) // ignore error
    } else if (error) {
      if (
        defaultLoggedIn !== false &&
        error instanceof Error &&
        error.message === ERROR_MESSAGE_NOT_LOGGED_IN
      ) {
        saveSSRState(false)
        mutate()
      }
    }
  }, [beAccount, defaultEmail, defaultLoggedIn, error, mutate])
  const [isLoading, setIsLoading] = useState(false)

  const email = beAccount?.email || defaultEmail
  const darkmode = (navigate.query["darkmode"] || defaultMode) === "true"
  const loading =
    isLoading || (defaultLoggedIn === undefined && !beAccount && !error)

  const { formState, handleSubmit, register } = useForm({
    defaultValues: {
      email: "",
    },
    resolver: zodResolver(enterEmailFormSchema),
  })
  const { isSubmitting } = formState
  const canSubmit = !isSubmitDisabled(formState)

  const onWebWallet = useCallback(
    async ({ email, loggedIn }: { email: string; loggedIn?: boolean }) => {
      try {
        setIsLoading(true)

        if (!email) {
          throw new Error("Email is required")
        }

        if (!account) {
          const h = 600
          const w = 500

          // parent is the window that opened this window; if not detected then it falls back to the current screen
          const parentWidth =
            window?.outerWidth ??
            window?.innerWidth ??
            window?.screen.width ??
            0
          const parentHeight =
            window?.outerHeight ??
            window?.innerHeight ??
            window?.screen.height ??
            0
          const parentLeft = window?.screenLeft ?? window?.screenX ?? 0
          const parentTop = window?.screenTop ?? window?.screenY ?? 0

          const y = parentTop + parentHeight / 2 - h / 2
          const x = parentLeft + parentWidth / 2 - w / 2

          const origin = "http://localhost:3005"
          const submitGoalUrl = `${origin}/email`

          // no session
          const windowRef = window.open(
            !loggedIn
              ? submitGoalUrl + "?email=" + encodeURIComponent(email)
              : origin,
            undefined,
            `width=${w},height=${h},top=${y},left=${x},toolbar=no,menubar=no,scrollbars=no,location=no,status=no`,
          )

          if (!windowRef) {
            throw new Error("Failed to open popup")
          }

          // callback if popup is closed
          const interval = setInterval(() => {
            if (windowRef?.closed) {
              clearInterval(interval)
              setIsLoading(false)
              throw new Error("Popup closed")
            }
          }, 500)

          // wait for popup load
          await new Promise((resolve) => {
            windowRef.addEventListener("load", () => {
              resolve(undefined)
            })
          })

          // wait for message from popup
          const messenger = new WindowMessenger({
            postWindow: windowRef,
            postOrigin: "*",
            listenWindow: window,
          })

          const connection = new MessageExchange<{}, IframeMethods>(messenger, {
            connect: async () => {
              if (!windowRef?.closed) {
                clearInterval(interval)
                windowRef.close()
              }

              await triggerRefresh()

              return localHandle?.call("connect")
            },
          })

          return () => {
            connection.destroy()
          }
        } else {
          await triggerRefresh()

          return localHandle?.call("connect")
        }
      } catch (e) {
        setIsLoading(false)
        console.error(e)
      }
    },
    [account, localHandle],
  )

  if (loading) {
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
          boxShadow={"rgba(0,0,0,0.12) 0px 2px 12px 0px"}
          backgroundColor={darkmode ? "#262626" : "#f8fafc"}
          _hover={{
            backgroundColor: darkmode ? "#404040" : "#f5f5f5",
          }}
          transition="all 0.2s"
        >
          <Box
            role="status"
            w={8}
            h={8}
            color={"neutrals.300"}
            fill="neutrals.600"
            _dark={{
              color: "neutrals.600",
              fill: "neutrals.300",
            }}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 100 101"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{
                animation: "spin 1s linear infinite",
                fill: darkmode ? "#d4d4d4" : "#525252",
              }}
            >
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="currentColor"
              />
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="currentFill"
              />
            </svg>
          </Box>
        </Box>
      </ErrorWrapper>
    )
  }

  if (email) {
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
          boxShadow={"rgba(0,0,0,0.12) 0px 2px 12px 0px"}
          backgroundColor={darkmode ? "#262626" : "#f8fafc"}
          _hover={{
            backgroundColor: darkmode ? "#404040" : "#f5f5f5",
          }}
          transition="all 0.2s"
          role="button"
          tabIndex={0}
          onClick={() => onWebWallet({ email, loggedIn: true })}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              onWebWallet({ email, loggedIn: true })
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
            {email}
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
      <Box as="form" position={"relative"} onSubmit={handleSubmit(onWebWallet)}>
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
