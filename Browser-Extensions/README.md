# Browser-Extensions

本项目为多款实用浏览器插件的集合，旨在提升用户的浏览效率、隐私保护和标签管理体验。每个插件均为独立子项目，支持主流浏览器（Chrome/Edge），开箱即用。

## 目录结构

```
Browser-Extensions/
├── Auto Tab Grouper/      # 自动标签分组插件
├── Tab Eraser/            # 自动历史清理插件
├── ...（更多插件可扩展）
└── README.md              # 主项目说明文档
```

## 已包含插件

### 1. Auto Tab Grouper
- 自动检测新标签页的域名，相同域名自动分组
- 支持快捷键折叠/展开标签组
- 可自定义标签组名，提升多标签管理效率
- 适合需要整理大量标签页、保持浏览器整洁的用户
- 详细说明见 [Auto Tab Grouper/README.md](./Auto%20Tab%20Grouper/README.md)

### 2. Tab Eraser
- 关闭标签页时自动删除该标签页访问过的所有历史记录
- 支持白名单管理，保护隐私且不影响常用网站
- 操作本地完成，不上传数据，不影响登录状态
- 适合注重隐私、临时浏览敏感内容的用户
- 详细说明见 [Tab Eraser/README.md](./Tab%20Eraser/README.md)

## 贡献指南

欢迎贡献新插件或优化现有插件！
- 每个插件请独立建文件夹，包含manifest、源码、README等
- 代码需遵循ESLint/Prettier规范，命名语义化
- 提交前请自测主要浏览器兼容性
- 建议每个插件README包含：功能简介、使用方法、常见问题、隐私说明

## 许可协议

本项目所有插件均以 MIT License 开源，欢迎学习、使用和二次开发。

---

# Browser-Extensions (English)

A collection of practical browser extensions to improve tab management, privacy, and browsing efficiency. Each extension is an independent subproject, compatible with major browsers (Chrome/Edge/partial Firefox).

## Structure

- Auto Tab Grouper: Auto group tabs by domain, manage tab groups efficiently
- Tab Eraser: Auto clear tab history on close, with whitelist for privacy
- ... (more extensions can be added)

See each subfolder's README for details.

## Contribution

- Add new extensions as subfolders with manifest, source code, and README
- Follow code style guidelines (ESLint/Prettier)
- Test compatibility before submitting
- Each extension README should include: features, usage, FAQ, privacy

## License

All extensions are open-sourced under the MIT License. 
