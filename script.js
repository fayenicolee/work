const books = [
  { title: "Katya", pdf: "./books/Book-1.pdf", thumb: "./books/Book-1.png" },
  { title: "Esther", pdf: "./books/Book-2.pdf", thumb: "./books/Book-2.png" },
  { title: "Lola", pdf: "./books/Book-3.pdf", thumb: "./books/Book-3.png" },
  { title: "Sarp", pdf: "./books/Book-4.pdf", thumb: "./books/Book-4.png" },
  { title: "Picture Book 5", pdf: "./books/Book-5.pdf", thumb: "./books/Book-5.png" },
  { title: "Picture Book 6", pdf: "./books/Book-6.pdf", thumb: "./books/Book-6.png" },
  { title: "Picture Book 7", pdf: "./books/Book-7.pdf", thumb: "./books/Book-7.png" },
  { title: "Picture Book 8", pdf: "./books/Book-8.pdf", thumb: "./books/Book-8.png" },
  { title: "Picture Book 9", pdf: "./books/Book-9.pdf", thumb: "./books/Book-9.png" }
];

const bookGrid = document.getElementById("bookGrid");
const modal = document.getElementById("bookModal");
const modalTitle = document.getElementById("modalTitle");
const bookFrame = document.getElementById("bookFrame");
const closeModalBtn = document.getElementById("closeModal");
const prevBookBtn = document.getElementById("prevBook");
const nextBookBtn = document.getElementById("nextBook");

let activeIndex = -1;

function renderBooks() {
  const cards = books
    .map(
      (book, index) => `
        <button class="book-card" type="button" data-index="${index}" aria-label="Open ${book.title}">
          <div class="book-thumb no-image" aria-hidden="true">
            <img class="book-thumb-image" src="${book.thumb}" alt="" loading="lazy" />
          </div>
          <div class="book-meta">
            <p class="book-title">${book.title}</p>
            <p class="book-sub">Click to open reader</p>
          </div>
        </button>
      `
    )
    .join("");

  bookGrid.innerHTML = cards;
  wireThumbnailFallbacks();
}

function wireThumbnailFallbacks() {
  const thumbs = bookGrid.querySelectorAll(".book-thumb-image");
  thumbs.forEach((image) => {
    const parent = image.closest(".book-thumb");

    const applyLoadedState = () => {
      parent.classList.remove("no-image");
      image.hidden = false;
    };

    const applyFallbackState = () => {
      parent.classList.add("no-image");
      image.hidden = true;
    };

    image.addEventListener("load", applyLoadedState);
    image.addEventListener("error", applyFallbackState);

    if (image.complete) {
      if (image.naturalWidth > 0) {
        applyLoadedState();
      } else {
        applyFallbackState();
      }
    }
  });
}

function openBook(index) {
  activeIndex = index;
  const book = books[activeIndex];
  modalTitle.textContent = book.title;
  bookFrame.src = `${book.pdf}#page=1&zoom=page-width`;
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
}

function closeModal() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  bookFrame.src = "";
  activeIndex = -1;
}

function openAdjacent(step) {
  if (activeIndex < 0) return;
  const nextIndex = (activeIndex + step + books.length) % books.length;
  openBook(nextIndex);
}

bookGrid.addEventListener("click", (event) => {
  const card = event.target.closest(".book-card");
  if (!card) return;
  openBook(Number(card.dataset.index));
});

closeModalBtn.addEventListener("click", closeModal);
prevBookBtn.addEventListener("click", () => openAdjacent(-1));
nextBookBtn.addEventListener("click", () => openAdjacent(1));

modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    closeModal();
  }
});

window.addEventListener("keydown", (event) => {
  if (!modal.classList.contains("open")) return;

  if (event.key === "Escape") {
    closeModal();
  } else if (event.key === "ArrowLeft") {
    openAdjacent(-1);
  } else if (event.key === "ArrowRight") {
    openAdjacent(1);
  }
});

renderBooks();
