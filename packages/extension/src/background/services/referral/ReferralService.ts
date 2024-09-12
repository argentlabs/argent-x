import type { IHttpService } from "@argent/x-shared"
import type { IReferralService, ReferralPayload } from "./IReferralService"
import { ARGENT_REFERRAL_URL } from "../../../shared/api/constants"
import { AccountError } from "../../../shared/errors/account"

export class ReferralService implements IReferralService {
  constructor(public httpService: IHttpService) {}

  async trackReferral(referralPayload: ReferralPayload) {
    if (!ARGENT_REFERRAL_URL) {
      throw new AccountError({ code: "REFERRAL_NOT_ENABLED" })
    }
    const [r, s] = referralPayload.signature
    try {
      await this.httpService.post(ARGENT_REFERRAL_URL, {
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          signature: { r, s },
          ownerAddress: referralPayload.ownerAddress,
          accountAddress: referralPayload.accountAddress,
        }),
      })
    } catch (e) {
      console.error(e)
    }
  }
}
