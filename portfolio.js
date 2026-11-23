
/* modest devices get the same site with the heaviest per-frame effects eased off */
(function(){var n=navigator,m=n.deviceMemory||8,c=n.hardwareConcurrency||8,s=n.connection&&n.connection.saveData;
if(m<=2||c<=2||s)document.documentElement.classList.add('lite');})();


(() => {
  const M = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const tick = () => { const d = new Date(new Date().toLocaleString('en-US',{timeZone:'Asia/Dubai'})), h = d.getHours();
    document.querySelectorAll('[data-ftime]').forEach(e => e.textContent = `${h % 12 || 12}:${String(d.getMinutes()).padStart(2, '0')}${h < 12 ? 'am' : 'pm'}`);
    document.querySelectorAll('[data-fyear]').forEach(e => e.textContent = d.getFullYear()); };
  tick(); setInterval(tick, 20000);
  // size the footer name so it spans the full width with only a sliver of margin
  const fit = () => document.querySelectorAll('.sf').forEach(f => {
    const w = f.querySelector('.sf__word'); if (!w) return;
    const span = [...w.children].find(s => getComputedStyle(s).display !== 'none'); if (!span) return;
    w.style.setProperty('--wf', '100px');
    const k = (f.clientWidth * .955) / span.getBoundingClientRect().width;
    f.style.setProperty('--wf', (100 * k).toFixed(2) + 'px'); w.style.removeProperty('--wf');
  });
  fit(); addEventListener('resize', fit); document.fonts?.ready.then(fit);
  // the footer's rounded corners show whatever sits directly above it: find that section's colour and paint it behind them
  const sfw = document.querySelector('.sfw');
  const above = () => {
    if (!sfw) return;
    const solid = e => { const c = getComputedStyle(e).backgroundColor; const m = c.match(/[\d.]+/g); return m && !(m.length > 3 && +m[3] < .05) ? c : ''; };
    let col = '', e = sfw.previousElementSibling;
    while (e){ if (e.getBoundingClientRect().width >= innerWidth * .9){ const c = solid(e); if (c) col = c; } e = e.lastElementChild; }
    const bg = col || solid(document.body) || getComputedStyle(document.documentElement).backgroundColor;
    sfw.style.setProperty('--above', bg);
    // a dark section above: a hairline keeps the footer reading as its own section
    const m = (bg.match(/[\d.]+/g) || [255, 255, 255]).map(Number);
    sfw.classList.toggle('sfw--dark', (.2126 * m[0] + .7152 * m[1] + .0722 * m[2]) / 255 < .25);
  };
  above(); addEventListener('load', above); addEventListener('resize', above);
  new MutationObserver(above).observe(document.documentElement, { attributes: true, attributeFilter: ['data-mode'] });
  // floating back-to-top: appears after the first screen, shows scroll progress, flips colour over dark backgrounds
  const tt = document.querySelector('.totop');
  if (tt) {
    const c = tt.querySelector('.ring circle'); tt.style.setProperty('--len', (2 * Math.PI * 24).toFixed(2));
    const lum = el => { for (let e = el; e && e !== document.documentElement; e = e.parentElement) {
        const m = getComputedStyle(e).backgroundColor.match(/[\d.]+/g); if (!m) continue;
        if (m.length > 3 && +m[3] < .5) continue; return (.2126 * m[0] + .7152 * m[1] + .0722 * m[2]) / 255; }
      const m = getComputedStyle(document.body).backgroundColor.match(/[\d.]+/g) || [255,255,255];
      return (m.length > 3 && +m[3] < .5) ? (document.documentElement.dataset.mode === 'dark' ? 0 : 1) : (.2126 * m[0] + .7152 * m[1] + .0722 * m[2]) / 255; };
    let raf = 0;
    const upd = () => { raf = 0;
      const max = document.documentElement.scrollHeight - innerHeight, y = scrollY;
      const bot = document.querySelector('.sf__bot');  // the footer has its own 'Back to top', so step aside once it's on screen
      tt.classList.toggle('show', y > innerHeight * .9 && !(bot && bot.getBoundingClientRect().top < innerHeight - 8));
      tt.style.setProperty('--p', max > 0 ? Math.min(1, y / max).toFixed(4) : 0);
      const r = tt.getBoundingClientRect();
      tt.style.pointerEvents = 'none';
      const under = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      tt.style.pointerEvents = '';
      if (under) tt.dataset.on = lum(under) < .45 ? 'dark' : 'light'; };
    const q = () => { if (!raf) raf = requestAnimationFrame(upd); };
    addEventListener('scroll', q, { passive: true }); addEventListener('resize', q);
    new MutationObserver(q).observe(document.documentElement, { attributes: true, attributeFilter: ['data-mode', 'class'] });
    upd();
  }
})();


// press F for full screen (again, or Esc, to leave); ignored while typing
(() => {
  const typing = e => { const t = e.target; return t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)); };
  const toggle = () => {
    const d = document, el = d.documentElement;
    if (d.fullscreenElement || d.webkitFullscreenElement) (d.exitFullscreen || d.webkitExitFullscreen).call(d);
    else (el.requestFullscreen || el.webkitRequestFullscreen)?.call(el)?.catch?.(() => {});
  };
  addEventListener('keydown', e => {
    if ((e.key !== 'f' && e.key !== 'F') || e.metaKey || e.ctrlKey || e.altKey || typing(e)) return;
    e.preventDefault();
    if (window.top !== window) { try { parent.postMessage({ wall: 'fullscreen' }, location.origin === 'null' ? '*' : location.origin); } catch (_) {} return; }
    toggle();
  });
  if (window.top === window) addEventListener('message', e => {
    // only one of this page's own frames can ask for full screen
    if (!e.data || e.data.wall !== 'fullscreen' || ![...document.querySelectorAll('iframe')].some(f => f.contentWindow === e.source)) return;
    toggle();
  });
})();


const COLOUR_SRC = "abdullo-imomov.svg?v=soft-room";   // revealed under the cursor
const $ = (s, r = document) => r.querySelector(s);
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const canHover = matchMedia('(hover: hover) and (pointer: fine)').matches;
const root = document.documentElement;

/* ---------- adaptive grid scale-up above 1920px ---------- */
function applyAdaptiveGrid(){
  const FONT_BASE = 16, baseWidth = 1920, coef = 0.6666;
  const w = window.innerWidth;
  const widthReduction = ((baseWidth - w) / baseWidth) * 100;
  const size = FONT_BASE - (FONT_BASE * (widthReduction * coef)) / 100;
  if (size > FONT_BASE) root.style.fontSize = size + 'px';
  else root.style.removeProperty('font-size');
}
applyAdaptiveGrid(); addEventListener('resize', applyAdaptiveGrid);

/* ---------- scroll lock (Lenis attached once loaded) ---------- */
let lenis = null, scrollEnabled = true, locks = 0;
// touch state shared by the pinned sections: never snap while a finger is down or a flick is still coasting
window.__touching = false;
addEventListener('touchstart', () => { window.__touching = true; }, { passive: true, capture: true });
addEventListener('touchend', () => { window.__touching = false; }, { passive: true, capture: true });
addEventListener('touchcancel', () => { window.__touching = false; }, { passive: true, capture: true });
const COARSE = matchMedia('(pointer: coarse)').matches;
window.__snapTo = top => { if (!COARSE && window.__lenis) window.__lenis.scrollTo(top, { duration: .6, easing: x => 1 - Math.pow(1 - x, 3) }); else scrollTo({ top, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); };
function stopScroll(){ locks++; scrollEnabled = false; lenis?.stop(); Object.assign(root.style, { position:'relative', overflow:'hidden', height:'100%' }); }
function startScroll(){ locks = Math.max(0, locks - 1); if (locks) return; scrollEnabled = true; lenis?.start(); root.style.removeProperty('position'); root.style.removeProperty('overflow'); root.style.removeProperty('height'); }
function scrollToId(id){
  const el = document.getElementById(id); if (!el) return;
  if (history.state?.wall !== 1) history.replaceState(history.state, '', id === 'home' ? location.pathname : '#' + id);
  scrollEnabled = false;
  setTimeout(() => {
    const top = el.getBoundingClientRect().top + window.pageYOffset;
    if (lenis) lenis.scrollTo(top); else window.scrollTo({ top, behavior:'smooth' });
    setTimeout(() => { scrollEnabled = true; }, 100);
  }, 50);
}
window.scrollTo(0, 0);

/* ---------- spring helper (mass 1, semi-implicit Euler) ---------- */
function spring({ tension, friction }, render){
  let x = 0, v = 0, target = 0, raf = 0;
  const step = () => {
    const dt = 1 / 60, a = tension * (target - x) - friction * v;
    v += a * dt; x += v * dt; render(x);
    if (Math.abs(target - x) < 0.001 && Math.abs(v) < 0.001){ x = target; v = 0; render(x); raf = 0; return; }
    raf = requestAnimationFrame(step);
  };
  render(0);
  return { set(t){ target = t; if (!raf) raf = requestAnimationFrame(step); } };
}
// declarative hovers: data-h="s 1 1.04|y 0 -2|o .8 1"  data-hs="tension friction"  data-ht="closest trigger"
function bindHovers(scope = document){
  scope.querySelectorAll('[data-h]').forEach(el => {
    if (el._h) return; el._h = 1;
    const props = el.dataset.h.split('|').map(p => { const [k, a, b] = p.trim().split(/\s+/); return { k, a:+a, b:+b }; });
    const [tension, friction] = (el.dataset.hs || '320 18').split(/\s+/).map(Number);
    const trig = el.dataset.ht ? el.closest(el.dataset.ht) || el : el;
    const render = p => {
      const v = { s:1, x:0, y:0, r:0 };
      let o = null;
      props.forEach(({ k, a, b }) => { const val = a + (b - a) * p; if (k === 'o') o = val; else v[k] = val; });
      el.style.transform = `translate(${v.x}px,${v.y}px) rotate(${v.r}deg) scale(${v.s})`;
      if (o !== null) el.style.opacity = o;
    };
    const s = spring({ tension, friction }, render);
    if (!canHover) return;
    trig.addEventListener('mouseenter', () => s.set(1));
    trig.addEventListener('mouseleave', () => s.set(0));
    trig.addEventListener('focusin', () => s.set(1));
    trig.addEventListener('focusout', () => s.set(0));
  });
}



/* ---------- sticky header: gets a soft backing once the page scrolls ---------- */
{ const hdr = $('.hdr'); const upd = () => hdr.classList.toggle('stuck', scrollY > 24); addEventListener('scroll', upd, { passive: true }); upd(); }
/* ---------- live clock ---------- */
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
function tickClock(){
  const d = new Date(new Date().toLocaleString('en-US',{timeZone:'Asia/Dubai'})), h = d.getHours();
  const time = `${h % 12 || 12}:${String(d.getMinutes()).padStart(2,'0')}${h < 12 ? 'am' : 'pm'}`;
  const date = `${d.getDate()} ${MONTHS[d.getMonth()]}, ${d.getFullYear()}`;
  document.querySelectorAll('[data-time]').forEach(e => e.textContent = time);
  document.querySelectorAll('[data-date]').forEach(e => e.textContent = date);
  document.querySelectorAll('[data-dshort]').forEach(e => e.textContent = `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)}`);
  document.querySelectorAll('[data-navtime]').forEach(e => e.textContent = ' — ' + time);
}
tickClock(); setInterval(tickClock, 1000);

/* ---------- overlays ---------- */
const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
function openLayer(el, onKey){
  el.hidden = false; stopScroll();
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('open')));
  el._key = e => {
    if (e.key === 'Escape'){ onKey(); return; }
    // keep Tab inside the open layer: without this the keyboard walks onto the page behind it
    if (e.key !== 'Tab') return;
    const f = [...el.querySelectorAll(FOCUSABLE)].filter(n => n.offsetWidth || n.offsetHeight || n.getClientRects().length);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (!el.contains(document.activeElement)){ e.preventDefault(); first.focus(); return; }
    if (e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
  };
  addEventListener('keydown', el._key);
}
function closeLayer(el, after){
  if (el.hidden) return;
  el.classList.remove('open'); el.classList.add('closing');
  removeEventListener('keydown', el._key);
  setTimeout(() => { el.hidden = true; el.classList.remove('closing'); startScroll(); after?.(); }, 460);
}
// nav menu
const NAV = [["Home", "home"], ["Acadely", 0], ["HomeSense", 1], ["Founder Community", 2], ["Technical Skills", 3], ["RIT Dubai", 4], ["My story", "about"], ["Contact", null]];
const navm = $('#navm');
$('#navList').innerHTML = NAV.map(([l, id], i) =>
  `<li><button class="navm__item" style="--d:${i * 45 + 80}ms" data-i="${i}"><small>0${i + 1}</small><span>${l}</span></button></li>`).join('');
const openNav = () => { openLayer(navm, closeNav); setTimeout(() => $('#navClose').focus(), 60); };
const closeNav = (after) => closeLayer(navm, typeof after === 'function' ? after : () => $('#menuBtn').focus());
$('#menuBtn').addEventListener('click', openNav);
$('#navClose').addEventListener('click', closeNav);
$('#navList').addEventListener('click', e => {
  const b = e.target.closest('.navm__item'); if (!b) return;
  const id = NAV[+b.dataset.i][1];
  closeNav(() => typeof id === 'number' ? window.openDoor?.(id) : id ? scrollToId(id) : openModal());
});
$('#navStart').addEventListener('click', () => closeNav(() => openModal()));
// request modal
const CONTACT_EMAIL = 'imomovabdullo009@gmail.com';   // where project requests go (assembled here so address-harvesting bots don't find it in the page)
document.querySelectorAll('[data-mail]').forEach(a => { a.href = 'mailto:' + CONTACT_EMAIL; a.textContent = CONTACT_EMAIL; });
const modal = $('#modal'), form = $('#reqForm');
let lastFocus = null;
function openModal(){ lastFocus = document.activeElement; openLayer(modal, closeModal); setTimeout(() => qzFocus(), 120); }
let lastInput = 'mouse';
addEventListener('pointerdown', () => { lastInput = 'mouse'; }, true);
addEventListener('keydown', e => { if (e.key === 'Tab' || e.key === 'Enter' || e.key === ' ' || e.key.startsWith('Arrow')) lastInput = 'key'; }, true);
function closeModal(){
  closeLayer(modal, () => {
    // give focus back only to keyboard users, so a mouse click doesn't leave the nav item looking hovered
    if (lastInput === 'key') lastFocus?.focus?.({ preventScroll:true }); else document.activeElement?.blur?.();
    setTimeout(() => { form.reset(); setCur(CUR0); qzGo(1); $('#mForm').hidden = false; $('#mSuccess').hidden = true;  }, 300);
  });
}
modal.addEventListener('click', closeModal);
$('#mPanel').addEventListener('click', e => e.stopPropagation());
$('#mClose').addEventListener('click', closeModal);
$('#mDone').addEventListener('click', closeModal);
const SEND_LABEL = 'Write the email';

// ── the questionnaire: one question at a time; only paid projects at or above the minimum get through ──
const STEPS = 5;
const BUDGETS = {
  USD: ['$500', 'Under $500', '$500 – $1,500', '$1,500 – $5,000', '$5,000 or more'],
  GBP: ['£400', 'Under £400', '£400 – £1,200', '£1,200 – £4,000', '£4,000 or more'],
  INR: ['₹45,000', 'Under ₹45,000', '₹45,000 – ₹1.25 lakh', '₹1.25 – ₹4 lakh', '₹4 lakh or more'],
};
const CUR0 = (() => { try { const z = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  return /Calcutta|Kolkata/.test(z) ? 'INR' : /^Europe\/(London|Belfast|Guernsey|Jersey|Isle_of_Man)/.test(z) ? 'GBP' : 'USD'; } catch (e) { return 'USD'; } })();
let step = 1;
const qzSteps = [...form.querySelectorAll('.qz')];
const qzFocus = () => { const s = qzSteps[step - 1]; (s.querySelector('.qc input:checked') || s.querySelector('.qc input') || s.querySelector('input'))?.focus({ preventScroll: true }); };
function setCur(c){
  const b = BUDGETS[c] || BUDGETS.USD;
  form.querySelector(`input[name=currency][value=${c}]`).checked = true;
  form.querySelectorAll('[data-b]').forEach(s => { s.textContent = +s.dataset.b === 0 ? 'No budget or unsure' : b[+s.dataset.b + 1]; });

}
function qzGo(n, focus){
  step = n; $('#qzErr').textContent = '';
  qzSteps.forEach((s, i) => { s.hidden = i !== n - 1; });
  $('#qzStep').textContent = `${n} of ${STEPS}`;
  $('#qzBar').style.width = (n / STEPS * 100) + '%';
  $('#mBack').hidden = n === 1;
  $('#mSendLbl').textContent = n === STEPS ? SEND_LABEL : 'Next';
  if (focus) qzFocus();
}
// returns true if this step's answer lets them carry on
function qzCheck(){
  const d = new FormData(form);
  if (step === 1){
    if (!d.get('service')) return $('#qzErr').textContent = 'Pick the option closest to what you need.', false;
  }
  if (step === 2){
    if (!d.get('budget')) return $('#qzErr').textContent = 'Choose a budget range.', false;
  }
  if (step === 3 && !d.get('timeline')) return $('#qzErr').textContent = 'Choose when you’d like to start.', false;
  if (step === 4 && !d.get('client_type')) return $('#qzErr').textContent = 'Choose who the project is for.', false;
  if (step === 5){
    for (const el of qzSteps[4].querySelectorAll('input,textarea')){
      if (!el.checkValidity()){
        $('#qzErr').textContent = el.id === 'f-project' ? 'Add a short message.'
          : el.id === 'f-phone' ? 'Add a phone number with its country code.' : el.id === 'f-email' ? 'Check your email address.' : 'Fill in your name.';
        el.focus(); return false;
      }
    }
  }
  return true;
}
setCur(CUR0); qzGo(1);
form.querySelectorAll('input[name=currency]').forEach(r => r.addEventListener('change', () => setCur(r.value)));
// a choice moves straight on to the next question
form.addEventListener('change', e => {
  const n = e.target.name;
  if (!['service', 'budget', 'timeline', 'client_type'].includes(n)) return;
  if (lastInput !== 'mouse') return;   // arrow keys move between choices; keyboard users go on with Enter
  const current = step;
  setTimeout(() => { if (step === current && !modal.hidden && qzCheck()) qzGo(current + 1, true); }, 180);
});
form.addEventListener('input', () => { $('#qzErr').textContent = ''; });
$('#mBack').addEventListener('click', () => qzGo(Math.max(1, step - 1), true));


