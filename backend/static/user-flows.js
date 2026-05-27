/* ============================================================
   DARAS — Flows & Event Wiring
   Registration · calculation · branch routing · new-loan · savings calc
   ============================================================ */

/* ---------- GLOBAL EVENT WIRING ---------- */
document.querySelectorAll(".lang-btn").forEach(b => b.addEventListener("click", () => {
  S.lang = b.dataset.lang; localStorage.setItem("daras-lang", S.lang); applyLang();
  logEvent("lang_change", {lang:S.lang});
}));
document.querySelectorAll("[data-go]").forEach(el => el.addEventListener("click", e => {
  go(el.getAttribute("data-go"));
}));
document.getElementById("back-btn").addEventListener("click", goBack);

document.querySelectorAll(".yn-row").forEach(row => {
  row.addEventListener("click", e => {
    const btn = e.target.closest(".yn-btn");
    if (!btn) return;
    const wasSelected = btn.classList.contains("selected");
    row.querySelectorAll(".yn-btn").forEach(b => b.classList.remove("selected"));
    if (!wasSelected) btn.classList.add("selected");
  });
});

/* Clear inline errors when user starts correcting */
document.getElementById("in-name").addEventListener("input",        () => clearErr("err-name"));
document.getElementById("in-age").addEventListener("input",         () => clearErr("err-age"));
document.getElementById("in-mobile").addEventListener("input",      () => clearErr("err-mobile"));
document.getElementById("ex-monthly-emi").addEventListener("input", () => clearErr("err-emi"));
document.getElementById("btn-bank-yes").addEventListener("click", () => {
  S.hasBankAccount = S.hasBankAccount === true ? null : true;
});
document.getElementById("btn-bank-no").addEventListener("click", () => {
  S.hasBankAccount = S.hasBankAccount === false ? null : false;
});
document.getElementById("nl-amount").addEventListener("input",      () => clearErr("err-nl-amount"));
document.getElementById("nl-rate").addEventListener("input",        () => clearErr("err-nl-rate"));
document.getElementById("ns-rate").addEventListener("input",        () => clearErr("err-ns-rate"));

/* ---------- 1. WELCOME → REGISTER ---------- */
/* Clear all form fields + state when "Let's Begin" is clicked from welcome */
document.querySelector('[data-testid="welcome-begin-btn"]').addEventListener("click", () => {
  clearSavedState();
  S.userId = null; S.sessionId = null; S._existingId = null;
  S.name = ""; S.age = null; S.mobile = ""; S.vocation = ""; S.vocationCustom = "";
  S.householdSize = null; S.employmentType = null; S.hasBankAccount = null;
  document.getElementById("in-name").value = "";
  document.getElementById("in-age").value = "";
  document.getElementById("in-mobile").value = "";
  document.getElementById("in-vocation-custom").value = "";
  document.getElementById("vocation-custom-wrap").style.display = "none";
  document.getElementById("in-emptype-custom").value = "";
  document.getElementById("emptype-custom-wrap").style.display = "none";
  document.getElementById("profile-selection").style.display = "none";
  document.getElementById("btn-bank-yes").classList.remove("selected");
  document.getElementById("btn-bank-no").classList.remove("selected");
  populateVocations(); populateHousehold(); populateEmpTypes();
});

