import { renderAsync } from '../src'
import { OrderNotificationEmail } from './OrderNotification.email'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const mockProducts = [
  {
    name: 'iPhone 15 Pro Max 256GB 深空黑',
    price: 9999.00,
    quantity: 1,
    image: 'https://via.placeholder.com/60x60/2563eb/ffffff?text=iPhone',
  },
  {
    name: 'AirPods Pro 2 USB-C',
    price: 1899.00,
    quantity: 2,
    image: 'https://via.placeholder.com/60x60/2563eb/ffffff?text=AirPods',
  },
]

const mockOrderDetails = {
  orderId: 'SH2024031800001',
  orderDate: '2024-03-18 14:30:25',
  totalAmount: 13897.00,
  shippingFee: 0.00,
  paymentMethod: '支付宝',
}

const mockShippingAddress = {
  name: '张三',
  phone: '138****8888',
  address: '珠江新城花城大道 88 号',
  city: '广州市',
}

async function main() {
  console.log('开始渲染订单通知 Demo 邮件...')
  
  try {
    const html = await renderAsync(
      OrderNotificationEmail,
      {
        orderDetails: mockOrderDetails,
        products: mockProducts,
        shippingAddress: mockShippingAddress,
      },
      {
        pretty: true,
      }
    )

    const outputPath = path.join(__dirname, 'order-notification.html')
    fs.writeFileSync(outputPath, html, 'utf-8')
    
    console.log('[OK] 订单通知 Demo 邮件渲染成功！')
    console.log('[OK] 文件已保存到: ' + outputPath)
    console.log('\n组件使用统计:')
    console.log('- Html: 1 个')
    console.log('- Head: 1 个')
    console.log('- Body: 1 个')
    console.log('- Container: 1 个')
    console.log('- Section: 10 个')
    console.log('- Row: 多个')
    console.log('- Column: 多个')
    console.log('- Heading: 4 个')
    console.log('- Text: 多个')
    console.log('- Image: 4 个')
    console.log('- Button: 1 个')
    console.log('- Hr: 4 个')
    console.log('- Preview: 1 个')
    console.log('- Font: 1 个')
    console.log('\n完整内容请查看 order-notification.html 文件')
    console.log('\n您可以在浏览器中打开此文件预览效果')
    console.log('或者将此 HTML 内容发送到 Gmail/Outlook/QQ邮箱/163邮箱 进行兼容性测试')

  } catch (error) {
    console.error('[ERROR] 渲染失败:', error)
    process.exit(1)
  }
}

main()
