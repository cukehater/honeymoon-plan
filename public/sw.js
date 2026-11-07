// 오프라인 읽기(F14): 한 번 열었던 일정·예약 화면을 통신이 끊겨도 보여준다.
const CACHE = "honeymoon-v1";
const OFFLINE_PAGES = /^\/(itinerary(\/[\d-]+)?|bookings)$/;

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // 파일명에 해시가 붙은 정적 파일: 캐시 우선
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            if (res.ok) {
              const copy = res.clone(); // 응답 본문이 소비되기 전에 복제해야 한다
              caches.open(CACHE).then((c) => c.put(req, copy));
            }
            return res;
          }),
      ),
    );
    return;
  }

  // 일정·예약 화면: 네트워크 우선, 실패하면 마지막으로 받은 화면
  if (req.mode === "navigate" && OFFLINE_PAGES.test(url.pathname)) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          // 로그인 화면으로 돌려보낸 응답은 저장하지 않는다
          if (res.ok && !res.redirected) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(url.pathname, copy));
          }
          return res;
        })
        .catch(() => caches.match(url.pathname).then((hit) => hit || Response.error())),
    );
  }
});
