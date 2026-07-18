const MAX_PROFILE_TAGS = 6;
const profileType = localStorage.getItem("ntdProfileType") || "individual";

const introScreen = document.getElementById("introScreen");
const questionScreen = document.getElementById("questionScreen");
const resultsScreen = document.getElementById("resultsScreen");
const quizHeading = document.getElementById("quizHeading");
const quizIntro = document.getElementById("quizIntro");
const startQuiz = document.getElementById("startQuiz");
const questionNumber = document.getElementById("questionNumber");
const questionProgressFill = document.getElementById("questionProgressFill");
const questionText = document.getElementById("questionText");
const answerOptions = document.getElementById("answerOptions");
const ottoReaction = document.getElementById("ottoReaction");
const reactionText = document.getElementById("reactionText");
const nextQuestion = document.getElementById("nextQuestion");
const liveRecommendations = document.getElementById("liveRecommendations");
const recommendationCount = document.getElementById("recommendationCount");
const workStyleIcon = document.getElementById("workStyleIcon");
const workStyleName = document.getElementById("workStyleName");
const workStyleDescription = document.getElementById("workStyleDescription");
const finalTagOptions = document.getElementById("finalTagOptions");
const finalTagCount = document.getElementById("finalTagCount");
const customProfileTag = document.getElementById("customProfileTag");
const customTagCount = document.getElementById("customTagCount");
const addCustomTag = document.getElementById("addCustomTag");
const restartQuiz = document.getElementById("restartQuiz");
const saveTags = document.getElementById("saveTags");
const quizMessage = document.getElementById("quizMessage");

const blockedTerms = ["fuck","shit","bitch","asshole","cunt","dick","pussy","nigger","faggot"];

const questions = [
  {
    text: "A customer is unhappy. What do you usually do first?",
    answers: [
      { text: "Explain what happened clearly", reaction: "You value honesty and helping people understand the situation.", tags: ["Honest","Great Communicator"], styles: { teacher: 2, strategist: 1 } },
      { text: "Keep working until they’re satisfied", reaction: "Customer satisfaction clearly matters a lot to you.", tags: ["Dedicated","Customer Focused","Reliable"], styles: { helper: 2, craftsman: 1 } },
      { text: "Find a fair compromise", reaction: "You sound practical, flexible, and willing to meet people halfway.", tags: ["Cooperative","Fair","Problem Solver"], styles: { problemSolver: 2, teamPlayer: 1 } },
      { text: "Own the mistake and make it right", reaction: "That tells me you care about accountability and trust.", tags: ["Accountable","Trustworthy","Fair"], styles: { helper: 1, craftsman: 2 } }
    ]
  },
  {
    text: "Someone asks you a lot of questions. How do you respond?",
    answers: [
      { text: "I enjoy explaining everything", reaction: "You seem patient and comfortable helping people learn.", tags: ["Patient","Helpful","Great Communicator"], styles: { teacher: 3 } },
      { text: "I show examples so it makes sense", reaction: "You like making ideas practical and easy to understand.", tags: ["Helpful","Creative","Clear"], styles: { teacher: 2, creator: 1 } },
      { text: "I keep it short and simple", reaction: "You value clarity and getting directly to the point.", tags: ["Clear","Efficient","Professional"], styles: { strategist: 2, problemSolver: 1 } },
      { text: "I match how they like to communicate", reaction: "You pay attention to people and adapt to what they need.", tags: ["Adaptable","Friendly","Understanding"], styles: { teamPlayer: 2, helper: 1 } }
    ]
  },
  {
    text: "How do you normally approach a new problem?",
    answers: [
      { text: "Research it before I begin", reaction: "You like being prepared and making informed decisions.", tags: ["Prepared","Thoughtful","Detail-Oriented"], styles: { strategist: 3 } },
      { text: "Try different ideas until something works", reaction: "You’re comfortable experimenting and finding your own path.", tags: ["Creative","Persistent","Problem Solver"], styles: { creator: 2, problemSolver: 2 } },
      { text: "Use a method I already trust", reaction: "You value consistency, experience, and dependable results.", tags: ["Reliable","Consistent","Professional"], styles: { craftsman: 2, strategist: 1 } },
      { text: "Ask others and solve it together", reaction: "You enjoy teamwork and hearing different perspectives.", tags: ["Team Player","Cooperative","Open-Minded"], styles: { teamPlayer: 3 } }
    ]
  },
  {
    text: "What best describes your normal work pace?",
    answers: [
      { text: "Fast—I like getting things moving", reaction: "You bring energy and don’t like letting work sit around.", tags: ["Energetic","Fast-Moving","Motivated"], styles: { goGetter: 3 } },
      { text: "Steady—I focus on being dependable", reaction: "You care more about consistency than rushing.", tags: ["Reliable","Calm","Consistent"], styles: { craftsman: 2, helper: 1 } },
      { text: "Careful—I check the details", reaction: "You take pride in accuracy and catching small things.", tags: ["Detail-Oriented","Thorough","Careful"], styles: { craftsman: 3 } },
      { text: "Flexible—it depends on the job", reaction: "You adjust your approach instead of forcing one style.", tags: ["Flexible","Adaptable","Practical"], styles: { problemSolver: 2, teamPlayer: 1 } }
    ]
  },
  {
    text: "When working with someone new, what feels most natural?",
    answers: [
      { text: "Chatting and getting to know them", reaction: "You bring warmth and personality into your work.", tags: ["Friendly","Outgoing","Approachable"], styles: { helper: 2, teamPlayer: 1 } },
      { text: "Being polite and focused on the job", reaction: "You keep things respectful, clear, and professional.", tags: ["Professional","Respectful","Focused"], styles: { craftsman: 1, strategist: 2 } },
      { text: "Helping them feel comfortable", reaction: "You notice how people feel and try to make things easier.", tags: ["Caring","Patient","Understanding"], styles: { helper: 3 } },
      { text: "Taking the lead and creating a plan", reaction: "You’re comfortable giving direction and keeping things organized.", tags: ["Leader","Organized","Confident"], styles: { goGetter: 2, strategist: 1 } }
    ]
  }
];

