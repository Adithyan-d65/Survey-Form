// STEM-27-config.js — Survey Form System 2027
// Template config for STEM-27
// ⚠️  DO NOT EDIT the shared sections (US_STATES, OPTS).
//     Only edit the questions array in FORM_CONFIGS.STEM below.
// This file is loaded by index.html alongside shared/form-handler.js

// form-configs.js — Survey Form System 2027
// Question numbers come directly from Column C of each form's Excel layout.

// ─── US States ────────────────────────────────────────────────────────────────
window.US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

// ─── Shared option sets ───────────────────────────────────────────────────────
window.OPTS = {
  GPA: ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "LC"],
  GENDER: [{ v: "M", l: "Male" }, { v: "F", l: "Female" }, { v: "A", l: "Another" }],
  GRADYR: ["2027", "2028", "2029", "2030", "2031", "2032"],
  MONTHS: ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"],
  DAYS: Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0")),
  BIRTHYR: ["2008", "2009", "2010", "2011", "2012", "2013"],
  CTYPE: ["A", "B", "C", "D", "E", "F"],
  HSPREP: ["A", "B", "C", "D", "E", "F", "G", "H"],
  APPLICARE: ["A", "B", "C", "D", "E", "F", "G", "H"],
  LEARNEXP: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"],
  COLCHAR: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T"],
  PROFESSION: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T"],
  EXPECT: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q"],
  ACTIVITY: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"],
  RACE: ["A", "B", "C", "D", "E", "F", "G"],
  MAJOR: Array.from({ length: 72 }, (_, i) => String(i + 1).padStart(2, "0")),
  DENOM: Array.from({ length: 17 }, (_, i) => String.fromCharCode(65 + i)),
  MPLANINFO: ["A", "B", "C", "D", "E"],
  YN: ["Y", "N"],
  AB: ["A", "B"],
  AE: ["A", "B", "C", "D", "E"],
  ART_P1: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O"],
  ART_P2: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U"],
  ART_P2_PERF: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"],
  ART_P2_VIS: ["K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U"],
  ART_P3: ["A", "B", "C", "D", "E"],
  DECA_P1: ["A", "B", "C", "D", "E", "F"],
  DECA_P2: ["A", "B", "C", "D", "E", "F", "G"],
  DECA_P3: ["A", "B", "C", "D", "E", "F"],
  DECA_P4: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S"],
  FBLA_P2: ["A", "B", "C", "D", "E", "F", "G", "H"],
  FBLA_P3: ["A", "B", "C", "D", "E", "F", "G"],
  FBLA_P5: ["A", "B", "C", "D", "E", "F", "G"],
  FCCLA_P1: ["A", "B", "C", "D", "E", "F", "G", "H"],
  FCCLA_P2: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K"],
  FCCLA_P3: ["A", "B", "C", "D", "E"],
  FCCLA_P4: Array.from({ length: 20 }, (_, i) => String.fromCharCode(65 + i)),
  JROTC_P1: ["A", "B", "C", "D", "E", "F", "G", "H"],
  JROTC_P2: ["A", "B", "C", "D", "E", "F"],
  JROTC_P3: ["A", "B", "C", "D", "E", "F", "G", "H", "I"],
  JROTC_P4: ["A", "B", "C", "D", "E", "F"],
  JROTC_P6: ["A", "B", "C", "D", "E", "F", "G", "H"],
  STEM_P2: ["A", "B", "C", "D"],
  STEM_P3: ["A", "B", "C", "D"],
  STEM_P4: ["A", "B", "C", "D", "E", "F", "G", "H"],
  STEM_P56: ["A", "B", "C"]
};

// ─── Form configurations ──────────────────────────────────────────────────────
// Each form defines its questions in order 1-N using the Excel Column C numbers.
// renderFormQuestions() reads this array in sequence.
//
// question object shape:
//   { qNum, label, key, type, opts, max? }
//   type: "checkbox" | "radio" | "state" | "stateTriple" | "collegeVisits" | "majorGrid" | "denomGrid"

