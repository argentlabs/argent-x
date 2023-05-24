export interface ICacheService {
  get(url: string): Promise<Response>
  set(url: string, response: Response): Promise<void>
}
