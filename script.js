// Shared interactions for Brilliant's Music Universe.

const playlistDetails = {
  "late-night-coding": {
    title: "Late Night Coding",
    mood: "Focus mood",
    coverClass: "cover-code",
    description: "A focused mix for studying, debugging, and building projects after dark.",
    spotifySearchUrl: "https://open.spotify.com/search/Late%20Night%20Coding%20playlist",
    songs: ["The Adults Are Talking", "Here With Me", "About You", "No Surprises", "Anything You Want"]
  },
  "reality-club-vibes": {
    title: "Reality Club Vibes",
    mood: "Indonesian indie",
    coverClass: "cover-reality",
    description: "Warm guitar-pop and smooth Indonesian indie energy for everyday confidence.",
    spotifySearchUrl: "https://open.spotify.com/search/Reality%20Club%20playlist",
    songs: ["Anything You Want", "Alexandra", "Is It The Answer?", "Telenovia", "SSR"]
  },
  "conan-gray-era": {
    title: "Conan Gray Era",
    mood: "Bedroom-pop nostalgia",
    coverClass: "cover-conan",
    description: "A dramatic, nostalgic playlist for reflective days and emotional choruses.",
    spotifySearchUrl: "https://open.spotify.com/search/Conan%20Gray%20playlist",
    songs: ["Heather", "Maniac", "Astronomy", "People Watching", "Wish You Were Sober"]
  },
  "sunset-drive": {
    title: "Sunset Drive",
    mood: "Golden hour",
    coverClass: "cover-sunset",
    description: "Driving songs with warm colors, clean guitars, and cinematic movement.",
    spotifySearchUrl: "https://open.spotify.com/search/Sunset%20Drive%20playlist",
    songs: ["Sweet Disposition", "Every Summertime", "About You", "The Adults Are Talking", "I Wanna Be Yours"]
  },
  "rainy-jakarta": {
    title: "Rainy Jakarta",
    mood: "Rainy reflection",
    coverClass: "cover-rain",
    description: "Soft songs for cloudy windows, slow traffic, and calm Jakarta evenings.",
    spotifySearchUrl: "https://open.spotify.com/search/Rainy%20Jakarta%20playlist",
    songs: ["Apocalypse", "La La Lost You", "No Surprises", "Here With Me", "Astronomy"]
  }
};

document.addEventListener("DOMContentLoaded", () => {
  setActiveNavigation();
  setupMobileNavigation();
  setupRevealAnimation();
  setupCounters();
  setupPlaylistModal();
  setupLibraryTools();
  setupPlaylistRequestForm();
});

function setActiveNavigation() {
  const page = document.body.dataset.page;
  document.querySelectorAll("[data-nav]").forEach((link) => {
    const isActive = link.dataset.nav === page;
    link.classList.toggle("is-active", isActive);
    if (isActive) {
      link.setAttribute("aria-current", "page");
    }
  });
}

function setupMobileNavigation() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector("#site-nav");
  if (!toggle || !nav) return;

  const closeNavigation = () => {
    document.body.classList.remove("nav-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open navigation menu");
  };

  toggle.addEventListener("click", () => {
    const isOpen = document.body.classList.toggle("nav-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
  });

  nav.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      closeNavigation();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && document.body.classList.contains("nav-open")) {
      closeNavigation();
      toggle.focus();
    }
  });
}

