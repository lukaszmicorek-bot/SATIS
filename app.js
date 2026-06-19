const STORAGE_KEY = "baza-aparatow-records-2026-clean";
const REPAIR_STORAGE_KEY = "zeszyt-napraw-wkladek-records-2026-clean";
const DEMO_STORAGE_KEY = "zeszyt-aparatow-demo-records";
const API_URL = "/api/records";
const REPAIR_API_URL = "/api/repair-records";
const SERVER_REFRESH_MS = 10000;
const SUPABASE_PAGE_SIZE = 1000;
const SUPABASE_DELETE_BATCH_SIZE = 200;
const SUPABASE_WRITE_RETRY_DELAYS = [600, 1600];
const SUPABASE_DEVICE_TABLE = "device_records";
const SUPABASE_REPAIR_TABLE = "repair_records";
const DEMO_ID_PREFIX = "demo-";
const DEMO_SEED_MARKER_ID = "demo-seed-marker-v1";
const SEARCH_DEBOUNCE_MS = 120;
const TABLE_RENDER_BATCH_SIZE = 500;
const MAX_DEVICE_NAME_SUGGESTIONS = 300;
const DEMO_RETURN_WARNING_DAYS = 30;
const DEMO_RETURN_CRITICAL_DAYS = 14;
const DEMO_LOAN_DAYS = 14;
const DEMO_RETURN_REMINDER_STORAGE_KEY = "zeszyt-aparatow-demo-return-reminder-last-shown";
const DEMO_RETURN_REMINDER_INTERVAL_MS = 60 * 60 * 1000;
const DEMO_PURPOSE_TEST = "DO TESTOWANIA";
const DEMO_PURPOSE_REPLACEMENT = "APARAT ZASTĘPCZY";
const DEMO_ATTACHMENTS_BUCKET = "demo-attachments";
const DEMO_ATTACHMENT_MAX_BYTES = 10 * 1024 * 1024;
const DEMO_ATTACHMENT_TYPES = new Set(["application/pdf", "image/jpeg", "image/png"]);
const STOCK_LOCATIONS = ["T12", "P50", "P63"];
const DATA_CONTROL_SEVERITY_LABELS = {
  critical: "Pilne",
  warning: "Do sprawdzenia",
  info: "Informacja"
};
const DATA_CONTROL_SEVERITY_ORDER = { critical: 0, warning: 1, info: 2 };
const supabaseConfig = window.SUPABASE_CONFIG || {};
const supabaseKey = supabaseConfig.publishableKey || supabaseConfig.anonKey || "";
const hasSupabaseSettings = Boolean(supabaseConfig.url && supabaseKey);
const hasSupabaseConfig = Boolean(hasSupabaseSettings && window.supabase);
const supabaseClient = hasSupabaseConfig
  ? window.supabase.createClient(supabaseConfig.url, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null;
const hasSharedServer = !hasSupabaseSettings && window.location.protocol !== "file:";
const dateFormatter = new Intl.DateTimeFormat("pl-PL");
const collator = new Intl.Collator("pl", { sensitivity: "base", numeric: true });
const deviceDerived = new Map();
const repairDerived = new Map();
const demoDerived = new Map();
const serialIndex = new Map();
let deviceStats = { all: 0, sold: 0, reserved: 0, stock: 0 };
let repairStats = { all: 0, repairs: 0, inserts: 0, open: 0 };
let demoStats = { all: 0, stock: 0, loaned: 0, returnDue: 0 };
let currentSupabaseUser = null;
let supabaseRealtimeChannel = null;
let supabaseRefreshTimeout = 0;
let supabaseChangeTimeout = 0;
let pendingSupabaseChanges = [];
let demoReturnReminderShown = false;
let demoReturnReminderTimeout = 0;

function makeId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `rec-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

const sampleRecords = [
  {
    id: makeId(),
    receivedDate: "2020-03-11",
    deviceName: "ARIES PRO",
    serialNumber: "222224072",
    type: "SPRZEDANY",
    pickupDate: "2021-09-13",
    customerName: "Grzegorz Gasio",
    salesInvoice: "FS 130/2025",
    returnDate: "",
    waybillNumber: "",
    notes: ""
  },
  {
    id: makeId(),
    receivedDate: "2020-03-11",
    deviceName: "ARIES PRO",
    serialNumber: "222263495",
    type: "SPRZEDANY",
    pickupDate: "2025-04-30",
    customerName: "Franciszek Labak",
    salesInvoice: "FS 143/2025",
    returnDate: "",
    waybillNumber: "",
    notes: ""
  },
  {
    id: makeId(),
    receivedDate: "2020-03-11",
    deviceName: "ARIES PRO",
    serialNumber: "222263482",
    type: "SPRZEDANY",
    pickupDate: "2021-02-11",
    customerName: "Mirek Flusek",
    salesInvoice: "FS 126/2025",
    returnDate: "",
    waybillNumber: "",
    notes: ""
  },
  {
    id: makeId(),
    receivedDate: "2025-11-26",
    deviceName: "Mealink8323 TNR",
    serialNumber: "G$$44F8",
    type: "NA STANIE",
    pickupDate: "",
    customerName: "",
    salesInvoice: "",
    returnDate: "",
    waybillNumber: "",
    notes: ""
  },
  {
    id: makeId(),
    receivedDate: "2025-11-26",
    deviceName: "Mealink8323 TNR",
    serialNumber: "FG54G",
    type: "SPRZEDANY",
    pickupDate: "",
    customerName: "Leszek Gajda",
    salesInvoice: "FD 128/2025",
    returnDate: "",
    waybillNumber: "",
    notes: ""
  },
  {
    id: makeId(),
    receivedDate: "2025-11-26",
    deviceName: "Mealink8323 TNR",
    serialNumber: "KW6GG",
    type: "NA STANIE",
    pickupDate: "",
    customerName: "",
    salesInvoice: "",
    returnDate: "",
    waybillNumber: "",
    notes: ""
  },
  {
    id: makeId(),
    receivedDate: "2025-11-26",
    deviceName: "Charger",
    serialNumber: "259547",
    type: "SPRZEDANY",
    pickupDate: "",
    customerName: "",
    salesInvoice: "",
    returnDate: "",
    waybillNumber: "",
    notes: ""
  },
  {
    id: makeId(),
    receivedDate: "2025-11-26",
    deviceName: "Trek SNR",
    serialNumber: "259548",
    type: "NA STANIE",
    pickupDate: "",
    customerName: "",
    salesInvoice: "",
    returnDate: "",
    waybillNumber: "",
    notes: ""
  },
  {
    id: makeId(),
    receivedDate: "2025-11-26",
    deviceName: "Mido RR",
    serialNumber: "259549",
    type: "SPRZEDANY",
    pickupDate: "",
    customerName: "Marian Graca",
    salesInvoice: "177/2025",
    returnDate: "",
    waybillNumber: "",
    notes: ""
  },
  {
    id: makeId(),
    receivedDate: "2025-11-26",
    deviceName: "Star T",
    serialNumber: "259550",
    type: "SPRZEDANY",
    pickupDate: "",
    customerName: "",
    salesInvoice: "",
    returnDate: "",
    waybillNumber: "",
    notes: ""
  }
];

const fields = [
  "receivedDate",
  "deviceName",
  "serialNumber",
  "type",
  "location",
  "pickupDate",
  "customerName",
  "salesInvoice",
  "returnDate",
  "waybillNumber",
  "ezwm",
  "notes"
];

const repairFields = [
  "receivedDate",
  "category",
  "location",
  "customerName",
  "deviceName",
  "serialNumber",
  "status",
  "sentDate",
  "returnDate",
  "pickupDate",
  "notes"
];

const demoFields = [
  "receivedDate",
  "manufacturerReturnDate",
  "manufacturerReturnDateCleared",
  "manufacturer",
  "deviceName",
  "serialNumber",
  "status",
  "purpose",
  "location",
  "currentUser",
  "loanDate",
  "returnDate",
  "notes"
];

let records = [];
let repairRecords = [];
let demoRecords = [];
let demoLoanHistoryDraft = [];
let demoCurrentAttachmentsDraft = [];
let sortState = { key: "receivedDate", direction: "desc" };
let repairSortState = { key: "receivedDate", direction: "desc" };
let demoSortState = { key: "receivedDate", direction: "desc" };
let activeNotebook = "devices";
let activeDeviceView = "database";
const tableRenderLimits = {
  devices: TABLE_RENDER_BATCH_SIZE,
  demo: TABLE_RENDER_BATCH_SIZE,
  repairs: TABLE_RENDER_BATCH_SIZE,
  repairOpen: TABLE_RENDER_BATCH_SIZE,
  dataControl: TABLE_RENDER_BATCH_SIZE
};

const recordsBody = document.querySelector("#recordsBody");
const emptyState = document.querySelector("#emptyState");
const repairRecordsBody = document.querySelector("#repairRecordsBody");
const repairEmptyState = document.querySelector("#repairEmptyState");
const repairOpenRecordsBody = document.querySelector("#repairOpenRecordsBody");
const repairOpenEmptyState = document.querySelector("#repairOpenEmptyState");
const demoRecordsBody = document.querySelector("#demoRecordsBody");
const demoEmptyState = document.querySelector("#demoEmptyState");
const demoChecklistBody = document.querySelector("#demoChecklistBody");
const demoChecklistMeta = document.querySelector("#demoChecklistMeta");
const printDemoChecklistBtn = document.querySelector("#printDemoChecklistBtn");
const stockBody = document.querySelector("#stockBody");
const stockEmptyState = document.querySelector("#stockEmptyState");
const stockSummary = document.querySelector("#stockSummary");
const stockLocationSummary = document.querySelector("#stockLocationSummary");
const stockChecklistBody = document.querySelector("#stockChecklistBody");
const stockChecklistMeta = document.querySelector("#stockChecklistMeta");
const printStockChecklistBtn = document.querySelector("#printStockChecklistBtn");
const dataControlBody = document.querySelector("#dataControlBody");
const dataControlEmptyState = document.querySelector("#dataControlEmptyState");
const dataControlSummary = document.querySelector("#dataControlSummary");
const dataControlStats = document.querySelector("#dataControlStats");
const dataControlSearchInput = document.querySelector("#dataControlSearchInput");
const databaseRenderNotice = document.querySelector("#databaseRenderNotice");
const databaseRenderText = document.querySelector("#databaseRenderText");
const showMoreRecordsBtn = document.querySelector("#showMoreRecordsBtn");
const demoRenderNotice = document.querySelector("#demoRenderNotice");
const demoRenderText = document.querySelector("#demoRenderText");
const showMoreDemoBtn = document.querySelector("#showMoreDemoBtn");
const repairRenderNotice = document.querySelector("#repairRenderNotice");
const repairRenderText = document.querySelector("#repairRenderText");
const showMoreRepairBtn = document.querySelector("#showMoreRepairBtn");
const repairOpenRenderNotice = document.querySelector("#repairOpenRenderNotice");
const repairOpenRenderText = document.querySelector("#repairOpenRenderText");
const showMoreRepairOpenBtn = document.querySelector("#showMoreRepairOpenBtn");
const dataControlRenderNotice = document.querySelector("#dataControlRenderNotice");
const dataControlRenderText = document.querySelector("#dataControlRenderText");
const showMoreDataControlBtn = document.querySelector("#showMoreDataControlBtn");
const countAllLabel = document.querySelector("#countAllLabel");
const countSoldLabel = document.querySelector("#countSoldLabel");
const countInvoiceLabel = document.querySelector("#countInvoiceLabel");
const countStockLabel = document.querySelector("#countStockLabel");
const searchInput = document.querySelector("#searchInput");
const typeFilter = document.querySelector("#typeFilter");
const ezwmFilter = document.querySelector("#ezwmFilter");
const typeSelect = document.querySelector("#type");
const fifoFilter = document.querySelector("#fifoFilter");
const repairSearchInput = document.querySelector("#repairSearchInput");
const repairCategoryFilter = document.querySelector("#repairCategoryFilter");
const repairStatusFilter = document.querySelector("#repairStatusFilter");
const repairLocationFilter = document.querySelector("#repairLocationFilter");
const demoSearchInput = document.querySelector("#demoSearchInput");
const demoStatusFilter = document.querySelector("#demoStatusFilter");
const demoManufacturerFilter = document.querySelector("#demoManufacturerFilter");
const demoLocationFilter = document.querySelector("#demoLocationFilter");
const deviceNameSuggestions = document.querySelector("#deviceNameSuggestions");
const customerNameSuggestions = document.querySelector("#customerNameSuggestions");
const demoManufacturerSuggestions = document.querySelector("#demoManufacturerSuggestions");
const demoDeviceNameSuggestions = document.querySelector("#demoDeviceNameSuggestions");
const recordDialog = document.querySelector("#recordDialog");
const recordForm = document.querySelector("#recordForm");
const recordEyebrow = document.querySelector("#recordEyebrow");
const dialogTitle = document.querySelector("#dialogTitle");
const deleteBtn = document.querySelector("#deleteBtn");
const importInput = document.querySelector("#importInput");
const importRepairInput = document.querySelector("#importRepairInput");
const repairDialog = document.querySelector("#repairDialog");
const repairForm = document.querySelector("#repairForm");
const repairDialogTitle = document.querySelector("#repairDialogTitle");
const deleteRepairBtn = document.querySelector("#deleteRepairBtn");
const demoDialog = document.querySelector("#demoDialog");
const demoForm = document.querySelector("#demoForm");
const demoDialogTitle = document.querySelector("#demoDialogTitle");
const demoRecordEyebrow = document.querySelector("#demoRecordEyebrow");
const deleteDemoBtn = document.querySelector("#deleteDemoBtn");
const saveDemoBtn = document.querySelector("#saveDemoBtn");
const demoFormError = document.querySelector("#demoFormError");
const demoLoanHistorySection = document.querySelector("#demoLoanHistorySection");
const demoLoanHistoryCount = document.querySelector("#demoLoanHistoryCount");
const demoLoanHistoryList = document.querySelector("#demoLoanHistoryList");
const demoCurrentAttachmentInput = document.querySelector("#demoCurrentAttachmentInput");
const demoCurrentAttachmentsList = document.querySelector("#demoCurrentAttachmentsList");
const demoAttachmentPreviewDialog = document.querySelector("#demoAttachmentPreviewDialog");
const demoAttachmentPreviewTitle = document.querySelector("#demoAttachmentPreviewTitle");
const demoAttachmentPreviewBody = document.querySelector("#demoAttachmentPreviewBody");
const demoReturnReminderDialog = document.querySelector("#demoReturnReminderDialog");
const demoReturnReminderSummary = document.querySelector("#demoReturnReminderSummary");
const demoReturnReminderList = document.querySelector("#demoReturnReminderList");
const tabButtons = document.querySelectorAll(".tab-button");
const viewSections = document.querySelectorAll(".view-section");
const notebookSwitchButtons = document.querySelectorAll(".notebook-switch-button");
const notebookSections = document.querySelectorAll(".notebook-section");
const appTitle = document.querySelector("#appTitle");
const connectionStatus = document.querySelector("#connectionStatus");
const connectionUser = document.querySelector("#connectionUser");
const logoutBtn = document.querySelector("#logoutBtn");
const authDialog = document.querySelector("#authDialog");
const authForm = document.querySelector("#authForm");
const authEmail = document.querySelector("#authEmail");
const authPassword = document.querySelector("#authPassword");
const authError = document.querySelector("#authError");
const authSubmitBtn = document.querySelector("#authSubmitBtn");

function setCurrentYearTitle() {
  const year = new Date().getFullYear();
  const deviceTitle = `Zeszyt aparatów ${year}`;
  const repairTitle = `Zeszyt napraw i wkładek usznych ${year}`;
  const title = activeNotebook === "repairs" ? repairTitle : deviceTitle;

  appTitle.textContent = title;
  document.title = title;
}

function setConnectionStatus(state, text) {
  if (!connectionStatus) return;
  connectionStatus.dataset.state = state;
  connectionStatus.textContent = text;
}

function updateConnectionUser(user) {
  currentSupabaseUser = user || null;
  if (connectionUser) {
    connectionUser.textContent = currentSupabaseUser?.email || "";
    connectionUser.hidden = !currentSupabaseUser;
  }
  if (logoutBtn) logoutBtn.hidden = !currentSupabaseUser;
}

function showAuthDialog(message = "") {
  if (!authDialog) return;
  authError.textContent = message;
  if (!authDialog.open) authDialog.showModal();
  window.setTimeout(() => authEmail?.focus(), 0);
}

function hideAuthDialog() {
  if (authDialog?.open) authDialog.close();
  if (authPassword) authPassword.value = "";
  if (authError) authError.textContent = "";
}

function supabaseRecordRow(record) {
  const { id, ...data } = record;
  return {
    id,
    data,
    updated_at: new Date().toISOString(),
    updated_by: currentSupabaseUser?.id || null
  };
}

function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function errorText(error) {
  return String(error?.message || error || "");
}

function isTransientSupabaseError(error) {
  const message = errorText(error).toLowerCase();
  return (
    message.includes("load failed") ||
    message.includes("failed to fetch") ||
    message.includes("networkerror") ||
    message.includes("network error") ||
    message.includes("fetch") ||
    message.includes("timeout")
  );
}

function supabaseWriteErrorMessage(error) {
  if (isTransientSupabaseError(error)) {
    return "Nie udało się połączyć z Supabase podczas zapisu. Sprawdź internet, odśwież stronę i spróbuj ponownie.";
  }
  return `Nie udało się zapisać danych w Supabase: ${errorText(error) || "nieznany błąd"}`;
}

async function retrySupabaseWrite(action) {
  let lastError = null;

  for (let attempt = 0; attempt <= SUPABASE_WRITE_RETRY_DELAYS.length; attempt += 1) {
    try {
      return await action();
    } catch (error) {
      lastError = error;
      if (!isTransientSupabaseError(error) || attempt === SUPABASE_WRITE_RETRY_DELAYS.length) break;
      setConnectionStatus("syncing", "Ponawiam zapis...");
      await wait(SUPABASE_WRITE_RETRY_DELAYS[attempt]);
    }
  }

  throw lastError;
}

async function loadSupabaseTable(tableName, normalizer, options = {}) {
  const loadedRecords = [];

  for (let from = 0; ; from += SUPABASE_PAGE_SIZE) {
    let query = supabaseClient
      .from(tableName)
      .select("id,data,updated_at");
    if (options.idPrefix) query = query.like("id", `${options.idPrefix}%`);
    if (options.excludeIdPrefix) query = query.not("id", "like", `${options.excludeIdPrefix}%`);

    const { data, error } = await query
      .order("updated_at", { ascending: false })
      .order("id", { ascending: true })
      .range(from, from + SUPABASE_PAGE_SIZE - 1);

    if (error) throw new Error(`Nie udało się pobrać danych z Supabase: ${error.message}`);

    const page = data || [];
    loadedRecords.push(
      ...page.map((row) => ({
        ...(row.data && typeof row.data === "object" ? row.data : {}),
        id: row.id
      }))
    );

    if (page.length < SUPABASE_PAGE_SIZE) break;
  }

  return normalizer(loadedRecords);
}

async function loadSupabaseIds(tableName, options = {}) {
  const ids = [];

  for (let from = 0; ; from += SUPABASE_PAGE_SIZE) {
    let query = supabaseClient
      .from(tableName)
      .select("id");
    if (options.idPrefix) query = query.like("id", `${options.idPrefix}%`);
    if (options.excludeIdPrefix) query = query.not("id", "like", `${options.excludeIdPrefix}%`);

    const { data, error } = await query
      .order("id", { ascending: true })
      .range(from, from + SUPABASE_PAGE_SIZE - 1);
    if (error) throw new Error(`Nie udało się sprawdzić danych w Supabase: ${error.message}`);

    const page = data || [];
    ids.push(...page.map((row) => row.id));
    if (page.length < SUPABASE_PAGE_SIZE) break;
  }

  return ids;
}

async function upsertSupabaseRecord(tableName, record) {
  setConnectionStatus("syncing", "Zapisywanie...");
  try {
    await retrySupabaseWrite(async () => {
      const { error } = await supabaseClient.from(tableName).upsert(supabaseRecordRow(record), { onConflict: "id" });
      if (error) throw error;
    });
    setConnectionStatus("online", "Supabase");
  } catch (error) {
    setConnectionStatus("error", isTransientSupabaseError(error) ? "Brak połączenia" : "Błąd zapisu");
    throw new Error(supabaseWriteErrorMessage(error));
  }
}

async function deleteSupabaseRecord(tableName, id) {
  setConnectionStatus("syncing", "Usuwanie...");
  try {
    await retrySupabaseWrite(async () => {
      const { error } = await supabaseClient.from(tableName).delete().eq("id", id);
      if (error) throw error;
    });
    setConnectionStatus("online", "Supabase");
  } catch (error) {
    setConnectionStatus("error", isTransientSupabaseError(error) ? "Brak połączenia" : "Błąd zapisu");
    throw new Error(
      isTransientSupabaseError(error)
        ? "Nie udało się połączyć z Supabase podczas usuwania. Sprawdź internet, odśwież stronę i spróbuj ponownie."
        : `Nie udało się usunąć danych z Supabase: ${errorText(error) || "nieznany błąd"}`
    );
  }
}

async function replaceSupabaseTable(tableName, sourceRecords, options = {}) {
  setConnectionStatus("syncing", "Importowanie...");
  const existingIds = await loadSupabaseIds(tableName, options);

  for (let from = 0; from < sourceRecords.length; from += SUPABASE_PAGE_SIZE) {
    const chunk = sourceRecords.slice(from, from + SUPABASE_PAGE_SIZE).map(supabaseRecordRow);
    const { error } = await supabaseClient.from(tableName).upsert(chunk, { onConflict: "id" });
    if (error) {
      setConnectionStatus("error", "Błąd importu");
      throw new Error(`Nie udało się zaimportować danych do Supabase: ${error.message}`);
    }
  }

  const importedIds = new Set(sourceRecords.map((record) => record.id));
  const staleIds = existingIds.filter((id) => !importedIds.has(id));
  for (let from = 0; from < staleIds.length; from += SUPABASE_DELETE_BATCH_SIZE) {
    const chunk = staleIds.slice(from, from + SUPABASE_DELETE_BATCH_SIZE);
    const { error } = await supabaseClient.from(tableName).delete().in("id", chunk);
    if (error) {
      setConnectionStatus("error", "Błąd importu");
      throw new Error(`Nie udało się usunąć starych danych z Supabase: ${error.message}`);
    }
  }

  setConnectionStatus("online", "Supabase");
}

async function seedDemoRecordsIfEmpty() {
  const seedRecords = normalizeDemoRecordsForUse(window.DEMO_SEED_RECORDS || []);
  if (demoRecords.length || !seedRecords.length) return;

  const { data: seedState, error: seedStateError } = await supabaseClient
    .from(SUPABASE_DEVICE_TABLE)
    .select("id")
    .eq("id", DEMO_SEED_MARKER_ID)
    .maybeSingle();
  if (seedStateError) throw new Error(`Nie udało się sprawdzić importu Demo: ${seedStateError.message}`);
  if (seedState) return;

  for (let from = 0; from < seedRecords.length; from += SUPABASE_PAGE_SIZE) {
    const chunk = seedRecords.slice(from, from + SUPABASE_PAGE_SIZE).map(supabaseRecordRow);
    const { error } = await supabaseClient.from(SUPABASE_DEVICE_TABLE).upsert(chunk, { onConflict: "id" });
    if (error) throw new Error(`Nie udało się zaimportować danych Demo: ${error.message}`);
  }

  const { error: markError } = await supabaseClient.from(SUPABASE_DEVICE_TABLE).upsert({
    id: DEMO_SEED_MARKER_ID,
    data: { kind: "demo-seed-marker", source: "demo.xlsx", records: seedRecords.length },
    updated_at: new Date().toISOString(),
    updated_by: currentSupabaseUser?.id || null
  });
  if (markError) throw new Error(`Dane Demo zapisano, ale nie udało się oznaczyć importu: ${markError.message}`);

  demoRecords = seedRecords;
  localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(demoRecords));
  rebuildDerivedData();
  render();
}

async function refreshRecordsFromSupabase(options = {}) {
  if (!hasSupabaseConfig || !currentSupabaseUser || document.hidden) return;
  if (recordDialog.open || repairDialog.open || demoDialog.open) {
    scheduleSupabaseRefresh(1000);
    return;
  }

  try {
    setConnectionStatus("syncing", "Synchronizacja...");
    [records, repairRecords, demoRecords] = await Promise.all([
      loadSupabaseTable(SUPABASE_DEVICE_TABLE, normalizeDeviceRecordsForUse, { excludeIdPrefix: DEMO_ID_PREFIX }),
      loadSupabaseTable(SUPABASE_REPAIR_TABLE, normalizeRepairRecordsForUse),
      loadSupabaseTable(
        SUPABASE_DEVICE_TABLE,
        (loadedRecords) => normalizeDemoRecordsForUse(loadedRecords.filter((record) => record.id !== DEMO_SEED_MARKER_ID)),
        { idPrefix: DEMO_ID_PREFIX }
      )
    ]);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    localStorage.setItem(REPAIR_STORAGE_KEY, JSON.stringify(repairRecords));
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(demoRecords));
    rebuildDerivedData();
    render();
    setConnectionStatus("online", "Supabase");
  } catch (error) {
    console.warn(error);
    setConnectionStatus("error", "Błąd synchronizacji");
    if (options.throwOnError) throw error;
  }
}

function scheduleSupabaseRefresh(delay = 300) {
  window.clearTimeout(supabaseRefreshTimeout);
  supabaseRefreshTimeout = window.setTimeout(refreshRecordsFromSupabase, delay);
}

function recordFromSupabaseRow(row, normalizer) {
  if (!row?.id) return null;
  const normalized = normalizer([
    {
      ...(row.data && typeof row.data === "object" ? row.data : {}),
      id: row.id
    }
  ]);
  return normalized[0] || null;
}

function queueSupabaseChange(tableName, payload) {
  pendingSupabaseChanges.push({ tableName, payload });
  window.clearTimeout(supabaseChangeTimeout);
  supabaseChangeTimeout = window.setTimeout(flushSupabaseChanges, 220);
}

function applySupabaseChange(currentRecords, payload, normalizer) {
  const id = payload.new?.id || payload.old?.id;
  if (!id) return currentRecords;
  if (payload.eventType === "DELETE") return currentRecords.filter((record) => record.id !== id);

  const changedRecord = recordFromSupabaseRow(payload.new, normalizer);
  if (!changedRecord) return currentRecords;
  const exists = currentRecords.some((record) => record.id === id);
  return exists
    ? currentRecords.map((record) => (record.id === id ? changedRecord : record))
    : [changedRecord, ...currentRecords];
}

function flushSupabaseChanges() {
  const changes = pendingSupabaseChanges;
  pendingSupabaseChanges = [];
  if (!changes.length || !currentSupabaseUser) return;

  if (recordDialog.open || repairDialog.open || demoDialog.open || changes.length > 100) {
    scheduleSupabaseRefresh();
    return;
  }

  changes.forEach(({ tableName, payload }) => {
    if (tableName === SUPABASE_DEVICE_TABLE) {
      records = applySupabaseChange(records, payload, normalizeDeviceRecordsForUse);
    } else if (tableName === SUPABASE_REPAIR_TABLE) {
      repairRecords = applySupabaseChange(repairRecords, payload, normalizeRepairRecordsForUse);
    } else {
      demoRecords = applySupabaseChange(demoRecords, payload, normalizeDemoRecordsForUse);
    }
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  localStorage.setItem(REPAIR_STORAGE_KEY, JSON.stringify(repairRecords));
  localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(demoRecords));
  rebuildDerivedData();
  render();
  setConnectionStatus("online", "Supabase");
}

function subscribeToSupabaseChanges() {
  if (!hasSupabaseConfig || supabaseRealtimeChannel) return;

  supabaseRealtimeChannel = supabaseClient
    .channel("zeszyt-live")
    .on("postgres_changes", { event: "*", schema: "public", table: SUPABASE_DEVICE_TABLE }, (payload) => {
      const id = payload.new?.id || payload.old?.id || "";
      if (id === DEMO_SEED_MARKER_ID) return;
      queueSupabaseChange(id.startsWith(DEMO_ID_PREFIX) ? "demo" : SUPABASE_DEVICE_TABLE, payload);
    })
    .on("postgres_changes", { event: "*", schema: "public", table: SUPABASE_REPAIR_TABLE }, (payload) =>
      queueSupabaseChange(SUPABASE_REPAIR_TABLE, payload)
    )
    .subscribe((status) => {
      if (status === "SUBSCRIBED") setConnectionStatus("online", "Supabase");
      if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        setConnectionStatus("error", "Brak synchronizacji");
      }
    });
}

async function activateSupabaseSession(user) {
  updateConnectionUser(user);
  hideAuthDialog();
  setConnectionStatus("syncing", "Łączenie...");
  await refreshRecordsFromSupabase({ throwOnError: true });
  await seedDemoRecordsIfEmpty();
  subscribeToSupabaseChanges();
}

async function handleAuthSubmit(event) {
  event.preventDefault();
  authError.textContent = "";
  authSubmitBtn.disabled = true;
  authSubmitBtn.textContent = "Logowanie...";

  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: authEmail.value.trim(),
      password: authPassword.value
    });
    if (error) throw error;
    await activateSupabaseSession(data.user);
  } catch (error) {
    showAuthDialog(`Nie udało się zalogować: ${error.message}`);
  } finally {
    authSubmitBtn.disabled = false;
    authSubmitBtn.textContent = "Zaloguj";
  }
}

async function logoutFromSupabase() {
  if (!supabaseClient) return;
  await supabaseClient.auth.signOut();
  if (supabaseRealtimeChannel) {
    await supabaseClient.removeChannel(supabaseRealtimeChannel);
    supabaseRealtimeChannel = null;
  }
  updateConnectionUser(null);
  records = [];
  repairRecords = [];
  demoRecords = [];
  demoReturnReminderShown = false;
  rebuildDerivedData();
  render();
  setConnectionStatus("offline", "Zaloguj się");
  showAuthDialog();
}

function loadLocalRecords() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    return [];
  }

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? normalizeDeviceRecordsForUse(parsed) : [];
  } catch {
    return [];
  }
}

async function loadRecords() {
  if (hasSupabaseConfig && currentSupabaseUser) {
    const sharedRecords = await loadSupabaseTable(SUPABASE_DEVICE_TABLE, normalizeDeviceRecordsForUse, {
      excludeIdPrefix: DEMO_ID_PREFIX
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sharedRecords));
    return sharedRecords;
  }

  if (hasSharedServer) {
    try {
      const response = await fetch(API_URL, { cache: "no-store" });
      if (!response.ok) throw new Error("Nie udało się pobrać wspólnej bazy.");
      const sharedRecords = await response.json();
      if (!Array.isArray(sharedRecords)) throw new Error("Wspólna baza ma niepoprawny format.");
      const normalizedRecords = normalizeDeviceRecordsForUse(sharedRecords);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedRecords));
      return normalizedRecords;
    } catch (error) {
      console.warn(error);
    }
  }

  return loadLocalRecords();
}

function loadLocalRepairRecords() {
  const stored = localStorage.getItem(REPAIR_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(REPAIR_STORAGE_KEY, JSON.stringify([]));
    return [];
  }

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function loadRepairRecords() {
  if (hasSupabaseConfig && currentSupabaseUser) {
    const sharedRecords = await loadSupabaseTable(SUPABASE_REPAIR_TABLE, normalizeRepairRecordsForUse);
    localStorage.setItem(REPAIR_STORAGE_KEY, JSON.stringify(sharedRecords));
    return sharedRecords;
  }

  if (hasSharedServer) {
    try {
      const response = await fetch(REPAIR_API_URL, { cache: "no-store" });
      if (!response.ok) throw new Error("Nie udało się pobrać zeszytu napraw i wkładek.");
      const sharedRecords = await response.json();
      if (!Array.isArray(sharedRecords)) throw new Error("Zeszyt napraw i wkładek ma niepoprawny format.");
      const normalizedRecords = normalizeRepairRecordsForUse(sharedRecords);
      localStorage.setItem(REPAIR_STORAGE_KEY, JSON.stringify(normalizedRecords));
      return normalizedRecords;
    } catch (error) {
      console.warn(error);
    }
  }

  return normalizeRepairRecordsForUse(loadLocalRepairRecords());
}

function loadLocalDemoRecords() {
  const stored = localStorage.getItem(DEMO_STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return normalizeDemoRecordsForUse(parsed);
    } catch {
      // Użyj danych startowych poniżej.
    }
  }

  const seedRecords = normalizeDemoRecordsForUse(window.DEMO_SEED_RECORDS || []);
  localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(seedRecords));
  return seedRecords;
}

async function loadDemoRecords() {
  if (hasSupabaseConfig && currentSupabaseUser) {
    const sharedRecords = await loadSupabaseTable(
      SUPABASE_DEVICE_TABLE,
      (loadedRecords) => normalizeDemoRecordsForUse(loadedRecords.filter((record) => record.id !== DEMO_SEED_MARKER_ID)),
      { idPrefix: DEMO_ID_PREFIX }
    );
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(sharedRecords));
    return sharedRecords;
  }
  return loadLocalDemoRecords();
}

async function refreshRecordsFromServer() {
  if (!hasSharedServer || document.hidden || recordDialog.open || repairDialog.open) return;

  try {
    const [deviceResponse, repairResponse] = await Promise.all([
      fetch(API_URL, { cache: "no-store" }),
      fetch(REPAIR_API_URL, { cache: "no-store" })
    ]);
    if (!deviceResponse.ok) throw new Error("Nie udało się odświeżyć wspólnej bazy.");
    if (!repairResponse.ok) throw new Error("Nie udało się odświeżyć zeszytu napraw i wkładek.");

    const sharedRecords = await deviceResponse.json();
    const sharedRepairRecords = await repairResponse.json();
    if (!Array.isArray(sharedRecords)) throw new Error("Wspólna baza ma niepoprawny format.");
    if (!Array.isArray(sharedRepairRecords)) throw new Error("Zeszyt napraw i wkładek ma niepoprawny format.");
    records = normalizeDeviceRecordsForUse(sharedRecords);
    repairRecords = normalizeRepairRecordsForUse(sharedRepairRecords);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    localStorage.setItem(REPAIR_STORAGE_KEY, JSON.stringify(repairRecords));
    rebuildDerivedData();
    render();
  } catch (error) {
    console.warn(error);
  }
}

async function saveRepairRecords() {
  localStorage.setItem(REPAIR_STORAGE_KEY, JSON.stringify(repairRecords));
  if (hasSupabaseConfig) {
    await replaceSupabaseTable(SUPABASE_REPAIR_TABLE, repairRecords);
    return;
  }
  if (!hasSharedServer) return;

  const response = await fetch(REPAIR_API_URL, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(repairRecords)
  });

  if (!response.ok) {
    throw new Error(`Nie udało się zapisać zeszytu napraw i wkładek. Kod: ${response.status}`);
  }
}

async function saveRecords() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  if (hasSupabaseConfig) {
    await replaceSupabaseTable(SUPABASE_DEVICE_TABLE, records, { excludeIdPrefix: DEMO_ID_PREFIX });
    return;
  }
  if (!hasSharedServer) return;

  const response = await fetch(API_URL, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(records)
  });

  if (!response.ok) {
    throw new Error(`Nie udało się zapisać wspólnej bazy. Kod: ${response.status}`);
  }
}

async function persistDeviceRecord(record) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  if (hasSupabaseConfig) {
    await upsertSupabaseRecord(SUPABASE_DEVICE_TABLE, record);
    return;
  }
  await saveRecords();
}

async function persistRepairRecord(record) {
  localStorage.setItem(REPAIR_STORAGE_KEY, JSON.stringify(repairRecords));
  if (hasSupabaseConfig) {
    await upsertSupabaseRecord(SUPABASE_REPAIR_TABLE, record);
    return;
  }
  await saveRepairRecords();
}

async function persistDeletedDeviceRecord(id) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  if (hasSupabaseConfig) {
    await deleteSupabaseRecord(SUPABASE_DEVICE_TABLE, id);
    return;
  }
  await saveRecords();
}

async function persistDeletedRepairRecord(id) {
  localStorage.setItem(REPAIR_STORAGE_KEY, JSON.stringify(repairRecords));
  if (hasSupabaseConfig) {
    await deleteSupabaseRecord(SUPABASE_REPAIR_TABLE, id);
    return;
  }
  await saveRepairRecords();
}

async function persistDemoRecord(record) {
  localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(demoRecords));
  if (hasSupabaseConfig) {
    await upsertSupabaseRecord(SUPABASE_DEVICE_TABLE, record);
  }
}

async function persistDeletedDemoRecord(id) {
  localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(demoRecords));
  if (hasSupabaseConfig) {
    await deleteSupabaseRecord(SUPABASE_DEVICE_TABLE, id);
  }
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return dateFormatter.format(date);
}

function normalize(value) {
  return String(value ?? "").toLocaleLowerCase("pl-PL");
}

function titleCaseName(value) {
  return String(value ?? "")
    .trim()
    .toLocaleLowerCase("pl-PL")
    .replace(/(^|[\s-])(\p{L})/gu, (match, separator, letter) => separator + letter.toLocaleUpperCase("pl-PL"));
}

function titleCaseNameInput(value) {
  return String(value ?? "")
    .toLocaleLowerCase("pl-PL")
    .replace(/(^|[\s-])(\p{L})/gu, (match, separator, letter) => separator + letter.toLocaleUpperCase("pl-PL"));
}

function normalizeSerialNumber(value) {
  return String(value ?? "").trim().toLocaleUpperCase("pl-PL");
}

function normalizeSalesInvoice(value) {
  return String(value ?? "").trim().toLocaleUpperCase("pl-PL");
}

function normalizeSalesInvoiceInput(value) {
  return String(value ?? "").toLocaleUpperCase("pl-PL");
}

function normalizeDeviceName(value) {
  return String(value ?? "")
    .replace(/[-‐‑‒–—]+/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}

function damerauLevenshtein(leftValue, rightValue) {
  const left = [...String(leftValue)];
  const right = [...String(rightValue)];
  const matrix = Array.from({ length: left.length + 1 }, () => Array(right.length + 1).fill(0));

  for (let row = 0; row <= left.length; row += 1) matrix[row][0] = row;
  for (let column = 0; column <= right.length; column += 1) matrix[0][column] = column;

  for (let row = 1; row <= left.length; row += 1) {
    for (let column = 1; column <= right.length; column += 1) {
      const cost = left[row - 1] === right[column - 1] ? 0 : 1;
      matrix[row][column] = Math.min(
        matrix[row - 1][column] + 1,
        matrix[row][column - 1] + 1,
        matrix[row - 1][column - 1] + cost
      );
      if (
        row > 1 &&
        column > 1 &&
        left[row - 1] === right[column - 2] &&
        left[row - 2] === right[column - 1]
      ) {
        matrix[row][column] = Math.min(matrix[row][column], matrix[row - 2][column - 2] + cost);
      }
    }
  }

  return matrix[left.length][right.length];
}

function deviceNameTokenCandidates(currentId = "") {
  const candidates = new Map();

  records.forEach((record) => {
    if (record.id === currentId) return;
    const displayToken = normalizeDeviceName(record.deviceName).split(" ")[0];
    const token = displayToken.toLocaleUpperCase("pl-PL");
    if (!/^\p{L}{4,}$/u.test(token)) return;
    const candidate = candidates.get(token) || { token, count: 0, displayForms: new Map() };
    candidate.count += 1;
    candidate.displayForms.set(displayToken, (candidate.displayForms.get(displayToken) || 0) + 1);
    candidates.set(token, candidate);
  });

  return [...candidates.values()]
    .filter((candidate) => candidate.count >= 3)
    .map((candidate) => ({
      token: candidate.token,
      count: candidate.count,
      displayToken: [...candidate.displayForms.entries()]
        .sort((left, right) => right[1] - left[1])[0][0]
    }));
}

function correctDeviceNameFromHistory(value, currentId = "") {
  const name = normalizeDeviceName(value);
  if (!name) return "";

  const parts = name.split(" ");
  const enteredToken = parts[0].toLocaleUpperCase("pl-PL");
  if (!/^\p{L}{4,}$/u.test(enteredToken)) return name;

  const candidates = deviceNameTokenCandidates(currentId);
  if (candidates.some((candidate) => candidate.token === enteredToken)) return name;

  const maximumDistance = enteredToken.length >= 7 ? 2 : 1;
  const matches = candidates
    .map((candidate) => ({
      ...candidate,
      distance: damerauLevenshtein(enteredToken, candidate.token)
    }))
    .filter((candidate) => candidate.distance <= maximumDistance)
    .sort((left, right) => left.distance - right.distance || right.count - left.count);

  const best = matches[0];
  const runnerUp = matches[1];
  if (!best || (runnerUp && runnerUp.distance === best.distance)) return name;

  parts[0] = best.displayToken;
  return parts.join(" ");
}

function serialMatches(serialNumber, source, currentId) {
  const checkedSerial = normalizeSerialNumber(serialNumber);
  if (!checkedSerial) return [];
  return (serialIndex.get(checkedSerial) || []).filter((match) => !(match.source === source && match.id === currentId));
}

function duplicateSerialMatches(record, source) {
  return serialMatches(record.serialNumber, source, record.id);
}

function dataControlDuplicateSerialMatches(record, source) {
  const checkedSerial = normalizeSerialNumber(record.serialNumber);
  if (!checkedSerial) return [];

  const matches = [];
  records.forEach((item) => {
    if (source === "devices" && item.id === record.id) return;
    if (normalizeSerialNumber(item.serialNumber) !== checkedSerial) return;
    matches.push({
      source: "devices",
      id: item.id,
      notebook: "Zeszyt aparatów",
      label: [item.deviceName, deviceDerived.get(item.id)?.displayType ?? displayType(item), item.customerName].filter(Boolean).join(" / ")
    });
  });

  demoRecords.forEach((item) => {
    if (source === "demo" && item.id === record.id) return;
    if (normalizeSerialNumber(item.serialNumber) !== checkedSerial) return;
    matches.push({
      source: "demo",
      id: item.id,
      notebook: "Aparaty demo",
      label: [item.manufacturer, item.deviceName, demoDerived.get(item.id)?.status ?? demoStatus(item)].filter(Boolean).join(" / ")
    });
  });

  return matches;
}

function duplicateSerialTitle(matches) {
  if (!matches.length) return "";

  const matchList = matches
    .slice(0, 5)
    .map((match) => `${match.notebook}: ${match.label || "bez opisu"}`)
    .join("\n");
  const extraCount = matches.length > 5 ? `\n+ ${matches.length - 5} więcej` : "";
  return `Duplikat numeru seryjnego:\n${matchList}${extraCount}`;
}

function confirmSerialNumberSave(serialNumber, source, currentId) {
  const matches = serialMatches(serialNumber, source, currentId);
  if (matches.length === 0) return true;

  const matchList = matches
    .slice(0, 6)
    .map((match) => `- ${match.notebook}: ${match.label || "bez opisu"}`)
    .join("\n");
  const extraCount = matches.length > 6 ? `\n- oraz ${matches.length - 6} więcej` : "";

  return confirm(
    `Numer seryjny ${normalizeSerialNumber(serialNumber)} już występuje:\n${matchList}${extraCount}\n\nZapisać mimo to?`
  );
}

function stockAge(record) {
  if (!record.receivedDate) return null;
  const received = new Date(`${record.receivedDate}T00:00:00`);
  if (Number.isNaN(received.getTime())) return null;

  const today = new Date();
  const localToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.max(0, Math.floor((localToday - received) / 86400000));
}

function formatDaysLabel(days) {
  if (days === null || days === undefined || Number.isNaN(days)) return "brak daty";

  const absoluteDays = Math.abs(Number(days));
  const lastTwoDigits = absoluteDays % 100;
  const lastDigit = absoluteDays % 10;

  if (absoluteDays === 1) return "1 dzień";
  if (lastTwoDigits >= 12 && lastTwoDigits <= 14) return `${days} dni`;
  if (lastDigit >= 2 && lastDigit <= 4) return `${days} dni`;
  return `${days} dni`;
}

function fifoLevel(record) {
  if (isFifoExcluded(record)) return "";
  const age = stockAge(record);
  if (age === null) return "";
  if (age >= 180) return "critical";
  if (age >= 90) return "warning";
  return "";
}

function isInStock(record) {
  return displayType(record) === "NA STANIE";
}

function isSold(record) {
  return normalizeDeviceType(record.type) === "SPRZEDANY";
}

function isFifoExcluded(record) {
  return ["SPRZEDANY", "ZWROT"].includes(displayType(record));
}

function normalizeDeviceType(type) {
  const normalizedType = String(type ?? "").trim().toLocaleUpperCase("pl-PL");
  if (normalizedType === "SPRZEDANY") return "SPRZEDANY";
  if (normalizedType === "REZERWACJA") return "REZERWACJA";
  if (normalizedType === "ZWROT") return "ZWROT";
  if (normalizedType === "NA STANIE") return "NA STANIE";
  return "NA STANIE";
}

function normalizeEzwmStatus(value) {
  const normalizedValue = String(value ?? "").trim().toLocaleUpperCase("pl-PL");
  if (normalizedValue === "POBRANE") return "POBRANE";
  if (normalizedValue === "REALIZACJA") return "REALIZACJA";
  return "";
}

function normalizeRepairCategory(category) {
  const normalizedCategory = String(category ?? "").trim().toLocaleUpperCase("pl-PL");
  if (normalizedCategory === "NAPRAWA") return "NAPRAWA GWARANCYJNA";
  if (normalizedCategory === "NAPRAWA GWARANCYJNA") return "NAPRAWA GWARANCYJNA";
  if (normalizedCategory === "NAPRAWA POGWARANCYJNA") return "NAPRAWA POGWARANCYJNA";
  if (normalizedCategory === "WKŁADKA USZNA") return "WKŁADKA USZNA";
  return "WKŁADKA USZNA";
}

function normalizeRepairRecordForUse(record) {
  const normalizedRecord = { ...record };
  normalizedRecord.category = normalizeRepairCategory(normalizedRecord.category);
  normalizedRecord.location = normalizeRepairLocation(normalizedRecord.location);
  normalizedRecord.customerName = titleCaseName(normalizedRecord.customerName);
  normalizedRecord.status = effectiveRepairStatus(normalizedRecord);
  return normalizedRecord;
}

function normalizeDeviceRecordForUse(record) {
  const normalizedRecord = { ...record };
  normalizedRecord.deviceName = normalizeDeviceName(normalizedRecord.deviceName);
  normalizedRecord.customerName = titleCaseName(normalizedRecord.customerName);
  normalizedRecord.serialNumber = normalizeSerialNumber(normalizedRecord.serialNumber);
  normalizedRecord.salesInvoice = normalizeSalesInvoice(normalizedRecord.salesInvoice);
  normalizedRecord.location = normalizeRepairLocation(normalizedRecord.location);
  normalizedRecord.type = normalizeDeviceType(normalizedRecord.type || "NA STANIE");
  normalizedRecord.ezwm = normalizeEzwmStatus(normalizedRecord.ezwm);
  return normalizedRecord;
}

function normalizeDemoRecordForUse(record) {
  const normalizedRecord = { ...record };
  demoFields.forEach((field) => {
    normalizedRecord[field] = String(normalizedRecord[field] ?? "").trim();
  });
  normalizedRecord.serialNumber = normalizeSerialNumber(normalizedRecord.serialNumber);
  normalizedRecord.manufacturer = normalizedRecord.manufacturer.toLocaleUpperCase("pl-PL");
  normalizedRecord.currentUser = titleCaseName(normalizedRecord.currentUser);
  normalizedRecord.status = normalizeDemoStatus(normalizedRecord.status, normalizedRecord);
  normalizedRecord.manufacturerReturnDateCleared = normalizeBooleanFlag(normalizedRecord.manufacturerReturnDateCleared);
  normalizedRecord.purpose = normalizeDemoPurpose(normalizedRecord.purpose);
  normalizedRecord.location = normalizeDemoLocation(normalizedRecord.location);
  normalizedRecord.loanHistory = normalizeDemoLoanHistory(normalizedRecord.loanHistory);
  normalizedRecord.currentAttachments = normalizeDemoAttachments(normalizedRecord.currentAttachments);
  normalizedRecord.sourceRow = String(normalizedRecord.sourceRow ?? "").trim();
  return normalizedRecord;
}

function normalizeDemoPurpose(value) {
  const normalizedPurpose = String(value ?? "").trim().toLocaleUpperCase("pl-PL");
  if (
    normalizedPurpose === DEMO_PURPOSE_REPLACEMENT ||
    normalizedPurpose.includes("ZASTĘPC") ||
    normalizedPurpose.includes("ZASTEPC") ||
    normalizedPurpose.includes("ZAMIEN")
  ) {
    return DEMO_PURPOSE_REPLACEMENT;
  }
  return DEMO_PURPOSE_TEST;
}

function normalizeBooleanFlag(value) {
  return value === true || String(value ?? "").trim() === "1" ? "1" : "";
}

function normalizeDemoLoanHistory(history) {
  if (!Array.isArray(history)) return [];
  return history
    .map((entry) => ({
      id: String(entry?.id || makeId()),
      currentUser: titleCaseName(entry?.currentUser),
      loanDate: String(entry?.loanDate ?? "").trim(),
      returnDate: String(entry?.returnDate ?? "").trim(),
      attachments: normalizeDemoAttachments(entry?.attachments)
    }))
    .filter((entry) => entry.currentUser || entry.loanDate || entry.returnDate);
}

function normalizeDemoAttachments(attachments) {
  if (!Array.isArray(attachments)) return [];
  return attachments
    .map((attachment) => {
      const normalizedAttachment = {
        id: String(attachment?.id || makeId()),
        name: String(attachment?.name || "Załącznik").trim(),
        type: String(attachment?.type || "").trim(),
        size: Number(attachment?.size) || 0,
        path: String(attachment?.path || "").trim(),
        dataUrl: String(attachment?.dataUrl || "").trim()
      };
      if (typeof File !== "undefined" && attachment?.file instanceof File) normalizedAttachment.file = attachment.file;
      return normalizedAttachment;
    })
    .filter((attachment) => attachment.path || attachment.dataUrl || attachment.file);
}

function demoAttachmentDrafts(attachments) {
  if (!Array.isArray(attachments)) return [];
  return attachments.map((attachment) => ({ ...attachment }));
}

function effectiveDemoLoanHistory(record) {
  if (!record) return [];
  const history = normalizeDemoLoanHistory(record?.loanHistory);
  if (history.length || record.loanHistoryManaged === true || normalizeDemoStatus(record?.status, record) !== "ZWRÓCONO" || !record?.returnDate) {
    return history;
  }

  return [{
    id: `legacy-${record.id || "demo"}-${record.loanDate || "bez-daty"}-${record.returnDate}`,
    currentUser: titleCaseName(record.currentUser),
    loanDate: String(record.loanDate ?? "").trim(),
    returnDate: String(record.returnDate ?? "").trim(),
    attachments: []
  }];
}

function validateDemoAttachmentFile(file) {
  if (!DEMO_ATTACHMENT_TYPES.has(file.type)) return "Dozwolone formaty: PDF, JPG i PNG.";
  if (file.size > DEMO_ATTACHMENT_MAX_BYTES) return "Maksymalny rozmiar jednego pliku to 10 MB.";
  return "";
}

function demoAttachmentFromFile(file) {
  return {
    id: makeId(),
    name: file.name,
    type: file.type,
    size: file.size,
    path: "",
    dataUrl: "",
    file
  };
}

function addDemoAttachmentFiles(files, target) {
  const attachments = target();
  const errors = [];
  for (const file of files) {
    const error = validateDemoAttachmentFile(file);
    if (error) {
      errors.push(`${file.name}: ${error}`);
      continue;
    }
    attachments.push(demoAttachmentFromFile(file));
  }
  demoFormError.textContent = errors.join(" ");
}

function formatFileSize(bytes) {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${Math.ceil(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error(`Nie udało się odczytać pliku ${file.name}.`));
    reader.readAsDataURL(file);
  });
}

function dataUrlToBlob(dataUrl) {
  const match = String(dataUrl || "").match(/^data:([^;,]+);base64,(.+)$/);
  if (!match) throw new Error("Nie udało się odczytać lokalnego załącznika.");
  const [, type, encoded] = match;
  const binary = atob(encoded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return new Blob([bytes], { type });
}

function safeAttachmentFileName(value) {
  return String(value || "zalacznik")
    .normalize("NFKD")
    .replace(/[^\w.-]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 100);
}

async function uploadDemoAttachment(recordId, attachment) {
  if (attachment.path && !attachment.file) {
    const { file, ...storedAttachment } = attachment;
    return { ...storedAttachment, dataUrl: "" };
  }

  if (!hasSupabaseConfig) {
    if (!attachment.file) return attachment;
    const { file, ...storedAttachment } = attachment;
    return { ...storedAttachment, dataUrl: await fileToDataUrl(file) };
  }

  const uploadBody = attachment.file || dataUrlToBlob(attachment.dataUrl);
  if (!DEMO_ATTACHMENT_TYPES.has(uploadBody.type) || uploadBody.size > DEMO_ATTACHMENT_MAX_BYTES) {
    throw new Error(`${attachment.name}: nieprawidłowy format lub plik większy niż 10 MB.`);
  }
  const path = `${currentSupabaseUser?.id || "shared"}/${recordId}/${attachment.id}-${safeAttachmentFileName(attachment.name)}`;
  let error;
  try {
    ({ error } = await supabaseClient.storage.from(DEMO_ATTACHMENTS_BUCKET).upload(path, uploadBody, {
      cacheControl: "3600",
      contentType: uploadBody.type || attachment.type,
      upsert: true
    }));
  } catch (requestError) {
    throw new Error(`Nie udało się połączyć z Supabase Storage podczas wysyłania ${attachment.name}. Szczegóły: ${requestError.message}`);
  }
  if (error) {
    const bucketMissing = /bucket not found/i.test(error.message || "");
    throw new Error(
      bucketMissing
        ? "Brak magazynu załączników w Supabase. Uruchom plik supabase-attachments.sql w Supabase SQL Editor."
        : `Nie udało się wysłać załącznika ${attachment.name}: ${error.message}`
    );
  }
  return { id: attachment.id, name: attachment.name, type: uploadBody.type || attachment.type, size: uploadBody.size || attachment.size, path, dataUrl: "" };
}

async function prepareDemoAttachmentsForSave(recordId) {
  demoCurrentAttachmentsDraft = await Promise.all(demoCurrentAttachmentsDraft.map((attachment) => uploadDemoAttachment(recordId, attachment)));
  demoLoanHistoryDraft = await Promise.all(
    demoLoanHistoryDraft.map(async (entry) => ({
      ...entry,
      attachments: await Promise.all(normalizeDemoAttachments(entry.attachments).map((attachment) => uploadDemoAttachment(recordId, attachment)))
    }))
  );
}

function assertDemoRecordReadyForSupabase(record) {
  if (!hasSupabaseConfig) return;
  const attachments = [
    ...normalizeDemoAttachments(record.currentAttachments),
    ...normalizeDemoLoanHistory(record.loanHistory).flatMap((entry) => entry.attachments)
  ];
  if (attachments.some((attachment) => attachment.dataUrl || attachment.file || !attachment.path)) {
    throw new Error("Nie wszystkie załączniki zostały wysłane do Supabase Storage. Spróbuj zapisać ponownie.");
  }
}

function demoAttachmentPaths(record) {
  return [
    ...normalizeDemoAttachments(record?.currentAttachments),
    ...normalizeDemoLoanHistory(record?.loanHistory).flatMap((entry) => entry.attachments)
  ]
    .map((attachment) => attachment.path)
    .filter(Boolean);
}

async function removeDemoAttachmentPaths(paths) {
  if (!hasSupabaseConfig || !paths.length) return;
  const { error } = await supabaseClient.storage.from(DEMO_ATTACHMENTS_BUCKET).remove(paths);
  if (error) throw new Error(`Nie udało się usunąć załączników: ${error.message}`);
}

async function demoAttachmentUrl(attachment) {
  if (attachment.file) return URL.createObjectURL(attachment.file);
  if (attachment.dataUrl) return attachment.dataUrl;
  if (!attachment.path || !hasSupabaseConfig) throw new Error("Załącznik nie jest dostępny.");
  const { data, error } = await supabaseClient.storage.from(DEMO_ATTACHMENTS_BUCKET).createSignedUrl(attachment.path, 3600);
  if (error || !data?.signedUrl) throw new Error(`Nie udało się otworzyć załącznika: ${error?.message || "brak adresu"}`);
  return data.signedUrl;
}

async function openDemoAttachment(attachment, preview = false) {
  const openedWindow = preview ? null : window.open("", "_blank");
  try {
    const url = await demoAttachmentUrl(attachment);
    if (!preview) {
      if (openedWindow) openedWindow.location.href = url;
      else window.open(url, "_blank", "noopener");
      return;
    }
    demoAttachmentPreviewTitle.textContent = attachment.name;
    const media = document.createElement(attachment.type === "application/pdf" ? "iframe" : "img");
    media.src = url;
    media.title = attachment.name;
    demoAttachmentPreviewBody.replaceChildren(media);
    demoAttachmentPreviewDialog.showModal();
  } catch (error) {
    openedWindow?.close();
    demoFormError.textContent = error.message;
  }
}

function renderDemoAttachments(container, attachments, onRemove) {
  const fragment = document.createDocumentFragment();
  if (!attachments.length) {
    const empty = document.createElement("span");
    empty.className = "demo-attachments-empty";
    empty.textContent = "Brak załączników";
    fragment.append(empty);
  }
  attachments.forEach((attachment) => {
    const item = document.createElement("div");
    item.className = "demo-attachment-item";
    const name = document.createElement("strong");
    name.textContent = attachment.name;
    const size = document.createElement("small");
    size.textContent = formatFileSize(attachment.size);
    const previewButton = document.createElement("button");
    previewButton.type = "button";
    previewButton.textContent = "Podgląd";
    previewButton.addEventListener("click", () => openDemoAttachment(attachment, true));
    const openButton = document.createElement("button");
    openButton.type = "button";
    openButton.textContent = "Otwórz";
    openButton.addEventListener("click", () => openDemoAttachment(attachment));
    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "attachment-remove";
    removeButton.textContent = "Usuń";
    removeButton.addEventListener("click", () => onRemove(attachment.id));
    item.append(name, size, previewButton, openButton, removeButton);
    fragment.append(item);
  });
  container.replaceChildren(fragment);
}

function renderDemoCurrentAttachments() {
  renderDemoAttachments(demoCurrentAttachmentsList, demoCurrentAttachmentsDraft, (attachmentId) => {
    demoCurrentAttachmentsDraft = demoCurrentAttachmentsDraft.filter((attachment) => attachment.id !== attachmentId);
    renderDemoCurrentAttachments();
  });
}

function normalizeDeviceRecordsForUse(recordsToNormalize) {
  return recordsToNormalize
    .map(normalizeDeviceRecordForUse)
    .filter(hasValidDeviceIdentity);
}

function normalizeRepairRecordsForUse(recordsToNormalize) {
  return recordsToNormalize.map(normalizeRepairRecordForUse);
}

function normalizeDemoRecordsForUse(recordsToNormalize) {
  return recordsToNormalize.map(normalizeDemoRecordForUse);
}

function demoLocationGroup(record) {
  const text = normalize(record.location);
  if (text.includes("t12")) return "T12";
  if (text.includes("p50")) return "P50";
  if (text.includes("p63")) return "P63";
  if (text.includes("żywiec") || text.includes("zywiec")) return "ŻYWIEC";
  if (!text.trim()) return "BRAK";
  return "INNE";
}

function demoMissingStatus(record) {
  const text = normalize(`${record.location} ${record.currentUser}`);
  return /zgubion|brak na stanie|brak\s*-/.test(text);
}

function isPhilipsHearLink(record) {
  return normalize(record.manufacturer).trim() === "philips" && normalize(record.deviceName).includes("hearlink");
}

function addCalendarMonths(value, months) {
  const match = String(value ?? "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return "";

  const [, yearText, monthText, dayText] = match;
  const targetMonth = Number(monthText) - 1 + months;
  const targetYear = Number(yearText) + Math.floor(targetMonth / 12);
  const normalizedMonth = ((targetMonth % 12) + 12) % 12;
  const lastDay = new Date(targetYear, normalizedMonth + 1, 0).getDate();
  const day = Math.min(Number(dayText), lastDay);
  return `${targetYear}-${String(normalizedMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function addCalendarDays(value, days) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "";
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function daysUntilDate(value) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((date - today) / 86400000);
}

function isPastDate(value) {
  const days = daysUntilDate(value);
  return days !== null && days < 0;
}

function demoReturnDeadlineInfo(record) {
  const status = normalizeDemoStatus(record.status, record);
  if (status === "ZWRÓCONO" && record.returnDate) return { date: record.returnDate, source: "returned" };
  if (String(record.currentUser ?? "").trim() && record.loanDate) {
    return { date: addCalendarDays(record.loanDate, DEMO_LOAN_DAYS), source: "loan" };
  }
  if (record.manufacturerReturnDate) {
    return { date: record.manufacturerReturnDate, source: "manufacturer" };
  }
  if (isDemoManufacturerReturnDateCleared(record)) {
    return { date: "", source: "" };
  }
  if (isPhilipsHearLink(record) && record.receivedDate) {
    return { date: addCalendarMonths(record.receivedDate, 6), source: "philips" };
  }
  return { date: "", source: "" };
}

function isDemoManufacturerReturnDateCleared(record) {
  return normalizeBooleanFlag(record?.manufacturerReturnDateCleared) === "1";
}

function demoReturnDeadline(record) {
  return demoReturnDeadlineInfo(record).date;
}

function demoReturnLevel(days, source = "") {
  if (source === "loan") return days !== null && days <= 0 ? "critical" : "";
  if (days === null || days > DEMO_RETURN_WARNING_DAYS) return "";
  return days <= DEMO_RETURN_CRITICAL_DAYS ? "critical" : "warning";
}

function demoReturnTimeLabel(days) {
  if (days === null) return "";
  if (days < 0) return `${formatDaysLabel(Math.abs(days))} po terminie`;
  if (days === 0) return "zwrot dzisiaj";
  return `za ${formatDaysLabel(days)}`;
}

function normalizeDemoStatus(value, record = {}) {
  const normalizedStatus = String(value ?? "").trim().toLocaleUpperCase("pl-PL");
  if (["NA STANIE", "WYPOŻYCZONY", "BRAK", "DO ZWROTU", "ZWRÓCONO"].includes(normalizedStatus)) return normalizedStatus;
  if (demoMissingStatus(record)) return "BRAK";
  if (String(record.currentUser ?? "").trim()) return "WYPOŻYCZONY";
  return "NA STANIE";
}

function demoStatusFromCurrentUser(currentUser) {
  return String(currentUser ?? "").trim() ? "WYPOŻYCZONY" : "NA STANIE";
}

function demoStatus(record) {
  const status = normalizeDemoStatus(record.status, record);
  if (status === "BRAK") return status;
  if (status === "ZWRÓCONO") {
    if (isPastDate(record.manufacturerReturnDate) || record.returnDate) return "ZWRÓCONO";
    return demoStatusFromCurrentUser(record.currentUser);
  }
  const deadline = demoReturnDeadlineInfo(record);
  const returnDays = daysUntilDate(deadline.date);
  if (deadline.source === "loan" && demoReturnLevel(returnDays, deadline.source)) return "DO ZWROTU";
  return status;
}

function demoQualityIssues(record, serialCounts = null) {
  const issues = [];
  if (!record.receivedDate) issues.push("brak daty");
  if (!record.manufacturer) issues.push("brak producenta");
  if (!record.deviceName) issues.push("brak nazwy aparatu");
  if (!record.serialNumber) issues.push("brak numeru seryjnego");
  if (record.serialNumber && serialCounts?.get(record.serialNumber) > 1) issues.push("powtórzony numer seryjny");
  if (/[?]{2,}/.test(`${record.location} ${record.currentUser} ${record.notes}`)) issues.push("niepewna informacja");
  if (/^\d{5}$/.test(record.location)) issues.push("miejsce zapisane jako liczba");
  return issues;
}

function displayType(record) {
  return normalizeDeviceType(record.type);
}

function hasValidStockIdentity(record) {
  const deviceName = String(record.deviceName ?? "").trim();
  const serialNumber = normalizeSerialNumber(record.serialNumber);
  return Boolean(deviceName && serialNumber && !/^(BRAK NUMERU|FV)$/u.test(serialNumber));
}

function hasValidDeviceIdentity(record) {
  const deviceName = normalizeDeviceName(record.deviceName);
  const serialNumber = normalizeSerialNumber(record.serialNumber);
  return Boolean(deviceName || (serialNumber && !/^(BRAK NUMERU|FV)$/u.test(serialNumber)));
}

function shouldAutoSetDeviceType(data) {
  return Boolean(String(data.returnDate ?? "").trim() || String(data.customerName ?? "").trim() || String(data.salesInvoice ?? "").trim());
}

function suggestedDeviceType(data, fallbackType = "NA STANIE") {
  const hasCustomerName = Boolean(String(data.customerName ?? "").trim());
  const hasSalesInvoiceValue = Boolean(String(data.salesInvoice ?? "").trim());
  const hasReturnDate = Boolean(String(data.returnDate ?? "").trim());

  if (hasReturnDate) return "ZWROT";
  if (hasCustomerName && hasSalesInvoiceValue) return "SPRZEDANY";
  if (hasCustomerName) return "REZERWACJA";
  return normalizeDeviceType(fallbackType);
}

function renderTableRows(body, rows) {
  const fragment = document.createDocumentFragment();
  rows.forEach((row) => fragment.append(row));
  body.replaceChildren(fragment);
}

function visibleTableItems(items, tableKey) {
  return items.slice(0, tableRenderLimits[tableKey] || TABLE_RENDER_BATCH_SIZE);
}

function resetTableRenderLimit(tableKey) {
  tableRenderLimits[tableKey] = TABLE_RENDER_BATCH_SIZE;
}

function showMoreTableRows(tableKey, renderAction) {
  tableRenderLimits[tableKey] = (tableRenderLimits[tableKey] || TABLE_RENDER_BATCH_SIZE) + TABLE_RENDER_BATCH_SIZE;
  renderAction();
}

function renderLimitNotice(notice, textNode, totalCount, visibleCount, itemLabel) {
  if (!notice || !textNode) return;
  const isLimited = totalCount > visibleCount;
  notice.hidden = !isLimited;
  if (!isLimited) return;

  textNode.textContent = `Pokazano ${visibleCount} z ${totalCount} ${itemLabel}. Użyj wyszukiwarki albo pokaż kolejne.`;
}

function rebuildDeviceDerivedData() {
  deviceDerived.clear();
  deviceStats = { all: records.length, sold: 0, reserved: 0, stock: 0 };

  records.forEach((record) => {
    const display = displayType(record);
    const sold = display === "SPRZEDANY";
    const fifoExcluded = sold || display === "ZWROT";
    const inStock = display === "NA STANIE" && hasValidStockIdentity(record);
    const age = fifoExcluded ? null : stockAge(record);
    const location = normalizeRepairLocation(record.location);

    if (sold) deviceStats.sold += 1;
    if (display === "REZERWACJA") deviceStats.reserved += 1;
    if (inStock) deviceStats.stock += 1;

    deviceDerived.set(record.id, {
      displayType: display,
      isSold: sold,
      fifoExcluded,
      isInStock: inStock,
      age,
      fifoLevel: fifoExcluded ? "" : age === null ? "" : age >= 180 ? "critical" : age >= 90 ? "warning" : "",
      ageLevel: fifoExcluded ? "" : age === null ? "missing" : age >= 180 ? "critical" : age >= 90 ? "warning" : age >= 30 ? "aging" : "fresh",
      location,
      searchBlob: fields.map((field) => normalize(record[field])).join("\n")
    });
  });
}

function rebuildRepairDerivedData() {
  repairDerived.clear();
  repairStats = { all: repairRecords.length, repairs: 0, inserts: 0, open: 0 };

  repairRecords.forEach((record) => {
    const category = normalizeRepairCategory(record.category);
    const status = effectiveRepairStatus(record);
    const location = normalizeRepairLocation(record.location);
    const closed = status === "ODEBRANE";

    if (category.startsWith("NAPRAWA")) repairStats.repairs += 1;
    if (category === "WKŁADKA USZNA") repairStats.inserts += 1;
    if (!closed) repairStats.open += 1;

    repairDerived.set(record.id, {
      category,
      status,
      location,
      closed,
      searchBlob: [...repairFields.map((field) => record[field]), category, status].map(normalize).join("\n")
    });
  });
}

function rebuildDemoDerivedData() {
  demoDerived.clear();
  demoStats = { all: demoRecords.length, stock: 0, loaned: 0, returnDue: 0 };
  const serialCounts = new Map();

  demoRecords.forEach((record) => {
    if (!record.serialNumber) return;
    serialCounts.set(record.serialNumber, (serialCounts.get(record.serialNumber) || 0) + 1);
  });

  demoRecords.forEach((record) => {
    const status = demoStatus(record);
    const locationGroup = demoLocationGroup(record);
    const issues = demoQualityIssues(record, serialCounts);
    const deadline = demoReturnDeadlineInfo(record);
    const returnDeadline = deadline.date;
    const returnDays = daysUntilDate(returnDeadline);
    const returnLevel = status === "ZWRÓCONO" ? "" : demoReturnLevel(returnDays, deadline.source);
    const purpose = normalizeDemoPurpose(record.purpose);
    const historyText = normalizeDemoLoanHistory(record.loanHistory)
      .flatMap((entry) => [entry.currentUser, entry.loanDate, entry.returnDate])
      .join(" ");
    if (status === "NA STANIE") demoStats.stock += 1;
    if (status === "WYPOŻYCZONY") demoStats.loaned += 1;
    if (status === "DO ZWROTU") demoStats.returnDue += 1;

    demoDerived.set(record.id, {
      status,
      locationGroup,
      issues,
      manufacturer: normalize(record.manufacturer).trim(),
      purpose,
      returnDeadline,
      returnDays,
      returnLevel,
      returnSource: deadline.source,
      searchBlob: [...demoFields.map((field) => record[field]), historyText, status, purpose, locationGroup, returnDeadline, ...issues].map(normalize).join("\n")
    });
  });
}

function rebuildDemoManufacturerFilter() {
  if (!demoManufacturerFilter) return;
  const selectedValue = demoManufacturerFilter.value;
  const manufacturers = [...new Set(demoRecords.map((record) => String(record.manufacturer ?? "").trim()).filter(Boolean))].sort((left, right) =>
    collator.compare(left, right)
  );
  const fragment = document.createDocumentFragment();
  const allOption = document.createElement("option");
  allOption.value = "";
  allOption.textContent = "Wszyscy";
  fragment.append(allOption);

  manufacturers.forEach((manufacturer) => {
    const option = document.createElement("option");
    option.value = normalize(manufacturer).trim();
    option.textContent = manufacturer;
    fragment.append(option);
  });

  demoManufacturerFilter.replaceChildren(fragment);
  demoManufacturerFilter.value = manufacturers.some((manufacturer) => normalize(manufacturer).trim() === selectedValue) ? selectedValue : "";
}

function rebuildDemoFormSuggestions() {
  if (!demoManufacturerSuggestions || !demoDeviceNameSuggestions) return;

  const manufacturers = [...new Set(demoRecords.map((record) => String(record.manufacturer ?? "").trim()).filter(Boolean))].sort((left, right) =>
    collator.compare(left, right)
  );
  const models = [...new Set(demoRecords.map((record) => String(record.deviceName ?? "").trim()).filter(Boolean))].sort((left, right) =>
    collator.compare(left, right)
  );

  const manufacturerFragment = document.createDocumentFragment();
  manufacturers.forEach((manufacturer) => {
    const option = document.createElement("option");
    option.value = manufacturer;
    manufacturerFragment.append(option);
  });
  demoManufacturerSuggestions.replaceChildren(manufacturerFragment);

  const modelFragment = document.createDocumentFragment();
  models.slice(0, MAX_DEVICE_NAME_SUGGESTIONS).forEach((model) => {
    const option = document.createElement("option");
    option.value = model;
    modelFragment.append(option);
  });
  demoDeviceNameSuggestions.replaceChildren(modelFragment);
}

function rebuildSerialIndex() {
  serialIndex.clear();

  records.forEach((record) => {
    const serial = normalizeSerialNumber(record.serialNumber);
    if (!serial) return;
    if (!serialIndex.has(serial)) serialIndex.set(serial, []);
    serialIndex.get(serial).push({
      source: "devices",
      id: record.id,
      notebook: "Zeszyt aparatów",
      label: [record.deviceName, deviceDerived.get(record.id)?.displayType ?? displayType(record), record.customerName].filter(Boolean).join(" / ")
    });
  });

  repairRecords.forEach((record) => {
    const serial = normalizeSerialNumber(record.serialNumber);
    if (!serial) return;
    if (!serialIndex.has(serial)) serialIndex.set(serial, []);
    serialIndex.get(serial).push({
      source: "repairs",
      id: record.id,
      notebook: "Zeszyt napraw i wkładek",
      label: [record.customerName, record.deviceName, repairDerived.get(record.id)?.status ?? effectiveRepairStatus(record)].filter(Boolean).join(" / ")
    });
  });

  demoRecords.forEach((record) => {
    const serial = normalizeSerialNumber(record.serialNumber);
    if (!serial) return;
    if (!serialIndex.has(serial)) serialIndex.set(serial, []);
    serialIndex.get(serial).push({
      source: "demo",
      id: record.id,
      notebook: "Aparaty demo",
      label: [record.manufacturer, record.deviceName, demoDerived.get(record.id)?.status ?? demoStatus(record)].filter(Boolean).join(" / ")
    });
  });
}

function rebuildDeviceNameSuggestions() {
  const uniqueNames = new Set();

  records.forEach((record) => {
    const name = String(record.deviceName ?? "").trim();
    if (name) uniqueNames.add(name);
  });

  repairRecords.forEach((record) => {
    const name = String(record.deviceName ?? "").trim();
    if (name) uniqueNames.add(name);
  });

  const fragment = document.createDocumentFragment();
  [...uniqueNames]
    .sort((left, right) => collator.compare(left, right))
    .slice(0, MAX_DEVICE_NAME_SUGGESTIONS)
    .forEach((name) => {
      const option = document.createElement("option");
      option.value = name;
      fragment.append(option);
    });

  deviceNameSuggestions.replaceChildren(fragment);
}

function rebuildCustomerNameSuggestions() {
  const uniqueNames = new Set();

  records.forEach((record) => {
    const name = String(record.customerName ?? "").trim();
    if (name) uniqueNames.add(name);
  });

  repairRecords.forEach((record) => {
    const name = String(record.customerName ?? "").trim();
    if (name) uniqueNames.add(name);
  });

  const fragment = document.createDocumentFragment();
  [...uniqueNames]
    .sort((left, right) => collator.compare(left, right))
    .slice(0, MAX_DEVICE_NAME_SUGGESTIONS)
    .forEach((name) => {
      const option = document.createElement("option");
      option.value = name;
      fragment.append(option);
    });

  customerNameSuggestions.replaceChildren(fragment);
}

function rebuildDerivedData() {
  rebuildDeviceDerivedData();
  rebuildRepairDerivedData();
  rebuildDemoDerivedData();
  rebuildDemoManufacturerFilter();
  rebuildDemoFormSuggestions();
  rebuildSerialIndex();
  rebuildDeviceNameSuggestions();
  rebuildCustomerNameSuggestions();
}

function deviceSortValue(record, key) {
  const meta = deviceDerived.get(record.id);
  if (key === "stockAge") return meta?.age ?? -1;
  if (key === "type") return meta?.displayType ?? displayType(record);
  if (key === "location") return meta?.location ?? normalizeRepairLocation(record.location);
  return String(record[key] ?? "");
}

function filteredRecords() {
  const query = normalize(searchInput.value).trim();
  const selectedType = typeFilter.value;
  const selectedEzwm = ezwmFilter.value;
  const selectedFifo = fifoFilter.value;

  return records
    .filter((record) => {
      const meta = deviceDerived.get(record.id);
      const matchesType = !selectedType || meta?.displayType === selectedType;
      const ezwm = normalizeEzwmStatus(record.ezwm);
      const matchesEzwm = !selectedEzwm || (selectedEzwm === "BRAK" ? !ezwm : ezwm === selectedEzwm);
      const age = meta?.age ?? null;
      const matchesFifo =
        !selectedFifo ||
        (!meta?.fifoExcluded && selectedFifo === "fifo") ||
        (!meta?.fifoExcluded && selectedFifo === "90" && age !== null && age >= 90) ||
        (!meta?.fifoExcluded && selectedFifo === "180" && age !== null && age >= 180);
      const matchesQuery = !query || meta?.searchBlob.includes(query);
      return matchesType && matchesEzwm && matchesFifo && matchesQuery;
    })
    .sort((left, right) => {
      if (selectedFifo) {
        return compareByAge(left, right);
      }

      if (sortState.key === "stockAge") {
        return compareByAge(left, right) * (sortState.direction === "asc" ? -1 : 1);
      }

      const a = normalize(deviceSortValue(left, sortState.key));
      const b = normalize(deviceSortValue(right, sortState.key));
      return sortState.direction === "asc" ? collator.compare(a, b) : collator.compare(b, a);
    });
}

function compareByAge(left, right) {
  const leftAge = deviceDerived.get(left.id)?.age ?? -1;
  const rightAge = deviceDerived.get(right.id)?.age ?? -1;
  return rightAge - leftAge;
}

function render() {
  updateStats();
  updateDeviceTypeSelectStyles();
  scheduleDemoReturnReminder();

  if (activeNotebook === "repairs") {
    renderRepairRecords();
    return;
  }

  if (activeDeviceView === "demo") {
    renderDemoRecords();
    return;
  }

  if (activeDeviceView === "dataControl") {
    renderDataControlView();
    return;
  }

  if (activeDeviceView === "stock") {
    renderStockView();
    return;
  }

  renderDeviceViews();
}

function renderDeviceViews() {
  const visibleRecords = filteredRecords();
  const renderedRecords = visibleTableItems(visibleRecords, "devices");
  renderTableRows(recordsBody, renderedRecords.map(createRow));
  emptyState.hidden = visibleRecords.length > 0;
  renderLimitNotice(databaseRenderNotice, databaseRenderText, visibleRecords.length, renderedRecords.length, "rekordów");
}

function filteredDemoRecords() {
  const query = normalize(demoSearchInput.value).trim();
  const selectedStatus = demoStatusFilter.value;
  const selectedManufacturer = demoManufacturerFilter.value;
  const selectedLocation = demoLocationFilter.value;

  return demoRecords
    .filter((record) => {
      const meta = demoDerived.get(record.id);
      const matchesStatus = !selectedStatus || meta?.status === selectedStatus;
      const matchesManufacturer = !selectedManufacturer || meta?.manufacturer === selectedManufacturer;
      const matchesLocation = !selectedLocation || meta?.locationGroup === selectedLocation;
      const matchesQuery = !query || meta?.searchBlob.includes(query);
      return matchesStatus && matchesManufacturer && matchesLocation && matchesQuery;
    })
    .sort((left, right) => {
      const leftValue =
        demoSortState.key === "status"
          ? demoDerived.get(left.id)?.status
          : demoSortState.key === "returnDeadline"
            ? demoDerived.get(left.id)?.returnDeadline
            : String(left[demoSortState.key] ?? "");
      const rightValue =
        demoSortState.key === "status"
          ? demoDerived.get(right.id)?.status
          : demoSortState.key === "returnDeadline"
            ? demoDerived.get(right.id)?.returnDeadline
            : String(right[demoSortState.key] ?? "");
      const compared = collator.compare(String(leftValue ?? ""), String(rightValue ?? ""));
      return demoSortState.direction === "asc" ? compared : -compared;
    });
}

function renderDemoRecords() {
  const visibleRecords = filteredDemoRecords();
  const renderedRecords = visibleTableItems(visibleRecords, "demo");
  renderTableRows(demoRecordsBody, renderedRecords.map(createDemoRow));
  demoEmptyState.hidden = visibleRecords.length > 0;
  renderLimitNotice(demoRenderNotice, demoRenderText, visibleRecords.length, renderedRecords.length, "aparatów demo");
  updateDemoChecklistState(visibleRecords);
}

function updateDemoChecklistState(visibleRecords) {
  demoChecklistMeta.textContent = `${dateFormatter.format(new Date())} · ${visibleRecords.length} aparatów demo zgodnych z filtrami`;
  printDemoChecklistBtn.disabled = visibleRecords.length === 0;
}

function renderDemoChecklist(visibleRecords) {
  updateDemoChecklistState(visibleRecords);

  const rows = visibleRecords.map((record, index) => {
    const meta = demoDerived.get(record.id);
    const row = document.createElement("tr");
    const checkbox = document.createElement("span");
    checkbox.className = "checklist-box";
    checkbox.setAttribute("aria-hidden", "true");
    const model = [record.manufacturer, record.deviceName].filter(Boolean).join(" · ");

    const values = [
      String(index + 1),
      checkbox,
      meta?.status ?? demoStatus(record),
      model,
      record.serialNumber,
      meta?.locationGroup ?? demoLocationGroup(record),
      record.currentUser,
      ""
    ];

    values.forEach((value) => {
      const cell = document.createElement("td");
      if (value instanceof HTMLElement) {
        cell.append(value);
      } else {
        cell.textContent = value || "";
      }
      row.append(cell);
    });
    return row;
  });

  renderTableRows(demoChecklistBody, rows);
}

function printDemoChecklist() {
  if (printDemoChecklistBtn.disabled) return;

  renderDemoChecklist(filteredDemoRecords());
  const cleanup = () => document.body.classList.remove("demo-checklist-print");
  document.body.classList.add("demo-checklist-print");
  window.addEventListener("afterprint", cleanup, { once: true });
  window.print();
}

function renderDataControlView() {
  const allIssues = buildDataControlIssues();
  const issues = filteredDataControlIssues(allIssues);
  const renderedIssues = visibleTableItems(issues, "dataControl");

  dataControlSummary.textContent = formatDataIssueCount(issues.length);
  renderDataControlStats(issues, allIssues.length);
  renderTableRows(dataControlBody, renderedIssues.map(createDataControlRow));
  dataControlEmptyState.hidden = issues.length > 0;
  renderLimitNotice(dataControlRenderNotice, dataControlRenderText, issues.length, renderedIssues.length, "spraw");
}

function filteredDataControlIssues(issues) {
  const query = normalize(dataControlSearchInput.value).trim();
  if (!query) return issues;
  return issues.filter((issue) => dataControlSearchBlob(issue).includes(query));
}

function dataControlSearchBlob(issue) {
  return [
    DATA_CONTROL_SEVERITY_LABELS[issue.severity],
    dataControlNotebookLabel(issue.source),
    dataControlRecordLabel(issue),
    issue.serialNumber,
    issue.title,
    issue.detail,
    issue.kind
  ]
    .map(normalize)
    .join("\n");
}

function buildDataControlIssues() {
  const issues = [];

  records.forEach((record) => {
    const duplicateMatches = dataControlDuplicateSerialMatches(record, "devices");
    const type = displayType(record);
    const hasCustomer = Boolean(String(record.customerName ?? "").trim());
    const hasInvoice = Boolean(String(record.salesInvoice ?? "").trim());
    const ezwm = normalizeEzwmStatus(record.ezwm);
    const invoiceIssue = suspiciousSalesInvoiceReason(record.salesInvoice);

    if (!String(record.deviceName ?? "").trim()) {
      addDataControlIssue(issues, record, "devices", "critical", "missing", "Brak nazwy aparatu", "Rekord w bazie nie ma wpisanego modelu aparatu.");
    }
    if (!normalizeSerialNumber(record.serialNumber)) {
      addDataControlIssue(issues, record, "devices", "critical", "missing", "Brak numeru seryjnego", "Bez numeru seryjnego trudniej wykryć duplikaty i sprawdzić stan.");
    }
    if (duplicateMatches.length) {
      addDataControlIssue(
        issues,
        record,
        "devices",
        "critical",
        "duplicate",
        "Duplikat numeru seryjnego",
        duplicateSerialSummary(duplicateMatches)
      );
    }
    if (invoiceIssue) {
      addDataControlIssue(issues, record, "devices", "warning", "invoice", "Podejrzana faktura sprzedaży", invoiceIssue);
    }
    if (type === "SPRZEDANY" && !hasInvoice) {
      addDataControlIssue(issues, record, "devices", "critical", "status", "Sprzedany bez faktury", "Status wskazuje sprzedaż, ale faktura sprzedaży jest pusta.");
    }
    if (type === "SPRZEDANY" && !hasCustomer) {
      addDataControlIssue(issues, record, "devices", "warning", "status", "Sprzedany bez klienta", "Status wskazuje sprzedaż, ale imię i nazwisko jest puste.");
    }
    if (type === "SPRZEDANY" && ezwm !== "REALIZACJA") {
      addDataControlIssue(issues, record, "devices", "warning", "ezwm", "Sprzedany bez EZWM realizacja", "Dla sprzedanego aparatu EZWM nie ma statusu realizacja.");
    }
    if (type === "NA STANIE" && (hasCustomer || hasInvoice)) {
      addDataControlIssue(issues, record, "devices", "warning", "status", "Na stanie z klientem lub fakturą", "Rekord wygląda na rezerwację albo sprzedaż, ale status to na stanie.");
    }
    if (type === "ZWROT" && !record.returnDate) {
      addDataControlIssue(issues, record, "devices", "info", "status", "Zwrot bez daty zwrotu", "Status to zwrot, ale data zwrotu/wymiany jest pusta.");
    }
  });

  demoRecords.forEach((record) => {
    const duplicateMatches = dataControlDuplicateSerialMatches(record, "demo");
    const meta = demoDerived.get(record.id);
    const status = meta?.status ?? demoStatus(record);
    const qualityIssues = (meta?.issues || demoQualityIssues(record)).filter((issue) => issue !== "powtórzony numer seryjny");

    if (duplicateMatches.length) {
      addDataControlIssue(
        issues,
        record,
        "demo",
        "critical",
        "duplicate",
        "Duplikat numeru seryjnego",
        duplicateSerialSummary(duplicateMatches)
      );
    }
    qualityIssues.forEach((issue) => {
      const severity = issue.includes("brak numeru") || issue.includes("brak nazwy") ? "critical" : "warning";
      addDataControlIssue(issues, record, "demo", severity, "demo-quality", "Demo do poprawy", issue);
    });
    if (record.currentUser && !record.loanDate) {
      addDataControlIssue(issues, record, "demo", "warning", "demo-loan", "Wypożyczony bez daty wypożyczenia", "Jest wpisana osoba, ale brakuje daty wypożyczenia.");
    }
    if (!record.currentUser && record.loanDate && status !== "ZWRÓCONO") {
      addDataControlIssue(issues, record, "demo", "warning", "demo-loan", "Data wypożyczenia bez osoby", "Data wypożyczenia jest wpisana, ale pole aktualnie używany jest puste.");
    }
    if (meta?.returnLevel) {
      const severity = meta.returnLevel === "critical" ? "critical" : "warning";
      addDataControlIssue(
        issues,
        record,
        "demo",
        severity,
        "demo-return",
        meta.returnSource === "loan" ? "Przekroczony termin wypożyczenia" : "Zbliża się termin zwrotu",
        demoReturnDeadlineLabel(meta)
      );
    }
  });

  return issues.sort(compareDataControlIssues);
}

function addDataControlIssue(issues, record, source, severity, kind, title, detail) {
  issues.push({
    id: `${source}-${record.id}-${kind}-${title}`,
    record,
    source,
    severity,
    kind,
    title,
    detail,
    serialNumber: normalizeSerialNumber(record.serialNumber)
  });
}

function compareDataControlIssues(left, right) {
  const bySeverity = DATA_CONTROL_SEVERITY_ORDER[left.severity] - DATA_CONTROL_SEVERITY_ORDER[right.severity];
  if (bySeverity) return bySeverity;
  const byKind = collator.compare(left.kind, right.kind);
  if (byKind) return byKind;
  return collator.compare(dataControlRecordLabel(left), dataControlRecordLabel(right));
}

function suspiciousSalesInvoiceReason(value) {
  const invoice = normalizeSalesInvoice(value);
  if (!invoice) return "";
  if (/[?]{2,}/.test(invoice)) return "W polu faktury są znaki zapytania.";
  if (/^(T12|P50|P63)(\s|$)/u.test(invoice)) return "W polu faktury wygląda na wpisane miejsce lub datę, nie numer faktury.";
  if (/(ŻYWIEC|ZYWIEC)/u.test(invoice)) return "W polu faktury wygląda na wpisany oddział lub uwagę.";
  return "";
}

function duplicateSerialSummary(matches) {
  return matches
    .slice(0, 4)
    .map((match) => `${match.notebook}: ${match.label || "bez opisu"}`)
    .join(" · ");
}

function dataControlRecordLabel(issue) {
  const record = issue.record;
  if (issue.source === "demo") {
    return [record.manufacturer, record.deviceName, record.currentUser].filter(Boolean).join(" · ") || "Aparat demo";
  }
  return [record.deviceName, record.customerName].filter(Boolean).join(" · ") || "Aparat";
}

function dataControlNotebookLabel(source) {
  return source === "demo" ? "Demo" : "Baza";
}

function createDataControlRow(issue) {
  const row = document.createElement("tr");
  row.className = `data-control-row ${issue.severity}`;

  const cells = [
    createDataSeverityPill(issue.severity),
    dataControlNotebookLabel(issue.source),
    dataControlRecordLabel(issue),
    issue.serialNumber ? createSerialPill(issue.serialNumber, issue.kind === "duplicate" ? dataControlDuplicateSerialMatches(issue.record, issue.source) : []) : "",
    issue.title,
    issue.detail
  ];

  cells.forEach((value) => {
    const cell = document.createElement("td");
    if (value instanceof HTMLElement) {
      cell.append(value);
    } else {
      cell.textContent = value || "-";
      if (!value) cell.classList.add("muted-cell");
    }
    row.append(cell);
  });

  const actions = document.createElement("td");
  actions.className = "row-actions";
  const editButton = document.createElement("button");
  editButton.type = "button";
  editButton.textContent = "Edytuj";
  editButton.addEventListener("click", () => openDataControlIssue(issue));
  actions.append(editButton);
  row.append(actions);
  return row;
}

function createDataSeverityPill(severity) {
  const pill = document.createElement("span");
  pill.className = `data-severity-pill ${severity}`;
  pill.textContent = DATA_CONTROL_SEVERITY_LABELS[severity] || "Do sprawdzenia";
  return pill;
}

function openDataControlIssue(issue) {
  if (issue.source === "demo") {
    const record = demoRecords.find((item) => item.id === issue.record.id);
    if (!record) return;
    switchView("demo", "devices");
    openDemoDialog(record);
    return;
  }

  const record = records.find((item) => item.id === issue.record.id);
  if (!record) return;
  switchView("database", "devices");
  openDialog(record);
}

function renderDataControlStats(issues, totalCount = issues.length) {
  const counts = {
    duplicate: issues.filter((issue) => issue.kind === "duplicate").length,
    critical: issues.filter((issue) => issue.severity === "critical").length,
    warning: issues.filter((issue) => issue.severity === "warning").length,
    demo: issues.filter((issue) => issue.source === "demo").length,
    all: totalCount
  };

  const fragment = document.createDocumentFragment();
  [
    ["Wszystkie", counts.all],
    ["Duplikaty", counts.duplicate],
    ["Pilne", counts.critical],
    ["Do sprawdzenia", counts.warning],
    ["Demo", counts.demo]
  ].forEach(([label, value]) => {
    const item = document.createElement("div");
    item.className = "data-control-stat";
    const number = document.createElement("strong");
    number.textContent = String(value);
    const text = document.createElement("span");
    text.textContent = label;
    item.append(number, text);
    fragment.append(item);
  });

  dataControlStats.replaceChildren(fragment);
}

function formatDataIssueCount(count) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (count === 1) return "1 sprawa do sprawdzenia";
  if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) return `${count} sprawy do sprawdzenia`;
  return `${count} spraw do sprawdzenia`;
}

