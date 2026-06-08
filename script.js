const svg = document.getElementById("evidenceChart");
const tooltip = document.getElementById("tooltip");
const heightRange = document.getElementById("heightRange");
const heightValue = document.getElementById("heightValue");
const infoModal = document.getElementById("infoModal");
const modalTitle = document.getElementById("modalTitle");
const modalBody = document.getElementById("modalBody");

let currentChartHeight = heightRange ? Number(heightRange.value) : 1220;

const tierColors = {
  1: "#b7e4c7",
  2: "#d8f3dc",
  3: "#fff3b0",
  4: "#ffd6a5",
  5: "#ffb5a7",
  6: "#e5989b"
};

const tierLabels = {
  1: ["Tier 1", "Meta/systematisk översikt, närmast RCT"],
  2: ["Tier 2", "RCT / stark intervention"],
  3: ["Tier 3", "Kvasi-experiment / blandat"],
  4: ["Tier 4", "Longitudinell / observation"],
  5: ["Tier 5", "Tvärsnitt / svag korrelation"],
  6: ["Tier 6", "Expert/teori eller saknat stöd"]
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

  modalTitle.textContent = d.method;
  modalBody.innerHTML = `
    <p>${d.info}</p>
    <dl class="modal-facts">
      <dt>Ungefärlig effektstorlek</dt>
      <dd>d/g ≈ ${d.d.toFixed(2)}</dd>
      <dt>Evidensnivå</dt>
      <dd>Tier ${d.tier}</dd>
      <dt>Typ</dt>
      <dd>${d.type}</dd>
      <dt>Kommentar</dt>
      <dd>${d.note}</dd>
      <dt>Källa</dt>
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
  svg.innerHTML = `
    <title id="chartTitle">Evidenskarta över pedagogiska metoder</title>
    <desc id="chartDesc">Graf där x-axeln visar ungefärlig effektstorlek och y-axeln visar evidensnivå.</desc>
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
    }, g).textContent = tierLabels[tier][0];

    make("text", {
      x: 22,
      y: y(tier) + 12,
      class: "tier-label-sub"
    }, g).textContent = tierLabels[tier][1];
  }

  // X grid and ticks
  const xTicks = [0, 0.2, 0.4, 0.6, 0.8];
  xTicks.forEach(t => {
    make("line", {x1:x(t), x2:x(t), y1:margin.top, y2:margin.top+innerH, class:"grid-line"}, g);
    make("text", {x:x(t), y:height-88, "text-anchor":"middle", class:"axis"}, g).textContent = t.toFixed(1);
  });

  // Cohen rules
  [
    [0.2, "Liten effekt", "d≈0,2"],
    [0.5, "Medelstor effekt", "d≈0,5"],
    [0.8, "Stor effekt", "d≈0,8"]
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
    .textContent = "Ungefärlig standardiserad effektstorlek, d/g";

  make("text", {
    x: margin.left,
    y: 28,
    "text-anchor": "start",
    class: "y-axis-title-top"
  }, g).textContent = "Evidensnivå, Slavin-inspirerad tier";

  const positions = computePositions(chartData, y);

  // Bubbles
  chartData.forEach((d, i) => {
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
        fill:tierColors[d.tier], stroke:"#1d4ed8", "stroke-width":2,
        transform:`rotate(45 ${px} ${py})`, class:"point"
      }, g);
    } else {
      point = make("circle", {
        cx:px, cy:py, r:r, fill:tierColors[d.tier],
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
    const label = d.type === "SoL" ? "SoL: " + d.method : d.method;
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
}

function showTooltip(e, d) {
  tooltip.hidden = false;
  tooltip.innerHTML = `
    <strong>${d.method}</strong>
    <div>d/g ≈ ${d.d.toFixed(2)}</div>
    <div>Tier: ${d.tier}</div>
    <div>Studier: cirka ${d.studies}</div>
    <div>Typ: ${d.type}</div>
    <div>${d.note}</div>
    <div>Källa: ${d.source}</div>
  `;
  tooltip.style.left = Math.min(e.clientX + 16, window.innerWidth - 340) + "px";
  tooltip.style.top = Math.min(e.clientY + 16, window.innerHeight - 170) + "px";
}

function hideTooltip() {
  tooltip.hidden = true;
}

function renderTable() {
  const tbody = document.querySelector("#dataTable tbody");
  chartData.forEach(d => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${d.method}</td>
      <td>${d.d.toFixed(3)}</td>
      <td>${d.tier}</td>
      <td>${d.studies}</td>
      <td>${d.type}</td>
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

renderChart();
renderTable();
