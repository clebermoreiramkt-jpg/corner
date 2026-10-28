import "./style.css";
import { DATA, type Prancha, type AdItem } from "./data";

const $ = <T extends Element = HTMLElement>(s: string, el: Document | Element = document) =>
  el.querySelector<T>(s)!;
const esc = (s: unknown) =>
  String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] || c));
const pad = (n: number) => String(n).padStart(2, "0");

/* storage (per-viewer convenience) */
const store = {
  get<T>(k: string, d: T): T {
    try {
      const v = localStorage.getItem("corner." + k);
      return v ? JSON.parse(v) : d;
    } catch {
      return d;
    }
  },
  set(k: string, v: unknown) {
    try {
      localStorage.setItem("corner." + k, JSON.stringify(v));
    } catch {}
  },
};

const fav = new Set<number>(store.get<number[]>("fav", []));
const usedAt: Record<number, string> =
  store.get<Record<number, string> | null>("usedAt", null) ||
  Object.fromEntries(store.get<number[]>("used", []).map((n) => [n, new Date().toISOString().slice(0, 10)]));
const used = { has: (n: number) => !!usedAt[n] };
const notes: Record<string, string> = store.get("notes", {});
const logx: Record<string, { m?: string; o?: string }> = store.get("logx", {});

/* toast + copy */
const toastEl = $("#toast");
let tt: ReturnType<typeof setTimeout> | undefined;
function toast(msg: string) {
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  clearTimeout(tt);
  tt = setTimeout(() => toastEl.classList.remove("show"), 1600);
}
function fallbackCopy(text: string) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "");
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {}
  document.body.removeChild(ta);
  return ok;
}
function copy(text: string, label: string) {
  const done = () => toast(label + " copiado");
  const fail = () => {
    if (fallbackCopy(text)) done();
    else toast("Não deu para copiar. Selecione o texto e copie.");
  };
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fail);
    else fail();
  } catch {
    fail();
  }
}

/* tabs */
const views = ["mapa", "templates", "anuncios", "criar", "registro"];
function show(v: string, push?: boolean) {
  if (!views.includes(v)) v = "mapa";
  $("#hero").hidden = v !== "mapa";
  if (v === "registro") renderLog();
  views.forEach((x) => {
    $("#view-" + x).hidden = x !== v;
    $("#tab-" + x).setAttribute("aria-selected", x === v ? "true" : "false");
  });
  store.set("tab", v);
  if (push) {
    try {
      history.replaceState(null, "", "#" + v);
    } catch {}
  }
}
document.querySelectorAll<HTMLButtonElement>(".tab").forEach((b) =>
  b.addEventListener("click", () => show(b.dataset.view || "mapa", true))
);

/* ---------- Templates ---------- */
const T = DATA.tpl;
const clock = (t: string) =>
  ({ "15 segundos": "0:15", "30 segundos": "0:30", "1 minuto": "1:00", "5 minutos": "5:00" }[t] || t);
const precLabel: Record<string, string> = {
  "Só o professor": "Só você",
  "Alunos na aula": "Turma treinando",
  "Aluno específico": "Um aluno (com autorização)",
  "Material do aluno": "Print ou post de aluno",
  "Parceiro de treino": "Um parceiro de treino",
};
const INTENTS: [string, string, (t: Prancha) => boolean][] = [
  ["todos", "Todos", () => true],
  ["agora", "Gravar agora", (t) => t.dif === "Fácil" && t.prec === "Só o professor"],
  ["alunos", "Quero alunos", (t) => t.obj.includes("Captação")],
  ["ensinar", "Quero ensinar", (t) => t.cat === "Educação" || t.obj.includes("Educação")],
  ["conexao", "Quero conexão", (t) => t.cat === "Humanização" || t.cat === "Relacionamento"],
  ["evolucao", "Mostrar evolução", (t) => t.cat === "Alunos" || t.cat === "Evolução"],
  ["provocar", "Quero provocar", (t) => t.cat === "Provocativo"],
  ["faceis", "Fáceis", (t) => t.dif === "Fácil"],
  ["favoritos", "Favoritos", (t) => fav.has(t.n)],
  ["usados", "Usados", (t) => used.has(t.n)],
];
const FORMATS = ["Story", "Reels", "Foto", "Texto", "Repost"];
const CATS = [
  "Preparação",
  "Alunos",
  "Evolução",
  "Educação",
  "Curiosidade",
  "Humanização",
  "Bastidores",
  "Venda",
  "Relacionamento",
  "Provocativo",
];
const CAT_DESC: Record<string, string> = {
  Preparação: "O que acontece antes da aula.",
  Alunos: "Fala com o medo de quem ainda não começou.",
  Evolução: "Prova que o treino funciona.",
  Educação: "Ensina e te coloca como referência.",
  Curiosidade: "O que quase ninguém conta sobre treinar.",
  Humanização: "A pessoa por trás da academia.",
  Bastidores: "O dia a dia, da porta abrindo ao tatame vazio.",
  Venda: "Aula experimental, vaga e matrícula.",
  Relacionamento: "Responde, agradece, coloca o aluno no centro.",
  Provocativo: "Tira o seguidor da zona de conforto.",
};
const coordOf = (i: number) => "ABCDE"[i % 5] + (1 + Math.floor(i / 5));
T.forEach((t, i) => {
  t.reg = Math.floor(i / 10);
  t.code = coordOf(t.reg) + "·" + pad((i % 10) + 1);
});
let region: number | null = null;
let intent = "todos";
let format: string | null = null;
let query = "";
const open = new Set<number>();

