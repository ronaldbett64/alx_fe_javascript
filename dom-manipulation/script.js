// File: script.js

// Global state
let quotes = [];

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
  const category = document.getElementById("categoryFilter").value;
  const filtered = category === "all"
    ? quotes
    : quotes.filter(q => q.category === category);

  if (filtered.length === 0) {
    document.getElementById("quoteDisplay").textContent = "No quotes available.";
    return;
  }

  const randomQuote = filtered[Math.floor(Math.random() * filtered.length)];
  document.getElementById("quoteDisplay").textContent = randomQuote.text;

  sessionStorage.setItem("lastViewedQuote", randomQuote.text);
  localStorage.setItem("lastFilter", category);
}

function filterQuote() {
  const selectedCategory = document.getElementById("categoryFilter").value;

  // Save selected category to localStorage
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

  quotes.push({ text, category });
  saveQuotes();
  populateCategories();
  filterQuote();

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
  alert("Quote added successfully!");
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

  // Restore last selected category if available
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

document.addEventListener("DOMContentLoaded", () => {
  loadQuotes();
  populateCategories();
  filterQuote(); // Show filtered or all quotes on load

  document.getElementById("newQuote").addEventListener("click", showRandomQuote);
  document.getElementById("addQuoteBtn").addEventListener("click", addQuote);
  document.getElementById("categoryFilter").addEventListener("change", filterQuote);
  document.getElementById("exportBtn").addEventListener("click", exportToJsonFile);
  document.getElementById("importFile").addEventListener("change", importFromJsonFile);
});

