'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sparkles,
  FileText,
  Workflow,
  Download,
  Zap,
  Shield,
  Code2,
  ArrowRight,
  CheckCircle2,
  FileCode,
  GitBranch,
  Users,
  User,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export function LandingPage() {
  const { user, isAuthenticated, logout } = useAuth();
  const features = [
    {
      icon: FileText,
      title: '需求标准化',
      description: '将非结构化的"大白话"需求转化为标准化的需求规格说明书，包含功能点、业务规则、用户角色和验收标准。',
    },
    {
      icon: Workflow,
      title: '自动流程图',
      description: '基于 Mermaid.js 自动生成业务流程图，直观展示系统交互逻辑，支持导出 SVG 格式。',
    },
    {
      icon: Zap,
      title: 'AI 质量纠偏',
      description: '智能识别需求中的歧义和遗漏，主动标记需要补充的信息，提升需求完整性。',
    },
    {
      icon: Download,
      title: '一键导出',
      description: '支持 Markdown、PDF、Word 格式导出，流程图可导出为 PNG/SVG，方便团队协作。',
    },
  ];

  const steps = [
    {
      step: '01',
      title: '输入需求',
      description: '在左侧文本框粘贴原始需求描述，可补充业务上下文和约束条件。',
    },
    {
      step: '02',
      title: 'AI 分析',
      description: '点击"开始标准化"，AI 实时流式输出结构化需求文档。',
    },
    {
      step: '03',
      title: '查看流程图',
      description: '系统自动生成 Mermaid 流程图，直观理解业务流程。',
    },
    {
      step: '04',
      title: '导出交付',
      description: '一键下载包含 Markdown 和流程图的完整交付包。',
    },
  ];

  const highlights = [
    { icon: Code2, label: 'OpenAI 标准 API', desc: '兼容官方/ Azure / 本地模型' },
    { icon: Shield, label: '隐私安全', desc: 'API Key 本地存储，数据直传' },
    { icon: GitBranch, label: '自定义提示词', desc: '支持调整 AI 分析策略' },
    { icon: Users, label: '团队协作', desc: '标准化输出，降低沟通成本' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <span className="font-semibold">ART</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/workspace">
              <Button variant="ghost" size="sm">工作区</Button>
            </Link>
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs bg-primary/10">
                        {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline">{user?.name || user?.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem disabled>
                    <User className="mr-2 h-4 w-4" />
                    {user?.email}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    退出登录
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">登录</Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm">注册</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-32 px-4 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/10 rounded-full blur-3xl opacity-50" />
        </div>

        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm mb-8">
            <Sparkles className="h-4 w-4" />
            <span>AI 驱动的需求工程工具</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              AI Requirement Transformer
            </span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            将非标准化的用户需求描述，通过大模型处理，
            <br className="hidden md:block" />
            输出标准化的需求规格说明书、功能流程图与 UI 原型
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/workspace">
              <Button size="lg" className="gap-2 px-8">
                <Sparkles className="h-4 w-4" />
                开始使用
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href="#features">
              <Button variant="outline" size="lg">
                了解更多
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">核心功能</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              从需求输入到标准化输出，全流程 AI 辅助，提升需求工程效率
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="group hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">使用流程</h2>
            <p className="text-muted-foreground">简单四步，完成需求标准化</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((item, index) => (
              <div key={item.step} className="relative">
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px bg-gradient-to-r from-border to-transparent" />
                )}
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 relative">
                    <span className="text-2xl font-bold text-primary">{item.step}</span>
                  </div>
                  <h3 className="font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Highlights */}
      <section className="py-24 px-4 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">技术特性</h2>
            <p className="text-muted-foreground">灵活的架构设计，满足多样化需求</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {highlights.map((item) => (
              <div key={item.label} className="text-center p-6">
                <div className="inline-flex p-3 rounded-lg bg-background mb-4">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-medium mb-1">{item.label}</h4>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Output Example */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">标准化输出示例</h2>
              <div className="space-y-4">
                {[
                  { icon: CheckCircle2, text: '核心功能点自动提取' },
                  { icon: CheckCircle2, text: '用户角色与权限梳理' },
                  { icon: CheckCircle2, text: '业务规则明确化' },
                  { icon: CheckCircle2, text: 'Gherkin 格式验收标准' },
                  { icon: CheckCircle2, text: 'Mermaid 业务流程图' },
                  { icon: CheckCircle2, text: '歧义点标注与建议' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <item.icon className="h-5 w-5 text-green-500" />
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-primary/5 rounded-2xl blur-2xl opacity-50" />
              <Card className="relative">
                <CardContent className="p-0 overflow-hidden">
                  <div className="bg-muted p-4 border-b">
                    <div className="flex items-center gap-2">
                      <FileCode className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">需求规格说明书</span>
                    </div>
                  </div>
                  <div className="p-4 space-y-3 text-sm">
                    <div className="font-semibold text-primary">## 1. 核心功能点</div>
                    <div className="pl-4 text-muted-foreground">- 用户注册与登录</div>
                    <div className="pl-4 text-muted-foreground">- 商品浏览与搜索</div>
                    <div className="pl-4 text-muted-foreground">- 购物车管理</div>
                    <div className="font-semibold text-primary mt-4">## 2. 用户角色</div>
                    <div className="pl-4 text-muted-foreground">- 普通用户：浏览商品、下单</div>
                    <div className="pl-4 text-muted-foreground">- 管理员：商品管理、订单处理</div>
                    <div className="font-semibold text-primary mt-4">## 3. 流程图</div>
                    <div className="pl-4 text-muted-foreground">{'```'}mermaid</div>
                    <div className="pl-4 text-muted-foreground">flowchart TD</div>
                    <div className="pl-8 text-muted-foreground">{'A[开始] --> B{登录?}'}</div>
                    <div className="pl-8 text-muted-foreground">{'B -->|是| C[浏览商品]'}</div>
                    <div className="pl-4 text-muted-foreground">{'```'}</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative p-12 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border">
            <h2 className="text-3xl font-bold mb-4">准备好提升需求效率了吗？</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              免费使用，无需注册。支持 OpenAI、Azure OpenAI 及任何兼容 API。
            </p>
            <Link href="/workspace">
              <Button size="lg" className="gap-2">
                <Sparkles className="h-4 w-4" />
                立即开始
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <span className="font-semibold">AI Requirement Transformer</span>
          </div>
          <p className="text-sm text-muted-foreground">
            基于 OpenAI API 构建 · 开源免费
          </p>
        </div>
      </footer>
    </div>
  );
}