/* drawings */
const G = DATA.G;
const KEYS: [string, string[]][] = [
  ["chat", ["print", "repost", "comentário", "mensagem", "depoimento", "caixa de perguntas", "enquete"]],
  ["notebook", ["caderno"]],
  ["timer", ["cronômetro"]],
  ["calendar", ["calendário", "agenda"]],
  ["hands", ["bandagem", "enfaix", "mãos", "mão "]],
  ["belt", ["graduação", " faixa", "medalha", "cinturão"]],
  ["feet", ["pés", "pé ", "corda", "tênis"]],
  ["glove_bag", ["luva", "saco", "aparador", "golpe", "chute"]],
  ["door", ["porta"]],
  ["group", ["costas", "turma", "alunos", "silhueta", "de longe", "iniciantes", "aluno"]],
  ["mat", ["tatame"]],
  ["phone", ["celular", "tela com", "vídeo", "tripé", "produto"]],
];
const SHOT_NAME: Record<string, string> = {
  hands: "Close nas mãos",
  glove_bag: "Luva e saco",
  feet: "Pés no tatame",
  group: "Turma de costas",
  door: "Porta da academia",
  text: "Só texto",
  chat: "Print na tela",
  mat: "Tatame",
  timer: "Cronômetro",
  notebook: "Caderno de aula",
  phone: "Celular na mão",
  belt: "Faixa e graduação",
  calendar: "Calendário",
};
function kindOf(c: string) {
  c = c.toLowerCase();
  for (const [k, ws] of KEYS) if (ws.some((w) => c.includes(w))) return k;
  return "text";
}
function firstLine(ex: string) {
  const s = ex.split(/(?<=[.?!])\s/)[0];
  return s.length <= 46 ? s : s.slice(0, 46).replace(/\s\S*$/, "") + "…";
}
function shotSVG(t: Prancha) {
  const k = kindOf(t.cena);
  return `<figure class="shot"><svg viewBox="0 0 100 178" role="img" aria-label="Plano de gravação: ${SHOT_NAME[k]}"><rect x="2" y="2" width="96" height="174" rx="13" fill="none" stroke="currentColor" stroke-width="2"/><path d="M40 9 L 60 9" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><g transform="translate(5 24)" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${G[k]}</g><rect x="8" y="136" width="84" height="32" rx="4" fill="currentColor"/><foreignObject x="10" y="137" width="80" height="30"><div xmlns="http://www.w3.org/1999/xhtml" class="capt">${esc(firstLine(t.ex))}</div></foreignObject></svg><figcaption>${SHOT_NAME[k]}</figcaption></figure>`;
}
const glove = (on: boolean) =>
  `<svg viewBox="0 0 20 24" class="pi" aria-hidden="true"><path d="M3 10 C 2 5, 8 2, 12 4 C 17 6, 18 12, 15 15 L 14 18 L 5 18 L 5 15 C 3 14, 3 12, 3 10 Z M5 18 L 14 18 L 14 22 L 5 22 Z" fill="${on ? "currentColor" : "none"}" stroke="currentColor" stroke-width="1.4" opacity="${on ? 1 : 0.35}"/></svg>`;
const DIFN: Record<string, number> = { Fácil: 1, Médio: 2, Elaborado: 3 };
const gloves = (d: string) => [0, 1, 2].map((i) => glove(i < DIFN[d])).join("");
function dial(tempo: string) {
  const f = ({ "15 segundos": 0.25, "30 segundos": 0.5, "1 minuto": 0.75, "5 minutos": 1 } as Record<string, number>)[tempo];
  const r = 11;
  const a = 2 * Math.PI * f - Math.PI / 2;
  const pie =
    f >= 1
      ? `<circle cx="14" cy="14" r="${r}" fill="var(--red)"/>`
      : `<path d="M14 14 L 14 3 A ${r} ${r} 0 ${f > 0.5 ? 1 : 0} 1 ${(14 + r * Math.cos(a)).toFixed(2)} ${(14 + r * Math.sin(a)).toFixed(2)} Z" fill="var(--red)"/>`;
  return `<span class="dial"><svg viewBox="0 0 28 28" class="pi big" aria-hidden="true"><circle cx="14" cy="14" r="12.5" fill="none" stroke="currentColor" stroke-width="1.4"/>${pie}<path d="M11 .8 L 17 .8" stroke="currentColor" stroke-width="1.6"/></svg><b>${clock(tempo)}</b></span>`;
}
const person = (f = true) =>
  `<svg viewBox="0 0 14 20" class="pi" aria-hidden="true"><circle cx="7" cy="5" r="3.6" fill="${f ? "currentColor" : "none"}" stroke="currentColor" stroke-width="1.2"/><path d="M1 19 C 1 11, 13 11, 13 19 Z" fill="${f ? "currentColor" : "none"}" stroke="currentColor" stroke-width="1.2"/></svg>`;
