/**
 * CMS Worker — Taxi Surfcity Lainez
 * ----------------------------------
 * Backend seguro (corre en Cloudflare)
 */

const files = env => ({
  tours: env.TOURS_FILE || 'tours.html',
  index: env.INDEX_FILE || 'index.html',
  airport: 'aeropuerto.html',
  images: (env.IMAGES_DIR || 'assets/img').replace(/\/$/, ''),
});

const TOURS_START = '<!-- CMS:TOURS:START -->';
const TOURS_END = '<!-- CMS:TOURS:END -->';
const DATA_START = '<!-- CMS:DATA:TOURS';
const DATA_END = 'CMS:DATA:TOURS:END -->';

const PROMO_START = '<!-- CMS:PROMO:START -->';
const PROMO_END = '<!-- CMS:PROMO:END -->';
const PROMO_DATA_START = '<!-- CMS:DATA:PROMO';
const PROMO_DATA_END = 'CMS:DATA:PROMO:END -->';

const RATES_START='<!-- CMS:RATES:START -->', RATES_END='<!-- CMS:RATES:END -->', RATES_DATA='<!-- CMS:DATA:RATES', RATES_DATA_END='CMS:DATA:RATES:END -->';
const CONTENT_FIELDS = [
  { id: 'tours-hero-title', file: 'tours', label: 'Título principal — página Tours' },
  { id: 'tours-hero-lead', file: 'tours', label: 'Texto debajo del título — página Tours' },
  { id: 'index-hero-title', file: 'index', label: 'Título principal — página Inicio' },
  { id: 'index-hero-lead', file: 'index', label: 'Texto debajo del título — página Inicio' },
];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    try {
      if (url.pathname === '/api/login' && request.method === 'POST') return await handleLogin(request, env);
      if (url.pathname === '/api/state' && request.method === 'GET') return await withAuth(request, env, handleGetState);
      if (url.pathname === '/api/publish' && request.method === 'POST') return await withAuth(request, env, handlePublish);
      if (url.pathname === '/api/upload' && request.method === 'POST') return await withAuth(request, env, handleUpload);
      if (url.pathname === '/api/deployment' && request.method === 'GET') return await withAuth(request,env,handleDeployment);
      if (url.pathname === '/api/admin/maintenance' && ['GET','POST'].includes(request.method)) return await withAuth(request,env,handleMaintenance,'admin');
      if (url.pathname.startsWith('/api/')) return json({error:'Ruta API no encontrada'},404);
      return new Response(ADMIN_HTML, { headers: { 'content-type': 'text/html; charset=UTF-8', 'cache-control':'no-store', 'x-content-type-options':'nosniff', 'referrer-policy':'no-referrer','content-security-policy':"default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src https://taxistuncoelsalvador.com blob:; connect-src 'self'; form-action 'none'; base-uri 'none'; frame-ancestors 'none'; object-src 'none'" } });
    } catch (err) {
      return json({ error: String(err && err.message || err) }, 500);
    }
  },
};

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json; charset=UTF-8', 'cache-control':'no-store', 'x-content-type-options':'nosniff' } });
}

async function signSession(payload,password) {
  const enc=new TextEncoder();
  const key=await crypto.subtle.importKey('raw',enc.encode(password),{name:'HMAC',hash:'SHA-256'},false,['sign']);
  const sig=new Uint8Array(await crypto.subtle.sign('HMAC',key,enc.encode(payload)));
  return Array.from(sig,b=>b.toString(16).padStart(2,'0')).join('');
}
function secretFor(env,role){return role==='admin'?env.SITE_ADMIN_PASSWORD:(env.MARKETING_PASSWORD||env.ADMIN_PASSWORD)}
async function validSession(token,env){
  const p=token.split('.');
  if(!env.SESSION_SECRET||env.SESSION_SECRET.length<32||p.length!==4||!/^\d+$/.test(p[0])||Number(p[0])<=Date.now()||!['marketing','admin'].includes(p[1])||!secretFor(env,p[1])||!/^[a-f0-9]{64}$/.test(p[3]))return null;
  const expected=await signSession(p.slice(0,3).join('.'),env.SESSION_SECRET+'\n'+secretFor(env,p[1]));
  let diff=0;for(let i=0;i<64;i++)diff|=expected.charCodeAt(i)^p[3].charCodeAt(i);
  return diff===0?p[1]:null;
}
async function withAuth(request,env,handler,required=null){
  const role=await validSession((request.headers.get('Authorization')||'').replace(/^Bearer\s+/i,''),env);
  if(!role)return json({error:'Sesión caducada. Inicia sesión nuevamente.'},401);
  if(required&&role!==required)return json({error:'Acceso exclusivo del administrador.'},403);
  return handler(request,env,role);
}
async function handleLogin(request,env){
  if(!env.SESSION_SECRET||env.SESSION_SECRET.length<32)return json({error:'Falta SESSION_SECRET (mínimo 32 caracteres).'},503);
  const body=await request.json().catch(()=>({}));
  const role=body.role==='admin'?'admin':'marketing';
  const secret=secretFor(env,role);
  if(role==='admin'&&(!secret||secret===secretFor(env,'marketing')))return json({error:'Configura una contraseña de administrador diferente a marketing.'},503);
  if(typeof body.password!=='string'||!secret||body.password!==secret)return json({ok:false,error:'Contraseña incorrecta.'},401);
  const payload=String(Date.now()+8*60*60*1000)+'.'+role+'.'+crypto.randomUUID();
  return json({ok:true,role,token:payload+'.'+await signSession(payload,env.SESSION_SECRET+'\n'+secret)});
}

// ---------- GitHub Contents API helpers ----------

function buildGhPath(path) {
  return path.split('/').map(segment => encodeURIComponent(segment)).join('/');
}

async function ghGet(env, path, ref) {
  for (const key of ['GITHUB_OWNER','GITHUB_REPO','GITHUB_TOKEN']) if (!env[key]) throw new Error('Falta el secreto o variable '+key);
  const safePath = buildGhPath(path);
  const branch = ref || env.GITHUB_BRANCH || 'main';
  const url = `https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/${safePath}?ref=${encodeURIComponent(branch)}`;
  
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'taxi-surfcity-cms-worker',
    },
  });

  if (res.status === 404) return { content: null, sha: null };
  if (!res.ok) throw new Error(`GitHub GET ${path} → ${res.status}: ${await res.text()}`);

  const data = await res.json();
  if (data.type !== 'file' || data.encoding !== 'base64' || typeof data.content !== 'string') throw new Error('GitHub no devolvió un archivo legible: '+path);
  const rawBase64 = data.content.replace(/\s/g, '');
  const content = decodeURIComponent(escape(atob(rawBase64)));
  return { content, sha: data.sha };
}

async function ghPut(env, path, newContent, sha, message, isBase64 = false) {
  const safePath = buildGhPath(path);
  const url = `https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/${safePath}`;
  const b64 = isBase64 ? newContent : btoa(unescape(encodeURIComponent(newContent)));
  
  const bodyData = { message, content: b64, branch: env.GITHUB_BRANCH || 'main' };
  if (sha) bodyData.sha = sha;

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'taxi-surfcity-cms-worker',
      'content-type': 'application/json',
    },
    body: JSON.stringify(bodyData),
  });

  if (!res.ok) throw new Error(`GitHub PUT ${path} → ${res.status}: ${await res.text()}`);
  return res.json();
}

function between(text, startMarker, endMarker) {
  const i = text.indexOf(startMarker);
  const j = text.indexOf(endMarker, i);
  if (i === -1 || j === -1) return null;
  return { before: text.slice(0, i), inner: text.slice(i + startMarker.length, j), after: text.slice(j + endMarker.length), i, j };
}

// ---------- Upload API ----------
async function handleUpload(request, env) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file || !file.name) {
      return json({ error: 'No se subió ningún archivo' }, 400);
    }

    const allowed = {'image/png':'png','image/jpeg':'jpg','image/webp':'webp'};
    if (!allowed[file.type] || file.size > 5*1024*1024 || !file.size) return json({error:'Solo PNG, JPG o WEBP de hasta 5 MB.'},400);
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    
    let binary = '';
    const chunkSize = 8192;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
    }
    const b64 = btoa(binary);

    const base = file.name.replace(/\.[^.]+$/, '').replace(/[^a-z0-9_-]/gi, '_').toLowerCase().slice(0,70) || 'imagen';
    const safeFilename = `${base}_${crypto.randomUUID()}.${allowed[file.type]}`;
    const githubPath = `${files(env).images}/${safeFilename}`;
    const result=await ghPut(env,githubPath,b64,null,`Subir imagen: ${safeFilename}`,true);
    return json({ok:true,filename:safeFilename,commit:result.commit?.sha});
  } catch (err) {
    return json({ error: 'Error al procesar la imagen: ' + err.message }, 500);
  }
}

// ---------- Reading current state ----------

