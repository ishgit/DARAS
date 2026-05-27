/* ============================================================
   DARAS — UI Builders
   DOM population · loan form builder · result rendering
   ============================================================ */

/* ---------- POPULATE VOCATIONS ---------- */
function populateVocations(){
  const grid = document.getElementById("vocation-grid");
  if (!grid) return;
  grid.innerHTML = "";
  VOCATIONS.forEach(v => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "opt-card" + (S.vocation === v.k ? " selected" : "");
    b.setAttribute("data-testid", "vocation-" + v.k);
    b.innerHTML = `<span class="ic">${v.ic}</span><span>${t(v.l)}</span>`;
    b.addEventListener("click", () => {
      if (S.vocation === v.k) {
        S.vocation = null;
        document.getElementById("vocation-custom-wrap").style.display = "none";
      } else {
        S.vocation = v.k; clearErr("err-voc");
        document.getElementById("vocation-custom-wrap").style.display = (v.k === "other" || v.k === "business") ? "block" : "none";
      }
      populateVocations();
    });
    grid.appendChild(b);
  });
}

/* ---------- POPULATE HOUSEHOLD ---------- */
function populateHousehold(){
  const grid = document.getElementById("household-grid");
  if (!grid) return;
  grid.innerHTML = "";
  HOUSEHOLD_SIZES.forEach(v => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "opt-card" + (S.householdSize === v.k ? " selected" : "");
    b.innerHTML = `<span class="ic">${v.ic}</span><span>${t(v.l)}</span>`;
    b.addEventListener("click", () => { S.householdSize = S.householdSize === v.k ? null : v.k; populateHousehold(); });
    grid.appendChild(b);
  });
}

/* ---------- POPULATE EMPLOYMENT TYPES ---------- */
function populateEmpTypes(){
  const grid = document.getElementById("emptype-grid");
  if (!grid) return;
  grid.innerHTML = "";
  EMP_TYPES.forEach(v => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "opt-card" + (S.employmentType === v.k ? " selected" : "");
    b.innerHTML = `<span class="ic">${v.ic}</span><span>${t(v.l)}</span>`;
    b.addEventListener("click", () => {
      S.employmentType = S.employmentType === v.k ? null : v.k;
      const wrap = document.getElementById("emptype-custom-wrap");
      if (wrap) wrap.style.display = S.employmentType === "other" ? "block" : "none";
      populateEmpTypes();
    });
    grid.appendChild(b);
  });
}

/* ---------- POPULATE SELECT DROPDOWNS ---------- */
function populateSelects(){
  fillSel("nl-purpose", PURPOSES.map(p => ({v:p, l:"purp_"+p})));
  fillSel("nl-source",  SOURCES.map(p => ({v:p, l:"src_"+p})));
  loanList.querySelectorAll(".loan-row").forEach(row => {
    fillSelEl(row.querySelector(".loan-purpose"), PURPOSES.map(p => ({v:p, l:"purp_"+p})));
    fillSelEl(row.querySelector(".loan-source"),  SOURCES.map(p => ({v:p, l:"src_"+p})));
  });
}
function fillSelEl(el, opts){
  if (!el) return;
  const prev = el.value;
  el.innerHTML = "";
  opts.forEach(o => {
    const op = document.createElement("option");
    op.value = o.v; op.textContent = t(o.l);
    el.appendChild(op);
  });
  if (prev) el.value = prev;
}
function fillSel(id, opts){
  fillSelEl(document.getElementById(id), opts);
}

/* ---------- LOAN FORM BUILDER ---------- */
const loanList = document.getElementById("loan-list");
let loanCount = 0;

function updateSummary() {
  const rows = loanList.querySelectorAll(".loan-row");
  if (rows.length < 2) { document.getElementById("loan-summary").style.display = "none"; return; }
  let total = 0, maxRate = 0, totalInterest = 0, weightedTenureNumerator = 0;
  rows.forEach(row => {
    const d = readLoanRow(row);
    if (!d.amount) return;
    total += d.amount;
    maxRate = Math.max(maxRate, d.interest_rate || 0);
    totalInterest += d.interest_amount || 0;
    weightedTenureNumerator += d.amount * (d.tenure_months || 0);
  });
  const weightedTenure = total ? weightedTenureNumerator / total : 0;
  const weightedRate = total && weightedTenure ? (totalInterest / weightedTenure / total) * 12 * 100 : 0;
  document.getElementById("sum-total").textContent = inrShort(total);
  document.getElementById("sum-rate").textContent  = Math.round((weightedRate || maxRate) * 100) / 100;
  document.getElementById("loan-summary").style.display = "";
}

