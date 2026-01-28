# 更新日志

## 2024-01-27 - CORS 问题修复

### 问题描述
前端直接调用外部 AI API 时出现 CORS 错误：
```
Access to fetch at 'xxxxxx/v1/chat/completions' from origin 'http://10.186.36.61:3000'
has been blocked by CORS policy: Request header field authorization is not allowed
by Access-Control-Allow-Headers in preflight response.
```

### 解决方案
通过后端代理转发 AI 请求，避免浏览器跨域限制。

### 修改内容

#### 1. 新增文件：`app/api/ai/chat/route.ts`
- 创建后端代理 API 路由
- 从用户配置中读取 AI API Key
- 转发请求到外部 AI 服务（OpenAI/兼容 API）
- 支持流式响应

#### 2. 修改文件：`lib/ai/provider.ts`
**变更前：**
- 使用 OpenAI 客户端直接调用 API
- API Key 暴露在前端

**变更后：**
- 调用本地后端代理 `/api/ai/chat`
- API Key 仅存储在服务端
- 手动解析 SSE 流式响应

### 请求流程对比

**修复前（有 CORS）：**
```
浏览器 → OpenAI API
   ↑         ↓
   └──── CORS 错误
```

**修复后（无 CORS）：**
```
浏览器 → /api/ai/chat → OpenAI API
            ↑
            └─ 服务端转发，无跨域
```

### 安全提升
| 项目 | 修复前 | 修复后 |
|------|--------|--------|
| API Key 位置 | 前端内存 | 仅服务端 |
| CORS 问题 | 存在 | 解决 |
| 安全性 | 低 | 高 |

### API 路由列表
当前可用的 API 端点：
- `POST /api/ai/chat` - AI 代理（新增）
- `POST /api/agent/chat` - 智能体对话
- `GET/POST /api/agent/config` - 智能体配置
- `POST /api/auth/login` - 登录
- `POST /api/auth/register` - 注册
- `GET /api/auth/me` - 获取当前用户
- `GET/POST /api/user/config` - 用户配置

### 部署说明
重新构建部署：
```bash
cd art
npm run build
npm start
```