const phoneI = `<svg viewBox="0 0 14 20" class="pi" aria-hidden="true"><rect x="2" y="1" width="10" height="18" rx="2" fill="none" stroke="currentColor" stroke-width="1.3"/></svg>`;
const who = (p: string) =>
  (({
    "Só o professor": person(),
    "Alunos na aula": person(false).repeat(3),
    "Aluno específico": person() + person(false),
    "Material do aluno": phoneI,
    "Parceiro de treino": person() + person(),
  } as Record<string, string>)[p] || "");
const FMT_I: Record<string, string> = {
  Story: '<rect x="3" y="1" width="12" height="20" rx="2.4"/><path d="M5 4 L 8.5 4 M9.5 4 L 13 4"/>',
  Reels: '<rect x="3" y="1" width="12" height="20" rx="2.4"/><path d="M7.5 8 L 11.5 11 L 7.5 14 Z"/>',
  Foto: '<rect x="1" y="4" width="16" height="14" rx="1.6"/><path d="M2 16 L 7 10 L 10 13 L 12 11 L 16 16"/>',
  Texto: '<path d="M2 6 L 16 6 M2 10 L 14 10 M2 14 L 10 14"/>',
  Repost:
    '<path d="M3 8 C 3 5, 5 4, 8 4 L 14 4 M12 2 L 14.5 4 L 12 6 M15 14 C 15 17, 13 18, 10 18 L 4 18 M6 16 L 3.5 18 L 6 20"/>',
};
const fmts = (act: string[]) =>
  Object.entries(FMT_I)
    .map(
      ([k, p]) =>
        `<span class="fmt${act.includes(k) ? " on" : ""}"><svg viewBox="0 0 18 22" class="pi big" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${p}</g></svg>${k}</span>`
    )
    .join("");
const blanks = (s: string) => esc(s).replace(/_{3,}/g, '<span class="blank"></span>');
const fmtDate = (d?: string) => (d ? d.slice(8, 10) + "/" + d.slice(5, 7) : "");

/* ring map */
function ringSVG(hi: number | null) {
  const x0 = 40,
    y0 = 40,
    W = 520,
    H = 440,
    cw = W / 5,
    ch = H / 2;
  let o = `<svg viewBox="0 0 600 560" class="ring" role="group" aria-label="Mapa do ringue com 10 regiões">`;
  [0, 10, 20].forEach(
    (ins, k) =>
      (o += `<rect x="${x0 - 28 + ins}" y="${y0 - 28 + ins}" width="${W + 56 - 2 * ins}" height="${H + 56 - 2 * ins}" fill="none" stroke="currentColor" stroke-width="${k ? 1.2 : 2.4}" rx="2"/>`)
  );
  o += `<rect x="${x0 - 36}" y="${y0 - 36}" width="18" height="18" fill="var(--red)"/><rect x="${x0 + W + 18}" y="${y0 + H + 18}" width="18" height="18" fill="currentColor"/>`;
  for (let i = 0; i < 10; i++) {
    const c = i % 5,
      r = Math.floor(i / 5),
      x = x0 + c * cw,
      y = y0 + r * ch,
      on = hi === i,
      n = CATS[i].toUpperCase(),
      fs = n.length <= 10 ? 19 : n.length <= 12 ? 16 : 14;
    o += `<g class="cellg${on ? " on" : ""}" data-r="${i}" tabindex="0" role="button" aria-label="Região ${coordOf(i)}, ${CATS[i]}"><rect class="cellr" x="${x + 3}" y="${y + 3}" width="${cw - 6}" height="${ch - 6}" rx="4"/><text x="${x + 12}" y="${y + 30}" class="cc">${coordOf(i)}</text><text x="${x + cw / 2}" y="${y + ch / 2 + 7}" text-anchor="middle" class="cn" style="font-size:${fs}px">${n}</text><text x="${x + cw / 2}" y="${y + ch - 18}" text-anchor="middle" class="cm">10 pranchas</text></g>`;
  }
  "ABCDE"
    .split("")
    .forEach((L, c) => (o += `<text x="${x0 + c * cw + cw / 2}" y="${y0 + H + 52}" text-anchor="middle" class="ax">${L}</text>`));
  [1, 2].forEach((r) => (o += `<text x="${x0 + W + 46}" y="${y0 + (r - 1) * ch + ch / 2 + 5}" class="ax">${r}</text>`));
  return o + "</svg>";
}
function renderMap() {
  $("#ringmap").innerHTML = ringSVG(region);
  $("#regions").innerHTML = CATS.map(
    (c, i) =>
      `<li><button type="button" data-r="${i}"><span class="rc">${coordOf(i)}</span><span><b>${c}</b><small>${CAT_DESC[c]}</small></span></button></li>`
  ).join("");
}
function goRegion(i: number) {
  region = i;
  intent = "todos";
  renderChips();
  renderList();
  show("templates", true);
  window.scrollTo({ top: 0 });
}
$("#ringmap").addEventListener("click", (e) => {
  const g = (e.target as Element).closest<HTMLElement>("[data-r]");
  if (g) goRegion(+g.dataset.r!);
});
$("#ringmap").addEventListener("keydown", (e) => {
  const g = (e.target as Element).closest<HTMLElement>("[data-r]");
  if (g && (e.key === "Enter" || e.key === " ")) {
    e.preventDefault();
    goRegion(+g.dataset.r!);
  }
});
$("#regions").addEventListener("click", (e) => {
  const g = (e.target as Element).closest<HTMLElement>("[data-r]");
  if (g) goRegion(+g.dataset.r!);
});
$("#legend").innerHTML = [
  [`<span class="code">B1·03</span>`, "Coordenada", "Região B1 (Alunos), prancha 3. Use para anotar no teu calendário."],
  [gloves("Fácil") + "<br>" + gloves("Elaborado"), "Dificuldade", "Uma luva: grava agora, sozinho. Três: dá trabalho, mas rende mais."],
  [dial("15 segundos") + dial("5 minutos"), "Tempo de produção", "O relógio de round enche conforme o trabalho para gravar e postar."],
  [who("Só o professor") + " " + who("Alunos na aula"), "Quem grava", "Só você e o celular, a turma, um aluno com autorização, um parceiro ou um print."],
  [`<span class="fmts">${fmts(["Reels"])}</span>`, "Formato", "Os ícones acesos são os indicados para a prancha."],
  [`<span class="blank" style="width:70px"></span>`, "Lacuna", "Complete com a tua realidade no campo Tua versão."],
]
  .map(([k, t, d]) => `<div class="lg"><div class="lgk">${k}</div><div><b>${t}.</b> ${d}</div></div>`)
  .join("");