function inferFlatAnnualRate(amount, totalReturn, months) {
  if (!amount || !months) return 0;
  return Math.max(0, ((totalReturn - amount) / months / amount) * 12 * 100);
}

function readLoanRow(row) {
  const mode = row.dataset.rateMode || "known";
  const amount = parseFloat(row.querySelector(".loan-amount").value || 0);
  const remaining = parseFloat(row.querySelector(".loan-remaining").value || 0);
  const purpose = row.querySelector(".loan-purpose").value;
  const source = row.querySelector(".loan-source").value;
  let interest_rate = 0, tenure_months = 0, total_return = 0, interest_amount = 0, monthly_payment = 0;

  if (mode === "unknown") {
    total_return = parseFloat(row.querySelector(".loan-total-return").value || 0);
    tenure_months = parseInt(row.querySelector(".loan-total-tenure").value || 0);
    interest_rate = inferFlatAnnualRate(amount, total_return, tenure_months);
    interest_amount = Math.max(0, total_return - amount);
    monthly_payment = tenure_months ? total_return / tenure_months : 0;
  } else {
    interest_rate = parseFloat(row.querySelector(".loan-rate").value || 0);
    tenure_months = parseInt(row.querySelector(".loan-tenure").value || 0);
    interest_amount = amount * (interest_rate / 100) * (tenure_months / 12);
    total_return = amount + interest_amount;
    monthly_payment = tenure_months ? total_return / tenure_months : 0;
  }

  return {
    mode, amount, remaining, interest_rate, tenure_months, total_return,
    interest_amount, monthly_payment, purpose, source,
  };
}

function setLoanMode(row, mode) {
  row.dataset.rateMode = mode;
  row.querySelector(".loan-mode-known").classList.toggle("selected", mode === "known");
  row.querySelector(".loan-mode-unknown").classList.toggle("selected", mode === "unknown");
  row.querySelector(".loan-known-fields").style.display = mode === "known" ? "" : "none";
  row.querySelector(".loan-unknown-fields").style.display = mode === "unknown" ? "" : "none";
  updateSummary();
}

