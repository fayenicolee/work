import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { createReadStream, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const port = Number(process.env.PORT || 3000);

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8"
};

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

function sanitizePathname(urlPath) {
  const cleanPath = urlPath === "/" ? "/social.html" : urlPath;
  const normalized = path.normalize(cleanPath).replace(/^(\.\.[/\\])+/, "");
  return path.join(__dirname, normalized);
}

async function readRequestBody(request) {
  let body = "";

  for await (const chunk of request) {
    body += chunk;
  }

  return body;
}

function parseInterests(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function hashValue(value) {
  return Array.from(value).reduce((total, char) => total + char.charCodeAt(0), 0);
}

function describeCharacter(seed, gender) {
  const hairStyles = ["curly hair", "short hair", "wavy hair", "a neat bob haircut", "a shaggy haircut"];
  const outfits = ["a bright red hoodie", "a blue superhero shirt", "a green jumper", "a striped t-shirt", "orange overalls"];
  const expressions = ["warm, expressive eyes", "a playful grin", "a curious face", "animated eyebrows", "a friendly smile"];
  const genderLabel = gender === "nonbinary" ? "a child" : gender === "boy" ? "a boy" : "a girl";

  return `${genderLabel} with ${hairStyles[seed % hairStyles.length]}, wearing ${
    outfits[(seed + 1) % outfits.length]
  }, and ${expressions[(seed + 2) % expressions.length]}`;
}

function createFallbackPanels(model) {
  const firstInterest = model.interests[0] || "favorite things";

  return {
    title: `${model.childName}'s social story`,
    summary: `Fallback story shown because the AI service was unavailable. ${model.problem}`,
    panels: [
      {
        title: `${model.childName} starts the day`,
        text: `${model.childName} loves ${firstInterest}. That makes the day feel bright and interesting.`,
        speech: `${firstInterest} power!`
      },
      {
        title: "Then a tricky moment appears",
        text: model.problem,
        speech: "Plot twist."
      },
      {
        title: `${model.childName} notices the feeling`,
        text: `${model.childName} can pause and notice a wiggly body, fast thoughts, or a scrunchy face.`,
        speech: "Pause first."
      },
      {
        title: "A helper joins the scene",
        text: "A teacher can help with calm words, a visual cue, or one small next step.",
        speech: "Team-up time."
      },
      {
        title: `${model.childName} tries the plan`,
        text: "One breath, calm hands, and one step at a time can make a hard moment smaller.",
        speech: "One step at a time."
      },
      {
        title: "The ending feels better",
        text: `${model.childName} does not have to be perfect. Practice helps, and every try counts.`,
        speech: "Small steps win!"
      }
    ]
  };
}

function parseStoryJson(rawText) {
  const fencedMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fencedMatch ? fencedMatch[1].trim() : rawText.trim();

  try {
    return JSON.parse(candidate);
  } catch {
    const start = candidate.indexOf("{");
    const end = candidate.lastIndexOf("}");

    if (start >= 0 && end > start) {
      return JSON.parse(candidate.slice(start, end + 1));
    }

    throw new Error("OpenAI returned text that was not valid JSON.");
  }
}

async function generateStory(model, apiKey) {
  const prompt = [
    "You are writing a social story for a child as a comic strip.",
    "Return valid JSON only.",
    'Use this shape: {"title":"...","summary":"...","panels":[{"title":"...","text":"...","speech":"..."}]}',
    "Requirements:",
    "- exactly 6 panels",
    "- simple language for children",
    "- engaging, descriptive, and gently funny",
    "- emotionally safe and supportive",
    "- never shame the child",
    "- keep each panel text to 1-2 short sentences",
    "- keep each speech bubble to 2-6 words",
    "- include the child's interests naturally",
    "- end with success, reassurance, and practice",
    `Child name: ${model.childName}`,
    `Gender: ${model.childGender}`,
    `Interests: ${model.interests.join(", ")}`,
    `Problem or event: ${model.problem}`
  ].join("\n");

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: process.env.OPENAI_TEXT_MODEL || "gpt-4.1-mini",
      input: prompt
    })
  });

  if (!response.ok) {
    throw new Error(`Story request failed (${response.status}): ${await response.text()}`);
  }

  const data = await response.json();
  const parsed = parseStoryJson(data.output_text || "");

  if (!parsed || !Array.isArray(parsed.panels) || parsed.panels.length !== 6) {
    throw new Error("OpenAI returned a story, but not in the expected 6-panel format.");
  }

  return parsed;
}

