const STORAGE_KEY = "baza-aparatow-records-2026-clean";
const REPAIR_STORAGE_KEY = "zeszyt-napraw-wkladek-records-2026-clean";
const DEMO_STORAGE_KEY = "zeszyt-aparatow-demo-records";
const API_URL = "/api/records";
const REPAIR_API_URL = "/api/repair-records";
const SERVER_REFRESH_MS = 10000;
const SUPABASE_PAGE_SIZE = 1000;
const SUPABASE_DELETE_BATCH_SIZE = 200;
const SUPABASE_DEVICE_TABLE = "device_records";
const SUPABASE_REPAIR_TABLE = "repair_records";
const SUPABASE_DEMO_TABLE = "demo_records";
const SUPABASE_SETTINGS_TABLE = "app_settings";
const DEMO_SEED_KEY = "demo-xlsx-import-v1";
const SEARCH_DEBOUNCE_MS = 120;
const MAX_DEVICE_NAME_SUGGESTIONS = 300;
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
let demoStats = { all: 0, available: 0, inUse: 0, review: 0 };
let currentSupabaseUser = null;
let supabaseRealtimeChannel = null;
let supabaseRefreshTimeout = 0;
let supabaseChangeTimeout = 0;
let pendingSupabaseChanges = [];

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

const demoFields = ["receivedDate", "manufacturer", "deviceName", "serialNumber", "location", "currentUser", "notes"];

let records = [];
let repairRecords = [];
let demoRecords = [];
let sortState = { key: "receivedDate", direction: "desc" };
let repairSortState = { key: "receivedDate", direction: "desc" };
let demoSortState = { key: "receivedDate", direction: "desc" };
let activeNotebook = "devices";
let activeDeviceView = "database";

const recordsBody = document.querySelector("#recordsBody");
const emptyState = document.querySelector("#emptyState");
const repairRecordsBody = document.querySelector("#repairRecordsBody");
const repairEmptyState = document.querySelector("#repairEmptyState");
const repairOpenRecordsBody = document.querySelector("#repairOpenRecordsBody");
const repairOpenEmptyState = document.querySelector("#repairOpenEmptyState");
const demoRecordsBody = document.querySelector("#demoRecordsBody");
const demoEmptyState = document.querySelector("#demoEmptyState");
const stockBody = document.querySelector("#stockBody");
const stockEmptyState = document.querySelector("#stockEmptyState");
const countAllLabel = document.querySelector("#countAllLabel");
const countSoldLabel = document.querySelector("#countSoldLabel");
const countInvoiceLabel = document.querySelector("#countInvoiceLabel");
const countStockLabel = document.querySelector("#countStockLabel");
const searchInput = document.querySelector("#searchInput");
const typeFilter = document.querySelector("#typeFilter");
const typeSelect = document.querySelector("#type");
const fifoFilter = document.querySelector("#fifoFilter");
const repairSearchInput = document.querySelector("#repairSearchInput");
const repairCategoryFilter = document.querySelector("#repairCategoryFilter");
const repairStatusFilter = document.querySelector("#repairStatusFilter");
const demoSearchInput = document.querySelector("#demoSearchInput");
const demoStatusFilter = document.querySelector("#demoStatusFilter");
const demoLocationFilter = document.querySelector("#demoLocationFilter");
const deviceNameSuggestions = document.querySelector("#deviceNameSuggestions");
const customerNameSuggestions = document.querySelector("#customerNameSuggestions");
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

