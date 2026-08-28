const state = { data: null, filter: "all", includeFounder: false };
const $ = (id) => document.getElementById(id);
function pad(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }
function animateCount(el, to) {
  const t0 = performance.now();
  const tick = (now) => {
    const p = Math.min(1, (now - t0) / 1400);
    el.textContent = pad(Math.round(to * (1 - Math.pow(1 - p, 3))));
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
function catSum(ids) {
  return state.data.categories.filter((c) => ids.includes(c.id)).reduce((s, c) => s + (c.count || 0), 0);
}
function lanes() {
  const written = catSum(["aswritten"]);
  const misread = catSum(["misread"]);
  const disputed = state.includeFounder ? catSum(["disputed"]) : 0;
  return { written, misread, disputed, floor: written + misread + disputed };
}
function renderCats() {
  $("cats").innerHTML = state.data.categories.map((c) => `
    <article class="cat ${c.emerging ? "emerging" : ""}">
      <h3>${c.short}</h3>
      <div class="n">${pad(c.count)}</div>
      <p>${c.tone}</p>
    </article>`).join("");
}
function renderStats() {
  $("stats").innerHTML = state.data.supportingStats.map((s) => `
    <article class="stat"><b>${s.stat}</b><span>${s.label}</span><div><a href="${s.url}" target="_blank" rel="noopener">${s.source}</a></div></article>`).join("");
}
const CAT_AR = { aswritten: "تطبيق النص", misread: "فهم مغلوط", disputed: "سبب غير محسوم", icu: "عناية مركزة" };

function renderLog() {
  const rows = state.data.cases.filter((c) => state.filter === "all" || c.category === state.filter).sort((a, b) => b.date.localeCompare(a.date));
  $("log").innerHTML = rows.map((c) => `
    <article class="card">
      <div class="meta"><span>${c.date}</span><span>${CAT_AR[c.category] || c.category}</span><span>${c.fatalities} وفاة</span><span class="grade">درجة ${c.grade}</span><span>${c.status}</span></div>
      <h3>${c.title}</h3><p>${c.summary}</p>
      <p style="margin-top:8px;color:#9a8882">${c.location}</p>
      <div class="sources">${c.sources.map((s) => `<a href="${s.url}" target="_blank" rel="noopener">↗ ${s.name}</a>`).join("")}</div>
    </article>`).join("");
}
function renderHeads() {
  const L = lanes();
  const cards = [
    { id: "written", name: "تطبيق النص", en: "AS-WRITTEN", sub: "فعل ما نُشر باسم النظام", hint: "أوقف الإنسولين أو الدواء، أو رفض الغسيل والقسطرة، كما ظهر في المحتوى العلني.", n: L.written },
    { id: "misread", name: "فهم مغلوط", en: "MISREAD", sub: "طبّق غير ما ثبت في النص", hint: "تحريف للقائمة أو تشديد زائد. لا وفاة مسمّاة موثّقة في هذا الباب حتى الآن، لذلك الرقم صفر.", n: L.misread },
    { id: "disputed", name: "سبب غير محسوم", en: "DISPUTED", sub: "وفاة المؤسس", hint: "جلطة في دبي. التقرير الرسمي لا ينسبها للحمية. تظهر في البطاقة، ولا تدخل المجموع الكبير إلا إذا فعّلت الخيار.", n: state.includeFounder ? L.disputed : catSum(["disputed"]) },
    { id: "floor", name: "الحد الأدنى الموثَّق", en: "DOCUMENTED FLOOR", sub: "أقل رقم يمكن الدفاع عنه اليوم", hint: "«الأرضية» = حد أدنى لا سقف. جمع الوفيات المسمّاة في خبر مفتوح الرابط، بلا تكرار. ليست حصراً وزارياً وليست حكماً قضائياً.", n: L.floor }
  ];
  $("heads").innerHTML = cards.map((h) => `
    <article class="head ${h.id}">
      <div class="head-name">${h.name}<span class="en-tag">${h.en}</span></div>
      <div class="head-n">${pad(h.n)}</div>
      <div class="head-sub">${h.sub}</div>
      <p>${h.hint}</p>
    </article>`).join("");
}
function renderHeadline() {
  const total = lanes().floor;
  animateCount($("headline-count"), total);
  $("headline-label").textContent = "الحد الأدنى الموثَّق · DOCUMENTED FLOOR";
  $("headline-note").textContent = state.data.headline.note;
  $("headline-range").textContent = `الأرضية = الحد الأدنى ${pad(total)}  ·  ليست سقفاً  ·  حالات مسمّاة فقط`;
  renderHeads();
}
function toastEmerging() {
  state.data.categories.filter((c) => c.emerging && c.count).forEach((c, i) => {
    setTimeout(() => {
      const t = document.createElement("div");
      t.className = "toast";
      t.innerHTML = `<b>+ ${c.short}</b><span>${c.count} حالة في السجل</span>`;
      $("toast-layer").appendChild(t);
      setTimeout(() => t.remove(), 4200);
    }, 900 + i * 1400);
  });
}
async function boot() {
  state.data = window.TOLL;
  $("as-of").textContent = "حتى " + state.data.asOf;
  $("disclaimer").textContent = state.data.meta.disclaimer;
  renderHeadline(); renderCats(); renderStats(); renderLog(); toastEmerging();
  if (window.renderSurvey) renderSurvey();
  const tick = () => { $("clock").textContent = new Date().toISOString().replace("T", " ").slice(0, 19) + "Z"; };
  tick(); setInterval(tick, 1000);
  document.querySelectorAll(".chip").forEach((btn) => {
    btn.onclick = () => {
      document.querySelectorAll(".chip").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      state.filter = btn.dataset.filter;
      renderLog();
    };
  });
  $("include-founder").onchange = (e) => { state.includeFounder = e.target.checked; renderHeadline(); };
}
boot();
