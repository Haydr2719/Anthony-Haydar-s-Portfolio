// Service worker for admin push notifications (registered with scope "/admin/").
// Shows a notification for each push from the server and opens the enquiry on click.

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data ? event.data.text() : "" };
  }
  event.waitUntil(
    self.registration.showNotification(data.title || "New enquiry", {
      body: data.body || "Open the admin to view it.",
      icon: "/admin-icon.svg",
      badge: "/admin-icon.svg",
      tag: data.tag,
      renotify: Boolean(data.tag),
      data: { url: data.url || "/admin/leads" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = new URL(event.notification.data?.url || "/admin/leads", self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
      // Reuse an open admin tab if there is one
      for (const win of windows) {
        if (win.url.includes("/admin") && "focus" in win) {
          return win.navigate(url).then((w) => (w || win).focus());
        }
      }
      return self.clients.openWindow(url);
    }),
  );
});
