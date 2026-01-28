# AI Requirement Transformer (ART)

将非标准化的用户需求描述，通过大模型（LLM）处理，输出标准化的**需求规格说明书**、**功能流程图**以及**UI 原型草图**，并支持多格式导出。

## 功能特性

- **需求输入与解析**: 富文本输入原始需求，支持上下文补充
- **需求标准化**: AI 自动生成结构化输出
  - 核心功能点 (Features)
  - 业务逻辑 (Business Rules)
  - 用户角色 (User Personas)
  - 验收标准 (Acceptance Criteria)
- **质量纠偏**: 自动识别需求歧义，标记需补充信息
- **流程图生成**: 基于 Mermaid.js 自动生成业务流程图
- **多格式导出**: Markdown + SVG 打包下载

## 技术栈

- **前端**: Next.js + TypeScript + Tailwind CSS
- **UI 组件**: shadcn/ui
- **状态管理**: Zustand
- **AI 接口**: OpenAI 标准 API (支持官方 OpenAI / Azure OpenAI / 兼容服务)
- **图表**: Mermaid.js
- **导出**: JSZip

## 快速开始

### 1. 安装依赖

```bash
cd art
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env.local`:

```bash
cp .env.example .env.local
```

编辑 `.env.local`:

```env
NEXT_PUBLIC_AI_API_KEY=your-api-key-here
NEXT_PUBLIC_AI_BASE_URL=          # 可选，留空使用 OpenAI 官方
NEXT_PUBLIC_AI_MODEL=gpt-4o
```

### 3. 开发模式

```bash
npm run dev
```

访问 http://localhost:3000

### 4. 生产构建

```bash
npm run build
```

静态文件输出到 `dist` 目录。

## AI 配置说明

支持任何 OpenAI API 兼容的服务：

| 服务 | Base URL | 模型示例 |
|------|----------|----------|
| OpenAI 官方 | (留空) | gpt-4o, gpt-4o-mini |
| Azure OpenAI | `https://{resource}.openai.azure.com/openai/deployments/{deployment}` | gpt-4o |
| Ollama (本地) | `http://localhost:11434/v1` | qwen2.5:14b, llama3.1 |
| 第三方代理 | 自定义 | 根据服务商 |

## 项目结构

```
art/
├── app/                    # Next.js 应用
│   ├── page.tsx           # 主页面
│   └── layout.tsx         # 根布局
├── components/
│   ├── art/               # 业务组件
│   │   ├── input-panel.tsx
│   │   ├── output-panel.tsx
│   │   ├── mermaid-chart.tsx
│   │   ├── config-dialog.tsx
│   │   └── header.tsx
│   └── ui/                # shadcn/ui 组件
├── lib/
│   ├── ai/                # AI 相关
│   │   ├── provider.ts    # OpenAI Provider
│   │   └── prompts.ts     # AI Prompts
│   └── export/            # 导出功能
│       └── packager.ts    # ZIP 打包
├── hooks/
│   └── use-art-store.ts   # Zustand 状态
├── types/
│   └── index.ts           # TypeScript 类型
└── dist/                  # 构建输出
```

## 使用流程

1. 在左侧输入框粘贴"大白话"需求
2. 点击"配置 AI API"设置 API Key
3. 点击"开始标准化"，AI 实时流式输出结果
4. 切换"流程图"标签页查看 Mermaid 图表
5. 点击"导出"下载 Markdown + SVG 压缩包

## License

MIT
