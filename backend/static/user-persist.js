/* ---------- STATE PERSISTENCE ---------- */
const SAVE_KEY = "daras-v3-state";
let _restoringState = false;

function saveState() {
  if (_restoringState || !S.userId) return;
  try {
    const loanRows = [];
    loanList.querySelectorAll(".loan-row").forEach(row => {
      loanRows.push({
        mode:      row.dataset.rateMode || "known",
        amount:    row.querySelector(".loan-amount").value,
        rate:      row.querySelector(".loan-rate").value,
        tenure:    row.querySelector(".loan-tenure").value,
        totalReturn: row.querySelector(".loan-total-return").value,
        totalTenure: row.querySelector(".loan-total-tenure").value,
        remaining: row.querySelector(".loan-remaining").value,
        purpose:   row.querySelector(".loan-purpose").value,
        source:    row.querySelector(".loan-source").value,
      });
    });
    const exFormVisible = document.getElementById("ex-form").style.display !== "none";
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      userId: S.userId, sessionId: S.sessionId,
      name: S.name, age: S.age, mobile: S.mobile,
      vocation: S.vocation, vocationCustom: S.vocationCustom,
      householdSize: S.householdSize, employmentType: S.employmentType, hasBankAccount: S.hasBankAccount,
      loanType: S.loanType, existing: S.existing, branch: S.branch,
      income: S.income, expenses: S.expenses, tenure: S.tenure,
      lastResult: S.lastResult, paceMonths: S.paceMonths, newLoan: S.newLoan,
      history: S.history,
      loanRows,
      exFormVisible,
      exEmi:     document.getElementById("ex-monthly-emi").value,
      nlRate:    document.getElementById("nl-rate").value,
      nlPurpose: document.getElementById("nl-purpose").value,
      nlSource:  document.getElementById("nl-source").value,
      nsSavings: document.getElementById("ns-savings").value,
      nsRate:    document.getElementById("ns-rate").value,
      nsMonths:  document.getElementById("ns-months").value,
      nsMaxLoan: document.getElementById("nsr-num").textContent,
      nsEmiText: document.getElementById("nsr-emi").textContent,
    }));
  } catch(e) {}
}
window.addEventListener("beforeunload", saveState);

function clearSavedState() {
  localStorage.removeItem(SAVE_KEY);
}

function restoreState() {
  let snap;
  try { snap = JSON.parse(localStorage.getItem(SAVE_KEY) || "null"); } catch(e) { return false; }
  if (!snap || !snap.userId) return false;

  const screen = (snap.history || []).slice(-1)[0] || "s-welcome";
  if (screen === "s-welcome") return false;

  _restoringState = true;
  Object.assign(S, {
    userId: snap.userId, sessionId: snap.sessionId,
    name: snap.name || "", age: snap.age, mobile: snap.mobile || "",
    vocation: snap.vocation || "", vocationCustom: snap.vocationCustom || "",
    householdSize: snap.householdSize, employmentType: snap.employmentType,
    hasBankAccount: snap.hasBankAccount,
    loanType: snap.loanType, existing: snap.existing || S.existing,
    branch: snap.branch, income: snap.income || 0,
    expenses: snap.expenses || {}, tenure: snap.tenure || 12,
    lastResult: snap.lastResult, paceMonths: snap.paceMonths || 24,
    newLoan: snap.newLoan || S.newLoan,
    history: snap.history || ["s-welcome"],
  });

  // Registration fields
  document.getElementById("in-name").value   = S.name;
  document.getElementById("in-age").value    = S.age || "";
  document.getElementById("in-mobile").value = S.mobile;
  document.getElementById("in-vocation-custom").value = S.vocationCustom;
  document.getElementById("vocation-custom-wrap").style.display =
    (S.vocation === "other" || S.vocation === "business") ? "block" : "none";
  populateVocations(); populateHousehold(); populateEmpTypes();

  // Income / expense fields
  document.getElementById("ie-income").value  = S.income || "";
  document.getElementById("ie-tenure").value  = S.tenure || 12;
  const expIds = {rent:"ie-rent", grocery:"ie-grocery", medicine:"ie-medicine",
    education:"ie-education", mobile:"ie-mobile-bill", gaon:"ie-gaon", other:"ie-other"};
  Object.entries(expIds).forEach(([k, id]) => {
    document.getElementById(id).value = (S.expenses[k] || "");
  });

  // New loan fields
  document.getElementById("nl-amount").value  = S.newLoan.amount || "";
  document.getElementById("nl-rate").value    = snap.nlRate || "";
  populateSelects();
  document.getElementById("nl-purpose").value = snap.nlPurpose || "";
  document.getElementById("nl-source").value  = snap.nlSource  || "";

  // Savings calculator fields + result
  document.getElementById("ns-savings").value = snap.nsSavings || "";
  document.getElementById("ns-rate").value    = snap.nsRate    || "14";
  document.getElementById("ns-months").value  = snap.nsMonths  || "24";
  if (snap.nsMaxLoan && snap.nsMaxLoan !== "₹—") document.getElementById("nsr-num").textContent = snap.nsMaxLoan;
  if (snap.nsEmiText) document.getElementById("nsr-emi").textContent = snap.nsEmiText;

  // Always restore loan rows into the DOM so Back from any later screen shows data
  if (snap.loanRows && snap.loanRows.length > 0) {
    loanList.innerHTML = "";
    loanCount = 0;
    snap.loanRows.forEach((lr, i) => {
      addLoanRow(i === 0);
      const row = loanList.querySelectorAll(".loan-row")[i];
      setLoanMode(row, lr.mode || "known");
      row.querySelector(".loan-amount").value    = lr.amount    || "";
      row.querySelector(".loan-rate").value      = lr.rate      || "";
      row.querySelector(".loan-tenure").value    = lr.tenure    || "";
      row.querySelector(".loan-total-return").value = lr.totalReturn || "";
      row.querySelector(".loan-total-tenure").value = lr.totalTenure || "";
      row.querySelector(".loan-remaining").value = lr.remaining || "";
      if (lr.purpose) row.querySelector(".loan-purpose").value = lr.purpose;
      if (lr.source)  row.querySelector(".loan-source").value  = lr.source;
    });
    document.getElementById("ex-monthly-emi").value = snap.exEmi || "";
    updateSummary();
  }

  // Navigate (go() will use S.loanType to decide gate vs form view)
  go(screen, {replace: true});
  S.history = snap.history;
  document.getElementById("back-btn").hidden = S.history.length <= 1 || screen === "s-welcome";

  if (S.lastResult) renderResult(S.lastResult);
  _restoringState = false;
  saveState();
  return true;
}

/* ---------- INIT ---------- */
applyLang();
if (!restoreState()) {
  go("s-welcome", {replace:true});
  S.history = ["s-welcome"];
}
// Count each new browser session as one visitor
if (!sessionStorage.getItem("daras-visited")) {
  sessionStorage.setItem("daras-visited", "1");
  logEvent("visit", {lang: S.lang});
}