$("#steps8").innerHTML = [
  ["0", "Hook", "2 linhas que param o dedo. A primeira nunca é pergunta."],
  ["1", "Comportamento", "Algo que a pessoa já faz e não enxerga como problema."],
  ["2", "Percepção atual", "O que ela acredita hoje, na voz dela."],
  ["3", "Quebra", "Uma situação que derruba essa interpretação."],
  ["4", "Nova percepção", "Ela passa a ver aquilo de outro jeito."],
  ["5", "Consciência", "Ela formula a pergunta: por que eu ainda não resolvi isso?"],
  ["6", "Decisão", "Continuar sem resolver vira escolha consciente."],
  ["7", "Solução", "A oferta, agora com significado."],
]
  .map(
    ([n, t, d]) =>
      `<li class="${"035".includes(n) ? "key" : ""}"><span class="sn">${n}</span><b>${t}</b><span>${d}</span></li>`
  )
  .join("");

function renderChips() {
  $("#regchips").innerHTML =
    `<button class="chip" type="button" data-r="" aria-pressed="${region === null}">Todas as regiões</button>` +
    CATS.map(
      (c, i) =>
        `<button class="chip" type="button" data-r="${i}" aria-pressed="${region === i}"><span class="code">${coordOf(i)}</span> ${c}</button>`
    ).join("");
  $("#intents").innerHTML = INTENTS.map(
    ([k, l, f]) =>
      `<button class="chip" type="button" data-k="${k}" aria-pressed="${k === intent}">${l}<span class="c">${T.filter(f).length}</span></button>`
  ).join("");
  $("#formats").innerHTML = FORMATS.map(
    (f) => `<button class="chip" type="button" data-f="${f}" aria-pressed="${f === format}">${f}</button>`
  ).join("");
}
$("#regchips").addEventListener("click", (e) => {
  const b = (e.target as Element).closest<HTMLElement>("[data-r]");
  if (!b) return;
  region = b.dataset.r === "" ? null : +b.dataset.r!;
  renderChips();
  renderList();
});
$("#intents").addEventListener("click", (e) => {
  const b = (e.target as Element).closest<HTMLElement>("[data-k]");
  if (!b) return;
  intent = b.dataset.k!;
  renderChips();
  renderList();
});
$("#formats").addEventListener("click", (e) => {
  const b = (e.target as Element).closest<HTMLElement>("[data-f]");
  if (!b) return;
  format = format === b.dataset.f ? null : b.dataset.f!;
  renderChips();
  renderList();
});
$("#q").addEventListener("input", (e) => {
  query = (e.target as HTMLInputElement).value.trim().toLowerCase();
  renderList();
});

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
function caption(t: Prancha) {
  return t.cta ? t.ex + "\n\n" + t.cta : t.ex;
}