function addLoanRow(isFirst) {
  loanCount++;
  const n   = loanCount;
  const div = document.createElement("div");
  div.className = "loan-row";
  const removeBtn = isFirst ? "" :
    `<button class="btn-remove-loan" type="button" title="${t("ex_loan_remove")}">×</button>`;
  div.innerHTML = `
    <div class="loan-row-header">
      <span class="loan-row-label" data-i18n="ex_loan_label" data-i18n-vars='{"n":${n}}'>${t("ex_loan_label",{n})}</span>
      ${removeBtn}
    </div>
    <div class="field-grid">
      <div class="field rupee">
        <label data-i18n="ex_loan_amt">${t("ex_loan_amt")}</label>
        <input type="number" class="loan-amount" min="0" placeholder="50000"/>
      </div>
    </div>
    <div class="field">
      <label data-i18n="ex_rate_known_q">${t("ex_rate_known_q")}</label>
      <div class="yn-row loan-mode-row" style="margin-top:8px">
        <button class="yn-btn loan-mode-known selected" type="button" data-testid="loan-mode-known">${t("ex_rate_known_yes")}</button>
        <button class="yn-btn loan-mode-unknown" type="button" data-testid="loan-mode-unknown">${t("ex_rate_known_no")}</button>
      </div>
    </div>
    <div class="loan-known-fields">
      <div class="field-grid">
        <div class="field">
          <label><span data-i18n="ex_loan_rate">${t("ex_loan_rate")}</span><span class="req">*</span></label>
          <input type="number" class="loan-rate" min="0" step="0.5" placeholder="18" required/>
          <div class="field-err loan-err-rate"></div>
        </div>
        <div class="field">
          <label><span data-i18n="ex_loan_tenure">${t("ex_loan_tenure")}</span><span class="req">*</span></label>
          <input type="number" class="loan-tenure" min="1" max="360" placeholder="24"/>
          <div class="field-err loan-err-tenure"></div>
        </div>
      </div>
    </div>
    <div class="loan-unknown-fields" style="display:none">
      <div class="field-grid">
        <div class="field rupee">
          <label><span data-i18n="ex_total_return">${t("ex_total_return")}</span><span class="req">*</span></label>
          <input type="number" class="loan-total-return" min="0" placeholder="70000"/>
          <div class="field-err loan-err-total-return"></div>
        </div>
        <div class="field">
          <label><span data-i18n="ex_total_tenure">${t("ex_total_tenure")}</span><span class="req">*</span></label>
          <input type="number" class="loan-total-tenure" min="1" max="360" placeholder="24"/>
          <div class="field-err loan-err-total-tenure"></div>
        </div>
      </div>
      <div class="help loan-inferred-rate">${t("ex_inferred_rate")} 0%</div>
    </div>
    <div class="field rupee">
      <label><span data-i18n="ex_loan_remain">${t("ex_loan_remain")}</span><span class="req">*</span></label>
      <input type="number" class="loan-remaining" min="0" placeholder="..."/>
      <div class="field-err loan-err-remaining"></div>
    </div>
    <div class="field">
      <label data-i18n="ex_purpose">${t("ex_purpose")}</label>
      <select class="loan-purpose"></select>
    </div>
    <div class="field">
      <label data-i18n="ex_source">${t("ex_source")}</label>
      <select class="loan-source"></select>
    </div>`;
  if (!isFirst) {
    div.querySelector(".btn-remove-loan").addEventListener("click", () => { div.remove(); updateSummary(); });
  }
  div.querySelector(".loan-mode-known").addEventListener("click", () => setLoanMode(div, "known"));
  div.querySelector(".loan-mode-unknown").addEventListener("click", () => setLoanMode(div, "unknown"));
  div.querySelectorAll("input").forEach(inp => inp.addEventListener("input", () => {
    const d = readLoanRow(div);
    const inferred = div.querySelector(".loan-inferred-rate");
    if (inferred) inferred.textContent = `${t("ex_inferred_rate")} ${Math.round((d.interest_rate || 0) * 100) / 100}%`;
    updateSummary();
  }));
  div.querySelector(".loan-rate").addEventListener("input", () => clearErrEl(div.querySelector(".loan-err-rate")));
  div.querySelector(".loan-tenure").addEventListener("input", () => clearErrEl(div.querySelector(".loan-err-tenure")));
  div.querySelector(".loan-total-return").addEventListener("input", () => clearErrEl(div.querySelector(".loan-err-total-return")));
  div.querySelector(".loan-total-tenure").addEventListener("input", () => clearErrEl(div.querySelector(".loan-err-total-tenure")));
  div.querySelector(".loan-remaining").addEventListener("input", () => clearErrEl(div.querySelector(".loan-err-remaining")));
  div.querySelectorAll(".loan-amount,.loan-remaining").forEach(inp => inp.addEventListener("input", () => clearErr("err-remaining-exceeds")));
  loanList.appendChild(div);
  setLoanMode(div, "known");
  fillSelEl(div.querySelector(".loan-purpose"), PURPOSES.map(p => ({v:p, l:"purp_"+p})));
  fillSelEl(div.querySelector(".loan-source"),  SOURCES.map(p => ({v:p, l:"src_"+p})));
}

