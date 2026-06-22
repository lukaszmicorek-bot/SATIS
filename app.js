const APP_BASE_URL = window.location.protocol === "file:" ? "http://127.0.0.1:5192" : "";
const API_URL = `${APP_BASE_URL}/api/invoices`;
const IMPORT_EMAIL_URL = `${APP_BASE_URL}/api/import-email`;
const EMAIL_SETTINGS_URL = `${APP_BASE_URL}/api/email-settings`;
const PROFILES = {
  main: {
    title: "SATIS",
    subtitle: "Główna skrzynka z bieżącą bazą faktur."
  },
  secondary: {
    title: "FAKTURY 2026",
    subtitle: "Druga skrzynka, domyślny import od 1 stycznia 2026."
  }
};

let records = [];
let sortState = { key: "sale_date", direction: "desc" };
let activeProfile = "main";
let activeMainView = "invoices";
let recentlyImportedIds = new Set();
let selectedInvoiceIds = new Set();
let dialogOriginalRecord = null;

const recordsBody = document.querySelector("#recordsBody");
const emptyState = document.querySelector("#emptyState");
const profileEyebrow = document.querySelector("#profileEyebrow");
const profileTitle = document.querySelector("#profileTitle");
const profileSubtitle = document.querySelector("#profileSubtitle");
const profileTabs = [...document.querySelectorAll(".profile-tab")];
const mainViewTabs = [...document.querySelectorAll(".view-tab")];
const searchInput = document.querySelector("#searchInput");
const selectAllRows = document.querySelector("#selectAllRows");
const yearFilter = document.querySelector("#yearFilter");
const monthFilter = document.querySelector("#monthFilter");
const statusFilter = document.querySelector("#statusFilter");
const overdueFilter = document.querySelector("#overdueFilter");
const supplierFilter = document.querySelector("#supplierFilter");
const documentTypeFilter = document.querySelector("#documentTypeFilter");
const searchBox = searchInput.closest("label");
const yearFilterWrap = yearFilter.closest("label");
const monthFilterWrap = monthFilter.closest("label");
const statusFilterWrap = statusFilter.closest("label");
const overdueFilterWrap = overdueFilter.closest("label");
const supplierFilterWrap = supplierFilter.closest("label");
const documentTypeFilterWrap = documentTypeFilter.closest("label");
const mainViewTabsBar = document.querySelector("#mainViewTabs");
const tableZone = document.querySelector("#tableZone");
const statsView = document.querySelector("#statsView");
const serialsView = document.querySelector("#serialsView");
const serialsBody = document.querySelector("#serialsBody");
const serialsEmptyState = document.querySelector("#serialsEmptyState");
const statsSummary = document.querySelector("#statsSummary");
const statsSuppliers = document.querySelector("#statsSuppliers");
const statsMonths = document.querySelector("#statsMonths");
const statsStatuses = document.querySelector("#statsStatuses");
const appStatusBanner = document.querySelector("#appStatusBanner");
const appStatusTitle = document.querySelector("#appStatusTitle");
const appStatusMessage = document.querySelector("#appStatusMessage");
const importEmailBtn = document.querySelector("#importEmailBtn");
const rescanEmailBtn = document.querySelector("#rescanEmailBtn");
const invoiceDialog = document.querySelector("#invoiceDialog");
const invoiceForm = document.querySelector("#invoiceForm");
const emailSettingsDialog = document.querySelector("#emailSettingsDialog");
const emailSettingsForm = document.querySelector("#emailSettingsForm");
const previewDialog = document.querySelector("#previewDialog");
const pdfPreview = document.querySelector("#pdfPreview");
const previewTitle = document.querySelector("#previewTitle");
const previewPosition = document.querySelector("#previewPosition");
const previewPaidDate = document.querySelector("#previewPaidDate");
const previousPreviewBtn = document.querySelector("#previousPreviewBtn");
const nextPreviewBtn = document.querySelector("#nextPreviewBtn");
const paymentReminderDialog = document.querySelector("#paymentReminderDialog");
const paymentReminderProfileLabel = document.querySelector("#paymentReminderProfileLabel");
const paymentReminderBody = document.querySelector("#paymentReminderBody");
const paymentReminderSummary = document.querySelector("#paymentReminderSummary");
const hoverPreview = document.querySelector("#hoverPreview");
const hoverPdfPreview = document.querySelector("#hoverPdfPreview");
const deleteBtn = document.querySelector("#deleteBtn");
const emailSinceDate = document.querySelector("#emailSinceDate");
const issueDateInput = document.querySelector("#issueDate");
const saleDateInput = document.querySelector("#saleDate");
const paidDateInput = document.querySelector("#paidDate");
const paymentDateInput = document.querySelector("#paymentDate");
const parseStatusInput = document.querySelector("#parseStatus");
let hoverPreviewTimeout = null;
let currentReminderSignature = "";
let currentPreviewRecordId = "";
const dismissedReminderSignatures = new Set();

function setAppStatus(title = "", message = "") {
  if (!appStatusBanner) return;
  appStatusTitle.textContent = title || "Serwer aplikacji jest niedostępny.";
  appStatusMessage.textContent = message || "Uruchom start.command albo włącz autostart, aby baza działała bez terminala.";
  appStatusBanner.hidden = false;
}

function clearAppStatus() {
  if (!appStatusBanner) return;
  appStatusBanner.hidden = true;
}

async function pingHealth() {
  const response = await fetch(`${APP_BASE_URL || ""}/api/health`, { cache: "no-store" });
  return response.ok;
}

function queryWithProfile(baseUrl) {
  return `${baseUrl}?profile=${encodeURIComponent(activeProfile)}`;
}

function invoiceItemUrl(id, suffix = "") {
  return `${API_URL}/${id}${suffix}?profile=${encodeURIComponent(activeProfile)}`;
}

function bulkInvoiceUrl() {
  return `${API_URL}/bulk?profile=${encodeURIComponent(activeProfile)}`;
}

function profileMeta() {
  return PROFILES[activeProfile] || PROFILES.main;
}

function applyProfileHeader() {
  const meta = profileMeta();
  profileEyebrow.textContent = "FAKTURY";
  profileTitle.textContent = meta.title;
  profileSubtitle.textContent =
    activeMainView === "documents"
      ? "Wyceny, potwierdzenia sald, oferty i materiały informacyjne z tej skrzynki."
      : activeMainView === "serials"
        ? `Numery seryjne z faktur od 1 stycznia ${new Date().getFullYear()}, od najstarszych do najnowszych.`
      : activeProfile === "main" && activeMainView === "stats"
        ? "Statystyki i podsumowania dla bazy SATIS."
        : meta.subtitle;
  document.title = activeProfile === "main" ? "SATIS faktury" : "SATIS faktury - 2026";
  rescanEmailBtn.textContent = activeProfile === "secondary" ? "Import od 2026" : "Doskanuj wszystko";
  importEmailBtn.textContent = "Pobierz nowe";
  profileTabs.forEach((button) => {
    button.classList.toggle("active", button.dataset.profile === activeProfile);
  });
  mainViewTabsBar.hidden = false;
  if (activeProfile !== "main" && activeMainView === "stats") {
    activeMainView = "invoices";
  }
  mainViewTabs.forEach((button) => {
    button.hidden = activeProfile !== "main" && button.dataset.view === "stats";
    button.classList.toggle("active", button.dataset.view === activeMainView);
  });
  applyFilterMode();
}

function normalize(value) {
  return String(value ?? "").toLocaleLowerCase("pl-PL");
}

function compactNormalize(value) {
  return normalize(value).replace(/[^a-z0-9]/g, "");
}

function isShortNumericSearch(value) {
  return /^[0-9]{1,5}$/.test(value);
}

function serialSearchMatches(serialNumbers, query, compactQuery) {
  if (!query) return true;
  const serialTokens = String(serialNumbers || "")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);
  if (!serialTokens.length) return false;
  if (isShortNumericSearch(compactQuery)) {
    return serialTokens.some((token) => compactNormalize(token).includes(compactQuery));
  }
  return serialTokens.some((token) => normalize(token).includes(query) || compactNormalize(token).includes(compactQuery));
}

function numericSegmentSearchMatches(value, compactQuery) {
  const segments = String(value || "").match(/\d+/g) || [];
  return segments.some((segment) => segment === compactQuery || (compactQuery.length >= 6 && segment.endsWith(compactQuery)));
}

function generalSearchMatches(values, query, compactQuery) {
  if (!query) return true;
  if (isShortNumericSearch(compactQuery)) {
    return values.some((value) => numericSegmentSearchMatches(value, compactQuery));
  }
  return values.some((value) => normalize(value).includes(query)) ||
    (compactQuery && values.some((value) => compactNormalize(value).includes(compactQuery)));
}

function invoiceNumberSortValue(value) {
  const text = String(value || "").trim();
  const prefix = normalize(text).replace(/\d+/g, "#");
  const numbers = (text.match(/\d+/g) || []).map((part) => Number(part));
  return { text, prefix, numbers };
}

function compareInvoiceNumbers(left, right) {
  const a = invoiceNumberSortValue(left);
  const b = invoiceNumberSortValue(right);
  const prefixCompare = a.prefix.localeCompare(b.prefix, "pl-PL");
  if (prefixCompare) return prefixCompare;
  const count = Math.max(a.numbers.length, b.numbers.length);
  for (let index = 0; index < count; index += 1) {
    const leftNumber = a.numbers[index] ?? -1;
    const rightNumber = b.numbers[index] ?? -1;
    if (leftNumber !== rightNumber) return leftNumber - rightNumber;
  }
  return normalize(a.text).localeCompare(normalize(b.text), "pl-PL");
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("pl-PL").format(date);
}

function isoDateFromParts(year, month, day) {
  return [
    String(year).padStart(4, "0"),
    String(month).padStart(2, "0"),
    String(day).padStart(2, "0")
  ].join("-");
}

function parseIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ""))) return null;
  const [year, month, day] = String(value).split("-").map(Number);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }
  return date;
}

function displayDateForInput(value) {
  const date = parseIsoDate(value);
  if (!date) return value || "";
  return [
    String(date.getDate()).padStart(2, "0"),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getFullYear()).padStart(4, "0")
  ].join(".");
}

function isoDateForSave(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  if (parseIsoDate(text)) return text;
  const match = text.match(/^(\d{1,2})[.\-/](\d{1,2})[.\-/](\d{4})$/);
  if (!match) return text;
  const [, dayText, monthText, yearText] = match;
  const day = Number(dayText);
  const month = Number(monthText);
  const year = Number(yearText);
  const iso = isoDateFromParts(year, month, day);
  return parseIsoDate(iso) ? iso : text;
}

function dateInputLabel(input) {
  if (input === paymentDateInput) return "Termin płatności";
  if (input === paidDateInput) return "Data płatności";
  if (input === issueDateInput) return "Data wystawienia";
  if (input === saleDateInput) return "Data sprzedaży";
  return "Data";
}

function invoiceBaseDateIso() {
  return isoDateForSave(issueDateInput.value) || isoDateForSave(saleDateInput.value);
}

function paymentDateWarning(input, dateIso) {
  if (input !== paymentDateInput && input !== paidDateInput) return "";
  const baseIso = invoiceBaseDateIso();
  if (!baseIso || !dateIso || dateIso >= baseIso) return "";
  if (input === paymentDateInput) {
    return `Termin płatności nie może być wcześniejszy niż data faktury (${displayDateForInput(baseIso)}).`;
  }
  return `${dateInputLabel(input)} nie może być wcześniejsza niż data faktury (${displayDateForInput(baseIso)}).`;
}

function warnInvalidPaymentDate(input, dateIso) {
  const warning = paymentDateWarning(input, dateIso);
  if (!warning) return false;
  alert(warning);
  return true;
}

function formatMoney(value, currency = "PLN") {
  const number = Number(value);
  if (!Number.isFinite(number)) return "";
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: currency || "PLN"
  }).format(number);
}

