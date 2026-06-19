const svg = document.getElementById("evidenceChart");
const tooltip = document.getElementById("tooltip");
const heightRange = document.getElementById("heightRange");
const heightValue = document.getElementById("heightValue");
const infoModal = document.getElementById("infoModal");
const modalTitle = document.getElementById("modalTitle");
const modalBody = document.getElementById("modalBody");
const filterButtons = document.querySelectorAll("[data-category-filter]");
const filterSummary = document.getElementById("filterSummary");
const pageLang = document.documentElement.lang === "en" ? "en" : "sv";

let currentChartHeight = heightRange ? Number(heightRange.value) : 1220;
let activeCategoryFilter = "all";

const categoryMeta = {
  all: {
    label: {sv: "Alla", en: "All"},
    description: {sv: "Alla metoder visas.", en: "All methods are shown."}
  },
  sol: {
    label: {sv: "SoL/kognitionspsykologi", en: "SoL/cognitive psychology"},
    description: {
      sv: "Minnes-, belastnings- och lärandestrategier från kognitionspsykologi och Science of Learning.",
      en: "Memory, cognitive load and learning strategies from cognitive psychology and the Science of Learning."
    }
  },
  constructivist: {
    label: {sv: "Konstruktivistiska/sociala", en: "Constructivist/social"},
    description: {
      sv: "Elevaktivt, undersökande, dialogiskt eller socialt kunskapsbyggande.",
      en: "Student-active, inquiry-oriented, dialogic or socially shared knowledge-building."
    }
  },
  structured: {
    label: {sv: "Strukturerad undervisning", en: "Structured instruction"},
    description: {
      sv: "Tydlig modellering, explicit undervisning, läs-/språkstrategier och systematisk träning.",
      en: "Clear modelling, explicit instruction, literacy/language strategies and systematic practice."
    }
  },
  support: {
    label: {sv: "Stöd & inkludering", en: "Support & inclusion"},
    description: {
      sv: "Riktade stödinsatser, relationer, beteende, socialt-emotionellt lärande och hemstöd.",
      en: "Targeted support, relationships, behaviour, social-emotional learning and home support."
    }
  },
  professional: {
    label: {sv: "Professionell utveckling/system", en: "Professional development/system"},
    description: {
      sv: "Metoder på lärar-, skol- eller systemnivå snarare än direkt elevmetod.",
      en: "Methods at teacher, school or system level rather than direct student methods."
    }
  },
  other: {
    label: {sv: "Övrigt", en: "Other"},
    description: {sv: "Breda eller svårklassade skolinterventioner.", en: "Broad or hard-to-classify school interventions."}
  }
};

const uiText = {
  chartTitle: {sv: "Evidenskarta över pedagogiska metoder", en: "Evidence map of pedagogical methods"},
  chartDesc: {
    sv: "Graf där x-axeln visar ungefärlig effektstorlek och y-axeln visar evidensnivå.",
    en: "Chart where the x-axis shows approximate effect size and the y-axis shows strength of evidence."
  },
  yAxisTitle: {sv: "Evidensstyrka för kausal tolkning", en: "Strength of evidence for causal interpretation"},
  xAxisTitle: {sv: "Ungefärlig standardiserad effektstorlek, d/g", en: "Approximate standardized effect size, d/g"},
  smallEffect: {sv: "Liten effekt", en: "Small effect"},
  mediumEffect: {sv: "Medelstor effekt", en: "Medium effect"},
  largeEffect: {sv: "Stor effekt", en: "Large effect"},
  selectedCategory: {sv: "Vald kategori", en: "Selected category"},
  methodsShown: {sv: "metoder visas", en: "methods shown"},
  effectSize: {sv: "Ungefärlig effektstorlek", en: "Approximate effect size"},
  evidenceTier: {sv: "Evidensstyrka för kausal tolkning", en: "Strength of evidence for causal interpretation"},
  type: {sv: "Typ", en: "Type"},
  category: {sv: "Kategori", en: "Category"},
  note: {sv: "Kommentar", en: "Comment"},
  valueStatus: {sv: "Status för värdet", en: "Value status"},
  source: {sv: "Källa", en: "Source"},
  studies: {sv: "Studier", en: "Studies"},
  supportForCausalInterpretation: {sv: "stöd för kausal tolkning", en: "support for causal interpretation"},
  notClassified: {sv: "Ej klassad", en: "Not classified"}
};

