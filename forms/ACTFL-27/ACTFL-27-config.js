// ACTFL-27-config.js — Survey Form System 2027

window.US_STATES = [
  "AL", "AK", "AS", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL", "GA", "GU",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN",
  "MS", "MO", "MT", "MP", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH",
  "OK", "OR", "PA", "PR", "RI", "SC", "SD", "TN", "TX", "VI", "UT", "VT", "VA",
  "WA", "WV", "WI", "WY"
];

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
  DENOM: Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)),
  YN: ["Y", "N"],
  AB: ["A", "B"],
  AE: ["A", "B", "C", "D", "E"],
  ACTFL_P1: ["A", "B", "C", "D", "E", "F", "G", "H"],
  ACTFL_P2: ["A", "B", "C", "D", "E"],
  ACTFL_P3: ["A", "B", "C", "D", "E"],
  ACTFL_P4: ["A", "B", "C", "D", "E"],
  ACTFL_P5: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N"],
  ACTFL_P6: ["A", "B", "C", "D"]
};

window.FORM_CONFIGS = {
  ACTFL: {
    displayName: "ACTFL-27",
    surveyType: "SK",
    questions: [
      { key: "PartnerDefinedFieldFour", type: "checkbox", opts: OPTS.ACTFL_P1, label: "Please indicate in which grade level(s) you have studied foreign/world language in school. (Darken as many as apply)" },
      { key: "PartnerDefinedFieldFive", type: "radio", opts: OPTS.ACTFL_P2, label: "How likely are you to continue your foreign/world language studies in college? (Darken ONE)" },
      { key: "PartnerDefinedFieldSix", type: "radio", opts: OPTS.ACTFL_P3, label: "How informed do you feel you are about the need for foreign/world language skills and the role they play in today's job market? (Darken ONE)" },
      { key: "PartnerDefinedFieldSeven", type: "radio", opts: OPTS.ACTFL_P4, label: "How important do you believe your foreign/world language study will be in your future career? (Darken ONE)" },
      { key: "PartnerDefinedFieldEight", type: "checkbox", opts: OPTS.ACTFL_P5, label: "Which of the following languages are you currently studying? (Darken as many as apply)" },
      { key: "PartnerDefinedFieldNine", type: "radio", opts: OPTS.ACTFL_P6, label: "Are you familiar with the Seal of Biliteracy and its potential value to you? (Darken ONE)" },
      { key: "CType", type: "checkbox", opts: OPTS.CTYPE, label: "If costs were not a factor, which of the following options would you be interested in after high school? (Darken as many as apply)" },
      { key: "ParentCol", type: "radio", opts: OPTS.AB, label: "Have either of your parents/guardians completed college? A. Yes  B. No" },
      { key: "HSPrep", type: "checkbox", opts: OPTS.HSPREP, label: "Please identify the types of high school courses you have taken/are currently taking/will take. (Darken as many as apply)" },
      { key: "Applicare", type: "checkbox", opts: OPTS.APPLICARE, label: "What are the top three things you care about the most when applying to a college or university? (Darken up to THREE)" },
      { key: "LearnExp", type: "checkbox", opts: OPTS.LEARNEXP, label: "What are the top five experiences you expect to learn the most from during college? (Darken up to FIVE)" },
      { key: "ColChar", type: "checkbox", opts: OPTS.COLCHAR, label: "Build Your Ideal College: Please darken all characteristics that you are looking for in your ideal college. (Darken as many as apply)" },
      { key: "Profession", type: "checkbox", opts: OPTS.PROFESSION, label: "Imagine what kind of profession you might choose. Select those you are interested in. (Darken as many as apply)" },
      { key: "_stateTriple", type: "stateTriple", labels: ["14A", "14B", "14C"] },
      { key: "_collegeVisits", type: "collegeVisits", prefix: "15" },
      { key: "_majorGrid", type: "majorGrid" },
      { key: "Expect", type: "checkbox", opts: OPTS.EXPECT, label: "Build Your Ideal College — Expect: (Darken up to FIVE)", max: 5 },
      { key: "Activity", type: "denomGrid", opts: OPTS.DENOM, label: "If you are interested in faith-based communities on campus or faith-based institutions, which two would you choose? (Darken up to TWO)" },
      { key: "Race", type: "checkbox", opts: OPTS.RACE, label: "Which of the following do you identify with? (Darken ONE or more)" },
      { key: "SensitiveOptin", type: "radio", opts: OPTS.AB, label: "Encourage consent — by saying yes, you confirm the information is about you. (Darken ONE) A. Yes  B. No" }
    ]
  }
};

window.createDefaultFormData = function (surveyType) {
  return {
    SurveyYear: "2027", SurveyType: surveyType,
    EVID: "", Form: "",
    CType: [], ParentCol: "", HSPrep: [], Applicare: [], LearnExp: [],
    ColChar: [], Profession: [], Expect: [], Activity: [], Race: [],
    SensitiveOptin: "",
    DeclaredStateI: "", DeclaredStateII: "", DeclaredStateIII: "",
    DeclaredName1: "", DeclaredState1: "", DeclaredVisit1: "",
    DeclaredName2: "", DeclaredState2: "", DeclaredVisit2: "",
    DeclaredName3: "", DeclaredState3: "", DeclaredVisit3: "",
    DeclaredName4: "", DeclaredState4: "", DeclaredVisit4: "",
    DeclaredName5: "", DeclaredState5: "", DeclaredVisit5: "",
    Major: [], Denom: [], Expect: [], Denom1: "", Denom2: "",
    PartnerDefinedFieldFour: [], PartnerDefinedFieldFive: [],
    PartnerDefinedFieldSix: [], PartnerDefinedFieldSeven: [],
    PartnerDefinedFieldEight: [], PartnerDefinedFieldNine: []
  };
};

window.getFormConfig = function (t) { return FORM_CONFIGS[t] || FORM_CONFIGS.ACTFL; };
