// form-handler.js  — hardened & fully fixed build

// ═══════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════
let currentFormType = null;
let formData = null;
let records = [];
let editIndex = -1;
let lastBulkKey = null;
let _submitInProgress = false;   // race-condition guard

const DOM = {
  selectorMode: document.getElementById("selectorMode"),
  formMode: document.getElementById("formMode"),
  formTypeSelect: document.getElementById("formTypeSelect"),
  loadFormBtn: document.getElementById("loadFormBtn"),
  viewRecordsBtn: document.getElementById("viewRecordsBtn"),
  backBtn: document.getElementById("backBtn"),
  formTitle: document.getElementById("formTitle"),
  formSubtitle: document.getElementById("formSubtitle"),
  formFields: document.getElementById("formFields"),
  recordTableBody: document.getElementById("recordTableBody"),
  submitBtn: document.getElementById("submitBtn"),
  clearBtn: document.getElementById("clearBtn"),
  downloadBtn: document.getElementById("downloadBtn"),
  deleteAllBtn: document.getElementById("deleteAllBtn")
};

// ═══════════════════════════════════════════════
// TOAST  (non-blocking notification)
// ═══════════════════════════════════════════════
function toast(msg, duration = 3000) {
  let el = document.getElementById("_toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "_toast";
    Object.assign(el.style, {
      position: "fixed", bottom: "24px", left: "50%",
      transform: "translateX(-50%)",
      background: "#1e1e2e", color: "#fff",
      padding: "13px 22px", borderRadius: "10px",
      zIndex: "99999", opacity: "0",
      transition: "opacity 0.3s",
      fontSize: "14px", maxWidth: "420px",
      textAlign: "center", lineHeight: "1.5",
      boxShadow: "0 4px 18px rgba(0,0,0,.25)"
    });
    document.body.appendChild(el);
  }
  el.innerHTML = msg;
  el.style.opacity = "1";
  clearTimeout(el._t);
  el._t = setTimeout(() => { el.style.opacity = "0"; }, duration);
}

// ═══════════════════════════════════════════════
// ART GRID (two related checkbox grids: Performing / Visual)
// This keeps the canonical combined key (e.g. PartnerDefinedFieldFive)
// in sync for export while storing per-subgroup selections separately.
// ═══════════════════════════════════════════════
function mkArtGrid(title, key, optsPerf, optsVis, desc) {
  const w = document.createElement("div");
  w.className = "field-group";

  const titleRow = document.createElement("div");
  titleRow.className = "cb-title-row";
  const lbl = document.createElement("span");
  lbl.className = "field-label cb-title-text";
  lbl.textContent = title;
  titleRow.appendChild(lbl);

  const descEl = document.createElement("p");
  descEl.className = "field-description";
  descEl.textContent = desc || "";
  w.append(titleRow, descEl);

  const container = document.createElement("div");
  container.style.display = "flex";
  container.style.flexDirection = "column"; // stack subgrids vertically
  container.style.gap = "12px";

  const makeSubGrid = (subKeySuffix, opts, heading) => {
    const subKey = `${key}_${subKeySuffix}`;
    if (!Array.isArray(formData[subKey])) formData[subKey] = [];

    const box = document.createElement("div");
    box.style.flex = "1 1 100%";
    box.style.width = "100%";
    box.style.marginBottom = "12px";
    const h = document.createElement("label");
    h.className = "field-label"; h.textContent = heading;
    // small range hint (e.g. A-J)
    const rangeHint = document.createElement("div");
    rangeHint.style.fontSize = "13px";
    rangeHint.style.color = "var(--text-secondary)";
    rangeHint.style.marginBottom = "6px";
    const first = opts[0] || ""; const last = opts[opts.length - 1] || "";
    rangeHint.textContent = `${first}-${last}`;
    const grid = document.createElement("div");
    grid.className = "checkbox-grid";
    grid.dataset.key = subKey;

    opts.forEach(opt => {
      const cbLbl = document.createElement("label");
      cbLbl.className = "checkbox-label";
      const cb = document.createElement("input");
      cb.type = "checkbox"; cb.value = opt;

      if ((formData[subKey] || []).includes(opt)) { cb.checked = true; cbLbl.classList.add("sel"); }

      cb.addEventListener("change", function () {
        if (this.checked) {
          if (!formData[subKey].includes(opt)) formData[subKey].push(opt);
          cbLbl.classList.add("sel");
        } else {
          formData[subKey] = formData[subKey].filter(v => v !== opt);
          cbLbl.classList.remove("sel");
        }
        // keep canonical combined key in sync
        formData[key] = Array.from(new Set([...(formData[`${key}_Perf`] || []), ...(formData[`${key}_Vis`] || [])]));
        updateRecordsDisplay();
      });

      // CTRL+click to select all within this subgroup
      cbLbl.addEventListener("click", function (e) {
        if (!e.ctrlKey) return;
        e.preventDefault(); e.stopPropagation();
        formData[subKey] = [];
        grid.querySelectorAll('input[type="checkbox"]').forEach(boxEl => {
          const value = boxEl.value;
          formData[subKey].push(value); boxEl.checked = true;
          boxEl.closest(".checkbox-label").classList.add("sel");
        });
        // sync combined key
        formData[key] = Array.from(new Set([...(formData[`${key}_Perf`] || []), ...(formData[`${key}_Vis`] || [])]));
        updateRecordsDisplay();
        lastBulkKey = subKey;
        toast(`All options selected for ${heading}`);
      });

      cbLbl.append(cb, document.createTextNode(" " + opt));
      grid.appendChild(cbLbl);
    });

    box.append(h, rangeHint, grid);
    return box;
  };

  const perfGrid = makeSubGrid("Perf", optsPerf, "Performing Arts");
  const visGrid = makeSubGrid("Vis", optsVis, "Visual Arts");

  container.append(perfGrid, visGrid);
  w.appendChild(container);
  DOM.formFields.appendChild(w);
}


