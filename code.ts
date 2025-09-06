// 主要程式碼檔案 (code.ts)
figma.showUI(__html__, { width: 280, height: 560 });

// 初始化數據
let textStyles: any[] = [];
let presets: any[] = [];
let availableFonts: any[] = [];
let fontFamiliesData: { [key: string]: string[] } = {};

// 載入已有的 Text Styles
async function loadTextStyles() {
    const styles = figma.getLocalTextStyles();
    textStyles = styles.map(style => ({
        id: style.id,
        name: style.name
    }));
    figma.ui.postMessage({
        type: 'textStyles',
        styles: textStyles
    });
}

// 載入可用字體
async function loadAvailableFonts() {
    const fonts = await figma.listAvailableFontsAsync();
    availableFonts = fonts.map(font => ({
        family: font.fontName.family,
        style: font.fontName.style
    }));

    // 將字體按照 family 分組
    const fontFamilies: { [key: string]: string[] } = {};
    for (const font of availableFonts) {
        if (!fontFamilies[font.family]) {
            fontFamilies[font.family] = [];
        }
        fontFamilies[font.family].push(font.style);
    }
    
    // 儲存字體家族數據供後續使用
    fontFamiliesData = fontFamilies;

    figma.ui.postMessage({
        type: 'availableFonts',
        fonts: fontFamilies
    });
}

// 載入已保存的預設集
async function loadPresets() {
    const savedPresets = await figma.clientStorage.getAsync('languagePresets') || [];
    presets = savedPresets;
    figma.ui.postMessage({
        type: 'presets',
        presets: presets
    });
}

