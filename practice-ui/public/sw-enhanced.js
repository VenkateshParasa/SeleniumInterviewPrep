// Enhanced Service Worker for Interview Prep Platform
// Provides offline support, caching, background sync, and push notifications
// Created: December 15, 2025

const CACHE_NAME = 'interview-prep-v3.0.0';
const STATIC_CACHE_NAME = 'static-v3.0.0';
const DYNAMIC_CACHE_NAME = 'dynamic-v3.0.0';
const API_CACHE_NAME = 'api-v3.0.0';

// Files to cache for offline use
const STATIC_FILES = [
  '/',
  '/index.html',
  '/app-modular.js',
  '/styles.css',
  '/manifest.json',
  '/offline.html',
  '/js/ui-utils.js',
  '/js/data-manager.js',
  '/js/question-manager.js',
  '/js/progress-manager.js',
  '/js/offline-storage.js',
  '/js/api-client.js',
  '/js/api-v2-client.js'
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/v2/categories',
  '/api/v2/tracks',
  '/api/v2/questions',
  '/api/auth/me'
];

// Background sync tags
const SYNC_TAGS = {
  PROGRESS_SYNC: 'progress-sync',
  SETTINGS_SYNC: 'settings-sync',
  QUESTIONS_SYNC: 'questions-sync'
};

// ===================================
// SERVICE WORKER LIFECYCLE EVENTS
// ===================================

// Install event - cache static files and essential API data
self.addEventListener('install', (event) => {
  console.log('📦 Service Worker: Installing v3.0.0...');

  event.waitUntil(
    Promise.all([
      // Cache static files
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('📁 Caching static files...');
        return cache.addAll(STATIC_FILES);
      }),

      // Pre-cache essential API data
      cacheEssentialAPIData()
    ]).then(() => {
      console.log('✅ Service Worker: Installation completed');
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🔄 Service Worker: Activating...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE_NAME &&
              cacheName !== DYNAMIC_CACHE_NAME &&
              cacheName !== API_CACHE_NAME) {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ Service Worker: Activation completed');
      return self.clients.claim();
    })
  );
});

// ===================================
// FETCH EVENT HANDLING
// ===================================

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const { url } = request;

  // Skip non-GET requests for caching
  if (request.method !== 'GET') {
    return;
  }

  // Handle different types of requests
  if (url.includes('/api/')) {
    event.respondWith(handleAPIRequest(request));
  } else if (isStaticResource(url)) {
    event.respondWith(handleStaticResource(request));
  } else if (isDynamicContent(url)) {
    event.respondWith(handleDynamicContent(request));
  } else {
    event.respondWith(handleDefaultRequest(request));
  }
});

// ===================================
// REQUEST HANDLERS
// ===================================

// Handle API requests with network-first strategy
async function handleAPIRequest(request) {
  const cache = await caches.open(API_CACHE_NAME);

  try {
    // Try network first
    const response = await fetch(request);

    if (response.ok) {
      // Cache successful responses
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.log('📴 Network failed, trying cache for:', request.url);

    // Fall back to cache
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      console.log('📱 Serving API response from cache');
      return cachedResponse;
    }

    // Return offline response for critical endpoints
    return createOfflineAPIResponse(request);
  }
}

// Handle static resources with cache-first strategy
async function handleStaticResource(request) {
  const cache = await caches.open(STATIC_CACHE_NAME);

  // Try cache first
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  // Fetch from network and cache
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('❌ Failed to fetch static resource:', request.url);
    throw error;
  }
}

// Handle dynamic content with stale-while-revalidate strategy
async function handleDynamicContent(request) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);

  // Serve from cache immediately
  const cachedResponse = await cache.match(request);

  // Start background update
  const networkPromise = fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => null);

  // Return cache or wait for network
  return cachedResponse || networkPromise;
}

// Handle default requests
async function handleDefaultRequest(request) {
  try {
    return await fetch(request);
  } catch (error) {
    // Return offline page for navigation requests
    if (request.destination === 'document') {
      const cache = await caches.open(STATIC_CACHE_NAME);
      return cache.match('/offline.html');
    }
    throw error;
  }
}

// ===================================
// BACKGROUND SYNC
// ===================================

self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync triggered:', event.tag);

  switch (event.tag) {
    case SYNC_TAGS.PROGRESS_SYNC:
      event.waitUntil(syncProgress());
      break;
    case SYNC_TAGS.SETTINGS_SYNC:
      event.waitUntil(syncSettings());
      break;
    case SYNC_TAGS.QUESTIONS_SYNC:
      event.waitUntil(syncQuestions());
      break;
    default:
      console.log('⚠️ Unknown sync tag:', event.tag);
  }
});

async function syncProgress() {
  try {
    console.log('📊 Syncing progress data...');

    // Get stored progress from IndexedDB
    const storedProgress = await getStoredData('progress');

    for (const progress of storedProgress) {
      if (!progress.synced) {
        try {
          const response = await fetch('/api/v2/user/progress/' + progress.trackName, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${await getAuthToken()}`
            },
            body: JSON.stringify(progress)
          });

          if (response.ok) {
            // Mark as synced
            await markAsSynced('progress', progress.id);
            console.log('✅ Progress synced:', progress.id);
          }
        } catch (error) {
          console.error('❌ Failed to sync progress:', error);
        }
      }
    }
  } catch (error) {
    console.error('❌ Progress sync failed:', error);
  }
}

async function syncSettings() {
  try {
    console.log('⚙️ Syncing settings...');

    const storedSettings = await getStoredData('settings');

    for (const setting of storedSettings) {
      if (!setting.synced) {
        try {
          const response = await fetch('/api/v2/user/settings', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${await getAuthToken()}`
            },
            body: JSON.stringify(setting.data)
          });

          if (response.ok) {
            await markAsSynced('settings', setting.id);
            console.log('✅ Settings synced');
          }
        } catch (error) {
          console.error('❌ Failed to sync settings:', error);
        }
      }
    }
  } catch (error) {
    console.error('❌ Settings sync failed:', error);
  }
}

