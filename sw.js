const CACHE="almara-apps-v2";
const ARCHIVOS=["/","/index.html","/config.js","/nube.js","/pdf.js","/manifest.json","/icon-192.png","/icon-512.png","/apple-touch-icon.png","/planos/","/clientes/"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ARCHIVOS)).catch(()=>{}));self.skipWaiting()});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim()});
// Solo archivos de la propia web: primero la red (para recibir actualizaciones) y sin cobertura la copia guardada.
self.addEventListener("fetch",e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=="GET"||u.origin!==location.origin)return;
  e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(CACHE).then(k=>k.put(e.request,c));return r})
    .catch(()=>caches.match(e.request,{ignoreSearch:true}).then(r=>r||caches.match("/"))));
});
