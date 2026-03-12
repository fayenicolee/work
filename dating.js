const characters = [
  {
    name: "Katya",
    image: "./books/Book-1.png",
    pdf: "./books/Book-1.pdf",
    tagline: "Quiet mystery energy",
    prompt: "Would Katya win the room with sweetness, suspense, or both?"
  },
  {
    name: "Esther",
    image: "./books/Book-2.png",
    pdf: "./books/Book-2.pdf",
    tagline: "Main character confidence",
    prompt: "How warm, spooky, and wildly imaginative is Esther under pressure?"
  },
  {
    name: "Lola",
    image: "./books/Book-3.png",
    pdf: "./books/Book-3.pdf",
    tagline: "Sparkly chaos gremlin",
    prompt: "Lola arrives with energy. Does that energy feel delightful, terrifying, or iconic?"
  },
  {
    name: "Sarp",
    image: "./books/Book-4.png",
    pdf: "./books/Book-4.pdf",
    tagline: "Unexpected softie arc",
    prompt: "Rate Sarp on warmth, fright factor, and big-idea power."
  },
  {
    name: "Character Five",
    image: "./books/Book-5.png",
    pdf: "./books/Book-5.pdf",
    tagline: "Adventure-coded heartthrob",
    prompt: "Would this character brighten the plot, haunt the hallways, or invent something incredible?"
  },
  {
    name: "Character Six",
    image: "./books/Book-6.png",
    pdf: "./books/Book-6.pdf",
    tagline: "Soft-focus dreamboat",
    prompt: "Judge the mix of kindness, goosebumps, and imagination."
  },
  {
    name: "Character Seven",
    image: "./books/Book-7.png",
    pdf: "./books/Book-7.pdf",
    tagline: "Wildcard with a redemption arc",
    prompt: "Does this one feel cuddly, creepy, or creatively unstoppable?"
  },
  {
    name: "Character Eight",
    image: "./books/Book-8.png",
    pdf: "./books/Book-8.pdf",
    tagline: "Library date specialist",
    prompt: "Score the charm, the shivers, and the imagination level."
  },
  {
    name: "Character Nine",
    image: "./books/Book-9.png",
    pdf: "./books/Book-9.pdf",
    tagline: "Plot twist prince",
    prompt: "Final round: who gets top marks for positivity, scariness, and creativity?"
  }
];

const scales = [
  { id: "positivity", label: "Positivity" },
  { id: "scariness", label: "Scariness" },
  { id: "creativity", label: "Creativity" }
];

const appConfig = window.APP_CONFIG || {};
const sheetEndpoint = (appConfig.sheetsEndpoint || "").trim();
const draftStorageKey = "book-speed-dating-drafts";

const participantForm = document.getElementById("participantForm");
const participantName = document.getElementById("participantName");
const participantGroup = document.getElementById("participantGroup");
const progressCount = document.getElementById("progressCount");
const sheetStatus = document.getElementById("sheetStatus");
const ratingForm = document.getElementById("ratingForm");
const scaleGrid = document.getElementById("scaleGrid");
const notes = document.getElementById("notes");
const prevButton = document.getElementById("prevButton");
const submitButton = document.getElementById("submitButton");
const characterArt = document.getElementById("characterArt");
const characterNumber = document.getElementById("characterNumber");
const characterName = document.getElementById("characterName");
const characterTagline = document.getElementById("characterTagline");
const characterPrompt = document.getElementById("characterPrompt");
const characterCard = document.getElementById("characterCard");
const summaryCard = document.getElementById("summaryCard");
const summaryText = document.getElementById("summaryText");
const startOverButton = document.getElementById("startOverButton");

let activeIndex = 0;
let submissions = loadDrafts();