async function syncQuestions() {
  try {
    console.log('❓ Syncing questions cache...');

    const response = await fetch('/api/v2/questions?limit=100');
    if (response.ok) {
      const data = await response.json();
      await storeQuestionsCache(data.data);
      console.log('✅ Questions cache updated');
    }
  } catch (error) {
    console.error('❌ Questions sync failed:', error);
  }
}

// ===================================
// PUSH NOTIFICATIONS
// ===================================

self.addEventListener('push', (event) => {
  console.log('📬 Push notification received');

  const options = {
    body: 'Time to continue your interview preparation!',
    icon: '/assets/icons/icon-192x192.png',
    badge: '/assets/icons/badge-72x72.png',
    tag: 'study-reminder',
    requireInteraction: false,
    actions: [
      {
        action: 'open',
        title: 'Start Studying',
        icon: '/assets/icons/action-study.png'
      },
      {
        action: 'snooze',
        title: 'Remind me later',
        icon: '/assets/icons/action-snooze.png'
      }
    ],
    data: {
      url: '/',
      timestamp: Date.now()
    }
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      options.body = payload.body || options.body;
      options.title = payload.title || 'Interview Prep Platform';
      options.data = { ...options.data, ...payload.data };
    } catch (error) {
      console.error('❌ Failed to parse push payload:', error);
    }
  }

  event.waitUntil(
    self.registration.showNotification('Interview Prep Platform', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('📱 Notification clicked:', event.action);

  event.notification.close();

  if (event.action === 'open') {
    event.waitUntil(
      self.clients.openWindow(event.notification.data.url || '/')
    );
  } else if (event.action === 'snooze') {
    // Schedule another notification in 30 minutes
    setTimeout(() => {
      self.registration.showNotification('Study Reminder', {
        body: 'Ready to continue your preparation?',
        icon: '/assets/icons/icon-192x192.png'
      });
    }, 30 * 60 * 1000);
  } else {
    // Default action - open app
    event.waitUntil(
      self.clients.openWindow('/')
    );
  }
});

// ===================================
// UTILITY FUNCTIONS
// ===================================

function isStaticResource(url) {
  return /\.(js|css|png|jpg|jpeg|svg|gif|ico|woff|woff2|ttf)$/.test(url);
}

function isDynamicContent(url) {
  return /\.(json|html)$/.test(url) && !url.includes('/api/');
}

async function cacheEssentialAPIData() {
  const cache = await caches.open(API_CACHE_NAME);

  for (const endpoint of API_ENDPOINTS) {
    try {
      const response = await fetch(endpoint);
      if (response.ok) {
        await cache.put(endpoint, response);
        console.log('📡 Cached API endpoint:', endpoint);
      }
    } catch (error) {
      console.warn('⚠️ Failed to cache API endpoint:', endpoint);
    }
  }
}

function createOfflineAPIResponse(request) {
  if (request.url.includes('/questions')) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Offline - questions not available',
      offline: true
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({
    success: false,
    error: 'Offline - please try again when connected',
    offline: true
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

async function getStoredData(type) {
  // This would integrate with IndexedDB
  return [];
}

async function markAsSynced(type, id) {
  // This would update IndexedDB
  console.log(`Marked ${type}:${id} as synced`);
}

async function storeQuestionsCache(questions) {
  // This would store in IndexedDB
  console.log(`Cached ${questions.length} questions`);
}

async function getAuthToken() {
  // Get auth token from storage
  return localStorage.getItem('auth_token');
}

// ===================================
// PERIODIC BACKGROUND SYNC
// ===================================

self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'daily-sync') {
    event.waitUntil(performDailySync());
  }
});

async function performDailySync() {
  console.log('📅 Performing daily sync...');

  try {
    // Sync questions cache
    await syncQuestions();

    // Sync progress if needed
    await syncProgress();

    // Clean up old cache entries
    await cleanupOldCacheEntries();

    console.log('✅ Daily sync completed');
  } catch (error) {
    console.error('❌ Daily sync failed:', error);
  }
}

async function cleanupOldCacheEntries() {
  const cache = await caches.open(API_CACHE_NAME);
  const requests = await cache.keys();

  for (const request of requests) {
    const response = await cache.match(request);
    const cacheDate = response.headers.get('date');

    if (cacheDate && isOlderThan24Hours(cacheDate)) {
      await cache.delete(request);
      console.log('🗑️ Cleaned up old cache entry:', request.url);
    }
  }
}

function isOlderThan24Hours(dateString) {
  const cacheDate = new Date(dateString);
  const now = new Date();
  const diffHours = (now - cacheDate) / (1000 * 60 * 60);
  return diffHours > 24;
}

console.log('✅ Enhanced Service Worker v3.0.0 loaded successfully');