// FCCLA-27-config.js — Survey Form System 2027
// Template config for FCCLA-27
// ⚠️  DO NOT EDIT the shared sections (US_STATES, OPTS).
//     Only edit the questions array in FORM_CONFIGS.FCCLA below.
// This file is loaded by index.html alongside shared/form-handler.js

// form-configs.js — Survey Form System 2027
// Question numbers come directly from Column C of each form's Excel layout.

// ─── US States ────────────────────────────────────────────────────────────────
window.US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA",
  "HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"
];

// ─── Shared option sets ───────────────────────────────────────────────────────
window.OPTS = {
  GPA:      ["A+","A","A-","B+","B","B-","C+","C","LC"],
  GENDER:   [{v:"M",l:"Male"},{v:"F",l:"Female"},{v:"A",l:"Another"}],
  GRADYR:   ["2027","2028","2029","2030","2031","2032"],
  MONTHS:   ["01","02","03","04","05","06","07","08","09","10","11","12"],
  DAYS:     Array.from({length:31},(_,i)=>String(i+1).padStart(2,"0")),
  BIRTHYR:  ["2008","2009","2010","2011","2012","2013"],
  CTYPE:    ["A","B","C","D","E","F"],
  HSPREP:   ["A","B","C","D","E","F","G","H"],
  APPLICARE:["A","B","C","D","E","F","G","H"],
  LEARNEXP: ["A","B","C","D","E","F","G","H","I","J","K","L"],
  COLCHAR:  ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T"],
  PROFESSION:["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T"],
  EXPECT:   ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q"],
  ACTIVITY: ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"],
  RACE:     ["A","B","C","D","E","F","G"],
  MAJOR:    Array.from({length:72},(_,i)=>String(i+1).padStart(2,"0")),
  DENOM:    Array.from({length:17},(_,i)=>String.fromCharCode(65+i)),
  MPLANINFO:["A","B","C","D","E"],
  YN:       ["Y","N"],
  AB:       ["A","B"],
  AE:       ["A","B","C","D","E"],
  ART_P1:   ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O"],
  ART_P2:   ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U"],
  ART_P2_PERF: ["A","B","C","D","E","F","G","H","I","J"],
  ART_P2_VIS:  ["K","L","M","N","O","P","Q","R","S","T","U"],
  ART_P3:   ["A","B","C","D","E"],
  DECA_P1:  ["A","B","C","D","E","F"],
  DECA_P2:  ["A","B","C","D","E","F","G"],
  DECA_P3:  ["A","B","C","D","E","F"],
  DECA_P4:  ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S"],
  FBLA_P2:  ["A","B","C","D","E","F","G","H"],
  FBLA_P3:  ["A","B","C","D","E","F","G"],
  FBLA_P5:  ["A","B","C","D","E","F","G"],
  FCCLA_P1: ["A","B","C","D","E","F","G","H"],
  FCCLA_P2: ["A","B","C","D","E","F","G","H","I","J","K"],
  FCCLA_P3: ["A","B","C","D","E"],
  FCCLA_P4: Array.from({length:20},(_,i)=>String.fromCharCode(65+i)),
  JROTC_P1: ["A","B","C","D","E","F","G","H"],
  JROTC_P2: ["A","B","C","D","E","F"],
  JROTC_P3: ["A","B","C","D","E","F","G","H","I"],
  JROTC_P4: ["A","B","C","D","E","F"],
  JROTC_P6: ["A","B","C","D","E","F","G","H"],
  STEM_P2:  ["A","B","C","D"],
  STEM_P3:  ["A","B","C","D"],
  STEM_P4:  ["A","B","C","D","E","F","G","H"],
  STEM_P56: ["A","B","C"]
};

// ─── Form configurations ──────────────────────────────────────────────────────
// Each form defines its questions in order 1-N using the Excel Column C numbers.
// renderFormQuestions() reads this array in sequence.
//
// question object shape:
//   { qNum, label, key, type, opts, max? }
//   type: "checkbox" | "radio" | "state" | "stateTriple" | "collegeVisits" | "majorGrid" | "denomGrid"

