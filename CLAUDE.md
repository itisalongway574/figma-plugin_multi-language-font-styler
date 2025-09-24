# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Figma plugin called "複合字型轉換器" (Mixed Font Converter) that automatically applies different fonts to Chinese, English, and numeric characters in text layers. The plugin analyzes text character by character and applies appropriate font settings based on language type.

## Development Commands

```bash
# Compile TypeScript to JavaScript
npm run build

# Compile and watch for file changes (development mode)
npm run watch

# Check TypeScript code standards
npm run lint

# Auto-fix code standard issues
npm run lint:fix

# Update version with current date in ui.html
npm run update-version

# Build and prepare release
npm run release

# Package plugin files for distribution
npm run package
```

## Project Structure

- `code.ts` - Main plugin logic (compiles to `code.js`)
- `ui.html` - Plugin user interface with embedded CSS and JavaScript
- `manifest.json` - Figma plugin configuration file
- `tsconfig.json` - TypeScript configuration
- `package.json` - Dependencies and build scripts
- `RELEASE_NOTES.md` - Release information and changelog

## Core Architecture

### Main Plugin File (`code.ts`)
- **Character Analysis**: Uses regex patterns to detect Chinese characters (`\u4e00-\u9fff`), English letters, and numbers
- **Text Segmentation**: Analyzes text and creates segments with different font settings for each character type
- **Font Management**: Loads available fonts and groups by font family, with automatic weight selection
- **Preset System**: Stores/loads font setting presets via `figma.clientStorage`
- **Real-time Conversion**: Always-enabled feature that automatically applies font settings when text changes
- **UI Communication**: Uses `figma.ui.postMessage()` for plugin ↔ interface communication

### Key Functions
- `loadTextStyles()` - Load existing Figma text styles
- `loadAvailableFonts()` - Get and organize available fonts with family grouping
- `getCharacterType()` - Determine if character is Chinese, English, number, or other
- `analyzeTextSegments()` - Create text segments with appropriate font settings
- `loadExistingFontsInNode()` - Analyze existing fonts in selected text nodes
- `triggerRealtimeConversionForNode()` - Real-time conversion for individual text nodes
- `getClosestFontWeight()` - Automatically select closest available font weight
- `findSimilarWeights()` - Find similar font weights when exact match unavailable

### User Interface (`ui.html`)
Single HTML file containing:
- Font selection dropdowns for Chinese, English, and number text
- Preset management (save/load/delete settings) with built-in "思源宋+Roboto Slab" preset
- Apply button to process selected text layers
- Embedded CSS styling and JavaScript interaction logic

## Font Processing Logic

1. Plugin analyzes each character in selected text nodes
2. Classifies characters as Chinese, English, number, or other
3. Groups consecutive characters of same type into segments
4. Applies different font families/styles for each segment type
5. Preserves original font weight when possible, or finds closest match
6. Maintains other text properties (size, color, etc.)
7. Real-time conversion automatically applies last settings to new text

## Technical Implementation Details

- **Target**: ES6 compilation with TypeScript
- **API**: Figma Plugin API v1.0.0
- **Permissions**: Requires `currentuser` permission for font access
- **Storage**: Font settings stored in browser's client storage space
- **Communication**: Message passing between plugin backend and UI
- **Performance**: Debounced real-time conversion (400ms delay) to optimize performance
- **Version Management**: Automatic date-based version updates in UI
- **Release Process**: Automated packaging of `manifest.json`, `ui.html`, and `code.js`

## Character Detection Patterns

- **Chinese**: `[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]` (Traditional/Simplified Chinese, Japanese Kanji)
- **English**: `[a-zA-Z]` (Uppercase and lowercase letters)
- **Numbers**: `[0-9]` (Arabic numerals)
- **Other**: Everything else (punctuation, spaces, symbols)

## Plugin State Management

- `isPluginModifying`: Prevents infinite loops during real-time conversion
- `lastAppliedSettings`: Stores last applied settings for real-time conversion
- `debounceTimeout`: Manages performance optimization for real-time updates
- `fontFamiliesData`: Cached font family data for weight matching