const workStyles = {
  problemSolver: { icon: "🧩", name: "Problem Solver", description: "You like finding practical solutions, adjusting when needed, and keeping things moving." },
  helper: { icon: "🌱", name: "Helper", description: "You care about making people comfortable, supported, and satisfied with the experience." },
  teacher: { icon: "🎓", name: "Teacher", description: "You enjoy helping people understand, answering questions, and explaining things clearly." },
  craftsman: { icon: "🛠️", name: "Craftsperson", description: "You value dependable results, careful work, and doing things properly." },
  goGetter: { icon: "⚡", name: "Go-Getter", description: "You bring energy, confidence, and momentum to the work you take on." },
  strategist: { icon: "🧠", name: "Strategist", description: "You like planning, researching, and making thoughtful decisions before acting." },
  creator: { icon: "🎨", name: "Creator", description: "You enjoy trying different ideas and finding original ways to solve problems." },
  teamPlayer: { icon: "🤝", name: "Team Player", description: "You work well with others, adapt to people, and value cooperation." }
};

let currentQuestionIndex = 0;
let selectedAnswerIndex = null;
let answers = [];
let tagScores = {};
let styleScores = {};
let selectedFinalTags = new Set();
let availableFinalTags = [];

if (profileType === "shop") {
  quizHeading.textContent = "Let’s learn how your shop treats customers.";
  quizIntro.textContent = "I’ll use your answers to recommend honest profile tags for your shop.";
} else if (profileType === "business" || profileType === "large-business") {
  quizHeading.textContent = "Let’s learn how your business works with customers.";
  quizIntro.textContent = "I’ll use your answers to recommend honest profile tags for your business.";
}

startQuiz.addEventListener("click", () => {
  resetScoring();
  showScreen(questionScreen);
  renderQuestion();
});

