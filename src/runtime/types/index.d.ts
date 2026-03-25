import type { HtmlProps } from '../../components/Html'
import type { HeadProps } from '../../components/Head'
import type { BodyProps } from '../../components/Body'
import type { ContainerProps } from '../../components/Container'
import type { SectionProps } from '../../components/Section'
import type { RowProps } from '../../components/Row'
import type { FontProps } from '../../components/Font'

export interface VueEmailComponentProps {
  Html: HtmlProps
  Head: HeadProps
  Body: BodyProps
  Container: ContainerProps
  Section: SectionProps
  Row: RowProps
  Font: FontProps
  Text: Record<string, never>
  Link: Record<string, never>
  Button: Record<string, never>
  Image: Record<string, never>
  Hr: Record<string, never>
  Preview: Record<string, never>
  Heading: Record<string, never>
  Column: Record<string, never>
}

declare global {
  interface NuxtApp {
    $vueEmail?: {
      version: string
      config: VueEmailRuntimeConfig
    }
  }

  const process: {
    server: boolean
    client: boolean
  }

  interface ImportMeta {
    glob(pattern: string, options?: { eager?: boolean; as?: string }): Record<string, () => Promise<any>>
  }
}

interface VueEmailRuntimeConfig {
  preview: {
    enabled: boolean
    previewRoute: string
    renderRoute: string
    title: string
    defaultProps: Record<string, unknown>
  }
  autoImport: boolean
  componentPrefix: string
}

declare module '#app' {
  interface NuxtApp {
    $vueEmail?: {
      version: string
      config: VueEmailRuntimeConfig
    }
  }
}

declare function useRuntimeConfig(): {
  vueEmail?: VueEmailRuntimeConfig
}

declare module 'h3' {
  export function defineEventHandler<T = any>(handler: (event: H3Event) => T | Promise<T>): any
  export function getQuery<T = Record<string, any>>(event: H3Event): T
  export function createError(options: { statusCode: number; message: string }): any
}

declare interface H3Event {
  context: Record<string, any>
  req: any
  res: any
}

export {}