function canonicalSupplier(supplier) {
  const value = normalize(supplier).trim();
  if (!value) return "";
  if (value === "mm" || value.includes("wydanie magazynowe")) return "MM";
  if (value === "tti" || value.includes("kasy@tti.pl") || value.includes("tti artur") || value.includes("tti.pl")) return "TTi";
  if (value === "satis" || value.includes("aparaty słuchowe satis") || value.includes("satis pracownia słuchu")) return "SATIS";
  if (value === "wsa" || value.includes("ws audiology") || value.includes("wsa")) return "WSA";
  if (value.includes("sonova") || value.includes("phonak")) return "PHONAK";
  if (value.includes("philips") || value.includes("hearlink") || value.includes("demant")) return "PHILIPS";
  if (value.includes("sonic")) return "Sonic";
  if (value.includes("bernafon") || value.includes("acustica")) return "BERNAFON";
  if (value.includes("oticon")) return "Oticon";
  if (value.includes("starkey")) return "STARKEY";
  if (value.includes("audibel")) return "Audibel";
  if (value.includes("resound")) return "ReSound";
  if (value.includes("interton") || value.includes("beltone")) return "Beltone/Interton";
  if (value.includes("gnp magnusson")) return "GNP";
  if (value.includes("apd-medical") || value.includes("apd medical")) return "APD";
  if (value.includes("123drukuj")) return "123drukuj";
  if (value.includes("info data consulting") || value.includes("idc.pl")) return "IDC";
  if (value.includes("arendo")) return "Arendo";
  if (value.includes("pustelnik") || value.includes("kancelaria podatkowa")) return "Pustelnik";
  if (value.includes("ajc")) return "AJC";
  if (value.includes("diatec")) return "Diatec";
  if (value.includes("audenmed")) return "Audenmed";
  if (value.includes("granmed") || value.includes("gran")) return "Granmed";
  if (value.includes("polkomtel") || value === "plus" || value.includes("plus")) return "Plus";
  if (value.includes("t-mobile") || value.includes("tmobile")) return "T-Mobile";
  if (value.includes("orange")) return "Orange";
  if (value.includes("psps") || value.includes("polskie stowarzyszenie protetyków słuchu") || value.includes("polskie stowarzyszenie protetykow sluchu")) return "PSPS";
  if (value.includes("twoj sluch") || value.includes("twój słuch")) return "Twój Słuch";
  if (value.includes("teb")) return "TEB";
  if (value.includes("aurisom")) return "AuriSom";
  if (value.includes("inpost")) return "InPost";
  if (value.includes("fiserv")) return "Fiserv";
  if (value.includes("cyberfolks") || value.includes("cyber_folks")) return "Cyberfolks";
  if (value.includes("saldeo") || value.includes("brainshare")) return "Saldeo";
  if (value.includes("orlen")) return "ORLEN";
  return String(supplier || "").trim();
}

function statsSupplierLabel(supplier) {
  const label = canonicalSupplier(supplier);
  if (["Oticon", "PHILIPS", "Sonic"].includes(label)) {
    return "Oticon / PHILIPS / Sonic";
  }
  return label;
}

function recordBucket(record) {
  return recordDocumentKind(record) ? "documents" : "invoices";
}

function recordDocumentReferenceDate(record) {
  const directDate = invoiceDate(record);
  if (/^\d{4}-\d{2}-\d{2}$/.test(directDate)) {
    return directDate;
  }
  const imported = String(record?.imported_at || "");
  const importedMatch = imported.match(/^(\d{4}-\d{2}-\d{2})/);
  return importedMatch ? importedMatch[1] : "";
}

function dateDiffFromToday(dateText) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateText)) return 0;
  const today = new Date();
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const [year, month, day] = dateText.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return Math.floor((todayDate.getTime() - date.getTime()) / 86400000);
}

function serviceQuoteAnswered(record) {
  const notes = normalize(record?.parse_notes);
  return [
    "odpowiedziano",
    "odpowiedź wysłana",
    "odpowiedz wyslana",
    "wysłano odpowiedź",
    "wyslano odpowiedz",
    "zaakceptowano",
    "zamknięte",
    "zamkniete"
  ].some((marker) => notes.includes(marker));
}

function staleServiceQuoteDays(record) {
  if (recordDocumentKind(record) !== "service_quote" || serviceQuoteAnswered(record)) {
    return 0;
  }
  const ageDays = dateDiffFromToday(recordDocumentReferenceDate(record));
  return ageDays > 2 ? ageDays : 0;
}

function recordDocumentKind(record) {
  const storedKind = String(record?.document_kind || "").trim();
  if (storedKind) return storedKind;
  const source = [
    record?.attachment_filename,
    record?.invoice_number,
    record?.parse_notes,
    record?.supplier
  ]
    .filter(Boolean)
    .join("\n")
    .toLocaleLowerCase("pl-PL");

  if (source.includes("wycena serwisu") || source.includes("ser000")) {
    return "service_quote";
  }
  if (source.includes("potwierdzenie sald") || source.includes("potwierdzenie salda") || source.includes("zestawienie sald")) {
    return "balance_confirmation";
  }
  if (
    source.includes("oferta") ||
    source.includes("cennik") ||
    source.includes("specyfikacja cenowa") ||
    source.includes("sdemo") ||
    source.includes("promocja")
  ) {
    return "offer";
  }
  if (
    source.includes("regulamin") ||
    source.includes("materiały informacyjne") ||
    source.includes("materiały") ||
    source.includes("informacje") ||
    source.includes("informacyj") ||
    source.includes("specyfikacja") ||
    source.includes("umowa") ||
    source.includes("zamówienie") ||
    source.includes("potwierdzenie zamówienia") ||
    source.includes("zam ")
  ) {
    return "info";
  }
  return "";
}

function isSecondaryAmountFreeDocument(record) {
  if (activeProfile !== "secondary") return false;
  const filename = String(record?.attachment_filename || "").toLocaleLowerCase("pl-PL");
  if (filename.includes("proforma")) return false;
  if (recordDocumentKind(record) === "offer") return true;
  return ["umowa", "specyfikacja", "regulamin", "wzór", "wzor"].some((marker) => filename.includes(marker));
}

function recordsForCurrentView() {
  if (activeMainView === "documents") {
    return records.filter((record) => recordBucket(record) === "documents");
  }
  if (activeMainView === "serials") {
    return records.filter((record) => recordBucket(record) === "invoices");
  }
  if (activeMainView === "stats") {
    return records.filter((record) => recordBucket(record) === "invoices");
  }
  return records.filter((record) => recordBucket(record) === "invoices");
}

function serialTokens(serialNumbers) {
  return [...new Set(
    String(serialNumbers || "")
      .split(/[\s,;|]+/)
      .map((token) => token.trim())
      .filter(Boolean)
  )];
}

function serialSourceRecords() {
  const currentYear = String(new Date().getFullYear());
  return recordsForCurrentView().filter((record) => (
    recordBucket(record) === "invoices" &&
    invoiceYear(record) === currentYear &&
    serialTokens(record.serial_numbers).length > 0
  ));
}

function buildSerialRows(sourceRecords = serialSourceRecords()) {
  const rows = [];
  sourceRecords.forEach((record) => {
    const serialModels = record.serial_models && typeof record.serial_models === "object" ? record.serial_models : {};
    const serialNames = record.serial_names && typeof record.serial_names === "object" ? record.serial_names : {};
    const serialPatients = record.serial_patients && typeof record.serial_patients === "object" ? record.serial_patients : {};
    serialTokens(record.serial_numbers).forEach((serialNumber, index) => {
      rows.push({
        id: `${record.id}:${serialNumber}:${index}`,
        recordId: record.id,
        supplier: record.supplier,
        attachment_filename: record.attachment_filename,
        has_pdf: record.has_pdf,
        invoice_number: record.invoice_number,
        sale_date: invoiceDate(record),
        payment_date: record.payment_date || record.due_date || "",
        paid_date: record.paid_date || "",
        parse_status: effectiveStatus(record),
        product_name: serialNames[serialNumber] || "",
        model_name: serialModels[serialNumber] || "",
        patient_name: serialPatients[serialNumber] || "",
        serial_number: serialNumber,
        sourceRecord: record
      });
    });
  });
  return rows.sort((left, right) => {
    const dateCompare = normalize(right.sale_date).localeCompare(normalize(left.sale_date), "pl");
    if (dateCompare) return dateCompare;
    const supplierCompare = normalize(canonicalSupplier(left.supplier)).localeCompare(normalize(canonicalSupplier(right.supplier)), "pl");
    if (supplierCompare) return supplierCompare;
    const invoiceCompare = compareInvoiceNumbers(right.invoice_number, left.invoice_number);
    if (invoiceCompare) return invoiceCompare;
    return normalize(left.serial_number).localeCompare(normalize(right.serial_number), "pl");
  });
}

function serialDisplayName(row) {
  const supplier = normalize(canonicalSupplier(row?.supplier));
  const patientName = String(row?.patient_name || "").trim();
  let baseName = row?.product_name || "";
  if (supplier === "philips") {
    baseName = cleanPhilipsSerialLabel(row?.model_name || row?.product_name || "");
  } else if (supplier.includes("phonak") || supplier.includes("sonova")) {
    baseName = cleanPhonakSerialLabel(row?.model_name || row?.product_name || "");
  }
  if (patientName) {
    return baseName ? `${baseName} - ${patientName}` : patientName;
  }
  return baseName;
}

function cleanPhilipsSerialLabel(value) {
  let label = String(value || "").trim();
  if (!label) return "";
  label = label
    .replace(/\s+/g, " ")
    .replace(/\s+[A-Z]{2}\/[A-Z]{2,4}$/i, "")
    .replace(/\s+(?:BG|BE|BL|BR|TP|CO|PWR|RIE|BTE|ITE)$/i, "")
    .trim();
  return label;
}

function serialDisplayModel(row) {
  const supplier = normalize(canonicalSupplier(row?.supplier));
  if (supplier === "philips") {
    return cleanPhilipsSerialLabel(row?.model_name || row?.product_name || "");
  }
  if (supplier.includes("phonak") || supplier.includes("sonova")) {
    return cleanPhonakSerialLabel(row?.model_name || row?.product_name || "");
  }
  return row?.model_name || "";
}

function cleanPhonakSerialLabel(value) {
  let label = String(value || "").trim();
  if (!label) return "";
  label = label
    .replace(/\s+/g, " ")
    .replace(/\s*\([^)]*\)\s*$/g, "")
    .trim();
  if (/^PHONAK\b/i.test(label)) {
    label = `Phonak ${label.slice(6).trim()}`;
  } else if (/^ROGER\b/i.test(label)) {
    label = `Roger ${label.slice(5).trim()}`;
  }
  return label;
}

function filteredSerialRows() {
  const query = normalize(searchInput.value).trim();
  const compactQuery = compactNormalize(query);
  const selectedMonth = monthFilter.value;
  const selectedSupplier = supplierFilter.value;
  return buildSerialRows().filter((row) => {
    const searchableValues = [
      serialDisplayName(row),
      serialDisplayModel(row),
      row.product_name,
      row.model_name,
      row.serial_number,
      row.invoice_number,
      row.attachment_filename,
      canonicalSupplier(row.supplier)
    ];
    const matchesQuery =
      !query ||
      generalSearchMatches(searchableValues, query, compactQuery) ||
      normalize(row.serial_number).includes(query) ||
      compactNormalize(row.serial_number).includes(compactQuery);
    const matchesMonth = !selectedMonth || (/^\d{4}-\d{2}-\d{2}$/.test(row.sale_date) && row.sale_date.slice(0, 7) === selectedMonth);
    const matchesSupplier = !selectedSupplier || normalize(canonicalSupplier(row.supplier)) === normalize(selectedSupplier);
    return matchesQuery && matchesMonth && matchesSupplier;
  });
}

