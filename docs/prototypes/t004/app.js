const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const state = { scenario: "ready", editing: false, lastFocus: null };

function show(element, visible = true) { element.classList.toggle("hidden", !visible); }
function announce(message) {
  const toast = $("#toast"); toast.textContent = message; show(toast);
  window.clearTimeout(announce.timer); announce.timer = window.setTimeout(() => show(toast, false), 2600);
}
function setDialog(title, copy, primary = "Continue", onPrimary = closeDialog) {
  state.lastFocus = document.activeElement;
  $("#dialog-title").textContent = title; $("#dialog-copy").textContent = copy;
  $("#dialog-primary").textContent = primary; $("#dialog-primary").onclick = onPrimary;
  show($("#scrim")); show($("#message-dialog")); $("#dialog-primary").focus();
}
function closeDialog() { show($("#scrim"), false); show($("#message-dialog"), false); state.lastFocus?.focus(); }
function openSheet(editing = false) {
  state.editing = editing; state.lastFocus = document.activeElement;
  $("#sheet-title").textContent = editing ? "Edit feeding" : "Log feeding";
  show($("#delete-feeding"), editing); show($("#form-error"), false);
  show($("#scrim")); show($("#sheet")); $("#fed-time").focus();
}
function closeSheet() { show($("#scrim"), false); show($("#sheet"), false); state.lastFocus?.focus(); }
function selectScreen(id) {
  $$(".screen").forEach(el => el.classList.toggle("active", el.id === id));
  $$("[data-tab]").forEach(el => { const selected = el.dataset.tab === id; el.classList.toggle("selected", selected); selected ? el.setAttribute("aria-current", "page") : el.removeAttribute("aria-current"); });
  $("#main").focus();
}
function calculate() {
  const form = $("#feeding-form"); const starter = Number(form.starter.value); const flour = Number(form.flour.value); const water = Number(form.water.value);
  const valid = [starter, flour, water].every(value => Number.isFinite(value) && value > 0);
  $("#ratio").textContent = valid ? `1:${(flour / starter).toFixed(1).replace(".0", "")}:${(water / starter).toFixed(1).replace(".0", "")}` : "—";
  $("#hydration").textContent = valid ? `${Math.round(water / flour * 100)}%` : "—";
}
function applyScenario(value) {
  state.scenario = value; const empty = value === "empty"; const loading = value === "loading";
  show($("#dashboard-content"), !empty && !loading); show($("#empty-state"), empty); show($("#loading-state"), loading);
  const messages = {
    offline: "You’re offline. Tracking still works; changes will stay on this device.",
    permission: "Reminders are off. You can keep tracking or enable notifications in Settings.",
    storage: "Your last change couldn’t be saved. Your entries are still here—try again.",
    missing: "This window is wider because flour type and temperature weren’t recorded.",
    limit: "Free supports one active starter. Archive Mabel or unlock Pro to create another."
  };
  const banner = $("#status-banner"); banner.textContent = messages[value] || ""; show(banner, Boolean(messages[value]));
  if (value === "missing") {
    $(".peak-card h1 span").textContent = "4:00–7:00 PM"; $(".countdown").textContent = "Starts in about 1 hr 45 min";
    $("#explanation ul").innerHTML = "<li>1:2:2 feeding ratio</li><li>Temperature not recorded</li><li>Flour type not recorded</li>";
  } else {
    $(".peak-card h1 span").textContent = "4:30–6:00 PM"; $(".countdown").textContent = "Starts in about 2 hr 15 min";
    $("#explanation ul").innerHTML = "<li>1:2:2 feeding ratio</li><li>24°C temperature</li><li>Bread flour</li>";
  }
}

$("#feeding-form").addEventListener("input", calculate);
$("#feeding-form").addEventListener("submit", event => {
  event.preventDefault(); const form = event.currentTarget; const amounts = [form.starter, form.flour, form.water];
  const invalid = amounts.find(input => !Number.isFinite(Number(input.value)) || Number(input.value) <= 0);
  if (invalid) { $("#form-error").textContent = "Enter an amount greater than 0 g for starter, flour, and water."; show($("#form-error")); invalid.focus(); return; }
  if (state.scenario === "storage") { $("#form-error").textContent = "Couldn’t save this feeding. Your entries are still here. Try again."; show($("#form-error")); return; }
  closeSheet(); applyScenario("ready"); $("#scenario").value = "ready"; announce(state.editing ? "Feeding updated" : "Feeding saved. Peak window updated.");
});