function filteredRepairRecords() {
  const query = normalize(repairSearchInput.value).trim();
  const selectedCategory = repairCategoryFilter.value;
  const selectedStatus = repairStatusFilter.value;
  const selectedLocation = repairLocationFilter.value;

  const matchingRecords = repairRecords
    .filter((record) => {
      const meta = repairDerived.get(record.id);
      const category = meta?.category ?? normalizeRepairCategory(record.category);
      const status = meta?.status ?? effectiveRepairStatus(record);
      const location = meta?.location ?? normalizeRepairLocation(record.location);
      const matchesCategory = !selectedCategory || category === selectedCategory;
      const matchesStatus = !selectedStatus || status === selectedStatus;
      const matchesLocation = !selectedLocation || location === selectedLocation;
      const matchesQuery = !query || meta?.searchBlob.includes(query);
      return matchesCategory && matchesStatus && matchesLocation && matchesQuery;
    });

  return sortRepairRecords(matchingRecords);
}

function repairSortValue(record, key) {
  const meta = repairDerived.get(record.id);
  if (key === "category") return meta?.category ?? normalizeRepairCategory(record.category);
  if (key === "location") return meta?.location ?? normalizeRepairLocation(record.location);
  if (key === "status") return meta?.status ?? effectiveRepairStatus(record);
  return record[key];
}

