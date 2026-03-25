import VerificationCode from '~/components/VerificationCode.email.vue'

export default defineEventHandler(async (event) => {
  const { useResendEmail } = useNuxtApp()

  const { sendWithComponent, isConfigured, config } = useResendEmail()

  if (!isConfigured()) {
    throw createError({
      statusCode: 400,
      message: 'Resend API 密钥未配置。请设置环境变量 NUXT_VUE_EMAIL_RESEND_API_KEY',
    })
  }

  const result = await sendWithComponent(
    VerificationCode,
    {
      lang: 'zh-CN',
      title: '验证你的邮箱',
      message: '感谢注册！请验证你的邮箱地址来完成注册。',
      verifyUrl: 'https://example.com/verify?token=xxx',
    },
    {
      to: 'test@example.com',
      subject: '验证你的邮箱 - Vue Email 示例',
    }
  )

  return {
    success: true,
    result,
    message: '测试邮件发送成功（实际上没有真正发送，使用的是 Resend 测试密钥）',
  }
})