const t = key => uiText[key][pageLang];
const localizeMeta = (meta, field) => meta?.[field]?.[pageLang] || "";

const methodNameEn = {
  "Retrieval practice / testeffekten": "Retrieval practice / testing effect",
  "Spacing / distribuerad repetition": "Spacing / distributed practice",
  "Interleaving / blandad övning": "Interleaving / mixed practice",
  "Worked examples / genomarbetade exempel": "Worked examples",
  "Dual coding / dubbelkodning": "Dual coding",
  "Cognitive load / belastningsdesign": "Cognitive load / load-sensitive design",
  "Metakognition & självreglering": "Metacognition & self-regulation",
  "Läsförståelsestrategier": "Reading comprehension strategies",
  "Kamratundervisning": "Peer tutoring",
  "Fonologisk/phonics-undervisning": "Phonics instruction",
  "Smågruppsundervisning/tutoring": "Small-group tutoring",
  "Teaching assistant-interventioner": "Teaching assistant interventions",
  "Föräldraengagemang": "Parental engagement",
  "Tidig matematik": "Early mathematics",
  "Direkt undervisning / explicit instruction": "Direct teaching / explicit instruction",
  "Mindre klasser": "Smaller classes",
  "Skoluniform": "School uniform",
  "Lärar-elevrelationer": "Teacher-student relationships",
  "Relationskompetens": "Relational competence",
  "Elevinflytande": "Student influence",
  "Entreprenöriellt lärande": "Entrepreneurial learning",
  "Kollegialt lärande / PLC": "Professional learning communities / PLC",
  "MI / Motiverande samtal": "MI / motivational interviewing",
  "Variationsteori": "Variation theory",
  "Guidad upptäckt / guided discovery": "Guided discovery",
  "Projektbaserat lärande": "Project-based learning",
  "Autentiska uppgifter / authentic learning": "Authentic tasks / authentic learning",
  "Språkinriktad ämnesundervisning": "Language-oriented subject teaching",
  "PLATO-baserad observation/feedback": "PLATO-based observation/feedback",
  "DBDM / Databaserat beslutsfattande": "DBDM / data-based decision-making"
};

function displayMethod(d) {
  return pageLang === "en" ? (methodNameEn[d.method] || d.method) : d.method;
}

function displayValueStatus(status) {
  if (pageLang !== "en") return status || t("notClassified");
  const translations = {
    "Mer direkt forskningsbaserat": "More directly research-based",
    "Forskningsbaserat men uppskattat": "Research-based but estimated",
    "Mer bedömningsbaserat / svagare datapunkt": "More judgement-based / weaker datapoint"
  };
  return translations[status] || status || t("notClassified");
}

function displayValueStatusShort(status) {
  if (pageLang !== "en") return status || t("notClassified");
  const translations = {
    "Direkt/EEF/meta": "Direct/EEF/meta",
    "Uppskattat": "Estimated",
    "Bedömning": "Judgement"
  };
  return translations[status] || status || t("notClassified");
}

const categoryRules = {
  constructivist: [
    "Collaborative learning",
    "Inquiry/problem-based learning",
    "Peer instruction",
    "Elevinflytande",
    "Entreprenöriellt lärande",
    "Variationsteori",
    "Learning Study",
    "Guidad upptäckt / guided discovery",
    "Projektbaserat lärande",
    "Autentiska uppgifter / authentic learning",
    "Kamratundervisning",
    "Oral language interventions"
  ],
  structured: [
    "Läsförståelsestrategier",
    "Feedback",
    "Fonologisk/phonics-undervisning",
    "Mastery learning",
    "Direkt undervisning / explicit instruction",
    "Språkinriktad ämnesundervisning",
    "Tidig matematik"
  ],
  support: [
    "One-to-one tutoring",
    "Smågruppsundervisning/tutoring",
    "Teaching assistant-interventioner",
    "Föräldraengagemang",
    "Behaviour interventions",
    "Social & emotional learning",
    "Lärar-elevrelationer",
    "Relationskompetens",
    "MI / Motiverande samtal"
  ],
  professional: [
    "Kollegialt lärande / PLC",
    "Professional learning communities / PLC",
    "PLATO-baserad observation/feedback",
    "DBDM / Databaserat beslutsfattande"
  ],
  other: [
    "Mindre klasser",
    "Homework",
    "Digital technology",
    "Individualised instruction",
    "Flipped classroom",
    "Physical activity",
    "Skoluniform",
    "Arts participation",
    "Outdoor adventure learning",
    "Learning styles"
  ]
};