function isRepairClosed(record) {
  return repairDerived.get(record.id)?.closed ?? effectiveRepairStatus(record) === "ODEBRANE";
}

function renderRepairRecords() {
  const visibleRecords = filteredRepairRecords();
  const openRecords = openRepairRecords();
  const renderedRecords = visibleTableItems(visibleRecords, "repairs");
  const renderedOpenRecords = visibleTableItems(openRecords, "repairOpen");
  renderTableRows(repairRecordsBody, renderedRecords.map(createRepairRow));
  renderTableRows(repairOpenRecordsBody, renderedOpenRecords.map(createRepairRow));
  repairEmptyState.hidden = visibleRecords.length > 0;
  repairOpenEmptyState.hidden = openRecords.length > 0;
  renderLimitNotice(repairRenderNotice, repairRenderText, visibleRecords.length, renderedRecords.length, "wpisów");
  renderLimitNotice(repairOpenRenderNotice, repairOpenRenderText, openRecords.length, renderedOpenRecords.length, "spraw");
}

function openRepairRecords() {
  return sortOpenRepairRecords(repairRecords.filter((record) => !isRepairClosed(record)));
}

function sortRepairRecords(recordsToSort, prioritizeOpen = true) {
  return [...recordsToSort].sort((left, right) => {
    if (prioritizeOpen) {
      const byOpenStatus = Number(isRepairClosed(left)) - Number(isRepairClosed(right));
      if (byOpenStatus) return byOpenStatus;
    }

    const a = normalize(repairSortValue(left, repairSortState.key));
    const b = normalize(repairSortValue(right, repairSortState.key));
    return repairSortState.direction === "asc" ? collator.compare(a, b) : collator.compare(b, a);
  });
}