form.addEventListener('submit', e => {
  e.preventDefault();
  if (!qzCheck()) return;
  if (step < STEPS){ qzGo(step + 1, true); return; }
  const data = new FormData(form);
  const get = key => String(data.get(key) || '').trim();
  const budget = get('budget') === 'under' ? 'Not specified' : BUDGETS[get('currency')][+get('budget') + 1];
  const subject = get('service') + ' · ' + get('name');
  const body = `Hi Abdullo,\n\n${get('project')}\n\nTopic: ${get('service')}\nBudget: ${budget}\nStart: ${get('timeline')}\nFor: ${get('client_type')}\n\n— ${get('name')}\n${get('email')}`;
  location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  $('#mForm').hidden = true; $('#mSuccess').hidden = false; $('#mDone').focus();
});
// routing for in-page buttons
document.addEventListener('click', e => {
  const ln = e.target.closest('a[data-door],a[data-go]');
  if (ln){ if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button) return; e.preventDefault(); }   // a real link for crawlers and new tabs; a plain click stays in the page
  const c = e.target.closest('[data-contact]'); if (c){ openModal(); return; }
  const dr = e.target.closest('[data-door]'); if (dr){ window.openDoor?.(+dr.dataset.door); return; }
  const g = e.target.closest('[data-go]'); if (g) scrollToId(g.dataset.go);
});

bindHovers();

/* ---------- Flip calendar: skills on an endless desk-calendar flip ---------- */
(function flipCalendar(){
  const SKILLS = ["Acadely", "HomeSense", "Founder Community", "Technical Skills", "RIT Dubai"];
  const HOLD = 1700, FLIP = 1250;
  const cal = $('#cal'); if (!cal) return;
  const body = $('.cal__body', cal), leaf = $('.cal__leaf', cal);
  const under = $('[data-under]', cal), face = $('.cal__face', cal);
  const measure = $('.cal__measure', cal), rings = $('.cal__rings', cal);
  const n = SKILLS.length;
  let i = 0, timer = 0, flipping = false, started = false;

  const paint = (page, k) => {
    $('.cal__word', page).textContent = SKILLS[k];
    $('.cal__no', page).textContent = `${String(k + 1).padStart(2, '0')} / ${String(n).padStart(2, '0')}`;
  };
  paint(face, 0); paint(under, 1);

  // size the page to the longest skill, shrink the whole calendar if the column is too narrow
  function fit(){
    cal.style.fontSize = '';
    const fs = parseFloat(getComputedStyle(cal).fontSize);
    let max = 0;
    for (const w of SKILLS){ measure.textContent = w; max = Math.max(max, measure.getBoundingClientRect().width); }
    const wEm = max / fs + 0.8 + 0.06;               // word + side padding
    body.style.setProperty('--cal-w', wEm.toFixed(3) + 'em');
    cal.style.setProperty('--cal-w', wEm.toFixed(3) + 'em');
    const avail = cal.closest('.h1').getBoundingClientRect().width - fs * 0.25;
    const need = wEm * fs;
    if (need > avail) cal.style.fontSize = (fs * avail / need).toFixed(2) + 'px';
    // spiral rings + punched holes, spaced roughly every 0.62em
    const count = Math.max(5, Math.round((wEm - 0.64) / 0.7) + 1);
    rings.innerHTML = '<i></i>'.repeat(count);
    cal.querySelectorAll('.cal__holes').forEach(h => h.innerHTML = '<i></i>'.repeat(count));
  }
  fit();
  document.fonts?.ready.then(fit);
  addEventListener('resize', () => { clearTimeout(fit._t); fit._t = setTimeout(fit, 120); });

  function flip(){
    if (document.hidden){ timer = setTimeout(flip, 600); return; }
    flipping = true;
    const next = (i + 1) % n;
    if (reduced){
      i = next; paint(face, i); paint(under, (i + 1) % n);
      flipping = false; timer = setTimeout(flip, HOLD + 700); return;
    }
    const timing = { duration: FLIP, easing: 'cubic-bezier(.5,.05,.2,1)', fill: 'forwards' };
    face.animate([{ opacity: 1 }, { opacity: 1, offset: .285 }, { opacity: 0, offset: .295 }, { opacity: 0 }], { duration: FLIP, easing: 'linear', fill: 'forwards' });
    // once the page is over the top it slips away behind the calendar instead of hanging over the text
    // the back of the page catches the light as it comes over the top, then falls into shadow as it drops behind the stack
    $('.cal__rear', leaf).animate([{ filter: 'brightness(1)' }, { filter: 'brightness(1.02)', offset: .29 }, { filter: 'brightness(.96)', offset: .45 }, { filter: 'brightness(.9)' }], { duration: FLIP, easing: 'linear', fill: 'forwards' });
    const a = leaf.animate([
      { transform: 'translateZ(.004em) rotateX(0deg)' },
      { transform: 'translateZ(.004em) rotateX(352deg)' }
    ], timing);
    $('.cal__shade', face).animate([{ opacity: 0 }, { opacity: .45, offset: .2 }, { opacity: 0, offset: .275 }, { opacity: 0 }], { duration: FLIP, easing: 'linear', fill: 'forwards' });
    $('.cal__shade', under).animate([{ opacity: .7 }, { opacity: 0 }], { duration: FLIP * .9, easing: 'cubic-bezier(.3,.6,.4,1)', fill: 'forwards' });
    a.onfinish = () => {
      i = next;
      paint(face, i);                       // the leaf now shows what was underneath…
      leaf.getAnimations({ subtree: true }).forEach(x => x.cancel());
      cal.querySelectorAll('.cal__shade').forEach(sh => sh.getAnimations().forEach(x => x.cancel()));
      paint(under, (i + 1) % n);            // …and the next skill waits below
      flipping = false;
      timer = setTimeout(flip, HOLD);
    };
  }
  const start = () => { if (started) return; started = true; timer = setTimeout(flip, 1300); };
  if (document.body.classList.contains('ready')) start(); else addEventListener('intro:ready', start, { once: true });
})();


/* ---------- LiquidReveal: paint the colour cut-out along the cursor trail ----------
   The trail is kept as a soft mask; each frame the canvas shows  bw·(1−mask) + colour·mask
   (added with 'lighter'), so semi-transparent hair edges keep exactly the same opacity
   instead of doubling up where the colour layer sits on the B&W one. */
function liquidReveal(stage, canvas, afterSrc, { brushRadius = 143, decay = 0.016 } = {}){
  if (reduced) { canvas.remove(); return; }
  const base = stage.querySelector('img');
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const mk = () => { const c = document.createElement('canvas'); return [c, c.getContext('2d')]; };
  const [bwC, bwX] = mk(), [colC, colX] = mk(), [mask, mX] = mk(), [tmp, tX] = mk();
  const bwImg = new Image(), colImg = new Image();
  bwImg.src = base.currentSrc || base.src; colImg.src = afterSrc;
  let W = 1, H = 1, radius = brushRadius * dpr;
  const points = []; let last = null, idle = 999, running = false, showing = false;

  function fitDraw(x, img){
    x.clearRect(0, 0, W, H);
    if (!img.naturalWidth) return;
    // Match the hero photo’s cover crop and anchor it at the bottom.
    const s = Math.max(W / img.naturalWidth, H / img.naturalHeight);
    const dw = img.naturalWidth * s, dh = img.naturalHeight * s;
    if (x === colX) x.filter = 'sepia(.32) contrast(1.06)';
    x.drawImage(img, (W - dw) / 2, H - dh, dw, dh);
    x.filter = 'none';
  }
  function measure(){
    const r = stage.getBoundingClientRect();
    W = Math.max(1, Math.round(r.width * dpr)); H = Math.max(1, Math.round(r.height * dpr));
    for (const c of [canvas, bwC, colC, mask, tmp]){ c.width = W; c.height = H; }
    radius = brushRadius * dpr;
    fitDraw(bwX, bwImg); fitDraw(colX, colImg);
    hide();
  }
  bwImg.onload = () => fitDraw(bwX, bwImg);
  colImg.onload = () => fitDraw(colX, colImg);

  function stamp(x, y){
    const g = mX.createRadialGradient(x, y, 0, x, y, radius);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.55, 'rgba(255,255,255,.82)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    mX.globalCompositeOperation = 'source-over';
    mX.fillStyle = g; mX.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }
  function render(){
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(bwC, 0, 0);
    ctx.globalCompositeOperation = 'destination-out';
    ctx.drawImage(mask, 0, 0);                       // bw · (1 − mask)
    tX.globalCompositeOperation = 'source-over';
    tX.clearRect(0, 0, W, H);
    tX.drawImage(colC, 0, 0);
    tX.globalCompositeOperation = 'destination-in';
    tX.drawImage(mask, 0, 0);                        // colour · mask
    ctx.globalCompositeOperation = 'lighter';
    ctx.drawImage(tmp, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
  }
  function show(){ if (!showing){ showing = true; render(); base.style.visibility = 'hidden'; } }
  function hide(){
    showing = false; base.style.visibility = '';
    ctx.clearRect(0, 0, W, H); mX.clearRect(0, 0, W, H);
  }
  function frame(){
    const drawing = points.length > 0;
    if (drawing) idle = 0; else idle++;
    if (idle >= 120){ hide(); running = false; return; }
    const fade = drawing ? decay : Math.min(decay + idle * 0.004, 0.5);
    mX.globalCompositeOperation = 'destination-out';
    mX.fillStyle = `rgba(0,0,0,${fade})`;
    mX.fillRect(0, 0, W, H);
    if (drawing){ for (const p of points) stamp(p.x, p.y); points.length = 0; }
    render(); show();
    requestAnimationFrame(frame);
  }
  addEventListener('pointermove', e => {
    if (!colImg.naturalWidth || !bwImg.naturalWidth) return;
    const r = stage.getBoundingClientRect();
    const x = (e.clientX - r.left) * dpr, y = (e.clientY - r.top) * dpr;
    if (x < -radius || y < -radius || x > W + radius || y > H + radius){ last = null; return; }
    if (last){
      const dx = x - last.x, dy = y - last.y, dist = Math.hypot(dx, dy);
      const step = Math.max(radius * 0.3, 1), n = Math.min(Math.ceil(dist / step), 60);
      for (let i = 1; i <= n; i++) points.push({ x: last.x + dx * i / n, y: last.y + dy * i / n });
    } else points.push({ x, y });
    last = { x, y };
    if (!running){ running = true; idle = 0; requestAnimationFrame(frame); }
  }, { passive:true });
  new ResizeObserver(measure).observe(stage);
  measure();
}
if (matchMedia('(max-width: 1023.98px), (hover: none)').matches){
  $('#figCanvas')?.remove();                                     // touch screens: the black & white photo, no reveal
} else liquidReveal($('#fig'), $('#figCanvas'), COLOUR_SRC);

/* ---------- Mode (light / dark) ---------- */
const MODE_KEY = 'abdullo-reference-mode';
const themeMeta = document.querySelector('meta[name="theme-color"]');
let modeAnimT = 0;
function getMode(){ return root.dataset.mode === 'dark' ? 'dark' : 'light'; }
function setMode(m, animate = true){
  if (animate && !reduced && document.startViewTransition){
    document.startViewTransition(() => setMode(m, false));
    return;
  }
  if (m === 'dark') root.dataset.mode = 'dark'; else delete root.dataset.mode;
  themeMeta?.setAttribute('content', m === 'dark' ? '#172824' : '#FAF7EE');
  $('#cordHit')?.setAttribute('aria-checked', String(m === 'dark'));
  try { localStorage.setItem(MODE_KEY, m); } catch (e) {}
}
setMode(getMode(), false);
const toggleMode = () => setMode(getMode() === 'dark' ? 'light' : 'dark');

/* ---------- Pull cord: verlet rope you can grab, swing and pull ----------
   The rope hangs from above the top edge. Pulling it past the switch's spring travel
   clicks the switch (toggles the mode) the way a ceiling pull-cord does; letting go
   lets the spring snap the cord back up and the rope settles under gravity. */
(function pullCord(){
  const wrap = $('#cord'), cv = $('.cord__cv', wrap), hit = $('#cordHit');
  const ctx = cv.getContext('2d');
  const N = 26;                         // segments
  const G = 4600;                       // gravity, px/s² (tuned so a ~30 cm cord swings at a lifelike ~1.2 s period)
  const STEP = 1 / 120;                 // fixed physics step
  const ITER = 16;                      // constraint passes
  let dpr = 1, W = 300, H = 500;
  let L = 220, EXT_MAX = 46, HIDDEN = 70, seg = 10, ax = 200, thick = 3.2, knobS = 1;
  let pts = [];                         // {x,y,px,py,w}
  let ext = 0, extV = 0, armed = true;
  let grab = -1, grabOff = { x:0, y:0 }, target = null, ptr = null, ptrPrev = null;
  let downAt = 0, downPos = null, moved = 0;
  let acc = 0, lastT = 0, t = 0;
  let dropped = false, live = false;

  function layout(){
    const rem = parseFloat(getComputedStyle(root).fontSize) || 16;
    const vw = innerWidth, vh = innerHeight;
    let offset;                          // anchor distance from the viewport's right edge
    if (vw >= 1024){ offset = 4.25 * rem; L = Math.min(270, Math.max(190, vh * .3)); EXT_MAX = 72; thick = 3.7; knobS = 1.3; }
    else if (vw >= 640){ offset = 5.9 * rem; L = Math.min(220, Math.max(160, vh * .2)); EXT_MAX = 62; thick = 3.4; knobS = 1.2; }
    else { offset = 5.7 * rem; L = 70; EXT_MAX = 54; thick = 3.1; knobS = 1.1; }
    HIDDEN = EXT_MAX + 18;
    W = Math.min(vw, 340);
    H = Math.round(L + EXT_MAX + 170);
    wrap.style.height = H + 'px';
    dpr = Math.min(devicePixelRatio || 1, 2);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    // small screens: hang just left of the local-time badge
    const ck = document.querySelector('.hdr .clock');
    if (ck && ck.offsetWidth){
      // desktop: hang right beside the local-time badge; small screens: near the right edge (over the badge is fine)
      offset = vw >= 1200 ? Math.max(1.2 * rem, vw - ck.getBoundingClientRect().right - 1.4 * rem) : 2.4 * rem;
    }
    const newAx = W - offset;
    const total = L + HIDDEN;
    seg = total / N;
    if (!pts.length){
      for (let i = 0; i <= N; i++){
        const x = newAx, y = -HIDDEN + i * seg;
        pts.push({ x, y, px: x, py: y, w: i === 0 ? 0 : i === N ? .28 : 1 });
      }
    } else {
      const dx = newAx - ax;
      for (const p of pts){ p.x += dx; p.px += dx; }
    }
    ax = newAx;
  }

  /* ----- physics ----- */
  function step(dt){
    if (!dropped) return;
    t += dt;
    // switch spring (anchor travel) — free when nobody is pulling
    if (grab < 0){
      const K = 760, C = 21;
      extV += (-K * ext - C * extV) * dt;
      ext += extV * dt;
    }
    if (ext > EXT_MAX * .8 && armed && live){ armed = false; toggleMode(); try { navigator.vibrate?.(12); } catch (e) {} }
    if (ext < EXT_MAX * .22) armed = true;

    const a = pts[0];
    a.x = a.px = ax; a.y = a.py = -HIDDEN + ext;

    const wind = reduced ? 0 : (Math.sin(t * .63) * 16 + Math.sin(t * 1.71 + 1.3) * 7);
    const damp = grab >= 0 ? .992 : .9875;
    for (let i = 1; i <= N; i++){
      if (i === grab) continue;
      const p = pts[i];
      const vx = (p.x - p.px) * damp, vy = (p.y - p.py) * damp;
      p.px = p.x; p.py = p.y;
      p.x += vx + wind * dt * dt * (i / N);
      p.y += vy + G * dt * dt;
    }
    if (grab >= 0 && target){
      const g = pts[grab];
      g.px = g.x; g.py = g.y;
      g.x = target.x; g.y = target.y;
    }
    for (let k = 0; k < ITER; k++){
      for (let i = 0; i < N; i++){
        const p1 = pts[i], p2 = pts[i + 1];
        const w1 = (i === grab) ? 0 : p1.w, w2 = (i + 1 === grab) ? 0 : p2.w;
        const sw = w1 + w2; if (!sw) continue;
        const dx = p2.x - p1.x, dy = p2.y - p1.y;
        const d = Math.hypot(dx, dy) || 1e-6;
        const diff = (d - seg) / d / sw;
        p1.x += dx * diff * w1; p1.y += dy * diff * w1;
        p2.x -= dx * diff * w2; p2.y -= dy * diff * w2;
      }
    }
    // keep the knob inside the drawing area
    for (let i = 1; i <= N; i++){
      const p = pts[i];
      if (p.x < 14){ p.x = 14; } else if (p.x > W - 14){ p.x = W - 14; }
      if (p.y > H - 46){ p.y = H - 46; }
    }
  }

  // while dragging: the pointer sets the grabbed point; the switch spring gives way
  function updateDrag(){
    if (grab < 0 || !ptr) return;
    let tx = ptr.x - grabOff.x, ty = ptr.y - grabOff.y;
    const bx = ax, by = -HIDDEN;
    const reach = grab * seg;                         // rope length from switch to grabbed point
    let dx = tx - bx, dy = ty - by, d = Math.hypot(dx, dy) || 1e-6;
    let need = d - reach;
    if (need > EXT_MAX){                              // past the end stop: heavy rubbery resistance
      const over = need - EXT_MAX;
      const allowed = reach + EXT_MAX + over * .14 / (1 + over / 160);
      tx = bx + dx / d * allowed; ty = by + dy / d * allowed;
      need = EXT_MAX;
    }
    const targetExt = Math.max(0, need);
    const prevExt = ext;
    ext += (targetExt - ext) * .55;
    extV = (ext - prevExt) * 60;
    target = { x: Math.max(14, Math.min(W - 14, tx)), y: Math.min(H - 46, ty) };
  }

  /* ----- input ----- */
  const local = e => { const r = wrap.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  function startDrag(e_, i_){ wake(); return startDrag_(e_, i_); }
  function startDrag_(e, idx){
    grab = idx;
    const p = local(e), g = pts[idx];
    grabOff = { x: p.x - g.x, y: p.y - g.y };
    ptr = ptrPrev = p; target = { x: g.x, y: g.y };
    downAt = performance.now(); downPos = p; moved = 0;
    wrap.classList.add('dragging');
    addEventListener('pointermove', onMove, { passive: false });
    addEventListener('pointerup', endDrag);
    addEventListener('pointercancel', endDrag);
  }
  function onMove(e){
    if (grab < 0) return;
    e.preventDefault();
    ptrPrev = ptr; ptr = local(e);
    moved = Math.max(moved, Math.hypot(ptr.x - downPos.x, ptr.y - downPos.y));
  }
  function endDrag(){
    if (grab < 0) return;
    const g = pts[grab];
    // fling: carry the hand's last velocity into the rope
    if (ptr && ptrPrev){
      const vx = (ptr.x - ptrPrev.x), vy = (ptr.y - ptrPrev.y);
      g.px = g.x - vx * .5; g.py = g.y - vy * .5;
    }
    const tap = moved < 6 && performance.now() - downAt < 300;
    grab = -1; target = null; ptr = ptrPrev = null;
    wrap.classList.remove('dragging');
    removeEventListener('pointermove', onMove);
    removeEventListener('pointerup', endDrag);
    removeEventListener('pointercancel', endDrag);
    if (tap) tug();
  }
  // a quick tug (tap, click or keyboard) yanks the cord just past the click point
  function tug(){ wake(); extV = EXT_MAX * 44; pts[N].px = pts[N].x + 1.5; }

  hit.addEventListener('pointerdown', e => {
    if (!dropped) return;
    e.preventDefault();
    try { hit.setPointerCapture(e.pointerId); } catch (_) {}
    startDrag(e, N);
  });
  hit.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); tug(); } });
  hit.addEventListener('click', e => e.preventDefault());

  // desktop: the rope itself can be grabbed anywhere along its length
  document.addEventListener('pointerdown', e => {
    if (!dropped || e.pointerType !== 'mouse' || e.button !== 0 || grab >= 0 || e.target === hit) return;
    const p = local(e);
    if (p.x < 0 || p.y < 0 || p.x > W || p.y > H) return;
    let best = -1, bd = 11;
    for (let i = 2; i <= N; i++){
      if (pts[i].y < 0) continue;
      const d = Math.hypot(pts[i].x - p.x, pts[i].y - p.y);
      if (d < bd){ bd = d; best = i; }
    }
    if (best > 0){ e.preventDefault(); startDrag(e, best); }
  });
  // brushing past the rope with the mouse nudges it
  addEventListener('pointermove', e => {
    if (grab >= 0 || e.pointerType !== 'mouse') return;
    const p = local(e);
    if (p.x < -20 || p.y < -20 || p.x > W + 20 || p.y > H + 20){ brush.last = null; return; }
    if (brush.last){
      wake();
      const vx = p.x - brush.last.x, vy = p.y - brush.last.y;
      for (let i = 2; i <= N; i++){
        const q = pts[i], d = Math.hypot(q.x - p.x, q.y - p.y);
        if (d < 16){ const f = (1 - d / 16) * .35; q.x += vx * f; q.y += vy * f * .5; }
      }
    }
    brush.last = p;
  }, { passive: true });
  const brush = { last: null };

  /* ----- drawing ----- */
  function pathThrough(c, ps){
    c.beginPath();
    c.moveTo(ps[0].x, ps[0].y);
    for (let i = 1; i < ps.length - 1; i++){
      const mx = (ps[i].x + ps[i + 1].x) / 2, my = (ps[i].y + ps[i + 1].y) / 2;
      c.quadraticCurveTo(ps[i].x, ps[i].y, mx, my);
    }
    const l = ps[ps.length - 1]; c.lineTo(l.x, l.y);
  }
  // sample the smoothed rope densely for the braid texture
  function samples(ps, spacing){
    const out = [];
    let carry = 0;
    for (let i = 0; i < ps.length - 1; i++){
      const a = ps[i], b = ps[i + 1];
      const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1e-6;
      let s = carry;
      while (s < len){ out.push({ x: a.x + dx * s / len, y: a.y + dy * s / len, tx: dx / len, ty: dy / len }); s += spacing; }
      carry = s - len;
    }
    return out;
  }
  function knobPath(c){
    c.beginPath();
    c.moveTo(-3.1, 6.2);
    c.bezierCurveTo(-3.6, 10.5, -9.6, 13.5, -9.6, 22.5);
    c.bezierCurveTo(-9.6, 30.5, -5.4, 35, 0, 35);
    c.bezierCurveTo(5.4, 35, 9.6, 30.5, 9.6, 22.5);
    c.bezierCurveTo(9.6, 13.5, 3.6, 10.5, 3.1, 6.2);
    c.closePath();
  }
  function drawKnob(c, x, y, ang, shadowOnly){
    c.save();
    c.translate(x, y); c.rotate(ang - Math.PI / 2); c.scale(knobS, knobS);
    if (shadowOnly){
      knobPath(c); c.fill();
      c.fillRect(-3.4, -.5, 6.8, 7.5);
      c.restore(); return;
    }
    // metal ferrule where the cord is crimped
    const fg = c.createLinearGradient(-3.6, 0, 3.6, 0);
    fg.addColorStop(0, '#3a5148'); fg.addColorStop(.3, '#d5e2d6'); fg.addColorStop(.55, '#82998a'); fg.addColorStop(1, '#30453d');
    c.fillStyle = fg;
    c.beginPath(); c.roundRect ? c.roundRect(-3.5, -.6, 7, 7.6, 1.2) : c.rect(-3.5, -.6, 7, 7.6); c.fill();
    c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(-3.5, 2.6, 7, .7); c.fillRect(-3.5, 4.4, 7, .6);
    // turned green handle
    knobPath(c);
    const bg = c.createLinearGradient(-9.6, 0, 9.6, 0);
    bg.addColorStop(0, '#12231c'); bg.addColorStop(.22, '#2c5746'); bg.addColorStop(.4, '#6f9b82');
    bg.addColorStop(.58, '#446f5b'); bg.addColorStop(.85, '#1d3b2d'); bg.addColorStop(1, '#10241a');
    c.fillStyle = bg; c.fill();
    c.save(); knobPath(c); c.clip();
    // grain
    c.strokeStyle = 'rgba(21,44,32,.28)'; c.lineWidth = .55;
    for (let k = -3; k <= 3; k++){
      c.beginPath(); c.moveTo(k * 2.4 - .6, 8); c.bezierCurveTo(k * 2.9 + 1, 16, k * 2.2 - 1, 26, k * 1.6, 35); c.stroke();
    }
    // soft top-left key light + bottom occlusion
    const hl = c.createRadialGradient(-3.6, 17, .5, -3.6, 17, 9);
    hl.addColorStop(0, 'rgba(231,245,229,.42)'); hl.addColorStop(1, 'rgba(231,245,229,0)');
    c.fillStyle = hl; c.fillRect(-10, 6, 20, 30);
    const bo = c.createLinearGradient(0, 24, 0, 35.5);
    bo.addColorStop(0, 'rgba(0,0,0,0)'); bo.addColorStop(1, 'rgba(0,0,0,.35)');
    c.fillStyle = bo; c.fillRect(-10, 6, 20, 30);
    c.restore();
    // crisp specular streak
    c.fillStyle = 'rgba(231,245,229,.38)';
    c.beginPath(); c.ellipse(-4.4, 20.5, 1.1, 5.2, -.08, 0, Math.PI * 2); c.fill();
    c.restore();
  }
  function draw(){
    const c = ctx;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.clearRect(0, 0, W, H);
    const ps = pts;
    const last = ps[N], prev = ps[N - 1];
    const ang = Math.atan2(last.y - prev.y, last.x - prev.x);

    // cast shadow on the wall behind
    const sa = parseFloat(getComputedStyle(root).getPropertyValue('--cord-shadow')) || .2;
    c.save();
    c.translate(7, 11);
    if ('filter' in c) c.filter = 'blur(3px)';
    c.strokeStyle = `rgba(0,0,0,${sa * .8})`; c.lineWidth = thick + 1; c.lineCap = 'round';
    pathThrough(c, ps); c.stroke();
    c.fillStyle = `rgba(0,0,0,${sa})`;
    drawKnob(c, last.x, last.y, ang, true);
    c.restore();

    // braided cotton cord: dark edge, body, light side, twist
    c.lineCap = 'round'; c.lineJoin = 'round';
    pathThrough(c, ps);
    c.strokeStyle = '#657c6d'; c.lineWidth = thick + 1.3; c.stroke();
    c.strokeStyle = '#c3d3c4'; c.lineWidth = thick; c.stroke();
    const sm = samples(ps, thick * 1.05);
    c.lineWidth = Math.max(.6, thick * .24);
    c.strokeStyle = 'rgba(71,98,78,.55)';
    c.beginPath();
    for (const q of sm){
      if (q.y < -2) continue;
      const nx = -q.ty, ny = q.tx, h = thick * .5;
      c.moveTo(q.x - nx * h - q.tx * h * .7, q.y - ny * h - q.ty * h * .7);
      c.lineTo(q.x + nx * h + q.tx * h * .7, q.y + ny * h + q.ty * h * .7);
    }
    c.stroke();
    // highlight along the lit side
    c.save();
    c.translate(-thick * .2, -thick * .05);
    pathThrough(c, ps);
    c.strokeStyle = 'rgba(255,252,244,.55)'; c.lineWidth = thick * .28; c.stroke();
    c.restore();

    drawKnob(c, last.x, last.y, ang, false);

    // keep the hit target on the knob
    const kx = last.x + Math.cos(ang) * 20 * knobS, ky = last.y + Math.sin(ang) * 20 * knobS;
    hit.style.transform = `translate(${kx}px, ${ky}px)`;
  }

  // the rope sleeps once it hangs still, so it costs nothing while you scroll; touching, pulling or resizing wakes it
  let sleeping = false, still = 0;
  let touchedAt = 0;
  function wake(){ still = 0; touchedAt = performance.now(); if (!sleeping) return; sleeping = false; lastT = 0; acc = 0; requestAnimationFrame(loop); }
  window.__cordWake = wake;
  function loop(now){
    if (!lastT) lastT = now;
    let dt = Math.min((now - lastT) / 1000, 1 / 20); lastT = now;
    updateDrag();
    acc += dt;
    while (acc >= STEP){ step(STEP); acc -= STEP; }
    // left alone, the swing calms a little faster so the rope comes to rest (and stops costing anything) sooner
    if (dropped && live && grab < 0 && now - touchedAt > 2500) for (const q of pts){ q.px += (q.x - q.px) * .06; q.py += (q.y - q.py) * .06; }
    draw();
    let motion = Math.abs(extV) + Math.abs(ext);
    for (const q of pts) motion = Math.max(motion, Math.abs(q.x - q.px) + Math.abs(q.y - q.py));
    if (dropped && live && grab < 0 && motion < .06){ if (++still > 30){ for (const q of pts){ q.px = q.x; q.py = q.y; } sleeping = true; return; } } else still = 0;
    requestAnimationFrame(loop);
  }

  layout();
  // start pulled up out of view; it drops in once the intro has finished
  // folded up above the switch, out of view: it drops and swings into place after the intro
  pts.forEach((p, i) => { p.y = p.py = -HIDDEN - i * seg * .98; p.x = p.px = ax + Math.sin(i * .5) * 1.5; });
  const drop = () => {
    dropped = true;
    for (const p of pts){ p.px = p.x - .45; }       // a slight sideways swing as it falls
    setTimeout(() => { live = true; }, 900);
  };
  if (document.body.classList.contains('ready')) drop();
  else addEventListener('intro:ready', () => setTimeout(drop, 650), { once: true });
  addEventListener('resize', () => { wake(); clearTimeout(layout._t); layout._t = setTimeout(() => { layout(); wake(); }, 100); });
  new MutationObserver(wake).observe(root, { attributes: true, attributeFilter: ['data-mode'] });
  requestAnimationFrame(loop);
})();