async function loadSupabaseTable(tableName, normalizer) {
  const loadedRecords = [];

  for (let from = 0; ; from += SUPABASE_PAGE_SIZE) {
    const { data, error } = await supabaseClient
      .from(tableName)
      .select("id,data,updated_at")
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

async function loadSupabaseIds(tableName) {
  const ids = [];

  for (let from = 0; ; from += SUPABASE_PAGE_SIZE) {
    const { data, error } = await supabaseClient
      .from(tableName)
      .select("id")
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
  const { error } = await supabaseClient.from(tableName).upsert(supabaseRecordRow(record), { onConflict: "id" });
  if (error) {
    setConnectionStatus("error", "Błąd zapisu");
    throw new Error(`Nie udało się zapisać danych w Supabase: ${error.message}`);
  }
  setConnectionStatus("online", "Supabase");
}

async function deleteSupabaseRecord(tableName, id) {
  setConnectionStatus("syncing", "Usuwanie...");
  const { error } = await supabaseClient.from(tableName).delete().eq("id", id);
  if (error) {
    setConnectionStatus("error", "Błąd zapisu");
    throw new Error(`Nie udało się usunąć danych z Supabase: ${error.message}`);
  }
  setConnectionStatus("online", "Supabase");
}

async function replaceSupabaseTable(tableName, sourceRecords) {
  setConnectionStatus("syncing", "Importowanie...");
  const existingIds = await loadSupabaseIds(tableName);

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
    .from(SUPABASE_SETTINGS_TABLE)
    .select("key")
    .eq("key", DEMO_SEED_KEY)
    .maybeSingle();
  if (seedStateError) throw new Error(`Nie udało się sprawdzić importu Demo: ${seedStateError.message}`);
  if (seedState) return;

  await replaceSupabaseTable(SUPABASE_DEMO_TABLE, seedRecords);
  const { error: markError } = await supabaseClient.from(SUPABASE_SETTINGS_TABLE).upsert({
    key: DEMO_SEED_KEY,
    value: { source: "demo.xlsx", records: seedRecords.length },
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
      loadSupabaseTable(SUPABASE_DEVICE_TABLE, normalizeDeviceRecordsForUse),
      loadSupabaseTable(SUPABASE_REPAIR_TABLE, normalizeRepairRecordsForUse),
      loadSupabaseTable(SUPABASE_DEMO_TABLE, normalizeDemoRecordsForUse)
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
    .on("postgres_changes", { event: "*", schema: "public", table: SUPABASE_DEVICE_TABLE }, (payload) =>
      queueSupabaseChange(SUPABASE_DEVICE_TABLE, payload)
    )
    .on("postgres_changes", { event: "*", schema: "public", table: SUPABASE_REPAIR_TABLE }, (payload) =>
      queueSupabaseChange(SUPABASE_REPAIR_TABLE, payload)
    )
    .on("postgres_changes", { event: "*", schema: "public", table: SUPABASE_DEMO_TABLE }, (payload) =>
      queueSupabaseChange(SUPABASE_DEMO_TABLE, payload)
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
    const sharedRecords = await loadSupabaseTable(SUPABASE_DEVICE_TABLE, normalizeDeviceRecordsForUse);
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
    const sharedRecords = await loadSupabaseTable(SUPABASE_DEMO_TABLE, normalizeDemoRecordsForUse);
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
    await replaceSupabaseTable(SUPABASE_DEVICE_TABLE, records);
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
    await upsertSupabaseRecord(SUPABASE_DEMO_TABLE, record);
  }
}

async function persistDeletedDemoRecord(id) {
  localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(demoRecords));
  if (hasSupabaseConfig) {
    await deleteSupabaseRecord(SUPABASE_DEMO_TABLE, id);
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

function normalizeSerialNumber(value) {
  return String(value ?? "").trim().toLocaleUpperCase("pl-PL");
}

function normalizeSalesInvoice(value) {
  return String(value ?? "").trim().toLocaleUpperCase("pl-PL");
}

function normalizeSalesInvoiceInput(value) {
  return String(value ?? "").toLocaleUpperCase("pl-PL");
}

function serialMatches(serialNumber, source, currentId) {
  const checkedSerial = normalizeSerialNumber(serialNumber);
  if (!checkedSerial) return [];
  return (serialIndex.get(checkedSerial) || []).filter((match) => !(match.source === source && match.id === currentId));
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
  if (isSold(record)) return "";
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
  normalizedRecord.sourceRow = String(normalizedRecord.sourceRow ?? "").trim();
  return normalizedRecord;
}

function normalizeDeviceRecordsForUse(recordsToNormalize) {
  return recordsToNormalize.map(normalizeDeviceRecordForUse);
}

function normalizeRepairRecordsForUse(recordsToNormalize) {
  return recordsToNormalize.map(normalizeRepairRecordForUse);
}

function normalizeDemoRecordsForUse(recordsToNormalize) {
  return recordsToNormalize.map(normalizeDemoRecordForUse);
}

function demoLocationGroup(record) {
  const text = normalize(`${record.location} ${record.currentUser}`);
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

function demoStatus(record) {
  if (demoMissingStatus(record)) return "BRAK / ZGUBIONY";
  if (String(record.currentUser ?? "").trim()) return "W UŻYCIU";
  return "DOSTĘPNY";
}

function demoQualityIssues(record, serialCounts = null) {
  const issues = [];
  if (!record.receivedDate) issues.push("brak daty");
  if (!record.manufacturer) issues.push("brak producenta");
  if (!record.deviceName) issues.push("brak modelu");
  if (!record.serialNumber) issues.push("brak numeru seryjnego");
  if (record.serialNumber && serialCounts?.get(record.serialNumber) > 1) issues.push("powtórzony numer seryjny");
  if (/[?]{2,}/.test(`${record.location} ${record.currentUser} ${record.notes}`)) issues.push("niepewna informacja");
  if (/^\d{5}$/.test(record.location)) issues.push("miejsce zapisane jako liczba");
  return issues;
}

function displayType(record) {
  return normalizeDeviceType(record.type);
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

function rebuildDeviceDerivedData() {
  deviceDerived.clear();
  deviceStats = { all: records.length, sold: 0, reserved: 0, stock: 0 };

  records.forEach((record) => {
    const display = displayType(record);
    const sold = display === "SPRZEDANY";
    const inStock = display === "NA STANIE";
    const age = stockAge(record);
    const location = normalizeRepairLocation(record.location);

    if (sold) deviceStats.sold += 1;
    if (display === "REZERWACJA") deviceStats.reserved += 1;
    if (inStock) deviceStats.stock += 1;

    deviceDerived.set(record.id, {
      displayType: display,
      isSold: sold,
      isInStock: inStock,
      age,
      fifoLevel: sold ? "" : age === null ? "" : age >= 180 ? "critical" : age >= 90 ? "warning" : "",
      ageLevel: sold ? "sold" : age === null ? "missing" : age >= 180 ? "critical" : age >= 90 ? "warning" : age >= 30 ? "aging" : "fresh",
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
  demoStats = { all: demoRecords.length, available: 0, inUse: 0, review: 0 };
  const serialCounts = new Map();

  demoRecords.forEach((record) => {
    if (!record.serialNumber) return;
    serialCounts.set(record.serialNumber, (serialCounts.get(record.serialNumber) || 0) + 1);
  });

  demoRecords.forEach((record) => {
    const status = demoStatus(record);
    const locationGroup = demoLocationGroup(record);
    const issues = demoQualityIssues(record, serialCounts);
    if (status === "DOSTĘPNY") demoStats.available += 1;
    if (status === "W UŻYCIU") demoStats.inUse += 1;
    if (issues.length) demoStats.review += 1;

    demoDerived.set(record.id, {
      status,
      locationGroup,
      issues,
      searchBlob: [...demoFields.map((field) => record[field]), status, locationGroup, ...issues].map(normalize).join("\n")
    });
  });
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
  const selectedFifo = fifoFilter.value;

  return records
    .filter((record) => {
      const meta = deviceDerived.get(record.id);
      const matchesType = !selectedType || meta?.displayType === selectedType;
      const age = meta?.age ?? null;
      const matchesFifo =
        !selectedFifo ||
        selectedFifo === "fifo" ||
        (!meta?.isSold && selectedFifo === "90" && age !== null && age >= 90) ||
        (!meta?.isSold && selectedFifo === "180" && age !== null && age >= 180);
      const matchesQuery = !query || meta?.searchBlob.includes(query);
      return matchesType && matchesFifo && matchesQuery;
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

  if (activeNotebook === "repairs") {
    renderRepairRecords();
    return;
  }

  if (activeDeviceView === "demo") {
    renderDemoRecords();
    return;
  }

  renderDeviceViews();
}

function renderDeviceViews() {
  const visibleRecords = filteredRecords();
  renderTableRows(recordsBody, visibleRecords.map(createRow));
  emptyState.hidden = visibleRecords.length > 0;
  renderStockView();
}

function filteredDemoRecords() {
  const query = normalize(demoSearchInput.value).trim();
  const selectedStatus = demoStatusFilter.value;
  const selectedLocation = demoLocationFilter.value;

  return demoRecords
    .filter((record) => {
      const meta = demoDerived.get(record.id);
      const matchesStatus =
        !selectedStatus ||
        meta?.status === selectedStatus ||
        (selectedStatus === "DO WYJAŚNIENIA" && Boolean(meta?.issues.length));
      const matchesLocation = !selectedLocation || meta?.locationGroup === selectedLocation;
      const matchesQuery = !query || meta?.searchBlob.includes(query);
      return matchesStatus && matchesLocation && matchesQuery;
    })
    .sort((left, right) => {
      const leftValue =
        demoSortState.key === "status" ? demoDerived.get(left.id)?.status : String(left[demoSortState.key] ?? "");
      const rightValue =
        demoSortState.key === "status" ? demoDerived.get(right.id)?.status : String(right[demoSortState.key] ?? "");
      const compared = collator.compare(String(leftValue ?? ""), String(rightValue ?? ""));
      return demoSortState.direction === "asc" ? compared : -compared;
    });
}

function renderDemoRecords() {
  const visibleRecords = filteredDemoRecords();
  renderTableRows(demoRecordsBody, visibleRecords.map(createDemoRow));
  demoEmptyState.hidden = visibleRecords.length > 0;
}

function filteredRepairRecords() {
  const query = normalize(repairSearchInput.value).trim();
  const selectedCategory = repairCategoryFilter.value;
  const selectedStatus = repairStatusFilter.value;

  const matchingRecords = repairRecords
    .filter((record) => {
      const meta = repairDerived.get(record.id);
      const category = meta?.category ?? normalizeRepairCategory(record.category);
      const status = meta?.status ?? effectiveRepairStatus(record);
      const matchesCategory = !selectedCategory || category === selectedCategory;
      const matchesStatus = !selectedStatus || status === selectedStatus;
      const matchesQuery = !query || meta?.searchBlob.includes(query);
      return matchesCategory && matchesStatus && matchesQuery;
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
  renderTableRows(repairRecordsBody, visibleRecords.map(createRepairRow));
  renderTableRows(repairOpenRecordsBody, openRecords.map(createRepairRow));
  repairEmptyState.hidden = visibleRecords.length > 0;
  repairOpenEmptyState.hidden = openRecords.length > 0;
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
  if (displayType(record) === "SPRZEDANY") {
    row.classList.add("device-sold-row");
  }
  const level = deviceDerived.get(record.id)?.fifoLevel ?? fifoLevel(record);
  if (level) row.classList.add(`fifo-${level}`);

  const cells = [
    formatDate(record.receivedDate),
    createAgePill(record),
    record.deviceName,
    createSerialPill(record.serialNumber),
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
  if (meta?.issues.length) row.classList.add("demo-needs-review");
  if (meta?.status === "BRAK / ZGUBIONY") row.classList.add("demo-missing");

  const statusWrap = document.createElement("div");
  const statusPill = document.createElement("span");
  statusPill.className = `status-pill ${meta?.status.replaceAll(" / ", "-").replaceAll(" ", "-") || "DOSTĘPNY"}`;
  statusPill.textContent = meta?.status || "DOSTĘPNY";
  statusWrap.append(statusPill);

  if (meta?.issues.length) {
    const quality = document.createElement("span");
    quality.className = "demo-quality";
    quality.textContent = `Do poprawy: ${meta.issues.join(", ")}`;
    statusWrap.append(quality);
  }

  const cells = [
    statusWrap,
    formatDate(record.receivedDate),
    record.manufacturer,
    record.deviceName,
    createSerialPill(record.serialNumber),
    record.location,
    record.currentUser,
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
  editButton.addEventListener("click", () => openDemoDialog(record));
  actions.append(editButton);
  row.append(actions);
  return row;
}

function createAgePill(record) {
  const meta = deviceDerived.get(record.id);
  const age = meta?.age ?? stockAge(record);
  const pill = document.createElement("span");
  const level = meta?.ageLevel ?? ageLevel(record, age);
  pill.className = `age-pill ${level}`;
  pill.textContent = formatDaysLabel(age);
  return pill;
}

function ageLevel(record, age = stockAge(record)) {
  if (isSold(record)) return "sold";
  if (age === null) return "missing";
  if (age >= 180) return "critical";
  if (age >= 90) return "warning";
  if (age >= 30) return "aging";
  return "fresh";
}

function createSerialPill(serialNumber) {
  const pill = document.createElement("span");
  pill.className = "serial-pill";
  pill.textContent = serialNumber || "brak numeru";
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
  const normalizedLocation = String(location || "T12").trim().toUpperCase();
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
    document.querySelector("#countSold").textContent = demoStats.available;
    document.querySelector("#countInvoice").textContent = demoStats.inUse;
    document.querySelector("#countStock").textContent = demoStats.review;
    countAllLabel.textContent = "aparatów demo";
    countSoldLabel.textContent = "dostępne";
    countInvoiceLabel.textContent = "w użyciu";
    countStockLabel.textContent = "do wyjaśnienia";
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
  const groups = groupStockRecords(stockRecords);

  renderTableRows(stockBody, groups.map(createStockRow));
  stockEmptyState.hidden = groups.length > 0;
}

function groupStockRecords(stockRecords) {
  const groups = new Map();

  stockRecords.forEach((record) => {
    const name = String(record.deviceName ?? "").trim() || "Bez nazwy";
    const location = normalizeRepairLocation(record.location);
    const key = `${name}__${location}`;
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
  renderDeviceViews();
}

function openDialog(record = null) {
  recordForm.reset();
  document.querySelector("#recordId").value = record?.id ?? "";
  dialogTitle.textContent = record ? "Edytuj aparat" : "Dodaj aparat";
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
  document.querySelector("#demoId").value = record?.id ?? "";
  demoDialogTitle.textContent = record ? "Edytuj aparat demo" : "Dodaj aparat demo";
  demoRecordEyebrow.textContent = record
    ? `${demoRecords.findIndex((item) => item.id === record.id) + 1}/${demoRecords.length}`
    : "Nowy wpis";
  deleteDemoBtn.hidden = !record;

  const fieldMap = {
    receivedDate: "#demoReceivedDate",
    manufacturer: "#demoManufacturer",
    deviceName: "#demoDeviceName",
    serialNumber: "#demoSerialNumber",
    location: "#demoLocation",
    currentUser: "#demoCurrentUser",
    notes: "#demoNotes"
  };

  demoFields.forEach((field) => {
    document.querySelector(fieldMap[field]).value = record?.[field] ?? "";
  });

  if (!record) document.querySelector("#demoReceivedDate").value = todayInputValue();
  demoDialog.showModal();
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
  return data;
}

function normalizeRepairLocation(location) {
  const normalizedLocation = String(location || "").trim().toUpperCase();
  return ["T12", "P50", "P63"].includes(normalizedLocation) ? normalizedLocation : "T12";
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

function syncSalesInvoiceUppercase(event) {
  event.target.value = normalizeSalesInvoiceInput(event.target.value);
  syncDeviceTypeFromFields();
}

function handleClearDateClick(event) {
  const button = event.target.closest(".clear-date-btn");
  if (!button) return;

  const targetId = button.dataset.target;
  const input = document.getElementById(targetId);
  if (!input) return;

  input.value = "";

  if (targetId.startsWith("demo")) return;

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
    alert(error.message);
  }
}

async function deleteCurrentRecord() {
  const id = document.querySelector("#recordId").value;
  if (!id) return;
  const record = records.find((item) => item.id === id);
  const label = record ? `${record.deviceName} (${record.serialNumber})` : "ten rekord";

  if (confirm(`Usunąć ${label}?`)) {
    records = records.filter((item) => item.id !== id);
    try {
      await persistDeletedDeviceRecord(id);
      rebuildDerivedData();
      render();
      closeDialog();
    } catch (error) {
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
    alert(error.message);
  }
}

async function deleteCurrentRepairRecord() {
  const id = document.querySelector("#repairId").value;
  if (!id) return;
  const record = repairRecords.find((item) => item.id === id);
  const label = record ? `${record.customerName} (${record.category})` : "ten wpis";

  if (confirm(`Usunąć ${label}?`)) {
    repairRecords = repairRecords.filter((item) => item.id !== id);
    try {
      await persistDeletedRepairRecord(id);
      rebuildDerivedData();
      render();
      closeRepairDialog();
    } catch (error) {
      alert(error.message);
    }
  }
}

async function saveDemoFormRecord(event) {
  event.preventDefault();
  const id = document.querySelector("#demoId").value;
  const data = demoFormRecord();
  let savedRecord;
  if (!confirmSerialNumberSave(data.serialNumber, "demo", id)) return;

  if (id) {
    demoRecords = demoRecords.map((record) => {
      if (record.id !== id) return record;
      savedRecord = { ...record, ...data };
      return savedRecord;
    });
  } else {
    savedRecord = { id: makeId(), ...data };
    demoRecords = [savedRecord, ...demoRecords];
  }

  try {
    await persistDemoRecord(savedRecord);
    rebuildDerivedData();
    render();
    closeDemoDialog();
  } catch (error) {
    alert(error.message);
  }
}

async function deleteCurrentDemoRecord() {
  const id = document.querySelector("#demoId").value;
  if (!id) return;
  const record = demoRecords.find((item) => item.id === id);
  const label = record ? `${record.deviceName} (${record.serialNumber})` : "ten wpis";

  if (confirm(`Usunąć ${label}?`)) {
    demoRecords = demoRecords.filter((item) => item.id !== id);
    try {
      await persistDeletedDemoRecord(id);
      rebuildDerivedData();
      render();
      closeDemoDialog();
    } catch (error) {
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
    stockAge(record) ?? "",
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
    try {
      const imported = parseImportFile(file, reader.result);
      if (!Array.isArray(imported)) throw new Error("Import musi być listą rekordów.");

      records = normalizeImportedRecords(imported, fields);
      await saveRecords();
      rebuildDerivedData();
      render();
      importInput.value = "";
    } catch (error) {
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
    try {
      const imported = parseImportFile(file, reader.result);
      if (!Array.isArray(imported)) throw new Error("Import musi być listą wpisów.");

      repairRecords = normalizeImportedRecords(imported, repairFields);
      await saveRepairRecords();
      rebuildDerivedData();
      render();
      importRepairInput.value = "";
    } catch (error) {
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

document.querySelector("#addBtn").addEventListener("click", () => openDialog());
document.querySelector("#exportBtn").addEventListener("click", () => chooseExportFormat(exportCsv, exportJson));
document.querySelector("#importBtn").addEventListener("click", () => importInput.click());
document.querySelector("#printBtn").addEventListener("click", () => window.print());
document.querySelector("#addRepairBtn").addEventListener("click", () => openRepairDialog());
document.querySelector("#exportRepairBtn").addEventListener("click", () => chooseExportFormat(exportRepairCsv, exportRepairJson));
document.querySelector("#importRepairBtn").addEventListener("click", () => importRepairInput.click());
document.querySelector("#printRepairBtn").addEventListener("click", () => window.print());
document.querySelector("#addDemoBtn").addEventListener("click", () => openDemoDialog());
document.querySelector("#exportDemoBtn").addEventListener("click", exportDemoJson);
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
document.querySelector("#returnDate").addEventListener("change", syncDeviceTypeFromFields);
typeSelect.addEventListener("change", updateDeviceTypeSelectStyles);
searchInput.addEventListener("input", debounce(renderDeviceViews, SEARCH_DEBOUNCE_MS));
typeFilter.addEventListener("change", render);
fifoFilter.addEventListener("change", render);
repairSearchInput.addEventListener("input", debounce(renderRepairRecords, SEARCH_DEBOUNCE_MS));
repairCategoryFilter.addEventListener("change", render);
repairStatusFilter.addEventListener("change", render);
demoSearchInput.addEventListener("input", debounce(renderDemoRecords, SEARCH_DEBOUNCE_MS));
demoStatusFilter.addEventListener("change", render);
demoLocationFilter.addEventListener("change", render);
importInput.addEventListener("change", importJson);
importRepairInput.addEventListener("change", importRepairJson);
document.querySelector("#repairReceivedDate").addEventListener("change", syncRepairStatusFromDates);
document.querySelector("#repairSentDate").addEventListener("change", syncRepairStatusFromDates);
document.querySelector("#repairReturnDate").addEventListener("change", syncRepairStatusFromDates);
document.querySelector("#repairPickupDate").addEventListener("change", syncRepairStatusFromDates);
authForm?.addEventListener("submit", handleAuthSubmit);
authDialog?.addEventListener("cancel", (event) => event.preventDefault());
logoutBtn?.addEventListener("click", logoutFromSupabase);

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