// ═══════════════════════════════════════════════
// MODAL  (blocking confirmation)
// ═══════════════════════════════════════════════
function showModal({ title, body, okLabel = "OK", cancelLabel = "Cancel", onOk, onCancel }) {
  // Remove any stale modal
  const old = document.getElementById("_sysModal");
  if (old) old.remove();

  const overlay = document.createElement("div");
  overlay.id = "_sysModal";
  Object.assign(overlay.style, {
    position: "fixed", inset: "0",
    background: "rgba(0,0,0,.55)", zIndex: "100000",
    display: "flex", alignItems: "center", justifyContent: "center"
  });

  overlay.innerHTML = `
    <div style="background:#fff;border-radius:14px;padding:34px 30px;
                max-width:440px;width:90%;box-shadow:0 12px 40px rgba(0,0,0,.25);
                font-family:inherit">
      <h3 style="margin:0 0 12px;font-size:18px;color:#222">${title}</h3>
      <p  style="margin:0 0 24px;font-size:14px;color:#555;line-height:1.6">${body}</p>
      <div style="display:flex;gap:12px;justify-content:flex-end">
        ${cancelLabel ? `<button id="_modalCancel"
          style="padding:10px 22px;border-radius:8px;border:1.5px solid #ddd;
                 background:#f5f5f5;cursor:pointer;font-size:14px;font-weight:600"
          >${cancelLabel}</button>` : ""}
        <button id="_modalOk"
          style="padding:10px 22px;border-radius:8px;border:none;
                 background:#667eea;color:#fff;cursor:pointer;
                 font-size:14px;font-weight:600"
          >${okLabel}</button>
      </div>
    </div>`;

  document.body.appendChild(overlay);

  document.getElementById("_modalOk").onclick = () => {
    overlay.remove();
    if (onOk) onOk();
  };
  const cancelBtn = document.getElementById("_modalCancel");
  if (cancelBtn) {
    cancelBtn.onclick = () => {
      overlay.remove();
      if (onCancel) onCancel();
    };
  }
}

// ═══════════════════════════════════════════════
// PAGE-REFRESH GUARD   (Requirement 5)
// ═══════════════════════════════════════════════
function installRefreshGuard() {
  // beforeunload shows the browser's native dialog (modern browsers ignore custom msg)
  window.addEventListener("beforeunload", e => {
    if (records.length === 0 && (!formData || (!formData.EVID && !formData.Form))) return;
    e.preventDefault();
    e.returnValue = ""; // required for Chrome
  });
}

// ═══════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════
function init() {
  loadStoredRecords();
  installRefreshGuard();

  DOM.formTypeSelect.addEventListener("change", () => {
    DOM.loadFormBtn.disabled = !DOM.formTypeSelect.value;
    // Reset all form state immediately when the user picks a different type,
    // so the previous form never bleeds into the next one.
    currentFormType = null;
    formData = null;
    editIndex = -1;
    lastBulkKey = null;
    DOM.formFields.innerHTML = "";
    DOM.formMode.classList.add("hidden");
    DOM.selectorMode.classList.remove("hidden");
  });

  DOM.loadFormBtn.addEventListener("click", loadSelectedForm);
  DOM.viewRecordsBtn.addEventListener("click", viewAllRecords);
  DOM.backBtn.addEventListener("click", backToSelector);
  DOM.submitBtn.addEventListener("click", submitForm);
  DOM.clearBtn.addEventListener("click", clearForm);
  DOM.downloadBtn.addEventListener("click", () => downloadExcel(null));   // bulk (all visible records)
  DOM.deleteAllBtn.addEventListener("click", deleteAllData);

  // SHIFT+5 → deselect last bulk section
  document.addEventListener("keydown", e => {
    if ((e.shiftKey && e.key === "5") || e.key === "%") {
      if (!lastBulkKey) return;
      formData[lastBulkKey] = [];
      const grid = document.querySelector(`.checkbox-grid[data-key="${lastBulkKey}"], .radio-group[data-key="${lastBulkKey}"]`);
      if (grid) {
        grid.querySelectorAll('input[type="checkbox"]').forEach(cb => {
          cb.checked = false;
          cb.closest(".checkbox-label").classList.remove("sel");
        });
      }
      updateRecordsDisplay();
      toast(`Deselected all in ${lastBulkKey}`);
    }
  });

  updateRecordsDisplay();
}

// ═══════════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════════
function loadSelectedForm() {
  const t = DOM.formTypeSelect.value;
  if (!t) return;

  // Dynamically load the per-template config file from its own folder,
  // then boot the form once the script is ready.
  // loadTemplateConfig() is defined in index.html's inline loader script.
  if (typeof loadTemplateConfig === "function") {
    loadTemplateConfig(t, function () {
      _initFormAfterConfig(t);
    });
  } else {
    // Fallback: config already on page (original single-file mode)
    _initFormAfterConfig(t);
  }
}

function _initFormAfterConfig(t) {
  currentFormType = t;
  const cfg = getFormConfig(t);
  formData = createDefaultFormData(cfg.surveyType);
  editIndex = -1;
  lastBulkKey = null;

  DOM.formTitle.textContent = cfg.displayName;
  DOM.formSubtitle.textContent = "2027 Academic Year Response Survey";

  renderForm();
  updateRecordsDisplay();

  DOM.selectorMode.classList.add("hidden");
  DOM.formMode.classList.remove("hidden");
}