/* ---------- Doors: hover cracks a door open; click swings it open and carries you through it ---------- */
(function doors(){
  // each door is its own page (/photographer etc.)
  const ROUTES = ["./room.html?project=acadely", "./room.html?project=homesense", "./room.html?project=founder-community", "./room.html?project=skills", "./room.html?project=rit-dubai"];
  const SLUGS = ['acadely', 'homesense', 'founder-community', 'skills', 'rit-dubai'];
  const aliases = new Map([['founders', 'founder-community'], ['education', 'rit-dubai']]);
  let hash;
  try { hash = decodeURIComponent(location.hash.slice(1)); } catch { hash = ''; }
  if (hash === 'work') history.replaceState(null, '', '#works');
  const HASH_DOOR = SLUGS.indexOf(aliases.get(hash) ?? hash);
  if (HASH_DOOR >= 0){
    try { history.replaceState(null, '', location.pathname + location.search + '#works'); } catch (e) {}
    addEventListener('intro:ready', () => { warm(HASH_DOOR); setTimeout(() => window.openDoor(HASH_DOOR), 650); }, { once: true });
  }
  const sec = $('#works'); if (!sec) return;
  const units = [...sec.querySelectorAll('.unit')];
  const veil = $('#veil');
  const ANG = 70, ANG_WALK = 70;                       // fully open, swung into the room
  let busy = false;

  const doorsState = units.map((u, i) => {
    const door = $('.door', u);
    const s = spring({ tension: 120, friction: 14 }, o => {
      door.style.transform = `rotateY(${Math.max(0, o) * ANG}deg)`;   // the frame's door stop: never swings outward
      u.style.setProperty('--o', Math.max(0, o).toFixed(4));
    });
    return { u, door, s, way: $('.doorway', u) };
  });

  // reveal the doors once the wall scrolls into view
  if ('IntersectionObserver' in window && !reduced){
    sec.classList.add('pre');
    const io = new IntersectionObserver(es => {
      if (es.some(e => e.isIntersecting)){
        sec.classList.add('in');
        requestAnimationFrame(() => sec.classList.remove('pre'));
        io.disconnect();
      }
    }, { threshold: .18 });
    io.observe(sec);
  }

  // cursor badge: sits exactly on the pointer (no easing, no travel); only its opacity fades
  const badge = $('#doorCursor');
  let over = false;
  const place = e => { badge.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`; };
  const showBadge = on => { over = on; badge.classList.toggle('on', on); };
  if (canHover){
    addEventListener('pointermove', e => { if (over) place(e); }, { passive: true });
    units.forEach(u => {
      const w = $('.doorway', u);
      w.addEventListener('pointerenter', e => { place(e); if (!busy) showBadge(true); });
      w.addEventListener('pointerleave', () => showBadge(false));
    });
  }

  // fetch the page behind a door as soon as someone shows interest in it
  const warmed = new Set();
  const warm = i => {
    if (warmed.has(i)) return; warmed.add(i);
    loadRoom(i);
  };

  /* The photo wall is loaded, fully painted, inside this page while you stand at the doors.
     Opening the door reveals that same live wall, so there is no page swap to glitch. */
  const wallv = $('#wallv');
  // every door has its own room, loaded inside this page, so stepping in and coming back never reloads anything
  const frames = [], ready = [], TITLES = ["Acadely", "HomeSense", "Founder Community", "Technical Skills", "RIT Dubai"];
  let frame = null, frameReady = false, cur = 0, inWall = false, pushed = false, savedGap = null;
  function loadRoom(i){
    if (frames[i]) return;
    const f = document.createElement('iframe');
    f.src = ROUTES[i] + '&embed';
    f.title = TITLES[i];
    f.tabIndex = -1;
    f.addEventListener('load', () => { ready[i] = true; if (i === cur) frameReady = true; f.contentWindow?.postMessage({ wall: 'mode', mode: root.dataset.mode === 'dark' ? 'dark' : 'light' }, location.origin === 'null' ? '*' : location.origin); }, { once: true });
    frames[i] = f; wallv.appendChild(f);
  }
  const pick = i => { cur = i; frame = frames[i]; frameReady = !!ready[i]; frames.forEach((f, k) => f && f.classList.toggle('cur', k === i)); };
  const toWall = msg => { try { frame?.contentWindow?.postMessage(msg, location.origin === 'null' ? '*' : location.origin); } catch (e) {} };
  // start fetching the wall once the doors are near, so a click never waits
  if ('IntersectionObserver' in window){
    const near = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)){ near.disconnect(); setTimeout(() => { warm(4); setTimeout(() => [0, 1, 2, 3].forEach(warm), 1500); }, 600); } }, { rootMargin: '200px' });
    near.observe(sec);
  }

  // hovering the doors: promote them to a GPU layer and pre-render them at the zoom the walk-through will use,
  // so clicking has nothing heavy left to do (a paused animation makes the browser raster at its peak scale)
  let warmZoom = null;
  const lift = () => {
    if (sec.classList.contains('lift')) return;
    sec.classList.add('lift');
  };
  sec.addEventListener('pointerenter', lift);
  doorsState.forEach((d, i) => {
    d.way.addEventListener('focus', lift);
    d.way.addEventListener('pointerenter', () => warm(i));
    d.way.addEventListener('focus', () => warm(i));
    if (canHover){
      d.way.addEventListener('mouseenter', () => { if (!busy) d.s.set(.1); });
      d.way.addEventListener('mouseleave', () => { if (!busy) d.s.set(0); });
    }
    d.way.addEventListener('click', () => enter(i));
  });

  // from the nav or a link: go down to the doors, face the right one, then open it and walk in
  // what each door holds: shown beside the door on hover (desktop), under the swipe hint on phones
  const INFO = [
  [
    "Acadely",
    "A student productivity platform",
    [
      "Founder and developer",
      "Courses, schedules and assignments",
      "Grades and GPA"
    ]
  ],
  [
    "HomeSense",
    "A Python energy-monitoring project",
    [
      "Smart-home energy monitoring",
      "Python project structure",
      "Data and documentation"
    ]
  ],
  [
    "Founder Community",
    "An early concept for young founders",
    [
      "Share a business idea",
      "Get feedback from peers",
      "Discover other founders"
    ]
  ],
  [
    "Technical Skills",
    "The tools I use and learn",
    [
      "Python and JavaScript",
      "Responsive web development",
      "Git and Supabase"
    ]
  ],
  [
    "RIT Dubai",
    "Computing and Information Technology",
    [
      "Rochester Institute of Technology Dubai",
      "Department of Computing Sciences",
      "Expected graduation in May 2030"
    ]
  ]
];
  const dinfo = $('#dinfo'), wallEl = $('.doors__wall', sec), MOB = matchMedia('(max-width: 639.98px)');
  units.forEach((u, i) => $('.doorway', u).setAttribute('aria-description', INFO[i][1] + ': ' + INFO[i][2].join(', ')));
  const setInfo = i => { dinfo.querySelector('.dinfo__h').textContent = INFO[i][0]; dinfo.querySelector('.dinfo__t').textContent = INFO[i][1]; dinfo.querySelector('.dinfo__p').innerHTML = INFO[i][2].map(s => `<li>${s}</li>`).join(''); };
  if (canHover){
    // one source of truth: whichever door is under the pointer right now (re-checked on every move and scroll),
    // so the description can never be left behind however fast the cursor travels
    let active = -1, token = 0, px = -1, py = -1;
    const show = i => {
      const my = ++token;
      units.forEach((u, k) => u.classList.toggle('on', k === i));
      sec.classList.add('focus');
      const visible = units.filter(u => getComputedStyle(u).visibility !== 'hidden');
      const vi = visible.indexOf(units[i]); if (vi < 0) return;
      const wr = wallEl.getBoundingClientRect(), r = units[i].getBoundingClientRect();
      const toRight = vi < 2 && visible[vi + 2];
      const a = toRight ? visible[vi + 1].getBoundingClientRect() : (visible[vi - 2] || visible[vi - 1]).getBoundingClientRect();
      const b = toRight ? visible[vi + 2].getBoundingClientRect() : visible[vi - 1].getBoundingClientRect();
      const left = Math.min(a.left, b.left), right = Math.max(a.right, b.right);
      const place = () => {
        if (my !== token || active !== i) return;          // something newer happened: do nothing
        setInfo(i);
        const w = Math.min(right - left, 22 * 16);
        dinfo.style.width = w + 'px';
        dinfo.style.left = (left - wr.left + (right - left - w) / 2) + 'px';        // centred in the space of the faded doors
        dinfo.style.top = (r.top - wr.top + r.height * .5 - dinfo.offsetHeight / 2) + 'px';
        dinfo.classList.add('on');
      };
      if (dinfo.classList.contains('on')){ dinfo.classList.remove('on'); setTimeout(place, 130); } else place();
    };
    const hide = () => { token++; sec.classList.remove('focus'); units.forEach(u => u.classList.remove('on')); dinfo.classList.remove('on'); };
    const set = i => { if (busy) i = -1; if (i === active) return; active = i; if (i < 0) hide(); else show(i); };
    const under = el => { const w = el && el.closest ? el.closest('.doorway') : null; return w ? units.findIndex(u => u.contains(w)) : -1; };
    addEventListener('pointermove', e => { px = e.clientX; py = e.clientY; set(under(e.target)); }, { passive: true });
    addEventListener('scroll', () => { if (px >= 0) set(under(document.elementFromPoint(px, py))); }, { passive: true });
    document.documentElement.addEventListener('pointerleave', () => set(-1));
    addEventListener('blur', () => set(-1));
    units.forEach((u, i) => {
      const w = $('.doorway', u);
      w.addEventListener('focus', () => { if (w.matches(':focus-visible')) set(i); });
      w.addEventListener('blur', () => { if (px < 0 || under(document.elementFromPoint(px, py)) !== i) set(-1); });
    });
    window.__doorHover = set;
  } else if (!MOB.matches) dinfo.style.display = 'none';

  // phones: the wall stays pinned while you scroll; each stretch of scrolling (or a sideways swipe) moves one door along
  const mRow = $('.doors__row', sec);
  let mIdx = 0, mForce = -1, mShown = -1;
  const mSpan = () => Math.max(1, sec.offsetHeight - innerHeight);
  const mobY = i => sec.getBoundingClientRect().top + pageYOffset + (Math.min(3, Math.max(0, i)) / 3) * mSpan();
  const mDots = $('.doors__dots', sec);
  let mCur = 0, mRaf = 0, mLast = 0, mSettle = 0, swipeLock = 0;
  // scroll progress across the pinned wall → a door position that rests on each door and glides between them
  const mDwell = f => { const i = Math.floor(f), t = f - i, u = Math.min(1, Math.max(0, (t - .2) / .6)); return i + u * u * (3 - 2 * u); };
  const mProgress = () => Math.min(1, Math.max(0, -sec.getBoundingClientRect().top / mSpan()));
  const mTarget = () => mForce >= 0 ? mForce : mDwell(mProgress() * 3);
  function mShow(i){
    if (i === mShown) return;
    mShown = i; setInfo(i);
    mDots?.querySelectorAll('i').forEach((d, k) => d.classList.toggle('on', k === Math.min(3, i)));
    dinfo.getAnimations().forEach(a => a.cancel());
    if (!reduced) dinfo.animate([{ opacity: 0, transform: 'translateY(.4rem)' }, { opacity: 1, transform: 'none' }], { duration: 360, easing: 'cubic-bezier(.16,1,.3,1)' });
  }
  function mFrame(now){
    mRaf = 0;
    if (!MOB.matches){ mRow.style.transform = ''; return; }
    const dt = Math.min(64, now - (mLast || now)); mLast = now;
    const t = mTarget();
    mCur = reduced ? t : mCur + (t - mCur) * Math.min(1, dt / 1000 * 10);
    mCur = Math.max(t - 1, Math.min(t + 1, mCur));
    if (Math.abs(t - mCur) < .001) mCur = t;
    const step = units[1].offsetLeft - units[0].offsetLeft;
    mRow.style.transform = `translate3d(${(-mCur * step).toFixed(2)}px,0,0)`;
    mIdx = Math.round(t); mShow(mForce >= 0 ? mForce : mIdx);
    if (mCur !== t) mRaf = requestAnimationFrame(mFrame);
  }
  function mApply(){ if (!mRaf) mRaf = requestAnimationFrame(mFrame); }
  // the door takes exactly the height left under the text; on short screens the checklist steps aside for it
  const mPin = $('.doors__pin', sec);
  function mSize(){
    if (!MOB.matches){ mPin.style.removeProperty('--uw'); sec.classList.remove('compact'); return; }
    const fit = () => {
      const pr = mPin.getBoundingClientRect(), rr = mRow.getBoundingClientRect();
      const avail = pr.bottom - rr.top - parseFloat(getComputedStyle(mRow).paddingTop) - 2;
      return Math.min(innerWidth * .6, avail / 2.25);
    };
    sec.classList.remove('compact');
    let w = fit();
    if (w < 150){ sec.classList.add('compact'); w = fit(); }
    mPin.style.setProperty('--uw', Math.max(110, w).toFixed(1) + 'px');
    mApply();
  }
  mSize(); addEventListener('resize', mSize); document.fonts?.ready.then(mSize);
  // when scrolling stops part-way between two doors, ease the page onto the nearest one
  const mGo = top => window.__snapTo(top);
  function mFromScroll(){
    if (!MOB.matches || busy) return;
    mApply();
    clearTimeout(mSettle);
    mSettle = setTimeout(function settle(){
      if (window.__touching){ mSettle = setTimeout(settle, 120); return; }
      if (busy || mForce >= 0 || performance.now() < swipeLock) return;
      const r = sec.getBoundingClientRect(); if (r.top > 0 || r.bottom < innerHeight) return;   // only while the wall is pinned
      const want = mobY(Math.round(mProgress() * 3));
      if (Math.abs(pageYOffset - want) > 2) mGo(want);
    }, 220);
  }
  addEventListener('scroll', mFromScroll, { passive: true });
  addEventListener('resize', () => { mFromScroll(); mApply(); });
  // a sideways swipe steps exactly one door from where the finger landed, however much the page moved meanwhile
  let tx0 = 0, ty0 = 0, i0 = 0;
  sec.addEventListener('touchstart', e => { tx0 = e.touches[0].clientX; ty0 = e.touches[0].clientY; i0 = Math.round(mProgress() * 3); }, { passive: true });
  sec.addEventListener('touchend', e => {
    if (!MOB.matches || busy || mForce >= 0) return;
    const dx = e.changedTouches[0].clientX - tx0, dy = e.changedTouches[0].clientY - ty0;
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
    const to = Math.min(3, Math.max(0, i0 + (dx < 0 ? 1 : -1)));
    swipeLock = performance.now() + 700;
    mGo(mobY(to));
  }, { passive: true });
  if (MOB.matches){ mShown = -1; mShow(0); dinfo.classList.add('on'); mCur = mTarget(); mApply(); }
  MOB.addEventListener?.('change', () => { mForce = -1; mShown = -1; mFromScroll(); mApply(); if (MOB.matches) dinfo.classList.add('on'); });

  // the Photography door sits just past the end of the wall: only the menu (or its link) slides the wall along to it
  const SECRET = 4, secretUnit = units[SECRET];
  function reveal(on){
    sec.classList.toggle('reveal', on);
    if (on) secretUnit.removeAttribute('inert'); else secretUnit.setAttribute('inert', '');
  }
  window.openDoor = i => {
    if (busy || inWall) return;
    const top = MOB.matches ? mobY(Math.min(i, 3)) : sec.getBoundingClientRect().top + pageYOffset;
    const far = Math.abs(pageYOffset - top) > 4;
    if (far){ if (lenis) lenis.scrollTo(top, { duration: .9, easing: x => 1 - Math.pow(1 - x, 3) }); else scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' }); }
    const t0 = performance.now();
    warm(i);
    const settle = () => {
      if (Math.abs(pageYOffset - top) > 24 && performance.now() - t0 < 1500) return requestAnimationFrame(settle);   // open as the scroll lands, not after its tail
      if (!ready[i] && performance.now() - t0 < 4000) return requestAnimationFrame(settle);   // the room is still loading
      const row = $('.doors__row', sec), u = doorsState[i].u;
      let wait = 0;
      if (MOB.matches){
        const want = i === SECRET ? SECRET : i, before = mForce >= 0 ? mForce : mIdx;
        if (i === SECRET){ reveal(true); mForce = SECRET; } else mIdx = i;
        mApply();
        if (want !== before) wait = reduced ? 0 : 560;
      } else if (i === SECRET && !sec.classList.contains('reveal')){ reveal(true); wait = reduced ? 0 : 850; }
      setTimeout(() => enter(i), wait);
    };
    requestAnimationFrame(settle);
  };
  function enter(i){
    if (busy) return;
    busy = true; warm(i); lift();
    showBadge(false);
    window.__doorHover?.(-1); sec.classList.remove('focus'); units.forEach(u => u.classList.remove('on')); dinfo.classList.remove('on');
    const d = doorsState[i];
    doorsState.forEach((o, k) => { if (k !== i) o.s.set(0); });
    d.u.classList.add('press');
    setTimeout(() => d.u.classList.remove('press'), 380);
    setTimeout(() => d.s.set(ANG_WALK / ANG), reduced ? 0 : 170);
    setTimeout(() => through(i), reduced ? 0 : 760);
  }

  // walk through: the whole wall scales up around the lit gap beside the open door until
  // the room behind fills the screen, then the room's own page takes over from the same picture
  // walking through: one GPU-only move. The wall of doors scales up around the dark gap beside the
  // open door until that darkness fills the screen; then the room's photos float in out of it.
  let zoom = null, darkAnim = null, walk = null, walkRaf = 0, walkT = null;
  const dark = $('#passage'), shade = $('#shade');
  // freezes scrolling without touching layout (a layout change here is what caused a stall)
  const swallow = e => e.preventDefault();
  const keysStop = e => { if (['ArrowDown','ArrowUp','PageDown','PageUp',' ','Home','End'].includes(e.key) && !inWall) e.preventDefault(); };
  function holdScroll(on){
    if (on){ lenis?.stop(); addEventListener('wheel', swallow, { passive: false }); addEventListener('touchmove', swallow, { passive: false }); addEventListener('keydown', keysStop); }
    else { lenis?.start(); removeEventListener('wheel', swallow); removeEventListener('touchmove', swallow); removeEventListener('keydown', keysStop); }
  }
  function through(i){
    const u = units[i];
    const r = $('.opening', u).getBoundingClientRect();
    const dr = $('.door', u).getBoundingClientRect();
    const gapL = Math.min(Math.max(dr.right, r.left), r.right - 6);
    const gw = Math.max(r.right - gapL, 10), gh = r.height;
    const cx = (gapL + r.right) / 2, cy = r.top + gh * .5;
    const s = Math.min(60, Math.max(innerWidth / gw, innerHeight / gh) * 1.25);
    holdScroll(true);
    $('#cord')?.classList.add('away'); $('.hdr')?.classList.add('away');
    const ox = cx - gapL, oy = cy - r.top;
    const cover = Math.max(cx / ox, (innerWidth - cx) / (r.right - cx), cy / oy, (innerHeight - cy) / (r.bottom - cy)) * 1.08;
    const timing = { duration: reduced ? 1 : 1600, easing: 'cubic-bezier(.5,0,.75,1)', fill: 'forwards' };
    const sr = sec.getBoundingClientRect();
    sec.style.transformOrigin = `${cx - sr.left}px ${cy - sr.top}px`;
    sec.classList.add('through');
    const tx = innerWidth / 2 - cx, ty = innerHeight / 2 - cy;
    // walk straight through the doorway: the whole scene scales up around the gap, so the frame and door
    // slide out past the left and right edges and the room's own darkness is all that's left.
    // Driven per frame (not as a CSS animation) so the browser scales the existing layer instead of
    // re-rendering the scene at its final zoom first, which is what used to stall.
    const sEnd = Math.max(innerWidth / gw, innerHeight / gh) * 1.15;
    const ease = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    const zoomOf = e => Math.exp(Math.log(sEnd) * e);                        // even speed of approach
    const t0 = performance.now(), D = reduced ? 1 : 1500;
    let handed = false;
    const step = now => {
      const p = Math.min(1, (now - t0) / D), e = ease(p), sc = zoomOf(e);
      const f = Math.min(1, e * 1.6);                                            // drift the door to the centre early on
      sec.style.transform = `translate(${tx * f}px, ${ty * f}px) scale(${sc})`;
      // the moment the dark covers the whole screen, the room takes over: no waiting in the blank
      if (!handed && (sc >= sEnd / 1.15 || p >= 1)){ handed = true; handoff(); }
      if (p < 1) walkRaf = requestAnimationFrame(step);
    };
    walkRaf = requestAnimationFrame(step);
    // as the dark fills the screen, the room takes over (same black, so it's invisible) and the photos start to float in
    function handoff(){
      pick(i);
      if (frameReady){
        wallv.classList.add('on');
        setTimeout(() => {
          inWall = true;
          wallv.classList.add('live');
          try { history.pushState({ wall: 1 }, '', ROUTES[i]); pushed = true; } catch (e) { pushed = false; }
          document.title = TITLES[i] + ' — Abdullo Imomov';
          toWall({ wall: 'enter' });
          try { frame.contentWindow.focus(); } catch (e) {}
        }, 0);
      } else {
        veil.innerHTML = ''; veil.className = 'veil veil--glow'; veil.style.clipPath = 'none'; veil.style.transition = 'none'; veil.hidden = false;
        requestAnimationFrame(() => { location.href = ROUTES[i]; });
      }
    }
  }

  // leaving the room: photos sink back into the dark, you back out of the doorway, the door swings shut
  function leaveWall(){
    if (!inWall) return;
    inWall = false;
    wallv.classList.remove('live');
    document.title = DOC_TITLE;
    const d = doorsState[cur];
    toWall({ wall: 'exit' });
    setTimeout(() => {
      wallv.classList.remove('on');
      setTimeout(() => {
        cancelAnimationFrame(walkRaf);
        const from = sec.style.transform, back = { finished: new Promise(res => {
          const m = /translate\(([-\d.]+)px, ([-\d.]+)px\) scale\(([\d.]+)\)/.exec(from) || [0, 0, 0, 1];
          const X = +m[1], Y = +m[2], S = +m[3], t0 = performance.now(), D = reduced ? 1 : 1300;
          const ease = x => 1 - Math.pow(1 - x, 3);
          const step = now => {
            const p = Math.min(1, (now - t0) / D), e = ease(p);
            const sc = Math.exp(Math.log(S) * (1 - e));
            sec.style.transform = `translate(${X * (1 - e)}px, ${Y * (1 - e)}px) scale(${sc})`;
            if (p < 1) requestAnimationFrame(step); else { sec.style.transform = ''; res(); }
          };
          requestAnimationFrame(step);
        }) };
        back.finished.then(() => {
          cancelAnimationFrame(walkRaf); sec.style.transform = ''; dark.hidden = true; shade.hidden = true;
          sec.classList.remove('through', 'lift'); sec.style.transformOrigin = '';
          d.s.set(0);
          $('#cord')?.classList.remove('away'); $('.hdr')?.classList.remove('away');
          busy = false;
          holdScroll(false);
          toWall({ wall: 'reset' });
          if (afterLeave){ const f = afterLeave; afterLeave = null; setTimeout(f, 60); }
          if (cur === SECRET){
            // back out, then the wall slides back and the Photography door is hidden again
            if (MOB.matches){ mForce = -1; mFromScroll(); mApply(); setTimeout(() => reveal(false), reduced ? 0 : 580); }
            else setTimeout(() => reveal(false), reduced ? 0 : 500);
            units[SECRET - 1].querySelector('.doorway').focus({ preventScroll: true });
          } else d.way.focus({ preventScroll: true });
        });
      }, reduced ? 0 : 360);
    }, reduced ? 0 : 520);
  }
  const DOC_TITLE = document.title;
  let afterLeave = null;
  addEventListener('message', e => {
    if (e.source !== frame?.contentWindow || !e.data) return;
    if (e.data.wall === 'go'){
      // a link in the room's navbar or footer
      const to = String(e.data.to || '');
      if (to === 'contact'){ openModal(); return; }                         // the request form opens right over the room
      const n = to.startsWith('door:') ? +to.slice(5) : -1;
      if (n === cur) return;
      afterLeave = () => { if (n >= 0) window.openDoor(n); else scrollToId(to === 'about' ? 'about' : 'home'); };
    } else if (e.data.wall !== 'close') return;
    if (pushed){ pushed = false; history.back(); } else leaveWall();
  });
  addEventListener('popstate', () => { if (inWall && !(history.state && history.state.wall)){ pushed = false; leaveWall(); } });
  addEventListener('keydown', e => { if (e.key === 'Escape' && inWall && $('#modal').hidden && $('#navm').hidden){ if (pushed){ pushed = false; history.back(); } else leaveWall(); } });
  // keep the room's light/dark in step with the cord
  new MutationObserver(() => frames.forEach(f => { try { f?.contentWindow?.postMessage({ wall: "mode", mode: root.dataset.mode === "dark" ? "dark" : "light" }, location.origin === 'null' ? '*' : location.origin); } catch (e) {} }))
    .observe(root, { attributes: true, attributeFilter: ['data-mode'] });

  // coming back with the browser's Back button: put the wall and the door back as they were
  addEventListener('pageshow', e => {
    if (!busy && !e.persisted) return;
    cancelAnimationFrame(walkRaf); dark.hidden = true; shade.hidden = true;
    sec.classList.remove('through'); sec.style.transform = ''; sec.style.transformOrigin = ''; reveal(false);
    veil.classList.remove('on'); veil.hidden = true; veil.style.clipPath = ''; veil.innerHTML = '';
    wallv.classList.remove('on','live'); wallv.style.clipPath = '';
    $('#cord')?.classList.remove('away'); $('.hdr')?.classList.remove('away');
    doorsState.forEach(d => d.s.set(0));
    if (busy){ busy = false; startScroll(); }
  });
})();

/* ---------- PageLoader: the doors' colours stack up as the page loads, then slides apart to open it ---------- */
const loader = $('#loader');
// back from a door's page (#works): skip the intro and stand in front of the doors again
// (#about and #contact come from the links in a room's navbar and footer)
if (['#works', '#about', '#contact'].includes(location.hash)){
  loader.remove();
  document.body.classList.add('ready');
  const wantContact = location.hash === '#contact';
  requestAnimationFrame(() => {
    if (wantContact) setTimeout(() => openModal(), 400);
    const el = $(location.hash === '#about' ? '#about' : '#works');
    if (el) window.scrollTo(0, el.getBoundingClientRect().top + pageYOffset);
    dispatchEvent(new Event('intro:ready'));
  });
} else {
  stopScroll();
  // whatever happens in the intro, the site always opens: any error, or an intro that hasn't finished in 9 s, lets you straight in
  let introDone = false;
  const bailOut = () => {
    if (introDone) return; introDone = true;
    try { loader.remove(); } catch (e) {}
    document.body.classList.add('ready'); startScroll(); dispatchEvent(new Event('intro:ready'));
  };
  window.__introBail = bailOut;
  setTimeout(bailOut, 9000);
  try {
  const num = $('#ldCount'), pills = [...loader.querySelectorAll('.ld__pill')];
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  // real progress: fonts first, then the page's images; the counter never runs ahead of what has actually loaded
  let ready = .55;
  document.fonts?.ready.then(() => { ready = Math.max(ready, .85); });
  const loaded = () => { ready = 1; };
  if (document.readyState === 'complete') loaded(); else addEventListener('load', loaded, { once: true });
  setTimeout(loaded, 5000);                               // never keep anyone waiting long
  // one colour joins the stack for each sixth of the way
  const paint = p => { loader.style.setProperty('--p', p.toFixed(3)); pills.forEach((el, k) => el.classList.toggle('on', p >= k / 6 + .02 || p >= 1)); };
  const FILL = 1600;
  let t0 = null, shown = 0;
  function loadTick(now){
    if (t0 === null) t0 = now;
    const want = Math.min(ease(Math.min(1, (now - t0) / FILL)), ready);
    shown += (want - shown) * .18; if (want - shown < .002) shown = want;
    paint(shown);
    num.textContent = String(Math.round(shown * 100)).padStart(3, '0');
    if (shown < 1) requestAnimationFrame(t => { try { loadTick(t); } catch (e) { bailOut(); } }); else setTimeout(finish, 520);   // the last colour lands, then it opens
  }
  function finish(){
    loader.classList.add('out');                             // the colours slide away and the curtain lifts
    setTimeout(() => document.body.classList.add('ready'), 260);   // the hero plays its entrance as it is uncovered
    setTimeout(bailOut, 1250);
  }
  if (reduced){ num.textContent = '100'; paint(1); setTimeout(finish, 500); }
  else requestAnimationFrame(t => { try { loadTick(t); } catch (e) { bailOut(); } });
  } catch (e) { bailOut(); }
}

/* ---------- Ability card: the ThreeUI holo card where the device can carry it, a light CSS card where it can't ---------- */
(() => {
  const layer = $('#holo'), open = $('#holoOpen'), fig = $('#fig');
  if (!layer || !open) return;
  const ld = $('#holoLd'), pct = $('#holoPct'), lite = $('#holoLite'), hc = $('#hc');
  const n = navigator;
    let back = null, isOpen = false, liteReady = null, openT = 0;
  const progress = p => { ld.style.setProperty('--p', p); pct.textContent = Math.round(p * 100) + '%'; };
  // the light card's faces, decoded before it is shown so it never appears half-drawn
  // the faces are marked lazy so their weight never lands on a visit that gets the 3D card;
  // asking for them switches them on and waits for them to decode
  const decodeLite = () => liteReady || (liteReady = Promise.all([...lite.querySelectorAll('img')].map(im => {
    im.loading = 'eager';
    return im.decode ? im.decode().catch(() => {}) : Promise.resolve();
  })));
  function showLite(){
    if (!isOpen) return;
    lite.hidden = false; lite.classList.remove('in');
    let creep = .1; const cr = setInterval(() => { creep = Math.min(.92, creep + (1 - creep) * .18); if (!ld.classList.contains('gone')) progress(creep); }, 140);
    decodeLite().then(() => {
      clearInterval(cr); if (!isOpen) return;
      progress(1);
      setTimeout(() => {
        if (!isOpen) return;
        lite.classList.add('in'); ld.classList.add('out');
        hc.classList.remove('flip', 'live'); spin(true);
        setTimeout(() => hc.focus({ preventScroll: true }), 360);
      }, Math.max(300, 950 - (performance.now() - openT)));   // the outline finishes drawing before the card replaces it
    });
  }
  function show(){
    if (isOpen) return; isOpen = true; openT = performance.now();
    back = document.activeElement;
    layer.hidden = false; stopScroll();
    ld.classList.remove('out', 'gone'); progress(0); lite.hidden = true; lite.classList.remove('in');
    (function(){var d=-(Date.now()%2400)+'ms';document.querySelectorAll('.cl__shine').forEach(function(e){e.style.animationDelay=d;});})();
    requestAnimationFrame(() => layer.classList.add('on'));
    showLite();
  }
  function hide(){
    if (!isOpen) return; isOpen = false;
    spin(false); held = false; tx = ty = 0;
    layer.classList.remove('on');
    setTimeout(() => { lite.hidden = true; lite.classList.remove('in'); layer.hidden = true; }, 360);   // unmounted: nothing keeps rendering
    startScroll(); back?.focus?.({ preventScroll: true });
  }
  // warm the card's images in the background once the page is idle, so opening it is instant
  (window.requestIdleCallback || (f => setTimeout(f, 2500)))(() => { decodeLite(); }, { timeout: 4000 });

  /* the card's motion: it leans toward the pointer, follows a finger, answers the phone's own tilt,
     and keeps a slow sway of its own when nobody is touching it. One loop, only while the card is up. */
  const RX = 11, RY = 14;
  const calm = matchMedia('(prefers-reduced-motion:reduce)');
  let tx = 0, ty = 0, cx = 0, cy = 0, held = false, loop = 0, t0 = 0;
  function step(now){
    const sway = (held || calm.matches) ? 0 : 1;
    const t = (now - t0) / 1000;
    cx += ((tx + sway * Math.sin(t * .62) * .34) - cx) * .12;
    cy += ((ty + sway * Math.sin(t * .47 + 1.1) * .22) - cy) * .12;
    const S = hc.style;
    S.setProperty('--px', cx.toFixed(4)); S.setProperty('--py', cy.toFixed(4));
    S.setProperty('--ry', (cx * RY).toFixed(2) + 'deg'); S.setProperty('--rx', (-cy * RX).toFixed(2) + 'deg');
    S.setProperty('--lift', Math.min(1, Math.hypot(cx, cy) * 1.3).toFixed(3));
    loop = requestAnimationFrame(step);
  }
  const spin = on => { cancelAnimationFrame(loop); loop = 0; if (on){ t0 = performance.now(); loop = requestAnimationFrame(step); } };
  const clamp = v => Math.max(-1, Math.min(1, v));
  lite.addEventListener('pointermove', e => {
    const r = hc.getBoundingClientRect(); if (!r.width) return;
    const u = (e.clientX - r.left) / r.width, v = (e.clientY - r.top) / r.height;
    if (u < -.4 || u > 1.4 || v < -.35 || v > 1.35){ held = false; tx = ty = 0; return; }
    held = true; hc.classList.add('live'); tx = clamp((u - .5) * 2); ty = clamp((v - .5) * 2);
  }, { passive: true });
  lite.addEventListener('pointerleave', () => { held = false; tx = ty = 0; });
  // a tap flips it; a drag only turns it
  let from = null;
  hc.addEventListener('pointerdown', e => { from = [e.clientX, e.clientY]; try { hc.setPointerCapture(e.pointerId); } catch (err) {} });
  hc.addEventListener('pointerup', e => {
    if (from && Math.hypot(e.clientX - from[0], e.clientY - from[1]) < 9) hc.classList.toggle('flip');
    from = null;
  });
  hc.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); hc.classList.toggle('flip'); } });
  // phones that report their own tilt move the card without a finger on it
  addEventListener('deviceorientation', e => {
    if (held || e.gamma == null || !isOpen) return;
    tx = clamp(e.gamma / 28); ty = clamp(((e.beta == null ? 45 : e.beta) - 45) / 30);
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) spin(false); else if (isOpen) spin(true); });
  open.addEventListener('click', e => { e.stopPropagation(); show(); });
  fig.addEventListener('click', e => { if (!e.target.closest('.fig__card')) show(); });
  $('#holoClose').addEventListener('click', hide);
  addEventListener('keydown', e => {
    if (!isOpen) return;
    if (e.key === 'Escape') return hide();
    if (e.key !== 'Tab') return;
    // the card layer covers the page, so Tab stays on the card and its close button
    const f = [...layer.querySelectorAll(FOCUSABLE)].filter(n => n.offsetWidth || n.offsetHeight || n.getClientRects().length);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (!layer.contains(document.activeElement)){ e.preventDefault(); first.focus(); return; }
    if (e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
  });
})();

/* ---------- Lenis smooth scroll ---------- */
try {
  if (matchMedia('(hover: none), (pointer: coarse)').matches || root.classList.contains('lite')) throw 0;   // phones and modest devices keep native momentum scrolling
  const { default: Lenis } = await import("data:text/javascript;base64,LyoqCiAqIE1pbmlmaWVkIGJ5IGpzRGVsaXZyIHVzaW5nIFRlcnNlciB2NS4zOS4wLgogKiBPcmlnaW5hbCBmaWxlOiAvbnBtL2xlbmlzQDEuMy4yMy9kaXN0L2xlbmlzLm1qcwogKgogKiBEbyBOT1QgdXNlIFNSSSB3aXRoIGR5bmFtaWNhbGx5IGdlbmVyYXRlZCBmaWxlcyEgTW9yZSBpbmZvcm1hdGlvbjogaHR0cHM6Ly93d3cuanNkZWxpdnIuY29tL3VzaW5nLXNyaS13aXRoLWR5bmFtaWMtZmlsZXMKICovCnZhciB2ZXJzaW9uPSIxLjMuMjMiO2Z1bmN0aW9uIGNsYW1wKHQsZSxpKXtyZXR1cm4gTWF0aC5tYXgodCxNYXRoLm1pbihlLGkpKX1mdW5jdGlvbiBsZXJwKHQsZSxpKXtyZXR1cm4oMS1pKSp0K2kqZX1mdW5jdGlvbiBkYW1wKHQsZSxpLHMpe3JldHVybiBsZXJwKHQsZSwxLU1hdGguZXhwKC1pKnMpKX1mdW5jdGlvbiBtb2R1bG8odCxlKXtyZXR1cm4odCVlK2UpJWV9dmFyIEFuaW1hdGU9Y2xhc3N7aXNSdW5uaW5nPSExO3ZhbHVlPTA7ZnJvbT0wO3RvPTA7Y3VycmVudFRpbWU9MDtsZXJwO2R1cmF0aW9uO2Vhc2luZztvblVwZGF0ZTthZHZhbmNlKHQpe2lmKCF0aGlzLmlzUnVubmluZylyZXR1cm47bGV0IGU9ITE7aWYodGhpcy5kdXJhdGlvbiYmdGhpcy5lYXNpbmcpe3RoaXMuY3VycmVudFRpbWUrPXQ7Y29uc3QgaT1jbGFtcCgwLHRoaXMuY3VycmVudFRpbWUvdGhpcy5kdXJhdGlvbiwxKTtlPWk+PTE7Y29uc3Qgcz1lPzE6dGhpcy5lYXNpbmcoaSk7dGhpcy52YWx1ZT10aGlzLmZyb20rKHRoaXMudG8tdGhpcy5mcm9tKSpzfWVsc2UgdGhpcy5sZXJwPyh0aGlzLnZhbHVlPWRhbXAodGhpcy52YWx1ZSx0aGlzLnRvLDYwKnRoaXMubGVycCx0KSxNYXRoLnJvdW5kKHRoaXMudmFsdWUpPT09TWF0aC5yb3VuZCh0aGlzLnRvKSYmKHRoaXMudmFsdWU9dGhpcy50byxlPSEwKSk6KHRoaXMudmFsdWU9dGhpcy50byxlPSEwKTtlJiZ0aGlzLnN0b3AoKSx0aGlzLm9uVXBkYXRlPy4odGhpcy52YWx1ZSxlKX1zdG9wKCl7dGhpcy5pc1J1bm5pbmc9ITF9ZnJvbVRvKHQsZSx7bGVycDppLGR1cmF0aW9uOnMsZWFzaW5nOm8sb25TdGFydDpuLG9uVXBkYXRlOnJ9KXt0aGlzLmZyb209dGhpcy52YWx1ZT10LHRoaXMudG89ZSx0aGlzLmxlcnA9aSx0aGlzLmR1cmF0aW9uPXMsdGhpcy5lYXNpbmc9byx0aGlzLmN1cnJlbnRUaW1lPTAsdGhpcy5pc1J1bm5pbmc9ITAsbj8uKCksdGhpcy5vblVwZGF0ZT1yfX07ZnVuY3Rpb24gZGVib3VuY2UodCxlKXtsZXQgaTtyZXR1cm4gZnVuY3Rpb24oLi4ucyl7Y2xlYXJUaW1lb3V0KGkpLGk9c2V0VGltZW91dCgoKCk9PntpPXZvaWQgMCx0LmFwcGx5KHRoaXMscyl9KSxlKX19dmFyIERpbWVuc2lvbnM9Y2xhc3N7d2lkdGg9MDtoZWlnaHQ9MDtzY3JvbGxIZWlnaHQ9MDtzY3JvbGxXaWR0aD0wO2RlYm91bmNlZFJlc2l6ZTt3cmFwcGVyUmVzaXplT2JzZXJ2ZXI7Y29udGVudFJlc2l6ZU9ic2VydmVyO2NvbnN0cnVjdG9yKHQsZSx7YXV0b1Jlc2l6ZTppPSEwLGRlYm91bmNlOnM9MjUwfT17fSl7dGhpcy53cmFwcGVyPXQsdGhpcy5jb250ZW50PWUsaSYmKHRoaXMuZGVib3VuY2VkUmVzaXplPWRlYm91bmNlKHRoaXMucmVzaXplLHMpLHRoaXMud3JhcHBlciBpbnN0YW5jZW9mIFdpbmRvdz93aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigicmVzaXplIix0aGlzLmRlYm91bmNlZFJlc2l6ZSk6KHRoaXMud3JhcHBlclJlc2l6ZU9ic2VydmVyPW5ldyBSZXNpemVPYnNlcnZlcih0aGlzLmRlYm91bmNlZFJlc2l6ZSksdGhpcy53cmFwcGVyUmVzaXplT2JzZXJ2ZXIub2JzZXJ2ZSh0aGlzLndyYXBwZXIpKSx0aGlzLmNvbnRlbnRSZXNpemVPYnNlcnZlcj1uZXcgUmVzaXplT2JzZXJ2ZXIodGhpcy5kZWJvdW5jZWRSZXNpemUpLHRoaXMuY29udGVudFJlc2l6ZU9ic2VydmVyLm9ic2VydmUodGhpcy5jb250ZW50KSksdGhpcy5yZXNpemUoKX1kZXN0cm95KCl7dGhpcy53cmFwcGVyUmVzaXplT2JzZXJ2ZXI/LmRpc2Nvbm5lY3QoKSx0aGlzLmNvbnRlbnRSZXNpemVPYnNlcnZlcj8uZGlzY29ubmVjdCgpLHRoaXMud3JhcHBlcj09PXdpbmRvdyYmdGhpcy5kZWJvdW5jZWRSZXNpemUmJndpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCJyZXNpemUiLHRoaXMuZGVib3VuY2VkUmVzaXplKX1yZXNpemU9KCk9Pnt0aGlzLm9uV3JhcHBlclJlc2l6ZSgpLHRoaXMub25Db250ZW50UmVzaXplKCl9O29uV3JhcHBlclJlc2l6ZT0oKT0+e3RoaXMud3JhcHBlciBpbnN0YW5jZW9mIFdpbmRvdz8odGhpcy53aWR0aD13aW5kb3cuaW5uZXJXaWR0aCx0aGlzLmhlaWdodD13aW5kb3cuaW5uZXJIZWlnaHQpOih0aGlzLndpZHRoPXRoaXMud3JhcHBlci5jbGllbnRXaWR0aCx0aGlzLmhlaWdodD10aGlzLndyYXBwZXIuY2xpZW50SGVpZ2h0KX07b25Db250ZW50UmVzaXplPSgpPT57dGhpcy53cmFwcGVyIGluc3RhbmNlb2YgV2luZG93Pyh0aGlzLnNjcm9sbEhlaWdodD10aGlzLmNvbnRlbnQuc2Nyb2xsSGVpZ2h0LHRoaXMuc2Nyb2xsV2lkdGg9dGhpcy5jb250ZW50LnNjcm9sbFdpZHRoKToodGhpcy5zY3JvbGxIZWlnaHQ9dGhpcy53cmFwcGVyLnNjcm9sbEhlaWdodCx0aGlzLnNjcm9sbFdpZHRoPXRoaXMud3JhcHBlci5zY3JvbGxXaWR0aCl9O2dldCBsaW1pdCgpe3JldHVybnt4OnRoaXMuc2Nyb2xsV2lkdGgtdGhpcy53aWR0aCx5OnRoaXMuc2Nyb2xsSGVpZ2h0LXRoaXMuaGVpZ2h0fX19LEVtaXR0ZXI9Y2xhc3N7ZXZlbnRzPXt9O2VtaXQodCwuLi5lKXtjb25zdCBpPXRoaXMuZXZlbnRzW3RdfHxbXTtmb3IobGV0IHQ9MCxzPWkubGVuZ3RoO3Q8czt0KyspaVt0XT8uKC4uLmUpfW9uKHQsZSl7cmV0dXJuIHRoaXMuZXZlbnRzW3RdP3RoaXMuZXZlbnRzW3RdLnB1c2goZSk6dGhpcy5ldmVudHNbdF09W2VdLCgpPT57dGhpcy5ldmVudHNbdF09dGhpcy5ldmVudHNbdF0/LmZpbHRlcigodD0+ZSE9PXQpKX19b2ZmKHQsZSl7dGhpcy5ldmVudHNbdF09dGhpcy5ldmVudHNbdF0/LmZpbHRlcigodD0+ZSE9PXQpKX1kZXN0cm95KCl7dGhpcy5ldmVudHM9e319fTtjb25zdCBMSU5FX0hFSUdIVD0xMDAvNixsaXN0ZW5lck9wdGlvbnM9e3Bhc3NpdmU6ITF9O2Z1bmN0aW9uIGdldERlbHRhTXVsdGlwbGllcih0LGUpe3JldHVybiAxPT09dD9MSU5FX0hFSUdIVDoyPT09dD9lOjF9dmFyIFZpcnR1YWxTY3JvbGw9Y2xhc3N7dG91Y2hTdGFydD17eDowLHk6MH07bGFzdERlbHRhPXt4OjAseTowfTt3aW5kb3c9e3dpZHRoOjAsaGVpZ2h0OjB9O2VtaXR0ZXI9bmV3IEVtaXR0ZXI7Y29uc3RydWN0b3IodCxlPXt3aGVlbE11bHRpcGxpZXI6MSx0b3VjaE11bHRpcGxpZXI6MX0pe3RoaXMuZWxlbWVudD10LHRoaXMub3B0aW9ucz1lLHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCJyZXNpemUiLHRoaXMub25XaW5kb3dSZXNpemUpLHRoaXMub25XaW5kb3dSZXNpemUoKSx0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigid2hlZWwiLHRoaXMub25XaGVlbCxsaXN0ZW5lck9wdGlvbnMpLHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCJ0b3VjaHN0YXJ0Iix0aGlzLm9uVG91Y2hTdGFydCxsaXN0ZW5lck9wdGlvbnMpLHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCJ0b3VjaG1vdmUiLHRoaXMub25Ub3VjaE1vdmUsbGlzdGVuZXJPcHRpb25zKSx0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigidG91Y2hlbmQiLHRoaXMub25Ub3VjaEVuZCxsaXN0ZW5lck9wdGlvbnMpfW9uKHQsZSl7cmV0dXJuIHRoaXMuZW1pdHRlci5vbih0LGUpfWRlc3Ryb3koKXt0aGlzLmVtaXR0ZXIuZGVzdHJveSgpLHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCJyZXNpemUiLHRoaXMub25XaW5kb3dSZXNpemUpLHRoaXMuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCJ3aGVlbCIsdGhpcy5vbldoZWVsLGxpc3RlbmVyT3B0aW9ucyksdGhpcy5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoInRvdWNoc3RhcnQiLHRoaXMub25Ub3VjaFN0YXJ0LGxpc3RlbmVyT3B0aW9ucyksdGhpcy5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoInRvdWNobW92ZSIsdGhpcy5vblRvdWNoTW92ZSxsaXN0ZW5lck9wdGlvbnMpLHRoaXMuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCJ0b3VjaGVuZCIsdGhpcy5vblRvdWNoRW5kLGxpc3RlbmVyT3B0aW9ucyl9b25Ub3VjaFN0YXJ0PXQ9Pntjb25zdHtjbGllbnRYOmUsY2xpZW50WTppfT10LnRhcmdldFRvdWNoZXM/dC50YXJnZXRUb3VjaGVzWzBdOnQ7dGhpcy50b3VjaFN0YXJ0Lng9ZSx0aGlzLnRvdWNoU3RhcnQueT1pLHRoaXMubGFzdERlbHRhPXt4OjAseTowfSx0aGlzLmVtaXR0ZXIuZW1pdCgic2Nyb2xsIix7ZGVsdGFYOjAsZGVsdGFZOjAsZXZlbnQ6dH0pfTtvblRvdWNoTW92ZT10PT57Y29uc3R7Y2xpZW50WDplLGNsaWVudFk6aX09dC50YXJnZXRUb3VjaGVzP3QudGFyZ2V0VG91Y2hlc1swXTp0LHM9LShlLXRoaXMudG91Y2hTdGFydC54KSp0aGlzLm9wdGlvbnMudG91Y2hNdWx0aXBsaWVyLG89LShpLXRoaXMudG91Y2hTdGFydC55KSp0aGlzLm9wdGlvbnMudG91Y2hNdWx0aXBsaWVyO3RoaXMudG91Y2hTdGFydC54PWUsdGhpcy50b3VjaFN0YXJ0Lnk9aSx0aGlzLmxhc3REZWx0YT17eDpzLHk6b30sdGhpcy5lbWl0dGVyLmVtaXQoInNjcm9sbCIse2RlbHRhWDpzLGRlbHRhWTpvLGV2ZW50OnR9KX07b25Ub3VjaEVuZD10PT57dGhpcy5lbWl0dGVyLmVtaXQoInNjcm9sbCIse2RlbHRhWDp0aGlzLmxhc3REZWx0YS54LGRlbHRhWTp0aGlzLmxhc3REZWx0YS55LGV2ZW50OnR9KX07b25XaGVlbD10PT57bGV0e2RlbHRhWDplLGRlbHRhWTppLGRlbHRhTW9kZTpzfT10O2UqPWdldERlbHRhTXVsdGlwbGllcihzLHRoaXMud2luZG93LndpZHRoKSxpKj1nZXREZWx0YU11bHRpcGxpZXIocyx0aGlzLndpbmRvdy5oZWlnaHQpLGUqPXRoaXMub3B0aW9ucy53aGVlbE11bHRpcGxpZXIsaSo9dGhpcy5vcHRpb25zLndoZWVsTXVsdGlwbGllcix0aGlzLmVtaXR0ZXIuZW1pdCgic2Nyb2xsIix7ZGVsdGFYOmUsZGVsdGFZOmksZXZlbnQ6dH0pfTtvbldpbmRvd1Jlc2l6ZT0oKT0+e3RoaXMud2luZG93PXt3aWR0aDp3aW5kb3cuaW5uZXJXaWR0aCxoZWlnaHQ6d2luZG93LmlubmVySGVpZ2h0fX19O2NvbnN0IGRlZmF1bHRFYXNpbmc9dD0+TWF0aC5taW4oMSwxLjAwMS0yKiooLTEwKnQpKTt2YXIgTGVuaXM9Y2xhc3N7X2lzU2Nyb2xsaW5nPSExO19pc1N0b3BwZWQ9ITE7X2lzTG9ja2VkPSExO19wcmV2ZW50TmV4dE5hdGl2ZVNjcm9sbEV2ZW50PSExO19yZXNldFZlbG9jaXR5VGltZW91dD1udWxsO19yYWZJZD1udWxsO2lzVG91Y2hpbmc7dGltZT0wO3VzZXJEYXRhPXt9O2xhc3RWZWxvY2l0eT0wO3ZlbG9jaXR5PTA7ZGlyZWN0aW9uPTA7b3B0aW9uczt0YXJnZXRTY3JvbGw7YW5pbWF0ZWRTY3JvbGw7YW5pbWF0ZT1uZXcgQW5pbWF0ZTtlbWl0dGVyPW5ldyBFbWl0dGVyO2RpbWVuc2lvbnM7dmlydHVhbFNjcm9sbDtjb25zdHJ1Y3Rvcih7d3JhcHBlcjp0PXdpbmRvdyxjb250ZW50OmU9ZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LGV2ZW50c1RhcmdldDppPXQsc21vb3RoV2hlZWw6cz0hMCxzeW5jVG91Y2g6bz0hMSxzeW5jVG91Y2hMZXJwOm49LjA3NSx0b3VjaEluZXJ0aWFFeHBvbmVudDpyPTEuNyxkdXJhdGlvbjpsLGVhc2luZzpoLGxlcnA6YT0uMSxpbmZpbml0ZTpjPSExLG9yaWVudGF0aW9uOnA9InZlcnRpY2FsIixnZXN0dXJlT3JpZW50YXRpb246ZD0oImhvcml6b250YWwiPT09cD8iYm90aCI6InZlcnRpY2FsIiksdG91Y2hNdWx0aXBsaWVyOnU9MSx3aGVlbE11bHRpcGxpZXI6bT0xLGF1dG9SZXNpemU6dj0hMCxwcmV2ZW50OmcsdmlydHVhbFNjcm9sbDp3LG92ZXJzY3JvbGw6Uz0hMCxhdXRvUmFmOmY9ITEsYW5jaG9yczp5PSExLGF1dG9Ub2dnbGU6RT0hMSxhbGxvd05lc3RlZFNjcm9sbDpUPSExLF9fZXhwZXJpbWVudGFsX19uYWl2ZURpbWVuc2lvbnM6Yj0hMSxuYWl2ZURpbWVuc2lvbnM6ej1iLHN0b3BJbmVydGlhT25OYXZpZ2F0ZTpMPSExfT17fSl7d2luZG93LmxlbmlzVmVyc2lvbj12ZXJzaW9uLHdpbmRvdy5sZW5pc3x8KHdpbmRvdy5sZW5pcz17fSksd2luZG93LmxlbmlzLnZlcnNpb249dmVyc2lvbiwiaG9yaXpvbnRhbCI9PT1wJiYod2luZG93LmxlbmlzLmhvcml6b250YWw9ITApLCEwPT09byYmKHdpbmRvdy5sZW5pcy50b3VjaD0hMCksdCYmdCE9PWRvY3VtZW50LmRvY3VtZW50RWxlbWVudHx8KHQ9d2luZG93KSwibnVtYmVyIj09dHlwZW9mIGwmJiJmdW5jdGlvbiIhPXR5cGVvZiBoP2g9ZGVmYXVsdEVhc2luZzoiZnVuY3Rpb24iPT10eXBlb2YgaCYmIm51bWJlciIhPXR5cGVvZiBsJiYobD0xKSx0aGlzLm9wdGlvbnM9e3dyYXBwZXI6dCxjb250ZW50OmUsZXZlbnRzVGFyZ2V0Omksc21vb3RoV2hlZWw6cyxzeW5jVG91Y2g6byxzeW5jVG91Y2hMZXJwOm4sdG91Y2hJbmVydGlhRXhwb25lbnQ6cixkdXJhdGlvbjpsLGVhc2luZzpoLGxlcnA6YSxpbmZpbml0ZTpjLGdlc3R1cmVPcmllbnRhdGlvbjpkLG9yaWVudGF0aW9uOnAsdG91Y2hNdWx0aXBsaWVyOnUsd2hlZWxNdWx0aXBsaWVyOm0sYXV0b1Jlc2l6ZTp2LHByZXZlbnQ6Zyx2aXJ0dWFsU2Nyb2xsOncsb3ZlcnNjcm9sbDpTLGF1dG9SYWY6ZixhbmNob3JzOnksYXV0b1RvZ2dsZTpFLGFsbG93TmVzdGVkU2Nyb2xsOlQsbmFpdmVEaW1lbnNpb25zOnosc3RvcEluZXJ0aWFPbk5hdmlnYXRlOkx9LHRoaXMuZGltZW5zaW9ucz1uZXcgRGltZW5zaW9ucyh0LGUse2F1dG9SZXNpemU6dn0pLHRoaXMudXBkYXRlQ2xhc3NOYW1lKCksdGhpcy50YXJnZXRTY3JvbGw9dGhpcy5hbmltYXRlZFNjcm9sbD10aGlzLmFjdHVhbFNjcm9sbCx0aGlzLm9wdGlvbnMud3JhcHBlci5hZGRFdmVudExpc3RlbmVyKCJzY3JvbGwiLHRoaXMub25OYXRpdmVTY3JvbGwpLHRoaXMub3B0aW9ucy53cmFwcGVyLmFkZEV2ZW50TGlzdGVuZXIoInNjcm9sbGVuZCIsdGhpcy5vblNjcm9sbEVuZCx7Y2FwdHVyZTohMH0pLCh0aGlzLm9wdGlvbnMuYW5jaG9yc3x8dGhpcy5vcHRpb25zLnN0b3BJbmVydGlhT25OYXZpZ2F0ZSkmJnRoaXMub3B0aW9ucy53cmFwcGVyLmFkZEV2ZW50TGlzdGVuZXIoImNsaWNrIix0aGlzLm9uQ2xpY2spLHRoaXMub3B0aW9ucy53cmFwcGVyLmFkZEV2ZW50TGlzdGVuZXIoInBvaW50ZXJkb3duIix0aGlzLm9uUG9pbnRlckRvd24pLHRoaXMudmlydHVhbFNjcm9sbD1uZXcgVmlydHVhbFNjcm9sbChpLHt0b3VjaE11bHRpcGxpZXI6dSx3aGVlbE11bHRpcGxpZXI6bX0pLHRoaXMudmlydHVhbFNjcm9sbC5vbigic2Nyb2xsIix0aGlzLm9uVmlydHVhbFNjcm9sbCksdGhpcy5vcHRpb25zLmF1dG9Ub2dnbGUmJih0aGlzLmNoZWNrT3ZlcmZsb3coKSx0aGlzLnJvb3RFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoInRyYW5zaXRpb25lbmQiLHRoaXMub25UcmFuc2l0aW9uRW5kKSksdGhpcy5vcHRpb25zLmF1dG9SYWYmJih0aGlzLl9yYWZJZD1yZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5yYWYpKX1kZXN0cm95KCl7dGhpcy5lbWl0dGVyLmRlc3Ryb3koKSx0aGlzLm9wdGlvbnMud3JhcHBlci5yZW1vdmVFdmVudExpc3RlbmVyKCJzY3JvbGwiLHRoaXMub25OYXRpdmVTY3JvbGwpLHRoaXMub3B0aW9ucy53cmFwcGVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoInNjcm9sbGVuZCIsdGhpcy5vblNjcm9sbEVuZCx7Y2FwdHVyZTohMH0pLHRoaXMub3B0aW9ucy53cmFwcGVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoInBvaW50ZXJkb3duIix0aGlzLm9uUG9pbnRlckRvd24pLCh0aGlzLm9wdGlvbnMuYW5jaG9yc3x8dGhpcy5vcHRpb25zLnN0b3BJbmVydGlhT25OYXZpZ2F0ZSkmJnRoaXMub3B0aW9ucy53cmFwcGVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoImNsaWNrIix0aGlzLm9uQ2xpY2spLHRoaXMudmlydHVhbFNjcm9sbC5kZXN0cm95KCksdGhpcy5kaW1lbnNpb25zLmRlc3Ryb3koKSx0aGlzLmNsZWFuVXBDbGFzc05hbWUoKSx0aGlzLl9yYWZJZCYmY2FuY2VsQW5pbWF0aW9uRnJhbWUodGhpcy5fcmFmSWQpfW9uKHQsZSl7cmV0dXJuIHRoaXMuZW1pdHRlci5vbih0LGUpfW9mZih0LGUpe3JldHVybiB0aGlzLmVtaXR0ZXIub2ZmKHQsZSl9b25TY3JvbGxFbmQ9dD0+e3QgaW5zdGFuY2VvZiBDdXN0b21FdmVudHx8InNtb290aCIhPT10aGlzLmlzU2Nyb2xsaW5nJiYhMSE9PXRoaXMuaXNTY3JvbGxpbmd8fHQuc3RvcFByb3BhZ2F0aW9uKCl9O2Rpc3BhdGNoU2Nyb2xsZW5kRXZlbnQ9KCk9Pnt0aGlzLm9wdGlvbnMud3JhcHBlci5kaXNwYXRjaEV2ZW50KG5ldyBDdXN0b21FdmVudCgic2Nyb2xsZW5kIix7YnViYmxlczp0aGlzLm9wdGlvbnMud3JhcHBlcj09PXdpbmRvdyxkZXRhaWw6e2xlbmlzU2Nyb2xsRW5kOiEwfX0pKX07Z2V0IG92ZXJmbG93KCl7Y29uc3QgdD10aGlzLmlzSG9yaXpvbnRhbD8ib3ZlcmZsb3cteCI6Im92ZXJmbG93LXkiO3JldHVybiBnZXRDb21wdXRlZFN0eWxlKHRoaXMucm9vdEVsZW1lbnQpW3RdfWNoZWNrT3ZlcmZsb3coKXtbImhpZGRlbiIsImNsaXAiXS5pbmNsdWRlcyh0aGlzLm92ZXJmbG93KT90aGlzLmludGVybmFsU3RvcCgpOnRoaXMuaW50ZXJuYWxTdGFydCgpfW9uVHJhbnNpdGlvbkVuZD10PT57dC5wcm9wZXJ0eU5hbWU/LmluY2x1ZGVzKCJvdmVyZmxvdyIpJiZ0LnRhcmdldD09PXRoaXMucm9vdEVsZW1lbnQmJnRoaXMuY2hlY2tPdmVyZmxvdygpfTtzZXRTY3JvbGwodCl7dGhpcy5pc0hvcml6b250YWw/dGhpcy5vcHRpb25zLndyYXBwZXIuc2Nyb2xsVG8oe2xlZnQ6dCxiZWhhdmlvcjoiaW5zdGFudCJ9KTp0aGlzLm9wdGlvbnMud3JhcHBlci5zY3JvbGxUbyh7dG9wOnQsYmVoYXZpb3I6Imluc3RhbnQifSl9b25DbGljaz10PT57Y29uc3QgZT10LmNvbXBvc2VkUGF0aCgpLmZpbHRlcigodD0+dCBpbnN0YW5jZW9mIEhUTUxBbmNob3JFbGVtZW50JiZ0LmhyZWYpKS5tYXAoKHQ9Pm5ldyBVUkwodC5ocmVmKSkpLGk9bmV3IFVSTCh3aW5kb3cubG9jYXRpb24uaHJlZik7aWYodGhpcy5vcHRpb25zLmFuY2hvcnMpe2NvbnN0IHQ9ZS5maW5kKCh0PT5pLmhvc3Q9PT10Lmhvc3QmJmkucGF0aG5hbWU9PT10LnBhdGhuYW1lJiZ0Lmhhc2gpKTtpZih0KXtjb25zdCBlPSJvYmplY3QiPT10eXBlb2YgdGhpcy5vcHRpb25zLmFuY2hvcnMmJnRoaXMub3B0aW9ucy5hbmNob3JzP3RoaXMub3B0aW9ucy5hbmNob3JzOnZvaWQgMCxpPWAjJHt0Lmhhc2guc3BsaXQoIiMiKVsxXX1gO3JldHVybiB2b2lkIHRoaXMuc2Nyb2xsVG8oaSxlKX19dGhpcy5vcHRpb25zLnN0b3BJbmVydGlhT25OYXZpZ2F0ZSYmZS5zb21lKCh0PT5pLmhvc3Q9PT10Lmhvc3QmJmkucGF0aG5hbWUhPT10LnBhdGhuYW1lKSkmJnRoaXMucmVzZXQoKX07b25Qb2ludGVyRG93bj10PT57MT09PXQuYnV0dG9uJiZ0aGlzLnJlc2V0KCl9O29uVmlydHVhbFNjcm9sbD10PT57aWYoImZ1bmN0aW9uIj09dHlwZW9mIHRoaXMub3B0aW9ucy52aXJ0dWFsU2Nyb2xsJiYhMT09PXRoaXMub3B0aW9ucy52aXJ0dWFsU2Nyb2xsKHQpKXJldHVybjtjb25zdHtkZWx0YVg6ZSxkZWx0YVk6aSxldmVudDpzfT10O2lmKHRoaXMuZW1pdHRlci5lbWl0KCJ2aXJ0dWFsLXNjcm9sbCIse2RlbHRhWDplLGRlbHRhWTppLGV2ZW50OnN9KSxzLmN0cmxLZXkpcmV0dXJuO2lmKHMubGVuaXNTdG9wUHJvcGFnYXRpb24pcmV0dXJuO2NvbnN0IG89cy50eXBlLmluY2x1ZGVzKCJ0b3VjaCIpLG49cy50eXBlLmluY2x1ZGVzKCJ3aGVlbCIpO3RoaXMuaXNUb3VjaGluZz0idG91Y2hzdGFydCI9PT1zLnR5cGV8fCJ0b3VjaG1vdmUiPT09cy50eXBlO2NvbnN0IHI9MD09PWUmJjA9PT1pO2lmKHRoaXMub3B0aW9ucy5zeW5jVG91Y2gmJm8mJiJ0b3VjaHN0YXJ0Ij09PXMudHlwZSYmciYmIXRoaXMuaXNTdG9wcGVkJiYhdGhpcy5pc0xvY2tlZClyZXR1cm4gdm9pZCB0aGlzLnJlc2V0KCk7Y29uc3QgbD0idmVydGljYWwiPT09dGhpcy5vcHRpb25zLmdlc3R1cmVPcmllbnRhdGlvbiYmMD09PWl8fCJob3Jpem9udGFsIj09PXRoaXMub3B0aW9ucy5nZXN0dXJlT3JpZW50YXRpb24mJjA9PT1lO2lmKHJ8fGwpcmV0dXJuO2xldCBoPXMuY29tcG9zZWRQYXRoKCk7aD1oLnNsaWNlKDAsaC5pbmRleE9mKHRoaXMucm9vdEVsZW1lbnQpKTtjb25zdCBhPXRoaXMub3B0aW9ucy5wcmV2ZW50LGM9TWF0aC5hYnMoZSk+PU1hdGguYWJzKGkpPyJob3Jpem9udGFsIjoidmVydGljYWwiO2lmKGguZmluZCgodD0+dCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50JiYoImZ1bmN0aW9uIj09dHlwZW9mIGEmJmE/Lih0KXx8dC5oYXNBdHRyaWJ1dGU/LigiZGF0YS1sZW5pcy1wcmV2ZW50Iil8fCJ2ZXJ0aWNhbCI9PT1jJiZ0Lmhhc0F0dHJpYnV0ZT8uKCJkYXRhLWxlbmlzLXByZXZlbnQtdmVydGljYWwiKXx8Imhvcml6b250YWwiPT09YyYmdC5oYXNBdHRyaWJ1dGU/LigiZGF0YS1sZW5pcy1wcmV2ZW50LWhvcml6b250YWwiKXx8byYmdC5oYXNBdHRyaWJ1dGU/LigiZGF0YS1sZW5pcy1wcmV2ZW50LXRvdWNoIil8fG4mJnQuaGFzQXR0cmlidXRlPy4oImRhdGEtbGVuaXMtcHJldmVudC13aGVlbCIpfHx0aGlzLm9wdGlvbnMuYWxsb3dOZXN0ZWRTY3JvbGwmJnRoaXMuaGFzTmVzdGVkU2Nyb2xsKHQse2RlbHRhWDplLGRlbHRhWTppfSkpKSkpcmV0dXJuO2lmKHRoaXMuaXNTdG9wcGVkfHx0aGlzLmlzTG9ja2VkKXJldHVybiB2b2lkKHMuY2FuY2VsYWJsZSYmcy5wcmV2ZW50RGVmYXVsdCgpKTtpZighKHRoaXMub3B0aW9ucy5zeW5jVG91Y2gmJm98fHRoaXMub3B0aW9ucy5zbW9vdGhXaGVlbCYmbikpcmV0dXJuIHRoaXMuaXNTY3JvbGxpbmc9Im5hdGl2ZSIsdGhpcy5hbmltYXRlLnN0b3AoKSx2b2lkKHMubGVuaXNTdG9wUHJvcGFnYXRpb249ITApO2xldCBwPWk7ImJvdGgiPT09dGhpcy5vcHRpb25zLmdlc3R1cmVPcmllbnRhdGlvbj9wPU1hdGguYWJzKGkpPk1hdGguYWJzKGUpP2k6ZToiaG9yaXpvbnRhbCI9PT10aGlzLm9wdGlvbnMuZ2VzdHVyZU9yaWVudGF0aW9uJiYocD1lKSwoIXRoaXMub3B0aW9ucy5vdmVyc2Nyb2xsfHx0aGlzLm9wdGlvbnMuaW5maW5pdGV8fHRoaXMub3B0aW9ucy53cmFwcGVyIT09d2luZG93JiZ0aGlzLmxpbWl0PjAmJih0aGlzLmFuaW1hdGVkU2Nyb2xsPjAmJnRoaXMuYW5pbWF0ZWRTY3JvbGw8dGhpcy5saW1pdHx8MD09PXRoaXMuYW5pbWF0ZWRTY3JvbGwmJmk+MHx8dGhpcy5hbmltYXRlZFNjcm9sbD09PXRoaXMubGltaXQmJmk8MCkpJiYocy5sZW5pc1N0b3BQcm9wYWdhdGlvbj0hMCkscy5jYW5jZWxhYmxlJiZzLnByZXZlbnREZWZhdWx0KCk7Y29uc3QgZD1vJiZ0aGlzLm9wdGlvbnMuc3luY1RvdWNoLHU9byYmInRvdWNoZW5kIj09PXMudHlwZTt1JiYocD1NYXRoLnNpZ24ocCkqTWF0aC5hYnModGhpcy52ZWxvY2l0eSkqKnRoaXMub3B0aW9ucy50b3VjaEluZXJ0aWFFeHBvbmVudCksdGhpcy5zY3JvbGxUbyh0aGlzLnRhcmdldFNjcm9sbCtwLHtwcm9ncmFtbWF0aWM6ITEsLi4uZD97bGVycDp1P3RoaXMub3B0aW9ucy5zeW5jVG91Y2hMZXJwOjF9OntsZXJwOnRoaXMub3B0aW9ucy5sZXJwLGR1cmF0aW9uOnRoaXMub3B0aW9ucy5kdXJhdGlvbixlYXNpbmc6dGhpcy5vcHRpb25zLmVhc2luZ319KX07cmVzaXplKCl7dGhpcy5kaW1lbnNpb25zLnJlc2l6ZSgpLHRoaXMuYW5pbWF0ZWRTY3JvbGw9dGhpcy50YXJnZXRTY3JvbGw9dGhpcy5hY3R1YWxTY3JvbGwsdGhpcy5lbWl0KCl9ZW1pdCgpe3RoaXMuZW1pdHRlci5lbWl0KCJzY3JvbGwiLHRoaXMpfW9uTmF0aXZlU2Nyb2xsPSgpPT57aWYobnVsbCE9PXRoaXMuX3Jlc2V0VmVsb2NpdHlUaW1lb3V0JiYoY2xlYXJUaW1lb3V0KHRoaXMuX3Jlc2V0VmVsb2NpdHlUaW1lb3V0KSx0aGlzLl9yZXNldFZlbG9jaXR5VGltZW91dD1udWxsKSx0aGlzLl9wcmV2ZW50TmV4dE5hdGl2ZVNjcm9sbEV2ZW50KXRoaXMuX3ByZXZlbnROZXh0TmF0aXZlU2Nyb2xsRXZlbnQ9ITE7ZWxzZSBpZighMT09PXRoaXMuaXNTY3JvbGxpbmd8fCJuYXRpdmUiPT09dGhpcy5pc1Njcm9sbGluZyl7Y29uc3QgdD10aGlzLmFuaW1hdGVkU2Nyb2xsO3RoaXMuYW5pbWF0ZWRTY3JvbGw9dGhpcy50YXJnZXRTY3JvbGw9dGhpcy5hY3R1YWxTY3JvbGwsdGhpcy5sYXN0VmVsb2NpdHk9dGhpcy52ZWxvY2l0eSx0aGlzLnZlbG9jaXR5PXRoaXMuYW5pbWF0ZWRTY3JvbGwtdCx0aGlzLmRpcmVjdGlvbj1NYXRoLnNpZ24odGhpcy5hbmltYXRlZFNjcm9sbC10KSx0aGlzLmlzU3RvcHBlZHx8KHRoaXMuaXNTY3JvbGxpbmc9Im5hdGl2ZSIpLHRoaXMuZW1pdCgpLDAhPT10aGlzLnZlbG9jaXR5JiYodGhpcy5fcmVzZXRWZWxvY2l0eVRpbWVvdXQ9c2V0VGltZW91dCgoKCk9Pnt0aGlzLmxhc3RWZWxvY2l0eT10aGlzLnZlbG9jaXR5LHRoaXMudmVsb2NpdHk9MCx0aGlzLmlzU2Nyb2xsaW5nPSExLHRoaXMuZW1pdCgpfSksNDAwKSl9fTtyZXNldCgpe3RoaXMuaXNMb2NrZWQ9ITEsdGhpcy5pc1Njcm9sbGluZz0hMSx0aGlzLmFuaW1hdGVkU2Nyb2xsPXRoaXMudGFyZ2V0U2Nyb2xsPXRoaXMuYWN0dWFsU2Nyb2xsLHRoaXMubGFzdFZlbG9jaXR5PXRoaXMudmVsb2NpdHk9MCx0aGlzLmFuaW1hdGUuc3RvcCgpfXN0YXJ0KCl7dGhpcy5pc1N0b3BwZWQmJih0aGlzLm9wdGlvbnMuYXV0b1RvZ2dsZT90aGlzLnJvb3RFbGVtZW50LnN0eWxlLnJlbW92ZVByb3BlcnR5KCJvdmVyZmxvdyIpOnRoaXMuaW50ZXJuYWxTdGFydCgpKX1pbnRlcm5hbFN0YXJ0KCl7dGhpcy5pc1N0b3BwZWQmJih0aGlzLnJlc2V0KCksdGhpcy5pc1N0b3BwZWQ9ITEsdGhpcy5lbWl0KCkpfXN0b3AoKXt0aGlzLmlzU3RvcHBlZHx8KHRoaXMub3B0aW9ucy5hdXRvVG9nZ2xlP3RoaXMucm9vdEVsZW1lbnQuc3R5bGUuc2V0UHJvcGVydHkoIm92ZXJmbG93IiwiY2xpcCIpOnRoaXMuaW50ZXJuYWxTdG9wKCkpfWludGVybmFsU3RvcCgpe3RoaXMuaXNTdG9wcGVkfHwodGhpcy5yZXNldCgpLHRoaXMuaXNTdG9wcGVkPSEwLHRoaXMuZW1pdCgpKX1yYWY9dD0+e2NvbnN0IGU9dC0odGhpcy50aW1lfHx0KTt0aGlzLnRpbWU9dCx0aGlzLmFuaW1hdGUuYWR2YW5jZSguMDAxKmUpLHRoaXMub3B0aW9ucy5hdXRvUmFmJiYodGhpcy5fcmFmSWQ9cmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMucmFmKSl9O3Njcm9sbFRvKHQse29mZnNldDplPTAsaW1tZWRpYXRlOmk9ITEsbG9jazpzPSExLHByb2dyYW1tYXRpYzpvPSEwLGxlcnA6bj0obz90aGlzLm9wdGlvbnMubGVycDp2b2lkIDApLGR1cmF0aW9uOnI9KG8/dGhpcy5vcHRpb25zLmR1cmF0aW9uOnZvaWQgMCksZWFzaW5nOmw9KG8/dGhpcy5vcHRpb25zLmVhc2luZzp2b2lkIDApLG9uU3RhcnQ6aCxvbkNvbXBsZXRlOmEsZm9yY2U6Yz0hMSx1c2VyRGF0YTpwfT17fSl7aWYoKHRoaXMuaXNTdG9wcGVkfHx0aGlzLmlzTG9ja2VkKSYmIWMpcmV0dXJuO2xldCBkPXQsdT1lO2lmKCJzdHJpbmciPT10eXBlb2YgZCYmWyJ0b3AiLCJsZWZ0Iiwic3RhcnQiLCIjIl0uaW5jbHVkZXMoZCkpZD0wO2Vsc2UgaWYoInN0cmluZyI9PXR5cGVvZiBkJiZbImJvdHRvbSIsInJpZ2h0IiwiZW5kIl0uaW5jbHVkZXMoZCkpZD10aGlzLmxpbWl0O2Vsc2V7bGV0IHQ9bnVsbDtpZigic3RyaW5nIj09dHlwZW9mIGQ/KHQ9ZG9jdW1lbnQucXVlcnlTZWxlY3RvcihkKSx0fHwoIiN0b3AiPT09ZD9kPTA6Y29uc29sZS53YXJuKCJMZW5pczogVGFyZ2V0IG5vdCBmb3VuZCIsZCkpKTpkIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQmJmQ/Lm5vZGVUeXBlJiYodD1kKSx0KXtpZih0aGlzLm9wdGlvbnMud3JhcHBlciE9PXdpbmRvdyl7Y29uc3QgdD10aGlzLnJvb3RFbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO3UtPXRoaXMuaXNIb3Jpem9udGFsP3QubGVmdDp0LnRvcH1jb25zdCBlPXQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksaT1nZXRDb21wdXRlZFN0eWxlKHQpLHM9dGhpcy5pc0hvcml6b250YWw/TnVtYmVyLnBhcnNlRmxvYXQoaS5zY3JvbGxNYXJnaW5MZWZ0KTpOdW1iZXIucGFyc2VGbG9hdChpLnNjcm9sbE1hcmdpblRvcCksbz1nZXRDb21wdXRlZFN0eWxlKHRoaXMucm9vdEVsZW1lbnQpLG49dGhpcy5pc0hvcml6b250YWw/TnVtYmVyLnBhcnNlRmxvYXQoby5zY3JvbGxQYWRkaW5nTGVmdCk6TnVtYmVyLnBhcnNlRmxvYXQoby5zY3JvbGxQYWRkaW5nVG9wKTtkPSh0aGlzLmlzSG9yaXpvbnRhbD9lLmxlZnQ6ZS50b3ApK3RoaXMuYW5pbWF0ZWRTY3JvbGwtKE51bWJlci5pc05hTihzKT8wOnMpLShOdW1iZXIuaXNOYU4obik/MDpuKX19aWYoIm51bWJlciI9PXR5cGVvZiBkKXtpZihkKz11LHRoaXMub3B0aW9ucy5pbmZpbml0ZSl7aWYobyl7dGhpcy50YXJnZXRTY3JvbGw9dGhpcy5hbmltYXRlZFNjcm9sbD10aGlzLnNjcm9sbDtjb25zdCB0PWQtdGhpcy5hbmltYXRlZFNjcm9sbDt0PnRoaXMubGltaXQvMj9kLT10aGlzLmxpbWl0OnQ8LXRoaXMubGltaXQvMiYmKGQrPXRoaXMubGltaXQpfX1lbHNlIGQ9Y2xhbXAoMCxkLHRoaXMubGltaXQpO2lmKGQ9PT10aGlzLnRhcmdldFNjcm9sbClyZXR1cm4gaD8uKHRoaXMpLHZvaWQgYT8uKHRoaXMpO2lmKHRoaXMudXNlckRhdGE9cD8/e30saSlyZXR1cm4gdGhpcy5hbmltYXRlZFNjcm9sbD10aGlzLnRhcmdldFNjcm9sbD1kLHRoaXMuc2V0U2Nyb2xsKHRoaXMuc2Nyb2xsKSx0aGlzLnJlc2V0KCksdGhpcy5wcmV2ZW50TmV4dE5hdGl2ZVNjcm9sbEV2ZW50KCksdGhpcy5lbWl0KCksYT8uKHRoaXMpLHRoaXMudXNlckRhdGE9e30sdm9pZCByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCgpPT57dGhpcy5kaXNwYXRjaFNjcm9sbGVuZEV2ZW50KCl9KSk7b3x8KHRoaXMudGFyZ2V0U2Nyb2xsPWQpLCJudW1iZXIiPT10eXBlb2YgciYmImZ1bmN0aW9uIiE9dHlwZW9mIGw/bD1kZWZhdWx0RWFzaW5nOiJmdW5jdGlvbiI9PXR5cGVvZiBsJiYibnVtYmVyIiE9dHlwZW9mIHImJihyPTEpLHRoaXMuYW5pbWF0ZS5mcm9tVG8odGhpcy5hbmltYXRlZFNjcm9sbCxkLHtkdXJhdGlvbjpyLGVhc2luZzpsLGxlcnA6bixvblN0YXJ0OigpPT57cyYmKHRoaXMuaXNMb2NrZWQ9ITApLHRoaXMuaXNTY3JvbGxpbmc9InNtb290aCIsaD8uKHRoaXMpfSxvblVwZGF0ZToodCxlKT0+e3RoaXMuaXNTY3JvbGxpbmc9InNtb290aCIsdGhpcy5sYXN0VmVsb2NpdHk9dGhpcy52ZWxvY2l0eSx0aGlzLnZlbG9jaXR5PXQtdGhpcy5hbmltYXRlZFNjcm9sbCx0aGlzLmRpcmVjdGlvbj1NYXRoLnNpZ24odGhpcy52ZWxvY2l0eSksdGhpcy5hbmltYXRlZFNjcm9sbD10LHRoaXMuc2V0U2Nyb2xsKHRoaXMuc2Nyb2xsKSxvJiYodGhpcy50YXJnZXRTY3JvbGw9dCksZXx8dGhpcy5lbWl0KCksZSYmKHRoaXMucmVzZXQoKSx0aGlzLmVtaXQoKSxhPy4odGhpcyksdGhpcy51c2VyRGF0YT17fSxyZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCgpPT57dGhpcy5kaXNwYXRjaFNjcm9sbGVuZEV2ZW50KCl9KSksdGhpcy5wcmV2ZW50TmV4dE5hdGl2ZVNjcm9sbEV2ZW50KCkpfX0pfX1wcmV2ZW50TmV4dE5hdGl2ZVNjcm9sbEV2ZW50KCl7dGhpcy5fcHJldmVudE5leHROYXRpdmVTY3JvbGxFdmVudD0hMCxyZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCgpPT57dGhpcy5fcHJldmVudE5leHROYXRpdmVTY3JvbGxFdmVudD0hMX0pKX1oYXNOZXN0ZWRTY3JvbGwodCx7ZGVsdGFYOmUsZGVsdGFZOml9KXtjb25zdCBzPURhdGUubm93KCk7dC5fbGVuaXN8fCh0Ll9sZW5pcz17fSk7Y29uc3Qgbz10Ll9sZW5pcztsZXQgbixyLGwsaCxhLGMscCxkLHUsbTtpZihzLShvLnRpbWU/PzApPjJlMyl7by50aW1lPURhdGUubm93KCk7Y29uc3QgZT13aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSh0KTtpZihvLmNvbXB1dGVkU3R5bGU9ZSxuPVsiYXV0byIsIm92ZXJsYXkiLCJzY3JvbGwiXS5pbmNsdWRlcyhlLm92ZXJmbG93WCkscj1bImF1dG8iLCJvdmVybGF5Iiwic2Nyb2xsIl0uaW5jbHVkZXMoZS5vdmVyZmxvd1kpLGE9WyJhdXRvIl0uaW5jbHVkZXMoZS5vdmVyc2Nyb2xsQmVoYXZpb3JYKSxjPVsiYXV0byJdLmluY2x1ZGVzKGUub3ZlcnNjcm9sbEJlaGF2aW9yWSksby5oYXNPdmVyZmxvd1g9bixvLmhhc092ZXJmbG93WT1yLCFuJiYhcilyZXR1cm4hMTtwPXQuc2Nyb2xsV2lkdGgsZD10LnNjcm9sbEhlaWdodCx1PXQuY2xpZW50V2lkdGgsbT10LmNsaWVudEhlaWdodCxsPXA+dSxoPWQ+bSxvLmlzU2Nyb2xsYWJsZVg9bCxvLmlzU2Nyb2xsYWJsZVk9aCxvLnNjcm9sbFdpZHRoPXAsby5zY3JvbGxIZWlnaHQ9ZCxvLmNsaWVudFdpZHRoPXUsby5jbGllbnRIZWlnaHQ9bSxvLmhhc092ZXJzY3JvbGxCZWhhdmlvclg9YSxvLmhhc092ZXJzY3JvbGxCZWhhdmlvclk9Y31lbHNlIGw9by5pc1Njcm9sbGFibGVYLGg9by5pc1Njcm9sbGFibGVZLG49by5oYXNPdmVyZmxvd1gscj1vLmhhc092ZXJmbG93WSxwPW8uc2Nyb2xsV2lkdGgsZD1vLnNjcm9sbEhlaWdodCx1PW8uY2xpZW50V2lkdGgsbT1vLmNsaWVudEhlaWdodCxhPW8uaGFzT3ZlcnNjcm9sbEJlaGF2aW9yWCxjPW8uaGFzT3ZlcnNjcm9sbEJlaGF2aW9yWTtpZighKG4mJmx8fHImJmgpKXJldHVybiExO2NvbnN0IHY9TWF0aC5hYnMoZSk+PU1hdGguYWJzKGkpPyJob3Jpem9udGFsIjoidmVydGljYWwiO2xldCBnLHcsUyxmLHksRTtpZigiaG9yaXpvbnRhbCI9PT12KWc9TWF0aC5yb3VuZCh0LnNjcm9sbExlZnQpLHc9cC11LFM9ZSxmPW4seT1sLEU9YTtlbHNle2lmKCJ2ZXJ0aWNhbCIhPT12KXJldHVybiExO2c9TWF0aC5yb3VuZCh0LnNjcm9sbFRvcCksdz1kLW0sUz1pLGY9cix5PWgsRT1jfXJldHVybiFFJiYoZz49d3x8Zzw9MCl8fChTPjA/Zzx3Omc+MCkmJmYmJnl9Z2V0IHJvb3RFbGVtZW50KCl7cmV0dXJuIHRoaXMub3B0aW9ucy53cmFwcGVyPT09d2luZG93P2RvY3VtZW50LmRvY3VtZW50RWxlbWVudDp0aGlzLm9wdGlvbnMud3JhcHBlcn1nZXQgbGltaXQoKXtyZXR1cm4gdGhpcy5vcHRpb25zLm5haXZlRGltZW5zaW9ucz90aGlzLmlzSG9yaXpvbnRhbD90aGlzLnJvb3RFbGVtZW50LnNjcm9sbFdpZHRoLXRoaXMucm9vdEVsZW1lbnQuY2xpZW50V2lkdGg6dGhpcy5yb290RWxlbWVudC5zY3JvbGxIZWlnaHQtdGhpcy5yb290RWxlbWVudC5jbGllbnRIZWlnaHQ6dGhpcy5kaW1lbnNpb25zLmxpbWl0W3RoaXMuaXNIb3Jpem9udGFsPyJ4IjoieSJdfWdldCBpc0hvcml6b250YWwoKXtyZXR1cm4iaG9yaXpvbnRhbCI9PT10aGlzLm9wdGlvbnMub3JpZW50YXRpb259Z2V0IGFjdHVhbFNjcm9sbCgpe2NvbnN0IHQ9dGhpcy5vcHRpb25zLndyYXBwZXI7cmV0dXJuIHRoaXMuaXNIb3Jpem9udGFsP3Quc2Nyb2xsWD8/dC5zY3JvbGxMZWZ0OnQuc2Nyb2xsWT8/dC5zY3JvbGxUb3B9Z2V0IHNjcm9sbCgpe3JldHVybiB0aGlzLm9wdGlvbnMuaW5maW5pdGU/bW9kdWxvKHRoaXMuYW5pbWF0ZWRTY3JvbGwsdGhpcy5saW1pdCk6dGhpcy5hbmltYXRlZFNjcm9sbH1nZXQgcHJvZ3Jlc3MoKXtyZXR1cm4gMD09PXRoaXMubGltaXQ/MTp0aGlzLnNjcm9sbC90aGlzLmxpbWl0fWdldCBpc1Njcm9sbGluZygpe3JldHVybiB0aGlzLl9pc1Njcm9sbGluZ31zZXQgaXNTY3JvbGxpbmcodCl7dGhpcy5faXNTY3JvbGxpbmchPT10JiYodGhpcy5faXNTY3JvbGxpbmc9dCx0aGlzLnVwZGF0ZUNsYXNzTmFtZSgpKX1nZXQgaXNTdG9wcGVkKCl7cmV0dXJuIHRoaXMuX2lzU3RvcHBlZH1zZXQgaXNTdG9wcGVkKHQpe3RoaXMuX2lzU3RvcHBlZCE9PXQmJih0aGlzLl9pc1N0b3BwZWQ9dCx0aGlzLnVwZGF0ZUNsYXNzTmFtZSgpKX1nZXQgaXNMb2NrZWQoKXtyZXR1cm4gdGhpcy5faXNMb2NrZWR9c2V0IGlzTG9ja2VkKHQpe3RoaXMuX2lzTG9ja2VkIT09dCYmKHRoaXMuX2lzTG9ja2VkPXQsdGhpcy51cGRhdGVDbGFzc05hbWUoKSl9Z2V0IGlzU21vb3RoKCl7cmV0dXJuInNtb290aCI9PT10aGlzLmlzU2Nyb2xsaW5nfWdldCBjbGFzc05hbWUoKXtsZXQgdD0ibGVuaXMiO3JldHVybiB0aGlzLm9wdGlvbnMuYXV0b1RvZ2dsZSYmKHQrPSIgbGVuaXMtYXV0b1RvZ2dsZSIpLHRoaXMuaXNTdG9wcGVkJiYodCs9IiBsZW5pcy1zdG9wcGVkIiksdGhpcy5pc0xvY2tlZCYmKHQrPSIgbGVuaXMtbG9ja2VkIiksdGhpcy5pc1Njcm9sbGluZyYmKHQrPSIgbGVuaXMtc2Nyb2xsaW5nIiksInNtb290aCI9PT10aGlzLmlzU2Nyb2xsaW5nJiYodCs9IiBsZW5pcy1zbW9vdGgiKSx0fXVwZGF0ZUNsYXNzTmFtZSgpe3RoaXMuY2xlYW5VcENsYXNzTmFtZSgpLHRoaXMuY2xhc3NOYW1lLnNwbGl0KCIgIikuZm9yRWFjaCgodD0+e3RoaXMucm9vdEVsZW1lbnQuY2xhc3NMaXN0LmFkZCh0KX0pKX1jbGVhblVwQ2xhc3NOYW1lKCl7Zm9yKGNvbnN0IHQgb2YgQXJyYXkuZnJvbSh0aGlzLnJvb3RFbGVtZW50LmNsYXNzTGlzdCkpKCJsZW5pcyI9PT10fHx0LnN0YXJ0c1dpdGgoImxlbmlzLSIpKSYmdGhpcy5yb290RWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKHQpfX07ZXhwb3J0e0xlbmlzIGFzIGRlZmF1bHR9Owo=");
  lenis = new Lenis({ smoothWheel: true }); window.__lenis = lenis;
  if (!scrollEnabled) lenis.stop();
  const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
  requestAnimationFrame(raf);
} catch (err) { /* native scrolling as fallback */ }


// my story: you scroll the chapters naturally. The dot travels the line in step with the page, the year rolls back as each
// chapter reaches the middle of the screen, and (on larger screens) the clock tunnel behind the year turns with your scroll.
(() => {
  const sec = document.querySelector('.story'); if (!sec) return;
  const line = sec.querySelector('.story__line'), list = sec.querySelector('.story__list');
  const chs = [...list.querySelectorAll('.ch')], N = chs.length;
  const cols = [...sec.querySelectorAll('.dg__c')], when = sec.querySelector('.story__when'), count = sec.querySelector('.story__count');
  const dot = sec.querySelector('.story__dot'), rail = sec.querySelector('.story__rail'), cv = sec.querySelector('.story__bg'), ctx = cv.getContext('2d');
  const root = document.documentElement;
  let shownYear = '', shown = -1;
  const setYear = y => { if (y === shownYear) return; shownYear = y; String(y).split('').forEach((d, k) => cols[k] && cols[k].style.setProperty('--d', d)); };
  const show = i => {
    if (i === shown) return; shown = i;
    chs.forEach((c, k) => c.classList.toggle('on', k === i));
    setYear(chs[i].dataset.y); when.textContent = chs[i].dataset.when; count.textContent = String(i + 1).padStart(2, '0');
    sec.classList.toggle('is-now', i === 0);
    sec.dataset.ch = i;                                     // the backdrop light takes this chapter's colour
  };
  // ---- the tunnel ----
  let W = 0, H = 0, dpr = 1, rgb = '23,40,36';
  const size = () => { dpr = Math.min(2, devicePixelRatio || 1); W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; };
  const readRgb = () => { rgb = (getComputedStyle(root).getPropertyValue('--fg-rgb') || '23,40,36').trim(); };
  new MutationObserver(readRgb).observe(root, { attributes: true, attributeFilter: ['data-mode'] });
  const RINGS = 16, GAP = 340, FOCAL = 520, R = 620, TICKS = 60;
  const dust = Array.from({ length: 70 }, () => ({ a: Math.random() * Math.PI * 2, r: 120 + Math.random() * 760, z: Math.random() * RINGS * GAP, s: .6 + Math.random() * 1.4 }));
  function tunnel(p, t){
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    const mob = W < 768, cx = W * .5, cy = H * .55, k = Math.min(W, H) / 900;
    const camZ = p * (N - 1) * GAP * 1.6 + t * 18;          // scrolling carries you deeper into the past; it drifts a little on its own too
    const spin = -p * Math.PI * 1.5 - t * .02;               // the dials wind backwards
    const len = RINGS * GAP;
    ctx.lineCap = 'round';
    for (let i = 0; i < RINGS; i++){
      let z = ((i * GAP - camZ) % len + len) % len + 60;     // distance in front of the camera, recycled
      const s = FOCAL / z * k, fog = Math.min(1, Math.max(0, (z - 260) / 1100)) * Math.max(0, 1 - z / len);   // fades out as it reaches you, so it never sits over the text
      if (fog <= .01) continue;
      const rr = R * s, rot = spin + i * .21;
      // the ring itself
      ctx.strokeStyle = `rgba(${rgb},${(fog * .12).toFixed(3)})`; ctx.lineWidth = Math.max(.5, 1.2 * s);
      ctx.beginPath(); ctx.arc(cx, cy, rr, 0, Math.PI * 2); ctx.stroke();
      // the clock ticks, long ones on the hours: drawn as two batched paths per dial, not one stroke per tick
      const T = W < 768 ? 36 : TICKS, every = T / 12;
      for (const hour of [false, true]){
        const l = (hour ? 46 : 18) * s;
        ctx.beginPath();
        for (let j = 0; j < T; j++){
          if ((j % every === 0) !== hour) continue;
          const a = rot + j / T * Math.PI * 2, c = Math.cos(a), d = Math.sin(a);
          ctx.moveTo(cx + c * (rr - l), cy + d * (rr - l)); ctx.lineTo(cx + c * rr, cy + d * rr);
        }
        ctx.strokeStyle = `rgba(${rgb},${(fog * (hour ? .3 : .14)).toFixed(3)})`; ctx.lineWidth = Math.max(.5, (hour ? 3 : 1.4) * s); ctx.stroke();
      }
      // a single hand on each dial
      const ha = rot * 3 + i;
      ctx.strokeStyle = `rgba(${rgb},${(fog * .16).toFixed(3)})`; ctx.lineWidth = Math.max(.5, 2 * s);
      if (rr < Math.min(W, H) * .45){ ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(ha) * rr * .55, cy + Math.sin(ha) * rr * .55); ctx.stroke(); }
    }
    // dust drifting past
    for (const q of dust){
      const z = ((q.z - camZ * 1.1) % len + len) % len + 40, s = FOCAL / z * k, fog = Math.min(1, Math.max(0, (z - 300) / 900)) * Math.max(0, 1 - z / len);
      const a = q.a + spin * .3;
      ctx.fillStyle = `rgba(${rgb},${(fog * .35).toFixed(3)})`;
      ctx.beginPath(); ctx.arc(cx + Math.cos(a) * q.r * s, cy + Math.sin(a) * q.r * s, Math.max(.4, q.s * s * 2.2), 0, Math.PI * 2); ctx.fill();
    }
  }

  // positions along the line, measured once (and again on resize), never during a scroll
  let firstY = 0, lastY = 0, endY = 0;
  const measure = () => {
    const mark = c => line.offsetTop * 0 + list.offsetTop + c.offsetTop + c.firstElementChild.offsetTop + 8;
    firstY = mark(chs[0]); lastY = mark(chs[N - 1]);
    const last = chs[N - 1]; endY = list.offsetTop + last.offsetTop + last.offsetHeight - parseFloat(getComputedStyle(last).paddingBottom);
    for (const el of [rail, sec.querySelector('.story__dtrack'), sec.querySelector('.story__ttrack')]){ el.style.setProperty('--r0', firstY + 'px'); el.style.setProperty('--rh', (endY - firstY) + 'px'); }
    if (innerWidth >= 768) size();
  };
  let raf = 0, p = 0, dotY = null, lastT = 0;
  function update(){
    raf = 0;
    const lr = line.getBoundingClientRect(), mid = innerHeight * .5;
    // the dot sits wherever the middle of the screen falls on the line
    const y = Math.min(lastY, Math.max(firstY, mid - lr.top));
    p = (y - firstY) / Math.max(1, lastY - firstY);
    sec.style.setProperty('--p', p.toFixed(4)); sec.style.setProperty('--warm', p.toFixed(3));
    sec.classList.toggle('at-start', p < .002);                // nothing travelled yet: no tail poking above the line
    let i = 0; for (let k = 0; k < N; k++) if (lr.top + list.offsetTop + chs[k].offsetTop < mid + 40) i = k;
    show(i);
    if (innerWidth >= 768 && !reducedM && !root.classList.contains('lite')) tunnel(p, 0);
  }
  const reducedM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const q = () => { if (!raf) raf = requestAnimationFrame(update); };
  addEventListener('scroll', q, { passive: true });
  addEventListener('resize', () => { measure(); q(); });
  new MutationObserver(() => { readRgb(); q(); }).observe(root, { attributes: true, attributeFilter: ['data-mode'] });
  readRgb(); measure(); show(0); update();
  document.fonts?.ready.then(() => { measure(); q(); });
  addEventListener('load', () => { measure(); q(); });
})();