function readData(source, start, end, ds, de, label) {
  const block = between(source, start, end);
  if (!block) throw new Error('Faltan marcadores CMS: '+label);
  const data = between(block.inner, ds, de);
  if (!data) throw new Error('Faltan datos CMS: '+label);
  let value;
  try { value = JSON.parse(data.inner.trim()); } catch { throw new Error('JSON CMS inválido: '+label); }
  if (label === 'Promoción' && value && !Array.isArray(value)) value = [value];
  if (!Array.isArray(value)) throw new Error('Datos CMS inválidos: '+label);
  return {block, data, value};
}
function normalizePromos(promos) {
  return promos.map((p,i)=>({...p,id:p.id || 'promo-legacy-'+i}));
}
async function github(env,path,method='GET',body){
  for(const k of ['GITHUB_OWNER','GITHUB_REPO','GITHUB_TOKEN'])if(!env[k])throw Error('Falta '+k);
  const r=await fetch('https://api.github.com/repos/'+env.GITHUB_OWNER+'/'+env.GITHUB_REPO+path,{method,headers:{Authorization:'Bearer '+env.GITHUB_TOKEN,Accept:'application/vnd.github+json','User-Agent':'taxi-surfcity-cms-worker','Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});
  if(!r.ok)throw Error('GitHub '+method+' '+path+' → '+r.status);return r.json();
}
function branchRef(env){return '/git/ref/heads/'+buildGhPath(env.GITHUB_BRANCH||'main')}
async function sha256(text){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text))),b=>b.toString(16).padStart(2,'0')).join('')}
async function readSite(env){
  const paths=files(env),head=(await github(env,branchRef(env))).object.sha;
  const [toursFile,indexFile,airportFile]=await Promise.all([ghGet(env,paths.tours,head),ghGet(env,paths.index,head),ghGet(env,paths.airport,head)]);
  for(const [path,file] of [[paths.tours,toursFile],[paths.index,indexFile],[paths.airport,airportFile]])if(file.content===null)throw Error('GitHub 404: '+path);
  const tours=readData(toursFile.content,TOURS_START,TOURS_END,DATA_START,DATA_END,'Tours');
  const promos=readData(indexFile.content,PROMO_START,PROMO_END,PROMO_DATA_START,PROMO_DATA_END,'Promoción');
  const rates=readData(airportFile.content,RATES_START,RATES_END,RATES_DATA,RATES_DATA_END,'Tarifas');
  const content={};
  for(const f of CONTENT_FIELDS){const source=f.file==='tours'?toursFile.content:indexFile.content;const m=between(source,'<!-- CMS:CONTENT:'+f.id+':START -->','<!-- CMS:CONTENT:'+f.id+':END -->');if(!m)throw Error('Falta marcador '+f.id);content[f.id]=m.inner.trim();}
  const hashes=Object.fromEntries(await Promise.all(Object.entries({tours:toursFile.content,index:indexFile.content,airport:airportFile.content}).map(async ([k,v])=>[k,await sha256(v)])));
  return {head,toursFile,indexFile,airportFile,tours,promos,rates,content,hashes,revision:{tours:toursFile.sha,index:indexFile.sha,airport:airportFile.sha}};
}
async function handleGetState(request,env,role){
  const site=await readSite(env);return json({ok:true,role,tours:site.tours.value,promos:normalizePromos(site.promos.value),rates:site.rates.value,content:site.content,contentFields:CONTENT_FIELDS,revision:site.revision,hashes:site.hashes,missing:{tours:false,promo:false,content:[]}});
}
async function publicStatus(){
  const r=await fetch('https://taxistuncoelsalvador.com/api/site-status?check='+crypto.randomUUID(),{headers:{Accept:'application/json','Cache-Control':'no-cache'},redirect:'manual'});
  if(r.status>=300&&r.status<400)throw Error('La verificación pública recibió una redirección (HTTP '+r.status+'). Revisa el dominio y la ruta /api/site-status en Cloudflare.');
  if(!r.ok)throw Error('La verificación pública todavía no está disponible (HTTP '+r.status+').');
  const data=await r.json();if(!data.ok||!data.hashes||!data.maintenance)throw Error('El sitio aún no tiene la API de verificación actualizada.');return data;
}
async function handleDeployment(){try{return json(await publicStatus())}catch(e){return json({error:e.message},503)}}
async function handleMaintenance(request,env){
  if(!env.SITE_CONTROL)return json({error:'Falta vincular SITE_CONTROL al Worker taxicms.'},503);
  const saved=await env.SITE_CONTROL.get('maintenance',{type:'json'})||{active:false,message:'Estamos mejorando nuestra página web. Gracias por tu paciencia.',whatsapp:true,revision:null};
  if(request.method==='GET'){let live=null;try{live=(await publicStatus()).maintenance}catch{}return json({ok:true,desired:saved,live});}
  const b=await request.json();
  if(typeof b.active!=='boolean'||typeof b.whatsapp!=='boolean'||typeof b.message!=='string'||b.message.length>500)return json({error:'Configuración de mantenimiento inválida.'},400);
  if(b.revision!==saved.revision)return json({error:'El estado cambió. Recarga antes de modificarlo.'},409);
  if(b.active){let live;try{live=await publicStatus()}catch(e){return json({error:e.message},503)}if(!live.maintenance.configured)return json({error:'SITE_CONTROL aún no está vinculado al Worker público.'},503);}
  const desired={active:b.active,whatsapp:b.whatsapp,message:b.message.trim(),revision:crypto.randomUUID(),updatedAt:new Date().toISOString()};
  await env.SITE_CONTROL.put('maintenance',JSON.stringify(desired));return json({ok:true,desired});
}
function validateRates(rates){
  validateList(rates,['origin','destination'],'Tarifas');
  for(const t of rates){if(t.image!==undefined&&(typeof t.image!=='string'||!(/^[a-z0-9_-][a-z0-9_.-]{0,149}\.(?:png|jpe?g|webp)$/i.test(t.image))||t.image.includes('..')))throw Error('Nombre de fotografía inválido: '+t.id);}
  for(const t of rates){if(!t.origin.trim()||!t.destination.trim()||t.origin.length>100||t.destination.length>150||typeof t.active!=='boolean'||!Number.isFinite(t.price)||t.price<0.01||t.price>10000||Math.abs(t.price*100-Math.round(t.price*100))>1e-6||!Number.isInteger(t.minPassengers)||!Number.isInteger(t.maxPassengers)||t.minPassengers<1||t.maxPassengers>50||t.minPassengers>t.maxPassengers)throw Error('Tarifa inválida: '+t.id);}
}
function rateCardHTML(t){
  const dest=t.destination==='Aeropuerto Internacional (SAL)'?' data-i18n="airport.sal"':'';
  const filename=typeof t.image==='string'&&/^[a-z0-9_-][a-z0-9_.-]{0,149}\.(?:png|jpe?g|webp)$/i.test(t.image)&&!t.image.includes('..')?t.image:'aero.webp';
  return '<article class="card airport-rate" id="'+esc(t.id)+'"><div class="airport-photo"><img src="/assets/img/'+encodeURIComponent(filename)+'" alt="'+esc(t.origin+' — '+t.destination)+'" loading="lazy" decoding="async" width="640" height="360"><span class="airport-service-label"><i class="bi bi-airplane" aria-hidden="true"></i> SAL</span></div><div class="card-body airport-rate-body"><div class="airport-route"><span data-i18n="airport.from">Desde</span><h3>'+esc(t.origin)+'</h3><div class="airport-destination"><i class="bi bi-arrow-right" aria-hidden="true"></i><span data-i18n="airport.to">Hacia</span> <strong'+dest+'>'+esc(t.destination)+'</strong></div></div><div class="airport-fare"><strong>$'+t.price.toFixed(2)+'</strong><span>USD · <span data-i18n="airport.vehicle">por vehículo</span></span></div><p class="airport-capacity"><i class="bi bi-people" aria-hidden="true"></i> '+t.minPassengers+'–'+t.maxPassengers+' <span data-i18n="airport.passengers">personas</span></p><a class="airport-button btn btn-lime" href="'+waLink('Hola, quisiera reservar un traslado de '+t.origin+' a '+t.destination+' por $'+t.price.toFixed(2)+' ('+t.minPassengers+'–'+t.maxPassengers+' personas).')+'" target="_blank" rel="noopener"><i class="bi bi-whatsapp" aria-hidden="true"></i> <span data-i18n="airport.book">Reservar por WhatsApp</span></a></div></article>';
}
async function commitChanges(env,site,sources){
  const originals={tours:site.toursFile.content,index:site.indexFile.content,airport:site.airportFile.content};
  const changed=Object.keys(sources).filter(k=>sources[k]!==originals[k]);if(!changed.length)return {commit:null,changed,hashes:{}};
  const base=(await github(env,'/git/commits/'+site.head)).tree.sha;
  const tree=await github(env,'/git/trees','POST',{base_tree:base,tree:changed.map(k=>({path:files(env)[k],mode:'100644',type:'blob',content:sources[k]}))});
  const commit=await github(env,'/git/commits','POST',{message:'CMS: Publish '+changed.join(', '),tree:tree.sha,parents:[site.head]});
  await github(env,branchRef(env).replace('/git/ref/','/git/refs/'),'PATCH',{sha:commit.sha,force:false});
  const hashes=Object.fromEntries(await Promise.all(changed.map(async k=>[k,await sha256(sources[k])])));
  return {commit:commit.sha,changed,hashes};
}

// ---------- Publishing ----------