function filteredRecords() {
  if (activeMainView === "serials") {
    return recordsForCurrentView();
  }
  const sourceRecords = recordsForCurrentView();
  const isStatsOnlyView = activeProfile === "main" && activeMainView === "stats";
  const query = isStatsOnlyView ? "" : normalize(searchInput.value).trim();
  const selectedYear = yearFilter.value;
  const selectedMonth = monthFilter.value;
  const selectedStatus = statusFilter.value;
  const selectedOverdue = overdueFilter.value;
    const selectedSupplier = supplierFilter.value;
    const selectedDocumentType = documentTypeFilter.value;
  const compactQuery = compactNormalize(query);
  const isDocumentsView = activeMainView === "documents";
  const matchingRecords = sourceRecords.filter((record) => {
    const supplierLabel = canonicalSupplier(record.supplier);
    const invoiceDocumentType = documentTypeLabel(record);
    const documentKind = recordDocumentKind(record);
    const searchableValues = [
      record.invoice_number,
      supplierLabel,
      invoiceDocumentType,
      documentKindLabel(documentKind),
      record.supplier,
      record.attachment_filename,
      record.parse_status,
      record.parse_notes
    ];
    const matchesQuery =
      !query ||
      serialSearchMatches(record.serial_numbers, query, compactQuery) ||
      generalSearchMatches(searchableValues, query, compactQuery);
    const matchesYear = !selectedYear || invoiceYear(record) === selectedYear;
    const matchesMonth = isStatsOnlyView ? true : !selectedMonth || invoiceMonth(record) === selectedMonth;
    const matchesStatus = isDocumentsView || isStatsOnlyView || !selectedStatus || effectiveStatus(record) === selectedStatus;
    const overdueDays = overdueDaysCount(record);
    const dueSoonDays = dueSoonDaysCount(record);
    const hasOverpayment = /\bnadpłat/i.test(String(record.parse_notes || ""));
    const matchesOverdue =
      !selectedOverdue ||
      (isDocumentsView
        ? (
            (selectedOverdue === "serviceQuoteOpen" && documentKind === "service_quote" && !serviceQuoteAnswered(record)) ||
            (selectedOverdue === "serviceQuoteStale" && staleServiceQuoteDays(record) > 0) ||
            (selectedOverdue === "answered" && documentKind === "service_quote" && serviceQuoteAnswered(record))
          )
        : isStatsOnlyView
          ? true
          : (
              (selectedOverdue === "dueSoon" && dueSoonDays >= 0 && dueSoonDays <= 2) ||
              (selectedOverdue === "overdue" && overdueDays > 0) ||
              (selectedOverdue === "over30" && overdueDays > 30) ||
              (selectedOverdue === "overpayment" && hasOverpayment) ||
              (selectedOverdue === "paid" && Boolean(record.paid_date))
            ));
    const matchesSupplier = isStatsOnlyView ? true : !selectedSupplier || normalize(supplierLabel) === normalize(selectedSupplier);
    const matchesDocumentType =
      !selectedDocumentType ||
      (isDocumentsView ? documentKind === selectedDocumentType : isStatsOnlyView ? true : invoiceDocumentType === selectedDocumentType);
    return matchesQuery && matchesYear && matchesMonth && matchesStatus && matchesOverdue && matchesSupplier && matchesDocumentType;
  });

  return [...matchingRecords].sort((left, right) => {
    const a = sortValue(left, sortState.key);
    const b = sortValue(right, sortState.key);
    if (typeof a === "number" || typeof b === "number") {
      return (sortState.direction === "asc" ? 1 : -1) * ((a || 0) - (b || 0));
    }
    return sortState.direction === "asc"
      ? normalize(a).localeCompare(normalize(b))
      : normalize(b).localeCompare(normalize(a));
  });
}

function setSelectOptions(select, options) {
  const currentValue = select.value;
  select.replaceChildren(
    ...options.map(({ value, label }) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      return option;
    })
  );
  if (options.some((option) => option.value === currentValue)) {
    select.value = currentValue;
  } else {
    select.value = options[0]?.value ?? "";
  }
}

function setFilterLabel(wrapper, label) {
  const span = wrapper?.querySelector("span");
  if (span) span.textContent = label;
}

function applyFilterMode() {
  const isInvoicesView = activeMainView === "invoices";
  const isDocumentsView = activeMainView === "documents";
  const isSerialsView = activeMainView === "serials";
  const isMainStats = activeProfile === "main" && activeMainView === "stats";

  if (isMainStats) {
    searchInput.value = "";
    monthFilter.value = "";
    supplierFilter.value = "";
    statusFilter.value = "";
    overdueFilter.value = "";
    documentTypeFilter.value = "";
  }
  searchBox.style.display = isMainStats ? "none" : "";
  yearFilterWrap.hidden = isMainStats || isSerialsView;
  monthFilterWrap.hidden = isMainStats;
  supplierFilterWrap.hidden = isMainStats;

  if (isDocumentsView) {
    statusFilterWrap.hidden = true;
    overdueFilterWrap.hidden = false;
    documentTypeFilterWrap.hidden = false;
    setFilterLabel(overdueFilterWrap, "Reakcja");
    setFilterLabel(documentTypeFilterWrap, "Rodzaj dokumentu");
    setSelectOptions(overdueFilter, [
      { value: "", label: "Wszystkie" },
      { value: "serviceQuoteOpen", label: "Wycena bez odpowiedzi" },
      { value: "serviceQuoteStale", label: "Wycena bez odpowiedzi > 2 dni" },
      { value: "answered", label: "Odpowiedziane" }
    ]);
    setSelectOptions(documentTypeFilter, [
      { value: "", label: "Wszystkie" },
      { value: "service_quote", label: "Wycena serwisu" },
      { value: "balance_confirmation", label: "Potwierdzenie sald" },
      { value: "offer", label: "Oferta / cennik" },
      { value: "info", label: "Materiał info" }
    ]);
    return;
  }

  if (isSerialsView) {
    statusFilterWrap.hidden = true;
    overdueFilterWrap.hidden = true;
    documentTypeFilterWrap.hidden = true;
    setFilterLabel(monthFilterWrap, "Miesiąc");
    setFilterLabel(supplierFilterWrap, "Dostawca");
    return;
  }

  if (isMainStats) {
    statusFilterWrap.hidden = true;
    overdueFilterWrap.hidden = true;
    documentTypeFilterWrap.hidden = true;
    setFilterLabel(yearFilterWrap, "Rok");
    return;
  }

  statusFilterWrap.hidden = false;
  overdueFilterWrap.hidden = false;
  documentTypeFilterWrap.hidden = false;
  setFilterLabel(overdueFilterWrap, "Terminy / reakcje");
  setFilterLabel(documentTypeFilterWrap, "Typ dokumentu");
  setSelectOptions(overdueFilter, [
    { value: "", label: "Wszystkie" },
    { value: "dueSoon", label: "2 dni do płatności" },
    { value: "overdue", label: "Po terminie" },
    { value: "over30", label: "Po terminie > 30 dni" },
    { value: "overpayment", label: "Nadpłata" },
    { value: "paid", label: "Zapłacone" }
  ]);
  setSelectOptions(documentTypeFilter, [
    { value: "", label: "Wszystkie" },
    { value: "invoice", label: "Faktura" },
    { value: "correction", label: "Korekta" },
    { value: "mm", label: "MM" }
  ]);
  if (!isInvoicesView) {
    setFilterLabel(overdueFilterWrap, "Terminy / reakcje");
  }
}

function documentTypeLabel(record) {
  const supplierLabel = canonicalSupplier(record?.supplier);
  const source = [
    record?.invoice_number,
    record?.attachment_filename,
    record?.parse_notes
  ]
    .filter(Boolean)
    .join("\n")
    .toUpperCase();

  if (supplierLabel === "MM" || /^\s*MM\b/.test(source) || source.includes("WYDANIE MAGAZYNOWE")) {
    return "mm";
  }
  if (
    source.includes("KFV/") ||
    source.includes("SCN") ||
    source.includes("KOREKTA") ||
    /^\s*KOR\b/.test(source)
  ) {
    return "correction";
  }
  return "invoice";
}

function invoiceDate(record) {
  return record.sale_date || record.issue_date || "";
}

function invoiceMonth(record) {
  const value = invoiceDate(record);
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value.slice(0, 7) : "";
}

function invoiceYear(record) {
  const value = invoiceDate(record);
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value.slice(0, 4) : "";
}

function updateYearFilterOptions() {
  if (activeMainView === "serials") {
    yearFilter.replaceChildren(...[
      (() => {
        const option = document.createElement("option");
        option.value = String(new Date().getFullYear());
        option.textContent = `Od 1 stycznia ${new Date().getFullYear()}`;
        return option;
      })()
    ]);
    yearFilter.value = String(new Date().getFullYear());
    return;
  }
  const currentValue = yearFilter.value;
  const currentYear = String(new Date().getFullYear());
  const years = [...new Set(recordsForCurrentView().map(invoiceYear).filter(Boolean))]
    .sort((left, right) => right.localeCompare(left));

  yearFilter.replaceChildren(
    ...[
      (() => {
        const option = document.createElement("option");
        option.value = "";
        option.textContent = "Wszystkie";
        return option;
      })(),
      (() => {
        const option = document.createElement("option");
        option.value = currentYear;
        option.textContent = "Bieżący rok";
        return option;
      })(),
      ...years
        .filter((year) => year !== currentYear)
        .map((year) => {
          const option = document.createElement("option");
          option.value = year;
          option.textContent = year;
          return option;
        })
    ]
  );

  if (currentValue && (currentValue === currentYear || years.includes(currentValue))) {
    yearFilter.value = currentValue;
  } else {
    yearFilter.value = "";
  }
}

