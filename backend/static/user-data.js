/* ---------- VOCATIONS ---------- */
const VOCATIONS = [
  {k:"labour_skilled",   ic:"🛠️", l:"voc_labour_s"},
  {k:"labour_unskilled", ic:"💪", l:"voc_labour_u"},
  {k:"thekedaar",        ic:"📋", l:"voc_thekedaar"},
  {k:"security",         ic:"🛡️", l:"voc_security"},
  {k:"house_maid",       ic:"🧹", l:"voc_maid"},
  {k:"business",         ic:"🏪", l:"voc_business"},
  {k:"driver",           ic:"🚗", l:"voc_driver"},
  {k:"other",            ic:"✏️", l:"voc_other"},
];

const HOUSEHOLD_SIZES = [
  {k:"1_2",   ic:"👤", l:"hh_1_2"},
  {k:"3_4",   ic:"👥", l:"hh_3_4"},
  {k:"5_6",   ic:"👨‍👩‍👧", l:"hh_5_6"},
  {k:"7plus", ic:"🏘️",  l:"hh_7plus"},
];
const EMP_TYPES = [
  {k:"permanent", ic:"🏢", l:"emp_permanent"},
  {k:"daily",     ic:"🔨", l:"emp_daily"},
  {k:"seasonal",  ic:"🌾", l:"emp_seasonal"},
  {k:"other",     ic:"✏️",  l:"emp_other"},
];

const PURPOSES = ["shaadi","padai","property","gaon","medical","business","vehicle","other"];
const SOURCES  = ["informal","sahukaar","unsecured","secured","personal","cc","microfin","msme","gold","employer","education","other"];
const SPOKEN   = ["none","family","bank","sahukaar","other"];

/* ---------- STATE ---------- */
const S = {
  lang: (localStorage.getItem("daras-lang") || "hi"),
  userId: null, sessionId: null, _existingId: null,
  name: "", age: null, mobile: "", vocation: "", vocationCustom: "",
  householdSize: null, employmentType: null, hasBankAccount: null,
  loanType: null, // 'existing' | 'new'
  existing: { amount: 0, purpose: "", source: "", rate: 0, max_rate: 0, remaining: 0, monthly_emi: 0, loans: [] },
  branch: null,
  income: 0, expenses: {}, tenure: 12,
  lastResult: null, paceMonths: 24,
  newLoan: { amount: 0, purpose: "", rate: 0, source: "", spoken: "" },
  history: ["s-welcome"],
};
window.S = S; // dev introspection
