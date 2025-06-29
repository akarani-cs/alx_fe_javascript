// === Initialization ===
const SERVER_URL = "https://example.com/api/quotes"; // Replace with your mock server
let quotes = [];


["fetchQuotesFromServer"]
["addEventListener"]
["Export Quotes"]
"https://jsonplaceholder.typicode.com/posts"

window.onload = function () {
  loadQuotes();
  populateCategories();
  restoreLastViewed();
  setInterval(syncFromServer, 30000);
};

// === Load/Save Quotes from localStorage ===
function loadQuotes() {
  const stored = localStorage.getItem("quotes");
  quotes = stored ? JSON.parse(stored) : [
    { id: Date.now(), text: "Stay hungry, stay foolish.", category: "Motivation", updatedAt: Date.now() }
  ];
}

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// === Display Quote ===
function showRandomQuote() {
  const selected = document.getElementById("categoryFilter").value;
  const pool = selected === "all" ? quotes : quotes.filter(q => q.category === selected);
  const quote = pool[Math.floor(Math.random() * pool.length)];
  const display = document.getElementById("quoteDisplay");

  if (quote) {
    display.textContent = `"${quote.text}" — ${quote.category}`;
    sessionStorage.setItem("lastViewedQuote", JSON.stringify(quote));
  } else {
    display.textContent = "No quotes in this category yet.";
  }
}

function restoreLastViewed() {
  const last = sessionStorage.getItem("lastViewedQuote");
  if (last) {
    const q = JSON.parse(last);
    document.getElementById("quoteDisplay").textContent = `"${q.text}" — ${q.category}`;
  }
}

// === Add Quote ===
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) {
    alert("Please fill in both fields.");
    return;
  }

  const newQuote = {
    id: Date.now(),
    text,
    category,
    updatedAt: Date.now()
  };
  quotes.push(newQuote);
  saveQuotes();
  pushQuoteToServer(newQuote);
  populateCategories();
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
  notify("Quote added!");
}

// === Category Filter ===
function populateCategories() {
  const select = document.getElementById("categoryFilter");
  const current = select.value;
  const categories = [...new Set(quotes.map(q => q.category))];

  select.innerHTML = `<option value="all">All Categories</option>`;
  categories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    select.appendChild(opt);
  });

  if (localStorage.getItem("selectedCategory")) {
    select.value = localStorage.getItem("selectedCategory");
    filterQuotes();
  } else {
    select.value = current;
  }
}

function filterQuotes() {
  const selected = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", selected);
  showRandomQuote();
}

// === Create Add Quote Form Dynamically ===
function createAddQuoteForm() {
  const formContainer = document.createElement("div");

  const quoteInput = document.createElement("input");
  quoteInput.id = "newQuoteText";
  quoteInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.placeholder = "Enter quote category";

  const addBtn = document.createElement("button");
  addBtn.textContent = "Add Quote";
  addBtn.onclick = addQuote;

  formContainer.append(quoteInput, categoryInput, addBtn);
  document.body.appendChild(formContainer);
}
createAddQuoteForm();

// === Export/Import Quotes ===
function exportQuotesToJson() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const data = JSON.parse(e.target.result);
      if (Array.isArray(data)) {
        quotes.push(...data);
        saveQuotes();
        populateCategories();
        notify("Quotes imported successfully!");
      } else {
        alert("Invalid format.");
      }
    } catch {
      alert("Failed to parse JSON.");
    }
  };
  reader.readAsText(event.target.files[0]);
}

// === Server Sync ===
async function syncFromServer() {
  try {
    const res = await fetch(SERVER_URL);
    const serverQuotes = await res.json();
    let updated = false;

    serverQuotes.forEach(sq => {
      const local = quotes.find(lq => lq.id === sq.id);
      if (!local || sq.updatedAt > local.updatedAt) {
        const index = quotes.findIndex(q => q.id === sq.id);
        if (index !== -1) quotes[index] = sq;
        else quotes.push(sq);
        updated = true;
      }
    });

    if (updated) {
      saveQuotes();
      populateCategories();
      notify("Quotes synced from server.");
    }
  } catch (err) {
    console.warn("Sync failed:", err);
  }
}

async function pushQuoteToServer(quote) {
  try {
    await fetch(SERVER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quote)
    });
    notify("Quote pushed to server.");
  } catch {
    notify("Failed to sync to server.");
  }
}

// === Notification UI ===
function notify(message) {
  const banner = document.createElement("div");
  banner.textContent = message;
  banner.style.cssText = "background:#e0f0ff;border-left:5px solid #007bff;margin:10px;padding:8px;";
  document.body.prepend(banner);
  setTimeout(() => banner.remove(), 4000);
}


