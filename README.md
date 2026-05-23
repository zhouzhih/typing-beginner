# 打字小课堂

[![CI](https://github.com/zhouzhih/typing-beginner/actions/workflows/ci.yml/badge.svg)](https://github.com/zhouzhih/typing-beginner/actions/workflows/ci.yml)
[![CodeQL](https://github.com/zhouzhih/typing-beginner/actions/workflows/codeql.yml/badge.svg)](https://github.com/zhouzhih/typing-beginner/actions/workflows/codeql.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

面向小学生打字初学者的卡通打字练习软件。项目提供网页版本和 macOS App 打包方式，练习记录默认保存在本机。

<p>
  <img src="src-tauri/icons/128x128.png" alt="打字小课堂图标" width="96" height="96" />
</p>

## 功能

- 循序渐进课程：从主键位、字母组合、小单词到短句。
- 练习反馈：实时高亮当前字符、正确字符和错误字符。
- 练习记录：保存准确率、星星、连续练习和关卡解锁进度。
- 儿童友好界面：大按钮、大输入框、卡通伙伴和可切换主题。
- 本机优先：自定义头像和练习历史仅保存在本机。
- macOS App：使用 Tauri 构建 `.app`，支持本机离线练习。

## 技术栈

- React 19
- TypeScript
- Vite
- Vitest
- Tauri 2
- Rust

## 本地开发

环境建议：

- Node.js 24，见 `.nvmrc`
- npm 11+
- Rust stable
- macOS App 构建需要 Xcode Command Line Tools

安装依赖：

```bash
npm ci
```

启动网页开发版：

```bash
npm run dev
```

打开终端显示的本地地址即可开始练习。

## 常用命令

```bash
npm run lint       # 代码风格检查
npm run typecheck  # TypeScript 类型检查
npm test           # 单元测试
npm run build      # 构建网页版本
make verify        # 测试、类型检查、网页构建
```

## 构建 macOS App

第一次构建会下载并编译 Rust 依赖，时间会长一些。

```bash
make mac-app
```

构建产物：

```text
src-tauri/target/release/bundle/macos/打字小课堂.app
```

当前构建使用本机 ad-hoc 签名，适合自己电脑和开发测试使用；正式分发给更多用户前，建议配置 Apple Developer ID 签名和 notarization。

打开本机 App：

```bash
open "src-tauri/target/release/bundle/macos/打字小课堂.app"
```

本地调试桌面版：

```bash
make mac-dev
```

重新生成应用图标：

```bash
make icons
```

## GitHub Actions

仓库配置了以下工作流：

- `CI`：push 和 pull request 时运行 lint、typecheck、test、web build。
- `CodeQL`：对 JavaScript/TypeScript 做安全扫描，每周自动运行一次。
- `macOS App Build`：手动触发时构建 macOS App 并上传 artifact；推送 `v*` tag 时会创建 GitHub Release 并附上 app zip。

Dependabot 会每周检查 npm、Cargo 和 GitHub Actions 依赖更新。

## 隐私

打字小课堂默认不需要账号，也不会上传练习数据。练习历史、主题选择、自定义头像等内容保存在本机浏览器或本机 App 数据里。提交 issue 时请不要上传儿童姓名、学校、照片等隐私信息。

## 项目结构

```text
src/
  app/          React 应用入口和集成测试
  components/   页面组件
  data/         课程和打字伙伴数据
  domain/       练习、进度、统计等纯逻辑
  storage/      本机记录存储
  styles/       全局样式和布局回归测试
src-tauri/      Tauri 桌面 App 配置和 Rust 入口
.github/        Actions、Dependabot、Issue/PR 模板
```

## 开源协作

欢迎提交 issue 和 pull request。开始前请阅读：

- [Contributing](CONTRIBUTING.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Security Policy](SECURITY.md)
- [Support](SUPPORT.md)
- [Changelog](CHANGELOG.md)
- [GitHub Repository Settings](docs/github-settings.md)

## License

[MIT](LICENSE)
