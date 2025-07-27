// 更新时间：2025-07-27
// SymbolCopy 主应用脚本

/**
 * SymbolCopy - 特殊符号·表情·花式字体 一键复制站
 * 
 * 这是一个零依赖、纯前端、可离线PWA应用，提供特殊符号、颜文字表情和花式字体转换功能
 * This is a zero-dependency, pure frontend, offline-capable PWA that provides special symbols,
 * kaomoji emoticons, and fancy font conversion features
 */

// 全局状态管理
const state = {
  currentTab: 'symbols', // 当前标签页：'symbols', 'kaomoji', 'fonts'
  currentCategory: 'all', // 当前分类
  searchQuery: '', // 当前搜索查询
  symbols: [], // 符号数据
  kaomoji: [], // 颜文字数据
  fonts: [], // 字体数据
  searchResults: [], // 搜索结果
  fuseInstance: null, // Fuse.js 实例
};

// DOM 元素引用
const elements = {
  tabs: document.querySelectorAll('.tab-btn'),
  symbolsGrid: document.getElementById('symbols-grid'),
  kaomojiGrid: document.getElementById('kaomoji-grid'),
  fontsArea: document.getElementById('fonts-area'),
  fontsGrid: document.getElementById('fonts-grid'),
  fontInput: document.getElementById('font-input'),
  searchInput: document.getElementById('search-input'),
  searchResults: document.getElementById('search-results'),
  searchResultsGrid: document.getElementById('search-results-grid'),
  searchQuery: document.getElementById('search-query'),
  noResults: document.getElementById('no-results'),
  loading: document.getElementById('loading'),
  copyToast: document.getElementById('copy-toast'),
  themeToggle: document.getElementById('theme-toggle'),
  categoryToggle: document.getElementById('category-toggle'),
  categoryDropdown: document.getElementById('category-dropdown'),
  currentCategory: document.getElementById('current-category'),
};

// 初始化应用
async function initApp() {
  try {
  // 并行加载所有数据
  const [symbolsData, symbols2Data, kaomojiData, fontsData, xiaohongshuData, emojiData, plantsData, mysticalData, tarotData, objectsData] = await Promise.all([
    fetchData('./assets/symbols.json'),
    fetchData('./assets/symbols2.json'),
    fetchData('./assets/kaomoji.json'),
    fetchData('./assets/fonts.json'),
    fetchData('./assets/xiaohongshu.json'),
    fetchData('./assets/emoji.json'),
    fetchData('./assets/plants.json'),
    fetchData('./assets/mystical.json'),
    fetchData('./assets/tarot.json'),
    fetchData('./assets/objects.json'),
  ]);
  
  // 存储数据到状态
  state.symbols = [...symbolsData, ...symbols2Data, ...xiaohongshuData, ...emojiData, ...plantsData, ...mysticalData, ...tarotData, ...objectsData];
  state.kaomoji = kaomojiData;
  state.fonts = fontsData;
    
    // 初始化搜索引擎
    initSearchEngine();
    
    // 渲染初始内容
    renderCurrentTab();
    
    // 隐藏加载指示器
    elements.loading.classList.add('hidden');
    
    // 显示当前标签内容
    document.getElementById(`${state.currentTab}-grid`)?.classList.remove('hidden');
    if (state.currentTab === 'fonts') {
      elements.fontsArea.classList.remove('hidden');
    }
    
    // 设置事件监听器
    setupEventListeners();
    
    // 检查URL参数
    handleUrlParams();
    
  } catch (error) {
    console.error('初始化应用失败:', error);
    elements.loading.innerHTML = `
      <div class="text-center">
        <p class="text-red-500 mb-2">加载数据失败: ${error.message}</p>
        <p class="text-sm text-gray-500 mb-4">请检查控制台获取详细错误信息</p>
        <button class="px-4 py-2 bg-primary text-white rounded-lg" onclick="location.reload()">重试</button>
      </div>
    `;
  }
}

// 获取数据
async function fetchData(url) {
  try {
    console.log(`正在获取数据: ${url}`);
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`获取数据失败: ${response.status} ${response.statusText}`);
      throw new Error(`获取数据失败: ${response.status}`);
    }
    const data = await response.json();
    console.log(`数据获取成功: ${url}`, data.length ? `包含 ${data.length} 项` : '');
    return data;
  } catch (error) {
    console.error(`获取数据出错 (${url}):`, error);
    throw error;
  }
}

