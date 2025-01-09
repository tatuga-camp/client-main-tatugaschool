export async function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    return await navigator.serviceWorker.register("/sw.js");
  }
  console.error("Service Worker not supported");
  return null;
}

export async function subscribeUserToPush(vapidPublicKey: any) {
  try {
    const registration = await navigator.serviceWorker.ready;

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });
    console.log("Push Subscription successful:", subscription.toJSON());
    return subscription;
  } catch (error) {
    console.error("Push Subscription failed:", error);
    return null;
  }
}

function urlBase64ToUint8Array(base64String: string | any[]) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return new Uint8Array(Array.from(rawData).map((char) => char.charCodeAt(0)));
}