function getMethodCategory(d) {
  if (d.type === "SoL") return "sol";

  for (const [category, methods] of Object.entries(categoryRules)) {
    if (methods.includes(d.method)) return category;
  }

  return "other";
}

function getFilteredData() {
  if (activeCategoryFilter === "all") return chartData;
  return chartData.filter(d => getMethodCategory(d) === activeCategoryFilter);
}

function updateFilterSummary(data) {
  if (!filterSummary) return;

  const meta = categoryMeta[activeCategoryFilter];
  const label = meta ? localizeMeta(meta, "label") : t("selectedCategory");
  const description = meta ? localizeMeta(meta, "description") : "";
  const countText = pageLang === "en"
    ? `${data.length} of ${chartData.length} ${t("methodsShown")}`
    : `${data.length} av ${chartData.length} ${t("methodsShown")}`;
  filterSummary.textContent = `${label}: ${countText}. ${description}`;
}

function formatTier(tier) {
  return Number.isInteger(tier) ? String(tier) : String(tier).replace(".", "-");
}

function getTierColor(tier) {
  if (tierColors[tier]) return tierColors[tier];
  return tierColors[Math.round(tier)] || tierColors[4];
}

const tierColors = {
  1: "#b7e4c7",
  2: "#d8f3dc",
  3: "#fff3b0",
  4: "#ffd6a5",
  5: "#ffb5a7",
  6: "#e5989b"
};

const tierLabels = {
  sv: {
    1: ["Tier 1", "Meta/systematisk översikt, närmast RCT"],
    2: ["Tier 2", "RCT / stark intervention"],
    3: ["Tier 3", "Kvasi-experiment / blandat"],
    4: ["Tier 4", "Longitudinell / observation"],
    5: ["Tier 5", "Tvärsnitt / svag korrelation"],
    6: ["Tier 6", "Expert/teori eller saknat stöd"]
  },
  en: {
    1: ["Tier 1", "Meta/systematic review, closest to RCT"],
    2: ["Tier 2", "RCT / strong intervention"],
    3: ["Tier 3", "Quasi-experiment / mixed"],
    4: ["Tier 4", "Longitudinal / observational"],
    5: ["Tier 5", "Cross-sectional / weak correlation"],
    6: ["Tier 6", "Expert/theory or limited support"]
  }
};

const tierErr = {1:0.08, 2:0.11, 3:0.15, 4:0.18, 5:0.22, 6:0.25};

function groupByTier(data) {
  const groups = {};
  data.forEach((d, i) => {
    if (!groups[d.tier]) groups[d.tier] = [];
    groups[d.tier].push(i);
  });
  return groups;
}

function computePositions(data, yScale) {
  const groups = groupByTier(data);
  const positions = {};
  Object.keys(groups).forEach(tierKey => {
    const tier = Number(tierKey);
    const indexes = groups[tier].slice().sort((a, b) => data[b].d - data[a].d);
    const n = indexes.length;
    const spread = 0.86;
    indexes.forEach((idx, j) => {
      const offset = n === 1 ? 0 : -spread / 2 + j * (spread / (n - 1));
      positions[idx] = tier + offset;
    });
  });
  return positions;
}


function showInfoModal(d) {
  if (!d.info || !infoModal) return;
  const category = localizeMeta(categoryMeta[getMethodCategory(d)], "label") || localizeMeta(categoryMeta.other, "label");

  modalTitle.textContent = displayMethod(d);
  modalBody.innerHTML = `
    <p>${d.info}</p>
    <dl class="modal-facts">
      <dt>${t("effectSize")}</dt>
      <dd>d/g ≈ ${d.d.toFixed(2)}</dd>
      <dt>${t("evidenceTier")}</dt>
      <dd>Tier ${formatTier(d.tier)}</dd>
      <dt>${t("type")}</dt>
      <dd>${d.type}</dd>
      <dt>${t("category")}</dt>
      <dd>${category}</dd>
      <dt>${t("note")}</dt>
      <dd>${d.note}</dd>
      <dt>${t("valueStatus")}</dt>
      <dd>${displayValueStatus(d.valueStatus)}<br>${d.valueStatusDetail || ""}</dd>
      <dt>${t("source")}</dt>
      <dd>${d.source}</dd>
    </dl>
  `;
  infoModal.hidden = false;
}