function backToSelector() {
  // Full reset so the next form loaded starts completely fresh
  currentFormType = null;
  formData = null;
  editIndex = -1;
  lastBulkKey = null;
  DOM.formFields.innerHTML = "";
  DOM.formTypeSelect.value = "";
  DOM.loadFormBtn.disabled = true;
  // Restore form-mode action buttons
  DOM.submitBtn.style.display = "";
  DOM.clearBtn.style.display = "";
  DOM.downloadBtn.style.display = "";
  DOM.deleteAllBtn.style.display = "";
  DOM.selectorMode.classList.remove("hidden");
  DOM.formMode.classList.add("hidden");
}

function viewAllRecords() {
  if (!records.length) { alert("No records stored yet."); return; }
  // Enter formMode in "records-only" view — no form questions, just the table
  currentFormType = null;
  formData = null;
  editIndex = -1;

  DOM.formTitle.textContent = "All Stored Records";
  DOM.formSubtitle.textContent = "2027 Academic Year Response Survey";

  // Show a simple summary instead of form questions
  DOM.formFields.innerHTML = "";
  const info = document.createElement("p");
  info.style.cssText = "padding:12px 0;color:var(--text-secondary);font-size:14px;";
  info.textContent = `${records.length} record(s) stored across all form types. Use the ⬇ Excel button on each row to download individually, or "Download Excel" to export all records.`;
  DOM.formFields.appendChild(info);

  // Hide submit / clear / delete-all (they need an active form)
  DOM.submitBtn.style.display = "none";
  DOM.clearBtn.style.display = "none";
  DOM.deleteAllBtn.style.display = "none";

  updateRecordsDisplay();
  DOM.selectorMode.classList.add("hidden");
  DOM.formMode.classList.remove("hidden");
}

// ═══════════════════════════════════════════════
// RENDER FORM
// ═══════════════════════════════════════════════
function renderForm() {
  DOM.formFields.innerHTML = "";
  const cfg = getFormConfig(currentFormType);

  mkSectionTitle("Survey Information");
  mkStatic("Survey Year", "2027");
  mkStatic("Survey Type", cfg.displayName);
  mkInput("EVID", "EVID", "EVID", 9, false);
  mkInput("Form", "Form Number", "Form", 5, true);
  mkSectionTitle("Survey Questions");

  let qCounter = 0;
  cfg.questions.forEach(q => {
    if (!q || q.key === "_unused") return;
    qCounter++;
    const title = q.qNum ? `Q${q.qNum}` : `Q${qCounter}`;
    switch (q.type) {
      case "checkbox": mkCheckbox(title, q.key, q.opts, q.label, q.max); break;
      case "artGrid": mkArtGrid(title, q.key, q.optsPerf, q.optsVis, q.label); break;
      case "radio": mkRadio(title, q.key, q.opts, q.label); break;
      case "stateTriple": mkStateTriple(title, q.labels); break;
      case "collegeVisits": mkCollegeVisits(title, q.prefix, q.max); break;
      case "majorGrid": mkButtonGrid(`${title} — Major Preferences`, q.opts || OPTS.MAJOR, "Major"); break;
      case "expectGrid": mkButtonGrid(`${title} — Expect`, q.opts || OPTS.EXPECT, "Expect"); break;
      case "denomGrid": mkButtonGrid(`${title} — Additional Preferences`, q.opts || OPTS.DENOM, "Denom"); break;
      case "text": mkTextInput(title, q.key, q.label); break;
    }
  });
}

// ═══════════════════════════════════════════════
// SECTION TITLE
// ═══════════════════════════════════════════════
function mkSectionTitle(text) {
  const h = document.createElement("h2");
  h.className = "section-title";
  h.textContent = text;
  DOM.formFields.appendChild(h);
}

// ═══════════════════════════════════════════════
// STATIC FIELD
// ═══════════════════════════════════════════════
function mkStatic(lbl, val) {
  const wrap = document.createElement("div");
  wrap.className = "field-group";
  const l = document.createElement("label");
  l.className = "field-label";
  l.textContent = lbl;
  const box = document.createElement("div");
  box.className = "static-box";
  box.textContent = val;
  wrap.append(l, box);
  DOM.formFields.appendChild(wrap);
}

// ═══════════════════════════════════════════════
// INPUT FIELD  (numbers only)
// ═══════════════════════════════════════════════
function mkInput(lbl, placeholder, key, max, numberOnly = false) {
  const wrap = document.createElement("div");
  wrap.className = "field-group";
  const l = document.createElement("label");
  l.className = "field-label";
  l.textContent = lbl;
  const inp = document.createElement("input");
  inp.type = "text";
  inp.className = "text-input";
  inp.placeholder = placeholder;
  // maxLength kept ONLY for EVID and Form fields
  if (key === "EVID" || key === "Form") {
    inp.maxLength = max;
  }
  inp.value = formData[key] || "";
  inp.addEventListener("input", () => {
    if (key === "EVID") {
      inp.value = inp.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    } else if (numberOnly) {
      inp.value = inp.value.replace(/\D/g, "");
    }
    formData[key] = inp.value;
    updateRecordsDisplay();
  });
  wrap.append(l, inp);
  DOM.formFields.appendChild(wrap);
}

