import {
  BarBackButton,
  H2,
  icons,
  L2Bold,
  NavigationContainer,
  P2,
  useToast,
} from "@argent/x-ui"
import { Box, Flex } from "@chakra-ui/react"
import type { FC } from "react"
import { useCallback } from "react"
import browser from "webextension-polyfill"
import { argentDb } from "../../../../../shared/idb/argentDb"
import { idb } from "../../../../../shared/smartAccount/idb"
import { ConfirmScreen } from "../../../actions/transaction/ApproveTransactionScreen/ConfirmScreen"
import { IconWrapper } from "../../../actions/transactionV2/header/icon"
import {
  downloadFile,
  formatDataForDownload,
  getBrowserName,
  getOSName,
} from "./utils"

const { DownloadIcon } = icons

export const DownloadLogsScreen: FC = () => {
  const toast = useToast()

  const extractLogsData = useCallback(async () => {
    const deviceId = await idb.ids.get("deviceId")
    const device = await idb.devices.get(0)
    const verifiedEmail = device?.verifiedEmail
    const verifiedEmailAt = device?.verifiedAt

    const miscData: { [key: string]: any } = {}
    miscData["App Version"] = process.env.VERSION
    miscData["Browser"] = getBrowserName()
    miscData["Operating System"] = getOSName()
    miscData["Device ID"] = deviceId
    miscData["Verified Email"] = verifiedEmail
    miscData["Verified Email At"] = verifiedEmailAt

    // get data from browser storage
    const storageData = await browser.storage.local.get()
    const regex = new RegExp("private|key", "i") // Matches any string that includes 'private' or 'key'
    const filteredStorageData = Object.keys(storageData)
      .filter((key) => !regex.test(key))
      .reduce((obj: any, key) => {
        obj[key] = storageData[key]
        return obj
      }, {})

    // get data from IndexedDB
    for (const table of argentDb.tables) {
      const data = await table.toArray()
      if (data.length) {
        filteredStorageData[table.name] = data
      }
    }
    return { ...miscData, ...filteredStorageData }
  }, [])

  const downloadLogs = useCallback(async () => {
    try {
      const logsData = await extractLogsData()
      const formattedData = formatDataForDownload(logsData)

      downloadFile(
        formattedData,
        `argentx-logs-${new Date().toISOString()}.txt`,
      )
      toast({
        title: "Download successful",
        status: "success",
        duration: 1000,
      })
    } catch {
      toast({
        title: "Oops, download failed. Please try again",
        status: "error",
        duration: 3000,
      })
    }
  }, [extractLogsData, toast])

  return (
    <NavigationContainer
      leftButton={<BarBackButton />}
      title={"Download application logs"}
    >
      <ConfirmScreen
        title="Download application logs"
        confirmButtonText="Download"
        singleButton
        onSubmit={() => void downloadLogs()}
      >
        <Flex
          flex={1}
          flexDirection={"column"}
          justifyContent="space-between"
          alignItems="center"
          textAlign="center"
        >
          <Box mt="11">
            <IconWrapper background="black" w="24" h="24" mb={8}>
              <DownloadIcon w="14" h="14" />
            </IconWrapper>
          </Box>
          <Box>
            <H2>
              Download <br />
              application logs
            </H2>
            <P2 mt={3} mb={6}>
              Application logs will help to resolve user support issues
            </P2>
            <Flex
              rounded={"xl"}
              textAlign={"center"}
              color="warn.500"
              px={3}
              py={2.5}
              bg={"warn.900"}
            >
              <L2Bold>
                Sensitive data like your seed phrase and private key is never
                included
              </L2Bold>
            </Flex>
          </Box>
        </Flex>
      </ConfirmScreen>
    </NavigationContainer>
  )
}
