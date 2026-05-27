/* ============================================================
   DARAS — Core Utilities
   i18n · navigation · telemetry · error helpers · formatters
   ============================================================ */

/* ---------- i18n ---------- */
function t(key, vars){
  let v = (LANG[key] && LANG[key][S.lang]) || (LANG[key] && LANG[key].en) || key;
  if (vars) Object.keys(vars).forEach(k => { v = v.replace(new RegExp("\\{"+k+"\\}","g"), vars[k]); });
  return v;
}
function applyLang(){
  document.documentElement.lang = S.lang;
  const vars = { name: S.name || "" };
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const k = el.getAttribute("data-i18n");
    const extra = el.getAttribute("data-i18n-vars");
    if (LANG[k]) el.textContent = t(k, extra ? {...vars, ...JSON.parse(extra)} : vars);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const k = el.getAttribute("data-i18n-placeholder");
    if (LANG[k]) el.placeholder = t(k, vars);
  });
  document.querySelectorAll(".lang-btn").forEach(b => b.classList.toggle("on", b.dataset.lang === S.lang));
  // Re-render dynamic bits (populated in user-ui.js)
  populateVocations(); populateHousehold(); populateEmpTypes(); populateSelects();
  if (S.lastResult) renderResult(S.lastResult);
}

/* ---------- NAVIGATION ---------- */
const STEP_FOR = {
  "s-welcome":"step_welcome","s-register":"step_register","s-ltype":"step_ltype",
  "s-existing":"step_existing","s-no-loan-choice":"step_ltype","s-satisfied":"step_satisfied","s-helpopen":"step_satisfied",
  "s-endgrace":"step_end","s-unhappy":"step_unhappy",
  "s-incexp":"step_calc","s-result":"step_result","s-after-green":"step_result",
  "s-newincome":"step_result","s-lender":"step_ngo","s-lender-prompt":"step_ngo",
  "s-ngo":"step_ngo","s-warning":"step_ngo","s-payoff":"step_result",
  "s-payoff-pace":"step_calc","s-new":"step_new","s-new-mode":"step_new",
  "s-new-savings":"step_calc","s-new-savings-result":"step_result","s-direct":"step_end"
};

function go(id, opts={}){
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("on"));
  const target = document.getElementById(id);
  if (!target) return;
  target.classList.add("on");
  if (!opts.replace) S.history.push(id);
  window.scrollTo({top:0, behavior:"smooth"});
  const chip = document.getElementById("progress-chip").querySelector("span:last-child");
  chip.textContent = t(STEP_FOR[id] || "step_welcome");
  document.getElementById("back-btn").hidden = S.history.length <= 1 || id === "s-welcome";
  if (id === "s-existing") {
    if (!opts.replace) {
      // Fresh forward navigation — always reset to gate
      S.loanType = null;
      document.getElementById("ex-gate").style.display = "";
      document.getElementById("ex-form").style.display = "none";
      loanList.innerHTML = "";
      loanCount = 0;
    } else if (S.loanType === "existing") {
      // Back/restore — user already said yes, show the form
      document.getElementById("ex-gate").style.display = "none";
      document.getElementById("ex-form").style.display = "";
      if (!loanList.children.length) addLoanRow(true);
    } else {
      // Back/restore — show gate
      document.getElementById("ex-gate").style.display = "";
      document.getElementById("ex-form").style.display = "none";
      loanList.innerHTML = "";
      loanCount = 0;
    }
  }
  logEvent("screen_view", {screen:id, lang:S.lang});
  saveState();
}
function goBack(){
  if (S.history.length <= 1) return;
  // If on the loan form sub-view, Back goes to gate without leaving s-existing
  const cur = S.history[S.history.length-1];
  if (cur === "s-existing" && S.loanType === "existing") {
    S.loanType = null;
    S.history.pop(); // remove the duplicate s-existing pushed by btn-ex-yes
    document.getElementById("ex-gate").style.display = "";
    document.getElementById("ex-form").style.display = "none";
    document.getElementById("back-btn").hidden = S.history.length <= 1;
    saveState();
    return;
  }
  S.history.pop();
  const prev = S.history[S.history.length-1];
  go(prev, {replace:true});
}

/* ---------- TELEMETRY ---------- */
function logEvent(event, meta){
  fetch("/api/user/event", {
    method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({user_id: S.userId, event, meta: meta||{}})
  }).catch(()=>{});
}

/* ---------- INLINE ERRORS ---------- */
function errText(key) {
  return LANG[key][S.lang] || LANG[key].en;
}
function showErr(id, key) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = errText(key);
  el.style.display = "block";
}
function clearErr(id) {
  const el = document.getElementById(id);
  if (el) { el.style.display = "none"; el.innerHTML = ""; }
}
function showErrEl(el, key) {
  if (!el) return;
  el.innerHTML = errText(key);
  el.style.display = "block";
}
function clearErrEl(el) {
  if (el) { el.style.display = "none"; el.innerHTML = ""; }
}

/* ---------- FORMATTERS ---------- */
function inr(n){
  const v = Math.round(Number(n)||0);
  return "₹" + v.toLocaleString("en-IN");
}
function inrShort(n) {
  if (n >= 100000) return "₹" + (n/100000).toFixed(1) + " लाख";
  if (n >= 1000)   return "₹" + Math.round(n/1000) + "k";
  return "₹" + n;
}