function formatMonthLabel(value) {
  const match = String(value).match(/^(\d{4})-(\d{2})$/);
  if (!match) return value;
  const [, year, month] = match;
  const date = new Date(`${year}-${month}-01T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  const monthName = new Intl.DateTimeFormat("pl-PL", { month: "long" }).format(date);
  return `${monthName} ${year}`;
}

function updateMonthFilterOptions() {
  const currentValue = monthFilter.value;
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const months = [...new Set((activeMainView === "serials" ? serialSourceRecords() : recordsForCurrentView()).map(invoiceMonth).filter(Boolean))]
    .sort((left, right) => right.localeCompare(left));

  monthFilter.replaceChildren(
    ...[
      (() => {
        const option = document.createElement("option");
        option.value = "";
        option.textContent = "Wszystkie";
        return option;
      })(),
      (() => {
        const option = document.createElement("option");
        option.value = currentMonth;
        option.textContent = "Bieżący miesiąc";
        return option;
      })(),
      ...months.map((month) => {
        if (month === currentMonth) return null;
        const option = document.createElement("option");
        option.value = month;
        option.textContent = formatMonthLabel(month);
        return option;
      }).filter(Boolean)
    ]
  );

  if (currentValue === currentMonth || months.includes(currentValue)) {
    monthFilter.value = currentValue;
  } else {
    monthFilter.value = "";
  }
}

function updateSupplierFilterOptions() {
  const currentValue = supplierFilter.value;
  const sourceRecords = activeMainView === "serials" ? serialSourceRecords() : recordsForCurrentView();
  const suppliers = [...new Set(sourceRecords.map((record) => canonicalSupplier(record.supplier)).filter(Boolean))]
    .sort((left, right) => left.localeCompare(right, "pl"));

  supplierFilter.replaceChildren(
    ...[
      (() => {
        const option = document.createElement("option");
        option.value = "";
        option.textContent = "Wszyscy";
        return option;
      })(),
      ...suppliers.map((supplier) => {
        const option = document.createElement("option");
        option.value = supplier;
        option.textContent = supplier;
        return option;
      })
    ]
  );

  supplierFilter.value = suppliers.includes(currentValue) ? currentValue : "";
}

function sortValue(record, key) {
  if (["net_amount", "vat_amount", "gross_amount"].includes(key)) {
    return Number(record[key] ?? 0);
  }
  return record[key] ?? "";
}

function render() {
  updateYearFilterOptions();
  updateMonthFilterOptions();
  updateSupplierFilterOptions();
  const visibleRecords = filteredRecords();
  const showStats = activeProfile === "main" && activeMainView === "stats";
  const showSerials = activeMainView === "serials";
  tableZone.hidden = showStats || showSerials;
  statsView.hidden = !showStats;
  serialsView.hidden = !showSerials;
  if (showStats) {
    renderStatsView(visibleRecords);
  } else if (showSerials) {
    const visibleSerialRows = filteredSerialRows();
    serialsBody.replaceChildren(...visibleSerialRows.map(createSerialRow));
    serialsEmptyState.hidden = visibleSerialRows.length > 0;
  } else {
    recordsBody.replaceChildren(...visibleRecords.map(createRow));
    emptyState.textContent = activeMainView === "documents" ? "Brak dokumentów w bazie." : "Brak faktur w bazie.";
    emptyState.hidden = visibleRecords.length > 0;
  }
  updateSelectAllRows(visibleRecords);
  updateStats();
  syncPaymentReminders();
}

function renderStatsView(visibleRecords) {
  const statsRecords = visibleRecords.filter((record) => recordBucket(record) === "invoices");
  const count = statsRecords.length;
  const okCount = statsRecords.filter((record) => effectiveStatus(record) === "ok").length;
  const reviewCount = statsRecords.filter((record) => effectiveStatus(record) === "needs_review").length;
  const paidCount = statsRecords.filter((record) => Boolean(record.paid_date)).length;
  const overdueCount = statsRecords.filter((record) => overdueDaysCount(record) > 0).length;
  const netSum = statsRecords.reduce((sum, record) => sum + (Number(record.net_amount) || 0), 0);
  const vatSum = statsRecords.reduce((sum, record) => sum + (Number(record.vat_amount) || 0), 0);
  const grossSum = statsRecords.reduce((sum, record) => sum + (Number(record.gross_amount) || 0), 0);
  statsSummary.replaceChildren(
    ...[
      ["Liczba faktur", String(count)],
      ["Odczytane", String(okCount)],
      ["Do kontroli", String(reviewCount)],
      ["Zapłacone", String(paidCount)],
      ["Po terminie", String(overdueCount)],
      ["Netto razem", formatMoney(netSum, "PLN") || "0,00 zł"],
      ["VAT razem", formatMoney(vatSum, "PLN") || "0,00 zł"],
      ["Brutto razem", formatMoney(grossSum, "PLN") || "0,00 zł"]
    ].map(([label, value]) => statsRow(label, value))
  );

  renderStatsTable(
    statsSuppliers,
    ["Dostawca", "Liczba", "Brutto", "Do zapłaty"],
    aggregateSupplierStats(statsRecords)
      .sort((left, right) => (right.gross - left.gross) || (right.count - left.count))
      .slice(0, 12)
      .map((item) => [
        item.label,
        String(item.count),
        formatMoney(item.gross, "PLN") || "0,00 zł",
        formatMoney(item.toPay, "PLN") || "0,00 zł"
      ]),
    { highlightFirst: true }
  );

  const yearAverages = statsYearAverages(statsRecords);
  renderStatsTable(
    statsMonths,
    ["Miesiąc", "Liczba", "Brutto"],
    aggregateBy(statsRecords, (record) => invoiceMonth(record) || "Bez daty")
      .sort((left, right) => right.label.localeCompare(left.label, "pl"))
      .map((item) => {
        const hasDate = item.label !== "Bez daty";
        const averages = hasDate ? yearAverages.get(item.label.slice(0, 4)) : null;
        return [
          hasDate ? formatMonthLabel(item.label) : item.label,
          String(item.count),
          statsCell(formatMoney(item.gross, "PLN") || "0,00 zł", averages && item.gross > averages.gross ? "stats-above-average" : "")
        ];
      })
  );

  renderStatsTable(
    statsStatuses,
    ["Status", "Liczba", "Brutto"],
    aggregateBy(statsRecords, (record) => statusLabel(effectiveStatus(record)))
      .sort((left, right) => right.count - left.count)
      .map((item) => [item.label, String(item.count), formatMoney(item.gross, "PLN") || "0,00 zł"])
  );
}

function statsRow(label, value) {
  const wrapper = document.createDocumentFragment();
  const term = document.createElement("dt");
  term.textContent = label;
  const description = document.createElement("dd");
  description.textContent = value;
  wrapper.append(term, description);
  return wrapper;
}

function statsCell(value, className = "") {
  return { value, className };
}

function statsYearAverages(sourceRecords) {
  const totals = new Map();
  sourceRecords.forEach((record) => {
    const year = invoiceYear(record);
    const month = invoiceMonth(record);
    if (!year) return;
    const current = totals.get(year) || { gross: 0, months: new Set() };
    current.gross += Number(record.gross_amount) || 0;
    if (month) {
      current.months.add(month);
    }
    totals.set(year, current);
  });
  totals.forEach((total, year) => {
    const monthCount = total.months.size || 12;
    totals.set(year, {
      gross: total.gross / monthCount
    });
  });
  return totals;
}

function aggregateBy(sourceRecords, labelFn) {
  const map = new Map();
  sourceRecords.forEach((record) => {
    const label = labelFn(record);
    const current = map.get(label) || { label, count: 0, gross: 0 };
    current.count += 1;
    current.gross += Number(record.gross_amount) || 0;
    map.set(label, current);
  });
  return [...map.values()];
}

function aggregateSupplierStats(sourceRecords) {
  const map = new Map();
  sourceRecords.forEach((record) => {
    const label = statsSupplierLabel(record.supplier) || "Nieznany";
    const current = map.get(label) || { label, count: 0, gross: 0, toPay: 0 };
    current.count += 1;
    current.gross += Number(record.gross_amount) || 0;
    if (!record.paid_date && effectiveStatus(record) !== "needs_review") {
      current.toPay += Number(record.gross_amount) || 0;
    }
    map.set(label, current);
  });
  return [...map.values()];
}

function renderStatsTable(target, header, rows, options = {}) {
  const table = document.createElement("table");
  table.className = "stats-mini-table";
  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");
  header.forEach((label) => {
    const th = document.createElement("th");
    th.textContent = label;
    headRow.append(th);
  });
  thead.append(headRow);
  const tbody = document.createElement("tbody");
  rows.forEach((row, index) => {
    const tr = document.createElement("tr");
    if (options.highlightFirst && index === 0) {
      tr.classList.add("stats-leader-row");
    }
    row.forEach((cell) => {
      const isCellObject = cell && typeof cell === "object" && !Array.isArray(cell);
      const td = document.createElement("td");
      const value = isCellObject ? cell.value : cell;
      td.textContent = value;
      if (isCellObject && cell.className) {
        td.className = cell.className;
      }
      tr.append(td);
    });
    tbody.append(tr);
  });
  if (!rows.length) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = header.length;
    td.textContent = "Brak danych.";
    tr.append(td);
    tbody.append(tr);
  }
  table.append(thead, tbody);
  target.replaceChildren(table);
}

function createRow(record) {
  const row = document.createElement("tr");
  row.dataset.rowId = String(record.id ?? "");
  const rowId = String(record.id ?? "");
  if (selectedInvoiceIds.has(rowId)) {
    row.classList.add("is-selected");
  }
  if (recentlyImportedIds.has(String(record.id))) {
    row.classList.add("is-new-import");
  }
  if (effectiveStatus(record) === "needs_review") row.classList.add("needs-review");
  if (record.paid_date) row.classList.add("is-paid");
  const documentKind = recordDocumentKind(record);
  if (documentKind) {
    row.classList.add("is-document");
  }
  if (documentKind === "offer") {
    row.classList.add("is-offer");
  }
  if (documentKind === "service_quote") {
    row.classList.add("is-service-quote");
  }
  if (staleServiceQuoteDays(record) > 0) {
    row.classList.add("is-service-quote-stale");
  }
  const hideDocumentAmounts = isSecondaryAmountFreeDocument(record);

  const selectCell = document.createElement("td");
  selectCell.className = "select-cell";
  const selectCheckbox = document.createElement("input");
  selectCheckbox.type = "checkbox";
  selectCheckbox.checked = selectedInvoiceIds.has(rowId);
  selectCheckbox.setAttribute("aria-label", `Zaznacz fakturę ${record.invoice_number || rowId}`);
  selectCheckbox.addEventListener("click", (event) => event.stopPropagation());
  selectCheckbox.addEventListener("change", () => {
    if (selectCheckbox.checked) {
      selectedInvoiceIds.add(rowId);
    } else {
      selectedInvoiceIds.delete(rowId);
    }
    row.classList.toggle("is-selected", selectCheckbox.checked);
    updateSelectAllRows(filteredRecords());
    updateStats();
  });
  selectCell.append(selectCheckbox);
  row.append(selectCell);

  const cells = [
    createSupplierPill(record.supplier),
    createPdfName(record),
    record.invoice_number,
    formatDate(invoiceDate(record)),
    createDueDateCell(record),
    formatDate(record.paid_date),
    hideDocumentAmounts ? "" : formatMoney(record.net_amount, record.currency),
    hideDocumentAmounts ? "" : formatMoney(record.vat_amount, record.currency),
    hideDocumentAmounts ? "" : formatMoney(record.gross_amount, record.currency),
    createStatusPill(effectiveStatus(record)),
    createNotesCell(record.parse_notes, record)
  ];

  cells.forEach((value, index) => {
    const cell = document.createElement("td");
    if (index === 0) {
      cell.classList.add("supplier-cell");
    }
    if (index === 1) {
      cell.classList.add("pdf-cell");
    }
    if (index === 2) {
      cell.classList.add("invoice-number-cell");
      if (String(value || "").length > 18) {
        cell.classList.add("invoice-number-compact");
      }
    }
    if (index >= 3 && index <= 5) {
      cell.classList.add("date-cell");
    }
    if (index >= 6 && index <= 8) {
      cell.classList.add("amount-cell");
      if (index === 6) cell.classList.add("net-cell");
      if (index === 7) cell.classList.add("vat-cell");
      if (index === 8) cell.classList.add("gross-cell");
    }
    if (index === 10) {
      cell.classList.add("notes-cell");
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
  actions.className = "actions-cell";
  const actionsWrap = document.createElement("div");
  actionsWrap.className = "row-actions";

  const previewButton = document.createElement("button");
  previewButton.type = "button";
  previewButton.textContent = "Podgląd";
  previewButton.disabled = !record.has_pdf;
  previewButton.title = record.has_pdf ? "Pokaż PDF" : "Brak zapisanego PDF";
  previewButton.addEventListener("click", () => openPreview(record));

  const editButton = document.createElement("button");
  editButton.type = "button";
  editButton.textContent = "Edytuj";
  editButton.addEventListener("click", () => openDialog(record));
  actionsWrap.append(previewButton, editButton);
  actions.append(actionsWrap);
  row.append(actions);
  return row;
}

function createSerialRow(rowData) {
  const row = document.createElement("tr");
  if (rowData.paid_date) row.classList.add("is-paid");
  if (recentlyImportedIds.has(String(rowData.recordId))) {
    row.classList.add("is-new-import");
  }

  const values = [
    createSupplierPill(rowData.supplier),
    rowData.invoice_number,
    serialDisplayName(rowData),
    serialDisplayModel(rowData),
    rowData.serial_number,
    formatDate(rowData.sale_date)
  ];

  values.forEach((value, index) => {
    const cell = document.createElement("td");
    if (index === 0) cell.classList.add("supplier-cell");
    if (index === 1) cell.classList.add("invoice-number-cell");
    if (index === 2) cell.classList.add("product-name-cell");
    if (index === 3) cell.classList.add("model-name-cell");
    if (index === 4) cell.classList.add("serial-number-cell");
    if (index === 5) cell.classList.add("date-cell");
    if (value instanceof HTMLElement) {
      cell.append(value);
    } else {
      cell.textContent = value || "-";
      if (!value) cell.classList.add("muted-cell");
    }
    row.append(cell);
  });

  const actions = document.createElement("td");
  actions.className = "actions-cell";
  const actionsWrap = document.createElement("div");
  actionsWrap.className = "row-actions";

  const previewButton = document.createElement("button");
  previewButton.type = "button";
  previewButton.textContent = "Podgląd";
  previewButton.disabled = !rowData.sourceRecord?.has_pdf;
  previewButton.title = rowData.sourceRecord?.has_pdf ? "Pokaż PDF" : "Brak zapisanego PDF";
  previewButton.addEventListener("click", () => openPreview(rowData.sourceRecord));

  actionsWrap.append(previewButton);
  actions.append(actionsWrap);
  row.append(actions);
  return row;
}

function updateSelectAllRows(visibleRecords = filteredRecords()) {
  if (!selectAllRows) return;
  if (activeMainView === "serials") {
    selectAllRows.checked = false;
    selectAllRows.indeterminate = false;
    selectAllRows.disabled = true;
    return;
  }
  const visibleIds = visibleRecords.map((record) => String(record.id ?? "")).filter(Boolean);
  const selectedVisibleCount = visibleIds.filter((id) => selectedInvoiceIds.has(id)).length;
  selectAllRows.checked = visibleIds.length > 0 && selectedVisibleCount === visibleIds.length;
  selectAllRows.indeterminate = selectedVisibleCount > 0 && selectedVisibleCount < visibleIds.length;
  selectAllRows.disabled = visibleIds.length === 0 || (activeProfile === "main" && activeMainView === "stats");
}

function setVisibleRowsSelected(selected) {
  filteredRecords()
    .map((record) => String(record.id ?? ""))
    .filter(Boolean)
    .forEach((id) => {
      if (selected) {
        selectedInvoiceIds.add(id);
      } else {
        selectedInvoiceIds.delete(id);
      }
    });
  render();
}

let activeDateInput = null;
let datePickerMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
const datePicker = document.createElement("div");
datePicker.className = "two-month-picker";
datePicker.hidden = true;
document.body.append(datePicker);

function setupDatePickers() {
  document.querySelectorAll("input[data-date-picker]").forEach((input) => {
    input.autocomplete = "off";
    input.addEventListener("focus", () => openDatePicker(input));
    input.addEventListener("click", () => openDatePicker(input));
    input.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeDatePicker();
      }
    });
  });
  document.addEventListener("mousedown", (event) => {
    if (
      activeDateInput &&
      !datePicker.contains(event.target) &&
      event.target !== activeDateInput
    ) {
      closeDatePicker();
    }
  });
  window.addEventListener("resize", positionDatePicker);
  window.addEventListener("scroll", positionDatePicker, true);
}

function openDatePicker(input) {
  activeDateInput = input;
  const pickerLayer = input.closest("dialog") || document.body;
  if (datePicker.parentElement !== pickerLayer) {
    pickerLayer.append(datePicker);
  }
  const selectedDate = parseIsoDate(isoDateForSave(input.value)) || new Date();
  datePickerMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
  renderDatePicker();
  positionDatePicker();
  datePicker.hidden = false;
}

function closeDatePicker() {
  datePicker.hidden = true;
  activeDateInput = null;
}

function positionDatePicker() {
  if (!activeDateInput || datePicker.hidden) return;
  const rect = activeDateInput.getBoundingClientRect();
  const pickerWidth = Math.min(620, window.innerWidth - 16);
  const left = Math.min(Math.max(8, rect.left), window.innerWidth - pickerWidth - 8);
  const top = Math.min(rect.bottom + 6, window.innerHeight - 372);
  datePicker.style.width = `${pickerWidth}px`;
  datePicker.style.left = `${left}px`;
  datePicker.style.top = `${Math.max(8, top)}px`;
}

function renderDatePicker() {
  const selectedValue = isoDateForSave(activeDateInput?.value || "");
  const todayValue = todayIsoDate();
  const previousButton = document.createElement("button");
  previousButton.type = "button";
  previousButton.className = "date-picker-nav";
  previousButton.textContent = "‹";
  previousButton.addEventListener("click", () => {
    datePickerMonth = new Date(datePickerMonth.getFullYear(), datePickerMonth.getMonth() - 1, 1);
    renderDatePicker();
  });

  const nextButton = document.createElement("button");
  nextButton.type = "button";
  nextButton.className = "date-picker-nav";
  nextButton.textContent = "›";
  nextButton.addEventListener("click", () => {
    datePickerMonth = new Date(datePickerMonth.getFullYear(), datePickerMonth.getMonth() + 1, 1);
    renderDatePicker();
  });

  const title = document.createElement("strong");
  title.textContent = "Wybierz datę";

  const clearButton = document.createElement("button");
  clearButton.type = "button";
  clearButton.className = "ghost date-picker-clear";
  clearButton.textContent = "Wyczyść";
  clearButton.addEventListener("click", () => {
    if (!activeDateInput) return;
    activeDateInput.value = "";
    activeDateInput.dispatchEvent(new Event("change", { bubbles: true }));
    closeDatePicker();
  });

  const head = document.createElement("div");
  head.className = "date-picker-head";
  head.append(previousButton, title, clearButton, nextButton);

  const months = document.createElement("div");
  months.className = "date-picker-months";
  months.append(
    createDatePickerMonth(datePickerMonth, selectedValue, todayValue),
    createDatePickerMonth(new Date(datePickerMonth.getFullYear(), datePickerMonth.getMonth() + 1, 1), selectedValue, todayValue)
  );

  datePicker.replaceChildren(head, months);
  positionDatePicker();
}

function createDatePickerMonth(monthDate, selectedValue, todayValue) {
  const wrapper = document.createElement("section");
  wrapper.className = "date-picker-month";

  const monthTitle = document.createElement("h3");
  monthTitle.textContent = new Intl.DateTimeFormat("pl-PL", {
    month: "long",
    year: "numeric"
  }).format(monthDate);
  wrapper.append(monthTitle);

  const grid = document.createElement("div");
  grid.className = "date-picker-grid";
  ["Pn", "Wt", "Śr", "Cz", "Pt", "Sb", "Nd"].forEach((label) => {
    const weekday = document.createElement("span");
    weekday.className = "date-picker-weekday";
    weekday.textContent = label;
    grid.append(weekday);
  });

  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const leadingBlanks = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let index = 0; index < leadingBlanks; index += 1) {
    const blank = document.createElement("span");
    blank.className = "date-picker-empty";
    grid.append(blank);
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    const value = isoDateFromParts(year, month + 1, day);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "date-picker-day";
    button.textContent = String(day);
    button.classList.toggle("selected", value === selectedValue);
    button.classList.toggle("today", value === todayValue);
    button.addEventListener("click", () => {
      if (!activeDateInput) return;
      if (warnInvalidPaymentDate(activeDateInput, value)) return;
      activeDateInput.value = displayDateForInput(value);
      activeDateInput.dispatchEvent(new Event("change", { bubbles: true }));
      closeDatePicker();
    });
    grid.append(button);
  }

  wrapper.append(grid);
  return wrapper;
}

function createPdfName(record) {
  if (!record?.attachment_filename) return "";
  if (!record.has_pdf) {
    const label = document.createElement("span");
    label.className = "pdf-name";
    label.textContent = record.attachment_filename;
    label.title = record.attachment_filename;
    return label;
  }

  const trigger = document.createElement("span");
  trigger.className = "pdf-name";
  trigger.textContent = record.attachment_filename;
  trigger.title = `${record.attachment_filename}\nNajedź, aby podejrzeć PDF`;
  trigger.addEventListener("mouseenter", (event) => scheduleHoverPreview(record, event));
  trigger.addEventListener("mousemove", updateHoverPreviewPosition);
  trigger.addEventListener("mouseleave", hideHoverPreview);
  return trigger;
}

function parseCorrectionLinks(noteText) {
  const text = String(noteText || "");
  const correctedMatch = text.match(/(?:^|\|\s*)Korekta do:\s*([^|]+)/i);
  const correctionListMatch = text.match(/(?:^|\|\s*)Ma korekt(?:ę|y):\s*([^|]+)/i);
  return {
    correctedInvoice: correctedMatch ? correctedMatch[1].trim() : "",
    correctionInvoices: correctionListMatch
      ? correctionListMatch[1].split(/\s*,\s*/).map((value) => value.trim()).filter(Boolean)
      : []
  };
}

function normalizeInvoiceReference(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  let normalized = raw.replace(/\s*\/\s*/g, "/").replace(/\s+/g, " ").trim();
  if (/^PH\/\d{4}\/\d+$/i.test(normalized)) {
    normalized = `FV/${normalized.toUpperCase()}`;
  } else if (/^FV\/PH\/\d{4}\/\d+$/i.test(normalized)) {
    normalized = normalized.toUpperCase();
  }
  return normalized;
}

function invoiceReferenceVariants(value) {
  const normalized = normalizeInvoiceReference(value);
  if (!normalized) return [];
  const variants = [normalized];
  if (/^FV\/PH\/\d{4}\/\d+$/i.test(normalized)) {
    variants.push(normalized.replace(/^FV\//i, ""));
  } else if (/^PH\/\d{4}\/\d+$/i.test(normalized)) {
    variants.push(`FV/${normalized}`);
  }
  return [...new Set(variants)];
}

function findRecordByInvoiceNumber(invoiceNumber) {
  const wantedVariants = invoiceReferenceVariants(invoiceNumber);
  if (!wantedVariants.length) return null;
  return (
    records.find((record) => {
      const recordVariants = invoiceReferenceVariants(record?.invoice_number || "");
      return recordVariants.some((variant) => wantedVariants.includes(variant));
    }) || null
  );
}

function createCorrectionLinkButton(label, invoiceNumber) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "note-link-button";
  button.textContent = label;
  button.title = invoiceNumber;
  button.addEventListener("click", () => {
    const target = findRecordByInvoiceNumber(invoiceNumber);
    if (!target) {
      alert(`Nie znalazłem dokumentu: ${invoiceNumber}`);
      return;
    }
    jumpToRecord(target);
  });
  return button;
}

function jumpToRecord(record) {
  if (!record?.id) return;
  if (activeProfile === "main") {
    const targetView = recordBucket(record);
    if (activeMainView !== targetView) {
      activeMainView = targetView;
      applyProfileHeader();
      render();
    }
  }

  requestAnimationFrame(() => {
    const row = document.querySelector(`tr[data-row-id="${record.id}"]`);
    if (!row) {
      return;
    }
    row.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    row.classList.remove("jump-highlight");
    void row.offsetWidth;
    row.classList.add("jump-highlight");
    window.setTimeout(() => row.classList.remove("jump-highlight"), 2200);
  });
}

function createNotesCell(value, record = null) {
  const text = String(value || "").trim();
  const note = document.createElement("span");
  note.className = "notes-preview";
  const documentKind = activeProfile === "main" ? recordDocumentKind(record) : "";
  const label = documentKind ? documentKindLabel(documentKind) : "";
  note.title = [label, text].filter(Boolean).join(" | ");

  const parts = text.split(/\s*\|\s*/).filter(Boolean);
  if (label) {
    const kindChip = document.createElement("span");
    kindChip.className = `note-chip note-chip-document note-chip-${documentKind}`;
    kindChip.textContent = label;
    note.append(kindChip);
    if (parts.length) {
      const separator = document.createElement("span");
      separator.className = "note-separator";
      separator.textContent = " | ";
      note.append(separator);
    }
  }

  const staleDays = activeProfile === "main" ? staleServiceQuoteDays(record) : 0;
  const correctionLinks = parseCorrectionLinks(text);
  const isCorrectionRecord = Boolean(correctionLinks.correctedInvoice);
  const hasCorrectionRecords = correctionLinks.correctionInvoices.length > 0;

  if (isCorrectionRecord || hasCorrectionRecords) {
    const correctionChip = document.createElement("span");
    correctionChip.className = "note-chip note-chip-correction";
    correctionChip.textContent = isCorrectionRecord ? "KOREKTA" : "MA KOREKTĘ";
    note.append(correctionChip);
    if (text || label || staleDays) {
      const separator = document.createElement("span");
      separator.className = "note-separator";
      separator.textContent = " | ";
      note.append(separator);
    }
  }

  if (staleDays > 0) {
    const urgentChip = document.createElement("span");
    urgentChip.className = "note-chip note-chip-urgent";
    urgentChip.textContent = `BRAK ODPOWIEDZI ${staleDays} DNI`;
    note.append(urgentChip);
    if (text || label) {
      const separator = document.createElement("span");
      separator.className = "note-separator";
      separator.textContent = " | ";
      note.append(separator);
    }
  }

  if (!text && !label && !staleDays) return "";
  if (!parts.length) {
    if (text) {
      const chunk = document.createElement("span");
      chunk.className = "note-chip";
      chunk.textContent = text;
      note.append(chunk);
    }
    return note;
  }

  parts.forEach((part, index) => {
    const trimmed = part.trim();
    const chunk = document.createElement("span");
    chunk.className = "note-chip";
    if (/^rabat:/i.test(trimmed)) {
      chunk.classList.add("note-chip-rebate");
    }
    if (/^nadpłat/i.test(trimmed)) {
      chunk.classList.add("note-chip-overpayment");
    }
    if (/^korekta do:/i.test(trimmed) || /^ma korekt(?:ę|y):/i.test(trimmed)) {
      chunk.classList.add("note-chip-correction");
    }
    chunk.textContent = trimmed;
    note.append(chunk);

    if (/^korekta do:/i.test(trimmed) && correctionLinks.correctedInvoice) {
      note.append(createCorrectionLinkButton("FV", correctionLinks.correctedInvoice));
    }
    if (/^ma korekt(?:ę|y):/i.test(trimmed) && correctionLinks.correctionInvoices.length) {
      correctionLinks.correctionInvoices.forEach((invoiceNumber) => {
        note.append(createCorrectionLinkButton("Korekta", invoiceNumber));
      });
    }

    if (index < parts.length - 1) {
      const separator = document.createElement("span");
      separator.className = "note-separator";
      separator.textContent = " | ";
      note.append(separator);
    }
  });

  return note;
}

function documentKindLabel(kind) {
  if (kind === "service_quote") return "WYCENA SERWISU";
  if (kind === "balance_confirmation") return "POTWIERDZENIE SALD";
  if (kind === "offer") return "OFERTA";
  if (kind === "info") return "MATERIAŁ INFO";
  return "";
}

function createDueDateCell(record) {
  const dueDate = record.payment_date || record.due_date;
  if (!dueDate) return "";

  const wrapper = document.createElement("span");
  wrapper.className = "due-date";
  wrapper.textContent = formatDate(dueDate);

  if (record.paid_date) {
    wrapper.classList.add("paid");
    wrapper.title = `Zapłacone: ${formatDate(record.paid_date)}`;
    return wrapper;
  }

  const dueSoonDays = dueSoonDaysCount(record);
  if (dueSoonDays >= 0 && dueSoonDays <= 2) {
    wrapper.classList.add("due-soon");
    wrapper.title = dueSoonDays === 0 ? "Termin płatności dzisiaj" : `Do terminu płatności: ${dueSoonDays} dni`;
  }

  const overdueDays = overdueDaysCount(record);
  if (overdueDays > 0) {
    wrapper.classList.add("overdue");
    wrapper.title = `Po terminie: ${overdueDays} dni`;
    if (overdueDays > 30) {
      const marks = document.createElement("strong");
      marks.className = "due-date-alert";
      marks.textContent = " !!!";
      wrapper.append(marks);
    }
  }

  return wrapper;
}

function overdueDaysCount(record) {
  const dueDate = record.payment_date || record.due_date;
  if (!dueDate || record.paid_date) return 0;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) return 0;

  const today = new Date();
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const [year, month, day] = dueDate.split("-").map(Number);
  const due = new Date(year, month - 1, day);
  const diffMs = todayDate.getTime() - due.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  return diffDays > 0 ? diffDays : 0;
}

function dueSoonDaysCount(record) {
  const dueDate = record.payment_date || record.due_date;
  if (!dueDate || record.paid_date) return -1;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) return -1;

  const today = new Date();
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const [year, month, day] = dueDate.split("-").map(Number);
  const due = new Date(year, month - 1, day);
  const diffMs = due.getTime() - todayDate.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  return diffDays >= 0 ? diffDays : -1;
}

function isOldPaidInvoice(record) {
  const dateValues = [
    record?.sale_date,
    record?.issue_date,
    record?.payment_date,
    record?.due_date
  ];
  if (dateValues.some((value) => ["2024", "2025"].includes(String(value || "").slice(0, 4)))) {
    return true;
  }
  return /(?:^|[/_. -])(?:2024|2025)(?:$|[/_. -])/.test(String(record?.invoice_number || ""));
}

function paymentReminderRecords() {
  if (!paymentRemindersEnabled()) return [];
  const reminderRecords = records.filter((record) => recordBucket(record) === "invoices");
  return reminderRecords
    .filter((record) => {
      if (effectiveStatus(record) === "needs_review") return false;
      if (record.paid_date || isOldPaidInvoice(record)) return false;
      const overdueDays = overdueDaysCount(record);
      const dueSoonDays = dueSoonDaysCount(record);
      return overdueDays > 0 || (dueSoonDays >= 0 && dueSoonDays <= 2);
    })
    .sort((left, right) => {
      const overdueDiff = overdueDaysCount(right) - overdueDaysCount(left);
      if (overdueDiff !== 0) return overdueDiff;
      return dueSoonDaysCount(left) - dueSoonDaysCount(right);
    });
}

function paymentRemindersEnabled() {
  return activeMainView === "invoices";
}

function reminderPriorityLabel(record) {
  const overdueDays = overdueDaysCount(record);
  if (overdueDays > 0) return `Po terminie: ${overdueDays} dni`;
  const dueSoonDays = dueSoonDaysCount(record);
  if (dueSoonDays === 0) return "Termin dzisiaj";
  if (dueSoonDays === 1) return "Termin jutro";
  if (dueSoonDays === 2) return "Termin za 2 dni";
  return "";
}

function reminderPriorityTone(record) {
  return overdueDaysCount(record) > 0 ? "needs_review" : "to_pay";
}

function reminderSignature(recordsToRemind) {
  return `${activeProfile}:${activeMainView}:` + recordsToRemind
    .map((record) => `${record.id}:${record.payment_date || record.due_date || ""}:${record.paid_date || ""}`)
    .join("|");
}

function renderPaymentReminders(recordsToRemind) {
  const overdueCount = recordsToRemind.filter((record) => overdueDaysCount(record) > 0).length;
  const dueSoonCount = recordsToRemind.length - overdueCount;
  paymentReminderProfileLabel.textContent = activeProfile === "main" ? "SATIS" : "FAKTURY 2026";
  paymentReminderSummary.textContent = `${recordsToRemind.length} faktur do uwagi. Po terminie: ${overdueCount}. Do 2 dni: ${dueSoonCount}.`;
  paymentReminderBody.replaceChildren(
    ...recordsToRemind.map((record) => {
      const row = document.createElement("tr");
      const values = [
        createSupplierPill(record.supplier),
        record.invoice_number || "-",
        createDueDateCell(record),
        formatMoney(record.gross_amount, record.currency) || "-",
        createStatusPill(reminderPriorityTone(record), reminderPriorityLabel(record)),
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
      const actions = document.createElement("td");
      const editButton = document.createElement("button");
      editButton.type = "button";
      editButton.textContent = "Edytuj";
      editButton.addEventListener("click", () => {
        dismissedReminderSignatures.add(currentReminderSignature);
        closePaymentReminderDialog();
        openDialog(record);
      });
      actions.append(editButton);
      row.append(actions);
      return row;
    })
  );
}

function syncPaymentReminders() {
  if (!paymentRemindersEnabled()) {
    closePaymentReminderDialog();
    currentReminderSignature = "";
    return;
  }

  const recordsToRemind = paymentReminderRecords();
  currentReminderSignature = reminderSignature(recordsToRemind);

  if (!recordsToRemind.length) {
    closePaymentReminderDialog();
    return;
  }
  if (dismissedReminderSignatures.has(currentReminderSignature)) {
    return;
  }

  renderPaymentReminders(recordsToRemind);
  if (!paymentReminderDialog.open && !invoiceDialog.open) {
    paymentReminderDialog.showModal();
  }
}

function closePaymentReminderDialog() {
  if (paymentReminderDialog.open) {
    paymentReminderDialog.close();
  }
}

function createStatusPill(status, customLabel = "") {
  const pill = document.createElement("span");
  const normalizedStatus = normalizeStatus(status);
  pill.className = `status-pill ${normalizedStatus}`;
  pill.textContent = customLabel || statusLabel(normalizedStatus);
  return pill;
}

function createSupplierPill(supplier) {
  const pill = document.createElement("span");
  const label = canonicalSupplier(supplier);
  const tone = supplierTone(label);
  pill.className = `supplier-pill ${tone}`;
  if (label === "Beltone/Interton") {
    pill.classList.add("supplier-pill-combined");
  }
  pill.textContent = label || "Nieznany";
  return pill;
}

function supplierTone(supplier) {
  const value = normalize(supplier);
  if (value === "mm") return "mm";
  if (value === "satis") return "default";
  if (value === "tti") return "tti";
  if (value === "123drukuj") return "default";
  if (value === "idc") return "default";
  if (value === "arendo") return "arendo";
  if (value === "apd") return "default";
  if (value === "pustelnik") return "pustelnik";
  if (value === "ajc") return "ajc";
  if (value === "diatec") return "diatec";
  if (value === "audenmed") return "audenmed";
  if (value === "granmed") return "granmed";
  if (value === "plus") return "plus";
  if (value === "t-mobile" || value === "tmobile") return "tmobile";
  if (value === "orange") return "orange";
  if (value === "psps") return "psps";
  if (value === "twój słuch" || value === "twoj sluch") return "twoj-sluch";
  if (value === "teb") return "teb";
  if (value === "aurisom") return "aurisom";
  if (value === "inpost") return "inpost";
  if (value === "fiserv") return "fiserv";
  if (value === "cyberfolks") return "default";
  if (value === "saldeo") return "default";
  if (value === "orlen") return "orlen";
  if (value === "audibel") return "audibel";
  if (value === "beltone/interton") return "interton";
  if (value === "sonic") return "sonic";
  if (value === "philips") return "philips";
  if (value === "bernafon") return "bernafon";
  if (value === "oticon") return "oticon";
  if (value === "resound") return "resound";
  if (value === "wsa") return "ws";
  if (value.includes("sonova") || value.includes("phonak")) return "phonak";
  if (value.includes("ws audiology") || value.includes("wsa")) return "ws";
  if (value.includes("audibel")) return "audibel";
  if (value.includes("resound")) return "resound";
  if (value.includes("starkey")) return "starkey";
  if (value.includes("interton")) return "interton";
  if (value.includes("gnp magnusson")) return "gnp";
  if (value.includes("oticon")) return "oticon";
  if (value.includes("beltone")) return "interton";
  if (value.includes("arendo")) return "arendo";
  if (value.includes("aparaty słuchowe satis") || value.includes("satis pracownia słuchu") || value === "satis") return "default";
  if (value.includes("123drukuj")) return "default";
  if (value.includes("info data consulting") || value.includes("idc.pl")) return "default";
  if (value.includes("apd-medical") || value.includes("apd medical")) return "default";
  if (value.includes("pustelnik") || value.includes("kancelaria podatkowa")) return "pustelnik";
  if (value.includes("ajc")) return "ajc";
  if (value.includes("diatec")) return "diatec";
  if (value.includes("audenmed")) return "audenmed";
  if (value.includes("granmed") || value.includes("gran")) return "granmed";
  if (value.includes("polkomtel") || value.includes("plus")) return "plus";
  if (value.includes("t-mobile") || value.includes("tmobile")) return "tmobile";
  if (value.includes("orange")) return "orange";
  if (value.includes("psps")) return "psps";
  if (value.includes("twój słuch") || value.includes("twoj sluch")) return "twoj-sluch";
  if (value.includes("teb")) return "teb";
  if (value.includes("aurisom")) return "aurisom";
  if (value.includes("inpost")) return "inpost";
  if (value.includes("fiserv")) return "fiserv";
  if (value.includes("cyberfolks") || value.includes("cyber_folks")) return "default";
  if (value.includes("saldeo") || value.includes("brainshare")) return "default";
  if (value.includes("orlen")) return "orlen";
  return "default";
}

function normalizeStatus(status) {
  const value = String(status || "").trim().toLowerCase();
  if (value === "ok") return "ok";
  if (value === "to_pay") return "to_pay";
  if (value === "paid") return "paid";
  return "needs_review";
}

function effectiveStatus(record) {
  if (record?.paid_date) return "paid";
  return normalizeStatus(record?.parse_status);
}

function statusLabel(status) {
  if (status === "ok") return "OK";
  if (status === "to_pay") return "Do zapłaty";
  if (status === "paid") return "Zapłacone";
  return "Do sprawdzenia";
}

function updateStats() {
  if (activeMainView === "serials") {
    const visibleSerialRows = filteredSerialRows();
    document.querySelector("#countAll").textContent = visibleSerialRows.length;
    document.querySelector("#countOk").textContent = [...new Set(visibleSerialRows.map((row) => String(row.recordId)))].length;
    document.querySelector("#countReview").textContent = 0;
    document.querySelector("#sumNet").textContent = "od początku roku";
    document.querySelector("#sumGross").textContent = "numery seryjne";
    return;
  }
  const visibleRecords = filteredRecords();
  const selectedVisibleRecords = visibleRecords.filter((record) => selectedInvoiceIds.has(String(record.id ?? "")));
  const summaryRecords = selectedVisibleRecords.length ? selectedVisibleRecords : visibleRecords;
  document.querySelector("#countAll").textContent = summaryRecords.length;
  document.querySelector("#countOk").textContent = summaryRecords.filter((record) => effectiveStatus(record) === "ok").length;
  document.querySelector("#countReview").textContent = summaryRecords.filter((record) => effectiveStatus(record) === "needs_review").length;
  document.querySelector("#sumNet").textContent = formatMoney(
    summaryRecords.reduce((sum, record) => sum + (Number(record.net_amount) || 0), 0),
    "PLN"
  );
  document.querySelector("#sumGross").textContent = formatMoney(
    summaryRecords.reduce((sum, record) => sum + (Number(record.gross_amount) || 0), 0),
    "PLN"
  );
}

async function loadRecords() {
  try {
    const response = await fetch(queryWithProfile(API_URL), { cache: "no-store" });
    if (!response.ok) throw new Error("Nie udało się pobrać bazy faktur.");
    records = await response.json();
    if (!Array.isArray(records)) records = [];
    selectedInvoiceIds = new Set();
    recentlyImportedIds = new Set();
    clearAppStatus();
    applyProfileHeader();
    render();
  } catch (error) {
    const healthOk = await pingHealth().catch(() => false);
    if (!healthOk) {
      setAppStatus(
        "Serwer SATIS Faktury nie działa.",
        "Kliknij start.command albo włącz install_autostart.command. Po uruchomieniu odśwież widok."
      );
    } else {
      setAppStatus(
        "Nie udało się wczytać danych.",
        "Backend odpowiada, ale odczyt bazy się nie powiódł. Sprawdź data/server.log."
      );
    }
    throw error;
  }
}

async function loadEmailSettings() {
  const response = await fetch(queryWithProfile(EMAIL_SETTINGS_URL), { cache: "no-store" });
  if (!response.ok) throw new Error("Nie udało się pobrać ustawień poczty.");
  const settings = await response.json();
  document.querySelector("#emailHost").value = settings.host || "";
  document.querySelector("#emailPort").value = settings.port || "993";
  document.querySelector("#emailUser").value = settings.user || "";
  document.querySelector("#emailPassword").value = settings.password || "";
  document.querySelector("#emailMailbox").value = settings.mailbox || "INBOX";
  document.querySelector("#emailSearch").value = settings.search || "NEWDB";
  emailSinceDate.value = displayDateForInput(settings.since_date || "");
  document.querySelector("#emailMarkSeen").value = settings.mark_seen || "0";
}

async function importFromEmail(search = "UNSEEN", buttonId = "#importEmailBtn") {
  const button = document.querySelector(buttonId);
  button.disabled = true;
  const originalText = button.textContent;
  button.textContent = "Pobieram...";
  const previousIds = new Set(records.map((record) => String(record.id)));
  try {
    const response = await fetch(IMPORT_EMAIL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile: activeProfile, search })
    });
    const body = await response.text();
    const result = body ? JSON.parse(body) : {};
    if (!response.ok) throw new Error(result.message || "Nie udało się pobrać faktur z e-maila.");
    records = Array.isArray(result.invoices) ? result.invoices : [];
    const currentIds = new Set(records.map((record) => String(record.id ?? "")).filter(Boolean));
    selectedInvoiceIds = new Set([...selectedInvoiceIds].filter((id) => currentIds.has(id)));
    recentlyImportedIds = new Set(
      records
        .map((record) => String(record.id))
        .filter((id) => id && !previousIds.has(id))
    );
    render();
    const errors = result.errors?.length ? `\nBłędy:\n${result.errors.join("\n")}` : "";
    const modeLabel =
      search === "ALL"
        ? "pełne skanowanie"
        : search === "NEWDB"
          ? "nowe w bazie"
          : "nowe wiadomości";
    alert(
      `Tryb: ${modeLabel}\nZaimportowano PDF: ${result.imported}. Nowe wiersze w bazie: ${recentlyImportedIds.size}. Pominięte wiadomości bez PDF: ${result.skippedMessages}.${errors}`
    );
  } catch (error) {
    alert(error.message);
  } finally {
    button.disabled = false;
    button.textContent = originalText;
  }
}

function openDialog(record) {
  invoiceForm.reset();
  dialogOriginalRecord = record ? { ...record } : null;
  const bulkCount = bulkEditTargetIds(record).length;
  const dialogTitle = invoiceDialog.querySelector(".dialog-head h2");
  const dialogEyebrow = invoiceDialog.querySelector(".dialog-head .eyebrow");
  if (dialogTitle) {
    dialogTitle.textContent = bulkCount > 1 ? `Popraw dane (${bulkCount} zaznaczone)` : "Popraw dane";
  }
  if (dialogEyebrow) {
    dialogEyebrow.textContent = bulkCount > 1 ? "Edycja grupowa" : "Faktura";
  }
  document.querySelector("#invoiceId").value = record?.id ?? "";
  document.querySelector("#invoiceNumber").value = record?.invoice_number || "";
  document.querySelector("#issueDate").value = displayDateForInput(record?.issue_date || "");
  document.querySelector("#saleDate").value = displayDateForInput(record?.sale_date || "");
  paymentDateInput.value = displayDateForInput(record?.payment_date || record?.due_date || "");
  paidDateInput.value = displayDateForInput(record?.paid_date || "");
  document.querySelector("#netAmount").value = record?.net_amount ?? "";
  document.querySelector("#vatAmount").value = record?.vat_amount ?? "";
  document.querySelector("#grossAmount").value = record?.gross_amount ?? "";
  document.querySelector("#currency").value = record?.currency || "PLN";
  parseStatusInput.value = effectiveStatus(record || {});
  document.querySelector("#parseNotes").value = record?.parse_notes || "";
  deleteBtn.hidden = bulkCount > 1 || !record?.id;
  invoiceDialog.showModal();
}

function setPaidDate(value) {
  const dateIso = isoDateForSave(value);
  if (warnInvalidPaymentDate(paidDateInput, dateIso)) return;
  paidDateInput.value = displayDateForInput(dateIso);
  if (paidDateInput.value) {
    parseStatusInput.value = "paid";
  }
}

function todayIsoDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function closeDialog() {
  invoiceDialog.close();
  syncPaymentReminders();
}

function openEmailSettings() {
  loadEmailSettings()
    .then(() => emailSettingsDialog.showModal())
    .catch((error) => alert(error.message));
}

function closeEmailSettings() {
  emailSettingsDialog.close();
}

function previewRecords() {
  const visibleRecords = filteredRecords();
  if (selectedInvoiceIds.size) {
    return visibleRecords.filter((record) => record.has_pdf && selectedInvoiceIds.has(String(record.id ?? "")));
  }
  return visibleRecords.filter((record) => record.has_pdf);
}

function showPreviewRecord(record) {
  currentPreviewRecordId = String(record?.id ?? "");
  previewTitle.textContent = record.invoice_number || record.attachment_filename || "Faktura";
  pdfPreview.src = invoiceItemUrl(record.id, "/pdf");
  const availableRecords = previewRecords();
  const currentIndex = availableRecords.findIndex((item) => String(item.id ?? "") === currentPreviewRecordId);
  previewPosition.textContent = currentIndex >= 0 ? `${currentIndex + 1} z ${availableRecords.length}` : "";
  previewPaidDate.textContent = `Data zapłaty: ${formatDate(record.paid_date) || "-"}`;
  previewPaidDate.classList.toggle("is-paid", Boolean(record.paid_date));
  previousPreviewBtn.disabled = currentIndex <= 0;
  nextPreviewBtn.disabled = currentIndex < 0 || currentIndex >= availableRecords.length - 1;
}

function openPreview(record) {
  const recordId = String(record?.id ?? "");
  if (selectedInvoiceIds.size && !selectedInvoiceIds.has(recordId)) {
    selectedInvoiceIds.clear();
    render();
  }
  showPreviewRecord(record);
  if (!previewDialog.open) {
    previewDialog.showModal();
  }
}

function movePreview(direction) {
  const availableRecords = previewRecords();
  const currentIndex = availableRecords.findIndex((record) => String(record.id ?? "") === currentPreviewRecordId);
  const nextIndex = currentIndex + direction;
  if (currentIndex < 0 || nextIndex < 0 || nextIndex >= availableRecords.length) return;
  showPreviewRecord(availableRecords[nextIndex]);
}

function closePreview() {
  previewDialog.close();
  pdfPreview.removeAttribute("src");
  currentPreviewRecordId = "";
}

function scheduleHoverPreview(record, event) {
  clearTimeout(hoverPreviewTimeout);
  hoverPreviewTimeout = window.setTimeout(() => showHoverPreview(record, event), 180);
}

function showHoverPreview(record, event) {
  hoverPreview.hidden = false;
  updateHoverPreviewPosition(event);
  hoverPdfPreview.src = `${invoiceItemUrl(record.id, "/pdf")}#toolbar=0&navpanes=0&scrollbar=0&page=1&view=FitH`;
}

function updateHoverPreviewPosition(event) {
  if (hoverPreview.hidden) return;
  const offset = 18;
  const previewWidth = 420;
  const previewHeight = 560;
  let left = event.clientX + offset;
  let top = event.clientY + offset;

  if (left + previewWidth > window.innerWidth - 12) {
    left = event.clientX - previewWidth - offset;
  }
  if (top + previewHeight > window.innerHeight - 12) {
    top = window.innerHeight - previewHeight - 12;
  }
  if (top < 12) top = 12;
  if (left < 12) left = 12;

  hoverPreview.style.left = `${left}px`;
  hoverPreview.style.top = `${top}px`;
}

function hideHoverPreview() {
  clearTimeout(hoverPreviewTimeout);
  hoverPreview.hidden = true;
  hoverPdfPreview.removeAttribute("src");
}

function editableRecordData(record = {}) {
  const paymentDate = record?.payment_date || record?.due_date || "";
  return {
    invoice_number: record?.invoice_number || "",
    issue_date: record?.issue_date || "",
    sale_date: record?.sale_date || "",
    payment_date: paymentDate,
    due_date: paymentDate,
    paid_date: record?.paid_date || "",
    net_amount: record?.net_amount === "" || record?.net_amount == null ? null : Number(record.net_amount),
    vat_amount: record?.vat_amount === "" || record?.vat_amount == null ? null : Number(record.vat_amount),
    gross_amount: record?.gross_amount === "" || record?.gross_amount == null ? null : Number(record.gross_amount),
    currency: String(record?.currency || "PLN").trim().toUpperCase(),
    parse_status: normalizeStatus(record?.parse_status || effectiveStatus(record)),
    parse_notes: record?.parse_notes || ""
  };
}

function changedFormFields(current, original) {
  const changed = {};
  Object.keys(current).forEach((field) => {
    if (field === "due_date") return;
    if (current[field] !== original[field]) {
      changed[field] = current[field];
      if (field === "payment_date") {
        changed.due_date = current.payment_date;
      }
    }
  });
  return changed;
}

function bulkEditTargetIds(record) {
  const currentId = String(record?.id ?? "");
  if (!currentId || selectedInvoiceIds.size < 2 || !selectedInvoiceIds.has(currentId)) {
    return currentId ? [currentId] : [];
  }
  const currentIds = new Set(records.map((item) => String(item.id ?? "")).filter(Boolean));
  return [...selectedInvoiceIds].filter((id) => currentIds.has(id));
}

function validationMessageForBulkTargets(targetIds, changes) {
  for (const id of targetIds) {
    const record = records.find((item) => String(item.id ?? "") === String(id));
    if (!record) continue;
    const merged = { ...editableRecordData(record), ...changes };
    const message = validateInvoiceDates(merged);
    if (message) {
      return `${record.invoice_number || record.attachment_filename || `ID ${id}`}: ${message}`;
    }
  }
  return "";
}

function formRecord() {
  const data = Object.fromEntries(new FormData(invoiceForm).entries());
  ["issue_date", "sale_date", "payment_date", "paid_date"].forEach((field) => {
    data[field] = isoDateForSave(data[field]);
  });
  ["net_amount", "vat_amount", "gross_amount"].forEach((field) => {
    data[field] = data[field] === "" ? null : Number(data[field]);
  });
  data.due_date = data.payment_date;
  data.currency = String(data.currency || "PLN").trim().toUpperCase();
  data.parse_status = normalizeStatus(data.parse_status);
  return data;
}

function validateInvoiceDates(data) {
  const invoiceDate = data.issue_date || data.sale_date;
  if (!invoiceDate) return "";
  if (data.payment_date && data.payment_date < invoiceDate) {
    return `Termin płatności nie może być wcześniejszy niż data faktury (${displayDateForInput(invoiceDate)}).`;
  }
  if (data.paid_date && data.paid_date < invoiceDate) {
    return `Data płatności nie może być wcześniejsza niż data faktury (${displayDateForInput(invoiceDate)}).`;
  }
  return "";
}

async function saveFormRecord(event) {
  event.preventDefault();
  const id = document.querySelector("#invoiceId").value;
  const payload = formRecord();
  const targetIds = bulkEditTargetIds(dialogOriginalRecord);
  const isBulkEdit = targetIds.length > 1;
  const changes = isBulkEdit ? changedFormFields(payload, editableRecordData(dialogOriginalRecord || {})) : payload;
  const validationMessage = isBulkEdit ? validationMessageForBulkTargets(targetIds, changes) : validateInvoiceDates(payload);
  if (validationMessage) {
    alert(validationMessage);
    return;
  }
  if (isBulkEdit && !Object.keys(changes).length) {
    alert("Nie zmieniono żadnego pola.");
    return;
  }
  const response = await fetch(isBulkEdit ? bulkInvoiceUrl() : invoiceItemUrl(id), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(isBulkEdit ? { ids: targetIds, changes } : payload)
  });
  const result = await response.json();
  if (!response.ok) {
    alert(result.message || (isBulkEdit ? "Nie udało się zapisać zaznaczonych faktur." : "Nie udało się zapisać faktury."));
    return;
  }
  records = result.invoices;
  const currentIds = new Set(records.map((record) => String(record.id ?? "")).filter(Boolean));
  selectedInvoiceIds = new Set([...selectedInvoiceIds].filter((selectedId) => currentIds.has(selectedId)));
  render();
  closeDialog();
}

