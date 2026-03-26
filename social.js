const storyForm = document.getElementById("storyForm");
const childNameInput = document.getElementById("childName");
const childGenderInput = document.getElementById("childGender");
const childInterestsInput = document.getElementById("childInterests");
const storyProblemInput = document.getElementById("storyProblem");
const storyTitle = document.getElementById("storyTitle");
const storySummary = document.getElementById("storySummary");
const comicGrid = document.getElementById("comicGrid");
const printButton = document.getElementById("printButton");
const statusCopy = document.getElementById("statusCopy");

const appConfig = window.APP_CONFIG || {};

const defaults = {
  childName: "Maya",
  childGender: "girl",
  childInterests: "dinosaurs, drawing, trains",
  storyProblem: "Maya gets upset when it is time to stop drawing and line up for lunch."
};

const sceneThemes = [
  { name: "classroom", label: "In the classroom", color: "#8bd3ff" },
  { name: "hallway", label: "During a change", color: "#ffd84d" },
  { name: "calm-corner", label: "Taking a pause", color: "#8de6c4" },
  { name: "support", label: "With a teacher", color: "#ffbf99" },
  { name: "success", label: "Feeling ready", color: "#ff5f5d" },
  { name: "celebration", label: "A good ending", color: "#c7b8ff" }
];

function parseInterests(value) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function hashValue(value) {
  return Array.from(value).reduce((total, char) => total + char.charCodeAt(0), 0);
}

function chooseAppearance(seed) {
  const hairColors = ["#2f2a26", "#6b4423", "#a65f39", "#1f2333", "#d08d54"];
  const shirtColors = ["#ff5f5d", "#5d7cff", "#00b894", "#ff8fab", "#f4a261"];
  const skinTones = ["#f6d2b8", "#edbf98", "#d9956e", "#8c5a3c"];

  return {
    hair: hairColors[seed % hairColors.length],
    shirt: shirtColors[(seed + 2) % shirtColors.length],
    skin: skinTones[(seed + 1) % skinTones.length]
  };
}

