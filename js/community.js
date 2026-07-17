
(() => {
  "use strict";

  const STORAGE_KEY = "ntdCommunityPostsV2";
  const SAVED_KEY = "ntdSavedCommunityPosts";
  const VOTES_KEY = "ntdCommunityVotes";

  const starterPosts = [
    {
      id: "post-roofer-orleans",
      title: "Looking for a reliable roofer in Orléans",
      body: "Does anyone know a reliable roofing company or independent roofer available this month? I would prefer someone local with recent references.",
      category: "Help Needed",
      location: "Orléans",
      author: "Jordan M.",
      createdAt: Date.now() - 2 * 60 * 60 * 1000,
      votes: 18,
      solved: false,
      comments: [
        {
          id: "comment-1",
          author: "Taylor R.",
          body: "Try checking the Businesses page and compare recent local reviews before booking."
        }
      ]
    },
    {
      id: "post-bakery-ottawa",
      title: "Best local bakery for a birthday cake?",
      body: "I need a birthday cake next weekend. I am looking for a local bakery that can handle a simple custom design without getting too expensive.",
      category: "Recommendations",
      location: "Ottawa",
      author: "Sam K.",
      createdAt: Date.now() - 7 * 60 * 60 * 1000,
      votes: 12,
      solved: true,
      comments: [
        {
          id: "comment-2",
          author: "Morgan L.",
          body: "A few local shops list custom cakes. Check their lead times before choosing."
        },
        {
          id: "comment-3",
          author: "Sam K.",
          body: "Thanks! I found one and marked this solved."
        }
      ]
    },
    {
      id: "post-computer-rockland",
      title: "Affordable computer repair around Rockland",
      body: "My laptop is running slowly and I want someone to check it before I replace it. Any recommendations nearby?",
      category: "Questions",
      location: "Rockland",
      author: "Chris P.",
      createdAt: Date.now() - 25 * 60 * 60 * 1000,
      votes: 6,
      solved: false,
      comments: []
    }
  ];

  const state = {
    category: "All",
    sort: "newest",
    location: "All",
    search: "",
    activePostId: null
  };

  const elements = {
    feed: document.getElementById("communityFeed"),
    search: document.getElementById("communitySearch"),
    searchButton: document.getElementById("communitySearchButton"),
    location: document.getElementById("locationFilter"),
    openPostModal: document.getElementById("openPostModal"),
    postModal: document.getElementById("postModal"),
    commentsModal: document.getElementById("commentsModal"),
    commentsContent: document.getElementById("commentsContent"),
    createForm: document.getElementById("createPostForm"),
    postCount: document.getElementById("postCount"),
    openCount: document.getElementById("openCount"),
    solvedCount: document.getElementById("solvedCount"),
    helpfulCount: document.getElementById("helpfulCount")
  };

  if (!elements.feed) return;

  let posts = loadJSON(STORAGE_KEY, starterPosts);
  let savedPosts = loadJSON(SAVED_KEY, []);
  let votes = loadJSON(VOTES_KEY, {});

  function loadJSON(key, fallback) {
    try {
      const parsed = JSON.parse(localStorage.getItem(key));
      return parsed ?? structuredCloneSafe(fallback);
    } catch {
      return structuredCloneSafe(fallback);
    }
  }

  function structuredCloneSafe(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    localStorage.setItem(SAVED_KEY, JSON.stringify(savedPosts));
    localStorage.setItem(VOTES_KEY, JSON.stringify(votes));
  }

  function escapeHTML(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function timeAgo(timestamp) {
    const seconds = Math.max(1, Math.floor((Date.now() - timestamp) / 1000));
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  function filteredPosts() {
    const query = state.search.trim().toLowerCase();

    let result = posts.filter(post => {
      const matchesCategory = state.category === "All" || post.category === state.category;
      const matchesLocation = state.location === "All" || post.location === state.location;
      const haystack = `${post.title} ${post.body} ${post.author} ${post.location} ${post.category}`.toLowerCase();
      const matchesSearch = !query || haystack.includes(query);
      return matchesCategory && matchesLocation && matchesSearch;
    });

    if (state.sort === "popular") {
      result.sort((a, b) => b.votes - a.votes);
    } else if (state.sort === "unanswered") {
      result = result.filter(post => post.comments.length === 0 && !post.solved);
      result.sort((a, b) => b.createdAt - a.createdAt);
    } else if (state.sort === "solved") {
      result = result.filter(post => post.solved);
      result.sort((a, b) => b.createdAt - a.createdAt);
    } else {
      result.sort((a, b) => b.createdAt - a.createdAt);
    }

    return result;
  }

  function renderSummary() {
    const voteTotal = posts.reduce((sum, post) => sum + Math.max(0, post.votes), 0);
    elements.postCount.textContent = posts.length;
    elements.openCount.textContent = posts.filter(post => !post.solved).length;
    elements.solvedCount.textContent = posts.filter(post => post.solved).length;
    elements.helpfulCount.textContent = voteTotal;
  }

  function renderPosts() {
    const visiblePosts = filteredPosts();

    if (!visiblePosts.length) {
      elements.feed.innerHTML = `
        <section class="community-empty-state">
          <h3>No discussions found</h3>
          <p>Try changing your search or filters, or start the first discussion in this category.</p>
        </section>
      `;
      renderSummary();
      return;
    }

    elements.feed.innerHTML = visiblePosts.map(post => {
      const saved = savedPosts.includes(post.id);
      const selectedVote = votes[post.id] || 0;

      return `
        <article class="community-post" data-post-id="${escapeHTML(post.id)}">
          <div class="community-vote-column">
            <button class="community-vote-button ${selectedVote === 1 ? "selected" : ""}"
              type="button" data-action="upvote" aria-label="Upvote">▲</button>
            <span class="community-vote-count">${post.votes}</span>
            <button class="community-vote-button ${selectedVote === -1 ? "selected" : ""}"
              type="button" data-action="downvote" aria-label="Downvote">▼</button>
          </div>

          <div class="community-post-content">
            <div class="community-post-header">
              <span class="community-category">${escapeHTML(post.category)}</span>
              <span class="community-status ${post.solved ? "solved" : "open"}">
                ${post.solved ? "✓ Solved" : "Open"}
              </span>
              <span class="community-post-time">${escapeHTML(post.location)} · ${timeAgo(post.createdAt)}</span>
            </div>

            <h2>${escapeHTML(post.title)}</h2>
            <p class="community-post-description">${escapeHTML(post.body)}</p>

            <div class="community-post-footer">
              <span class="community-author">Posted by ${escapeHTML(post.author)}</span>

              <div class="community-post-actions">
                <button class="community-post-action" type="button" data-action="comments">
                  💬 ${post.comments.length} ${post.comments.length === 1 ? "reply" : "replies"}
                </button>

                <button class="community-post-action ${saved ? "saved" : ""}" type="button" data-action="save">
                  ${saved ? "🔖 Saved" : "🔖 Save"}
                </button>

                <button class="community-post-action" type="button" data-action="toggle-solved">
                  ${post.solved ? "Reopen" : "Mark solved"}
                </button>

                <button class="community-post-action" type="button" data-action="report">🚩 Report</button>
              </div>
            </div>
          </div>
        </article>
      `;
    }).join("");

    renderSummary();
  }

  function voteOnPost(postId, direction) {
    const post = posts.find(item => item.id === postId);
    if (!post) return;

    const previous = votes[postId] || 0;
    let next = direction;

    if (previous === direction) next = 0;

    post.votes += next - previous;

    if (next === 0) delete votes[postId];
    else votes[postId] = next;

    persist();
    renderPosts();
  }

  function toggleSaved(postId) {
    if (savedPosts.includes(postId)) {
      savedPosts = savedPosts.filter(id => id !== postId);
    } else {
      savedPosts.push(postId);
    }

    persist();
    renderPosts();
  }

  function toggleSolved(postId) {
    const post = posts.find(item => item.id === postId);
    if (!post) return;
    post.solved = !post.solved;
    persist();
    renderPosts();
  }

  function openModal(modal) {
    modal.hidden = false;
    document.body.classList.add("community-modal-open");
  }

  function closeModal(modal) {
    modal.hidden = true;

    if (elements.postModal.hidden && elements.commentsModal.hidden) {
      document.body.classList.remove("community-modal-open");
    }
  }

  function openComments(postId) {
    const post = posts.find(item => item.id === postId);
    if (!post) return;

    state.activePostId = postId;

    const commentHTML = post.comments.length
      ? post.comments.map(comment => `
          <article class="community-comment">
            <strong>${escapeHTML(comment.author)}</strong>
            <p>${escapeHTML(comment.body)}</p>
          </article>
        `).join("")
      : `<div class="community-empty-state"><h3>No replies yet</h3><p>Be the first person to help.</p></div>`;

    elements.commentsContent.innerHTML = `
      <h2 id="commentsTitle">${escapeHTML(post.title)}</h2>
      <p>${escapeHTML(post.body)}</p>

      <div>${commentHTML}</div>

      <form id="commentForm" class="community-comment-form">
        <input id="commentInput" maxlength="500" required placeholder="Write a helpful reply...">
        <button class="community-primary-button" type="submit">Reply</button>
      </form>
    `;

    const commentForm = document.getElementById("commentForm");
    commentForm.addEventListener("submit", event => {
      event.preventDefault();
      const input = document.getElementById("commentInput");
      const value = input.value.trim();
      if (!value) return;

      post.comments.push({
        id: `comment-${Date.now()}`,
        author: "You",
        body: value
      });

      persist();
      renderPosts();
      openComments(postId);
    });

    openModal(elements.commentsModal);
  }

  document.querySelectorAll(".forum-topic").forEach(button => {
    button.addEventListener("click", () => {
      state.category = button.dataset.category;

      document.querySelectorAll(".forum-topic").forEach(item => {
        item.classList.toggle("active-topic", item === button);
      });

      renderPosts();
    });
  });

  document.querySelectorAll(".forum-sort button").forEach(button => {
    button.addEventListener("click", () => {
      state.sort = button.dataset.sort;

      document.querySelectorAll(".forum-sort button").forEach(item => {
        item.classList.toggle("active-sort", item === button);
      });

      renderPosts();
    });
  });

  elements.search.addEventListener("input", () => {
    state.search = elements.search.value;
    renderPosts();
  });

  elements.searchButton.addEventListener("click", () => {
    state.search = elements.search.value;
    renderPosts();
  });

  elements.location.addEventListener("change", () => {
    state.location = elements.location.value;
    renderPosts();
  });

  elements.openPostModal.addEventListener("click", () => openModal(elements.postModal));

  document.querySelectorAll("[data-close-modal]").forEach(item => {
    item.addEventListener("click", () => closeModal(elements.postModal));
  });

  document.querySelectorAll("[data-close-comments]").forEach(item => {
    item.addEventListener("click", () => closeModal(elements.commentsModal));
  });

  elements.createForm.addEventListener("submit", event => {
    event.preventDefault();

    const title = document.getElementById("postTitle").value.trim();
    const body = document.getElementById("postBody").value.trim();
    const category = document.getElementById("postCategory").value;
    const location = document.getElementById("postLocation").value;

    if (!title || !body) return;

    posts.unshift({
      id: `post-${Date.now()}`,
      title,
      body,
      category,
      location,
      author: "You",
      createdAt: Date.now(),
      votes: 0,
      solved: false,
      comments: []
    });

    persist();
    elements.createForm.reset();
    closeModal(elements.postModal);
    renderPosts();
  });

  elements.feed.addEventListener("click", event => {
    const button = event.target.closest("[data-action]");
    if (!button) return;

    const postElement = button.closest("[data-post-id]");
    if (!postElement) return;

    const postId = postElement.dataset.postId;
    const action = button.dataset.action;

    if (action === "upvote") voteOnPost(postId, 1);
    if (action === "downvote") voteOnPost(postId, -1);
    if (action === "save") toggleSaved(postId);
    if (action === "comments") openComments(postId);
    if (action === "toggle-solved") toggleSolved(postId);

    if (action === "report") {
      const reason = window.prompt("Why are you reporting this discussion?");
      if (reason && reason.trim()) {
        window.alert("Report saved for admin review. This is currently a frontend demo.");
      }
    }
  });

  document.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;
    if (!elements.postModal.hidden) closeModal(elements.postModal);
    if (!elements.commentsModal.hidden) closeModal(elements.commentsModal);
  });

  renderPosts();
})();
