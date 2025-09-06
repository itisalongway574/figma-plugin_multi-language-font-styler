# CLAUDE.md

此檔案為 Claude Code (claude.ai/code) 在此專案中工作時的指導文件。

## 專案概述

這是一個名為「dev複合字型轉換器」的 Figma 外掛，可以自動為文字圖層中的中文、英文和數字字元套用不同的字型。外掛會逐字分析文字內容，並根據語言類型套用適當的字型設定。

## 開發指令

```bash
# 將 TypeScript 編譯為 JavaScript
npm run build

# 編譯並監控檔案變更（開發模式）
npm run watch

# 檢查 TypeScript 程式碼規範
npm run lint

# 自動修正程式碼規範問題
npm run lint:fix
```

## 專案結構

- `code.ts` - 主要外掛邏輯（編譯為 `code.js`）
- `ui.html` - 外掛使用者介面，包含嵌入的 CSS 和 JavaScript
- `manifest.json` - Figma 外掛設定檔
- `tsconfig.json` - TypeScript 設定檔
- `package.json` - 相依套件和建置腳本

## 核心架構

### 主要外掛檔案 (`code.ts`)
- **字元分析**：使用正規表達式模式檢測中文字元（`\u4e00-\u9fff`）、英文字母和數字
- **文字分段**：分析文字並為每種字元類型建立不同字型設定的段落
- **字型管理**：載入可用字型並按字型家族分組
- **預設集系統**：透過 `figma.clientStorage` 儲存/載入字型設定預設集
- **介面通訊**：使用 `figma.ui.postMessage()` 進行外掛 ↔ 介面通訊

### 關鍵函式
- `loadTextStyles()` - 載入現有的 Figma 文字樣式
- `loadAvailableFonts()` - 取得並整理可用字型
- `getCharacterType()` - 判斷字元是中文、英文、數字或其他
- `analyzeTextSegments()` - 建立具有適當字型設定的文字段落
- `loadExistingFontsInNode()` - 分析選取文字中現有的字型

### 使用者介面 (`ui.html`)
單一 HTML 檔案包含：
- 中文、英文和數字文字的字型選擇下拉選單
- 預設集管理（儲存/載入/刪除設定）
- 套用按鈕以處理選取的文字圖層
- 嵌入的 CSS 樣式和 JavaScript 互動功能

## 字型處理邏輯

1. 外掛分析選取文字節點中的每個字元
2. 將字元分類為中文、英文、數字或其他
3. 將相同類型的連續字元組合成段落
4. 為每種段落類型套用不同的字型家族/樣式
5. 保留其他文字屬性（大小、顏色等）

## 開發備註

- 外掛針對 ES6 並需要 TypeScript 編譯
- 使用 Figma Plugin API v1.0.0
- 需要 `currentuser` 權限以存取字型
- 字型設定儲存在瀏覽器的客戶端儲存空間
- 介面透過訊息傳遞與外掛後端通訊