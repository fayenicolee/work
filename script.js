const books = [
  { title: "Katya", pdf: "./books/book-1.pdf" },
  { title: "Esther", pdf: "./books/book-2.pdf" },
  { title: "Lola", pdf: "./books/book-3.pdf" },
  { title: "Sarp", pdf: "./books/book-4.pdf" },
  { title: "Picture Book 5", pdf: "./books/book-5.pdf" },
  { title: "Picture Book 6", pdf: "./books/book-6.pdf" },
  { title: "Picture Book 7", pdf: "./books/book-7.pdf" },
  { title: "Picture Book 8", pdf: "./books/book-8.pdf" },
  { title: "Picture Book 9", pdf: "./books/book-9.pdf" }
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
          <iframe
            class="book-thumb"
            src="${book.pdf}#page=1&zoom=page-fit"
            title="${book.title} preview"
            loading="lazy"
          ></iframe>
          <div class="book-meta">
            <p class="book-title">${book.title}</p>
            <p class="book-sub">Click to open reader</p>
          </div>
        </button>
      `
    )
    .join("");

  bookGrid.innerHTML = cards;
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
