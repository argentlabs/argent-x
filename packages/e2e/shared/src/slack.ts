import { WebClient } from "@slack/web-api"
import config from "../config"

const options = {}
const web = new WebClient(config.slackToken, options)

export async function sendSlackMessage(message: string) {
  const channelId = config.slackChannelId
  if (!channelId) {
    throw new Error("SLACK_CHANNEL_ID is not defined")
  }
  await web.chat.postMessage({
    text: message,
    channel: channelId,
  })
}
