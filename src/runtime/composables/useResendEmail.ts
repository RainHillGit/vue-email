import type { RenderOptions } from '../../types'

export interface EmailAddress {
  email: string
  name?: string
}

export interface EmailAttachment {
  content: Buffer | string
  filename: string
  type?: string
  path?: string
  contentId?: string
}

export interface SendEmailOptions {
  to: EmailAddress | EmailAddress[] | string | string[]
  from?: EmailAddress | string
  cc?: EmailAddress | EmailAddress[] | string | string[]
  bcc?: EmailAddress | EmailAddress[] | string | string[]
  replyTo?: EmailAddress | string
  subject: string
  text?: string
  html?: string
  attachments?: EmailAttachment[]
  tags?: { name: string; value: string }[]
  headers?: Record<string, string>
}

export interface ResendConfig {
  apiKey: string
  from?: EmailAddress | string
  retry?: {
    enabled: boolean
    maxRetries: number
  }
  logging?: {
    enabled: boolean
    level: 'error' | 'warn' | 'info' | 'debug'
  }
}

export interface SendEmailResult {
  id: string
  from: string
  to: string[]
  createdAt: string
}

export interface UseResendEmailReturn {
  config: ResendConfig
  send: (options: SendEmailOptions) => Promise<SendEmailResult>
  sendWithComponent: <T extends Record<string, unknown>>(
    component: any,
    props: T,
    options: Omit<SendEmailOptions, 'html' | 'text'>,
    renderOptions?: RenderOptions
  ) => Promise<SendEmailResult>
  isConfigured: () => boolean
}

declare function useRuntimeConfig<T = { vueEmail?: { resend?: { apiKey?: string; from?: string; retry?: { enabled: boolean; maxRetries: number }; logging?: { enabled: boolean; level: string } } } }>(): T

function parseAddress(addr: EmailAddress | string): EmailAddress {
  if (typeof addr === 'string') {
    if (addr.includes('<')) {
      const [name, email] = addr.split('<')
      return { name: name.trim(), email: email.replace('>', '').trim() }
    }
    return { email: addr.trim() }
  }
  return addr
}

function formatAddresses(addrs: EmailAddress | EmailAddress[] | string | string[]): EmailAddress[] {
  if (Array.isArray(addrs)) {
    return addrs.map(parseAddress)
  }
  return [parseAddress(addrs)]
}

