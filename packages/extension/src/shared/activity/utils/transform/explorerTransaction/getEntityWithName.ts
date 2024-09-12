import { isArray } from "lodash-es"

export function getEntityWithName<T extends { name: string }>(
  entities: T[] | undefined,
  name: string,
): T | undefined {
  if (!isArray(entities)) {
    return
  }
  return entities.find((entity) => entity.name === name)
}
