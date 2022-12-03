import { withIronSessionApiRoute } from "iron-session/next"

import { settings } from "../../iron-session"
import { modalValuesSchema } from "../../schemas/forms/modalValues"

export default withIronSessionApiRoute(async (req, res) => {
  if (req.method === "PUT") {
    const parsedValues = await modalValuesSchema.safeParseAsync(req.body)
    if (!parsedValues.success) {
      return res.status(400).json({
        error: parsedValues.error,
      })
    }

    req.session.modalValues = parsedValues.data
    await req.session.save()

    return res.status(200).json({
      success: true,
    })
  }

  return res.status(405).json({
    error: "Method not allowed",
  })
}, settings)
