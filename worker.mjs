import { onRequest } from "./functions/api/assistant.js";

const noCache={"cache-control":"no-store","x-content-type-options":"nosniff"};
const pages={index:"/",tours:"/tours",airport:"/aeropuerto"};
async function maintenance(env){
  if(!env.SITE_CONTROL)return {configured:false,active:false,revision:null};
  try { const value=await env.SITE_CONTROL.get("maintenance",{type:"json",cacheTtl:30});return {configured:true,active:value?.active===true,message:typeof value?.message==="string"?value.message:"",whatsapp:value?.whatsapp!==false,revision:value?.revision||null}; }
  catch {return {configured:false,active:false,revision:null};}
}
function escape(s){return String(s??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
function maintenancePage(m){return new Response(`<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Taxi Surf City · Mantenimiento</title><style>body{margin:0;background:#082e23;color:white;font:16px/1.6 system-ui,sans-serif;min-height:100vh;display:grid;place-items:center}main{max-width:560px;padding:32px;text-align:center}img{width:96px;height:96px;object-fit:contain}h1{font-size:clamp(34px,7vw,50px);line-height:1.1}p{color:#dce9df}a{display:inline-block;background:#d7f2a6;color:#10382b;padding:14px 20px;border-radius:12px;font-weight:bold;text-decoration:none}</style></head><body><main><img src="/assets/img/logo.png" alt="Taxi Surf City"><h1>Volveremos pronto</h1><p>${escape(m.message||"Estamos mejorando nuestra página web. Gracias por tu paciencia.")}</p><p>We are improving our website. Please check back soon.</p>${m.whatsapp?'<a href="https://wa.me/50376401181" rel="noopener">WhatsApp · +503 7640-1181</a>':""}</main></body></html>`,{status:503,headers:{...noCache,"content-type":"text/html; charset=utf-8","retry-after":"300","x-robots-tag":"noindex"}});}
async function hashAsset(request,env,path){
  const r=await env.ASSETS.fetch(new Request(new URL(path,request.url),{method:"GET"}));
  if(!r.ok||!r.headers.get("content-type")?.includes("text/html"))return null;
  return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",await r.arrayBuffer())),b=>b.toString(16).padStart(2,"0")).join("");
}
export default {
  async fetch(request,env){
    const path=new URL(request.url).pathname;
    if(path==="/api/site-status"&&request.method==="GET"){
      const m=await maintenance(env);
      const hashes=Object.fromEntries(await Promise.all(Object.entries(pages).map(async ([k,p])=>[k,await hashAsset(request,env,p).catch(()=>null)])));
      return Response.json({ok:true,hashes,maintenance:{configured:m.configured,active:m.active,revision:m.revision}},{headers:noCache});
    }
    const isPage=path==="/"||!path.split("/").pop().includes(".")||/\.html?$/i.test(path);
    if((isPage&&!path.startsWith("/assets/")&&!path.startsWith("/functions/")&&!path.startsWith("/api/"))||path==="/api/assistant"||path==="/api/assistant/"){
      const m=await maintenance(env);
      if(m.active)return path.startsWith("/api/")?Response.json({error:"Sitio en mantenimiento"},{status:503,headers:noCache}):maintenancePage(m);
    }
    if(path==="/api/assistant"||path==="/api/assistant/")return onRequest({request,env});
    if(path.startsWith("/api/")||path.startsWith("/functions/"))return new Response("Not found",{status:404});
    return env.ASSETS.fetch(request);
  }
};
