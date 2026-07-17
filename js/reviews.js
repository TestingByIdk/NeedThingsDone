const reviews = [
  {
    id: 1,
    rating: 5,
    title: "Quick and friendly computer repair",
    body: "My computer was running extremely slowly and Alex explained the problem clearly. The repair was finished the same day and the price matched what we discussed.",
    reviewer: "Jordan M.",
    trusted: true,
    service: "Computer Repair",
    recommend: "Yes",
    hireAgain: "Yes",
    helpful: 18,
    date: "July 15, 2026",
    tags: ["Friendly", "Reliable", "Great Communication"],
    status: "replied",
    reply: "Thank you! I’m glad the computer is running properly again.",
    timeline: ["Review posted", "Profile owner replied"]
  },
  {
    id: 2,
    rating: 4,
    title: "Good work, replies were a little slow",
    body: "The work itself was solid and everything was explained well. It took a while to hear back at first, but once we connected the service was professional.",
    reviewer: "Mia R.",
    trusted: true,
    service: "Tech Support",
    recommend: "Yes",
    hireAgain: "Yes",
    helpful: 11,
    date: "July 11, 2026",
    tags: ["Professional", "Slow Replies"],
    status: "resolved",
    reply: "Thanks for the honest feedback. I’ve changed my notification settings so I can respond sooner.",
    timeline: ["Review posted", "Profile owner replied", "Reviewer marked issue resolved"]
  },
  {
    id: 3,
    rating: 5,
    title: "Very patient and helpful",
    body: "I asked a lot of questions and never felt rushed. Everything was explained in plain language and I understood what I was paying for.",
    reviewer: "Emma W.",
    trusted: false,
    service: "Tech Support",
    recommend: "Yes",
    hireAgain: "Yes",
    helpful: 9,
    date: "July 7, 2026",
    tags: ["Helpful", "Friendly", "Fair Pricing"],
    status: "none",
    reply: "",
    timeline: ["Review posted"]
  },
  {
    id: 4,
    rating: 3,
    title: "The result was good, but it took longer than expected",
    body: "The final result worked well, but the timing changed twice. I would have appreciated earlier updates about the delay.",
    reviewer: "Noah B.",
    trusted: false,
    service: "Website Help",
    recommend: "Not sure",
    hireAgain: "Not sure",
    helpful: 7,
    date: "June 29, 2026",
    tags: ["Unexpected Delay", "Great Communication"],
    status: "reported",
    reply: "I understand the concern and I’m sorry the updated timing was not communicated earlier.",
    timeline: ["Review posted", "Profile owner replied", "Review reported for admin review"]
  }
];

const $ = id => document.getElementById(id);
const el = {
  openModal: $("openReviewModal"),
  modal: $("reviewModal"),
  form: $("reviewForm"),
  search: $("reviewSearchInput"),
  rating: $("ratingFilter"),
  status: $("statusFilter"),
  sort: $("reviewSort"),
  list: $("reviewsList"),
  count: $("visibleReviewCount"),
  empty: $("reviewsEmptyState"),
  reset: $("resetReviewFilters"),
  stars: $("starPicker"),
  title: $("reviewTitle"),
  body: $("reviewBody"),
  service: $("reviewService"),
  recommend: $("recommendChoice"),
  hireAgain: $("hireAgainChoice"),
  tags: $("reviewTagPicker"),
  charCount: $("reviewCharacterCount"),
  message: $("reviewFormMessage")
};

let selectedRating = 0;
let selectedTags = new Set();

bindEvents();
renderReviews();

function bindEvents() {
  el.openModal.addEventListener("click", openModal);

  document.querySelectorAll("[data-close-modal]").forEach(button => {
    button.addEventListener("click", closeModal);
  });

  [el.search, el.rating, el.status, el.sort].forEach(control => {
    control.addEventListener(control === el.search ? "input" : "change", renderReviews);
  });

  el.reset.addEventListener("click", resetFilters);

  el.stars.querySelectorAll("button").forEach(button => {
    button.addEventListener("click", () => {
      selectedRating = Number(button.dataset.rating);
      updateStars();
    });
  });

  el.tags.querySelectorAll("button").forEach(button => {
    button.addEventListener("click", () => toggleTag(button));
  });

  el.body.addEventListener("input", () => {
    el.charCount.textContent = `${el.body.value.length}/1200`;
  });

  el.form.addEventListener("submit", submitReview);
}

function renderReviews() {
  let filtered = reviews.filter(review => {
    const query = el.search.value.trim().toLowerCase();
    const text = [review.title, review.body, review.reviewer, review.service, ...review.tags]
      .join(" ")
      .toLowerCase();

    const searchMatch = !query || text.includes(query);
    const ratingMatch = el.rating.value === "all" || review.rating === Number(el.rating.value);
    const statusMatch = el.status.value === "all" || review.status === el.status.value;

    return searchMatch && ratingMatch && statusMatch;
  });

  if (el.sort.value === "helpful") filtered.sort((a, b) => b.helpful - a.helpful);
  if (el.sort.value === "highest") filtered.sort((a, b) => b.rating - a.rating);
  if (el.sort.value === "lowest") filtered.sort((a, b) => a.rating - b.rating);

  el.list.innerHTML = "";
  filtered.forEach(review => el.list.appendChild(createCard(review)));

  el.count.textContent = `${filtered.length} review${filtered.length === 1 ? "" : "s"} shown`;
  el.empty.hidden = filtered.length > 0;
  el.list.hidden = filtered.length === 0;
}

