// Service Worker for Interview Prep Platform
// Provides offline support, caching, and background sync

const CACHE_NAME = 'interview-prep-v2.0.0';
const STATIC_CACHE_NAME = 'static-v2.0.0';
const DYNAMIC_CACHE_NAME = 'dynamic-v2.0.0';

// Files to cache for offline use
const STATIC_FILES = [
  '/',
  '/index.html',
  '/app.js',
  '/styles.css',
  '/manifest.json',
  '/offline.html'
  // Note: Data files and icons are cached dynamically on first request
  // This prevents cache failures for missing files during install
];

// Files that should be cached on first request (dynamic)
const DYNAMIC_FILES_PATTERNS = [
  /\.(?:png|jpg|jpeg|svg|gif)$/,
  /\.(?:css|js)$/,
  /\.(?:json)$/
];

// Network first strategy URLs (always try network first)
const NETWORK_FIRST_PATTERNS = [
  /\/api\//,
  /practice-data.*\.json$/,
  /interview-questions\.json$/
];

// Cache first strategy URLs (serve from cache, update in background)
const CACHE_FIRST_PATTERNS = [
  /\.(?:png|jpg|jpeg|svg|gif|ico)$/,
  /\.(?:woff|woff2|ttf|eot)$/
];

// ===================================
// SERVICE WORKER LIFECYCLE EVENTS
// ===================================

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('📦 Service Worker: Installing...');

  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('📦 Service Worker: Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('✅ Service Worker: Static files cached successfully');
        return self.skipWaiting(); // Force activation
      })
      .catch((error) => {
        console.error('❌ Service Worker: Failed to cache static files:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Activating...');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Delete old caches
            if (cacheName !== STATIC_CACHE_NAME &&
                cacheName !== DYNAMIC_CACHE_NAME &&
                cacheName !== CACHE_NAME) {
              console.log('🗑️ Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker: Activated successfully');
        return self.clients.claim(); // Take control of all pages
      })
      .catch((error) => {
        console.error('❌ Service Worker: Activation failed:', error);
      })
  );
});

// ===================================
// FETCH HANDLING STRATEGIES
// ===================================

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Determine strategy based on URL patterns
  if (NETWORK_FIRST_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    event.respondWith(networkFirstStrategy(request));
  } else if (CACHE_FIRST_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    event.respondWith(cacheFirstStrategy(request));
  } else {
    // Default: Cache first with network fallback
    event.respondWith(cacheWithFallbackStrategy(request));
  }
});

// ===================================
// CACHING STRATEGIES
// ===================================

// Network first strategy (for API calls and critical data)
async function networkFirstStrategy(request) {
  const url = new URL(request.url);

  try {
    console.log('🌐 Network First:', url.pathname);

    // Try network first
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      // Cache the successful response
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }

    // If network fails, try cache
    return await getCachedResponse(request);

  } catch (error) {
    console.log('🔄 Network failed, trying cache for:', url.pathname);
    return await getCachedResponse(request);
  }
}