window.FORM_CONFIGS = {

  // ── STEM (HX) ── Q nums: 1-6 partner, 7-21 ───────────────────────────────
  STEM: {
    displayName: "STEM-27",
    surveyType: "HX",
    questions: [
      { qNum: "1", key: "PartnerDefinedFieldFour", type: "radio", opts: OPTS.STEM_P56, label: "Are you interested in pursuing a career in STEM? (Darken ONE)" },
      { qNum: "2", key: "PartnerDefinedFieldFive", type: "checkbox", opts: OPTS.STEM_P2, label: "What programs or activities would be most helpful in advancing your learning of STEM subjects? (Darken as many as apply)" },
      { qNum: "3", key: "PartnerDefinedFieldSix", type: "radio", opts: OPTS.STEM_P3, label: "How important is it for you to see other people like you employed in the STEM-based career(s) that interests you? (Darken ONE)" },
      { qNum: "4", key: "PartnerDefinedFieldSeven", type: "checkbox", opts: OPTS.STEM_P4, label: "In which of the following ways do you see STEM relating to your personal life? (Darken as many as apply)" },
      { qNum: "5", key: "PartnerDefinedFieldEight", type: "radio", opts: OPTS.STEM_P56, label: "Do you think STEM will impact your life in the future? (Darken ONE)" },
      { qNum: "6", key: "PartnerDefinedFieldNine", type: "radio", opts: OPTS.STEM_P56, label: "Do you feel you can be successful in achieving the STEM-related career(s) that interests you? (Darken ONE)" },
      { qNum: "7", key: "CType", type: "checkbox", opts: OPTS.CTYPE, label: "(All that apply)" },
      { qNum: "8", key: "ParentCol", type: "radio", opts: OPTS.AB, label: "Are your parents college educated? (A=Yes, B=No)" },
      { qNum: "9", key: "HSPrep", type: "checkbox", opts: OPTS.HSPREP, label: "(All that apply)" },
      { qNum: "10", key: "Applicare", type: "checkbox", opts: OPTS.APPLICARE, label: "(Up to 3)", max: 3 },
      { qNum: "11", key: "LearnExp", type: "checkbox", opts: OPTS.LEARNEXP, label: "(Up to 5)", max: 5 },
      { qNum: "12", key: "ColChar", type: "checkbox", opts: OPTS.COLCHAR, label: "(All that apply)" },
      { qNum: "13", key: "Profession", type: "checkbox", opts: OPTS.PROFESSION, label: "(All that apply)" },
      { qNum: "14", key: "_stateTriple", type: "stateTriple", labels: ["14A", "14B", "14C"] },
      { qNum: "15", key: "_collegeVisits", type: "collegeVisits", prefix: "15" },
      { qNum: "16", key: "_majorGrid", type: "majorGrid", prefix: "16" },
      { qNum: "17", key: "Expect", type: "checkbox", opts: OPTS.EXPECT, label: "Build Your Ideal College — Expect: (Darken up to FIVE)", max: 5 },
      { qNum: "18", key: "Activity", type: "checkbox", opts: OPTS.ACTIVITY, label: "(All that apply)" },
      { qNum: "19", key: "Race", type: "checkbox", opts: OPTS.RACE, label: "(All that apply)" },
      { qNum: "21", key: "SensitiveOptin", type: "radio", opts: OPTS.YN, label: "Do you consent to participate in sensitive surveys? (Y/N)" }
    ]
  }

};

// ─── Default form data ────────────────────────────────────────────────────────
window.createDefaultFormData = function (surveyType) {
  return {
    SurveyYear: "2027", SurveyType: surveyType,
    EVID: "", Form: "",
    CType: [], ParentCol: "", HSPrep: [], Applicare: [], LearnExp: [],
    ColChar: [], Profession: [], Expect: [], Activity: [], Race: [],
    DeclaredStateI: "", DeclaredStateII: "", DeclaredStateIII: "",
    DeclaredName1: "", DeclaredState1: "", DeclaredVisit1: "",
    DeclaredName2: "", DeclaredState2: "", DeclaredVisit2: "",
    DeclaredName3: "", DeclaredState3: "", DeclaredVisit3: "",
    DeclaredName4: "", DeclaredState4: "", DeclaredVisit4: "",
    DeclaredName5: "", DeclaredState5: "", DeclaredVisit5: "",
    Major: [],
    SensitiveOptin: "",
    PartnerDefinedFieldFour: [], PartnerDefinedFieldFive: [],
    PartnerDefinedFieldSix: [], PartnerDefinedFieldSeven: [],
    PartnerDefinedFieldEight: [], PartnerDefinedFieldNine: []
  };
};

window.getFormConfig = function (t) { return FORM_CONFIGS[t] || FORM_CONFIGS.STEM; };