nextQuestion.addEventListener("click", () => {
  if (selectedAnswerIndex === null) return;
  if (currentQuestionIndex < questions.length - 1) {
    currentQuestionIndex += 1;
    renderQuestion();
  } else {
    showResults();
  }
});

restartQuiz.addEventListener("click", restartQuizFlow);
saveTags.addEventListener("click", saveProfileTags);
addCustomTag.addEventListener("click", addCustomProfileTag);

customProfileTag.addEventListener("input", () => {
  customTagCount.textContent = `${customProfileTag.value.length}/24`;
  clearMessage();
});

customProfileTag.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    event.preventDefault();
    addCustomProfileTag();
  }
});

function renderQuestion() {
  const question = questions[currentQuestionIndex];
  selectedAnswerIndex = null;
  questionNumber.textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
  questionProgressFill.style.width = `${((currentQuestionIndex + 1) / questions.length) * 100}%`;
  questionText.textContent = question.text;
  answerOptions.innerHTML = "";
  ottoReaction.hidden = true;
  nextQuestion.hidden = true;

  question.answers.forEach((answer, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "answer-option";
    button.innerHTML = `<span class="answer-radio"></span><span>${escapeHTML(answer.text)}</span>`;
    button.addEventListener("click", () => selectAnswer(index));
    answerOptions.appendChild(button);
  });
}

function selectAnswer(index) {
  if (selectedAnswerIndex !== null) return;

  selectedAnswerIndex = index;
  const answer = questions[currentQuestionIndex].answers[index];

  [...answerOptions.children].forEach((button, buttonIndex) => {
    button.disabled = true;
    if (buttonIndex === index) button.classList.add("selected");
  });

  answers[currentQuestionIndex] = { questionIndex: currentQuestionIndex, answerIndex: index };

  answer.tags.forEach((tag, position) => {
    tagScores[tag] = (tagScores[tag] || 0) + (answer.tags.length - position);
  });

  Object.entries(answer.styles).forEach(([style, score]) => {
    styleScores[style] = (styleScores[style] || 0) + score;
  });

  reactionText.textContent = answer.reaction;
  ottoReaction.hidden = false;
  nextQuestion.hidden = false;
  nextQuestion.textContent = currentQuestionIndex === questions.length - 1 ? "See My Results →" : "Next Question →";
  renderLiveRecommendations();
}

function renderLiveRecommendations() {
  const recommended = getRecommendedTags(6);
  recommendationCount.textContent = recommended.length;
  liveRecommendations.innerHTML = "";

  if (!recommended.length) {
    liveRecommendations.innerHTML = `<div class="empty-recommendations"><span>🐙</span><p>Your suggested tags will appear here as you answer.</p></div>`;
    return;
  }

  recommended.forEach((tag, index) => {
    const item = document.createElement("div");
    item.className = "live-tag";
    item.style.animationDelay = `${index * 40}ms`;
    item.innerHTML = `<span>✨</span><strong>${escapeHTML(tag)}</strong>`;
    liveRecommendations.appendChild(item);
  });
}

function showResults() {
  const style = workStyles[getWinningStyle()];
  workStyleIcon.textContent = style.icon;
  workStyleName.textContent = style.name;
  workStyleDescription.textContent = style.description;

  availableFinalTags = getRecommendedTags(10);
  selectedFinalTags = new Set(availableFinalTags.slice(0, MAX_PROFILE_TAGS));
  renderFinalTags();
  showScreen(resultsScreen);
}

function renderFinalTags() {
  finalTagOptions.innerHTML = "";

  availableFinalTags.forEach(tag => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "final-tag-option";

    if (selectedFinalTags.has(tag)) button.classList.add("selected");

    button.innerHTML = `<span class="final-tag-check">✓</span><span>${escapeHTML(tag)}</span>`;
    button.addEventListener("click", () => toggleFinalTag(tag));
    finalTagOptions.appendChild(button);
  });

  finalTagCount.textContent = `${selectedFinalTags.size} / ${MAX_PROFILE_TAGS} selected`;
}

