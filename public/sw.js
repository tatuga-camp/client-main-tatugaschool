let CACHE = [];
const MAX_CACHE_SIZE = 50; // Limit the cache to 50 items
const ONE_MINUTE = 1 * 60 * 1000;

async function cacheNotification(data) {
  const now = Date.now();

  // Remove expired items
  CACHE = CACHE.filter((item) => item.timestamp >= now - ONE_MINUTE);

  const duplicateData = CACHE.find((item) => item.groupId === data.groupId);

  console.log("cachedData", CACHE);
  console.log("duplicateData", duplicateData);

  if (duplicateData) {
    if (now - duplicateData.timestamp < ONE_MINUTE) {
      console.log(
        "Notification suppressed due to recent similar notification."
      );
      return false;
    }
  }

  // Add the new item
  CACHE.push({ ...data, timestamp: now });

  // Limit the cache size
  if (CACHE.length > MAX_CACHE_SIZE) {
    CACHE = CACHE.slice(CACHE.length - MAX_CACHE_SIZE); // Keep the most recent items
    console.log("Cache size limit reached.  Oldest entries removed.");
  }

  return true;
}

self.addEventListener("push", async function (event) {
  if (event.data) {
    const data = event.data.json();
    console.log("Push event data has been received.", data);
    try {
      const shouldNotify = await cacheNotification(data);
      if (shouldNotify) {
        event.waitUntil(
          self.registration.showNotification(data.title, {
            body: data.body,
            icon: data.icon,
            data: {
              url: data.url,
            },
          })
        );
        console.log("Notification added to the user interface.");
      }
    } catch (error) {
      console.log("error show notification", error);
    }
  } else {
    console.error("Push event has no data.");
  }
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  console.log("Notification clicked.", event.notification.data.url);
  if (clients.openWindow && event.notification.data.url) {
    event.waitUntil(clients.openWindow(event.notification.data.url));
  }
});

// เพื่อรับข้อความจำลองการแจ้งเตือน
self.addEventListener("message", async (event) => {
  if (event.data && event.data.type === "PUSH_SIMULATION") {
    const data = event.data.data;
    console.log("Push event data has been received.", data);
    try {
      const shouldNotify = await cacheNotification(data);
      if (shouldNotify) {
        event.waitUntil(
          self.registration.showNotification(data.title, {
            body: data.body,
            icon: data.icon,
            data: {
              url: data.url,
            },
          })
        );
        console.log("Notification added to the user interface.");
      }
    } catch (error) {
      console.log("error show notification", error);
    }
  }
});
