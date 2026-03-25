import { defineComponent, h } from 'vue'
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Image,
  Button,
  Hr,
} from '../src/components'

export const VerificationCodeEmail = defineComponent({
  name: 'VerificationCodeEmail',
  props: {
    code: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      default: '用户',
    },
    validMinutes: {
      type: Number,
      default: 10,
    },
  },
  setup(props) {
    return () => 
      h(Html, null, {
        default: () => [
          h(Head, null, {
            default: () => [
              h('title', null, '验证码'),
              h('meta', { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }),
            ],
          }),
          h(Body, null, {
            default: () => [
              h(Container, null, {
                default: () => [
                  h(Section, { style: { padding: '32px 0', textAlign: 'center' } }, {
                    default: () => [
                      h(Image, { 
                        src: 'https://vuejs.org/images/logo.png',
                        alt: 'Vue Email',
                        style: { width: '64px', height: '64px', margin: '0 auto' }
                      }),
                    ],
                  }),
                  h(Section, { style: { padding: '24px 0', textAlign: 'center' } }, {
                    default: () => [
                      h(Heading, { as: 'h1', style: { fontSize: '24px', fontWeight: 'bold', margin: '0 0 16px 0', color: '#111827' } }, {
                        default: () => `${props.username}，你好！`,
                      }),
                      h(Text, { style: { fontSize: '16px', lineHeight: '1.5', color: '#4b5563', margin: '0 0 24px 0' } }, {
                        default: () => '请使用以下验证码完成身份验证：',
                      }),
                    ],
                  }),
                  h(Section, { style: { padding: '24px 0', textAlign: 'center' } }, {
                    default: () => [
                      h('div', { 
                        style: { 
                          backgroundColor: '#f9fafb', 
                          borderRadius: '8px', 
                          padding: '24px',
                          display: 'inline-block'
                        } 
                      }, {
                        default: () => [
                          h('span', { 
                            style: { 
                              fontSize: '36px', 
                              fontWeight: 'bold', 
                              letterSpacing: '8px',
                              color: '#2563eb',
                              fontFamily: 'monospace'
                            } 
                          }, props.code),
                        ],
                      }),
                    ],
                  }),
                  h(Section, { style: { padding: '16px 0', textAlign: 'center' } }, {
                    default: () => [
                      h(Text, { style: { fontSize: '14px', color: '#6b7280', margin: '0' } }, {
                        default: () => `验证码将在 ${props.validMinutes} 分钟后过期，请尽快使用。`,
                      }),
                    ],
                  }),
                  h(Hr, { style: { margin: '32px 0', borderColor: '#e5e7eb' } }),
                  h(Section, { style: { padding: '16px 0' } }, {
                    default: () => [
                      h(Text, { style: { fontSize: '12px', color: '#9ca3af', textAlign: 'center', margin: '0' } }, {
                        default: () => '如果你没有请求此验证码，请忽略此邮件。不要将验证码分享给任何人。',
                      }),
                      h(Text, { style: { fontSize: '12px', color: '#9ca3af', textAlign: 'center', margin: '8px 0 0 0' } }, {
                        default: () => '© 2024 Vue Email. All rights reserved.',
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      })
  },
})