function sortOpenRepairRecords(recordsToSort) {
  return [...recordsToSort].sort((left, right) => {
    const byReturnDate = Number(Boolean(right.returnDate)) - Number(Boolean(left.returnDate));
    if (byReturnDate) return byReturnDate;

    return sortRepairRecords([left, right], false)[0] === left ? -1 : 1;
  });
}

function createRow(record) {
  const row = document.createElement("tr");
  const duplicateMatches = duplicateSerialMatches(record, "devices");
  if (duplicateMatches.length) {
    row.classList.add("serial-duplicate-row");
    row.title = duplicateSerialTitle(duplicateMatches);
  }
  if (displayType(record) === "SPRZEDANY") {
    row.classList.add("device-sold-row");
  }
  const level = deviceDerived.get(record.id)?.fifoLevel ?? fifoLevel(record);
  if (level) row.classList.add(`fifo-${level}`);

  const cells = [
    formatDate(record.receivedDate),
    createAgePill(record),
    record.deviceName,
    createSerialPill(record.serialNumber, duplicateMatches),
    createTypePill(displayType(record)),
    createLocationPill(record.location),
    formatDate(record.pickupDate),
    record.customerName,
    record.salesInvoice,
    createEzwmCell(record),
    createWaybillCell(record.waybillNumber),
    record.notes
  ];

  cells.forEach((value) => {
    const cell = document.createElement("td");
    if (value instanceof HTMLElement) {
      cell.append(value);
    } else {
      cell.textContent = value || "-";
      if (!value) cell.classList.add("muted-cell");
    }
    row.append(cell);
  });

  const actions = document.createElement("td");
  actions.className = "row-actions";

  const editButton = document.createElement("button");
  editButton.type = "button";
  editButton.textContent = "Edytuj";
  editButton.addEventListener("click", () => openDialog(record));

  actions.append(editButton);
  row.append(actions);
  return row;
}

