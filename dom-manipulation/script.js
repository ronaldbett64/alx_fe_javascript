// File: script.js

// Global state
let quotes = [];

const SERVER_API_URL = "https://jsonplaceholder.typicode.com/posts"; // mock server

function loadQuotes() {
  const storedQuotes = localStorage.getItem("quotes");
  quotes = storedQuotes ? JSON.parse(storedQuotes) : getDefaultQuotes();
  saveQuotes();
}

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function getDefaultQuotes() {
  return [
    { text: "The journey of a thousand miles begins with one step.", category: "Inspiration" },
    { text: "Life is what happens when you're busy making other plans.", category: "Life" },
    { text: "To be or not to be, that is the question.", category: "Philosophy" },
  ];
}

function showRandomQuote() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  const filtered = selectedCategory === "all"
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  if (filtered.length === 0) {
    document.getElementById("quoteDisplay").textContent = "No quotes available.";
    return;
  }

  const randomQuote = filtered[Math.floor(Math.random() * filtered.length)];
  document.getElementById("quoteDisplay").textContent = randomQuote.text;

  sessionStorage.setItem("lastViewedQuote", randomQuote.text);
  localStorage.setItem("lastFilter", selectedCategory);
}

function filterQuote() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  localStorage.setItem("lastFilter", selectedCategory);

  const filteredQuotes = selectedCategory === "all"
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  const display = document.getElementById("quoteDisplay");
  if (filteredQuotes.length === 0) {
    display.textContent = "No quotes available in this category.";
    return;
  }

  display.textContent = filteredQuotes[0].text;
}

function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) {
    alert("Please enter both a quote and a category.");
    return;
  }

  const newQuote = { text, category };
  quotes.push(newQuote);
  saveQuotes();
  populateCategories();
  filterQuote();

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
  alert("Quote added successfully!");

  postQuoteToServer(newQuote); // Now async/await
}

function populateCategories() {
  const select = document.getElementById("categoryFilter");
  const categories = [...new Set(quotes.map(q => q.category))];

  select.innerHTML = '<option value="all">All Categories</option>';
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    select.appendChild(option);
  });

  const lastFilter = localStorage.getItem("lastFilter");
  if (lastFilter) {
    select.value = lastFilter;
  }
}

function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      quotes.push(...importedQuotes);
      saveQuotes();
      populateCategories();
      filterQuote();
      alert("Quotes imported successfully!");
    } catch (err) {
      alert("Invalid JSON file.");
    }
  };
  reader.readAsText(file);
}

// ✅ Now async/await version
async function fetchQuotesFromServer() {
  try {
    const response = await fetch(SERVER_API_URL);
    const data = await response.json();

    return data.map(item => ({
      text: item.title || "Server quote",
      category: "Server"
    }));
  } catch (error) {
    console.error("Failed to fetch from server:", error);
    return [];
  }
}

// ✅ Now async/await version
async function postQuoteToServer(quote) {
  try {
    const response = await fetch(SERVER_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quote)
    });
    const result = await response.json();
    console.log("Quote posted:", result);
  } catch (error) {
    console.error("Failed to post quote:", error);
  }
}

// ✅ Full sync with conflict resolution
async function syncQuotes() {
  const serverQuotes = await fetchQuotesFromServer();
  let newQuotesCount = 0;

  serverQuotes.forEach(serverQuote => {
    const exists = quotes.some(q => q.text === serverQuote.text);
    if (!exists) {
      quotes.push(serverQuote);
      newQuotesCount++;
    }
  });

  if (newQuotesCount > 0) {
    saveQuotes();
    populateCategories();
    filterQuote();
    notifyUser(`${newQuotesCount} new quotes synced from server`);
  }
}

// ✅ Visual notification
function notifyUser(message) {
  const note = document.createElement("div");
  note.textContent = message;
  note.style.backgroundColor = "#ddffdd";
  note.style.border = "1px solid #00aa00";
  note.style.padding = "10px";
  note.style.margin = "10px 0";
  document.body.prepend(note);
  setTimeout(() => note.remove(), 4000);
}

document.addEventListener("DOMContentLoaded", () => {
  loadQuotes();
  populateCategories();
  filterQuote();

  document.getElementById("newQuote").addEventListener("click", showRandomQuote);
  document.getElementById("addQuoteBtn").addEventListener("click", addQuote);
  document.getElementById("categoryFilter").addEventListener("change", filterQuote);
  document.getElementById("exportBtn").addEventListener("click", exportToJsonFile);
  document.getElementById("importFile").addEventListener("change", importFromJsonFile);

  // ✅ Start periodic sync every 20s
  setInterval(syncQuotes, 20000);
});