async function saveEmailSettings(event) {
  event.preventDefault();
  const payload = { profile: activeProfile, ...Object.fromEntries(new FormData(emailSettingsForm).entries()) };
  payload.since_date = isoDateForSave(payload.since_date);
  const response = await fetch(EMAIL_SETTINGS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const result = await response.json();
  if (!response.ok) {
    alert(result.message || "Nie udało się zapisać ustawień poczty.");
    return;
  }
  closeEmailSettings();
  alert("Ustawienia poczty zapisane.");
}

async function deleteCurrentRecord() {
  const id = document.querySelector("#invoiceId").value;
  if (!id) return;

  const record = records.find((item) => String(item.id) === String(id));
  const label = record?.invoice_number || record?.attachment_filename || `fakturę #${id}`;
  if (!confirm(`Usunąć ${label}?`)) return;

  const response = await fetch(invoiceItemUrl(id), { method: "DELETE" });
  const result = await response.json();
  if (!response.ok) {
    alert(result.message || "Nie udało się usunąć faktury.");
    return;
  }
  records = result.invoices;
  render();
  closeDialog();
}

async function copyInvoiceNumbers() {
  if (!selectedInvoiceIds.size) {
    alert("Zaznacz faktury, które chcesz skopiować.");
    return;
  }
  const selectedRecords = records.filter((record) => selectedInvoiceIds.has(String(record.id ?? "")));
  const values = selectedRecords
    .map((record) => String(record.invoice_number || "").trim())
    .filter(Boolean)
    .sort(compareInvoiceNumbers);
  if (!values.length) {
    alert("Brak numerów faktur do skopiowania.");
    return;
  }
  try {
    await navigator.clipboard.writeText(values.join("\n"));
    alert(`Skopiowano ${values.length} numerów faktur.`);
  } catch {
    alert("Nie udało się skopiować do schowka.");
  }
}

function exportCsv() {
  const header = [
    "Nr faktury",
    "Data sprzedaży",
    "Termin płatności",
    "Data płatności",
    "Netto",
    "VAT",
    "Brutto",
    "Dostawca",
    "PDF",
    "Status",
    "Uwagi"
  ];
  const rows = selectedRowsOrFilteredRows().map((record) => [
    record.invoice_number ?? "",
    invoiceDate(record),
    record.payment_date || record.due_date || "",
    record.paid_date || "",
    record.net_amount ?? "",
    record.vat_amount ?? "",
    record.gross_amount ?? "",
    record.supplier ?? "",
    record.attachment_filename ?? "",
    record.parse_status ?? "",
    record.parse_notes ?? ""
  ]);
  downloadCsv([header, ...rows], `baza-faktur-${activeProfile}-${new Date().toISOString().slice(0, 10)}.csv`);
}

function selectedRowsOrFilteredRows() {
  if (!selectedInvoiceIds.size) return filteredRecords();
  return records.filter((record) => selectedInvoiceIds.has(String(record.id ?? "")));
}

function downloadCsv(rows, filename) {
  const csv = `\ufeff${rows.map((row) => row.map(csvCell).join(";")).join("\n")}`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function csvCell(value) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

async function switchProfile(profile) {
  if (!PROFILES[profile] || profile === activeProfile) return;
  activeProfile = profile;
  applyProfileHeader();
  await loadRecords();
}

function switchMainView(view) {
  if (!["invoices", "documents", "serials", "stats"].includes(view)) return;
  if (view === "stats" && activeProfile !== "main") return;
  activeMainView = view;
  applyProfileHeader();
  render();
}

document.querySelector("#importEmailBtn").addEventListener("click", () => importFromEmail("NEWDB", "#importEmailBtn"));
document.querySelector("#rescanEmailBtn").addEventListener("click", () => importFromEmail("ALL", "#rescanEmailBtn"));
document.querySelector("#emailSettingsBtn").addEventListener("click", openEmailSettings);
document.querySelector("#copyInvoiceNumbersBtn").addEventListener("click", () => {
  copyInvoiceNumbers().catch(() => alert("Nie udało się skopiować do schowka."));
});
document.querySelector("#exportCsvBtn").addEventListener("click", exportCsv);
document.querySelector("#refreshBtn").addEventListener("click", loadRecords);
document.querySelector("#closeDialogBtn").addEventListener("click", closeDialog);
document.querySelector("#cancelBtn").addEventListener("click", closeDialog);
document.querySelector("#closeEmailSettingsBtn").addEventListener("click", closeEmailSettings);
document.querySelector("#cancelEmailSettingsBtn").addEventListener("click", closeEmailSettings);
document.querySelector("#closePreviewBtn").addEventListener("click", closePreview);
previousPreviewBtn.addEventListener("click", () => movePreview(-1));
nextPreviewBtn.addEventListener("click", () => movePreview(1));
document.querySelector("#closePaymentReminderBtn").addEventListener("click", () => {
  if (currentReminderSignature) {
    dismissedReminderSignatures.add(currentReminderSignature);
  }
  closePaymentReminderDialog();
});
document.querySelector("#paidDateTodayBtn").addEventListener("click", () => setPaidDate(todayIsoDate()));
document.querySelector("#paidDateDueBtn").addEventListener("click", () => setPaidDate(paymentDateInput.value || ""));
document.querySelector("#paidDateClearBtn").addEventListener("click", () => {
  paidDateInput.value = "";
});
paidDateInput.addEventListener("change", () => {
  if (paidDateInput.value) {
    parseStatusInput.value = "paid";
  }
});
deleteBtn.addEventListener("click", deleteCurrentRecord);
invoiceForm.addEventListener("submit", saveFormRecord);
emailSettingsForm.addEventListener("submit", saveEmailSettings);
searchInput.addEventListener("input", render);
selectAllRows?.addEventListener("change", () => setVisibleRowsSelected(selectAllRows.checked));
yearFilter.addEventListener("change", render);
monthFilter.addEventListener("change", render);
statusFilter.addEventListener("change", render);
overdueFilter.addEventListener("change", render);
supplierFilter.addEventListener("change", render);
documentTypeFilter.addEventListener("change", render);
window.addEventListener("scroll", hideHoverPreview, { passive: true });
window.addEventListener("blur", hideHoverPreview);
document.addEventListener("keydown", (event) => {
  if (!previewDialog.open || event.altKey || event.ctrlKey || event.metaKey) return;
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    movePreview(-1);
  }
  if (event.key === "ArrowRight") {
    event.preventDefault();
    movePreview(1);
  }
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

profileTabs.forEach((button) => {
  button.addEventListener("click", () => {
    switchProfile(button.dataset.profile).catch((error) => alert(error.message));
  });
});

mainViewTabs.forEach((button) => {
  button.addEventListener("click", () => switchMainView(button.dataset.view));
});

setupDatePickers();
applyProfileHeader();
loadRecords().catch((error) => alert(error.message));
