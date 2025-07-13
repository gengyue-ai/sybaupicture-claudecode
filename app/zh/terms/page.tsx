'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { FileText, Shield, Users, Gavel, AlertTriangle, CheckCircle } from 'lucide-react'

export default function ZHTermsPage() {
  const termsSections = [
    {
      id: 'acceptance',
      title: '条款接受',
      icon: CheckCircle,
      content: `通过访问和使用Sybau Picture，您接受并同意受本协议条款和条件的约束。如果您不同意遵守以上条款，请不要使用本服务。

这些服务条款（"条款"）管理您对我们位于sybaupicture.com的网站（"服务"）的使用，该服务由Sybau Picture（"我们"、"我们的"或"本公司"）运营。

您对服务的访问和使用以您接受并遵守这些条款为条件。`
    },
    {
      id: 'use-license',
      title: '使用许可',
      icon: Shield,
      content: `我们授予您临时下载Sybau Picture网站材料副本的许可，仅供个人、非商业性临时查看。这是许可的授予，而非所有权的转让，在此许可下您不得：

• 修改或复制材料
• 将材料用于任何商业目的或任何公开展示（商业或非商业）
• 尝试反编译或逆向工程网站中包含的任何软件
• 删除材料中的任何版权或其他专有标记`
    },
    {
      id: 'user-content',
      title: '用户内容和生成图像',
      icon: Users,
      content: `您保留对您提交、发布或在服务上或通过服务显示的内容所持有的任何知识产权的所有权。通过向我们的服务提交内容，您授予我们全球性、非独占、免版税的许可，以在任何媒体中使用、复制、改编、发布、翻译和分发该内容。

使用我们AI服务生成的图像：
• 您拥有通过我们平台创建的生成图像
• 我们保留使用生成的图像来改进我们的AI模型的权利（匿名化处理）
• 您可以将生成的图像用于个人和商业目的
• 您有责任确保生成的内容符合适用法律`
    },
    {
      id: 'prohibited-uses',
      title: '禁止使用',
      icon: AlertTriangle,
      content: `您不得将我们的服务用于：

• 任何非法目的或招揽他人执行非法行为
• 违反任何国际、联邦、省或州法规、规则、法律或地方法令
• 侵犯或违反我们的知识产权或他人的知识产权
• 骚扰、辱骂、侮辱、伤害、诽谤、中伤、贬低、恐吓或歧视
• 提交虚假或误导性信息
• 上传或传输病毒或任何其他类型的恶意代码
• 收集或跟踪他人的个人信息
• 垃圾邮件、网络钓鱼、预置、蜘蛛抓取或刮取
• 任何淫秽或不道德的目的
• 干扰或规避服务的安全功能`
    },
    {
      id: 'disclaimers',
      title: '免责声明',
      icon: Gavel,
      content: `本网站上的信息按"现状"提供。在法律允许的最大范围内，本公司：

• 排除与本网站及其内容相关的所有陈述和保证
• 排除因您使用本网站而产生或与之相关的所有损害赔偿责任

AI生成内容免责声明：
• 生成的内容按"现状"提供，不提供任何准确性或适当性保证
• 用户有责任在使用前审查和验证所有生成的内容
• 我们不保证生成的内容没有错误或适用于任何特定目的`
    },
    {
      id: 'limitations',
      title: '责任限制',
      icon: FileText,
      content: `在任何情况下，Sybau Picture或其供应商都不应对因使用或无法使用Sybau Picture网站上的材料而产生的任何损害（包括但不限于数据丢失或利润损失或因业务中断造成的损害）承担责任，即使Sybau Picture或Sybau Picture授权代表已被口头或书面通知此类损害的可能性。

服务限制：
• 根据您的账户类型，可能适用每日生成限制
• 我们保留随时修改或终止服务的权利
• 可能因维护或更新而发生临时服务中断`
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 pt-20 pb-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <FileText className="w-12 h-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">服务条款</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            在使用Sybau Picture之前，请仔细阅读这些服务条款。这些条款管理您对我们AI表情包生成平台的使用。
          </p>
          <div className="mt-4 text-sm text-gray-500">
            最后更新：2024年12月
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Quick Overview Card */}
          <Card className="mb-8 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-800">
                <CheckCircle className="w-5 h-5 mr-2" />
                条款摘要
              </CardTitle>
            </CardHeader>
            <CardContent className="text-blue-700">
              <ul className="space-y-2">
                <li>• 您必须年满13岁才能使用我们的服务</li>
                <li>• 您拥有使用我们AI生成器创建的内容</li>
                <li>• 负责任且合法地使用我们的服务</li>
                <li>• 我们保留在通知后修改这些条款的权利</li>
                <li>• 生成的内容应在公开使用前进行审查</li>
              </ul>
            </CardContent>
          </Card>

          {/* Terms Sections */}
          <div className="space-y-6">
            {termsSections.map((section, index) => {
              const Icon = section.icon
              return (
                <Card key={section.id} className=" transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center text-gray-900">
                      <Icon className="w-6 h-6 mr-3 text-blue-600" />
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
                  {index < termsSections.length - 1 && <Separator className="mx-6" />}
                </Card>
              )
            })}
          </div>

          {/* Contact Information */}
          <Card className="mt-8 bg-blue-900 text-white">
            <CardHeader>
              <CardTitle className="text-white">对这些条款有疑问？</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-100 mb-4">
                如果您对这些服务条款有任何疑问，请联系我们：
              </p>
              <div className="space-y-2 text-blue-100">
                <p>📧 邮箱：legal@sybaupicture.com</p>
                <p>📍 地址：Sybau Picture 法务团队</p>
                <p>🌐 网站：通过 /contact 页面联系我们</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