function setupRevealAnimation() {
  const revealItems = document.querySelectorAll(".reveal");
  if (!revealItems.length) return;

  if (!("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });

  revealItems.forEach((item) => observer.observe(item));
}

function setupCounters() {
  const counters = document.querySelectorAll("[data-count]");
  if (!counters.length) return;

  const animateCounter = (counter) => {
    const target = Number(counter.dataset.count || 0);
    const duration = 900;
    const start = performance.now();

    const tick = (time) => {
      const progress = Math.min((time - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      counter.textContent = String(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  if (!("IntersectionObserver" in window)) {
    counters.forEach(animateCounter);
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  counters.forEach((counter) => observer.observe(counter));
}

function setupPlaylistModal() {
  const modal = document.querySelector("#playlist-modal");
  const modalTitle = document.querySelector("#modal-title");
  const modalMood = document.querySelector("#modal-mood");
  const modalDescription = document.querySelector("#modal-description");
  const modalSongs = document.querySelector("#modal-songs");
  const modalCover = document.querySelector("#modal-cover");
  const modalCoverTitle = document.querySelector("#modal-cover-title");
  const closeButton = document.querySelector("[data-close-modal]");
  const detailButtons = document.querySelectorAll("[data-playlist]");
  const prevButton = document.querySelector("#modal-prev");
  const nextButton = document.querySelector("#modal-next");
  const modalSpotify = document.querySelector("#modal-spotify");

  if (!modal || !modalTitle || !modalMood || !modalDescription || !modalSongs || !modalCover || !modalCoverTitle) return;

  const coverClasses = ["cover-code", "cover-reality", "cover-conan", "cover-sunset", "cover-rain"];
  const keys = Object.keys(playlistDetails);
  const focusableSelectors = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])"
  ].join(", ");
  let currentKey = "";
  let lastActiveElement = null;

  const updateModalContent = (key) => {
    const playlist = playlistDetails[key];
    if (!playlist) return;

    currentKey = key;

    modalTitle.textContent = playlist.title;
    modalMood.textContent = playlist.mood;
    modalDescription.textContent = playlist.description;
    modalCoverTitle.textContent = playlist.title;
    
    modalCover.classList.remove(...coverClasses);
    modalCover.classList.add(playlist.coverClass);
    
    modalSongs.replaceChildren(...playlist.songs.map((song) => {
      const item = document.createElement("li");
      item.textContent = song;
      return item;
    }));

    if (modalSpotify && playlist.spotifySearchUrl) {
      modalSpotify.setAttribute("href", playlist.spotifySearchUrl);
    }
  };

  const getFocusableElements = () => Array.from(modal.querySelectorAll(focusableSelectors))
    .filter((element) => element instanceof HTMLElement && element.offsetParent !== null);

  const keepFocusInsideModal = (event) => {
    if (event.key !== "Tab" || modal.hidden) return;

    const focusableElements = getFocusableElements();
    if (!focusableElements.length) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  };

  const openModal = (key) => {
    lastActiveElement = document.activeElement;
    updateModalContent(key);
    modal.hidden = false;
    document.body.classList.add("modal-open");
    closeButton?.focus();
  };

  const closeModal = () => {
    modal.hidden = true;
    document.body.classList.remove("modal-open");
    if (lastActiveElement instanceof HTMLElement) {
      lastActiveElement.focus();
    }
  };

  detailButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const key = button.dataset.playlist;
      if (key) openModal(key);
    });
  });

  prevButton?.addEventListener("click", () => {
    const currentIndex = keys.indexOf(currentKey);
    const prevIndex = (currentIndex - 1 + keys.length) % keys.length;
    updateModalContent(keys[prevIndex]);
  });

  nextButton?.addEventListener("click", () => {
    const currentIndex = keys.indexOf(currentKey);
    const nextIndex = (currentIndex + 1) % keys.length;
    updateModalContent(keys[nextIndex]);
  });

  closeButton?.addEventListener("click", closeModal);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });
  document.addEventListener("keydown", (event) => {
    if (modal.hidden) return;
    if (event.key === "Escape") {
      closeModal();
      return;
    }
    keepFocusInsideModal(event);
  });
}