window.FORM_CONFIGS = {

  // ── FCCLA (SP) ── Q nums: 1A,1B,2,3,4 partner, 5-19 ─────────────────────
  FCCLA: {
    displayName:"FCCLA-27",
    surveyType:"SP",
    questions:[
      { qNum:"1A", key:"PartnerDefinedFieldFour",  type:"checkbox", opts:OPTS.FCCLA_P1, label:"Please indicate in which grade levels you have taken FCS courses. (Darken as many as apply)" },
      { qNum:"1B", key:"PartnerDefinedFieldFive",  type:"checkbox", opts:OPTS.FCCLA_P1, label:"Please indicate in which grade levels you have been a member of FCCLA. (Darken as many as apply)" },
      { qNum:"2",  key:"PartnerDefinedFieldSix",   type:"checkbox", opts:OPTS.FCCLA_P2, label:"Which of the following skills have you acquired as a result of your FCS classes? (Darken as many as apply)" },
      { qNum:"3",  key:"PartnerDefinedFieldSeven", type:"checkbox", opts:OPTS.FCCLA_P3, label:"Have your experiences in FCS classes provided a positive impact on your: (Darken as many as apply)" },
      { qNum:"4",  key:"PartnerDefinedFieldEight", type:"checkbox", opts:OPTS.FCCLA_P4, label:"Are you interested in any of the following FCS career options? (Darken as many as apply)" },
      { qNum:"5",  key:"CType",      type:"checkbox", opts:OPTS.CTYPE,      label:"(All that apply)" },
      { qNum:"6",  key:"ParentCol",  type:"radio",    opts:OPTS.AB,         label:"Are your parents college educated? (A=Yes, B=No)" },
      { qNum:"7",  key:"HSPrep",     type:"checkbox", opts:OPTS.HSPREP,     label:"(All that apply)" },
      { qNum:"8",  key:"Applicare",  type:"checkbox", opts:OPTS.APPLICARE,  label:"(Up to 3)", max:3 },
      { qNum:"9",  key:"LearnExp",   type:"checkbox", opts:OPTS.LEARNEXP,   label:"(Up to 5)", max:5 },
      { qNum:"10", key:"ColChar",    type:"checkbox", opts:OPTS.COLCHAR,    label:"(All that apply)" },
      { qNum:"11", key:"Profession", type:"checkbox", opts:OPTS.PROFESSION, label:"(All that apply)" },
      { qNum:"12", key:"_stateTriple", type:"stateTriple", labels:["12A","12B","12C"] },
      { qNum:"13", key:"_collegeVisits", type:"collegeVisits", prefix:"13" },
      { qNum:"14", key:"_majorGrid",  type:"majorGrid", prefix:"14" },
      { qNum:"15", key:"Expect", type:"checkbox", opts:OPTS.EXPECT, label:"Build Your Ideal College — Expect: (Darken up to FIVE)", max:5 },
      { qNum:"16", key:"Activity",   type:"checkbox", opts:OPTS.ACTIVITY,   label:"(All that apply)" },
      { qNum:"17", key:"Race",       type:"checkbox", opts:OPTS.RACE,       label:"(All that apply)" },
      { qNum:"19", key:"SensitiveOptin", type:"radio", opts:OPTS.YN, label:"Do you consent to participate in sensitive surveys? (Y/N)" }
    ]
  },


};

// ─── Default form data ────────────────────────────────────────────────────────
window.createDefaultFormData = function(surveyType) {
  return {
    SurveyYear:"2027", SurveyType:surveyType,
    EVID:"", Form:"",
    CType:[], ParentCol:"", HSPrep:[], Applicare:[], LearnExp:[],
    ColChar:[], Profession:[], Expect:[], Activity:[], Race:[],
    DeclaredStateI:"", DeclaredStateII:"", DeclaredStateIII:"",
    DeclaredName1:"", DeclaredState1:"", DeclaredVisit1:"",
    DeclaredName2:"", DeclaredState2:"", DeclaredVisit2:"",
    DeclaredName3:"", DeclaredState3:"", DeclaredVisit3:"",
    DeclaredName4:"", DeclaredState4:"", DeclaredVisit4:"",
    DeclaredName5:"", DeclaredState5:"", DeclaredVisit5:"",
    Major:[],
    SensitiveOptin:"",
    PartnerDefinedFieldFour:[],  PartnerDefinedFieldFive:[],
    PartnerDefinedFieldSix:[],   PartnerDefinedFieldSeven:[],
    PartnerDefinedFieldEight:[]
  };
};

window.getFormConfig = function(t){ return FORM_CONFIGS[t] || FORM_CONFIGS.FCCLA; };
