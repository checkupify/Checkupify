// Checkupify SW v1 — network-first, same-origin only.
// Supabase API calls are NEVER intercepted: live data can't go stale from cache.
const CACHE='ck-shell-v1';
self.addEventListener('install',e=>{self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(
  caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
    .then(()=>self.clients.claim())
)});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const u=new URL(e.request.url);
  if(u.origin!==self.location.origin)return;
  e.respondWith(
    fetch(e.request).then(r=>{
      if(r.ok){const cp=r.clone();caches.open(CACHE).then(c=>c.put(e.request,cp));}
      return r;
    }).catch(()=>caches.match(e.request))
  );
});