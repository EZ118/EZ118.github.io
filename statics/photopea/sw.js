var cacheName = 'v14.2.2';
var cacheFiles = [
    '/',
    './index.html',
    './js/ext.js',
    './js/TNTS.js',
    './js/LNG2.js',
    './js/PIMG.js',
    './js/pp.js',
    './js/z_stat.php',
    './rsrc/basic.zip',
    './images/ps.svg',
    './css/CtrlStyle.css',
];
// 监听 install 事件，安装完成后，进行文件缓存
self.addEventListener('install', function (e) {
    console.log('Service Worker 状态： install');
    var cacheOpenPromise = caches.open(cacheName).then(function (cache) {
        // 把要缓存的 cacheFiles 列表传入
        return cache.addAll(cacheFiles);
    });
    e.waitUntil(cacheOpenPromise);
});
// 监听 fetch 事件，安装完成后，进行文件缓存
self.addEventListener('fetch', function (e) {
    console.log('Service Worker 状态： fetch');
    var cacheMatchPromise = caches.match(e.request).then(function (cache) {
            // 如果有cache则直接返回，否则通过fetch请求
            return cache || fetch(e.request);
        }).catch(function (err) {
            console.log(err);
            return fetch(e.request);
        })
    e.respondWith(cacheMatchPromise);
});
// 监听 activate 事件，清除缓存
self.addEventListener('activate', function (e) {
    console.log('Service Worker 状态： activate');
    var cachePromise = caches.keys().then(function (keys) {
        return Promise.all(keys.map(function (key) {
            if (key !== cacheName) {
                return caches.delete(key);
            }
        }));
    })
    e.waitUntil(cachePromise);
    return self.clients.claim();
});