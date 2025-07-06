// File: script.js

// Global state
let quotes = [];

// Load quotes from local storage on page load
window.onload = function () {
  loadQuotes();
  showRandomQuote();
  populateCategories();
  restoreLastFilter();
};

function loadQuotes() {
  const storedQuotes = localStorage.getItem("quotes");
  quotes = storedQuotes ? JSON.parse(storedQuotes) : getDefaultQuotes();
  localStorage.setItem("quotes", JSON.stringify(quotes));
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
  const selectedCategory = document.getElementById("categoryFilter")?.value || "all";
  const filtered = selectedCategory === "all"
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  const randomQuote = filtered[Math.floor(Math.random() * filtered.length)];
  document.getElementById("quoteDisplay").textContent = randomQuote?.text || "No quotes available.";
  if (selectedCategory !== "all") {
    localStorage.setItem("lastFilter", selectedCategory);
  }
}

document.getElementById("newQuote").onclick = showRandomQuote;

function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) return alert("Please provide both quote and category.");

  quotes.push({ text, category });
  saveQuotes();
  populateCategories();
  alert("Quote added successfully!");
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
}

function populateCategories() {
  const select = document.getElementById("categoryFilter");
  if (!select) return;

  const uniqueCategories = [...new Set(quotes.map(q => q.category))];
  select.innerHTML = '<option value="all">All Categories</option>' +
    uniqueCategories.map(cat => `<option value="${cat}">${cat}</option>`).join("");
}

function filterQuotes() {
  showRandomQuote();
}

function restoreLastFilter() {
  const last = localStorage.getItem("lastFilter");
  if (last && document.getElementById("categoryFilter")) {
    document.getElementById("categoryFilter").value = last;
    showRandomQuote();
  }
}

function exportToJson() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (event) {
    try {
      const importedQuotes = JSON.parse(event.target.result);
      quotes.push(...importedQuotes);
      saveQuotes();
      populateCategories();
      alert("Quotes imported successfully!");
    } catch (err) {
      alert("Failed to import quotes: Invalid JSON");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// Optional: Simulated sync with mock server
async function syncWithServer() {
  const response = await fetch("https://jsonplaceholder.typicode.com/posts");
  const serverQuotes = await response.json();
  // Simulate by using titles from server
  const serverData = serverQuotes.slice(0, 3).map(post => ({ text: post.title, category: "Server" }));
  const mergedQuotes = [...serverData, ...quotes];
  quotes = mergedQuotes;
  saveQuotes();
  populateCategories();
  alert("Synced with server successfully!");
}