// ═══════════════════════════════════════════════
// CHECKBOX SECTION
// ═══════════════════════════════════════════════
function mkCheckbox(title, key, opts, desc, max) {
  const w = document.createElement("div");
  w.className = "field-group";

  const titleRow = document.createElement("div");
  titleRow.className = "cb-title-row";
  const lbl = document.createElement("span");
  lbl.className = "field-label cb-title-text";
  lbl.textContent = title;
  titleRow.appendChild(lbl);

  const descEl = document.createElement("p");
  descEl.className = "field-description";
  descEl.textContent = desc || "";
  w.append(titleRow, descEl);

  const grid = document.createElement("div");
  grid.className = "checkbox-grid";
  grid.dataset.key = key;

  opts.forEach(opt => {
    const cbLbl = document.createElement("label");
    cbLbl.className = "checkbox-label";
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.value = opt;

    if ((formData[key] || []).includes(opt)) {
      cb.checked = true;
      cbLbl.classList.add("sel");
    }

    cb.addEventListener("change", function () {
      if (this.checked) {
        if (!formData[key].includes(opt)) {
    formData[key].push(opt);

    formData[key].sort((a, b) =>
        a.toString().localeCompare(b.toString(), undefined, {
            numeric: true,
            sensitivity: "base"
        })
    );
}
        cbLbl.classList.add("sel");
      } else {
        formData[key] = formData[key].filter(v => v !== opt);
        cbLbl.classList.remove("sel");
      }
      updateRecordsDisplay();
    });

    // CTRL+click → select all in section (up to max if max is specified)
    cbLbl.addEventListener("click", function (e) {
      if (!e.ctrlKey) return;
      e.preventDefault(); e.stopPropagation();

      formData[key] = [];
      let count = 0;
      grid.querySelectorAll('input[type="checkbox"]').forEach(box => {
        if (!max || count < max) {
          const value = box.value;
          formData[key].push(value);
          box.checked = true;
          box.closest(".checkbox-label").classList.add("sel");
          count++;
        } else {
          box.checked = false;
          box.closest(".checkbox-label").classList.remove("sel");
        }
      });
      lastBulkKey = key;
      updateRecordsDisplay();
      if (max && opts.length > max) {
        toast(`Selected first ${max} options for ${title}`);
      } else {
        toast(`All options selected for ${title}`);
      }
    });

    cbLbl.append(cb, document.createTextNode(" " + opt));
    grid.appendChild(cbLbl);
  });

  w.appendChild(grid);
  DOM.formFields.appendChild(w);
}

// ═══════════════════════════════════════════════
// RADIO SECTION
//   2 options  → single-select (yes/no style)
//   3+ options → multi-select
// ═══════════════════════════════════════════════
function mkRadio(title, key, opts, label) {
  const singleSelect = opts.length <= 2;

  // Normalise stored value to match the mode
  if (singleSelect) {
    if (Array.isArray(formData[key])) formData[key] = formData[key][0] || "";
    if (formData[key] === undefined) formData[key] = "";
  } else {
    if (!Array.isArray(formData[key])) {
      formData[key] = formData[key] ? [formData[key]] : [];
    }
  }

  const wrap = document.createElement("div");
  wrap.className = "field-group";
  const lbl = document.createElement("label");
  lbl.className = "field-label";
  lbl.textContent = title;
  const desc = document.createElement("p");
  desc.className = "field-description";
  desc.textContent = label || "";
  const group = document.createElement("div");
  group.className = "radio-group";
  group.dataset.key = key;

  opts.forEach(opt => {
    const cbVal = opt.v || opt;
    const cbLbl = document.createElement("label");
    cbLbl.className = "checkbox-label";
    const cb = document.createElement("input");
    cb.type = "checkbox"; cb.name = key; cb.value = cbVal;

    const isSelected = singleSelect
      ? formData[key] === cbVal
      : formData[key].includes(cbVal);
    if (isSelected) { cb.checked = true; cbLbl.classList.add("sel"); }

    cb.addEventListener("change", function () {
      if (singleSelect) {
        if (this.checked) {
          formData[key] = cbVal;
          group.querySelectorAll('input[type="checkbox"]').forEach(box => {
            if (box !== cb) { box.checked = false; box.closest(".checkbox-label").classList.remove("sel"); }
          });
          cbLbl.classList.add("sel");
        } else {
          formData[key] = "";
          cbLbl.classList.remove("sel");
        }
      } else {
        if (this.checked) {
          if (!formData[key].includes(cbVal)) {
    formData[key].push(cbVal);

    formData[key].sort((a, b) =>
        a.toString().localeCompare(b.toString(), undefined, {
            numeric: true,
            sensitivity: "base"
        })
    );
}
          cbLbl.classList.add("sel");
        } else {
          formData[key] = formData[key].filter(v => v !== cbVal);
          cbLbl.classList.remove("sel");
        }
      }
      updateRecordsDisplay();
    });

    // CTRL+click → select all (multi-select mode only)
    if (!singleSelect) {
      cbLbl.addEventListener("click", function (e) {
        if (!e.ctrlKey) return;
        e.preventDefault(); e.stopPropagation();
        formData[key] = [];
        group.querySelectorAll('input[type="checkbox"]').forEach(box => {
          formData[key].push(box.value);
          box.checked = true;
          box.closest(".checkbox-label").classList.add("sel");
        });
        lastBulkKey = key;
        updateRecordsDisplay();
        toast(`All options selected for ${title}`);
      });
    }

    cbLbl.append(cb, document.createTextNode(" " + (opt.l || opt)));
    group.appendChild(cbLbl);
  });

  wrap.append(lbl, desc, group);
  DOM.formFields.appendChild(wrap);
}