/* ---------- 2. REGISTRATION ---------- */
document.getElementById("btn-register").addEventListener("click", async () => {
  const name = document.getElementById("in-name").value.trim();
  ["err-name","err-age","err-mobile","err-voc"].forEach(clearErr);
  if (!name)       { showErr("err-name", "err_name"); return; }
  const age = parseInt(document.getElementById("in-age").value || 0);
  if (!age || age < 14 || age > 99) { showErr("err-age", "err_age"); return; }
  const mobile = document.getElementById("in-mobile").value.trim();
  if (!/^\d{10}$/.test(mobile)) { showErr("err-mobile", "err_mobile"); return; }
  if (!S.vocation) { showErr("err-voc", "err_voc"); return; }
  S.name = name;
  S.age = age;
  S.mobile = mobile;
  S.vocationCustom = document.getElementById("in-vocation-custom").value.trim();
  const empCustomEl = document.getElementById("in-emptype-custom");
  const empTypeCustom = (S.employmentType === "other" && empCustomEl) ? empCustomEl.value.trim() : "";

  const payload = {
    name: S.name, age: S.age, mobile: S.mobile,
    vocation: S.vocation, vocation_custom: S.vocationCustom,
    language: S.lang,
    household_size: S.householdSize,
    employment_type: S.employmentType === "other" && empTypeCustom ? empTypeCustom : S.employmentType,
    has_bank_account: S.hasBankAccount
  };
  if (S._existingId) payload.existing_user_id = S._existingId;

  try {
    const r = await fetch("/api/user/register", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify(payload)
    });
    const d = await r.json();

    if (d.exists) {
      const list = document.getElementById("profiles-list");
      list.innerHTML = "";

      function makeProfileCard(p) {
        const card = document.createElement("div");
        card.className = "profile-card";
        const customVoc = p.vocation === 'other' || p.vocation === 'business' ? (p.vocation_custom || 'Other') : '';
        const vocName = customVoc || t('voc_' + p.vocation) || p.vocation;
        const pAge = p.age ? ` (${p.age}Y)` : "";
        const initial = (p.name || "?").charAt(0).toUpperCase();
        card.innerHTML = `
          <div class="profile-card-row">
            <button class="profile-select">
              <span class="profile-avatar">${initial}</span>
              <span class="profile-info">
                <span class="profile-name">${p.name}${pAge}</span>
                <span class="profile-voc">${vocName}</span>
              </span>
            </button>
            <button class="profile-del-btn" aria-label="Delete profile">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
              </svg>
            </button>
          </div>
          <div class="profile-confirm">
            <span>${t("del_confirm_q")} <strong>${p.name}</strong>?</span>
            <button class="pc-yes">${t("del_yes")}</button>
            <button class="pc-no">${t("del_no")}</button>
          </div>
        `;

        card.querySelector(".profile-select").addEventListener("click", () => {
          S.userId         = p.id;
          S.sessionId      = p.session_id;
          S.name           = p.name;
          S.age            = p.age;
          S.mobile         = p.mobile_last4 || "";
          S.vocation       = p.vocation;
          S.vocationCustom = p.vocation_custom || "";
          if (p.language) { S.lang = p.language; localStorage.setItem("daras-lang", S.lang); }
          document.getElementById("in-name").value   = p.name;
          document.getElementById("in-age").value    = p.age || "";
          document.getElementById("in-mobile").value = p.mobile_last4 || "";
          document.getElementById("in-vocation-custom").value = p.vocation_custom || "";
          document.getElementById("vocation-custom-wrap").style.display = (p.vocation === "other" || p.vocation === "business") ? "block" : "none";
          populateVocations();
          document.getElementById("profile-selection").style.display = "none";
          applyLang();
          go("s-existing");
        });

        const delBtn = card.querySelector(".profile-del-btn");
        const confirmDiv = card.querySelector(".profile-confirm");
        delBtn.addEventListener("click", () => {
          confirmDiv.style.display = "flex";
          delBtn.style.visibility = "hidden";
        });
        card.querySelector(".pc-no").addEventListener("click", () => {
          confirmDiv.style.display = "none";
          delBtn.style.visibility = "";
        });
        card.querySelector(".pc-yes").addEventListener("click", async () => {
          try {
            const res = await fetch(`/api/user/profile/${p.id}`, {
              method: "DELETE",
              headers: {"Content-Type": "application/json"},
              body: JSON.stringify({session_id: p.session_id}),
            });
            if (!res.ok) return;
            card.remove();
            if (!list.querySelector(".profile-card")) {
              document.getElementById("profile-selection").style.display = "none";
            }
          } catch(e) {}
        });

        return card;
      }

      d.profiles.forEach(p => list.appendChild(makeProfileCard(p)));
      document.getElementById("profile-selection").style.display = "flex";
      return;
    }

    if (d.success) {
      S.userId = d.user_id; S.sessionId = d.session_id;
      S._existingId = null;
    }
  } catch(e){}
  applyLang();
  go("s-existing");
});

document.getElementById("btn-create-new-profile").addEventListener("click", async () => {
  const payload = {
    name: S.name, age: S.age, mobile: S.mobile,
    vocation: S.vocation, vocation_custom: S.vocationCustom,
    language: S.lang,
    force_new: true
  };
  try {
    const r = await fetch("/api/user/register", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify(payload)
    });
    const d = await r.json();
    if (d.success) {
      S.userId = d.user_id; S.sessionId = d.session_id;
      S._existingId = null;
      document.getElementById("profile-selection").style.display = "none";
      applyLang();
      go("s-existing");
    }
  } catch(e){}
});