function pickInterestIcon(interests, index) {
  const interest = (interests[index % interests.length] || "kindness").toLowerCase();

  if (interest.includes("dino")) return "dino";
  if (interest.includes("train")) return "train";
  if (interest.includes("draw") || interest.includes("art")) return "star";
  if (interest.includes("music")) return "note";
  if (interest.includes("book") || interest.includes("read")) return "book";
  if (interest.includes("space")) return "rocket";
  if (interest.includes("ball") || interest.includes("soccer") || interest.includes("sport")) return "ball";
  if (interest.includes("animal")) return "paw";

  return "heart";
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function createIcon(icon, x, y) {
  if (icon === "dino") {
    return `<path d="M${x} ${y} l18 -10 18 8 8 16 -8 10 -14 -3 -10 12 -8 -5 8 -12 -12 -5z" fill="#7ac74f" stroke="#1f2333" stroke-width="3"/>`;
  }

  if (icon === "train") {
    return `<g transform="translate(${x} ${y})"><rect width="44" height="22" rx="4" fill="#5d7cff" stroke="#1f2333" stroke-width="3"/><circle cx="10" cy="25" r="5" fill="#1f2333"/><circle cx="33" cy="25" r="5" fill="#1f2333"/><rect x="6" y="5" width="10" height="8" fill="#fff"/><rect x="20" y="5" width="10" height="8" fill="#fff"/></g>`;
  }

  if (icon === "note") {
    return `<path d="M${x} ${y} v-28 l22 -4 v25 a8 8 0 1 1 -5 -7 v-11 l-12 2 v18 a8 8 0 1 1 -5 -7z" fill="#8a5cf6" stroke="#1f2333" stroke-width="3"/>`;
  }

  if (icon === "book") {
    return `<g transform="translate(${x} ${y})"><path d="M0 0 h24 q8 0 8 8 v26 h-24 q-8 0 -8 8 z" fill="#ffd84d" stroke="#1f2333" stroke-width="3"/><path d="M48 0 h-24 q-8 0 -8 8 v26 h24 q8 0 8 8 z" fill="#ffbf99" stroke="#1f2333" stroke-width="3"/></g>`;
  }

  if (icon === "rocket") {
    return `<g transform="translate(${x} ${y})"><path d="M18 0 c14 10 18 22 18 38 l-18 10 -18 -10 c0 -16 4 -28 18 -38z" fill="#ff5f5d" stroke="#1f2333" stroke-width="3"/><circle cx="18" cy="20" r="6" fill="#fff"/><path d="M6 40 l-8 14 14 -8z M30 40 l8 14 -14 -8z" fill="#ffd84d" stroke="#1f2333" stroke-width="3"/></g>`;
  }

  if (icon === "ball") {
    return `<circle cx="${x}" cy="${y}" r="18" fill="#fff" stroke="#1f2333" stroke-width="3"/><path d="M${x - 10} ${y - 8} q10 8 20 0 M${x - 6} ${y + 15} q6 -9 12 0 M${x} ${y - 18} v36" stroke="#1f2333" stroke-width="3" fill="none"/>`;
  }

  if (icon === "paw") {
    return `<g fill="#ff8fab" stroke="#1f2333" stroke-width="3"><circle cx="${x}" cy="${y}" r="12"/><circle cx="${x - 12}" cy="${y - 14}" r="6"/><circle cx="${x + 12}" cy="${y - 14}" r="6"/><circle cx="${x - 4}" cy="${y - 24}" r="6"/><circle cx="${x + 4}" cy="${y - 24}" r="6"/></g>`;
  }

  if (icon === "star") {
    return `<path d="M${x} ${y - 20} l6 12 14 2 -10 10 2 14 -12 -7 -12 7 2 -14 -10 -10 14 -2z" fill="#ffd84d" stroke="#1f2333" stroke-width="3"/>`;
  }

  return `<path d="M${x} ${y} c0 -10 9 -16 17 -16 7 0 11 4 13 8 2 -4 6 -8 13 -8 8 0 17 6 17 16 0 18 -30 31 -30 31s-30 -13 -30 -31z" fill="#ff5f5d" stroke="#1f2333" stroke-width="3"/>`;
}

function setStatus(message, tone = "") {
  statusCopy.textContent = message;
  statusCopy.className = "status-copy";

  if (tone) {
    statusCopy.classList.add(`is-${tone}`);
  }
}

function createFallbackPanels(model) {
  const firstInterest = model.interests[0] || "favorite things";

  return [
    {
      title: `${model.childName} starts the day`,
      text: `${model.childName} loves ${firstInterest}. That makes the day feel bright and interesting.`,
      speech: `${firstInterest} power!`
    },
    {
      title: `Then a tricky moment appears`,
      text: model.problem,
      speech: `Plot twist.`
    },
    {
      title: `${model.childName} notices the feeling`,
      text: `${model.childName} can pause and notice a wiggly body, fast thoughts, or a scrunchy face.`,
      speech: `Pause first.`
    },
    {
      title: `A helper joins the scene`,
      text: `A teacher can help with calm words, a visual cue, or one small next step.`,
      speech: `Team-up time.`
    },
    {
      title: `${model.childName} tries the plan`,
      text: `One breath, calm hands, and one step at a time can make a hard moment smaller.`,
      speech: `I can do one step.`
    },
    {
      title: `The ending feels better`,
      text: `${model.childName} does not have to be perfect. Practice helps, and every try counts.`,
      speech: `Small steps win!`
    }
  ];
}

async function generateSocialStory(model) {
  const response = await fetch(appConfig.socialStoryEndpoint || "/api/social-story", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(model)
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.error || "The social story request failed.");
    error.fallback = data.fallback;
    throw error;
  }

  return data;
}