function closeInfoModal() {
  if (infoModal) infoModal.hidden = true;
}

document.addEventListener("click", (event) => {
  if (event.target.matches("[data-close-modal]")) {
    closeInfoModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeInfoModal();
});


function renderChart() {
  const visibleData = getFilteredData();

  svg.innerHTML = `
    <title id="chartTitle">${t("chartTitle")}</title>
    <desc id="chartDesc">${t("chartDesc")}</desc>
  `;

  // Samma layout som tidigare, men högre SVG.
  const width = 1280;
  const height = currentChartHeight;
  const margin = {top: 50, right: 64, bottom: 130, left: 300};
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

  const xMin = -0.18, xMax = 0.95;
  const yMin = 0.5, yMax = 6.95;

  const x = val => margin.left + (val - xMin) / (xMax - xMin) * innerW;
  const y = val => margin.top + (val - yMin) / (yMax - yMin) * innerH;

  const ns = "http://www.w3.org/2000/svg";
  const make = (name, attrs = {}, parent = svg) => {
    const el = document.createElementNS(ns, name);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    parent.appendChild(el);
    return el;
  };

  const g = make("g");

  // Background bands
  for (let tier = 1; tier <= 6; tier++) {
    make("rect", {
      x: margin.left,
      y: y(tier - 0.5),
      width: innerW,
      height: y(tier + 0.5) - y(tier - 0.5),
      fill: tierColors[tier],
      opacity: 0.95
    }, g);

    make("text", {
      x: 22,
      y: y(tier) - 8,
      class: "tier-label-main"
    }, g).textContent = tierLabels[pageLang][tier][0];

    make("text", {
      x: 22,
      y: y(tier) + 12,
      class: "tier-label-sub"
    }, g).textContent = tierLabels[pageLang][tier][1];
  }

  // X grid and ticks
  const xTicks = [0, 0.2, 0.4, 0.6, 0.8];
  xTicks.forEach(t => {
    make("line", {x1:x(t), x2:x(t), y1:margin.top, y2:margin.top+innerH, class:"grid-line"}, g);
    make("text", {x:x(t), y:height-88, "text-anchor":"middle", class:"axis"}, g).textContent = t.toFixed(1);
  });

  // Cohen rules
  [
    [0.2, t("smallEffect"), "d≈0,2"],
    [0.5, t("mediumEffect"), "d≈0,5"],
    [0.8, t("largeEffect"), "d≈0,8"]
  ].forEach(([val, line1, line2]) => {
    make("line", {x1:x(val), x2:x(val), y1:margin.top, y2:margin.top+innerH, stroke:"#475569", "stroke-dasharray":"7 6", opacity:"0.85"}, g);
    const t = make("text", {x:x(val), y:height-55, "text-anchor":"middle", class:"rule-label"}, g);
    make("tspan", {x:x(val), dy:0}, t).textContent = line1;
    make("tspan", {x:x(val), dy:15}, t).textContent = line2;
  });

  // Axes
  make("line", {x1:margin.left, x2:margin.left+innerW, y1:margin.top+innerH, y2:margin.top+innerH, stroke:"#1f2937"}, g);
  make("line", {x1:margin.left, x2:margin.left, y1:margin.top, y2:margin.top+innerH, stroke:"#1f2937"}, g);

  [1,2,3,4,5,6].forEach(tier => {
    make("text", {x:margin.left-12, y:y(tier)+5, "text-anchor":"end", class:"axis"}, g).textContent = tier;
  });

  make("text", {x:margin.left + innerW/2, y:height-16, "text-anchor":"middle", class:"axis"}, g)
    .textContent = t("xAxisTitle");

  make("text", {
    x: margin.left,
    y: 28,
    "text-anchor": "start",
    class: "y-axis-title-top"
  }, g).textContent = t("yAxisTitle");

  const positions = computePositions(visibleData, y);

  // Bubbles
  visibleData.forEach((d, i) => {
    const px = x(d.d);
    const py = y(positions[i]);
    const err = tierErr[d.tier] ?? 0.15;
    const r = 5 + Math.sqrt(d.studies) * 0.78;
    const left = x(d.d - err);
    const right = x(d.d + err);

    make("line", {x1:left, x2:right, y1:py, y2:py, stroke:"#111827", opacity:"0.55"}, g);
    make("line", {x1:left, x2:left, y1:py-5, y2:py+5, stroke:"#111827", opacity:"0.55"}, g);
    make("line", {x1:right, x2:right, y1:py-5, y2:py+5, stroke:"#111827", opacity:"0.55"}, g);

    let point;
    if (d.type === "SoL") {
      point = make("rect", {
        x:px-r*0.72, y:py-r*0.72, width:r*1.44, height:r*1.44,
        fill:getTierColor(d.tier), stroke:"#1d4ed8", "stroke-width":2,
        transform:`rotate(45 ${px} ${py})`, class:"point"
      }, g);
    } else {
      point = make("circle", {
        cx:px, cy:py, r:r, fill:getTierColor(d.tier),
        stroke:"#111827", "stroke-width":1.2, class:"point"
      }, g);
    }

    point.addEventListener("mousemove", e => showTooltip(e, d));
    point.addEventListener("mouseleave", hideTooltip);
    if (d.info && d.tier <= 2) {
      point.addEventListener("click", () => showInfoModal(d));
    }

    const labelX = d.d > 0.52 ? px - r - 8 : px + r + 8;
    const anchor = d.d > 0.52 ? "end" : "start";
    const methodLabel = displayMethod(d);
    const label = d.type === "SoL" ? "SoL: " + methodLabel : methodLabel;
    const labelEl = make("text", {
      x:labelX,
      y:py+4,
      "text-anchor":anchor,
      class: d.info && d.tier <= 2 ? "label clickable-label" : "label"
    }, g);
    labelEl.textContent = label;

    if (d.info && d.tier <= 2) {
      labelEl.addEventListener("click", () => showInfoModal(d));
    }
  });

  updateFilterSummary(visibleData);
}

function showTooltip(e, d) {
  const category = localizeMeta(categoryMeta[getMethodCategory(d)], "label") || localizeMeta(categoryMeta.other, "label");

  tooltip.hidden = false;
  tooltip.innerHTML = `
    <strong>${displayMethod(d)}</strong>
    <div>d/g ≈ ${d.d.toFixed(2)}</div>
    <div>Tier: ${formatTier(d.tier)} – ${t("supportForCausalInterpretation")}</div>
    <div>${t("studies")}: ${pageLang === "en" ? "about" : "cirka"} ${d.studies}</div>
    <div>${t("type")}: ${d.type}</div>
    <div>${t("category")}: ${category}</div>
    <div>${d.note}</div>
    <div>Status: ${displayValueStatusShort(d.valueStatusShort)}</div><div>${t("source")}: ${d.source}</div>
  `;
  tooltip.style.left = Math.min(e.clientX + 16, window.innerWidth - 340) + "px";
  tooltip.style.top = Math.min(e.clientY + 16, window.innerHeight - 170) + "px";
}

function hideTooltip() {
  tooltip.hidden = true;
}

function renderTable() {
  const tbody = document.querySelector("#dataTable tbody");
  const visibleData = getFilteredData();
  tbody.innerHTML = "";

  visibleData.forEach(d => {
    const category = localizeMeta(categoryMeta[getMethodCategory(d)], "label") || localizeMeta(categoryMeta.other, "label");
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${displayMethod(d)}</td>
      <td>${d.d.toFixed(3)}</td>
      <td>${formatTier(d.tier)}</td>
      <td>${d.studies}</td>
      <td>${d.type}</td>
      <td>${category}</td>
      <td>${displayValueStatusShort(d.valueStatusShort)}</td>
      <td>${d.note}</td>
      <td>${d.source}</td>
    `;
    tbody.appendChild(tr);
  });
}

if (heightRange) {
  heightRange.addEventListener("input", () => {
    currentChartHeight = Number(heightRange.value);
    heightValue.textContent = `${currentChartHeight} px`;
    renderChart();
  });
}

filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    activeCategoryFilter = button.dataset.categoryFilter;
    filterButtons.forEach(item => {
      item.classList.toggle("active", item === button);
      item.setAttribute("aria-pressed", item === button ? "true" : "false");
    });
    hideTooltip();
    renderChart();
    renderTable();
  });

  button.setAttribute("aria-pressed", button.classList.contains("active") ? "true" : "false");
});

renderChart();
renderTable();