function tpHTML(t: Prancha) {
  const isOpen = open.has(t.n);
  return `<article class="tp" data-n="${t.n}">
    <button class="tp-head" type="button" aria-expanded="${isOpen}" aria-controls="tb-${t.n}">
      <span class="num code">${t.code}</span>
      <span class="tp-main"><span class="tp-name">${esc(t.nome)}</span><span class="tp-model">${esc(t.modelo)}</span></span>
      <span class="tp-meta">${fav.has(t.n) ? '<span class="mark" title="Favorito">★</span>' : ""}${used.has(t.n) ? `<span class="mark" title="Usado">✓ ${fmtDate(usedAt[t.n])}</span>` : ""}<span class="clock" title="Tempo de produção">${clock(t.tempo)}</span><span class="minig">${gloves(t.dif)}</span></span>
    </button>
    <div class="tp-body" id="tb-${t.n}" ${isOpen ? "" : "hidden"}>
      <div class="plate">
        <div class="pl-left">
          <div class="lbl">Modelo</div>
          <p class="model">${blanks(t.modelo)}</p>
          <label class="lbl" for="nv-${t.n}">Tua versão</label>
          <textarea class="ver" id="nv-${t.n}" data-note="${t.n}" rows="3" placeholder="Escreva aqui a tua versão. Fica salva neste aparelho.">${esc(notes[t.n] || "")}</textarea>
          <div class="lbl">Exemplo pronto</div>
          <p class="example">${esc(t.ex)}</p>
          ${t.cta ? `<p class="cta-line"><span class="code">CTA →</span> ${esc(t.cta)}</p>` : ""}
        </div>
        <div class="pl-right"><div class="lbl">Plano de gravação</div>${shotSVG(t)}</div>
      </div>
      <p class="rec"><span class="code">Como gravar sem aparecer</span> ${esc(t.cena)}</p>
      <div class="picto">
        <div><div class="lbl">Dificuldade</div><div class="pv">${gloves(t.dif)}</div><div class="pt">${esc(t.dif)}</div></div>
        <div><div class="lbl">Tempo</div><div class="pv">${dial(t.tempo)}</div><div class="pt">de produção</div></div>
        <div><div class="lbl">Quem grava</div><div class="pv">${who(t.prec)}</div><div class="pt">${esc(precLabel[t.prec] || t.prec)}</div></div>
        <div><div class="lbl">Formato</div><div class="pv fmts">${fmts(t.fmt)}</div></div>
      </div>
      <div class="tags">${t.obj.map((x) => `<span class="tag">${esc(x)}</span>`).join("")}</div>
      <div class="actions">
        <button class="btn" type="button" data-act="cap">Copiar legenda</button>
        <button class="btn ghost" type="button" data-act="mod">Copiar modelo</button>
        ${notes[t.n] ? '<button class="btn ghost" type="button" data-act="ver">Copiar tua versão</button>' : ""}
        <button class="btn ghost" type="button" data-act="fav" aria-pressed="${fav.has(t.n)}">${fav.has(t.n) ? "★ Favorito" : "☆ Favoritar"}</button>
        <button class="btn ghost" type="button" data-act="used" aria-pressed="${used.has(t.n)}">${used.has(t.n) ? "✓ Usado em " + fmtDate(usedAt[t.n]) : "Marcar como usado hoje"}</button>
      </div>
    </div>
  </article>`;
}

function renderList() {
  const f = INTENTS.find((x) => x[0] === intent)![2];
  const q = norm(query);
  const items = T.filter(
    (t) =>
      (region === null || t.reg === region) &&
      f(t) &&
      (!format || t.fmt.includes(format)) &&
      (!q || norm([t.nome, t.modelo, t.ex, t.cat, t.cena, t.code].join(" ")).includes(q))
  );
  $("#count").textContent = items.length + (items.length === 1 ? " prancha" : " pranchas");
  $("#list").innerHTML = items.length
    ? items.map(tpHTML).join("")
    : `<p class="empty">${intent === "favoritos" ? "Nenhum favorito ainda. Abra uma prancha e toque em Favoritar." : intent === "usados" ? "Nada marcado como usado ainda." : "Nada encontrado. Tente outra palavra ou limpe os filtros."}</p>`;
}

$("#list").addEventListener("click", (e) => {
  const target = e.target as Element;
  const art = target.closest<HTMLElement>(".tp");
  if (!art) return;
  const n = +art.dataset.n!,
    t = T[n - 1];
  if (target.closest(".tp-head")) {
    if (open.has(n)) open.delete(n);
    else open.add(n);
    art.outerHTML = tpHTML(t);
    return;
  }
  const b = target.closest<HTMLElement>("[data-act]");
  if (!b) return;
  const a = b.dataset.act;
  if (a === "cap") copy(caption(t), "Legenda");
  if (a === "mod") copy(t.modelo, "Modelo");
  if (a === "ver") copy(notes[n] || "", "Tua versão");
  if (a === "fav") {
    if (fav.has(n)) fav.delete(n);
    else fav.add(n);
    store.set("fav", [...fav]);
    renderChips();
    art.outerHTML = tpHTML(t);
  }
  if (a === "used") {
    if (usedAt[n]) delete usedAt[n];
    else usedAt[n] = new Date().toISOString().slice(0, 10);
    store.set("usedAt", usedAt);
    renderChips();
    art.outerHTML = tpHTML(t);
    toast(usedAt[n] ? "Marcado no registro" : "Removido do registro");
  }
});
$("#list").addEventListener("input", (e) => {
  const ta = (e.target as Element).closest<HTMLTextAreaElement>("[data-note]");
  if (!ta) return;
  const v = ta.value;
  const noteKey = ta.dataset.note!;
  if (v.trim()) notes[noteKey] = v;
  else delete notes[noteKey];
  store.set("notes", notes);
});

