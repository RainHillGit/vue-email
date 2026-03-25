import VerificationCode from '~/components/VerificationCode.email.vue'

export default defineEventHandler(async () => {
  const { renderAsync } = await import('vue-email')

  const html = await renderAsync(VerificationCode, {
    lang: 'zh-CN',
    title: '验证你的邮箱',
    message: '感谢注册！请验证你的邮箱地址来完成注册。',
    verifyUrl: 'https://example.com/verify?token=xxx',
  }, {
    pretty: true,
  })

  return {
    success: true,
    html,
    meta: {
      component: 'VerificationCode.email.vue',
      renderedAt: new Date().toISOString(),
    },
  }
})
