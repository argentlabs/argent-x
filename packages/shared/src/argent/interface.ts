export interface BackendResponsePage<T> {
  content: T[]
  totalPages: number
  number: number
}