function createDemoRow(record) {
  const row = document.createElement("tr");
  const meta = demoDerived.get(record.id);
  const duplicateMatches = duplicateSerialMatches(record, "demo");
  if (duplicateMatches.length) {
    row.classList.add("serial-duplicate-row");
    row.title = duplicateSerialTitle(duplicateMatches);
  }
  if (meta?.issues.length) row.classList.add("demo-needs-review");
  if (meta?.status === "BRAK") row.classList.add("demo-missing");
  if (meta?.returnLevel) row.classList.add(`demo-return-${meta.returnLevel}`);

  const statusWrap = document.createElement("div");
  const statusPill = document.createElement("span");
  statusPill.className = `status-pill ${meta?.status.replaceAll(" ", "-") || "NA-STANIE"}`;
  statusPill.textContent = meta?.status || "NA STANIE";
  statusWrap.append(statusPill);

  const purposePill = createDemoPurposePill(meta?.purpose ?? record.purpose);
  if (purposePill) statusWrap.append(purposePill);

  if (meta?.issues.length) {
    const quality = document.createElement("span");
    quality.className = "demo-quality";
    quality.textContent = `Do poprawy: ${meta.issues.join(", ")}`;
    statusWrap.append(quality);
  }

  const cells = [
    statusWrap,
    formatDate(record.receivedDate),
    createDemoReturnDeadlineCell(meta),
    record.manufacturer,
    record.deviceName,
    createSerialPill(record.serialNumber, duplicateMatches),
    record.location,
    createDemoCurrentUser(record.currentUser, record.loanDate),
    createDemoNotesCell(record)
  ];

  cells.forEach((value) => {
    const cell = document.createElement("td");
    if (value instanceof HTMLElement) {
      cell.append(value);
    } else {
      cell.textContent = value || "-";
      if (!value) cell.classList.add("muted-cell");
    }
    row.append(cell);
  });

  const actions = document.createElement("td");
  actions.className = "row-actions";
  const editButton = document.createElement("button");
  editButton.type = "button";
  editButton.textContent = "Edytuj";
  editButton.addEventListener("click", () => openDemoDialog(record));
  actions.append(editButton);
  row.append(actions);
  return row;
}

function createDemoPurposePill(value) {
  const purpose = normalizeDemoPurpose(value);
  if (purpose !== DEMO_PURPOSE_REPLACEMENT) return null;
  const pill = document.createElement("span");
  pill.className = "demo-purpose-pill replacement";
  pill.textContent = "Aparat zastępczy";
  return pill;
}

function createDemoCurrentUser(currentUser, loanDate = "") {
  if (!currentUser) return "";
  const wrap = document.createElement("span");
  wrap.className = "demo-current-user";
  const label = document.createElement("small");
  label.textContent = "Używa";
  const name = document.createElement("strong");
  name.textContent = currentUser;
  wrap.append(label, name);
  if (loanDate) {
    const date = document.createElement("span");
    date.textContent = `od ${formatDate(loanDate)}`;
    wrap.append(date);
  }
  return wrap;
}

function createDemoNotesCell(record) {
  const historyCount = effectiveDemoLoanHistory(record).length;
  const attachmentCount =
    normalizeDemoAttachments(record.currentAttachments).length +
    normalizeDemoLoanHistory(record.loanHistory).reduce((count, entry) => count + entry.attachments.length, 0);
  if (!record.notes && !record.loanDate && !record.returnDate && !historyCount && !attachmentCount) return "";
  const wrap = document.createElement("div");
  wrap.className = "demo-notes-cell";

  if (record.loanDate) {
    const loanDate = document.createElement("span");
    loanDate.className = "demo-notes-loan-date";
    loanDate.textContent = `Wypożyczono: ${formatDate(record.loanDate)}`;
    wrap.append(loanDate);
  }

  if (record.returnDate) {
    const returnDate = document.createElement("span");
    returnDate.className = "demo-notes-return-date";
    returnDate.textContent = `Zwrócono: ${formatDate(record.returnDate)}`;
    wrap.append(returnDate);
  }

  if (record.notes) {
    const notes = document.createElement("span");
    notes.textContent = record.notes;
    wrap.append(notes);
  }
  if (historyCount) {
    const history = document.createElement("span");
    history.className = "demo-notes-history";
    history.textContent = `Historia wypożyczeń: ${historyCount}`;
    wrap.append(history);
  }
  if (attachmentCount) {
    const attachments = document.createElement("span");
    attachments.className = "demo-notes-history";
    attachments.textContent = `Załączniki: ${attachmentCount}`;
    wrap.append(attachments);
  }
  return wrap;
}

function createDemoReturnDeadlineCell(meta) {
  if (!meta?.returnDeadline) return "";

  const wrap = document.createElement("span");
  wrap.className = `demo-return-date ${meta.returnLevel || "regular"}`;

  const date = document.createElement("strong");
  date.textContent = formatDate(meta.returnDeadline);
  wrap.append(date);

  const time = document.createElement("small");
  time.textContent = demoReturnDeadlineLabel(meta);
  wrap.append(time);
  return wrap;
}

function demoReturnDeadlineLabel(meta) {
  if (!meta) return "";
  if (meta.returnDays === null || meta.returnDays === undefined) return "do zwrotu";
  if (meta.returnDays < 0) return `po terminie: ${formatDaysLabel(Math.abs(meta.returnDays))}`;
  if (meta.returnDays === 0) return meta.returnSource === "loan" ? "mija 14 dni" : "do zwrotu dzisiaj";
  return `do zwrotu · ${demoReturnTimeLabel(meta.returnDays)}`;
}

function dueDemoReturnRecords() {
  return demoRecords
    .map((record) => ({ record, meta: demoDerived.get(record.id) }))
    .filter(({ meta }) => meta?.returnLevel && !["BRAK", "ZWRÓCONO"].includes(meta.status))
    .sort((left, right) => (left.meta.returnDays ?? Number.MAX_SAFE_INTEGER) - (right.meta.returnDays ?? Number.MAX_SAFE_INTEGER));
}

function scheduleDemoReturnReminder() {
  if (demoReturnReminderShown || demoReturnReminderTimeout || !canShowDemoReturnReminder()) return;
  demoReturnReminderTimeout = window.setTimeout(() => {
    demoReturnReminderTimeout = 0;
    showDemoReturnReminder();
  }, 150);
}

function showDemoReturnReminder() {
  if (
    demoReturnReminderShown ||
    !canShowDemoReturnReminder() ||
    !demoReturnReminderDialog ||
    authDialog?.open ||
    recordDialog.open ||
    repairDialog.open ||
    demoDialog.open
  ) return;
  const dueRecords = dueDemoReturnRecords();
  if (!dueRecords.length) return;

  const criticalCount = dueRecords.filter(({ meta }) => meta.returnLevel === "critical").length;
  const warningCount = dueRecords.length - criticalCount;
  const overdueLoans = dueRecords.filter(({ meta }) => meta.returnSource === "loan").length;
  demoReturnReminderSummary.textContent = `${dueRecords.length} aparatów wymaga uwagi: ${overdueLoans} przekroczyło 14 dni wypożyczenia, ${criticalCount - overdueLoans} pozostałych pilnych, ${warningCount} z terminem w ciągu 30 dni.`;

  const fragment = document.createDocumentFragment();
  dueRecords.forEach(({ record, meta }) => {
    const item = document.createElement("div");
    item.className = `return-reminder-item ${meta.returnLevel}`;

    const description = document.createElement("div");
    const model = document.createElement("strong");
    model.textContent = record.deviceName || "Philips HearLink";
    const serial = document.createElement("span");
    serial.textContent = [record.serialNumber, record.location].filter(Boolean).join(" · ");
    description.append(model, serial);

    const deadline = document.createElement("div");
    deadline.className = "return-reminder-deadline";
    const date = document.createElement("strong");
    date.textContent = formatDate(meta.returnDeadline);
    const time = document.createElement("span");
    time.textContent =
      meta.returnSource === "loan"
        ? meta.returnDays === 0
          ? "Mija 14 dni wypożyczenia"
          : `Przekroczono 14 dni · ${demoReturnTimeLabel(meta.returnDays)}`
        : demoReturnTimeLabel(meta.returnDays);
    deadline.append(date, time);

    item.append(description, deadline);
    fragment.append(item);
  });
  demoReturnReminderList.replaceChildren(fragment);
  demoReturnReminderShown = true;
  markDemoReturnReminderShown();
  demoReturnReminderDialog.showModal();
}

function canShowDemoReturnReminder() {
  const lastShownAt = Number(localStorage.getItem(DEMO_RETURN_REMINDER_STORAGE_KEY) || 0);
  return !lastShownAt || Date.now() - lastShownAt >= DEMO_RETURN_REMINDER_INTERVAL_MS;
}

function markDemoReturnReminderShown() {
  localStorage.setItem(DEMO_RETURN_REMINDER_STORAGE_KEY, String(Date.now()));
}

function createAgePill(record) {
  const meta = deviceDerived.get(record.id);
  if (meta?.fifoExcluded ?? isFifoExcluded(record)) return "";
  const age = meta?.age ?? stockAge(record);
  const pill = document.createElement("span");
  const level = meta?.ageLevel ?? ageLevel(record, age);
  pill.className = `age-pill ${level}`;
  pill.textContent = formatDaysLabel(age);
  return pill;
}

function ageLevel(record, age = stockAge(record)) {
  if (isFifoExcluded(record)) return "";
  if (age === null) return "missing";
  if (age >= 180) return "critical";
  if (age >= 90) return "warning";
  if (age >= 30) return "aging";
  return "fresh";
}

function createSerialPill(serialNumber, duplicateMatches = []) {
  const pill = document.createElement("span");
  pill.className = "serial-pill";
  const serialText = serialNumber || "brak numeru";

  if (!duplicateMatches.length) {
    pill.textContent = serialText;
    return pill;
  }

  pill.classList.add("duplicate");
  pill.title = duplicateSerialTitle(duplicateMatches);

  const number = document.createElement("span");
  number.textContent = serialText;
  const marker = document.createElement("small");
  marker.className = "serial-duplicate-marker";
  marker.textContent = "duplikat";
  pill.append(number, marker);
  return pill;
}