function toggleFinalTag(tag) {
  clearMessage();

  if (selectedFinalTags.has(tag)) {
    selectedFinalTags.delete(tag);
  } else {
    if (selectedFinalTags.size >= MAX_PROFILE_TAGS) {
      showMessage(`You can choose up to ${MAX_PROFILE_TAGS} tags.`, true);
      return;
    }
    selectedFinalTags.add(tag);
  }

  renderFinalTags();
}

function addCustomProfileTag() {
  clearMessage();
  const value = cleanTag(customProfileTag.value);

  if (!value) {
    showMessage("Enter a tag before adding it.", true);
    return;
  }

  if (containsBlockedTerm(value)) {
    showMessage("Please choose a more appropriate tag.", true);
    return;
  }

  const existing = availableFinalTags.find(tag => normalizeTag(tag) === normalizeTag(value));

  if (selectedFinalTags.size >= MAX_PROFILE_TAGS && !selectedFinalTags.has(existing)) {
    showMessage(`You can choose up to ${MAX_PROFILE_TAGS} tags.`, true);
    return;
  }

  if (existing) {
    selectedFinalTags.add(existing);
  } else {
    availableFinalTags.push(value);
    selectedFinalTags.add(value);
  }

  customProfileTag.value = "";
  customTagCount.textContent = "0/24";
  renderFinalTags();
}

function saveProfileTags() {
  clearMessage();

  if (!selectedFinalTags.size) {
    showMessage("Choose at least one profile tag.", true);
    return;
  }

  const styleKey = getWinningStyle();
  const style = workStyles[styleKey];

  localStorage.setItem("ntdProfileTags", JSON.stringify([...selectedFinalTags]));
  localStorage.setItem("ntdWorkStyle", JSON.stringify({
    key: styleKey,
    name: style.name,
    icon: style.icon,
    description: style.description
  }));
  localStorage.setItem("ntdOttoAnswers", JSON.stringify(answers));

  window.location.href = "profile-review.html";
}

function getRecommendedTags(limit) {
  return Object.entries(tagScores)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([tag]) => tag);
}

function getWinningStyle() {
  return Object.entries(styleScores)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]?.[0] || "problemSolver";
}

function restartQuizFlow() {
  currentQuestionIndex = 0;
  answers = [];
  resetScoring();
  recommendationCount.textContent = "0";
  renderLiveRecommendations();
  showScreen(introScreen);
}

function resetScoring() {
  tagScores = {};
  styleScores = {};
  selectedFinalTags = new Set();
  availableFinalTags = [];
}

function showScreen(screen) {
  [introScreen, questionScreen, resultsScreen].forEach(item => item.classList.remove("active"));
  screen.classList.add("active");
  screen.scrollIntoView({ behavior: "smooth", block: "start" });
}

function showMessage(message, isError = false) {
  quizMessage.textContent = message;
  quizMessage.classList.toggle("error", isError);
  quizMessage.classList.toggle("success", !isError);
}

function clearMessage() {
  quizMessage.textContent = "";
  quizMessage.classList.remove("error", "success");
}

function cleanTag(value) {
  return value.trim().replace(/\s+/g, " ").replace(/^[^a-zA-Z0-9À-ÿ]+|[^a-zA-Z0-9À-ÿ]+$/g, "");
}

function normalizeTag(value) {
  return value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, " ").trim();
}

function containsBlockedTerm(value) {
  const normalized = value.toLowerCase()
    .replace(/[@4]/g, "a").replace(/[3]/g, "e").replace(/[1!|]/g, "i")
    .replace(/[0]/g, "o").replace(/[$5]/g, "s").replace(/[7]/g, "t")
    .replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, "");

  return blockedTerms.some(term => normalized.includes(term.replace(/[^a-z0-9]/g, "")));
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[character]);
}
