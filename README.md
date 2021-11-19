# InDesign Scripts 使用手冊

以下內容將根據繁體字 InDesign 介面解說，其中術語若與恁語言相異，請見附後的「[介面術語對照](#導入-markdownimport_markdownjsx-下載)」。

## 安裝 Scripts

### macOS

1. 在 InDesign 中依次開啟 `視窗 → 工用程式 → 程式碼` 面板（快捷鍵為 `⌥⌘F11`）；
2. 右鍵「使用者」文件夾、並點擊「顯現在 Finder 中」。一般會在 `/Users/[USERNAME]/Library/Preferences/Adobe InDesign/[VERSION]/[LANG]/Scripts/Scripts Panel`。其中 `[USERNAME]` 為用家名稱、`[VERSION]`、`[LANG]` 根據 InDesign 版本和語言會有所不同；
3. 將 repo 根目錄下所需的 `.jsx` 文件拷貝於此。

### Windows

### 通用 

當然，恁亦可在上面提到的文件夾內直接克隆：

```bash
git clone https://github.com/wujimacha/InDesign-Scripts
```

完成後，所有的 scripts 將以文件層級式顯示於「程式碼」面板。

## Scripts

所有用家所需的 scripts 功能皆以此 repo 根目錄下的 `.jsx` 文件呈現。不熟悉 GitHub 的用家請[參考此處](https://stackoverflow.com/questions/4604663/download-single-files-from-github)（Stack Overflow）

### 導入 Markdown（`import_markdown.jsx`） [下載](https://raw.githubusercontent.com/wujimacha/InDesign-Scripts/main/import_markdown.jsx)

<img src="https://raw.githubusercontent.com/wujimacha/InDesign-Scripts/main/screenshots/import_markdown.gif" alt="Import Markdown 演示" width="420" />

1. 首先選中目標文本框，再雙擊運行 script；
2. 在面板內導入 `.md` 文件；
3. 設置對應的段落樣式與字元樣式。

**注意**：將複寫已有內容，包括既存鏈接。

## 介面術語對照

| 繁                        | 簡 | 日 |
|--------------------------|----|----|
| 視窗 → 工用程式 → 程式碼   |    |    |
| 使用者                   |    |    |
| 顯現在 Finder 中         |    |    |
| 段落樣式、字元樣式        |    |    |