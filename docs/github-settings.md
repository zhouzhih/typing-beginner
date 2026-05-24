# GitHub Repository Settings

这份清单用于记录仓库开源后的基础设置，避免以后忘记哪些开关已经处理过。

## 已配置

- About 描述、README 主页和 topics。
- Issues 和 Discussions 已开启。
- Wiki 和 Projects 已关闭，减少维护入口。
- 默认合并策略保留 squash merge 和 rebase merge，关闭 merge commit。
- Pull request 合并后自动删除分支。
- Secret scanning、push protection、Dependabot security updates、vulnerability alerts 已开启。
- Private vulnerability reporting 已开启。
- GitHub Actions 已配置 CI、CodeQL 和 macOS App 构建/发布。
- Dependabot 已配置 npm、Cargo 和 GitHub Actions 每周依赖检查。
- Issue 模板、PR 模板、CODEOWNERS、MIT License、贡献指南、安全策略、行为准则和更新日志已添加。

## 建议手工确认

### Branch Protection

等主分支 CI 稳定后，可以在 GitHub 的 `Settings -> Rules -> Rulesets` 或 `Settings -> Branches` 给 `main` 加规则：

- Require a pull request before merging。
- Require status checks to pass。
- 必选检查建议包含 `Verify` 和 `Analyze JavaScript and TypeScript`。
- Block force pushes。
- Restrict deletions。

这个设置会改变直接推送 `main` 的习惯，所以建议确认后再打开。

### Release Signing

当前 macOS App 构建会在每次 `main` 更新时创建预发布 Release，并在推送 `v*` tag 时创建正式 Release。构建产物使用 ad-hoc 签名，适合自己使用和开发测试。正式发给更多用户时，需要配置 Apple Developer ID 签名和 notarization，通常需要在 GitHub Secrets 中添加：

- `APPLE_ID`
- `APPLE_TEAM_ID`
- `APPLE_PASSWORD`
- 开发者证书相关 secret

### GitHub Pages

如果想让别人直接在线体验网页版本，可以开启 GitHub Pages，并新增一个 web demo 发布工作流。

## Dependabot 说明

当前项目主要交付目标是 macOS App。Tauri 的 Linux WebKit/GTK 依赖会出现在 `Cargo.lock` 中，但 macOS 构建不会使用这些 Linux 依赖。如果 GitHub 针对 Linux-only Tauri 传递依赖产生告警，需要先确认是否影响当前支持的平台，再决定升级、等待上游 Tauri 更新，或在 GitHub Security 中标记为不适用。