function createWaybillCell(waybillNumber) {
  if (!waybillNumber) return "";

  const wrap = document.createElement("span");
  wrap.className = "waybill-cell";

  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  icon.classList.add("waybill-icon");
  icon.setAttribute("viewBox", "0 0 20 20");
  icon.setAttribute("aria-hidden", "true");

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", "M5 3.5h7l3 3V16a1.5 1.5 0 0 1-1.5 1.5h-8A1.5 1.5 0 0 1 4 16V5A1.5 1.5 0 0 1 5.5 3.5H12v3h3");
  path.setAttribute("fill", "none");
  path.setAttribute("stroke", "currentColor");
  path.setAttribute("stroke-width", "1.6");
  path.setAttribute("stroke-linecap", "round");
  path.setAttribute("stroke-linejoin", "round");
  icon.append(path);

  wrap.append(icon);
  return wrap;
}

function createEzwmCell(record) {
  const normalizedValue = normalizeEzwmStatus(record?.ezwm);
  const soldWithoutRealization = displayType(record) === "SPRZEDANY" && normalizedValue !== "REALIZACJA";

  if (!normalizedValue && !soldWithoutRealization) return "";

  const wrap = document.createElement("span");
  wrap.className = `ezwm-cell ${soldWithoutRealization ? "ezwm-alert" : normalizedValue === "POBRANE" ? "ezwm-progress" : "ezwm-picked"}`;
  wrap.title = soldWithoutRealization
    ? "Sprzedany bez EZWM realizacja"
    : normalizedValue === "POBRANE"
      ? "EZWM pobrane"
      : "EZWM realizacja";
  wrap.setAttribute("aria-label", wrap.title);

  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  icon.classList.add("ezwm-icon");
  icon.setAttribute("viewBox", "0 0 20 20");
  icon.setAttribute("aria-hidden", "true");

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  if (soldWithoutRealization) {
    path.setAttribute("d", "M10 3.5 17 16.5H3zM10 7.2v4.6M10 14.3h.01");
  } else if (normalizedValue === "POBRANE") {
    path.setAttribute("d", "M10 4.5a5.5 5.5 0 1 1-4.1 1.8M10 2.5v3.2M10 10l2.2 2.2");
  } else {
    path.setAttribute("d", "M5 10.5 8.2 13.5 15 6.8");
  }
  path.setAttribute("fill", "none");
  path.setAttribute("stroke", "currentColor");
  path.setAttribute("stroke-width", "1.8");
  path.setAttribute("stroke-linecap", "round");
  path.setAttribute("stroke-linejoin", "round");
  icon.append(path);

  wrap.append(icon);
  return wrap;
}

function createTypePill(type) {
  const pill = document.createElement("span");
  const normalizedType = type || "NA STANIE";
  pill.className = `type-pill ${typeClass(normalizedType)}`;
  pill.textContent = normalizedType;
  return pill;
}

function typeClass(type) {
  if (type === "SPRZEDANY") return "type-sold";
  if (type === "REZERWACJA") return "type-reserved";
  if (type === "ZWROT") return "type-return";
  return "type-stock";
}

function updateDeviceTypeSelectStyles() {
  [typeFilter, typeSelect].forEach((select) => {
    if (!select) return;
    const value = String(select.value || "").trim();
    select.dataset.typeValue = value || "ALL";
    select.classList.remove("type-select-all", "type-select-stock", "type-select-sold", "type-select-reserved", "type-select-return");

    if (!value) {
      select.classList.add("type-select-all");
      return;
    }
    if (value === "NA STANIE") {
      select.classList.add("type-select-stock");
      return;
    }
    if (value === "SPRZEDANY") {
      select.classList.add("type-select-sold");
      return;
    }
    if (value === "REZERWACJA") {
      select.classList.add("type-select-reserved");
      return;
    }
    if (value === "ZWROT") {
      select.classList.add("type-select-return");
    }
  });
}

function createRepairRow(record) {
  const row = document.createElement("tr");
  const status = repairDerived.get(record.id)?.status ?? effectiveRepairStatus(record);
  row.className = `repair-row ${statusClass(status)}`;
  const overdueClass = repairOverdueClass(record, status);
  if (overdueClass) row.classList.add(overdueClass);
  const activeDateType = activeRepairDateType(record);
  const cells = [
    formatDate(record.receivedDate),
    createCategoryPill(record.category),
    createLocationPill(record.location),
    createRepairCustomerName(record.customerName, status),
    record.deviceName,
    record.serialNumber,
    createStatusPill(status),
    createDatePill(record.sentDate, "sent", activeDateType),
    createDatePill(record.returnDate, "return", activeDateType),
    createDatePill(record.pickupDate, "pickup", activeDateType),
    record.notes
  ];

  cells.forEach((value, index) => {
    const cell = document.createElement("td");
    if (index === 3 && status === "GOTOWE") {
      cell.classList.add("pickup-customer-cell");
    }
    if (value instanceof HTMLElement) {
      cell.append(value);
    } else {
      cell.textContent = value || "-";
      if (!value) cell.classList.add("muted-cell");
    }
    row.append(cell);
  });

  const actions = document.createElement("td");
  actions.className = "row-actions";

  const editButton = document.createElement("button");
  editButton.type = "button";
  editButton.textContent = "Edytuj";
  editButton.addEventListener("click", () => openRepairDialog(record));

  actions.append(editButton);
  row.append(actions);
  return row;
}

function createRepairCustomerName(customerName, status) {
  const name = document.createElement("span");
  name.textContent = customerName || "-";
  if (status === "GOTOWE") {
    name.className = "pickup-customer";
  }
  return name;
}

function activeRepairDateType(record) {
  if (record.pickupDate) return "pickup";
  if (record.returnDate) return "return";
  if (record.sentDate) return "sent";
  return "";
}

function statusClass(status) {
  const normalizedStatus = status || "PRZYJĘTE";
  if (normalizedStatus === "ODEBRANE") return "repair-closed repair-status-picked-up";
  if (normalizedStatus === "GOTOWE") return "repair-open repair-status-ready";
  if (normalizedStatus === "W TRAKCIE") return "repair-open repair-status-progress";
  return "repair-open repair-status-received";
}

function repairStatusAge(record, status = effectiveRepairStatus(record)) {
  if (status === "ODEBRANE") return null;

  const statusDate =
    status === "GOTOWE"
      ? record.returnDate
      : status === "W TRAKCIE"
        ? record.sentDate
        : record.receivedDate;

  if (!statusDate) return null;
  const startDate = new Date(`${statusDate}T00:00:00`);
  if (Number.isNaN(startDate.getTime())) return null;

  const today = new Date();
  const localToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.max(0, Math.floor((localToday - startDate) / 86400000));
}

function repairOverdueClass(record, status) {
  const age = repairStatusAge(record, status);
  if (age === null) return "";
  if (age > 15) return "repair-overdue-critical";
  if (age > 7) return "repair-overdue-warning";
  return "";
}

function effectiveRepairStatus(record) {
  return statusFromRepairDates({
    receivedDate: record.receivedDate,
    sentDate: record.sentDate,
    returnDate: record.returnDate,
    pickupDate: record.pickupDate,
    status: record.status
  });
}

function createCategoryPill(category) {
  const pill = document.createElement("span");
  const normalizedCategory = normalizeRepairCategory(category);
  const className =
    normalizedCategory === "WKŁADKA USZNA"
      ? "INSERT"
      : normalizedCategory === "NAPRAWA POGWARANCYJNA"
        ? "OUT-OF-WARRANTY"
        : "REPAIR";
  pill.className = `type-pill ${className}`;
  pill.textContent = normalizedCategory;
  return pill;
}

function createLocationPill(location) {
  const pill = document.createElement("span");
  const normalizedLocation = normalizeRepairLocation(location);
  pill.className = `location-pill ${normalizedLocation}`;
  pill.textContent = normalizedLocation;
  return pill;
}

function createStatusPill(status) {
  const pill = document.createElement("span");
  const normalizedStatus = status || "PRZYJĘTE";
  pill.className = `status-pill ${normalizedStatus.replaceAll(" ", "-")}`;
  pill.textContent = normalizedStatus;
  return pill;
}

function createDatePill(value, type, activeType = "") {
  const pill = document.createElement("span");
  if (!value) return pill;

  pill.className = `date-pill ${type}`;
  if (activeType && type !== activeType) pill.classList.add("past");
  pill.textContent = formatDate(value);
  return pill;
}

function updateStats() {
  if (activeNotebook === "repairs") {
    document.querySelector("#countAll").textContent = repairStats.all;
    document.querySelector("#countSold").textContent = repairStats.repairs;
    document.querySelector("#countInvoice").textContent = repairStats.inserts;
    document.querySelector("#countStock").textContent = repairStats.open;
    countAllLabel.textContent = "wpisów";
    countSoldLabel.textContent = "naprawy";
    countInvoiceLabel.textContent = "wkładki";
    countStockLabel.textContent = "otwarte";
    return;
  }

  if (activeDeviceView === "demo") {
    document.querySelector("#countAll").textContent = demoStats.all;
    document.querySelector("#countSold").textContent = demoStats.stock;
    document.querySelector("#countInvoice").textContent = demoStats.loaned;
    document.querySelector("#countStock").textContent = demoStats.returnDue;
    countAllLabel.textContent = "aparatów demo";
    countSoldLabel.textContent = "na stanie";
    countInvoiceLabel.textContent = "wypożyczone";
    countStockLabel.textContent = "do zwrotu";
    return;
  }

  if (activeDeviceView === "dataControl") {
    const issues = filteredDataControlIssues(buildDataControlIssues());
    const duplicateCount = issues.filter((issue) => issue.kind === "duplicate").length;
    const criticalCount = issues.filter((issue) => issue.severity === "critical").length;
    const warningCount = issues.filter((issue) => issue.severity === "warning").length;
    document.querySelector("#countAll").textContent = issues.length;
    document.querySelector("#countSold").textContent = duplicateCount;
    document.querySelector("#countInvoice").textContent = criticalCount;
    document.querySelector("#countStock").textContent = warningCount;
    countAllLabel.textContent = "spraw";
    countSoldLabel.textContent = "duplikaty";
    countInvoiceLabel.textContent = "pilne";
    countStockLabel.textContent = "do sprawdzenia";
    return;
  }

  document.querySelector("#countAll").textContent = deviceStats.all;
  document.querySelector("#countSold").textContent = deviceStats.sold;
  document.querySelector("#countInvoice").textContent = deviceStats.reserved;
  document.querySelector("#countStock").textContent = deviceStats.stock;
  countAllLabel.textContent = "rekordów";
  countSoldLabel.textContent = "sprzedane";
  countInvoiceLabel.textContent = "rezerwacje";
  countStockLabel.textContent = "na stanie";
}

function renderStockView() {
  const stockRecords = records.filter((record) => deviceDerived.get(record.id)?.isInStock);
  const sections = stockLocationSections(stockRecords);
  const rows = [];

  sections.forEach((section) => {
    rows.push(createStockLocationHeaderRow(section.location, section.records.length));
    if (section.groups.length) {
      rows.push(...section.groups.map(createStockRow));
    } else {
      rows.push(createStockLocationEmptyRow());
    }
  });

  renderTableRows(stockBody, stockRecords.length ? rows : []);
  stockEmptyState.hidden = stockRecords.length > 0;
  renderStockLocationSummary(sections);
  renderStockChecklist(stockRecords, sections);
}

function renderStockChecklist(stockRecords, sections = stockLocationSections(stockRecords)) {
  const locationCounts = new Map(sections.map((section) => [section.location, section.records.length]));
  const stockBreakdown = STOCK_LOCATIONS.map((location) => `${location}: ${locationCounts.get(location) || 0}`).join(" · ");

  stockSummary.textContent = formatDeviceCount(stockRecords.length);
  stockChecklistMeta.textContent = `${dateFormatter.format(new Date())} · ${formatDeviceCount(stockRecords.length)} na stanie · ${stockBreakdown}`;
  printStockChecklistBtn.disabled = stockRecords.length === 0;

  const rows = [];
  let rowNumber = 0;

  sections.forEach((section) => {
    if (!section.records.length) return;
    rows.push(createStockChecklistLocationRow(section.location, section.records.length));
    const sectionRecords = [...section.records].sort((left, right) => {
      const byName = collator.compare(left.deviceName, right.deviceName);
      if (byName) return byName;
      return collator.compare(left.serialNumber, right.serialNumber);
    });

    sectionRecords.forEach((record) => {
      rowNumber += 1;
      const row = document.createElement("tr");
      const checkbox = document.createElement("span");
      checkbox.className = "checklist-box";
      checkbox.setAttribute("aria-hidden", "true");

      const values = [
        String(rowNumber),
        checkbox,
        record.deviceName,
        record.serialNumber,
        normalizeRepairLocation(record.location),
        ""
      ];

      values.forEach((value) => {
        const cell = document.createElement("td");
        if (value instanceof HTMLElement) {
          cell.append(value);
        } else {
          cell.textContent = value;
        }
        row.append(cell);
      });
      rows.push(row);
    });
  });

  renderTableRows(stockChecklistBody, rows);
}

function printStockChecklist() {
  if (printStockChecklistBtn.disabled) return;

  const cleanup = () => document.body.classList.remove("stock-checklist-print");
  document.body.classList.add("stock-checklist-print");
  window.addEventListener("afterprint", cleanup, { once: true });
  window.print();
}

function groupStockRecords(stockRecords) {
  const groups = new Map();

  stockRecords.forEach((record) => {
    const name = String(record.deviceName ?? "").trim() || "Bez nazwy";
    const location = normalizeRepairLocation(record.location);
    const normalizedName = normalize(name).replace(/[\s_-]+/g, " ").trim();
    const key = `${normalizedName}__${location}`;
    if (!groups.has(key)) {
      groups.set(key, {
        deviceName: name,
        location,
        count: 0,
        oldestAge: null,
        serialNumbers: []
      });
    }

    const group = groups.get(key);
    const age = deviceDerived.get(record.id)?.age ?? stockAge(record);
    group.count += 1;
    group.oldestAge = Math.max(group.oldestAge ?? -1, age ?? -1);
    group.serialNumbers.push(record.serialNumber || "brak numeru");
  });

  return [...groups.values()].sort((left, right) => {
    const byCount = right.count - left.count;
    if (byCount) return byCount;
    const byName = collator.compare(left.deviceName, right.deviceName);
    if (byName) return byName;
    return collator.compare(left.location, right.location);
  });
}

function stockLocationSections(stockRecords) {
  const recordsByLocation = new Map(STOCK_LOCATIONS.map((location) => [location, []]));

  stockRecords.forEach((record) => {
    const location = normalizeRepairLocation(record.location);
    if (!recordsByLocation.has(location)) recordsByLocation.set(location, []);
    recordsByLocation.get(location).push(record);
  });

  return STOCK_LOCATIONS.map((location) => {
    const locationRecords = recordsByLocation.get(location) || [];
    return {
      location,
      records: locationRecords,
      groups: groupStockRecords(locationRecords)
    };
  });
}

function renderStockLocationSummary(sections) {
  if (!stockLocationSummary) return;
  const fragment = document.createDocumentFragment();

  sections.forEach((section) => {
    const item = document.createElement("div");
    item.className = "stock-location-card";
    const count = document.createElement("strong");
    count.textContent = String(section.records.length);
    const label = document.createElement("span");
    label.textContent = section.records.length === 1 ? "aparat" : "aparatów";

    item.append(createLocationPill(section.location), count, label);
    fragment.append(item);
  });

  stockLocationSummary.replaceChildren(fragment);
}

function formatDeviceCount(count) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (count === 1) return "1 aparat";
  if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) return `${count} aparaty`;
  return `${count} aparatów`;
}

function createStockLocationHeaderRow(location, count) {
  const row = document.createElement("tr");
  row.className = "stock-location-row";
  const cell = document.createElement("td");
  const content = document.createElement("div");
  const countText = document.createElement("strong");

  cell.colSpan = 5;
  content.className = "stock-location-row-content";
  countText.textContent = formatDeviceCount(count);
  content.append(createLocationPill(location), countText);
  cell.append(content);
  row.append(cell);
  return row;
}

function createStockLocationEmptyRow() {
  const row = document.createElement("tr");
  row.className = "stock-location-empty";
  const cell = document.createElement("td");
  cell.colSpan = 5;
  cell.textContent = "Brak aparatów w tym miejscu.";
  row.append(cell);
  return row;
}

function createStockChecklistLocationRow(location, count) {
  const row = document.createElement("tr");
  row.className = "stock-checklist-location-row";
  const cell = document.createElement("td");
  cell.colSpan = 6;
  cell.textContent = `${location} · ${formatDeviceCount(count)}`;
  row.append(cell);
  return row;
}

function createStockRow(group) {
  const row = document.createElement("tr");
  const oldestText = formatDaysLabel(group.oldestAge >= 0 ? group.oldestAge : null);
  const values = [group.deviceName, createLocationPill(group.location), group.count, oldestText, createSerialList(group.serialNumbers)];

  values.forEach((value) => {
    const cell = document.createElement("td");
    if (value instanceof HTMLElement) {
      cell.append(value);
    } else {
      cell.textContent = value;
    }
    row.append(cell);
  });

  return row;
}

function createSerialList(serialNumbers) {
  const list = document.createElement("div");
  list.className = "serial-list";

  serialNumbers
    .sort((left, right) => collator.compare(left, right))
    .forEach((serialNumber) => {
      const item = document.createElement("span");
      item.textContent = serialNumber;
      list.append(item);
    });

  return list;
}

function switchView(viewName, groupName) {
  tabButtons.forEach((button) => {
    if (button.dataset.viewGroup !== groupName) return;
    const isActive = button.dataset.view === viewName;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });

  viewSections.forEach((section) => {
    if (section.dataset.viewGroup !== groupName) return;
    section.hidden = section.id !== `${viewName}View`;
  });

  if (groupName === "repairs") {
    renderRepairRecords();
    return;
  }

  activeDeviceView = viewName;
  updateStats();
  if (viewName === "demo") {
    renderDemoRecords();
    return;
  }
  if (viewName === "dataControl") {
    renderDataControlView();
    return;
  }
  if (viewName === "stock") {
    renderStockView();
    return;
  }
  renderDeviceViews();
}

function switchNotebook(notebookName) {
  activeNotebook = notebookName;
  notebookSwitchButtons.forEach((button) => {
    const isActive = button.dataset.notebook === notebookName;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });

  notebookSections.forEach((section) => {
    section.hidden = section.id !== `${notebookName}Notebook`;
  });

  setCurrentYearTitle();
  updateStats();

  if (activeNotebook === "repairs") {
    renderRepairRecords();
    return;
  }

  activeDeviceView = document.querySelector('.tab-button.active[data-view-group="devices"]')?.dataset.view || "database";
  if (activeDeviceView === "demo") {
    renderDemoRecords();
    return;
  }
  if (activeDeviceView === "dataControl") {
    renderDataControlView();
    return;
  }
  if (activeDeviceView === "stock") {
    renderStockView();
    return;
  }
  renderDeviceViews();
}

function openDialog(record = null) {
  recordForm.reset();
  document.querySelector("#recordId").value = record?.id ?? "";
  dialogTitle.textContent = record ? modelTitleForRecord(record, "Aparat") : "Dodaj aparat";
  recordEyebrow.textContent = record ? `${records.findIndex((item) => item.id === record.id) + 1}/${records.length}` : "Nowy rekord";
  deleteBtn.hidden = !record;

  fields.forEach((field) => {
    const input = document.querySelector(`#${field}`);
    input.value = field === "type" && record ? displayType(record) : record?.[field] ?? "";
  });

  if (!record) {
    document.querySelector("#receivedDate").value = todayInputValue();
    document.querySelector("#type").value = "NA STANIE";
    document.querySelector("#location").value = "P63";
  }
  recordDialog.showModal();
}

function openRepairDialog(record = null) {
  repairForm.reset();
  document.querySelector("#repairId").value = record?.id ?? "";
  repairDialogTitle.textContent = record ? "Edytuj wpis" : "Dodaj naprawę lub wkładkę";
  deleteRepairBtn.hidden = !record;
  const normalizedRecord = record ? normalizeRepairRecordForUse(record) : null;

  const fieldMap = {
    receivedDate: "#repairReceivedDate",
    category: "#repairCategory",
    location: "#repairLocation",
    customerName: "#repairCustomerName",
    deviceName: "#repairDeviceName",
    serialNumber: "#repairSerialNumber",
    status: "#repairStatus",
    sentDate: "#repairSentDate",
    returnDate: "#repairReturnDate",
    pickupDate: "#repairPickupDate",
    notes: "#repairNotes"
  };

  repairFields.forEach((field) => {
    const input = document.querySelector(fieldMap[field]);
    input.value = normalizedRecord?.[field] ?? "";
  });

  if (!record) {
    document.querySelector("#repairLocation").value = "P63";
  }

  repairDialog.showModal();
}