// 初始化搜索引擎
function initSearchEngine() {
  // 准备搜索数据
  const searchData = [
    ...state.symbols.map(item => ({ 
      ...item, 
      type: 'symbol',
      searchContent: `${item.symbol} ${item.name} ${item.tags?.join(' ') || ''}`
    })),
    ...state.kaomoji.map(item => ({ 
      ...item, 
      type: 'kaomoji',
      searchContent: `${item.kaomoji} ${item.name} ${item.tags?.join(' ') || ''}`
    })),
  ];
  
  // 配置 Fuse.js
  const options = {
    keys: ['searchContent'],
    threshold: 0.3, // 匹配阈值
    ignoreLocation: true,
    useExtendedSearch: true,
  };
  
  // 创建 Fuse 实例
  state.fuseInstance = new Fuse(searchData, options);
}

// 设置事件监听器
function setupEventListeners() {
  // 标签切换
  elements.tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.dataset.tab;
      switchTab(tabName);
    });
  });
  
  // 搜索输入
  elements.searchInput.addEventListener('input', debounce(handleSearch, 150));
  
  // 字体输入
  elements.fontInput.addEventListener('input', handleFontInput);
  
  // 主题切换
  elements.themeToggle.addEventListener('click', toggleTheme);
  
  // 分类下拉菜单
  elements.categoryToggle.addEventListener('click', () => {
    elements.categoryDropdown.classList.toggle('hidden');
  });
  
  // 点击外部关闭下拉菜单
  document.addEventListener('click', (e) => {
    if (!elements.categoryToggle.contains(e.target) && !elements.categoryDropdown.contains(e.target)) {
      elements.categoryDropdown.classList.add('hidden');
    }
  });
  
  // 分类选择
  document.querySelectorAll('#category-dropdown button').forEach(button => {
    button.addEventListener('click', () => {
      const category = button.dataset.category;
      changeCategory(category);
      elements.categoryDropdown.classList.add('hidden');
    });
  });
}

// 切换标签
function switchTab(tabName) {
  // 更新当前标签
  state.currentTab = tabName;
  
  // 更新标签按钮样式
  elements.tabs.forEach(tab => {
    if (tab.dataset.tab === tabName) {
      tab.classList.add('border-primary', 'text-primary');
      tab.classList.remove('border-transparent');
    } else {
      tab.classList.remove('border-primary', 'text-primary');
      tab.classList.add('border-transparent');
    }
  });
  
  // 隐藏所有内容区域
  elements.symbolsGrid.classList.add('hidden');
  elements.kaomojiGrid.classList.add('hidden');
  elements.fontsArea.classList.add('hidden');
  elements.searchResults.classList.add('hidden');
  
  // 显示当前标签内容
  if (state.searchQuery) {
    elements.searchResults.classList.remove('hidden');
  } else {
    if (tabName === 'fonts') {
      elements.fontsArea.classList.remove('hidden');
    } else {
      document.getElementById(`${tabName}-grid`).classList.remove('hidden');
    }
  }
  
  // 渲染当前标签内容
  renderCurrentTab();
  
  // 更新URL
  updateUrl();
}

// 渲染当前标签内容
function renderCurrentTab() {
  if (state.searchQuery) {
    renderSearchResults();
    return;
  }
  
  switch (state.currentTab) {
    case 'symbols':
      renderSymbols();
      break;
    case 'kaomoji':
      renderKaomoji();
      break;
    case 'fonts':
      renderFonts();
      break;
  }
}

// 渲染符号
function renderSymbols() {
  let filteredSymbols = state.symbols;
  
  // 应用分类过滤
  if (state.currentCategory !== 'all') {
    filteredSymbols = filteredSymbols.filter(symbol => 
      symbol.category === state.currentCategory || 
      (symbol.tags && symbol.tags.includes(state.currentCategory))
    );
  }
  
  // 生成HTML
  const symbolsHtml = filteredSymbols.map(symbol => `
    <div class="symbol-item p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md cursor-pointer text-center transition-all" 
         data-symbol="${escapeHtml(symbol.symbol)}" 
         data-name="${escapeHtml(symbol.name)}"
         onclick="copyToClipboard('${escapeJsString(symbol.symbol)}')">
      <div class="text-xl mb-1">${escapeHtml(symbol.symbol)}</div>
      <div class="text-xs text-gray-500 dark:text-gray-400 truncate" title="${escapeHtml(symbol.name)}">${escapeHtml(symbol.name)}</div>
    </div>
  `).join('');
  
  // 更新DOM
  elements.symbolsGrid.innerHTML = symbolsHtml || '<p class="col-span-full text-center py-8 text-gray-500">没有符合条件的符号</p>';
}

