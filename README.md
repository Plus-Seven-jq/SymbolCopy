# SymbolCopy — 小红书特殊符号·表情·花式字体 一键复制站

![SymbolCopy Logo](https://via.placeholder.com/150x50?text=SymbolCopy)

## 项目简介

SymbolCopy是一个零依赖、纯前端、可离线PWA应用，专为小红书用户设计，提供丰富的特殊符号、表情和花式字体，支持一键复制使用。

### 主要功能

- **丰富的符号库**：1000+特殊符号、500+颜文字表情、30种Unicode花式字体
- **多种分类**：小红书专用、装饰符号、表情符号、星座符号、塔罗牌、交通工具、武器工具、音乐艺术等
- **一键复制**：点击即可复制到剪贴板
- **实时搜索**：支持拼音/英文/符号别名搜索（防抖150ms）
- **响应式设计**：适配各种设备屏幕
- **深色/浅色模式**：自动适应系统设置，也可手动切换
- **离线可用**：PWA技术支持完全离线使用
- **零依赖**：纯HTML+CSS+JS实现，无需构建步骤

### 技术特点

- **纯原生技术栈**：HTML + Tailwind CSS + vanilla JS
- **高性能**：首屏加载小于50KB gzipped
- **PWA支持**：Service Worker缓存，可安装到主屏幕
- **SEO友好**：静态预渲染，完整的meta标签
- **可维护性**：符号库单独存储，方便增删

## 使用方法

1. 访问网站
2. 选择符号分类或使用搜索功能
3. 点击符号即可复制到剪贴板
4. 粘贴到小红书或其他应用中使用

## 部署方法

请参考[部署指南](./DEPLOY.md)了解如何将网站部署到互联网上。

## 项目结构

```
symbolcopy/
├─ index.html            # 主HTML文件
├─ sw.js                # Service Worker
├─ manifest.webmanifest  # PWA配置
├─ assets/              # 资源文件夹
│  ├─ app.js           # 主应用脚本
│  ├─ symbols.json     # 基础符号库
│  ├─ symbols2.json    # 扩展符号库
│  ├─ xiaohongshu.json # 小红书专用符号
│  ├─ kaomoji.json     # 颜文字表情
│  ├─ emoji.json       # 人物表情
│  ├─ plants.json      # 植物表情
│  ├─ mystical.json    # 神秘符号
│  ├─ tarot.json       # 塔罗牌符号
│  ├─ objects.json     # 交通、武器、音乐符号
│  └─ fonts.json       # 花式字体映射
└─ .github/workflows/   # GitHub Actions配置
   └─ deploy.yml       # 自动部署配置
```

## 贡献指南

欢迎贡献更多符号或改进功能！请按以下步骤：

1. Fork本仓库
2. 创建您的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交您的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启一个Pull Request

## 许可证

MIT License - 详见LICENSE文件

## 更新日志

- 2025-07-27: 初始版本发布
- 2025-07-27: 添加小红书专用符号
- 2025-07-27: 添加人物、食物和植物表情
- 2025-07-27: 添加占卜、神话、星座、五行和塔罗牌符号
- 2025-07-27: 添加交通工具、武器和音乐相关符号