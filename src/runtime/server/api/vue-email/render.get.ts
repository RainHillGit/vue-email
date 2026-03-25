import { renderAsync } from '../../../../renderer/render'
import type { RenderOptions } from '../../../../types'

declare function defineEventHandler<T = any>(handler: (event: any) => T | Promise<T>): any
declare function getQuery<T = Record<string, any>>(event: any): T
declare function createError(options: { statusCode: number; message: string }): any

export default defineEventHandler(async (event: any) => {
  if (typeof window !== 'undefined') {
    throw createError({
      statusCode: 400,
      message: 'This API endpoint can only be called on the server side',
    })
  }

  const query = getQuery(event)

  const { path, props, options } = query as {
    path?: string
    props?: Record<string, unknown>
    options?: RenderOptions
  }

  if (!path) {
    throw createError({
      statusCode: 400,
      message: 'Missing required parameter: path',
    })
  }

  try {
    const resolvedPath = path.startsWith('/') ? path.slice(1) : path
    const modules = (globalThis as any).__nuxt_component_globs__ || {}
    const moduleKey = Object.keys(modules).find((key: string) =>
      key.endsWith(resolvedPath) || key.includes(resolvedPath.replace(/\.vue$/, ''))
    )

    if (!moduleKey) {
      throw createError({
        statusCode: 404,
        message: `Email component not found: ${path}`,
      })
    }

    const component = (modules[moduleKey] as any).default

    const html = await renderAsync(
      component,
      props || {},
      {
        pretty: true,
        ...options,
      }
    )

    return {
      success: true,
      html,
      meta: {
        component: path,
        renderedAt: new Date().toISOString(),
      },
    }
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      message: `Failed to render email: ${error.message}`,
    })
  }
})
