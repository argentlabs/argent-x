export interface IExtensionService {
  unlock: (password: string) => Promise<void>
}
