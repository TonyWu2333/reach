// Connectors: straight gradient spokes from the octopus to each app on the orbit, with a light travelling out.
const stage = document.getElementById('stage');
const svg = document.getElementById('arms');
const NS = 'http://www.w3.org/2000/svg';
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

const el = (tag, attrs, parent) => {
  const n = document.createElementNS(NS, tag);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  parent.appendChild(n);
  return n;
};

function drawArms() {
  const box = stage.getBoundingClientRect();
  const o = stage.querySelector('.octo').getBoundingClientRect();
  // Straight spokes from the octopus's head to each app on the orbit.
  const cx = o.left + o.width / 2 - box.left;
  const cy = o.top + o.height * 0.45 - box.top;
  const rx = o.width * 0.38, ry = o.height * 0.36;
  svg.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
  svg.replaceChildren();
  const defs = el('defs', {}, svg);

  stage.querySelectorAll('.orb').forEach((orb, i) => {
    const r = orb.querySelector('.icon').getBoundingClientRect();
    const ix = r.left + r.width / 2 - box.left;
    const iy = r.top + r.height / 2 - box.top;
    const t = Math.atan2(iy - cy, ix - cx);
    const sx = cx + rx * Math.cos(t), sy = cy + ry * Math.sin(t);
    const gap = r.width * 0.62 + 8;
    const len = Math.hypot(ix - sx, iy - sy) - gap;
    const ex = sx + Math.cos(t) * len, ey = sy + Math.sin(t) * len;
    const d = `M${sx},${sy} L${ex},${ey}`;

    const color = getComputedStyle(orb).getPropertyValue('--c').trim();
    const g = el('linearGradient', { id: `arm-${i}`, gradientUnits: 'userSpaceOnUse', x1: sx, y1: sy, x2: ex, y2: ey }, defs);
    el('stop', { offset: 0, 'stop-color': '#B7A6F6', 'stop-opacity': 0 }, g);
    el('stop', { offset: 1, 'stop-color': color, 'stop-opacity': 0.8 }, g);
    el('path', { d, class: 'line', stroke: `url(#arm-${i})` }, svg);

    if (still) return;
    const spark = el('circle', { r: 2.6, opacity: 0, class: 'spark', fill: color, style: `color:${color}` }, svg);
    const dur = 3, begin = `${i * 0.5}s`;
    el('animateMotion', { dur: `${dur}s`, begin, repeatCount: 'indefinite', path: d, keyPoints: '0;1', keyTimes: '0;1', calcMode: 'spline', keySplines: '.4 0 .2 1' }, spark);
    el('animate', { attributeName: 'opacity', dur: `${dur}s`, begin, repeatCount: 'indefinite', values: '0;1;1;0', keyTimes: '0;.25;.75;1' }, spark);
  });
}
new ResizeObserver(drawArms).observe(stage);
addEventListener('load', drawArms);

// Nav hairline once the page scrolls.
const nav = document.querySelector('.nav');
const onScroll = () => nav.classList.toggle('scrolled', scrollY > 8);
addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Reveal blocks as they enter, and play the agent conversation line by line.
const term = document.querySelector('.term-body');
[...term.children].forEach((el, i) => (el.style.transitionDelay = `${0.2 + i * 0.4}s`));

const targets = document.querySelectorAll(
  '.m-foot, .principles > div, .product-head, .screens, .features > div, .agent-head, .steps li, .section-head, .lu, .log li'
);
targets.forEach((el) => el.classList.add('reveal'));

const io = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      e.target.classList.add(e.target === term ? 'play' : 'in');
      io.unobserve(e.target);
    }
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);
targets.forEach((el) => io.observe(el));
io.observe(term);

// Manifesto: characters go from faint to full as the paragraph scrolls through the viewport.
const manifesto = document.querySelector('.m-text');
const chars = [];
(function wrap(node) {
  for (const n of [...node.childNodes]) {
    if (n.nodeType === 3) {
      const frag = document.createDocumentFragment();
      for (const ch of n.textContent) {
        if (/\s/.test(ch)) { frag.append(ch); continue; }
        const s = document.createElement('span');
        s.className = 'ch';
        s.textContent = ch;
        chars.push(s);
        frag.append(s);
      }
      n.replaceWith(frag);
    } else wrap(n);
  }
})(manifesto);

let lit = -1;
function paintManifesto() {
  const r = manifesto.getBoundingClientRect();
  const vh = innerHeight;
  const p = still ? 1 : Math.min(1, Math.max(0, (vh * 0.8 - r.top) / (r.height + vh * 0.25)));
  const n = Math.round(p * chars.length);
  if (n === lit) return;
  chars.forEach((c, i) => c.classList.toggle('lit', i < n));
  lit = n;
}
addEventListener('scroll', paintManifesto, { passive: true });
addEventListener('resize', paintManifesto);
paintManifesto();

// Remember an explicit language choice so the auto-redirect in <head> respects it.
document.querySelectorAll('.nav-lang').forEach((a) =>
  a.addEventListener('click', () => {
    try { localStorage.setItem('reach-lang', a.dataset.lang); } catch (e) {}
  })
);