function openDemoDialog(record = null) {
  demoForm.reset();
  demoLoanHistoryDraft = record ? effectiveDemoLoanHistory(record) : [];
  demoCurrentAttachmentsDraft = record ? demoAttachmentDrafts(record.currentAttachments) : [];
  demoFormError.textContent = "";
  saveDemoBtn.disabled = false;
  saveDemoBtn.textContent = "Zapisz";
  const demoSerialNumberInput = document.querySelector("#demoSerialNumber");
  demoSerialNumberInput.required = !record;
  demoSerialNumberInput.setAttribute("aria-required", String(!record));
  document.querySelector("#demoSerialNumberLabel").textContent = record ? "Numer seryjny" : "Numer seryjny *";
  document.querySelector("#demoReturnDate").dataset.autoValue = "";
  document.querySelector("#demoManufacturerReturnDate").dataset.autoValue = "";
  document.querySelector("#demoId").value = record?.id ?? "";
  demoDialogTitle.textContent = record ? demoDialogTitleForRecord(record) : "Dodaj aparat demo";
  demoRecordEyebrow.textContent = record
    ? `${demoRecords.findIndex((item) => item.id === record.id) + 1}/${demoRecords.length}`
    : "Nowy wpis";
  deleteDemoBtn.hidden = !record;

  const fieldMap = {
    receivedDate: "#demoReceivedDate",
    manufacturerReturnDate: "#demoManufacturerReturnDate",
    manufacturerReturnDateCleared: "#demoManufacturerReturnDateCleared",
    loanDate: "#demoLoanDate",
    returnDate: "#demoReturnDate",
    manufacturer: "#demoManufacturer",
    status: "#demoStatus",
    purpose: "#demoPurpose",
    deviceName: "#demoDeviceName",
    serialNumber: "#demoSerialNumber",
    location: "#demoLocation",
    currentUser: "#demoCurrentUser",
    notes: "#demoNotes"
  };

  demoFields.forEach((field) => {
    document.querySelector(fieldMap[field]).value = field === "purpose" ? normalizeDemoPurpose(record?.purpose) : record?.[field] ?? "";
  });

  if (record) {
    const returnDateInput = document.querySelector("#demoReturnDate");
    returnDateInput.value = record.returnDate || "";
    document.querySelector("#demoLocation").value = normalizeDemoLocation(record.location);
    document.querySelector("#demoCurrentUser").value = titleCaseName(record.currentUser);
    syncDemoStatusFromCurrentUser();
  }

  if (!record) {
    document.querySelector("#demoReceivedDate").value = todayInputValue();
    document.querySelector("#demoStatus").value = "NA STANIE";
    document.querySelector("#demoPurpose").value = DEMO_PURPOSE_TEST;
    document.querySelector("#demoLocation").value = "P63";
  }
  const calculatedManufacturerReturnDate = calculateDemoManufacturerReturnDate();
  const manufacturerReturnDateInput = document.querySelector("#demoManufacturerReturnDate");
  if (!manufacturerReturnDateInput.value && !isDemoManufacturerReturnDateClearedForm()) {
    syncDemoManufacturerReturnDate();
  } else if (manufacturerReturnDateInput.value === calculatedManufacturerReturnDate) {
    manufacturerReturnDateInput.dataset.autoValue = calculatedManufacturerReturnDate;
  }
  renderDemoCurrentAttachments();
  renderDemoLoanHistory(record);
  demoDialog.showModal();
}

function demoDialogTitleForRecord(record) {
  return modelTitleForRecord(record, "Aparat demo");
}

function modelTitleForRecord(record, fallbackTitle) {
  const model = String(record?.deviceName || "").trim();
  return model || fallbackTitle;
}

function renderDemoLoanHistory(record) {
  const entries = normalizeDemoLoanHistory(demoLoanHistoryDraft).sort((left, right) =>
    String(right.returnDate || right.loanDate).localeCompare(String(left.returnDate || left.loanDate))
  );
  demoLoanHistorySection.hidden = !record;
  demoLoanHistoryCount.textContent = `${entries.length}`;

  const fragment = document.createDocumentFragment();
  if (!entries.length) {
    const empty = document.createElement("p");
    empty.className = "demo-loan-history-empty";
    empty.textContent = "Brak zakończonych wypożyczeń.";
    fragment.append(empty);
  }
  entries.forEach((entry) => {
    const item = document.createElement("div");
    item.className = "demo-loan-history-item";
    const person = document.createElement("strong");
    person.textContent = entry.currentUser || "Brak osoby";
    const dates = document.createElement("span");
    dates.textContent = `${entry.loanDate ? formatDate(entry.loanDate) : "brak daty"} → ${entry.returnDate ? formatDate(entry.returnDate) : "brak daty zwrotu"}`;
    const removeButton = document.createElement("button");
    removeButton.className = "demo-loan-history-remove";
    removeButton.type = "button";
    removeButton.textContent = "Usuń";
    removeButton.setAttribute("aria-label", `Usuń wypożyczenie: ${entry.currentUser || "brak osoby"}`);
    removeButton.addEventListener("click", () => {
      demoLoanHistoryDraft = demoLoanHistoryDraft.filter((historyEntry) => historyEntry.id !== entry.id);
      renderDemoLoanHistory(record);
    });
    const attachmentArea = document.createElement("div");
    attachmentArea.className = "demo-history-attachments";
    const attachmentList = document.createElement("div");
    attachmentList.className = "demo-attachments-list";
    renderDemoAttachments(attachmentList, entry.attachments, (attachmentId) => {
      entry.attachments = entry.attachments.filter((attachment) => attachment.id !== attachmentId);
      demoLoanHistoryDraft = demoLoanHistoryDraft.map((historyEntry) => (historyEntry.id === entry.id ? entry : historyEntry));
      renderDemoLoanHistory(record);
    });
    const addLabel = document.createElement("label");
    addLabel.className = "demo-attachment-add";
    addLabel.textContent = "Dodaj pliki";
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png";
    input.multiple = true;
    input.addEventListener("change", () => {
      addDemoAttachmentFiles(input.files, () => entry.attachments);
      demoLoanHistoryDraft = demoLoanHistoryDraft.map((historyEntry) => (historyEntry.id === entry.id ? entry : historyEntry));
      renderDemoLoanHistory(record);
    });
    addLabel.prepend(input);
    attachmentArea.append(attachmentList, addLabel);
    item.append(person, dates, removeButton, attachmentArea);
    fragment.append(item);
  });
  demoLoanHistoryList.replaceChildren(fragment);
}

function closeDialog() {
  recordDialog.close();
}

function closeRepairDialog() {
  repairDialog.close();
}

function closeDemoDialog() {
  demoDialog.close();
}

function formRecord() {
  const data = Object.fromEntries(new FormData(recordForm).entries());
  fields.forEach((field) => {
    data[field] = String(data[field] ?? "").trim();
  });
  data.deviceName = correctDeviceNameFromHistory(data.deviceName, document.querySelector("#recordId").value);
  data.customerName = titleCaseName(data.customerName);
  data.serialNumber = normalizeSerialNumber(data.serialNumber);
  data.salesInvoice = normalizeSalesInvoice(data.salesInvoice);
  data.location = normalizeRepairLocation(data.location);
  data.type = normalizeDeviceType(data.type || "NA STANIE");
  data.ezwm = normalizeEzwmStatus(data.ezwm);
  return data;
}

function syncDeviceTypeFromFields() {
  const typeInput = document.querySelector("#type");
  if (!typeInput) return;

  const data = Object.fromEntries(new FormData(recordForm).entries());
  const currentType = normalizeDeviceType(typeInput.value || "NA STANIE");
  const nextType = shouldAutoSetDeviceType(data) ? suggestedDeviceType(data, currentType) : "NA STANIE";
  typeInput.value = nextType;
  if (nextType === "NA STANIE" && !document.querySelector("#location").value) document.querySelector("#location").value = "P63";
  updateDeviceTypeSelectStyles();
}

function syncStockLocationFromType() {
  if (normalizeDeviceType(typeSelect.value) === "NA STANIE" && !document.querySelector("#location").value) {
    document.querySelector("#location").value = "P63";
  }
  updateDeviceTypeSelectStyles();
}

function repairFormRecord() {
  const data = Object.fromEntries(new FormData(repairForm).entries());
  repairFields.forEach((field) => {
    data[field] = String(data[field] ?? "").trim();
  });
  data.customerName = titleCaseName(data.customerName);
  data.serialNumber = normalizeSerialNumber(data.serialNumber);
  data.category = normalizeRepairCategory(data.category);
  data.location = normalizeRepairLocation(data.location);
  data.status = statusFromRepairDates(data);
  return data;
}

function demoFormRecord() {
  const data = Object.fromEntries(new FormData(demoForm).entries());
  demoFields.forEach((field) => {
    data[field] = String(data[field] ?? "").trim();
  });
  data.manufacturer = data.manufacturer.toLocaleUpperCase("pl-PL");
  data.serialNumber = normalizeSerialNumber(data.serialNumber);
  data.manufacturerReturnDateCleared = data.manufacturerReturnDate ? "" : normalizeBooleanFlag(data.manufacturerReturnDateCleared);
  data.purpose = normalizeDemoPurpose(data.purpose);
  data.location = normalizeDemoLocation(data.location);
  data.currentUser = titleCaseName(data.currentUser);
  data.loanHistory = normalizeDemoLoanHistory(demoLoanHistoryDraft);
  data.currentAttachments = normalizeDemoAttachments(demoCurrentAttachmentsDraft);
  data.loanHistoryManaged = true;
  const selectedStatus = normalizeDemoStatus(data.status, data);
  if (isPastDate(data.manufacturerReturnDate)) {
    data.status = "ZWRÓCONO";
  } else if (data.returnDate && data.currentUser) {
    data.status = "ZWRÓCONO";
  }
  if (!data.manufacturerReturnDate && data.status === "ZWRÓCONO" && data.currentUser) {
    if (!data.returnDate) data.returnDate = todayInputValue();
  } else if (data.currentUser && !data.loanDate) {
    data.loanDate = todayInputValue();
  }
  if (isPastDate(data.manufacturerReturnDate) || (data.status === "ZWRÓCONO" && data.currentUser)) {
    data.status = "ZWRÓCONO";
  } else if (data.currentUser) {
    data.status = "WYPOŻYCZONY";
  } else if (["BRAK", "DO ZWROTU"].includes(selectedStatus)) {
    data.status = selectedStatus;
  } else {
    data.status = "NA STANIE";
  }
  return data;
}

function completeDemoLoan(existingRecord, data) {
  const history = normalizeDemoLoanHistory(data.loanHistory ?? existingRecord?.loanHistory);
  const currentUser = titleCaseName(data.currentUser || existingRecord?.currentUser);
  const loanDate = data.loanDate || existingRecord?.loanDate || "";
  const returnDate = data.returnDate || todayInputValue();

  if (currentUser || loanDate) {
    const duplicate = history.some(
      (entry) => entry.currentUser === currentUser && entry.loanDate === loanDate && entry.returnDate === returnDate
    );
    if (!duplicate) {
      history.push({
        id: makeId(),
        currentUser,
        loanDate,
        returnDate,
        attachments: normalizeDemoAttachments(data.currentAttachments)
      });
    }
  }

  return {
    ...data,
    status: "NA STANIE",
    currentUser: "",
    loanDate: "",
    returnDate,
    currentAttachments: [],
    loanHistory: history
  };
}

function prepareDemoLoanData(existingRecord, data) {
  const history = normalizeDemoLoanHistory(data.loanHistory ?? existingRecord?.loanHistory);
  if (isPastDate(data.manufacturerReturnDate)) {
    return { ...data, status: "ZWRÓCONO", loanHistory: history };
  }
  const completesActiveLoan = Boolean(
    data.returnDate && (data.currentUser || existingRecord?.currentUser)
  );
  if (data.status === "ZWRÓCONO" || completesActiveLoan) {
    return completeDemoLoan(existingRecord, { ...data, status: "ZWRÓCONO" });
  }
  if (data.currentUser && existingRecord?.status === "ZWRÓCONO") {
    return { ...data, status: "WYPOŻYCZONY", loanDate: data.loanDate || todayInputValue(), returnDate: "", loanHistory: history };
  }
  return { ...data, loanHistory: history };
}

function normalizeDemoLocation(location) {
  const normalizedLocation = String(location || "").trim().toUpperCase();
  return ["T12", "P50", "P63"].includes(normalizedLocation) ? normalizedLocation : "P63";
}

function normalizeRepairLocation(location) {
  const normalizedLocation = String(location || "").trim().toUpperCase();
  return ["T12", "P50", "P63"].includes(normalizedLocation) ? normalizedLocation : "P63";
}

function statusFromRepairDates(data) {
  if (data.pickupDate) return "ODEBRANE";
  if (data.returnDate) return "GOTOWE";
  if (data.sentDate) return "W TRAKCIE";
  return data.receivedDate ? "PRZYJĘTE" : data.status || "PRZYJĘTE";
}

function syncRepairStatusFromDates() {
  const data = Object.fromEntries(new FormData(repairForm).entries());
  document.querySelector("#repairStatus").value = statusFromRepairDates(data);
}

function syncDemoStatusFromCurrentUser(options = {}) {
  const currentUser = document.querySelector("#demoCurrentUser").value;
  const statusInput = document.querySelector("#demoStatus");
  const manufacturerReturned = isPastDate(document.querySelector("#demoManufacturerReturnDate").value);
  const hasCurrentUser = Boolean(String(currentUser).trim());
  if (options.setLoanDate && hasCurrentUser && !document.querySelector("#demoLoanDate").value) {
    document.querySelector("#demoLoanDate").value = todayInputValue();
  }
  if (hasCurrentUser) {
    document.querySelector("#demoReturnDate").value = "";
  } else if (options.clearLoanWhenEmpty) {
    document.querySelector("#demoLoanDate").value = "";
  }
  statusInput.value = manufacturerReturned ? "ZWRÓCONO" : demoStatusFromCurrentUser(currentUser);
}

function syncDemoReturnedStatus() {
  if (document.querySelector("#demoStatus").value !== "ZWRÓCONO") return;

  const returnDateInput = document.querySelector("#demoReturnDate");
  if (!returnDateInput.value) returnDateInput.value = todayInputValue();
  returnDateInput.dataset.autoValue = "";
}

function calculateDemoManufacturerReturnDate() {
  const record = {
    receivedDate: document.querySelector("#demoReceivedDate").value,
    manufacturer: document.querySelector("#demoManufacturer").value,
    deviceName: document.querySelector("#demoDeviceName").value
  };
  return isPhilipsHearLink(record) && record.receivedDate ? addCalendarMonths(record.receivedDate, 6) : "";
}

function syncDemoManufacturerReturnDate() {
  if (isDemoManufacturerReturnDateClearedForm()) {
    syncDemoStatusFromCurrentUser();
    return;
  }
  const input = document.querySelector("#demoManufacturerReturnDate");
  const previousAutoValue = input.dataset.autoValue || "";
  const nextAutoValue = calculateDemoManufacturerReturnDate();
  if (!input.value || input.value === previousAutoValue) input.value = nextAutoValue;
  input.dataset.autoValue = nextAutoValue;
  syncDemoStatusFromCurrentUser();
}

function markDemoManufacturerReturnDateChange() {
  const input = document.querySelector("#demoManufacturerReturnDate");
  document.querySelector("#demoManufacturerReturnDateCleared").value = input.value ? "" : "1";
  if (input.value !== input.dataset.autoValue) input.dataset.autoValue = "";
  syncDemoStatusFromCurrentUser();
}

function isDemoManufacturerReturnDateClearedForm() {
  return document.querySelector("#demoManufacturerReturnDateCleared").value === "1";
}

function markDemoReturnDateChange() {
  const input = document.querySelector("#demoReturnDate");
  if (input.value !== input.dataset.autoValue) input.dataset.autoValue = "";
  const statusInput = document.querySelector("#demoStatus");
  const hasActiveLoan = Boolean(document.querySelector("#demoCurrentUser").value.trim());
  if (input.value && hasActiveLoan) {
    statusInput.value = "ZWRÓCONO";
  } else if (!input.value && statusInput.value === "ZWRÓCONO" && hasActiveLoan) {
    statusInput.value = "WYPOŻYCZONY";
  }
}

function syncDemoUppercaseInput(event) {
  event.target.value = event.target.value.toLocaleUpperCase("pl-PL");
  if (event.target.id === "demoManufacturer") syncDemoManufacturerReturnDate();
}

function formatDemoCurrentUserInput(event) {
  event.target.value = titleCaseNameInput(event.target.value);
  syncDemoStatusFromCurrentUser({ setLoanDate: true, clearLoanWhenEmpty: true });
}

function finalizeDemoCurrentUserInput(event) {
  event.target.value = titleCaseName(event.target.value);
}

function syncSalesInvoiceUppercase(event) {
  event.target.value = normalizeSalesInvoiceInput(event.target.value);
  syncDeviceTypeFromFields();
}

function correctDeviceNameInput() {
  const input = document.querySelector("#deviceName");
  input.value = correctDeviceNameFromHistory(input.value, document.querySelector("#recordId").value);
}

const scheduleDeviceNameCorrection = debounce(correctDeviceNameInput, 450);

function handleClearDateClick(event) {
  const button = event.target.closest(".clear-date-btn");
  if (!button) return;

  const targetId = button.dataset.target;
  const input = document.getElementById(targetId);
  if (!input) return;

  input.value = "";

  if (targetId.startsWith("demo")) {
    if (targetId === "demoReturnDate") markDemoReturnDateChange();
    if (targetId === "demoManufacturerReturnDate") markDemoManufacturerReturnDateChange();
    return;
  }

  if (targetId.startsWith("repair")) {
    syncRepairStatusFromDates();
    return;
  }

  syncDeviceTypeFromFields();
}

async function saveFormRecord(event) {
  event.preventDefault();
  const id = document.querySelector("#recordId").value;
  const data = formRecord();
  let savedRecord;
  if (!confirmSerialNumberSave(data.serialNumber, "devices", id)) return;
  const previousRecords = records;

  if (id) {
    records = records.map((record) => {
      if (record.id !== id) return record;
      savedRecord = { ...record, ...data };
      return savedRecord;
    });
  } else {
    savedRecord = { id: makeId(), ...data };
    records = [savedRecord, ...records];
  }

  try {
    await persistDeviceRecord(savedRecord);
    rebuildDerivedData();
    render();
    closeDialog();
  } catch (error) {
    records = previousRecords;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    rebuildDerivedData();
    render();
    alert(error.message);
  }
}

async function deleteCurrentRecord() {
  const id = document.querySelector("#recordId").value;
  if (!id) return;
  const record = records.find((item) => item.id === id);
  const label = record ? `${record.deviceName} (${record.serialNumber})` : "ten rekord";

  if (confirm(`Usunąć ${label}?`)) {
    const previousRecords = records;
    records = records.filter((item) => item.id !== id);
    try {
      await persistDeletedDeviceRecord(id);
      rebuildDerivedData();
      render();
      closeDialog();
    } catch (error) {
      records = previousRecords;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
      rebuildDerivedData();
      render();
      alert(error.message);
    }
  }
}

async function saveRepairFormRecord(event) {
  event.preventDefault();
  const id = document.querySelector("#repairId").value;
  const data = repairFormRecord();
  let savedRecord;
  if (!confirmSerialNumberSave(data.serialNumber, "repairs", id)) return;
  const previousRepairRecords = repairRecords;

  if (id) {
    repairRecords = repairRecords.map((record) => {
      if (record.id !== id) return record;
      savedRecord = { ...record, ...data };
      return savedRecord;
    });
  } else {
    savedRecord = { id: makeId(), ...data };
    repairRecords = [savedRecord, ...repairRecords];
  }

  try {
    await persistRepairRecord(savedRecord);
    rebuildDerivedData();
    render();
    closeRepairDialog();
  } catch (error) {
    repairRecords = previousRepairRecords;
    localStorage.setItem(REPAIR_STORAGE_KEY, JSON.stringify(repairRecords));
    rebuildDerivedData();
    render();
    alert(error.message);
  }
}

async function deleteCurrentRepairRecord() {
  const id = document.querySelector("#repairId").value;
  if (!id) return;
  const record = repairRecords.find((item) => item.id === id);
  const label = record ? `${record.customerName} (${record.category})` : "ten wpis";

  if (confirm(`Usunąć ${label}?`)) {
    const previousRepairRecords = repairRecords;
    repairRecords = repairRecords.filter((item) => item.id !== id);
    try {
      await persistDeletedRepairRecord(id);
      rebuildDerivedData();
      render();
      closeRepairDialog();
    } catch (error) {
      repairRecords = previousRepairRecords;
      localStorage.setItem(REPAIR_STORAGE_KEY, JSON.stringify(repairRecords));
      rebuildDerivedData();
      render();
      alert(error.message);
    }
  }
}

async function saveDemoFormRecord(event) {
  event.preventDefault();
  demoFormError.textContent = "";
  const id = document.querySelector("#demoId").value;
  const recordId = id || `${DEMO_ID_PREFIX}${makeId()}`;
  let data = demoFormRecord();
  let savedRecord;
  if (!id && !data.serialNumber) {
    demoFormError.textContent = "Numer seryjny jest wymagany przy dodawaniu nowego aparatu demo.";
    document.querySelector("#demoSerialNumber").focus();
    return;
  }
  if (!confirmSerialNumberSave(data.serialNumber, "demo", id)) return;
  const previousDemoRecords = demoRecords;
  const existingRecord = id ? demoRecords.find((record) => record.id === id) : null;
  const previousAttachmentPaths = demoAttachmentPaths(existingRecord);
  saveDemoBtn.disabled = true;
  saveDemoBtn.textContent = "Wysyłanie załączników...";

  try {
    if (id && !existingRecord) throw new Error("Nie znaleziono edytowanego rekordu. Zamknij okno i otwórz go ponownie.");
    await prepareDemoAttachmentsForSave(recordId);
    data = prepareDemoLoanData(existingRecord, demoFormRecord());
    savedRecord = { ...(existingRecord || {}), id: recordId, ...data };
    assertDemoRecordReadyForSupabase(savedRecord);
    if (id) {
      demoRecords = demoRecords.map((record) => (record.id === id ? savedRecord : record));
    } else {
      demoRecords = [savedRecord, ...demoRecords];
    }
    saveDemoBtn.textContent = "Zapisywanie...";
    await persistDemoRecord(savedRecord);
    const savedPaths = new Set(demoAttachmentPaths(savedRecord));
    try {
      await removeDemoAttachmentPaths(previousAttachmentPaths.filter((path) => !savedPaths.has(path)));
    } catch (cleanupError) {
      console.warn(cleanupError);
    }
    rebuildDerivedData();
    render();
    closeDemoDialog();
  } catch (error) {
    demoRecords = previousDemoRecords;
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(demoRecords));
    rebuildDerivedData();
    render();
    demoFormError.textContent = error.message || "Nie udało się zapisać rekordu.";
  } finally {
    saveDemoBtn.disabled = false;
    saveDemoBtn.textContent = "Zapisz";
  }
}