// ═══════════════════════════════════════════════
// STATE TRIPLE
// ═══════════════════════════════════════════════
function mkStateTriple(title, labels) {
  const wrap = document.createElement("div");
  wrap.className = "field-group";
  const lbl = document.createElement("label");
  lbl.className = "field-label"; lbl.textContent = title;
  wrap.appendChild(lbl);

  // Map label positions to canonical storage keys
  const storageKeys = ["DeclaredStateI", "DeclaredStateII", "DeclaredStateIII"];

  labels.forEach((labelText, idx) => {
    const storageKey = storageKeys[idx];
    const stateWrap = document.createElement("div");
    stateWrap.style.marginBottom = "12px";
    const stateLabel = document.createElement("label");
    stateLabel.className = "field-label"; stateLabel.style.fontSize = "14px";
    stateLabel.textContent = `${labelText} (State Code)`;
    const stateInput = document.createElement("input");
    stateInput.type = "text"; stateInput.className = "state-input text-input";
    stateInput.placeholder = "e.g., CA, NY, TX"; stateInput.maxLength = 2;
    stateInput.value = formData[storageKey] || ""; stateInput.style.textTransform = "uppercase";

    stateInput.addEventListener("input", (e) => {
      let val = e.target.value.toUpperCase().replace(/[^A-Z]/g, "");
      e.target.value = val;
      stateInput.style.borderColor = (val && !US_STATES.includes(val)) ? "#ff6b6b" : "";
      formData[storageKey] = val; updateRecordsDisplay();
    });
    stateInput.addEventListener("blur", (e) => {
      const val = e.target.value.trim();
      if (val && !US_STATES.includes(val)) {
        alert(`Invalid state code: ${val}. Please enter a valid US state code.`);
        e.target.value = ""; formData[storageKey] = ""; updateRecordsDisplay();
      }
    });

    stateWrap.append(stateLabel, stateInput);
    wrap.appendChild(stateWrap);
  });

  DOM.formFields.appendChild(wrap);
}

// ═══════════════════════════════════════════════
// COLLEGE VISITS
// ═══════════════════════════════════════════════
function mkCollegeVisits(title, prefix, max) {
  const wrap = document.createElement("div");
  wrap.className = "field-group";
  const lbl = document.createElement("label");
  lbl.className = "field-label"; lbl.textContent = title;
  wrap.appendChild(lbl);

  const limit = max || 5;
  for (let i = 1; i <= limit; i++) {
    const nameKey = `DeclaredName${i}`;
    const stateKey = `DeclaredState${i}`;
    const visitKey = `DeclaredVisit${i}`;

    const visitWrap = document.createElement("div");
    Object.assign(visitWrap.style, {
      marginBottom: "18px", padding: "14px",
      background: "var(--light-gray)", borderRadius: "6px",
      borderLeft: "4px solid var(--primary-color)"
    });

    const numLabel = document.createElement("label");
    numLabel.className = "field-label";
    Object.assign(numLabel.style, { fontSize: "13px", marginBottom: "10px" });
    numLabel.textContent = `College ${i}`;

    const nameLabel = document.createElement("label");
    nameLabel.className = "field-label"; nameLabel.style.fontSize = "13px";
    nameLabel.textContent = "College Name";
    const nameInput = document.createElement("input");
    nameInput.type = "text"; nameInput.className = "text-input";
    nameInput.placeholder = "Enter college name";
    nameInput.value = formData[nameKey] || ""; nameInput.style.marginBottom = "8px";

    nameInput.addEventListener("input", (e) => {
      formData[nameKey] = e.target.value;
      updateRecordsDisplay();
    });

    const stateLabel = document.createElement("label");
    stateLabel.className = "field-label"; stateLabel.style.fontSize = "13px";
    stateLabel.textContent = "State Code";
    const stateInput = document.createElement("input");
    stateInput.type = "text"; stateInput.className = "state-input text-input";
    stateInput.placeholder = "e.g., CA"; stateInput.maxLength = 2;
    stateInput.value = formData[stateKey] || ""; stateInput.style.textTransform = "uppercase";
    stateInput.style.marginBottom = "10px";
    stateInput.addEventListener("input", (e) => {
      let val = e.target.value.toUpperCase().replace(/[^A-Z]/g, "");
      e.target.value = val;
      stateInput.style.borderColor = (val && !US_STATES.includes(val)) ? "#ff6b6b" : "";
      formData[stateKey] = val; updateRecordsDisplay();
    });
    stateInput.addEventListener("blur", (e) => {
      const val = e.target.value.trim();
      if (val && !US_STATES.includes(val)) {
        alert(`Invalid state code: ${val}. Please enter a valid US state code.`);
        e.target.value = ""; formData[stateKey] = ""; updateRecordsDisplay();
      }
    });

    const visitLabel = document.createElement("label");
    visitLabel.className = "field-label"; visitLabel.style.fontSize = "13px";
    visitLabel.textContent = "Visited (Y/N)";
    const visitSelect = document.createElement("select");
    visitSelect.className = "form-select"; visitSelect.style.marginBottom = "0";
    [["", "-- Select --"], ["Y", "Yes"], ["N", "No"]].forEach(([v, t]) => {
      const o = document.createElement("option"); o.value = v; o.textContent = t;
      visitSelect.appendChild(o);
    });
    visitSelect.value = formData[visitKey] || "";
    visitSelect.addEventListener("change", (e) => { formData[visitKey] = e.target.value; updateRecordsDisplay(); });

    visitWrap.append(numLabel, nameLabel, nameInput, stateLabel, stateInput, visitLabel, visitSelect);
    wrap.appendChild(visitWrap);
  }
  DOM.formFields.appendChild(wrap);
}

// ═══════════════════════════════════════════════
// TEXT INPUT  (free-form fields, e.g. Email)
// ═══════════════════════════════════════════════
function mkTextInput(title, key, desc) {
  const wrap = document.createElement("div");
  wrap.className = "field-group";
  const l = document.createElement("label");
  l.className = "field-label";
  l.textContent = title;
  const descEl = document.createElement("p");
  descEl.className = "field-description";
  descEl.textContent = desc || "";
  const inp = document.createElement("input");
  inp.type = "text";
  inp.className = "text-input";
  inp.placeholder = "Type here…";
  inp.value = formData[key] || "";
  inp.addEventListener("input", () => {
    formData[key] = inp.value;
    updateRecordsDisplay();
  });
  wrap.append(l, descEl, inp);
  DOM.formFields.appendChild(wrap);
}