document.addEventListener("click", event => {
  const target = event.target.closest("[data-action],[data-tab]"); if (!target) return;
  if (target.dataset.tab) return selectScreen(target.dataset.tab);
  const action = target.dataset.action;
  if (action === "log") openSheet(false);
  if (action === "edit") openSheet(true);
  if (action === "close") closeSheet();
  if (action === "back") selectScreen("dashboard");
  if (action === "history") selectScreen("history");
  if (action === "explain") { const panel = $("#explanation"); const opened = panel.classList.contains("hidden"); show(panel, opened); target.setAttribute("aria-expanded", String(opened)); }
  if (action === "reminder") state.scenario === "permission" ? setDialog("Reminders are off", "Starter Clock can still estimate your peak. Enable notifications in device Settings whenever you’re ready.", "Open Settings", () => { closeDialog(); announce("Settings handoff demonstrated"); }) : setDialog("Set a peak reminder?", "We’ll remind you at 4:30 PM, the start of the estimated window. This reminder stays on this device.", "Set for 4:30 PM", () => { closeDialog(); announce("Reminder set for 4:30 PM"); });
  if (action === "observe") setDialog("Record the observed peak", "When did Mabel actually reach maximum rise? This helps compare the estimate with what happened; the prototype does not claim learning yet.", "Record 5:10 PM", () => { closeDialog(); announce("Observed peak recorded"); });
  if (action === "create") setDialog("Name your starter", "A short, familiar name makes feeding history easier to recognize.", "Create Mabel", () => { closeDialog(); applyScenario("ready"); $("#scenario").value = "ready"; openSheet(false); });
  if (action === "upgrade") setDialog("Complete history, multiple starters", "Free keeps one active starter and lets you browse its 30 newest feedings. Pro is a one-time purchase; export and deletion are always available.", "Continue to Pro");
  if (action === "starter-menu") state.scenario === "limit" ? setDialog("One active starter on Free", "Archive Mabel to start another, or unlock Pro for multiple active starters. Nothing will be deleted.", "View options") : announce("Starter switcher demonstrated");
  if (action === "settings") setDialog("Settings", "Appearance, units, data export, delete all data, notification status, and Pro restore live here.", "Done");
  if (action === "photo") state.scenario === "permission" ? setDialog("Photo access is off", "You can save this feeding without a photo. Allow access later in device Settings.", "Keep logging") : announce("Photo picker handoff demonstrated");
  if (action === "delete") setDialog("Delete this feeding?", "Its peak estimate, observed peak, photo, and reminder will also be removed. This cannot be undone.", "Delete feeding", () => { closeDialog(); closeSheet(); announce("Feeding deleted; reminder cancelled"); });
  if (action === "close-dialog") closeDialog();
});

$("#scenario").addEventListener("change", event => applyScenario(event.target.value));
$("#theme").addEventListener("click", event => { const dark = document.documentElement.dataset.theme !== "dark"; document.documentElement.dataset.theme = dark ? "dark" : "light"; event.currentTarget.textContent = dark ? "Light" : "Dark"; event.currentTarget.setAttribute("aria-pressed", String(dark)); });
document.addEventListener("keydown", event => {
  const activeModal = !$("#sheet").classList.contains("hidden") ? $("#sheet") : !$("#message-dialog").classList.contains("hidden") ? $("#message-dialog") : null;
  if (event.key === "Escape" && activeModal) { activeModal === $("#sheet") ? closeSheet() : closeDialog(); return; }
  if (event.key !== "Tab" || !activeModal) return;
  const focusable = $$("button:not([disabled]), input:not([disabled]), select:not([disabled]), summary, [tabindex]:not([tabindex='-1'])", activeModal).filter(element => element.offsetParent);
  const first = focusable[0]; const last = focusable.at(-1);
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
});
applyScenario("ready"); calculate();
