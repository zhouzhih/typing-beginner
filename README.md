# 打字小课堂

面向小学生打字初学者的本地浏览器练习软件。第一版先做英文基础课程，保留中文拼音课程入口，练习记录保存在本机浏览器。

## 使用

```bash
npm install
npm run dev
```

打开终端显示的本地地址即可开始练习。

## 构建 Mac App

本项目使用 Tauri 打包 macOS App。第一次构建会下载并编译 Rust 依赖，时间会长一些。
`make mac-app` 会生成 `.app`，并做一次本机 ad-hoc 签名校验，方便自己电脑直接使用。

```bash
make mac-app
```

构建产物在 `src-tauri/target/release/bundle/macos/打字小课堂.app`。

本地调试桌面版：

```bash
make mac-dev
```

## 验证

```bash
make verify
```

## 设计重点

- 小学生友好的卡通风格、大按钮、大字号
- 从主键位、字母、单词到短句循序渐进
- 实时显示正确、错误和当前输入位置
- 本机保存练习历史、星星、连续练习和关卡解锁
- 可切换整体页面风格，头像伙伴可互动、有动效
- 使用 Tauri 打包成 Mac App，保留离线练习和本机记录
