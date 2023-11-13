import { tokenService } from "../../../shared/token/__new/service"
import { parsedDefaultTokens } from "../../../shared/token/__new/utils"

export async function runV510TokenMigration() {
  // This will add the updated default tokens (with id) to the token service
  await tokenService.addToken(parsedDefaultTokens)
}
