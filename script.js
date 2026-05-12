let budget = Number(localStorage.getItem("budget")) || 0;
let expenses = 0;
let income = Number(localStorage.getItem("income")) || 0;
let editTarget = null;

let expenseArray = JSON.parse(localStorage.getItem("expenses")) || [];

// Inputs
const budgetInput = document.getElementById("budget-input");
const budgetBtn = document.getElementById("budget-btn");

const incomeInput = document.getElementById("income-input");
const incomeBtn = document.getElementById("income-btn");

const titleInput = document.getElementById("title-input");
const amountInput = document.getElementById("amount-input");
const categoryInput = document.getElementById("category-input");
const expenseBtn = document.getElementById("expense-btn");

// Display
const totalBudget = document.getElementById("total-budget");
const totalExpense = document.getElementById("total-expense");
const balance = document.getElementById("balance");
const totalIncome = document.getElementById("total-income");

const expenseList = document.getElementById("expense-list");
const alertBox = document.getElementById("alert-box");
const progressBar = document.getElementById("progress-bar");

// Search + Filter
const searchInput = document.getElementById("search-input");
const filterInput = document.getElementById("filter-input");

// Buttons
const resetBtn = document.getElementById("reset-btn");
const exportBtn = document.getElementById("export-btn");
const darkModeBtn = document.getElementById("dark-mode-btn");

initializeApp();

budgetBtn.addEventListener("click", () => {
  budget = Number(budgetInput.value);
  if (!budget) return;

  localStorage.setItem("budget", budget);
  totalBudget.textContent = budget;
  budgetInput.value = "";

  updateUI();
});

incomeBtn.addEventListener("click", () => {
  income = Number(incomeInput.value);
  if (!income) return;

  localStorage.setItem("income", income);
  totalIncome.textContent = income;
  incomeInput.value = "";

  updateUI();
});

expenseBtn.addEventListener("click", () => {
  const title = titleInput.value.trim();
  const amount = Number(amountInput.value);
  const category = categoryInput.value;

  if (!title || !amount) return;

  const expenseData = {
    id: Date.now(),
    title,
    amount,
    category,
    date: new Date().toLocaleDateString(),
  };

  if (editTarget) {
    expenseArray = expenseArray.map((exp) =>
      exp.id === editTarget ? { ...expenseData, id: editTarget } : exp,
    );
    editTarget = null;
  } else {
    expenseArray.push(expenseData);
  }

  saveExpenses();
  clearInputs();
  renderExpenses();
  updateUI();
});

searchInput?.addEventListener("input", renderExpenses);
filterInput?.addEventListener("change", renderExpenses);

resetBtn?.addEventListener("click", () => {
  localStorage.clear();
  location.reload();
});

darkModeBtn?.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  localStorage.setItem(
    "darkMode",
    document.body.classList.contains("dark-mode"),
  );
});

exportBtn?.addEventListener("click", exportCSV);

function initializeApp() {
  totalBudget.textContent = budget;
  totalIncome.textContent = income;

  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark-mode");
  }

  renderExpenses();
  updateUI();
}

function renderExpenses() {
  expenseList.innerHTML = "";

  const searchTerm = searchInput?.value.toLowerCase() || "";
  const filterCategory = filterInput?.value || "All";

  const filteredExpenses = expenseArray.filter((exp) => {
    const matchesSearch = exp.title.toLowerCase().includes(searchTerm);
    const matchesCategory =
      filterCategory === "All" || exp.category === filterCategory;

    return matchesSearch && matchesCategory;
  });

  filteredExpenses.forEach((exp) => createExpenseElement(exp));
}

function createExpenseElement(expense) {
  const div = document.createElement("div");
  div.classList.add("expense-item");

  div.innerHTML = `
    <span class="title">${expense.title}</span>
    <span class="amount">${expense.amount}</span>
    <span>${expense.category}</span>
    <span>${expense.date}</span>
    <i class="fa-solid fa-pen-to-square edit"></i>
    <i class="fa-solid fa-trash delete"></i>
  `;

  expenseList.appendChild(div);

  div.querySelector(".delete").addEventListener("click", () => {
    expenseArray = expenseArray.filter((exp) => exp.id !== expense.id);
    saveExpenses();
    renderExpenses();
    updateUI();
  });

  div.querySelector(".edit").addEventListener("click", () => {
    titleInput.value = expense.title;
    amountInput.value = expense.amount;
    categoryInput.value = expense.category;

    editTarget = expense.id;

    expenseArray = expenseArray.filter((exp) => exp.id !== expense.id);
    saveExpenses();
    renderExpenses();
    updateUI();
  });
}

function updateUI() {
  expenses = expenseArray.reduce((sum, exp) => sum + exp.amount, 0);

  totalExpense.textContent = expenses;

  const currentBalance = budget + income - expenses;
  balance.textContent = currentBalance;

  updateAlert();
  updateProgressBar();
}

function updateAlert() {
  if (!alertBox) return;

  const percentage = (expenses / budget) * 100;

  if (percentage >= 100) {
    alertBox.textContent = "🚨 Over Budget!";
  } else if (percentage >= 90) {
    alertBox.textContent = "⚠️ 90% Budget Used";
  } else if (percentage >= 70) {
    alertBox.textContent = "⚠️ 70% Budget Used";
  } else {
    alertBox.textContent = "";
  }
}

function updateProgressBar() {
  if (!progressBar) return;

  const percent = budget ? (expenses / budget) * 100 : 0;
  progressBar.style.width = `${Math.min(percent, 100)}%`;
}

function saveExpenses() {
  localStorage.setItem("expenses", JSON.stringify(expenseArray));
}

function clearInputs() {
  titleInput.value = "";
  amountInput.value = "";
}

function exportCSV() {
  let csv = "Title,Amount,Category,Date\n";

  expenseArray.forEach((exp) => {
    csv += `${exp.title},${exp.amount},${exp.category},${exp.date}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");

  link.href = URL.createObjectURL(blob);
  link.download = "lowbal-expenses.csv";
  link.click();
}
