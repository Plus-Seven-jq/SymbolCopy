// 更新时间：2025-07-27
// Service Worker for SymbolCopy 小红书特殊符号 PWA

// 使用 Workbox 6 CDN
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

// 设置缓存名称前缀
workbox.core.setCacheNameDetails({
  prefix: 'symbolcopy',
  suffix: 'v1',
});

// 跳过等待，立即激活新的 Service Worker
self.skipWaiting();
workbox.core.clientsClaim();

// 预缓存核心资源
const corePrecacheList = [
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/app.js',
  './assets/symbols.json',
  './assets/symbols2.json',
  './assets/xiaohongshu.json',
  './assets/kaomoji.json',
  './assets/fonts.json',
  './assets/emoji.json',
  './assets/plants.json',
  './assets/mystical.json',
  './assets/tarot.json',
  './assets/objects.json'
];

// 注册预缓存
workbox.precaching.precacheAndRoute(
  corePrecacheList.map(url => ({
    url,
    revision: '20250727'
  }))
);

// JSON 数据使用 CacheFirst 策略
workbox.routing.registerRoute(
  /\.json$/,
  new workbox.strategies.CacheFirst({
    cacheName: 'symbolcopy-json-cache',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 20, // 最多缓存20个JSON文件
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30天
      }),
    ],
  })
);

// HTML 文件使用 StaleWhileRevalidate 策略
workbox.routing.registerRoute(
  /\.html$/,
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'symbolcopy-html-cache',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 10,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7天
      }),
    ],
  })
);

// JS/CSS 文件使用 StaleWhileRevalidate 策略
workbox.routing.registerRoute(
  /\.(js|css)$/,
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'symbolcopy-assets-cache',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7天
      }),
    ],
  })
);

// 图片使用 CacheFirst 策略
workbox.routing.registerRoute(
  /\.(?:png|jpg|jpeg|svg|gif)$/,
  new workbox.strategies.CacheFirst({
    cacheName: 'symbolcopy-images-cache',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30天
      }),
    ],
  })
);

// CDN 资源使用 StaleWhileRevalidate 策略
workbox.routing.registerRoute(
  /^https:\/\/cdn\.jsdelivr\.net\//,
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'symbolcopy-cdn-cache',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 14 * 24 * 60 * 60, // 14天
      }),
    ],
  })
);

// 离线页面
workbox.routing.setCatchHandler(({ event }) => {
  if (event.request.destination === 'document') {
    return caches.match('./index.html');
  }
  return Response.error();
});

// 监听安装事件
self.addEventListener('install', (event) => {
  console.log('Service Worker 已安装');
});

// 监听激活事件
self.addEventListener('activate', (event) => {
  console.log('Service Worker 已激活');
});

// 监听消息事件
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});