// 渲染颜文字
function renderKaomoji() {
  let filteredKaomoji = state.kaomoji;
  
  // 应用分类过滤
  if (state.currentCategory !== 'all') {
    filteredKaomoji = filteredKaomoji.filter(kaomoji => 
      kaomoji.category === state.currentCategory || 
      (kaomoji.tags && kaomoji.tags.includes(state.currentCategory))
    );
  }
  
  // 生成HTML
  const kaomojiHtml = filteredKaomoji.map(kaomoji => `
    <div class="symbol-item p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md cursor-pointer text-center transition-all" 
         data-kaomoji="${escapeHtml(kaomoji.kaomoji)}" 
         data-name="${escapeHtml(kaomoji.name)}"
         onclick="copyToClipboard('${escapeJsString(kaomoji.kaomoji)}')">
      <div class="text-xl mb-1">${escapeHtml(kaomoji.kaomoji)}</div>
      <div class="text-xs text-gray-500 dark:text-gray-400 truncate" title="${escapeHtml(kaomoji.name)}">${escapeHtml(kaomoji.name)}</div>
    </div>
  `).join('');
  
  // 更新DOM
  elements.kaomojiGrid.innerHTML = kaomojiHtml || '<p class="col-span-full text-center py-8 text-gray-500">没有符合条件的颜文字</p>';
}

// 渲染字体
function renderFonts() {
  const inputText = elements.fontInput.value || '请输入文字进行转换';
  
  // 生成HTML
  const fontsHtml = state.fonts.map(font => {
    const convertedText = convertText(inputText, font.mapping);
    return `
      <div class="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md cursor-pointer transition-all"
           onclick="copyToClipboard('${escapeJsString(convertedText)}')">
        <div class="text-lg mb-2 break-all">${escapeHtml(convertedText)}</div>
        <div class="text-xs text-gray-500 dark:text-gray-400">${escapeHtml(font.name)}</div>
      </div>
    `;
  }).join('');
  
  // 更新DOM
  elements.fontsGrid.innerHTML = fontsHtml;
}

// 处理字体输入
function handleFontInput(e) {
  renderFonts();
}

// 转换文字为花式字体
function convertText(text, mapping) {
  return Array.from(text).map(char => {
    // 检查字符是否在映射表中
    return mapping[char] || char;
  }).join('');
}

// 处理搜索
function handleSearch(e) {
  const query = e.target.value.trim();
  state.searchQuery = query;
  
  if (query) {
    // 执行搜索
    const results = state.fuseInstance.search(query);
    state.searchResults = results.map(result => result.item);
    
    // 显示搜索结果
    elements.searchResults.classList.remove('hidden');
    elements.symbolsGrid.classList.add('hidden');
    elements.kaomojiGrid.classList.add('hidden');
    elements.fontsArea.classList.add('hidden');
    
    // 渲染搜索结果
    renderSearchResults();
  } else {
    // 清空搜索，显示当前标签
    elements.searchResults.classList.add('hidden');
    
    if (state.currentTab === 'fonts') {
      elements.fontsArea.classList.remove('hidden');
    } else {
      document.getElementById(`${state.currentTab}-grid`).classList.remove('hidden');
    }
    
    // 隐藏无结果提示
    elements.noResults.classList.add('hidden');
  }
  
  // 更新URL
  updateUrl();
}

