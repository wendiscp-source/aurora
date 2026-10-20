/* =========================================================
   Aurora — Leo's Northern Lights Journey · interactivity
   Four jobs:
   1) Animated aurora sky in the hero (canvas)
   2) Europe map (North→South) with a travelling aurora band
   3) Slider logic: Leo's reaction, travel plan, map state
   4) AI cards + reveal on scroll
   Pure vanilla JS, no dependencies — nothing can break on deploy.
   ========================================================= */

/* ---------------------------------------------------------
   0) GRAB THE SLIDER FIRST
   The map's draw loop reads kp.value every frame, so kp must
   exist before that loop starts. Defining it here avoids the
   "temporal dead zone" error that would otherwise freeze the
   whole script (slider stuck, map blank).
   --------------------------------------------------------- */
const kp = document.getElementById("kp");

/* ---------------------------------------------------------
   1) HERO AURORA (background)
   Soft, drifting curtains of light. `intensity` (0–1) controls
   brightness and how many bands show, and follows the Kp slider.
   --------------------------------------------------------- */
function createAurora(canvas, baseIntensity) {
  const ctx = canvas.getContext("2d");
  let width, height, bands, stars, t = 0, intensity = baseIntensity;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = canvas.clientWidth; height = canvas.clientHeight;
    canvas.width = width * dpr; canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    build();
  }
  function build() {
    bands = [];
    for (let i = 0; i < 5; i++) {
      bands.push({
        x: (width / 5) * i + Math.random() * 80,
        hue: 140 + Math.random() * 70,   // green → teal → faint violet
        speed: 0.15 + Math.random() * 0.25,
        width: 120 + Math.random() * 160,
        offset: Math.random() * 1000,
      });
    }
    stars = [];
    for (let i = 0; i < 90; i++) {
      stars.push({ x: Math.random() * width, y: Math.random() * height * 0.7, r: Math.random() * 1.3, tw: Math.random() * Math.PI * 2 });
    }
  }
  function draw() {
    ctx.clearRect(0, 0, width, height);
    const bg = ctx.createLinearGradient(0, 0, 0, height);
    bg.addColorStop(0, "#070a1a"); bg.addColorStop(1, "#05060f");
    ctx.fillStyle = bg; ctx.fillRect(0, 0, width, height);

    stars.forEach((s) => {
      const a = 0.4 + Math.sin(t * 0.03 + s.tw) * 0.3;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${a})`; ctx.fill();
    });

    ctx.globalCompositeOperation = "lighter";
    bands.forEach((b, i) => {
      if (i / bands.length > intensity + 0.1) return; // show a band only once intensity is high enough
      const sway = Math.sin(t * 0.01 * b.speed + b.offset) * 60, x = b.x + sway;
      const topY = height * (0.15 + 0.1 * (1 - intensity)), botY = height * 0.85;
      const g = ctx.createLinearGradient(x, topY, x, botY), a = 0.08 + intensity * 0.5;
      g.addColorStop(0, `hsla(${b.hue},90%,65%,0)`);
      g.addColorStop(0.5, `hsla(${b.hue},90%,60%,${a})`);
      g.addColorStop(1, `hsla(${b.hue},90%,55%,0)`);
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x - b.width / 2, botY);
      for (let y = botY; y >= topY; y -= 10) { const w = Math.sin(y * 0.01 + t * 0.02 * b.speed + b.offset) * 30; ctx.lineTo(x - b.width / 2 + w, y); }
      for (let y = topY; y <= botY; y += 10) { const w = Math.sin(y * 0.01 + t * 0.02 * b.speed + b.offset) * 30; ctx.lineTo(x + b.width / 2 + w, y); }
      ctx.closePath(); ctx.fill();
    });
    ctx.globalCompositeOperation = "source-over";
    t++; requestAnimationFrame(draw);
  }
  window.addEventListener("resize", resize); resize(); draw();
  return { setIntensity(v) { intensity = v; } };
}
const heroSky = createAurora(document.getElementById("sky"), 0.35);

/* ---------------------------------------------------------
   2) EUROPE MAP (North→South profile)
   Cities laid out by latitude (pos = 0 north … 1 Vienna).
   kpReach = the Kp at which the city first sees the aurora.
   dist = straight-line distance from Vienna in km.
   --------------------------------------------------------- */
const cities = [
  { name: "Tromsø",     pos: 0.06, kpReach: 0, dist: 2000 },
  { name: "Oslo",       pos: 0.26, kpReach: 3, dist: 1350 },
  { name: "Stockholm",  pos: 0.33, kpReach: 4, dist: 1250 },
  { name: "Copenhagen", pos: 0.46, kpReach: 5, dist: 870  },
  { name: "Berlin",     pos: 0.60, kpReach: 6, dist: 525  },
  { name: "Munich",     pos: 0.80, kpReach: 7, dist: 355  },
  { name: "Vienna",     pos: 0.93, kpReach: 8, dist: 0    },
];

const mapCanvas = document.getElementById("map");
const mctx = mapCanvas.getContext("2d");
let mw, mh, mstars, mt = 0, reachFrac = 0.06, targetReach = 0.06;

function mapResize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  mw = mapCanvas.clientWidth; mh = mapCanvas.clientHeight;
  mapCanvas.width = mw * dpr; mapCanvas.height = mh * dpr;
  mctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  mstars = [];
  for (let i = 0; i < 70; i++) mstars.push({ x: Math.random() * mw, y: Math.random() * mh, r: Math.random() * 1.2, tw: Math.random() * Math.PI * 2 });
}
function drawMap() {
  mctx.clearRect(0, 0, mw, mh);
  const bg = mctx.createLinearGradient(0, 0, 0, mh);
  bg.addColorStop(0, "#081024"); bg.addColorStop(1, "#070a1a");
  mctx.fillStyle = bg; mctx.fillRect(0, 0, mw, mh);

  mstars.forEach((s) => { const a = 0.3 + Math.sin(mt * 0.03 + s.tw) * 0.25; mctx.beginPath(); mctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); mctx.fillStyle = `rgba(255,255,255,${a})`; mctx.fill(); });

  // ease the aurora edge toward its target
  reachFrac += (targetReach - reachFrac) * 0.08;
  const edgeY = reachFrac * mh;

  // glowing band from the top down to the edge
  mctx.globalCompositeOperation = "lighter";
  for (let layer = 0; layer < 3; layer++) {
    const g = mctx.createLinearGradient(0, 0, 0, edgeY);
    const hue = 140 + layer * 50; // green → violet
    g.addColorStop(0, `hsla(${hue},90%,60%,0)`);
    g.addColorStop(0.5, `hsla(${hue},90%,60%,0.10)`);
    g.addColorStop(1, `hsla(${hue},90%,60%,0.28)`);
    mctx.fillStyle = g; mctx.beginPath();
    mctx.moveTo(0, 0); mctx.lineTo(mw, 0); mctx.lineTo(mw, edgeY);
    for (let x = mw; x >= 0; x -= 12) { const wob = Math.sin(x * 0.02 + mt * 0.03 + layer) * 10; mctx.lineTo(x, edgeY + wob); }
    mctx.closePath(); mctx.fill();
  }
  // bright leading edge
  mctx.beginPath();
  for (let x = 0; x <= mw; x += 8) { const wob = Math.sin(x * 0.02 + mt * 0.03) * 10; const y = edgeY + wob; x === 0 ? mctx.moveTo(x, y) : mctx.lineTo(x, y); }
  mctx.strokeStyle = "rgba(167,139,250,0.5)"; mctx.lineWidth = 2; mctx.stroke();
  mctx.globalCompositeOperation = "source-over";

  // cities
  const curKp = Number(kp.value);
  cities.forEach((c) => {
    const cx = mw * 0.5, cy = c.pos * mh;
    const lit = curKp >= c.kpReach;
    mctx.beginPath(); mctx.arc(cx, cy, lit ? 5 : 3.5, 0, Math.PI * 2);
    mctx.fillStyle = lit ? "#6ee7b7" : "rgba(148,163,184,0.5)";
    if (lit) { mctx.shadowColor = "#34d399"; mctx.shadowBlur = 12; } else { mctx.shadowBlur = 0; }
    mctx.fill(); mctx.shadowBlur = 0;

    mctx.font = (c.name === "Vienna" ? "600 " : "400 ") + "13px 'Space Grotesk', sans-serif";
    mctx.fillStyle = lit ? "#d1fae5" : "rgba(148,163,184,0.7)";
    mctx.textBaseline = "middle";
    mctx.fillText(c.name, cx + 12, cy);
    if (c.name === "Vienna") { mctx.fillStyle = lit ? "#6ee7b7" : "#94a3b8"; mctx.fillText("← Leo", cx - 52, cy); }
  });

  mt++; requestAnimationFrame(drawMap);
}
window.addEventListener("resize", mapResize);
mapResize(); drawMap();

/* ---------------------------------------------------------
   3) SLIDER LOGIC: Leo + travel plan + map
   --------------------------------------------------------- */
const kpValue = document.getElementById("kpValue");
const leoEmoji = document.getElementById("leoEmoji");
const leoMood = document.getElementById("leoMood");
const leoLine = document.getElementById("leoLine");
const travelMode = document.getElementById("travelMode");
const travelDist = document.getElementById("travelDist");
const travelBar = document.getElementById("travelBar");
const travelNote = document.getElementById("travelNote");

// southernmost city lit at this Kp (= Leo's nearest target)
function nearestCity(k) {
  let best = cities[0];
  cities.forEach((c) => { if (k >= c.kpReach && c.pos > best.pos) best = c; });
  if (k < cities[0].kpReach) best = cities[0];
  return best;
}

// Leo's mood per Kp (0–9)
const leoStates = [
  { emoji: "😔", mood: "Sad on the couch",          line: "“Nothing in the Vienna sky again tonight…”" },
  { emoji: "😔", mood: "Sad on the couch",          line: "“The far north is just so far away.”" },
  { emoji: "🧐", mood: "Checking the app",          line: "“Hmm, a flight to Norway would be pricey…”" },
  { emoji: "🧳", mood: "Quietly packing a bag",     line: "“Scandinavia is calling. Maybe this weekend?”" },
  { emoji: "🧳", mood: "Bag by the door",           line: "“Stockholm would actually work!”" },
  { emoji: "🚗", mood: "Getting in the car",        line: "“Heading for Denmark — road trip!”" },
  { emoji: "🚗", mood: "Foot on the gas",           line: "“Berlin, here I come! Just a few hours.”" },
  { emoji: "😃", mood: "Almost home",               line: "“Munich?! That's basically around the corner.”" },
  { emoji: "🤩", mood: "Running to Kahlenberg",     line: "“This is THE night — right over Vienna!”" },
  { emoji: "🤩", mood: "Looking out the window",    line: "“I don't even have to leave. Incredible!”" },
];

// travel-plan text per Kp
function travelPlan(k) {
  if (k >= 8) return { mode: "Just look out from Kahlenberg!",   note: "Solar storm — the lights are right over Vienna. A once-in-a-lifetime event." };
  if (k >= 7) return { mode: "Short drive to Munich",            note: "Rarely this close. Hop in the car and you're there in a few hours." };
  if (k >= 6) return { mode: "Road trip to northern Germany",    note: "Head for Berlin — on a clear night that's enough tonight." };
  if (k >= 5) return { mode: "Drive to Copenhagen",              note: "Denmark is reached. Long, but doable by car." };
  if (k >= 4) return { mode: "Trip to Stockholm",                note: "Sweden is in the band. Train or flight — and go." };
  if (k >= 3) return { mode: "Journey to Oslo",                  note: "Southern Norway gets a taste. A quick trip pays off." };
  return         { mode: "Flight to Tromsø needed",              note: "With the sun this calm, the lights stay far up north." };
}

function update(value) {
  const k = Number(value);
  kpValue.textContent = k;

  const st = leoStates[k];
  leoEmoji.textContent = st.emoji;
  leoMood.textContent = st.mood;
  leoLine.textContent = st.line;

  const city = nearestCity(k);
  const plan = travelPlan(k);
  travelMode.textContent = plan.mode;
  travelNote.textContent = plan.note;
  travelDist.textContent = city.dist.toLocaleString("en-US") + " km";
  travelBar.style.width = Math.round((city.dist / 2000) * 100) + "%";

  // aurora edge on the map: from just south of Tromsø down to Vienna
  targetReach = 0.06 + (k / 9) * (0.93 - 0.06);

  // hero glow follows along
  heroSky.setIntensity(0.1 + (k / 9) * 0.9);
}
kp.addEventListener("input", (e) => update(e.target.value));
update(kp.value);

/* ---------------------------------------------------------
   4) AI AURORA QUIZ
   Four questions. Each has 3 options; `correct` is the index
   of the right one, `explain` is the AI assistant's note.
   --------------------------------------------------------- */
const questions = [
  {
    q: "How do the northern lights actually form?",
    options: [
      "Sunlight reflecting off polar ice",
      "Charged solar particles hitting gases in the atmosphere",
      "Moonlight bending through high clouds",
    ],
    correct: 1,
    explain: "Particles from the sun slam into oxygen and nitrogen high in the atmosphere, making them glow — green from oxygen, hints of violet and red from nitrogen.",
  },
  {
    q: "At what altitude does most of the aurora appear?",
    options: [
      "Around 2–5 km, just above the clouds",
      "Around 100–300 km, up in the thermosphere",
      "Around 10 km, where planes fly",
    ],
    correct: 1,
    explain: "The glow sits roughly 100–300 km up — far higher than clouds or aircraft. That's why a clear sky and a dark horizon matter so much.",
  },
  {
    q: "Do your eyes see the aurora as vividly as an AI-enhanced photo?",
    options: [
      "No — cameras and AI pull out colour our eyes barely catch",
      "Yes — it looks exactly the same",
      "Only if you wear special glasses",
    ],
    correct: 0,
    explain: "In faint displays the eye often sees a pale grey-green. Long exposures and AI processing reveal the vivid colour — so the lights are usually stronger than they first look.",
  },
  {
    q: "Why does AI help so much with aurora forecasting?",
    options: [
      "It makes the sun more active",
      "It analyses solar, weather and light-pollution data to predict where and when",
      "It replaces the need to ever go outside",
    ],
    correct: 1,
    explain: "AI fuses real-time solar data, cloud forecasts and light-pollution maps to pinpoint where the show will be visible — exactly the route-planning Leo needs.",
  },
];

const quizCard = document.getElementById("quizCard");
const quizProgress = document.getElementById("quizProgress");
const quizScore = document.getElementById("quizScore");
const quizBar = document.getElementById("quizBar");

let current = 0;
let score = 0;
let answered = false;

function renderQuestion() {
  answered = false;
  const item = questions[current];
  quizProgress.textContent = `Question ${current + 1} of ${questions.length}`;
  quizScore.textContent = `Score: ${score}`;
  quizBar.style.width = Math.round(((current) / questions.length) * 100) + "%";

  quizCard.innerHTML = `
    <h3 class="text-xl md:text-2xl font-semibold mb-6">${item.q}</h3>
    <div class="space-y-3" id="quizOptions"></div>
    <div id="quizExplain" class="quiz-explain mt-5 rounded-2xl border border-emerald-300/20 bg-emerald-400/5 p-4">
      <div class="flex items-start gap-3">
        <span class="text-xl leading-none">🤖</span>
        <div>
          <div class="text-xs uppercase tracking-widest text-emerald-300/80 mb-1">AI assistant</div>
          <p id="quizExplainText" class="text-sm text-slate-300 leading-relaxed"></p>
        </div>
      </div>
      <button id="quizNext" class="mt-4 inline-flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-400 text-[#05060f] font-semibold hover:bg-emerald-300 transition text-sm">
        ${current < questions.length - 1 ? "Next question →" : "See result ✦"}
      </button>
    </div>
  `;

  const optionsEl = document.getElementById("quizOptions");
  item.options.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.className = "quiz-option";
    btn.textContent = opt;
    btn.addEventListener("click", () => selectAnswer(i, btn));
    optionsEl.appendChild(btn);
  });
}

function selectAnswer(choice, btn) {
  if (answered) return;      // lock after first answer
  answered = true;
  const item = questions[current];
  const buttons = quizCard.querySelectorAll(".quiz-option");

  buttons.forEach((b, i) => {
    b.disabled = true;
    if (i === item.correct) b.classList.add("correct");        // always highlight the right one
    if (i === choice && choice !== item.correct) b.classList.add("wrong");
  });

  if (choice === item.correct) score++;
  quizScore.textContent = `Score: ${score}`;

  document.getElementById("quizExplainText").textContent = item.explain;
  document.getElementById("quizExplain").classList.add("show");
  document.getElementById("quizNext").addEventListener("click", nextQuestion);
}

function nextQuestion() {
  if (current < questions.length - 1) {
    current++;
    renderQuestion();
  } else {
    showResult();
  }
}

function showResult() {
  quizProgress.textContent = "Done";
  quizScore.textContent = `Score: ${score}`;
  quizBar.style.width = "100%";

  // Playful verdict scaled to the score
  let verdict;
  if (score === questions.length) verdict = { emoji: "🚀", line: `${score}/${questions.length} correct — you're ready for Tromsø with Leo!` };
  else if (score >= questions.length - 1) verdict = { emoji: "🌟", line: `${score}/${questions.length} correct — pack your bag, you almost nailed it!` };
  else if (score >= 2) verdict = { emoji: "🧭", line: `${score}/${questions.length} correct — a solid start on the aurora trail.` };
  else verdict = { emoji: "📚", line: `${score}/${questions.length} correct — Leo suggests one more read before the trip.` };

  quizCard.innerHTML = `
    <div class="text-center py-4">
      <div class="text-6xl mb-4">${verdict.emoji}</div>
      <h3 class="text-2xl font-bold glow-text mb-2">${verdict.line}</h3>
      <p class="text-slate-400 mb-6">Thanks for playing — now go drag that Kp slider one more time.</p>
      <button id="quizRestart" class="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-white/15 hover:border-emerald-300/60 hover:text-emerald-200 transition text-sm">
        Play again ↻
      </button>
    </div>
  `;
  document.getElementById("quizRestart").addEventListener("click", () => {
    current = 0; score = 0; renderQuestion();
  });
}

renderQuestion();