/* registro */
function renderLog() {
  const rows = Object.entries(usedAt)
    .map(([n, d]) => [T[+n - 1], d] as [Prancha, string])
    .filter((r) => r[0])
    .sort((a, b) => b[1].localeCompare(a[1]));
  $("#logcount").textContent = rows.length + (rows.length === 1 ? " post" : " posts");
  if (!rows.length) {
    $("#logt").innerHTML = `<tr><td class="empty">Nada no registro ainda. Abra uma prancha e toque em “Marcar como usado hoje”.</td></tr>`;
    return;
  }
  const tot = rows.reduce((s, [t]) => s + (+((logx[t.n] || {}).m || 0) || 0), 0);
  $("#logt").innerHTML =
    `<thead><tr><th>Data</th><th>Prancha</th><th>Formato</th><th>Mensagens</th><th>Observação</th></tr></thead><tbody>` +
    rows
      .map(
        ([t, d]) =>
          `<tr><td class="code">${fmtDate(d)}</td><td><span class="code">${t.code}</span> ${esc(t.nome)}</td><td>${esc(t.fmt.join(" · "))}</td><td><input type="number" min="0" inputmode="numeric" aria-label="Mensagens recebidas, ${esc(t.code)}" data-lx="${t.n}" data-f="m" value="${esc((logx[t.n] || {}).m || "")}"></td><td><input type="text" aria-label="Observação, ${esc(t.code)}" data-lx="${t.n}" data-f="o" value="${esc((logx[t.n] || {}).o || "")}"></td></tr>`
      )
      .join("") +
    `</tbody><tfoot><tr><td colspan="3">Total de mensagens</td><td class="code" id="logtot">${tot}</td><td></td></tr></tfoot>`;
}
$("#logt").addEventListener("input", (e) => {
  const i = (e.target as Element).closest<HTMLInputElement>("[data-lx]");
  if (!i) return;
  const n = i.dataset.lx!;
  const f = i.dataset.f as "m" | "o";
  logx[n] = logx[n] || {};
  logx[n][f] = i.value;
  store.set("logx", logx);
  const tot = Object.keys(usedAt).reduce((s, k) => s + (+((logx[k] || {}).m || 0) || 0), 0);
  const el = document.querySelector("#logtot");
  if (el) el.textContent = String(tot);
});

/* ---------- Reel player ---------- */
const ICON_PREV = '<svg viewBox="0 0 16 16"><path d="M11 2 4 8l7 6z"/></svg>';
const ICON_NEXT = '<svg viewBox="0 0 16 16"><path d="m5 2 7 6-7 6z"/></svg>';
const ICON_PLAY = '<svg viewBox="0 0 16 16"><path d="M4 2v12l10-6z"/></svg>';
const ICON_PAUSE = '<svg viewBox="0 0 16 16"><path d="M3 2h4v12H3zM9 2h4v12H9z"/></svg>';
const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

function makeReel(host: HTMLElement) {
  host.innerHTML = `<div class="reel" role="button" tabindex="0" aria-label="Prévia do vídeo. Toque para avançar.">
      <div class="segs"></div><div class="card"></div><div class="pos"></div></div>
    <div class="reel-ctrl">
      <button type="button" data-r="prev" aria-label="Cartela anterior">${ICON_PREV}</button>
      <button type="button" data-r="play" aria-label="Reproduzir">${ICON_PLAY}</button>
      <button type="button" data-r="next" aria-label="Próxima cartela">${ICON_NEXT}</button>
    </div>`;
  const r: { cards: string[]; i: number; timer: ReturnType<typeof setInterval> | null } = {
    cards: [],
    i: 0,
    timer: null,
  };
  const reel = $(".reel", host),
    card = $(".card", host),
    segs = $(".segs", host),
    pos = $(".pos", host),
    playBtn = $('[data-r="play"]', host);
  function draw(animate: boolean) {
    const txt = r.cards[r.i] || "";
    segs.innerHTML = r.cards.map((_, k) => `<i class="${k <= r.i ? "on" : ""}"></i>`).join("");
    pos.textContent = r.cards.length ? r.i + 1 + " / " + r.cards.length : "";
    if (animate && !reduce) {
      card.classList.add("out");
      setTimeout(() => {
        card.textContent = txt;
        card.classList.remove("out");
      }, 160);
    } else card.textContent = txt;
  }
  function go(d: number) {
    if (!r.cards.length) return;
    r.i = (r.i + d + r.cards.length) % r.cards.length;
    draw(true);
  }
  function stop() {
    if (r.timer) clearInterval(r.timer);
    r.timer = null;
    playBtn.innerHTML = ICON_PLAY;
    playBtn.setAttribute("aria-label", "Reproduzir");
  }
  function play() {
    stop();
    r.timer = setInterval(() => go(1), 2600);
    playBtn.innerHTML = ICON_PAUSE;
    playBtn.setAttribute("aria-label", "Pausar");
  }
  reel.addEventListener("click", (e) => {
    const rect = reel.getBoundingClientRect();
    go((e as MouseEvent).clientX - rect.left < rect.width / 3 ? -1 : 1);
  });
  reel.addEventListener("keydown", (e) => {
    const ke = e as KeyboardEvent;
    if (ke.key === "ArrowRight" || ke.key === " " || ke.key === "Enter") {
      ke.preventDefault();
      go(1);
    }
    if (ke.key === "ArrowLeft") go(-1);
  });
  host.addEventListener("click", (e) => {
    const b = (e.target as Element).closest<HTMLElement>("[data-r]");
    if (!b) return;
    if (b.dataset.r === "prev") go(-1);
    if (b.dataset.r === "next") go(1);
    if (b.dataset.r === "play") (r.timer ? stop : play)();
  });
  return {
    set(cards: string[], keep?: boolean) {
      r.cards = cards.filter(Boolean);
      if (!keep || r.i >= r.cards.length) r.i = 0;
      draw(false);
    },
    stop,
  };
}

