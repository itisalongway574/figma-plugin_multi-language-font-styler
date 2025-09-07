# 複合字型轉換器 - Figma Plugin

一個智慧的Figma插件，專為混合語言文件設計，能夠自動識別中文、英文和數字字符，並套用不同的字型設定。插件具備即時轉換功能，讓您在輸入文字時自動應用字型設定。

## 🎯 適用對象

- **一般用戶**：想要直接使用插件功能
- **開發者**：需要修改或擴展插件功能

## 🎯 主要功能

### 智慧字符識別
- **中文字符**：自動識別繁體中文、簡體中文、日文漢字等
- **英文字符**：識別英文字母和標點符號
- **數字字符**：識別阿拉伯數字
- **其他字符**：支援其他符號和特殊字符

### 字型設定選項
- **字型模式**：選擇特定字體家族和字重
- **樣式模式**：使用Figma的Text Style
- **字型大小**：支援預設大小或自訂尺寸
- **字重保持**：可選擇維持原始字重設定

### 即時轉換功能
- **總是啟用**：插件啟動後自動開啟即時轉換
- **智慧偵測**：輸入文字時自動套用字型設定
- **防抖機制**：優化性能，避免頻繁處理

### 預設組合管理
- **內建組合**：「思源宋+Roboto Slab」不可刪除的預設組合
- **自訂組合**：儲存個人化的字型組合設定
- **雲端同步**：設定與Figma帳戶同步，跨裝置可用

## 🚀 快速開始

### 📦 一般用戶安裝（無需程式開發背景）

#### 方法一：直接下載使用（推薦）

