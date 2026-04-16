# 🚀 部署指南

## 方式一：GitHub Actions 自动部署（推荐）

### 1. 配置 GitHub Secrets

在 GitHub 仓库设置中，添加以下 Secrets：

- **Settings → Secrets and variables → Actions → New repository secret**

| Name | Value |
|------|-------|
| `CLOUDFLARE_API_TOKEN` | 你的 Cloudflare API Token |
| `CLOUDFLARE_ACCOUNT_ID` | 你的 Cloudflare 账户 ID |

### 2. 获取 Cloudflare API Token

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 点击右上角头像 → **My Profile** → **API Tokens**
3. 点击 **Create Token**
4. 选择 **Edit Cloudflare Pages** 模板
5. 设置权限：
   - **Account Resources**: `Pages` → `Edit`
   - **Zone Resources**: 保持默认
6. 点击 **Continue to summary** → **Create Token**
7. 复制生成的 Token，保存到 GitHub Secrets

### 3. 获取 Cloudflare 账户 ID

1. 登录 Cloudflare Dashboard
2. 在右侧边栏找到你的账户 ID（一串数字和字母）
3. 或访问：https://dash.cloudflare.com/ 查看 URL 中的账户 ID

### 4. 触发部署

- **自动部署**：推送代码到 master 分支
- **手动部署**：Actions → Deploy to Cloudflare Pages → Run workflow

---

## 方式二：本地手动部署

### 1. 安装 Wrangler CLI

```bash
npm install -g wrangler
```

### 2. 登录 Cloudflare

```bash
wrangler login
```

浏览器会打开，授权 Cloudflare 访问你的 GitHub 账户。

### 3. 构建并部署

```bash
npm run build
npx wrangler pages deploy dist --project-name=pet-shop
```

### 4. 创建项目（首次部署）

如果是首次部署，Wrangler 会自动提示你创建新项目。

---

## 方式三：使用批处理文件

双击运行 `deploy.bat`，按提示操作。

---

## 部署后的访问地址

部署成功后，项目将托管在：

```
https://pet-shop-54p.pages.dev/
```

或你自定义的域名。

---

## 常见问题

### Q1: 部署失败，提示 "Project not found"
**A**: 确保已在 Cloudflare Pages 创建项目，或首次部署时 Wrangler 会自动创建。

### Q2: GitHub Actions 运行失败
**A**: 检查 Secrets 是否正确配置，确保 API Token 未过期。

### Q3: 如何查看部署日志？
**A**: 
- GitHub Actions: Actions 标签页 → 查看运行记录
- Cloudflare: Cloudflare Dashboard → Pages → pet-shop → Deployments

---

## 更新部署

- **GitHub Actions**: 推送新代码到 master 分支自动触发
- **本地部署**: 重复上述部署步骤

---

**最后更新时间**: 2026-04-15