/* ---------- 3. EXISTING LOANS ---------- */
document.getElementById("btn-ex-no").addEventListener("click", () => {
  S.loanType = "new";
  S.existing = { amount: 0, purpose: "", source: "", rate: 0, max_rate: 0, remaining: 0, monthly_emi: 0, loans: [] };
  logEvent("loan_type", {type:"new_none"});
  go("s-no-loan-choice");
});

document.getElementById("btn-ex-yes").addEventListener("click", () => {
  S.loanType = "existing";
  logEvent("loan_type", {type:"existing"});
  S.history.push("s-existing");
  document.getElementById("back-btn").hidden = false;
  document.getElementById("ex-gate").style.display = "none";
  document.getElementById("ex-form").style.display = "";
  if (!document.getElementById("loan-list").children.length) addLoanRow(true);
  saveState();
});

/* ---------- 4. EXISTING LOAN FORM SUBMISSION ---------- */
document.getElementById("btn-add-loan").addEventListener("click", () => {
  addLoanRow(false);
  const rows = loanList.querySelectorAll(".loan-row");
  rows[rows.length - 1].querySelector(".loan-amount").focus();
});

document.getElementById("btn-existing-next").addEventListener("click", () => {
  const rows = loanList.querySelectorAll(".loan-row");
  let totalAmount = 0, maxRate = 0, totalRemaining = 0, totalInterest = 0, weightedTenureNumerator = 0;
  let hasEmpty = false, missingRate = false, missingTenure = false, missingRem = false, remExceeds = false, badReturn = false;
  const loanDetails = [];
  rows.forEach(row => {
    const d = readLoanRow(row);
    if (!d.amount) { hasEmpty = true; return; }
    if (d.mode === "known" && !d.interest_rate) missingRate = true;
    if (!d.tenure_months) missingTenure = true;
    if (d.mode === "unknown" && (!d.total_return || d.total_return < d.amount)) badReturn = true;
    if (!d.remaining) missingRem = true;
    if (d.remaining > d.amount) remExceeds = true;
    totalAmount += d.amount;
    maxRate = Math.max(maxRate, d.interest_rate);
    totalRemaining += d.remaining || d.amount;
    totalInterest += d.interest_amount;
    weightedTenureNumerator += d.amount * d.tenure_months;
    loanDetails.push({
      amount: d.amount,
      remaining: d.remaining,
      tenure_months: d.tenure_months,
      interest_rate: d.mode === "known" ? d.interest_rate : undefined,
      total_return: d.mode === "unknown" ? d.total_return : undefined,
      monthly_payment: d.monthly_payment,
      purpose: d.purpose,
      source: d.source,
      rate_mode: d.mode,
    });
  });
  loanList.querySelectorAll(".loan-err-rate,.loan-err-tenure,.loan-err-total-return,.loan-err-total-tenure,.loan-err-remaining").forEach(clearErrEl);
  clearErr("err-emi");
  if (hasEmpty || !totalAmount) {
    loanList.querySelectorAll(".loan-row").forEach(row => {
      if (!parseFloat(row.querySelector(".loan-amount").value || 0))
        showErrEl(row.querySelector(".loan-err-rate"), "err_amount");
    });
    return;
  }
  if (missingRate) {
    loanList.querySelectorAll(".loan-row").forEach(row => {
      if ((row.dataset.rateMode || "known") === "known" && !parseFloat(row.querySelector(".loan-rate").value || 0))
        showErrEl(row.querySelector(".loan-err-rate"), "err_rate");
    });
    return;
  }
  if (missingTenure) {
    loanList.querySelectorAll(".loan-row").forEach(row => {
      const isUnknown = (row.dataset.rateMode || "known") === "unknown";
      const el = isUnknown ? row.querySelector(".loan-total-tenure") : row.querySelector(".loan-tenure");
      if (!parseInt(el.value || 0)) {
        showErrEl(
          isUnknown ? row.querySelector(".loan-err-total-tenure") : row.querySelector(".loan-err-tenure"),
          "err_tenure"
        );
      }
    });
    return;
  }
  if (badReturn) {
    loanList.querySelectorAll(".loan-row").forEach(row => {
      if ((row.dataset.rateMode || "known") !== "unknown") return;
      const amt = parseFloat(row.querySelector(".loan-amount").value || 0);
      const ret = parseFloat(row.querySelector(".loan-total-return").value || 0);
      if (!ret || ret < amt) showErrEl(row.querySelector(".loan-err-total-return"), "err_total_return");
    });
    return;
  }
  if (missingRem) {
    loanList.querySelectorAll(".loan-row").forEach(row => {
      if (!parseFloat(row.querySelector(".loan-remaining").value || 0))
        showErrEl(row.querySelector(".loan-err-remaining"), "err_remaining");
    });
    return;
  }
  if (remExceeds) {
    showErr("err-remaining-exceeds", "err_remaining_exceeds");
    return;
  }
  const enteredEmi = parseFloat(document.getElementById("ex-monthly-emi").value || 0);
  const derivedEmi = loanDetails.reduce((sum, loan) => sum + (loan.monthly_payment || 0), 0);
  const emi = enteredEmi || derivedEmi;
  if (!emi) { showErr("err-emi", "err_emi"); document.getElementById("ex-monthly-emi").focus(); return; }
  // Use the highest-rate loan's purpose/source as the primary signal
  let primaryPurpose = "", primarySource = "", primaryRate = -1;
  rows.forEach(row => {
    const d = readLoanRow(row);
    if (d.interest_rate >= primaryRate) {
      primaryRate    = d.interest_rate;
      primaryPurpose = d.purpose;
      primarySource  = d.source;
    }
  });
  const weightedTenure = totalAmount ? weightedTenureNumerator / totalAmount : 0;
  const weightedRate = totalAmount && weightedTenure ? (totalInterest / weightedTenure / totalAmount) * 12 * 100 : maxRate;
  S.existing.amount      = totalAmount;
  S.existing.purpose     = primaryPurpose;
  S.existing.source      = primarySource;
  S.existing.rate        = Math.round((weightedRate || maxRate) * 100) / 100;
  S.existing.max_rate    = Math.round(maxRate * 100) / 100;
  S.existing.remaining   = totalRemaining;
  S.existing.monthly_emi = emi;
  S.existing.loans       = loanDetails;
  logEvent("existing_filled", {
    amount: totalAmount, source: S.existing.source,
    weighted_rate: S.existing.rate, max_rate: S.existing.max_rate,
    loan_count: rows.length
  });
  go("s-satisfied");
});