function setupLibraryTools() {
  const searchInput = document.querySelector("#library-search");
  const genreFilter = document.querySelector("#genre-filter");
  const tableBody = document.querySelector("#library-body");
  const visibleCount = document.querySelector("#visible-song-count");
  const sortButtons = document.querySelectorAll("[data-sort]");
  const emptyState = document.querySelector("#library-empty");

  if (!tableBody) return;

  const rows = Array.from(tableBody.querySelectorAll("[data-library-row]"));
  const state = { sortKey: "", direction: "asc" };

  const updateSortControls = () => {
    sortButtons.forEach((button) => {
      const isActive = button.dataset.sort === state.sortKey;
      const header = button.closest("th");

      button.classList.toggle("is-active", isActive);
      button.classList.toggle("is-desc", isActive && state.direction === "desc");
      button.setAttribute("aria-pressed", String(isActive));

      if (header) {
        header.setAttribute("aria-sort", isActive ? (state.direction === "asc" ? "ascending" : "descending") : "none");
      }
    });
  };

  const applyFilters = () => {
    const query = (searchInput?.value || "").trim().toLowerCase();
    const genre = genreFilter?.value || "all";
    let shown = 0;

    rows.forEach((row) => {
      const text = `${row.dataset.title} ${row.dataset.artist}`.toLowerCase();
      const matchesSearch = !query || text.includes(query);
      const matchesGenre = genre === "all" || row.dataset.genre === genre;
      const isVisible = matchesSearch && matchesGenre;
      row.hidden = !isVisible;
      if (isVisible) shown += 1;
    });

    if (visibleCount) visibleCount.textContent = String(shown);
    if (emptyState) {
      emptyState.hidden = shown > 0;
    }
  };

  searchInput?.addEventListener("input", applyFilters);
  genreFilter?.addEventListener("change", applyFilters);

  sortButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const key = button.dataset.sort;
      if (!key) return;

      state.direction = state.sortKey === key && state.direction === "asc" ? "desc" : "asc";
      state.sortKey = key;

      updateSortControls();

      const sortedRows = [...rows].sort((a, b) => {
        const valueA = key === "duration" ? Number(a.dataset.duration) : String(a.dataset[key] || "").toLowerCase();
        const valueB = key === "duration" ? Number(b.dataset.duration) : String(b.dataset[key] || "").toLowerCase();
        if (valueA < valueB) return state.direction === "asc" ? -1 : 1;
        if (valueA > valueB) return state.direction === "asc" ? 1 : -1;
        return 0;
      });

      sortedRows.forEach((row) => tableBody.appendChild(row));
      applyFilters();
    });
  });

  updateSortControls();
  applyFilters();
}

function setupPlaylistRequestForm() {
  const form = document.querySelector("#playlist-request-form");
  if (!form) return;

  const storageKey = "brilliantPlaylistRequest";
  const clearButton = document.querySelector("#clear-request");
  const status = document.querySelector("#request-status");
  const savedTitle = document.querySelector("#saved-request-title");
  const summaryItems = document.querySelectorAll("[data-summary]");
  const fields = ["name", "email", "mood", "song", "duration", "notes"];

  const setStatus = (message, type = "") => {
    if (!status) return;
    status.textContent = message;
    status.dataset.type = type;
  };

  const getSavedRequest = () => {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || "null");
    } catch (error) {
      return null;
    }
  };

  const saveRequest = (request) => {
    localStorage.setItem(storageKey, JSON.stringify(request));
  };

  const updateSummary = (request) => {
    summaryItems.forEach((item) => {
      const key = item.dataset.summary;
      const value = request?.[key];
      item.textContent = value ? (key === "duration" ? `${value} minutes` : value) : "-";
    });

    if (savedTitle) {
      savedTitle.textContent = request ? `${request.mood} for ${request.name}` : "No custom request yet.";
    }
  };

  const fillForm = (request) => {
    if (!request) return;
    fields.forEach((field) => {
      const input = form.elements[field];
      if (input) input.value = request[field] || "";
    });
  };

  const savedRequest = getSavedRequest();
  fillForm(savedRequest);
  updateSummary(savedRequest);

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      setStatus("Please complete the required fields with valid data before saving.", "error");
      form.reportValidity();
      return;
    }

    const request = fields.reduce((data, field) => {
      data[field] = String(form.elements[field]?.value || "").trim();
      return data;
    }, {});

    request.savedAt = new Date().toISOString();
    saveRequest(request);
    updateSummary(request);
    setStatus("Playlist request saved. Refresh the page and the data will stay here.", "success");
  });

  clearButton?.addEventListener("click", () => {
    localStorage.removeItem(storageKey);
    form.reset();
    updateSummary(null);
    setStatus("Saved playlist request cleared.");
  });
}