function esc(s) { return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function waLink(msg) { return 'https://wa.me/50376401181?text=' + encodeURIComponent(msg || ''); }

function tourCardHTML(t) {
  const hi = (t.highlights || '').split('\n').map(s => s.trim()).filter(Boolean)
    .map(li => `                <li><i class="bi bi-check-circle"></i> ${esc(li)}</li>`).join('\n');
  const priceTag = t.pricetag ? `\n          <span class="tour-price-tag">${esc(t.pricetag)}</span>` : '';
  return `      <article class="tour-card" id="${esc(t.id)}" data-reveal>
        <div class="tour-card-media">
          <img src="/assets/img/${encodeURIComponent(t.image)}" alt="${esc(t.title)} - El Salvador" loading="lazy" decoding="async" width="400" height="220">${priceTag}
        </div>
        <div class="tour-card-body">
          <div class="tour-meta"><span><i class="bi bi-clock icon"></i> ${esc(t.duration)}</span><span><i class="bi bi-geo-alt icon"></i> ${esc(t.location)}</span></div>
          <h3>${esc(t.title)}</h3>
          <p class="tour-summary">${esc(t.summary)}</p>
          <div class="tour-card-actions">
            <button class="tour-toggle" type="button" aria-expanded="false"><span data-i18n="t.toggle">Ver detalles</span> <i class="bi bi-chevron-down"></i></button>
            <a class="tour-card-wa" href="${waLink(t.wa)}" target="_blank" rel="noopener"><i class="bi bi-whatsapp"></i> <span data-i18n="t.reserve">Reservar</span></a>
          </div>
          <div class="tour-details">
            <div class="tour-details-inner">
              <div class="tour-extra-meta">
                <span><i class="bi bi-people"></i> ${esc(t.capacity)}</span>
                <span><i class="bi bi-car-front"></i> <span data-i18n="t.veh.ac">Vehículo privado climatizado</span></span>
              </div>
              <h4 data-i18n="t.includes">Lo que incluye este tour</h4>
              <ul class="tour-highlights">
${hi}
              </ul>
              <a class="card-link" href="${waLink(t.wa)}" target="_blank" rel="noopener"><span data-i18n="t.cta">Consultar disponibilidad y precios</span> <i class="bi bi-arrow-right"></i></a>
            </div>
          </div>
        </div>
      </article>`;
}

function promoHTML(promos) {
  const activePromo = promos.find(p => p.active);
  if (!activePromo) return '';
  const cta = activePromo.ctaText && /^https?:\/\//i.test(activePromo.ctaLink || '')
    ? `<a href="${esc(activePromo.ctaLink)}" target="_blank" rel="noopener" class="btn btn-lime" style="margin-left:12px">${esc(activePromo.ctaText)}</a>` : '';
  return `<div class="promo-banner" style="background:linear-gradient(90deg,#25D366,#1ebe57);color:#062712;padding:14px 20px;text-align:center;font-weight:600;">
  <span>${esc(activePromo.title)}${activePromo.title && activePromo.text ? ' — ' : ''}${esc(activePromo.text)}</span>${cta}
</div>`;
}

function same(a,b) {
  if (a === b) return true;
  if (!a || !b || typeof a !== 'object' || typeof b !== 'object' || Array.isArray(a)!==Array.isArray(b)) return false;
  const ak=Object.keys(a), bk=Object.keys(b);
  return ak.length===bk.length && ak.every(k=>Object.hasOwn(b,k)&&same(a[k],b[k]));
}
function safeJson(value) { return JSON.stringify(value,null,2).replace(/</g,'\\u003c').replace(/>/g,'\\u003e'); }
function spliceBlock(source, block, start, inner, end) {
  return block.before+start+inner+end+block.after;
}
function withoutI18n(tag) { return tag.replace(/\sdata-i18n="[^"]*"/g,''); }
function patchCard(card, old, t) {
  const update = (pattern, fn) => { if (!pattern.test(card)) throw new Error('Estructura de tarjeta incompatible: '+t.id); card = card.replace(pattern,fn); };
  const textField = (key, pattern) => { if (old[key]!==t[key]) update(pattern,(_,a,b,c)=>withoutI18n(a)+esc(t[key])+c); };
  textField('title', /(<h3\b[^>]*>)([\s\S]*?)(<\/h3>)/);
  textField('summary', /(<p class="tour-summary"[^>]*>)([\s\S]*?)(<\/p>)/);
  if (old.duration!==t.duration) update(/(<i class="bi bi-clock icon"><\/i>\s*)(?:<span[^>]*>[\s\S]*?<\/span>|[^<]*)(<\/span>)/,(_,a,b)=>a+esc(t.duration)+b);
  if (old.location!==t.location) update(/(<i class="bi bi-geo-alt icon"><\/i>\s*)(?:<span[^>]*>[\s\S]*?<\/span>|[^<]*)(<\/span>)/,(_,a,b)=>a+esc(t.location)+b);
  if (old.capacity!==t.capacity) update(/(<i class="bi bi-people"><\/i>\s*)(?:<span[^>]*>[\s\S]*?<\/span>|[^<]*)(<\/span>)/,(_,a,b)=>a+esc(t.capacity)+b);
  if (old.image!==t.image) update(/<img\b[^>]*>/,m=>m.replace(/\bsrc="[^"]*"/,`src="/assets/img/${encodeURIComponent(t.image)}"`));
  if (old.title!==t.title) update(/<img\b[^>]*>/,m=>m.replace(/\balt="[^"]*"/,`alt="${esc(t.title)} - El Salvador"`));
  if (old.wa!==t.wa) card=card.replace(/href="https:\/\/wa\.me\/50376401181\?text=[^"]*"/g,`href="${waLink(t.wa)}"`);
  if (old.pricetag!==t.pricetag) {
    card=card.replace(/<span class="tour-price-tag"[^>]*>[\s\S]*?<\/span>/,'');
    if (t.pricetag) update(/<img\b[^>]*>/,m=>m+`\n          <span class="tour-price-tag">${esc(t.pricetag)}</span>`);
  }
  if (old.highlights!==t.highlights) update(/(<ul class="tour-highlights"[^>]*>)([\s\S]*?)(<\/ul>)/,(_,a,b,c)=>{
    const existing=[...b.matchAll(/<li\b[^>]*>[\s\S]*?<\/li>/g)].map(x=>x[0]);
    const oldLines=String(old.highlights||'').split('\n').map(x=>x.trim()).filter(Boolean);
    const lines=String(t.highlights||'').split('\n').map(x=>x.trim()).filter(Boolean);
    return a+'\n'+lines.map(line=>existing[oldLines.indexOf(line)]||`<li><i class="bi bi-check-circle"></i> ${esc(line)}</li>`).join('\n')+'\n'+c;
  });
  return card;
}
function validateList(list, fields, label) {
  if (!Array.isArray(list) || list.length>100) throw new Error('Lista inválida: '+label);
  const ids=new Set();
  for (const x of list) {
    if (!x || typeof x.id!=='string' || !/^[a-z0-9_-]+$/i.test(x.id) || ids.has(x.id)) throw new Error('ID inválido: '+label);
    ids.add(x.id);
    if (fields.some(k=>typeof x[k]!=='string'||x[k].length>15000)) throw new Error('Campos inválidos: '+label);
  }
}
function heroSafe(value) {
  // Conservar las etiquetas de formato del título, sin aceptar HTML ejecutable.
  return esc(value).replace(/&lt;br\s*\/?&gt;/gi,'<br>').replace(/&lt;(\/?)(strong|em|b|i)&gt;/gi,'<$1$2>').replace(/&lt;span class=&quot;text-lime-gradient&quot;&gt;/g,'<span class="text-lime-gradient">').replace(/&lt;\/span&gt;/g,'</span>');
}
async function handlePublish(request, env) {
  const {tours,promos,content,revision,rates}=await request.json();
  if(rates!==undefined)validateRates(rates);
  if(!Array.isArray(tours)||tours.length<1)return json({error:"Conserva al menos un tour."},400);
  validateList(tours,['title','duration','location','summary','highlights','capacity','pricetag','image','wa'],'Tours');
  validateList(promos,['title','text','ctaText','ctaLink'],'Promociones');
  if (tours.some(t=>t.image&&!/^[a-z0-9_.-]+\.(png|jpe?g|webp)$/i.test(t.image))) return json({error:'Nombre de imagen inválido.'},400);
  if (promos.some(p=>typeof p.active!=='boolean'||(p.ctaLink&&!/^https?:\/\//i.test(p.ctaLink)))) return json({error:'Promoción inválida: usa enlaces HTTP o HTTPS.'},400);
  if (!content || typeof content!=='object' || Array.isArray(content)) return json({error:'Textos inválidos.'},400);
  const site=await readSite(env);
  if (!revision || revision.tours!==site.revision.tours || revision.index!==site.revision.index || (rates!==undefined&&revision.airport!==site.revision.airport)) return json({error:'El sitio cambió desde que abriste el panel. Recarga antes de publicar.'},409);
  const {toursFile,indexFile}=site;
  let newTours=toursFile.content, newIndex=indexFile.content;
  if (!same(tours,site.tours.value)) {
    const cards=new Map([...site.tours.block.inner.slice(site.tours.data.j+DATA_END.length).matchAll(/<article class="tour-card" id="([^"]+)"[^>]*>[\s\S]*?<\/article>/g)].map(x=>[x[1],x[0]]));
    if (cards.size!==site.tours.value.length || site.tours.value.some(t=>!cards.has(t.id))) throw new Error('Las tarjetas no coinciden con los datos CMS; publicación cancelada.');
    const old=new Map(site.tours.value.map(t=>[t.id,t]));
    const html=tours.map(t=>old.has(t.id)?(same(old.get(t.id),t)?cards.get(t.id):patchCard(cards.get(t.id),old.get(t.id),t)):tourCardHTML(t)).join('\n\n');
    newTours=spliceBlock(newTours,site.tours.block,TOURS_START,`\n${DATA_START}\n${safeJson(tours)}\n${DATA_END}\n${html}\n    `,TOURS_END);
  }
  if (!same(promos,normalizePromos(site.promos.value))) {
    newIndex=spliceBlock(newIndex,site.promos.block,PROMO_START,`\n${PROMO_DATA_START}\n${safeJson(promos)}\n${PROMO_DATA_END}\n${promoHTML(promos)}\n`,PROMO_END);
  }
  let newAirport=site.airportFile.content;
  if(rates!==undefined&&!same(rates,site.rates.value)){
    const cards=rates.filter(t=>t.active).map(rateCardHTML).join('\n');
    newAirport=spliceBlock(newAirport,site.rates.block,RATES_START,'\n'+RATES_DATA+'\n'+safeJson(rates)+'\n'+RATES_DATA_END+'\n'+(cards||'<p data-i18n="airport.noRates">Consulta una cotización personalizada por WhatsApp.</p>')+'\n',RATES_END);
  }
  const sources={tours:newTours,index:newIndex,airport:newAirport};
  for (const f of CONTENT_FIELDS) {
    if (!Object.hasOwn(content,f.id)||content[f.id]===site.content[f.id]) continue;
    if (typeof content[f.id]!=='string'||content[f.id].length>15000) return json({error:'Texto inválido.'},400);
    const a=`<!-- CMS:CONTENT:${f.id}:START -->`, b=`<!-- CMS:CONTENT:${f.id}:END -->`;
    const blk=between(sources[f.file],a,b);
    if (!blk) throw new Error('Falta marcador '+f.id);
    // El texto editado debe verse y no quedar sobrescrito por el diccionario anterior.
    sources[f.file]=blk.before.replace(/(<(?:h1|p)\b[^>]*>)$/,withoutI18n)+a+heroSafe(content[f.id])+b+blk.after;
  }
  try {
    const result=await commitChanges(env,site,sources);
    return json({ok:true,commit:result.commit,changed:result.changed.length,hashes:result.hashes,commits:result.commit?['https://github.com/'+env.GITHUB_OWNER+'/'+env.GITHUB_REPO+'/commit/'+result.commit]:[]});
  }catch(e){return json({error:'No se pudo confirmar la publicación. Recarga antes de reintentar. '+e.message},409);}
}
const ADMIN_HTML = "<!doctype html>\n<html lang=\"es\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1,viewport-fit=cover\"><title>TaxiCMS · Administración</title>\n<style>\n:root{color-scheme:light;--bg:#f4f6f3;--card:#fff;--ink:#18362e;--muted:#62726b;--line:#dce5df;--green:#176745;--lime:#d9f5d8;--warn:#885a18;--danger:#a13b36;--shadow:0 5px 18px #18362e0c}\n*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.45 system-ui,-apple-system,sans-serif}button,input,textarea{font:inherit}button{cursor:pointer;min-height:44px;border:0;border-radius:12px;padding:10px 15px;font-weight:650;background:var(--green);color:white}button:disabled{opacity:.55;cursor:default}button.secondary{background:#fff;color:var(--ink);border:1px solid var(--line)}button.danger{color:var(--danger);background:#fff3f2;border:1px solid #f1d6d3}button.small{padding:8px 12px;font-size:13px;min-height:40px}a{color:var(--green);font-weight:600}h1,h2,h3,p{margin:0}h1{font-size:26px;letter-spacing:-.7px;line-height:1.15}h2{font-size:20px;letter-spacing:-.4px}h3{font-size:16px;line-height:1.3}p{overflow-wrap:anywhere}.muted{color:var(--muted);font-size:13px}.eyebrow{font-size:11px;font-weight:750;letter-spacing:1.4px;text-transform:uppercase;color:var(--green)}[hidden]{display:none!important}.shell{max-width:1100px;margin:auto;padding:20px 16px 110px}.head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:20px}.head h1{margin-top:4px}.head p{margin-top:6px}.metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-bottom:20px}.metric{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:12px 10px;box-shadow:var(--shadow);min-width:0}.metric strong{display:block;font-size:26px;line-height:1.1;letter-spacing:-1px}.metric span{display:block;font-size:11px;color:var(--muted);margin-top:6px}.tabs{display:grid;grid-template-columns:repeat(3,1fr);background:#e6ece7;border-radius:14px;padding:4px;gap:4px;margin-bottom:22px}.tabs button{background:transparent;color:var(--muted);padding:10px 4px;font-size:14px}.tabs button[aria-selected=true]{background:#fff;color:var(--green);box-shadow:var(--shadow)}.section-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px}.section-head p{margin-top:3px}.search{margin-bottom:14px}input,textarea{width:100%;padding:12px 13px;border:1px solid #cad8cf;border-radius:12px;background:#fff;color:var(--ink);outline-color:var(--green);min-width:0}textarea{min-height:94px;resize:vertical}label{display:block;font-size:13px;font-weight:650;margin:12px 0 5px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:14px}.card{background:var(--card);border:1px solid var(--line);border-radius:18px;overflow:hidden;box-shadow:var(--shadow)}.pad{padding:16px}.photo{height:172px;background:linear-gradient(135deg,#d9e8df,#a9c9b7);position:relative;overflow:hidden;display:grid;place-items:center;color:#456b56;font-weight:600;font-size:13px}.photo img{width:100%;height:100%;object-fit:cover;position:absolute;inset:0}.price{position:absolute;bottom:10px;left:10px;max-width:90%;background:#fff;color:var(--ink);padding:6px 10px;border-radius:8px;font-size:12px;font-weight:700}.meta{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0}.chip{background:#eaf2ed;color:#426653;border-radius:6px;padding:4px 8px;font-size:12px}.summary{font-size:14px;color:var(--muted);margin:9px 0;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}.actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:13px}.actions button{flex:1}.preview-btn{width:100%;margin-top:12px}.empty{padding:30px 18px;border:1px dashed #b7c9bd;border-radius:16px;text-align:center;color:var(--muted)}.banner{border-radius:12px;background:#fff2d9;color:var(--warn);padding:12px;margin-bottom:15px;font-size:13px;overflow-wrap:anywhere}.promo-preview{background:#e6f7e8;border:1px solid #bee4c7;border-radius:12px;padding:15px;margin:12px 0;color:#174d32;overflow-wrap:anywhere}.promo-preview .cta{display:inline-block;margin-top:10px;background:#176745;color:white;border-radius:8px;padding:8px 12px;font-weight:650;font-size:13px}.status-tag{display:inline-block;border-radius:20px;padding:4px 9px;background:#e9efeb;font-size:11px;font-weight:700;color:var(--muted)}.status-tag.active{background:#d9f5d8;color:#176745}.text-group{margin-bottom:14px}.text-group h3{margin-bottom:4px}.text-group .muted{margin-bottom:12px}.preview-text{border-radius:12px;padding:16px;background:#10382b;color:#fff;margin-top:15px;overflow-wrap:anywhere}.preview-text strong{display:block;font-size:20px;line-height:1.25}.preview-text p{margin-top:8px;font-size:13px;color:#dce9df}.footer{position:fixed;bottom:0;left:0;right:0;background:#fff;border-top:1px solid var(--line);padding:11px 16px max(11px,env(safe-area-inset-bottom));z-index:3}.footer-inner{max-width:1070px;margin:auto;display:flex;align-items:center;justify-content:space-between;gap:10px}.footer strong{font-size:13px;display:block}.footer p{font-size:11px;color:var(--muted)}.footer button{flex-shrink:0}.login{max-width:430px;padding:24px;margin:9vh auto 0}.login .card{padding:24px}.login h1{margin:8px 0}.login button{width:100%;margin-top:15px}.login .mark{width:48px;height:48px;background:var(--green);color:#fff;border-radius:14px;display:grid;place-items:center;font-size:23px;font-weight:800}.error{color:var(--danger);font-size:13px;margin-top:12px;overflow-wrap:anywhere}.dialog{border:0;padding:0;width:min(94%,600px);max-height:90vh;border-radius:20px;color:var(--ink);background:white;box-shadow:0 20px 65px #0003}.dialog::backdrop{background:#112a23a6}.dialog-head{padding:17px 18px;border-bottom:1px solid var(--line);display:flex;align-items:center;justify-content:space-between;gap:10px;position:sticky;top:0;background:#fff;z-index:1}.dialog-body{padding:16px 18px}.dialog-footer{position:sticky;bottom:0;display:flex;gap:8px;padding:13px 18px;background:#fff;border-top:1px solid var(--line)}.dialog-footer button{flex:1}.two{display:grid;grid-template-columns:1fr 1fr;gap:10px}.upload{border:1px dashed #b4cbbb;border-radius:12px;padding:12px;margin-top:10px}.upload input{padding:9px}.upload button{margin-top:8px;width:100%}.upload img{max-height:180px;width:100%;object-fit:cover;border-radius:10px;margin-top:8px}.toast{position:fixed;bottom:90px;left:16px;right:16px;max-width:550px;margin:auto;background:#18362e;color:white;border-radius:12px;padding:13px 15px;box-shadow:var(--shadow);z-index:5;overflow-wrap:anywhere}.detail-list{padding-left:20px;margin:10px 0}.detail-list li{margin:4px 0}.links{margin-top:16px;display:flex;gap:16px;font-size:13px;flex-wrap:wrap}\n@media(min-width:650px){.shell{padding:28px 24px 110px}.metrics{gap:14px}.metric{padding:18px}.photo{height:205px}.metric span{font-size:13px}}@media(max-width:360px){.shell{padding:15px 12px 110px}.two{grid-template-columns:1fr}.section-head h2{font-size:18px}.footer button{padding:9px 11px}.footer p{display:none}}\n.tabs{grid-template-columns:repeat(auto-fit,minmax(74px,1fr))}.tabs button{font-size:13px}.role-select{width:100%;border:1px solid #cad8cf;border-radius:12px;background:#fff;color:var(--ink);padding:12px;font:inherit}.stage-list{display:grid;gap:8px;margin-top:12px}.stage{display:flex;gap:9px;align-items:flex-start;font-size:13px}.stage-dot{display:inline-grid;place-items:center;width:21px;height:21px;flex:0 0 21px;border-radius:50%;background:#e8eeea;color:#62726b;font-weight:750}.stage.done .stage-dot{background:#d9f5d8;color:#176745}.stage.current .stage-dot{background:#ffedca;color:#885a18}.progress-card{margin-bottom:15px}.progress-card summary{font-size:14px;font-weight:700;cursor:pointer}.fare-number{font-size:32px;font-weight:750;color:var(--green);line-height:1.15;margin-top:10px}.check-label{display:flex;align-items:center;gap:10px;font-size:14px;margin:15px 0}.check-label input{width:20px;height:20px}.admin-preview{background:#10382b;color:white;text-align:center;border-radius:15px;padding:22px 15px;margin:15px 0}.admin-preview p{color:#dce9df;margin:8px 0}.admin-preview .chip{display:inline-block}.status-line{font-size:13px;color:var(--muted);margin-top:8px;overflow-wrap:anywhere}.upload progress{width:100%;height:12px;margin-top:8px}.section-head{flex-wrap:wrap}@media(max-width:360px){.tabs{grid-template-columns:repeat(2,1fr)}}\n.workspace-nav{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,96px),1fr));gap:7px;margin-bottom:20px}.workspace-nav button{background:#fff;border:1px solid var(--line);color:var(--ink);min-height:60px;min-width:0;text-align:left;padding:10px;display:flex;flex-direction:column;justify-content:center;gap:3px;border-radius:14px}.workspace-nav button[aria-pressed=true]{background:#176745;border-color:#176745;color:#fff}.workspace-nav button span{font-size:13px;overflow-wrap:anywhere;font-weight:750}.workspace-nav button small{font-size:10px;font-weight:500;line-height:1.3;color:var(--muted);overflow-wrap:anywhere}.workspace-nav button[aria-pressed=true] small{color:#e7f5e9}.tabs{grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:3px}.tabs button{font-size:clamp(10px,3.15vw,13px);padding:10px 2px;min-width:0}.publication-status{display:flex;align-items:center;gap:12px;margin-bottom:12px}.publication-status h3{margin-bottom:4px}.publication-icon{display:grid;place-items:center;width:42px;height:42px;flex:0 0 42px;border-radius:12px;font-size:22px;font-weight:750;background:#e8eeea;color:#536b5e}.publication-icon.good{background:#d9f5d8;color:#176745}.publication-icon.pending{background:#fff2d9;color:#885a18}.technical-details{margin-top:15px;border-top:1px solid var(--line);padding-top:10px}.technical-details summary{font-size:12px;color:var(--muted)}.technical-details p{margin-top:8px;overflow-wrap:anywhere}.stage-list{margin:16px 0}.progress-card .actions{margin-top:16px}.head{margin-bottom:15px}.shell.no-footer{padding-bottom:30px}@media(max-width:360px){.workspace-nav button{padding:8px 6px}.workspace-nav button span{font-size:11px}.workspace-nav button small{font-size:9px}}\n</style></head><body>\n<main id=\"login\" class=\"login\" hidden><div class=\"card\"><div class=\"mark\">T</div><p class=\"eyebrow\" style=\"margin-top:14px\">Taxi Surf City</p><h1>Bienvenido</h1><p class=\"muted\">Administra tus tours, ofertas y contenido en un solo lugar.</p><form id=\"loginForm\"><label for=\"loginRole\">Tipo de acceso</label><select class=\"role-select\" id=\"loginRole\"><option value=\"marketing\">Marketing · contenido</option><option value=\"admin\">Administrador · control del sitio</option></select><label for=\"password\">Contraseña</label><input id=\"password\" type=\"password\" autocomplete=\"current-password\" required><button id=\"loginBtn\">Iniciar sesión</button><p id=\"loginError\" class=\"error\" role=\"alert\"></p></form></div></main>\n<main id=\"app\" class=\"shell\" hidden>\n<header class=\"head\"><div><p class=\"eyebrow\" id=\"roleLabel\">Taxi Surf City · Marketing</p><h1>Panel de contenido</h1><p class=\"muted\">Tu catálogo y tu página web, al día.</p></div><button id=\"logout\" class=\"secondary small\">Salir</button></header>\n<div id=\"notice\" class=\"banner\" role=\"status\" hidden></div>\n<nav class=\"workspace-nav\" aria-label=\"Áreas del panel\"><button type=\"button\" data-workspace=\"content\" aria-pressed=\"true\"><span>Contenido</span><small>Editar la web</small></button><button type=\"button\" data-workspace=\"publications\" aria-pressed=\"false\"><span>Publicaciones</span><small id=\"publicationBadge\">Consultar estado</small></button><button type=\"button\" id=\"adminTab\" data-workspace=\"admin\" aria-pressed=\"false\" hidden><span>Control</span><small>Administrador</small></button></nav><div id=\"contentWorkspace\"><div class=\"metrics\"><div class=\"metric\"><strong id=\"tourCount\">—</strong><span>Tours</span></div><div class=\"metric\"><strong id=\"promoCount\">—</strong><span>Promociones</span></div><div class=\"metric\"><strong id=\"activeCount\">—</strong><span>Ofertas activas</span></div></div>\n<nav class=\"tabs\" aria-label=\"Secciones\"><button data-tab=\"tours\" aria-selected=\"true\">Tours</button><button data-tab=\"promos\" aria-selected=\"false\">Promociones</button><button data-tab=\"texts\" aria-selected=\"false\">Textos</button><button data-tab=\"rates\" aria-selected=\"false\">Tarifas</button></nav>\n<section id=\"tours\"><div class=\"section-head\"><div><h2>Catálogo de tours</h2><p class=\"muted\">Administra las excursiones de tu web.</p></div><button id=\"newTour\">+ Nuevo</button></div><input class=\"search\" id=\"search\" type=\"search\" placeholder=\"Buscar por nombre o destino\" aria-label=\"Buscar tours\"><div id=\"tourList\" class=\"grid\"></div><div class=\"links\"><a href=\"https://taxistuncoelsalvador.com/tours\">Ver catálogo público ↗</a></div></section>\n<section id=\"promos\" hidden><div class=\"section-head\"><div><h2>Promociones</h2><p class=\"muted\">Una oferta activa a la vez.</p></div><button id=\"newPromo\">+ Nueva</button></div><div id=\"promoList\" class=\"grid\"></div><div class=\"links\"><a href=\"https://taxistuncoelsalvador.com/\">Ver página de inicio ↗</a></div></section>\n<section id=\"texts\" hidden><div class=\"section-head\"><div><h2>Textos de la web</h2><p class=\"muted\">Edita los encabezados por página.</p></div></div><div id=\"textList\"></div></section>\n<section id=\"rates\" hidden><div class=\"section-head\"><div><h2>Tarifas de aeropuerto</h2><p class=\"muted\">Precio por vehículo, en USD.</p></div><button id=\"newRate\">+ Nueva</button></div><div id=\"rateList\" class=\"grid\"></div><div class=\"links\"><a href=\"https://taxistuncoelsalvador.com/aeropuerto\">Ver página de traslados ↗</a></div></section>\n</div><section id=\"publications\" hidden><div class=\"section-head\"><div><h2>Publicaciones</h2><p class=\"muted\">Consulta si tus cambios ya están visibles para los clientes.</p></div></div><div class=\"card pad progress-card\" id=\"deploymentCard\"><div class=\"publication-status\"><span id=\"publicationIcon\" class=\"publication-icon\" aria-hidden=\"true\">…</span><div><h3 id=\"deploySummary\" aria-live=\"polite\">Comprobar la web</h3><p class=\"muted\" id=\"publicationSub\">Consulta el estado sin modificar el contenido.</p></div></div><div class=\"stage-list\" id=\"stageList\" hidden><div class=\"stage\" id=\"stageSend\"><span class=\"stage-dot\">1</span><div><strong id=\"sendLabel\">Envío y validación</strong><p class=\"muted\">El servidor comprueba la revisión del contenido.</p></div></div><div class=\"stage\" id=\"stageGit\"><span class=\"stage-dot\">2</span><div><strong id=\"gitLabel\">Guardado en GitHub</strong><p class=\"muted\" id=\"gitDescription\">Se confirma el commit de publicación.</p></div></div><div class=\"stage\" id=\"stageApp\"><span class=\"stage-dot\">3</span><div><strong>Panel actualizado</strong><p class=\"muted\">Los datos se recargan desde GitHub.</p></div></div><div class=\"stage\" id=\"stageWeb\"><span class=\"stage-dot\">4</span><div><strong>Web actualizada</strong><p class=\"muted\">La versión pública coincide con los archivos guardados.</p></div></div></div><p id=\"deploymentDetail\" class=\"status-line\" role=\"status\"></p><div class=\"actions\"><button id=\"recheck\" class=\"secondary small\" type=\"button\">Comprobar estado</button><button id=\"backContent\" class=\"small\" type=\"button\">Volver al contenido</button></div><details id=\"technicalDetails\" class=\"technical-details\" hidden><summary>Detalles técnicos</summary><p id=\"technicalMessage\" class=\"muted\"></p></details></div><div class=\"card pad\"><h3>¿Qué significa cada estado?</h3><p class=\"muted\" style=\"margin-top:8px\">Guardar en GitHub no siempre significa que Cloudflare ya haya actualizado el sitio. Puedes seguir editando el contenido sin volver a publicar los cambios que ya fueron guardados.</p></div><div class=\"links\"><a href=\"https://taxistuncoelsalvador.com/\">Abrir sitio público ↗</a></div></section><section id=\"admin\" hidden><div class=\"section-head\"><div><h2>Control del sitio</h2><p class=\"muted\">Solo para el administrador.</p></div><button id=\"refreshAdmin\" class=\"secondary small\">Comprobar</button></div><div class=\"card pad\"><h3>Modo mantenimiento</h3><p class=\"status-line\" id=\"maintenanceStatus\" role=\"status\">Consulta el estado del sitio.</p><label class=\"check-label\"><input type=\"checkbox\" id=\"maintenanceActive\"> Activar mantenimiento</label><label for=\"maintenanceMessage\">Mensaje para los visitantes</label><textarea id=\"maintenanceMessage\" maxlength=\"500\"></textarea><label class=\"check-label\"><input type=\"checkbox\" id=\"maintenanceWa\" checked> Mantener WhatsApp disponible</label><div class=\"admin-preview\"><h2>Volveremos pronto</h2><p id=\"maintenancePreview\"></p><span class=\"chip\" id=\"maintenanceWaPreview\">Contactar por WhatsApp</span></div><button id=\"saveMaintenance\" disabled>Aplicar configuración</button><p class=\"muted\" style=\"margin-top:10px\">La página pública devuelve HTTP 503 cuando el mantenimiento está activo. El CMS permanece disponible.</p></div><div class=\"links\"><a href=\"https://taxistuncoelsalvador.com/\">Abrir página pública ↗</a></div></section>\n</main>\n<footer id=\"footer\" class=\"footer\" hidden><div class=\"footer-inner\"><div><strong id=\"draftStatus\">Sin cambios pendientes</strong><p id=\"draftHint\">Contenido de GitHub sincronizado</p></div><button id=\"publish\" disabled>Publicar cambios</button></div></footer>\n<dialog id=\"editor\" class=\"dialog\"><form id=\"editForm\"><div class=\"dialog-head\"><h2 id=\"editorTitle\"></h2><button type=\"button\" id=\"closeEditor\" class=\"secondary small\" aria-label=\"Cerrar editor\">Cerrar</button></div><div id=\"editorBody\" class=\"dialog-body\"></div><div class=\"dialog-footer\"><button type=\"button\" id=\"cancelEditor\" class=\"secondary\">Cancelar</button><button id=\"saveEditor\">Guardar borrador</button></div></form></dialog>\n<dialog id=\"preview\" class=\"dialog\"><div class=\"dialog-head\"><h2>Vista del tour</h2><button id=\"closePreview\" class=\"secondary small\">Cerrar</button></div><div id=\"previewBody\" class=\"dialog-body\"></div></dialog>\n<div id=\"toast\" class=\"toast\" role=\"status\" hidden></div>\n<script>\n'use strict';\nconst $=id=>document.getElementById(id);\nconst site='https://taxistuncoelsalvador.com';\nlet workspace='content';\nlet token=sessionStorage.getItem('taxicms_session_v2')||'',state=null,baseline='',busy=false,editorMode='',editing=null,editorImage='',imageBusy=false,editorChanged=false,toastTimer,formPreviewUrl='',uploads=new Map();\nfunction node(tag,text,cls){const el=document.createElement(tag);if(text!=null)el.textContent=text;if(cls)el.className=cls;return el}\nfunction button(text,fn,cls='secondary small'){const b=node('button',text,cls);b.type='button';b.onclick=fn;return b}\nfunction notify(text){$('toast').textContent=text;$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').hidden=true,4300)}\nfunction notice(text){$('notice').textContent=text||'';$('notice').hidden=!text}\nfunction serial(){return state?JSON.stringify([state.tours,state.promos,state.content,state.rates]):''}\nfunction dirty(){return !!state&&serial()!==baseline}\nfunction status(){const changed=dirty();$('footer').hidden=!state||workspace!=='content';$('app').classList.toggle('no-footer',workspace!=='content');$('publish').disabled=busy||!changed;$('draftStatus').textContent=busy?'Sincronizando…':changed?'Cambios pendientes':'Sin cambios pendientes';$('draftHint').textContent=changed?'Guarda en la web con Publicar':'Contenido de GitHub sincronizado';if(state){$('tourCount').textContent=state.tours.length;$('promoCount').textContent=state.promos.length;$('activeCount').textContent=state.promos.filter(p=>p.active).length}}\nfunction setBusy(v){busy=v;status();$('app').inert=v;for(const el of $('app').querySelectorAll('input,textarea,button'))el.disabled=v;if(!v){$('newRate').disabled=!Array.isArray(state?.rates);$('saveMaintenance').disabled=state?.role!=='admin'||!maintenance;}}\nfunction imageUrl(name){if(uploads.has(name))return uploads.get(name);if(!/^[a-z0-9_.-]+\\.(png|jpe?g|webp)$/i.test(name||''))return '';return site+'/assets/img/'+encodeURIComponent(name)}\nfunction clearUploads(){for(const u of uploads.values())URL.revokeObjectURL(u);uploads.clear()}\nfunction resetSession(){stopDeployment();maintenance=null;workspace='content';publicationMode='sync';$('stageList').hidden=true;progressText('Comprobar la web','Consulta si el sitio público está actualizado.','neutral');$('adminTab').hidden=true;setWorkspace('content',false);for(const b of document.querySelectorAll('[data-tab]')){b.setAttribute('aria-selected',String(b.dataset.tab==='tours'));$(b.dataset.tab).hidden=b.dataset.tab!=='tours'}token='';sessionStorage.removeItem('taxicms_session_v2');state=null;baseline='';clearUploads();$('app').hidden=true;$('footer').hidden=true;$('login').hidden=false;$('password').value=''}\nasync function api(path,opts={}){const res=await fetch(path,{...opts,cache:'no-store',headers:{...(opts.headers||{}),...(token?{Authorization:'Bearer '+token}:{})}});let data;try{data=await res.json()}catch{throw Error('Respuesta inválida del servidor (HTTP '+res.status+').')}if(res.status===401&&path!='/api/login'){if(dirty())throw Error('Sesión caducada. Conserva tus cambios y vuelve a iniciar sesión después de copiar los datos.');resetSession();throw Error('Sesión caducada. Inicia sesión de nuevo.')}if(!res.ok||data.ok===false)throw Error(data.error||'No se pudo completar la operación (HTTP '+res.status+').');return data}\nasync function load(){setBusy(true);try{const data=await api('/api/state');if(!Array.isArray(data.tours)||!Array.isArray(data.promos)||!data.revision?.tours||!data.revision?.index)throw Error('El CMS de Cloudflare necesita el Worker corregido con control de versiones.');if(data.missing?.tours||data.missing?.promo||data.missing?.content?.length)throw Error('Faltan marcadores CMS. No se pueden publicar cambios.');state={...data,role:data.role||'marketing',content:data.content||{}};baseline=serial();$('adminTab').hidden=state.role!=='admin';$('roleLabel').textContent='Taxi Surf City · '+(state.role==='admin'?'Administrador':'Marketing');if(state.role!=='admin'&&workspace==='admin')setWorkspace('content',false);if(!publishing&&state.hashes){startDeployment(state.hashes,true,'sync');}clearUploads();$('login').hidden=true;$('app').hidden=false;notice('');render();return true}catch(e){if(state)notice(e.message);else{$('app').hidden=true;$('footer').hidden=true;$('login').hidden=false;$('loginError').textContent=e.message}return false}finally{setBusy(false)}}\n$('loginForm').onsubmit=async e=>{e.preventDefault();$('loginBtn').disabled=true;$('loginError').textContent='';try{const data=await api('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:$('password').value,role:$('loginRole').value})});if(!data.token)throw Error('Contraseña incorrecta.');token=data.token;sessionStorage.setItem('taxicms_session_v2',token);$('password').value='';await load()}catch(e){$('loginError').textContent=e.message}finally{$('loginBtn').disabled=false}};\n$('logout').onclick=()=>{if((dirty()||editorChanged)&&!confirm('¿Salir y descartar los cambios no publicados?'))return;resetSession()};\nwindow.taxicmsReload=async()=>{if(busy||imageBusy)return;if($('editor').open){notify('Cierra el editor antes de recargar.');return}if(dirty()&&!confirm('¿Recargar y descartar los cambios pendientes?'))return;if(token)await load();else location.reload()};\nfunction setWorkspace(next,check=true){if(next==='admin'&&state?.role!=='admin')next='content';workspace=next;for(const b of document.querySelectorAll('[data-workspace]'))b.setAttribute('aria-pressed',String(b.dataset.workspace===next));$('contentWorkspace').hidden=next!=='content';$('publications').hidden=next!=='publications';$('admin').hidden=next!=='admin';status();window.scrollTo({top:0,behavior:'auto'});if(check&&next==='admin')loadMaintenance();}\nfor(const b of document.querySelectorAll('[data-workspace]'))b.onclick=()=>setWorkspace(b.dataset.workspace);\n$('backContent').onclick=()=>setWorkspace('content');\nfor(const b of document.querySelectorAll('[data-tab]'))b.onclick=()=>{for(const item of document.querySelectorAll('[data-tab]')){const active=item===b;item.setAttribute('aria-selected',String(active));$(item.dataset.tab).hidden=!active}window.scrollTo({top:0,behavior:'auto'})};\nfunction photo(t){const wrap=node('div',null,'photo');wrap.append(node('span','Sin fotografía'));const src=imageUrl(t.image);if(src){const img=node('img');img.src=src;img.alt=t.title||'Fotografía del tour';img.loading='lazy';img.onerror=()=>img.remove();wrap.append(img)}if(t.pricetag)wrap.append(node('span',t.pricetag,'price'));return wrap}\nfunction meta(t){const m=node('div',null,'meta');for(const v of [t.duration,t.location,t.capacity])if(v)m.append(node('span',v,'chip'));return m}\nfunction tourCard(t){const card=node('article',null,'card');card.append(photo(t));const body=node('div',null,'pad');body.append(node('h3',t.title),meta(t),node('p',t.summary||'Sin descripción','summary'));body.append(button('Vista previa',()=>showTour(t),'secondary preview-btn'));const actions=node('div',null,'actions');actions.append(button('Editar',()=>openTour(t),'small'),button('Eliminar',()=>{if(busy)return;if(state.tours.length<=1){notify('Conserva al menos un tour en el catálogo.');return}if(confirm('¿Eliminar '+t.title+'? Se aplicará al publicar.')){state.tours=state.tours.filter(x=>x.id!==t.id);renderTours();status()}},'danger small'));body.append(actions);card.append(body);return card}\nfunction renderTours(){const list=$('tourList');list.replaceChildren();const q=$('search').value.trim().toLocaleLowerCase('es');const items=state.tours.filter(t=>(t.title+' '+t.location).toLocaleLowerCase('es').includes(q));for(const t of items)list.append(tourCard(t));if(!items.length)list.append(node('div',q?'No hay coincidencias.':'Aún no hay tours. Crea el primero.','empty'))}\n$('search').oninput=()=>{if(state)renderTours()};\nfunction promoCard(p){const card=node('article',null,'card pad');card.append(node('span',p.active?'ACTIVA':'INACTIVA','status-tag'+(p.active?' active':'')));const title=node('h3',p.title);title.style.marginTop='10px';card.append(title);const prev=node('div',null,'promo-preview');prev.append(node('strong',p.title),node('p',p.text));if(p.ctaText&&p.ctaLink)prev.append(node('span',p.ctaText,'cta'));card.append(prev,node('p',p.active?'Visible al publicar':'No visible en la página','muted'));const actions=node('div',null,'actions');actions.append(button(p.active?'Desactivar':'Activar',()=>{if(busy)return;state.promos=state.promos.map(x=>({...x,active:x.id===p.id?!p.active:false}));renderPromos();status()},p.active?'secondary small':'small'),button('Editar',()=>openPromo(p)),button('Eliminar',()=>{if(!busy&&confirm('¿Eliminar esta promoción?')){state.promos=state.promos.filter(x=>x.id!==p.id);renderPromos();status()}},'danger small'));card.append(actions);return card}\nfunction renderPromos(){const list=$('promoList');list.replaceChildren();for(const p of state.promos)list.append(promoCard(p));if(!state.promos.length)list.append(node('div','No hay promociones. Crea una cuando tengas una oferta.','empty'))}\nfunction plain(value){return String(value||'').replace(/<br\\s*\\/?>/gi,' ').replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').replace(/&nbsp;/g,' ')}\nfunction renderTexts(){const list=$('textList');list.replaceChildren();for(const [page,label] of [['index','Página de inicio'],['tours','Página de tours']]){const card=node('div',null,'card pad text-group');card.append(node('h3',label),node('p','Los cambios se aplican al publicar.','muted'));const preview=node('div',null,'preview-text');const h=node('strong',plain(state.content[page+'-hero-title'])),p=node('p',plain(state.content[page+'-hero-lead']));for(const [id,name] of [[page+'-hero-title','Título principal'],[page+'-hero-lead','Descripción']]){const l=node('label',name);l.htmlFor=id;const t=node('textarea');t.id=id;t.value=plain(state.content[id]);t.oninput=()=>{state.content[id]=t.value;h.textContent=plain(state.content[page+'-hero-title']);p.textContent=plain(state.content[page+'-hero-lead']);status()};card.append(l,t)}preview.append(h,p);card.append(preview);list.append(card)}list.append(node('p','Los textos sin modificar conservan su formato original. Los textos nuevos se publican en el idioma escrito, sin traducción automática.','muted'))}\nfunction render(){renderTours();renderPromos();renderTexts();renderRates();status()}\nfunction showTour(t){const body=$('previewBody');body.replaceChildren(photo(t),meta(t),node('h2',t.title),node('p',t.summary));const lines=String(t.highlights||'').split('\\n').map(x=>x.trim()).filter(Boolean);if(lines.length){body.append(node('h3','Incluye'));const ul=node('ul',null,'detail-list');for(const l of lines)ul.append(node('li',l));body.append(ul)}body.append(node('p','Vehículo privado climatizado','muted'),node('p','Mensaje de reserva: '+(t.wa||'Sin mensaje personalizado'),'muted'));body.append(node('p','Vista aproximada de la tarjeta que verá el cliente.','muted'));$('preview').showModal()}\n$('closePreview').onclick=()=>$('preview').close();\nfunction field(parent,key,label,value='',multiline=false,required=false){const l=node('label',label);l.htmlFor='field-'+key;const el=node(multiline?'textarea':'input');el.id='field-'+key;el.name=key;el.value=value||'';el.required=required;el.maxLength=multiline?12000:500;parent.append(l,el);return el}\nfunction startEditor(mode,item){if(busy)return false;editorMode=mode;editing=item;editorChanged=false;editorImage=item?.image||'';$('editorTitle').textContent=(item?'Editar ':'Nueva ')+(mode==='tour'?(item?'tour':'excursión'):mode==='rate'?'tarifa':'promoción');$('editorBody').replaceChildren();$('saveEditor').disabled=false;return true}\nfunction appendPhotoEditor(parent,label){const u=node('div',null,'upload');u.append(node('strong',label));const f=node('input');f.type='file';f.accept='image/png,image/jpeg,image/webp';f.id='imageFile';u.append(f,node('p','JPG, PNG o WEBP · máximo 5 MB.','muted'));const img=node('img');img.alt='Vista previa de la fotografía';img.hidden=!imageUrl(editorImage);if(!img.hidden)img.src=imageUrl(editorImage);img.onerror=()=>{img.hidden=true};const up=button('Subir fotografía',async()=>{const file=f.files[0];if(!file){notify('Selecciona una imagen.');return}if(file.size>5*1024*1024||!['image/png','image/jpeg','image/webp'].includes(file.type)){notify('Utiliza JPG, PNG o WEBP de hasta 5 MB.');return}imageBusy=true;up.disabled=true;$('saveEditor').disabled=true;up.textContent='Subiendo…';try{const fd=new FormData();fd.append('file',file);const data=await uploadImage(fd,up);if(!data.filename)throw Error('La API no devolvió el nombre de la imagen.');editorImage=data.filename;const url=URL.createObjectURL(file);uploads.set(editorImage,url);img.src=url;img.hidden=false;editorChanged=true;notify('Imagen subida. Guarda el borrador y publica.')}catch(e){notify(e.message)}finally{imageBusy=false;up.disabled=false;$('saveEditor').disabled=false;up.textContent='Subir fotografía'}},'secondary');u.append(up,img);parent.append(u);}\nfunction openTour(t=null){if(!startEditor('tour',t))return;const b=$('editorBody'),row=node('div',null,'two'),a=node('div'),c=node('div');field(b,'title','Nombre del tour',t?.title,false,true);field(a,'duration','Duración',t?.duration);field(c,'location','Destino / zona',t?.location,false,true);row.append(a,c);b.append(row);field(b,'summary','Descripción para el cliente',t?.summary,true,true);field(b,'highlights','Qué incluye (una línea por actividad)',t?.highlights,true);field(b,'capacity','Capacidad',t?.capacity);field(b,'pricetag','Precio o etiqueta (opcional)',t?.pricetag);appendPhotoEditor(b,'Fotografía del tour');field(b,'wa','Mensaje de WhatsApp (opcional)',t?.wa,true);$('editor').showModal()}\nfunction openPromo(p=null){if(!startEditor('promo',p))return;const b=$('editorBody');field(b,'title','Título de la promoción',p?.title,false,true);field(b,'text','Mensaje de la oferta',p?.text,true,true);field(b,'ctaText','Texto del botón (opcional)',p?.ctaText);const u=field(b,'ctaLink','Enlace del botón (opcional)',p?.ctaLink);u.type='url';u.placeholder='https://wa.me/...';$('editor').showModal()}\nfunction closeEditor(force=false){if(imageBusy){notify('Espera a que termine la subida.');return}if(!force&&editorChanged&&!confirm('¿Descartar la edición sin guardar?'))return;$('editor').close();editorChanged=false}\n$('closeEditor').onclick=$('cancelEditor').onclick=()=>closeEditor();$('editor').oncancel=e=>{e.preventDefault();closeEditor()};$('editForm').oninput=()=>editorChanged=true;\nfunction slug(s){return s.toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'tour'}\n$('editForm').onsubmit=e=>{e.preventDefault();if(busy||imageBusy)return;const get=k=>String(new FormData(e.currentTarget).get(k)||'').trim();if(editorMode==='tour'){if(!editorImage){notify('Agrega una fotografía para publicar el tour.');return}const title=get('title');let id=editing?.id||slug(title);if(!editing){const base=id;let i=2;while(state.tours.some(x=>x.id===id))id=base+'-'+i++}const t={...editing,id,title,duration:get('duration')||'Flexible',location:get('location'),summary:get('summary'),highlights:get('highlights'),capacity:get('capacity')||'Hasta 4 pax',pricetag:get('pricetag'),image:editorImage,wa:get('wa')||'Hola, quisiera información sobre '+title+'.'};if(editing)state.tours=state.tours.map(x=>x.id===id?t:x);else state.tours.push(t);renderTours()}else if(editorMode==='rate'){const price=Number(get('price')),min=Number(get('minPassengers')),max=Number(get('maxPassengers'));if(!Number.isFinite(price)||price<0.01||price>10000||!Number.isInteger(min)||!Number.isInteger(max)||min<1||max>50||min>max){notify('Revisa el precio y la cantidad de pasajeros.');return}const r={id:editing?.id||'rate-'+Date.now(),origin:get('origin'),destination:get('destination'),price:Math.round(price*100)/100,minPassengers:min,maxPassengers:max,active:$('field-active').checked,image:editorImage||'aero.webp'};if(editing)state.rates=state.rates.map(x=>x.id===r.id?r:x);else state.rates.push(r);renderRates()}else{const link=get('ctaLink');if(link&&!/^https?:\\/\\//i.test(link)){notify('El enlace debe comenzar con https:// o http://.');return}const p={...editing,id:editing?.id||'promo-'+Date.now(),title:get('title'),text:get('text'),ctaText:get('ctaText'),ctaLink:link,active:editing?.active??false};if(editing)state.promos=state.promos.map(x=>x.id===p.id?p:x);else state.promos.push(p);renderPromos()}closeEditor(true);status();notify('Borrador guardado. Pulsa Publicar cambios para actualizar la web.')};\n$('newTour').onclick=()=>openTour();$('newPromo').onclick=()=>openPromo();$('newRate').onclick=()=>openRate();\n\nlet publishing=false,deployTimer=null,deployGeneration=0,deployExpected=null,deployAttempts=0,panelSynced=false,maintenance=null,publicationMode='sync';\nfunction stages(send,git,web,app){for(const [id,v] of [['stageSend',send],['stageGit',git],['stageWeb',web],['stageApp',app]])$(id).className='stage '+v;}\nfunction progressText(title,detail,tone='pending',technical=''){\n  $('deploySummary').textContent=title;$('deploymentDetail').textContent=detail;\n  $('publicationIcon').className='publication-icon '+tone;$('publicationIcon').textContent=tone==='good'?'✓':tone==='pending'?'…':'↻';\n  $('publicationBadge').textContent=tone==='good'?'Al día':tone==='pending'?'Pendiente':'Consultar estado';\n  $('technicalDetails').hidden=!technical;$('technicalDetails').open=false;$('technicalMessage').textContent=technical;\n}\nfunction stopDeployment(){deployGeneration++;clearTimeout(deployTimer);deployTimer=null;deployExpected=null;}\nfunction startDeployment(expected,synced,mode=publicationMode){stopDeployment();publicationMode=mode;deployExpected=expected;panelSynced=synced;deployAttempts=0;\n  $('stageList').hidden=mode!=='publish';$('publicationSub').textContent=mode==='publish'?'Seguimiento de los cambios enviados.':'Comprobación de la versión pública actual.';\n  stages('done','done','current',synced?'done':'');progressText('Comprobando el sitio','Consultando si la web coincide con los datos guardados.');checkDeployment(deployGeneration);\n}\nasync function checkDeployment(gen){if(gen!==deployGeneration||!token||!deployExpected)return;const expected=deployExpected;\n  try{const r=await api('/api/deployment');if(gen!==deployGeneration)return;\n    const matches=Object.keys(expected).length>0&&Object.entries(expected).every(([k,v])=>typeof v==='string'&&r.hashes?.[k]===v);\n    if(matches){stages('done','done','done',panelSynced?'done':'current');progressText(r.maintenance?.active?'Web en mantenimiento':panelSynced?'Todo actualizado':'Web actualizada · falta recargar el panel',r.maintenance?.active?'Los archivos están desplegados. Los visitantes ven el aviso de mantenimiento.':panelSynced?'El sitio público coincide con los datos guardados.':'Pulsa Recargar para sincronizar el panel.',r.maintenance?.active||!panelSynced?'pending':'good');return}\n    stages('done','done','current',panelSynced?'done':'');progressText('Actualización en proceso','El contenido guardado todavía no coincide con la web. Puedes continuar editando. No publiques otra vez solo por esta espera.');\n  }catch(e){if(gen!==deployGeneration)return;progressText('No se pudo comprobar la web','No significa que se hayan perdido tus cambios. Puedes comprobar de nuevo o seguir trabajando.','pending',String(e.message||e));}\n  if(gen!==deployGeneration)return;if(++deployAttempts<40)deployTimer=setTimeout(()=>checkDeployment(gen),15000);else progressText('Verificación pendiente','El sitio todavía no ha confirmado la versión. Usa Comprobar estado más tarde.','pending',$('technicalMessage').textContent);\n}\n$('recheck').onclick=()=>{if(deployExpected)startDeployment(deployExpected,panelSynced,publicationMode);else if(state?.hashes)startDeployment(state.hashes,true,'sync');else progressText('Verificación no disponible','Recarga el panel para obtener la información de publicación.','neutral')};\n\nfunction uploadImage(fd,buttonEl){return new Promise((resolve,reject)=>{const x=new XMLHttpRequest();x.open('POST','/api/upload');x.setRequestHeader('Authorization','Bearer '+token);x.timeout=90000;x.upload.onprogress=e=>{if(e.lengthComputable)buttonEl.textContent='Enviando '+Math.round(e.loaded/e.total*100)+'%';};x.upload.onload=()=>buttonEl.textContent='Guardando en GitHub…';x.onload=()=>{try{const data=JSON.parse(x.responseText);if(x.status<200||x.status>=300||!data.ok)throw Error(data.error||'No se pudo subir la imagen.');resolve(data)}catch(e){reject(e)}};x.onerror=()=>reject(Error('Error de conexión durante la subida.'));x.ontimeout=()=>reject(Error('La subida tardó demasiado. Comprueba el estado antes de repetir.'));x.send(fd)})}\nfunction renderRates(){const list=$('rateList');list.replaceChildren();if(!Array.isArray(state.rates)){list.append(node('div','Actualiza el Worker de TaxiCMS en Cloudflare para gestionar tarifas.','empty'));$('newRate').disabled=true;return}for(const r of state.rates){const card=node('article',null,'card');card.append(photo({title:r.origin+' → '+r.destination,image:r.image||'aero.webp'}));const body=node('div',null,'pad');body.append(node('span',r.active?'PUBLICADA AL GUARDAR':'OCULTA','status-tag'+(r.active?' active':'')),node('h3',r.origin+' → '+r.destination),node('div','$'+Number(r.price).toFixed(2),'fare-number'),node('p','USD por vehículo · '+r.minPassengers+'–'+r.maxPassengers+' personas','muted'));const actions=node('div',null,'actions');actions.append(button(r.active?'Ocultar':'Mostrar',()=>{if(busy)return;r.active=!r.active;renderRates();status()}),button('Editar',()=>openRate(r),'small'),button('Eliminar',()=>{if(!busy&&confirm('¿Eliminar esta tarifa?')){state.rates=state.rates.filter(x=>x.id!==r.id);renderRates();status()}},'danger small'));body.append(actions);card.append(body);list.append(card)}if(!state.rates.length)list.append(node('div','No hay tarifas. Agrega una nueva.','empty'))}\nfunction openRate(r=null){if(!Array.isArray(state?.rates)||!startEditor('rate',r))return;const b=$('editorBody');editorImage=r?.image||'aero.webp';field(b,'origin','Origen',r?.origin,false,true);field(b,'destination','Destino',r?.destination||'Aeropuerto Internacional (SAL)',false,true);const p=field(b,'price','Precio en USD por vehículo',r?.price??'',false,true);p.type='number';p.min='0.01';p.max='10000';p.step='0.01';const min=field(b,'minPassengers','Mínimo de pasajeros',r?.minPassengers??1,false,true),max=field(b,'maxPassengers','Máximo de pasajeros',r?.maxPassengers??2,false,true);for(const f of [min,max]){f.type='number';f.min='1';f.max='50';f.step='1'}const l=node('label','Visible en la página','check-label');const check=node('input');check.type='checkbox';check.id='field-active';check.checked=r?.active??true;l.prepend(check);b.append(l);appendPhotoEditor(b,'Fotografía del traslado');b.append(node('p','Puedes conservar la imagen actual o seleccionar una nueva desde tu galería.','muted'));$('editor').showModal()}\nfunction previewMaintenance(){ $('maintenancePreview').textContent=$('maintenanceMessage').value||'Estamos mejorando nuestra página web.';$('maintenanceWaPreview').hidden=!$('maintenanceWa').checked; }\nasync function loadMaintenance(){if(state?.role!=='admin')return;$('saveMaintenance').disabled=true;$('maintenanceStatus').textContent='Comprobando…';try{const r=await api('/api/admin/maintenance');maintenance=r.desired;$('maintenanceActive').checked=maintenance.active;$('maintenanceMessage').value=maintenance.message;$('maintenanceWa').checked=maintenance.whatsapp;previewMaintenance();const live=r.live;$('maintenanceStatus').textContent=!live?.configured?'El Worker público aún no tiene el KV configurado.':live.revision!==maintenance.revision?'Configuración guardada; propagación pendiente.':live.active?'Sitio en mantenimiento':'Sitio en línea';$('saveMaintenance').disabled=false}catch(e){$('maintenanceStatus').textContent=e.message}}\n$('refreshAdmin').onclick=loadMaintenance;$('maintenanceMessage').oninput=$('maintenanceWa').onchange=previewMaintenance;\n$('saveMaintenance').onclick=async()=>{if(state?.role!=='admin'||!maintenance)return;const active=$('maintenanceActive').checked;if(!confirm(active?'¿Activar el mantenimiento para los visitantes?':'¿Confirmar la configuración y dejar la web en línea?'))return;$('saveMaintenance').disabled=true;try{const r=await api('/api/admin/maintenance',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({active,message:$('maintenanceMessage').value,whatsapp:$('maintenanceWa').checked,revision:maintenance.revision})});maintenance=r.desired;$('maintenanceStatus').textContent='Configuración guardada. Verificando propagación…';const revision=r.desired.revision;for(let i=0;i<12;i++){if(state?.role!=='admin'||maintenance?.revision!==revision)return;let live;try{live=(await api('/api/deployment')).maintenance}catch{}if(live?.revision===revision&&live.configured){$('maintenanceStatus').textContent=live.active?'Sitio en mantenimiento · confirmado':'Sitio en línea · confirmado';return}await new Promise(resolve=>setTimeout(resolve,5000));}$('maintenanceStatus').textContent='Configuración guardada, pendiente de confirmación pública. Pulsa Comprobar.'}catch(e){$('maintenanceStatus').textContent=e.message}finally{$('saveMaintenance').disabled=false}};\n\n$('publish').onclick=async()=>{if(busy||!dirty()||$('editor').open)return;if(!confirm('¿Publicar todos los cambios pendientes en la página web?'))return;publishing=true;publicationMode='publish';stopDeployment();setWorkspace('publications',false);setBusy(true);$('stageList').hidden=false;$('publicationSub').textContent='Seguimiento de los cambios enviados.';stages('current','','','');progressText('Enviando cambios','Validando datos y revisión de GitHub…');try{const data=await api('/api/publish',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({tours:state.tours,promos:state.promos,content:state.content,revision:state.revision,...(Array.isArray(state.rates)?{rates:state.rates}:{})})});if(!data.ok)throw Error(data.error||'No se pudo publicar.');baseline=serial();stages('done','done','current','');progressText('Guardado en GitHub','Esperando la actualización pública.');const synced=await load();if(!synced){baseline=serial();notice('Publicación recibida. Recarga el panel antes de volver a editar.')}if(data.hashes&&Object.keys(data.hashes).length){startDeployment(data.hashes,synced,'publish')}else if(synced&&state.hashes){startDeployment(state.hashes,true,'publish')}else{progressText('Guardado en GitHub','No se puede verificar el despliegue con el Worker actual.');}notify('Publicación recibida. Consulta el seguimiento.')}catch(e){progressText('Publicación sin confirmar','No se pudo confirmar el guardado. Revisa los detalles antes de intentar publicar de nuevo.','pending',String(e.message||e));notify('Publicación sin confirmar. Revisa el estado.')}finally{publishing=false;setBusy(false)}};\n\nif(token){$('login').hidden=true;$('app').hidden=false;notice('Conectando con el CMS…');load()}else $('login').hidden=false;\n</script></body></html>";
