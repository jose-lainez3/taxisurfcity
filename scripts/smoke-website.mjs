import assert from "node:assert/strict";
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const ORIGIN = "https://taxisurfcity.vercel.app";
const browser = await chromium.launch({headless:true,args:["--no-sandbox"]});
const screenshots = "website-smoke";
await mkdir(screenshots,{recursive:true});
const results = [];

async function checkCompactLayout(page, label) {
  const viewport = page.viewportSize();
  const metrics = await page.evaluate(() => {
    const get = selector => {
      const el = document.querySelector(selector);
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      return {x:Math.round(rect.x), y:Math.round(rect.y), w:Math.round(rect.width), h:Math.round(rect.height)};
    };
    const hero = document.querySelector(".hero");
    const ctaSelector = document.body.classList.contains("home-page")
      ? ".home-hero-actions" : ".tour-hero-actions";
    const nav = get(".navbar"), title = get(".hero h1"), actions = get(ctaSelector);
    const overlap = (a,b) => a && b &&
      a.x < b.x + b.w && a.x + a.w > b.x &&
      a.y < b.y + b.h && a.y + a.h > b.y;
    return {
      viewport:innerWidth,
      nav,title,actions,hero:get(".hero"),
      brand:get(".navbar-brand"), lang:get(".lang-btn"), menu:get(".nav-toggle"),
      chat:get(".cb-launcher"), wa:get(".wa-float"),
      music:get(".christmas-controls"), chatWindow:get(".cb-window"),
      benefits:get(".premium-benefits"),
      scene:get(".mobile-scenic-panel"),
      sceneBg:getComputedStyle(document.querySelector(".mobile-scenic-panel")).backgroundImage,
      sceneDisplay:getComputedStyle(document.querySelector(".mobile-scenic-panel")).display,
      firstCard:get(document.body.classList.contains("home-page") ? "#servicios .card" : ".tour-card"),
      tourGrid:document.body.classList.contains("tours-page")
        ? getComputedStyle(document.querySelector(".tour-explore-links")).gridTemplateColumns : null,
      heroPadding:getComputedStyle(hero).padding,
      xOverflow:Math.max(document.documentElement.scrollWidth,document.body.scrollWidth)-innerWidth,
      overlapButtons:overlap(get(".christmas-controls"),get(".wa-float")) ||
        overlap(get(".christmas-controls"),get(".cb-launcher")) ||
        overlap(get(".wa-float"),get(".cb-launcher"))
    };
  });
  assert.ok(metrics.nav && metrics.title && metrics.actions, label+" missing page structure");
  assert.ok(metrics.title.w > 190 && metrics.title.w <= viewport.width, label+" heading width wrong");
  assert.ok(metrics.actions.x >= -1 && metrics.actions.x + metrics.actions.w <= viewport.width+1,
    label+" action buttons offscreen");
  assert.ok(metrics.xOverflow <= 2,label+" horizontal page scroll "+metrics.xOverflow);
  assert.ok(!metrics.overlapButtons,label+" floating widgets overlap");
  assert.ok(metrics.brand.x >= 0 && metrics.brand.x + metrics.brand.w <= viewport.width+1,label+" brand spills horizontally");
  assert.ok(metrics.menu.x >= 0 && metrics.menu.x + metrics.menu.w <= viewport.width+1,label+" mobile toggle spills");
  assert.ok(metrics.lang.x >= 0 && metrics.lang.x + metrics.lang.w <= viewport.width+1,label+" language toggle spills");
  assert.ok(metrics.firstCard.w < viewport.width, label+" card occupies entire viewport without margins");
  if (viewport.width < 768) {
    assert.equal(metrics.sceneDisplay, "block", label+" scenic image hidden on phone");
    assert.ok(metrics.scene.h >= 210 && metrics.scene.w >= viewport.width*.86,
      label+" scenic image must be large, not a narrow strip");
    assert.ok(metrics.scene.y >= metrics.actions.y + metrics.actions.h+8,
      label+" photo overlaps main call-to-action");
    assert.match(metrics.sceneBg,
      label.startsWith("home")?/mockup-home-scene.webp/:/mockup-tours-scene.webp/,
      label+" mobile scenic background missing");
  } else {
    assert.equal(metrics.sceneDisplay,"none",label+" mobile photo should not duplicate desktop background");
  }
  if (viewport.width < 768) {
    assert.ok(metrics.title.y >= metrics.nav.y+metrics.nav.h,label+" title under sticky nav");
  }
  console.log("COMPACT LAYOUT "+JSON.stringify({label,...metrics}));
}
async function checkTourCards(page, label) {
  const first = page.locator(".tour-card").first();
  await first.scrollIntoViewIfNeeded();
  await page.waitForTimeout(140);
  const bounds = await first.boundingBox();
  const viewport = page.viewportSize();
  assert.ok(bounds && bounds.width >= Math.min(viewport.width-50,250),
    label+" tour card width collapsed");
  assert.ok(bounds.x >= -1 && bounds.x+bounds.width <= viewport.width+1,
    label+" tour card clipped at viewport edges");
  const img = first.locator(".tour-card-media img");
  await img.scrollIntoViewIfNeeded();
  await img.evaluate(image => image.decode());
  assert.ok(await img.evaluate(image => image.naturalWidth > 100),
    label+" tour photo missing");
  const toggle = first.locator(".tour-toggle");
  await toggle.click();
  assert.equal(await toggle.getAttribute("aria-expanded"),"true",
    label+" expandable details do not work");
  assert.ok(await first.evaluate(el=>el.classList.contains("is-open")),
    label+" tour details class missing");
  await toggle.click();
  assert.equal(await toggle.getAttribute("aria-expanded"),"false",
    label+" tour details fail to close");
  console.log("TOUR CARD VERIFIED "+JSON.stringify({label,bounds,imageLoaded:true,toggleWorks:true}));
}

