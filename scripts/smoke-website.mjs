import assert from "node:assert/strict";
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const ORIGIN = "https://taxisurfcity.vercel.app";
const browser = await chromium.launch({headless:true,args:["--no-sandbox"]});
const screenshots = "website-smoke";
await mkdir(screenshots,{recursive:true});
const results = [];

async function inspect(page,route,label) {
  const failures = [];
  page.on("pageerror",err => failures.push(err.message));
  const response = await page.goto(ORIGIN+route,{waitUntil:"domcontentloaded",timeout:45000});
  assert.equal(response?.status(),200,label+" expected HTTP 200");
  await page.waitForSelector("#christmas-music-toggle",{timeout:15000});
  await page.waitForSelector("#christmas-snow-toggle",{timeout:15000});
  const snapshot = await page.evaluate(() => ({
    title:document.title,
    snowflakes:document.querySelectorAll(".christmas-snowflake").length,
    snowTypes:[...new Set([...document.querySelectorAll(".christmas-snowflake")].map(x=>x.className))],
    hasAudio:!!document.getElementById("christmas-original-audio"),
    hasSnow:!!document.getElementById("christmas-snow-overlay"),
    hasWhatsApp:!!document.querySelector('a[href*="wa.me/50376401181"]'),
    heroBg:getComputedStyle(document.querySelector(".hero")).backgroundImage,
    xOverflow:document.documentElement.scrollWidth-innerWidth,
    styles:[...document.styleSheets].some(s=>s.href?.includes("christmas-experience.css")),
    requests:performance.getEntriesByType("resource").length
  }));
  assert.ok(snapshot.hasAudio && snapshot.hasWhatsApp && snapshot.styles,label+" missing primary UI");
  if(label.startsWith("home"))assert.match(snapshot.heroBg,/christmas-beach-new.webp/,label+" hero background lost");
  else assert.match(snapshot.heroBg,/volcan-coatepeque-hero-bg.webp/,label+" tour background lost");
  assert.ok(snapshot.snowflakes >= 6 && snapshot.snowflakes <= 40,label+" wrong snowfall density");
  assert.ok(snapshot.snowTypes.length>=3,label+" snow variety insufficient");
  assert.ok(snapshot.xOverflow <= 2,label+" unexpected horizontal overflow "+snapshot.xOverflow);
  if(failures.length)console.warn(label+" third party or JS errors:",failures.slice(0,5));
  results.push({label,...snapshot});
  return snapshot;
}

try {
  const home = await browser.newPage({viewport:{width:1440,height:900}});
  let elfRequests = 0;
  home.on("request",req=>{if(req.url().includes("elfsightcdn.com"))elfRequests++;});
  await inspect(home,"/","home-desktop");
  assert.equal(elfRequests,0,"Reviews provider should not load before scrolling");

  await home.locator("#christmas-snow-toggle").click();
  const pause = await home.evaluate(()=>({
    active:document.body.classList.contains("christmas-snow-user-paused"),
    paused:getComputedStyle(document.querySelector(".christmas-snowflake")).animationPlayState,
    value:localStorage.getItem("taxi-surfcity-snow-v2")
  }));
  assert.ok(pause.active && pause.paused==="paused" && pause.value==="off","Snow pause failed");
  await home.reload({waitUntil:"domcontentloaded"});
  await home.waitForSelector("#christmas-snow-toggle");
  assert.equal(await home.locator("#christmas-snow-toggle").getAttribute("data-paused"),"true","Snow pause preference not saved");
  await home.locator("#christmas-snow-toggle").click();
  await home.screenshot({path:screenshots+"/home-desktop.png",animations:"disabled"});
  await home.close();

  const mobile = await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  await inspect(mobile,"/","home-mobile");
  await mobile.screenshot({path:screenshots+"/home-mobile.png",animations:"disabled"});
  await mobile.close();

  const tours = await browser.newPage({viewport:{width:1440,height:900}});
  await inspect(tours,"/tours","tours-desktop");
  const cards = await tours.locator(".tour-card").count();
  assert.equal(cards,6,"Six tours must remain available");
  assert.equal(await tours.locator(".hero-collage img").count(),0,"Hidden hero collage still downloads image assets");
  await tours.screenshot({path:screenshots+"/tours-desktop.png",animations:"disabled"});
  await tours.close();

  const reduced = await browser.newPage({viewport:{width:1366,height:768},reducedMotion:"reduce"});
  await reduced.goto(ORIGIN+"/",{waitUntil:"domcontentloaded"});
  await reduced.waitForSelector("#christmas-music-toggle");
  const reducedFlakes = await reduced.locator(".christmas-snowflake").count();
  assert.equal(reducedFlakes,0,"Reduced-motion preference not respected");
  assert.ok(!(await reduced.locator("#christmas-snow-toggle").isVisible()),"Snow button should hide in reduced motion");
  await reduced.close();

  console.log("FRONTEND SMOKE PASSED");
  for(const res of results) console.log(JSON.stringify({label:res.label,flakes:res.snowflakes,types:res.snowTypes.length,resources:res.requests,xOverflow:res.xOverflow}));
} finally {
  await browser.close();
}
