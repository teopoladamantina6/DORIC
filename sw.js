const C='doric-v5';
const FILES=['./','./index.html','./manifest.json','./icon-180.png','./icon-512.png'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(C).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys().then(ks=>Promise.all(ks.map(k=>caches.delete(k))))
      .then(()=>caches.open(C).then(c=>c.addAll(FILES)))
      .then(()=>self.clients.claim())
  );
});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  const isPage = e.request.mode==='navigate' ||
                 (e.request.headers.get('accept')||'').includes('text/html');
  if(isPage){
    // ΠΡΩΤΑ δίκτυο: έτσι βλέπεις πάντα τη νεότερη έκδοση όταν έχεις ίντερνετ
    e.respondWith(
      fetch(e.request).then(res=>{
        const cp=res.clone();
        caches.open(C).then(c=>c.put('./index.html',cp)).catch(()=>{});
        return res;
      }).catch(()=>caches.match('./index.html'))
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{
      const cp=res.clone();
      caches.open(C).then(c=>c.put(e.request,cp)).catch(()=>{});
      return res;
    }))
  );
});