// Cache first strategy (for static assets)
async function cacheFirstStrategy(request) {
  const url = new URL(request.url);

  try {
    console.log('💾 Cache First:', url.pathname);

    // Try cache first
    const cachedResponse = await getCachedResponse(request);
    if (cachedResponse) {
      // Update cache in background
      updateCacheInBackground(request);
      return cachedResponse;
    }

    // If not in cache, fetch from network
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      // Cache the response
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;

  } catch (error) {
    console.error('❌ Cache first strategy failed:', error);
    return new Response('Network error', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// Cache with fallback strategy (default)
async function cacheWithFallbackStrategy(request) {
  const url = new URL(request.url);

  try {
    // Try cache first
    let cachedResponse = await getCachedResponse(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Try network
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(DYNAMIC_CACHE_NAME);

      // Only cache if it matches our dynamic patterns
      if (DYNAMIC_FILES_PATTERNS.some(pattern => pattern.test(url.pathname))) {
        cache.put(request, networkResponse.clone());
      }
    }

    return networkResponse;

  } catch (error) {
    console.log('🔄 Serving offline fallback for:', url.pathname);

    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      const offlineResponse = await caches.match('/offline.html');
      return offlineResponse || new Response('Offline', {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    // Return cached version or error for other requests
    return getCachedResponse(request) ||
           new Response('Offline', {
             status: 503,
             statusText: 'Service Unavailable',
             headers: { 'Content-Type': 'text/plain' }
           });
  }
}

// ===================================
// HELPER FUNCTIONS
// ===================================

// Get cached response from any cache
async function getCachedResponse(request) {
  const cacheNames = [STATIC_CACHE_NAME, DYNAMIC_CACHE_NAME, CACHE_NAME];

  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const response = await cache.match(request);
    if (response) {
      console.log('💾 Cache hit:', request.url);
      return response;
    }
  }

  return null;
}

// Update cache in background (for cache-first strategy)
function updateCacheInBackground(request) {
  // Don't await this - let it run in background
  fetch(request)
    .then(response => {
      if (response.ok) {
        return caches.open(DYNAMIC_CACHE_NAME)
          .then(cache => cache.put(request, response.clone()));
      }
    })
    .catch(error => {
      console.log('Background cache update failed:', error);
    });
}

// ===================================
// BACKGROUND SYNC
// ===================================

self.addEventListener('sync', (event) => {
  console.log('🔄 Background Sync:', event.tag);

  if (event.tag === 'progress-sync') {
    event.waitUntil(syncProgressData());
  } else if (event.tag === 'settings-sync') {
    event.waitUntil(syncSettingsData());
  }
});

// Sync progress data when back online
async function syncProgressData() {
  try {
    console.log('🔄 Syncing progress data...');

    // Get pending progress updates from IndexedDB or localStorage
    const pendingUpdates = await getPendingProgressUpdates();

    if (pendingUpdates.length > 0) {
      // Send updates to server (when backend is implemented)
      // For now, just log the sync
      console.log('📊 Would sync progress updates:', pendingUpdates);

      // Clear pending updates after successful sync
      await clearPendingProgressUpdates();
    }

    console.log('✅ Progress sync completed');
  } catch (error) {
    console.error('❌ Progress sync failed:', error);
    throw error; // Re-throw to retry sync later
  }
}

// Sync settings data when back online
async function syncSettingsData() {
  try {
    console.log('🔄 Syncing settings data...');

    // Implementation for syncing settings
    // For now, just log
    console.log('⚙️ Settings sync completed');
  } catch (error) {
    console.error('❌ Settings sync failed:', error);
    throw error;
  }
}

// Placeholder functions for pending data management
async function getPendingProgressUpdates() {
  // In a full implementation, this would read from IndexedDB
  return [];
}

async function clearPendingProgressUpdates() {
  // Clear pending updates after successful sync
  console.log('🧹 Cleared pending progress updates');
}

// ===================================
// PUSH NOTIFICATIONS
// ===================================

self.addEventListener('push', (event) => {
  console.log('📱 Push notification received');

  let notificationData = {
    title: 'Interview Prep Platform',
    body: 'You have a new update!',
    icon: '/assets/icons/icon-192x192.png',
    badge: '/assets/icons/icon-72x72.png',
    tag: 'default',
    requireInteraction: false,
    actions: []
  };

  // Parse push data if available
  if (event.data) {
    try {
      const pushData = event.data.json();
      notificationData = { ...notificationData, ...pushData };
    } catch (error) {
      console.error('❌ Failed to parse push data:', error);
    }
  }

  // Add default actions
  if (!notificationData.actions || notificationData.actions.length === 0) {
    notificationData.actions = [
      {
        action: 'open',
        title: 'Open App',
        icon: '/assets/icons/icon-96x96.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/assets/icons/icon-96x96.png'
      }
    ];
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('📱 Notification clicked:', event.action);

  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  // Default action or 'open' action
  let targetUrl = '/';

  // Handle specific notification actions
  if (event.notification.data && event.notification.data.url) {
    targetUrl = event.notification.data.url;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url.includes(self.registration.scope) && 'focus' in client) {
            return client.focus().then(() => {
              // Navigate to target URL if needed
              if (client.url !== targetUrl) {
                return client.navigate(targetUrl);
              }
            });
          }
        }

        // Open new window if app not already open
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});

// ===================================
// MESSAGE HANDLING
// ===================================

self.addEventListener('message', (event) => {
  console.log('💬 Service Worker received message:', event.data);

  if (event.data && event.data.type) {
    switch (event.data.type) {
      case 'SKIP_WAITING':
        self.skipWaiting();
        break;

      case 'CACHE_URLS':
        if (event.data.urls && Array.isArray(event.data.urls)) {
          cacheUrls(event.data.urls);
        }
        break;

      case 'CLEAR_CACHE':
        clearAllCaches();
        break;

      case 'GET_CACHE_STATUS':
        getCacheStatus().then(status => {
          event.ports[0].postMessage(status);
        });
        break;

      default:
        console.log('Unknown message type:', event.data.type);
    }
  }
});

// Cache specific URLs
async function cacheUrls(urls) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    await cache.addAll(urls);
    console.log('✅ URLs cached successfully:', urls);
  } catch (error) {
    console.error('❌ Failed to cache URLs:', error);
  }
}

// Clear all caches
async function clearAllCaches() {
  try {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(name => caches.delete(name))
    );
    console.log('✅ All caches cleared');
  } catch (error) {
    console.error('❌ Failed to clear caches:', error);
  }
}

// Get cache status information
async function getCacheStatus() {
  try {
    const cacheNames = await caches.keys();
    const status = {};

    for (const name of cacheNames) {
      const cache = await caches.open(name);
      const keys = await cache.keys();
      status[name] = keys.length;
    }

    return {
      caches: status,
      version: CACHE_NAME,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Failed to get cache status:', error);
    return { error: error.message };
  }
}

// ===================================
// ERROR HANDLING
// ===================================

self.addEventListener('error', (event) => {
  console.error('❌ Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('❌ Service Worker unhandled rejection:', event.reason);
});

console.log('🚀 Service Worker loaded successfully');