async function checkNavInteractions(page,label) {
  const toggle = page.locator(".nav-toggle"), nav = page.locator(".nav-links");
  assert.equal(await toggle.isVisible(),true,label+" missing mobile menu toggle");
  await toggle.click();
  assert.equal(await toggle.getAttribute("aria-expanded"),"true",label+" menu did not open");
  assert.equal(await nav.evaluate(el=>el.classList.contains("open")),true,label+" nav not visible");
  const navRect = await nav.boundingBox();
  const vp = page.viewportSize();
  assert.ok(navRect && navRect.width <= vp.width && navRect.x>=0,label+" menu overflow");
  await page.keyboard.press("Escape");
  assert.equal(await toggle.getAttribute("aria-expanded"),"false",label+" Escape did not close");
  await toggle.click();
  await page.locator(".hero h1").click({force:true});
  assert.equal(await toggle.getAttribute("aria-expanded"),"false",label+" outside click did not close");
  await toggle.click();
  await nav.locator("a[href^=\"#\"]").first().click();
  assert.equal(await toggle.getAttribute("aria-expanded"),"false",label+" nav selection did not close");
}

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
    sceneBg:getComputedStyle(document.querySelector(".mobile-scenic-panel")).backgroundImage,
    xOverflow:document.documentElement.scrollWidth-innerWidth,
    styles:[...document.styleSheets].some(s=>s.href?.includes("christmas-experience.css")),
    requests:performance.getEntriesByType("resource").length,
    cardVisuals:[...document.querySelectorAll(document.body.classList.contains("home-page") ? ".card" : ".tour-card, .tour-guide-item")].map(card=>({
      before:getComputedStyle(card,"::before").content,
      after:getComputedStyle(card,"::after").content,
      backdrop:getComputedStyle(card).backdropFilter,
      shadow:getComputedStyle(card).boxShadow
    })),
    tileSnow:[...document.querySelectorAll(".tour-explore-links a")].map(a=>getComputedStyle(a,"::after").content),
    cardMask:[...document.querySelectorAll("#servicios .card > img, .tour-guide-item .premium-guide-photo")].map(img=>(getComputedStyle(img).maskImage || "none"))
  }));
  assert.ok(snapshot.hasAudio && snapshot.hasWhatsApp && snapshot.styles,label+" missing primary UI");
  const phone = page.viewportSize().width < 768;
  const expectedHero = label.startsWith("home")
    ? /christmas-beach-new.webp/
    : /volcan-coatepeque-hero-bg.webp/;
  if(phone) {
    assert.match(snapshot.sceneBg,
      label.startsWith("home") ? /mockup-home-scene.webp/ : /mockup-tours-scene.webp/,
      label+" mobile photo missing");
    assert.doesNotMatch(snapshot.heroBg, /mockup-home-scene.webp|mockup-tours-scene.webp/,
      label+" hero is downloading redundant background");
  } else assert.match(snapshot.heroBg, expectedHero, label+" desktop background lost");
  assert.ok(snapshot.snowflakes >= 6 && snapshot.snowflakes <= 40,label+" wrong snowfall density");
  assert.ok(snapshot.snowTypes.length>=3,label+" snow variety insufficient");
  assert.ok(snapshot.xOverflow <= 2,label+" unexpected horizontal overflow "+snapshot.xOverflow);
  assert.ok(snapshot.cardVisuals.length>=3,label+" no cards found");
  assert.ok(snapshot.cardVisuals.every(v=>v.before==="none"&&v.after==="none"),label+" frost snow pseudo-elements still rendered");
  assert.ok(snapshot.cardVisuals.every(v=>v.backdrop==="none"),label+" expensive card blur filter active");
  assert.ok(snapshot.tileSnow.every(value=>value==="none"),label+" snowcap still rendered on tour tiles");
  assert.ok(snapshot.cardMask.every(value=>value==="none"),label+" costly image mask still active");
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
  await checkCompactLayout(mobile,"home-390");
  await checkNavInteractions(mobile,"home-390");
  await mobile.screenshot({path:screenshots+"/home-mobile.png",animations:"disabled"});
  await mobile.close();

  const tours = await browser.newPage({viewport:{width:1440,height:900}});
  await inspect(tours,"/tours","tours-desktop");
  const cards = await tours.locator(".tour-card").count();
  assert.equal(cards,6,"Six tours must remain available");
  await checkTourCards(tours,"tours-desktop");
  assert.equal(await tours.locator(".hero-collage img").count(),0,"Hidden hero collage still downloads image assets");
  await tours.screenshot({path:screenshots+"/tours-desktop.png",animations:"disabled"});
  await tours.close();

  const toursMobile = await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  await inspect(toursMobile,"/tours","tours-mobile");
  assert.equal(await toursMobile.locator(".tour-card").count(),6,"Mobile tours catalog was altered");
  await checkCompactLayout(toursMobile,"tours-390");
  await checkNavInteractions(toursMobile,"tours-390");
  await toursMobile.screenshot({path:screenshots+"/tours-mobile.png",animations:"disabled"});
  await checkTourCards(toursMobile,"tours-mobile");
  await toursMobile.close();

  // Narrow phones and tablets have their own deliberately tested layout.
  for (const width of [320,375,430,820]) {
    const isPhone = width < 768;
    const page = await browser.newPage({
      viewport:{width,height:isPhone?720:1000},
      isMobile:isPhone,hasTouch:isPhone
    });
    for (const route of ["/","/tours"]) {
      await page.goto(ORIGIN+route,{waitUntil:"domcontentloaded",timeout:45000});
      await page.waitForSelector("#christmas-music-toggle",{timeout:15000});
      await checkCompactLayout(page,(route==="/tours"?"tours":"home")+"-"+width);
      await checkNavInteractions(page,(route==="/tours"?"tours":"home")+"-"+width);
      if(route==="/tours") await checkTourCards(page,"tours-"+width);
    }
    await page.close();
  }

  const reduced = await browser.newPage({viewport:{width:1366,height:768},reducedMotion:"reduce"});
  await reduced.goto(ORIGIN+"/",{waitUntil:"domcontentloaded"});
  await reduced.waitForSelector("#christmas-music-toggle");
  const reducedFlakes = await reduced.locator(".christmas-snowflake").count();
  assert.equal(reducedFlakes,0,"Reduced-motion preference not respected");
  assert.ok(!(await reduced.locator("#christmas-snow-toggle").isVisible()),"Snow button should hide in reduced motion");
  await reduced.close();

  // The public custom domain may be hosted/cached separately from Vercel.
  // Report its state without hiding a successful Vercel deployment.
  const custom = await browser.newPage();
  try {
    for (const route of ["/","/tours"]) {
      const response = await custom.goto("https://taxistuncoelsalvador.com"+route,
        {waitUntil:"domcontentloaded",timeout:30000});
      const state = await custom.evaluate(() => ({
        mobileV2:!!document.querySelector('link[href*="mobile-scene-v2"]'),
        scenicElement:!!document.querySelector(".mobile-scenic-panel"),
        title:document.title
      }));
      console.log("CUSTOM DOMAIN "+JSON.stringify({
        route,status:response?.status(),...state,
        readyToShowNewDesign:response?.status()===200&&state.mobileV2&&state.scenicElement
      }));
    }
  } catch (err) {
    console.warn("CUSTOM DOMAIN CHECK UNAVAILABLE",err.message);
  } finally {await custom.close();}

  console.log("FRONTEND SMOKE PASSED");
  for(const res of results) console.log(JSON.stringify({label:res.label,flakes:res.snowflakes,types:res.snowTypes.length,resources:res.requests,xOverflow:res.xOverflow}));
} finally {
  await browser.close();
}