async function deleteCurrentDemoRecord() {
  const id = document.querySelector("#demoId").value;
  if (!id) return;
  const record = demoRecords.find((item) => item.id === id);
  const label = record ? `${record.deviceName} (${record.serialNumber})` : "ten wpis";

  if (confirm(`Usunąć ${label}?`)) {
    const previousDemoRecords = demoRecords;
    demoRecords = demoRecords.filter((item) => item.id !== id);
    try {
      await persistDeletedDemoRecord(id);
      try {
        await removeDemoAttachmentPaths(demoAttachmentPaths(record));
      } catch (cleanupError) {
        console.warn(cleanupError);
      }
      rebuildDerivedData();
      render();
      closeDemoDialog();
    } catch (error) {
      demoRecords = previousDemoRecords;
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(demoRecords));
      rebuildDerivedData();
      render();
      alert(error.message);
    }
  }
}

function exportCsv() {
  const header = [
    "Data przyjęcia",
    "FIFO dni",
    "Nazwa aparatu",
    "Numer seryjny",
    "Typ",
    "Miejsce",
    "Data odbioru",
    "Imię i nazwisko",
    "Faktura sprzedaży",
    "EZWM",
    "Nr listu przewozowego/WZ",
    "Uwagi"
  ];
  const rows = filteredRecords().map((record) => [
    record.receivedDate ?? "",
    isFifoExcluded(record) ? "" : stockAge(record) ?? "",
    record.deviceName ?? "",
    record.serialNumber ?? "",
    displayType(record),
    normalizeRepairLocation(record.location),
    record.pickupDate ?? "",
    record.customerName ?? "",
    normalizeSalesInvoice(record.salesInvoice),
    normalizeEzwmStatus(record.ezwm),
    record.waybillNumber ?? "",
    record.notes ?? ""
  ]);
  downloadCsv([header, ...rows], `baza-aparatow-${todayStamp()}.csv`);
}

function chooseExportFormat(exportCsvAction, exportJsonAction) {
  const format = prompt("Eksport: wpisz CSV albo JSON", "CSV");
  if (!format) return;

  const normalizedFormat = format.trim().toUpperCase();
  if (normalizedFormat === "CSV") {
    exportCsvAction();
    return;
  }
  if (normalizedFormat === "JSON") {
    exportJsonAction();
    return;
  }

  alert("Wybierz CSV albo JSON.");
}

function csvCell(value) {
  const text = String(value).replaceAll('"', '""');
  return `"${text}"`;
}

function exportJson() {
  downloadJson(records, `baza-aparatow-${todayStamp()}.json`);
}

function exportDemoJson() {
  downloadJson(demoRecords, `aparaty-demo-${todayStamp()}.json`);
}

function exportRepairCsv() {
  const header = [
    "Data przyjęcia",
    "Typ",
    "Miejsce",
    "Imię i nazwisko",
    "Aparat / wkładka",
    "Numer seryjny",
    "Status",
    "Data wysłania",
    "Data powrotu",
    "Data odbioru",
    "Uwagi"
  ];
  const rows = filteredRepairRecords().map((record) => [
    record.receivedDate ?? "",
    normalizeRepairCategory(record.category),
    normalizeRepairLocation(record.location),
    record.customerName ?? "",
    record.deviceName ?? "",
    record.serialNumber ?? "",
    effectiveRepairStatus(record),
    record.sentDate ?? "",
    record.returnDate ?? "",
    record.pickupDate ?? "",
    record.notes ?? ""
  ]);
  downloadCsv([header, ...rows], `zeszyt-napraw-wkladek-${todayStamp()}.csv`);
}

function exportRepairJson() {
  downloadJson(repairRecords, `zeszyt-napraw-wkladek-${todayStamp()}.json`);
}

function downloadCsv(rows, filename) {
  const csv = `\ufeff${rows.map((row) => row.map(csvCell).join(";")).join("\n")}`;
  downloadFile(csv, filename, "text/csv;charset=utf-8");
}

function downloadJson(data, filename) {
  downloadFile(JSON.stringify(data, null, 2), filename, "application/json;charset=utf-8");
}

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function todayStamp() {
  return new Date().toISOString().slice(0, 10);
}

function todayInputValue() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function importJson(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.addEventListener("load", async () => {
    const previousRecords = records;
    try {
      const imported = parseImportFile(file, reader.result);
      if (!Array.isArray(imported)) throw new Error("Import musi być listą rekordów.");

      const importedRecords = normalizeImportedRecords(imported, fields);
      if (!confirm(`Import zastąpi obecną bazę aparatów (${records.length}) rekordami z pliku (${importedRecords.length}). Kontynuować?`)) {
        importInput.value = "";
        return;
      }

      records = importedRecords;
      await saveRecords();
      rebuildDerivedData();
      render();
      importInput.value = "";
    } catch (error) {
      records = previousRecords;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
      rebuildDerivedData();
      render();
      alert(`Nie udało się zaimportować pliku: ${error.message}`);
    }
  });
  reader.readAsText(file);
}

function importRepairJson(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.addEventListener("load", async () => {
    const previousRepairRecords = repairRecords;
    try {
      const imported = parseImportFile(file, reader.result);
      if (!Array.isArray(imported)) throw new Error("Import musi być listą wpisów.");

      const importedRepairRecords = normalizeImportedRecords(imported, repairFields);
      if (!confirm(`Import zastąpi obecny zeszyt napraw i wkładek (${repairRecords.length}) wpisami z pliku (${importedRepairRecords.length}). Kontynuować?`)) {
        importRepairInput.value = "";
        return;
      }

      repairRecords = importedRepairRecords;
      await saveRepairRecords();
      rebuildDerivedData();
      render();
      importRepairInput.value = "";
    } catch (error) {
      repairRecords = previousRepairRecords;
      localStorage.setItem(REPAIR_STORAGE_KEY, JSON.stringify(repairRecords));
      rebuildDerivedData();
      render();
      alert(`Nie udało się zaimportować pliku: ${error.message}`);
    }
  });
  reader.readAsText(file);
}

function parseImportFile(file, content) {
  const fileName = normalize(file.name);
  if (fileName.endsWith(".csv") || file.type === "text/csv") {
    return parseCsv(content);
  }
  return JSON.parse(content);
}

function parseCsv(content) {
  const normalizedContent = String(content).replace(/^\ufeff/, "");
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let index = 0; index < normalizedContent.length; index += 1) {
    const char = normalizedContent[index];
    const nextChar = normalizedContent[index + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if ((char === ";" || char === ",") && !inQuotes) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") index += 1;
      row.push(cell);
      if (row.some((value) => value.trim())) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  row.push(cell);
  if (row.some((value) => value.trim())) rows.push(row);
  if (rows.length === 0) return [];

  const headers = rows[0].map((header) => normalizeImportHeader(header));
  return rows.slice(1).map((values) => {
    const record = {};
    headers.forEach((header, index) => {
      if (header) record[header] = values[index] ?? "";
    });
    return record;
  });
}

function normalizeImportHeader(header) {
  const key = normalize(header)
    .replaceAll("/", " ")
    .replaceAll("-", " ")
    .replaceAll("_", " ")
    .replace(/\s+/g, " ")
    .trim();

  const aliases = {
    "data przyjęcia": "receivedDate",
    "fifo dni": "",
    "nazwa aparatu": "deviceName",
    "aparat produkt": "deviceName",
    "aparat wkładka": "deviceName",
    "aparat wkladka": "deviceName",
    "numer seryjny": "serialNumber",
    "typ": "type",
    "miejsce": "location",
    "data odbioru": "pickupDate",
    "imię i nazwisko": "customerName",
    "faktura sprzedaży": "salesInvoice",
    "data zwrotu wymiany": "returnDate",
    "nr listu wz": "waybillNumber",
    "ezwm": "ezwm",
    "uwagi": "notes",
    "data wysłania": "sentDate",
    "data wyslania": "sentDate",
    "data powrotu": "returnDate",
    "status": "status"
  };

  return aliases[key] ?? key;
}

function normalizeImportedRecords(importedRecords, allowedFields) {
  return importedRecords.map((record) => ({
    id: record.id || makeId(),
    ...normalizeImportedRecordFields(record, allowedFields)
  }));
}

function normalizeImportedRecordFields(record, allowedFields) {
  const normalizedRecord = Object.fromEntries(allowedFields.map((field) => [field, String(record[field] ?? "")]));
  if ("category" in normalizedRecord && !normalizedRecord.category && record.type) {
    normalizedRecord.category = String(record.type);
  }
  if ("type" in normalizedRecord && !normalizedRecord.type && record.category) {
    normalizedRecord.type = String(record.category);
  }
  if ("type" in normalizedRecord) {
    normalizedRecord.type = normalizeDeviceType(normalizedRecord.type || "NA STANIE");
  }
  if ("deviceName" in normalizedRecord) {
    normalizedRecord.deviceName = normalizeDeviceName(normalizedRecord.deviceName);
  }

  ["receivedDate", "sentDate", "returnDate", "pickupDate"].forEach((field) => {
    if (field in normalizedRecord) {
      normalizedRecord[field] = normalizeDateInput(normalizedRecord[field]);
    }
  });

  if ("customerName" in normalizedRecord) {
    normalizedRecord.customerName = titleCaseName(normalizedRecord.customerName);
  }
  if ("serialNumber" in normalizedRecord) {
    normalizedRecord.serialNumber = normalizeSerialNumber(normalizedRecord.serialNumber);
  }
  if ("salesInvoice" in normalizedRecord) {
    normalizedRecord.salesInvoice = normalizeSalesInvoice(normalizedRecord.salesInvoice);
  }
  if ("location" in normalizedRecord) {
    normalizedRecord.location = normalizeRepairLocation(normalizedRecord.location);
  }
  if ("ezwm" in normalizedRecord) {
    normalizedRecord.ezwm = normalizeEzwmStatus(normalizedRecord.ezwm);
  }
  if ("category" in normalizedRecord) {
    normalizedRecord.category = normalizeRepairCategory(normalizedRecord.category);
  }
  if ("status" in normalizedRecord && "category" in normalizedRecord) {
    normalizedRecord.status = statusFromRepairDates(normalizedRecord);
  }
  return normalizedRecord;
}

function normalizeDateInput(value) {
  const text = String(value ?? "").trim();
  if (!text) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;

  const match = text.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
  if (!match) return text;

  const [, day, month, year] = match;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function debounce(callback, wait) {
  let timeoutId = 0;
  return (...args) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => callback(...args), wait);
  };
}

function resetAndRenderDeviceViews() {
  resetTableRenderLimit("devices");
  renderDeviceViews();
}

function resetAndRenderDemoRecords() {
  resetTableRenderLimit("demo");
  renderDemoRecords();
}

function resetAndRenderRepairRecords() {
  resetTableRenderLimit("repairs");
  resetTableRenderLimit("repairOpen");
  renderRepairRecords();
}

document.querySelector("#addBtn").addEventListener("click", () => openDialog());
document.querySelector("#exportBtn").addEventListener("click", () => chooseExportFormat(exportCsv, exportJson));
document.querySelector("#importBtn").addEventListener("click", () => importInput.click());
document.querySelector("#printBtn").addEventListener("click", () => window.print());
printStockChecklistBtn.addEventListener("click", printStockChecklist);
showMoreRecordsBtn.addEventListener("click", () => showMoreTableRows("devices", renderDeviceViews));
document.querySelector("#addRepairBtn").addEventListener("click", () => openRepairDialog());
document.querySelector("#exportRepairBtn").addEventListener("click", () => chooseExportFormat(exportRepairCsv, exportRepairJson));
document.querySelector("#importRepairBtn").addEventListener("click", () => importRepairInput.click());
document.querySelector("#printRepairBtn").addEventListener("click", () => window.print());
showMoreRepairBtn.addEventListener("click", () => showMoreTableRows("repairs", renderRepairRecords));
showMoreRepairOpenBtn.addEventListener("click", () => showMoreTableRows("repairOpen", renderRepairRecords));
document.querySelector("#addDemoBtn").addEventListener("click", () => openDemoDialog());
document.querySelector("#exportDemoBtn").addEventListener("click", exportDemoJson);
printDemoChecklistBtn.addEventListener("click", printDemoChecklist);
showMoreDemoBtn.addEventListener("click", () => showMoreTableRows("demo", renderDemoRecords));
showMoreDataControlBtn.addEventListener("click", () => showMoreTableRows("dataControl", renderDataControlView));
dataControlSearchInput.addEventListener("input", debounce(() => {
  resetTableRenderLimit("dataControl");
  updateStats();
  renderDataControlView();
}, SEARCH_DEBOUNCE_MS));
document.querySelector("#closeDialogBtn").addEventListener("click", closeDialog);
document.querySelector("#cancelBtn").addEventListener("click", closeDialog);
document.querySelector("#closeRepairDialogBtn").addEventListener("click", closeRepairDialog);
document.querySelector("#cancelRepairBtn").addEventListener("click", closeRepairDialog);
document.querySelector("#closeDemoDialogBtn").addEventListener("click", closeDemoDialog);
document.querySelector("#cancelDemoBtn").addEventListener("click", closeDemoDialog);
deleteBtn.addEventListener("click", deleteCurrentRecord);
deleteRepairBtn.addEventListener("click", deleteCurrentRepairRecord);
deleteDemoBtn.addEventListener("click", deleteCurrentDemoRecord);
recordForm.addEventListener("submit", saveFormRecord);
repairForm.addEventListener("submit", saveRepairFormRecord);
demoForm.addEventListener("submit", saveDemoFormRecord);
recordForm.addEventListener("click", handleClearDateClick);
repairForm.addEventListener("click", handleClearDateClick);
demoForm.addEventListener("click", handleClearDateClick);
document.querySelector("#customerName").addEventListener("input", syncDeviceTypeFromFields);
document.querySelector("#salesInvoice").addEventListener("input", syncSalesInvoiceUppercase);
document.querySelector("#deviceName").addEventListener("input", scheduleDeviceNameCorrection);
document.querySelector("#deviceName").addEventListener("blur", correctDeviceNameInput);
document.querySelector("#returnDate").addEventListener("change", syncDeviceTypeFromFields);
typeSelect.addEventListener("change", syncStockLocationFromType);
searchInput.addEventListener("input", debounce(resetAndRenderDeviceViews, SEARCH_DEBOUNCE_MS));
typeFilter.addEventListener("change", resetAndRenderDeviceViews);
ezwmFilter.addEventListener("change", resetAndRenderDeviceViews);
fifoFilter.addEventListener("change", resetAndRenderDeviceViews);
repairSearchInput.addEventListener("input", debounce(resetAndRenderRepairRecords, SEARCH_DEBOUNCE_MS));
repairCategoryFilter.addEventListener("change", resetAndRenderRepairRecords);
repairStatusFilter.addEventListener("change", resetAndRenderRepairRecords);
repairLocationFilter.addEventListener("change", resetAndRenderRepairRecords);
demoSearchInput.addEventListener("input", debounce(resetAndRenderDemoRecords, SEARCH_DEBOUNCE_MS));
demoStatusFilter.addEventListener("change", resetAndRenderDemoRecords);
demoManufacturerFilter.addEventListener("change", resetAndRenderDemoRecords);
demoLocationFilter.addEventListener("change", resetAndRenderDemoRecords);
importInput.addEventListener("change", importJson);
importRepairInput.addEventListener("change", importRepairJson);
document.querySelector("#repairReceivedDate").addEventListener("change", syncRepairStatusFromDates);
document.querySelector("#repairSentDate").addEventListener("change", syncRepairStatusFromDates);
document.querySelector("#repairReturnDate").addEventListener("change", syncRepairStatusFromDates);
document.querySelector("#repairPickupDate").addEventListener("change", syncRepairStatusFromDates);
document.querySelector("#demoReceivedDate").addEventListener("change", syncDemoManufacturerReturnDate);
document.querySelector("#demoManufacturerReturnDate").addEventListener("change", markDemoManufacturerReturnDateChange);
document.querySelector("#demoReturnDate").addEventListener("change", markDemoReturnDateChange);
document.querySelector("#demoManufacturer").addEventListener("input", syncDemoUppercaseInput);
document.querySelector("#demoDeviceName").addEventListener("input", syncDemoManufacturerReturnDate);
document.querySelector("#demoSerialNumber").addEventListener("input", syncDemoUppercaseInput);
document.querySelector("#demoCurrentUser").addEventListener("input", formatDemoCurrentUserInput);
document.querySelector("#demoCurrentUser").addEventListener("blur", finalizeDemoCurrentUserInput);
document.querySelector("#demoStatus").addEventListener("change", syncDemoReturnedStatus);
demoCurrentAttachmentInput.addEventListener("change", () => {
  addDemoAttachmentFiles(demoCurrentAttachmentInput.files, () => demoCurrentAttachmentsDraft);
  demoCurrentAttachmentInput.value = "";
  renderDemoCurrentAttachments();
});
document.querySelector("#closeDemoAttachmentPreviewBtn").addEventListener("click", () => demoAttachmentPreviewDialog.close());
authForm?.addEventListener("submit", handleAuthSubmit);
authDialog?.addEventListener("cancel", (event) => event.preventDefault());
logoutBtn?.addEventListener("click", logoutFromSupabase);
document.querySelector("#openDemoReturnRecordsBtn")?.addEventListener("click", () => {
  demoManufacturerFilter.value = "";
  demoStatusFilter.value = "DO ZWROTU";
  demoLocationFilter.value = "";
  demoSearchInput.value = "";
  demoReturnReminderDialog.close();
  switchNotebook("devices");
  switchView("demo", "devices");
});

notebookSwitchButtons.forEach((button) => {
  button.addEventListener("click", () => switchNotebook(button.dataset.notebook));
});

tabButtons.forEach((button) => {
  button.addEventListener("click", () => switchView(button.dataset.view, button.dataset.viewGroup));
});

document.querySelectorAll("th[data-sort]").forEach((header) => {
  header.addEventListener("click", () => {
    const key = header.dataset.sort;
    sortState = {
      key,
      direction: sortState.key === key && sortState.direction === "asc" ? "desc" : "asc"
    };
    resetTableRenderLimit("devices");
    render();
  });
});

document.querySelectorAll("th[data-repair-sort]").forEach((header) => {
  header.addEventListener("click", () => {
    const key = header.dataset.repairSort;
    repairSortState = {
      key,
      direction: repairSortState.key === key && repairSortState.direction === "asc" ? "desc" : "asc"
    };
    resetTableRenderLimit("repairs");
    resetTableRenderLimit("repairOpen");
    render();
  });
});

document.querySelectorAll("th[data-demo-sort]").forEach((header) => {
  header.addEventListener("click", () => {
    const key = header.dataset.demoSort;
    demoSortState = {
      key,
      direction: demoSortState.key === key && demoSortState.direction === "asc" ? "desc" : "asc"
    };
    resetTableRenderLimit("demo");
    renderDemoRecords();
  });
});

async function init() {
  setCurrentYearTitle();

  if (hasSupabaseSettings && !hasSupabaseConfig) {
    records = [];
    repairRecords = [];
    demoRecords = [];
    rebuildDerivedData();
    render();
    setConnectionStatus("error", "Supabase niedostępny");
    console.error("Nie udało się załadować biblioteki Supabase.");
    return;
  }

  if (hasSupabaseConfig) {
    setConnectionStatus("syncing", "Łączenie...");
    const { data, error } = await supabaseClient.auth.getSession();

    if (error) {
      setConnectionStatus("error", "Błąd połączenia");
      showAuthDialog(`Nie udało się połączyć z Supabase: ${error.message}`);
      return;
    }

    supabaseClient.auth.onAuthStateChange((event, session) => {
      if (event === "TOKEN_REFRESHED" && session?.user) updateConnectionUser(session.user);
      if (event === "SIGNED_OUT") {
        updateConnectionUser(null);
        setConnectionStatus("offline", "Zaloguj się");
      }
    });

    if (!data.session?.user) {
      records = [];
      repairRecords = [];
      demoRecords = [];
      rebuildDerivedData();
      render();
      setConnectionStatus("offline", "Zaloguj się");
      showAuthDialog();
      return;
    }

    try {
      await activateSupabaseSession(data.session.user);
    } catch (sessionError) {
      console.warn(sessionError);
      setConnectionStatus("error", "Błąd połączenia");
      showAuthDialog(sessionError.message);
    }
    return;
  }

  setConnectionStatus(hasSharedServer ? "online" : "local", hasSharedServer ? "Serwer lokalny" : "Tryb lokalny");
  [records, repairRecords, demoRecords] = await Promise.all([loadRecords(), loadRepairRecords(), loadDemoRecords()]);
  rebuildDerivedData();
  render();

  if (hasSharedServer) {
    window.setInterval(refreshRecordsFromServer, SERVER_REFRESH_MS);
  }
}

init();
