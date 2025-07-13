'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Shield, Eye, Lock, UserCheck, Database, Globe } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function ZHPrivacyPage() {
  const privacySections = [
    {
      id: 'information-collection',
      title: '我们收集的信息',
      icon: Database,
      content: `我们收集您直接提供给我们的信息，例如当您创建账户、使用我们的AI生成服务或联系我们寻求支持时。这包括：

• 个人信息：姓名、电子邮件地址和个人资料信息
• 使用数据：您上传的图像、生成历史记录和偏好设置
• 技术数据：IP地址、浏览器类型、设备信息和使用模式
• 通信记录：您发送给我们的消息和提供的反馈`
    },
    {
      id: 'how-we-use',
      title: '我们如何使用您的信息',
      icon: UserCheck,
      content: `我们使用收集的信息来：

• 提供和改进我们的AI表情包生成服务
• 处理您的上传并生成个性化内容
• 维护和保护您的账户安全
• 向您发送关于新功能和改进的更新
• 回应您的问题并提供客户支持
• 分析使用模式以增强用户体验`
    },
    {
      id: 'data-sharing',
      title: '信息共享和披露',
      icon: Globe,
      content: `我们不会向第三方出售、交易或出租您的个人信息。我们只会在以下有限情况下共享您的信息：

• 征得您的同意或按照您的指示
• 遵守法律义务或有效的法律要求
• 保护我们的权利、财产或安全，或保护我们用户的权利、财产或安全
• 与协助我们运营平台的服务提供商
• 在合并、收购或资产出售的情况下`
    },
    {
      id: 'data-security',
      title: '数据安全',
      icon: Lock,
      content: `我们实施行业标准的安全措施来保护您的信息：

• 传输和存储过程中的加密
• 定期安全审计和监控
• 具有受限访问权限的安全数据中心
• 员工隐私和安全实践培训
• 针对任何安全事件的应急响应程序`
    },
    {
      id: 'your-rights',
      title: '您的隐私权利',
      icon: Shield,
      content: `您对个人信息享有以下权利：

• 访问权：要求提供我们持有的关于您的个人信息副本
• 更正权：要求我们更正任何不准确或不完整的信息
• 删除权：要求删除您的个人信息
• 数据携带权：以机器可读格式接收您的数据
• 反对权：反对某些信息处理活动
• 撤回权：在基于同意的处理中撤回同意`
    },
    {
      id: 'cookies',
      title: 'Cookie和跟踪',
      icon: Eye,
      content: `我们使用Cookie和类似技术来：

• 记住您的偏好和设置
• 了解您如何使用我们的平台
• 改进我们的服务和用户体验
• 提供个性化内容和功能

您可以通过浏览器设置控制Cookie，但禁用它们可能会影响某些平台功能。`
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 pt-20 pb-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-12 h-12 text-purple-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">隐私政策</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            您的隐私对我们很重要。本政策说明了当您使用Sybau Picture时，我们如何收集、使用和保护您的信息。
          </p>
          <div className="mt-4 text-sm text-gray-500">
            最后更新：2024年12月
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Quick Summary Card */}
          <Card className="mb-8 border-purple-200 bg-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center text-purple-800">
                <Eye className="w-5 h-5 mr-2" />
                隐私概要
              </CardTitle>
            </CardHeader>
            <CardContent className="text-purple-700">
              <ul className="space-y-2">
                <li>• 我们只收集提供服务所必需的信息</li>
                <li>• 您的图像和创作内容都经过安全和私密处理</li>
                <li>• 我们从不向第三方出售您的个人信息</li>
                <li>• 您完全控制自己的数据，可以随时删除</li>
                <li>• 我们使用行业标准的加密和安全措施</li>
              </ul>
            </CardContent>
          </Card>

          {/* Privacy Sections */}
          <div className="space-y-6">
            {privacySections.map((section, index) => {
              const Icon = section.icon
              return (
                <Card key={section.id} className=" transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center text-gray-900">
                      <Icon className="w-6 h-6 mr-3 text-purple-600" />
                      {section.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-gray max-w-none">
                      {section.content.split('\n').map((paragraph, idx) => (
                        <p key={idx} className="mb-3 text-gray-700 leading-relaxed">
                          {paragraph.trim()}
                        </p>
                      ))}
                    </div>
                  </CardContent>
                  {index < privacySections.length - 1 && <Separator className="mx-6" />}
                </Card>
              )
            })}
          </div>

          {/* Contact Information */}
          <Card className="mt-8 bg-gray-900 text-white">
            <CardHeader>
              <CardTitle className="text-white">对隐私有疑问？</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">
                如果您对此隐私政策或我们如何处理您的信息有任何疑问，请联系我们：
              </p>
              <div className="space-y-2 text-gray-300">
                <p>📧 邮箱：privacy@sybaupicture.com</p>
                <p>📍 地址：Sybau Picture 隐私团队</p>
                <p>🌐 网站：通过 /contact 页面联系我们</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
}