1. **下載必要檔案**：
   - 到 [Releases 頁面](https://github.com/itisalongway574/figma-plugin_multi-language-font-styler/releases) 下載最新版本
   - 或直接下載這三個檔案：`manifest.json`、`ui.html`、`code.js`

2. **安裝到 Figma**：
   - 在 Figma Desktop 中，點選選單 `Plugins` → `Development` → `Import plugin from manifest...`
   - 選擇下載的 `manifest.json` 檔案
   - 插件即安裝完成

#### 方法二：下載整個專案

1. **下載專案**：
   - 點擊 GitHub 頁面的綠色 `Code` 按鈕
   - 選擇 `Download ZIP`
   - 解壓縮檔案

2. **安裝到 Figma**：
   - 找到解壓後資料夾中的 `manifest.json`
   - 在 Figma Desktop 中，點選選單 `Plugins` → `Development` → `Import plugin from manifest...`
   - 選擇 `manifest.json` 檔案

### 🛠 開發者安裝

#### 環境需求
- Node.js (建議使用最新LTS版本)
- TypeScript
- Figma桌面版

#### 安裝步驟

1. **Clone 專案**
   ```bash
   git clone https://github.com/itisalongway574/figma-plugin_multi-language-font-styler.git
   cd figma-plugin_multi-language-font-styler
   ```

2. **安裝依賴套件**
   ```bash
   npm install
   ```

3. **編譯 TypeScript**
   ```bash
   # 一次性編譯
   npm run build
   
   # 監聽模式（推薦開發時使用）
   npm run watch
   ```

4. **在Figma中載入插件**
   - 開啟Figma Desktop
   - 前往 `Plugins` → `Development` → `Import plugin from manifest...`
   - 選擇此專案的 `manifest.json` 檔案

### 🔧 開發指令

```bash
# 基本開發指令
npm run build        # 編譯TypeScript
npm run watch        # 監聽檔案變化並自動編譯
npm run lint         # 程式碼檢查
npm run lint:fix     # 自動修復程式碼風格問題

# 版本管理指令
npm run update-version  # 更新版本日期到今天
npm run release        # 建立發布版本（編譯 + 更新版本）
npm run package        # 打包發布檔案到 release/ 資料夾
```

### 📦 發布流程

**開發者發布新版本：**

```bash
# 在 dev 分支開發
git checkout dev
# 開發完成後
npm run package
git add .
git commit -m "feat: 新功能"
git push origin dev

# 發布到正式版本
git checkout main
git merge dev
npm run release
git add .
git commit -m "release: 發布新版本"
git push origin main
```

## 📖 使用方式

### 基本操作

1. **選擇目標元件**
   - 選擇包含文字的Figma元件
   - 插件會自動偵測選取範圍內的文字圖層

2. **設定字型參數**
   - **中文設定**：選擇中文字符使用的字型或樣式
   - **英文設定**：選擇英文字符使用的字型或樣式  
   - **數字設定**：可選擇同步英文設定或獨立設定

3. **應用設定**
   - 點擊「應用樣式」按鈕套用設定
   - 即時轉換功能會自動記住此次設定

### 進階功能

#### 預設組合使用
- 使用內建的「思源宋+Roboto Slab」組合
- 建立自訂組合並儲存供日後使用
- 一鍵載入已儲存的組合設定

#### 即時轉換
- 套用設定後，新輸入的文字會自動轉換
- 支援編輯現有文字時的即時轉換
- 智慧避免無限迴圈的轉換衝突

## 🛠 技術架構

### 📁 專案結構
```
專案根目錄/
├── manifest.json              # 插件設定檔 ✅ 用戶需要
├── ui.html                   # 使用者介面 ✅ 用戶需要
├── code.js                   # 編譯後的主程式 ✅ 用戶需要 (自動生成)
├── code.ts                   # TypeScript 源碼 🔧 開發用
├── package.json              # NPM 專案設定 🔧 開發用
├── tsconfig.json             # TypeScript 設定 🔧 開發用
├── .gitignore               # Git 忽略清單 🔧 開發用
├── node_modules/            # 開發依賴套件 🔧 開發用 (不包含在版本控制)
├── release/                 # 乾淨的發布版本 📦 發布用
│   ├── manifest.json
│   ├── ui.html
│   └── code.js
├── README.md                # 專案說明文件
├── VERSION_MANAGEMENT.md    # 版本管理說明
└── USER_INSTALLATION.md    # 用戶安裝指南
```

### 🌿 分支管理

- **`main` 分支**：穩定的正式版本
  - 名稱顯示：「複合字型轉換器」
  - 用於正式發布和用戶下載
  
- **`dev` 分支**：開發測試版本  
  - 名稱顯示：「DEV版本-複合字型轉換器」
  - 用於日常開發和功能測試

### 核心技術
- **TypeScript**：型別安全的JavaScript開發
- **Figma Plugin API**：與Figma整合的官方API
- **客戶端儲存**：使用`figma.clientStorage`儲存使用者設定
- **文件事件監聽**：實現即時轉換功能
- **正規表達式**：精準的字符類型識別

### 字符識別邏輯
```typescript
function getCharacterType(char: string) {
  // 中文字符 (包含繁體、簡體中文、日文漢字等)
  if (/[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/.test(char)) {
    return 'chinese';
  }
  // 英文字符
  if (/[a-zA-Z]/.test(char)) {
    return 'english';
  }
  // 數字字符
  if (/[0-9]/.test(char)) {
    return 'number';
  }
  return 'other';
}
```

## 🎨 介面設計

### 使用者體驗
- **直觀操作**：清晰的視覺層次和操作流程
- **即時回饋**：狀態指示器和通知訊息
- **響應式設計**：適應不同螢幕尺寸

### 視覺風格
- **配色方案**：溫暖的棕色調主題
- **按鈕設計**：清楚的主要/次要按鈕區別
- **字型顯示**：使用系統字型確保一致性

## 📋 版本資訊

### 當前版本：20250907

#### 主要更新
- ✅ 全面重構即時轉換功能，總是啟用無需手動開關
- ✅ 新增內建「思源宋+Roboto Slab」預設組合
- ✅ 優化字符識別演算法，提升準確度
- ✅ 改善使用者介面設計和互動體驗
- ✅ 強化錯誤處理和效能優化

## 🤝 開發貢獻

### 程式碼風格
- 使用ESLint進行程式碼檢查
- 遵循TypeScript最佳實踐
- 保持程式碼註解的完整性（繁體中文）

### 🧪 測試建議
1. **語言混合測試**：測試不同語言的文字混合場景
2. **字型相容性**：驗證各種字型和樣式的相容性
3. **即時轉換**：確認即時轉換功能的穩定性
4. **預設組合**：檢查預設組合的載入和使用
5. **分支測試**：確認 main/dev 分支版本名稱正確顯示

### 🔄 提交規範
```bash
feat: 新增功能
fix: 修復錯誤
docs: 文件更新
style: 程式碼風格調整
refactor: 程式碼重構
test: 測試相關
chore: 其他維護性工作
release: 版本發布
```

## 📄 授權資訊

此專案遵循相關開源授權條款。

## 🆘 常見問題

### 安裝相關

**Q: 我不是工程師，可以使用這個插件嗎？**
A: 可以！直接下載 `manifest.json`、`ui.html`、`code.js` 三個檔案，然後在 Figma 中載入即可。

**Q: 為什麼某些字型無法正確載入？**
A: 請確認該字型已安裝在您的系統中，或在Figma中可用。

**Q: 下載整個專案後檔案很多，我需要全部嗎？**
A: 不需要！一般用戶只需要三個檔案：`manifest.json`、`ui.html`、`code.js`。

### 功能相關

**Q: 即時轉換不生效怎麼辦？**
A: 請先套用一次樣式設定，即時轉換會記住您的最後設定。

**Q: 可以自訂字符識別規則嗎？**
A: 目前版本使用固定的識別邏輯，未來版本會考慮加入自訂功能。

**Q: 如何備份我的預設組合？**
A: 預設組合會自動與您的Figma帳戶同步，無需手動備份。

### 開發相關

**Q: `node_modules` 資料夾為什麼不在版本控制中？**
A: 因為只包含開發工具，一般用戶不需要。開發者請執行 `npm install` 安裝。

**Q: 如何更新版本日期？**
A: 開發者可使用 `npm run update-version` 自動更新為當前日期。

**Q: main 和 dev 分支有什麼差別？**
A: main 是穩定版本（顯示「複合字型轉換器」），dev 是開發版本（顯示「DEV版本-複合字型轉換器」）。

---

## 📞 聯絡資訊

如有任何問題或建議，歡迎：
- 提出 [GitHub Issue](https://github.com/itisalongway574/figma-plugin_multi-language-font-styler/issues)
- 送出 Pull Request 
- 透過 GitHub 聯絡專案維護者

感謝您使用複合字型轉換器！🎉