/* ---------- RESULT RENDERING ---------- */
function renderResultAndShow(d){
  renderResult(d);
  go("s-result");
  if (navigator.vibrate) {
    if      (d.status === "green")  navigator.vibrate(120);
    else if (d.status === "orange") navigator.vibrate([80, 60, 80]);
    else if (d.status === "red")    navigator.vibrate([100, 80, 100, 80, 200]);
  }
}
function renderResult(d){
  const bubble = document.getElementById("result-bubble");
  bubble.classList.remove("danger","good","warm");
  if (d.status === "green") bubble.classList.add("good");
  else if (d.status === "red") bubble.classList.add("danger");
  else bubble.classList.add("warm");

  const badge = document.getElementById("result-badge");
  badge.className = "status-badge " + d.status;
  badge.textContent = t("status_" + d.status);

  document.getElementById("result-title").textContent = t("step_result");
  const msg = S.lang === "hi" ? d.message_hi : S.lang === "bn" ? d.message_bn : d.message_en;
  document.getElementById("result-message").textContent = msg;

  document.getElementById("r-income").textContent   = inr(d.income);
  document.getElementById("r-expense").textContent  = inr(d.expenses_total);
  const sv = document.getElementById("r-savings");
  sv.textContent = inr(d.monthly_savings);
  sv.className = "v " + (d.monthly_savings > 0 ? "green" : "red");
  document.getElementById("r-emi").textContent      = inr(d.emi);
  const ae = document.getElementById("r-after-emi");
  ae.textContent = inr(d.after_emi_savings);
  ae.className = "v " + (d.after_emi_savings > 0 ? "green" : "red");
  document.getElementById("r-interest").textContent = inr(d.total_interest);
  document.getElementById("r-payable").textContent  = inr(d.total_payable);
  document.getElementById("r-safe").textContent     = inr(d.max_safe_loan);

  // New-loan eligibility panel — only for existing-loan assessments
  const newLoanPanel = document.getElementById("r-new-loan-panel");
  if (d.new_loan_eligibility) {
    const savingsAfterEmis = (d.affordability_gates || {}).savings_after_all_payments ?? d.monthly_savings;
    document.getElementById("r-savings-after-emis").textContent = inr(savingsAfterEmis);
    const newLoanCap = d.new_loan_eligibility.simple_interest_eligible || 0;
    const capEl = document.getElementById("r-new-loan-cap");
    capEl.textContent = inr(newLoanCap);
    capEl.className = "v " + (newLoanCap > 0 ? "green" : "red");
    document.getElementById("r-kul-jama").textContent = inr(d.kul_jama || 0);
    newLoanPanel.style.display = "";
  } else {
    newLoanPanel.style.display = "none";
  }

  // Actions depend on branch + status
  const acts = document.getElementById("result-actions");
  acts.innerHTML = "";
  if (S.branch === "high_interest" || S.branch === "cant_pay_emi") {
    if (d.status === "green") {
      acts.appendChild(mkBtn("ag_yes-go", t("ag_title"), "primary", () => go("s-after-green")));
    } else {
      acts.appendChild(mkBtn("redo-loop", t("ni_title").slice(0,40)+"…", "primary", () => go("s-newincome")));
    }
  } else {
    if (d.conclusion === "interest_only") {
      acts.appendChild(mkBtn("newincome-q", t("r_follow_up_btn"), "primary", () => go("s-newincome")));
    }
    if (d.status === "red" || d.status === "orange") {
      acts.appendChild(mkBtn("ngo-go", t("warn_ngo"), "teal", () => go("s-ngo")));
    }
    acts.appendChild(mkBtn("again", t("act_again"), "ghost", () => go("s-incexp")));
    acts.appendChild(mkBtn("end", t("end_restart_grace"), "primary", () => go("s-endgrace")));
  }
}
function mkBtn(testid, label, kind, fn){
  const b = document.createElement("button");
  b.className = "btn " + (kind === "primary" ? "btn-primary" : kind === "teal" ? "btn-teal" : "btn-ghost");
  b.setAttribute("data-testid", "result-action-" + testid);
  b.textContent = label;
  b.addEventListener("click", fn);
  return b;
}

/* ---------- PAYOFF RENDERING (principal issue) ---------- */
function renderPayoff(d){
  const months = d.payoff_months_at_surplus;
  const badge = document.getElementById("payoff-badge");
  const num   = document.getElementById("payoff-num");
  const msg   = document.getElementById("payoff-msg");
  if (months < 0) {
    badge.className = "status-badge red";
    badge.textContent = t("status_red");
    num.textContent = "—";
    msg.textContent = t("po_cant");
  } else if (months === 0) {
    badge.className = "status-badge green";
    badge.textContent = t("status_green");
    num.textContent = "0";
    msg.textContent = t("po_safe");
  } else {
    const yrs = (months/12).toFixed(1);
    badge.className = "status-badge " + (months > S.tenure * 2 ? "orange" : "green");
    badge.textContent = t(months > S.tenure * 2 ? "status_orange" : "status_green");
    num.textContent = t("po_months", {n: months, y: yrs});
    msg.textContent = months > S.tenure * 2 ? t("ni_title") : t("po_safe");
  }
  go("s-payoff");
}