// ═══════════════════════════════════════════════
// BUTTON GRID  (Majors / Expect / Denom)
// ═══════════════════════════════════════════════
function mkButtonGrid(title, opts, arrayKey) {
  if (!Array.isArray(formData[arrayKey])) formData[arrayKey] = [];
  const wrap = document.createElement("div");
  wrap.className = "field-group";
  const l = document.createElement("label");
  l.className = "field-label"; l.textContent = title;
  const grid = document.createElement("div");
  grid.className = "button-grid";

  opts.forEach(v => {
    const btn = document.createElement("button");
    btn.type = "button"; btn.className = "major-btn"; btn.textContent = v;
    if (formData[arrayKey].includes(v)) btn.classList.add("active");
    btn.addEventListener("click", () => {
      if (!Array.isArray(formData[arrayKey])) formData[arrayKey] = [];
      if (formData[arrayKey].includes(v)) {
        formData[arrayKey] = formData[arrayKey].filter(x => x !== v);
        btn.classList.remove("active");
      } else {
        formData[arrayKey].push(v);
        btn.classList.add("active");
      }
      updateRecordsDisplay();
    });
    grid.appendChild(btn);
  });

  wrap.append(l, grid);
  DOM.formFields.appendChild(wrap);
}

// ═══════════════════════════════════════════════
// SUBMIT  — saves record THEN exports it
// ═══════════════════════════════════════════════
function submitForm() {
  if (_submitInProgress) return;          // debounce / race guard
  if (!formData.EVID || !formData.Form) {
    alert("Please fill EVID and Form.");
    return;
  }

  _submitInProgress = true;

  // 1. Deep-clone current formData and TAG with exact FormKey (e.g. "ART", "BPA")
  //    so downloads are ALWAYS scoped to this exact form, not just SurveyType.
  const snap = JSON.parse(JSON.stringify(formData));
  snap.FormKey = currentFormType;   // ← THE ONE KEY CONDITION: always store the form name

  if (editIndex >= 0) {
    records[editIndex] = snap;
  } else {
    records.push(snap);
  }

  // 2. Persist to localStorage synchronously BEFORE any export
  saveStoredRecords();

  // 3. Update UI
  updateRecordsDisplay();

  // 4. Release guard, clear form
  _submitInProgress = false;

  toast("✅ Survey saved successfully!");

  clearForm();
}

// ═══════════════════════════════════════════════
// CLEAR
// ═══════════════════════════════════════════════
function clearForm() {
  formData = createDefaultFormData(getFormConfig(currentFormType).surveyType);
  editIndex = -1;
  renderForm();
  updateRecordsDisplay();
}

// ═══════════════════════════════════════════════
// DELETE ALL
// ═══════════════════════════════════════════════
function deleteAllData() {
  showModal({
    title: "Delete All Records",
    body: "This will permanently delete all records for this form type. This cannot be undone.",
    okLabel: "Delete All",
    cancelLabel: "Cancel",
    onOk: () => {
      // Filter strictly by FormKey — never touch other forms' data
      records = records.filter(r => r.FormKey !== currentFormType);
      saveStoredRecords();
      updateRecordsDisplay();
      toast("🗑️ All records deleted for this form type.");
    }
  });
}

// ═══════════════════════════════════════════════
// RECORDS — localStorage persistence  (Fix #4)
// Data model: records[] stored under key "surveyRecords27"
// Each record = full formData snapshot + SurveyYear + SurveyType
// ═══════════════════════════════════════════════
function loadStoredRecords() {
  try {
    records = JSON.parse(localStorage.getItem("surveyRecords27") || "[]");
  } catch {
    records = [];
  }
}

function saveStoredRecords() {
  localStorage.setItem("surveyRecords27", JSON.stringify(records));
}

// ═══════════════════════════════════════════════
// RECORDS TABLE  (Fix #2 — adds per-row Download btn)
// ═══════════════════════════════════════════════
function updateRecordsDisplay() {
  if (!DOM.recordTableBody) return;

  // MAIN CONDITION: filter strictly by FormKey (exact form name like "ART", "BPA")
  // so ART only shows ART records, BPA only shows BPA records — never cross-contaminate
  let filteredRecords = records;
  if (currentFormType) {
    filteredRecords = records.filter(r => r.FormKey === currentFormType);
  }

  if (!filteredRecords.length) {
    DOM.recordTableBody.innerHTML =
      `<tr><td colspan="6" class="empty-record">No records yet.</td></tr>`;
    return;
  }

  // Update header to include Download column
  const thead = DOM.recordTableBody.closest("table").querySelector("thead tr");
  if (thead && thead.children.length === 5) {
    thead.innerHTML = "<th>#</th><th>EVID</th><th>Form</th><th>Survey Type</th><th>Download</th><th>Actions</th>";
  }

  DOM.recordTableBody.innerHTML = filteredRecords.map((r, i) => {
    const actualIndex = records.indexOf(r);
    return `
    <tr>
      <td>${i + 1}</td>
      <td>${r.EVID || "-"}</td>
      <td>${r.Form || "-"}</td>
      <td>${r.SurveyType || "-"}</td>
      <td>
        <button class="action-btn dl-btn" onclick="downloadExcel(${actualIndex})"
          title="Download this entry as Excel">⬇ Excel</button>
      </td>
      <td>
        <button class="action-btn" onclick="editRec(${actualIndex})">Edit</button>
        <button class="action-btn delete" onclick="delRec(${actualIndex})">Delete</button>
      </td>
    </tr>`;
  }).join("");
}

window.editRec = function (i) {
  formData = JSON.parse(JSON.stringify(records[i]));
  editIndex = i;
  renderForm();
};