/* ---------- Ads ---------- */
const A = DATA.ads,
  TENS = DATA.tens,
  ANG = DATA.ang;
let cur = 0;
function adScript(a: AdItem) {
  return a.cart.join("\n");
}
function renderAdList() {
  $("#adList").innerHTML = A.map(
    (a, k) => `<button class="ad" type="button" data-k="${k}" aria-current="${k === cur}">
    <span class="num">${pad(k + 1)}</span>
    <span><span class="ad-t">${esc(a.t)}</span>
      <span class="angtag">Hook · ${esc(ANG[a.ang])}</span>
      <span class="shift"><span class="from">${esc(a.atual)}</span><span class="to">${esc(a.nova)}</span></span></span>
  </button>`
  ).join("");
}
let adReel: ReturnType<typeof makeReel> | undefined;
function renderAdDetail() {
  const a = A[cur];
  const steps: [string, string, number?][] = [
    ["Hook · " + ANG[a.ang], a.hook.join(" / "), 1],
    ["Comportamento", a.comp],
    ["Percepção atual", a.atual],
    ["Quebra", a.quebra, 1],
    ["Nova percepção", a.nova],
    ["Consciência", a.consc, 1],
    ["Decisão e solução", a.leg],
  ];
  $("#adDetail").innerHTML = `<div>
      <div class="eyebrow">Anúncio ${pad(cur + 1)} de ${A.length}</div>
      <h3>${esc(a.t)}</h3>
      <div class="tension">Tensão: ${esc(TENS[a.tens])}</div>
    </div>
    <div class="stage">
      <div class="reel-wrap" id="adReel"></div>
      <ol class="chain">${steps.map(([l, v, k]) => `<li class="${k ? "key" : ""}"><div class="lbl">${l}</div><p>${esc(v)}</p></li>`).join("")}</ol>
    </div>
    <div class="actions">
      <button class="btn" type="button" data-ad="script">Copiar roteiro</button>
      <button class="btn ghost" type="button" data-ad="leg">Copiar legenda</button>
      <button class="btn ghost" type="button" data-ad="edit">Editar no criador</button>
    </div>
    <div class="grid2">
      <div><div class="lbl">Cenas sem rosto</div><p>${esc(a.cenas)}</p></div>
      <div><div class="lbl">Legenda</div><p>${esc(a.leg)}</p></div>
    </div>`;
  if (adReel) adReel.stop();
  adReel = makeReel($("#adReel"));
  adReel.set(a.cart);
}
$("#adList").addEventListener("click", (e) => {
  const b = (e.target as Element).closest<HTMLElement>("[data-k]");
  if (!b) return;
  cur = +b.dataset.k!;
  renderAdList();
  renderAdDetail();
  if (window.matchMedia("(max-width: 860px)").matches)
    $("#adDetail").scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
});
$("#adDetail").addEventListener("click", (e) => {
  const b = (e.target as Element).closest<HTMLElement>("[data-ad]");
  if (!b) return;
  const a = A[cur];
  if (b.dataset.ad === "script") copy(adScript(a), "Roteiro");
  if (b.dataset.ad === "leg") copy(a.leg, "Legenda");
  if (b.dataset.ad === "edit") {
    loadBase(cur);
    show("criar", true);
    window.scrollTo({ top: 0 });
  }
});

