# 打字小课堂 KeySprout

[中文](README.md) | [English](README.en.md)

[![CI](https://github.com/zhouzhih/typing-beginner/actions/workflows/ci.yml/badge.svg)](https://github.com/zhouzhih/typing-beginner/actions/workflows/ci.yml)
[![CodeQL](https://github.com/zhouzhih/typing-beginner/actions/workflows/codeql.yml/badge.svg)](https://github.com/zhouzhih/typing-beginner/actions/workflows/codeql.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

面向小学生打字初学者的卡通打字练习软件。英文名建议使用 **KeySprout**，含义是“小朋友像幼芽一样从键盘基础慢慢成长”。项目提供网页版本和 macOS App 打包方式，练习记录默认保存在本机。

<p>
  <img src="src-tauri/icons/128x128.png" alt="打字小课堂图标" width="96" height="96" />
</p>

## 功能

- 循序渐进课程：从主键位、字母组合、小单词到短句、语法句和小短文。
- 英语学习提示：语法句显示句型说明，小短文显示中文意思，打字时顺手学英语。
- 中文拼音课程：看中文词语和成语，输入对应拼音。
- 练习反馈：实时高亮当前字符、正确字符和错误字符。
- 练习记录：保存准确率、星星、连续练习和关卡解锁进度，支持导出 CSV 成绩。
- 错题库：统计经常打错的键，方便针对性复习。
- 儿童友好界面：大按钮、大输入框、卡通伙伴和可切换主题。
- 键盘小知识：在练习旁边展示 Shift、Backspace、空格等基础按键提示。
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
- Rust stable，包含 `cargo`
- macOS App 构建需要 Xcode Command Line Tools
- 默认 macOS App 是 Universal 构建，同时兼容 Intel Mac 和 Apple Silicon Mac
- Tauri CLI 使用项目里的本地依赖，不需要全局安装

安装依赖：

```bash
npm ci
```

启动网页开发版：

```bash
npm run dev
```

打开终端显示的本地地址即可开始练习。

## 纯 HTML 版（Windows 友好）

本项目支持不依赖安装桌面环境的纯网页启动方式，适合 Windows 直接使用或给小朋友在浏览器/共享设备上练习。

```bash
npm run build
```

生成后可直接双击 `dist/index.html` 打开；也可以启动一个本地静态服务：

```bash
cd dist
python -m http.server 4173
```

然后访问 `http://127.0.0.1:4173/index.html`。

可用 `make web-package` 打包为可分发 zip（当前会打成 `KeySprout-web-YYYYMMDD-HHMMSS.zip`）。

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

先确认本机环境：

```bash
make mac-check
```

如果提示缺少 Rust/Cargo：

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"
cargo --version
```

Universal 构建还需要安装两个 macOS Rust target，`make mac-app` 会自动执行：

```bash
rustup target add aarch64-apple-darwin x86_64-apple-darwin
```

如果新开终端后仍然提示找不到 `cargo`，把下面这一行加入 `~/.zshrc` 后重新打开终端：

```bash
source "$HOME/.cargo/env"
```

如果提示缺少 Xcode Command Line Tools：

```bash
xcode-select --install
```

如果提示缺少 Tauri CLI，说明还没有安装项目依赖：

```bash
npm ci
```

确认通过后构建：

```bash
make mac-app
```

构建产物：

```text
src-tauri/target/release/bundle/macos/打字小课堂.app
```

Universal 构建产物路径：

```text
src-tauri/target/universal-apple-darwin/release/bundle/macos/打字小课堂.app
```

当前构建使用本机 ad-hoc 签名，适合自己电脑和开发测试使用；正式分发给更多用户前，建议配置 Apple Developer ID 签名和 notarization。

默认产物是 Universal App，兼容 Intel Mac 和 Apple Silicon Mac。

打开本机 App：

```bash
open "src-tauri/target/release/bundle/macos/打字小课堂.app"
```

如果使用默认 Universal 构建，打开这个路径：

```bash
open "src-tauri/target/universal-apple-darwin/release/bundle/macos/打字小课堂.app"
```

本地调试桌面版：

```bash
make mac-dev
```

重新生成应用图标：

```bash
make icons
```

发布正式版本：

```bash
make release-tag VERSION=v0.1.0
```

推送 `v*` tag 后，GitHub Actions 会构建 macOS App，并把压缩包上传到 GitHub Release。
本次 Release 会同时包含：

- `KeySprout-<tag>-macos-universal.zip`（macOS 应用）
- `KeySprout-<tag>-web.zip`（纯 HTML 网页包，解压后打开 `index.html`）

## GitHub Actions

仓库配置了以下工作流：

- `CI`：push 和 pull request 时运行 lint、typecheck、test、web build。
- `CodeQL`：对 JavaScript/TypeScript 做安全扫描，每周自动运行一次。
- `macOS App Build`：每次 `main` 更新、手动触发或推送 `v*` tag 时构建 Universal macOS App，上传 artifact，并创建 GitHub Release。

Release 规则：

- 推送到 `main`：自动创建一个预发布版本，tag 形如 `app-20260524-1200-123.1-abcdef0`，适合自己下载最新构建。
- 推送 `v*` tag：创建正式 Release，适合标记稳定版本。

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