window.delRec = function (i) {
  showModal({
    title: "Delete Record",
    body: `Delete record for EVID <strong>${records[i]?.EVID || i + 1}</strong>? This cannot be undone.`,
    okLabel: "Delete",
    cancelLabel: "Cancel",
    onOk: () => {
      records.splice(i, 1);
      saveStoredRecords();
      updateRecordsDisplay();
      toast("🗑️ Record deleted.");
    }
  });
};

// ═══════════════════════════════════════════════
// EXCEL EXPORT  (Fix #1, #2, #3)
//   downloadExcel(null)  → exports all visible records  (bulk "Download Excel" btn)
//   downloadExcel(index) → exports single record at records[index]
// ═══════════════════════════════════════════════
// ─── Question key → column header mapping ─────────────────────────────────────
// Built dynamically from the loaded config when a form is open.
// Maps data keys (e.g. "PartnerDefinedFieldFour") → "Q1", "CType" → "Q5", etc.
let _questionKeyToHeader = {};

function buildQuestionHeaderMap() {
  if (!currentFormType) return;
  const cfg = getFormConfig(currentFormType);
  _questionKeyToHeader = {};
  let qCounter = 0;
  cfg.questions.forEach(q => {
    if (!q || q.key === "_unused") return;
    qCounter++;
    const header = q.qNum ? `Q${q.qNum}` : `Q${qCounter}`;
    // Map the primary key
    if (q.key && !q.key.startsWith("_")) {
      _questionKeyToHeader[q.key] = header;
    }
    // Special composite types — map all their sub-keys
    if (q.type === "stateTriple") {
      _questionKeyToHeader["DeclaredStateI"] = `${header}A`;
      _questionKeyToHeader["DeclaredStateII"] = `${header}B`;
      _questionKeyToHeader["DeclaredStateIII"] = `${header}C`;
    }
    if (q.type === "collegeVisits") {
      const limit = q.max || 5;
      for (let i = 1; i <= limit; i++) {
        _questionKeyToHeader[`DeclaredName${i}`] = `${header}_College${i}_Name`;
        _questionKeyToHeader[`DeclaredState${i}`] = `${header}_College${i}_State`;
        _questionKeyToHeader[`DeclaredVisit${i}`] = `${header}_College${i}_Visit`;
      }
    }
    if (q.type === "majorGrid") {
      _questionKeyToHeader["Major1"] = `${header}_Major1`;
      _questionKeyToHeader["Major2"] = `${header}_Major2`;
      _questionKeyToHeader["Major3"] = `${header}_Major3`;
    }
    if (q.type === "expectGrid") {
      for (let i = 1; i <= 5; i++) {
        _questionKeyToHeader[`Expect${i}`] = `${header}_Expect${i}`;
      }
      _questionKeyToHeader["Expect"] = `${header}_Expect`;
    }
    if (q.type === "denomGrid") {
      _questionKeyToHeader["Denom1"] = `${header}_Denom1`;
      _questionKeyToHeader["Denom2"] = `${header}_Denom2`;
    }
    if (q.type === "artGrid") {
      _questionKeyToHeader[`${q.key}_Performing`] = `${header}_Performing`;
      _questionKeyToHeader[`${q.key}_Visual`] = `${header}_Visual`;
      _questionKeyToHeader[`${q.key}_Perf`] = `${header}_Performing`;
      _questionKeyToHeader[`${q.key}_Vis`] = `${header}_Visual`;
    }
  });
}

// Fixed header names for non-question fields
const FIXED_HEADERS = {
  "SurveyYear": "SurveyYear",
  "SurveyType": "SurveyType",
  "EVID": "EVID",
  "Form": "Form"
};

// Keys to skip in export (internal sub-keys already merged into parent)
const SKIP_KEYS = new Set([
  "PartnerDefinedFieldFive_Performing", "PartnerDefinedFieldFive_Visual",
  "PartnerDefinedFieldFive_Perf", "PartnerDefinedFieldFive_Vis",
  "PartnerDefinedFieldFour_Perf", "PartnerDefinedFieldFour_Vis",
  "PartnerDefinedFieldSix_Perf", "PartnerDefinedFieldSix_Vis",
  "PartnerDefinedFieldSeven_Perf", "PartnerDefinedFieldSeven_Vis",
  "PartnerDefinedFieldEight_Perf", "PartnerDefinedFieldEight_Vis",
  "PartnerDefinedFieldNine_Perf", "PartnerDefinedFieldNine_Vis"
]);

// Wrapper: temporarily set currentFormType to the record's own FormKey,
// build the row, then restore. Lets us export records from any form type
// regardless of which form is currently open.
function recordToRowForKey(rec, formKey) {
  const prev = currentFormType;
  currentFormType = formKey || rec.FormKey || prev;
  const row = recordToRow(rec);
  currentFormType = prev;
  return row;
}

