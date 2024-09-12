import { Address } from "@argent/x-shared"
import {
  TOPPER_BASE_URL,
  TOPPER_KEY_ID,
  TOPPER_WIDGET_ID,
} from "../../../shared/api/constants"
import { IOnRampService } from "../../../shared/onRamp/IOnRampService"
import { importPKCS8, JWTHeaderParameters, SignJWT } from "jose"

export class OnRampService implements IOnRampService {
  async getTopperUrl(address: Address) {
    const createBootstrapTokenSigner = async (
      widgetId: string,
      keyId: string,
      pemKey: string,
      algorithm: string = "ES256",
    ): Promise<(claims: any) => Promise<string>> => {
      let privateKey: CryptoKey
      try {
        privateKey = await importPKCS8(pemKey, algorithm)
      } catch (error) {
        throw new Error(`Failed to import key: ${JSON.stringify(error)}`)
      }

      const signJwt = async (
        claims: any,
        privateKey: CryptoKey,
        header: JWTHeaderParameters,
      ): Promise<string> => {
        const jwt = await new SignJWT(claims)
          .setProtectedHeader(header)
          .sign(privateKey)
        return jwt
      }

      return async (claims: any): Promise<string> => {
        try {
          claims = { ...claims, sub: widgetId }

          const header = {
            alg: algorithm,
            kid: keyId,
            typ: "JWT",
          }
          return await signJwt(claims, privateKey, header)
        } catch (e) {
          console.error("Error signing JWT:", e)
          throw new Error(`${e}`)
        }
      }
    }

    const pemKey = process.env.TOPPER_PEM_KEY
    if (!pemKey) {
      throw new Error("No PEM key provided.")
    }

    // Example of creating a bootstrap token.
    const signBootstrapToken = await createBootstrapTokenSigner(
      TOPPER_WIDGET_ID,
      TOPPER_KEY_ID,
      pemKey,
    )

    const token = await signBootstrapToken({
      source: {
        amount: "100.00",
        asset: "USD",
      },
      target: {
        address,
        asset: "ETH",
        allowedAssets: [
          {
            asset: "ETH",
            networks: ["starknet"],
          },
          {
            asset: "STRK",
            networks: ["starknet"],
          },
        ],
        network: "starknet",
        label: "My wallet",
        recipientEditMode: "all-editable",
      },
      jti: crypto.randomUUID(),
      iat: Math.floor(Date.now() / 1000),
    })

    const url = `${TOPPER_BASE_URL}?bt=${token}`
    return url
  }
}