/* ---------- Builder ---------- */
const F = (id: string) => $<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>("#f-" + id);
let bTens = "motivo";
F("base").innerHTML = A.map((a, k) => `<option value="${k}">${pad(k + 1)} · ${esc(a.t)}</option>`).join("");
function renderTens() {
  $("#f-tens").innerHTML = Object.entries(TENS)
    .map(([k, v]) => `<button type="button" data-t="${k}" aria-pressed="${k === bTens}">${esc(v)}</button>`)
    .join("");
}
$("#f-tens").addEventListener("click", (e) => {
  const b = (e.target as Element).closest<HTMLElement>("[data-t]");
  if (!b) return;
  bTens = b.dataset.t!;
  renderTens();
  saveDraft();
});
const bReel = makeReel($("#builderReel"));
const ANG_HINT: Record<string, string> = {
  num: "Abra com uma quantidade específica: horas, dias, rounds, idade, reais.",
  contra: "Afirme a crença que todo mundo repete e vire do avesso na linha 2.",
  transf: "Antes e depois, com número: como chegou e como está hoje.",
  autor: "Cite uma ferramenta, marca ou nome que o aluno conhece.",
  conf: "Admita um erro ou uma perda tua. Confissão gera confiança.",
  futuro: "Diga o que vai acontecer, ou o que está prestes a mudar.",
};
let bAng = "num";
function renderAng() {
  $("#f-ang").innerHTML = Object.entries(ANG)
    .map(([k, v]) => `<button type="button" data-g="${k}" aria-pressed="${k === bAng}">${esc(v)}</button>`)
    .join("");
  const ex = A.find((a) => a.ang === bAng);
  $("#ang-hint").innerHTML =
    `<b>${esc(ANG[bAng])}.</b> ${esc(ANG_HINT[bAng])}` +
    (ex ? `<br><span class="hooksample">${esc(ex.hook.join("\n"))}</span>` : "");
}
$("#f-ang").addEventListener("click", (e) => {
  const b = (e.target as Element).closest<HTMLElement>("[data-g]");
  if (!b) return;
  bAng = b.dataset.g!;
  renderAng();
  saveDraft();
});
const FIRST = /\b(eu|meu|minha|meus|minhas|me|mim|comigo|nós|nosso|nossa|fiz|tenho|preciso|vejo|acho|passei|perdi|errei|paguei|formo|conto|resolvi)\b/i;
function checkHook() {
  const h1 = F("h1").value.trim(),
    h2 = F("h2").value.trim();
  $("#h1-c").textContent = h1.length + "/40";
  $("#h2-c").textContent = h2.length + "/40";
  let w1 = "",
    w2 = "";
  if (h1.length > 40) w1 = "Passou de 40 caracteres.";
  else if (h1.endsWith("?")) w1 = "A linha 1 não pode ser pergunta.";
  if (h2.length > 40) w2 = "Passou de 40 caracteres.";
  else if (h1 && h2 && !FIRST.test(h1 + " " + h2)) w2 = "Coloque uma frase em primeira pessoa.";
  $("#h1-warn").textContent = w1;
  $("#h1-warn").className = w1 ? "warn" : "";
  $("#h2-warn").textContent = w2;
  $("#h2-warn").className = w2 ? "warn" : "";
}
function bHook() {
  return [F("h1").value.trim(), F("h2").value.trim()].filter(Boolean).join("\n");
}
function bCards() {
  return [bHook(), F("gancho").value, F("quebra").value, F("nova").value, F("perg").value, F("cta").value]
    .map((s) => s.trim())
    .filter(Boolean);
}
function bLegenda() {
  return [F("nova").value.trim(), F("cta").value.trim()].filter(Boolean).join("\n\n");
}
function updateBuilder(keep?: boolean) {
  const c = bCards();
  bReel.set(c.length ? c : ["Comece pelo hook"], keep);
  checkHook();
  $("#b-script").innerHTML =
    c.map((x) => `<li style="white-space:pre-line">${esc(x)}</li>`).join("") || "<li>Preencha os campos ao lado.</li>";
}
function loadBase(k: number) {
  const a = A[k];
  F("base").value = String(k);
  bTens = a.tens;
  bAng = a.ang;
  F("h1").value = a.hook[0];
  F("h2").value = a.hook[1];
  F("gancho").value = a.comp_card;
  F("atual").value = a.atual;
  F("quebra").value = a.quebra;
  F("nova").value = a.nova;
  F("perg").value = a.consc;
  F("cta").value = a.leg;
  renderTens();
  renderAng();
  updateBuilder(false);
  saveDraft();
}
function saveDraft() {
  store.set("draft2", {
    base: F("base").value,
    tens: bTens,
    ang: bAng,
    h1: F("h1").value,
    h2: F("h2").value,
    g: F("gancho").value,
    a: F("atual").value,
    q: F("quebra").value,
    n: F("nova").value,
    p: F("perg").value,
    c: F("cta").value,
  });
}
F("base").addEventListener("change", (e) => loadBase(+(e.target as HTMLSelectElement).value));
$("#form").addEventListener("input", (e) => {
  if ((e.target as HTMLElement).id !== "f-base") {
    updateBuilder(true);
    saveDraft();
  }
});
$("#form").addEventListener("submit", (e) => e.preventDefault());
$("#b-copy-script").addEventListener("click", () => copy(bCards().join("\n"), "Roteiro"));
$("#b-copy-leg").addEventListener("click", () => copy(bLegenda(), "Legenda"));

/* ---------- Boot ---------- */
renderMap();
renderChips();
renderList();
renderAdList();
renderAdDetail();
const d = store.get<Record<string, string> | null>("draft2", null);
if (d && d.g !== undefined) {
  F("base").value = d.base || "0";
  bTens = d.tens || "motivo";
  bAng = d.ang || "num";
  F("h1").value = d.h1 || "";
  F("h2").value = d.h2 || "";
  F("gancho").value = d.g;
  F("atual").value = d.a;
  F("quebra").value = d.q;
  F("nova").value = d.n;
  F("perg").value = d.p;
  F("cta").value = d.c;
  renderTens();
  renderAng();
  updateBuilder(false);
} else loadBase(0);
const h = (location.hash || "").slice(1);
show(views.includes(h) ? h : store.get("tab", "mapa"), false);