function recordToRow(rec) {
  buildQuestionHeaderMap();

  // Build a fully-ordered list of [header, value] pairs so columns always
  // appear in the same sequence: fixed fields → Q1, Q2, Q3... → remainder
  const ordered = [];
  const seen = new Set(); // tracks column header names already emitted
  const processedKeys = new Set(); // tracks raw record keys already exported

  // Single-value column
  const addCol = (header, rawKey) => {
    if (seen.has(header)) return;
    seen.add(header);
    if (rawKey !== undefined) processedKeys.add(rawKey);
    let v = (rawKey !== undefined) ? rec[rawKey] : rec[header];
    if (v === undefined || v === null) v = "";
    if (Array.isArray(v)) {

    let sortedValues = [...v].sort((a, b) =>
        a.toString().localeCompare(b.toString(), undefined, {
            numeric: true,
            sensitivity: "base"
        })
    );

      const qNumber = parseInt(header.replace("Q", ""), 10);
    // Q8 = first 3 options
    if (header === "Q8") {
        sortedValues = sortedValues.slice(0, 3);
    }

    // Q9 = first 5 options
    if (header === "Q9") {
        sortedValues = sortedValues.slice(0, 5);
    }

    v = sortedValues.join(",");
}
    ordered.push([header, v]);
  };

  // Grid split: emit numbered slots (Major1/Major2… Expect1… Denom1/Denom2)
  const addSlottedCols = (h, rawKey, prefix, maxSlots) => {
    seen.add(h);
    processedKeys.add(rawKey);
    const stored = rec[rawKey];
    let arr = Array.isArray(stored) ? stored : (stored ? [stored] : []);
    if (rawKey === "Denom") {
      arr = [...arr].sort();
    }
    for (let i = 1; i <= maxSlots; i++) {
      const col = `${h}_${prefix}${i}`;
      if (seen.has(col)) return;
      seen.add(col);
      ordered.push([col, arr[i - 1] !== undefined ? arr[i - 1] : ""]);
    }
  };

  // 1. Fixed fields always first
  addCol("SurveyYear", "SurveyYear");
  addCol("SurveyType", "SurveyType");
  addCol("EVID", "EVID");
  addCol("Form", "Form");

  // 2. Walk questions in config order → emit columns in Q1, Q2, Q3 sequence
  if (currentFormType) {
    const cfg = getFormConfig(currentFormType);
    let qCounter = 0;
    cfg.questions.forEach(q => {
      if (!q || q.key === "_unused") return;
      qCounter++;
      const h = q.qNum ? `Q${q.qNum}` : `Q${qCounter}`;

      if (q.type === "stateTriple") {
        addCol(`${h}A`, "DeclaredStateI");
        addCol(`${h}B`, "DeclaredStateII");
        addCol(`${h}C`, "DeclaredStateIII");
        processedKeys.add("DeclaredStateI");
        processedKeys.add("DeclaredStateII");
        processedKeys.add("DeclaredStateIII");

      } else if (q.type === "collegeVisits") {
        const limit = q.max || 5;
        for (let i = 1; i <= limit; i++) {
          addCol(`${h}_College${i}_Name`, `DeclaredName${i}`);
          addCol(`${h}_College${i}_State`, `DeclaredState${i}`);
          addCol(`${h}_College${i}_Visit`, `DeclaredVisit${i}`);
        }

      } else if (q.type === "majorGrid") {
        addSlottedCols(h, "Major", "Major", 3);

      } else if (q.type === "expectGrid") {
        addSlottedCols(h, "Expect", "Expect", 5);

      } else if (q.type === "denomGrid") {
        addSlottedCols(h, "Denom", "Denom", 2);

      } else if (q.type === "artGrid") {
        addCol(`${h}_Performing`, `${q.key}_Perf`);
        addCol(`${h}_Visual`, `${q.key}_Vis`);
        seen.add(q.key);
        processedKeys.add(q.key);

      } else if (q.key && !q.key.startsWith("_")) {
        // checkbox, radio, text — single column (array joins as comma-separated)
        addCol(h, q.key);
      }
    });
  }

  // 3. Any remaining keys in the record that weren't covered above
  Object.keys(rec).forEach(key => {
    if (FIXED_HEADERS[key]) return;
    if (SKIP_KEYS.has(key)) return;
    if (processedKeys.has(key)) return;        // already split/emitted in step 2
    if (key === "FormKey") return; // skip email for ACTFL-27
    const header = _questionKeyToHeader[key] || key;
    addCol(header, key);
  });


  // Convert ordered pairs → plain object (preserves insertion order in V8)
  const row = {};
  ordered.forEach(([h, v]) => { row[h] = v; });
  return row;
}

function downloadExcel(recordIndex) {
  // Always read from the persisted records array — never from unsaved formData
  let rows;
  let filename;
  let isSingle = (recordIndex !== null && recordIndex !== undefined);

  if (isSingle) {
    // Per-entry download
    const rec = records[recordIndex];
    if (!rec) { toast("⚠️ Record not found."); return; }
    rows = [recordToRowForKey(rec, rec.FormKey)];
    filename = `${rec.SurveyType || rec.FormKey}_EVID${rec.EVID || recordIndex}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  } else {
    // Bulk export: if a form is open, export only that form's records.
    // If in "all records" view (no form open), export everything.
    if (currentFormType) {
      const filtered = records.filter(r => r.FormKey === currentFormType);
      if (!filtered.length) { toast("⚠️ No records to export for this form."); return; }
      rows = filtered.map(r => recordToRowForKey(r, r.FormKey));
      filename = `${currentFormType}_All_${new Date().toISOString().slice(0, 10)}.xlsx`;
    } else {
      if (!records.length) { toast("⚠️ No records stored."); return; }
      rows = records.map(r => recordToRowForKey(r, r.FormKey));
      filename = `AllForms_${new Date().toISOString().slice(0, 10)}.xlsx`;
    }
  }

  const ws = XLSX.utils.json_to_sheet(rows);
  // Set a reasonable default column width for all columns
  const colCount = rows.length > 0 ? Object.keys(rows[0]).length : 20;
  ws["!cols"] = Array.from({ length: colCount }, () => ({ wch: 20 }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Survey");
  XLSX.writeFile(wb, filename);

  // Fix #3 — non-blocking download notification
  const label = isSingle
    ? `Record EVID <strong>${records[recordIndex]?.EVID || recordIndex + 1}</strong> exported.`
    : `${rows.length} record(s) exported.`;

  toast(
    `✅ Download started — ${label}<br>
     <span style="font-size:12px;opacity:.8">Other stored records are unaffected.</span>`,
    4500
  );
}

// expose for per-row onclick
window.downloadExcel = downloadExcel;

// ═══════════════════════════════════════════════
// BOOT
// ═══════════════════════════════════════════════
document.addEventListener("DOMContentLoaded", init);