// 渲染搜索结果
function renderSearchResults() {
  // 更新搜索查询显示
  elements.searchQuery.textContent = state.searchQuery;
  
  if (state.searchResults.length === 0) {
    // 显示无结果提示
    elements.searchResultsGrid.innerHTML = '';
    elements.noResults.classList.remove('hidden');
    return;
  }
  
  // 隐藏无结果提示
  elements.noResults.classList.add('hidden');
  
  // 生成HTML
  const resultsHtml = state.searchResults.map(item => {
    if (item.type === 'symbol') {
      return `
        <div class="symbol-item p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md cursor-pointer text-center transition-all" 
             onclick="copyToClipboard('${escapeJsString(item.symbol)}')">
          <div class="text-xl mb-1">${escapeHtml(item.symbol)}</div>
          <div class="text-xs text-gray-500 dark:text-gray-400 truncate" title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</div>
        </div>
      `;
    } else if (item.type === 'kaomoji') {
      return `
        <div class="symbol-item p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md cursor-pointer text-center transition-all" 
             onclick="copyToClipboard('${escapeJsString(item.kaomoji)}')">
          <div class="text-xl mb-1">${escapeHtml(item.kaomoji)}</div>
          <div class="text-xs text-gray-500 dark:text-gray-400 truncate" title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</div>
        </div>
      `;
    }
  }).join('');
  
  // 更新DOM
  elements.searchResultsGrid.innerHTML = resultsHtml;
}

// 更改分类
function changeCategory(category) {
  state.currentCategory = category;
  elements.currentCategory.textContent = category === 'all' ? '全部' : category;
  renderCurrentTab();
  updateUrl();
}

// 复制到剪贴板
window.copyToClipboard = async function(text) {
  try {
    // 尝试使用现代API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      // 降级到传统方法
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    
    // 显示复制成功提示
    showCopyToast();
    
    // 生成单个符号的路由
    if (state.currentTab === 'symbols' || state.currentTab === 'kaomoji') {
      const encodedSymbol = encodeURIComponent(text);
      // 使用 history.pushState 更新 URL 而不刷新页面
      history.pushState(
        { symbol: text }, 
        `SymbolCopy - ${text}`, 
        `/s/${encodedSymbol}`
      );
    }
  } catch (error) {
    console.error('复制失败:', error);
    alert('复制失败，请手动复制');
  }
};

// 显示复制成功提示
function showCopyToast() {
  const toast = elements.copyToast;
  
  // 重置动画
  toast.style.animation = 'none';
  toast.offsetHeight; // 触发重排
  toast.style.animation = null;
  
  // 显示提示
  toast.classList.remove('opacity-0');
  toast.classList.add('toast');
  
  // 一段时间后隐藏
  setTimeout(() => {
    toast.classList.add('opacity-0');
    toast.classList.remove('toast');
  }, 1500);
}

// 切换主题
function toggleTheme() {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.theme = isDark ? 'dark' : 'light';
}

// 处理URL参数
function handleUrlParams() {
  const url = new URL(window.location.href);
  const tab = url.searchParams.get('tab');
  const query = url.searchParams.get('q');
  const category = url.searchParams.get('category');
  
  // 处理单个符号路由
  const pathMatch = window.location.pathname.match(/^\/s\/(.+)$/);
  if (pathMatch) {
    const symbol = decodeURIComponent(pathMatch[1]);
    // 设置页面元数据
    document.title = `${symbol} - SymbolCopy`;
    // 可以在这里添加更多的元数据设置
  }
  
  // 设置标签
  if (tab && ['symbols', 'kaomoji', 'fonts'].includes(tab)) {
    switchTab(tab);
  }
  
  // 设置分类
  if (category) {
    changeCategory(category);
  }
  
  // 设置搜索查询
  if (query) {
    elements.searchInput.value = query;
    state.searchQuery = query;
    handleSearch({ target: elements.searchInput });
  }
}

// 更新URL
function updateUrl() {
  const url = new URL(window.location.href);
  
  // 更新标签参数
  url.searchParams.set('tab', state.currentTab);
  
  // 更新分类参数
  if (state.currentCategory !== 'all') {
    url.searchParams.set('category', state.currentCategory);
  } else {
    url.searchParams.delete('category');
  }
  
  // 更新搜索参数
  if (state.searchQuery) {
    url.searchParams.set('q', state.searchQuery);
  } else {
    url.searchParams.delete('q');
  }
  
  // 使用 history.replaceState 更新 URL 而不刷新页面
  history.replaceState({}, '', url);
}

// 防抖函数
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// HTML转义函数
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// JS字符串转义函数
function escapeJsString(unsafe) {
  return unsafe
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t");
}

// 初始化应用
document.addEventListener('DOMContentLoaded', initApp);