export function useResendEmail(): UseResendEmailReturn {
  const config = useRuntimeConfig()
  const vueEmailConfig = config.vueEmail?.resend || {}

  const resendConfig: ResendConfig = {
    apiKey: vueEmailConfig.apiKey || process.env.NUXT_VUE_EMAIL_RESEND_API_KEY || '',
    from: vueEmailConfig.from,
    retry: {
      enabled: vueEmailConfig.retry?.enabled ?? true,
      maxRetries: vueEmailConfig.retry?.maxRetries ?? 3,
    },
    logging: {
      enabled: vueEmailConfig.logging?.enabled ?? false,
      level: (vueEmailConfig.logging?.level as any) || 'error',
    },
  }

  const isConfigured = (): boolean => {
    return !!resendConfig.apiKey
  }

  const log = (level: 'error' | 'warn' | 'info' | 'debug', message: string, ...args: any[]) => {
    if (resendConfig.logging?.enabled) {
      const levels = ['error', 'warn', 'info', 'debug']
      const currentLevelIndex = levels.indexOf(resendConfig.logging.level)
      const messageLevelIndex = levels.indexOf(level)
      if (messageLevelIndex <= currentLevelIndex) {
        console[level](`[Vue Email] ${message}`, ...args)
      }
    }
  }

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  const sendWithRetry = async (
    sendFn: () => Promise<SendEmailResult>,
    maxRetries: number
  ): Promise<SendEmailResult> => {
    let lastError: Error | null = null
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await sendFn()
      } catch (error: any) {
        lastError = error
        if (attempt < maxRetries && shouldRetry(error)) {
          log('warn', `发送失败，${resendConfig.retry?.maxRetries || 3 - attempt}秒后重试...`)
          await sleep((attempt + 1) * 1000)
        }
      }
    }
    throw lastError
  }

  const shouldRetry = (error: any): boolean => {
    if (error?.status === 429 || error?.status >= 500) {
      return true
    }
    return false
  }

  const send = async (options: SendEmailOptions): Promise<SendEmailResult> => {
    if (!isConfigured()) {
      const error = new Error('Resend API 密钥未配置，请在 nuxt.config.ts 中配置 vueEmail.resend.apiKey 或设置环境变量 NUXT_VUE_EMAIL_RESEND_API_KEY')
      log('error', error.message)
      throw error
    }

    const { Resend } = await import('resend')
    const resend = new Resend(resendConfig.apiKey)

    const fromAddress = options.from
      ? parseAddress(options.from)
      : resendConfig.from
        ? parseAddress(resendConfig.from as string)
        : undefined

    if (!fromAddress) {
      const error = new Error('发件人地址未配置，请在 nuxt.config.ts 中配置 vueEmail.resend.from 或在 send options 中传递 from 参数')
      log('error', error.message)
      throw error
    }

    const fromStr = typeof fromAddress === 'string' ? fromAddress : `${fromAddress.name} <${fromAddress.email}>`
    const toStr = formatAddresses(options.to).map(a => typeof a === 'string' ? a : `${a.name || ''} <${a.email}>`.trim())

    const payload: any = {
      from: fromStr,
      to: toStr,
      subject: options.subject,
    }

    if (options.cc) payload.cc = formatAddresses(options.cc).map(a => typeof a === 'string' ? a : `${a.name || ''} <${a.email}>`.trim())
    if (options.bcc) payload.bcc = formatAddresses(options.bcc).map(a => typeof a === 'string' ? a : `${a.name || ''} <${a.email}>`.trim())
    if (options.replyTo) payload.reply_to = typeof options.replyTo === 'string' ? options.replyTo : `${options.replyTo.name || ''} <${options.replyTo.email}>`.trim()
    if (options.text) payload.text = options.text
    if (options.html) payload.html = options.html
    if (options.attachments) {
      payload.attachments = options.attachments.map(att => ({
        content: att.content instanceof Buffer ? att.content.toString('base64') : att.content,
        filename: att.filename,
        type: att.type,
        path: att.path,
        content_id: att.contentId,
      }))
    }
    if (options.tags) payload.tags = options.tags
    if (options.headers) payload.headers = options.headers

    const sendFn = async (): Promise<SendEmailResult> => {
      try {
        const result = await resend.emails.send(payload)
        if (result.error) {
          const error = new Error(`Resend API 调用失败: ${result.error.message}`)
          log('error', error.message, result.error)
          throw error
        }
        log('info', `邮件发送成功，ID: ${result.data?.id}`)
        return {
          id: result.data?.id || '',
          from: fromStr,
          to: toStr,
          createdAt: new Date().toISOString(),
        }
      } catch (error: any) {
        log('error', `Resend API 调用失败: ${error.message}`)
        throw error
      }
    }

    if (resendConfig.retry?.enabled) {
      return sendWithRetry(sendFn, resendConfig.retry.maxRetries)
    }
    return sendFn()
  }

  const sendWithComponent = async <T extends Record<string, unknown>>(
    component: any,
    props: T,
    options: Omit<SendEmailOptions, 'html' | 'text'>,
    renderOptions?: RenderOptions
  ): Promise<SendEmailResult> => {
    if (typeof window !== 'undefined') {
      const error = new Error('sendWithComponent can only be called on the server side')
      log('error', error.message)
      throw error
    }

    let html: string
    try {
      const { renderAsync } = await import('../../renderer/render')
      html = await renderAsync(component, props, {
        pretty: false,
        injectDoctype: true,
        ...renderOptions,
      })
    } catch (error: any) {
      const err = new Error(`组件渲染失败: ${error.message}`)
      log('error', err.message)
      throw err
    }

    return send({
      ...options,
      html,
    })
  }

  return {
    config: resendConfig,
    send,
    sendWithComponent,
    isConfigured,
  }
}