function createCard(review) {
  const article = document.createElement("article");
  article.className = "review-card";

  article.innerHTML = `
    <header class="review-card-header">
      <div class="reviewer-avatar">${escapeHTML(review.reviewer.charAt(0))}</div>
      <div class="reviewer-identity">
        <div>
          <strong>${escapeHTML(review.reviewer)}</strong>
          ${review.trusted ? '<span class="trusted-reviewer-badge">🏅 Trusted Reviewer</span>' : ""}
        </div>
        <p>${escapeHTML(review.date)}</p>
      </div>
      <div class="review-card-rating">
        <div>${renderStars(review.rating)}</div>
        <strong>${review.rating}.0</strong>
      </div>
    </header>

    <div class="review-card-body">
      <p class="review-service-used">Used service: <strong>${escapeHTML(review.service)}</strong></p>
      <h3>${escapeHTML(review.title)}</h3>
      <p>${escapeHTML(review.body)}</p>

      <div class="review-decision-grid">
        <span>Recommend: <strong>${escapeHTML(review.recommend)}</strong></span>
        <span>Hire again: <strong>${escapeHTML(review.hireAgain)}</strong></span>
      </div>

      <div class="review-card-tags">
        ${review.tags.map(tag => {
          const negative = isNegative(tag);
          return `<span class="${negative ? "negative" : "positive"}">${negative ? "⚠" : "✓"} ${escapeHTML(tag)}</span>`;
        }).join("")}
      </div>
    </div>

    ${review.reply ? `
      <section class="owner-reply">
        <strong>Profile owner reply</strong>
        <p>${escapeHTML(review.reply)}</p>
      </section>
    ` : ""}

    <section class="review-timeline">
      ${review.timeline.map((item, index) => `
        <div class="${index === review.timeline.length - 1 ? "current" : ""}">
          <span></span><p>${escapeHTML(item)}</p>
        </div>
      `).join("")}
    </section>

    <footer class="review-card-footer">
      <div>
        <button type="button" class="helpful-button">👍 Helpful <span>${review.helpful}</span></button>
        <button type="button" class="review-text-button">Report</button>
      </div>
      ${statusBadge(review.status)}
    </footer>
  `;

  const helpful = article.querySelector(".helpful-button");
  helpful.addEventListener("click", () => {
    if (helpful.classList.contains("selected")) return;
    helpful.classList.add("selected");
    helpful.querySelector("span").textContent = String(review.helpful + 1);
  });

  return article;
}

function renderStars(rating) {
  return Array.from({ length: 5 }, (_, i) =>
    `<span class="${i < rating ? "filled" : ""}">★</span>`
  ).join("");
}

function statusBadge(status) {
  if (status === "resolved") return '<span class="review-status resolved">🛠 Issue Resolved</span>';
  if (status === "reported") return '<span class="review-status reported">🟡 Under Review</span>';
  if (status === "replied") return '<span class="review-status replied">💬 Owner Replied</span>';
  return '<span class="review-status posted">✓ Posted</span>';
}

function isNegative(tag) {
  return ["Slow Replies", "Late Arrival", "Unexpected Delay", "Unexpected Fees", "Hard to Reach"].includes(tag);
}

function openModal() {
  el.modal.hidden = false;
  document.body.classList.add("review-modal-open");
  el.title.focus();
}

function closeModal() {
  el.modal.hidden = true;
  document.body.classList.remove("review-modal-open");
  resetForm();
}

function updateStars() {
  el.stars.querySelectorAll("button").forEach(button => {
    button.classList.toggle("selected", Number(button.dataset.rating) <= selectedRating);
  });
}

function toggleTag(button) {
  const tag = button.dataset.tag;

  if (selectedTags.has(tag)) {
    selectedTags.delete(tag);
    button.classList.remove("selected");
    return;
  }

  if (selectedTags.size >= 3) {
    showMessage("Choose up to 3 tags.", true);
    return;
  }

  selectedTags.add(tag);
  button.classList.add("selected");
  showMessage("");
}

function submitReview(event) {
  event.preventDefault();

  if (!selectedRating) return showMessage("Choose a star rating.", true);
  if (!el.title.value.trim()) return showMessage("Add a review title.", true);
  if (el.body.value.trim().length < 20) return showMessage("Write at least 20 characters.", true);

  reviews.unshift({
    id: Date.now(),
    rating: selectedRating,
    title: el.title.value.trim(),
    body: el.body.value.trim(),
    reviewer: "You",
    trusted: false,
    service: el.service.value.trim() || "Service not specified",
    recommend: formatChoice(el.recommend.value),
    hireAgain: formatChoice(el.hireAgain.value),
    helpful: 0,
    date: "Just now",
    tags: [...selectedTags],
    status: "none",
    reply: "",
    timeline: ["Review posted"]
  });

  closeModal();
  renderReviews();
}

function resetForm() {
  selectedRating = 0;
  selectedTags = new Set();
  el.form.reset();
  el.charCount.textContent = "0/1200";
  updateStars();
  el.tags.querySelectorAll("button").forEach(button => button.classList.remove("selected"));
  showMessage("");
}

function resetFilters() {
  el.search.value = "";
  el.rating.value = "all";
  el.status.value = "all";
  el.sort.value = "newest";
  renderReviews();
}

function formatChoice(value) {
  if (value === "yes") return "Yes";
  if (value === "no") return "No";
  return "Not sure";
}

function showMessage(message, isError = false) {
  el.message.textContent = message;
  el.message.classList.toggle("error", isError);
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[char]);
}
