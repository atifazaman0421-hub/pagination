
const formContainer = document.getElementById("formContainer");
const PlusBtn = document.getElementById("plusBtn");
const addBtn = document.getElementById("addBtn");
const formCloseBtn = document.getElementById("formCloseBtn");
const form = document.getElementById("form");
const titleInput = document.getElementById("title");
const categorySelect = document.getElementById("categorySelect");
const aiText = document.getElementById("aiSuggestionText");
const incomeConBar=document.getElementById("incomeContainer")
const expenseConBar=document.getElementById("expenseContainer")
const ulExpense=document.getElementById("expenseList")
const ulIncome=document.getElementById("incomeList")
const filterType = document.getElementById("filterType");
const leftBtn = document.getElementById("leftBtnIcon");
const rightBtn = document.getElementById("rightBtnIcon");
const incomeContainer = document.querySelector(".incomeDateList");
const expenseContainer = document.querySelector(".expenseDateList");
const searchInput = document.getElementById("searchInput");
let searchQuery = "";
const suggestionsBox = document.getElementById("suggestionsBox");

const incomePrevBtn = document.getElementById("incomePrevBtn");
const incomeNextBtn = document.getElementById("incomeNextBtn");
const incomePageInfo = document.getElementById("incomePageInfo");
 
const expensePrevBtn = document.getElementById("expensePrevBtn");
const expenseNextBtn = document.getElementById("expenseNextBtn");
const expensePageInfo = document.getElementById("expensePageInfo");
 
let incomeCurrentPage = 1;
let expenseCurrentPage = 1;
let incomeTotalPages = 1;
let expenseTotalPages = 1;
 
function getLimit() {
  return Number(document.getElementById("rowPerPage").value) || 5;
}

const categoryIcons = {
  food: "🍔",
  travel: "✈️",
  salary: "💰",
  shopping: "🛒",
  transport: "🚗",
  movies: "🎬",
  medicine: "💊",
  electricity:"💡",
  rent: "🏠",
  fuel: "⛽",
  others: "📦" 
};

let currentFilter = "daily"; 
let currentDate = new Date();

filterType.addEventListener("change", () => {
  const token = localStorage.getItem("token");
  const payload = JSON.parse(atob(token.split(".")[1]));
  const tempPremium = localStorage.getItem("isPremiumTemp");

  const isPremium =
    payload.isPremium === true ||
    payload.isPremium === 1 ||
    tempPremium === "true";

  const selectedFilter = filterType.value;


  if (
    (selectedFilter === "monthly" || selectedFilter === "yearly") &&
    !isPremium
  ) {
    alert("🔒 This feature is only for premium users");

    // revert back
    filterType.value = "daily";
    currentFilter = "daily";
    return;
  }

  currentFilter = selectedFilter;
  currentDate = new Date();
  incomeCurrentPage = 1;
  expenseCurrentPage = 1;
  updateDateUI();
  loadData();
});



const BASE_URL = "http://localhost:3000/expensetracker";
let editId = null;

function createList(data) {
  const li = document.createElement("li");

  if (data.typeSelect === "income")
  li.classList.add("incomeLi");
else
  li.classList.add("expenseLi");

  li.dataset.id = data.id;
  li.dataset.type = data.typeSelect;
  li.dataset.title = data.title;
  li.dataset.amount = data.amount;
  li.dataset.category = data.category;

  const deleteBtn = document.createElement("button");
  deleteBtn.classList.add("deleteBtn");
  deleteBtn.textContent = "Delete";

  const editBtn = document.createElement("button");
  editBtn.classList.add("editBtn");
  editBtn.textContent = "Edit";

  const left = document.createElement("div");
left.classList.add("left");

const category = document.createElement("span");
category.textContent = `${categoryIcons[data.category] || ""} ${data.category}`;

const title = document.createElement("span");
title.textContent = data.title;

left.append(category, title);

const amount = document.createElement("span");
amount.classList.add("amount");

if (data.typeSelect === "income") {
  amount.textContent = `+${data.amount}`;
} else {
  amount.textContent = `-${data.amount}`;
}

li.append(left, amount, editBtn, deleteBtn);

  if (data.typeSelect === "income") {
    ulIncome.appendChild(li);
  } else {
    ulExpense.appendChild(li);
  }
}