/* ---------- 4b. NO-LOAN CHOICE ---------- */
document.querySelectorAll("[data-nlc]").forEach(b => b.addEventListener("click", () => {
  const m = b.getAttribute("data-nlc");
  logEvent("no_loan_choice", {choice:m});
  if (m === "max") go("s-new-savings");
  else { S.loanType = "new"; go("s-new"); }
}));

/* ---------- 5. SATISFIED (handled by [data-go]) ---------- */

/* ---------- 6. OPEN QUESTION + NEW LOAN SHORTCUT ---------- */
document.getElementById("btn-open-new-loan").addEventListener("click", () => {
  S.loanType = "new";
  logEvent("helpopen_new_loan", {});
  go("s-new");
});

document.getElementById("btn-open-submit").addEventListener("click", async () => {
  const q = document.getElementById("open-q").value.trim();
  if (!q) { go("s-endgrace"); return; }
  try {
    await fetch("/api/user/question", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ user_id: S.userId, question: q, context: {branch:S.branch, lang:S.lang} })
    });
  } catch(e){}
  alert(t("saved"));
  go("s-endgrace");
});

/* ---------- 8. UNHAPPY → BRANCH ---------- */
document.querySelectorAll("[data-set-branch]").forEach(b => b.addEventListener("click", () => {
  S.branch = b.getAttribute("data-set-branch");
  logEvent("branch", {branch:S.branch});
  if (S.branch === "high_interest") go("s-incexp");
  else if (S.branch === "cant_pay_emi") go("s-incexp");
  else if (S.branch === "principal_issue") go("s-incexp");
  else if (S.branch === "others") go("s-ngo");
  else if (S.branch === "need_more_money") {
    if (S.existing.amount > 0) {
      if ((S.existing.max_rate || S.existing.rate) >= 36) go("s-warning");
      else go("s-new");
    } else go("s-new");
  }
}));

