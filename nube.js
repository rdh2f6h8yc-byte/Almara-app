// ALMARA · conexión con Supabase (sesión, datos y fotos). Sin librerías externas.
"use strict";
window.Nube = (() => {
  const C = window.ALMARA_CONFIG || {};
  const URLB = String(C.supabaseUrl || "").replace(/\/+$/, ""), KEY = String(C.supabaseAnonKey || "");
  const SK = "almara-sesion", PEND = "almara-fotos-pend";
  // Qué se sincroniza y dónde vive en el móvil
  const CLAVES = {
    clientes: ["almara-clientes-v1"],
    planos: ["almara-planos-v1"],
    presupuestos: ["almara-pres-v1"],
    empresa: ["almara-empresa-v1", "almara-tarifas-v1"]
  };
  const configurado = () => /^https:\/\//.test(URLB) && KEY.length > 30;
  const sesion = () => { try { return JSON.parse(localStorage.getItem(SK)); } catch (e) { return null; } };
  const setSesion = s => { try { s ? localStorage.setItem(SK, JSON.stringify(s)) : localStorage.removeItem(SK); } catch (e) {} };
  const guardaSesion = r => setSesion({ access_token: r.access_token, refresh_token: r.refresh_token,
    expires_at: Date.now() / 1000 + (r.expires_in || 3600), user: { id: r.user.id, email: r.user.email } });

  async function pedir(path, opt = {}, ms = 9000) {
    const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), ms);
    try { return await fetch(URLB + path, { ...opt, signal: ctl.signal }); } finally { clearTimeout(t); }
  }
  async function entrar(email, password) {
    const r = await pedir("/auth/v1/token?grant_type=password", { method: "POST",
      headers: { apikey: KEY, "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.error_description || j.msg || j.error || ("Error " + r.status));
    guardaSesion(j); return j;
  }
  async function token() {
    const s = sesion();
    if (!s) throw Object.assign(new Error("Sin sesión"), { auth: true });
    if (s.expires_at - 60 > Date.now() / 1000) return s.access_token;
    const r = await pedir("/auth/v1/token?grant_type=refresh_token", { method: "POST",
      headers: { apikey: KEY, "Content-Type": "application/json" }, body: JSON.stringify({ refresh_token: s.refresh_token }) });
    if (r.status === 400 || r.status === 401) { setSesion(null); throw Object.assign(new Error("Sesión caducada"), { auth: true }); }
    if (!r.ok) throw new Error("Sin conexión");
    const j = await r.json(); guardaSesion(j); return j.access_token;
  }
  const cab = async extra => ({ apikey: KEY, Authorization: "Bearer " + await token(), ...extra });
  function salir() {
    const s = sesion();
    if (s && configurado()) pedir("/auth/v1/logout", { method: "POST", headers: { apikey: KEY, Authorization: "Bearer " + s.access_token } }).catch(() => {});
    setSesion(null);
  }
  // Si no hay sesión, a la portada. Sin Supabase configurado, la app funciona solo en el móvil.
  function requerir() {
    if (!configurado()) return true;
    if (!sesion()) { location.replace("/?volver=" + encodeURIComponent(location.pathname + location.search)); return false; }
    return true;
  }

  // ---------- Estado visible ----------
  let est = { t: "", c: "" };
  function estado(t, c) { est = { t, c }; const el = document.getElementById("nubeEst"); if (el) { el.title = t; el.style.color = c; } }
  const OK = "#7BD99B", PENDIENTE = "#F5B266", OFF = "#8FA3BC";

  // ---------- Datos ----------
  const ts = k => +localStorage.getItem("almara-ts-" + k) || 0;
  const setTs = (k, v) => localStorage.setItem("almara-ts-" + k, String(v));
  function leer(k) {
    const [a, b] = CLAVES[k];
    const pa = JSON.parse(localStorage.getItem(a) || "null");
    return b ? { a: pa, b: JSON.parse(localStorage.getItem(b) || "null") } : pa;
  }
  function escribir(k, v) {
    const [a, b] = CLAVES[k];
    if (b) { if (v && v.a != null) localStorage.setItem(a, JSON.stringify(v.a)); if (v && v.b != null) localStorage.setItem(b, JSON.stringify(v.b)); }
    else if (v != null) localStorage.setItem(a, JSON.stringify(v));
  }
  const tim = {};
  // Llamar después de cada guardado local: sube a la nube 1,5 s después
  function marcar(k) {
    try { setTs(k, Date.now()); } catch (e) {}
    if (!configurado() || !sesion()) return;
    estado("Pendiente de guardar en la nube", PENDIENTE);
    clearTimeout(tim[k]); tim[k] = setTimeout(() => subir(k).catch(() => {}), 1500);
  }
  async function subir(k) {
    const valor = leer(k); if (valor == null) return;
    const r = await pedir("/rest/v1/datos?on_conflict=user_id,clave", { method: "POST",
      headers: await cab({ "Content-Type": "application/json", Prefer: "resolution=merge-duplicates,return=minimal" }),
      body: JSON.stringify({ clave: k, valor, actualizado: new Date(ts(k) || Date.now()).toISOString() }) }, 20000);
    if (!r.ok) { estado("No se ha podido guardar en la nube", PENDIENTE); throw new Error(await r.text()); }
    estado("Guardado en la nube", OK);
  }
  // Compara móvil y nube y se queda con lo más reciente. Devuelve las claves que han cambiado en el móvil.
  async function sincronizar(claves) {
    claves = claves || Object.keys(CLAVES);
    if (!configurado() || !sesion()) return [];
    const cambiadas = [];
    try {
      const r = await pedir("/rest/v1/datos?select=clave,valor,actualizado&clave=in.(" + claves.join(",") + ")", { headers: await cab() });
      if (!r.ok) throw new Error("HTTP " + r.status);
      const filas = await r.json(), rem = {};
      for (const f of filas) rem[f.clave] = f;
      for (const k of claves) {
        const loc = ts(k), f = rem[k], tr = f ? Date.parse(f.actualizado) : 0;
        if (f && tr > loc) { escribir(k, f.valor); setTs(k, tr); cambiadas.push(k); }
        else if (loc > tr && leer(k) != null) await subir(k);
      }
      estado("Sincronizado", OK);
    } catch (e) {
      if (e.auth) { requerir(); return []; }
      estado("Sin conexión: se guardará cuando vuelva", OFF);
    }
    return cambiadas;
  }

  // ---------- Fotos (Supabase Storage, carpeta privada del usuario) ----------
  const pend = () => { try { return JSON.parse(localStorage.getItem(PEND)) || []; } catch (e) { return []; } };
  const setPend = a => localStorage.setItem(PEND, JSON.stringify([...new Set(a)]));
  const ruta = id => `fotos/${sesion().user.id}/${encodeURIComponent(id)}.jpg`;
  async function subirFoto(id, blob) {
    if (!configurado() || !sesion()) return;
    try {
      const r = await pedir("/storage/v1/object/" + ruta(id), { method: "POST",
        headers: await cab({ "Content-Type": "image/jpeg", "x-upsert": "true" }), body: blob }, 60000);
      if (!r.ok) throw new Error("HTTP " + r.status);
      setPend(pend().filter(x => x !== id));
    } catch (e) { setPend(pend().concat(id)); }
  }
  async function bajarFoto(id) {
    if (!configurado() || !sesion()) return null;
    try {
      const r = await pedir("/storage/v1/object/authenticated/" + ruta(id), { headers: await cab() }, 60000);
      return r.ok ? await r.blob() : null;
    } catch (e) { return null; }
  }
  function borrarFoto(id) {
    if (!configurado() || !sesion()) return;
    cab().then(h => pedir("/storage/v1/object/" + ruta(id), { method: "DELETE", headers: h })).catch(() => {});
  }
  // Reintenta las fotos que no se pudieron subir (obtener(id) devuelve el blob local o null)
  async function reintentarFotos(obtener) {
    for (const id of pend()) { const b = await obtener(id).catch(() => null); if (b) await subirFoto(id, b); }
  }
  // Clientes guardados en este móvil (para enlazar planos y presupuestos)
  function clientes() { try { return (JSON.parse(localStorage.getItem("almara-clientes-v1")) || {}).clientes || []; } catch (e) { return []; } }

  return { configurado, sesion, entrar, salir, requerir, marcar, sincronizar, subirFoto, bajarFoto, borrarFoto, reintentarFotos,
    clientes, estado: () => est, CLAVES };
})();
