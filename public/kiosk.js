(() => {
const A = '/scan-explain/';
// icons exported from the Figma components (same set as the phone prototype)
const IC = {
  back:A+'icons/back.svg', camBack:A+'icons/cam-back.svg', addList:A+'icons/add-list.svg', chevron:A+'icons/chevron.svg', info:A+'icons/info.svg',
  routineCheck:A+'icons/routine-check.svg', aiInfo:A+'icons/ai-info.svg', scanAnother:A+'icons/scan-another.svg', camera:A+'icons/camera.svg',
  shutter:A+'icons/shutter.svg', stepCheck:A+'icons/step-check.svg', search:A+'icons/search.svg', barcode:A+'icons/barcode.svg',
  listShop:A+'icons/list-shop.svg', listMinus:A+'icons/list-minus.svg', listPlus:A+'icons/list-plus.svg', listDelete:A+'icons/list-delete.svg',
  basketChevron:A+'icons/basket-chevron.svg', checkboxOn:A+'icons/checkbox-on.svg', productIcon:A+'icons/product-icon.svg',
  tagDry:A+'icons/tag-dry.svg', tagEczema:A+'icons/tag-eczema.svg', tagRough:A+'icons/tag-rough.svg',
  bgPattern1:A+'icons/bg-pattern1.svg', bgPattern2:A+'icons/bg-pattern2.svg',
};
const img = (src, w, h, cls='') => `<img src="${src}" width="${w}" height="${h}" alt="" class="${cls}">`;
const RESTART_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/></svg>';

const IDLE_MS = 90000;       // no touches for this long → "Still there?"
const IDLE_COUNTDOWN = 15;   // then this many seconds before the kiosk resets for the next shopper

/* ================= data (same content as the phone prototype) ================= */
const PRODUCTS = {
  cerave:{brand:'CeraVe', name:'Moisturizing Cream 16 oz', full:'CeraVe Moisturizing Cream 16 oz', price:'$18.99', cents:1899, aisle:'Aisle 9', img:A+'cerave-cream.png'},
  spf:{brand:'CeraVe', name:'Mineral Sunscreen SPF 30', full:'CeraVe Hydrating Mineral Sunscreen SPF 30', price:'$17.99', cents:1799, aisle:'Aisle 9', img:A+'sunscreen.png'},
  serum:{brand:'Neutrogena', name:'Hydro Boost Serum', full:'Neutrogena Hydro Boost Hyaluronic Acid Serum', price:'$22.99', cents:2299, aisle:'Aisle 9', img:A+'serum.png'},
  humid:{brand:'Vicks', name:'Cool Mist Humidifier', full:'Vicks Cool Mist Humidifier', price:'$39.99', cents:3999, aisle:'Aisle 14', img:A+'humidifier.png'},
};
const ROUTINE = [
  {id:'clean', t:'Gentle hydrating cleanser', s:'Using daily — you’re on track', fixed:true},
  {id:'spf', t:'Mineral sunscreen SPF 30+', s:'Moisturizer alone won’t block UV damage', product:'spf'},
  {id:'serum', t:'Hyaluronic acid serum', s:'Layer under cream to boost hydration', product:'serum'},
  {id:'humid', t:'Cool-mist humidifier', s:'Dry indoor air pulls moisture from skin', product:'humid'},
  {id:'clinic', t:'MinuteClinic skin check', s:'Recommended if dryness lasts 2+ weeks', booking:true},
];
// bx/by: background-position that puts this product's jar and shelf tag in the viewfinder (shelf shown at 2400px wide)
const LABELS = {
  cerave:{scan:'CVS Label', title:'CeraVe Moisturizing Cream', meta:'UPC 3606000537521 · 16 oz', bx:-120, by:-412},
  cetaphil:{scan:'CVS Label', title:'Cetaphil Moisturizing Cream', meta:'UPC 3499320013161 · 16 oz', bx:-1080, by:-412},
};
const VF = {x:220, y:300};   // viewfinder origin on the stage
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

const fresh = () => ({ lastList:0, lists:[], tab:'desc', compared:false, rows:[], newRow:null, booked:false, basketOpen:true, lastAdded:null, filter:'' });
let S = fresh();
const inLists = pid => S.lists.some(l => l.items.some(i => i.pid === pid));
const has = r => r.fixed || (r.booking ? S.booked : inLists(r.product));
const covered = () => ROUTINE.filter(has).length;

/* ================= nav stack ================= */
const stage = document.getElementById('stage');
stage.innerHTML = `<div id="stack"></div><button class="fab gone" id="fab"></button>
  <div class="scrim" id="scrim"></div><div class="sheet" id="sheet" role="dialog" aria-modal="true" aria-labelledby="sheetTitle"></div>
  <div class="toast" id="toast" role="status"></div>`;
const stackEl = document.getElementById('stack');
let stack = [];
const SCREENS = {};

function build(entry){
  const def = SCREENS[entry.name];
  const el = document.createElement('section');
  el.className = 'scr ' + (def.cls || '');
  el.innerHTML = def.render(entry.args || {});
  entry.el = el;
  def.mount && def.mount(el, entry.args || {});
  return el;
}
const fabEl = document.getElementById('fab');
function setFab(){
  const def = SCREENS[stack[stack.length-1].name];
  const on = !!def.fab;
  fabEl.classList.toggle('gone', !on);
  if (!on) return;
  const L = S.lists[S.lastList], n = L ? L.items.length : 0;
  fabEl.setAttribute('aria-label', `My List, ${n} item${n===1?'':'s'}`);
  fabEl.innerHTML = `<span class="n">${n}</span>My List`;
}
fabEl.addEventListener('click', () => {
  const L = S.lists[S.lastList];
  if (L && L.items.length) push('list', {li:S.lastList}); else toast('Add a care item to start your list');
});
// every new page slides in from the right; `replace` swaps out the top N entries
// anim:false swaps the screen in place (camera -> scanning is the same camera view, so it shouldn't slide)
function push(name, args, {replace=0, anim=true}={}){
  const entry = {name, args};
  const el = build(entry);
  const prev = stack[stack.length-1];
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
  setFab();
}
function pop(n=1){
  if (stack.length <= 1) return;
  n = Math.min(n, stack.length-1);
  const gone = stack.splice(stack.length-n, n);
  const top = stack[stack.length-1];
  refresh(top);
  top.el.classList.remove('behind');
  const last = gone[gone.length-1];
  last.el.classList.add('from-right');
  gone.slice(0,-1).forEach(g => g.el.remove());
  setTimeout(() => last.el.remove(), 380);
  setFab();
}
function refresh(entry = stack[stack.length-1]){
  if (!entry) return;
  const def = SCREENS[entry.name];
  if (def.static) return;
  const y = entry.el.scrollTop;
  entry.el.innerHTML = def.render(entry.args || {});
  def.mount && def.mount(entry.el, entry.args || {});
  entry.el.scrollTop = y;
  if (entry === stack[stack.length-1]) setFab();
}
const refreshAll = () => stack.forEach(refresh);

/* ================= toast ================= */
const toastEl = document.getElementById('toast'); let tt;
function toast(msg){ toastEl.textContent = msg; toastEl.classList.add('on'); clearTimeout(tt); tt = setTimeout(()=>toastEl.classList.remove('on'), 1800); }

/* ================= screens ================= */
const restartBtn = `<button class="restart" data-act="restart">${RESTART_SVG}Start over</button>`;
const header = (title='', right='') => `<header class="hdr"><div class="row">
  <button class="backbtn" data-act="back" aria-label="Back">${img(IC.back,12,21)}Back</button>${title?`<h1>${title}</h1>`:''}
  <div class="end">${right}${restartBtn}</div></div></header>`;

// Attract loop — stands in for the app home. The shimmering camera button is the entry point, as on the phone.
SCREENS.home = { cls:'attract', render:() => {
  const L = S.lists[0], n = L ? L.items.length : 0;
  return `${img(IC.bgPattern1,1209,1110,'hpat p1')}${img(IC.bgPattern2,1209,1110,'hpat p2')}
  <div class="brand"><span class="heart">♥</span>CVS<small>pharmacy</small></div>
  <div class="copy">
    <p class="eyebrow">Scan &amp; Explain</p>
    <h2>Not sure what something is for? Hold it up. We’ll explain it.</h2>
    <p class="lede">Scan any product label to see what it does, how to use it, and what else completes your routine.</p>
    <button class="start shine" data-act="scan">${img(IC.camera,44,44)}<span>Tap to scan a product</span></button>
  </div>
  <div class="steps3">
    <div><b><i>1</i>Scan</b><span>Hold the label up to the camera</span></div>
    <div><b><i>2</i>Understand</b><span>Plain-language overview, directions &amp; warnings</span></div>
    <div><b><i>3</i>Shop</b><span>Build a list with aisle locations</span></div>
  </div>
  <div class="side">
    <div class="preview"><div class="shelf"></div><div class="corners"><i></i><i></i><i></i><i></i></div><div class="scanline"></div>
      <div class="label-glass"><small>CVS Label</small><b style="font-size:32px;line-height:40px">CeraVe Moisturizing Cream</b></div></div>
    <button class="lists" ${L?`data-act="openlist" data-li="0"`:`data-act="toast" data-msg="Scan a product to start a list"`}>
      ${img(A+'cart.png',92,98)}<span><b>${L ? `${n} item${n===1?'':'s'} in ‘${esc(L.name)}’` : 'Shop your lists'}</b><span>${L ? 'Tap to see your list and aisles' : 'No lists yet — scan a product to start one'}</span></span>
      ${L ? img(IC.chevron,16,28,'go') : ''}</button>
  </div>`;
}};

const camBg = target => `<div class="cam-bg" style="background-position:${LABELS[target].bx}px ${LABELS[target].by}px"></div>`;
const scanArea = (target, extra='') => `<div class="scan-fill"><div class="scan-live" style="background-position:${LABELS[target].bx - VF.x}px ${LABELS[target].by - VF.y}px"></div>${extra}</div>
  <div class="label-glass"><small>${LABELS[target].scan}</small><b>${LABELS[target].title}</b><span>${LABELS[target].meta}</span></div>
  <div class="corners scan-border"><i></i><i></i><i></i><i></i></div>`;
const camHeader = (label) => `<header class="hdr"><div class="row"><button class="backbtn" data-act="back" aria-label="${label}">${img(IC.camBack,14,20)}${label}</button><div class="end">${restartBtn}</div></div></header>`;

SCREENS.camera = { cls:'cam-scr live', static:true, render:({target}) => `
  ${camBg(target)}
  ${camHeader('Back')}
  ${scanArea(target)}
  <div class="cam-side">
    <p class="cam-title">Scan &amp; Explain</p><p class="cam-sub">Point at the product label or bottle name</p>
    <ul class="tips"><li>Hold the item about 6 inches from the camera</li><li>Keep the front label facing you</li><li>Works with shelf tags, bottles, boxes and Rx labels</li></ul>
  </div>
  <button class="shutter" data-act="shoot" aria-label="Take photo"><span>${img(IC.shutter,42,42)}</span></button>
  <p class="shutter-hint">Tap to scan</p>
`};

SCREENS.scanning = { cls:'cam-scr', static:true, render:({target}) => `
  ${camBg(target)}
  ${camHeader('Cancel')}
  ${scanArea(target, '<div class="vf-sheen"></div>')}
  <div class="cam-side">
    <p class="cam-title">Scanning</p><p class="cam-sub">Please wait...</p>
    <div class="prog"><div class="bar"><i></i></div>
      ${['Reading label...','Identifying product...','Building care checklist...','Preparing explanation...'].map(s=>`<div class="step"><i>${img(IC.stepCheck,13,13)}</i><span>${s}</span></div>`).join('')}</div>
  </div>
  <button class="shutter" disabled aria-hidden="true" tabindex="-1"><span>${img(IC.shutter,42,42)}</span></button>
  <p class="shutter-hint">Hold still</p>
`, mount(el, {target}){
  const steps = el.querySelectorAll('.step'), bar = el.querySelector('.bar i');
  let k = 0;
  const step = () => {
    if (!el.isConnected) return;
    if (k > 0){ steps[k-1].classList.replace('active','done'); }
    if (k < steps.length){
      steps[k].classList.add('active');
      bar.style.width = ((k+1)/steps.length*100)+'%'; k++; setTimeout(step, 620);
    } else setTimeout(() => { if (el.isConnected && stack[stack.length-1].el === el) finishScan(target); }, 420);
  };
  setTimeout(step, 380);
}};

function finishScan(target){
  if (target === 'cerave'){
    S.tab = 'desc';
    push('product', {}, {replace:1});
  } else {
    S.compared = true; S.newRow = 'cetaphil'; S.tab = 'explore';
    if (!S.rows.includes('cetaphil')) S.rows.unshift('cetaphil');
    pop(1);
    const prod = stack[stack.length-1];
    setTimeout(() => {
      const t = prod.el.querySelector('.ctable');
      t && prod.el.scrollTo({top: Math.max(0, (t.getBoundingClientRect().top - prod.el.getBoundingClientRect().top) / scale + prod.el.scrollTop - 420), behavior:'smooth'});
      toast('Cetaphil added to your comparison');
    }, 400);
  }
}

SCREENS.product = { cls:'prod', fab:true, render:() => `
  <div class="ptop">
  ${header('', `<button class="addlist" data-act="add" data-pid="cerave">Add to a list ${img(IC.addList,20,22)}</button>`)}
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
  <div style="height:180px"></div>
`};

const descTab = () => `
  <div class="col">
    <div class="block"><div class="acc h"><span>Overview</span></div>
      <div class="card desc-card"><h4>What is this?</h4><p>A rich, non-greasy moisturizer with three essential ceramides and hyaluronic acid. It restores the skin’s protective barrier and keeps skin hydrated for 24 hours.</p></div>
      <div class="card usedfor"><h4>Used for</h4><div class="tags">
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
  <div class="col"><div class="block">
    <div class="acc h"><span>Complete Your Routine</span><span class="cnt"><b>${covered()} of 5</b> items covered</span></div>
    <div class="routine">${ROUTINE.map(r => `<div class="ritem ${has(r)?'have':''}"><span class="st"><i>${has(r)?img(IC.routineCheck,18,18):''}</i></span>
      <span class="tx"><b>${r.t}</b><small>${r.s}</small></span>
      ${has(r) ? `<span class="have-it ${S.lastAdded===r.id?'pop':''}">Have it</span>`
               : `<button class="listbtn" data-act="${r.booking?'book':'add'}" data-pid="${r.product||''}" data-rid="${r.id}" aria-label="Add ${r.t} to a list">List</button>`}</div>`).join('')}</div>
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

SCREENS.doc = { render:({doc}) => `${header(doc)}
  <div class="doc"><div><p class="t">CeraVe Moisturizing Cream for Normal to Dry Skin, 16 OZ</p><p class="m">1.17 lbs. item #418620</p></div>${DOCS[doc]}
    <div class="doc-switch">${Object.keys(DOCS).map(d=>`<button class="${d===doc?'on':''}" data-act="swapdoc" data-doc="${d}">${d}</button>`).join('')}</div></div>`};

SCREENS.list = { cls:'list', render:({li}) => {
  const L = S.lists[li]; if (!L) return header('List');
  const match = it => !S.filter || PRODUCTS[it.pid].full.toLowerCase().includes(S.filter.toLowerCase());
  const todo = L.items.filter(i=>!i.got && match(i)), got = L.items.filter(i=>i.got && match(i));
  const item = it => { const P = PRODUCTS[it.pid]; return `<div class="sli">
    <span class="img">${img(P.img,150,96)}</span>
    <span class="nm"><b>${P.full}</b><span>${P.aisle} · ${P.price} /ea.</span></span>
    <span class="btns">
      <button class="circle blue" data-act="toast" data-msg="Added to cart" aria-label="Add to cart">${img(IC.listShop,26,26)}</button>
      <span class="qty"><button class="circle" data-act="qty" data-d="-1" data-pid="${it.pid}" aria-label="Decrease">${img(IC.listMinus,26,26)}</button>
        <span class="pill">Qty ${it.qty}</span>
        <button class="circle" data-act="qty" data-d="1" data-pid="${it.pid}" aria-label="Increase">${img(IC.listPlus,26,26)}</button></span>
      <button class="circle" data-act="del" data-pid="${it.pid}" aria-label="Remove">${img(IC.listDelete,26,26)}</button>
    </span>
    <button class="box" data-act="got" data-pid="${it.pid}" role="checkbox" aria-checked="false" aria-label="Put ${P.full} in basket"></button>
  </div>`; };
  const gotItem = it => { const P = PRODUCTS[it.pid]; return `<div class="it">
    <span class="img" style="width:150px;height:96px">${img(P.img,150,96)}</span><span class="nm"><b>${P.full}</b></span>
    <span class="dash">Qty ${it.qty}</span>
    <button data-act="got" data-pid="${it.pid}" role="checkbox" aria-checked="true" aria-label="Take ${P.full} out of basket">${img(IC.checkboxOn,48,48)}</button></div>`; };
  const left = L.items.filter(i => !i.got);
  const aisles = [...new Set(left.map(i => PRODUCTS[i.pid].aisle))].sort();
  const total = L.items.reduce((t,i) => t + PRODUCTS[i.pid].cents * i.qty, 0);
  return `<header class="hdr"><div class="row"><button class="backbtn" data-act="back" aria-label="Back">${img(IC.back,12,21)}Back</button><h1>Added to ${esc(L.name)}</h1>
      <div class="end"><button class="shopsearch" data-act="search">${img(IC.search,28,28)}<span class="q ${S.filter?'has':''}">${S.filter ? esc(S.filter) : 'Find products in this list'}</span>${img(IC.barcode,28,28)}</button>${restartBtn}</div></div></header>
    <div class="lgrid"><div>
    ${todo.length ? `<div class="items">${todo.map(item).join('')}</div>` : `<div class="empty">${S.filter ? 'No items match your search.' : got.length ? 'Everything’s in your basket.' : 'This list is empty.<br>Add care items from a scan.'}</div>`}
    ${got.length ? `<div class="basket ${S.basketOpen?'':'closed'}"><div class="bh"><button class="tog" data-act="basket">${img(IC.basketChevron,36,24)}In basket (${got.length})</button><button class="rm" data-act="rmall">Remove all</button></div>
      ${S.basketOpen ? got.map(gotItem).join('') : ''}</div>` : ''}
    </div>
    <aside class="lside">
      <div class="card"><h3>Find it in store</h3>
        ${aisles.length ? `<ul class="route">${aisles.map(a => `<li><i>${a}</i><span>${left.filter(i=>PRODUCTS[i.pid].aisle===a).map(i=>PRODUCTS[i.pid].full).join(', ')}</span></li>`).join('')}</ul>` : '<p class="take"><span style="font-size:20px;color:var(--text-secondary);margin-top:12px">Nothing left to pick up.</span></p>'}
        <div class="total"><span>Estimated total</span><b>$${(total/100).toFixed(2)}</b></div></div>
      <div class="card take"><div class="qr">${qrSvg(L.name + L.items.length)}</div>
        <div><h3>Take this list with you</h3><p>Scan with your phone camera to open it in the CVS app.</p></div></div>
    </aside></div>`;
}};

// Decorative QR-style code for the prototype — not a real, scannable code
function qrSvg(seed){
  let h = 0; for (const c of seed) h = (h*31 + c.charCodeAt(0)) >>> 0;
  const n = 25, cells = [], finder = (x,y) => (x<8&&y<8) || (x>=n-8&&y<8) || (x<8&&y>=n-8);
  for (let y=0;y<n;y++) for (let x=0;x<n;x++){ if (finder(x,y)) continue; h = (h*1103515245 + 12345) >>> 0; if ((h>>>16)&1) cells.push(`<rect x="${x}" y="${y}" width="1" height="1"/>`); }
  const eye = (x,y) => `<rect x="${x}" y="${y}" width="7" height="7"/><rect x="${x+1}" y="${y+1}" width="5" height="5" fill="#fff"/><rect x="${x+2}" y="${y+2}" width="3" height="3"/>`;
  return `<svg viewBox="-2 -2 ${n+4} ${n+4}" shape-rendering="crispEdges"><rect x="-2" y="-2" width="${n+4}" height="${n+4}" fill="#fff"/><g fill="#111">${cells.join('')}${eye(0,0)}${eye(n-7,0)}${eye(0,n-7)}</g></svg>`;
}

/* ================= sheets (Overlay / Bottom sheet, Add To List Overlay) ================= */
const scrim = document.getElementById('scrim'), sheet = document.getElementById('sheet');
let sheetCtx = null;
function openSheet(html, ctx){
  sheetCtx = ctx; sheet.innerHTML = html; sheet.style.transform = '';
  scrim.classList.add('on'); sheet.classList.add('on');
}
function closeSheet(){
  scrim.classList.remove('on'); sheet.classList.remove('on'); sheet.style.transform = '';
  sheetCtx = null;
  clearInterval(idleTick);
  refresh();
}
scrim.addEventListener('click', () => { if (sheetCtx && sheetCtx.idle) return; closeSheet(); });
const head = t => `<div class="head" data-grab><i></i><h3 id="sheetTitle">${t}</h3></div>`;
const adding = P => `<div class="adding"><span class="img">${img(P.img,160,160)}</span><div class="d"><b>${P.brand}</b><b>${P.name}</b><div class="price"><b>${P.price}</b><span>$/ea.</span></div></div></div>`;
const createBtn = `<button class="cta create" data-act="create"><i class="plus"></i>Create a list</button>`;

// On-screen keyboard: kiosks have no physical keyboard, and the system one can't be relied on
const ROWS = ['QWERTYUIOP','ASDFGHJKL','ZXCVBNM'];
const DEL_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 5H8l-6 7 6 7h13z"/><path d="M17 9l-6 6M11 9l6 6"/></svg>';
const keyboard = (done='Done') => `<div class="kb">${ROWS.map((r,i)=>`<div class="kr">${[...r].map(k=>`<button data-key="${k}">${k}</button>`).join('')}${i===2?`<button class="w" data-key="back" aria-label="Delete">${DEL_SVG}</button>`:''}</div>`).join('')}
  <div class="kr"><button class="space" data-key=" ">space</button><button class="w" data-key="enter">${done}</button></div></div>`;
const fieldHtml = (v, ph) => `${v ? esc(v) : ''}<i class="caret"></i>${v ? '' : `<span class="ph">${ph}</span>`}`;
function typeInto(k){
  const f = sheet.querySelector('[data-name]'); if (!f) return;
  let v = f.dataset.v || '';
  if (k === 'back') v = v.slice(0,-1);
  else if (k === 'enter') return sheet.querySelector('[data-act="create"],[data-act="dosearch"]').click();
  else if (k === ' ') v = v && !v.endsWith(' ') ? v + ' ' : v;
  else v += (!v || v.endsWith(' ')) ? k : k.toLowerCase();
  v = v.slice(0, 40);
  f.dataset.v = v; f.innerHTML = fieldHtml(v, f.dataset.ph);
}

function sheetAdd(pid, rid, creating=false){
  const P = PRODUCTS[pid], noLists = !S.lists.length, naming = noLists || creating;
  openSheet(`${head('Add to a list')}<div class="body">
    ${noLists ? '' : adding(P)}
    ${naming ? `<div class="field" data-name data-v="" data-ph="Enter the list name">${fieldHtml('', 'Enter the list name')}</div>
      <div class="suggest">${['Things to Get Today','Skin Care','Weekly Essentials'].map(s=>`<button data-act="suggest" data-s="${s}">${s}</button>`).join('')}</div>
      ${keyboard()}` : ''}
    ${!creating ? S.lists.map((L,i)=>`<button class="listfield" data-act="pick" data-li="${i}"><b>${esc(L.name)}</b>
      <span class="th">${L.items.length ? L.items.map(it=>img(PRODUCTS[it.pid].img,120,80)).join('') : '<small>No items yet</small>'}</span></button>`).join('') : ''}
    ${createBtn}</div>`, {pid, rid});
}
function addTo(li){
  const {pid, rid} = sheetCtx, L = S.lists[li];
  S.lastList = li;
  const ex = L.items.find(i => i.pid === pid);
  if (ex) ex.qty++; else L.items.push({pid, qty:1, got:false});
  S.lastAdded = rid || null;
  const n = L.items.length, P = PRODUCTS[pid];
  openSheet(`${head('Added to ' + esc(L.name))}<div class="body">${adding(P)}
    <button class="cta view" data-act="view" data-li="${li}">View list(${n} item${n>1?'s':''})</button>
    <button class="cta again" data-act="create">Create a list</button></div>`, {pid, rid});
  refreshAll();
}
function sheetSearch(li){
  openSheet(`${head('Find in this list')}<div class="body">
    <div class="field" data-name data-v="${esc(S.filter)}" data-ph="Type a product name">${fieldHtml(S.filter, 'Type a product name')}</div>
    ${keyboard('Search')}
    <button class="cta view" data-act="dosearch">Search</button>
    ${S.filter ? '<button class="cta again" data-act="clearsearch">Clear search</button>' : ''}</div>`, {search:li});
}
let idleTick;
function sheetIdle(){
  let left = IDLE_COUNTDOWN;
  openSheet(`${head('Still there?')}<div class="idle"><div class="ring" id="idleN">${left}</div>
    <p>For your privacy, this screen will reset for the next shopper.</p>
    <button class="cta view" data-act="stillhere">I’m still here</button>
    <button class="cta again" data-act="restart">Start over</button></div>`, {idle:true});
  clearInterval(idleTick);
  idleTick = setInterval(() => {
    left--; const n = document.getElementById('idleN'); if (n) n.textContent = left;
    if (left <= 0){ clearInterval(idleTick); start(); }
  }, 1000);
}

sheet.addEventListener('click', e => {
  const key = e.target.closest('[data-key]'); if (key){ typeInto(key.dataset.key); return; }
  const b = e.target.closest('[data-act]'); if (!b) return;
  const a = b.dataset.act;
  if (a === 'pick') addTo(+b.dataset.li);
  else if (a === 'suggest'){ const f = sheet.querySelector('[data-name]'); f.dataset.v = b.dataset.s; f.innerHTML = fieldHtml(b.dataset.s, f.dataset.ph); }
  else if (a === 'create'){
    const f = sheet.querySelector('[data-name]');
    if (!f){ sheetAdd(sheetCtx.pid, sheetCtx.rid, true); return; }
    const name = (f.dataset.v || '').trim();
    if (!name){ f.dataset.ph = 'Give your list a name'; f.innerHTML = fieldHtml('', f.dataset.ph); f.animate([{transform:'translateX(-9px)'},{transform:'translateX(9px)'},{transform:'none'}],{duration:240}); return; }
    S.lists.push({name, items:[]});
    addTo(S.lists.length-1);
  }
  else if (a === 'view'){ const li = +b.dataset.li; closeSheet(); S.filter = ''; push('list', {li}); }
  else if (a === 'dosearch'){ S.filter = (sheet.querySelector('[data-name]').dataset.v || '').trim(); closeSheet(); }
  else if (a === 'clearsearch'){ S.filter = ''; closeSheet(); }
  else if (a === 'stillhere') closeSheet();
  else if (a === 'restart') start();
});
// physical keyboard still works when demoing on a laptop
document.addEventListener('keydown', e => {
  if (sheet.classList.contains('on') && sheet.querySelector('[data-name]')){
    if (e.key === 'Backspace') typeInto('back');
    else if (e.key === 'Enter') typeInto('enter');
    else if (e.key === ' ') typeInto(' ');
    else if (/^[a-z0-9]$/i.test(e.key)) typeInto(e.key.toUpperCase());
    else if (e.key === 'Escape') closeSheet();
    e.preventDefault(); return;
  }
  if (e.key === 'Escape'){ if (sheet.classList.contains('on')) closeSheet(); else pop(); }
});
// drag the sheet's grabber down to dismiss it
let drag = null;
sheet.addEventListener('pointerdown', e => {
  if (!e.target.closest('[data-grab]') || (sheetCtx && sheetCtx.idle)) return;
  drag = {y:e.clientY, dy:0}; sheet.setPointerCapture(e.pointerId); sheet.style.transition = 'none';
});
sheet.addEventListener('pointermove', e => { if (!drag) return; drag.dy = Math.max(0, (e.clientY - drag.y)/scale); sheet.style.transform = `translateY(${drag.dy}px)`; });
sheet.addEventListener('pointerup', () => { if (!drag) return; sheet.style.transition = ''; const close = drag.dy > 120; drag = null; if (close) closeSheet(); else sheet.style.transform = ''; });

/* ================= actions ================= */
stackEl.addEventListener('click', e => {
  const b = e.target.closest('[data-act]'); if (!b) return;
  const a = b.dataset.act, top = stack[stack.length-1];
  switch (a){
    case 'back': pop(); break;
    case 'restart': start(); break;
    case 'scan': push('camera', {target:'cerave'}); break;
    case 'scan2': push('camera', {target:'cetaphil'}); break;
    case 'shoot': {
      b.disabled = true;
      const f = document.createElement('div'); f.className = 'flash'; top.el.appendChild(f);
      setTimeout(() => push('scanning', {target:top.args.target}, {replace:1, anim:false}), 200);
      break; }
    case 'tab': {
      // re-render, then slide the thumb from the old tab to the new one
      const was = S.tab; S.tab = b.dataset.tab; refresh();
      const t = top.el.querySelector('.tabs');
      t.classList.toggle('right', was === 'explore'); t.getBoundingClientRect();
      t.classList.toggle('right', S.tab === 'explore');
      break; }
    case 'doc': push('doc', {doc:b.dataset.doc}); break;
    case 'swapdoc': push('doc', {doc:b.dataset.doc}, {replace:1}); break;
    case 'add': sheetAdd(b.dataset.pid, b.dataset.rid); break;
    case 'book': S.booked = true; S.lastAdded = b.dataset.rid; refresh(); toast('MinuteClinic visit booked'); break;
    case 'compare':
      S.compared = true;
      if (!S.rows.includes('cvs')){ S.rows.push('cvs'); S.newRow = 'cvs'; refresh(); toast('Showing pharmacist-selected alternatives'); }
      else toast('You’re seeing every alternative');
      break;
    case 'openlist': S.filter = ''; push('list', {li:+b.dataset.li}); break;
    case 'search': sheetSearch(top.args.li); break;
    case 'toast': toast(b.dataset.msg); break;
    case 'qty': case 'del': case 'got': {
      const L = S.lists[top.args.li], it = L.items.find(i => i.pid === b.dataset.pid);
      if (a === 'qty') it.qty = Math.max(1, it.qty + +b.dataset.d);
      else if (a === 'del'){ L.items.splice(L.items.indexOf(it), 1); toast('Removed from list'); }
      else it.got = !it.got;
      refreshAll(); break; }
    case 'basket': S.basketOpen = !S.basketOpen; refresh(); break;
    case 'rmall': { const L = S.lists[top.args.li]; L.items = L.items.filter(i => !i.got); refreshAll(); toast('Basket cleared'); break; }
  }
});

function esc(s){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

/* ================= idle reset ================= */
let idleTimer;
function armIdle(){
  clearTimeout(idleTimer);
  if (stack.length <= 1 && !S.lists.length) return;   // already on the attract screen with nothing to clear
  if (sheetCtx && sheetCtx.idle) return;
  idleTimer = setTimeout(sheetIdle, IDLE_MS);
}
addEventListener('pointerdown', armIdle, {passive:true});
addEventListener('keydown', armIdle);

/* ================= fit 1920×1080 stage to the display ================= */
let scale = 1;
function layout(){
  scale = Math.min(innerWidth/1920, innerHeight/1080);
  document.documentElement.style.setProperty('--scale', scale);
}
addEventListener('resize', layout); layout();

/* ================= boot ================= */
function start(){
  scrim.classList.remove('on'); sheet.classList.remove('on'); sheetCtx = null; clearInterval(idleTick); clearTimeout(idleTimer);
  S = fresh(); stack.forEach(s => s.el.remove()); stack = [];
  push('home');
}
(document.fonts ? document.fonts.load('16px Inter') : Promise.resolve()).finally(start);
})();