async function loadData() {
  try {
    const token = localStorage.getItem("token");
    const limit = getLimit();
    const baseParams = `filter=${currentFilter}&date=${currentDate.getTime()}&search=${searchQuery}`;
 
    
    const incomeRes = await axios.get(
      `${BASE_URL}?${baseParams}&typeSelect=income&page=${incomeCurrentPage}&limit=${limit}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
 
    
    const expenseRes = await axios.get(
      `${BASE_URL}?${baseParams}&typeSelect=expense&page=${expenseCurrentPage}&limit=${limit}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
 
    const totalsRes = await axios.get(
      `${BASE_URL}/totals?${baseParams}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
 
    const incomeData = incomeRes.data || {};
    const expenseData = expenseRes.data || {};
    const totalsData = totalsRes.data || {};
 
  
    incomeTotalPages = incomeData.totalPages || 1;
    expenseTotalPages = expenseData.totalPages || 1;
 

    incomePageInfo.textContent = `Page ${incomeCurrentPage} of ${incomeTotalPages}`;
    incomePrevBtn.disabled = incomeCurrentPage === 1;
    incomeNextBtn.disabled = incomeCurrentPage === incomeTotalPages;
 
    
    expensePageInfo.textContent = `Page ${expenseCurrentPage} of ${expenseTotalPages}`;
    expensePrevBtn.disabled = expenseCurrentPage === 1;
    expenseNextBtn.disabled = expenseCurrentPage === expenseTotalPages;
 
    const allTransactions = [
      ...(incomeData.transactions || []),
      ...(expenseData.transactions || [])
    ];
 
    const query = (searchQuery || "").toLowerCase();
    showSuggestions(allTransactions, query);
 
    // Reset lists
    ulIncome.innerHTML = "";
    ulExpense.innerHTML = "";
 
    if (currentFilter === "daily") {
      incomeConBar.style.display = "block";
      expenseConBar.style.display = "block";
 
      (incomeData.transactions || []).forEach(item => createList(item));
      (expenseData.transactions || []).forEach(item => createList(item));
 
      if (query) {
        if ((incomeData.transactions || []).length === 0)
          ulIncome.innerHTML = "<p>No matching income</p>";
        if ((expenseData.transactions || []).length === 0)
          ulExpense.innerHTML = "<p>No matching expense</p>";
      }
    }
 
    const showDaily = currentFilter === "daily";
    incomeContainer.style.display = showDaily ? "block" : "none";
    expenseContainer.style.display = showDaily ? "block" : "none";
 
   
    document.getElementById("totalIncome").textContent =
      (totalsData.totalIncome || 0).toFixed(2);
    document.getElementById("totalExpense").textContent =
      (totalsData.totalExpense || 0).toFixed(2);
    document.getElementById("balance").textContent =
      ((totalsData.totalIncome || 0) - (totalsData.totalExpense || 0)).toFixed(2);
 
    if (currentFilter === "monthly" || currentFilter === "yearly") {
      incomeConBar.style.display = "none";
      expenseConBar.style.display = "none";
      // For reports, merge all transactions from both calls
      renderReport({ transactions: allTransactions });
    } else {
      document.getElementById("reportContainer").style.display = "none";
    }
 
  } catch (error) {
    console.log(error);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "login.html";
    return;
  }


  const payload = JSON.parse(atob(token.split(".")[1]));
  const tempPremium = localStorage.getItem("isPremiumTemp");

if (
  payload.isPremium === true ||
  payload.isPremium === 1 ||
  tempPremium === "true"
) {
  showPremiumMessage();

  const btn = document.getElementById("buyPremiumBtn");
  if (btn) btn.style.display = "none";
}

  updateDateUI();
  loadData();
});

document.getElementById("rowPerPage").addEventListener("change", () => {
  incomeCurrentPage = 1;
  expenseCurrentPage = 1;
  loadData();
});


async function add(obj) {
  try {
    formContainer.style.display = "none";
   const token = localStorage.getItem("token");

await axios.post(
  `${BASE_URL}/add`,
  obj,
  {
    headers: {
      Authorization: `Bearer ${token}`

    }
  }
);
    await loadData();
  } catch (error) {
    console.log(error);
  }
}
async function update(obj) {
  try {
      const token = localStorage.getItem("token");
    formContainer.style.display = "none";
    await axios.put(`${BASE_URL}/update/${editId}`, obj, {
  headers: {
    Authorization:`Bearer ${token}`

  }
});
    await loadData(); 
    form.expenseIncome.disabled = false;
    editId = null;
  } catch (error) {
    console.log(error);
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const expenseIncomeSelect = e.target.expenseIncome.value;
  const category = e.target.category.value;
  const title = e.target.title.value;
  const amount = Number(e.target.amount.value);

  const obj = {
    typeSelect: expenseIncomeSelect,
    category: category,
    title: title,
    amount: amount,
  };
 
if (editId) {
  await update(obj);
} else {
  await add(obj);
}
form.reset()
});

document.body.addEventListener("click", async (e) => {
  const li = e.target.closest("li");
  if (!li) return;
  const id = li.dataset.id;

    const token = localStorage.getItem("token");

  if (e.target.classList.contains("deleteBtn")) {
  try {
  await axios.delete(`${BASE_URL}/delete/${id}`, {
  headers: {
    Authorization:`Bearer ${token}`

  }
});
  await loadData();
} catch (error) {
  console.log(error);
}
  } else if (e.target.classList.contains("editBtn")) {
    formContainer.style.display = "flex";
    addBtn.textContent = "Update";

    form.expenseIncome.value = li.dataset.type;
    form.expenseIncome.disabled=true
    form.title.value = li.dataset.title;
    form.category.value = li.dataset.category;
    form.amount.value = li.dataset.amount;

    
    editId = id;
  }
});

PlusBtn.addEventListener("click", () => {
  formContainer.style.display = "flex";
   addBtn.textContent = "Add";
  form.expenseIncome.disabled = false;
  editId = null;
});
formCloseBtn.addEventListener("click", () => {
  form.reset()
  formContainer.style.display = "none";
   form.expenseIncome.disabled = false; 
  editId = null; 
});

function updateDateUI() {
  const day = currentDate.getDate();
  const month = currentDate.toLocaleString("default", { month: "long" });
  const year = currentDate.getFullYear();

  const dateNumber = document.getElementById("dateNumber");
  const monthEl = document.querySelector("#monthYear p:nth-child(1)");
  const yearEl = document.querySelector("#monthYear p:nth-child(2)");

 
  monthEl.textContent = month;
  yearEl.textContent = year;

  if (currentFilter === "daily") {
    dateNumber.style.display = "block";
    dateNumber.textContent = day;
  } else if(currentFilter==="monthly") {
    dateNumber.style.display = "none";
    monthEl.style.display = "block";
  } else{
    monthEl.style.display="none"
    dateNumber.style.display = "none";
  }
}
leftBtn.addEventListener("click", () => {
  if (currentFilter === "daily") {
    currentDate.setDate(currentDate.getDate() - 1);
  } else if (currentFilter === "monthly") {
    currentDate.setMonth(currentDate.getMonth() - 1);
  } else {
    currentDate.setFullYear(currentDate.getFullYear() - 1);
  }
  updateDateUI();
 incomeCurrentPage = 1;
  expenseCurrentPage = 1;
  loadData();
});

rightBtn.addEventListener("click", () => {
  if (currentFilter === "daily") {
    currentDate.setDate(currentDate.getDate() + 1);
  } else if (currentFilter === "monthly") {
    currentDate.setMonth(currentDate.getMonth() + 1);
  } else {
    currentDate.setFullYear(currentDate.getFullYear() + 1);
  }
  updateDateUI();
  incomeCurrentPage = 1;
  expenseCurrentPage = 1;
  loadData();
});

 searchInput.addEventListener("input", (e) => {
  searchQuery = e.target.value.toLowerCase();
  incomeCurrentPage = 1;
  expenseCurrentPage = 1;
  loadData();
});

function showSuggestions(data, query) {
   if (!query) return;

  suggestionsBox.innerHTML = "";

  const suggestions = new Set();

  data.forEach(item => {
  if (item.title.toLowerCase().includes(query)) {
    suggestions.add(item.title);
  }
  if (item.category.toLowerCase().includes(query)) {
    suggestions.add(item.category);
  }
});

if (suggestions.size === 0) {
  const div = document.createElement("div");
  div.classList.add("suggestionDiv")
  div.textContent = "No results found";
  div.style.padding = "5px";
  div.style.color = "gray";

  suggestionsBox.appendChild(div);
  return;
}
 
  suggestions.forEach(text => {
    const div = document.createElement("div");
    div.textContent = text;
    div.classList.add("suggestion-item");

    div.addEventListener("click", () => {
      searchInput.value = text;
      searchQuery = text.toLowerCase();
      suggestionsBox.innerHTML = "";
      loadData();
    });

    suggestionsBox.appendChild(div);
  });
}

document.addEventListener("click", (e) => {
  if (!e.target.closest(".searchContainer")) {
    suggestionsBox.innerHTML = "";
  }
});


// cashfree

const buyPremiumBtn = document.getElementById("buyPremiumBtn");

buyPremiumBtn.addEventListener("click", async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await axios.post(
      "http://localhost:3000/payment/create-order",
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const sessionId = res.data.payment_session_id;

    let checkoutOptions = await window.cashfree.checkout({
      paymentSessionId: sessionId,
      redirectTarget: "_modal",
    });

    await cashfree.checkout(checkoutOptions);

  } catch (error) {
    console.log(error);
    alert("Payment failed to start");
  }
});

function showPremiumMessage() {
  const msg = document.getElementById("premiumMessage");
  if (msg) msg.style.display = "block";
}

// category Ai suggestion
let timer;

titleInput.addEventListener("input", () => {
  clearTimeout(timer);

  timer = setTimeout(async () => {
    const title = titleInput.value;
    if (!title) return;

    const res = await axios.get(
      `http://localhost:3000/ai/suggest-category?title=${title}`
    );

    const aiCategory = res.data.category;

    if (aiCategory) {
      categorySelect.value = aiCategory;
      aiText.textContent = "AI suggests: " + aiCategory;
    }
  }, 400);
});