function createPanelArt({ panel, panelIndex, childName, interests }) {
  const theme = sceneThemes[panelIndex % sceneThemes.length];
  const seed = hashValue(childName + interests.join("-"));
  const appearance = chooseAppearance(seed);
  const icon = pickInterestIcon(interests, panelIndex);
  const bubbleX = panelIndex % 2 === 0 ? 178 : 36;
  const bubbleTail = panelIndex % 2 === 0 ? "300,126 265,152 244,148" : "92,126 122,150 144,148";

  return `
    <svg viewBox="0 0 420 300" role="img" aria-label="${escapeHtml(panel.title)}">
      <rect width="420" height="300" fill="${theme.color}"/>
      <rect x="0" y="212" width="420" height="88" fill="#f4ead9"/>
      <circle cx="360" cy="58" r="22" fill="#fff4a3" stroke="#1f2333" stroke-width="4"/>
      <rect x="24" y="34" width="110" height="44" rx="22" fill="#fff" stroke="#1f2333" stroke-width="4"/>
      <text x="79" y="62" text-anchor="middle" font-family="Nunito, sans-serif" font-size="18" font-weight="800" fill="#1f2333">
        ${escapeHtml(theme.label)}
      </text>

      <ellipse cx="210" cy="254" rx="88" ry="20" fill="rgba(31,35,51,0.12)"/>
      <circle cx="210" cy="120" r="40" fill="${appearance.skin}" stroke="#1f2333" stroke-width="4"/>
      <path d="M170 112 q8 -46 40 -46 q36 0 40 46 v-20 q0 -30 -40 -30 q-34 0 -40 30z" fill="${appearance.hair}" stroke="#1f2333" stroke-width="4"/>
      <circle cx="194" cy="122" r="4.5" fill="#1f2333"/>
      <circle cx="226" cy="122" r="4.5" fill="#1f2333"/>
      <path d="M194 145 q16 12 32 0" stroke="#1f2333" stroke-width="4" fill="none" stroke-linecap="round"/>
      <rect x="160" y="162" width="100" height="72" rx="18" fill="${appearance.shirt}" stroke="#1f2333" stroke-width="4"/>
      <path d="M160 176 l-28 44 M260 176 l28 44 M186 234 v38 M234 234 v38" stroke="#1f2333" stroke-width="4" stroke-linecap="round"/>

      <rect x="${bubbleX}" y="34" width="186" height="92" rx="18" fill="#fff" stroke="#1f2333" stroke-width="4"/>
      <polygon points="${bubbleTail}" fill="#fff" stroke="#1f2333" stroke-width="4"/>
      <text x="${bubbleX + 93}" y="68" text-anchor="middle" font-family="Nunito, sans-serif" font-size="17" font-weight="800" fill="#1f2333">
        <tspan x="${bubbleX + 93}" dy="0">${escapeHtml(String(panel.speech || ""))}</tspan>
      </text>

      ${createIcon(icon, 72, 206)}
      ${createIcon(icon, 346, 212)}

      <path d="M330 200 l30 -12 16 26 -24 18z" fill="#fff" opacity="0.4"/>
      <path d="M38 176 l22 -8 12 18 -18 16z" fill="#fff" opacity="0.35"/>
    </svg>
  `;
}

function renderPanels(model, storyData, options = {}) {
  const { showImageLoading = true } = options;
  const panels = storyData.panels;

  storyTitle.textContent = storyData.title || `${model.childName}'s social story`;
  storySummary.textContent = storyData.summary || `This strip is based on: ${model.problem}`;

  comicGrid.innerHTML = panels
    .map(
      (panel, index) => `
        <article class="comic-panel" data-panel-index="${index}">
          <div class="panel-art panel-art-media">
            <div class="panel-loading"${showImageLoading ? "" : " hidden"}>Drawing panel ${index + 1}...</div>
            <img class="panel-ai-image" src="${escapeHtml(panel.imageUrl || "")}" alt="${escapeHtml(panel.title)} illustration"${
              panel.imageUrl ? "" : " hidden"
            } />
            <div class="panel-art-fallback"${panel.imageUrl ? " hidden" : ""}>${createPanelArt({
              panel,
              panelIndex: index,
              childName: model.childName,
              interests: model.interests
            })}</div>
          </div>
          <div class="panel-copy">
            <span class="panel-index">Panel ${index + 1}</span>
            <h3 class="panel-title">${escapeHtml(panel.title)}</h3>
            <p class="panel-text">${escapeHtml(panel.text)}</p>
          </div>
        </article>
      `
    )
    .join("");
}

function getModelFromForm() {
  return {
    childName: childNameInput.value.trim(),
    childGender: childGenderInput.value,
    interests: parseInterests(childInterestsInput.value),
    problem: storyProblemInput.value.trim()
  };
}

function applyDefaults() {
  childNameInput.value = defaults.childName;
  childGenderInput.value = defaults.childGender;
  childInterestsInput.value = defaults.childInterests;
  storyProblemInput.value = defaults.storyProblem;
}

function renderEmptyState() {
  comicGrid.innerHTML = `
    <div class="empty-state">
      Enter the child's details, then generate a story. The comic panels will appear here.
    </div>
  `;
}

storyForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!storyForm.reportValidity()) {
    return;
  }

  const model = getModelFromForm();

  setStatus("Generating story with ChatGPT...", "loading");

  try {
    const storyData = await generateSocialStory(model);
    renderPanels(model, storyData, { showImageLoading: false });
    if (storyData.imageFailures > 0) {
      setStatus(
        `Story generated with ChatGPT. ${storyData.imageFailures} panel image${
          storyData.imageFailures === 1 ? "" : "s"
        } used fallback art.`,
        "error"
      );
    } else {
      setStatus("Story and images generated with ChatGPT.");
    }
  } catch (error) {
    renderPanels(
      model,
      error.fallback || {
        title: `${model.childName}'s social story`,
        summary: `Fallback story shown because ChatGPT was unavailable. ${model.problem}`,
        panels: createFallbackPanels(model)
      },
      { showImageLoading: false }
    );
    setStatus(error.message, "error");
  }
});

printButton.addEventListener("click", () => {
  window.print();
});

applyDefaults();
renderEmptyState();