/* ---------- 10. INCOME/EXPENSE → CALCULATE ---------- */
const IE_EXPENSE_FIELDS = [
  {id:"ie-rent",      errId:"err-ie-rent"},
  {id:"ie-grocery",   errId:"err-ie-grocery"},
  {id:"ie-medicine",  errId:"err-ie-medicine"},
  {id:"ie-education", errId:"err-ie-education"},
  {id:"ie-mobile-bill", errId:"err-ie-mobile"},
  {id:"ie-gaon",      errId:"err-ie-gaon"},
  {id:"ie-other",     errId:"err-ie-other"},
];
IE_EXPENSE_FIELDS.forEach(({id, errId}) => {
  document.getElementById(id).addEventListener("input", () => {
    clearErr(errId);
    clearErr("err-ie-total");
  });
});
document.getElementById("ie-income").addEventListener("input", () => clearErr("err-ie-total"));

document.getElementById("btn-calc").addEventListener("click", async () => {
  S.income = parseFloat(document.getElementById("ie-income").value || 0);
  if (!S.income) { alert(t("err_income")); return; }

  // Clear previous errors
  IE_EXPENSE_FIELDS.forEach(({errId}) => clearErr(errId));
  clearErr("err-ie-total");

  // Validate each field individually
  let hasFieldErr = false;
  IE_EXPENSE_FIELDS.forEach(({id, errId}) => {
    const val = parseFloat(document.getElementById(id).value || 0);
    if (val >= S.income) {
      showErr(errId, "err_exp_field");
      hasFieldErr = true;
    }
  });

  // Validate combined total
  const totalExp = IE_EXPENSE_FIELDS.reduce((sum, {id}) =>
    sum + parseFloat(document.getElementById(id).value || 0), 0);
  if (totalExp > S.income) {
    showErr("err-ie-total", "err_exp_total");
    return;
  }
  if (hasFieldErr) return;

  S.expenses = {
    rent:        parseFloat(document.getElementById("ie-rent").value || 0),
    grocery:     parseFloat(document.getElementById("ie-grocery").value || 0),
    medicine:    parseFloat(document.getElementById("ie-medicine").value || 0),
    education:   parseFloat(document.getElementById("ie-education").value || 0),
    mobile_bill: parseFloat(document.getElementById("ie-mobile-bill").value || 0),
    gaon:        parseFloat(document.getElementById("ie-gaon").value || 0),
    other_expenses: parseFloat(document.getElementById("ie-other").value || 0),
  };
  S.tenure = parseInt(document.getElementById("ie-tenure").value || 12);
  await runCalculate();
});

async function runCalculate(){
  // For new-loan checks: existing monthly EMI is an additional expense burden
  const existingEmi = (S.loanType === "new" && S.existing.monthly_emi > 0) ? S.existing.monthly_emi : 0;
  const payload = {
    user_id: S.userId,
    loan_type: S.loanType,
    loan_amount: S.existing.amount || S.newLoan.amount,
    loan_purpose: S.existing.purpose || S.newLoan.purpose,
    loan_source: S.existing.source || S.newLoan.source || "",
    interest_rate: S.existing.rate || 14,
    tenure_months: S.tenure,
    loan_remaining: S.existing.remaining || S.existing.amount || S.newLoan.amount,
    monthly_emi: S.existing.monthly_emi || 0,
    existing_loans: S.loanType === "existing" ? (S.existing.loans || []) : [],
    income: S.income, ...S.expenses,
    other_expenses: (S.expenses.other_expenses || 0) + existingEmi,
    vocation: S.vocation,
  };
  try {
    const r = await fetch("/api/user/calculate", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify(payload),
    });
    const d = await r.json();
    S.lastResult = d;
    if (S.branch === "principal_issue") renderPayoff(d); else renderResultAndShow(d);
  } catch(e){ alert("Network error"); }
}

/* ---------- 12. AFTER-GREEN ---------- */
document.querySelectorAll("[data-go-after-green]").forEach(b => b.addEventListener("click", () => {
  const v = b.getAttribute("data-go-after-green");
  logEvent("after_green", {ans:v});
  if (v === "yes") go("s-new"); else go("s-helpopen");
}));