function buildPanelImagePrompt(model, panel, panelIndex) {
  const seed = hashValue(model.childName + model.interests.join("-"));
  const characterDescription = describeCharacter(seed, model.childGender);
  const interestDetail = model.interests.length ? model.interests.join(", ") : "favorite things";

  return [
    "Create a single comic-book panel illustration for a teacher social story.",
    "Style: funny, warm, child-friendly, colorful comic art, clean outlines, expressive faces, classroom-friendly, no text in the image.",
    "Keep the same child character design across panels.",
    `Main character: ${model.childName}, ${characterDescription}.`,
    `The child likes: ${interestDetail}.`,
    `Panel number: ${panelIndex + 1}.`,
    `Panel title: ${panel.title}.`,
    `Panel narration: ${panel.text}.`,
    `Speech bubble meaning: ${panel.speech}.`,
    `Overall story situation: ${model.problem}.`,
    "Show the scene clearly and simply so a child can understand it at a glance.",
    "Make it visually descriptive, a little funny, and emotionally safe."
  ].join(" ");
}

async function generatePanelImage(model, panel, panelIndex, apiKey) {
  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: process.env.OPENAI_IMAGE_MODEL || "gpt-image-1",
      prompt: buildPanelImagePrompt(model, panel, panelIndex),
      size: "1024x1024"
    })
  });

  if (!response.ok) {
    throw new Error(`Image request failed (${response.status}): ${await response.text()}`);
  }

  const data = await response.json();
  const image = data?.data?.[0];

  if (image?.b64_json) {
    return `data:image/png;base64,${image.b64_json}`;
  }

  if (image?.url) {
    return image.url;
  }

  throw new Error("OpenAI returned no image.");
}

async function handleSocialStory(request, response) {
  const apiKey = process.env.OPENAI_API_KEY;
  let model = {
    childName: "This child",
    childGender: "girl",
    interests: ["favorite things"],
    problem: "A tricky moment happened."
  };

  if (!apiKey) {
    sendJson(response, 500, { error: "Server is missing OPENAI_API_KEY." });
    return;
  }

  try {
    const body = JSON.parse(await readRequestBody(request) || "{}");
    model = {
      childName: String(body.childName || "").trim(),
      childGender: String(body.childGender || "girl").trim(),
      interests: parseInterests(body.interests),
      problem: String(body.problem || "").trim()
    };

    if (!model.childName || !model.problem || model.interests.length === 0) {
      sendJson(response, 400, { error: "childName, interests, and problem are required." });
      return;
    }

    const story = await generateStory(model, apiKey);
    const panels = [];
    let imageFailures = 0;

    for (const [index, panel] of story.panels.entries()) {
      try {
        const imageUrl = await generatePanelImage(model, panel, index, apiKey);
        panels.push({ ...panel, imageUrl });
      } catch {
        imageFailures += 1;
        panels.push({ ...panel, imageUrl: null });
      }
    }

    sendJson(response, 200, {
      title: story.title || `${model.childName}'s social story`,
      summary: story.summary || `This strip is based on: ${model.problem}`,
      panels,
      imageFailures
    });
  } catch (error) {
    const fallback = createFallbackPanels(model);

    sendJson(response, 500, {
      error: error.message,
      fallback
    });
  }
}

createServer(async (request, response) => {
  const requestUrl = new URL(request.url, `http://${request.headers.host}`);

  if (request.method === "POST" && requestUrl.pathname === "/api/social-story") {
    await handleSocialStory(request, response);
    return;
  }

  const filePath = sanitizePathname(requestUrl.pathname);

  if (!existsSync(filePath)) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  const extension = path.extname(filePath).toLowerCase();
  response.writeHead(200, { "Content-Type": mimeTypes[extension] || "application/octet-stream" });

  if (extension === ".html" || extension === ".css" || extension === ".js" || extension === ".txt") {
    response.end(await readFile(filePath));
    return;
  }

  createReadStream(filePath).pipe(response);
}).listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
