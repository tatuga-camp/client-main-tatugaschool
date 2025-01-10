self.addEventListener("push", async function (event) {
  if (event.data) {
    const data = event.data.json();
    console.log("Push event data has been received.", data);
    try {
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
