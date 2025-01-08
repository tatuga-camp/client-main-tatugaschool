self.addEventListener("push", async function (event) {
  if (event.data) {
    const data = event.data.json();
    try {
      await self.registration.showNotification(data.title, {
        body: data.body,
        icon: data.icon || "/favicon.ico",
      });
      console.log("Notification added to the user interface.");
    } catch (error) {
      console.log("error show notification", error);
    }
  } else {
    console.error("Push event has no data.");
  }
});
