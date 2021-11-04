# InDesign Scripts

## 安裝

macOS 上，開啟 `視窗／工用程式／程式碼`，右鍵在 Finder 裡開啟「使用者」文件夾。一般會在 `/Users/[USERNAME]/Library/Preferences/Adobe InDesign/[VERSION]/[LANG]/Scripts/Scripts Panel`。將 repo 根目錄下所需 `.jsx` 組件拽入此文件夾。當然恁亦可在此直接克隆：

```bash
git clone https://github.com/wujimacha/InDesign-Scripts
```

完成後，組件將顯示於「程式碼」視窗。

## 組件

### 導入 Markdown（`import_markdown.jsx`）

導入 `.md` 到文本框並應用對應格式。須首先選中目標文本框，再運行程式。注意：將複寫已有內容，包括既存鏈接。