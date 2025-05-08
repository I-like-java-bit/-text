# 报名系统

这是一个基于 React + Express 的报名系统，使用 Tailwind CSS 进行样式设计。

## 技术栈

- 前端：React 18
- 后端：Express
- 样式：Tailwind CSS
- 开发工具：Node.js

## 环境要求

- Node.js (推荐 v16 或更高版本)
- npm 或 yarn 包管理器

## 安装步骤

1. 克隆项目到本地

```bash
git clone [项目地址]
cd [项目目录]
```

2. 安装依赖

```bash
npm install
# 或
yarn install
```

## 启动项目

### 开发环境

1. 启动前端开发服务器（在 3002 端口）

```bash
# Windows
set PORT=3002 && npm start
# 或
set PORT=3002 && yarn start

# Linux/Mac
PORT=3002 npm start
# 或
PORT=3002 yarn start
```

2. 启动后端服务器（新终端）

```bash
npm run server
# 或
yarn server
```

### 生产环境

1. 构建前端项目

```bash
npm run build
# 或
yarn build
```

2. 启动生产服务器

```bash
npm run server
# 或
yarn server
```

## 项目结构

```
├── build/          # 构建输出目录
├── public/         # 静态资源目录
├── src/           # 前端源代码
├── server/        # 后端源代码
├── server.js      # 服务器入口文件
└── package.json   # 项目配置文件
```

## 开发说明

- 前端开发服务器运行在 `http://localhost:3002`
- 后端服务器默认运行在 `http://localhost:5000`
- 使用 `npm run dev` 可以启动带有热重载功能的后端服务器

## 注意事项

1. 确保已安装所有必要的依赖
2. 开发时建议使用 `npm run dev` 启动后端，这样可以实现代码修改后自动重启
3. 如果遇到端口占用问题，可以在相应的配置文件中修改端口号

## 常见问题

如果遇到启动问题，请尝试以下步骤：

1. 删除 `node_modules` 文件夹
2. 删除 `package-lock.json` 文件
3. 重新运行 `npm install`
4. 重新启动项目

## 贡献指南

1. Fork 项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request
