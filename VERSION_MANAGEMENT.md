# 版本管理說明

## 分支策略

### Master 分支
- **名稱顯示**: `複合字型轉換器`
- **用途**: 正式發布版本
- **版本標示**: 無 "DEV" 前綴

### Dev 分支
- **名稱顯示**: `DEV版本-複合字型轉換器`
- **用途**: 開發測試版本
- **版本標示**: 包含 "DEV版本-" 前綴

## 自動版本日期更新

### 方法一：使用 npm script（推薦）

手動更新版本日期：
```bash
npm run update-version
```

這會自動將 `ui.html` 中的版本日期更新為當前日期（YYYYMMDD 格式）。

### 方法二：使用 Git Hook（全自動）

已設置 pre-commit hook，當 `ui.html` 被修改時會自動更新版本日期。

## 工作流程建議

1. **在 dev 分支開發**
   ```bash
   git checkout dev
   # 進行開發工作
   npm run update-version  # 更新版本日期
   git add .
   git commit -m "feat: 新功能"
   ```

2. **發布到 master 分支**
   ```bash
   git checkout master
   git merge dev  # 或使用 pull request
   npm run update-version  # 確保版本日期是最新的
   git add .
   git commit -m "release: 發布新版本"
   ```

## 檔案說明

- `manifest.json`: 插件設定檔，包含插件名稱和選單顯示名稱
- `ui.html`: 使用者介面，包含插件標題和版本資訊
- `package.json`: 包含 `update-version` 腳本用於自動更新版本日期

## 注意事項

- Git Hook 僅在當前機器有效，團隊成員需要各自設置
- npm script 方法需要手動執行，但更可控
- 版本日期格式為 YYYYMMDD（例如：20250907）