function renderReport(data) {
  const container = document.getElementById("reportContainer");
  container.style.display = "block";
  container.innerHTML = "";

  const transactions = data.transactions || [];

  if (transactions.length === 0) {
    const p = document.createElement("p");
    p.classList.add("report-empty-msg");
    p.textContent = "No transactions found";
    container.appendChild(p);
    return;
  }

  if (currentFilter === "yearly") {
    renderYearlyReport(container, transactions);
  } else {
    renderMonthlyReport(container, transactions);
  }
}


function renderMonthlyReport(container, transactions) {
  const grouped = {};
  transactions.forEach(item => {
    const date = item.createdAt ? item.createdAt.split("T")[0] : "Unknown";
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(item);
  });

  const sortedDates = Object.keys(grouped).sort();
  let grandIncome = 0;
  let grandExpense = 0;

   const heading = document.createElement("h2");
  heading.classList.add("report-heading");
  heading.textContent = "📅 Monthly Report";
  container.appendChild(heading);

  const table = document.createElement("table");
  table.classList.add("report-table");

  // thead
  const thead = document.createElement("thead");
  const theadRow = document.createElement("tr");
  theadRow.classList.add("report-thead-row");

  ["Date", "Description", "Category", "Income", "Expense"].forEach((text, i) => {
    const th = document.createElement("th");
    th.classList.add("report-th");
    th.classList.add(i >= 3 ? "report-th-right" : "report-th-left");
    th.textContent = text;
    theadRow.appendChild(th);
  });

  thead.appendChild(theadRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");

  sortedDates.forEach((date, i) => {
    const items = grouped[date];
    let dateIncome = 0;
    let dateExpense = 0;

    items.forEach(item => {
      const isIncome = item.typeSelect === "income";
      if (isIncome) dateIncome += Number(item.amount);
      else dateExpense += Number(item.amount);

      const tr = document.createElement("tr");
      tr.classList.add(i % 2 === 0 ? "report-row-even" : "report-row-odd");

      const tdDate = document.createElement("td");
      tdDate.classList.add("report-td", "report-date");
      tdDate.textContent = date;

      const tdTitle = document.createElement("td");
      tdTitle.classList.add("report-td");
      tdTitle.textContent = item.title;

      const tdCat = document.createElement("td");
      tdCat.classList.add("report-td");
      tdCat.textContent = `${categoryIcons[item.category] || "📦"} ${item.category}`;

      const tdIncome = document.createElement("td");
      tdIncome.classList.add("report-td", "report-td-right", "report-income");
      tdIncome.textContent = isIncome ? Number(item.amount).toFixed(2) : "";

      const tdExpense = document.createElement("td");
      tdExpense.classList.add("report-td", "report-td-right", "report-expense");
      tdExpense.textContent = !isIncome ? Number(item.amount).toFixed(2) : "";

      tr.append(tdDate, tdTitle, tdCat, tdIncome, tdExpense);
      tbody.appendChild(tr);
    });

    grandIncome += dateIncome;
    grandExpense += dateExpense;

    // subtotal row
    const subtotalTr = document.createElement("tr");
    subtotalTr.classList.add("report-subtotal-row");

    const subtotalEmpty = document.createElement("td");
    subtotalEmpty.classList.add("report-subtotal-td");
    subtotalEmpty.setAttribute("colspan", "3");

    const subtotalIncome = document.createElement("td");
    subtotalIncome.classList.add("report-subtotal-td", "report-td-right", "report-income");
    subtotalIncome.textContent = dateIncome > 0 ? dateIncome.toFixed(2) : "";

    const subtotalExpense = document.createElement("td");
    subtotalExpense.classList.add("report-subtotal-td", "report-td-right", "report-expense");
    subtotalExpense.textContent = dateExpense > 0 ? dateExpense.toFixed(2) : "";

    subtotalTr.append(subtotalEmpty, subtotalIncome, subtotalExpense);
    tbody.appendChild(subtotalTr);
  });

  // grand total
  const totalTr = document.createElement("tr");
  totalTr.classList.add("report-total-row");

  const totalLabel = document.createElement("td");
  totalLabel.classList.add("report-total-td", "report-td-right");
  totalLabel.setAttribute("colspan", "3");
  totalLabel.textContent = "Total";

  const totalIncomeCell = document.createElement("td");
  totalIncomeCell.classList.add("report-total-td", "report-td-right");
  totalIncomeCell.textContent = `₹ ${grandIncome.toFixed(2)}`;

  const totalExpenseCell = document.createElement("td");
  totalExpenseCell.classList.add("report-total-td", "report-td-right");
  totalExpenseCell.textContent = `₹ ${grandExpense.toFixed(2)}`;

  totalTr.append(totalLabel, totalIncomeCell, totalExpenseCell);
  tbody.appendChild(totalTr);

  // savings
  const savings = grandIncome - grandExpense;
  const savingsTr = document.createElement("tr");
  savingsTr.classList.add("report-savings-row");
  savingsTr.classList.add(savings >= 0 ? "positive" : "negative");

  const savingsTd = document.createElement("td");
  savingsTd.classList.add("report-savings-td", "report-td-right");
  savingsTd.setAttribute("colspan", "5");
  savingsTd.textContent = `Savings = ₹ ${savings.toFixed(2)}`;

  savingsTr.appendChild(savingsTd);
  tbody.appendChild(savingsTr);

  table.appendChild(tbody);
  container.appendChild(table);
}


function renderYearlyReport(container, transactions) {
  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  // group by month number
  const grouped = {};
  transactions.forEach(item => {
    const d = new Date(item.createdAt);
    const monthIndex = d.getMonth(); // 0-11
    if (!grouped[monthIndex]) grouped[monthIndex] = [];
    grouped[monthIndex].push(item);
  });

  const sortedMonths = Object.keys(grouped).map(Number).sort((a, b) => a - b);

  let grandIncome = 0;
  let grandExpense = 0;

  const heading = document.createElement("h2");
  heading.classList.add("report-heading");
  heading.textContent = "📊 Yearly Report";
  container.appendChild(heading);

  const table = document.createElement("table");
  table.classList.add("report-table");

  // thead
  const thead = document.createElement("thead");
  const theadRow = document.createElement("tr");
  theadRow.classList.add("report-thead-row");

  ["Month", "Income", "Expenses", "Savings"].forEach((text, i) => {
    const th = document.createElement("th");
    th.classList.add("report-th");
    th.classList.add(i === 0 ? "report-th-left" : "report-th-right");
    th.textContent = text;
    theadRow.appendChild(th);
  });

  thead.appendChild(theadRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");

  sortedMonths.forEach((monthIndex, i) => {
    const items = grouped[monthIndex];
    let monthIncome = 0;
    let monthExpense = 0;

    items.forEach(item => {
      if (item.typeSelect === "income") monthIncome += Number(item.amount);
      else monthExpense += Number(item.amount);
    });

    const monthSavings = monthIncome - monthExpense;
    grandIncome += monthIncome;
    grandExpense += monthExpense;

    const tr = document.createElement("tr");
    tr.classList.add(i % 2 === 0 ? "report-row-even" : "report-row-odd");

    // month name
    const tdMonth = document.createElement("td");
    tdMonth.classList.add("report-td", "report-date");
    tdMonth.textContent = monthNames[monthIndex];

    // income
    const tdIncome = document.createElement("td");
    tdIncome.classList.add("report-td", "report-td-right", "report-income");
    tdIncome.textContent = `₹ ${monthIncome.toFixed(2)}`;

    // expense
    const tdExpense = document.createElement("td");
    tdExpense.classList.add("report-td", "report-td-right", "report-expense");
    tdExpense.textContent = `₹ ${monthExpense.toFixed(2)}`;

    // savings
    const tdSavings = document.createElement("td");
    tdSavings.classList.add("report-td", "report-td-right");
    tdSavings.classList.add(monthSavings >= 0 ? "report-income" : "report-expense");
    tdSavings.textContent = `₹ ${monthSavings.toFixed(2)}`;

    tr.append(tdMonth, tdIncome, tdExpense, tdSavings);
    tbody.appendChild(tr);
  });

  // grand total row
  const grandSavings = grandIncome - grandExpense;

  const totalTr = document.createElement("tr");
  totalTr.classList.add("report-total-row");

  const totalLabel = document.createElement("td");
  totalLabel.classList.add("report-total-td", "report-th-left");
  totalLabel.textContent = "Total";

  const totalIncomeCell = document.createElement("td");
  totalIncomeCell.classList.add("report-total-td", "report-td-right");
  totalIncomeCell.textContent = `₹ ${grandIncome.toFixed(2)}`;

  const totalExpenseCell = document.createElement("td");
  totalExpenseCell.classList.add("report-total-td", "report-td-right");
  totalExpenseCell.textContent = `₹ ${grandExpense.toFixed(2)}`;

  const totalSavingsCell = document.createElement("td");
  totalSavingsCell.classList.add("report-total-td", "report-td-right");
  totalSavingsCell.textContent = `₹ ${grandSavings.toFixed(2)}`;

  totalTr.append(totalLabel, totalIncomeCell, totalExpenseCell, totalSavingsCell);
  tbody.appendChild(totalTr);

  table.appendChild(tbody);
  container.appendChild(table);
}

incomePrevBtn.addEventListener("click", () => {
  if (incomeCurrentPage > 1) {
    incomeCurrentPage--;
    loadData();
  }
});
 
incomeNextBtn.addEventListener("click", () => {
  if (incomeCurrentPage < incomeTotalPages) {
    incomeCurrentPage++;
    loadData();
  }
});

expensePrevBtn.addEventListener("click", () => {
  if (expenseCurrentPage > 1) {
    expenseCurrentPage--;
    loadData();
  }
});
 
expenseNextBtn.addEventListener("click", () => {
  if (expenseCurrentPage < expenseTotalPages) {
    expenseCurrentPage++;
    loadData();
  }
});
