(() => {
const A = '/scan-explain/';
// icons exported from the Figma components (same set as the phone prototype)
const IC = {
  back:A+'icons/back.svg', chevron:A+'icons/chevron.svg', info:A+'icons/info.svg',
  aiInfo:A+'icons/ai-info.svg', scanAnother:A+'icons/scan-another.svg', stepCheck:A+'icons/step-check.svg', barcode:A+'icons/barcode.svg',
  productIcon:A+'icons/product-icon.svg', tagDry:A+'icons/tag-dry.svg', tagEczema:A+'icons/tag-eczema.svg', tagRough:A+'icons/tag-rough.svg',
  bgPattern1:A+'icons/bg-pattern1.svg', bgPattern2:A+'icons/bg-pattern2.svg',
};
const img = (src, w, h, cls='') => `<img src="${src}" width="${w}" height="${h}" alt="" class="${cls}">`;
const RESTART_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg>';
const PIN_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>';
const HEART_SVG = '<svg viewBox="0 0 24 22"><path d="M12 21.5 10.3 20C4.2 14.5.2 10.9.2 6.4.2 2.8 3 0 6.6 0c2 0 4 .9 5.4 2.4C13.4.9 15.4 0 17.4 0c3.6 0 6.4 2.8 6.4 6.4 0 4.5-4 8.1-10.1 13.6L12 21.5z" fill="#CC0000"/></svg>';
const CHECK_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
const BARCODE_GREEN = '<svg viewBox="0 0 20 20" fill="none" stroke="#1E7A6F" stroke-width="1.5" stroke-linecap="round"><path d="M3.3 4.2v11.6M5.8 4.2v11.6M8.3 4.2v11.6M10.8 4.2v11.6M14.2 4.2v11.6M16.7 4.2v11.6"/></svg>';
const DOWN_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v15M5 12l7 7 7-7"/></svg>';

const IDLE_MS = 60000;       // no touches for this long → "Still there?"
const IDLE_COUNTDOWN = 15;   // then this many seconds before the kiosk resets for the next customer

/* ================= data (same content as the phone prototype) ================= */
// What the kiosk's barcode scanner reads. Scanners type the code like a keyboard, then Enter.
const SCANS = {
  cerave:{title:'CeraVe Moisturizing Cream', meta:'UPC 3606000537446 · 16 oz', img:A+'cerave-cream.png', feed:A+'camera-feed.jpg', box:[108,85,72,51]},
  cetaphil:{title:'Cetaphil Moisturizing Cream', meta:'UPC 3302993918161 · 16 oz', feed:A+'camera-feed-cetaphil.jpg', box:[113,96,78,58]},
};
// Not personalized: the kiosk doesn't know what the customer already owns, so each item shows where to find it
const ROUTINE = [
  {t:'Gentle hydrating cleanser', s:'Cleanse first so the cream absorbs evenly', where:'Aisle 9'},
  {t:'Mineral sunscreen SPF 30+', s:'Moisturizer alone won’t block UV damage', where:'Aisle 9'},
  {t:'Hyaluronic acid serum', s:'Layer under cream to boost hydration', where:'Aisle 9'},
  {t:'Cool-mist humidifier', s:'Dry indoor air pulls moisture from skin', where:'Aisle 14'},
  {t:'MinuteClinic skin check', s:'Recommended if dryness lasts 2+ weeks', where:'Walk in', clinic:true},
];
const COMPARE = {
  cetaphil:{name:'Cetaphil Cream', price:'$14–17', best:'Sensitive skin'},
  cvs:{name:'CVS Health Cream', price:'$10–12', best:'Value'},
  cerave:{name:'CeraVe Cream', price:'$17–20', best:'Brand'},
};
const DOCS = {
  Ingredients:`<p><b>Active Ingredients</b><br>Ceramides 1, 3, 6-II · Hyaluronic Acid · MVE Delivery Technology</p><p><b>Inactive Ingredients</b><br>Purified Water, Glycerin, Cetearyl Alcohol, Caprylic/Capric Triglyceride, Cetyl Alcohol, Ceteareth-20, Petrolatum, Potassium Phosphate, Ceramide NP, Ceramide AP, Ceramide EOP, Carbomer, Dimethicone, Behentrimonium Methosulfate, Sodium Lauroyl Lactylate, Sodium Hyaluronate, Cholesterol, Phenoxyethanol, Disodium EDTA, Dipotassium Phosphate, Tocopherol, Phytosphingosine, Xanthan Gum, Ethylhexylglycerin</p>`,
  Directions:`<p>Apply liberally as often as needed, or as directed by a physician. For best results, apply after cleansing while skin is still slightly damp to help lock in moisture. Suitable for face and body. Safe for use on children and babies 3 months and older. For hands, reapply after each hand washing. Can be used morning and night; follow with a broad spectrum sunscreen during the day.</p>`,
  Warnings:`<p>For external use only. Avoid contact with eyes. If contact occurs, rinse thoroughly with water. Stop use and ask a doctor if irritation, redness or a rash develops. Do not apply to deep or puncture wounds, animal bites or serious burns. If you have a known sensitivity to any listed ingredient, patch test on a small area before use. Keep out of reach of children. Store at room temperature between 59–86˚ F (15–30˚ C) with the lid tightly closed.</p>`,
};

const fresh = () => ({ tab:'desc', compared:false, rows:[], newRow:null });
let S = fresh();

/* ================= nav stack ================= */
const stage = document.getElementById('stage');
stage.innerHTML = `<div id="stack"></div>
  <div class="scrim" id="scrim"></div><div class="sheet" id="sheet" role="dialog" aria-modal="true" aria-labelledby="sheetTitle"></div>
  <div class="toast" id="toast" role="status"></div>`;
const stackEl = document.getElementById('stack');
let stack = [];
const SCREENS = {};
const top = () => stack[stack.length-1];

function build(entry){
  const def = SCREENS[entry.name];
  const el = document.createElement('section');
  el.className = 'scr ' + (def.cls || '');
  el.innerHTML = def.render(entry.args || {});
  entry.el = el;
  def.mount && def.mount(el, entry.args || {});
  return el;
}
// every new page slides in from the right; `replace` swaps out the top N entries
// anim:false swaps the screen in place (scan prompt -> looking up is the same moment, so it shouldn't slide)
function push(name, args, {replace=0, anim=true}={}){
  const entry = {name, args};
  const el = build(entry);
  const prev = top();
  if (prev && anim) el.classList.add('from-right');
  stackEl.appendChild(el);
  el.getBoundingClientRect();
  requestAnimationFrame(() => {
    el.classList.remove('from-right');
    if (prev && anim) prev.el.classList.add('behind');
  });
  const removed = replace ? stack.splice(stack.length - replace, replace) : [];
  stack.push(entry);
  setTimeout(() => removed.forEach(r => r.el.remove()), 380);
}
function pop(n=1){
  if (stack.length <= 1) return;
  n = Math.min(n, stack.length-1);
  const gone = stack.splice(stack.length-n, n);
  refresh(top());
  top().scanning = false;   // the scan prompt is ready for another barcode
  top().el.classList.remove('behind');
  const last = gone[gone.length-1];
  last.el.classList.add('from-right');
  gone.slice(0,-1).forEach(g => g.el.remove());
  setTimeout(() => last.el.remove(), 380);
}
function refresh(entry = top()){
  if (!entry) return;
  const def = SCREENS[entry.name];
  if (def.static) return;
  const y = entry.el.scrollTop;
  entry.el.innerHTML = def.render(entry.args || {});
  def.mount && def.mount(entry.el, entry.args || {});
  entry.el.scrollTop = y;
}

/* ================= toast ================= */
const toastEl = document.getElementById('toast'); let tt;
function toast(msg){ toastEl.innerHTML = CHECK_SVG + '<span></span>'; toastEl.lastChild.textContent = msg; toastEl.classList.add('on'); clearTimeout(tt); tt = setTimeout(()=>toastEl.classList.remove('on'), 1800); }

/* ================= screens ================= */
const restartBtn = `<button class="restart" data-act="restart">${RESTART_SVG}Start over</button>`;
const header = (title='', back='Back') => `<header class="hdr"><div class="row">
  <button class="backbtn" data-act="back" aria-label="${back}">${img(IC.back,12,21)}${back}</button>${title?`<h1>${title}</h1>`:''}
  <div class="end">${restartBtn}</div></div></header>`;

// The scanner sits below the screen: a product, its barcode, and the red scan line pointing down to it
// What the camera under the kiosk sees: the customer's product, with the barcode found and being read
const liveFeed = (target) => { const [x,y,w,h] = SCANS[target].box; return `<div class="feed">
  <img class="shot" src="${SCANS[target].feed}" alt="Camera view of a ${SCANS[target].title} barcode held up to the kiosk">
  <i class="vignette"></i>
  <div class="detect" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px"><i class="sweep"></i></div>
  <span class="live"><i></i>LIVE</span>
  <span class="camlabel">KIOSK CAM · <b data-clock>11:41:08</b></span>
</div>`; };
const scannerArt = (target) => `<div class="scanner">
  <div class="item">
    <div class="scan-frame">${liveFeed(target)}${img(A+'icons/scan-bracket.svg',300,245,'bracket')}</div>
    <div class="code">${img(IC.barcode,40,40)}<span>${SCANS[target].meta.split(' · ')[0]}</span></div>
  </div>
  <p class="below">${DOWN_SVG}<span>Scanner is below the screen</span></p>
</div>`;

// Idle screen. Bringing any product to the scanner starts the lookup.
SCREENS.home = { cls:'warm attract', static:true, render:() => `
  <div class="brand">${HEART_SVG}CVS<small>pharmacy</small></div>
  <p class="demo">Prototype: tap anywhere to simulate a scan</p>
  <div class="copy">
    <p class="eyebrow">Scan &amp; Explain</p>
    <h2>Not sure what something is for? Scan it here.</h2>
    <p class="lede">Hold the product’s barcode under the scanner below this screen. We’ll explain what it does, how to use it, and what else completes your routine.</p>
  </div>
  <div class="steps3">
    <div><b><i>1</i>Scan</b><span>Hold the barcode under the red light</span></div>
    <div><b><i>2</i>Understand</b><span>Overview, directions &amp; warnings</span></div>
    <div><b><i>3</i>Compare</b><span>Alternatives and where to find them</span></div>
  </div>
  ${scannerArt('cerave')}
`};

// Compare: scan a second product at the same scanner
SCREENS.scan2 = { cls:'warm prompt', static:true, render:() => `
  ${header('', 'Back')}
  <div class="copy">
    <p class="eyebrow">Compare your options</p>
    <h2>Scan the product you want to compare.</h2>
  </div>
  <p class="chip-cmp">Comparing with <b>CeraVe Moisturizing Cream</b></p>
  ${scannerArt('cetaphil')}
  <p class="demo">Prototype: tap anywhere to simulate a scan</p>
`};

// "Looking up": the barcode was read; the same 4-step progress as the phone, with the AI sheen over the product
SCREENS.scanning = { cls:'warm lookup', static:true, render:({target}) => `
  <header class="hdr"><div class="row"><button class="backbtn" data-act="back" aria-label="Cancel">${img(IC.back,12,21)}Cancel</button><div class="end">${restartBtn}</div></div></header>
  <div class="found">
    <div class="found-card">
      <div class="pic">${SCANS[target].img ? img(SCANS[target].img,280,245) : img(IC.productIcon,120,124)}<div class="vf-sheen"></div></div>
      <p class="ok">${BARCODE_GREEN}Barcode read</p>
      <b>${SCANS[target].title}</b><span>${SCANS[target].meta}</span>
    </div>
    <div class="side">
      <p class="cam-title">Looking it up</p><p class="cam-sub">Please wait...</p>
      <div class="prog"><div class="bar"><i></i></div>
        ${['Reading barcode...','Identifying product...','Building care guide...','Preparing explanation...'].map(s=>`<div class="step"><i>${img(IC.stepCheck,13,13)}</i><span>${s}</span></div>`).join('')}</div>
    </div>
  </div>
`, mount(el, {target}){
  const steps = el.querySelectorAll('.step'), bar = el.querySelector('.bar i');
  let k = 0;
  const step = () => {
    if (!el.isConnected) return;
    if (k > 0){ steps[k-1].classList.replace('active','done'); }
    if (k < steps.length){
      steps[k].classList.add('active');
      bar.style.width = ((k+1)/steps.length*100)+'%'; k++; setTimeout(step, 620);
    } else setTimeout(() => { if (el.isConnected && top().el === el) finishScan(target); }, 420);
  };
  setTimeout(step, 380);
}};

function scan(target){
  const t = top();
  if (!t || !['home','scan2'].includes(t.name) || t.scanning) return;
  t.scanning = true;
  // scanner "beep": a quick flash, then the lookup swaps in place
  const f = document.createElement('div'); f.className = 'flash'; t.el.appendChild(f);
  setTimeout(() => push('scanning', {target}, {replace: t.name === 'scan2' ? 1 : 0, anim: t.name === 'scan2' ? false : true}), 200);
}

function finishScan(target){
  if (target === 'cerave'){
    S = fresh();
    push('product', {}, {replace:1});
  } else {
    S.compared = true; S.newRow = 'cetaphil'; S.tab = 'explore';
    if (!S.rows.includes('cetaphil')) S.rows.unshift('cetaphil');
    pop(1);
    const prod = top();
    setTimeout(() => {
      const t = prod.el.querySelector('.ctable');
      t && prod.el.scrollTo({top: Math.max(0, (t.getBoundingClientRect().top - prod.el.getBoundingClientRect().top) / scale + prod.el.scrollTop - 420), behavior:'smooth'});
      toast('Cetaphil added to your comparison');
    }, 400);
  }
}

SCREENS.product = { cls:'prod', render:() => `
  <div class="ptop">
  ${header('', 'Scan something else')}
  <div class="pbar">
    <div class="pname">
      <div class="row"><span class="tile">${img(IC.productIcon,52,54)}</span><div><h2>Moisturizing Cream</h2><span class="pill">Dry Skin</span></div></div>
      <div class="lblbox"><p class="lbl">Label on product</p><p class="val">CeraVe Moisturizing Cream</p></div>
    </div>
    <div class="tabs ${S.tab==='explore'?'right':''}" role="tablist"><i class="thumb"></i>
      <button role="tab" aria-selected="${S.tab==='desc'}" class="${S.tab==='desc'?'on':''}" data-act="tab" data-tab="desc">Description</button>
      <button role="tab" aria-selected="${S.tab==='explore'}" class="${S.tab==='explore'?'on':''}" data-act="tab" data-tab="explore">Explore Options</button></div>
  </div>
  </div>
  <div class="descs">${S.tab==='desc' ? descTab() : exploreTab()}</div>
  <div style="height:120px"></div>
`};

const descTab = () => `
  <div class="col">
    <div class="block"><div class="shead"><span>Overview</span></div>
      <div class="desc-card"><h4>What is this?</h4><p>A rich, non-greasy moisturizer with three essential ceramides and hyaluronic acid. It restores the skin’s protective barrier and keeps skin hydrated for 24 hours.</p></div>
      <div class="usedfor"><h4>Used for</h4><div class="tags">
        <span class="tag"><span class="ti">${img(IC.tagDry,20,29)}</span>Dry Skin</span><span class="tag"><span class="ti">${img(IC.tagEczema,29,29)}</span>Eczema-prone skin</span>
        <span class="tag"><span class="ti">${img(IC.tagRough,26,32)}</span>Rough, cracked skin</span></div></div>
    </div>
  </div>
  <div class="col">
    <div class="alert">${img(IC.info,30,30)}<p>Recommended by pharmacists</p></div>
    <div class="docs">${['Ingredients','Directions','Warnings'].map(x=>`<button class="acc" data-act="doc" data-doc="${x}"><span>${x}</span>${img(IC.chevron,28,28)}</button>`).join('')}</div>
    <p class="docs-note">Questions about this product? A pharmacist is available at the pharmacy counter.</p>
  </div>`;

const exploreTab = () => {
  const rows = S.compared ? [...S.rows, 'cerave'] : [];
  return `
  <div class="col"><div class="block routine-block">
    <div class="shead"><span>Complete Your Routine</span><span class="cnt">Pairs well with this cream</span></div>
    <div class="routine">${ROUTINE.map(r => `<div class="ritem"><span class="st"></span>
      <span class="tx"><b>${r.t}</b><small>${r.s}</small></span>
      <span class="where ${r.clinic?'clinic':''}">${r.clinic?'':PIN_SVG}${r.where}</span></div>`).join('')}</div>
  </div></div>
  <div class="col">
    <div class="card compare"><h4>Compare your options</h4>
      <p>Scan a nearby product or quickly compare pharmacist-selected alternatives.</p>
      <div class="btns">
        <button class="btn-outline" data-act="scan2">${img(IC.scanAnother,24,24)} Scan Another Product</button>
        ${rows.length ? `<div class="ctable"><div class="r h"><span>Option</span><span>Price</span><span>Best for</span></div>
          ${rows.map(k => `<div class="r ${S.newRow===k?'new':''}"><span>${COMPARE[k].name}</span><span>${COMPARE[k].price}</span><span>${COMPARE[k].best}</span></div>`).join('')}</div>` : ''}
        <button class="btn-fill" data-act="compare">Compare Similar</button>
      </div></div>
    <div class="card reviews"><h4>Ratings &amp; reviews</h4>
      <div class="rating"><span class="stars">★★★★★</span><span>4.7 (12,486)</span></div>
      <div class="body"><b>Customers say</b><p>Shoppers most often mention the rich, fragrance-free texture and hydration that lasts all day. Some find it too thick to wear under makeup.</p>
        <div class="ai">${img(IC.aiInfo,32,32)}<p>This summary is generated by artificial intelligence based on customer reviews</p></div></div></div>
  </div>`;
};

SCREENS.doc = { render:({doc}) => `${header()}
  <div class="doc"><h1>${doc}</h1><div><p class="t">CeraVe Moisturizing Cream for Normal to Dry Skin, 16 OZ</p><p class="m">1.17 lbs. item #418620</p></div>${DOCS[doc]}</div>`};

/* ================= "Still there?" sheet (Overlay / Bottom sheet) ================= */
const scrim = document.getElementById('scrim'), sheet = document.getElementById('sheet');
let idleTick, idleOpen = false;
function sheetIdle(){
  let left = IDLE_COUNTDOWN;
  idleOpen = true;
  sheet.innerHTML = `<div class="head"><i></i><h3 id="sheetTitle">Still there?</h3></div><div class="idle"><div class="ring" id="idleN">${left}</div>
    <p>This screen will reset for the next customer.</p>
    <button class="cta view" data-act="stillhere">I’m still here</button>
    <button class="cta again" data-act="restart">Start over</button></div>`;
  scrim.classList.add('on'); sheet.classList.add('on');
  clearInterval(idleTick);
  idleTick = setInterval(() => {
    left--; const n = document.getElementById('idleN'); if (n) n.textContent = left;
    if (left <= 0) start();
  }, 1000);
}
function closeSheet(){ idleOpen = false; clearInterval(idleTick); scrim.classList.remove('on'); sheet.classList.remove('on'); armIdle(); }
sheet.addEventListener('click', e => {
  const b = e.target.closest('[data-act]'); if (!b) return;
  if (b.dataset.act === 'stillhere') closeSheet(); else start();
});

/* ================= actions ================= */
stackEl.addEventListener('click', e => {
  const b = e.target.closest('[data-act]');
  const t = top();
  if (!b){
    // no camera to aim: in the prototype, a tap stands in for the hardware scanner reading a barcode
    if (t.name === 'home') scan('cerave');
    else if (t.name === 'scan2') scan('cetaphil');
    return;
  }
  const a = b.dataset.act;
  switch (a){
    case 'back': pop(); break;
    case 'restart': start(); break;
    case 'scan2': push('scan2'); break;
    case 'tab': {
      // re-render, then slide the thumb from the old tab to the new one
      const was = S.tab; S.tab = b.dataset.tab; refresh();
      const tb = t.el.querySelector('.tabs');
      tb.classList.toggle('right', was === 'explore'); tb.getBoundingClientRect();
      tb.classList.toggle('right', S.tab === 'explore');
      break; }
    case 'doc': push('doc', {doc:b.dataset.doc}); break;
    case 'compare':
      S.compared = true;
      if (!S.rows.includes('cvs')){ S.rows.push('cvs'); S.newRow = 'cvs'; refresh(); toast('Showing pharmacist-selected alternatives'); }
      else toast('You’re seeing every alternative');
      break;
  }
});

// USB/Bluetooth barcode scanners act as keyboards: they type the digits, then Enter
let typed = '', typedAt = 0;
addEventListener('keydown', e => {
  if (e.key === 'Escape'){ if (!idleOpen) pop(); return; }
  const now = Date.now();
  if (now - typedAt > 100) typed = '';
  typedAt = now;
  if (/^\d$/.test(e.key)) typed += e.key;
  else if (e.key === 'Enter' && typed.length >= 8){
    // on the compare prompt the scan is the second product; anywhere else a new scan starts a fresh session
    if (top().name === 'scan2') scan('cetaphil');
    else { if (top().name !== 'home') start(); scan('cerave'); }
    typed = '';
  }
});

// live clock on the camera feed
setInterval(() => {
  const t = new Date().toLocaleTimeString('en-US', {hour12:false});
  document.querySelectorAll('[data-clock]').forEach(n => n.textContent = t);
}, 1000);

/* ================= idle reset ================= */
let idleTimer;
function armIdle(){
  clearTimeout(idleTimer);
  if (stack.length <= 1 || idleOpen) return;   // the idle screen has nothing to clear
  idleTimer = setTimeout(sheetIdle, IDLE_MS);
}
addEventListener('pointerdown', armIdle, {passive:true});
addEventListener('keydown', armIdle);

/* ================= fit the 1024×1366 iPad Pro 12.9" stage to the display ================= */
let scale = 1;
function layout(){
  scale = Math.min(innerWidth/1024, innerHeight/1366);
  document.documentElement.style.setProperty('--scale', scale);
}
addEventListener('resize', layout); layout();

/* ================= boot ================= */
function start(){
  idleOpen = false; scrim.classList.remove('on'); sheet.classList.remove('on'); clearInterval(idleTick); clearTimeout(idleTimer);
  S = fresh(); stack.forEach(s => s.el.remove()); stack = [];
  push('home');
}
(document.fonts ? document.fonts.load('16px Inter') : Promise.resolve()).finally(start);
})();
