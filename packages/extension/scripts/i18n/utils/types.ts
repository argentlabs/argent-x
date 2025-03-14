import type { Node } from "@babel/types"

export interface State {
  translation: Record<string, string>
  componentName: string
}

export type JSXNode = Node & {
  expression?: {
    value?: string
    expressions?: any[]
    quasis?: any[]
  }
  source?: {
    value: string
  }
  id?: any
  body?: {
    body: any[]
  }
}
