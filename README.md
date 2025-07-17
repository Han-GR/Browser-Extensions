# Browser-Extensions

本项目为多款实用浏览器插件的集合，旨在提升用户的浏览效率、隐私保护和标签管理体验。每个插件均为独立子项目，支持主流浏览器（Chrome/Edge），开箱即用。

## 使用工具

- 插件图标来源: [Flaticon](https://www.flaticon.com/)
- 图标格式: [UU在线工具](https://uutool.cn/chrome-icon/)

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

## 使用方法

### 以 Chrome/Edge 浏览器为例：

1. 下载或克隆本项目到本地。
2. 进入某个插件子文件夹（如 `Auto Tab Grouper` 或 `Tab Eraser`）。
3. 确认该文件夹下有 `manifest.json` 文件。
4. 打开浏览器，访问 `chrome://extensions/` 或 `edge://extensions/`。
5. 开启“开发者模式”。
6. 点击“加载已解压的扩展程序”，选择对应插件的文件夹。
7. 成功加载后，即可在浏览器工具栏看到插件图标，点击体验。
8. 如需卸载，点击扩展页面的“移除”按钮即可。

### 注意事项

- 插件均为本地运行，不会上传任何数据。
- 如遇权限提示，请放心授权，所有权限仅用于插件核心功能。

---


# Browser-Extensions (English)

A collection of practical browser extensions to improve tab management, privacy, and browsing efficiency. Each extension
is an independent subproject, compatible with major browsers (Chrome/Edge/partial Firefox).

## Structure

- Auto Tab Grouper: Auto group tabs by domain, manage tab groups efficiently
- Tab Eraser: Auto clear tab history on close, with whitelist for privacy
- ... (more extensions can be added)

See each subfolder's README for details.

## How to Use

### For Chrome/Edge browsers:

1. Download or clone this repository to your local machine.
2. Enter a plugin subfolder (e.g., `Auto Tab Grouper` or `Tab Eraser`).
3. Make sure the folder contains a `manifest.json` file.
4. Open your browser and go to `chrome://extensions/` or `edge://extensions/`.
5. Enable "Developer mode".
6. Click "Load unpacked" and select the plugin folder.
7. Once loaded, you will see the extension icon in the toolbar—click to use.
8. To uninstall, click "Remove" on the extensions page.

### Notes

- All extensions run locally and do not upload any data.
- If prompted for permissions, please allow; all permissions are only for core plugin features.
