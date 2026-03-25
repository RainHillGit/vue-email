import { defineComponent, h } from 'vue'
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Row,
  Column,
  Heading,
  Text,
  Link,
  Image,
  Button,
  Hr,
  Preview,
  Font,
} from '../src'

interface Product {
  name: string
  price: number
  quantity: number
  image: string
}

interface OrderDetails {
  orderId: string
  orderDate: string
  totalAmount: number
  shippingFee: number
  paymentMethod: string
}

interface ShippingAddress {
  name: string
  phone: string
  address: string
  city: string
}

export const OrderNotificationEmail = defineComponent({
  name: 'OrderNotificationEmail',
  props: {
    orderDetails: {
      type: Object as () => OrderDetails,
      required: true,
    },
    products: {
      type: Array as () => Product[],
      required: true,
    },
    shippingAddress: {
      type: Object as () => ShippingAddress,
      required: true,
    },
  },
  setup(props) {
    return () =>
      h(Html, { lang: 'zh-CN' }, {
        default: () => [
          h(Head, { title: '订单确认通知' }, {
            default: () => [
              h(Preview, { children: `您的订单 ${props.orderDetails.orderId} 已确认，感谢您的购买！` }),
              h(Font, { value: 'Helvetica' }),
            ],
          }),
          h(Body, { backgroundColor: '#f5f5f5' }, {
            default: () => [
              h(Container, { width: 600, bgcolor: '#ffffff' }, {
                default: () => [
                  h(Section, { bgcolor: '#2563eb' }, {
                    default: () => [
                      h('table', { role: 'presentation', width: '100%', border: '0', cellpadding: '0', cellspacing: '0' }, [
                        h('tbody', null, [
                          h('tr', null, [
                            h(Column, { width: 200 }, {
                              default: () => [
                                h(Image, {
                                  src: 'https://via.placeholder.com/120x40/ffffff/2563eb?text=ShopHub',
                                  alt: 'ShopHub',
                                  width: 120,
                                  height: 40,
                                }),
                              ],
                            }),
                            h(Column, { width: 400 }, {
                              default: () => [
                                h(Heading, { as: 'h2', align: 'right', color: '#ffffff', fontSize: 20 }, {
                                  default: () => '订单确认',
                                }),
                              ],
                            }),
                          ]),
                        ]),
                      ]),
                    ],
                  }),
                  
                  h(Section, { bgcolor: '#ffffff' }, {
                    default: () => [
                      h('table', { role: 'presentation', width: '100%', border: '0', cellpadding: '0', cellspacing: '0' }, [
                        h('tbody', null, [
                          h('tr', null, [
                            h('td', { style: { padding: '24px' } }, [
                              h(Text, { fontSize: 16, color: '#333333' }, {
                                default: () => `亲爱的客户 ${props.shippingAddress.name}，`,
                              }),
                              h(Text, { fontSize: 14, color: '#666666', height: 24 }, {
                                default: () => '感谢您的购买！您的订单已确认，我们将尽快为您发货。',
                              }),
                            ]),
                          ]),
                        ]),
                      ]),
                    ],
                  }),
                  
                  h(Section, { bgcolor: '#f9fafb' }, {
                    default: () => [
                      h('table', { role: 'presentation', width: '100%', border: '0', cellpadding: '0', cellspacing: '0' }, [
                        h('tbody', null, [
                          h('tr', null, [
                            h('td', { style: { padding: '20px 24px' } }, [
                              h(Heading, { as: 'h3', color: '#111111', fontSize: 16 }, {
                                default: () => '订单信息',
                              }),
                              h(Hr, { color: '#e5e7eb', borderWidth: 1 }),
                            ]),
                          ]),
                          h('tr', null, [
                            h('td', { style: { padding: '0 24px 16px' } }, [
                              h(Text, { fontSize: 14, color: '#666666' }, {
                                default: () => [
                                  `订单号：${props.orderDetails.orderId}`,
                                  h('br'),
                                  `下单时间：${props.orderDetails.orderDate}`,
                                  h('br'),
                                  `支付方式：${props.orderDetails.paymentMethod}`,
                                ],
                              }),
                            ]),
                          ]),
                        ]),
                      ]),
                    ],
                  }),
                  
                  h(Section, { bgcolor: '#ffffff' }, {
                    default: () => [
                      h('table', { role: 'presentation', width: '100%', border: '0', cellpadding: '0', cellspacing: '0' }, [
                        h('tbody', null, [
                          h('tr', null, [
                            h('td', { style: { padding: '20px 24px' } }, [
                              h(Heading, { as: 'h3', color: '#111111', fontSize: 16 }, {
                                default: () => '商品列表',
                              }),
                              h(Hr, { color: '#e5e7eb', borderWidth: 1 }),
                            ]),
                          ]),
                          ...props.products.map((product, index) =>
                            h('tr', { key: index }, [
                              h('td', { 
                                style: { 
                                  padding: '16px 24px',
                                  borderBottom: index < props.products.length - 1 ? '1px solid #e5e7eb' : 'none',
                                } 
                              }, [
                                h('table', { role: 'presentation', width: '100%', border: '0', cellpadding: '0', cellspacing: '0' }, [
                                  h('tbody', null, [
                                    h('tr', null, [
                                      h(Column, { width: 60 }, {
                                        default: () => [
                                          h(Image, {
                                            src: product.image,
                                            alt: product.name,
                                            width: 60,
                                            height: 60,
                                          }),
                                        ],
                                      }),
                                      h(Column, { width: 340 }, {
                                        default: () => [
                                          h(Text, { fontSize: 14, fontWeight: 'bold', color: '#111111' }, {
                                            default: () => product.name,
                                          }),
                                          h(Text, { fontSize: 12, color: '#666666' }, {
                                            default: () => `数量：${product.quantity}`,
                                          }),
                                        ],
                                      }),
                                      h(Column, { width: 100, align: 'right' }, {
                                        default: () => [
                                          h(Text, { fontSize: 14, fontWeight: 'bold', color: '#2563eb' }, {
                                            default: () => `¥${product.price.toFixed(2)}`,
                                          }),
                                        ],
                                      }),
                                    ]),
                                  ]),
                                ]),
                              ]),
                            ])
                          ),
                        ]),
                      ]),
                    ],
                  }),
                  
                  h(Section, { bgcolor: '#f9fafb' }, {
                    default: () => [
                      h('table', { role: 'presentation', width: '100%', border: '0', cellpadding: '0', cellspacing: '0' }, [
                        h('tbody', null, [
                          h('tr', null, [
                            h('td', { style: { padding: '20px 24px' } }, [
                              h(Heading, { as: 'h3', color: '#111111', fontSize: 16 }, {
                                default: () => '金额明细',
                              }),
                              h(Hr, { color: '#e5e7eb', borderWidth: 1 }),
                            ]),
                          ]),
                          h('tr', null, [
                            h('td', { style: { padding: '0 24px 8px' } }, [
                              h('table', { role: 'presentation', width: '100%', border: '0', cellpadding: '0', cellspacing: '0' }, [
                                h('tbody', null, [
                                  h('tr', null, [
                                    h('td', { style: { padding: '8px 0' } }, [
                                      h(Text, { fontSize: 14, color: '#666666' }, {
                                        default: () => '商品总额：',
                                      }),
                                    ]),
                                    h('td', { align: 'right' }, [
                                      h(Text, { fontSize: 14, color: '#666666' }, {
                                        default: () => `¥${(props.orderDetails.totalAmount - props.orderDetails.shippingFee).toFixed(2)}`,
                                      }),
                                    ]),
                                  ]),
                                  h('tr', null, [
                                    h('td', { style: { padding: '8px 0' } }, [
                                      h(Text, { fontSize: 14, color: '#666666' }, {
                                        default: () => '运费：',
                                      }),
                                    ]),
                                    h('td', { align: 'right' }, [
                                      h(Text, { fontSize: 14, color: '#666666' }, {
                                        default: () => `¥${props.orderDetails.shippingFee.toFixed(2)}`,
                                      }),
                                    ]),
                                  ]),
                                  h('tr', null, [
                                    h('td', { style: { padding: '8px 0' } }, [
                                      h(Hr, { color: '#e5e7eb', borderWidth: 1 }),
                                    ]),
                                    h('td', { style: { padding: '8px 0' } }, [
                                      h(Hr, { color: '#e5e7eb', borderWidth: 1 }),
                                    ]),
                                  ]),
                                  h('tr', null, [
                                    h('td', { style: { padding: '8px 0' } }, [
                                      h(Text, { fontSize: 16, fontWeight: 'bold', color: '#111111' }, {
                                        default: () => '应付总额：',
                                      }),
                                    ]),
                                    h('td', { align: 'right' }, [
                                      h(Text, { fontSize: 18, fontWeight: 'bold', color: '#2563eb' }, {
                                        default: () => `¥${props.orderDetails.totalAmount.toFixed(2)}`,
                                      }),
                                    ]),
                                  ]),
                                ]),
                              ]),
                            ]),
                          ]),
                        ]),
                      ]),
                    ],
                  }),
                  
                  h(Section, { bgcolor: '#ffffff' }, {
                    default: () => [
                      h('table', { role: 'presentation', width: '100%', border: '0', cellpadding: '0', cellspacing: '0' }, [
                        h('tbody', null, [
                          h('tr', null, [
                            h('td', { style: { padding: '20px 24px' } }, [
                              h(Heading, { as: 'h3', color: '#111111', fontSize: 16 }, {
                                default: () => '收货地址',
                              }),
                              h(Hr, { color: '#e5e7eb', borderWidth: 1 }),
                            ]),
                          ]),
                          h('tr', null, [
                            h('td', { style: { padding: '0 24px 16px' } }, [
                              h(Text, { fontSize: 14, color: '#666666' }, {
                                default: () => [
                                  props.shippingAddress.name,
                                  h('br'),
                                  props.shippingAddress.phone,
                                  h('br'),
                                  `${props.shippingAddress.city} ${props.shippingAddress.address}`,
                                ],
                              }),
                            ]),
                          ]),
                        ]),
                      ]),
                    ],
                  }),
                  
                  h(Section, { bgcolor: '#2563eb' }, {
                    default: () => [
                      h('table', { role: 'presentation', width: '100%', border: '0', cellpadding: '0', cellspacing: '0' }, [
                        h('tbody', null, [
                          h('tr', null, [
                            h('td', { align: 'center', style: { padding: '24px' } }, [
                              h(Button, {
                                href: `https://shop.example.com/orders/${props.orderDetails.orderId}`,
                                backgroundColor: '#ffffff',
                                color: '#2563eb',
                                borderRadius: 6,
                              }, {
                                default: () => '查看订单详情',
                              }),
                            ]),
                          ]),
                        ]),
                      ]),
                    ],
                  }),
                  
                  h(Section, { bgcolor: '#1f2937' }, {
                    default: () => [
                      h('table', { role: 'presentation', width: '100%', border: '0', cellpadding: '0', cellspacing: '0' }, [
                        h('tbody', null, [
                          h('tr', null, [
                            h('td', { align: 'center', style: { padding: '24px' } }, [
                              h(Text, { fontSize: 12, color: '#9ca3af', align: 'center' }, {
                                default: () => [
                                  '如有疑问，请联系客服：',
                                  h(Link, { href: 'mailto:support@shophub.com', color: '#9ca3af' }, {
                                    default: () => 'support@shophub.com',
                                  }),
                                  h('br'),
                                  '© 2024 ShopHub. All rights reserved.',
                                ],
                              }),
                            ]),
                          ]),
                        ]),
                      ]),
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