// 字符類型檢測函數
function getCharacterType(char: string): 'chinese' | 'english' | 'number' | 'other' {
    // 中文字符 (包含繁體、簡體中文、日文漢字等)
    if (/[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/.test(char)) {
        return 'chinese';
    }
    // 英文字符 (包含大小寫字母)
    if (/[a-zA-Z]/.test(char)) {
        return 'english';
    }
    // 數字字符
    if (/[0-9]/.test(char)) {
        return 'number';
    }
    // 其他字符 (標點符號、空格等)
    return 'other';
}

// 文字段落接口
interface TextSegment {
    type: 'chinese' | 'english' | 'number' | 'other';
    start: number;
    end: number;
    settings: any;
}

// 分析文字段落函數
function analyzeTextSegments(characters: string, chineseSettings: any, englishSettings: any, numberSettings: any): TextSegment[] {
    const segments: TextSegment[] = [];
    let currentSegment: TextSegment | null = null;
    
    for (let i = 0; i < characters.length; i++) {
        const char = characters[i];
        const charType = getCharacterType(char);
        
        // 根據字符類型選擇設置
        let settings = null;
        if (charType === 'chinese') {
            settings = chineseSettings;
        } else if (charType === 'english') {
            settings = englishSettings;
        } else if (charType === 'number') {
            settings = numberSettings;
        }
        
        // 檢查是否需要開始新段落
        const needNewSegment = !currentSegment || 
            currentSegment.type !== charType || 
            !settingsEqual(currentSegment.settings, settings);
        
        if (needNewSegment) {
            // 完成當前段落
            if (currentSegment) {
                currentSegment.end = i;
                segments.push(currentSegment);
            }
            
            // 開始新段落
            currentSegment = {
                type: charType,
                start: i,
                end: i + 1,
                settings: settings
            };
        } else {
            // 延續當前段落
            currentSegment!.end = i + 1;
        }
    }
    
    // 完成最後一個段落
    if (currentSegment) {
        segments.push(currentSegment);
    }
    
    return segments;
}

// 比較兩個設置是否相同
function settingsEqual(settings1: any, settings2: any): boolean {
    if (!settings1 && !settings2) return true;
    if (!settings1 || !settings2) return false;
    
    if (settings1.type !== settings2.type) return false;
    
    if (settings1.type === 'textStyle') {
        return settings1.styleId === settings2.styleId;
    } else if (settings1.type === 'font') {
        return settings1.fontFamily === settings2.fontFamily && 
               settings1.fontWeight === settings2.fontWeight &&
               settings1.fontSize === settings2.fontSize;
    }
    
    return false;
}

// 載入文字節點中所有現有的字體
async function loadExistingFontsInNode(node: TextNode): Promise<void> {
    const uniqueFonts = new Set<string>();
    const characters = node.characters;
    
    // 收集所有不同的字體
    for (let i = 0; i < characters.length; i++) {
        try {
            const fontName = node.getRangeFontName(i, i + 1);
            if (typeof fontName === 'object' && fontName.family && fontName.style) {
                uniqueFonts.add(`${fontName.family}|${fontName.style}`);
            }
        } catch (error) {
            // 忽略單個字符的錯誤
        }
    }
    
    // 載入所有發現的字體
    const loadPromises = Array.from(uniqueFonts).map(fontKey => {
        const [family, style] = fontKey.split('|');
        return figma.loadFontAsync({ family, style }).catch(err => {
            console.error(`載入現有字體失敗 ${family} ${style}:`, err);
            return null;
        });
    });
    
    await Promise.all(loadPromises);
}

// 自動選擇最接近的字重
function getClosestFontWeight(targetFamily: string, availableFonts: { [key: string]: string[] }, originalWeight?: string): string | null {
    if (!availableFonts[targetFamily]) {
        return null;
    }
    
    const weights = availableFonts[targetFamily];
    
    // 如果提供了原始字重，並且目標字體家族有相同的字重，優先使用
    if (originalWeight && weights.indexOf(originalWeight) !== -1) {
        console.log(`保持原始字重: ${originalWeight}`);
        return originalWeight;
    }
    
    // 如果原始字重不存在，嘗試找到相似的字重
    if (originalWeight) {
        const similarWeights = findSimilarWeights(originalWeight, weights);
        if (similarWeights.length > 0) {
            console.log(`找到相似字重: ${similarWeights[0]} (原始: ${originalWeight})`);
            return similarWeights[0];
        }
    }
    
    // 最後使用預設優先順序
    const weightPriority = [
        'Regular', 'Medium', 'SemiBold', 'Semi Bold', 'Semibold',
        'Bold', 'Light', 'Black', 'Thin', 'ExtraLight', 'ExtraBold',
        'Heavy', 'UltraLight', 'UltraBold'
    ];
    
    for (const preferredWeight of weightPriority) {
        if (weights.indexOf(preferredWeight) !== -1) {
            return preferredWeight;
        }
    }
    
    // 如果沒有找到標準字重，返回第一個可用的字重
    return weights[0] || null;
}

// 尋找相似字重
function findSimilarWeights(originalWeight: string, availableWeights: string[]): string[] {
    // 字重分組：相似的字重會優先互相替代
    const weightGroups: { [key: string]: string[] } = {
        thin: ['Thin', 'UltraLight', 'ExtraLight'],
        light: ['Light', 'ExtraLight'],
        regular: ['Regular', 'Normal', 'Book'],
        medium: ['Medium', 'SemiBold', 'Semi Bold', 'Semibold'],
        bold: ['Bold', 'SemiBold', 'Semi Bold', 'Semibold'],
        heavy: ['Black', 'Heavy', 'ExtraBold', 'UltraBold', 'Bold']
    };
    
    // 找到原始字重所屬的組
    let targetGroup: string[] | null = null;
    for (const groupName in weightGroups) {
        const groupWeights = weightGroups[groupName];
        if (groupWeights.indexOf(originalWeight) !== -1) {
            targetGroup = groupWeights;
            break;
        }
    }
    
    if (!targetGroup) return [];
    
    // 在可用字重中尋找同組的字重
    const similarWeights: string[] = [];
    for (const weight of targetGroup) {
        if (availableWeights.indexOf(weight) !== -1) {
            similarWeights.push(weight);
        }
    }
    
    return similarWeights;
}

// 初始化
loadTextStyles();
loadAvailableFonts();
loadPresets();

// 遞歸查找所有文字圖層的函式
function findAllTextNodes(nodes: readonly SceneNode[]): TextNode[] {
    const textNodes: TextNode[] = [];
    
    function traverse(node: SceneNode) {
        if (node.type === 'TEXT') {
            textNodes.push(node as TextNode);
        } else if ('children' in node) {
            // 如果節點有子節點，遞歸檢查每個子節點
            for (const child of node.children) {
                traverse(child);
            }
        }
    }
    
    for (const node of nodes) {
        traverse(node);
    }
    
    return textNodes;
}

// 監聽選擇改變
figma.on('selectionchange', () => {
    const selection = figma.currentPage.selection;
    const textNodes = findAllTextNodes(selection);
    const hasTextNode = textNodes.length > 0;

    figma.ui.postMessage({
        type: 'selectionChange',
        hasTextNode: hasTextNode
    });
});

// 處理來自 UI 的訊息
figma.ui.onmessage = async (msg) => {
    if (msg.type === 'applyStyles') {
        const selection = figma.currentPage.selection;
        const textNodes = findAllTextNodes(selection);

        if (textNodes.length === 0) {
            figma.notify('請選擇包含文字圖層的元素');
            return;
        }

        const chineseSettings = msg.chineseSettings;
        const englishSettings = msg.englishSettings;
        const numberSettings = msg.numberSettings;

        try {
            for (const node of textNodes) {
                // 首先載入節點中所有現有的字體
                await loadExistingFontsInNode(node);
                
                const characters = node.characters;
                
                // 收集所有需要加載的字體
                const fontsToLoad = new Set<string>();
                
                // 分析文字並收集字體需求
                const segments = analyzeTextSegments(characters, chineseSettings, englishSettings, numberSettings);
                
                console.log('分析結果:', segments); // 除錯用
                
                // 收集所有需要載入的字體
                for (const segment of segments) {
                    if (segment.settings && segment.settings.type === 'font' && segment.settings.fontFamily) {
                        // 自動選擇字重（如果未指定）
                        let fontWeight = segment.settings.fontWeight;
                        if (!fontWeight) {
                            // 獲取該段落中第一個字符的原始字重
                            let originalWeight: string | null = null;
                            try {
                                const firstCharFont = node.getRangeFontName(segment.start, segment.start + 1);
                                if (typeof firstCharFont === 'object' && firstCharFont.style) {
                                    originalWeight = firstCharFont.style;
                                }
                            } catch (error) {
                                // 忽略錯誤
                            }
                            
                            fontWeight = getClosestFontWeight(segment.settings.fontFamily, fontFamiliesData, originalWeight || undefined);
                        }
                        
                        if (fontWeight) {
                            fontsToLoad.add(`${segment.settings.fontFamily}|${fontWeight}`);
                        }
                    }
                }
                
                console.log('需要載入的字體:', Array.from(fontsToLoad)); // 除錯用
                
                // 載入所有需要的字體
                const fontLoadPromises = Array.from(fontsToLoad).map(fontKey => {
                    const [family, style] = fontKey.split('|');
                    return figma.loadFontAsync({ family, style }).catch(err => {
                        console.error(`無法載入字體 ${family} ${style}:`, err);
                        return null;
                    });
                });
                
                await Promise.all(fontLoadPromises);
                
                // 按段落應用字體樣式
                for (const segment of segments) {
                    if (segment.settings) {
                        try {
                            console.log(`處理段落: "${characters.slice(segment.start, segment.end)}" (${segment.start}-${segment.end}), 類型: ${segment.type}`);
                            
                            if (segment.settings.type === 'textStyle' && segment.settings.styleId) {
                                console.log(`套用文字樣式: ${segment.settings.styleId}`);
                                node.setRangeTextStyleId(segment.start, segment.end, segment.settings.styleId);
                            }
                            else if (segment.settings.type === 'font' && segment.settings.fontFamily) {
                                // 自動選擇字重（如果未指定）
                                let fontWeight = segment.settings.fontWeight;
                                if (!fontWeight) {
                                    // 獲取該段落中第一個字符的原始字重
                                    let originalWeight: string | null = null;
                                    try {
                                        const firstCharFont = node.getRangeFontName(segment.start, segment.start + 1);
                                        if (typeof firstCharFont === 'object' && firstCharFont.style) {
                                            originalWeight = firstCharFont.style;
                                        }
                                    } catch (error) {
                                        // 忽略錯誤
                                    }
                                    
                                    fontWeight = getClosestFontWeight(segment.settings.fontFamily, fontFamiliesData, originalWeight || undefined);
                                    console.log(`自動選擇字重: ${fontWeight} (原始: ${originalWeight})`);
                                }
                                
                                if (fontWeight) {
                                    console.log(`套用字體: ${segment.settings.fontFamily} ${fontWeight}`);
                                    // 設置字體
                                    node.setRangeFontName(segment.start, segment.end, {
                                        family: segment.settings.fontFamily,
                                        style: fontWeight
                                    });

                                    // 設置字體大小
                                    if (segment.settings.fontSize && segment.settings.fontSize !== 'keep') {
                                        const fontSize = parseInt(segment.settings.fontSize);
                                        if (!isNaN(fontSize)) {
                                            console.log(`套用字體大小: ${fontSize}`);
                                            node.setRangeFontSize(segment.start, segment.end, fontSize);
                                        }
                                    }
                                } else {
                                    console.log(`無法找到字體家族的可用字重: ${segment.settings.fontFamily}`);
                                }
                            }
                        } catch (error) {
                            console.error(`處理文字段落 "${characters.slice(segment.start, segment.end)}" 時發生錯誤:`, error);
                            figma.notify(`處理段落時發生錯誤: ${(error as Error).message}`);
                        }
                    }
                }
            }
            figma.notify('已應用多語系字型樣式');
        } catch (error) {
            console.error('應用樣式失敗:', error);
            figma.notify('應用樣式時發生錯誤');
        }
    }

    else if (msg.type === 'savePreset') {
        const newPreset = {
            id: Date.now().toString(),
            name: msg.name,
            chineseSettings: msg.chineseSettings,
            englishSettings: msg.englishSettings,
            numberSettings: msg.numberSettings
        };

        presets.push(newPreset);
        await figma.clientStorage.setAsync('languagePresets', presets);

        figma.ui.postMessage({
            type: 'presets',
            presets: presets
        });

        figma.notify(`已保存預設集：${msg.name}`);
    }

    else if (msg.type === 'deletePreset') {
        const filteredPresets = presets.filter(preset => preset.id !== msg.presetId);
        presets = filteredPresets;
        await figma.clientStorage.setAsync('languagePresets', presets);

        figma.ui.postMessage({
            type: 'presets',
            presets: presets
        });

        figma.notify('已刪除預設集');
    }

    else if (msg.type === 'loadPreset') {
        const preset = presets.find(p => p.id === msg.presetId);
        if (preset) {
            figma.ui.postMessage({
                type: 'loadedPreset',
                preset: preset
            });
        }
    }
};