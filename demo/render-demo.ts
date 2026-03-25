import { renderAsync } from '../src'
import { VerificationCodeEmail } from './VerificationCode.email'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function main() {
  console.log('开始渲染 Demo 邮件...')
  
  try {
    const html = await renderAsync(
      VerificationCodeEmail,
      {
        code: '852963',
        username: '张三',
        validMinutes: 15,
      },
      {
        pretty: true,
      }
    )

    const outputPath = path.join(__dirname, 'demo-email.html')
    fs.writeFileSync(outputPath, html, 'utf-8')
    
    console.log('[OK] Demo 邮件渲染成功！')
    console.log('[OK] 文件已保存到: ' + outputPath)
    console.log('\n预览:')
    console.log('='.repeat(60))
    console.log(html.substring(0, 500) + '...')
    console.log('='.repeat(60))
    console.log('\n完整内容请查看 demo-email.html 文件')
    console.log('\n您可以在浏览器中打开此文件预览效果')
    console.log('或者将此 HTML 内容发送到 Gmail/Outlook 进行邮箱兼容性测试')

  } catch (error) {
    console.error('[ERROR] 渲染失败:', error)
    process.exit(1)
  }
}

main()