/* ---------- 13. NEWINCOME ---------- */
document.querySelectorAll("[data-go-newincome]").forEach(b => b.addEventListener("click", () => {
  const v = b.getAttribute("data-go-newincome");
  logEvent("new_income", {ans:v});
  if (v === "yes") {
    alert(S.lang === "hi" ? "अपनी नई आमदनी जोड़कर फिर हिसाब लगाएँ।" :
          S.lang === "bn" ? "নতুন আয় যোগ করে আবার হিসাব করুন।" :
                            "Add your new income and re-calculate.");
    go("s-incexp");
  } else {
    go("s-lender");
  }
}));

/* ---------- 14. LENDER ---------- */
document.querySelectorAll("[data-go-lender]").forEach(b => b.addEventListener("click", () => {
  const v = b.getAttribute("data-go-lender");
  logEvent("lender_spoken", {ans:v});
  if (v === "yes") go("s-ngo"); else go("s-lender-prompt");
}));

/* ---------- 18-19. PAYOFF / PACE ---------- */
document.querySelectorAll("[data-go-payoff]").forEach(b => b.addEventListener("click", () => {
  const v = b.getAttribute("data-go-payoff");
  logEvent("payoff_ok", {ans:v});
  if (v === "yes") go("s-helpopen"); else go("s-payoff-pace");
}));
document.querySelectorAll("[data-go-pace]").forEach(b => b.addEventListener("click", () => {
  const v = b.getAttribute("data-go-pace");
  logEvent("pace", {ans:v});
  document.getElementById("pace-months").value = v === "fast" ? 12 : 36;
}));
document.getElementById("btn-pace-calc").addEventListener("click", () => {
  S.tenure = parseInt(document.getElementById("pace-months").value || 24);
  S.branch = "cant_pay_emi"; // route to standard result flow
  runCalculate();
});

/* ---------- 20. NEW LOAN ---------- */
document.getElementById("nl-purpose").addEventListener("change", updateRecommendation);
function updateRecommendation(){
  const p = document.getElementById("nl-purpose").value;
  const map = {
    padai:"rec_education", property:"rec_property", business:"rec_business",
    vehicle:"rec_vehicle", medical:"rec_medical"
  };
  const k = map[p] || "rec_default";
  document.getElementById("nl-recommend-text").textContent = t(k);
  document.getElementById("nl-recommend-box").style.display = "flex";
}
document.getElementById("btn-new-next").addEventListener("click", () => {
  S.newLoan.amount  = parseFloat(document.getElementById("nl-amount").value || 0);
  S.newLoan.purpose = document.getElementById("nl-purpose").value;
  S.newLoan.rate    = parseFloat(document.getElementById("nl-rate").value || 0);
  S.newLoan.source  = document.getElementById("nl-source").value;
  clearErr("err-nl-amount"); clearErr("err-nl-rate");
  if (!S.newLoan.amount) { showErr("err-nl-amount", "err_amount"); return; }
  if (!S.newLoan.rate)   { showErr("err-nl-rate", "err_nl_rate"); return; }
  // Merge new loan into S.existing so runCalculate() picks it up
  S.loanType = "new";
  S.existing = {
    amount: S.newLoan.amount, purpose: S.newLoan.purpose,
    source: S.newLoan.source, rate: S.newLoan.rate,
    max_rate: S.newLoan.rate,
    remaining: S.newLoan.amount,
    monthly_emi: S.existing.monthly_emi || 0,
    loans: []
  };
  S.branch = null;
  logEvent("new_loan_details", {...S.newLoan});
  go("s-incexp");
});

/* ---------- 23. NS-CALC (savings-based max loan) ---------- */
document.getElementById("btn-ns-calc").addEventListener("click", async () => {
  const savings = parseFloat(document.getElementById("ns-savings").value || 0);
  const rate    = parseFloat(document.getElementById("ns-rate").value);
  const months  = parseInt(document.getElementById("ns-months").value || 24);
  if (!rate) { showErr("err-ns-rate", "err_ns_rate"); return; }
  try {
    const r = await fetch("/api/user/calculate_max", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ monthly_savings: savings, interest_rate: rate, tenure_months: months })
    });
    const d = await r.json();
    document.getElementById("nsr-num").textContent = inr(d.max_safe_loan);
    document.getElementById("nsr-emi").textContent = t("nsr_emi", {emi: Math.round(savings).toLocaleString("en-IN")});
    logEvent("ns_calc", {max:d.max_safe_loan, savings});
    go("s-new-savings-result");
  } catch(e){ alert("Network error"); }
});
