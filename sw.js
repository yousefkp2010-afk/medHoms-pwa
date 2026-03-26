// sw.js - Service Worker للمنصة التعليمية الطبية
// الإصدار المحدث: 2.0.0 (حل مشكلة التغليف والأداء)

const CACHE_NAME = 'medical-platform-cache-v2';

// 1. تخزين "الهيكل الأساسي" فقط (App Shell)
// هذه هي الملفات التي يحتاجها التطبيق ليفتح ويظهر الواجهة فقط
const coreAssets = [
  './',
  './index.html',
  './main.js',
  './style.css',
  './manifest.json',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png'
];

// تثبيت الـ Service Worker وتخزين الملفات الأساسية فقط
self.addEventListener('install', event => {
  console.log('[SW] Installing Core Assets...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // تحميل الملفات الـ 7 الأساسية فقط (سريع جداً لـ PWABuilder)
      return cache.addAll(coreAssets);
    })
  );
  self.skipWaiting();
});

// تنشيط الـ Service Worker وتنظيف الكاش القديم
self.addEventListener('activate', event => {
  console.log('[SW] Activating and Cleaning Old Caches...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// استراتيجية "الشبكة أولاً مع التخزين التلقائي" (Network First, then Cache)
// هذه الاستراتيجية ستجعل أي دورة يفتحها الطالب تُخزن تلقائياً للأوفلاين
self.addEventListener('fetch', event => {
  const request = event.request;

  // تجاهل الطلبات التي ليست من نوع GET أو من خارج الموقع
  if (request.method !== 'GET' || !request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then(networkResponse => {
        // إذا نجح الاتصال بالإنترنت، نقوم بتحديث الكاش بالنسخة الجديدة
        return caches.open(CACHE_NAME).then(cache => {
          // حفظ نسخة من الملف (سواء كان صفحة HTML أو ملف JS لدورة تعليمية)
          cache.put(request, networkResponse.clone());
          return networkResponse;
        });
      })
      .catch(() => {
        // إذا انقطع الإنترنت، نبحث عن الملف في الكاش
        return caches.match(request).then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // إذا لم يكن الملف في الكاش والجهاز أوفلاين، نظهر رسالة بسيطة
          if (request.headers.get('accept').includes('text/html')) {
            return new Response(
              '<h2 style="font-family:sans-serif; text-align:center; margin-top:50px;">عذراً، هذه الصفحة غير متوفرة أوفلاين حالياً. يرجى فتحها مرة واحدة أثناء الاتصال بالإنترنت ليتم حفظها.</h2>', 
              { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
            );
          }
        });
      })
  );
});