function loadDrafts() {
  try {
    const raw = localStorage.getItem(draftStorageKey);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveDrafts() {
  localStorage.setItem(draftStorageKey, JSON.stringify(submissions));
}

function currentCharacter() {
  return characters[activeIndex];
}

function currentDraft() {
  return submissions[currentCharacter().name] || null;
}

function updateConnectionState(message) {
  sheetStatus.textContent = message;
}

function renderScales() {
  scaleGrid.innerHTML = scales
    .map(
      (scale) => `
        <fieldset class="scale-card">
          <legend>${scale.label}</legend>
          <div class="heart-row" role="radiogroup" aria-label="${scale.label}">
            ${[1, 2, 3, 4, 5]
              .map(
                (value) => `
                  <label class="heart-option" aria-label="${value} hearts">
                    <input type="radio" name="${scale.id}" value="${value}" required />
                    <span class="heart" aria-hidden="true">♥</span>
                  </label>
                `
              )
              .join("")}
          </div>
          <div class="scale-numbers" aria-hidden="true">
            <span>1</span>
            <span>2</span>
            <span>3</span>
            <span>4</span>
            <span>5</span>
          </div>
        </fieldset>
      `
    )
    .join("");

  scaleGrid.querySelectorAll(".heart-row").forEach((row) => {
    updateHeartRow(row);
    row.addEventListener("change", () => updateHeartRow(row));
  });
}

function updateHeartRow(row) {
  const selected = row.querySelector("input:checked");
  const selectedValue = selected ? Number(selected.value) : 0;
  row.dataset.selected = String(selectedValue);
}

function renderCharacter() {
  const character = currentCharacter();
  const draft = currentDraft();

  characterArt.src = character.image;
  characterArt.alt = `${character.name} cover art`;
  characterNumber.textContent = `Character ${activeIndex + 1}`;
  characterName.textContent = character.name;
  characterTagline.textContent = character.tagline;
  characterPrompt.innerHTML = `${character.prompt} <a href="${character.pdf}" target="_blank" rel="noreferrer">Open character book</a>`;
  progressCount.textContent = `${Math.min(activeIndex + 1, characters.length)} / ${characters.length}`;
  prevButton.disabled = activeIndex === 0;
  submitButton.textContent = activeIndex === characters.length - 1 ? "Submit final rating" : "Save and next";

  scales.forEach((scale) => {
    const options = Array.from(ratingForm.querySelectorAll(`input[name="${scale.id}"]`));
    options.forEach((option) => {
      option.checked = draft ? String(draft[scale.id]) === option.value : false;
    });
    updateHeartRow(options[0].closest(".heart-row"));
  });

  notes.value = draft?.notes || "";
}

function collectFormValues() {
  const ratingValues = Object.fromEntries(
    scales.map((scale) => {
      const selected = ratingForm.querySelector(`input[name="${scale.id}"]:checked`);
      return [scale.id, selected ? Number(selected.value) : null];
    })
  );

  return {
    participantName: participantName.value.trim(),
    participantGroup: participantGroup.value.trim(),
    character: currentCharacter().name,
    characterIndex: activeIndex + 1,
    submittedAt: new Date().toISOString(),
    notes: notes.value.trim(),
    ...ratingValues
  };
}

function validateParticipant() {
  if (participantForm.reportValidity()) {
    return true;
  }

  participantName.focus();
  return false;
}

async function pushToGoogleSheets(payload) {
  if (!sheetEndpoint) {
    updateConnectionState("Using local draft mode");
    return { ok: true, mode: "draft" };
  }

  const response = await fetch(sheetEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Sheet request failed with status ${response.status}`);
  }

  updateConnectionState("Connected");
  return response.json().catch(() => ({ ok: true }));
}

function saveSubmission(payload) {
  submissions[payload.character] = payload;
  saveDrafts();
}

function allCharactersRated() {
  return characters.every((character) => submissions[character.name]);
}

function showSummary() {
  ratingForm.hidden = true;
  characterCard.hidden = true;
  summaryCard.hidden = false;
  const participant = participantName.value.trim() || "This guest";
  summaryText.textContent = `${participant} rated ${characters.length} characters. ${
    sheetEndpoint ? "Results were sent to Google Sheets." : "Results are stored in this browser until you connect Google Sheets."
  }`;
}

function resetExperience() {
  submissions = {};
  activeIndex = 0;
  saveDrafts();
  summaryCard.hidden = true;
  characterCard.hidden = false;
  ratingForm.hidden = false;
  ratingForm.reset();
  renderCharacter();
}

ratingForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!validateParticipant() || !ratingForm.reportValidity()) {
    return;
  }

  const payload = collectFormValues();
  submitButton.disabled = true;
  submitButton.textContent = "Saving...";

  try {
    await pushToGoogleSheets(payload);
    saveSubmission(payload);

    if (allCharactersRated()) {
      showSummary();
    } else {
      activeIndex = Math.min(activeIndex + 1, characters.length - 1);
      renderCharacter();
    }
  } catch (error) {
    updateConnectionState("Connection failed");
    window.alert(`Could not send rating to Google Sheets. ${error.message}`);
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = activeIndex === characters.length - 1 ? "Submit final rating" : "Save and next";
  }
});

prevButton.addEventListener("click", () => {
  activeIndex = Math.max(activeIndex - 1, 0);
  renderCharacter();
});

startOverButton.addEventListener("click", resetExperience);

renderScales();
updateConnectionState(sheetEndpoint ? "Ready to connect" : "Not connected yet");

if (allCharactersRated()) {
  showSummary();
} else {
  renderCharacter();
}
