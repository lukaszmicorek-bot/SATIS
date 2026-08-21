const STORAGE_KEY = "baza-aparatow-records-2026-clean";
const REPAIR_STORAGE_KEY = "zeszyt-napraw-wkladek-records-2026-clean";
const DEMO_STORAGE_KEY = "zeszyt-aparatow-demo-records";
const STOCK_AUDIT_STORAGE_KEY = "zeszyt-aparatow-remanent";
const PRICING_STORAGE_KEY = "cennik-records-2026-04-v2";
const PRICING_META_STORAGE_KEY = "cennik-meta-v1";
const PRICING_LEGACY_STORAGE_KEYS = ["cennik-records-2026-04"];
const PRIVATE_PAYMENTS_STORAGE_KEY = "zeszyt-aparatow-private-payments-v1";
const AUDIT_LOG_STORAGE_KEY = "zeszyt-aparatow-audit-log-v1";
const WORKSTATION_STORAGE_KEY = "zeszyt-aparatow-workstation-name-v1";
const API_URL = "/api/records";
const REPAIR_API_URL = "/api/repair-records";
const DEMO_API_URL = "/api/demo-records";
const SERVER_REFRESH_MS = 10000;
const SUPABASE_PAGE_SIZE = 1000;
const SUPABASE_DELETE_BATCH_SIZE = 200;
const SUPABASE_WRITE_RETRY_DELAYS = [600, 1600];
const SUPABASE_DEVICE_TABLE = "device_records";
const SUPABASE_REPAIR_TABLE = "repair_records";
const SUPABASE_PRICING_TABLE = "pricing_records";
const SUPABASE_PRIVATE_PAYMENTS_TABLE = "device_private_payments";
const SUPABASE_AUDIT_TABLE = "record_audit_logs";
const SUPABASE_LOAN_CONTRACT_TABLE = "loan_contracts";
const SUPABASE_OFFER_HISTORY_TABLE = "pricing_offer_history";
const SUPABASE_ORDER_HISTORY_TABLE = "pricing_order_history";
const SUPABASE_COMPLAINT_HISTORY_TABLE = "pricing_complaint_history";
const SUPABASE_PCPR_LIST_TABLE = "pcpr_list";
const PRIVATE_PAYMENT_EMAIL = "satis@pracowniasluchu.pl";
const DEMO_ID_PREFIX = "demo-";
const DEMO_SEED_MARKER_ID = "demo-seed-marker-v1";
const SEARCH_DEBOUNCE_MS = 120;
const TABLE_RENDER_BATCH_SIZE = 500;
const MAX_DEVICE_NAME_SUGGESTIONS = 300;
const MAX_MODEL_NAME_SUGGESTIONS = 120;
const MAX_QUALITY_HINT_CANDIDATES = 320;
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
const PRICING_UPDATED_MONTH = 4;
const PRICING_UPDATED_YEAR = 2026;
const DEFAULT_PRICING_NFZ_CODE = "P.01.01.00";
const PRICING_META_ROW_ID = "__pricing_meta__";
const PRICING_OFFER_NFZ_PER_DEVICE = 1050;
const PRICING_OFFER_NFZ_BY_CODE = {
  "P.01.01.01": 3000,
  "P.02.01.00": 2100,
  "P.02.01.01": 3000,
  "P.04.01": 5500
};
const PRICING_OFFER_VALID_DAYS = 30;
const PRICING_LOAN_DAYS = 14;
const PRICING_LOAN_HISTORY_STORAGE_KEY = "zeszyt-aparatow-loan-contract-history-v1";
const PRICING_OFFER_HISTORY_STORAGE_KEY = "zeszyt-aparatow-offer-history-v1";
const PRICING_ORDER_HISTORY_STORAGE_KEY = "zeszyt-aparatow-order-history-v1";
const PRICING_COMPLAINT_HISTORY_STORAGE_KEY = "zeszyt-aparatow-complaint-history-v1";
const PRICING_PCPR_LIST_STORAGE_KEY = "zeszyt-aparatow-pcpr-list-v1";
const DOCUMENT_LOCATION_USAGE_STORAGE_KEY = "zeszyt-aparatow-document-location-usage-v1";
const MAX_PRICING_LOAN_HISTORY = 300;
const MAX_PRICING_OFFER_HISTORY = 300;
const MAX_PRICING_ORDER_HISTORY = 300;
const MAX_PRICING_COMPLAINT_HISTORY = 300;
const MAX_PRICING_PCPR_LIST = 1000;
const DOCUMENT_LOCATIONS = [
  { key: "T12", value: "Bielsko-Biała, ul. Traugutta 12" },
  { key: "P63", value: "Bielsko-Biała, ul. Partyzantów 63" },
  { key: "P50", value: "Żywiec, al. Piłsudskiego 50" }
];
const PCPR_POSTAL_CODE_CITY_MAP = {
  "43-300": "Bielsko-Biała",
  "34-300": "Żywiec"
};
const PCPR_OFFICES = [
  {
    name: "MOPS Bielsko-Biała",
    tone: "mops-bielsko-biala",
    place: "T12",
    postalCode: "43-300",
    city: "Bielsko-Biała",
    street: "ul. Karola Miarki 11",
    phone: "33 499 56 00"
  },
  {
    name: "PCPR Bielsko-Biała",
    tone: "pcpr-bielsko-biala",
    place: "P63",
    postalCode: "43-300",
    city: "Bielsko-Biała",
    street: "ul. Piastowska 40",
    phone: "33 813 69 30"
  },
  {
    name: "PCPR Cieszyn",
    tone: "pcpr-cieszyn",
    place: "T12",
    postalCode: "43-400",
    city: "Cieszyn",
    street: "ul. Bobrecka 29",
    phone: "33 477 71 17"
  },
  {
    name: "PCPR Żywiec",
    tone: "pcpr-zywiec",
    place: "P50",
    postalCode: "34-300",
    city: "Żywiec",
    street: "ul. Ks. Prał. St. Słonki 24",
    phone: "33 861 94 19"
  }
];
const DEFAULT_DOCUMENT_LOCATION = DOCUMENT_LOCATIONS[0].value;
const DEFAULT_LOAN_CITY = DEFAULT_DOCUMENT_LOCATION;
const PRICING_ORDER_TYPES = ["APARAT SŁUCHOWY", "WKŁADKA USZNA", "WKŁADKA PRZECIWWODNA"];
const PRICING_COMPLAINT_PRODUCT_TYPES = ["APARAT SŁUCHOWY", "WKŁADKA USZNA", "WKŁADKA PRZECIWWODNA", "INNE"];
const PRICING_COMPLAINT_REQUESTS = ["NAPRAWA GWARANCYJNA", "NAPRAWA POGWARANCYJNA"];
const PRICING_EMBEDDED_RECORDS = [{"idProduct":"10553415","nfzCode":"P.01.01.00","tradeName":"Achieve 9 IMP976-DWC","model":"IMP976-DWC","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":6700,"swdCode":""},{"idProduct":"10553414","nfzCode":"P.01.01.00","tradeName":"Achieve 9 IMP986-DWC","model":"IMP986-DWC","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":6700,"swdCode":""},{"idProduct":"10553423","nfzCode":"P.01.01.00","tradeName":"Achieve 9 IMP9CIC-HP","model":"IMP9CIC-HP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":6500,"swdCode":""},{"idProduct":"10553425","nfzCode":"P.01.01.00","tradeName":"Achieve 9 IMP9CIC-LP","model":"IMP9CIC-LP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":6500,"swdCode":""},{"idProduct":"10553424","nfzCode":"P.01.01.00","tradeName":"Achieve 9 IMP9CIC-MP","model":"IMP9CIC-MP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":6500,"swdCode":""},{"idProduct":"10553421","nfzCode":"P.01.01.00","tradeName":"Achieve 9 IMP9ITE-DWC-HP","model":"IMP9ITE-DWC-HP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":6500,"swdCode":""},{"idProduct":"10553422","nfzCode":"P.01.01.00","tradeName":"Achieve 9 IMP9ITE-DWC-MP","model":"IMP9ITE-DWC-MP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":6500,"swdCode":""},{"idProduct":"10553420","nfzCode":"P.01.01.00","tradeName":"Achieve 9 IMP9ITE-DWC-UP","model":"IMP9ITE-DWC-UP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":6500,"swdCode":""},{"idProduct":"12910274","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy wewnątrzuszny Audio Service CIC 8.12","model":"CIC 8.12","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":5800,"swdCode":""},{"idProduct":"12910273","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy wewnątrzuszny Audio Service CIC 8.16","model":"CIC 8.16","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":6700,"swdCode":""},{"idProduct":"12910277","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy wewnątrzuszny Audio Service CIC 8.4","model":"CIC 8.4","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":2900,"swdCode":""},{"idProduct":"12910276","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy wewnątrzuszny Audio Service CIC 8.6","model":"CIC 8.6","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":3000,"swdCode":""},{"idProduct":"12910275","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy wewnątrzuszny Audio Service CIC 8.8","model":"CIC 8.8","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":4300,"swdCode":""},{"idProduct":"12910279","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy wewnątrzuszny Audio Service DIC 8.12","model":"DIC 8.12","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":5800,"swdCode":""},{"idProduct":"12910278","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy wewnątrzuszny Audio Service DIC 8.16","model":"DIC 8.16","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":6700,"swdCode":""},{"idProduct":"12910282","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy wewnątrzuszny Audio Service DIC 8.4","model":"DIC 8.4","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":2900,"swdCode":""},{"idProduct":"12910281","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy wewnątrzuszny Audio Service DIC 8.6","model":"DIC 8.6","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":3000,"swdCode":""},{"idProduct":"12910280","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy wewnątrzuszny Audio Service DIC 8.8","model":"DIC 8.8","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":4300,"swdCode":""},{"idProduct":"11653696","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy wewnątrzuszny Audio Service Ilea 3 G4","model":"Ilea 3 G4","manufacturer":"AS Audio-Service GmbH","orderIndex":"N","grossPrice":2700,"swdCode":""},{"idProduct":"12909866","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy wewnątrzuszny Signia Insio 1IX ITC","model":"Insio 1IX ITC","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":3200,"swdCode":""},{"idProduct":"12909871","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy wewnątrzuszny Signia Insio 1IX ITE","model":"Insio 1IX ITE","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":3200,"swdCode":""},{"idProduct":"12909865","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy wewnątrzuszny Signia Insio 2IX ITC","model":"Insio 2IX ITC","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":3500,"swdCode":""},{"idProduct":"12909870","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy wewnątrzuszny Signia Insio 2IX ITE","model":"Insio 2IX ITE","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":3500,"swdCode":""},{"idProduct":"12909864","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy wewnątrzuszny Signia Insio 3IX ITC","model":"Insio 3IX ITC","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":4700,"swdCode":""},{"idProduct":"12909869","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy wewnątrzuszny Signia Insio 3IX ITE","model":"Insio 3IX ITE","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":4700,"swdCode":""},{"idProduct":"12909863","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy wewnątrzuszny Signia Insio 5IX ITC","model":"Insio 5IX ITC","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":7300,"swdCode":""},{"idProduct":"12909868","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy wewnątrzuszny Signia Insio 5IX ITE","model":"Insio 5IX ITE","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":7300,"swdCode":""},{"idProduct":"12909862","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy wewnątrzuszny Signia Insio 7IX ITC","model":"Insio 7IX ITC","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":8800,"swdCode":""},{"idProduct":"12909867","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy wewnątrzuszny Signia Insio 7IX ITE","model":"Insio 7IX ITE","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":8800,"swdCode":""},{"idProduct":"11652499","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy wewnątrzuszny Signia Silk 1X","model":"Silk 1X","manufacturer":"Signia GmbH","orderIndex":"N","grossPrice":3200,"swdCode":""},{"idProduct":"11652498","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy wewnątrzuszny Signia Silk 2X","model":"Silk 2X","manufacturer":"Signia GmbH","orderIndex":"N","grossPrice":3500,"swdCode":""},{"idProduct":"11652497","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy wewnątrzuszny Signia Silk 3X","model":"Silk 3X","manufacturer":"Signia GmbH","orderIndex":"N","grossPrice":4700,"swdCode":""},{"idProduct":"11652496","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy wewnątrzuszny Signia Silk 5X","model":"Silk 5X","manufacturer":"Signia GmbH","orderIndex":"N","grossPrice":7300,"swdCode":""},{"idProduct":"11652495","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy wewnątrzuszny Signia Silk 7X","model":"Silk 7X","manufacturer":"Signia GmbH","orderIndex":"N","grossPrice":8800,"swdCode":""},{"idProduct":"11652494","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy wewnątrzuszny Signia Silk C&G 1IX","model":"Silk C&G 1IX","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":3400,"swdCode":""},{"idProduct":"11652493","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy wewnątrzuszny Signia Silk C&G 2IX","model":"Silk C&G 2IX","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":3800,"swdCode":""},{"idProduct":"11652492","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy wewnątrzuszny Signia Silk C&G 3IX","model":"Silk C&G 3IX","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":4900,"swdCode":""},{"idProduct":"11652491","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy wewnątrzuszny Signia Silk C&G 5IX","model":"Silk C&G 5IX","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":7500,"swdCode":""},{"idProduct":"11652490","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy wewnątrzuszny Signia Silk C&G 7IX","model":"Silk C&G 7IX","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":9000,"swdCode":""},{"idProduct":"11653712","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy zauszny Audio Service B M 7.3","model":"B M 7.3","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":2900,"swdCode":""},{"idProduct":"11653711","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy zauszny Audio Service B M 7.4","model":"B M 7.4","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":3000,"swdCode":""},{"idProduct":"11653710","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy zauszny Audio Service B M 7.6","model":"B M 7.6","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":3600,"swdCode":""},{"idProduct":"12910262","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy zauszny Audio Service B P 7.12","model":"B P 7.12","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":6800,"swdCode":""},{"idProduct":"12910261","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy zauszny Audio Service B P 7.16","model":"B P 7.16","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":8300,"swdCode":""},{"idProduct":"12910263","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy zauszny Audio Service B P 7.8","model":"B P 7.8","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":5900,"swdCode":""},{"idProduct":"12910256","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy zauszny Audio Service B P Li 4.2","model":"B SP Li 4.2","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":2700,"swdCode":""},{"idProduct":"12910255","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy zauszny Audio Service B P Li 4.3","model":"B SP Li 4.3","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":2900,"swdCode":""},{"idProduct":"12910254","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy zauszny Audio Service B P Li T 4.4","model":"B SP Li T 4.4","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":3600,"swdCode":""},{"idProduct":"12910253","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy zauszny Audio Service B P Li T 4.6","model":"B SP Li T 4.6","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":3900,"swdCode":""},{"idProduct":"12910265","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy zauszny Audio Service B SP 7.12","model":"B SP 7.12","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":6800,"swdCode":""},{"idProduct":"12910264","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy zauszny Audio Service B SP 7.16","model":"B SP 7.16","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":8300,"swdCode":""},{"idProduct":"12910266","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy zauszny Audio Service B SP 7.8","model":"B SP 7.8","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":5900,"swdCode":""},{"idProduct":"12910252","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy zauszny Audio Service B SP Li 4.2","model":"B SP Li 4.2","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":2700,"swdCode":""},{"idProduct":"12910251","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy zauszny Audio Service B SP Li 4.3","model":"B SP Li 4.3","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":2900,"swdCode":""},{"idProduct":"12910250","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy zauszny Audio Service B SP Li T 4.4","model":"B SP Li T 4.4","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":3600,"swdCode":""},{"idProduct":"12910249","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy zauszny Audio Service B SP Li T 4.6","model":"B SP Li T 4.6","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":3900,"swdCode":""},{"idProduct":"12910272","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy zauszny Audio Service Mood Li-Ion 4 G6","model":"Mood Li-Ion 4 G6","manufacturer":"AS Audio Service GmbH","orderIndex":"N","grossPrice":3800,"swdCode":""},{"idProduct":"12910260","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy zauszny Audio Service R Li 4.2","model":"R Li 4.2","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":2700,"swdCode":""},{"idProduct":"12910259","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy zauszny Audio Service R Li 4.3","model":"R Li 4.3","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":2900,"swdCode":""},{"idProduct":"12910258","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy zauszny Audio Service R Li 4.4","model":"R Li 4.4","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":3500,"swdCode":""},{"idProduct":"12910257","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy zauszny Audio Service R Li 4.6","model":"R Li 4.6","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":3800,"swdCode":""},{"idProduct":"12910268","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy zauszny Audio Service R Li 8.12","model":"R Li 8.12","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":6900,"swdCode":""},{"idProduct":"12910267","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy zauszny Audio Service R Li 8.16","model":"R Li 8.16","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":8500,"swdCode":""},{"idProduct":"12910271","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy zauszny Audio Service R Li 8.4","model":"R Li 8.4","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":4900,"swdCode":""},{"idProduct":"12910270","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy zauszny Audio Service R Li 8.6","model":"R Li 8.6","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":5100,"swdCode":""},{"idProduct":"12910269","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy zauszny Audio Service R Li 8.8","model":"R Li 8.8","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":5950,"swdCode":""},{"idProduct":"10586821","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy zauszny Audio Service Volta P B","model":"Volta P B","manufacturer":"AS Audio-Service GmbH","orderIndex":"N","grossPrice":1500,"swdCode":""},{"idProduct":"11652435","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy zauszny Signia Intuis M 4.0","model":"Intuis M 4.0","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":2800,"swdCode":""},{"idProduct":"11652434","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy zauszny Signia Intuis M 4.1","model":"Intuis M 4.1","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":3400,"swdCode":""},{"idProduct":"11652433","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy zauszny Signia Intuis M 4.2","model":"Intuis M 4.2","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":3800,"swdCode":""},{"idProduct":"11652432","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy zauszny Signia Intuis M 4.3","model":"Intuis M 4.3","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":4900,"swdCode":""},{"idProduct":"11652431","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy zauszny Signia Intuis M 4.5","model":"Intuis M 4.5","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":7500,"swdCode":""},{"idProduct":"11652430","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy zauszny Signia Intuis M 4.7","model":"Intuis M 4.7","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":9000,"swdCode":""},{"idProduct":"11652438","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy zauszny Signia Intuis P 4.0","model":"Intuis P 4.0","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":2800,"swdCode":""},{"idProduct":"11652437","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy zauszny Signia Intuis P 4.1","model":"Intuis P 4.1","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":3400,"swdCode":""},{"idProduct":"11652436","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy zauszny Signia Intuis P 4.2","model":"Intuis P 4.2","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":3800,"swdCode":""},{"idProduct":"11652429","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy zauszny Signia Intuis P 4.3","model":"Intuis P 4.3","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":4900,"swdCode":""},{"idProduct":"11652428","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy zauszny Signia Intuis P 4.5","model":"Intuis P 4.5","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":7500,"swdCode":""},{"idProduct":"11652427","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy zauszny Signia Intuis P 4.7","model":"Intuis P 4.7","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":9000,"swdCode":""},{"idProduct":"11652440","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy zauszny Signia Intuis SP 4.1","model":"Intuis SP 4.1","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":3400,"swdCode":""},{"idProduct":"11652439","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy zauszny Signia Intuis SP 4.2","model":"Intuis SP 4.2","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":3800,"swdCode":""},{"idProduct":"11652426","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy zauszny Signia Intuis SP 4.3","model":"Intuis SP 4.3","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":4900,"swdCode":""},{"idProduct":"11652425","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy zauszny Signia Intuis SP 4.5","model":"Intuis SP 4.5","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":7500,"swdCode":""},{"idProduct":"11652424","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy zauszny Signia Intuis SP 4.7","model":"Intuis SP 4.7","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":9000,"swdCode":""},{"idProduct":"11652419","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy zauszny Signia Orion C&G P 50","model":"Orion C&G P 50","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":2800,"swdCode":""},{"idProduct":"11652418","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy zauszny Signia Orion C&G P 75","model":"Orion C&G P 75","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":2900,"swdCode":""},{"idProduct":"11652417","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy zauszny Signia Orion C&G P T 100","model":"Orion C&G P T 100","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":3200,"swdCode":""},{"idProduct":"11652416","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy zauszny Signia Orion C&G P T 200","model":"Orion C&G P T 200","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":3600,"swdCode":""},{"idProduct":"11652413","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy zauszny Signia Orion C&G RIC 100","model":"Orion C&G RIC 100","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":3100,"swdCode":""},{"idProduct":"11652412","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy zauszny Signia Orion C&G RIC 200","model":"Orion C&G RIC 200","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":3500,"swdCode":""},{"idProduct":"11652415","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy zauszny Signia Orion C&G RIC 50","model":"Orion C&G RIC 50","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":2600,"swdCode":""},{"idProduct":"11652414","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy zauszny Signia Orion C&G RIC 75","model":"Orion C&G RIC 75","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":2800,"swdCode":""},{"idProduct":"11652423","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy zauszny Signia Orion C&G SP 50","model":"Orion C&G SP 50","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":2800,"swdCode":""},{"idProduct":"11652422","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy zauszny Signia Orion C&G SP 75","model":"Orion C&G SP 75","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":2900,"swdCode":""},{"idProduct":"11652421","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy zauszny Signia Orion C&G SP T 100","model":"Orion C&G SP T 100","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":3200,"swdCode":""},{"idProduct":"11652420","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy zauszny Signia Orion C&G SP T 200","model":"Orion C&G SP T 200","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":3600,"swdCode":""},{"idProduct":"12909856","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy zauszny Signia Pure C&G BCT 3IX","model":"Pure C&G BCT 3IX","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":7500,"swdCode":""},{"idProduct":"12909855","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy zauszny Signia Pure C&G BCT 5IX","model":"Pure C&G BCT 5IX","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":8500,"swdCode":""},{"idProduct":"12909854","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy zauszny Signia Pure C&G BCT 7IX","model":"Pure C&G BCT 7IX","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":11500,"swdCode":""},{"idProduct":"12909852","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy zauszny Signia Sirion Connect P T 75","model":"Sirion Connect P T 75","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":2800,"swdCode":""},{"idProduct":"12909851","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy zauszny Signia Sirion Connect RIC 75","model":"Sirion Connect RIC 75","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":2800,"swdCode":""},{"idProduct":"12909853","nfzCode":"P.01.01.00","tradeName":"Aparat słuchowy zauszny Signia Sirion Connect SP T 75","model":"Sirion Connect SP T 75","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":2800,"swdCode":""},{"idProduct":"12909873","nfzCode":"P.01.01.00","tradeName":"Aparaty słuchowe wewnątrzuszne Signia Kit Active IX","model":"Kit Active IX","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":7800,"swdCode":""},{"idProduct":"12909872","nfzCode":"P.01.01.00","tradeName":"Aparaty słuchowe wewnątrzuszne Signia Kit Active Pro IX","model":"Kit Active Pro IX","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":15600,"swdCode":""},{"idProduct":"12909878","nfzCode":"P.01.01.00","tradeName":"Aparaty słuchowe wewnątrzuszne Signia KIT Silk C&G 1IX","model":"KIT Silk C&G 1IX","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":6800,"swdCode":""},{"idProduct":"12909877","nfzCode":"P.01.01.00","tradeName":"Aparaty słuchowe wewnątrzuszne Signia KIT Silk C&G 2IX","model":"KIT Silk C&G 2IX","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":7600,"swdCode":""},{"idProduct":"12909876","nfzCode":"P.01.01.00","tradeName":"Aparaty słuchowe wewnątrzuszne Signia KIT Silk C&G 3IX","model":"KIT Silk C&G 3IX","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":9800,"swdCode":""},{"idProduct":"12909875","nfzCode":"P.01.01.00","tradeName":"Aparaty słuchowe wewnątrzuszne Signia KIT Silk C&G 5IX","model":"KIT Silk C&G 5IX","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":15000,"swdCode":""},{"idProduct":"12909874","nfzCode":"P.01.01.00","tradeName":"Aparaty słuchowe wewnątrzuszne Signia KIT Silk C&G 7IX","model":"KIT Silk C&G 7IX","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":18000,"swdCode":""},{"idProduct":"12909861","nfzCode":"P.01.01.00","tradeName":"Aparaty słuchowe zauszne Signia KIT Styletto 1IX","model":"KIT Styletto 1IX","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":7800,"swdCode":""},{"idProduct":"12909860","nfzCode":"P.01.01.00","tradeName":"Aparaty słuchowe zauszne Signia KIT Styletto 2IX","model":"KIT Styletto 2IX","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":8800,"swdCode":""},{"idProduct":"12909859","nfzCode":"P.01.01.00","tradeName":"Aparaty słuchowe zauszne Signia KIT Styletto 3IX","model":"KIT Styletto 3IX","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":11000,"swdCode":""},{"idProduct":"12909858","nfzCode":"P.01.01.00","tradeName":"Aparaty słuchowe zauszne Signia KIT Styletto 5IX","model":"KIT Styletto 5IX","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":16800,"swdCode":""},{"idProduct":"12909857","nfzCode":"P.01.01.00","tradeName":"Aparaty słuchowe zauszne Signia KIT Styletto 7IX","model":"KIT Styletto 7IX","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":22000,"swdCode":""},{"idProduct":"11871637","nfzCode":"P.01.01.00","tradeName":"Audbiel Model A 2 BTE 13","model":"Model A 2 BTE 13","manufacturer":"Starkey Hearing Technologies","orderIndex":"N","grossPrice":2300,"swdCode":""},{"idProduct":"12910440","nfzCode":"P.01.01.00","tradeName":"Audbiel Model A 2 RIC 312","model":"Model A 2 RIC 312","manufacturer":"Starkey Hearing Technologies","orderIndex":"N","grossPrice":2400,"swdCode":""},{"idProduct":"11871635","nfzCode":"P.01.01.00","tradeName":"Audbiel Model A 3 BTE 13","model":"Model A 3 BTE 13","manufacturer":"Starkey Hearing Technologies","orderIndex":"N","grossPrice":2700,"swdCode":""},{"idProduct":"12910439","nfzCode":"P.01.01.00","tradeName":"Audbiel Model A 3 RIC 312","model":"Model A 3 RIC 312","manufacturer":"Starkey Hearing Technologies","orderIndex":"N","grossPrice":2800,"swdCode":""},{"idProduct":"13281120","nfzCode":"P.01.01.00","tradeName":"Audibel A Series AI 10 P BTE 13","model":"A Series AI 10 P BTE 13","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":2500,"swdCode":""},{"idProduct":"13281112","nfzCode":"P.01.01.00","tradeName":"Audibel A Series AI 10 RIC 312","model":"A Series AI 10 RIC 312","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":2500,"swdCode":""},{"idProduct":"13281115","nfzCode":"P.01.01.00","tradeName":"Audibel A Series AI 10 RIC R","model":"A Series AI 10 RIC R","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":2900,"swdCode":""},{"idProduct":"13281125","nfzCode":"P.01.01.00","tradeName":"Audibel A Series AI 10 UP BTE 13","model":"A Series AI 10 UP BTE 13","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":2500,"swdCode":""},{"idProduct":"13281119","nfzCode":"P.01.01.00","tradeName":"Audibel A Series AI 12 P BTE 13","model":"A Series AI 12 P BTE 13","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":2900,"swdCode":""},{"idProduct":"13281111","nfzCode":"P.01.01.00","tradeName":"Audibel A Series AI 12 RIC 312","model":"A Series AI 12 RIC 312","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":2900,"swdCode":""},{"idProduct":"13281114","nfzCode":"P.01.01.00","tradeName":"Audibel A Series AI 12 RIC R","model":"A Series AI 12 RIC R","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":3200,"swdCode":""},{"idProduct":"13281124","nfzCode":"P.01.01.00","tradeName":"Audibel A Series AI 12 UP BTE 13","model":"A Series AI 12 UP BTE 13","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":2900,"swdCode":""},{"idProduct":"13281118","nfzCode":"P.01.01.00","tradeName":"Audibel A Series AI 16 P BTE 13","model":"A Series AI 16 P BTE 13","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":3400,"swdCode":""},{"idProduct":"13281110","nfzCode":"P.01.01.00","tradeName":"Audibel A Series AI 16 RIC 312","model":"A Series AI 16 RIC 312","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":3400,"swdCode":""},{"idProduct":"13281113","nfzCode":"P.01.01.00","tradeName":"Audibel A Series AI 16 RIC R","model":"A Series AI 16 RIC R","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":3550,"swdCode":""},{"idProduct":"13281123","nfzCode":"P.01.01.00","tradeName":"Audibel A Series AI 16 UP BTE 13","model":"A Series AI 16 UP BTE 13","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":3400,"swdCode":""},{"idProduct":"13281117","nfzCode":"P.01.01.00","tradeName":"Audibel A Series AI 20 P BTE 13","model":"A Series AI 20 P BTE 13","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":5300,"swdCode":""},{"idProduct":"13281122","nfzCode":"P.01.01.00","tradeName":"Audibel A Series AI 20 UP BTE 13","model":"A Series AI 20 UP BTE 13","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":5300,"swdCode":""},{"idProduct":"13281116","nfzCode":"P.01.01.00","tradeName":"Audibel A Series AI 24 P BTE 13","model":"A Series AI 24 P BTE 13","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":7100,"swdCode":""},{"idProduct":"13281121","nfzCode":"P.01.01.00","tradeName":"Audibel A Series AI 24 UP BTE 13","model":"A Series AI 24 UP BTE 13","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":7100,"swdCode":""},{"idProduct":"12910435","nfzCode":"P.01.01.00","tradeName":"AUDIBEL ARC AI 1000 BTE 13","model":"ARC AI 1000 BTE 13","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":3300,"swdCode":""},{"idProduct":"12910430","nfzCode":"P.01.01.00","tradeName":"AUDIBEL ARC AI 1000 BTE R","model":"ARC AI 1000 BTE R","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":3300,"swdCode":""},{"idProduct":"12910395","nfzCode":"P.01.01.00","tradeName":"AUDIBEL ARC AI 1000 CIC","model":"ARC AI 1000 CIC 2","manufacturer":"4 GHz","orderIndex":"Starkey Hearing Technologies","grossPrice":"N","swdCode":"3300"},{"idProduct":"13281133","nfzCode":"P.01.01.00","tradeName":"AUDIBEL ARC AI 1000 CIC","model":"ARC AI 1000 CIC 2","manufacturer":"4 GHz","orderIndex":"Starkey Hearing Technologies","grossPrice":"N","swdCode":"3400"},{"idProduct":"12910405","nfzCode":"P.01.01.00","tradeName":"AUDIBEL ARC AI 1000 CIC NW","model":"ARC AI 1000 CIC NW","manufacturer":"Starkey Hearing Technologies","orderIndex":"N","grossPrice":3300,"swdCode":""},{"idProduct":"12910400","nfzCode":"P.01.01.00","tradeName":"AUDIBEL ARC AI 1000 ITC R","model":"ARC AI 1000 ITC R","manufacturer":"Starkey Hearing Technologies","orderIndex":"N","grossPrice":3300,"swdCode":""},{"idProduct":"12910425","nfzCode":"P.01.01.00","tradeName":"AUDIBEL ARC AI 1000 ITE R","model":"ARC AI 1000 ITE R","manufacturer":"Starkey Hearing Technologies","orderIndex":"N","grossPrice":3300,"swdCode":""},{"idProduct":"12910420","nfzCode":"P.01.01.00","tradeName":"AUDIBEL ARC AI 1000 MRIC 312","model":"ARC AI 1000 MRIC 312","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":3300,"swdCode":""},{"idProduct":"12910390","nfzCode":"P.01.01.00","tradeName":"AUDIBEL ARC AI 1000 Power Plus BTE","model":"ARC AI 1000 BTE PP","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":3300,"swdCode":""},{"idProduct":"12910410","nfzCode":"P.01.01.00","tradeName":"AUDIBEL ARC AI 1000 RIC 312","model":"ARC AI 1000 RIC 312","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":3300,"swdCode":""},{"idProduct":"12910415","nfzCode":"P.01.01.00","tradeName":"AUDIBEL ARC AI 1000 RIC R","model":"ARC AI 1000 RIC R","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":3300,"swdCode":""},{"idProduct":"12910434","nfzCode":"P.01.01.00","tradeName":"AUDIBEL ARC AI 1200 BTE 13","model":"ARC AI 1200 BTE 13","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":3700,"swdCode":""},{"idProduct":"12910429","nfzCode":"P.01.01.00","tradeName":"AUDIBEL ARC AI 1200 BTE R","model":"ARC AI 1200 BTE R","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":3700,"swdCode":""},{"idProduct":"12910394","nfzCode":"P.01.01.00","tradeName":"AUDIBEL ARC AI 1200 CIC","model":"ARC AI 1200 CIC 2","manufacturer":"4 GHz","orderIndex":"Starkey Hearing Technologies","grossPrice":"N","swdCode":"3700"},{"idProduct":"13281132","nfzCode":"P.01.01.00","tradeName":"AUDIBEL ARC AI 1200 CIC","model":"ARC AI 1200 CIC 2","manufacturer":"4 GHz","orderIndex":"Starkey Hearing Technologies","grossPrice":"N","swdCode":"3800"},{"idProduct":"12910404","nfzCode":"P.01.01.00","tradeName":"AUDIBEL ARC AI 1200 CIC NW","model":"ARC AI 1200 CIC NW","manufacturer":"Starkey Hearing Technologies","orderIndex":"N","grossPrice":3700,"swdCode":""},{"idProduct":"12910399","nfzCode":"P.01.01.00","tradeName":"AUDIBEL ARC AI 1200 ITC R","model":"ARC AI 1200 ITC R","manufacturer":"Starkey Hearing Technologies","orderIndex":"N","grossPrice":3700,"swdCode":""},{"idProduct":"12910424","nfzCode":"P.01.01.00","tradeName":"AUDIBEL ARC AI 1200 ITE R","model":"ARC AI 1200 ITE R","manufacturer":"Starkey Hearing Technologies","orderIndex":"N","grossPrice":3700,"swdCode":""},{"idProduct":"12910419","nfzCode":"P.01.01.00","tradeName":"AUDIBEL ARC AI 1200 MRIC 312","model":"ARC AI 1200 MRIC 312","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":3700,"swdCode":""},{"idProduct":"12910389","nfzCode":"P.01.01.00","tradeName":"AUDIBEL ARC AI 1200 Power Plus BTE","model":"ARC AI 1200 BTE PP","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":3700,"swdCode":""},{"idProduct":"12910409","nfzCode":"P.01.01.00","tradeName":"AUDIBEL ARC AI 1200 RIC 312","model":"ARC AI 1200 RIC 312","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":3700,"swdCode":""},{"idProduct":"12910414","nfzCode":"P.01.01.00","tradeName":"AUDIBEL ARC AI 1200 RIC R","model":"ARC AI 1200 RIC R","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":3700,"swdCode":""},{"idProduct":"12910433","nfzCode":"P.01.01.00","tradeName":"AUDIBEL ARC AI 1600 BTE 13","model":"ARC AI 1600 BTE 13","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":4200,"swdCode":""},{"idProduct":"12910428","nfzCode":"P.01.01.00","tradeName":"AUDIBEL ARC AI 1600 BTE R","model":"ARC AI 1600 BTE R","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":4200,"swdCode":""},{"idProduct":"13281131","nfzCode":"P.01.01.00","tradeName":"AUDIBEL ARC AI 1600 CIC","model":"ARC AI 1600 CIC 2","manufacturer":"4 GHz","orderIndex":"Starkey Hearing Technologies","grossPrice":"N","swdCode":"4400"},{"idProduct":"12910393","nfzCode":"P.01.01.00","tradeName":"AUDIBEL ARC AI 1600 CIC","model":"ARC AI 1600 CIC 2","manufacturer":"4 GHz","orderIndex":"Starkey Hearing Technologies","grossPrice":"N","swdCode":"4200"},{"idProduct":"12910403","nfzCode":"P.01.01.00","tradeName":"AUDIBEL ARC AI 1600 CIC NW","model":"ARC AI 1600 CIC NW","manufacturer":"Starkey Hearing Technologies","orderIndex":"N","grossPrice":4200,"swdCode":""},{"idProduct":"12910438","nfzCode":"P.01.01.00","tradeName":"AUDIBEL ARC AI 1600 IIC NW","model":"ARC AI 1600 IIC NW","manufacturer":"Starkey Hearing Technologies","orderIndex":"N","grossPrice":4200,"swdCode":""},{"idProduct":"12910398","nfzCode":"P.01.01.00","tradeName":"AUDIBEL ARC AI 1600 ITC R","model":"ARC AI 1600 ITC R","manufacturer":"Starkey Hearing Technologies","orderIndex":"N","grossPrice":4200,"swdCode":""},{"idProduct":"12910423","nfzCode":"P.01.01.00","tradeName":"AUDIBEL ARC AI 1600 ITE R","model":"ARC AI 1600 ITE R","manufacturer":"Starkey Hearing Technologies","orderIndex":"N","grossPrice":4200,"swdCode":""},{"idProduct":"12910418","nfzCode":"P.01.01.00","tradeName":"AUDIBEL ARC AI 1600 MRIC 312","model":"ARC AI 1600 MRIC 312","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":4200,"swdCode":""},{"idProduct":"13281128","nfzCode":"P.01.01.00","tradeName":"AUDIBEL ARC AI 1600 Power Plus BTE","model":"ARC AI 1600 BTE PP","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":4300,"swdCode":""},{"idProduct":"12910388","nfzCode":"P.01.01.00","tradeName":"AUDIBEL ARC AI 1600 Power Plus BTE","model":"ARC AI 1600 BTE PP","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":4200,"swdCode":""},{"idProduct":"12910408","nfzCode":"P.01.01.00","tradeName":"AUDIBEL ARC AI 1600 RIC 312","model":"ARC AI 1600 RIC 312","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":4200,"swdCode":""},{"idProduct":"12910413","nfzCode":"P.01.01.00","tradeName":"AUDIBEL ARC AI 1600 RIC R","model":"ARC AI 1600 RIC R","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":4200,"swdCode":""},{"idProduct":"12910432","nfzCode":"P.01.01.00","tradeName":"AUDIBEL ARC AI 2000 BTE 13","model":"ARC AI 2000 BTE 13","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":5200,"swdCode":""},{"idProduct":"12910427","nfzCode":"P.01.01.00","tradeName":"AUDIBEL ARC AI 2000 BTE R","model":"ARC AI 2000 BTE R","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":5200,"swdCode":""},{"idProduct":"12910392","nfzCode":"P.01.01.00","tradeName":"AUDIBEL ARC AI 2000 CIC","model":"ARC AI 2000 CIC 2","manufacturer":"4 GHz","orderIndex":"Starkey Hearing Technologies","grossPrice":"N","swdCode":"5200"},{"idProduct":"13281130","nfzCode":"P.01.01.00","tradeName":"AUDIBEL ARC AI 2000 CIC","model":"ARC AI 2000 CIC 2","manufacturer":"4 GHz","orderIndex":"Starkey Hearing Technologies","grossPrice":"N","swdCode":"5400"},{"idProduct":"12910402","nfzCode":"P.01.01.00","tradeName":"AUDIBEL ARC AI 2000 CIC NW","model":"ARC AI 2000 CIC NW","manufacturer":"Starkey Hearing Technologies","orderIndex":"N","grossPrice":5200,"swdCode":""},{"idProduct":"12910437","nfzCode":"P.01.01.00","tradeName":"AUDIBEL ARC AI 2000 IIC NW","model":"ARC AI 2000 IIC NW","manufacturer":"Starkey Hearing Technologies","orderIndex":"N","grossPrice":5200,"swdCode":""},{"idProduct":"12910397","nfzCode":"P.01.01.00","tradeName":"AUDIBEL ARC AI 2000 ITC R","model":"ARC AI 2000 ITC R","manufacturer":"Starkey Hearing Technologies","orderIndex":"N","grossPrice":5200,"swdCode":""},{"idProduct":"12910422","nfzCode":"P.01.01.00","tradeName":"AUDIBEL ARC AI 2000 ITE R","model":"ARC AI 2000 ITE R","manufacturer":"Starkey Hearing Technologies","orderIndex":"N","grossPrice":5200,"swdCode":""},{"idProduct":"12910417","nfzCode":"P.01.01.00","tradeName":"AUDIBEL ARC AI 2000 MRIC 312","model":"ARC AI 2000 MRIC 312","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":5200,"swdCode":""},{"idProduct":"12910387","nfzCode":"P.01.01.00","tradeName":"AUDIBEL ARC AI 2000 Power Plus BTE","model":"ARC AI 2000 BTE PP","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":7200,"swdCode":""},{"idProduct":"13281127","nfzCode":"P.01.01.00","tradeName":"AUDIBEL ARC AI 2000 Power Plus BTE","model":"ARC AI 2000 BTE PP","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":5300,"swdCode":""},{"idProduct":"12910407","nfzCode":"P.01.01.00","tradeName":"AUDIBEL ARC AI 2000 RIC 312","model":"ARC AI 2000 RIC 312","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":5200,"swdCode":""},{"idProduct":"12910412","nfzCode":"P.01.01.00","tradeName":"AUDIBEL ARC AI 2000 RIC R","model":"ARC AI 2000 RIC R","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":5200,"swdCode":""},{"idProduct":"12910431","nfzCode":"P.01.01.00","tradeName":"AUDIBEL ARC AI 2400 BTE 13","model":"ARC AI 2400 BTE 13","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":7200,"swdCode":""},{"idProduct":"12910426","nfzCode":"P.01.01.00","tradeName":"AUDIBEL ARC AI 2400 BTE R","model":"ARC AI 2400 BTE R","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":7200,"swdCode":""},{"idProduct":"12910391","nfzCode":"P.01.01.00","tradeName":"AUDIBEL ARC AI 2400 CIC","model":"ARC AI 2400 CIC 2","manufacturer":"4 GHz","orderIndex":"Starkey Hearing Technologies","grossPrice":"N","swdCode":"7200"},{"idProduct":"13281129","nfzCode":"P.01.01.00","tradeName":"AUDIBEL ARC AI 2400 CIC","model":"ARC AI 2400 CIC 2","manufacturer":"4 GHz","orderIndex":"Starkey Hearing Technologies","grossPrice":"N","swdCode":"7400"},{"idProduct":"12910401","nfzCode":"P.01.01.00","tradeName":"AUDIBEL ARC AI 2400 CIC NW","model":"ARC AI 2400 CIC NW","manufacturer":"Starkey Hearing Technologies","orderIndex":"N","grossPrice":7200,"swdCode":""},{"idProduct":"12910436","nfzCode":"P.01.01.00","tradeName":"AUDIBEL ARC AI 2400 IIC NW","model":"ARC AI 2400 IIC NW","manufacturer":"Starkey Hearing Technologies","orderIndex":"N","grossPrice":7200,"swdCode":""},{"idProduct":"12910396","nfzCode":"P.01.01.00","tradeName":"AUDIBEL ARC AI 2400 ITC R","model":"ARC AI 2400 ITC R","manufacturer":"Starkey Hearing Technologies","orderIndex":"N","grossPrice":7200,"swdCode":""},{"idProduct":"12910421","nfzCode":"P.01.01.00","tradeName":"AUDIBEL ARC AI 2400 ITE R","model":"ARC AI 2400 ITE R","manufacturer":"Starkey Hearing Technologies","orderIndex":"N","grossPrice":7200,"swdCode":""},{"idProduct":"12910416","nfzCode":"P.01.01.00","tradeName":"AUDIBEL ARC AI 2400 MRIC 312","model":"ARC AI 2400 MRIC 312","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":7200,"swdCode":""},{"idProduct":"13281126","nfzCode":"P.01.01.00","tradeName":"AUDIBEL ARC AI 2400 Power Plus BTE","model":"ARC AI 2400 BTE PP","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":7300,"swdCode":""},{"idProduct":"12910386","nfzCode":"P.01.01.00","tradeName":"AUDIBEL ARC AI 2400 Power Plus BTE","model":"ARC AI 2400 BTE PP","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":7200,"swdCode":""},{"idProduct":"12910406","nfzCode":"P.01.01.00","tradeName":"AUDIBEL ARC AI 2400 RIC 312","model":"ARC AI 2400 RIC 312","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":7200,"swdCode":""},{"idProduct":"12910411","nfzCode":"P.01.01.00","tradeName":"AUDIBEL ARC AI 2400 RIC R","model":"ARC AI 2400 RIC R","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":7200,"swdCode":""},{"idProduct":"13281102","nfzCode":"P.01.01.00","tradeName":"Audibel Aris AI 16 CIC","model":"Aris AI 16 CIC","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":5500,"swdCode":""},{"idProduct":"13281109","nfzCode":"P.01.01.00","tradeName":"Audibel Aris AI 16 ITC R","model":"Aris AI 16 ITC R","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":5800,"swdCode":""},{"idProduct":"13281105","nfzCode":"P.01.01.00","tradeName":"Audibel Aris AI 16 ITE R","model":"Aris AI 16 ITE R","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":5800,"swdCode":""},{"idProduct":"13281096","nfzCode":"P.01.01.00","tradeName":"Audibel Aris AI 16 mRIC R","model":"Aris AI 16 mRIC R","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":5500,"swdCode":""},{"idProduct":"13281099","nfzCode":"P.01.01.00","tradeName":"Audibel Aris AI 16 RIC 312","model":"Aris AI 16 RIC 312","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":5300,"swdCode":""},{"idProduct":"13281093","nfzCode":"P.01.01.00","tradeName":"Audibel Aris AI 16 RIC RT","model":"Aris AI 16 RIC RT","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":5500,"swdCode":""},{"idProduct":"13281101","nfzCode":"P.01.01.00","tradeName":"Audibel Aris AI 20 CIC","model":"Aris AI 20 CIC","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":8300,"swdCode":""},{"idProduct":"13281108","nfzCode":"P.01.01.00","tradeName":"Audibel Aris AI 20 ITC R","model":"Aris AI 20 ITC R","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":8500,"swdCode":""},{"idProduct":"13281104","nfzCode":"P.01.01.00","tradeName":"Audibel Aris AI 20 ITE R","model":"Aris AI 20 ITE R","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":8500,"swdCode":""},{"idProduct":"13281095","nfzCode":"P.01.01.00","tradeName":"Audibel Aris AI 20 mRIC R","model":"Aris AI 20 mRIC R","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":8300,"swdCode":""},{"idProduct":"13281098","nfzCode":"P.01.01.00","tradeName":"Audibel Aris AI 20 RIC 312","model":"Aris AI 20 RIC 312","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":8100,"swdCode":""},{"idProduct":"13281092","nfzCode":"P.01.01.00","tradeName":"Audibel Aris AI 20 RIC RT","model":"Aris AI 20 RIC RT","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":8300,"swdCode":""},{"idProduct":"13281100","nfzCode":"P.01.01.00","tradeName":"Audibel Aris AI 24 CIC","model":"Aris AI 24 CIC","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":9700,"swdCode":""},{"idProduct":"13281106","nfzCode":"P.01.01.00","tradeName":"Audibel Aris AI 24 ITC R","model":"Aris AI 24 ITC R","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":9900,"swdCode":""},{"idProduct":"13281103","nfzCode":"P.01.01.00","tradeName":"Audibel Aris AI 24 ITE R","model":"Aris AI 24 ITE R","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":9900,"swdCode":""},{"idProduct":"13281094","nfzCode":"P.01.01.00","tradeName":"Audibel Aris AI 24 mRIC R","model":"Aris AI 24 mRIC R","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":9700,"swdCode":""},{"idProduct":"13281097","nfzCode":"P.01.01.00","tradeName":"Audibel Aris AI 24 RIC 312","model":"Aris AI 24 RIC 312","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":9500,"swdCode":""},{"idProduct":"13281091","nfzCode":"P.01.01.00","tradeName":"Audibel Aris AI 24 RIC RT","model":"Aris AI 24 RIC RT","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":9700,"swdCode":""},{"idProduct":"12910372","nfzCode":"P.01.01.00","tradeName":"Audibel Intrigue AI 16 CIC","model":"Intrigue AI 16 CIC","manufacturer":"Starkey Hearing Technologies","orderIndex":"N","grossPrice":4800,"swdCode":""},{"idProduct":"12910366","nfzCode":"P.01.01.00","tradeName":"Audibel Intrigue AI 16 CIC NW","model":"Intrigue AI 16 CIC NW","manufacturer":"Starkey Hearing Technologies","orderIndex":"N","grossPrice":4800,"swdCode":""},{"idProduct":"12910369","nfzCode":"P.01.01.00","tradeName":"Audibel Intrigue AI 16 IIC NW","model":"Intrigue AI 16 IIC NW","manufacturer":"Starkey Hearing Technologies","orderIndex":"N","grossPrice":4800,"swdCode":""},{"idProduct":"12910378","nfzCode":"P.01.01.00","tradeName":"Audibel Intrigue AI 16 ITC R","model":"Intrigue AI 16 ITC R","manufacturer":"Starkey Hearing Technologies","orderIndex":"N","grossPrice":4800,"swdCode":""},{"idProduct":"12910375","nfzCode":"P.01.01.00","tradeName":"Audibel Intrigue AI 16 ITE R","model":"Intrigue AI 16 ITE R","manufacturer":"Starkey Hearing Technologies","orderIndex":"N","grossPrice":4800,"swdCode":""},{"idProduct":"12910360","nfzCode":"P.01.01.00","tradeName":"Audibel Intrigue AI 16 mRIC R","model":"Intrigue AI 16 mRIC R","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":4800,"swdCode":""},{"idProduct":"12910363","nfzCode":"P.01.01.00","tradeName":"Audibel Intrigue AI 16 RIC 312","model":"Intrigue AI 16 RIC 312","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":4700,"swdCode":""},{"idProduct":"12910357","nfzCode":"P.01.01.00","tradeName":"Audibel Intrigue AI 16 RIC RT","model":"Intrigue AI 16 RIC RT","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":4800,"swdCode":""},{"idProduct":"12910371","nfzCode":"P.01.01.00","tradeName":"Audibel Intrigue AI 20 CIC","model":"Intrigue AI 20 CIC","manufacturer":"Starkey Hearing Technologies","orderIndex":"N","grossPrice":5800,"swdCode":""},{"idProduct":"12910365","nfzCode":"P.01.01.00","tradeName":"Audibel Intrigue AI 20 CIC NW","model":"Intrigue AI 20 CIC NW","manufacturer":"Starkey Hearing Technologies","orderIndex":"N","grossPrice":5800,"swdCode":""},{"idProduct":"12910368","nfzCode":"P.01.01.00","tradeName":"Audibel Intrigue AI 20 IIC NW","model":"Intrigue AI 20 IIC NW","manufacturer":"Starkey Hearing Technologies","orderIndex":"N","grossPrice":5800,"swdCode":""},{"idProduct":"12910377","nfzCode":"P.01.01.00","tradeName":"Audibel Intrigue AI 20 ITC R","model":"Intrigue AI 20 ITC R","manufacturer":"Starkey Hearing Technologies","orderIndex":"N","grossPrice":5800,"swdCode":""},{"idProduct":"12910374","nfzCode":"P.01.01.00","tradeName":"Audibel Intrigue AI 20 ITE R","model":"Intrigue AI 20 ITE R","manufacturer":"Starkey Hearing Technologies","orderIndex":"N","grossPrice":5800,"swdCode":""},{"idProduct":"12910359","nfzCode":"P.01.01.00","tradeName":"Audibel Intrigue AI 20 mRIC R","model":"Intrigue AI 20 mRIC R","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":5800,"swdCode":""},{"idProduct":"12910362","nfzCode":"P.01.01.00","tradeName":"Audibel Intrigue AI 20 RIC 312","model":"Intrigue AI 20 RIC 312","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":5700,"swdCode":""},{"idProduct":"12910356","nfzCode":"P.01.01.00","tradeName":"Audibel Intrigue AI 20 RIC RT","model":"Intrigue AI 20 RIC RT","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":5800,"swdCode":""},{"idProduct":"12910370","nfzCode":"P.01.01.00","tradeName":"Audibel Intrigue AI 24 CIC","model":"Intrigue AI 24 CIC","manufacturer":"Starkey Hearing Technologies","orderIndex":"N","grossPrice":8300,"swdCode":""},{"idProduct":"12910364","nfzCode":"P.01.01.00","tradeName":"Audibel Intrigue AI 24 CIC NW","model":"Intrigue AI 24 CIC NW","manufacturer":"Starkey Hearing Technologies","orderIndex":"N","grossPrice":8300,"swdCode":""},{"idProduct":"12910367","nfzCode":"P.01.01.00","tradeName":"Audibel Intrigue AI 24 IIC NW","model":"Intrigue AI 24 IIC NW","manufacturer":"Starkey Hearing Technologies","orderIndex":"N","grossPrice":8300,"swdCode":""},{"idProduct":"12910376","nfzCode":"P.01.01.00","tradeName":"Audibel Intrigue AI 24 ITC R","model":"Intrigue AI 24 ITC R","manufacturer":"Starkey Hearing Technologies","orderIndex":"N","grossPrice":8300,"swdCode":""},{"idProduct":"12910373","nfzCode":"P.01.01.00","tradeName":"Audibel Intrigue AI 24 ITE R","model":"Intrigue AI 24 ITE R","manufacturer":"Starkey Hearing Technologies","orderIndex":"N","grossPrice":8300,"swdCode":""},{"idProduct":"12910358","nfzCode":"P.01.01.00","tradeName":"Audibel Intrigue AI 24 mRIC R","model":"Intrigue AI 24 mRIC R","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":8300,"swdCode":""},{"idProduct":"12910361","nfzCode":"P.01.01.00","tradeName":"Audibel Intrigue AI 24 RIC 312","model":"Intrigue AI 24 RIC 312","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":8200,"swdCode":""},{"idProduct":"12910355","nfzCode":"P.01.01.00","tradeName":"Audibel Intrigue AI 24 RIC RT","model":"Intrigue AI 24 RIC RT","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":8300,"swdCode":""},{"idProduct":"12910348","nfzCode":"P.01.01.00","tradeName":"Audibel Vitality AI 16 CIC","model":"Vitality AI 16 CIC","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":5200,"swdCode":""},{"idProduct":"12910354","nfzCode":"P.01.01.00","tradeName":"Audibel Vitality AI 16 ITC R","model":"Vitality AI 16 ITC R","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":5200,"swdCode":""},{"idProduct":"12910351","nfzCode":"P.01.01.00","tradeName":"Audibel Vitality AI 16 ITE R","model":"Vitality AI 16 ITE R","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":5200,"swdCode":""},{"idProduct":"12910342","nfzCode":"P.01.01.00","tradeName":"Audibel Vitality AI 16 mRIC R","model":"Vitality AI 16 mRIC R","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":5200,"swdCode":""},{"idProduct":"12910345","nfzCode":"P.01.01.00","tradeName":"Audibel Vitality AI 16 RIC 312","model":"Vitality AI 16 RIC 312","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":5200,"swdCode":""},{"idProduct":"12910339","nfzCode":"P.01.01.00","tradeName":"Audibel Vitality AI 16 RIC RT","model":"Vitality AI 16 RIC RT","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":5200,"swdCode":""},{"idProduct":"12910347","nfzCode":"P.01.01.00","tradeName":"Audibel Vitality AI 20 CIC","model":"Vitality AI 20 CIC","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":6300,"swdCode":""},{"idProduct":"12910353","nfzCode":"P.01.01.00","tradeName":"Audibel Vitality AI 20 ITC R","model":"Vitality AI 20 ITC R","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":6300,"swdCode":""},{"idProduct":"12910350","nfzCode":"P.01.01.00","tradeName":"Audibel Vitality AI 20 ITE R","model":"Vitality AI 20 ITE R","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":6300,"swdCode":""},{"idProduct":"12910341","nfzCode":"P.01.01.00","tradeName":"Audibel Vitality AI 20 mRIC R","model":"Vitality AI 20 mRIC R","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":6300,"swdCode":""},{"idProduct":"12910344","nfzCode":"P.01.01.00","tradeName":"Audibel Vitality AI 20 RIC 312","model":"Vitality AI 20 RIC 312","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":6300,"swdCode":""},{"idProduct":"12910338","nfzCode":"P.01.01.00","tradeName":"Audibel Vitality AI 20 RIC RT","model":"Vitality AI 20 RIC RT","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":6300,"swdCode":""},{"idProduct":"12910346","nfzCode":"P.01.01.00","tradeName":"Audibel Vitality AI 24 CIC","model":"Vitality AI 24 CIC","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":9300,"swdCode":""},{"idProduct":"12910352","nfzCode":"P.01.01.00","tradeName":"Audibel Vitality AI 24 ITC R","model":"Vitality AI 24 ITC R","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":9300,"swdCode":""},{"idProduct":"12910349","nfzCode":"P.01.01.00","tradeName":"Audibel Vitality AI 24 ITE R","model":"Vitality AI 24 ITE R","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":9300,"swdCode":""},{"idProduct":"12910340","nfzCode":"P.01.01.00","tradeName":"Audibel Vitality AI 24 mRIC R","model":"Vitality AI 24 mRIC R","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":9300,"swdCode":""},{"idProduct":"12910343","nfzCode":"P.01.01.00","tradeName":"Audibel Vitality AI 24 RIC 312","model":"Vitality AI 24 RIC 312","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":9300,"swdCode":""},{"idProduct":"12910337","nfzCode":"P.01.01.00","tradeName":"Audibel Vitality AI 24 RIC RT","model":"Vitality AI 24 RIC RT","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":9300,"swdCode":""},{"idProduct":"10554118","nfzCode":"P.01.01.00","tradeName":"BERNAFON ALPHA 1 CIC","model":"ALPHA 1 CIC","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":3600,"swdCode":""},{"idProduct":"10554119","nfzCode":"P.01.01.00","tradeName":"BERNAFON ALPHA 1 IIC","model":"ALPHA 1 IIC","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":3600,"swdCode":""},{"idProduct":"10554117","nfzCode":"P.01.01.00","tradeName":"BERNAFON ALPHA 1 ITC","model":"ALPHA 1 ITC","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":3600,"swdCode":""},{"idProduct":"10554116","nfzCode":"P.01.01.00","tradeName":"BERNAFON ALPHA 1 ITE FS","model":"ALPHA 1 ITE FS","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":3600,"swdCode":""},{"idProduct":"10554115","nfzCode":"P.01.01.00","tradeName":"BERNAFON ALPHA 1 ITE HS","model":"ALPHA 1 ITE HS","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":3600,"swdCode":""},{"idProduct":"10554114","nfzCode":"P.01.01.00","tradeName":"BERNAFON ALPHA 1 MNB T","model":"ALPHA 1 miniBTE T","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":3300,"swdCode":""},{"idProduct":"10554113","nfzCode":"P.01.01.00","tradeName":"BERNAFON ALPHA 1 MNB T R","model":"ALPHA 1 miniBTE T R","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":3700,"swdCode":""},{"idProduct":"10554112","nfzCode":"P.01.01.00","tradeName":"BERNAFON ALPHA 1 MNR T","model":"ALPHA 1 miniRITE T","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":3400,"swdCode":""},{"idProduct":"10554111","nfzCode":"P.01.01.00","tradeName":"BERNAFON ALPHA 1 MNR T R","model":"ALPHA 1 miniRITE T R","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":3700,"swdCode":""},{"idProduct":"10554109","nfzCode":"P.01.01.00","tradeName":"BERNAFON ALPHA 3 CIC","model":"ALPHA 3 CIC","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":4400,"swdCode":""},{"idProduct":"10554110","nfzCode":"P.01.01.00","tradeName":"BERNAFON ALPHA 3 IIC","model":"ALPHA 3 IIC","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":4400,"swdCode":""},{"idProduct":"10554108","nfzCode":"P.01.01.00","tradeName":"BERNAFON ALPHA 3 ITC","model":"ALPHA 3 ITC","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":4400,"swdCode":""},{"idProduct":"10554107","nfzCode":"P.01.01.00","tradeName":"BERNAFON ALPHA 3 ITE FS","model":"ALPHA 3 ITE FS","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":4400,"swdCode":""},{"idProduct":"10554106","nfzCode":"P.01.01.00","tradeName":"BERNAFON ALPHA 3 ITE HS","model":"ALPHA 3 ITE HS","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":4400,"swdCode":""},{"idProduct":"10554105","nfzCode":"P.01.01.00","tradeName":"BERNAFON ALPHA 3 MNB T","model":"ALPHA 3 miniBTE T","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":4000,"swdCode":""},{"idProduct":"10554104","nfzCode":"P.01.01.00","tradeName":"BERNAFON ALPHA 3 MNB T R","model":"ALPHA 3 miniBTE T R","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":4400,"swdCode":""},{"idProduct":"10554103","nfzCode":"P.01.01.00","tradeName":"BERNAFON ALPHA 3 MNR T","model":"ALPHA 3 miniRITE T","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":4100,"swdCode":""},{"idProduct":"10554102","nfzCode":"P.01.01.00","tradeName":"BERNAFON ALPHA 3 MNR T R","model":"ALPHA 3 miniRITE T R","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":4400,"swdCode":""},{"idProduct":"10554100","nfzCode":"P.01.01.00","tradeName":"BERNAFON ALPHA 5 CIC","model":"ALPHA 5 CIC","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":5400,"swdCode":""},{"idProduct":"10554101","nfzCode":"P.01.01.00","tradeName":"BERNAFON ALPHA 5 IIC","model":"ALPHA 5 IIC","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":5400,"swdCode":""},{"idProduct":"10554099","nfzCode":"P.01.01.00","tradeName":"BERNAFON ALPHA 5 ITC","model":"ALPHA 5 ITC","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":5400,"swdCode":""},{"idProduct":"10554098","nfzCode":"P.01.01.00","tradeName":"BERNAFON ALPHA 5 ITE FS","model":"ALPHA 5 ITE FS","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":5400,"swdCode":""},{"idProduct":"10554097","nfzCode":"P.01.01.00","tradeName":"BERNAFON ALPHA 5 ITE HS","model":"ALPHA 5 ITE HS","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":5400,"swdCode":""},{"idProduct":"10554096","nfzCode":"P.01.01.00","tradeName":"BERNAFON ALPHA 5 MNB T","model":"ALPHA 5 miniBTE T","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":5100,"swdCode":""},{"idProduct":"10554095","nfzCode":"P.01.01.00","tradeName":"BERNAFON ALPHA 5 MNB T R","model":"ALPHA 5 miniBTE T R","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":5400,"swdCode":""},{"idProduct":"10554094","nfzCode":"P.01.01.00","tradeName":"BERNAFON ALPHA 5 MNR T","model":"ALPHA 5 miniRITE T","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":5200,"swdCode":""},{"idProduct":"10554093","nfzCode":"P.01.01.00","tradeName":"BERNAFON ALPHA 5 MNR T R","model":"ALPHA 5 miniRITE T R","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":5400,"swdCode":""},{"idProduct":"10554091","nfzCode":"P.01.01.00","tradeName":"BERNAFON ALPHA 7 CIC","model":"ALPHA 7 CIC","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":7000,"swdCode":""},{"idProduct":"10554092","nfzCode":"P.01.01.00","tradeName":"BERNAFON ALPHA 7 IIC","model":"ALPHA 7 IIC","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":7000,"swdCode":""},{"idProduct":"10554090","nfzCode":"P.01.01.00","tradeName":"BERNAFON ALPHA 7 ITC","model":"ALPHA 7 ITC","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":7000,"swdCode":""},{"idProduct":"10554089","nfzCode":"P.01.01.00","tradeName":"BERNAFON ALPHA 7 ITE FS","model":"ALPHA 7 ITE FS","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":7000,"swdCode":""},{"idProduct":"10554088","nfzCode":"P.01.01.00","tradeName":"BERNAFON ALPHA 7 ITE HS","model":"ALPHA 7 ITE HS","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":7000,"swdCode":""},{"idProduct":"10554087","nfzCode":"P.01.01.00","tradeName":"BERNAFON ALPHA 7 MNB T","model":"ALPHA 7 miniBTE T","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":6800,"swdCode":""},{"idProduct":"10554086","nfzCode":"P.01.01.00","tradeName":"BERNAFON ALPHA 7 MNB T R","model":"ALPHA 7 miniBTE T R","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":7000,"swdCode":""},{"idProduct":"10554085","nfzCode":"P.01.01.00","tradeName":"BERNAFON ALPHA 7 MNR T","model":"ALPHA 7 miniRITE T","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":6800,"swdCode":""},{"idProduct":"10554084","nfzCode":"P.01.01.00","tradeName":"BERNAFON ALPHA 7 MNR T R","model":"ALPHA 7 miniRITE T R","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":7000,"swdCode":""},{"idProduct":"10554082","nfzCode":"P.01.01.00","tradeName":"BERNAFON ALPHA 9 CIC","model":"ALPHA 9 CIC","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":8500,"swdCode":""},{"idProduct":"10554083","nfzCode":"P.01.01.00","tradeName":"BERNAFON ALPHA 9 IIC","model":"ALPHA 9 IIC","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":8500,"swdCode":""},{"idProduct":"10554081","nfzCode":"P.01.01.00","tradeName":"BERNAFON ALPHA 9 ITC","model":"ALPHA 9 ITC","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":8500,"swdCode":""},{"idProduct":"10554080","nfzCode":"P.01.01.00","tradeName":"BERNAFON ALPHA 9 ITE FS","model":"ALPHA 9 ITE FS","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":8500,"swdCode":""},{"idProduct":"10554079","nfzCode":"P.01.01.00","tradeName":"BERNAFON ALPHA 9 ITE HS","model":"ALPHA 9 ITE HS","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":8500,"swdCode":""},{"idProduct":"10554078","nfzCode":"P.01.01.00","tradeName":"BERNAFON ALPHA 9 MNB T","model":"ALPHA 9 miniBTE T","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":8300,"swdCode":""},{"idProduct":"10554077","nfzCode":"P.01.01.00","tradeName":"BERNAFON ALPHA 9 MNB T R","model":"ALPHA 9 miniBTE T R","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":8500,"swdCode":""},{"idProduct":"10554076","nfzCode":"P.01.01.00","tradeName":"BERNAFON ALPHA 9 MNR T","model":"ALPHA 9 miniRITE T","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":8300,"swdCode":""},{"idProduct":"10554075","nfzCode":"P.01.01.00","tradeName":"BERNAFON ALPHA 9 MNR T R","model":"ALPHA 9 miniRITE T R","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":8500,"swdCode":""},{"idProduct":"10554074","nfzCode":"P.01.01.00","tradeName":"BERNAFON ALPHA XT 5 MNB T","model":"ALPHA XT 5 miniBTE T","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":6500,"swdCode":""},{"idProduct":"10554073","nfzCode":"P.01.01.00","tradeName":"BERNAFON ALPHA XT 5 MNB T R","model":"ALPHA XT 5 miniBTE T R","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":7100,"swdCode":""},{"idProduct":"10554072","nfzCode":"P.01.01.00","tradeName":"BERNAFON ALPHA XT 5 MNR T","model":"ALPHA XT 5 miniRITE T","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":6500,"swdCode":""},{"idProduct":"10554071","nfzCode":"P.01.01.00","tradeName":"BERNAFON ALPHA XT 5 MNR T R","model":"ALPHA XT 5 miniRITE T R","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":7100,"swdCode":""},{"idProduct":"10554070","nfzCode":"P.01.01.00","tradeName":"BERNAFON ALPHA XT 7 MNB T","model":"ALPHA XT 7 miniBTE T","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":7800,"swdCode":""},{"idProduct":"10554069","nfzCode":"P.01.01.00","tradeName":"BERNAFON ALPHA XT 7 MNB T R","model":"ALPHA XT 7 miniBTE T R","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":8300,"swdCode":""},{"idProduct":"10554068","nfzCode":"P.01.01.00","tradeName":"BERNAFON ALPHA XT 7 MNR T","model":"ALPHA XT 7 miniRITE T","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":7800,"swdCode":""},{"idProduct":"10554067","nfzCode":"P.01.01.00","tradeName":"BERNAFON ALPHA XT 7 MNR T R","model":"ALPHA XT 7 miniRITE T R","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":8500,"swdCode":""},{"idProduct":"10554066","nfzCode":"P.01.01.00","tradeName":"BERNAFON ALPHA XT 9 MNB T","model":"ALPHA XT 9 miniBTE T","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":9900,"swdCode":""},{"idProduct":"10554065","nfzCode":"P.01.01.00","tradeName":"BERNAFON ALPHA XT 9 MNB T R","model":"ALPHA XT 9 miniBTE T R","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":10300,"swdCode":""},{"idProduct":"10554064","nfzCode":"P.01.01.00","tradeName":"BERNAFON ALPHA XT 9 MNR T","model":"ALPHA XT 9 miniRITE T","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":9900,"swdCode":""},{"idProduct":"10554063","nfzCode":"P.01.01.00","tradeName":"BERNAFON ALPHA XT 9 MNR T R","model":"ALPHA XT 9 miniRITE T R","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":10500,"swdCode":""},{"idProduct":"12910152","nfzCode":"P.01.01.00","tradeName":"BERNAFON ENCANTA 100 CIC","model":"ENCANTA 100 CIC","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":4800,"swdCode":""},{"idProduct":"12910153","nfzCode":"P.01.01.00","tradeName":"BERNAFON ENCANTA 100 IIC","model":"ENCANTA 100 IIC","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":4800,"swdCode":""},{"idProduct":"12910151","nfzCode":"P.01.01.00","tradeName":"BERNAFON ENCANTA 100 MNB R","model":"ENCANTA 100 MNB R","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":5000,"swdCode":""},{"idProduct":"12910150","nfzCode":"P.01.01.00","tradeName":"BERNAFON ENCANTA 100 MNR","model":"ENCANTA 100 MNR","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":5000,"swdCode":""},{"idProduct":"12910148","nfzCode":"P.01.01.00","tradeName":"BERNAFON ENCANTA 200 CIC","model":"ENCANCTA 200 CIC","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":6800,"swdCode":""},{"idProduct":"12910149","nfzCode":"P.01.01.00","tradeName":"BERNAFON ENCANTA 200 IIC","model":"ENCANCTA 200 IIC","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":6800,"swdCode":""},{"idProduct":"12910147","nfzCode":"P.01.01.00","tradeName":"BERNAFON ENCANTA 200 MNB R","model":"ENCANTA 200 MNB R","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":7000,"swdCode":""},{"idProduct":"12910146","nfzCode":"P.01.01.00","tradeName":"BERNAFON ENCANTA 200 MNR","model":"ENCANTA 200 MNR","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":7000,"swdCode":""},{"idProduct":"12910144","nfzCode":"P.01.01.00","tradeName":"BERNAFON ENCANTA 300 CIC","model":"ENCANTA 300 CIC","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":8500,"swdCode":""},{"idProduct":"12910145","nfzCode":"P.01.01.00","tradeName":"BERNAFON ENCANTA 300 IIC","model":"ENCANTA 300 IIC","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":8500,"swdCode":""},{"idProduct":"12910143","nfzCode":"P.01.01.00","tradeName":"BERNAFON ENCANTA 300 MNB R","model":"ENCANTA 300 MNB R","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":8700,"swdCode":""},{"idProduct":"12910142","nfzCode":"P.01.01.00","tradeName":"BERNAFON ENCANTA 300 MNR","model":"ENCANTA 300 MNR","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":8700,"swdCode":""},{"idProduct":"12910140","nfzCode":"P.01.01.00","tradeName":"BERNAFON ENCANTA 400 CIC","model":"ENCANTA 400 CIC","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":10500,"swdCode":""},{"idProduct":"12910141","nfzCode":"P.01.01.00","tradeName":"BERNAFON ENCANTA 400 IIC","model":"ENCANTA 400 IIC","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":10500,"swdCode":""},{"idProduct":"12910139","nfzCode":"P.01.01.00","tradeName":"BERNAFON ENCANTA 400 MNB R","model":"ENCANTA 400 MNB R","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":10700,"swdCode":""},{"idProduct":"12910138","nfzCode":"P.01.01.00","tradeName":"BERNAFON ENCANTA 400 MNR","model":"ENCANTA 400 MNR","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":10700,"swdCode":""},{"idProduct":"12910175","nfzCode":"P.01.01.00","tradeName":"BERNAFON ENTRA A 1 B105","model":"ENTRA A 1 B 105","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":2000,"swdCode":""},{"idProduct":"12910173","nfzCode":"P.01.01.00","tradeName":"BERNAFON ENTRA A 1 MNR","model":"ENTRA A 1 MiniRITE","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":2500,"swdCode":""},{"idProduct":"12910174","nfzCode":"P.01.01.00","tradeName":"BERNAFON ENTRA A 1 MNR T","model":"ENTRA A 1 MiniRITE T","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":2500,"swdCode":""},{"idProduct":"12910172","nfzCode":"P.01.01.00","tradeName":"BERNAFON ENTRA A 2 B105","model":"ENTRA A 2 B 105","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":2700,"swdCode":""},{"idProduct":"10554126","nfzCode":"P.01.01.00","tradeName":"BERNAFON ENTRA A 2 MNR","model":"ENTRA A 2 MiniRITE","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":2800,"swdCode":""},{"idProduct":"10554125","nfzCode":"P.01.01.00","tradeName":"BERNAFON ENTRA A 2 MNR T","model":"ENTRA A 2 MiniRITE T","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":2800,"swdCode":""},{"idProduct":"12910170","nfzCode":"P.01.01.00","tradeName":"BERNAFON ENTRA B 10 CIC","model":"ENTRA B10 CIC","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":3700,"swdCode":""},{"idProduct":"12910171","nfzCode":"P.01.01.00","tradeName":"BERNAFON ENTRA B 10 IIC","model":"ENTRA B10 IIC","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":3700,"swdCode":""},{"idProduct":"12910169","nfzCode":"P.01.01.00","tradeName":"BERNAFON ENTRA B 10 ITC","model":"ENTRA B10 ITC","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":3700,"swdCode":""},{"idProduct":"12910167","nfzCode":"P.01.01.00","tradeName":"BERNAFON ENTRA B 10 ITE FS","model":"ENTRA B10 ITE FS","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":3700,"swdCode":""},{"idProduct":"12910168","nfzCode":"P.01.01.00","tradeName":"BERNAFON ENTRA B 10 ITE HS","model":"ENTRA B10 ITE HS","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":3700,"swdCode":""},{"idProduct":"12910166","nfzCode":"P.01.01.00","tradeName":"BERNAFON ENTRA B 10 MNB T","model":"ENTRA B10 miniBTE T","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":3300,"swdCode":""},{"idProduct":"12910163","nfzCode":"P.01.01.00","tradeName":"BERNAFON ENTRA B 10 MNB T R","model":"ENTRA B10 miniBTE T R","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":3850,"swdCode":""},{"idProduct":"12910165","nfzCode":"P.01.01.00","tradeName":"BERNAFON ENTRA B 10 MNR T","model":"ENTRA B10 miniRITE T","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":3300,"swdCode":""},{"idProduct":"12910164","nfzCode":"P.01.01.00","tradeName":"BERNAFON ENTRA B 10 MNR T R","model":"ENTRA B10 miniRITE T R","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":3850,"swdCode":""},{"idProduct":"12910161","nfzCode":"P.01.01.00","tradeName":"BERNAFON ENTRA B 20 CIC","model":"ENTRA B20 CIC","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":4700,"swdCode":""},{"idProduct":"12910162","nfzCode":"P.01.01.00","tradeName":"BERNAFON ENTRA B 20 IIC","model":"ENTRA B20 IIC","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":4700,"swdCode":""},{"idProduct":"12910160","nfzCode":"P.01.01.00","tradeName":"BERNAFON ENTRA B 20 ITC","model":"ENTRA B20 ITC","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":4700,"swdCode":""},{"idProduct":"12910158","nfzCode":"P.01.01.00","tradeName":"BERNAFON ENTRA B 20 ITE FS","model":"ENTRA B20 ITE FS","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":4700,"swdCode":""},{"idProduct":"12910159","nfzCode":"P.01.01.00","tradeName":"BERNAFON ENTRA B 20 ITE HS","model":"ENTRA B20 ITE HS","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":4700,"swdCode":""},{"idProduct":"12910157","nfzCode":"P.01.01.00","tradeName":"BERNAFON ENTRA B 20 MNB T","model":"ENTRA B20 miniBTE T","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":4350,"swdCode":""},{"idProduct":"12910154","nfzCode":"P.01.01.00","tradeName":"BERNAFON ENTRA B 20 MNB T R","model":"ENTRA B20 miniBTE T R","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":4850,"swdCode":""},{"idProduct":"12910156","nfzCode":"P.01.01.00","tradeName":"BERNAFON ENTRA B 20 MNR T","model":"ENTRA B20 miniRITE T","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":4350,"swdCode":""},{"idProduct":"12910155","nfzCode":"P.01.01.00","tradeName":"BERNAFON ENTRA B 20 MNR T R","model":"ENTRA B20 miniRITE T R","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":4850,"swdCode":""},{"idProduct":"10554122","nfzCode":"P.01.01.00","tradeName":"BERNAFON LEOX 3 SP","model":"LEOX 3 Super Power","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":4100,"swdCode":""},{"idProduct":"10554123","nfzCode":"P.01.01.00","tradeName":"BERNAFON LEOX 3 UP","model":"LEOX 3 Ultra Power","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":4100,"swdCode":""},{"idProduct":"10554120","nfzCode":"P.01.01.00","tradeName":"BERNAFON LEOX 7 SP","model":"LEOX 7 Super Power","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":6100,"swdCode":""},{"idProduct":"10554121","nfzCode":"P.01.01.00","tradeName":"BERNAFON LEOX 7 UP","model":"LEOX 7 Ultra Power","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":6100,"swdCode":""},{"idProduct":"12924704","nfzCode":"P.01.01.00","tradeName":"Boost Ultra","model":"BBU986-DWHT","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":6100,"swdCode":""},{"idProduct":"12924705","nfzCode":"P.01.01.00","tradeName":"Boost Ultra","model":"BBU686-DWHT","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":4500,"swdCode":""},{"idProduct":"12924706","nfzCode":"P.01.01.00","tradeName":"Boost Ultra","model":"BBU1795-DWT","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":7900,"swdCode":""},{"idProduct":"12924707","nfzCode":"P.01.01.00","tradeName":"Boost Ultra","model":"BBU995-DWT","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":6100,"swdCode":""},{"idProduct":"12924703","nfzCode":"P.01.01.00","tradeName":"Boost Ultra","model":"BBU1786-DWHT","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":7900,"swdCode":""},{"idProduct":"12924708","nfzCode":"P.01.01.00","tradeName":"Boost Ultra","model":"BBU695-DWT","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":4500,"swdCode":""},{"idProduct":"10553543","nfzCode":"P.01.01.00","tradeName":"Boost Ultra 17 BBU1786-DWHT","model":"BBU1786-DWHT","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":6750,"swdCode":""},{"idProduct":"10553546","nfzCode":"P.01.01.00","tradeName":"Boost Ultra 17 BBU1795-DWT","model":"BBU1795-DWT","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":6750,"swdCode":""},{"idProduct":"10553545","nfzCode":"P.01.01.00","tradeName":"Boost Ultra 6 BBU686-DWHT","model":"BBU686-DWHT","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":3550,"swdCode":""},{"idProduct":"10553548","nfzCode":"P.01.01.00","tradeName":"Boost Ultra 6 BBU695-DWT","model":"BBU695-DWT","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":3550,"swdCode":""},{"idProduct":"10553544","nfzCode":"P.01.01.00","tradeName":"Boost Ultra 9 BBU986-DWHT","model":"BBU986-DWHT","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":4700,"swdCode":""},{"idProduct":"10553547","nfzCode":"P.01.01.00","tradeName":"Boost Ultra 9 BBU995-DWT","model":"BBU995-DWT","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":4700,"swdCode":""},{"idProduct":"13283991","nfzCode":"P.01.01.00","tradeName":"C_ITE INSIO C&G 1IX CIC","model":"INSIO C&G 1IX CIC","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":4300,"swdCode":""},{"idProduct":"13283990","nfzCode":"P.01.01.00","tradeName":"C_ITE INSIO C&G 2IX CIC","model":"INSIO C&G 2IX CIC","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":4800,"swdCode":""},{"idProduct":"12909850","nfzCode":"P.01.01.00","tradeName":"C_ITE Insio C&G 3IX CIC","model":"Insio C&G 3IX CIC","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":5500,"swdCode":""},{"idProduct":"12909849","nfzCode":"P.01.01.00","tradeName":"C_ITE Insio C&G 5IX CIC","model":"Insio C&G 5IX CIC","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":7700,"swdCode":""},{"idProduct":"12909848","nfzCode":"P.01.01.00","tradeName":"C_ITE Insio C&G 7IX CIC","model":"Insio C&G 7IX CIC","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":9500,"swdCode":""},{"idProduct":"12910240","nfzCode":"P.01.01.00","tradeName":"C_ITE ITC 8.12","model":"ITC 8.12","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":5900,"swdCode":""},{"idProduct":"12910239","nfzCode":"P.01.01.00","tradeName":"C_ITE ITC 8.16","model":"ITC 8.16","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":7100,"swdCode":""},{"idProduct":"12910243","nfzCode":"P.01.01.00","tradeName":"C_ITE ITC 8.4","model":"ITC 8.4","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":3500,"swdCode":""},{"idProduct":"12910242","nfzCode":"P.01.01.00","tradeName":"C_ITE ITC 8.6","model":"ITC 8.6","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":3700,"swdCode":""},{"idProduct":"12910241","nfzCode":"P.01.01.00","tradeName":"C_ITE ITC 8.8","model":"ITC 8.8","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":4900,"swdCode":""},{"idProduct":"12910245","nfzCode":"P.01.01.00","tradeName":"C_ITE ITE 8.12","model":"ITE 8.12","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":5900,"swdCode":""},{"idProduct":"12910244","nfzCode":"P.01.01.00","tradeName":"C_ITE ITE 8.16","model":"ITE 8.16","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":7100,"swdCode":""},{"idProduct":"12910248","nfzCode":"P.01.01.00","tradeName":"C_ITE ITE 8.4","model":"ITE 8.4","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":3500,"swdCode":""},{"idProduct":"12910247","nfzCode":"P.01.01.00","tradeName":"C_ITE ITE 8.6","model":"ITE 8.6","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":3700,"swdCode":""},{"idProduct":"12910246","nfzCode":"P.01.01.00","tradeName":"C_ITE ITE 8.8","model":"ITE 8.8","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":4900,"swdCode":""},{"idProduct":"12924649","nfzCode":"P.01.01.00","tradeName":"Commence","model":"COM264-DRW","manufacturer":"GN Hearing  A/S","orderIndex":"N","grossPrice":3200,"swdCode":""},{"idProduct":"12924650","nfzCode":"P.01.01.00","tradeName":"Commence","model":"COM263-DRW","manufacturer":"GN Hearing  A/S","orderIndex":"N","grossPrice":3200,"swdCode":""},{"idProduct":"12924648","nfzCode":"P.01.01.00","tradeName":"Commence","model":"COM363-DRW","manufacturer":"GN Hearing  A/S","orderIndex":"N","grossPrice":3700,"swdCode":""},{"idProduct":"12924647","nfzCode":"P.01.01.00","tradeName":"Commence","model":"COM364-DRW","manufacturer":"GN Hearing  A/S","orderIndex":"N","grossPrice":3700,"swdCode":""},{"idProduct":"12924645","nfzCode":"P.01.01.00","tradeName":"Commence","model":"COM463-DRW","manufacturer":"GN Hearing  A/S","orderIndex":"N","grossPrice":4200,"swdCode":""},{"idProduct":"12924644","nfzCode":"P.01.01.00","tradeName":"Commence","model":"COM464-DRW","manufacturer":"GN Hearing  A/S","orderIndex":"N","grossPrice":4200,"swdCode":""},{"idProduct":"12924643","nfzCode":"P.01.01.00","tradeName":"Commence","model":"COM462-DRWC","manufacturer":"GN Hearing  A/S","orderIndex":"N","grossPrice":266,"swdCode":""},{"idProduct":"12924646","nfzCode":"P.01.01.00","tradeName":"Commence","model":"COM362-DRWC","manufacturer":"GN Hearing  A/S","orderIndex":"N","grossPrice":3700,"swdCode":""},{"idProduct":"12924631","nfzCode":"P.01.01.00","tradeName":"Envision","model":"ENV1762S-DRWC","manufacturer":"GN Hearing  A/S","orderIndex":"N","grossPrice":9900,"swdCode":""},{"idProduct":"12924632","nfzCode":"P.01.01.00","tradeName":"Envision","model":"ENV1764-DRW","manufacturer":"GN Hearing  A/S","orderIndex":"N","grossPrice":9900,"swdCode":""},{"idProduct":"12924633","nfzCode":"P.01.01.00","tradeName":"Envision","model":"ENV1763-DRW","manufacturer":"GN Hearing  A/S","orderIndex":"N","grossPrice":9900,"swdCode":""},{"idProduct":"12924634","nfzCode":"P.01.01.00","tradeName":"Envision","model":"ENV962S-DRWC","manufacturer":"GN Hearing  A/S","orderIndex":"N","grossPrice":7800,"swdCode":""},{"idProduct":"12924635","nfzCode":"P.01.01.00","tradeName":"Envision","model":"ENV964-DRW","manufacturer":"GN Hearing  A/S","orderIndex":"N","grossPrice":7800,"swdCode":""},{"idProduct":"12924642","nfzCode":"P.01.01.00","tradeName":"Envision","model":"ENV463-DRW","manufacturer":"GN Hearing  A/S","orderIndex":"N","grossPrice":4900,"swdCode":""},{"idProduct":"12924637","nfzCode":"P.01.01.00","tradeName":"Envision","model":"ENV662S-DRWC","manufacturer":"GN Hearing  A/S","orderIndex":"N","grossPrice":5400,"swdCode":""},{"idProduct":"12924638","nfzCode":"P.01.01.00","tradeName":"Envision","model":"ENV664-DRW","manufacturer":"GN Hearing  A/S","orderIndex":"N","grossPrice":5400,"swdCode":""},{"idProduct":"12924639","nfzCode":"P.01.01.00","tradeName":"Envision","model":"ENV663-DRW","manufacturer":"GN Hearing  A/S","orderIndex":"N","grossPrice":5400,"swdCode":""},{"idProduct":"12924640","nfzCode":"P.01.01.00","tradeName":"Envision","model":"ENV462S-DRWC","manufacturer":"GN Hearing  A/S","orderIndex":"N","grossPrice":4900,"swdCode":""},{"idProduct":"12924641","nfzCode":"P.01.01.00","tradeName":"Envision","model":"ENV464-DRW","manufacturer":"GN Hearing  A/S","orderIndex":"N","grossPrice":4900,"swdCode":""},{"idProduct":"12924636","nfzCode":"P.01.01.00","tradeName":"Envision","model":"ENV963-DRW","manufacturer":"GN Hearing  A/S","orderIndex":"N","grossPrice":7800,"swdCode":""},{"idProduct":"12910231","nfzCode":"P.01.01.00","tradeName":"HA B M 7.12","model":"B M 7.12","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":6400,"swdCode":""},{"idProduct":"12910230","nfzCode":"P.01.01.00","tradeName":"HA B M 7.16","model":"B M 7.16","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":7200,"swdCode":""},{"idProduct":"12910232","nfzCode":"P.01.01.00","tradeName":"HA B M 7.8","model":"B M 7.8","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":4800,"swdCode":""},{"idProduct":"12910234","nfzCode":"P.01.01.00","tradeName":"HA B P BT 7.3","model":"B P BT 7.3","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":2900,"swdCode":""},{"idProduct":"12910235","nfzCode":"P.01.01.00","tradeName":"HA B SP BT 7.3","model":"B SP BT 7.3","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":2900,"swdCode":""},{"idProduct":"13283985","nfzCode":"P.01.01.00","tradeName":"HA MOTION C&G M 1IX","model":"MOTION C&G M 1IX","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":4200,"swdCode":""},{"idProduct":"13283984","nfzCode":"P.01.01.00","tradeName":"HA MOTION C&G M 2IX","model":"MOTION C&G M 2IX","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":4700,"swdCode":""},{"idProduct":"12909841","nfzCode":"P.01.01.00","tradeName":"HA Motion C&G M 3IX","model":"Motion C&G M 3IX","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":5500,"swdCode":""},{"idProduct":"12909840","nfzCode":"P.01.01.00","tradeName":"HA Motion C&G M 5IX","model":"Motion C&G M 5IX","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":8300,"swdCode":""},{"idProduct":"12909839","nfzCode":"P.01.01.00","tradeName":"HA Motion C&G M 7IX","model":"Motion C&G M 7IX","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":11000,"swdCode":""},{"idProduct":"13283987","nfzCode":"P.01.01.00","tradeName":"HA MOTION C&G P 1IX","model":"MOTION C&G P 1IX","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":4200,"swdCode":""},{"idProduct":"13283986","nfzCode":"P.01.01.00","tradeName":"HA MOTION C&G P 2IX","model":"MOTION C&G P 2IX","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":4700,"swdCode":""},{"idProduct":"12909844","nfzCode":"P.01.01.00","tradeName":"HA Motion C&G P 3IX","model":"Motion C&G P 3IX","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":5500,"swdCode":""},{"idProduct":"12909843","nfzCode":"P.01.01.00","tradeName":"HA Motion C&G P 5IX","model":"Motion C&G P 5IX","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":8300,"swdCode":""},{"idProduct":"12909842","nfzCode":"P.01.01.00","tradeName":"HA Motion C&G P 7IX","model":"Motion C&G P 7IX","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":11000,"swdCode":""},{"idProduct":"13283989","nfzCode":"P.01.01.00","tradeName":"HA MOTION C&G SP 1IX","model":"MOTION C&G SP 1IX","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":4200,"swdCode":""},{"idProduct":"13283988","nfzCode":"P.01.01.00","tradeName":"HA MOTION C&G SP 2IX","model":"MOTION C&G SP 2IX","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":4700,"swdCode":""},{"idProduct":"12909847","nfzCode":"P.01.01.00","tradeName":"HA Motion C&G SP 3IX","model":"Motion C&G SP 3IX","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":5500,"swdCode":""},{"idProduct":"12909846","nfzCode":"P.01.01.00","tradeName":"HA Motion C&G SP 5IX","model":"Motion C&G SP 5IX","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":8300,"swdCode":""},{"idProduct":"12909845","nfzCode":"P.01.01.00","tradeName":"HA Motion C&G SP 7IX","model":"Motion C&G SP 7IX","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":11000,"swdCode":""},{"idProduct":"12909838","nfzCode":"P.01.01.00","tradeName":"HA Pure C&G BCT 1IX","model":"Pure C&G BCT 1IX","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":4300,"swdCode":""},{"idProduct":"12909837","nfzCode":"P.01.01.00","tradeName":"HA Pure C&G BCT 2IX","model":"Pure C&G BCT 2IX","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":4800,"swdCode":""},{"idProduct":"12910237","nfzCode":"P.01.01.00","tradeName":"HA R Li T BC 8.12","model":"R Li T BC 8.12","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":7100,"swdCode":""},{"idProduct":"12910236","nfzCode":"P.01.01.00","tradeName":"HA R Li T BC 8.16","model":"R Li T BC 8.16","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":8800,"swdCode":""},{"idProduct":"12910238","nfzCode":"P.01.01.00","tradeName":"HA R Li T BC 8.8","model":"R Li T BC 8.8","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":6100,"swdCode":""},{"idProduct":"12910233","nfzCode":"P.01.01.00","tradeName":"HA R S BT 7.3","model":"R S BT 7.3","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":2800,"swdCode":""},{"idProduct":"12410204","nfzCode":"P.01.01.00","tradeName":"HearLink","model":"2030 MNR T","manufacturer":"SBO","orderIndex":"N","grossPrice":3600,"swdCode":""},{"idProduct":"11652404","nfzCode":"P.01.01.00","tradeName":"HearLink","model":"2030 ITE FS","manufacturer":"SBO","orderIndex":"N","grossPrice":3900,"swdCode":""},{"idProduct":"12410208","nfzCode":"P.01.01.00","tradeName":"HearLink","model":"2030 MNB T","manufacturer":"SBO","orderIndex":"N","grossPrice":3500,"swdCode":""},{"idProduct":"12410210","nfzCode":"P.01.01.00","tradeName":"HearLink","model":"2030 MNB T R","manufacturer":"SBO","orderIndex":"N","grossPrice":3950,"swdCode":""},{"idProduct":"10553053","nfzCode":"P.01.01.00","tradeName":"HearLink","model":"9040 MNR T","manufacturer":"SBO","orderIndex":"N","grossPrice":10100,"swdCode":""},{"idProduct":"10553054","nfzCode":"P.01.01.00","tradeName":"HearLink","model":"9040 MNB T","manufacturer":"SBO","orderIndex":"N","grossPrice":10100,"swdCode":""},{"idProduct":"10553055","nfzCode":"P.01.01.00","tradeName":"HearLink","model":"9040 MNR T R","manufacturer":"SBO","orderIndex":"N","grossPrice":10800,"swdCode":""},{"idProduct":"10553059","nfzCode":"P.01.01.00","tradeName":"HearLink","model":"7040 MNR T R","manufacturer":"SBO","orderIndex":"N","grossPrice":8700,"swdCode":""},{"idProduct":"10553065","nfzCode":"P.01.01.00","tradeName":"HearLink","model":"9030 IIC","manufacturer":"SBO","orderIndex":"N","grossPrice":10100,"swdCode":""},{"idProduct":"10553066","nfzCode":"P.01.01.00","tradeName":"HearLink","model":"9030 CIC","manufacturer":"SBO","orderIndex":"N","grossPrice":10100,"swdCode":""},{"idProduct":"10553067","nfzCode":"P.01.01.00","tradeName":"HearLink","model":"9030 ITC","manufacturer":"SBO","orderIndex":"N","grossPrice":10100,"swdCode":""},{"idProduct":"10553068","nfzCode":"P.01.01.00","tradeName":"HearLink","model":"9030 ITE HS","manufacturer":"SBO","orderIndex":"N","grossPrice":10100,"swdCode":""},{"idProduct":"10553069","nfzCode":"P.01.01.00","tradeName":"HearLink","model":"9030 ITE FS","manufacturer":"SBO","orderIndex":"N","grossPrice":10100,"swdCode":""},{"idProduct":"11652325","nfzCode":"P.01.01.00","tradeName":"HearLink","model":"9050 MNR","manufacturer":"SBO","orderIndex":"N","grossPrice":12800,"swdCode":""},{"idProduct":"11652327","nfzCode":"P.01.01.00","tradeName":"HearLink","model":"7050 MNR","manufacturer":"SBO","orderIndex":"N","grossPrice":8700,"swdCode":""},{"idProduct":"11652329","nfzCode":"P.01.01.00","tradeName":"HearLink","model":"5050 MNR","manufacturer":"SBO","orderIndex":"N","grossPrice":7300,"swdCode":""},{"idProduct":"11652331","nfzCode":"P.01.01.00","tradeName":"HearLink","model":"3050 MNR","manufacturer":"SBO","orderIndex":"N","grossPrice":5900,"swdCode":""},{"idProduct":"11652333","nfzCode":"P.01.01.00","tradeName":"HearLink","model":"9040 MNR T","manufacturer":"SBO","orderIndex":"N","grossPrice":12000,"swdCode":""},{"idProduct":"11652335","nfzCode":"P.01.01.00","tradeName":"HearLink","model":"9040 MNB T","manufacturer":"SBO","orderIndex":"N","grossPrice":12000,"swdCode":""},{"idProduct":"11652337","nfzCode":"P.01.01.00","tradeName":"HearLink","model":"9040 MNR T R","manufacturer":"SBO","orderIndex":"N","grossPrice":12000,"swdCode":""},{"idProduct":"11652339","nfzCode":"P.01.01.00","tradeName":"HearLink","model":"9040 MNB T R","manufacturer":"SBO","orderIndex":"N","grossPrice":12000,"swdCode":""},{"idProduct":"11652341","nfzCode":"P.01.01.00","tradeName":"HearLink","model":"7040 MNR T","manufacturer":"SBO","orderIndex":"N","grossPrice":8500,"swdCode":""},{"idProduct":"11652343","nfzCode":"P.01.01.00","tradeName":"HearLink","model":"7040 MNB T","manufacturer":"SBO","orderIndex":"N","grossPrice":8500,"swdCode":""},{"idProduct":"11652345","nfzCode":"P.01.01.00","tradeName":"HearLink","model":"7040 MNR T R","manufacturer":"SBO","orderIndex":"N","grossPrice":8500,"swdCode":""},{"idProduct":"11652347","nfzCode":"P.01.01.00","tradeName":"HearLink","model":"7040 MNB T R","manufacturer":"SBO","orderIndex":"N","grossPrice":8500,"swdCode":""},{"idProduct":"11652351","nfzCode":"P.01.01.00","tradeName":"HearLink","model":"5040 MNB T","manufacturer":"SBO","orderIndex":"N","grossPrice":7100,"swdCode":""},{"idProduct":"11652353","nfzCode":"P.01.01.00","tradeName":"HearLink","model":"5040 MNR T R","manufacturer":"SBO","orderIndex":"N","grossPrice":7100,"swdCode":""},{"idProduct":"11652355","nfzCode":"P.01.01.00","tradeName":"HearLink","model":"5040 MNB T R","manufacturer":"SBO","orderIndex":"N","grossPrice":7100,"swdCode":""},{"idProduct":"11652357","nfzCode":"P.01.01.00","tradeName":"HearLink","model":"9030 IIC","manufacturer":"SBO","orderIndex":"N","grossPrice":9500,"swdCode":""},{"idProduct":"11652359","nfzCode":"P.01.01.00","tradeName":"HearLink","model":"9030 CIC","manufacturer":"SBO","orderIndex":"N","grossPrice":9500,"swdCode":""},{"idProduct":"11652361","nfzCode":"P.01.01.00","tradeName":"HearLink","model":"9030 ITC","manufacturer":"SBO","orderIndex":"N","grossPrice":9500,"swdCode":""},{"idProduct":"11652363","nfzCode":"P.01.01.00","tradeName":"HearLink","model":"9030 ITE HS","manufacturer":"SBO","orderIndex":"N","grossPrice":9500,"swdCode":""},{"idProduct":"11652365","nfzCode":"P.01.01.00","tradeName":"HearLink","model":"9030 ITE FS","manufacturer":"SBO","orderIndex":"N","grossPrice":9500,"swdCode":""},{"idProduct":"11652366","nfzCode":"P.01.01.00","tradeName":"HearLink","model":"7030 IIC","manufacturer":"SBO","orderIndex":"N","grossPrice":7300,"swdCode":""},{"idProduct":"11652368","nfzCode":"P.01.01.00","tradeName":"HearLink","model":"7030 CIC","manufacturer":"SBO","orderIndex":"N","grossPrice":7300,"swdCode":""},{"idProduct":"11652370","nfzCode":"P.01.01.00","tradeName":"HearLink","model":"7030 ITC","manufacturer":"SBO","orderIndex":"N","grossPrice":7300,"swdCode":""},{"idProduct":"11652372","nfzCode":"P.01.01.00","tradeName":"HearLink","model":"7030 ITE HS","manufacturer":"SBO","orderIndex":"N","grossPrice":7300,"swdCode":""},{"idProduct":"11652374","nfzCode":"P.01.01.00","tradeName":"HearLink","model":"7030 ITE FS","manufacturer":"SBO","orderIndex":"N","grossPrice":7300,"swdCode":""},{"idProduct":"11652376","nfzCode":"P.01.01.00","tradeName":"HearLink","model":"5030 IIC","manufacturer":"SBO","orderIndex":"N","grossPrice":5700,"swdCode":""},{"idProduct":"11652378","nfzCode":"P.01.01.00","tradeName":"HearLink","model":"5030 CIC","manufacturer":"SBO","orderIndex":"N","grossPrice":5700,"swdCode":""},{"idProduct":"11652380","nfzCode":"P.01.01.00","tradeName":"HearLink","model":"5030 ITC","manufacturer":"SBO","orderIndex":"N","grossPrice":5700,"swdCode":""},{"idProduct":"11652382","nfzCode":"P.01.01.00","tradeName":"HearLink","model":"5030 ITE HS","manufacturer":"SBO","orderIndex":"N","grossPrice":5700,"swdCode":""},{"idProduct":"11652384","nfzCode":"P.01.01.00","tradeName":"HearLink","model":"5030 ITE FS","manufacturer":"SBO","orderIndex":"N","grossPrice":5700,"swdCode":""},{"idProduct":"11652386","nfzCode":"P.01.01.00","tradeName":"HearLink","model":"3030 IIC","manufacturer":"SBO","orderIndex":"N","grossPrice":4700,"swdCode":""},{"idProduct":"11652388","nfzCode":"P.01.01.00","tradeName":"HearLink","model":"3030 CIC","manufacturer":"SBO","orderIndex":"N","grossPrice":4700,"swdCode":""},{"idProduct":"11652390","nfzCode":"P.01.01.00","tradeName":"HearLink","model":"3030 ITC","manufacturer":"SBO","orderIndex":"N","grossPrice":4700,"swdCode":""},{"idProduct":"11652392","nfzCode":"P.01.01.00","tradeName":"HearLink","model":"3030 ITE HS","manufacturer":"SBO","orderIndex":"N","grossPrice":4700,"swdCode":""},{"idProduct":"11652394","nfzCode":"P.01.01.00","tradeName":"HearLink","model":"3030 ITE FS","manufacturer":"SBO","orderIndex":"N","grossPrice":4700,"swdCode":""},{"idProduct":"11652396","nfzCode":"P.01.01.00","tradeName":"HearLink","model":"2030 IIC","manufacturer":"SBO","orderIndex":"N","grossPrice":3900,"swdCode":""},{"idProduct":"11652398","nfzCode":"P.01.01.00","tradeName":"HearLink","model":"2030 CIC","manufacturer":"SBO","orderIndex":"N","grossPrice":3900,"swdCode":""},{"idProduct":"11652400","nfzCode":"P.01.01.00","tradeName":"HearLink","model":"2030 ITC","manufacturer":"SBO","orderIndex":"N","grossPrice":3900,"swdCode":""},{"idProduct":"11652402","nfzCode":"P.01.01.00","tradeName":"HearLink","model":"2030 ITE HS","manufacturer":"SBO","orderIndex":"N","grossPrice":3900,"swdCode":""},{"idProduct":"12410206","nfzCode":"P.01.01.00","tradeName":"HearLink","model":"2030 MNR T R","manufacturer":"SBO","orderIndex":"N","grossPrice":3950,"swdCode":""},{"idProduct":"12410198","nfzCode":"P.01.01.00","tradeName":"HearLink 30","model":"HearLink 1530 ITC","manufacturer":"SBO","orderIndex":"N","grossPrice":3200,"swdCode":""},{"idProduct":"12410200","nfzCode":"P.01.01.00","tradeName":"HearLink 30","model":"HearLink 1530 ITE HS","manufacturer":"SBO","orderIndex":"N","grossPrice":3200,"swdCode":""},{"idProduct":"12410202","nfzCode":"P.01.01.00","tradeName":"HearLink 30","model":"HearLink 1530 ITE FS","manufacturer":"SBO","orderIndex":"N","grossPrice":3200,"swdCode":""},{"idProduct":"12410168","nfzCode":"P.01.01.00","tradeName":"HearLink 30","model":"HearLink 1730 MNR T","manufacturer":"SBO","orderIndex":"N","grossPrice":3600,"swdCode":""},{"idProduct":"12410170","nfzCode":"P.01.01.00","tradeName":"HearLink 30","model":"HearLink 1730 MNR T R","manufacturer":"SBO","orderIndex":"N","grossPrice":3950,"swdCode":""},{"idProduct":"12410172","nfzCode":"P.01.01.00","tradeName":"HearLink 30","model":"HearLink 1730 MNB T","manufacturer":"SBO","orderIndex":"N","grossPrice":3500,"swdCode":""},{"idProduct":"12410174","nfzCode":"P.01.01.00","tradeName":"HearLink 30","model":"HearLink 1730 MNB T R","manufacturer":"SBO","orderIndex":"N","grossPrice":3950,"swdCode":""},{"idProduct":"12410176","nfzCode":"P.01.01.00","tradeName":"HearLink 30","model":"HearLink 1530 MNR T","manufacturer":"SBO","orderIndex":"N","grossPrice":3300,"swdCode":""},{"idProduct":"12410178","nfzCode":"P.01.01.00","tradeName":"HearLink 30","model":"HearLink 1530 MNR T R","manufacturer":"SBO","orderIndex":"N","grossPrice":3650,"swdCode":""},{"idProduct":"12410180","nfzCode":"P.01.01.00","tradeName":"HearLink 30","model":"HearLink 1530 MNB T","manufacturer":"SBO","orderIndex":"N","grossPrice":3200,"swdCode":""},{"idProduct":"12410182","nfzCode":"P.01.01.00","tradeName":"HearLink 30","model":"HearLink 1530 MNB T R","manufacturer":"SBO","orderIndex":"N","grossPrice":3650,"swdCode":""},{"idProduct":"12410184","nfzCode":"P.01.01.00","tradeName":"HearLink 30","model":"HearLink 1730 CIC","manufacturer":"SBO","orderIndex":"N","grossPrice":3600,"swdCode":""},{"idProduct":"12410186","nfzCode":"P.01.01.00","tradeName":"HearLink 30","model":"HearLink 1730 IIC","manufacturer":"SBO","orderIndex":"N","grossPrice":3600,"swdCode":""},{"idProduct":"12410188","nfzCode":"P.01.01.00","tradeName":"HearLink 30","model":"HearLink 1730 ITC","manufacturer":"SBO","orderIndex":"N","grossPrice":3600,"swdCode":""},{"idProduct":"12410190","nfzCode":"P.01.01.00","tradeName":"HearLink 30","model":"HearLink 1730 ITE HS","manufacturer":"SBO","orderIndex":"N","grossPrice":3600,"swdCode":""},{"idProduct":"12410192","nfzCode":"P.01.01.00","tradeName":"HearLink 30","model":"HearLink 1730 ITE FS","manufacturer":"SBO","orderIndex":"N","grossPrice":3600,"swdCode":""},{"idProduct":"12410194","nfzCode":"P.01.01.00","tradeName":"HearLink 30","model":"HearLink 1530 CIC","manufacturer":"SBO","orderIndex":"N","grossPrice":3200,"swdCode":""},{"idProduct":"12410196","nfzCode":"P.01.01.00","tradeName":"HearLink 30","model":"HearLink 1530 IIC","manufacturer":"SBO","orderIndex":"N","grossPrice":3200,"swdCode":""},{"idProduct":"10553450","nfzCode":"P.01.01.00","tradeName":"Imagine 17 IMG1763-DRW","model":"IMG1763-DRW","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":8300,"swdCode":""},{"idProduct":"10553451","nfzCode":"P.01.01.00","tradeName":"Imagine 17 IMG1763-DRWC","model":"IMG1763-DRWC","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":8700,"swdCode":""},{"idProduct":"10553452","nfzCode":"P.01.01.00","tradeName":"Imagine 17 IMG1764-DRW","model":"IMG1764-DRW","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":8400,"swdCode":""},{"idProduct":"10553551","nfzCode":"P.01.01.00","tradeName":"Imagine 17 IMG1776-DWC","model":"IMG1776-DWC","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":8400,"swdCode":""},{"idProduct":"10553455","nfzCode":"P.01.01.00","tradeName":"Imagine 17 IMG1776-DWC","model":"IMG1776-DWC","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":8500,"swdCode":""},{"idProduct":"10553454","nfzCode":"P.01.01.00","tradeName":"Imagine 17 IMG1786-DWC","model":"IMG1786-DWC","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":8500,"swdCode":""},{"idProduct":"10553550","nfzCode":"P.01.01.00","tradeName":"Imagine 17 IMG1786-DWC","model":"IMG1786-DWC","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":8700,"swdCode":""},{"idProduct":"10553549","nfzCode":"P.01.01.00","tradeName":"Imagine 17 IMG1786-DWHC","model":"IMG1786-DWHC","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":8300,"swdCode":""},{"idProduct":"10553453","nfzCode":"P.01.01.00","tradeName":"Imagine 17 IMG1786-DWHC","model":"IMG1786-DWHC","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":8500,"swdCode":""},{"idProduct":"10553459","nfzCode":"P.01.01.00","tradeName":"Imagine 17 IMG17CIC-HP","model":"IMG17CIC-HP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":8500,"swdCode":""},{"idProduct":"10553461","nfzCode":"P.01.01.00","tradeName":"Imagine 17 IMG17CIC-LP","model":"IMG17CIC-LP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":8500,"swdCode":""},{"idProduct":"10553460","nfzCode":"P.01.01.00","tradeName":"Imagine 17 IMG17CIC-MP","model":"IMG17CIC-MP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":8500,"swdCode":""},{"idProduct":"10553554","nfzCode":"P.01.01.00","tradeName":"Imagine 17 IMG17ITC-DWC-HP","model":"IMG17ITC-DWC-HP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":8500,"swdCode":""},{"idProduct":"10553552","nfzCode":"P.01.01.00","tradeName":"Imagine 17 IMG17ITC-DWC-LP","model":"IMG17ITC-DWC-LP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":8500,"swdCode":""},{"idProduct":"10553553","nfzCode":"P.01.01.00","tradeName":"Imagine 17 IMG17ITC-DWC-MP","model":"IMG17ITC-DWC-MP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":8500,"swdCode":""},{"idProduct":"10553555","nfzCode":"P.01.01.00","tradeName":"Imagine 17 IMG17ITC-DWC-UP","model":"IMG17ITC-DWC-UP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":8500,"swdCode":""},{"idProduct":"10553457","nfzCode":"P.01.01.00","tradeName":"Imagine 17 IMG17ITE-DWC-HP","model":"IMG17ITE-DWC-HP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":8500,"swdCode":""},{"idProduct":"10553458","nfzCode":"P.01.01.00","tradeName":"Imagine 17 IMG17ITE-DWC-MP","model":"IMG17ITE-DWC-MP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":8500,"swdCode":""},{"idProduct":"10553456","nfzCode":"P.01.01.00","tradeName":"Imagine 17 IMG17ITE-DWC-UP","model":"IMG17ITE-DWC-UP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":8500,"swdCode":""},{"idProduct":"10553486","nfzCode":"P.01.01.00","tradeName":"Imagine 4 IMG463-DRW","model":"IMG463-DRW","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":3500,"swdCode":""},{"idProduct":"10553487","nfzCode":"P.01.01.00","tradeName":"Imagine 4 IMG463-DRWC","model":"IMG463-DRWC","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":3500,"swdCode":""},{"idProduct":"10553488","nfzCode":"P.01.01.00","tradeName":"Imagine 4 IMG464-DRW","model":"IMG464-DRW","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":3500,"swdCode":""},{"idProduct":"10553491","nfzCode":"P.01.01.00","tradeName":"Imagine 4 IMG476-DWC","model":"IMG476-DWC","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":3500,"swdCode":""},{"idProduct":"10553490","nfzCode":"P.01.01.00","tradeName":"Imagine 4 IMG486-DWC","model":"IMG486-DWC","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":3500,"swdCode":""},{"idProduct":"10553489","nfzCode":"P.01.01.00","tradeName":"Imagine 4 IMG486-DWHC","model":"IMG486-DWHC","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":3500,"swdCode":""},{"idProduct":"10553495","nfzCode":"P.01.01.00","tradeName":"Imagine 4 IMG4CIC-HP","model":"IMG4CIC-HP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":3500,"swdCode":""},{"idProduct":"10553497","nfzCode":"P.01.01.00","tradeName":"Imagine 4 IMG4CIC-LP","model":"IMG4CIC-LP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":3500,"swdCode":""},{"idProduct":"10553496","nfzCode":"P.01.01.00","tradeName":"Imagine 4 IMG4CIC-MP","model":"IMG4CIC-MP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":3500,"swdCode":""},{"idProduct":"10553566","nfzCode":"P.01.01.00","tradeName":"Imagine 4 IMG4ITC-DWC-HP","model":"IMG4ITC-DWC-HP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":3500,"swdCode":""},{"idProduct":"10553564","nfzCode":"P.01.01.00","tradeName":"Imagine 4 IMG4ITC-DWC-LP","model":"IMG4ITC-DWC-LP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":3500,"swdCode":""},{"idProduct":"10553565","nfzCode":"P.01.01.00","tradeName":"Imagine 4 IMG4ITC-DWC-MP","model":"IMG4ITC-DWC-MP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":3500,"swdCode":""},{"idProduct":"10553567","nfzCode":"P.01.01.00","tradeName":"Imagine 4 IMG4ITC-DWC-UP","model":"IMG4ITC-DWC-UP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":3500,"swdCode":""},{"idProduct":"10553493","nfzCode":"P.01.01.00","tradeName":"Imagine 4 IMG4ITE-DWC-HP","model":"IMG4ITE-DWC-HP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":3500,"swdCode":""},{"idProduct":"10553494","nfzCode":"P.01.01.00","tradeName":"Imagine 4 IMG4ITE-DWC-MP","model":"IMG4ITE-DWC-MP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":3500,"swdCode":""},{"idProduct":"10553492","nfzCode":"P.01.01.00","tradeName":"Imagine 4 IMG4ITE-DWC-UP","model":"IMG4ITE-DWC-UP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":3500,"swdCode":""},{"idProduct":"10553474","nfzCode":"P.01.01.00","tradeName":"Imagine 6 IMG663-DRW","model":"IMG663-DRW","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":4300,"swdCode":""},{"idProduct":"10553475","nfzCode":"P.01.01.00","tradeName":"Imagine 6 IMG663-DRWC","model":"IMG663-DRWC","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":4700,"swdCode":""},{"idProduct":"10553476","nfzCode":"P.01.01.00","tradeName":"Imagine 6 IMG664-DRW","model":"IMG664-DRW","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":4400,"swdCode":""},{"idProduct":"10553479","nfzCode":"P.01.01.00","tradeName":"Imagine 6 IMG676-DWC","model":"IMG676-DWC","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":4500,"swdCode":""},{"idProduct":"10553478","nfzCode":"P.01.01.00","tradeName":"Imagine 6 IMG686-DWC","model":"IMG686-DWC","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":4500,"swdCode":""},{"idProduct":"10553477","nfzCode":"P.01.01.00","tradeName":"Imagine 6 IMG686-DWHC","model":"IMG686-DWHC","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":4500,"swdCode":""},{"idProduct":"10553483","nfzCode":"P.01.01.00","tradeName":"Imagine 6 IMG6CIC-HP","model":"IMG6CIC-HP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":4500,"swdCode":""},{"idProduct":"10553485","nfzCode":"P.01.01.00","tradeName":"Imagine 6 IMG6CIC-LP","model":"IMG6CIC-LP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":4500,"swdCode":""},{"idProduct":"10553484","nfzCode":"P.01.01.00","tradeName":"Imagine 6 IMG6CIC-MP","model":"IMG6CIC-MP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":4500,"swdCode":""},{"idProduct":"10553562","nfzCode":"P.01.01.00","tradeName":"Imagine 6 IMG6ITC-DWC-HP","model":"IMG6ITC-DWC-HP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":4500,"swdCode":""},{"idProduct":"10553560","nfzCode":"P.01.01.00","tradeName":"Imagine 6 IMG6ITC-DWC-LP","model":"IMG6ITC-DWC-LP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":4500,"swdCode":""},{"idProduct":"10553561","nfzCode":"P.01.01.00","tradeName":"Imagine 6 IMG6ITC-DWC-MP","model":"IMG6ITC-DWC-MP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":4500,"swdCode":""},{"idProduct":"10553563","nfzCode":"P.01.01.00","tradeName":"Imagine 6 IMG6ITC-DWC-UP","model":"IMG6ITC-DWC-UP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":4500,"swdCode":""},{"idProduct":"10553481","nfzCode":"P.01.01.00","tradeName":"Imagine 6 IMG6ITE-DWC-HP","model":"IMG6ITE-DWC-HP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":4500,"swdCode":""},{"idProduct":"10553482","nfzCode":"P.01.01.00","tradeName":"Imagine 6 IMG6ITE-DWC-MP","model":"IMG6ITE-DWC-MP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":4500,"swdCode":""},{"idProduct":"10553480","nfzCode":"P.01.01.00","tradeName":"Imagine 6 IMG6ITE-DWC-UP","model":"IMG6ITE-DWC-UP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":4500,"swdCode":""},{"idProduct":"10553462","nfzCode":"P.01.01.00","tradeName":"Imagine 9 IMG963-DRW","model":"IMG963-DRW","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":6300,"swdCode":""},{"idProduct":"10553463","nfzCode":"P.01.01.00","tradeName":"Imagine 9 IMG963-DRWC","model":"IMG963-DRWC","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":6700,"swdCode":""},{"idProduct":"10553464","nfzCode":"P.01.01.00","tradeName":"Imagine 9 IMG964-DRW","model":"IMG964-DRW","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":6400,"swdCode":""},{"idProduct":"10553467","nfzCode":"P.01.01.00","tradeName":"Imagine 9 IMG976-DWC","model":"IMG976-DWC","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":6500,"swdCode":""},{"idProduct":"10553466","nfzCode":"P.01.01.00","tradeName":"Imagine 9 IMG986-DWC","model":"IMG986-DWC","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":6500,"swdCode":""},{"idProduct":"10553465","nfzCode":"P.01.01.00","tradeName":"Imagine 9 IMG986-DWHC","model":"IMG986-DWHC","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":6500,"swdCode":""},{"idProduct":"10553471","nfzCode":"P.01.01.00","tradeName":"Imagine 9 IMG9CIC-HP","model":"IMG9CIC-HP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":6500,"swdCode":""},{"idProduct":"10553473","nfzCode":"P.01.01.00","tradeName":"Imagine 9 IMG9CIC-LP","model":"IMG9CIC-LP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":6500,"swdCode":""},{"idProduct":"10553472","nfzCode":"P.01.01.00","tradeName":"Imagine 9 IMG9CIC-MP","model":"IMG9CIC-MP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":6500,"swdCode":""},{"idProduct":"10553558","nfzCode":"P.01.01.00","tradeName":"Imagine 9 IMG9ITC-DWC-HP","model":"IMG9ITC-DWC-HP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":6500,"swdCode":""},{"idProduct":"10553556","nfzCode":"P.01.01.00","tradeName":"Imagine 9 IMG9ITC-DWC-LP","model":"IMG9ITC-DWC-LP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":6500,"swdCode":""},{"idProduct":"10553557","nfzCode":"P.01.01.00","tradeName":"Imagine 9 IMG9ITC-DWC-MP","model":"IMG9ITC-DWC-MP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":6500,"swdCode":""},{"idProduct":"10553559","nfzCode":"P.01.01.00","tradeName":"Imagine 9 IMG9ITC-DWC-UP","model":"IMG9ITC-DWC-UP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":6500,"swdCode":""},{"idProduct":"10553469","nfzCode":"P.01.01.00","tradeName":"Imagine 9 IMG9ITE-DWC-HP","model":"IMG9ITE-DWC-HP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":6500,"swdCode":""},{"idProduct":"10553470","nfzCode":"P.01.01.00","tradeName":"Imagine 9 IMG9ITE-DWC-MP","model":"IMG9ITE-DWC-MP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":6500,"swdCode":""},{"idProduct":"10553468","nfzCode":"P.01.01.00","tradeName":"Imagine 9 IMG9ITE-DWC-UP","model":"IMG9ITE-DWC-UP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":6500,"swdCode":""},{"idProduct":"12910176","nfzCode":"P.01.01.00","tradeName":"MAICO INEO A 1 B 105","model":"INEO A 1 B 105","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":2100,"swdCode":""},{"idProduct":"12910178","nfzCode":"P.01.01.00","tradeName":"MAICO INEO A 1 MNR","model":"INEO A 1 MNR","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":2100,"swdCode":""},{"idProduct":"12910180","nfzCode":"P.01.01.00","tradeName":"MAICO INEO A 1 MNR T","model":"INEO A 1 MNR T","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":2100,"swdCode":""},{"idProduct":"12910177","nfzCode":"P.01.01.00","tradeName":"MAICO INEO A 2 B 105","model":"INEO A 2 B 105","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":2100,"swdCode":""},{"idProduct":"12910179","nfzCode":"P.01.01.00","tradeName":"MAICO INEO A 2 MNR","model":"INEO A 2 MNR","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":2100,"swdCode":""},{"idProduct":"12910181","nfzCode":"P.01.01.00","tradeName":"MAICO INEO A 2 MNR T","model":"INEO A 2 MNR T","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":2100,"swdCode":""},{"idProduct":"11652738","nfzCode":"P.01.01.00","tradeName":"More 3","model":"More 3 miniRITE T","manufacturer":"SBO","orderIndex":"N","grossPrice":7350,"swdCode":""},{"idProduct":"11652737","nfzCode":"P.01.01.00","tradeName":"More 3","model":"More 3 miniRITE R","manufacturer":"SBO","orderIndex":"N","grossPrice":8000,"swdCode":""},{"idProduct":"11856341","nfzCode":"P.01.01.00","tradeName":"Oticon Intent 1","model":"Oticon Intent 1 miniRITE","manufacturer":"SBO","orderIndex":"N","grossPrice":11500,"swdCode":""},{"idProduct":"12910054","nfzCode":"P.01.01.00","tradeName":"Oticon Intent 1 miniBTE R","model":"Oticon Intent 1 miniBTE R","manufacturer":"SBO","orderIndex":"N","grossPrice":11500,"swdCode":""},{"idProduct":"11856342","nfzCode":"P.01.01.00","tradeName":"Oticon Intent 2","model":"Oticon Intent 2 miniRITE","manufacturer":"SBO","orderIndex":"N","grossPrice":9300,"swdCode":""},{"idProduct":"12910055","nfzCode":"P.01.01.00","tradeName":"Oticon Intent 2 miniBTE R","model":"Oticon Intent 2 miniBTE R","manufacturer":"SBO","orderIndex":"N","grossPrice":9300,"swdCode":""},{"idProduct":"11856343","nfzCode":"P.01.01.00","tradeName":"Oticon Intent 3","model":"Oticon Intent 3 miniRITE","manufacturer":"SBO","orderIndex":"N","grossPrice":7800,"swdCode":""},{"idProduct":"12910056","nfzCode":"P.01.01.00","tradeName":"Oticon Intent 3 miniBTE R","model":"Oticon Intent 3 miniBTE R","manufacturer":"SBO","orderIndex":"N","grossPrice":7800,"swdCode":""},{"idProduct":"11856344","nfzCode":"P.01.01.00","tradeName":"Oticon Intent 4","model":"Oticon Intent 4 miniRITE","manufacturer":"SBO","orderIndex":"N","grossPrice":6400,"swdCode":""},{"idProduct":"12910057","nfzCode":"P.01.01.00","tradeName":"Oticon Intent 4 miniBTE R","model":"Oticon Intent 4 miniBTE R","manufacturer":"SBO","orderIndex":"N","grossPrice":6400,"swdCode":""},{"idProduct":"10553209","nfzCode":"P.01.01.00","tradeName":"Oticon Jet 1","model":"Oticon Jet 1 BTE 13","manufacturer":"SBO","orderIndex":"N","grossPrice":4000,"swdCode":""},{"idProduct":"11652810","nfzCode":"P.01.01.00","tradeName":"Oticon Jet 1","model":"Oticon Jet 1 ITC","manufacturer":"SBO","orderIndex":"N","grossPrice":4400,"swdCode":""},{"idProduct":"10553207","nfzCode":"P.01.01.00","tradeName":"Oticon Jet 1","model":"Oticon Jet 1 miniRITE","manufacturer":"SBO","orderIndex":"N","grossPrice":4150,"swdCode":""},{"idProduct":"10553206","nfzCode":"P.01.01.00","tradeName":"Oticon Jet 1","model":"Oticon Jet 1 ITE","manufacturer":"SBO","orderIndex":"N","grossPrice":4250,"swdCode":""},{"idProduct":"10553205","nfzCode":"P.01.01.00","tradeName":"Oticon Jet 1","model":"Oticon Jet 1 ITC","manufacturer":"SBO","orderIndex":"N","grossPrice":4250,"swdCode":""},{"idProduct":"10553204","nfzCode":"P.01.01.00","tradeName":"Oticon Jet 1","model":"Oticon Jet 1 IIC","manufacturer":"SBO","orderIndex":"N","grossPrice":4400,"swdCode":""},{"idProduct":"10553203","nfzCode":"P.01.01.00","tradeName":"Oticon Jet 1","model":"Oticon Jet 1 CIC","manufacturer":"SBO","orderIndex":"N","grossPrice":4400,"swdCode":""},{"idProduct":"10553202","nfzCode":"P.01.01.00","tradeName":"Oticon Jet 1","model":"Oticon Jet 1 BTE 13 PP","manufacturer":"SBO","orderIndex":"N","grossPrice":4150,"swdCode":""},{"idProduct":"11652814","nfzCode":"P.01.01.00","tradeName":"Oticon Jet 1","model":"Oticon Jet 1 BTE 13","manufacturer":"SBO","orderIndex":"N","grossPrice":4150,"swdCode":""},{"idProduct":"11652813","nfzCode":"P.01.01.00","tradeName":"Oticon Jet 1","model":"Oticon Jet 1 miniRITE-T","manufacturer":"SBO","orderIndex":"N","grossPrice":4300,"swdCode":""},{"idProduct":"11652812","nfzCode":"P.01.01.00","tradeName":"Oticon Jet 1","model":"Oticon Jet 1 miniRITE","manufacturer":"SBO","orderIndex":"N","grossPrice":4300,"swdCode":""},{"idProduct":"11652811","nfzCode":"P.01.01.00","tradeName":"Oticon Jet 1","model":"Oticon Jet 1 ITE","manufacturer":"SBO","orderIndex":"N","grossPrice":4400,"swdCode":""},{"idProduct":"11652807","nfzCode":"P.01.01.00","tradeName":"Oticon Jet 1","model":"Oticon Jet 1 BTE 13 PP","manufacturer":"SBO","orderIndex":"N","grossPrice":4300,"swdCode":""},{"idProduct":"11652808","nfzCode":"P.01.01.00","tradeName":"Oticon Jet 1","model":"Oticon Jet 1 CIC","manufacturer":"SBO","orderIndex":"N","grossPrice":4550,"swdCode":""},{"idProduct":"11652809","nfzCode":"P.01.01.00","tradeName":"Oticon Jet 1","model":"Oticon Jet 1 IIC","manufacturer":"SBO","orderIndex":"N","grossPrice":4550,"swdCode":""},{"idProduct":"10553208","nfzCode":"P.01.01.00","tradeName":"Oticon Jet 1","model":"Oticon Jet 1 miniRITE-T","manufacturer":"SBO","orderIndex":"N","grossPrice":4150,"swdCode":""},{"idProduct":"11652816","nfzCode":"P.01.01.00","tradeName":"Oticon Jet 2","model":"Oticon Jet 2 CIC","manufacturer":"SBO","orderIndex":"N","grossPrice":3700,"swdCode":""},{"idProduct":"10553217","nfzCode":"P.01.01.00","tradeName":"Oticon Jet 2","model":"Oticon Jet 2 BTE 13","manufacturer":"SBO","orderIndex":"N","grossPrice":3150,"swdCode":""},{"idProduct":"10553216","nfzCode":"P.01.01.00","tradeName":"Oticon Jet 2","model":"Oticon Jet 2 miniRITE-T","manufacturer":"SBO","orderIndex":"N","grossPrice":3300,"swdCode":""},{"idProduct":"10553215","nfzCode":"P.01.01.00","tradeName":"Oticon Jet 2","model":"Oticon Jet 2 miniRITE","manufacturer":"SBO","orderIndex":"N","grossPrice":3300,"swdCode":""},{"idProduct":"10553214","nfzCode":"P.01.01.00","tradeName":"Oticon Jet 2","model":"Oticon Jet 2 ITE","manufacturer":"SBO","orderIndex":"N","grossPrice":3450,"swdCode":""},{"idProduct":"10553213","nfzCode":"P.01.01.00","tradeName":"Oticon Jet 2","model":"Oticon Jet 2 ITC","manufacturer":"SBO","orderIndex":"N","grossPrice":3450,"swdCode":""},{"idProduct":"10553212","nfzCode":"P.01.01.00","tradeName":"Oticon Jet 2","model":"Oticon Jet 2 IIC","manufacturer":"SBO","orderIndex":"N","grossPrice":3550,"swdCode":""},{"idProduct":"10553211","nfzCode":"P.01.01.00","tradeName":"Oticon Jet 2","model":"Oticon Jet 2 CIC","manufacturer":"SBO","orderIndex":"N","grossPrice":3550,"swdCode":""},{"idProduct":"10553210","nfzCode":"P.01.01.00","tradeName":"Oticon Jet 2","model":"Oticon Jet 2 BTE 13 PP","manufacturer":"SBO","orderIndex":"N","grossPrice":3300,"swdCode":""},{"idProduct":"11652822","nfzCode":"P.01.01.00","tradeName":"Oticon Jet 2","model":"Oticon Jet 2 BTE 13","manufacturer":"SBO","orderIndex":"N","grossPrice":3300,"swdCode":""},{"idProduct":"11652821","nfzCode":"P.01.01.00","tradeName":"Oticon Jet 2","model":"Oticon Jet 2 miniRITE-T","manufacturer":"SBO","orderIndex":"N","grossPrice":3450,"swdCode":""},{"idProduct":"11652820","nfzCode":"P.01.01.00","tradeName":"Oticon Jet 2","model":"Oticon Jet 2 miniRITE","manufacturer":"SBO","orderIndex":"N","grossPrice":3450,"swdCode":""},{"idProduct":"11652815","nfzCode":"P.01.01.00","tradeName":"Oticon Jet 2","model":"Oticon Jet 2 BTE 13 PP","manufacturer":"SBO","orderIndex":"N","grossPrice":3450,"swdCode":""},{"idProduct":"11652817","nfzCode":"P.01.01.00","tradeName":"Oticon Jet 2","model":"Oticon Jet 2 IIC","manufacturer":"SBO","orderIndex":"N","grossPrice":3700,"swdCode":""},{"idProduct":"11652818","nfzCode":"P.01.01.00","tradeName":"Oticon Jet 2","model":"Oticon Jet 2 ITC","manufacturer":"SBO","orderIndex":"N","grossPrice":3600,"swdCode":""},{"idProduct":"11652819","nfzCode":"P.01.01.00","tradeName":"Oticon Jet 2","model":"Oticon Jet 2 ITE","manufacturer":"SBO","orderIndex":"N","grossPrice":3600,"swdCode":""},{"idProduct":"12910058","nfzCode":"P.01.01.00","tradeName":"Oticon Jet PX 1","model":"Oticon Jet PX 1 miniBTE R","manufacturer":"SBO","orderIndex":"N","grossPrice":5100,"swdCode":""},{"idProduct":"12910059","nfzCode":"P.01.01.00","tradeName":"Oticon Jet PX 1","model":"Oticon Jet PX 1 miniBTE T","manufacturer":"SBO","orderIndex":"N","grossPrice":4550,"swdCode":""},{"idProduct":"12910060","nfzCode":"P.01.01.00","tradeName":"Oticon Jet PX 1","model":"Oticon Jet PX 1 miniRITE R","manufacturer":"SBO","orderIndex":"N","grossPrice":5200,"swdCode":""},{"idProduct":"12910061","nfzCode":"P.01.01.00","tradeName":"Oticon Jet PX 1","model":"Oticon Jet PX 1 miniRITE T","manufacturer":"SBO","orderIndex":"N","grossPrice":4600,"swdCode":""},{"idProduct":"12910062","nfzCode":"P.01.01.00","tradeName":"Oticon Jet PX 1","model":"Oticon Jet PX 1 ITE/ITC","manufacturer":"SBO","orderIndex":"N","grossPrice":4700,"swdCode":""},{"idProduct":"12910063","nfzCode":"P.01.01.00","tradeName":"Oticon Jet PX 1","model":"Oticon Jet PX 1 CIC/IIC","manufacturer":"SBO","orderIndex":"N","grossPrice":4900,"swdCode":""},{"idProduct":"12910065","nfzCode":"P.01.01.00","tradeName":"Oticon Jet PX 2","model":"Oticon Jet PX 2 mini BTE T","manufacturer":"SBO","orderIndex":"N","grossPrice":3500,"swdCode":""},{"idProduct":"12910064","nfzCode":"P.01.01.00","tradeName":"Oticon Jet PX 2","model":"Oticon Jet PX 2 mini BTE R","manufacturer":"SBO","orderIndex":"N","grossPrice":4100,"swdCode":""},{"idProduct":"12910066","nfzCode":"P.01.01.00","tradeName":"Oticon Jet PX 2","model":"Oticon Jet PX 2 mini RITE R","manufacturer":"SBO","orderIndex":"N","grossPrice":4100,"swdCode":""},{"idProduct":"12910067","nfzCode":"P.01.01.00","tradeName":"Oticon Jet PX 2","model":"Oticon Jet PX 2 mini RITE T","manufacturer":"SBO","orderIndex":"N","grossPrice":3600,"swdCode":""},{"idProduct":"12910068","nfzCode":"P.01.01.00","tradeName":"Oticon Jet PX 2","model":"Oticon Jet PX 2 ITE/ITC","manufacturer":"SBO","orderIndex":"N","grossPrice":3700,"swdCode":""},{"idProduct":"12910069","nfzCode":"P.01.01.00","tradeName":"Oticon Jet PX 2","model":"Oticon Jet PX 2 CIC/IIC","manufacturer":"SBO","orderIndex":"N","grossPrice":3800,"swdCode":""},{"idProduct":"10553136","nfzCode":"P.01.01.00","tradeName":"Oticon Opn Play 1","model":"Opn Play 1 miniRITE R","manufacturer":"SBO","orderIndex":"N","grossPrice":11400,"swdCode":""},{"idProduct":"10553135","nfzCode":"P.01.01.00","tradeName":"Oticon Opn Play 1","model":"Opn Play 1 miniRITE","manufacturer":"SBO","orderIndex":"N","grossPrice":10750,"swdCode":""},{"idProduct":"10553134","nfzCode":"P.01.01.00","tradeName":"Oticon Opn Play 1","model":"Opn Play 1 BTE 13 PP","manufacturer":"SBO","orderIndex":"N","grossPrice":10750,"swdCode":""},{"idProduct":"11652742","nfzCode":"P.01.01.00","tradeName":"Oticon Opn Play 1","model":"Opn Play 1 miniRITE-T","manufacturer":"SBO","orderIndex":"N","grossPrice":11000,"swdCode":""},{"idProduct":"11652741","nfzCode":"P.01.01.00","tradeName":"Oticon Opn Play 1","model":"Opn Play 1 miniRITE R","manufacturer":"SBO","orderIndex":"N","grossPrice":11650,"swdCode":""},{"idProduct":"11652740","nfzCode":"P.01.01.00","tradeName":"Oticon Opn Play 1","model":"Opn Play 1 miniRITE","manufacturer":"SBO","orderIndex":"N","grossPrice":11000,"swdCode":""},{"idProduct":"11652739","nfzCode":"P.01.01.00","tradeName":"Oticon Opn Play 1","model":"Opn Play 1 BTE 13 PP","manufacturer":"SBO","orderIndex":"N","grossPrice":11000,"swdCode":""},{"idProduct":"10553137","nfzCode":"P.01.01.00","tradeName":"Oticon Opn Play 1","model":"Opn Play 1 miniRITE-T","manufacturer":"SBO","orderIndex":"N","grossPrice":10750,"swdCode":""},{"idProduct":"11652746","nfzCode":"P.01.01.00","tradeName":"Oticon Opn Play 2","model":"Opn Play 2 miniRITE-T","manufacturer":"SBO","orderIndex":"N","grossPrice":6500,"swdCode":""},{"idProduct":"11652745","nfzCode":"P.01.01.00","tradeName":"Oticon Opn Play 2","model":"Opn Play 2 miniRITE R","manufacturer":"SBO","orderIndex":"N","grossPrice":7150,"swdCode":""},{"idProduct":"11652744","nfzCode":"P.01.01.00","tradeName":"Oticon Opn Play 2","model":"Opn Play 2 miniRITE","manufacturer":"SBO","orderIndex":"N","grossPrice":6500,"swdCode":""},{"idProduct":"10553138","nfzCode":"P.01.01.00","tradeName":"Oticon Opn Play 2","model":"Opn Play 2 BTE 13 PP","manufacturer":"SBO","orderIndex":"N","grossPrice":6250,"swdCode":""},{"idProduct":"10553139","nfzCode":"P.01.01.00","tradeName":"Oticon Opn Play 2","model":"Opn Play 2 miniRITE","manufacturer":"SBO","orderIndex":"N","grossPrice":6250,"swdCode":""},{"idProduct":"10553140","nfzCode":"P.01.01.00","tradeName":"Oticon Opn Play 2","model":"Opn Play 2 miniRITE R","manufacturer":"SBO","orderIndex":"N","grossPrice":6900,"swdCode":""},{"idProduct":"11652743","nfzCode":"P.01.01.00","tradeName":"Oticon Opn Play 2","model":"Opn Play 2 BTE 13 PP","manufacturer":"SBO","orderIndex":"N","grossPrice":6500,"swdCode":""},{"idProduct":"10553141","nfzCode":"P.01.01.00","tradeName":"Oticon Opn Play 2","model":"Opn Play 2 miniRITE-T","manufacturer":"SBO","orderIndex":"N","grossPrice":6250,"swdCode":""},{"idProduct":"10553142","nfzCode":"P.01.01.00","tradeName":"Oticon Opn S 1","model":"Opn S 1 BTE 13 PP","manufacturer":"SBO","orderIndex":"N","grossPrice":10750,"swdCode":""},{"idProduct":"11652750","nfzCode":"P.01.01.00","tradeName":"Oticon Opn S 1","model":"Opn S 1 miniRITE-T","manufacturer":"SBO","orderIndex":"N","grossPrice":11000,"swdCode":""},{"idProduct":"10553143","nfzCode":"P.01.01.00","tradeName":"Oticon Opn S 1","model":"Opn S 1 miniRITE","manufacturer":"SBO","orderIndex":"N","grossPrice":10750,"swdCode":""},{"idProduct":"11652748","nfzCode":"P.01.01.00","tradeName":"Oticon Opn S 1","model":"Opn S 1 miniRITE","manufacturer":"SBO","orderIndex":"N","grossPrice":11000,"swdCode":""},{"idProduct":"11652747","nfzCode":"P.01.01.00","tradeName":"Oticon Opn S 1","model":"Opn S 1 BTE 13 PP","manufacturer":"SBO","orderIndex":"N","grossPrice":11000,"swdCode":""},{"idProduct":"11652749","nfzCode":"P.01.01.00","tradeName":"Oticon Opn S 1","model":"Opn S 1 miniRITE R","manufacturer":"SBO","orderIndex":"N","grossPrice":11650,"swdCode":""},{"idProduct":"11652751","nfzCode":"P.01.01.00","tradeName":"Oticon Opn S 2","model":"Opn S 2 BTE 13 PP","manufacturer":"SBO","orderIndex":"N","grossPrice":6500,"swdCode":""},{"idProduct":"11652752","nfzCode":"P.01.01.00","tradeName":"Oticon Opn S 2","model":"Opn S 2 miniRITE","manufacturer":"SBO","orderIndex":"N","grossPrice":6500,"swdCode":""},{"idProduct":"11652753","nfzCode":"P.01.01.00","tradeName":"Oticon Opn S 2","model":"Opn S 2 miniRITE R","manufacturer":"SBO","orderIndex":"N","grossPrice":7150,"swdCode":""},{"idProduct":"11652754","nfzCode":"P.01.01.00","tradeName":"Oticon Opn S 2","model":"Opn S 2 miniRITE-T","manufacturer":"SBO","orderIndex":"N","grossPrice":6500,"swdCode":""},{"idProduct":"10553149","nfzCode":"P.01.01.00","tradeName":"Oticon Opn S 2","model":"Opn S 2 miniRITE-T","manufacturer":"SBO","orderIndex":"N","grossPrice":6250,"swdCode":""},{"idProduct":"11652755","nfzCode":"P.01.01.00","tradeName":"Oticon Opn S 3","model":"Opn S 3 BTE 13 PP","manufacturer":"SBO","orderIndex":"N","grossPrice":8000,"swdCode":""},{"idProduct":"10553150","nfzCode":"P.01.01.00","tradeName":"Oticon Opn S 3","model":"Opn S 3 BTE 13 PP","manufacturer":"SBO","orderIndex":"N","grossPrice":7750,"swdCode":""},{"idProduct":"11652757","nfzCode":"P.01.01.00","tradeName":"Oticon Opn S 3","model":"Opn S 3 miniRITE R","manufacturer":"SBO","orderIndex":"N","grossPrice":7750,"swdCode":""},{"idProduct":"11652758","nfzCode":"P.01.01.00","tradeName":"Oticon Opn S 3","model":"Opn S 3 miniRITE-T","manufacturer":"SBO","orderIndex":"N","grossPrice":7000,"swdCode":""},{"idProduct":"11652756","nfzCode":"P.01.01.00","tradeName":"Oticon Opn S 3","model":"Opn S 3 miniRITE","manufacturer":"SBO","orderIndex":"N","grossPrice":7350,"swdCode":""},{"idProduct":"10553153","nfzCode":"P.01.01.00","tradeName":"Oticon Opn S 3","model":"Opn S 3 miniRITE-T","manufacturer":"SBO","orderIndex":"N","grossPrice":6750,"swdCode":""},{"idProduct":"10553151","nfzCode":"P.01.01.00","tradeName":"Oticon Opn S 3","model":"Opn S 3 miniRITE","manufacturer":"SBO","orderIndex":"N","grossPrice":7100,"swdCode":""},{"idProduct":"10553152","nfzCode":"P.01.01.00","tradeName":"Oticon Opn S 3","model":"Opn S 3 miniRITE R","manufacturer":"SBO","orderIndex":"N","grossPrice":7500,"swdCode":""},{"idProduct":"11652824","nfzCode":"P.01.01.00","tradeName":"Oticon Own 1","model":"Oticon Own 1 CIC","manufacturer":"SBO","orderIndex":"N","grossPrice":11900,"swdCode":""},{"idProduct":"11652825","nfzCode":"P.01.01.00","tradeName":"Oticon Own 1","model":"Oticon Own 1 ITC","manufacturer":"SBO","orderIndex":"N","grossPrice":11900,"swdCode":""},{"idProduct":"10553218","nfzCode":"P.01.01.00","tradeName":"Oticon Own 1","model":"Oticon Own 1 IIC","manufacturer":"SBO","orderIndex":"N","grossPrice":11650,"swdCode":""},{"idProduct":"10553219","nfzCode":"P.01.01.00","tradeName":"Oticon Own 1","model":"Oticon Own 1 CIC","manufacturer":"SBO","orderIndex":"N","grossPrice":11650,"swdCode":""},{"idProduct":"10553220","nfzCode":"P.01.01.00","tradeName":"Oticon Own 1","model":"Oticon Own 1 ITC","manufacturer":"SBO","orderIndex":"N","grossPrice":11650,"swdCode":""},{"idProduct":"11652823","nfzCode":"P.01.01.00","tradeName":"Oticon Own 1","model":"Oticon Own 1 IIC","manufacturer":"SBO","orderIndex":"N","grossPrice":11900,"swdCode":""},{"idProduct":"10553221","nfzCode":"P.01.01.00","tradeName":"Oticon Own 1","model":"Oticon Own 1 ITE","manufacturer":"SBO","orderIndex":"N","grossPrice":11650,"swdCode":""},{"idProduct":"10553225","nfzCode":"P.01.01.00","tradeName":"Oticon Own 2","model":"Oticon Own 2 ITE","manufacturer":"SBO","orderIndex":"N","grossPrice":9200,"swdCode":""},{"idProduct":"10553223","nfzCode":"P.01.01.00","tradeName":"Oticon Own 2","model":"Oticon Own 2 CIC","manufacturer":"SBO","orderIndex":"N","grossPrice":9200,"swdCode":""},{"idProduct":"10553222","nfzCode":"P.01.01.00","tradeName":"Oticon Own 2","model":"Oticon Own 2 IIC","manufacturer":"SBO","orderIndex":"N","grossPrice":9200,"swdCode":""},{"idProduct":"10553224","nfzCode":"P.01.01.00","tradeName":"Oticon Own 2","model":"Oticon Own 2 ITC","manufacturer":"SBO","orderIndex":"N","grossPrice":9200,"swdCode":""},{"idProduct":"10553229","nfzCode":"P.01.01.00","tradeName":"Oticon Own 3","model":"Oticon Own 3 ITE","manufacturer":"SBO","orderIndex":"N","grossPrice":7500,"swdCode":""},{"idProduct":"10553227","nfzCode":"P.01.01.00","tradeName":"Oticon Own 3","model":"Oticon Own 3 CIC","manufacturer":"SBO","orderIndex":"N","grossPrice":7500,"swdCode":""},{"idProduct":"10553226","nfzCode":"P.01.01.00","tradeName":"Oticon Own 3","model":"Oticon Own 3 IIC","manufacturer":"SBO","orderIndex":"N","grossPrice":7500,"swdCode":""},{"idProduct":"10553228","nfzCode":"P.01.01.00","tradeName":"Oticon Own 3","model":"Oticon Own 3 ITC","manufacturer":"SBO","orderIndex":"N","grossPrice":7500,"swdCode":""},{"idProduct":"10553231","nfzCode":"P.01.01.00","tradeName":"Oticon Own 4","model":"Oticon Own 4 CIC","manufacturer":"SBO","orderIndex":"N","grossPrice":6050,"swdCode":""},{"idProduct":"10553230","nfzCode":"P.01.01.00","tradeName":"Oticon Own 4","model":"Oticon Own 4 IIC","manufacturer":"SBO","orderIndex":"N","grossPrice":6050,"swdCode":""},{"idProduct":"10553233","nfzCode":"P.01.01.00","tradeName":"Oticon Own 4","model":"Oticon Own 4 ITE","manufacturer":"SBO","orderIndex":"N","grossPrice":6050,"swdCode":""},{"idProduct":"10553232","nfzCode":"P.01.01.00","tradeName":"Oticon Own 4","model":"Oticon Own 4 ITC","manufacturer":"SBO","orderIndex":"N","grossPrice":6050,"swdCode":""},{"idProduct":"10553237","nfzCode":"P.01.01.00","tradeName":"Oticon Own 5","model":"Oticon Own 5 ITE","manufacturer":"SBO","orderIndex":"N","grossPrice":5350,"swdCode":""},{"idProduct":"10553236","nfzCode":"P.01.01.00","tradeName":"Oticon Own 5","model":"Oticon Own 5 ITC","manufacturer":"SBO","orderIndex":"N","grossPrice":5350,"swdCode":""},{"idProduct":"10553235","nfzCode":"P.01.01.00","tradeName":"Oticon Own 5","model":"Oticon Own 5 CIC","manufacturer":"SBO","orderIndex":"N","grossPrice":5350,"swdCode":""},{"idProduct":"10553234","nfzCode":"P.01.01.00","tradeName":"Oticon Own 5","model":"Oticon Own 5 IIC","manufacturer":"SBO","orderIndex":"N","grossPrice":5350,"swdCode":""},{"idProduct":"12910070","nfzCode":"P.01.01.00","tradeName":"Oticon Own SI 1","model":"Oticon Own SI 1 CIC/IIC","manufacturer":"SBO","orderIndex":"N","grossPrice":11100,"swdCode":""},{"idProduct":"12910071","nfzCode":"P.01.01.00","tradeName":"Oticon Own SI 2","model":"Oticon Own SI 2 CIC/IIC","manufacturer":"SBO","orderIndex":"N","grossPrice":8900,"swdCode":""},{"idProduct":"12910072","nfzCode":"P.01.01.00","tradeName":"Oticon Own SI 3","model":"Oticon Own SI 3 CIC/IIC","manufacturer":"SBO","orderIndex":"N","grossPrice":7500,"swdCode":""},{"idProduct":"12910073","nfzCode":"P.01.01.00","tradeName":"Oticon Own SI 4","model":"Oticon Own SI 4 CIC/IIC","manufacturer":"SBO","orderIndex":"N","grossPrice":6200,"swdCode":""},{"idProduct":"11652761","nfzCode":"P.01.01.00","tradeName":"Oticon Play PX 1","model":"Play PX 1 miniRITE R","manufacturer":"SBO","orderIndex":"N","grossPrice":12350,"swdCode":""},{"idProduct":"11652760","nfzCode":"P.01.01.00","tradeName":"Oticon Play PX 1","model":"Play PX 1 miniBTE T","manufacturer":"SBO","orderIndex":"N","grossPrice":11700,"swdCode":""},{"idProduct":"11652759","nfzCode":"P.01.01.00","tradeName":"Oticon Play PX 1","model":"Play PX 1 miniBTE R","manufacturer":"SBO","orderIndex":"N","grossPrice":12350,"swdCode":""},{"idProduct":"10553157","nfzCode":"P.01.01.00","tradeName":"Oticon Play PX 1","model":"Play PX 1 miniRITE T","manufacturer":"SBO","orderIndex":"N","grossPrice":11450,"swdCode":""},{"idProduct":"10553156","nfzCode":"P.01.01.00","tradeName":"Oticon Play PX 1","model":"Play PX 1 miniRITE R","manufacturer":"SBO","orderIndex":"N","grossPrice":12100,"swdCode":""},{"idProduct":"10553155","nfzCode":"P.01.01.00","tradeName":"Oticon Play PX 1","model":"Play PX 1 miniBTE T","manufacturer":"SBO","orderIndex":"N","grossPrice":11450,"swdCode":""},{"idProduct":"10553154","nfzCode":"P.01.01.00","tradeName":"Oticon Play PX 1","model":"Play PX 1 miniBTE R","manufacturer":"SBO","orderIndex":"N","grossPrice":12100,"swdCode":""},{"idProduct":"11652762","nfzCode":"P.01.01.00","tradeName":"Oticon Play PX 1","model":"Play PX 1 miniRITE T","manufacturer":"SBO","orderIndex":"N","grossPrice":11700,"swdCode":""},{"idProduct":"10553160","nfzCode":"P.01.01.00","tradeName":"Oticon Play PX 2","model":"Play PX 2 miniRITE R","manufacturer":"SBO","orderIndex":"N","grossPrice":7150,"swdCode":""},{"idProduct":"10553159","nfzCode":"P.01.01.00","tradeName":"Oticon Play PX 2","model":"Play PX 2 miniBTE T","manufacturer":"SBO","orderIndex":"N","grossPrice":6500,"swdCode":""},{"idProduct":"10553158","nfzCode":"P.01.01.00","tradeName":"Oticon Play PX 2","model":"Play PX 2 miniBTE R","manufacturer":"SBO","orderIndex":"N","grossPrice":7150,"swdCode":""},{"idProduct":"10553161","nfzCode":"P.01.01.00","tradeName":"Oticon Play PX 2","model":"Play PX 2 miniRITE T","manufacturer":"SBO","orderIndex":"N","grossPrice":6500,"swdCode":""},{"idProduct":"11652765","nfzCode":"P.01.01.00","tradeName":"Oticon Play PX 2","model":"Play PX 2 miniRITE R","manufacturer":"SBO","orderIndex":"N","grossPrice":7400,"swdCode":""},{"idProduct":"11652764","nfzCode":"P.01.01.00","tradeName":"Oticon Play PX 2","model":"Play PX 2 miniBTE T","manufacturer":"SBO","orderIndex":"N","grossPrice":6750,"swdCode":""},{"idProduct":"11652763","nfzCode":"P.01.01.00","tradeName":"Oticon Play PX 2","model":"Play PX 2 miniBTE R","manufacturer":"SBO","orderIndex":"N","grossPrice":7400,"swdCode":""},{"idProduct":"11652766","nfzCode":"P.01.01.00","tradeName":"Oticon Play PX 2","model":"Play PX 2 miniRITE T","manufacturer":"SBO","orderIndex":"N","grossPrice":6750,"swdCode":""},{"idProduct":"10553191","nfzCode":"P.01.01.00","tradeName":"Oticon Real 1","model":"Oticon Real 1 miniBTE T","manufacturer":"SBO","orderIndex":"N","grossPrice":11350,"swdCode":""},{"idProduct":"11652798","nfzCode":"P.01.01.00","tradeName":"Oticon Real 1","model":"Oticon Real 1 miniRITE T","manufacturer":"SBO","orderIndex":"N","grossPrice":11600,"swdCode":""},{"idProduct":"11652797","nfzCode":"P.01.01.00","tradeName":"Oticon Real 1","model":"Oticon Real 1 miniRITE R","manufacturer":"SBO","orderIndex":"N","grossPrice":12250,"swdCode":""},{"idProduct":"11652796","nfzCode":"P.01.01.00","tradeName":"Oticon Real 1","model":"Oticon Real 1 miniBTE T","manufacturer":"SBO","orderIndex":"N","grossPrice":11600,"swdCode":""},{"idProduct":"11652795","nfzCode":"P.01.01.00","tradeName":"Oticon Real 1","model":"Oticon Real 1 miniBTE R","manufacturer":"SBO","orderIndex":"N","grossPrice":12250,"swdCode":""},{"idProduct":"10553192","nfzCode":"P.01.01.00","tradeName":"Oticon Real 1","model":"Oticon Real 1 miniRITE R","manufacturer":"SBO","orderIndex":"N","grossPrice":12000,"swdCode":""},{"idProduct":"10553193","nfzCode":"P.01.01.00","tradeName":"Oticon Real 1","model":"Oticon Real 1 miniRITE T","manufacturer":"SBO","orderIndex":"N","grossPrice":11350,"swdCode":""},{"idProduct":"10553190","nfzCode":"P.01.01.00","tradeName":"Oticon Real 1","model":"Oticon Real 1 miniBTE R","manufacturer":"SBO","orderIndex":"N","grossPrice":12000,"swdCode":""},{"idProduct":"11652799","nfzCode":"P.01.01.00","tradeName":"Oticon Real 2","model":"Oticon Real 2 miniBTE R","manufacturer":"SBO","orderIndex":"N","grossPrice":9800,"swdCode":""},{"idProduct":"11652801","nfzCode":"P.01.01.00","tradeName":"Oticon Real 2","model":"Oticon Real 2 miniRITE R","manufacturer":"SBO","orderIndex":"N","grossPrice":9800,"swdCode":""},{"idProduct":"11652802","nfzCode":"P.01.01.00","tradeName":"Oticon Real 2","model":"Oticon Real 2 miniRITE T","manufacturer":"SBO","orderIndex":"N","grossPrice":9150,"swdCode":""},{"idProduct":"10553194","nfzCode":"P.01.01.00","tradeName":"Oticon Real 2","model":"Oticon Real 2 miniBTE R","manufacturer":"SBO","orderIndex":"N","grossPrice":9550,"swdCode":""},{"idProduct":"10553195","nfzCode":"P.01.01.00","tradeName":"Oticon Real 2","model":"Oticon Real 2 miniBTE T","manufacturer":"SBO","orderIndex":"N","grossPrice":8900,"swdCode":""},{"idProduct":"11652800","nfzCode":"P.01.01.00","tradeName":"Oticon Real 2","model":"Oticon Real 2 miniBTE T","manufacturer":"SBO","orderIndex":"N","grossPrice":9150,"swdCode":""},{"idProduct":"10553197","nfzCode":"P.01.01.00","tradeName":"Oticon Real 2","model":"Oticon Real 2 miniRITE T","manufacturer":"SBO","orderIndex":"N","grossPrice":8900,"swdCode":""},{"idProduct":"10553196","nfzCode":"P.01.01.00","tradeName":"Oticon Real 2","model":"Oticon Real 2 miniRITE R","manufacturer":"SBO","orderIndex":"N","grossPrice":9550,"swdCode":""},{"idProduct":"11652806","nfzCode":"P.01.01.00","tradeName":"Oticon Real 3","model":"Oticon Real 3 miniRITE T","manufacturer":"SBO","orderIndex":"N","grossPrice":7400,"swdCode":""},{"idProduct":"10553200","nfzCode":"P.01.01.00","tradeName":"Oticon Real 3","model":"Oticon Real 3 miniRITE R","manufacturer":"SBO","orderIndex":"N","grossPrice":7800,"swdCode":""},{"idProduct":"10553199","nfzCode":"P.01.01.00","tradeName":"Oticon Real 3","model":"Oticon Real 3 miniBTE T","manufacturer":"SBO","orderIndex":"N","grossPrice":7150,"swdCode":""},{"idProduct":"10553198","nfzCode":"P.01.01.00","tradeName":"Oticon Real 3","model":"Oticon Real 3 miniBTE R","manufacturer":"SBO","orderIndex":"N","grossPrice":7800,"swdCode":""},{"idProduct":"10553201","nfzCode":"P.01.01.00","tradeName":"Oticon Real 3","model":"Oticon Real 3 miniRITE T","manufacturer":"SBO","orderIndex":"N","grossPrice":7150,"swdCode":""},{"idProduct":"11652805","nfzCode":"P.01.01.00","tradeName":"Oticon Real 3","model":"Oticon Real 3 miniRITE R","manufacturer":"SBO","orderIndex":"N","grossPrice":8050,"swdCode":""},{"idProduct":"11652804","nfzCode":"P.01.01.00","tradeName":"Oticon Real 3","model":"Oticon Real 3 miniBTE T","manufacturer":"SBO","orderIndex":"N","grossPrice":7400,"swdCode":""},{"idProduct":"11652803","nfzCode":"P.01.01.00","tradeName":"Oticon Real 3","model":"Oticon Real 3 miniBTE R","manufacturer":"SBO","orderIndex":"N","grossPrice":8050,"swdCode":""},{"idProduct":"10553174","nfzCode":"P.01.01.00","tradeName":"Oticon Ruby 1","model":"Ruby 1 miniRITE-T","manufacturer":"SBO","orderIndex":"N","grossPrice":5400,"swdCode":""},{"idProduct":"11652778","nfzCode":"P.01.01.00","tradeName":"Oticon Ruby 1","model":"Ruby 1 miniRITE R","manufacturer":"SBO","orderIndex":"N","grossPrice":6300,"swdCode":""},{"idProduct":"11652777","nfzCode":"P.01.01.00","tradeName":"Oticon Ruby 1","model":"Ruby 1 miniRITE","manufacturer":"SBO","orderIndex":"N","grossPrice":5650,"swdCode":""},{"idProduct":"11652776","nfzCode":"P.01.01.00","tradeName":"Oticon Ruby 1","model":"Ruby 1 BTE 13 PP","manufacturer":"SBO","orderIndex":"N","grossPrice":5650,"swdCode":""},{"idProduct":"10553172","nfzCode":"P.01.01.00","tradeName":"Oticon Ruby 1","model":"Ruby 1 miniRITE","manufacturer":"SBO","orderIndex":"N","grossPrice":5400,"swdCode":""},{"idProduct":"10553170","nfzCode":"P.01.01.00","tradeName":"Oticon Ruby 1","model":"Ruby 1 BTE 13","manufacturer":"SBO","orderIndex":"N","grossPrice":5400,"swdCode":""},{"idProduct":"10553171","nfzCode":"P.01.01.00","tradeName":"Oticon Ruby 1","model":"Ruby 1 BTE 13 PP","manufacturer":"SBO","orderIndex":"N","grossPrice":5400,"swdCode":""},{"idProduct":"11652779","nfzCode":"P.01.01.00","tradeName":"Oticon Ruby 1","model":"Ruby 1 miniRITE-T","manufacturer":"SBO","orderIndex":"N","grossPrice":5650,"swdCode":""},{"idProduct":"10553173","nfzCode":"P.01.01.00","tradeName":"Oticon Ruby 1","model":"Ruby 1 miniRITE R","manufacturer":"SBO","orderIndex":"N","grossPrice":6050,"swdCode":""},{"idProduct":"11652775","nfzCode":"P.01.01.00","tradeName":"Oticon Ruby 1","model":"Ruby 1 BTE 13","manufacturer":"SBO","orderIndex":"N","grossPrice":5650,"swdCode":""},{"idProduct":"11652783","nfzCode":"P.01.01.00","tradeName":"Oticon Ruby 2","model":"Ruby 2 miniRITE R","manufacturer":"SBO","orderIndex":"N","grossPrice":5550,"swdCode":""},{"idProduct":"11652780","nfzCode":"P.01.01.00","tradeName":"Oticon Ruby 2","model":"Ruby 2 BTE 13","manufacturer":"SBO","orderIndex":"N","grossPrice":4800,"swdCode":""},{"idProduct":"11652784","nfzCode":"P.01.01.00","tradeName":"Oticon Ruby 2","model":"Ruby 2 miniRITE-T","manufacturer":"SBO","orderIndex":"N","grossPrice":4800,"swdCode":""},{"idProduct":"11652782","nfzCode":"P.01.01.00","tradeName":"Oticon Ruby 2","model":"Ruby 2 miniRITE","manufacturer":"SBO","orderIndex":"N","grossPrice":4800,"swdCode":""},{"idProduct":"10553179","nfzCode":"P.01.01.00","tradeName":"Oticon Ruby 2","model":"Ruby 2 miniRITE-T","manufacturer":"SBO","orderIndex":"N","grossPrice":4650,"swdCode":""},{"idProduct":"10553178","nfzCode":"P.01.01.00","tradeName":"Oticon Ruby 2","model":"Ruby 2 miniRITE R","manufacturer":"SBO","orderIndex":"N","grossPrice":5300,"swdCode":""},{"idProduct":"10553177","nfzCode":"P.01.01.00","tradeName":"Oticon Ruby 2","model":"Ruby 2 miniRITE","manufacturer":"SBO","orderIndex":"N","grossPrice":4650,"swdCode":""},{"idProduct":"10553176","nfzCode":"P.01.01.00","tradeName":"Oticon Ruby 2","model":"Ruby 2 BTE 13 PP","manufacturer":"SBO","orderIndex":"N","grossPrice":4650,"swdCode":""},{"idProduct":"10553175","nfzCode":"P.01.01.00","tradeName":"Oticon Ruby 2","model":"Ruby 2 BTE 13","manufacturer":"SBO","orderIndex":"N","grossPrice":4650,"swdCode":""},{"idProduct":"11652781","nfzCode":"P.01.01.00","tradeName":"Oticon Ruby 2","model":"Ruby 2 BTE 13 PP","manufacturer":"SBO","orderIndex":"N","grossPrice":4800,"swdCode":""},{"idProduct":"10553180","nfzCode":"P.01.01.00","tradeName":"Oticon Xceed 1","model":"Xceed 1 SP","manufacturer":"SBO","orderIndex":"N","grossPrice":10850,"swdCode":""},{"idProduct":"11652786","nfzCode":"P.01.01.00","tradeName":"Oticon Xceed 1","model":"Xceed 1 UP","manufacturer":"SBO","orderIndex":"N","grossPrice":11100,"swdCode":""},{"idProduct":"11652785","nfzCode":"P.01.01.00","tradeName":"Oticon Xceed 1","model":"Xceed 1 SP","manufacturer":"SBO","orderIndex":"N","grossPrice":11100,"swdCode":""},{"idProduct":"10553181","nfzCode":"P.01.01.00","tradeName":"Oticon Xceed 1","model":"Xceed 1 UP","manufacturer":"SBO","orderIndex":"N","grossPrice":10850,"swdCode":""},{"idProduct":"11652788","nfzCode":"P.01.01.00","tradeName":"Oticon Xceed 2","model":"Xceed 2 UP","manufacturer":"SBO","orderIndex":"N","grossPrice":6600,"swdCode":""},{"idProduct":"10553183","nfzCode":"P.01.01.00","tradeName":"Oticon Xceed 2","model":"Xceed 2 UP","manufacturer":"SBO","orderIndex":"N","grossPrice":6350,"swdCode":""},{"idProduct":"10553182","nfzCode":"P.01.01.00","tradeName":"Oticon Xceed 2","model":"Xceed 2 SP","manufacturer":"SBO","orderIndex":"N","grossPrice":6350,"swdCode":""},{"idProduct":"11652787","nfzCode":"P.01.01.00","tradeName":"Oticon Xceed 2","model":"Xceed 2 SP","manufacturer":"SBO","orderIndex":"N","grossPrice":6600,"swdCode":""},{"idProduct":"10553185","nfzCode":"P.01.01.00","tradeName":"Oticon Xceed 3","model":"Xceed 3 UP","manufacturer":"SBO","orderIndex":"N","grossPrice":4800,"swdCode":""},{"idProduct":"11652789","nfzCode":"P.01.01.00","tradeName":"Oticon Xceed 3","model":"Xceed 3 SP","manufacturer":"SBO","orderIndex":"N","grossPrice":4950,"swdCode":""},{"idProduct":"10553184","nfzCode":"P.01.01.00","tradeName":"Oticon Xceed 3","model":"Xceed 3 SP","manufacturer":"SBO","orderIndex":"N","grossPrice":4800,"swdCode":""},{"idProduct":"11652790","nfzCode":"P.01.01.00","tradeName":"Oticon Xceed 3","model":"Xceed 3 UP","manufacturer":"SBO","orderIndex":"N","grossPrice":4950,"swdCode":""},{"idProduct":"11652792","nfzCode":"P.01.01.00","tradeName":"Oticon Xceed Play 1","model":"Xceed Play 1 UP","manufacturer":"SBO","orderIndex":"N","grossPrice":11000,"swdCode":""},{"idProduct":"11652791","nfzCode":"P.01.01.00","tradeName":"Oticon Xceed Play 1","model":"Xceed Play 1 SP","manufacturer":"SBO","orderIndex":"N","grossPrice":11000,"swdCode":""},{"idProduct":"10553186","nfzCode":"P.01.01.00","tradeName":"Oticon Xceed Play 1","model":"Xceed Play 1 SP","manufacturer":"SBO","orderIndex":"N","grossPrice":10750,"swdCode":""},{"idProduct":"10553187","nfzCode":"P.01.01.00","tradeName":"Oticon Xceed Play 1","model":"Xceed Play 1 UP","manufacturer":"SBO","orderIndex":"N","grossPrice":10750,"swdCode":""},{"idProduct":"10553188","nfzCode":"P.01.01.00","tradeName":"Oticon Xceed Play 2","model":"Xceed Play 2 SP","manufacturer":"SBO","orderIndex":"N","grossPrice":6250,"swdCode":""},{"idProduct":"10553189","nfzCode":"P.01.01.00","tradeName":"Oticon Xceed Play 2","model":"Xceed Play 2 UP","manufacturer":"SBO","orderIndex":"N","grossPrice":6250,"swdCode":""},{"idProduct":"11652793","nfzCode":"P.01.01.00","tradeName":"Oticon Xceed Play 2","model":"Xceed Play 2 SP","manufacturer":"SBO","orderIndex":"N","grossPrice":6500,"swdCode":""},{"idProduct":"11652794","nfzCode":"P.01.01.00","tradeName":"Oticon Xceed Play 2","model":"Xceed Play 2 UP","manufacturer":"SBO","orderIndex":"N","grossPrice":6500,"swdCode":""},{"idProduct":"11652768","nfzCode":"P.01.01.00","tradeName":"Oticon Zircon 1","model":"Zircon 1 miniBTE T","manufacturer":"SBO","orderIndex":"N","grossPrice":6000,"swdCode":""},{"idProduct":"11652769","nfzCode":"P.01.01.00","tradeName":"Oticon Zircon 1","model":"Zircon 1 miniRITE R","manufacturer":"SBO","orderIndex":"N","grossPrice":6600,"swdCode":""},{"idProduct":"10553165","nfzCode":"P.01.01.00","tradeName":"Oticon Zircon 1","model":"Zircon 1 miniRITE T","manufacturer":"SBO","orderIndex":"N","grossPrice":5750,"swdCode":""},{"idProduct":"10553164","nfzCode":"P.01.01.00","tradeName":"Oticon Zircon 1","model":"Zircon 1 miniRITE R","manufacturer":"SBO","orderIndex":"N","grossPrice":6350,"swdCode":""},{"idProduct":"10553163","nfzCode":"P.01.01.00","tradeName":"Oticon Zircon 1","model":"Zircon 1 miniBTE T","manufacturer":"SBO","orderIndex":"N","grossPrice":5750,"swdCode":""},{"idProduct":"10553162","nfzCode":"P.01.01.00","tradeName":"Oticon Zircon 1","model":"Zircon 1 miniBTE R","manufacturer":"SBO","orderIndex":"N","grossPrice":6350,"swdCode":""},{"idProduct":"11652767","nfzCode":"P.01.01.00","tradeName":"Oticon Zircon 1","model":"Zircon 1 miniBTE R","manufacturer":"SBO","orderIndex":"N","grossPrice":6600,"swdCode":""},{"idProduct":"11652770","nfzCode":"P.01.01.00","tradeName":"Oticon Zircon 1","model":"Zircon 1 miniRITE T","manufacturer":"SBO","orderIndex":"N","grossPrice":6000,"swdCode":""},{"idProduct":"10553168","nfzCode":"P.01.01.00","tradeName":"Oticon Zircon 2","model":"Zircon 2 miniRITE R","manufacturer":"SBO","orderIndex":"N","grossPrice":5700,"swdCode":""},{"idProduct":"10553167","nfzCode":"P.01.01.00","tradeName":"Oticon Zircon 2","model":"Zircon 2 miniBTE T","manufacturer":"SBO","orderIndex":"N","grossPrice":5050,"swdCode":""},{"idProduct":"11652774","nfzCode":"P.01.01.00","tradeName":"Oticon Zircon 2","model":"Zircon 2 miniRITE T","manufacturer":"SBO","orderIndex":"N","grossPrice":5300,"swdCode":""},{"idProduct":"11652773","nfzCode":"P.01.01.00","tradeName":"Oticon Zircon 2","model":"Zircon 2 miniRITE R","manufacturer":"SBO","orderIndex":"N","grossPrice":5950,"swdCode":""},{"idProduct":"11652772","nfzCode":"P.01.01.00","tradeName":"Oticon Zircon 2","model":"Zircon 2 miniBTE T","manufacturer":"SBO","orderIndex":"N","grossPrice":5300,"swdCode":""},{"idProduct":"11652771","nfzCode":"P.01.01.00","tradeName":"Oticon Zircon 2","model":"Zircon 2 miniBTE R","manufacturer":"SBO","orderIndex":"N","grossPrice":5950,"swdCode":""},{"idProduct":"10553166","nfzCode":"P.01.01.00","tradeName":"Oticon Zircon 2","model":"Zircon 2 miniBTE R","manufacturer":"SBO","orderIndex":"N","grossPrice":5700,"swdCode":""},{"idProduct":"10553169","nfzCode":"P.01.01.00","tradeName":"Oticon Zircon 2","model":"Zircon 2 miniRITE T","manufacturer":"SBO","orderIndex":"N","grossPrice":5050,"swdCode":""},{"idProduct":"10893874","nfzCode":"P.01.01.00","tradeName":"Phonak Audao L70-R Fit","model":"Phonak Audeo L70-R Fit","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":10200,"swdCode":""},{"idProduct":"10893873","nfzCode":"P.01.01.00","tradeName":"Phonak Audao L90-R Fit","model":"Phonak Audeo L90-R Fit","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":13050,"swdCode":""},{"idProduct":"12910110","nfzCode":"P.01.01.00","tradeName":"Phonak Audeo I30-R","model":"Phonak Audeo I30-R","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":4800,"swdCode":""},{"idProduct":"12910111","nfzCode":"P.01.01.00","tradeName":"Phonak Audeo I50-R","model":"Phonak Audeo I50-R","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":5900,"swdCode":""},{"idProduct":"12910112","nfzCode":"P.01.01.00","tradeName":"Phonak Audeo I70-R","model":"Phonak Audeo I70-R","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":7700,"swdCode":""},{"idProduct":"12910114","nfzCode":"P.01.01.00","tradeName":"Phonak Audeo I70-Sphere","model":"Phonak Audeo I70-Sphere","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":8300,"swdCode":""},{"idProduct":"12910113","nfzCode":"P.01.01.00","tradeName":"Phonak Audeo I90-R","model":"Phonak Audeo I90-R","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":10000,"swdCode":""},{"idProduct":"12910115","nfzCode":"P.01.01.00","tradeName":"Phonak Audeo I90-Sphere","model":"Phonak Audeo I90-Sphere","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":11000,"swdCode":""},{"idProduct":"11428699","nfzCode":"P.01.01.00","tradeName":"Phonak Audeo L30-312","model":"Phonak Audeo L30-312","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":3900,"swdCode":""},{"idProduct":"10552940","nfzCode":"P.01.01.00","tradeName":"Phonak Audeo L30-R","model":"Phonak Audeo L30-R","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":4700,"swdCode":""},{"idProduct":"10552948","nfzCode":"P.01.01.00","tradeName":"Phonak Audeo L30-RL","model":"Phonak Audeo L30-RL","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":5600,"swdCode":""},{"idProduct":"10552944","nfzCode":"P.01.01.00","tradeName":"Phonak Audeo L30-RT","model":"Phonak Audeo L30-RT","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":4700,"swdCode":""},{"idProduct":"11428700","nfzCode":"P.01.01.00","tradeName":"Phonak Audeo L50-312","model":"Phonak Audeo L50-312","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":5400,"swdCode":""},{"idProduct":"10552939","nfzCode":"P.01.01.00","tradeName":"Phonak Audeo L50-R","model":"Phonak Audeo L50-R","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":5800,"swdCode":""},{"idProduct":"10552947","nfzCode":"P.01.01.00","tradeName":"Phonak Audeo L50-RL","model":"Phonak Audeo L50-RL","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":7400,"swdCode":""},{"idProduct":"11428701","nfzCode":"P.01.01.00","tradeName":"Phonak Audeo L70-312","model":"Phonak Audeo L70-312","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":7100,"swdCode":""},{"idProduct":"10552938","nfzCode":"P.01.01.00","tradeName":"Phonak Audeo L70-R","model":"Phonak Audeo L70-R","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":7600,"swdCode":""},{"idProduct":"12910109","nfzCode":"P.01.01.00","tradeName":"Phonak Audeo L70-R Fit","model":"Phonak Audeo L70-R Fit","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":10200,"swdCode":""},{"idProduct":"10552946","nfzCode":"P.01.01.00","tradeName":"Phonak Audeo L70-RL","model":"Phonak Audeo L70-RL","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":9100,"swdCode":""},{"idProduct":"11428702","nfzCode":"P.01.01.00","tradeName":"Phonak Audeo L90-312","model":"Phonak Audeo L90-312","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":9300,"swdCode":""},{"idProduct":"12910099","nfzCode":"P.01.01.00","tradeName":"Phonak Audeo L90-312","model":"Phonak Audeo L90-312","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":9500,"swdCode":""},{"idProduct":"10552937","nfzCode":"P.01.01.00","tradeName":"Phonak Audeo L90-R","model":"Phonak Audeo L90-R","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":9900,"swdCode":""},{"idProduct":"12910108","nfzCode":"P.01.01.00","tradeName":"Phonak Audeo L90-R Fit","model":"Phonak Audeo L90-R Fit","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":13050,"swdCode":""},{"idProduct":"10552945","nfzCode":"P.01.01.00","tradeName":"Phonak Audeo L90-RL","model":"Phonak Audeo L90-RL","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":11400,"swdCode":""},{"idProduct":"10552901","nfzCode":"P.01.01.00","tradeName":"Phonak Audeo P30-13T","model":"Phonak Audeo P30-13T","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":4000,"swdCode":""},{"idProduct":"10552913","nfzCode":"P.01.01.00","tradeName":"Phonak Audeo P30-312","model":"Phonak Audeo P30-312","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":4000,"swdCode":""},{"idProduct":"10552905","nfzCode":"P.01.01.00","tradeName":"Phonak Audeo P30-R","model":"Phonak Audeo P30-R","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":4500,"swdCode":""},{"idProduct":"10552920","nfzCode":"P.01.01.00","tradeName":"Phonak Audeo P30-RL","model":"Phonak Audeo P30-RL","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":5400,"swdCode":""},{"idProduct":"10552909","nfzCode":"P.01.01.00","tradeName":"Phonak Audeo P30-RT","model":"Phonak Audeo P30-RT","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":4500,"swdCode":""},{"idProduct":"10552902","nfzCode":"P.01.01.00","tradeName":"Phonak Audeo P50-13T","model":"Phonak Audeo P50-13T","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":5200,"swdCode":""},{"idProduct":"10552914","nfzCode":"P.01.01.00","tradeName":"Phonak Audeo P50-312","model":"Phonak Audeo P50-312","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":5200,"swdCode":""},{"idProduct":"10552906","nfzCode":"P.01.01.00","tradeName":"Phonak Audeo P50-R","model":"Phonak Audeo P50-R","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":5700,"swdCode":""},{"idProduct":"10552919","nfzCode":"P.01.01.00","tradeName":"Phonak Audeo P50-RL","model":"Phonak Audeo P50-RL","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":7200,"swdCode":""},{"idProduct":"10552910","nfzCode":"P.01.01.00","tradeName":"Phonak Audeo P50-RT","model":"Phonak Audeo P50-RT","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":5700,"swdCode":""},{"idProduct":"10552903","nfzCode":"P.01.01.00","tradeName":"Phonak Audeo P70-13T","model":"Phonak Audeo P70-13T","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":6900,"swdCode":""},{"idProduct":"10552915","nfzCode":"P.01.01.00","tradeName":"Phonak Audeo P70-312","model":"Phonak Audeo P70-312","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":6900,"swdCode":""},{"idProduct":"10552907","nfzCode":"P.01.01.00","tradeName":"Phonak Audeo P70-R","model":"Phonak Audeo P70-R","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":7400,"swdCode":""},{"idProduct":"10552922","nfzCode":"P.01.01.00","tradeName":"Phonak Audeo P70-R Fit","model":"Phonak Audeo P70-R Fit","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":9200,"swdCode":""},{"idProduct":"10552918","nfzCode":"P.01.01.00","tradeName":"Phonak Audeo P70-RL","model":"Phonak Audeo P70-RL","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":8900,"swdCode":""},{"idProduct":"10552911","nfzCode":"P.01.01.00","tradeName":"Phonak Audeo P70-RT","model":"Phonak Audeo P70-RT","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":7400,"swdCode":""},{"idProduct":"10552904","nfzCode":"P.01.01.00","tradeName":"Phonak Audeo P90-13T","model":"Phonak Audeo P90-13T","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":8900,"swdCode":""},{"idProduct":"10552916","nfzCode":"P.01.01.00","tradeName":"Phonak Audeo P90-312","model":"Phonak Audeo P90-312","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":8900,"swdCode":""},{"idProduct":"10552908","nfzCode":"P.01.01.00","tradeName":"Phonak Audeo P90-R","model":"Phonak Audeo P90-R","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":9600,"swdCode":""},{"idProduct":"10552921","nfzCode":"P.01.01.00","tradeName":"Phonak Audeo P90-R Fit","model":"Phonak Audeo P90-R Fit","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":11400,"swdCode":""},{"idProduct":"10552917","nfzCode":"P.01.01.00","tradeName":"Phonak Audeo P90-RL","model":"Phonak Audeo P90-RL","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":11100,"swdCode":""},{"idProduct":"10552912","nfzCode":"P.01.01.00","tradeName":"Phonak Audeo P90-RT","model":"Phonak Audeo P90-RT","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":9600,"swdCode":""},{"idProduct":"11652268","nfzCode":"P.01.01.00","tradeName":"Phonak Audéo I30-R","model":"Phonak Audéo I30-R","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":4800,"swdCode":""},{"idProduct":"11652269","nfzCode":"P.01.01.00","tradeName":"Phonak Audéo I50-R","model":"Phonak Audéo I50-R","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":5900,"swdCode":""},{"idProduct":"11652270","nfzCode":"P.01.01.00","tradeName":"Phonak Audéo I70-R","model":"Phonak Audéo I70-R","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":7700,"swdCode":""},{"idProduct":"11652272","nfzCode":"P.01.01.00","tradeName":"Phonak Audéo I70-Sphere","model":"Phonak Audéo I70-Sphere","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":8300,"swdCode":""},{"idProduct":"11652271","nfzCode":"P.01.01.00","tradeName":"Phonak Audéo I90-R","model":"Phonak Audéo I90-R","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":10000,"swdCode":""},{"idProduct":"11652273","nfzCode":"P.01.01.00","tradeName":"Phonak Audéo I90-Sphere","model":"Phonak Audéo I90-Sphere","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":11000,"swdCode":""},{"idProduct":"11652253","nfzCode":"P.01.01.00","tradeName":"Phonak Audéo L30-312","model":"Phonak Audéo L30-312","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":3900,"swdCode":""},{"idProduct":"10893891","nfzCode":"P.01.01.00","tradeName":"Phonak Audéo L30-312","model":"Phonak Audéo L30-312","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":3650,"swdCode":""},{"idProduct":"11652242","nfzCode":"P.01.01.00","tradeName":"Phonak Audéo L30-R","model":"Phonak Audéo L30-R","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":4700,"swdCode":""},{"idProduct":"10893856","nfzCode":"P.01.01.00","tradeName":"Phonak Audéo L30-R","model":"Phonak Audéo L30-R","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":3350,"swdCode":""},{"idProduct":"10893864","nfzCode":"P.01.01.00","tradeName":"Phonak Audéo L30-RL","model":"Phonak Audéo L30-RL","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":4700,"swdCode":""},{"idProduct":"11652250","nfzCode":"P.01.01.00","tradeName":"Phonak Audéo L30-RL","model":"Phonak Audéo L30-RL","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":5600,"swdCode":""},{"idProduct":"10893860","nfzCode":"P.01.01.00","tradeName":"Phonak Audéo L30-RT","model":"Phonak Audéo L30-RT","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":3350,"swdCode":""},{"idProduct":"11652246","nfzCode":"P.01.01.00","tradeName":"Phonak Audéo L30-RT","model":"Phonak Audéo L30-RT","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":4700,"swdCode":""},{"idProduct":"10893892","nfzCode":"P.01.01.00","tradeName":"Phonak Audéo L50-312","model":"Phonak Audéo L50-312","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":5400,"swdCode":""},{"idProduct":"11652241","nfzCode":"P.01.01.00","tradeName":"Phonak Audéo L50-R","model":"Phonak Audéo L50-R","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":5800,"swdCode":""},{"idProduct":"10893855","nfzCode":"P.01.01.00","tradeName":"Phonak Audéo L50-R","model":"Phonak Audéo L50-R","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":4900,"swdCode":""},{"idProduct":"11652249","nfzCode":"P.01.01.00","tradeName":"Phonak Audéo L50-RL","model":"Phonak Audéo L50-RL","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":7400,"swdCode":""},{"idProduct":"10893863","nfzCode":"P.01.01.00","tradeName":"Phonak Audéo L50-RL","model":"Phonak Audéo L50-RL","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":6250,"swdCode":""},{"idProduct":"10893859","nfzCode":"P.01.01.00","tradeName":"Phonak Audéo L50-RT","model":"Phonak Audéo L50-RT","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":4900,"swdCode":""},{"idProduct":"11652245","nfzCode":"P.01.01.00","tradeName":"Phonak Audéo L50-RT","model":"Phonak Audéo L50-RT","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":5800,"swdCode":""},{"idProduct":"10893893","nfzCode":"P.01.01.00","tradeName":"Phonak Audéo L70-312","model":"Phonak Audéo L70-312","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":7150,"swdCode":""},{"idProduct":"11652254","nfzCode":"P.01.01.00","tradeName":"Phonak Audéo L70-312","model":"Phonak Audéo L70-312","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":7100,"swdCode":""},{"idProduct":"11652240","nfzCode":"P.01.01.00","tradeName":"Phonak Audéo L70-R","model":"Phonak Audéo L70-R","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":7600,"swdCode":""},{"idProduct":"10893854","nfzCode":"P.01.01.00","tradeName":"Phonak Audéo L70-R","model":"Phonak Audéo L70-R","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":6450,"swdCode":""},{"idProduct":"11652252","nfzCode":"P.01.01.00","tradeName":"Phonak Audéo L70-R Fit","model":"Phonak Audeo L70-R Fit","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":10200,"swdCode":""},{"idProduct":"11652248","nfzCode":"P.01.01.00","tradeName":"Phonak Audéo L70-RL","model":"Phonak Audéo L70-RL","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":9100,"swdCode":""},{"idProduct":"10893862","nfzCode":"P.01.01.00","tradeName":"Phonak Audéo L70-RL","model":"Phonak Audéo L70-RL","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":7800,"swdCode":""},{"idProduct":"11652244","nfzCode":"P.01.01.00","tradeName":"Phonak Audéo L70-RT","model":"Phonak Audéo L70-RT","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":7600,"swdCode":""},{"idProduct":"10893858","nfzCode":"P.01.01.00","tradeName":"Phonak Audéo L70-RT","model":"Phonak Audéo L70-RT","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":6450,"swdCode":""},{"idProduct":"11652255","nfzCode":"P.01.01.00","tradeName":"Phonak Audéo L90-312","model":"Phonak Audéo L90-312","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":9500,"swdCode":""},{"idProduct":"10893894","nfzCode":"P.01.01.00","tradeName":"Phonak Audéo L90-312","model":"Phonak Audéo L90-312","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":9900,"swdCode":""},{"idProduct":"11652239","nfzCode":"P.01.01.00","tradeName":"Phonak Audéo L90-R","model":"Phonak Audéo L90-R","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":9900,"swdCode":""},{"idProduct":"10893853","nfzCode":"P.01.01.00","tradeName":"Phonak Audéo L90-R","model":"Phonak Audéo L90-R","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":8750,"swdCode":""},{"idProduct":"11652251","nfzCode":"P.01.01.00","tradeName":"Phonak Audéo L90-R Fit","model":"Phonak Audeo L90-R Fit","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":13050,"swdCode":""},{"idProduct":"11652247","nfzCode":"P.01.01.00","tradeName":"Phonak Audéo L90-RL","model":"Phonak Audéo L90-RL","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":11400,"swdCode":""},{"idProduct":"10893861","nfzCode":"P.01.01.00","tradeName":"Phonak Audéo L90-RL","model":"Phonak Audéo L90-RL","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":10100,"swdCode":""},{"idProduct":"10893857","nfzCode":"P.01.01.00","tradeName":"Phonak Audéo L90-RT","model":"Phonak Audéo L90-RT","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":8750,"swdCode":""},{"idProduct":"11652243","nfzCode":"P.01.01.00","tradeName":"Phonak Audéo L90-RT","model":"Phonak Audéo L90-RT","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":9900,"swdCode":""},{"idProduct":"13283983","nfzCode":"P.01.01.00","tradeName":"Phonak Naida L30-M","model":"Phonak Naida L30-M","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":4300,"swdCode":""},{"idProduct":"10893878","nfzCode":"P.01.01.00","tradeName":"Phonak Naida L30-PR","model":"Phonak Naida L30-PR","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":4850,"swdCode":""},{"idProduct":"10893895","nfzCode":"P.01.01.00","tradeName":"Phonak Naida L30-SP","model":"Phonak Naida L30-SP","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":4200,"swdCode":""},{"idProduct":"10893882","nfzCode":"P.01.01.00","tradeName":"Phonak Naida L30-UP","model":"Phonak Naida L30-UP","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":4200,"swdCode":""},{"idProduct":"13283982","nfzCode":"P.01.01.00","tradeName":"Phonak Naida L50-M","model":"Phonak Naida L50-M","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":5800,"swdCode":""},{"idProduct":"10893877","nfzCode":"P.01.01.00","tradeName":"Phonak Naida L50-PR","model":"Phonak Naida L50-PR","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":5950,"swdCode":""},{"idProduct":"10893896","nfzCode":"P.01.01.00","tradeName":"Phonak Naida L50-SP","model":"Phonak Naida L50-SP","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":5700,"swdCode":""},{"idProduct":"10893881","nfzCode":"P.01.01.00","tradeName":"Phonak Naida L50-UP","model":"Phonak Naida L50-UP","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":5700,"swdCode":""},{"idProduct":"13283981","nfzCode":"P.01.01.00","tradeName":"Phonak Naida L70-M","model":"Phonak Naida L70-M","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":7800,"swdCode":""},{"idProduct":"10893876","nfzCode":"P.01.01.00","tradeName":"Phonak Naida L70-PR","model":"Phonak Naida L70-PR","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":8200,"swdCode":""},{"idProduct":"10893897","nfzCode":"P.01.01.00","tradeName":"Phonak Naida L70-SP","model":"Phonak Naida L70-SP","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":7650,"swdCode":""},{"idProduct":"10893880","nfzCode":"P.01.01.00","tradeName":"Phonak Naida L70-UP","model":"Phonak Naida L70-UP","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":7650,"swdCode":""},{"idProduct":"13283980","nfzCode":"P.01.01.00","tradeName":"Phonak Naida L90-M","model":"Phonak Naida L90-M","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":10300,"swdCode":""},{"idProduct":"10893898","nfzCode":"P.01.01.00","tradeName":"Phonak Naida L90-SP","model":"Phonak Naida L90-SP","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":10000,"swdCode":""},{"idProduct":"10893879","nfzCode":"P.01.01.00","tradeName":"Phonak Naida L90-UP","model":"Phonak Naida L90-UP","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":10000,"swdCode":""},{"idProduct":"10552897","nfzCode":"P.01.01.00","tradeName":"Phonak Naida P30-PR","model":"Phonak Naida P30-PR","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":4600,"swdCode":""},{"idProduct":"10552893","nfzCode":"P.01.01.00","tradeName":"Phonak Naida P30-UP","model":"Phonak Naida P30-UP","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":4000,"swdCode":""},{"idProduct":"10552898","nfzCode":"P.01.01.00","tradeName":"Phonak Naida P50-PR","model":"Phonak Naida P50-PR","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":6200,"swdCode":""},{"idProduct":"10552894","nfzCode":"P.01.01.00","tradeName":"Phonak Naida P50-UP","model":"Phonak Naida P50-UP","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":5200,"swdCode":""},{"idProduct":"10552899","nfzCode":"P.01.01.00","tradeName":"Phonak Naida P70-PR","model":"Phonak Naida P70-PR","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":7500,"swdCode":""},{"idProduct":"10552895","nfzCode":"P.01.01.00","tradeName":"Phonak Naida P70-UP","model":"Phonak Naida P70-UP","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":6900,"swdCode":""},{"idProduct":"10552900","nfzCode":"P.01.01.00","tradeName":"Phonak Naida P90-PR","model":"Phonak Naida P90-PR","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":9700,"swdCode":""},{"idProduct":"10552896","nfzCode":"P.01.01.00","tradeName":"Phonak Naida P90-UP","model":"Phonak Naida P90-UP","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":9500,"swdCode":""},{"idProduct":"12910106","nfzCode":"P.01.01.00","tradeName":"Phonak Slim L30-R Left","model":"Phonak Slim L30-R Left","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":5500,"swdCode":""},{"idProduct":"12910107","nfzCode":"P.01.01.00","tradeName":"Phonak Slim L30-R Right","model":"Phonak Slim L30-R Right","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":5500,"swdCode":""},{"idProduct":"10893869","nfzCode":"P.01.01.00","tradeName":"Phonak Slim L-50 R Left","model":"Phonak Slim L-50 R Left","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":7350,"swdCode":""},{"idProduct":"10893870","nfzCode":"P.01.01.00","tradeName":"Phonak Slim L-50 R Right","model":"Phonak Slim L-50 R Right","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":7350,"swdCode":""},{"idProduct":"12910104","nfzCode":"P.01.01.00","tradeName":"Phonak Slim L50-R Left","model":"Phonak Slim L50-R Left","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":7350,"swdCode":""},{"idProduct":"12910105","nfzCode":"P.01.01.00","tradeName":"Phonak Slim L50-R Right","model":"Phonak Slim L50-R Right","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":7350,"swdCode":""},{"idProduct":"10893867","nfzCode":"P.01.01.00","tradeName":"Phonak Slim L-70 R Left","model":"Phonak Slim L-70 R","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":9200,"swdCode":""},{"idProduct":"10893868","nfzCode":"P.01.01.00","tradeName":"Phonak Slim L-70 R Right","model":"Phonak Slim L-70 R Right","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":9200,"swdCode":""},{"idProduct":"12910102","nfzCode":"P.01.01.00","tradeName":"Phonak Slim L70-R Left","model":"Phonak Slim L70-R Left","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":9200,"swdCode":""},{"idProduct":"12910103","nfzCode":"P.01.01.00","tradeName":"Phonak Slim L70-R Right","model":"Phonak Slim L70-R Right","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":9200,"swdCode":""},{"idProduct":"10893865","nfzCode":"P.01.01.00","tradeName":"Phonak Slim L-90 R Left","model":"Phonak Slim L-90 R","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":10950,"swdCode":""},{"idProduct":"10893866","nfzCode":"P.01.01.00","tradeName":"Phonak Slim L-90 R Right","model":"Phonak Slim L-90 R","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":10950,"swdCode":""},{"idProduct":"12910100","nfzCode":"P.01.01.00","tradeName":"Phonak Slim L90-R Left","model":"Phonak Slim L90-R Left","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":10950,"swdCode":""},{"idProduct":"12910101","nfzCode":"P.01.01.00","tradeName":"Phonak Slim L90-R Right","model":"Phonak Slim L90-R Right","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":10950,"swdCode":""},{"idProduct":"12910096","nfzCode":"P.01.01.00","tradeName":"Phonak Terra+ BTE-M","model":"Phonak Terra+ BTE-M","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":3550,"swdCode":""},{"idProduct":"11652260","nfzCode":"P.01.01.00","tradeName":"Phonak Terra BTE-M","model":"Phonak Terra BTE-M","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":2700,"swdCode":""},{"idProduct":"12910097","nfzCode":"P.01.01.00","tradeName":"Phonak Terra+ BTE-SP","model":"Phonak Terra+ BTE-SP","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":3550,"swdCode":""},{"idProduct":"11652261","nfzCode":"P.01.01.00","tradeName":"Phonak Terra BTE-SP","model":"Phonak Terra BTE-SP","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":2700,"swdCode":""},{"idProduct":"12910098","nfzCode":"P.01.01.00","tradeName":"Phonak Terra+ BTE-UP","model":"Phonak Terra+ BTE-UP","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":3550,"swdCode":""},{"idProduct":"11652262","nfzCode":"P.01.01.00","tradeName":"Phonak Terra BTE-UP","model":"Phonak Terra BTE-UP","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":2700,"swdCode":""},{"idProduct":"12910095","nfzCode":"P.01.01.00","tradeName":"Phonak Terra+ RIC-312","model":"Phonak Terra+ RIC-312","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":3550,"swdCode":""},{"idProduct":"11652263","nfzCode":"P.01.01.00","tradeName":"Phonak Terra RIC-312","model":"Phonak Terra RIC-312","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":2700,"swdCode":""},{"idProduct":"12910094","nfzCode":"P.01.01.00","tradeName":"Phonak Terra+ RIC-R","model":"Phonak Terra+ RIC-R","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":3950,"swdCode":""},{"idProduct":"11871581","nfzCode":"P.01.01.00","tradeName":"Phonak Virto I30-10 NW O","model":"Phonak Virto I30-10 NW O","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":3900,"swdCode":""},{"idProduct":"13283979","nfzCode":"P.01.01.00","tradeName":"Phonak Virto I30-R","model":"Phonak Virto I30-R","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":4900,"swdCode":""},{"idProduct":"11871580","nfzCode":"P.01.01.00","tradeName":"Phonak Virto I50-10 NW O","model":"Phonak Virto I50-10 NW O","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":5100,"swdCode":""},{"idProduct":"13283978","nfzCode":"P.01.01.00","tradeName":"Phonak Virto I50-R","model":"Phonak Virto I50-R","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":6000,"swdCode":""},{"idProduct":"11871579","nfzCode":"P.01.01.00","tradeName":"Phonak Virto I70-10 NW O","model":"Phonak Virto I70-10 NW O","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":6500,"swdCode":""},{"idProduct":"13283977","nfzCode":"P.01.01.00","tradeName":"Phonak Virto I70-R","model":"Phonak Virto I70-R","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":8100,"swdCode":""},{"idProduct":"11871583","nfzCode":"P.01.01.00","tradeName":"Phonak Virto I70-Titanium","model":"Phonak Virto I70-Titanium","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":7300,"swdCode":""},{"idProduct":"11871578","nfzCode":"P.01.01.00","tradeName":"Phonak Virto I90-10 NW O","model":"Phonak Virto I90-10 NW O","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":8500,"swdCode":""},{"idProduct":"13283976","nfzCode":"P.01.01.00","tradeName":"Phonak Virto I90-R","model":"Phonak Virto I90-R","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":10500,"swdCode":""},{"idProduct":"11871582","nfzCode":"P.01.01.00","tradeName":"Phonak Virto I90-Titanium","model":"Phonak Virto I90-Titanium","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":10300,"swdCode":""},{"idProduct":"10893848","nfzCode":"P.01.01.00","tradeName":"Phonak Virto P70-Titanium","model":"Phonak Virto P70-Titanium","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":5850,"swdCode":""},{"idProduct":"10893847","nfzCode":"P.01.01.00","tradeName":"Phonak Virto P90-Titanium","model":"Phonak Virto P90-Titanium","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":8100,"swdCode":""},{"idProduct":"10552871","nfzCode":"P.01.01.00","tradeName":"Phonak Vitus+ BTE-micro","model":"Phonak Vitus+ BTE-micro","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":2600,"swdCode":""},{"idProduct":"10552878","nfzCode":"P.01.01.00","tradeName":"Phonak Vitus BTE-micro","model":"Phonak Vitus BTE-micro","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":2400,"swdCode":""},{"idProduct":"10552872","nfzCode":"P.01.01.00","tradeName":"Phonak Vitus+ BTE-P","model":"Phonak Vitus+ BTE-P","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":2600,"swdCode":""},{"idProduct":"10552873","nfzCode":"P.01.01.00","tradeName":"Phonak Vitus+ BTE-UP","model":"Phonak Vitus+ BTE-UP","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":2600,"swdCode":""},{"idProduct":"10552875","nfzCode":"P.01.01.00","tradeName":"Phonak Vitus+ ITE-10NW O","model":"Phonak Vitus+ ITE-10NW O","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":2600,"swdCode":""},{"idProduct":"10552877","nfzCode":"P.01.01.00","tradeName":"Phonak Vitus+ ITE-13","model":"Phonak Vitus+ ITE-13","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":2600,"swdCode":""},{"idProduct":"10552876","nfzCode":"P.01.01.00","tradeName":"Phonak Vitus+ ITE-312","model":"Phonak Vitus+ ITE-312","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":2600,"swdCode":""},{"idProduct":"10552874","nfzCode":"P.01.01.00","tradeName":"Phonak Vitus+ RIC-312T","model":"Phonak Vitus+ RIC-312T","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":2600,"swdCode":""},{"idProduct":"12924569","nfzCode":"P.01.01.00","tradeName":"Rely 1 RLY176-DW","model":"RLY176-DW","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":1950,"swdCode":""},{"idProduct":"12924568","nfzCode":"P.01.01.00","tradeName":"Rely 1 RLY186-DWH","model":"RLY186-DWH","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":1950,"swdCode":""},{"idProduct":"10553588","nfzCode":"P.01.01.00","tradeName":"Rely 2 RLY263-DRW","model":"RLY263-DRW","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":2500,"swdCode":""},{"idProduct":"10553540","nfzCode":"P.01.01.00","tradeName":"Rely 2 RLY263-DRW","model":"RLY263-DRW","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":2450,"swdCode":""},{"idProduct":"10553587","nfzCode":"P.01.01.00","tradeName":"Rely 2 RLY264-DRW","model":"RLY264-DRW","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":2500,"swdCode":""},{"idProduct":"10553539","nfzCode":"P.01.01.00","tradeName":"Rely 2 RLY264-DRW","model":"RLY264-DRW","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":2450,"swdCode":""},{"idProduct":"10553586","nfzCode":"P.01.01.00","tradeName":"Rely 2 RLY266-DW","model":"RLY266-DW","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":2500,"swdCode":""},{"idProduct":"10553538","nfzCode":"P.01.01.00","tradeName":"Rely 2 RLY266-DW","model":"RLY266-DW","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":2450,"swdCode":""},{"idProduct":"10553537","nfzCode":"P.01.01.00","tradeName":"Rely 2 RLY276-DW","model":"RLY276-DW","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":2450,"swdCode":""},{"idProduct":"10553585","nfzCode":"P.01.01.00","tradeName":"Rely 2 RLY276-DW","model":"RLY276-DW","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":2500,"swdCode":""},{"idProduct":"10553536","nfzCode":"P.01.01.00","tradeName":"Rely 2 RLY286-DWH","model":"RLY286-DWH","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":2450,"swdCode":""},{"idProduct":"12147472","nfzCode":"P.01.01.00","tradeName":"Rely 2 RLY286-DWH","model":"RLY286-DWH","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":2000,"swdCode":""},{"idProduct":"10553584","nfzCode":"P.01.01.00","tradeName":"Rely 2 RLY286-DWH","model":"RLY286-DWH","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":2500,"swdCode":""},{"idProduct":"10553535","nfzCode":"P.01.01.00","tradeName":"Rely 2 RLY295-DW","model":"RLY295-DW","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":2450,"swdCode":""},{"idProduct":"10553583","nfzCode":"P.01.01.00","tradeName":"Rely 2 RLY295-DW","model":"RLY295-DW","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":2500,"swdCode":""},{"idProduct":"12147471","nfzCode":"P.01.01.00","tradeName":"Rely 2 RLY295-DW","model":"RLY295-DW","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":2000,"swdCode":""},{"idProduct":"10553534","nfzCode":"P.01.01.00","tradeName":"Rely 2 RLY2ITC-DW-HP","model":"RLY2ITC-DW-HP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":2450,"swdCode":""},{"idProduct":"10553582","nfzCode":"P.01.01.00","tradeName":"Rely 2 RLY2ITC-DW-HP","model":"RLY2ITC-DW-HP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":2500,"swdCode":""},{"idProduct":"10553533","nfzCode":"P.01.01.00","tradeName":"Rely 2 RLY2ITC-DW-MP","model":"RLY2ITC-DW-MP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":2450,"swdCode":""},{"idProduct":"10553581","nfzCode":"P.01.01.00","tradeName":"Rely 2 RLY2ITC-DW-MP","model":"RLY2ITC-DW-MP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":2500,"swdCode":""},{"idProduct":"10553580","nfzCode":"P.01.01.00","tradeName":"Rely 2 RLY2ITC-DW-UP","model":"RLY2ITC-DW-UP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":2500,"swdCode":""},{"idProduct":"10553532","nfzCode":"P.01.01.00","tradeName":"Rely 2 RLY2ITC-DW-UP","model":"RLY2ITC-DW-UP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":2450,"swdCode":""},{"idProduct":"10553531","nfzCode":"P.01.01.00","tradeName":"Rely 2 RLY2ITE-DW-HP","model":"RLY2ITE-DW-HP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":2450,"swdCode":""},{"idProduct":"10553579","nfzCode":"P.01.01.00","tradeName":"Rely 2 RLY2ITE-DW-HP","model":"RLY2ITE-DW-HP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":2500,"swdCode":""},{"idProduct":"10553530","nfzCode":"P.01.01.00","tradeName":"Rely 2 RLY2ITE-DW-MP","model":"RLY2ITE-DW-MP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":2450,"swdCode":""},{"idProduct":"10553578","nfzCode":"P.01.01.00","tradeName":"Rely 2 RLY2ITE-DW-MP","model":"RLY2ITE-DW-MP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":2500,"swdCode":""},{"idProduct":"10553577","nfzCode":"P.01.01.00","tradeName":"Rely 2 RLY2ITE-DW-UP","model":"RLY2ITE-DW-UP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":2500,"swdCode":""},{"idProduct":"10553529","nfzCode":"P.01.01.00","tradeName":"Rely 2 RLY2ITE-DW-UP","model":"RLY2ITE-DW-UP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":2450,"swdCode":""},{"idProduct":"10553528","nfzCode":"P.01.01.00","tradeName":"Rely 3 RLY363-DRW","model":"RLY363-DRW","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":2850,"swdCode":""},{"idProduct":"10553527","nfzCode":"P.01.01.00","tradeName":"Rely 3 RLY364-DRW","model":"RLY364-DRW","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":2850,"swdCode":""},{"idProduct":"10553526","nfzCode":"P.01.01.00","tradeName":"Rely 3 RLY366-DW","model":"RLY366-DW","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":2850,"swdCode":""},{"idProduct":"10553525","nfzCode":"P.01.01.00","tradeName":"Rely 3 RLY376-DW","model":"RLY376-DW","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":2850,"swdCode":""},{"idProduct":"10553524","nfzCode":"P.01.01.00","tradeName":"Rely 3 RLY386-DWH","model":"RLY386-DWH","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":2850,"swdCode":""},{"idProduct":"10553523","nfzCode":"P.01.01.00","tradeName":"Rely 3 RLY395-DW","model":"RLY395-DW","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":2850,"swdCode":""},{"idProduct":"10553522","nfzCode":"P.01.01.00","tradeName":"Rely 3 RLY3CIC-W-HP","model":"RLY3CIC-W-HP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":2850,"swdCode":""},{"idProduct":"10553521","nfzCode":"P.01.01.00","tradeName":"Rely 3 RLY3CIC-W-LP","model":"RLY3CIC-W-LP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":2850,"swdCode":""},{"idProduct":"10553520","nfzCode":"P.01.01.00","tradeName":"Rely 3 RLY3CIC-W-MP","model":"RLY3CIC-W-MP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":2850,"swdCode":""},{"idProduct":"10553519","nfzCode":"P.01.01.00","tradeName":"Rely 3 RLY3ITC-DW-HP","model":"RLY3ITC-DW-HP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":2850,"swdCode":""},{"idProduct":"10553518","nfzCode":"P.01.01.00","tradeName":"Rely 3 RLY3ITC-DW-MP","model":"RLY3ITC-DW-MP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":2850,"swdCode":""},{"idProduct":"10553517","nfzCode":"P.01.01.00","tradeName":"Rely 3 RLY3ITC-DW-UP","model":"RLY3ITC-DW-UP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":2850,"swdCode":""},{"idProduct":"10553516","nfzCode":"P.01.01.00","tradeName":"Rely 3 RLY3ITE-DW-HP","model":"RLY3ITE-DW-HP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":2850,"swdCode":""},{"idProduct":"10553515","nfzCode":"P.01.01.00","tradeName":"Rely 3 RLY3ITE-DW-MP","model":"RLY3ITE-DW-MP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":2850,"swdCode":""},{"idProduct":"10553514","nfzCode":"P.01.01.00","tradeName":"Rely 3 RLY3ITE-DW-UP","model":"RLY3ITE-DW-UP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":2850,"swdCode":""},{"idProduct":"10553513","nfzCode":"P.01.01.00","tradeName":"Rely 4 RLY463-DRW","model":"RLY463-DRW","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":3550,"swdCode":""},{"idProduct":"10553512","nfzCode":"P.01.01.00","tradeName":"Rely 4 RLY463-DRWC","model":"RLY463-DRWC","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":3550,"swdCode":""},{"idProduct":"10553576","nfzCode":"P.01.01.00","tradeName":"Rely 4 RLY463-DRWC","model":"RLY463-DRWC","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":3750,"swdCode":""},{"idProduct":"10553575","nfzCode":"P.01.01.00","tradeName":"Rely 4 RLY464-DRW","model":"RLY464-DRW","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":3650,"swdCode":""},{"idProduct":"10553511","nfzCode":"P.01.01.00","tradeName":"Rely 4 RLY464-DRW","model":"RLY464-DRW","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":3550,"swdCode":""},{"idProduct":"10553510","nfzCode":"P.01.01.00","tradeName":"Rely 4 RLY466-DW","model":"RLY466-DW","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":3550,"swdCode":""},{"idProduct":"10553574","nfzCode":"P.01.01.00","tradeName":"Rely 4 RLY466-DW","model":"RLY466-DW","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":3650,"swdCode":""},{"idProduct":"10553573","nfzCode":"P.01.01.00","tradeName":"Rely 4 RLY476-DW","model":"RLY476-DW","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":3650,"swdCode":""},{"idProduct":"10553509","nfzCode":"P.01.01.00","tradeName":"Rely 4 RLY476-DW","model":"RLY476-DW","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":3550,"swdCode":""},{"idProduct":"10553572","nfzCode":"P.01.01.00","tradeName":"Rely 4 RLY486-DWH","model":"RLY486-DWH","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":3650,"swdCode":""},{"idProduct":"10553508","nfzCode":"P.01.01.00","tradeName":"Rely 4 RLY486-DWH","model":"RLY486-DWH","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":3550,"swdCode":""},{"idProduct":"10553507","nfzCode":"P.01.01.00","tradeName":"Rely 4 RLY495-DW","model":"RLY495-DW","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":3550,"swdCode":""},{"idProduct":"10553571","nfzCode":"P.01.01.00","tradeName":"Rely 4 RLY495-DW","model":"RLY495-DW","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":3650,"swdCode":""},{"idProduct":"10553506","nfzCode":"P.01.01.00","tradeName":"Rely 4 RLY4CIC-W-HP","model":"RLY4CIC-W-HP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":3550,"swdCode":""},{"idProduct":"10553570","nfzCode":"P.01.01.00","tradeName":"Rely 4 RLY4CIC-W-HP","model":"RLY4CIC-W-HP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":3600,"swdCode":""},{"idProduct":"10553505","nfzCode":"P.01.01.00","tradeName":"Rely 4 RLY4CIC-W-LP","model":"RLY4CIC-W-LP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":3550,"swdCode":""},{"idProduct":"10553569","nfzCode":"P.01.01.00","tradeName":"Rely 4 RLY4CIC-W-LP","model":"RLY4CIC-W-LP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":3600,"swdCode":""},{"idProduct":"10553568","nfzCode":"P.01.01.00","tradeName":"Rely 4 RLY4CIC-W-MP","model":"RLY4CIC-W-MP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":3600,"swdCode":""},{"idProduct":"10553504","nfzCode":"P.01.01.00","tradeName":"Rely 4 RLY4CIC-W-MP","model":"RLY4CIC-W-MP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":3550,"swdCode":""},{"idProduct":"10553503","nfzCode":"P.01.01.00","tradeName":"Rely 4 RLY4ITC-DW-HP","model":"RLY4ITC-DW-HP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":3550,"swdCode":""},{"idProduct":"10553502","nfzCode":"P.01.01.00","tradeName":"Rely 4 RLY4ITC-DW-MP","model":"RLY4ITC-DW-MP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":3550,"swdCode":""},{"idProduct":"10553501","nfzCode":"P.01.01.00","tradeName":"Rely 4 RLY4ITC-DW-UP","model":"RLY4ITC-DW-UP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":3550,"swdCode":""},{"idProduct":"10553500","nfzCode":"P.01.01.00","tradeName":"Rely 4 RLY4ITE-DW-HP","model":"RLY4ITE-DW-HP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":3550,"swdCode":""},{"idProduct":"10553499","nfzCode":"P.01.01.00","tradeName":"Rely 4 RLY4ITE-DW-MP","model":"RLY4ITE-DW-MP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":3550,"swdCode":""},{"idProduct":"10553498","nfzCode":"P.01.01.00","tradeName":"Rely 4 RLY4ITE-DW-UP","model":"RLY4ITE-DW-UP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":3550,"swdCode":""},{"idProduct":"10550861","nfzCode":"P.01.01.00","tradeName":"Resound Key 1","model":"KE177","manufacturer":"RESOUND","orderIndex":"N","grossPrice":1950,"swdCode":""},{"idProduct":"10550862","nfzCode":"P.01.01.00","tradeName":"Resound Key 1","model":"KE188","manufacturer":"RESOUND","orderIndex":"N","grossPrice":1950,"swdCode":""},{"idProduct":"10550869","nfzCode":"P.01.01.00","tradeName":"Resound Key 2","model":"KE2 ITC-MP","manufacturer":"RESOUND","orderIndex":"N","grossPrice":2700,"swdCode":""},{"idProduct":"10550868","nfzCode":"P.01.01.00","tradeName":"Resound Key 2","model":"KE298","manufacturer":"RESOUND","orderIndex":"N","grossPrice":2700,"swdCode":""},{"idProduct":"10550867","nfzCode":"P.01.01.00","tradeName":"Resound Key 2","model":"KE288","manufacturer":"RESOUND","orderIndex":"N","grossPrice":2600,"swdCode":""},{"idProduct":"10550866","nfzCode":"P.01.01.00","tradeName":"Resound Key 2","model":"KE277","manufacturer":"RESOUND","orderIndex":"N","grossPrice":2600,"swdCode":""},{"idProduct":"10550872","nfzCode":"P.01.01.00","tradeName":"Resound Key 2","model":"KE2 ITE-MP","manufacturer":"RESOUND","orderIndex":"N","grossPrice":2700,"swdCode":""},{"idProduct":"10550864","nfzCode":"P.01.01.00","tradeName":"Resound Key 2","model":"KE262","manufacturer":"RESOUND","orderIndex":"N","grossPrice":2600,"swdCode":""},{"idProduct":"10550863","nfzCode":"P.01.01.00","tradeName":"Resound Key 2","model":"KE261","manufacturer":"RESOUND","orderIndex":"N","grossPrice":2600,"swdCode":""},{"idProduct":"10550873","nfzCode":"P.01.01.00","tradeName":"Resound Key 2","model":"KE2 ITE-HP","manufacturer":"RESOUND","orderIndex":"N","grossPrice":2700,"swdCode":""},{"idProduct":"10550874","nfzCode":"P.01.01.00","tradeName":"Resound Key 2","model":"KE2 ITE-UP","manufacturer":"RESOUND","orderIndex":"N","grossPrice":2700,"swdCode":""},{"idProduct":"10550870","nfzCode":"P.01.01.00","tradeName":"Resound Key 2","model":"KE2 ITC-HP","manufacturer":"RESOUND","orderIndex":"N","grossPrice":2700,"swdCode":""},{"idProduct":"10550871","nfzCode":"P.01.01.00","tradeName":"Resound Key 2","model":"KE2 ITC-UP","manufacturer":"RESOUND","orderIndex":"N","grossPrice":2700,"swdCode":""},{"idProduct":"10550865","nfzCode":"P.01.01.00","tradeName":"Resound Key 2","model":"KE267","manufacturer":"RESOUND","orderIndex":"N","grossPrice":2600,"swdCode":""},{"idProduct":"10550875","nfzCode":"P.01.01.00","tradeName":"Resound Key 3","model":"KE361","manufacturer":"RESOUND","orderIndex":"N","grossPrice":3100,"swdCode":""},{"idProduct":"10550876","nfzCode":"P.01.01.00","tradeName":"Resound Key 3","model":"KE362","manufacturer":"RESOUND","orderIndex":"N","grossPrice":3100,"swdCode":""},{"idProduct":"10550877","nfzCode":"P.01.01.00","tradeName":"Resound Key 3","model":"KE367","manufacturer":"RESOUND","orderIndex":"N","grossPrice":3100,"swdCode":""},{"idProduct":"10550878","nfzCode":"P.01.01.00","tradeName":"Resound Key 3","model":"KE377","manufacturer":"RESOUND","orderIndex":"N","grossPrice":3100,"swdCode":""},{"idProduct":"10550879","nfzCode":"P.01.01.00","tradeName":"Resound Key 3","model":"KE388","manufacturer":"RESOUND","orderIndex":"N","grossPrice":3100,"swdCode":""},{"idProduct":"10550880","nfzCode":"P.01.01.00","tradeName":"Resound Key 3","model":"KE398","manufacturer":"RESOUND","orderIndex":"N","grossPrice":3300,"swdCode":""},{"idProduct":"10550881","nfzCode":"P.01.01.00","tradeName":"Resound Key 3","model":"KE3 ITC-MP","manufacturer":"RESOUND","orderIndex":"N","grossPrice":3300,"swdCode":""},{"idProduct":"10550882","nfzCode":"P.01.01.00","tradeName":"Resound Key 3","model":"KE3 ITC-HP","manufacturer":"RESOUND","orderIndex":"N","grossPrice":3300,"swdCode":""},{"idProduct":"10550883","nfzCode":"P.01.01.00","tradeName":"Resound Key 3","model":"KE3 ITC-UP","manufacturer":"RESOUND","orderIndex":"N","grossPrice":3300,"swdCode":""},{"idProduct":"10550884","nfzCode":"P.01.01.00","tradeName":"Resound Key 3","model":"KE3 ITE-MP","manufacturer":"RESOUND","orderIndex":"N","grossPrice":3300,"swdCode":""},{"idProduct":"10550885","nfzCode":"P.01.01.00","tradeName":"Resound Key 3","model":"KE3 ITE-HP","manufacturer":"RESOUND","orderIndex":"N","grossPrice":3300,"swdCode":""},{"idProduct":"10550886","nfzCode":"P.01.01.00","tradeName":"Resound Key 3","model":"KE3 ITE-UP","manufacturer":"RESOUND","orderIndex":"N","grossPrice":3300,"swdCode":""},{"idProduct":"10550887","nfzCode":"P.01.01.00","tradeName":"Resound Key 3","model":"KE3 CIC-LP","manufacturer":"RESOUND","orderIndex":"N","grossPrice":3300,"swdCode":""},{"idProduct":"10550889","nfzCode":"P.01.01.00","tradeName":"Resound Key 3","model":"KE3 CIC-MP","manufacturer":"RESOUND","orderIndex":"N","grossPrice":3300,"swdCode":""},{"idProduct":"10550888","nfzCode":"P.01.01.00","tradeName":"Resound Key 3","model":"KE3 CIC-HP","manufacturer":"RESOUND","orderIndex":"N","grossPrice":3300,"swdCode":""},{"idProduct":"10550903","nfzCode":"P.01.01.00","tradeName":"Resound Key 4","model":"KE4 CIC-HP","manufacturer":"RESOUND","orderIndex":"N","grossPrice":3900,"swdCode":""},{"idProduct":"10550904","nfzCode":"P.01.01.00","tradeName":"Resound Key 4","model":"KE4 CIC-MP","manufacturer":"RESOUND","orderIndex":"N","grossPrice":3900,"swdCode":""},{"idProduct":"10550902","nfzCode":"P.01.01.00","tradeName":"Resound Key 4","model":"KE4 CIC-LP","manufacturer":"RESOUND","orderIndex":"N","grossPrice":3900,"swdCode":""},{"idProduct":"10550901","nfzCode":"P.01.01.00","tradeName":"Resound Key 4","model":"KE4 ITE-UP","manufacturer":"RESOUND","orderIndex":"N","grossPrice":3900,"swdCode":""},{"idProduct":"10550900","nfzCode":"P.01.01.00","tradeName":"Resound Key 4","model":"KE4 ITE-HP","manufacturer":"RESOUND","orderIndex":"N","grossPrice":3900,"swdCode":""},{"idProduct":"10550899","nfzCode":"P.01.01.00","tradeName":"Resound Key 4","model":"KE4 ITE-MP","manufacturer":"RESOUND","orderIndex":"N","grossPrice":3900,"swdCode":""},{"idProduct":"10550898","nfzCode":"P.01.01.00","tradeName":"Resound Key 4","model":"KE4 ITC-UP","manufacturer":"RESOUND","orderIndex":"N","grossPrice":3900,"swdCode":""},{"idProduct":"10550897","nfzCode":"P.01.01.00","tradeName":"Resound Key 4","model":"KE4 ITC-HP","manufacturer":"RESOUND","orderIndex":"N","grossPrice":3900,"swdCode":""},{"idProduct":"10550896","nfzCode":"P.01.01.00","tradeName":"Resound Key 4","model":"KE4 ITC-MP","manufacturer":"RESOUND","orderIndex":"N","grossPrice":3900,"swdCode":""},{"idProduct":"10550895","nfzCode":"P.01.01.00","tradeName":"Resound Key 4","model":"KE498","manufacturer":"RESOUND","orderIndex":"N","grossPrice":3900,"swdCode":""},{"idProduct":"10550894","nfzCode":"P.01.01.00","tradeName":"Resound Key 4","model":"KE488","manufacturer":"RESOUND","orderIndex":"N","grossPrice":3850,"swdCode":""},{"idProduct":"10550893","nfzCode":"P.01.01.00","tradeName":"Resound Key 4","model":"KE477","manufacturer":"RESOUND","orderIndex":"N","grossPrice":3850,"swdCode":""},{"idProduct":"10550892","nfzCode":"P.01.01.00","tradeName":"Resound Key 4","model":"KE467","manufacturer":"RESOUND","orderIndex":"N","grossPrice":3850,"swdCode":""},{"idProduct":"10550891","nfzCode":"P.01.01.00","tradeName":"Resound Key 4","model":"KE462","manufacturer":"RESOUND","orderIndex":"N","grossPrice":3850,"swdCode":""},{"idProduct":"10550890","nfzCode":"P.01.01.00","tradeName":"Resound Key 4","model":"KE461","manufacturer":"RESOUND","orderIndex":"N","grossPrice":3850,"swdCode":""},{"idProduct":"12410212","nfzCode":"P.01.01.00","tradeName":"ReSound Savi 261","model":"SA261-DRW","manufacturer":"RESOUND","orderIndex":"N","grossPrice":2900,"swdCode":""},{"idProduct":"12410214","nfzCode":"P.01.01.00","tradeName":"ReSound Savi 262","model":"SA262-DRW","manufacturer":"RESOUND","orderIndex":"N","grossPrice":2900,"swdCode":""},{"idProduct":"12410216","nfzCode":"P.01.01.00","tradeName":"ReSound Savi 360","model":"SA360-DRWC","manufacturer":"RESOUND","orderIndex":"N","grossPrice":3900,"swdCode":""},{"idProduct":"12410213","nfzCode":"P.01.01.00","tradeName":"ReSound Savi 361","model":"SA361-DRW","manufacturer":"RESOUND","orderIndex":"N","grossPrice":3900,"swdCode":""},{"idProduct":"12410215","nfzCode":"P.01.01.00","tradeName":"ReSound Savi 362","model":"SA362-DRW","manufacturer":"RESOUND","orderIndex":"N","grossPrice":3900,"swdCode":""},{"idProduct":"12410228","nfzCode":"P.01.01.00","tradeName":"ReSound Vivia 460S","model":"VI460S-DRWC","manufacturer":"RESOUND","orderIndex":"N","grossPrice":4700,"swdCode":""},{"idProduct":"12410217","nfzCode":"P.01.01.00","tradeName":"ReSound Vivia 461","model":"VI461-DRW","manufacturer":"RESOUND","orderIndex":"N","grossPrice":4700,"swdCode":""},{"idProduct":"12410221","nfzCode":"P.01.01.00","tradeName":"ReSound Vivia 462","model":"VI462-DRW","manufacturer":"RESOUND","orderIndex":"N","grossPrice":4700,"swdCode":""},{"idProduct":"12410227","nfzCode":"P.01.01.00","tradeName":"ReSound Vivia 560S","model":"VI560S-DRWC","manufacturer":"RESOUND","orderIndex":"N","grossPrice":6700,"swdCode":""},{"idProduct":"12410218","nfzCode":"P.01.01.00","tradeName":"ReSound Vivia 561","model":"VI561-DRW","manufacturer":"RESOUND","orderIndex":"N","grossPrice":6700,"swdCode":""},{"idProduct":"12410222","nfzCode":"P.01.01.00","tradeName":"ReSound Vivia 562","model":"VI562-DRW","manufacturer":"RESOUND","orderIndex":"N","grossPrice":6700,"swdCode":""},{"idProduct":"12410226","nfzCode":"P.01.01.00","tradeName":"ReSound Vivia 760S","model":"VI760S-DRWC","manufacturer":"RESOUND","orderIndex":"N","grossPrice":8700,"swdCode":""},{"idProduct":"12410219","nfzCode":"P.01.01.00","tradeName":"ReSound Vivia 761","model":"VI761-DRW","manufacturer":"RESOUND","orderIndex":"N","grossPrice":8700,"swdCode":""},{"idProduct":"12410223","nfzCode":"P.01.01.00","tradeName":"ReSound Vivia 762","model":"VI762-DRW","manufacturer":"RESOUND","orderIndex":"N","grossPrice":8700,"swdCode":""},{"idProduct":"12410225","nfzCode":"P.01.01.00","tradeName":"ReSound Vivia 960S","model":"VI960S-DRWC","manufacturer":"RESOUND","orderIndex":"N","grossPrice":10700,"swdCode":""},{"idProduct":"12410220","nfzCode":"P.01.01.00","tradeName":"ReSound Vivia 961","model":"VI961-DRW","manufacturer":"RESOUND","orderIndex":"N","grossPrice":10700,"swdCode":""},{"idProduct":"12410224","nfzCode":"P.01.01.00","tradeName":"ReSound Vivia 962","model":"VI962-DRW","manufacturer":"RESOUND","orderIndex":"N","grossPrice":10700,"swdCode":""},{"idProduct":"11652608","nfzCode":"P.01.01.00","tradeName":"Serene 17 SER1762S-DRWC","model":"SER1762S-DRWC","manufacturer":"GN Hearing  A/S","orderIndex":"N","grossPrice":9800,"swdCode":""},{"idProduct":"11652607","nfzCode":"P.01.01.00","tradeName":"Serene 17 SER1763-DRW","model":"SER1763-DRW","manufacturer":"GN Hearing  A/S","orderIndex":"N","grossPrice":9800,"swdCode":""},{"idProduct":"11652606","nfzCode":"P.01.01.00","tradeName":"Serene 17 SER1764-DRW","model":"SER1764-DRW","manufacturer":"GN Hearing  A/S","orderIndex":"N","grossPrice":9800,"swdCode":""},{"idProduct":"11652605","nfzCode":"P.01.01.00","tradeName":"Serene 17 SER1776-DWC","model":"SER1776-DWC","manufacturer":"GN Hearing  A/S","orderIndex":"N","grossPrice":9800,"swdCode":""},{"idProduct":"11652604","nfzCode":"P.01.01.00","tradeName":"Serene 17 SER1786-DWC","model":"SER1786-DWC","manufacturer":"GN Hearing  A/S","orderIndex":"N","grossPrice":9800,"swdCode":""},{"idProduct":"11652612","nfzCode":"P.01.01.00","tradeName":"Serene 17 SER17CIC-HP","model":"SER17CIC-HP","manufacturer":"GN Hearing  A/S","orderIndex":"N","grossPrice":9800,"swdCode":""},{"idProduct":"11652614","nfzCode":"P.01.01.00","tradeName":"Serene 17 SER17CIC-LP","model":"SER17CIC-LP","manufacturer":"GN Hearing  A/S","orderIndex":"N","grossPrice":9800,"swdCode":""},{"idProduct":"11652613","nfzCode":"P.01.01.00","tradeName":"Serene 17 SER17CIC-MP","model":"SER17CIC-MP","manufacturer":"GN Hearing  A/S","orderIndex":"N","grossPrice":9800,"swdCode":""},{"idProduct":"11652610","nfzCode":"P.01.01.00","tradeName":"Serene 17 SER17ITE-DWC-HP","model":"SER17ITE-DWC-HP","manufacturer":"GN Hearing  A/S","orderIndex":"N","grossPrice":9800,"swdCode":""},{"idProduct":"11652611","nfzCode":"P.01.01.00","tradeName":"Serene 17 SER17ITE-DWC-MP","model":"SER17ITE-DWC-MP","manufacturer":"GN Hearing  A/S","orderIndex":"N","grossPrice":9800,"swdCode":""},{"idProduct":"11652609","nfzCode":"P.01.01.00","tradeName":"Serene 17 SER17ITE-DWC-UP","model":"SER17ITE-DWC-UP","manufacturer":"GN Hearing  A/S","orderIndex":"N","grossPrice":9800,"swdCode":""},{"idProduct":"11652641","nfzCode":"P.01.01.00","tradeName":"Serene 4 SER462S-DRWC","model":"SER462S-DRWC","manufacturer":"GN Hearing  A/S","orderIndex":"N","grossPrice":4600,"swdCode":""},{"idProduct":"11652640","nfzCode":"P.01.01.00","tradeName":"Serene 4 SER463-DRW","model":"SER463-DRW","manufacturer":"GN Hearing  A/S","orderIndex":"N","grossPrice":4600,"swdCode":""},{"idProduct":"11652639","nfzCode":"P.01.01.00","tradeName":"Serene 4 SER464-DRW","model":"SER464-DRW","manufacturer":"GN Hearing  A/S","orderIndex":"N","grossPrice":4600,"swdCode":""},{"idProduct":"11652638","nfzCode":"P.01.01.00","tradeName":"Serene 4 SER476-DWC","model":"SER476-DWC","manufacturer":"GN Hearing  A/S","orderIndex":"N","grossPrice":4600,"swdCode":""},{"idProduct":"11652637","nfzCode":"P.01.01.00","tradeName":"Serene 4 SER486-DWC","model":"SER486-DWC","manufacturer":"GN Hearing  A/S","orderIndex":"N","grossPrice":4600,"swdCode":""},{"idProduct":"11652645","nfzCode":"P.01.01.00","tradeName":"Serene 4 SER4CIC-HP","model":"SER4CIC-HP","manufacturer":"GN Hearing  A/S","orderIndex":"N","grossPrice":4600,"swdCode":""},{"idProduct":"11652647","nfzCode":"P.01.01.00","tradeName":"Serene 4 SER4CIC-LP","model":"SER4CIC-LP","manufacturer":"GN Hearing  A/S","orderIndex":"N","grossPrice":4600,"swdCode":""},{"idProduct":"11652646","nfzCode":"P.01.01.00","tradeName":"Serene 4 SER4CIC-MP","model":"SER4CIC-MP","manufacturer":"GN Hearing  A/S","orderIndex":"N","grossPrice":4600,"swdCode":""},{"idProduct":"11652643","nfzCode":"P.01.01.00","tradeName":"Serene 4 SER4ITE-DWC-HP","model":"SER4ITE-DWC-HP","manufacturer":"GN Hearing  A/S","orderIndex":"N","grossPrice":4600,"swdCode":""},{"idProduct":"11652644","nfzCode":"P.01.01.00","tradeName":"Serene 4 SER4ITE-DWC-MP","model":"SER4ITE-DWC-MP","manufacturer":"GN Hearing  A/S","orderIndex":"N","grossPrice":4600,"swdCode":""},{"idProduct":"11652642","nfzCode":"P.01.01.00","tradeName":"Serene 4 SER4ITE-DWC-UP","model":"SER4ITE-DWC-UP","manufacturer":"GN Hearing  A/S","orderIndex":"N","grossPrice":4600,"swdCode":""},{"idProduct":"11652630","nfzCode":"P.01.01.00","tradeName":"Serene 6 SER662S-DRWC","model":"SER662S-DRWC","manufacturer":"GN Hearing  A/S","orderIndex":"N","grossPrice":4900,"swdCode":""},{"idProduct":"11652629","nfzCode":"P.01.01.00","tradeName":"Serene 6 SER663-DRW","model":"SER663-DRW","manufacturer":"GN Hearing  A/S","orderIndex":"N","grossPrice":4900,"swdCode":""},{"idProduct":"11652628","nfzCode":"P.01.01.00","tradeName":"Serene 6 SER664-DRW","model":"SER664-DRW","manufacturer":"GN Hearing  A/S","orderIndex":"N","grossPrice":4900,"swdCode":""},{"idProduct":"11652627","nfzCode":"P.01.01.00","tradeName":"Serene 6 SER676-DWC","model":"SER676-DWC","manufacturer":"GN Hearing  A/S","orderIndex":"N","grossPrice":4900,"swdCode":""},{"idProduct":"11652626","nfzCode":"P.01.01.00","tradeName":"Serene 6 SER686-DWC","model":"SER686-DWC","manufacturer":"GN Hearing  A/S","orderIndex":"N","grossPrice":4900,"swdCode":""},{"idProduct":"11652634","nfzCode":"P.01.01.00","tradeName":"Serene 6 SER6CIC-HP","model":"SER6CIC-HP","manufacturer":"GN Hearing  A/S","orderIndex":"N","grossPrice":4900,"swdCode":""},{"idProduct":"11652636","nfzCode":"P.01.01.00","tradeName":"Serene 6 SER6CIC-LP","model":"SER6CIC-LP","manufacturer":"GN Hearing  A/S","orderIndex":"N","grossPrice":4900,"swdCode":""},{"idProduct":"11652635","nfzCode":"P.01.01.00","tradeName":"Serene 6 SER6CIC-MP","model":"SER6CIC-MP","manufacturer":"GN Hearing  A/S","orderIndex":"N","grossPrice":4900,"swdCode":""},{"idProduct":"11652632","nfzCode":"P.01.01.00","tradeName":"Serene 6 SER6ITE-DWC-HP","model":"SER6ITE-DWC-HP","manufacturer":"GN Hearing  A/S","orderIndex":"N","grossPrice":4900,"swdCode":""},{"idProduct":"11652633","nfzCode":"P.01.01.00","tradeName":"Serene 6 SER6ITE-DWC-MP","model":"SER6ITE-DWC-MP","manufacturer":"GN Hearing  A/S","orderIndex":"N","grossPrice":4900,"swdCode":""},{"idProduct":"11652631","nfzCode":"P.01.01.00","tradeName":"Serene 6 SER6ITE-DWC-UP","model":"SER6ITE-DWC-UP","manufacturer":"GN Hearing  A/S","orderIndex":"N","grossPrice":4900,"swdCode":""},{"idProduct":"11652619","nfzCode":"P.01.01.00","tradeName":"Serene 9 SER962S-DRWC","model":"SER962S-DRWC","manufacturer":"GN Hearing  A/S","orderIndex":"N","grossPrice":7100,"swdCode":""},{"idProduct":"11652618","nfzCode":"P.01.01.00","tradeName":"Serene 9 SER963-DRW","model":"SER963-DRW","manufacturer":"GN Hearing  A/S","orderIndex":"N","grossPrice":7100,"swdCode":""},{"idProduct":"11652617","nfzCode":"P.01.01.00","tradeName":"Serene 9 SER964-DRW","model":"SER964-DRW","manufacturer":"GN Hearing  A/S","orderIndex":"N","grossPrice":7100,"swdCode":""},{"idProduct":"11652616","nfzCode":"P.01.01.00","tradeName":"Serene 9 SER976-DWC","model":"SER976-DWC","manufacturer":"GN Hearing  A/S","orderIndex":"N","grossPrice":7100,"swdCode":""},{"idProduct":"11652615","nfzCode":"P.01.01.00","tradeName":"Serene 9 SER986-DWC","model":"SER986-DWC","manufacturer":"GN Hearing  A/S","orderIndex":"N","grossPrice":7100,"swdCode":""},{"idProduct":"11652623","nfzCode":"P.01.01.00","tradeName":"Serene 9 SER9CIC-HP","model":"SER9CIC-HP","manufacturer":"GN Hearing  A/S","orderIndex":"N","grossPrice":7100,"swdCode":""},{"idProduct":"11652625","nfzCode":"P.01.01.00","tradeName":"Serene 9 SER9CIC-LP","model":"SER9CIC-LP","manufacturer":"GN Hearing  A/S","orderIndex":"N","grossPrice":7100,"swdCode":""},{"idProduct":"11652624","nfzCode":"P.01.01.00","tradeName":"Serene 9 SER9CIC-MP","model":"SER9CIC-MP","manufacturer":"GN Hearing  A/S","orderIndex":"N","grossPrice":7100,"swdCode":""},{"idProduct":"11652621","nfzCode":"P.01.01.00","tradeName":"Serene 9 SER9ITE-DWC-HP","model":"SER9ITE-DWC-HP","manufacturer":"GN Hearing  A/S","orderIndex":"N","grossPrice":7100,"swdCode":""},{"idProduct":"12910385","nfzCode":"P.01.01.00","tradeName":"Signature Series 16 CIC NW","model":"Audibel Signature Series 16 CIC NW","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":5300,"swdCode":""},{"idProduct":"12910384","nfzCode":"P.01.01.00","tradeName":"Signature Series 16 CIC R NW","model":"Audibel Signature Series 16 CIC R NW","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":5300,"swdCode":""},{"idProduct":"12910383","nfzCode":"P.01.01.00","tradeName":"Signature Series 20 CIC NW","model":"Audibel Signature Series 20 CIC NW","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":6300,"swdCode":""},{"idProduct":"12910382","nfzCode":"P.01.01.00","tradeName":"Signature Series 20 CIC R NW","model":"Audibel Signature Series 20 CIC R NW","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":6300,"swdCode":""},{"idProduct":"12910380","nfzCode":"P.01.01.00","tradeName":"Signature Series 24 CIC NW","model":"Audibel Signature Series 24 CIC NW","manufacturer":"Starkey Hearing Technologies","orderIndex":"N","grossPrice":9300,"swdCode":""},{"idProduct":"12910379","nfzCode":"P.01.01.00","tradeName":"Signature Series 24 CIC R NW","model":"Audibel Signature Series 24 CIC R NW","manufacturer":"Starkey Hearing Technologies","orderIndex":"N","grossPrice":9400,"swdCode":""},{"idProduct":"12910381","nfzCode":"P.01.01.00","tradeName":"Signature Series 24 IIC NW","model":"Audibel Signature Series 24 IIC NW","manufacturer":"Starkey Hearing Technologies","orderIndex":"N","grossPrice":9900,"swdCode":""},{"idProduct":"10550302","nfzCode":"P.01.01.00","tradeName":"SONIC ENCHANT SE","model":"ENCHANT SE 20 MNR","manufacturer":"SBO","orderIndex":"N","grossPrice":3150,"swdCode":""},{"idProduct":"10554303","nfzCode":"P.01.01.00","tradeName":"SONIC ENCHANT SE","model":"ENCHANT SE 10 ITE HS","manufacturer":"SBO","orderIndex":"N","grossPrice":2900,"swdCode":""},{"idProduct":"10550304","nfzCode":"P.01.01.00","tradeName":"SONIC ENCHANT SE","model":"ENCHANT SE 20 MNR T","manufacturer":"SBO","orderIndex":"N","grossPrice":3150,"swdCode":""},{"idProduct":"10550305","nfzCode":"P.01.01.00","tradeName":"SONIC ENCHANT SE","model":"ENCHANT SE 10 MNR T","manufacturer":"SBO","orderIndex":"N","grossPrice":2850,"swdCode":""},{"idProduct":"10550306","nfzCode":"P.01.01.00","tradeName":"SONIC ENCHANT SE","model":"ENCHANT SE 20 B 105","manufacturer":"SBO","orderIndex":"N","grossPrice":2950,"swdCode":""},{"idProduct":"10550307","nfzCode":"P.01.01.00","tradeName":"SONIC ENCHANT SE","model":"ENCHANT SE 10 B 105","manufacturer":"SBO","orderIndex":"N","grossPrice":2650,"swdCode":""},{"idProduct":"10550308","nfzCode":"P.01.01.00","tradeName":"SONIC ENCHANT SE","model":"ENCHANT SE 20 IIC","manufacturer":"SBO","orderIndex":"N","grossPrice":3250,"swdCode":""},{"idProduct":"10554290","nfzCode":"P.01.01.00","tradeName":"SONIC ENCHANT SE","model":"ENCHANT SE 20 MNR","manufacturer":"SBO","orderIndex":"N","grossPrice":3000,"swdCode":""},{"idProduct":"10554291","nfzCode":"P.01.01.00","tradeName":"SONIC ENCHANT SE","model":"ENCHANT SE 10 MNR","manufacturer":"SBO","orderIndex":"N","grossPrice":2700,"swdCode":""},{"idProduct":"10554292","nfzCode":"P.01.01.00","tradeName":"SONIC ENCHANT SE","model":"ENCHANT SE 20 MNR T","manufacturer":"SBO","orderIndex":"N","grossPrice":3000,"swdCode":""},{"idProduct":"10554293","nfzCode":"P.01.01.00","tradeName":"SONIC ENCHANT SE","model":"ENCHANT SE 10 MNR T","manufacturer":"SBO","orderIndex":"N","grossPrice":2700,"swdCode":""},{"idProduct":"10554294","nfzCode":"P.01.01.00","tradeName":"SONIC ENCHANT SE","model":"ENCHANT SE 20 B 105","manufacturer":"SBO","orderIndex":"N","grossPrice":2800,"swdCode":""},{"idProduct":"10554295","nfzCode":"P.01.01.00","tradeName":"SONIC ENCHANT SE","model":"ENCHANT SE 10 B 105","manufacturer":"SBO","orderIndex":"N","grossPrice":2500,"swdCode":""},{"idProduct":"10554296","nfzCode":"P.01.01.00","tradeName":"SONIC ENCHANT SE","model":"ENCHANT SE 20 IIC","manufacturer":"SBO","orderIndex":"N","grossPrice":3100,"swdCode":""},{"idProduct":"10554297","nfzCode":"P.01.01.00","tradeName":"SONIC ENCHANT SE","model":"ENCHANT SE 20 CIC","manufacturer":"SBO","orderIndex":"N","grossPrice":3100,"swdCode":""},{"idProduct":"10554298","nfzCode":"P.01.01.00","tradeName":"SONIC ENCHANT SE","model":"ENCHANT SE 20 ITC","manufacturer":"SBO","orderIndex":"N","grossPrice":3100,"swdCode":""},{"idProduct":"10554299","nfzCode":"P.01.01.00","tradeName":"SONIC ENCHANT SE","model":"ENCHANT SE 20 ITE HS","manufacturer":"SBO","orderIndex":"N","grossPrice":3100,"swdCode":""},{"idProduct":"10554300","nfzCode":"P.01.01.00","tradeName":"SONIC ENCHANT SE","model":"ENCHANT SE 10 IIC","manufacturer":"SBO","orderIndex":"N","grossPrice":2900,"swdCode":""},{"idProduct":"10554301","nfzCode":"P.01.01.00","tradeName":"SONIC ENCHANT SE","model":"ENCHANT SE 10 CIC","manufacturer":"SBO","orderIndex":"N","grossPrice":2900,"swdCode":""},{"idProduct":"10550309","nfzCode":"P.01.01.00","tradeName":"SONIC ENCHANT SE","model":"ENCHANT SE 20 CIC","manufacturer":"SBO","orderIndex":"N","grossPrice":3250,"swdCode":""},{"idProduct":"10550310","nfzCode":"P.01.01.00","tradeName":"SONIC ENCHANT SE","model":"ENCHANT SE 20 ITC","manufacturer":"SBO","orderIndex":"N","grossPrice":3250,"swdCode":""},{"idProduct":"10550311","nfzCode":"P.01.01.00","tradeName":"SONIC ENCHANT SE","model":"ENCHANT SE 20 ITE HS","manufacturer":"SBO","orderIndex":"N","grossPrice":3250,"swdCode":""},{"idProduct":"10550312","nfzCode":"P.01.01.00","tradeName":"SONIC ENCHANT SE","model":"ENCHANT SE 10 IIC","manufacturer":"SBO","orderIndex":"N","grossPrice":3050,"swdCode":""},{"idProduct":"10550313","nfzCode":"P.01.01.00","tradeName":"SONIC ENCHANT SE","model":"ENCHANT SE 10 CIC","manufacturer":"SBO","orderIndex":"N","grossPrice":3050,"swdCode":""},{"idProduct":"10550314","nfzCode":"P.01.01.00","tradeName":"SONIC ENCHANT SE","model":"ENCHANT SE 10 ITC","manufacturer":"SBO","orderIndex":"N","grossPrice":3050,"swdCode":""},{"idProduct":"10550315","nfzCode":"P.01.01.00","tradeName":"SONIC ENCHANT SE","model":"ENCHANT SE 10 ITE HS","manufacturer":"SBO","orderIndex":"N","grossPrice":3050,"swdCode":""},{"idProduct":"10554302","nfzCode":"P.01.01.00","tradeName":"SONIC ENCHANT SE","model":"ENCHANT SE 10 ITC","manufacturer":"SBO","orderIndex":"N","grossPrice":2900,"swdCode":""},{"idProduct":"10550303","nfzCode":"P.01.01.00","tradeName":"SONIC ENCHANT SE","model":"ENCHANT SE 10 MNR","manufacturer":"SBO","orderIndex":"N","grossPrice":2850,"swdCode":""},{"idProduct":"10550257","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT 100","model":"RADIANT 100 MNR T","manufacturer":"SBO","orderIndex":"N","grossPrice":8750,"swdCode":""},{"idProduct":"10550258","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT 100","model":"RADIANT 100 MNR T R","manufacturer":"SBO","orderIndex":"N","grossPrice":9250,"swdCode":""},{"idProduct":"10550259","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT 100","model":"RADIANT 100 MNB T","manufacturer":"SBO","orderIndex":"N","grossPrice":8550,"swdCode":""},{"idProduct":"10550260","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT 100","model":"RADIANT 100 MNB T R","manufacturer":"SBO","orderIndex":"N","grossPrice":9050,"swdCode":""},{"idProduct":"10550261","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT 100","model":"RADIANT 100 IIC","manufacturer":"SBO","orderIndex":"N","grossPrice":8950,"swdCode":""},{"idProduct":"10550262","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT 100","model":"RADIANT 100 CIC","manufacturer":"SBO","orderIndex":"N","grossPrice":8950,"swdCode":""},{"idProduct":"10550263","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT 100","model":"RADIANT 100 ITC","manufacturer":"SBO","orderIndex":"N","grossPrice":8950,"swdCode":""},{"idProduct":"10550264","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT 100","model":"RADIANT 100 ITE HS","manufacturer":"SBO","orderIndex":"N","grossPrice":8950,"swdCode":""},{"idProduct":"10550265","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT 100","model":"RADIANT 100 ITE FS","manufacturer":"SBO","orderIndex":"N","grossPrice":8950,"swdCode":""},{"idProduct":"10554250","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT 100","model":"RADIANT 100 CIC","manufacturer":"SBO","orderIndex":"N","grossPrice":8800,"swdCode":""},{"idProduct":"10554251","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT 100","model":"RADIANT 100 ITC","manufacturer":"SBO","orderIndex":"N","grossPrice":8800,"swdCode":""},{"idProduct":"10554252","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT 100","model":"RADIANT 100 ITE HS","manufacturer":"SBO","orderIndex":"N","grossPrice":8800,"swdCode":""},{"idProduct":"10554253","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT 100","model":"RADIANT 100 ITE FS","manufacturer":"SBO","orderIndex":"N","grossPrice":8800,"swdCode":""},{"idProduct":"10554245","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT 100","model":"RADIANT 100 MNR T","manufacturer":"SBO","orderIndex":"N","grossPrice":8600,"swdCode":""},{"idProduct":"10554246","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT 100","model":"RADIANT 100 MNR T R","manufacturer":"SBO","orderIndex":"N","grossPrice":9100,"swdCode":""},{"idProduct":"10554247","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT 100","model":"RADIANT 100 MNB T","manufacturer":"SBO","orderIndex":"N","grossPrice":8400,"swdCode":""},{"idProduct":"10554248","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT 100","model":"RADIANT 100 MNB T R","manufacturer":"SBO","orderIndex":"N","grossPrice":8900,"swdCode":""},{"idProduct":"10554249","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT 100","model":"RADIANT 100 IIC","manufacturer":"SBO","orderIndex":"N","grossPrice":8800,"swdCode":""},{"idProduct":"10550293","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT 20","model":"RADIANT 20 MNR T","manufacturer":"SBO","orderIndex":"N","grossPrice":3450,"swdCode":""},{"idProduct":"10550294","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT 20","model":"RADIANT 20 MNR T R","manufacturer":"SBO","orderIndex":"N","grossPrice":3950,"swdCode":""},{"idProduct":"10550295","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT 20","model":"RADIANT 20 MNB T","manufacturer":"SBO","orderIndex":"N","grossPrice":3350,"swdCode":""},{"idProduct":"10550296","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT 20","model":"RADIANT 20 MNB T R","manufacturer":"SBO","orderIndex":"N","grossPrice":3750,"swdCode":""},{"idProduct":"10550301","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT 20","model":"RADIANT 20 ITE FS","manufacturer":"SBO","orderIndex":"N","grossPrice":3650,"swdCode":""},{"idProduct":"10550298","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT 20","model":"RADIANT 20 CIC","manufacturer":"SBO","orderIndex":"N","grossPrice":3650,"swdCode":""},{"idProduct":"10550299","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT 20","model":"RADIANT 20 ITC","manufacturer":"SBO","orderIndex":"N","grossPrice":3650,"swdCode":""},{"idProduct":"10550300","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT 20","model":"RADIANT 20 ITE HS","manufacturer":"SBO","orderIndex":"N","grossPrice":3650,"swdCode":""},{"idProduct":"10550297","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT 20","model":"RADIANT 20 IIC","manufacturer":"SBO","orderIndex":"N","grossPrice":3650,"swdCode":""},{"idProduct":"10550284","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT 40","model":"RADIANT 40 MNR T","manufacturer":"SBO","orderIndex":"N","grossPrice":4350,"swdCode":""},{"idProduct":"10550285","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT 40","model":"RADIANT 40 MNR T R","manufacturer":"SBO","orderIndex":"N","grossPrice":5450,"swdCode":""},{"idProduct":"10550286","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT 40","model":"RADIANT 40 MNB T","manufacturer":"SBO","orderIndex":"N","grossPrice":4150,"swdCode":""},{"idProduct":"10550287","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT 40","model":"RADIANT 40 MNB T R","manufacturer":"SBO","orderIndex":"N","grossPrice":5150,"swdCode":""},{"idProduct":"10550288","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT 40","model":"RADIANT 40 IIC","manufacturer":"SBO","orderIndex":"N","grossPrice":4650,"swdCode":""},{"idProduct":"10550289","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT 40","model":"RADIANT 40 CIC","manufacturer":"SBO","orderIndex":"N","grossPrice":4650,"swdCode":""},{"idProduct":"10550290","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT 40","model":"RADIANT 40 ITC","manufacturer":"SBO","orderIndex":"N","grossPrice":4650,"swdCode":""},{"idProduct":"10550291","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT 40","model":"RADIANT 40 ITE HS","manufacturer":"SBO","orderIndex":"N","grossPrice":4650,"swdCode":""},{"idProduct":"10550292","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT 40","model":"RADIANT 40 ITE FS","manufacturer":"SBO","orderIndex":"N","grossPrice":4650,"swdCode":""},{"idProduct":"10554272","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT 40","model":"RADIANT 40 MNR T","manufacturer":"SBO","orderIndex":"N","grossPrice":4200,"swdCode":""},{"idProduct":"10554273","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT 40","model":"RADIANT 40 MNR T R","manufacturer":"SBO","orderIndex":"N","grossPrice":5300,"swdCode":""},{"idProduct":"10554274","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT 40","model":"RADIANT 40 MNB T","manufacturer":"SBO","orderIndex":"N","grossPrice":4000,"swdCode":""},{"idProduct":"10554275","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT 40","model":"RADIANT 40 MNB T R","manufacturer":"SBO","orderIndex":"N","grossPrice":5000,"swdCode":""},{"idProduct":"10554276","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT 40","model":"RADIANT 40 IIC","manufacturer":"SBO","orderIndex":"N","grossPrice":4500,"swdCode":""},{"idProduct":"10554277","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT 40","model":"RADIANT 40 CIC","manufacturer":"SBO","orderIndex":"N","grossPrice":4500,"swdCode":""},{"idProduct":"10554278","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT 40","model":"RADIANT 40 ITC","manufacturer":"SBO","orderIndex":"N","grossPrice":4500,"swdCode":""},{"idProduct":"10554279","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT 40","model":"RADIANT 40 ITE HS","manufacturer":"SBO","orderIndex":"N","grossPrice":4500,"swdCode":""},{"idProduct":"10554280","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT 40","model":"RADIANT 40 ITE FS","manufacturer":"SBO","orderIndex":"N","grossPrice":4500,"swdCode":""},{"idProduct":"10554270","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT 60","model":"RADIANT 60 ITE HS","manufacturer":"SBO","orderIndex":"N","grossPrice":5700,"swdCode":""},{"idProduct":"10554271","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT 60","model":"RADIANT 60 ITE FS","manufacturer":"SBO","orderIndex":"N","grossPrice":5700,"swdCode":""},{"idProduct":"10554268","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT 60","model":"RADIANT 60 CIC","manufacturer":"SBO","orderIndex":"N","grossPrice":5700,"swdCode":""},{"idProduct":"10554267","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT 60","model":"RADIANT 60 IIC","manufacturer":"SBO","orderIndex":"N","grossPrice":5700,"swdCode":""},{"idProduct":"10554266","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT 60","model":"RADIANT 60 MNB T R","manufacturer":"SBO","orderIndex":"N","grossPrice":6100,"swdCode":""},{"idProduct":"10554265","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT 60","model":"RADIANT 60 MNB T","manufacturer":"SBO","orderIndex":"N","grossPrice":5100,"swdCode":""},{"idProduct":"10554264","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT 60","model":"RADIANT 60 MNR T R","manufacturer":"SBO","orderIndex":"N","grossPrice":6400,"swdCode":""},{"idProduct":"10554263","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT 60","model":"RADIANT 60 MNR T","manufacturer":"SBO","orderIndex":"N","grossPrice":5400,"swdCode":""},{"idProduct":"10550283","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT 60","model":"RADIANT 60 ITE FS","manufacturer":"SBO","orderIndex":"N","grossPrice":5850,"swdCode":""},{"idProduct":"10550282","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT 60","model":"RADIANT 60 ITE HS","manufacturer":"SBO","orderIndex":"N","grossPrice":5850,"swdCode":""},{"idProduct":"10550281","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT 60","model":"RADIANT 60 ITC","manufacturer":"SBO","orderIndex":"N","grossPrice":5850,"swdCode":""},{"idProduct":"10550280","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT 60","model":"RADIANT 60 CIC","manufacturer":"SBO","orderIndex":"N","grossPrice":5850,"swdCode":""},{"idProduct":"10550279","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT 60","model":"RADIANT 60 IIC","manufacturer":"SBO","orderIndex":"N","grossPrice":5850,"swdCode":""},{"idProduct":"10550278","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT 60","model":"RADIANT 60 MNB T R","manufacturer":"SBO","orderIndex":"N","grossPrice":6250,"swdCode":""},{"idProduct":"10550277","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT 60","model":"RADIANT 60 MNB T","manufacturer":"SBO","orderIndex":"N","grossPrice":5250,"swdCode":""},{"idProduct":"10550276","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT 60","model":"RADIANT 60 MNR T R","manufacturer":"SBO","orderIndex":"N","grossPrice":6550,"swdCode":""},{"idProduct":"10550275","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT 60","model":"RADIANT 60 MNR T","manufacturer":"SBO","orderIndex":"N","grossPrice":5550,"swdCode":""},{"idProduct":"10554269","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT 60","model":"RADIANT 60 ITC","manufacturer":"SBO","orderIndex":"N","grossPrice":5700,"swdCode":""},{"idProduct":"10550271","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT 80","model":"RADIANT 80 CIC","manufacturer":"SBO","orderIndex":"N","grossPrice":7250,"swdCode":""},{"idProduct":"10554262","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT 80","model":"RADIANT 80 ITE FS","manufacturer":"SBO","orderIndex":"N","grossPrice":7100,"swdCode":""},{"idProduct":"10554261","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT 80","model":"RADIANT 80 ITE HS","manufacturer":"SBO","orderIndex":"N","grossPrice":7100,"swdCode":""},{"idProduct":"10554260","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT 80","model":"RADIANT 80 ITC","manufacturer":"SBO","orderIndex":"N","grossPrice":7100,"swdCode":""},{"idProduct":"10554259","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT 80","model":"RADIANT 80 CIC","manufacturer":"SBO","orderIndex":"N","grossPrice":7100,"swdCode":""},{"idProduct":"10554258","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT 80","model":"RADIANT 80 IIC","manufacturer":"SBO","orderIndex":"N","grossPrice":7100,"swdCode":""},{"idProduct":"10554257","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT 80","model":"RADIANT 80 MNB T R","manufacturer":"SBO","orderIndex":"N","grossPrice":7400,"swdCode":""},{"idProduct":"10554256","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT 80","model":"RADIANT 80 MNB T","manufacturer":"SBO","orderIndex":"N","grossPrice":6600,"swdCode":""},{"idProduct":"10554255","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT 80","model":"RADIANT 80 MNR T R","manufacturer":"SBO","orderIndex":"N","grossPrice":7600,"swdCode":""},{"idProduct":"10554254","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT 80","model":"RADIANT 80 MNR T","manufacturer":"SBO","orderIndex":"N","grossPrice":6800,"swdCode":""},{"idProduct":"10550274","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT 80","model":"RADIANT 80 ITE FS","manufacturer":"SBO","orderIndex":"N","grossPrice":7250,"swdCode":""},{"idProduct":"10550273","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT 80","model":"RADIANT 80 ITE HS","manufacturer":"SBO","orderIndex":"N","grossPrice":7250,"swdCode":""},{"idProduct":"10550272","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT 80","model":"RADIANT 80 ITC","manufacturer":"SBO","orderIndex":"N","grossPrice":7250,"swdCode":""},{"idProduct":"10550270","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT 80","model":"RADIANT 80 IIC","manufacturer":"SBO","orderIndex":"N","grossPrice":7250,"swdCode":""},{"idProduct":"10550269","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT 80","model":"RADIANT 80 MNB T R","manufacturer":"SBO","orderIndex":"N","grossPrice":7550,"swdCode":""},{"idProduct":"10550268","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT 80","model":"RADIANT 80 MNB T","manufacturer":"SBO","orderIndex":"N","grossPrice":6750,"swdCode":""},{"idProduct":"10550267","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT 80","model":"RADIANT 80 MNR T R","manufacturer":"SBO","orderIndex":"N","grossPrice":7750,"swdCode":""},{"idProduct":"10550266","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT 80","model":"RADIANT 80 MNR T","manufacturer":"SBO","orderIndex":"N","grossPrice":6950,"swdCode":""},{"idProduct":"10554235","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT SE 100","model":"RADIANT SE 100 MNB T","manufacturer":"SBO","orderIndex":"N","grossPrice":8900,"swdCode":""},{"idProduct":"10554234","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT SE 100","model":"RADIANT SE 100 MNR T R","manufacturer":"SBO","orderIndex":"N","grossPrice":9200,"swdCode":""},{"idProduct":"10550245","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT SE 100","model":"RADIANT SE 100 MNR T","manufacturer":"SBO","orderIndex":"N","grossPrice":9250,"swdCode":""},{"idProduct":"10550248","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT SE 100","model":"RADIANT SE 100 MNB T R","manufacturer":"SBO","orderIndex":"N","grossPrice":9550,"swdCode":""},{"idProduct":"10550247","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT SE 100","model":"RADIANT SE 100 MNB T","manufacturer":"SBO","orderIndex":"N","grossPrice":9050,"swdCode":""},{"idProduct":"10550246","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT SE 100","model":"RADIANT SE 100 MNR T R","manufacturer":"SBO","orderIndex":"N","grossPrice":9350,"swdCode":""},{"idProduct":"10554236","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT SE 100","model":"RADIANT SE 100 MNB T R","manufacturer":"SBO","orderIndex":"N","grossPrice":9400,"swdCode":""},{"idProduct":"10554233","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT SE 100","model":"RADIANT SE 100 MNR T","manufacturer":"SBO","orderIndex":"N","grossPrice":9100,"swdCode":""},{"idProduct":"10554244","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT SE 60","model":"RADIANT SE 60 MNB T R","manufacturer":"SBO","orderIndex":"N","grossPrice":6300,"swdCode":""},{"idProduct":"10554241","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT SE 60","model":"RADIANT SE 60 MNR T","manufacturer":"SBO","orderIndex":"N","grossPrice":5700,"swdCode":""},{"idProduct":"10550255","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT SE 60","model":"RADIANT SE 60 MNB T","manufacturer":"SBO","orderIndex":"N","grossPrice":5550,"swdCode":""},{"idProduct":"10550254","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT SE 60","model":"RADIANT SE 60 MNR T R","manufacturer":"SBO","orderIndex":"N","grossPrice":6650,"swdCode":""},{"idProduct":"10550253","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT SE 60","model":"RADIANT SE 60 MNR T","manufacturer":"SBO","orderIndex":"N","grossPrice":5850,"swdCode":""},{"idProduct":"10550256","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT SE 60","model":"RADIANT SE 60 MNB T R","manufacturer":"SBO","orderIndex":"N","grossPrice":6450,"swdCode":""},{"idProduct":"10554242","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT SE 60","model":"RADIANT SE 60 MNR T R","manufacturer":"SBO","orderIndex":"N","grossPrice":6500,"swdCode":""},{"idProduct":"10554243","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT SE 60","model":"RADIANT SE 60 MNB T","manufacturer":"SBO","orderIndex":"N","grossPrice":5400,"swdCode":""},{"idProduct":"10550251","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT SE 80","model":"RADIANT SE 80 MNB T","manufacturer":"SBO","orderIndex":"N","grossPrice":7150,"swdCode":""},{"idProduct":"10550250","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT SE 80","model":"RADIANT SE 80 MNR T R","manufacturer":"SBO","orderIndex":"N","grossPrice":8050,"swdCode":""},{"idProduct":"10550249","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT SE 80","model":"RADIANT SE 80 MNR T","manufacturer":"SBO","orderIndex":"N","grossPrice":7350,"swdCode":""},{"idProduct":"10554239","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT SE 80","model":"RADIANT SE 80 MNB T","manufacturer":"SBO","orderIndex":"N","grossPrice":7000,"swdCode":""},{"idProduct":"10554237","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT SE 80","model":"RADIANT SE 80 MNR T","manufacturer":"SBO","orderIndex":"N","grossPrice":7200,"swdCode":""},{"idProduct":"10550252","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT SE 80","model":"RADIANT SE 80 MNB T R","manufacturer":"SBO","orderIndex":"N","grossPrice":7850,"swdCode":""},{"idProduct":"10554240","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT SE 80","model":"RADIANT SE 80 MNB T R","manufacturer":"SBO","orderIndex":"N","grossPrice":7700,"swdCode":""},{"idProduct":"10554238","nfzCode":"P.01.01.00","tradeName":"SONIC RADIANT SE 80","model":"RADIANT SE 80 MNR T R","manufacturer":"SBO","orderIndex":"N","grossPrice":7900,"swdCode":""},{"idProduct":"10550316","nfzCode":"P.01.01.00","tradeName":"SONIC TREK 40","model":"TREK 40 BTE UP","manufacturer":"SBO","orderIndex":"N","grossPrice":4650,"swdCode":""},{"idProduct":"10550318","nfzCode":"P.01.01.00","tradeName":"SONIC TREK 40","model":"TREK 40 BTE SP","manufacturer":"SBO","orderIndex":"N","grossPrice":4650,"swdCode":""},{"idProduct":"10554304","nfzCode":"P.01.01.00","tradeName":"SONIC TREK 40","model":"TREK 40 BTE UP","manufacturer":"SBO","orderIndex":"N","grossPrice":4500,"swdCode":""},{"idProduct":"10554306","nfzCode":"P.01.01.00","tradeName":"SONIC TREK 40","model":"TREK 40 BTE SP","manufacturer":"SBO","orderIndex":"N","grossPrice":4500,"swdCode":""},{"idProduct":"10554305","nfzCode":"P.01.01.00","tradeName":"SONIC TREK 80","model":"TREK 80 BTE SP","manufacturer":"SBO","orderIndex":"N","grossPrice":6700,"swdCode":""},{"idProduct":"10550317","nfzCode":"P.01.01.00","tradeName":"SONIC TREK 80","model":"TREK 80 BTE SP","manufacturer":"SBO","orderIndex":"N","grossPrice":6850,"swdCode":""},{"idProduct":"12910328","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy wewnątrzuszny Audio Service CIC 8.12","model":"CIC 8.12","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":5800,"swdCode":""},{"idProduct":"12910327","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy wewnątrzuszny Audio Service CIC 8.16","model":"CIC 8.16","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":6700,"swdCode":""},{"idProduct":"12910331","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy wewnątrzuszny Audio Service CIC 8.4","model":"CIC 8.4","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":2900,"swdCode":""},{"idProduct":"12910330","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy wewnątrzuszny Audio Service CIC 8.6","model":"CIC 8.6","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":3000,"swdCode":""},{"idProduct":"12910329","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy wewnątrzuszny Audio Service CIC 8.8","model":"CIC 8.8","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":4300,"swdCode":""},{"idProduct":"12910333","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy wewnątrzuszny Audio Service DIC 8.12","model":"DIC 8.12","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":5800,"swdCode":""},{"idProduct":"12910332","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy wewnątrzuszny Audio Service DIC 8.16","model":"DIC 8.16","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":6700,"swdCode":""},{"idProduct":"12910336","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy wewnątrzuszny Audio Service DIC 8.4","model":"DIC 8.4","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":2900,"swdCode":""},{"idProduct":"12910335","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy wewnątrzuszny Audio Service DIC 8.6","model":"DIC 8.6","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":3000,"swdCode":""},{"idProduct":"12910334","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy wewnątrzuszny Audio Service DIC 8.8","model":"DIC 8.8","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":4300,"swdCode":""},{"idProduct":"12909908","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy wewnątrzuszny Signia Insio 1IX ITC","model":"Insio 1IX ITC","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":3200,"swdCode":""},{"idProduct":"12909913","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy wewnątrzuszny Signia Insio 1IX ITE","model":"Insio 1IX ITE","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":3200,"swdCode":""},{"idProduct":"12909907","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy wewnątrzuszny Signia Insio 2IX ITC","model":"Insio 2IX ITC","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":3500,"swdCode":""},{"idProduct":"12909912","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy wewnątrzuszny Signia Insio 2IX ITE","model":"Insio 2IX ITE","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":3500,"swdCode":""},{"idProduct":"12909906","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy wewnątrzuszny Signia Insio 3IX ITC","model":"Insio 3IX ITC","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":4700,"swdCode":""},{"idProduct":"12909911","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy wewnątrzuszny Signia Insio 3IX ITE","model":"Insio 3IX ITE","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":4700,"swdCode":""},{"idProduct":"12909905","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy wewnątrzuszny Signia Insio 5IX ITC","model":"Insio 5IX ITC","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":7300,"swdCode":""},{"idProduct":"12909910","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy wewnątrzuszny Signia Insio 5IX ITE","model":"Insio 5IX ITE","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":7300,"swdCode":""},{"idProduct":"12909904","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy wewnątrzuszny Signia Insio 7IX ITC","model":"Insio 7IX ITC","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":8800,"swdCode":""},{"idProduct":"12909909","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy wewnątrzuszny Signia Insio 7IX ITE","model":"Insio 7IX ITE","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":8800,"swdCode":""},{"idProduct":"11652579","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy wewnątrzuszny Signia Intuis 3","model":"Intuis 3 CIC","manufacturer":"Signia GmbH","orderIndex":"N","grossPrice":2600,"swdCode":""},{"idProduct":"11652577","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy wewnątrzuszny Signia Intuis 3","model":"Intuis 3 IT","manufacturer":"Signia GmbH","orderIndex":"N","grossPrice":2600,"swdCode":""},{"idProduct":"11652578","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy wewnątrzuszny Signia Intuis 3","model":"Intuis 3 CT","manufacturer":"Signia GmbH","orderIndex":"N","grossPrice":2600,"swdCode":""},{"idProduct":"11652593","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy wewnątrzuszny Signia Intuis 3 Click CIC","model":"Intuis 3 Click CIC","manufacturer":"Signia GmbH","orderIndex":"N","grossPrice":2600,"swdCode":""},{"idProduct":"11652592","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy wewnątrzuszny Signia Intuis 3 Click ITC","model":"Intuis 3 Click CT","manufacturer":"Signia GmbH","orderIndex":"N","grossPrice":2600,"swdCode":""},{"idProduct":"11652591","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy wewnątrzuszny Signia Silk 1X","model":"Silk 1X","manufacturer":"Signia GmbH","orderIndex":"N","grossPrice":3200,"swdCode":""},{"idProduct":"11652590","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy wewnątrzuszny Signia Silk 2X","model":"Silk 2X","manufacturer":"Signia GmbH","orderIndex":"N","grossPrice":3500,"swdCode":""},{"idProduct":"11652589","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy wewnątrzuszny Signia Silk 3X","model":"Silk 3X","manufacturer":"Signia GmbH","orderIndex":"N","grossPrice":4700,"swdCode":""},{"idProduct":"11652588","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy wewnątrzuszny Signia Silk 5X","model":"Silk 5X","manufacturer":"Signia GmbH","orderIndex":"N","grossPrice":7300,"swdCode":""},{"idProduct":"11652587","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy wewnątrzuszny Signia Silk 7X","model":"Silk 7X","manufacturer":"Signia GmbH","orderIndex":"N","grossPrice":8800,"swdCode":""},{"idProduct":"11652586","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy wewnątrzuszny Signia Silk C&G 1IX","model":"Silk C&G 1IX","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":3400,"swdCode":""},{"idProduct":"11652585","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy wewnątrzuszny Signia Silk C&G 2IX","model":"Silk C&G 2IX","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":3800,"swdCode":""},{"idProduct":"11652584","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy wewnątrzuszny Signia Silk C&G 3IX","model":"Silk C&G 3IX","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":4900,"swdCode":""},{"idProduct":"11652583","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy wewnątrzuszny Signia Silk C&G 5IX","model":"Silk C&G 5IX","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":7500,"swdCode":""},{"idProduct":"11652582","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy wewnątrzuszny Signia Silk C&G 7IX","model":"Silk C&G 7IX","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":9000,"swdCode":""},{"idProduct":"11653784","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy zauszny Audio Service B M 7.3","model":"B M 7.3","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":2900,"swdCode":""},{"idProduct":"11653783","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy zauszny Audio Service B M 7.4","model":"B M 7.4","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":3000,"swdCode":""},{"idProduct":"11653782","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy zauszny Audio Service B M 7.6","model":"B M 7.6","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":3600,"swdCode":""},{"idProduct":"12910315","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy zauszny Audio Service B P 7.12","model":"B P 7.12","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":6800,"swdCode":""},{"idProduct":"12910314","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy zauszny Audio Service B P 7.16","model":"B P 7.16","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":8300,"swdCode":""},{"idProduct":"12910316","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy zauszny Audio Service B P 7.8","model":"B P 7.8","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":5900,"swdCode":""},{"idProduct":"12910309","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy zauszny Audio Service B P Li 4.2","model":"B SP Li 4.2","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":2700,"swdCode":""},{"idProduct":"12910308","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy zauszny Audio Service B P Li 4.3","model":"B SP Li 4.3","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":2900,"swdCode":""},{"idProduct":"12910307","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy zauszny Audio Service B P Li T 4.4","model":"B SP Li T 4.4","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":3600,"swdCode":""},{"idProduct":"12910306","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy zauszny Audio Service B P Li T 4.6","model":"B SP Li T 4.6","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":3900,"swdCode":""},{"idProduct":"12910318","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy zauszny Audio Service B SP 7.12","model":"B SP 7.12","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":6800,"swdCode":""},{"idProduct":"12910317","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy zauszny Audio Service B SP 7.16","model":"B SP 7.16","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":8300,"swdCode":""},{"idProduct":"12910319","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy zauszny Audio Service B SP 7.8","model":"B SP 7.8","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":5900,"swdCode":""},{"idProduct":"12910305","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy zauszny Audio Service B SP Li 4.2","model":"B SP Li 4.2","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":2700,"swdCode":""},{"idProduct":"12910304","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy zauszny Audio Service B SP Li 4.3","model":"B SP Li 4.3","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":2900,"swdCode":""},{"idProduct":"12910303","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy zauszny Audio Service B SP Li T 4.4","model":"B SP Li T 4.4","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":3600,"swdCode":""},{"idProduct":"12910302","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy zauszny Audio Service B SP Li T 4.6","model":"B SP Li T 4.6","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":3900,"swdCode":""},{"idProduct":"12910326","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy zauszny Audio Service Mood Li-Ion 4 G6","model":"Mood Li-Ion 4 G6","manufacturer":"AS Audio Service GmbH","orderIndex":"N","grossPrice":3800,"swdCode":""},{"idProduct":"12910313","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy zauszny Audio Service R Li 4.2","model":"R Li 4.2","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":2700,"swdCode":""},{"idProduct":"12910312","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy zauszny Audio Service R Li 4.3","model":"R Li 4.3","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":2900,"swdCode":""},{"idProduct":"12910311","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy zauszny Audio Service R Li 4.4","model":"R Li 4.4","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":3500,"swdCode":""},{"idProduct":"12910310","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy zauszny Audio Service R Li 4.6","model":"R Li 4.6","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":3800,"swdCode":""},{"idProduct":"12910322","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy zauszny Audio Service R Li 8.12","model":"R Li 8.12","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":6900,"swdCode":""},{"idProduct":"12910321","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy zauszny Audio Service R Li 8.16","model":"R Li 8.16","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":8500,"swdCode":""},{"idProduct":"12910325","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy zauszny Audio Service R Li 8.4","model":"R Li 8.4","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":4900,"swdCode":""},{"idProduct":"12910324","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy zauszny Audio Service R Li 8.6","model":"R Li 8.6","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":5100,"swdCode":""},{"idProduct":"12910323","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy zauszny Audio Service R Li 8.8","model":"R Li 8.8","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":5950,"swdCode":""},{"idProduct":"10586822","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy zauszny Audio Service Volta P B","model":"Volta P B","manufacturer":"AS Audio-Service GmbH","orderIndex":"N","grossPrice":3000,"swdCode":""},{"idProduct":"11652536","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy zauszny Signia Intuis 3 M","model":"Intuis 3 M","manufacturer":"Signia GmbH","orderIndex":"N","grossPrice":2700,"swdCode":""},{"idProduct":"11652535","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy zauszny Signia Intuis 3 P","model":"Intuis 3 P","manufacturer":"Signia GmbH","orderIndex":"N","grossPrice":2700,"swdCode":""},{"idProduct":"11652551","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy zauszny Signia Intuis 3 RIC 312","model":"Intuis 3 RIC 312","manufacturer":"Signia GmbH","orderIndex":"N","grossPrice":2300,"swdCode":""},{"idProduct":"11652537","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy zauszny Signia Intuis 3 S","model":"Intuis 3 S","manufacturer":"Signia GmbH","orderIndex":"N","grossPrice":2700,"swdCode":""},{"idProduct":"11652534","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy zauszny Signia Intuis 3 SP","model":"Intuis 3 SP","manufacturer":"Signia GmbH","orderIndex":"N","grossPrice":2700,"swdCode":""},{"idProduct":"11652527","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy zauszny Signia Intuis M 4.0","model":"Intuis M 4.0","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":2800,"swdCode":""},{"idProduct":"11652526","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy zauszny Signia Intuis M 4.1","model":"Intuis M 4.1","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":3400,"swdCode":""},{"idProduct":"11652525","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy zauszny Signia Intuis M 4.2","model":"Intuis M 4.2","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":3800,"swdCode":""},{"idProduct":"11652524","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy zauszny Signia Intuis M 4.3","model":"Intuis M 4.3","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":4900,"swdCode":""},{"idProduct":"11652523","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy zauszny Signia Intuis M 4.5","model":"Intuis M 4.5","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":7500,"swdCode":""},{"idProduct":"11652522","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy zauszny Signia Intuis M 4.7","model":"Intuis M 4.7","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":9000,"swdCode":""},{"idProduct":"11652530","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy zauszny Signia Intuis P 4.0","model":"Intuis P 4.0","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":2800,"swdCode":""},{"idProduct":"11652529","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy zauszny Signia Intuis P 4.1","model":"Intuis P 4.1","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":3400,"swdCode":""},{"idProduct":"11652528","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy zauszny Signia Intuis P 4.2","model":"Intuis P 4.2","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":3800,"swdCode":""},{"idProduct":"11652521","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy zauszny Signia Intuis P 4.3","model":"Intuis P 4.3","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":4900,"swdCode":""},{"idProduct":"11652520","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy zauszny Signia Intuis P 4.5","model":"Intuis P 4.5","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":7500,"swdCode":""},{"idProduct":"11652519","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy zauszny Signia Intuis P 4.7","model":"Intuis P 4.7","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":9000,"swdCode":""},{"idProduct":"11652533","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy zauszny Signia Intuis SP 4.0","model":"Intuis SP 4.0","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":2800,"swdCode":""},{"idProduct":"11652532","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy zauszny Signia Intuis SP 4.1","model":"Intuis SP 4.1","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":3400,"swdCode":""},{"idProduct":"11652531","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy zauszny Signia Intuis SP 4.2","model":"Intuis SP 4.2","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":3800,"swdCode":""},{"idProduct":"11652518","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy zauszny Signia Intuis SP 4.3","model":"Intuis SP 4.3","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":4900,"swdCode":""},{"idProduct":"11652517","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy zauszny Signia Intuis SP 4.5","model":"Intuis SP 4.5","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":7500,"swdCode":""},{"idProduct":"11652516","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy zauszny Signia Intuis SP 4.7","model":"Intuis SP 4.7","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":9000,"swdCode":""},{"idProduct":"11652511","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy zauszny Signia Orion C&G P 50","model":"Orion C&G P 50","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":2800,"swdCode":""},{"idProduct":"11652510","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy zauszny Signia Orion C&G P 75","model":"Orion C&G P 75","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":2900,"swdCode":""},{"idProduct":"11652509","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy zauszny Signia Orion C&G P T 100","model":"Orion C&G P T 100","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":3200,"swdCode":""},{"idProduct":"11652508","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy zauszny Signia Orion C&G P T 200","model":"Orion C&G P T 200","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":3600,"swdCode":""},{"idProduct":"11652505","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy zauszny Signia Orion C&G RIC 100","model":"Orion C&G RIC 100","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":3100,"swdCode":""},{"idProduct":"11652504","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy zauszny Signia Orion C&G RIC 200","model":"Orion C&G RIC 200","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":3500,"swdCode":""},{"idProduct":"11652507","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy zauszny Signia Orion C&G RIC 50","model":"Orion C&G RIC 50","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":2600,"swdCode":""},{"idProduct":"11652506","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy zauszny Signia Orion C&G RIC 75","model":"Orion C&G RIC 75","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":2800,"swdCode":""},{"idProduct":"11652515","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy zauszny Signia Orion C&G SP 50","model":"Orion C&G SP 50","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":2800,"swdCode":""},{"idProduct":"11652514","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy zauszny Signia Orion C&G SP 75","model":"Orion C&G SP 75","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":2900,"swdCode":""},{"idProduct":"11652513","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy zauszny Signia Orion C&G SP T 100","model":"Orion C&G SP T 100","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":3200,"swdCode":""},{"idProduct":"11652512","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy zauszny Signia Orion C&G SP T 200","model":"Orion C&G SP T 200","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":3600,"swdCode":""},{"idProduct":"12909898","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy zauszny Signia Pure C&G BCT 3IX","model":"Pure C&G BCT 3IX","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":7500,"swdCode":""},{"idProduct":"12909897","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy zauszny Signia Pure C&G BCT 5IX","model":"Pure C&G BCT 5IX","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":8500,"swdCode":""},{"idProduct":"12909896","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy zauszny Signia Pure C&G BCT 7IX","model":"Pure C&G BCT 7IX","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":11500,"swdCode":""},{"idProduct":"12909894","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy zauszny Signia Sirion Connect P T 75","model":"Sirion Connect P T 75","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":2800,"swdCode":""},{"idProduct":"12909893","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy zauszny Signia Sirion Connect RIC 75","model":"Sirion Connect RIC 75","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":2800,"swdCode":""},{"idProduct":"12909895","nfzCode":"P.01.01.01","tradeName":"Aparat słuchowy zauszny Signia Sirion Connect SP T 75","model":"Sirion Connect SP T 75","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":2800,"swdCode":""},{"idProduct":"12909915","nfzCode":"P.01.01.01","tradeName":"Aparaty słuchowe wewnątrzuszne Signia Kit Active IX","model":"Kit Active IX","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":7800,"swdCode":""},{"idProduct":"12909914","nfzCode":"P.01.01.01","tradeName":"Aparaty słuchowe wewnątrzuszne Signia Kit Active Pro IX","model":"Kit Active Pro IX","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":15600,"swdCode":""},{"idProduct":"12909920","nfzCode":"P.01.01.01","tradeName":"Aparaty słuchowe wewnątrzuszne Signia KIT Silk C&G 1IX","model":"KIT Silk C&G 1IX","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":6800,"swdCode":""},{"idProduct":"12909919","nfzCode":"P.01.01.01","tradeName":"Aparaty słuchowe wewnątrzuszne Signia KIT Silk C&G 2IX","model":"KIT Silk C&G 2IX","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":7600,"swdCode":""},{"idProduct":"12909918","nfzCode":"P.01.01.01","tradeName":"Aparaty słuchowe wewnątrzuszne Signia KIT Silk C&G 3IX","model":"KIT Silk C&G 3IX","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":9800,"swdCode":""},{"idProduct":"12909917","nfzCode":"P.01.01.01","tradeName":"Aparaty słuchowe wewnątrzuszne Signia KIT Silk C&G 5IX","model":"KIT Silk C&G 5IX","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":15000,"swdCode":""},{"idProduct":"12909916","nfzCode":"P.01.01.01","tradeName":"Aparaty słuchowe wewnątrzuszne Signia KIT Silk C&G 7IX","model":"KIT Silk C&G 7IX","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":18000,"swdCode":""},{"idProduct":"12909903","nfzCode":"P.01.01.01","tradeName":"Aparaty słuchowe zauszne Signia KIT Styletto 1IX","model":"KIT Styletto 1IX","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":7800,"swdCode":""},{"idProduct":"12909902","nfzCode":"P.01.01.01","tradeName":"Aparaty słuchowe zauszne Signia KIT Styletto 2IX","model":"KIT Styletto 2IX","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":8800,"swdCode":""},{"idProduct":"12909901","nfzCode":"P.01.01.01","tradeName":"Aparaty słuchowe zauszne Signia KIT Styletto 3IX","model":"KIT Styletto 3IX","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":11000,"swdCode":""},{"idProduct":"12909900","nfzCode":"P.01.01.01","tradeName":"Aparaty słuchowe zauszne Signia KIT Styletto 5IX","model":"KIT Styletto 5IX","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":16800,"swdCode":""},{"idProduct":"12909899","nfzCode":"P.01.01.01","tradeName":"Aparaty słuchowe zauszne Signia KIT Styletto 7IX","model":"KIT Styletto 7IX","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":22000,"swdCode":""},{"idProduct":"12910540","nfzCode":"P.01.01.01","tradeName":"AUDIBEL ARC AI 1000 BTE 13","model":"ARC AI 1000 BTE 13","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":3300,"swdCode":""},{"idProduct":"12910535","nfzCode":"P.01.01.01","tradeName":"AUDIBEL ARC AI 1000 BTE R","model":"ARC AI 1000 BTE R","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":3300,"swdCode":""},{"idProduct":"12910500","nfzCode":"P.01.01.01","tradeName":"AUDIBEL ARC AI 1000 CIC","model":"ARC AI 1000 CIC 2","manufacturer":"4 GHz","orderIndex":"Starkey Hearing Technologies","grossPrice":"N","swdCode":"3300"},{"idProduct":"12910510","nfzCode":"P.01.01.01","tradeName":"AUDIBEL ARC AI 1000 CIC NW","model":"ARC AI 1000 CIC NW","manufacturer":"Starkey Hearing Technologies","orderIndex":"N","grossPrice":3300,"swdCode":""},{"idProduct":"12910505","nfzCode":"P.01.01.01","tradeName":"AUDIBEL ARC AI 1000 ITC R","model":"ARC AI 1000 ITC R","manufacturer":"Starkey Hearing Technologies","orderIndex":"N","grossPrice":3300,"swdCode":""},{"idProduct":"12910530","nfzCode":"P.01.01.01","tradeName":"AUDIBEL ARC AI 1000 ITE R","model":"ARC AI 1000 ITE R","manufacturer":"Starkey Hearing Technologies","orderIndex":"N","grossPrice":3300,"swdCode":""},{"idProduct":"12910525","nfzCode":"P.01.01.01","tradeName":"AUDIBEL ARC AI 1000 MRIC 312","model":"ARC AI 1000 MRIC 312","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":3300,"swdCode":""},{"idProduct":"12910495","nfzCode":"P.01.01.01","tradeName":"AUDIBEL ARC AI 1000 Power Plus BTE","model":"ARC AI 1000 BTE PP","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":3300,"swdCode":""},{"idProduct":"12910515","nfzCode":"P.01.01.01","tradeName":"AUDIBEL ARC AI 1000 RIC 312","model":"ARC AI 1000 RIC 312","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":3300,"swdCode":""},{"idProduct":"12910520","nfzCode":"P.01.01.01","tradeName":"AUDIBEL ARC AI 1000 RIC R","model":"ARC AI 1000 RIC R","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":3300,"swdCode":""},{"idProduct":"12910539","nfzCode":"P.01.01.01","tradeName":"AUDIBEL ARC AI 1200 BTE 13","model":"ARC AI 1200 BTE 13","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":3700,"swdCode":""},{"idProduct":"12910534","nfzCode":"P.01.01.01","tradeName":"AUDIBEL ARC AI 1200 BTE R","model":"ARC AI 1200 BTE R","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":3700,"swdCode":""},{"idProduct":"12910499","nfzCode":"P.01.01.01","tradeName":"AUDIBEL ARC AI 1200 CIC","model":"ARC AI 1200 CIC 2","manufacturer":"4 GHz","orderIndex":"Starkey Hearing Technologies","grossPrice":"N","swdCode":"3700"},{"idProduct":"12910509","nfzCode":"P.01.01.01","tradeName":"AUDIBEL ARC AI 1200 CIC NW","model":"ARC AI 1200 CIC NW","manufacturer":"Starkey Hearing Technologies","orderIndex":"N","grossPrice":3700,"swdCode":""},{"idProduct":"12910504","nfzCode":"P.01.01.01","tradeName":"AUDIBEL ARC AI 1200 ITC R","model":"ARC AI 1200 ITC R","manufacturer":"Starkey Hearing Technologies","orderIndex":"N","grossPrice":3700,"swdCode":""},{"idProduct":"12910529","nfzCode":"P.01.01.01","tradeName":"AUDIBEL ARC AI 1200 ITE R","model":"ARC AI 1200 ITE R","manufacturer":"Starkey Hearing Technologies","orderIndex":"N","grossPrice":3700,"swdCode":""},{"idProduct":"12910524","nfzCode":"P.01.01.01","tradeName":"AUDIBEL ARC AI 1200 MRIC 312","model":"ARC AI 1200 MRIC 312","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":3700,"swdCode":""},{"idProduct":"12910494","nfzCode":"P.01.01.01","tradeName":"AUDIBEL ARC AI 1200 Power Plus BTE","model":"ARC AI 1200 BTE PP","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":3700,"swdCode":""},{"idProduct":"12910514","nfzCode":"P.01.01.01","tradeName":"AUDIBEL ARC AI 1200 RIC 312","model":"ARC AI 1200 RIC 312","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":3700,"swdCode":""},{"idProduct":"12910519","nfzCode":"P.01.01.01","tradeName":"AUDIBEL ARC AI 1200 RIC R","model":"ARC AI 1200 RIC R","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":3700,"swdCode":""},{"idProduct":"12910538","nfzCode":"P.01.01.01","tradeName":"AUDIBEL ARC AI 1600 BTE 13","model":"ARC AI 1600 BTE 13","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":4200,"swdCode":""},{"idProduct":"12910533","nfzCode":"P.01.01.01","tradeName":"AUDIBEL ARC AI 1600 BTE R","model":"ARC AI 1600 BTE R","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":4200,"swdCode":""},{"idProduct":"12910498","nfzCode":"P.01.01.01","tradeName":"AUDIBEL ARC AI 1600 CIC","model":"ARC AI 1600 CIC 2","manufacturer":"4 GHz","orderIndex":"Starkey Hearing Technologies","grossPrice":"N","swdCode":"4200"},{"idProduct":"12910508","nfzCode":"P.01.01.01","tradeName":"AUDIBEL ARC AI 1600 CIC NW","model":"ARC AI 1600 CIC NW","manufacturer":"Starkey Hearing Technologies","orderIndex":"N","grossPrice":4200,"swdCode":""},{"idProduct":"12910543","nfzCode":"P.01.01.01","tradeName":"AUDIBEL ARC AI 1600 IIC NW","model":"ARC AI 1600 IIC NW","manufacturer":"Starkey Hearing Technologies","orderIndex":"N","grossPrice":4200,"swdCode":""},{"idProduct":"12910503","nfzCode":"P.01.01.01","tradeName":"AUDIBEL ARC AI 1600 ITC R","model":"ARC AI 1600 ITC R","manufacturer":"Starkey Hearing Technologies","orderIndex":"N","grossPrice":4200,"swdCode":""},{"idProduct":"12910528","nfzCode":"P.01.01.01","tradeName":"AUDIBEL ARC AI 1600 ITE R","model":"ARC AI 1600 ITE R","manufacturer":"Starkey Hearing Technologies","orderIndex":"N","grossPrice":4200,"swdCode":""},{"idProduct":"12910523","nfzCode":"P.01.01.01","tradeName":"AUDIBEL ARC AI 1600 MRIC 312","model":"ARC AI 1600 MRIC 312","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":4200,"swdCode":""},{"idProduct":"12910493","nfzCode":"P.01.01.01","tradeName":"AUDIBEL ARC AI 1600 Power Plus BTE","model":"ARC AI 1600 BTE PP","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":4200,"swdCode":""},{"idProduct":"12910513","nfzCode":"P.01.01.01","tradeName":"AUDIBEL ARC AI 1600 RIC 312","model":"ARC AI 1600 RIC 312","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":4200,"swdCode":""},{"idProduct":"12910518","nfzCode":"P.01.01.01","tradeName":"AUDIBEL ARC AI 1600 RIC R","model":"ARC AI 1600 RIC R","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":4200,"swdCode":""},{"idProduct":"12910537","nfzCode":"P.01.01.01","tradeName":"AUDIBEL ARC AI 2000 BTE 13","model":"ARC AI 2000 BTE 13","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":5200,"swdCode":""},{"idProduct":"12910532","nfzCode":"P.01.01.01","tradeName":"AUDIBEL ARC AI 2000 BTE R","model":"ARC AI 2000 BTE R","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":5200,"swdCode":""},{"idProduct":"12910497","nfzCode":"P.01.01.01","tradeName":"AUDIBEL ARC AI 2000 CIC","model":"ARC AI 2000 CIC 2","manufacturer":"4 GHz","orderIndex":"Starkey Hearing Technologies","grossPrice":"N","swdCode":"5200"},{"idProduct":"12910507","nfzCode":"P.01.01.01","tradeName":"AUDIBEL ARC AI 2000 CIC NW","model":"ARC AI 2000 CIC NW","manufacturer":"Starkey Hearing Technologies","orderIndex":"N","grossPrice":5200,"swdCode":""},{"idProduct":"12910542","nfzCode":"P.01.01.01","tradeName":"AUDIBEL ARC AI 2000 IIC NW","model":"ARC AI 2000 IIC NW","manufacturer":"Starkey Hearing Technologies","orderIndex":"N","grossPrice":5200,"swdCode":""},{"idProduct":"12910502","nfzCode":"P.01.01.01","tradeName":"AUDIBEL ARC AI 2000 ITC R","model":"ARC AI 2000 ITC R","manufacturer":"Starkey Hearing Technologies","orderIndex":"N","grossPrice":5200,"swdCode":""},{"idProduct":"12910527","nfzCode":"P.01.01.01","tradeName":"AUDIBEL ARC AI 2000 ITE R","model":"ARC AI 2000 ITE R","manufacturer":"Starkey Hearing Technologies","orderIndex":"N","grossPrice":5200,"swdCode":""},{"idProduct":"12910522","nfzCode":"P.01.01.01","tradeName":"AUDIBEL ARC AI 2000 MRIC 312","model":"ARC AI 2000 MRIC 312","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":5200,"swdCode":""},{"idProduct":"12910492","nfzCode":"P.01.01.01","tradeName":"AUDIBEL ARC AI 2000 Power Plus BTE","model":"ARC AI 2000 BTE PP","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":7200,"swdCode":""},{"idProduct":"12910512","nfzCode":"P.01.01.01","tradeName":"AUDIBEL ARC AI 2000 RIC 312","model":"ARC AI 2000 RIC 312","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":5200,"swdCode":""},{"idProduct":"12910517","nfzCode":"P.01.01.01","tradeName":"AUDIBEL ARC AI 2000 RIC R","model":"ARC AI 2000 RIC R","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":5200,"swdCode":""},{"idProduct":"12910536","nfzCode":"P.01.01.01","tradeName":"AUDIBEL ARC AI 2400 BTE 13","model":"ARC AI 2400 BTE 13","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":7200,"swdCode":""},{"idProduct":"12910531","nfzCode":"P.01.01.01","tradeName":"AUDIBEL ARC AI 2400 BTE R","model":"ARC AI 2400 BTE R","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":7200,"swdCode":""},{"idProduct":"12910496","nfzCode":"P.01.01.01","tradeName":"AUDIBEL ARC AI 2400 CIC","model":"ARC AI 2400 CIC 2","manufacturer":"4 GHz","orderIndex":"Starkey Hearing Technologies","grossPrice":"N","swdCode":"7200"},{"idProduct":"12910506","nfzCode":"P.01.01.01","tradeName":"AUDIBEL ARC AI 2400 CIC NW","model":"ARC AI 2400 CIC NW","manufacturer":"Starkey Hearing Technologies","orderIndex":"N","grossPrice":7200,"swdCode":""},{"idProduct":"12910541","nfzCode":"P.01.01.01","tradeName":"AUDIBEL ARC AI 2400 IIC NW","model":"ARC AI 2400 IIC NW","manufacturer":"Starkey Hearing Technologies","orderIndex":"N","grossPrice":7200,"swdCode":""},{"idProduct":"12910501","nfzCode":"P.01.01.01","tradeName":"AUDIBEL ARC AI 2400 ITC R","model":"ARC AI 2400 ITC R","manufacturer":"Starkey Hearing Technologies","orderIndex":"N","grossPrice":7200,"swdCode":""},{"idProduct":"12910526","nfzCode":"P.01.01.01","tradeName":"AUDIBEL ARC AI 2400 ITE R","model":"ARC AI 2400 ITE R","manufacturer":"Starkey Hearing Technologies","orderIndex":"N","grossPrice":7200,"swdCode":""},{"idProduct":"12910521","nfzCode":"P.01.01.01","tradeName":"AUDIBEL ARC AI 2400 MRIC 312","model":"ARC AI 2400 MRIC 312","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":7200,"swdCode":""},{"idProduct":"12910491","nfzCode":"P.01.01.01","tradeName":"AUDIBEL ARC AI 2400 Power Plus BTE","model":"ARC AI 2400 BTE PP","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":7200,"swdCode":""},{"idProduct":"12910511","nfzCode":"P.01.01.01","tradeName":"AUDIBEL ARC AI 2400 RIC 312","model":"ARC AI 2400 RIC 312","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":7200,"swdCode":""},{"idProduct":"12910516","nfzCode":"P.01.01.01","tradeName":"AUDIBEL ARC AI 2400 RIC R","model":"ARC AI 2400 RIC R","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":7200,"swdCode":""},{"idProduct":"12910477","nfzCode":"P.01.01.01","tradeName":"Audibel Intrigue AI 16 CIC","model":"Intrigue AI 16 CIC","manufacturer":"Starkey Hearing Technologies","orderIndex":"N","grossPrice":4800,"swdCode":""},{"idProduct":"12910471","nfzCode":"P.01.01.01","tradeName":"Audibel Intrigue AI 16 CIC NW","model":"Intrigue AI 16 CIC NW","manufacturer":"Starkey Hearing Technologies","orderIndex":"N","grossPrice":4800,"swdCode":""},{"idProduct":"12910474","nfzCode":"P.01.01.01","tradeName":"Audibel Intrigue AI 16 IIC NW","model":"Intrigue AI 16 IIC NW","manufacturer":"Starkey Hearing Technologies","orderIndex":"N","grossPrice":4800,"swdCode":""},{"idProduct":"12910483","nfzCode":"P.01.01.01","tradeName":"Audibel Intrigue AI 16 ITC R","model":"Intrigue AI 16 ITC R","manufacturer":"Starkey Hearing Technologies","orderIndex":"N","grossPrice":4800,"swdCode":""},{"idProduct":"12910480","nfzCode":"P.01.01.01","tradeName":"Audibel Intrigue AI 16 ITE R","model":"Intrigue AI 16 ITE R","manufacturer":"Starkey Hearing Technologies","orderIndex":"N","grossPrice":4800,"swdCode":""},{"idProduct":"12910465","nfzCode":"P.01.01.01","tradeName":"Audibel Intrigue AI 16 mRIC R","model":"Intrigue AI 16 mRIC R","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":4800,"swdCode":""},{"idProduct":"12910468","nfzCode":"P.01.01.01","tradeName":"Audibel Intrigue AI 16 RIC 312","model":"Intrigue AI 16 RIC 312","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":4700,"swdCode":""},{"idProduct":"12910462","nfzCode":"P.01.01.01","tradeName":"Audibel Intrigue AI 16 RIC RT","model":"Intrigue AI 16 RIC RT","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":4800,"swdCode":""},{"idProduct":"12910476","nfzCode":"P.01.01.01","tradeName":"Audibel Intrigue AI 20 CIC","model":"Intrigue AI 20 CIC","manufacturer":"Starkey Hearing Technologies","orderIndex":"N","grossPrice":5800,"swdCode":""},{"idProduct":"12910470","nfzCode":"P.01.01.01","tradeName":"Audibel Intrigue AI 20 CIC NW","model":"Intrigue AI 20 CIC NW","manufacturer":"Starkey Hearing Technologies","orderIndex":"N","grossPrice":5800,"swdCode":""},{"idProduct":"12910473","nfzCode":"P.01.01.01","tradeName":"Audibel Intrigue AI 20 IIC NW","model":"Intrigue AI 20 IIC NW","manufacturer":"Starkey Hearing Technologies","orderIndex":"N","grossPrice":5800,"swdCode":""},{"idProduct":"12910482","nfzCode":"P.01.01.01","tradeName":"Audibel Intrigue AI 20 ITC R","model":"Intrigue AI 20 ITC R","manufacturer":"Starkey Hearing Technologies","orderIndex":"N","grossPrice":5800,"swdCode":""},{"idProduct":"12910479","nfzCode":"P.01.01.01","tradeName":"Audibel Intrigue AI 20 ITE R","model":"Intrigue AI 20 ITE R","manufacturer":"Starkey Hearing Technologies","orderIndex":"N","grossPrice":5800,"swdCode":""},{"idProduct":"12910464","nfzCode":"P.01.01.01","tradeName":"Audibel Intrigue AI 20 mRIC R","model":"Intrigue AI 20 mRIC R","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":5800,"swdCode":""},{"idProduct":"12910467","nfzCode":"P.01.01.01","tradeName":"Audibel Intrigue AI 20 RIC 312","model":"Intrigue AI 20 RIC 312","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":5700,"swdCode":""},{"idProduct":"12910461","nfzCode":"P.01.01.01","tradeName":"Audibel Intrigue AI 20 RIC RT","model":"Intrigue AI 20 RIC RT","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":5800,"swdCode":""},{"idProduct":"12910475","nfzCode":"P.01.01.01","tradeName":"Audibel Intrigue AI 24 CIC","model":"Intrigue AI 24 CIC","manufacturer":"Starkey Hearing Technologies","orderIndex":"N","grossPrice":8300,"swdCode":""},{"idProduct":"12910469","nfzCode":"P.01.01.01","tradeName":"Audibel Intrigue AI 24 CIC NW","model":"Intrigue AI 24 CIC NW","manufacturer":"Starkey Hearing Technologies","orderIndex":"N","grossPrice":8300,"swdCode":""},{"idProduct":"12910472","nfzCode":"P.01.01.01","tradeName":"Audibel Intrigue AI 24 IIC NW","model":"Intrigue AI 24 IIC NW","manufacturer":"Starkey Hearing Technologies","orderIndex":"N","grossPrice":8300,"swdCode":""},{"idProduct":"12910481","nfzCode":"P.01.01.01","tradeName":"Audibel Intrigue AI 24 ITC R","model":"Intrigue AI 24 ITC R","manufacturer":"Starkey Hearing Technologies","orderIndex":"N","grossPrice":8300,"swdCode":""},{"idProduct":"12910478","nfzCode":"P.01.01.01","tradeName":"Audibel Intrigue AI 24 ITE R","model":"Intrigue AI 24 ITE R","manufacturer":"Starkey Hearing Technologies","orderIndex":"N","grossPrice":8300,"swdCode":""},{"idProduct":"12910463","nfzCode":"P.01.01.01","tradeName":"Audibel Intrigue AI 24 mRIC R","model":"Intrigue AI 24 mRIC R","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":8300,"swdCode":""},{"idProduct":"12910466","nfzCode":"P.01.01.01","tradeName":"Audibel Intrigue AI 24 RIC 312","model":"Intrigue AI 24 RIC 312","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":8200,"swdCode":""},{"idProduct":"12910460","nfzCode":"P.01.01.01","tradeName":"Audibel Intrigue AI 24 RIC RT","model":"Intrigue AI 24 RIC RT","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":8300,"swdCode":""},{"idProduct":"12910453","nfzCode":"P.01.01.01","tradeName":"Audibel Vitality AI 16 CIC","model":"Vitality AI 16 CIC","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":5200,"swdCode":""},{"idProduct":"12910459","nfzCode":"P.01.01.01","tradeName":"Audibel Vitality AI 16 ITC R","model":"Vitality AI 16 ITC R","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":5200,"swdCode":""},{"idProduct":"12910456","nfzCode":"P.01.01.01","tradeName":"Audibel Vitality AI 16 ITE R","model":"Vitality AI 16 ITE R","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":5200,"swdCode":""},{"idProduct":"12910447","nfzCode":"P.01.01.01","tradeName":"Audibel Vitality AI 16 mRIC R","model":"Vitality AI 16 mRIC R","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":5200,"swdCode":""},{"idProduct":"12910450","nfzCode":"P.01.01.01","tradeName":"Audibel Vitality AI 16 RIC 312","model":"Vitality AI 16 RIC 312","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":5200,"swdCode":""},{"idProduct":"12910444","nfzCode":"P.01.01.01","tradeName":"Audibel Vitality AI 16 RIC RT","model":"Vitality AI 16 RIC RT","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":5200,"swdCode":""},{"idProduct":"12910452","nfzCode":"P.01.01.01","tradeName":"Audibel Vitality AI 20 CIC","model":"Vitality AI 20 CIC","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":6300,"swdCode":""},{"idProduct":"12910458","nfzCode":"P.01.01.01","tradeName":"Audibel Vitality AI 20 ITC R","model":"Vitality AI 20 ITC R","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":6300,"swdCode":""},{"idProduct":"12910455","nfzCode":"P.01.01.01","tradeName":"Audibel Vitality AI 20 ITE R","model":"Vitality AI 20 ITE R","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":6300,"swdCode":""},{"idProduct":"12910446","nfzCode":"P.01.01.01","tradeName":"Audibel Vitality AI 20 mRIC R","model":"Vitality AI 20 mRIC R","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":6300,"swdCode":""},{"idProduct":"12910449","nfzCode":"P.01.01.01","tradeName":"Audibel Vitality AI 20 RIC 312","model":"Vitality AI 20 RIC 312","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":6300,"swdCode":""},{"idProduct":"12910443","nfzCode":"P.01.01.01","tradeName":"Audibel Vitality AI 20 RIC RT","model":"Vitality AI 20 RIC RT","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":6300,"swdCode":""},{"idProduct":"12910451","nfzCode":"P.01.01.01","tradeName":"Audibel Vitality AI 24 CIC","model":"Vitality AI 24 CIC","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":9300,"swdCode":""},{"idProduct":"12910457","nfzCode":"P.01.01.01","tradeName":"Audibel Vitality AI 24 ITC R","model":"Vitality AI 24 ITC R","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":9300,"swdCode":""},{"idProduct":"12910454","nfzCode":"P.01.01.01","tradeName":"Audibel Vitality AI 24 ITE R","model":"Vitality AI 24 ITE R","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":9300,"swdCode":""},{"idProduct":"12910445","nfzCode":"P.01.01.01","tradeName":"Audibel Vitality AI 24 mRIC R","model":"Vitality AI 24 mRIC R","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":9300,"swdCode":""},{"idProduct":"12910448","nfzCode":"P.01.01.01","tradeName":"Audibel Vitality AI 24 RIC 312","model":"Vitality AI 24 RIC 312","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":9300,"swdCode":""},{"idProduct":"12910442","nfzCode":"P.01.01.01","tradeName":"Audibel Vitality AI 24 RIC RT","model":"Vitality AI 24 RIC RT","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":9300,"swdCode":""},{"idProduct":"10554201","nfzCode":"P.01.01.01","tradeName":"BERNAFON ALPHA 1 CIC","model":"ALPHA 1 CIC","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":3600,"swdCode":""},{"idProduct":"10554202","nfzCode":"P.01.01.01","tradeName":"BERNAFON ALPHA 1 IIC","model":"ALPHA 1 IIC","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":3600,"swdCode":""},{"idProduct":"10554200","nfzCode":"P.01.01.01","tradeName":"BERNAFON ALPHA 1 ITC","model":"ALPHA 1 ITC","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":3600,"swdCode":""},{"idProduct":"10554199","nfzCode":"P.01.01.01","tradeName":"BERNAFON ALPHA 1 ITE FS","model":"ALPHA 1 ITE FS","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":3600,"swdCode":""},{"idProduct":"10554198","nfzCode":"P.01.01.01","tradeName":"BERNAFON ALPHA 1 ITE HS","model":"ALPHA 1 ITE HS","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":3600,"swdCode":""},{"idProduct":"10554197","nfzCode":"P.01.01.01","tradeName":"BERNAFON ALPHA 1 MNB T","model":"ALPHA 1 miniBTE T","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":3300,"swdCode":""},{"idProduct":"10554196","nfzCode":"P.01.01.01","tradeName":"BERNAFON ALPHA 1 MNB T R","model":"ALPHA 1 miniBTE T R","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":3700,"swdCode":""},{"idProduct":"10554195","nfzCode":"P.01.01.01","tradeName":"BERNAFON ALPHA 1 MNR T","model":"ALPHA 1 miniRITE T","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":3400,"swdCode":""},{"idProduct":"10554194","nfzCode":"P.01.01.01","tradeName":"BERNAFON ALPHA 1 MNR T R","model":"ALPHA 1 miniRITE T R","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":3700,"swdCode":""},{"idProduct":"10554192","nfzCode":"P.01.01.01","tradeName":"BERNAFON ALPHA 3 CIC","model":"ALPHA 3 CIC","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":4400,"swdCode":""},{"idProduct":"10554193","nfzCode":"P.01.01.01","tradeName":"BERNAFON ALPHA 3 IIC","model":"ALPHA 3 IIC","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":4400,"swdCode":""},{"idProduct":"10554191","nfzCode":"P.01.01.01","tradeName":"BERNAFON ALPHA 3 ITC","model":"ALPHA 3 ITC","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":4400,"swdCode":""},{"idProduct":"10554190","nfzCode":"P.01.01.01","tradeName":"BERNAFON ALPHA 3 ITE FS","model":"ALPHA 3 ITE FS","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":4400,"swdCode":""},{"idProduct":"10554189","nfzCode":"P.01.01.01","tradeName":"BERNAFON ALPHA 3 ITE HS","model":"ALPHA 3 ITE HS","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":4400,"swdCode":""},{"idProduct":"10554188","nfzCode":"P.01.01.01","tradeName":"BERNAFON ALPHA 3 MNB T","model":"ALPHA 3 miniBTE T","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":4000,"swdCode":""},{"idProduct":"10554187","nfzCode":"P.01.01.01","tradeName":"BERNAFON ALPHA 3 MNB T R","model":"ALPHA 3 miniBTE T R","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":4400,"swdCode":""},{"idProduct":"10554186","nfzCode":"P.01.01.01","tradeName":"BERNAFON ALPHA 3 MNR T","model":"ALPHA 3 miniRITE T","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":4100,"swdCode":""},{"idProduct":"10554185","nfzCode":"P.01.01.01","tradeName":"BERNAFON ALPHA 3 MNR T R","model":"ALPHA 3 miniRITE T R","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":4400,"swdCode":""},{"idProduct":"10554183","nfzCode":"P.01.01.01","tradeName":"BERNAFON ALPHA 5 CIC","model":"ALPHA 5 CIC","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":5400,"swdCode":""},{"idProduct":"10554184","nfzCode":"P.01.01.01","tradeName":"BERNAFON ALPHA 5 IIC","model":"ALPHA 5 IIC","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":5400,"swdCode":""},{"idProduct":"10554182","nfzCode":"P.01.01.01","tradeName":"BERNAFON ALPHA 5 ITC","model":"ALPHA 5 ITC","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":5400,"swdCode":""},{"idProduct":"10554181","nfzCode":"P.01.01.01","tradeName":"BERNAFON ALPHA 5 ITE FS","model":"ALPHA 5 ITE FS","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":5400,"swdCode":""},{"idProduct":"10554180","nfzCode":"P.01.01.01","tradeName":"BERNAFON ALPHA 5 ITE HS","model":"ALPHA 5 ITE HS","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":5400,"swdCode":""},{"idProduct":"10554179","nfzCode":"P.01.01.01","tradeName":"BERNAFON ALPHA 5 MNB T","model":"ALPHA 5 miniBTE T","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":5100,"swdCode":""},{"idProduct":"10554178","nfzCode":"P.01.01.01","tradeName":"BERNAFON ALPHA 5 MNB T R","model":"ALPHA 5 miniBTE T R","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":5400,"swdCode":""},{"idProduct":"10554177","nfzCode":"P.01.01.01","tradeName":"BERNAFON ALPHA 5 MNR T","model":"ALPHA 5 miniRITE T","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":5200,"swdCode":""},{"idProduct":"10554176","nfzCode":"P.01.01.01","tradeName":"BERNAFON ALPHA 5 MNR T R","model":"ALPHA 5 miniRITE T R","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":5400,"swdCode":""},{"idProduct":"10554174","nfzCode":"P.01.01.01","tradeName":"BERNAFON ALPHA 7 CIC","model":"ALPHA 7 CIC","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":7000,"swdCode":""},{"idProduct":"10554175","nfzCode":"P.01.01.01","tradeName":"BERNAFON ALPHA 7 IIC","model":"ALPHA 7 IIC","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":7000,"swdCode":""},{"idProduct":"10554173","nfzCode":"P.01.01.01","tradeName":"BERNAFON ALPHA 7 ITC","model":"ALPHA 7 ITC","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":7000,"swdCode":""},{"idProduct":"10554172","nfzCode":"P.01.01.01","tradeName":"BERNAFON ALPHA 7 ITE FS","model":"ALPHA 7 ITE FS","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":7000,"swdCode":""},{"idProduct":"10554171","nfzCode":"P.01.01.01","tradeName":"BERNAFON ALPHA 7 ITE HS","model":"ALPHA 7 ITE HS","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":7000,"swdCode":""},{"idProduct":"10554170","nfzCode":"P.01.01.01","tradeName":"BERNAFON ALPHA 7 MNB T","model":"ALPHA 7 miniBTE T","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":6800,"swdCode":""},{"idProduct":"10554169","nfzCode":"P.01.01.01","tradeName":"BERNAFON ALPHA 7 MNB T R","model":"ALPHA 7 miniBTE T R","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":7000,"swdCode":""},{"idProduct":"10554168","nfzCode":"P.01.01.01","tradeName":"BERNAFON ALPHA 7 MNR T","model":"ALPHA 7 miniRITE T","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":6800,"swdCode":""},{"idProduct":"10554167","nfzCode":"P.01.01.01","tradeName":"BERNAFON ALPHA 7 MNR T R","model":"ALPHA 7 miniRITE T R","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":7000,"swdCode":""},{"idProduct":"10554165","nfzCode":"P.01.01.01","tradeName":"BERNAFON ALPHA 9 CIC","model":"ALPHA 9 CIC","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":8500,"swdCode":""},{"idProduct":"10554166","nfzCode":"P.01.01.01","tradeName":"BERNAFON ALPHA 9 IIC","model":"ALPHA 9 IIC","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":8500,"swdCode":""},{"idProduct":"10554164","nfzCode":"P.01.01.01","tradeName":"BERNAFON ALPHA 9 ITC","model":"ALPHA 9 ITC","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":8500,"swdCode":""},{"idProduct":"10554163","nfzCode":"P.01.01.01","tradeName":"BERNAFON ALPHA 9 ITE FS","model":"ALPHA 9 ITE FS","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":8500,"swdCode":""},{"idProduct":"10554162","nfzCode":"P.01.01.01","tradeName":"BERNAFON ALPHA 9 ITE HS","model":"ALPHA 9 ITE HS","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":8500,"swdCode":""},{"idProduct":"10554161","nfzCode":"P.01.01.01","tradeName":"BERNAFON ALPHA 9 MNB T","model":"ALPHA 9 miniBTE T","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":8300,"swdCode":""},{"idProduct":"10554160","nfzCode":"P.01.01.01","tradeName":"BERNAFON ALPHA 9 MNB T R","model":"ALPHA 9 miniBTE T R","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":8500,"swdCode":""},{"idProduct":"10554159","nfzCode":"P.01.01.01","tradeName":"BERNAFON ALPHA 9 MNR T","model":"ALPHA 9 miniRITE T","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":8300,"swdCode":""},{"idProduct":"10554158","nfzCode":"P.01.01.01","tradeName":"BERNAFON ALPHA 9 MNR T R","model":"ALPHA 9 miniRITE T R","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":8500,"swdCode":""},{"idProduct":"10554157","nfzCode":"P.01.01.01","tradeName":"BERNAFON ALPHA XT 5 MNB T","model":"ALPHA XT 5 miniBTE T","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":6500,"swdCode":""},{"idProduct":"10554156","nfzCode":"P.01.01.01","tradeName":"BERNAFON ALPHA XT 5 MNB T R","model":"ALPHA XT 5 miniBTE T R","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":7100,"swdCode":""},{"idProduct":"10554155","nfzCode":"P.01.01.01","tradeName":"BERNAFON ALPHA XT 5 MNR T","model":"ALPHA XT 5 miniRITE T","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":6500,"swdCode":""},{"idProduct":"10554154","nfzCode":"P.01.01.01","tradeName":"BERNAFON ALPHA XT 5 MNR T R","model":"ALPHA XT 5 miniRITE T R","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":7100,"swdCode":""},{"idProduct":"10554153","nfzCode":"P.01.01.01","tradeName":"BERNAFON ALPHA XT 7 MNB T","model":"ALPHA XT 7 miniBTE T","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":7800,"swdCode":""},{"idProduct":"10554152","nfzCode":"P.01.01.01","tradeName":"BERNAFON ALPHA XT 7 MNB T R","model":"ALPHA XT 7 miniBTE T R","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":8300,"swdCode":""},{"idProduct":"10554151","nfzCode":"P.01.01.01","tradeName":"BERNAFON ALPHA XT 7 MNR T","model":"ALPHA XT 7 miniRITE T","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":7800,"swdCode":""},{"idProduct":"10554150","nfzCode":"P.01.01.01","tradeName":"BERNAFON ALPHA XT 7 MNR T R","model":"ALPHA XT 7 miniRITE T R","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":8500,"swdCode":""},{"idProduct":"10554149","nfzCode":"P.01.01.01","tradeName":"BERNAFON ALPHA XT 9 MNB T","model":"ALPHA XT 9 miniBTE T","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":9900,"swdCode":""},{"idProduct":"10554148","nfzCode":"P.01.01.01","tradeName":"BERNAFON ALPHA XT 9 MNB T R","model":"ALPHA XT 9 miniBTE T R","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":10300,"swdCode":""},{"idProduct":"10554147","nfzCode":"P.01.01.01","tradeName":"BERNAFON ALPHA XT 9 MNR T","model":"ALPHA XT 9 miniRITE T","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":9900,"swdCode":""},{"idProduct":"10554146","nfzCode":"P.01.01.01","tradeName":"BERNAFON ALPHA XT 9 MNR T R","model":"ALPHA XT 9 miniRITE T R","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":10500,"swdCode":""},{"idProduct":"12910196","nfzCode":"P.01.01.01","tradeName":"BERNAFON ENCANTA 100 CIC","model":"ENCANTA 100 CIC","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":4800,"swdCode":""},{"idProduct":"12910197","nfzCode":"P.01.01.01","tradeName":"BERNAFON ENCANTA 100 IIC","model":"ENCANTA 100 IIC","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":4800,"swdCode":""},{"idProduct":"12910195","nfzCode":"P.01.01.01","tradeName":"BERNAFON ENCANTA 100 MNB R","model":"ENCANTA 100 MNB R","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":5000,"swdCode":""},{"idProduct":"12910194","nfzCode":"P.01.01.01","tradeName":"BERNAFON ENCANTA 100 MNR","model":"ENCANTA 100 MNR","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":5000,"swdCode":""},{"idProduct":"12910192","nfzCode":"P.01.01.01","tradeName":"BERNAFON ENCANTA 200 CIC","model":"ENCANCTA 200 CIC","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":6800,"swdCode":""},{"idProduct":"12910193","nfzCode":"P.01.01.01","tradeName":"BERNAFON ENCANTA 200 IIC","model":"ENCANCTA 200 IIC","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":6800,"swdCode":""},{"idProduct":"12910191","nfzCode":"P.01.01.01","tradeName":"BERNAFON ENCANTA 200 MNB R","model":"ENCANTA 200 MNB R","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":7000,"swdCode":""},{"idProduct":"12910190","nfzCode":"P.01.01.01","tradeName":"BERNAFON ENCANTA 200 MNR","model":"ENCANTA 200 MNR","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":7000,"swdCode":""},{"idProduct":"12910188","nfzCode":"P.01.01.01","tradeName":"BERNAFON ENCANTA 300 CIC","model":"ENCANTA 300 CIC","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":8500,"swdCode":""},{"idProduct":"12910189","nfzCode":"P.01.01.01","tradeName":"BERNAFON ENCANTA 300 IIC","model":"ENCANTA 300 IIC","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":8500,"swdCode":""},{"idProduct":"12910187","nfzCode":"P.01.01.01","tradeName":"BERNAFON ENCANTA 300 MNB R","model":"ENCANTA 300 MNB R","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":8700,"swdCode":""},{"idProduct":"12910186","nfzCode":"P.01.01.01","tradeName":"BERNAFON ENCANTA 300 MNR","model":"ENCANTA 300 MNR","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":8700,"swdCode":""},{"idProduct":"12910184","nfzCode":"P.01.01.01","tradeName":"BERNAFON ENCANTA 400 CIC","model":"ENCANTA 400 CIC","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":10500,"swdCode":""},{"idProduct":"12910185","nfzCode":"P.01.01.01","tradeName":"BERNAFON ENCANTA 400 IIC","model":"ENCANTA 400 IIC","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":10500,"swdCode":""},{"idProduct":"12910183","nfzCode":"P.01.01.01","tradeName":"BERNAFON ENCANTA 400 MNB R","model":"ENCANTA 400 MNB R","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":10700,"swdCode":""},{"idProduct":"12910182","nfzCode":"P.01.01.01","tradeName":"BERNAFON ENCANTA 400 MNR","model":"ENCANTA 400 MNR","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":10700,"swdCode":""},{"idProduct":"12910219","nfzCode":"P.01.01.01","tradeName":"BERNAFON ENTRA A 1 B105","model":"ENTRA A 1 B 105","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":2000,"swdCode":""},{"idProduct":"12910217","nfzCode":"P.01.01.01","tradeName":"BERNAFON ENTRA A 1 MNR","model":"ENTRA A 1 MiniRITE","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":2500,"swdCode":""},{"idProduct":"12910218","nfzCode":"P.01.01.01","tradeName":"BERNAFON ENTRA A 1 MNR T","model":"ENTRA A 1 MiniRITE T","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":2500,"swdCode":""},{"idProduct":"12910216","nfzCode":"P.01.01.01","tradeName":"BERNAFON ENTRA A 2 B105","model":"ENTRA A 2 B 105","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":2700,"swdCode":""},{"idProduct":"12910214","nfzCode":"P.01.01.01","tradeName":"BERNAFON ENTRA B 10 CIC","model":"ENTRA B10 CIC","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":3700,"swdCode":""},{"idProduct":"12910215","nfzCode":"P.01.01.01","tradeName":"BERNAFON ENTRA B 10 IIC","model":"ENTRA B10 IIC","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":3700,"swdCode":""},{"idProduct":"12910213","nfzCode":"P.01.01.01","tradeName":"BERNAFON ENTRA B 10 ITC","model":"ENTRA B10 ITC","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":3700,"swdCode":""},{"idProduct":"12910211","nfzCode":"P.01.01.01","tradeName":"BERNAFON ENTRA B 10 ITE FS","model":"ENTRA B10 ITE FS","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":3700,"swdCode":""},{"idProduct":"12910212","nfzCode":"P.01.01.01","tradeName":"BERNAFON ENTRA B 10 ITE HS","model":"ENTRA B10 ITE HS","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":3700,"swdCode":""},{"idProduct":"12910210","nfzCode":"P.01.01.01","tradeName":"BERNAFON ENTRA B 10 MNB T","model":"ENTRA B10 miniBTE T","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":3300,"swdCode":""},{"idProduct":"12910207","nfzCode":"P.01.01.01","tradeName":"BERNAFON ENTRA B 10 MNB T R","model":"ENTRA B10 miniBTE T R","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":3850,"swdCode":""},{"idProduct":"12910209","nfzCode":"P.01.01.01","tradeName":"BERNAFON ENTRA B 10 MNR T","model":"ENTRA B10 miniRITE T","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":3300,"swdCode":""},{"idProduct":"12910208","nfzCode":"P.01.01.01","tradeName":"BERNAFON ENTRA B 10 MNR T R","model":"ENTRA B10 miniRITE T R","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":3850,"swdCode":""},{"idProduct":"12910205","nfzCode":"P.01.01.01","tradeName":"BERNAFON ENTRA B 20 CIC","model":"ENTRA B20 CIC","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":4700,"swdCode":""},{"idProduct":"12910206","nfzCode":"P.01.01.01","tradeName":"BERNAFON ENTRA B 20 IIC","model":"ENTRA B20 IIC","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":4700,"swdCode":""},{"idProduct":"12910204","nfzCode":"P.01.01.01","tradeName":"BERNAFON ENTRA B 20 ITC","model":"ENTRA B20 ITC","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":4700,"swdCode":""},{"idProduct":"12910202","nfzCode":"P.01.01.01","tradeName":"BERNAFON ENTRA B 20 ITE FS","model":"ENTRA B20 ITE FS","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":4700,"swdCode":""},{"idProduct":"12910203","nfzCode":"P.01.01.01","tradeName":"BERNAFON ENTRA B 20 ITE HS","model":"ENTRA B20 ITE HS","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":4700,"swdCode":""},{"idProduct":"12910201","nfzCode":"P.01.01.01","tradeName":"BERNAFON ENTRA B 20 MNB T","model":"ENTRA B20 miniBTE T","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":4350,"swdCode":""},{"idProduct":"12910198","nfzCode":"P.01.01.01","tradeName":"BERNAFON ENTRA B 20 MNB T R","model":"ENTRA B20 miniBTE T R","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":4850,"swdCode":""},{"idProduct":"12910200","nfzCode":"P.01.01.01","tradeName":"BERNAFON ENTRA B 20 MNR T","model":"ENTRA B20 miniRITE T","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":4350,"swdCode":""},{"idProduct":"12910199","nfzCode":"P.01.01.01","tradeName":"BERNAFON ENTRA B 20 MNR T R","model":"ENTRA B20 miniRITE T R","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":4850,"swdCode":""},{"idProduct":"10554205","nfzCode":"P.01.01.01","tradeName":"BERNAFON LEOX 3 SP","model":"LEOX 3 Super Power","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":4100,"swdCode":""},{"idProduct":"10554206","nfzCode":"P.01.01.01","tradeName":"BERNAFON LEOX 3 UP","model":"LEOX 3 Ultra Power","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":4100,"swdCode":""},{"idProduct":"10554203","nfzCode":"P.01.01.01","tradeName":"BERNAFON LEOX 7 SP","model":"LEOX 7 Super Power","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":6100,"swdCode":""},{"idProduct":"10554204","nfzCode":"P.01.01.01","tradeName":"BERNAFON LEOX 7 UP","model":"LEOX 7 Ultra Power","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":6100,"swdCode":""},{"idProduct":"12924786","nfzCode":"P.01.01.01","tradeName":"Boost Ultra","model":"BBU1786-DWHT","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":7900,"swdCode":""},{"idProduct":"12924787","nfzCode":"P.01.01.01","tradeName":"Boost Ultra","model":"BBU986-DWHT","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":6100,"swdCode":""},{"idProduct":"12924788","nfzCode":"P.01.01.01","tradeName":"Boost Ultra","model":"BBU686-DWHT","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":4500,"swdCode":""},{"idProduct":"12924789","nfzCode":"P.01.01.01","tradeName":"Boost Ultra","model":"BBU1795-DWT","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":7900,"swdCode":""},{"idProduct":"12924790","nfzCode":"P.01.01.01","tradeName":"Boost Ultra","model":"BBU995-DWT","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":6100,"swdCode":""},{"idProduct":"12924791","nfzCode":"P.01.01.01","tradeName":"Boost Ultra","model":"BBU695-DWT","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":4500,"swdCode":""},{"idProduct":"12909892","nfzCode":"P.01.01.01","tradeName":"C_ITE Insio C&G 3IX CIC","model":"Insio C&G 3IX CIC","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":5500,"swdCode":""},{"idProduct":"12909891","nfzCode":"P.01.01.01","tradeName":"C_ITE Insio C&G 5IX CIC","model":"Insio C&G 5IX CIC","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":7700,"swdCode":""},{"idProduct":"12909890","nfzCode":"P.01.01.01","tradeName":"C_ITE Insio C&G 7IX CIC","model":"Insio C&G 7IX CIC","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":9500,"swdCode":""},{"idProduct":"12910293","nfzCode":"P.01.01.01","tradeName":"C_ITE ITC 8.12","model":"ITC 8.12","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":5900,"swdCode":""},{"idProduct":"12910292","nfzCode":"P.01.01.01","tradeName":"C_ITE ITC 8.16","model":"ITC 8.16","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":7100,"swdCode":""},{"idProduct":"12910296","nfzCode":"P.01.01.01","tradeName":"C_ITE ITC 8.4","model":"ITC 8.4","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":3500,"swdCode":""},{"idProduct":"12910295","nfzCode":"P.01.01.01","tradeName":"C_ITE ITC 8.6","model":"ITC 8.6","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":3700,"swdCode":""},{"idProduct":"12910294","nfzCode":"P.01.01.01","tradeName":"C_ITE ITC 8.8","model":"ITC 8.8","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":4900,"swdCode":""},{"idProduct":"12910298","nfzCode":"P.01.01.01","tradeName":"C_ITE ITE 8.12","model":"ITE 8.12","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":5900,"swdCode":""},{"idProduct":"12910297","nfzCode":"P.01.01.01","tradeName":"C_ITE ITE 8.16","model":"ITE 8.16","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":7100,"swdCode":""},{"idProduct":"12910301","nfzCode":"P.01.01.01","tradeName":"C_ITE ITE 8.4","model":"ITE 8.4","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":3500,"swdCode":""},{"idProduct":"12910300","nfzCode":"P.01.01.01","tradeName":"C_ITE ITE 8.6","model":"ITE 8.6","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":3700,"swdCode":""},{"idProduct":"12910299","nfzCode":"P.01.01.01","tradeName":"C_ITE ITE 8.8","model":"ITE 8.8","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":4900,"swdCode":""},{"idProduct":"12924726","nfzCode":"P.01.01.01","tradeName":"Commence","model":"COM462-DRWC","manufacturer":"GN Hearing  A/S","orderIndex":"N","grossPrice":4200,"swdCode":""},{"idProduct":"12924727","nfzCode":"P.01.01.01","tradeName":"Commence","model":"COM464-DRW","manufacturer":"GN Hearing  A/S","orderIndex":"N","grossPrice":4200,"swdCode":""},{"idProduct":"12924728","nfzCode":"P.01.01.01","tradeName":"Commence","model":"COM463-DRW","manufacturer":"GN Hearing  A/S","orderIndex":"N","grossPrice":4200,"swdCode":""},{"idProduct":"12924729","nfzCode":"P.01.01.01","tradeName":"Commence","model":"COM362-DRWC","manufacturer":"GN Hearing  A/S","orderIndex":"N","grossPrice":3700,"swdCode":""},{"idProduct":"12924730","nfzCode":"P.01.01.01","tradeName":"Commence","model":"COM364-DRW","manufacturer":"GN Hearing  A/S","orderIndex":"N","grossPrice":3700,"swdCode":""},{"idProduct":"12924731","nfzCode":"P.01.01.01","tradeName":"Commence","model":"COM363-DRW","manufacturer":"GN Hearing  A/S","orderIndex":"N","grossPrice":3700,"swdCode":""},{"idProduct":"12924732","nfzCode":"P.01.01.01","tradeName":"Commence","model":"COM264-DRW","manufacturer":"GN Hearing  A/S","orderIndex":"N","grossPrice":3200,"swdCode":""},{"idProduct":"12924733","nfzCode":"P.01.01.01","tradeName":"Commence","model":"COM263-DRW","manufacturer":"GN Hearing  A/S","orderIndex":"N","grossPrice":3200,"swdCode":""},{"idProduct":"12924714","nfzCode":"P.01.01.01","tradeName":"Envision","model":"ENV1762S-DRWC","manufacturer":"GN Hearing  A/S","orderIndex":"N","grossPrice":9900,"swdCode":""},{"idProduct":"12924715","nfzCode":"P.01.01.01","tradeName":"Envision","model":"ENV1764-DRW","manufacturer":"GN Hearing  A/S","orderIndex":"N","grossPrice":9900,"swdCode":""},{"idProduct":"12924716","nfzCode":"P.01.01.01","tradeName":"Envision","model":"ENV1763-DRW","manufacturer":"GN Hearing  A/S","orderIndex":"N","grossPrice":9900,"swdCode":""},{"idProduct":"12924717","nfzCode":"P.01.01.01","tradeName":"Envision","model":"ENV962S-DRWC","manufacturer":"GN Hearing  A/S","orderIndex":"N","grossPrice":7800,"swdCode":""},{"idProduct":"12924718","nfzCode":"P.01.01.01","tradeName":"Envision","model":"ENV964-DRW","manufacturer":"GN Hearing  A/S","orderIndex":"N","grossPrice":7800,"swdCode":""},{"idProduct":"12924725","nfzCode":"P.01.01.01","tradeName":"Envision","model":"ENV463-DRW","manufacturer":"GN Hearing  A/S","orderIndex":"N","grossPrice":4900,"swdCode":""},{"idProduct":"12924720","nfzCode":"P.01.01.01","tradeName":"Envision","model":"ENV662S-DRWC","manufacturer":"GN Hearing  A/S","orderIndex":"N","grossPrice":5400,"swdCode":""},{"idProduct":"12924721","nfzCode":"P.01.01.01","tradeName":"Envision","model":"ENV664-DRW","manufacturer":"GN Hearing  A/S","orderIndex":"N","grossPrice":5400,"swdCode":""},{"idProduct":"12924722","nfzCode":"P.01.01.01","tradeName":"Envision","model":"ENV663-DRW","manufacturer":"GN Hearing  A/S","orderIndex":"N","grossPrice":5400,"swdCode":""},{"idProduct":"12924723","nfzCode":"P.01.01.01","tradeName":"Envision","model":"ENV462S-DRWC","manufacturer":"GN Hearing  A/S","orderIndex":"N","grossPrice":4900,"swdCode":""},{"idProduct":"12924724","nfzCode":"P.01.01.01","tradeName":"Envision","model":"ENV464-DRW","manufacturer":"GN Hearing  A/S","orderIndex":"N","grossPrice":4900,"swdCode":""},{"idProduct":"12924719","nfzCode":"P.01.01.01","tradeName":"Envision","model":"ENV963-DRW","manufacturer":"GN Hearing  A/S","orderIndex":"N","grossPrice":7800,"swdCode":""},{"idProduct":"12910284","nfzCode":"P.01.01.01","tradeName":"HA B M 7.12","model":"B M 7.12","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":6400,"swdCode":""},{"idProduct":"12910283","nfzCode":"P.01.01.01","tradeName":"HA B M 7.16","model":"B M 7.16","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":7200,"swdCode":""},{"idProduct":"12910285","nfzCode":"P.01.01.01","tradeName":"HA B M 7.8","model":"B M 7.8","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":4800,"swdCode":""},{"idProduct":"12910287","nfzCode":"P.01.01.01","tradeName":"HA B P BT 7.3","model":"B P BT 7.3","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":2900,"swdCode":""},{"idProduct":"12910288","nfzCode":"P.01.01.01","tradeName":"HA B SP BT 7.3","model":"B SP BT 7.3","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":2900,"swdCode":""},{"idProduct":"12909883","nfzCode":"P.01.01.01","tradeName":"HA Motion C&G M 3IX","model":"Motion C&G M 3IX","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":5500,"swdCode":""},{"idProduct":"12909882","nfzCode":"P.01.01.01","tradeName":"HA Motion C&G M 5IX","model":"Motion C&G M 5IX","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":8300,"swdCode":""},{"idProduct":"12909881","nfzCode":"P.01.01.01","tradeName":"HA Motion C&G M 7IX","model":"Motion C&G M 7IX","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":11000,"swdCode":""},{"idProduct":"12909886","nfzCode":"P.01.01.01","tradeName":"HA Motion C&G P 3IX","model":"Motion C&G P 3IX","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":5500,"swdCode":""},{"idProduct":"12909885","nfzCode":"P.01.01.01","tradeName":"HA Motion C&G P 5IX","model":"Motion C&G P 5IX","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":8300,"swdCode":""},{"idProduct":"12909884","nfzCode":"P.01.01.01","tradeName":"HA Motion C&G P 7IX","model":"Motion C&G P 7IX","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":11000,"swdCode":""},{"idProduct":"12909889","nfzCode":"P.01.01.01","tradeName":"HA Motion C&G SP 3IX","model":"Motion C&G SP 3IX","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":5500,"swdCode":""},{"idProduct":"12909888","nfzCode":"P.01.01.01","tradeName":"HA Motion C&G SP 5IX","model":"Motion C&G SP 5IX","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":8300,"swdCode":""},{"idProduct":"12909887","nfzCode":"P.01.01.01","tradeName":"HA Motion C&G SP 7IX","model":"Motion C&G SP 7IX","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":11000,"swdCode":""},{"idProduct":"12909880","nfzCode":"P.01.01.01","tradeName":"HA Pure C&G BCT 1IX","model":"Pure C&G BCT 1IX","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":4300,"swdCode":""},{"idProduct":"12909879","nfzCode":"P.01.01.01","tradeName":"HA Pure C&G BCT 2IX","model":"Pure C&G BCT 2IX","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":4800,"swdCode":""},{"idProduct":"12910290","nfzCode":"P.01.01.01","tradeName":"HA R Li T BC 8.12","model":"R Li T BC 8.12","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":7100,"swdCode":""},{"idProduct":"12910289","nfzCode":"P.01.01.01","tradeName":"HA R Li T BC 8.16","model":"R Li T BC 8.16","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":8800,"swdCode":""},{"idProduct":"12910291","nfzCode":"P.01.01.01","tradeName":"HA R Li T BC 8.8","model":"R Li T BC 8.8","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":6100,"swdCode":""},{"idProduct":"12910286","nfzCode":"P.01.01.01","tradeName":"HA R S BT 7.3","model":"R S BT 7.3","manufacturer":"WSAUD A/S","orderIndex":"N","grossPrice":2800,"swdCode":""},{"idProduct":"11652330","nfzCode":"P.01.01.01","tradeName":"HearLink","model":"5050 MNR","manufacturer":"SBO","orderIndex":"N","grossPrice":7300,"swdCode":""},{"idProduct":"11652332","nfzCode":"P.01.01.01","tradeName":"HearLink","model":"3050 MNR","manufacturer":"SBO","orderIndex":"N","grossPrice":5900,"swdCode":""},{"idProduct":"11652328","nfzCode":"P.01.01.01","tradeName":"HearLink","model":"7050 MNR","manufacturer":"SBO","orderIndex":"N","grossPrice":8700,"swdCode":""},{"idProduct":"11652326","nfzCode":"P.01.01.01","tradeName":"HearLink","model":"9050 MNR","manufacturer":"SBO","orderIndex":"N","grossPrice":12800,"swdCode":""},{"idProduct":"12410211","nfzCode":"P.01.01.01","tradeName":"HearLink","model":"2030 MNB T R","manufacturer":"SBO","orderIndex":"N","grossPrice":3950,"swdCode":""},{"idProduct":"12410209","nfzCode":"P.01.01.01","tradeName":"HearLink","model":"2030 MNB T","manufacturer":"SBO","orderIndex":"N","grossPrice":3500,"swdCode":""},{"idProduct":"12410207","nfzCode":"P.01.01.01","tradeName":"HearLink","model":"2030 MNR T R","manufacturer":"SBO","orderIndex":"N","grossPrice":3950,"swdCode":""},{"idProduct":"12410205","nfzCode":"P.01.01.01","tradeName":"HearLink","model":"2030 MNR T","manufacturer":"SBO","orderIndex":"N","grossPrice":3600,"swdCode":""},{"idProduct":"12410173","nfzCode":"P.01.01.01","tradeName":"HearLink 30","model":"HearLink 1730 MNB T","manufacturer":"SBO","orderIndex":"N","grossPrice":3500,"swdCode":""},{"idProduct":"12410191","nfzCode":"P.01.01.01","tradeName":"HearLink 30","model":"HearLink 1730 ITE HS","manufacturer":"SBO","orderIndex":"N","grossPrice":3600,"swdCode":""},{"idProduct":"12410169","nfzCode":"P.01.01.01","tradeName":"HearLink 30","model":"HearLink 1730 MNR T","manufacturer":"SBO","orderIndex":"N","grossPrice":3600,"swdCode":""},{"idProduct":"12410189","nfzCode":"P.01.01.01","tradeName":"HearLink 30","model":"HearLink 1730 ITC","manufacturer":"SBO","orderIndex":"N","grossPrice":3600,"swdCode":""},{"idProduct":"12410187","nfzCode":"P.01.01.01","tradeName":"HearLink 30","model":"HearLink 1730 IIC","manufacturer":"SBO","orderIndex":"N","grossPrice":3600,"swdCode":""},{"idProduct":"12410185","nfzCode":"P.01.01.01","tradeName":"HearLink 30","model":"HearLink 1730 CIC","manufacturer":"SBO","orderIndex":"N","grossPrice":3600,"swdCode":""},{"idProduct":"12410183","nfzCode":"P.01.01.01","tradeName":"HearLink 30","model":"HearLink 1530 MNB T R","manufacturer":"SBO","orderIndex":"N","grossPrice":3650,"swdCode":""},{"idProduct":"12410181","nfzCode":"P.01.01.01","tradeName":"HearLink 30","model":"HearLink 1530 MNB T","manufacturer":"SBO","orderIndex":"N","grossPrice":3200,"swdCode":""},{"idProduct":"12410179","nfzCode":"P.01.01.01","tradeName":"HearLink 30","model":"HearLink 1530 MNR T R","manufacturer":"SBO","orderIndex":"N","grossPrice":3650,"swdCode":""},{"idProduct":"12410177","nfzCode":"P.01.01.01","tradeName":"HearLink 30","model":"HearLink 1530 MNR T","manufacturer":"SBO","orderIndex":"N","grossPrice":3300,"swdCode":""},{"idProduct":"12410175","nfzCode":"P.01.01.01","tradeName":"HearLink 30","model":"HearLink 1730 MNB T R","manufacturer":"SBO","orderIndex":"N","grossPrice":3950,"swdCode":""},{"idProduct":"12410203","nfzCode":"P.01.01.01","tradeName":"HearLink 30","model":"HearLink 1530 ITE FS","manufacturer":"SBO","orderIndex":"N","grossPrice":3200,"swdCode":""},{"idProduct":"12410201","nfzCode":"P.01.01.01","tradeName":"HearLink 30","model":"HearLink 1530 ITE HS","manufacturer":"SBO","orderIndex":"N","grossPrice":3200,"swdCode":""},{"idProduct":"12410199","nfzCode":"P.01.01.01","tradeName":"HearLink 30","model":"HearLink 1530 ITC","manufacturer":"SBO","orderIndex":"N","grossPrice":3200,"swdCode":""},{"idProduct":"12410197","nfzCode":"P.01.01.01","tradeName":"HearLink 30","model":"HearLink 1530 IIC","manufacturer":"SBO","orderIndex":"N","grossPrice":3200,"swdCode":""},{"idProduct":"12410195","nfzCode":"P.01.01.01","tradeName":"HearLink 30","model":"HearLink 1530 CIC","manufacturer":"SBO","orderIndex":"N","grossPrice":3200,"swdCode":""},{"idProduct":"12410193","nfzCode":"P.01.01.01","tradeName":"HearLink 30","model":"HearLink 1730 ITE FS","manufacturer":"SBO","orderIndex":"N","grossPrice":3600,"swdCode":""},{"idProduct":"12410171","nfzCode":"P.01.01.01","tradeName":"HearLink 30","model":"HearLink 1730 MNR T R","manufacturer":"SBO","orderIndex":"N","grossPrice":3950,"swdCode":""},{"idProduct":"12910220","nfzCode":"P.01.01.01","tradeName":"MAICO INEO A 1 B 105","model":"INEO A 1 B 105","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":2100,"swdCode":""},{"idProduct":"12910222","nfzCode":"P.01.01.01","tradeName":"MAICO INEO A 1 MNR","model":"INEO A 1 MNR","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":2100,"swdCode":""},{"idProduct":"12910224","nfzCode":"P.01.01.01","tradeName":"MAICO INEO A 1 MNR T","model":"INEO A 1 MNR T","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":2100,"swdCode":""},{"idProduct":"12910221","nfzCode":"P.01.01.01","tradeName":"MAICO INEO A 2 B 105","model":"INEO A 2 B 105","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":2100,"swdCode":""},{"idProduct":"12910223","nfzCode":"P.01.01.01","tradeName":"MAICO INEO A 2 MNR","model":"INEO A 2 MNR","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":2100,"swdCode":""},{"idProduct":"12910225","nfzCode":"P.01.01.01","tradeName":"MAICO INEO A 2 MNR T","model":"INEO A 2 MNR T","manufacturer":"SBO HEARING A/S","orderIndex":"N","grossPrice":2100,"swdCode":""},{"idProduct":"11652863","nfzCode":"P.01.01.01","tradeName":"More 1","model":"More 1 miniRITE T","manufacturer":"SBO","orderIndex":"N","grossPrice":11450,"swdCode":""},{"idProduct":"10553256","nfzCode":"P.01.01.01","tradeName":"More 1","model":"More 1 miniBTE R","manufacturer":"SBO","orderIndex":"N","grossPrice":11850,"swdCode":""},{"idProduct":"11652867","nfzCode":"P.01.01.01","tradeName":"More 2","model":"More 2 miniRITE T","manufacturer":"SBO","orderIndex":"N","grossPrice":9050,"swdCode":""},{"idProduct":"11652866","nfzCode":"P.01.01.01","tradeName":"More 2","model":"More 2 miniRITE R","manufacturer":"SBO","orderIndex":"N","grossPrice":9700,"swdCode":""},{"idProduct":"11652865","nfzCode":"P.01.01.01","tradeName":"More 2","model":"More 2 miniBTE T","manufacturer":"SBO","orderIndex":"N","grossPrice":9050,"swdCode":""},{"idProduct":"11652864","nfzCode":"P.01.01.01","tradeName":"More 2","model":"More 2 miniBTE R","manufacturer":"SBO","orderIndex":"N","grossPrice":9700,"swdCode":""},{"idProduct":"11652869","nfzCode":"P.01.01.01","tradeName":"More 3","model":"More 3 miniBTE T","manufacturer":"SBO","orderIndex":"N","grossPrice":7350,"swdCode":""},{"idProduct":"11652870","nfzCode":"P.01.01.01","tradeName":"More 3","model":"More 3 miniRITE R","manufacturer":"SBO","orderIndex":"N","grossPrice":8000,"swdCode":""},{"idProduct":"11652871","nfzCode":"P.01.01.01","tradeName":"More 3","model":"More 3 miniRITE T","manufacturer":"SBO","orderIndex":"N","grossPrice":7350,"swdCode":""},{"idProduct":"11652868","nfzCode":"P.01.01.01","tradeName":"More 3","model":"More 3 miniBTE R","manufacturer":"SBO","orderIndex":"N","grossPrice":8000,"swdCode":""},{"idProduct":"11856345","nfzCode":"P.01.01.01","tradeName":"Oticon Intent 1","model":"Oticon Intent 1 miniRITE","manufacturer":"SBO","orderIndex":"N","grossPrice":11500,"swdCode":""},{"idProduct":"12910074","nfzCode":"P.01.01.01","tradeName":"Oticon Intent 1 miniBTE R","model":"Oticon Intent 1 miniBTE R","manufacturer":"SBO","orderIndex":"N","grossPrice":11500,"swdCode":""},{"idProduct":"11856346","nfzCode":"P.01.01.01","tradeName":"Oticon Intent 2","model":"Oticon Intent 2 miniRITE","manufacturer":"SBO","orderIndex":"N","grossPrice":9300,"swdCode":""},{"idProduct":"12910075","nfzCode":"P.01.01.01","tradeName":"Oticon Intent 2 miniBTE R","model":"Oticon Intent 2 miniBTE R","manufacturer":"SBO","orderIndex":"N","grossPrice":9300,"swdCode":""},{"idProduct":"11856347","nfzCode":"P.01.01.01","tradeName":"Oticon Intent 3","model":"Oticon Intent 3 miniRITE","manufacturer":"SBO","orderIndex":"N","grossPrice":7800,"swdCode":""},{"idProduct":"12910076","nfzCode":"P.01.01.01","tradeName":"Oticon Intent 3 miniBTE R","model":"Oticon Intent 3 miniBTE R","manufacturer":"SBO","orderIndex":"N","grossPrice":7800,"swdCode":""},{"idProduct":"12910077","nfzCode":"P.01.01.01","tradeName":"Oticon Intent 4 miniBTE R","model":"Oticon Intent 4 miniBTE R","manufacturer":"SBO","orderIndex":"N","grossPrice":6400,"swdCode":""},{"idProduct":"12910083","nfzCode":"P.01.01.01","tradeName":"Oticon Jet PX 1","model":"Oticon Jet PX 1 CIC/IIC","manufacturer":"SBO","orderIndex":"N","grossPrice":4900,"swdCode":""},{"idProduct":"12910082","nfzCode":"P.01.01.01","tradeName":"Oticon Jet PX 1","model":"Oticon Jet PX 1 ITE/ITC","manufacturer":"SBO","orderIndex":"N","grossPrice":4700,"swdCode":""},{"idProduct":"12910081","nfzCode":"P.01.01.01","tradeName":"Oticon Jet PX 1","model":"Oticon Jet PX 1 miniRITE T","manufacturer":"SBO","orderIndex":"N","grossPrice":4600,"swdCode":""},{"idProduct":"12910080","nfzCode":"P.01.01.01","tradeName":"Oticon Jet PX 1","model":"Oticon Jet PX 1 miniRITE R","manufacturer":"SBO","orderIndex":"N","grossPrice":5200,"swdCode":""},{"idProduct":"12910079","nfzCode":"P.01.01.01","tradeName":"Oticon Jet PX 1","model":"Oticon Jet PX 1 miniBTE T","manufacturer":"SBO","orderIndex":"N","grossPrice":4550,"swdCode":""},{"idProduct":"12910078","nfzCode":"P.01.01.01","tradeName":"Oticon Jet PX 1","model":"Oticon Jet PX 1 miniBTE R","manufacturer":"SBO","orderIndex":"N","grossPrice":5100,"swdCode":""},{"idProduct":"12910089","nfzCode":"P.01.01.01","tradeName":"Oticon Jet PX 2","model":"Oticon Jet PX 2 CIC/IIC","manufacturer":"SBO","orderIndex":"N","grossPrice":3800,"swdCode":""},{"idProduct":"12910088","nfzCode":"P.01.01.01","tradeName":"Oticon Jet PX 2","model":"Oticon Jet PX 2 ITE/ITC","manufacturer":"SBO","orderIndex":"N","grossPrice":3700,"swdCode":""},{"idProduct":"12910087","nfzCode":"P.01.01.01","tradeName":"Oticon Jet PX 2","model":"Oticon Jet PX 2 mini RITE T","manufacturer":"SBO","orderIndex":"N","grossPrice":3600,"swdCode":""},{"idProduct":"12910086","nfzCode":"P.01.01.01","tradeName":"Oticon Jet PX 2","model":"Oticon Jet PX 2 mini RITE R","manufacturer":"SBO","orderIndex":"N","grossPrice":4100,"swdCode":""},{"idProduct":"12910085","nfzCode":"P.01.01.01","tradeName":"Oticon Jet PX 2","model":"Oticon Jet PX 2 mini BTE T","manufacturer":"SBO","orderIndex":"N","grossPrice":3500,"swdCode":""},{"idProduct":"12910084","nfzCode":"P.01.01.01","tradeName":"Oticon Jet PX 2","model":"Oticon Jet PX 2 mini BTE R","manufacturer":"SBO","orderIndex":"N","grossPrice":4100,"swdCode":""},{"idProduct":"11652874","nfzCode":"P.01.01.01","tradeName":"Oticon Opn Play 1","model":"Opn Play 1 miniRITE R","manufacturer":"SBO","orderIndex":"N","grossPrice":11650,"swdCode":""},{"idProduct":"11652875","nfzCode":"P.01.01.01","tradeName":"Oticon Opn Play 1","model":"Opn Play 1 miniRITE-T","manufacturer":"SBO","orderIndex":"N","grossPrice":11000,"swdCode":""},{"idProduct":"11652873","nfzCode":"P.01.01.01","tradeName":"Oticon Opn Play 1","model":"Opn Play 1 miniRITE","manufacturer":"SBO","orderIndex":"N","grossPrice":11000,"swdCode":""},{"idProduct":"11652872","nfzCode":"P.01.01.01","tradeName":"Oticon Opn Play 1","model":"Opn Play 1 BTE 13 PP","manufacturer":"SBO","orderIndex":"N","grossPrice":11000,"swdCode":""},{"idProduct":"11652876","nfzCode":"P.01.01.01","tradeName":"Oticon Opn Play 2","model":"Opn Play 2 BTE 13 PP","manufacturer":"SBO","orderIndex":"N","grossPrice":6500,"swdCode":""},{"idProduct":"11652877","nfzCode":"P.01.01.01","tradeName":"Oticon Opn Play 2","model":"Opn Play 2 miniRITE","manufacturer":"SBO","orderIndex":"N","grossPrice":6500,"swdCode":""},{"idProduct":"11652878","nfzCode":"P.01.01.01","tradeName":"Oticon Opn Play 2","model":"Opn Play 2 miniRITE R","manufacturer":"SBO","orderIndex":"N","grossPrice":7150,"swdCode":""},{"idProduct":"11652879","nfzCode":"P.01.01.01","tradeName":"Oticon Opn Play 2","model":"Opn Play 2 miniRITE-T","manufacturer":"SBO","orderIndex":"N","grossPrice":6500,"swdCode":""},{"idProduct":"10553279","nfzCode":"P.01.01.01","tradeName":"Oticon Opn S 1","model":"Opn S 1 miniRITE-T","manufacturer":"SBO","orderIndex":"N","grossPrice":10750,"swdCode":""},{"idProduct":"10553277","nfzCode":"P.01.01.01","tradeName":"Oticon Opn S 1","model":"Opn S 1 miniRITE","manufacturer":"SBO","orderIndex":"N","grossPrice":10750,"swdCode":""},{"idProduct":"10553278","nfzCode":"P.01.01.01","tradeName":"Oticon Opn S 1","model":"Opn S 1 miniRITE R","manufacturer":"SBO","orderIndex":"N","grossPrice":11400,"swdCode":""},{"idProduct":"11652883","nfzCode":"P.01.01.01","tradeName":"Oticon Opn S 1","model":"Opn S 1 miniRITE-T","manufacturer":"SBO","orderIndex":"N","grossPrice":11000,"swdCode":""},{"idProduct":"11652882","nfzCode":"P.01.01.01","tradeName":"Oticon Opn S 1","model":"Opn S 1 miniRITE R","manufacturer":"SBO","orderIndex":"N","grossPrice":11650,"swdCode":""},{"idProduct":"11652881","nfzCode":"P.01.01.01","tradeName":"Oticon Opn S 1","model":"Opn S 1 miniRITE","manufacturer":"SBO","orderIndex":"N","grossPrice":11000,"swdCode":""},{"idProduct":"11652880","nfzCode":"P.01.01.01","tradeName":"Oticon Opn S 1","model":"Opn S 1 BTE 13 PP","manufacturer":"SBO","orderIndex":"N","grossPrice":11000,"swdCode":""},{"idProduct":"10553282","nfzCode":"P.01.01.01","tradeName":"Oticon Opn S 2","model":"Opn S 2 miniRITE R","manufacturer":"SBO","orderIndex":"N","grossPrice":6900,"swdCode":""},{"idProduct":"10553281","nfzCode":"P.01.01.01","tradeName":"Oticon Opn S 2","model":"Opn S 2 miniRITE","manufacturer":"SBO","orderIndex":"N","grossPrice":6250,"swdCode":""},{"idProduct":"10553283","nfzCode":"P.01.01.01","tradeName":"Oticon Opn S 2","model":"Opn S 2 miniRITE-T","manufacturer":"SBO","orderIndex":"N","grossPrice":6250,"swdCode":""},{"idProduct":"11652887","nfzCode":"P.01.01.01","tradeName":"Oticon Opn S 2","model":"Opn S 2 miniRITE-T","manufacturer":"SBO","orderIndex":"N","grossPrice":6500,"swdCode":""},{"idProduct":"11652886","nfzCode":"P.01.01.01","tradeName":"Oticon Opn S 2","model":"Opn S 2 miniRITE R","manufacturer":"SBO","orderIndex":"N","grossPrice":7150,"swdCode":""},{"idProduct":"11652885","nfzCode":"P.01.01.01","tradeName":"Oticon Opn S 2","model":"Opn S 2 miniRITE","manufacturer":"SBO","orderIndex":"N","grossPrice":6500,"swdCode":""},{"idProduct":"11652884","nfzCode":"P.01.01.01","tradeName":"Oticon Opn S 2","model":"Opn S 2 BTE 13 PP","manufacturer":"SBO","orderIndex":"N","grossPrice":6500,"swdCode":""},{"idProduct":"10553280","nfzCode":"P.01.01.01","tradeName":"Oticon Opn S 2","model":"Opn S 2 BTE 13 PP","manufacturer":"SBO","orderIndex":"N","grossPrice":6250,"swdCode":""},{"idProduct":"11652890","nfzCode":"P.01.01.01","tradeName":"Oticon Opn S 3","model":"Opn S 3 miniRITE R","manufacturer":"SBO","orderIndex":"N","grossPrice":7750,"swdCode":""},{"idProduct":"10553284","nfzCode":"P.01.01.01","tradeName":"Oticon Opn S 3","model":"Opn S 3 BTE 13 PP","manufacturer":"SBO","orderIndex":"N","grossPrice":7750,"swdCode":""},{"idProduct":"11652888","nfzCode":"P.01.01.01","tradeName":"Oticon Opn S 3","model":"Opn S 3 BTE 13 PP","manufacturer":"SBO","orderIndex":"N","grossPrice":8000,"swdCode":""},{"idProduct":"10553285","nfzCode":"P.01.01.01","tradeName":"Oticon Opn S 3","model":"Opn S 3 miniRITE","manufacturer":"SBO","orderIndex":"N","grossPrice":7100,"swdCode":""},{"idProduct":"10553286","nfzCode":"P.01.01.01","tradeName":"Oticon Opn S 3","model":"Opn S 3 miniRITE R","manufacturer":"SBO","orderIndex":"N","grossPrice":7500,"swdCode":""},{"idProduct":"11652889","nfzCode":"P.01.01.01","tradeName":"Oticon Opn S 3","model":"Opn S 3 miniRITE","manufacturer":"SBO","orderIndex":"N","grossPrice":7350,"swdCode":""},{"idProduct":"10553287","nfzCode":"P.01.01.01","tradeName":"Oticon Opn S 3","model":"Opn S 3 miniRITE-T","manufacturer":"SBO","orderIndex":"N","grossPrice":6750,"swdCode":""},{"idProduct":"11652891","nfzCode":"P.01.01.01","tradeName":"Oticon Opn S 3","model":"Opn S 3 miniRITE-T","manufacturer":"SBO","orderIndex":"N","grossPrice":7000,"swdCode":""},{"idProduct":"11652963","nfzCode":"P.01.01.01","tradeName":"Oticon Own 2","model":"Oticon Own 2 ITE","manufacturer":"SBO","orderIndex":"N","grossPrice":9450,"swdCode":""},{"idProduct":"11652967","nfzCode":"P.01.01.01","tradeName":"Oticon Own 3","model":"Oticon Own 3 ITE","manufacturer":"SBO","orderIndex":"N","grossPrice":7750,"swdCode":""},{"idProduct":"11652964","nfzCode":"P.01.01.01","tradeName":"Oticon Own 3","model":"Oticon Own 3 IIC","manufacturer":"SBO","orderIndex":"N","grossPrice":7750,"swdCode":""},{"idProduct":"11652965","nfzCode":"P.01.01.01","tradeName":"Oticon Own 3","model":"Oticon Own 3 CIC","manufacturer":"SBO","orderIndex":"N","grossPrice":7750,"swdCode":""},{"idProduct":"11652966","nfzCode":"P.01.01.01","tradeName":"Oticon Own 3","model":"Oticon Own 3 ITC","manufacturer":"SBO","orderIndex":"N","grossPrice":7750,"swdCode":""},{"idProduct":"11652971","nfzCode":"P.01.01.01","tradeName":"Oticon Own 4","model":"Oticon Own 4 ITE","manufacturer":"SBO","orderIndex":"N","grossPrice":6300,"swdCode":""},{"idProduct":"11652968","nfzCode":"P.01.01.01","tradeName":"Oticon Own 4","model":"Oticon Own 4 IIC","manufacturer":"SBO","orderIndex":"N","grossPrice":6300,"swdCode":""},{"idProduct":"11652969","nfzCode":"P.01.01.01","tradeName":"Oticon Own 4","model":"Oticon Own 4 CIC","manufacturer":"SBO","orderIndex":"N","grossPrice":6300,"swdCode":""},{"idProduct":"11652970","nfzCode":"P.01.01.01","tradeName":"Oticon Own 4","model":"Oticon Own 4 ITC","manufacturer":"SBO","orderIndex":"N","grossPrice":6300,"swdCode":""},{"idProduct":"11652972","nfzCode":"P.01.01.01","tradeName":"Oticon Own 5","model":"Oticon Own 5 IIC","manufacturer":"SBO","orderIndex":"N","grossPrice":5600,"swdCode":""},{"idProduct":"11652973","nfzCode":"P.01.01.01","tradeName":"Oticon Own 5","model":"Oticon Own 5 CIC","manufacturer":"SBO","orderIndex":"N","grossPrice":5600,"swdCode":""},{"idProduct":"11652975","nfzCode":"P.01.01.01","tradeName":"Oticon Own 5","model":"Oticon Own 5 ITE","manufacturer":"SBO","orderIndex":"N","grossPrice":5600,"swdCode":""},{"idProduct":"11652974","nfzCode":"P.01.01.01","tradeName":"Oticon Own 5","model":"Oticon Own 5 ITC","manufacturer":"SBO","orderIndex":"N","grossPrice":5600,"swdCode":""},{"idProduct":"12910090","nfzCode":"P.01.01.01","tradeName":"Oticon Own SI 1","model":"Oticon Own SI 1 CIC/IIC","manufacturer":"SBO","orderIndex":"N","grossPrice":11100,"swdCode":""},{"idProduct":"12910091","nfzCode":"P.01.01.01","tradeName":"Oticon Own SI 2","model":"Oticon Own SI 2 CIC/IIC","manufacturer":"SBO","orderIndex":"N","grossPrice":8900,"swdCode":""},{"idProduct":"12910092","nfzCode":"P.01.01.01","tradeName":"Oticon Own SI 3","model":"Oticon Own SI 3 CIC/IIC","manufacturer":"SBO","orderIndex":"N","grossPrice":7500,"swdCode":""},{"idProduct":"12910093","nfzCode":"P.01.01.01","tradeName":"Oticon Own SI 4","model":"Oticon Own SI 4 CIC/IIC","manufacturer":"SBO","orderIndex":"N","grossPrice":6200,"swdCode":""},{"idProduct":"10553289","nfzCode":"P.01.01.01","tradeName":"Oticon Play PX 1","model":"Play PX 1 miniBTE T","manufacturer":"SBO","orderIndex":"N","grossPrice":11450,"swdCode":""},{"idProduct":"11652895","nfzCode":"P.01.01.01","tradeName":"Oticon Play PX 1","model":"Play PX 1 miniRITE T","manufacturer":"SBO","orderIndex":"N","grossPrice":11700,"swdCode":""},{"idProduct":"11652894","nfzCode":"P.01.01.01","tradeName":"Oticon Play PX 1","model":"Play PX 1 miniRITE R","manufacturer":"SBO","orderIndex":"N","grossPrice":12350,"swdCode":""},{"idProduct":"10553291","nfzCode":"P.01.01.01","tradeName":"Oticon Play PX 1","model":"Play PX 1 miniRITE T","manufacturer":"SBO","orderIndex":"N","grossPrice":11450,"swdCode":""},{"idProduct":"11652892","nfzCode":"P.01.01.01","tradeName":"Oticon Play PX 1","model":"Play PX 1 miniBTE R","manufacturer":"SBO","orderIndex":"N","grossPrice":12350,"swdCode":""},{"idProduct":"10553290","nfzCode":"P.01.01.01","tradeName":"Oticon Play PX 1","model":"Play PX 1 miniRITE R","manufacturer":"SBO","orderIndex":"N","grossPrice":12100,"swdCode":""},{"idProduct":"10553288","nfzCode":"P.01.01.01","tradeName":"Oticon Play PX 1","model":"Play PX 1 miniBTE R","manufacturer":"SBO","orderIndex":"N","grossPrice":12100,"swdCode":""},{"idProduct":"11652893","nfzCode":"P.01.01.01","tradeName":"Oticon Play PX 1","model":"Play PX 1 miniBTE T","manufacturer":"SBO","orderIndex":"N","grossPrice":11700,"swdCode":""},{"idProduct":"11652897","nfzCode":"P.01.01.01","tradeName":"Oticon Play PX 2","model":"Play PX 2 miniBTE T","manufacturer":"SBO","orderIndex":"N","grossPrice":6750,"swdCode":""},{"idProduct":"11652896","nfzCode":"P.01.01.01","tradeName":"Oticon Play PX 2","model":"Play PX 2 miniBTE R","manufacturer":"SBO","orderIndex":"N","grossPrice":7400,"swdCode":""},{"idProduct":"10553295","nfzCode":"P.01.01.01","tradeName":"Oticon Play PX 2","model":"Play PX 2 miniRITE T","manufacturer":"SBO","orderIndex":"N","grossPrice":6500,"swdCode":""},{"idProduct":"10553292","nfzCode":"P.01.01.01","tradeName":"Oticon Play PX 2","model":"Play PX 2 miniBTE R","manufacturer":"SBO","orderIndex":"N","grossPrice":7150,"swdCode":""},{"idProduct":"10553293","nfzCode":"P.01.01.01","tradeName":"Oticon Play PX 2","model":"Play PX 2 miniBTE T","manufacturer":"SBO","orderIndex":"N","grossPrice":6500,"swdCode":""},{"idProduct":"11652899","nfzCode":"P.01.01.01","tradeName":"Oticon Play PX 2","model":"Play PX 2 miniRITE T","manufacturer":"SBO","orderIndex":"N","grossPrice":6750,"swdCode":""},{"idProduct":"11652898","nfzCode":"P.01.01.01","tradeName":"Oticon Play PX 2","model":"Play PX 2 miniRITE R","manufacturer":"SBO","orderIndex":"N","grossPrice":7400,"swdCode":""},{"idProduct":"10553294","nfzCode":"P.01.01.01","tradeName":"Oticon Play PX 2","model":"Play PX 2 miniRITE R","manufacturer":"SBO","orderIndex":"N","grossPrice":7150,"swdCode":""},{"idProduct":"11652901","nfzCode":"P.01.01.01","tradeName":"Oticon Zircon 1","model":"Zircon 1 miniBTE T","manufacturer":"SBO","orderIndex":"N","grossPrice":6000,"swdCode":""},{"idProduct":"11652900","nfzCode":"P.01.01.01","tradeName":"Oticon Zircon 1","model":"Zircon 1 miniBTE R","manufacturer":"SBO","orderIndex":"N","grossPrice":6600,"swdCode":""},{"idProduct":"11652902","nfzCode":"P.01.01.01","tradeName":"Oticon Zircon 1","model":"Zircon 1 miniRITE R","manufacturer":"SBO","orderIndex":"N","grossPrice":6600,"swdCode":""},{"idProduct":"10553296","nfzCode":"P.01.01.01","tradeName":"Oticon Zircon 1","model":"Zircon 1 miniBTE R","manufacturer":"SBO","orderIndex":"N","grossPrice":6350,"swdCode":""},{"idProduct":"10893960","nfzCode":"P.01.01.01","tradeName":"Phonak Audao L70-R Fit","model":"Phonak Audeo L70-R Fit","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":10200,"swdCode":""},{"idProduct":"10893959","nfzCode":"P.01.01.01","tradeName":"Phonak Audao L90-R Fit","model":"Phonak Audeo L90-R Fit","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":13050,"swdCode":""},{"idProduct":"12910132","nfzCode":"P.01.01.01","tradeName":"Phonak Audeo I30-R","model":"Phonak Audeo I30-R","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":4800,"swdCode":""},{"idProduct":"12910133","nfzCode":"P.01.01.01","tradeName":"Phonak Audeo I50-R","model":"Phonak Audeo I50-R","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":5900,"swdCode":""},{"idProduct":"12910134","nfzCode":"P.01.01.01","tradeName":"Phonak Audeo I70-R","model":"Phonak Audeo I70-R","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":7700,"swdCode":""},{"idProduct":"12910136","nfzCode":"P.01.01.01","tradeName":"Phonak Audeo I70-Sphere","model":"Phonak Audeo I70-Sphere","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":8300,"swdCode":""},{"idProduct":"12910135","nfzCode":"P.01.01.01","tradeName":"Phonak Audeo I90-R","model":"Phonak Audeo I90-R","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":10000,"swdCode":""},{"idProduct":"12910137","nfzCode":"P.01.01.01","tradeName":"Phonak Audeo I90-Sphere","model":"Phonak Audeo I90-Sphere","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":11000,"swdCode":""},{"idProduct":"11428703","nfzCode":"P.01.01.01","tradeName":"Phonak Audeo L30-312","model":"Phonak Audeo L30-312","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":3900,"swdCode":""},{"idProduct":"11428704","nfzCode":"P.01.01.01","tradeName":"Phonak Audeo L50-312","model":"Phonak Audeo L50-312","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":5400,"swdCode":""},{"idProduct":"11428705","nfzCode":"P.01.01.01","tradeName":"Phonak Audeo L70-312","model":"Phonak Audeo L70-312","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":7100,"swdCode":""},{"idProduct":"12910131","nfzCode":"P.01.01.01","tradeName":"Phonak Audeo L70-R Fit","model":"Phonak Audeo L70-R Fit","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":10200,"swdCode":""},{"idProduct":"11428706","nfzCode":"P.01.01.01","tradeName":"Phonak Audeo L90-312","model":"Phonak Audeo L90-312","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":9300,"swdCode":""},{"idProduct":"12910121","nfzCode":"P.01.01.01","tradeName":"Phonak Audeo L90-312","model":"Phonak Audeo L90-312","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":9500,"swdCode":""},{"idProduct":"12910130","nfzCode":"P.01.01.01","tradeName":"Phonak Audeo L90-R Fit","model":"Phonak Audeo L90-R Fit","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":13050,"swdCode":""},{"idProduct":"10893977","nfzCode":"P.01.01.01","tradeName":"Phonak Audéo L30-312","model":"Phonak Audéo L30-312","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":3650,"swdCode":""},{"idProduct":"10893978","nfzCode":"P.01.01.01","tradeName":"Phonak Audéo L50-312","model":"Phonak Audéo L50-312","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":5400,"swdCode":""},{"idProduct":"10893979","nfzCode":"P.01.01.01","tradeName":"Phonak Audéo L70-312","model":"Phonak Audéo L70-312","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":7150,"swdCode":""},{"idProduct":"10893980","nfzCode":"P.01.01.01","tradeName":"Phonak Audéo L90-312","model":"Phonak Audéo L90-312","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":9900,"swdCode":""},{"idProduct":"10893964","nfzCode":"P.01.01.01","tradeName":"Phonak Naida L30-PR","model":"Phonak Naida L30-PR","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":4850,"swdCode":""},{"idProduct":"10893981","nfzCode":"P.01.01.01","tradeName":"Phonak Naida L30-SP","model":"Phonak Naida L30-SP","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":4200,"swdCode":""},{"idProduct":"10893968","nfzCode":"P.01.01.01","tradeName":"Phonak Naida L30-UP","model":"Phonak Naida L30-UP","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":4200,"swdCode":""},{"idProduct":"10893963","nfzCode":"P.01.01.01","tradeName":"Phonak Naida L50-PR","model":"Phonak Naida L50-PR","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":5950,"swdCode":""},{"idProduct":"10893982","nfzCode":"P.01.01.01","tradeName":"Phonak Naida L50-SP","model":"Phonak Naida L50-SP","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":5700,"swdCode":""},{"idProduct":"10893967","nfzCode":"P.01.01.01","tradeName":"Phonak Naida L50-UP","model":"Phonak Naida L50-UP","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":5700,"swdCode":""},{"idProduct":"10893962","nfzCode":"P.01.01.01","tradeName":"Phonak Naida L70-PR","model":"Phonak Naida L70-PR","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":8200,"swdCode":""},{"idProduct":"10893983","nfzCode":"P.01.01.01","tradeName":"Phonak Naida L70-SP","model":"Phonak Naida L70-SP","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":7650,"swdCode":""},{"idProduct":"10893966","nfzCode":"P.01.01.01","tradeName":"Phonak Naida L70-UP","model":"Phonak Naida L70-UP","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":7650,"swdCode":""},{"idProduct":"10893961","nfzCode":"P.01.01.01","tradeName":"Phonak Naida L90-PR","model":"Phonak Naida L90-PR","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":10550,"swdCode":""},{"idProduct":"10893984","nfzCode":"P.01.01.01","tradeName":"Phonak Naida L90-SP","model":"Phonak Naida L90-SP","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":10000,"swdCode":""},{"idProduct":"10893965","nfzCode":"P.01.01.01","tradeName":"Phonak Naida L90-UP","model":"Phonak Naida L90-UP","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":10000,"swdCode":""},{"idProduct":"10552971","nfzCode":"P.01.01.01","tradeName":"Phonak Naida P30-UP","model":"Phonak Naida P30-UP","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":4000,"swdCode":""},{"idProduct":"10552972","nfzCode":"P.01.01.01","tradeName":"Phonak Naida P50-UP","model":"Phonak Naida P50-UP","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":5200,"swdCode":""},{"idProduct":"10893985","nfzCode":"P.01.01.01","tradeName":"Phonak Sky L30-M","model":"Phonak Sky L30-M","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":3800,"swdCode":""},{"idProduct":"10893972","nfzCode":"P.01.01.01","tradeName":"Phonak Sky L30-PR","model":"Phonak Sky L30-PR","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":4400,"swdCode":""},{"idProduct":"10893989","nfzCode":"P.01.01.01","tradeName":"Phonak Sky L30-SP","model":"Phonak Sky L30-SP","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":3800,"swdCode":""},{"idProduct":"10893976","nfzCode":"P.01.01.01","tradeName":"Phonak Sky L30-UP","model":"Phonak Sky L30-UP","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":3800,"swdCode":""},{"idProduct":"10893986","nfzCode":"P.01.01.01","tradeName":"Phonak Sky L50-M","model":"Phonak Sky L50-M","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":5700,"swdCode":""},{"idProduct":"10893971","nfzCode":"P.01.01.01","tradeName":"Phonak Sky L50-PR","model":"Phonak Sky L50-PR","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":6100,"swdCode":""},{"idProduct":"10893990","nfzCode":"P.01.01.01","tradeName":"Phonak Sky L50-SP","model":"Phonak Sky L50-SP","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":5700,"swdCode":""},{"idProduct":"10893975","nfzCode":"P.01.01.01","tradeName":"Phonak Sky L50-UP","model":"Phonak Sky L50-UP","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":5700,"swdCode":""},{"idProduct":"10893987","nfzCode":"P.01.01.01","tradeName":"Phonak Sky L70-M","model":"Phonak Sky L70-M","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":7450,"swdCode":""},{"idProduct":"10893970","nfzCode":"P.01.01.01","tradeName":"Phonak Sky L70-PR","model":"Phonak Sky L70-PR","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":7500,"swdCode":""},{"idProduct":"10893991","nfzCode":"P.01.01.01","tradeName":"Phonak Sky L70-SP","model":"Phonak Sky L70-SP","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":7450,"swdCode":""},{"idProduct":"10893974","nfzCode":"P.01.01.01","tradeName":"Phonak Sky L70-UP","model":"Phonak Sky L70-UP","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":7450,"swdCode":""},{"idProduct":"10893988","nfzCode":"P.01.01.01","tradeName":"Phonak Sky L90-M","model":"Phonak Sky L90-M","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":9700,"swdCode":""},{"idProduct":"10893969","nfzCode":"P.01.01.01","tradeName":"Phonak Sky L90-PR","model":"Phonak Sky L90-PR","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":9950,"swdCode":""},{"idProduct":"10893992","nfzCode":"P.01.01.01","tradeName":"Phonak Sky L90-SP","model":"Phonak Sky L90-SP","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":9700,"swdCode":""},{"idProduct":"10893973","nfzCode":"P.01.01.01","tradeName":"Phonak Sky L90-UP","model":"Phonak Sky L90-UP","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":10000,"swdCode":""},{"idProduct":"10552959","nfzCode":"P.01.01.01","tradeName":"Phonak Sky M30-M","model":"Phonak Sky M30-M","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":3600,"swdCode":""},{"idProduct":"10552963","nfzCode":"P.01.01.01","tradeName":"Phonak Sky M30-PR","model":"Phonak Sky M30-PR","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":4200,"swdCode":""},{"idProduct":"10552967","nfzCode":"P.01.01.01","tradeName":"Phonak Sky M30-SP","model":"Phonak Sky M30-SP","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":3600,"swdCode":""},{"idProduct":"10552960","nfzCode":"P.01.01.01","tradeName":"Phonak Sky M50-M","model":"Phonak Sky M50-M","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":5000,"swdCode":""},{"idProduct":"10552964","nfzCode":"P.01.01.01","tradeName":"Phonak Sky M50-PR","model":"Phonak Sky M50-PR","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":5500,"swdCode":""},{"idProduct":"10552968","nfzCode":"P.01.01.01","tradeName":"Phonak Sky M50-SP","model":"Phonak Sky M50-SP","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":5000,"swdCode":""},{"idProduct":"10552961","nfzCode":"P.01.01.01","tradeName":"Phonak Sky M70-M","model":"Phonak Sky M70-M","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":6800,"swdCode":""},{"idProduct":"10552965","nfzCode":"P.01.01.01","tradeName":"Phonak Sky M70-PR","model":"Phonak Sky M70-PR","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":7300,"swdCode":""},{"idProduct":"10552969","nfzCode":"P.01.01.01","tradeName":"Phonak Sky M70-SP","model":"Phonak Sky M70-SP","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":6800,"swdCode":""},{"idProduct":"10552962","nfzCode":"P.01.01.01","tradeName":"Phonak Sky M90-M","model":"Phonak Sky M90-M","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":9500,"swdCode":""},{"idProduct":"10552966","nfzCode":"P.01.01.01","tradeName":"Phonak Sky M90-PR","model":"Phonak Sky M90-PR","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":9700,"swdCode":""},{"idProduct":"10552970","nfzCode":"P.01.01.01","tradeName":"Phonak Sky M90-SP","model":"Phonak Sky M90-SP","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":9500,"swdCode":""},{"idProduct":"10893957","nfzCode":"P.01.01.01","tradeName":"Phonak Slim L-30 R Left","model":"Phonak Slim L-30 R Left","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":5500,"swdCode":""},{"idProduct":"10893958","nfzCode":"P.01.01.01","tradeName":"Phonak Slim L-30 R Right","model":"Phonak Slim L-30 R Right","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":5500,"swdCode":""},{"idProduct":"12910128","nfzCode":"P.01.01.01","tradeName":"Phonak Slim L30-R Left","model":"Phonak Slim L30-R Left","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":5500,"swdCode":""},{"idProduct":"12910129","nfzCode":"P.01.01.01","tradeName":"Phonak Slim L30-R Right","model":"Phonak Slim L30-R Right","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":5500,"swdCode":""},{"idProduct":"10893955","nfzCode":"P.01.01.01","tradeName":"Phonak Slim L-50 R Left","model":"Phonak Slim L-50 R Left","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":7350,"swdCode":""},{"idProduct":"10893956","nfzCode":"P.01.01.01","tradeName":"Phonak Slim L-50 R Right","model":"Phonak Slim L-50 R Right","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":7350,"swdCode":""},{"idProduct":"12910126","nfzCode":"P.01.01.01","tradeName":"Phonak Slim L50-R Left","model":"Phonak Slim L50-R Left","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":7350,"swdCode":""},{"idProduct":"12910127","nfzCode":"P.01.01.01","tradeName":"Phonak Slim L50-R Right","model":"Phonak Slim L50-R Right","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":7350,"swdCode":""},{"idProduct":"10893953","nfzCode":"P.01.01.01","tradeName":"Phonak Slim L-70 R Left","model":"Phonak Slim L-70 R","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":9200,"swdCode":""},{"idProduct":"10893954","nfzCode":"P.01.01.01","tradeName":"Phonak Slim L-70 R Right","model":"Phonak Slim L-70 R Right","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":9200,"swdCode":""},{"idProduct":"12910124","nfzCode":"P.01.01.01","tradeName":"Phonak Slim L70-R Left","model":"Phonak Slim L70-R Left","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":9200,"swdCode":""},{"idProduct":"12910125","nfzCode":"P.01.01.01","tradeName":"Phonak Slim L70-R Right","model":"Phonak Slim L70-R Right","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":9200,"swdCode":""},{"idProduct":"10893951","nfzCode":"P.01.01.01","tradeName":"Phonak Slim L-90 R Left","model":"Phonak Slim L-90 R","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":10950,"swdCode":""},{"idProduct":"10893952","nfzCode":"P.01.01.01","tradeName":"Phonak Slim L-90 R Right","model":"Phonak Slim L-90 R","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":10950,"swdCode":""},{"idProduct":"12910122","nfzCode":"P.01.01.01","tradeName":"Phonak Slim L90-R Left","model":"Phonak Slim L90-R Left","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":10950,"swdCode":""},{"idProduct":"12910123","nfzCode":"P.01.01.01","tradeName":"Phonak Slim L90-R Right","model":"Phonak Slim L90-R Right","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":10950,"swdCode":""},{"idProduct":"12910118","nfzCode":"P.01.01.01","tradeName":"Phonak Terra+ BTE-M","model":"Phonak Terra+ BTE-M","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":3550,"swdCode":""},{"idProduct":"12910119","nfzCode":"P.01.01.01","tradeName":"Phonak Terra+ BTE-SP","model":"Phonak Terra+ BTE-SP","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":3550,"swdCode":""},{"idProduct":"12910120","nfzCode":"P.01.01.01","tradeName":"Phonak Terra+ BTE-UP","model":"Phonak Terra+ BTE-UP","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":3550,"swdCode":""},{"idProduct":"12910117","nfzCode":"P.01.01.01","tradeName":"Phonak Terra+ RIC-312","model":"Phonak Terra+ RIC-312","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":3550,"swdCode":""},{"idProduct":"12910116","nfzCode":"P.01.01.01","tradeName":"Phonak Terra+ RIC-R","model":"Phonak Terra+ RIC-R","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":3950,"swdCode":""},{"idProduct":"11871587","nfzCode":"P.01.01.01","tradeName":"Phonak Virto I30-10 NW O","model":"Phonak Virto I30-10 NW O","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":3900,"swdCode":""},{"idProduct":"11871586","nfzCode":"P.01.01.01","tradeName":"Phonak Virto I50-10 NW O","model":"Phonak Virto I50-10 NW O","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":5100,"swdCode":""},{"idProduct":"11871585","nfzCode":"P.01.01.01","tradeName":"Phonak Virto I70-10 NW O","model":"Phonak Virto I70-10 NW O","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":6500,"swdCode":""},{"idProduct":"11871589","nfzCode":"P.01.01.01","tradeName":"Phonak Virto I70-Titanium","model":"Phonak Virto I70-Titanium","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":7300,"swdCode":""},{"idProduct":"11871584","nfzCode":"P.01.01.01","tradeName":"Phonak Virto I90-10 NW O","model":"Phonak Virto I90-10 NW O","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":8500,"swdCode":""},{"idProduct":"11871588","nfzCode":"P.01.01.01","tradeName":"Phonak Virto I90-Titanium","model":"Phonak Virto I90-Titanium","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":10300,"swdCode":""},{"idProduct":"12924571","nfzCode":"P.01.01.01","tradeName":"Rely 1 RLY176-DW","model":"RLY176-DW","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":1950,"swdCode":""},{"idProduct":"12924570","nfzCode":"P.01.01.01","tradeName":"Rely 1 RLY186-DWH","model":"RLY186-DWH","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":1950,"swdCode":""},{"idProduct":"10553730","nfzCode":"P.01.01.01","tradeName":"Rely 2 RLY263-DRW","model":"RLY263-DRW","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":2450,"swdCode":""},{"idProduct":"10553778","nfzCode":"P.01.01.01","tradeName":"Rely 2 RLY263-DRW","model":"RLY263-DRW","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":2500,"swdCode":""},{"idProduct":"10553777","nfzCode":"P.01.01.01","tradeName":"Rely 2 RLY264-DRW","model":"RLY264-DRW","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":2500,"swdCode":""},{"idProduct":"10553729","nfzCode":"P.01.01.01","tradeName":"Rely 2 RLY264-DRW","model":"RLY264-DRW","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":2450,"swdCode":""},{"idProduct":"10553728","nfzCode":"P.01.01.01","tradeName":"Rely 2 RLY266-DW","model":"RLY266-DW","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":2450,"swdCode":""},{"idProduct":"10553776","nfzCode":"P.01.01.01","tradeName":"Rely 2 RLY266-DW","model":"RLY266-DW","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":2500,"swdCode":""},{"idProduct":"10553727","nfzCode":"P.01.01.01","tradeName":"Rely 2 RLY276-DW","model":"RLY276-DW","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":2450,"swdCode":""},{"idProduct":"10553775","nfzCode":"P.01.01.01","tradeName":"Rely 2 RLY276-DW","model":"RLY276-DW","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":2500,"swdCode":""},{"idProduct":"10553774","nfzCode":"P.01.01.01","tradeName":"Rely 2 RLY286-DWH","model":"RLY286-DWH","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":2500,"swdCode":""},{"idProduct":"10553726","nfzCode":"P.01.01.01","tradeName":"Rely 2 RLY286-DWH","model":"RLY286-DWH","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":2450,"swdCode":""},{"idProduct":"10553773","nfzCode":"P.01.01.01","tradeName":"Rely 2 RLY295-DW","model":"RLY295-DW","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":2500,"swdCode":""},{"idProduct":"10553725","nfzCode":"P.01.01.01","tradeName":"Rely 2 RLY295-DW","model":"RLY295-DW","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":2450,"swdCode":""},{"idProduct":"10553772","nfzCode":"P.01.01.01","tradeName":"Rely 2 RLY2ITC-DW-HP","model":"RLY2ITC-DW-HP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":2500,"swdCode":""},{"idProduct":"10553724","nfzCode":"P.01.01.01","tradeName":"Rely 2 RLY2ITC-DW-HP","model":"RLY2ITC-DW-HP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":2450,"swdCode":""},{"idProduct":"10553723","nfzCode":"P.01.01.01","tradeName":"Rely 2 RLY2ITC-DW-MP","model":"RLY2ITC-DW-MP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":2450,"swdCode":""},{"idProduct":"10553771","nfzCode":"P.01.01.01","tradeName":"Rely 2 RLY2ITC-DW-MP","model":"RLY2ITC-DW-MP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":2500,"swdCode":""},{"idProduct":"10553722","nfzCode":"P.01.01.01","tradeName":"Rely 2 RLY2ITC-DW-UP","model":"RLY2ITC-DW-UP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":2450,"swdCode":""},{"idProduct":"10553770","nfzCode":"P.01.01.01","tradeName":"Rely 2 RLY2ITC-DW-UP","model":"RLY2ITC-DW-UP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":2500,"swdCode":""},{"idProduct":"10553769","nfzCode":"P.01.01.01","tradeName":"Rely 2 RLY2ITE-DW-HP","model":"RLY2ITE-DW-HP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":2500,"swdCode":""},{"idProduct":"10553721","nfzCode":"P.01.01.01","tradeName":"Rely 2 RLY2ITE-DW-HP","model":"RLY2ITE-DW-HP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":2450,"swdCode":""},{"idProduct":"10553768","nfzCode":"P.01.01.01","tradeName":"Rely 2 RLY2ITE-DW-MP","model":"RLY2ITE-DW-MP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":2500,"swdCode":""},{"idProduct":"10553720","nfzCode":"P.01.01.01","tradeName":"Rely 2 RLY2ITE-DW-MP","model":"RLY2ITE-DW-MP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":2450,"swdCode":""},{"idProduct":"10553767","nfzCode":"P.01.01.01","tradeName":"Rely 2 RLY2ITE-DW-UP","model":"RLY2ITE-DW-UP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":2500,"swdCode":""},{"idProduct":"10553719","nfzCode":"P.01.01.01","tradeName":"Rely 2 RLY2ITE-DW-UP","model":"RLY2ITE-DW-UP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":2450,"swdCode":""},{"idProduct":"10553718","nfzCode":"P.01.01.01","tradeName":"Rely 3 RLY363-DRW","model":"RLY363-DRW","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":2850,"swdCode":""},{"idProduct":"10553717","nfzCode":"P.01.01.01","tradeName":"Rely 3 RLY364-DRW","model":"RLY364-DRW","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":2850,"swdCode":""},{"idProduct":"10553716","nfzCode":"P.01.01.01","tradeName":"Rely 3 RLY366-DW","model":"RLY366-DW","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":2850,"swdCode":""},{"idProduct":"10553715","nfzCode":"P.01.01.01","tradeName":"Rely 3 RLY376-DW","model":"RLY376-DW","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":2850,"swdCode":""},{"idProduct":"10553714","nfzCode":"P.01.01.01","tradeName":"Rely 3 RLY386-DWH","model":"RLY386-DWH","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":2850,"swdCode":""},{"idProduct":"10553713","nfzCode":"P.01.01.01","tradeName":"Rely 3 RLY395-DW","model":"RLY395-DW","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":2850,"swdCode":""},{"idProduct":"10553712","nfzCode":"P.01.01.01","tradeName":"Rely 3 RLY3CIC-W-HP","model":"RLY3CIC-W-HP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":2850,"swdCode":""},{"idProduct":"10553711","nfzCode":"P.01.01.01","tradeName":"Rely 3 RLY3CIC-W-LP","model":"RLY3CIC-W-LP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":2850,"swdCode":""},{"idProduct":"10553710","nfzCode":"P.01.01.01","tradeName":"Rely 3 RLY3CIC-W-MP","model":"RLY3CIC-W-MP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":2850,"swdCode":""},{"idProduct":"10553709","nfzCode":"P.01.01.01","tradeName":"Rely 3 RLY3ITC-DW-HP","model":"RLY3ITC-DW-HP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":2850,"swdCode":""},{"idProduct":"10553708","nfzCode":"P.01.01.01","tradeName":"Rely 3 RLY3ITC-DW-MP","model":"RLY3ITC-DW-MP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":2850,"swdCode":""},{"idProduct":"10553707","nfzCode":"P.01.01.01","tradeName":"Rely 3 RLY3ITC-DW-UP","model":"RLY3ITC-DW-UP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":2850,"swdCode":""},{"idProduct":"10553706","nfzCode":"P.01.01.01","tradeName":"Rely 3 RLY3ITE-DW-HP","model":"RLY3ITE-DW-HP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":2850,"swdCode":""},{"idProduct":"10553705","nfzCode":"P.01.01.01","tradeName":"Rely 3 RLY3ITE-DW-MP","model":"RLY3ITE-DW-MP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":2850,"swdCode":""},{"idProduct":"10553704","nfzCode":"P.01.01.01","tradeName":"Rely 3 RLY3ITE-DW-UP","model":"RLY3ITE-DW-UP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":2850,"swdCode":""},{"idProduct":"10553703","nfzCode":"P.01.01.01","tradeName":"Rely 4 RLY463-DRW","model":"RLY463-DRW","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":3550,"swdCode":""},{"idProduct":"10553702","nfzCode":"P.01.01.01","tradeName":"Rely 4 RLY463-DRWC","model":"RLY463-DRWC","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":3550,"swdCode":""},{"idProduct":"10553766","nfzCode":"P.01.01.01","tradeName":"Rely 4 RLY463-DRWC","model":"RLY463-DRWC","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":3750,"swdCode":""},{"idProduct":"10553765","nfzCode":"P.01.01.01","tradeName":"Rely 4 RLY464-DRW","model":"RLY464-DRW","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":3650,"swdCode":""},{"idProduct":"10553701","nfzCode":"P.01.01.01","tradeName":"Rely 4 RLY464-DRW","model":"RLY464-DRW","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":3550,"swdCode":""},{"idProduct":"10553700","nfzCode":"P.01.01.01","tradeName":"Rely 4 RLY466-DW","model":"RLY466-DW","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":3550,"swdCode":""},{"idProduct":"10553764","nfzCode":"P.01.01.01","tradeName":"Rely 4 RLY466-DW","model":"RLY466-DW","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":3650,"swdCode":""},{"idProduct":"10553699","nfzCode":"P.01.01.01","tradeName":"Rely 4 RLY476-DW","model":"RLY476-DW","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":3550,"swdCode":""},{"idProduct":"10553763","nfzCode":"P.01.01.01","tradeName":"Rely 4 RLY476-DW","model":"RLY476-DW","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":3650,"swdCode":""},{"idProduct":"10553762","nfzCode":"P.01.01.01","tradeName":"Rely 4 RLY486-DWH","model":"RLY486-DWH","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":3650,"swdCode":""},{"idProduct":"10553698","nfzCode":"P.01.01.01","tradeName":"Rely 4 RLY486-DWH","model":"RLY486-DWH","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":3550,"swdCode":""},{"idProduct":"10553761","nfzCode":"P.01.01.01","tradeName":"Rely 4 RLY495-DW","model":"RLY495-DW","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":3650,"swdCode":""},{"idProduct":"10553697","nfzCode":"P.01.01.01","tradeName":"Rely 4 RLY495-DW","model":"RLY495-DW","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":3550,"swdCode":""},{"idProduct":"10553760","nfzCode":"P.01.01.01","tradeName":"Rely 4 RLY4CIC-W-HP","model":"RLY4CIC-W-HP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":3600,"swdCode":""},{"idProduct":"10553696","nfzCode":"P.01.01.01","tradeName":"Rely 4 RLY4CIC-W-HP","model":"RLY4CIC-W-HP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":3550,"swdCode":""},{"idProduct":"10553759","nfzCode":"P.01.01.01","tradeName":"Rely 4 RLY4CIC-W-LP","model":"RLY4CIC-W-LP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":3600,"swdCode":""},{"idProduct":"10553695","nfzCode":"P.01.01.01","tradeName":"Rely 4 RLY4CIC-W-LP","model":"RLY4CIC-W-LP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":3550,"swdCode":""},{"idProduct":"10553694","nfzCode":"P.01.01.01","tradeName":"Rely 4 RLY4CIC-W-MP","model":"RLY4CIC-W-MP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":3550,"swdCode":""},{"idProduct":"10553758","nfzCode":"P.01.01.01","tradeName":"Rely 4 RLY4CIC-W-MP","model":"RLY4CIC-W-MP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":3600,"swdCode":""},{"idProduct":"10553693","nfzCode":"P.01.01.01","tradeName":"Rely 4 RLY4ITC-DW-HP","model":"RLY4ITC-DW-HP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":3550,"swdCode":""},{"idProduct":"10553692","nfzCode":"P.01.01.01","tradeName":"Rely 4 RLY4ITC-DW-MP","model":"RLY4ITC-DW-MP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":3550,"swdCode":""},{"idProduct":"10553691","nfzCode":"P.01.01.01","tradeName":"Rely 4 RLY4ITC-DW-UP","model":"RLY4ITC-DW-UP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":3550,"swdCode":""},{"idProduct":"10553690","nfzCode":"P.01.01.01","tradeName":"Rely 4 RLY4ITE-DW-HP","model":"RLY4ITE-DW-HP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":3550,"swdCode":""},{"idProduct":"10553689","nfzCode":"P.01.01.01","tradeName":"Rely 4 RLY4ITE-DW-MP","model":"RLY4ITE-DW-MP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":3550,"swdCode":""},{"idProduct":"10553688","nfzCode":"P.01.01.01","tradeName":"Rely 4 RLY4ITE-DW-UP","model":"RLY4ITE-DW-UP","manufacturer":"Beltone A/S","orderIndex":"N","grossPrice":3550,"swdCode":""},{"idProduct":"10550905","nfzCode":"P.01.01.01","tradeName":"Resound Key 1","model":"KE177","manufacturer":"RESOUND","orderIndex":"N","grossPrice":1950,"swdCode":""},{"idProduct":"10550906","nfzCode":"P.01.01.01","tradeName":"Resound Key 1","model":"KE188","manufacturer":"RESOUND","orderIndex":"N","grossPrice":1950,"swdCode":""},{"idProduct":"10550909","nfzCode":"P.01.01.01","tradeName":"Resound Key 2","model":"KE267","manufacturer":"RESOUND","orderIndex":"N","grossPrice":2600,"swdCode":""},{"idProduct":"10550910","nfzCode":"P.01.01.01","tradeName":"Resound Key 2","model":"KE277","manufacturer":"RESOUND","orderIndex":"N","grossPrice":2600,"swdCode":""},{"idProduct":"10550911","nfzCode":"P.01.01.01","tradeName":"Resound Key 2","model":"KE288","manufacturer":"RESOUND","orderIndex":"N","grossPrice":2600,"swdCode":""},{"idProduct":"10550908","nfzCode":"P.01.01.01","tradeName":"Resound Key 2","model":"KE262","manufacturer":"RESOUND","orderIndex":"N","grossPrice":2600,"swdCode":""},{"idProduct":"10550907","nfzCode":"P.01.01.01","tradeName":"Resound Key 2","model":"KE261","manufacturer":"RESOUND","orderIndex":"N","grossPrice":2600,"swdCode":""},{"idProduct":"10550912","nfzCode":"P.01.01.01","tradeName":"Resound Key 2","model":"KE298","manufacturer":"RESOUND","orderIndex":"N","grossPrice":2700,"swdCode":""},{"idProduct":"10550918","nfzCode":"P.01.01.01","tradeName":"Resound Key 2","model":"KE2 ITE-UP","manufacturer":"RESOUND","orderIndex":"N","grossPrice":2700,"swdCode":""},{"idProduct":"10550913","nfzCode":"P.01.01.01","tradeName":"Resound Key 2","model":"KE2 ITC-MP","manufacturer":"RESOUND","orderIndex":"N","grossPrice":2700,"swdCode":""},{"idProduct":"10550914","nfzCode":"P.01.01.01","tradeName":"Resound Key 2","model":"KE2 ITC-HP","manufacturer":"RESOUND","orderIndex":"N","grossPrice":2700,"swdCode":""},{"idProduct":"10550915","nfzCode":"P.01.01.01","tradeName":"Resound Key 2","model":"KE2 ITC-UP","manufacturer":"RESOUND","orderIndex":"N","grossPrice":2700,"swdCode":""},{"idProduct":"10550916","nfzCode":"P.01.01.01","tradeName":"Resound Key 2","model":"KE2 ITE-MP","manufacturer":"RESOUND","orderIndex":"N","grossPrice":2700,"swdCode":""},{"idProduct":"10550917","nfzCode":"P.01.01.01","tradeName":"Resound Key 2","model":"KE2 ITE-HP","manufacturer":"RESOUND","orderIndex":"N","grossPrice":2700,"swdCode":""},{"idProduct":"10550919","nfzCode":"P.01.01.01","tradeName":"Resound Key 3","model":"KE361","manufacturer":"RESOUND","orderIndex":"N","grossPrice":3100,"swdCode":""},{"idProduct":"10550920","nfzCode":"P.01.01.01","tradeName":"Resound Key 3","model":"KE362","manufacturer":"RESOUND","orderIndex":"N","grossPrice":3100,"swdCode":""},{"idProduct":"12410229","nfzCode":"P.01.01.01","tradeName":"ReSound Savi 261.","model":"SA261-DRW.","manufacturer":"RESOUND","orderIndex":"N","grossPrice":2900,"swdCode":""},{"idProduct":"12410231","nfzCode":"P.01.01.01","tradeName":"ReSound Savi 262.","model":"SA262-DRW.","manufacturer":"RESOUND","orderIndex":"N","grossPrice":2900,"swdCode":""},{"idProduct":"12410233","nfzCode":"P.01.01.01","tradeName":"ReSound Savi 360.","model":"SA360-DRWC.","manufacturer":"RESOUND","orderIndex":"N","grossPrice":3900,"swdCode":""},{"idProduct":"12410230","nfzCode":"P.01.01.01","tradeName":"ReSound Savi 361.","model":"SA361-DRW.","manufacturer":"RESOUND","orderIndex":"N","grossPrice":3900,"swdCode":""},{"idProduct":"12410232","nfzCode":"P.01.01.01","tradeName":"ReSound Savi 362.","model":"SA362-DRW.","manufacturer":"RESOUND","orderIndex":"N","grossPrice":3900,"swdCode":""},{"idProduct":"12410245","nfzCode":"P.01.01.01","tradeName":"ReSound Vivia 460S.","model":"VI460S-DRWC.","manufacturer":"RESOUND","orderIndex":"N","grossPrice":4700,"swdCode":""},{"idProduct":"12410234","nfzCode":"P.01.01.01","tradeName":"ReSound Vivia 461.","model":"VI461-DRW.","manufacturer":"RESOUND","orderIndex":"N","grossPrice":4700,"swdCode":""},{"idProduct":"12410238","nfzCode":"P.01.01.01","tradeName":"ReSound Vivia 462.","model":"VI462-DRW.","manufacturer":"RESOUND","orderIndex":"N","grossPrice":4700,"swdCode":""},{"idProduct":"12410244","nfzCode":"P.01.01.01","tradeName":"ReSound Vivia 560S.","model":"VI560S-DRWC.","manufacturer":"RESOUND","orderIndex":"N","grossPrice":6700,"swdCode":""},{"idProduct":"12410235","nfzCode":"P.01.01.01","tradeName":"ReSound Vivia 561.","model":"VI561-DRW.","manufacturer":"RESOUND","orderIndex":"N","grossPrice":6700,"swdCode":""},{"idProduct":"12410239","nfzCode":"P.01.01.01","tradeName":"ReSound Vivia 562.","model":"VI562-DRW.","manufacturer":"RESOUND","orderIndex":"N","grossPrice":6700,"swdCode":""},{"idProduct":"12410243","nfzCode":"P.01.01.01","tradeName":"ReSound Vivia 760S.","model":"VI760S-DRWC.","manufacturer":"RESOUND","orderIndex":"N","grossPrice":8700,"swdCode":""},{"idProduct":"12410236","nfzCode":"P.01.01.01","tradeName":"ReSound Vivia 761.","model":"VI761-DRW.","manufacturer":"RESOUND","orderIndex":"N","grossPrice":8700,"swdCode":""},{"idProduct":"12410240","nfzCode":"P.01.01.01","tradeName":"ReSound Vivia 762.","model":"VI762-DRW.","manufacturer":"RESOUND","orderIndex":"N","grossPrice":8700,"swdCode":""},{"idProduct":"12410242","nfzCode":"P.01.01.01","tradeName":"ReSound Vivia 960S.","model":"VI960S-DRWC.","manufacturer":"RESOUND","orderIndex":"N","grossPrice":10700,"swdCode":""},{"idProduct":"12410237","nfzCode":"P.01.01.01","tradeName":"ReSound Vivia 961.","model":"VI961-DRW.","manufacturer":"RESOUND","orderIndex":"N","grossPrice":10700,"swdCode":""},{"idProduct":"12410241","nfzCode":"P.01.01.01","tradeName":"ReSound Vivia 962.","model":"VI962-DRW.","manufacturer":"RESOUND","orderIndex":"N","grossPrice":10700,"swdCode":""},{"idProduct":"12910490","nfzCode":"P.01.01.01","tradeName":"Signature Series 16 CIC NW","model":"Audibel Signature Series 16 CIC NW","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":5300,"swdCode":""},{"idProduct":"12910489","nfzCode":"P.01.01.01","tradeName":"Signature Series 16 CIC R NW","model":"Audibel Signature Series 16 CIC R NW","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":5300,"swdCode":""},{"idProduct":"12910488","nfzCode":"P.01.01.01","tradeName":"Signature Series 20 CIC NW","model":"Audibel Signature Series 20 CIC NW","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":6300,"swdCode":""},{"idProduct":"12910487","nfzCode":"P.01.01.01","tradeName":"Signature Series 20 CIC R NW","model":"Audibel Signature Series 20 CIC R NW","manufacturer":"Starkey Laboratories Inc.","orderIndex":"N","grossPrice":6300,"swdCode":""},{"idProduct":"12910485","nfzCode":"P.01.01.01","tradeName":"Signature Series 24 CIC NW","model":"Audibel Signature Series 24 CIC NW","manufacturer":"Starkey Hearing Technologies","orderIndex":"N","grossPrice":9300,"swdCode":""},{"idProduct":"12910484","nfzCode":"P.01.01.01","tradeName":"Signature Series 24 CIC R NW","model":"Audibel Signature Series 24 CIC R NW","manufacturer":"Starkey Hearing Technologies","orderIndex":"N","grossPrice":9400,"swdCode":""},{"idProduct":"12910486","nfzCode":"P.01.01.01","tradeName":"Signature Series 24 IIC NW","model":"Audibel Signature Series 24 IIC NW","manufacturer":"Starkey Hearing Technologies","orderIndex":"N","grossPrice":9900,"swdCode":""},{"idProduct":"10550522","nfzCode":"P.01.01.01","tradeName":"SONIC ENCHANT SE","model":"ENCHANT SE 10 B 105","manufacturer":"SBO","orderIndex":"N","grossPrice":2650,"swdCode":""},{"idProduct":"10550530","nfzCode":"P.01.01.01","tradeName":"SONIC ENCHANT SE","model":"ENCHANT SE 10 ITE HS","manufacturer":"SBO","orderIndex":"N","grossPrice":3050,"swdCode":""},{"idProduct":"10550523","nfzCode":"P.01.01.01","tradeName":"SONIC ENCHANT SE","model":"ENCHANT SE 20 IIC","manufacturer":"SBO","orderIndex":"N","grossPrice":3250,"swdCode":""},{"idProduct":"10550524","nfzCode":"P.01.01.01","tradeName":"SONIC ENCHANT SE","model":"ENCHANT SE 20 CIC","manufacturer":"SBO","orderIndex":"N","grossPrice":3250,"swdCode":""},{"idProduct":"10550525","nfzCode":"P.01.01.01","tradeName":"SONIC ENCHANT SE","model":"ENCHANT SE 20 ITC","manufacturer":"SBO","orderIndex":"N","grossPrice":3250,"swdCode":""},{"idProduct":"10550526","nfzCode":"P.01.01.01","tradeName":"SONIC ENCHANT SE","model":"ENCHANT SE 20 ITE HS","manufacturer":"SBO","orderIndex":"N","grossPrice":3250,"swdCode":""},{"idProduct":"10550527","nfzCode":"P.01.01.01","tradeName":"SONIC ENCHANT SE","model":"ENCHANT SE 10 IIC","manufacturer":"SBO","orderIndex":"N","grossPrice":3050,"swdCode":""},{"idProduct":"10550521","nfzCode":"P.01.01.01","tradeName":"SONIC ENCHANT SE","model":"ENCHANT SE 20 B 105","manufacturer":"SBO","orderIndex":"N","grossPrice":2950,"swdCode":""},{"idProduct":"10550529","nfzCode":"P.01.01.01","tradeName":"SONIC ENCHANT SE","model":"ENCHANT SE 10 ITC","manufacturer":"SBO","orderIndex":"N","grossPrice":3050,"swdCode":""},{"idProduct":"10550528","nfzCode":"P.01.01.01","tradeName":"SONIC ENCHANT SE","model":"ENCHANT SE 10 CIC","manufacturer":"SBO","orderIndex":"N","grossPrice":3050,"swdCode":""},{"idProduct":"10550520","nfzCode":"P.01.01.01","tradeName":"SONIC ENCHANT SE","model":"ENCHANT SE 10 MNR T","manufacturer":"SBO","orderIndex":"N","grossPrice":2850,"swdCode":""},{"idProduct":"10550519","nfzCode":"P.01.01.01","tradeName":"SONIC ENCHANT SE","model":"ENCHANT SE 20 MNR T","manufacturer":"SBO","orderIndex":"N","grossPrice":3150,"swdCode":""},{"idProduct":"10550518","nfzCode":"P.01.01.01","tradeName":"SONIC ENCHANT SE","model":"ENCHANT SE 10 MNR","manufacturer":"SBO","orderIndex":"N","grossPrice":2850,"swdCode":""},{"idProduct":"10550517","nfzCode":"P.01.01.01","tradeName":"SONIC ENCHANT SE","model":"ENCHANT SE 20 MNR","manufacturer":"SBO","orderIndex":"N","grossPrice":3150,"swdCode":""},{"idProduct":"10550479","nfzCode":"P.01.01.01","tradeName":"SONIC RADIANT 100","model":"RADIANT 100 ITE HS","manufacturer":"SBO","orderIndex":"N","grossPrice":8950,"swdCode":""},{"idProduct":"10550473","nfzCode":"P.01.01.01","tradeName":"SONIC RADIANT 100","model":"RADIANT 100 MNR T R","manufacturer":"SBO","orderIndex":"N","grossPrice":9250,"swdCode":""},{"idProduct":"10550480","nfzCode":"P.01.01.01","tradeName":"SONIC RADIANT 100","model":"RADIANT 100 ITE FS","manufacturer":"SBO","orderIndex":"N","grossPrice":8950,"swdCode":""},{"idProduct":"10550472","nfzCode":"P.01.01.01","tradeName":"SONIC RADIANT 100","model":"RADIANT 100 MNR T","manufacturer":"SBO","orderIndex":"N","grossPrice":8750,"swdCode":""},{"idProduct":"10550474","nfzCode":"P.01.01.01","tradeName":"SONIC RADIANT 100","model":"RADIANT 100 MNB T","manufacturer":"SBO","orderIndex":"N","grossPrice":8550,"swdCode":""},{"idProduct":"10550477","nfzCode":"P.01.01.01","tradeName":"SONIC RADIANT 100","model":"RADIANT 100 CIC","manufacturer":"SBO","orderIndex":"N","grossPrice":8950,"swdCode":""},{"idProduct":"10550476","nfzCode":"P.01.01.01","tradeName":"SONIC RADIANT 100","model":"RADIANT 100 IIC","manufacturer":"SBO","orderIndex":"N","grossPrice":8950,"swdCode":""},{"idProduct":"10550475","nfzCode":"P.01.01.01","tradeName":"SONIC RADIANT 100","model":"RADIANT 100 MNB T R","manufacturer":"SBO","orderIndex":"N","grossPrice":9050,"swdCode":""},{"idProduct":"10550478","nfzCode":"P.01.01.01","tradeName":"SONIC RADIANT 100","model":"RADIANT 100 ITC","manufacturer":"SBO","orderIndex":"N","grossPrice":8950,"swdCode":""},{"idProduct":"10550516","nfzCode":"P.01.01.01","tradeName":"SONIC RADIANT 20","model":"RADIANT 20 ITE FS","manufacturer":"SBO","orderIndex":"N","grossPrice":3650,"swdCode":""},{"idProduct":"10550514","nfzCode":"P.01.01.01","tradeName":"SONIC RADIANT 20","model":"RADIANT 20 ITC","manufacturer":"SBO","orderIndex":"N","grossPrice":3650,"swdCode":""},{"idProduct":"10550513","nfzCode":"P.01.01.01","tradeName":"SONIC RADIANT 20","model":"RADIANT 20 CIC","manufacturer":"SBO","orderIndex":"N","grossPrice":3650,"swdCode":""},{"idProduct":"10550512","nfzCode":"P.01.01.01","tradeName":"SONIC RADIANT 20","model":"RADIANT 20 IIC","manufacturer":"SBO","orderIndex":"N","grossPrice":3650,"swdCode":""},{"idProduct":"10550511","nfzCode":"P.01.01.01","tradeName":"SONIC RADIANT 20","model":"RADIANT 20 MNB T R","manufacturer":"SBO","orderIndex":"N","grossPrice":3750,"swdCode":""},{"idProduct":"10550510","nfzCode":"P.01.01.01","tradeName":"SONIC RADIANT 20","model":"RADIANT 20 MNB T","manufacturer":"SBO","orderIndex":"N","grossPrice":3350,"swdCode":""},{"idProduct":"10550509","nfzCode":"P.01.01.01","tradeName":"SONIC RADIANT 20","model":"RADIANT 20 MNR T R","manufacturer":"SBO","orderIndex":"N","grossPrice":3950,"swdCode":""},{"idProduct":"10550508","nfzCode":"P.01.01.01","tradeName":"SONIC RADIANT 20","model":"RADIANT 20 MNR T","manufacturer":"SBO","orderIndex":"N","grossPrice":3450,"swdCode":""},{"idProduct":"10550515","nfzCode":"P.01.01.01","tradeName":"SONIC RADIANT 20","model":"RADIANT 20 ITE HS","manufacturer":"SBO","orderIndex":"N","grossPrice":3650,"swdCode":""},{"idProduct":"10550506","nfzCode":"P.01.01.01","tradeName":"SONIC RADIANT 40","model":"RADIANT 40 ITE HS","manufacturer":"SBO","orderIndex":"N","grossPrice":4650,"swdCode":""},{"idProduct":"10550505","nfzCode":"P.01.01.01","tradeName":"SONIC RADIANT 40","model":"RADIANT 40 ITC","manufacturer":"SBO","orderIndex":"N","grossPrice":4650,"swdCode":""},{"idProduct":"10550504","nfzCode":"P.01.01.01","tradeName":"SONIC RADIANT 40","model":"RADIANT 40 CIC","manufacturer":"SBO","orderIndex":"N","grossPrice":4650,"swdCode":""},{"idProduct":"10550503","nfzCode":"P.01.01.01","tradeName":"SONIC RADIANT 40","model":"RADIANT 40 IIC","manufacturer":"SBO","orderIndex":"N","grossPrice":4650,"swdCode":""},{"idProduct":"10550507","nfzCode":"P.01.01.01","tradeName":"SONIC RADIANT 40","model":"RADIANT 40 ITE FS","manufacturer":"SBO","orderIndex":"N","grossPrice":4650,"swdCode":""},{"idProduct":"10550501","nfzCode":"P.01.01.01","tradeName":"SONIC RADIANT 40","model":"RADIANT 40 MNB T","manufacturer":"SBO","orderIndex":"N","grossPrice":4150,"swdCode":""},{"idProduct":"10550500","nfzCode":"P.01.01.01","tradeName":"SONIC RADIANT 40","model":"RADIANT 40 MNR T R","manufacturer":"SBO","orderIndex":"N","grossPrice":5450,"swdCode":""},{"idProduct":"10550499","nfzCode":"P.01.01.01","tradeName":"SONIC RADIANT 40","model":"RADIANT 40 MNR T","manufacturer":"SBO","orderIndex":"N","grossPrice":4350,"swdCode":""},{"idProduct":"10550502","nfzCode":"P.01.01.01","tradeName":"SONIC RADIANT 40","model":"RADIANT 40 MNB T R","manufacturer":"SBO","orderIndex":"N","grossPrice":5150,"swdCode":""},{"idProduct":"10550497","nfzCode":"P.01.01.01","tradeName":"SONIC RADIANT 60","model":"RADIANT 60 ITE HS","manufacturer":"SBO","orderIndex":"N","grossPrice":5850,"swdCode":""},{"idProduct":"10550498","nfzCode":"P.01.01.01","tradeName":"SONIC RADIANT 60","model":"RADIANT 60 ITE FS","manufacturer":"SBO","orderIndex":"N","grossPrice":5850,"swdCode":""},{"idProduct":"10550490","nfzCode":"P.01.01.01","tradeName":"SONIC RADIANT 60","model":"RADIANT 60 MNR T","manufacturer":"SBO","orderIndex":"N","grossPrice":5550,"swdCode":""},{"idProduct":"10550491","nfzCode":"P.01.01.01","tradeName":"SONIC RADIANT 60","model":"RADIANT 60 MNR T R","manufacturer":"SBO","orderIndex":"N","grossPrice":6550,"swdCode":""},{"idProduct":"10550492","nfzCode":"P.01.01.01","tradeName":"SONIC RADIANT 60","model":"RADIANT 60 MNB T","manufacturer":"SBO","orderIndex":"N","grossPrice":5250,"swdCode":""},{"idProduct":"10550493","nfzCode":"P.01.01.01","tradeName":"SONIC RADIANT 60","model":"RADIANT 60 MNB T R","manufacturer":"SBO","orderIndex":"N","grossPrice":6250,"swdCode":""},{"idProduct":"10550494","nfzCode":"P.01.01.01","tradeName":"SONIC RADIANT 60","model":"RADIANT 60 IIC","manufacturer":"SBO","orderIndex":"N","grossPrice":5850,"swdCode":""},{"idProduct":"10550495","nfzCode":"P.01.01.01","tradeName":"SONIC RADIANT 60","model":"RADIANT 60 CIC","manufacturer":"SBO","orderIndex":"N","grossPrice":5850,"swdCode":""},{"idProduct":"10550496","nfzCode":"P.01.01.01","tradeName":"SONIC RADIANT 60","model":"RADIANT 60 ITC","manufacturer":"SBO","orderIndex":"N","grossPrice":5850,"swdCode":""},{"idProduct":"10550489","nfzCode":"P.01.01.01","tradeName":"SONIC RADIANT 80","model":"RADIANT 80 ITE FS","manufacturer":"SBO","orderIndex":"N","grossPrice":7250,"swdCode":""},{"idProduct":"10550482","nfzCode":"P.01.01.01","tradeName":"SONIC RADIANT 80","model":"RADIANT 80 MNR T R","manufacturer":"SBO","orderIndex":"N","grossPrice":7750,"swdCode":""},{"idProduct":"10550483","nfzCode":"P.01.01.01","tradeName":"SONIC RADIANT 80","model":"RADIANT 80 MNB T","manufacturer":"SBO","orderIndex":"N","grossPrice":6750,"swdCode":""},{"idProduct":"10550481","nfzCode":"P.01.01.01","tradeName":"SONIC RADIANT 80","model":"RADIANT 80 MNR T","manufacturer":"SBO","orderIndex":"N","grossPrice":6950,"swdCode":""},{"idProduct":"10550484","nfzCode":"P.01.01.01","tradeName":"SONIC RADIANT 80","model":"RADIANT 80 MNB T R","manufacturer":"SBO","orderIndex":"N","grossPrice":7550,"swdCode":""},{"idProduct":"10550487","nfzCode":"P.01.01.01","tradeName":"SONIC RADIANT 80","model":"RADIANT 80 ITC","manufacturer":"SBO","orderIndex":"N","grossPrice":7250,"swdCode":""},{"idProduct":"10550488","nfzCode":"P.01.01.01","tradeName":"SONIC RADIANT 80","model":"RADIANT 80 ITE HS","manufacturer":"SBO","orderIndex":"N","grossPrice":7250,"swdCode":""},{"idProduct":"10550485","nfzCode":"P.01.01.01","tradeName":"SONIC RADIANT 80","model":"RADIANT 80 IIC","manufacturer":"SBO","orderIndex":"N","grossPrice":7250,"swdCode":""},{"idProduct":"10550486","nfzCode":"P.01.01.01","tradeName":"SONIC RADIANT 80","model":"RADIANT 80 CIC","manufacturer":"SBO","orderIndex":"N","grossPrice":7250,"swdCode":""},{"idProduct":"10550462","nfzCode":"P.01.01.01","tradeName":"SONIC RADIANT SE 100","model":"RADIANT SE 100 MNB T","manufacturer":"SBO","orderIndex":"N","grossPrice":9050,"swdCode":""},{"idProduct":"10550461","nfzCode":"P.01.01.01","tradeName":"SONIC RADIANT SE 100","model":"RADIANT SE 100 MNR T R","manufacturer":"SBO","orderIndex":"N","grossPrice":9350,"swdCode":""},{"idProduct":"10550460","nfzCode":"P.01.01.01","tradeName":"SONIC RADIANT SE 100","model":"RADIANT SE 100 MNR T","manufacturer":"SBO","orderIndex":"N","grossPrice":9250,"swdCode":""},{"idProduct":"10550463","nfzCode":"P.01.01.01","tradeName":"SONIC RADIANT SE 100","model":"RADIANT SE 100 MNB T R","manufacturer":"SBO","orderIndex":"N","grossPrice":9550,"swdCode":""},{"idProduct":"10550471","nfzCode":"P.01.01.01","tradeName":"SONIC RADIANT SE 60","model":"RADIANT SE 60 MNB T R","manufacturer":"SBO","orderIndex":"N","grossPrice":6450,"swdCode":""},{"idProduct":"10550470","nfzCode":"P.01.01.01","tradeName":"SONIC RADIANT SE 60","model":"RADIANT SE 60 MNB T","manufacturer":"SBO","orderIndex":"N","grossPrice":5550,"swdCode":""},{"idProduct":"10550469","nfzCode":"P.01.01.01","tradeName":"SONIC RADIANT SE 60","model":"RADIANT SE 60 MNR T R","manufacturer":"SBO","orderIndex":"N","grossPrice":6650,"swdCode":""},{"idProduct":"10550468","nfzCode":"P.01.01.01","tradeName":"SONIC RADIANT SE 60","model":"RADIANT SE 60 MNR T","manufacturer":"SBO","orderIndex":"N","grossPrice":5850,"swdCode":""},{"idProduct":"10550466","nfzCode":"P.01.01.01","tradeName":"SONIC RADIANT SE 80","model":"RADIANT SE 80 MNB T","manufacturer":"SBO","orderIndex":"N","grossPrice":7150,"swdCode":""},{"idProduct":"10550465","nfzCode":"P.01.01.01","tradeName":"SONIC RADIANT SE 80","model":"RADIANT SE 80 MNR T R","manufacturer":"SBO","orderIndex":"N","grossPrice":8050,"swdCode":""},{"idProduct":"10550464","nfzCode":"P.01.01.01","tradeName":"SONIC RADIANT SE 80","model":"RADIANT SE 80 MNR T","manufacturer":"SBO","orderIndex":"N","grossPrice":7350,"swdCode":""},{"idProduct":"10550467","nfzCode":"P.01.01.01","tradeName":"SONIC RADIANT SE 80","model":"RADIANT SE 80 MNB T R","manufacturer":"SBO","orderIndex":"N","grossPrice":7850,"swdCode":""},{"idProduct":"10550533","nfzCode":"P.01.01.01","tradeName":"SONIC TREK 40","model":"TREK 40 BTE SP","manufacturer":"SBO","orderIndex":"N","grossPrice":4650,"swdCode":""},{"idProduct":"10550531","nfzCode":"P.01.01.01","tradeName":"SONIC TREK 40","model":"TREK 40 BTE UP","manufacturer":"SBO","orderIndex":"N","grossPrice":4650,"swdCode":""},{"idProduct":"10550532","nfzCode":"P.01.01.01","tradeName":"SONIC TREK 80","model":"TREK 80 BTE SP","manufacturer":"SBO","orderIndex":"N","grossPrice":6850,"swdCode":""},{"idProduct":"11652406","nfzCode":"P.02.01.00","tradeName":"ADHEAR","model":"Adhear User Kit","manufacturer":"MED-EL","orderIndex":"N","grossPrice":9600,"swdCode":""},{"idProduct":"10553382","nfzCode":"P.02.01.00","tradeName":"AN EVO","model":"AN EVO1","manufacturer":"BHM TECH","orderIndex":"N","grossPrice":1800,"swdCode":""},{"idProduct":"10553386","nfzCode":"P.02.01.00","tradeName":"Contact Mini","model":"Contact mini","manufacturer":"BHM TECH","orderIndex":"N","grossPrice":7900,"swdCode":""},{"idProduct":"11652409","nfzCode":"P.02.01.00","tradeName":"Contact Mini","model":"Contact mini","manufacturer":"BHM TECH","orderIndex":"N","grossPrice":9900,"swdCode":""},{"idProduct":"10553385","nfzCode":"P.02.01.00","tradeName":"Contact Mini","model":"Contact mini","manufacturer":"BHM TECH","orderIndex":"N","grossPrice":6800,"swdCode":""},{"idProduct":"10553383","nfzCode":"P.02.01.00","tradeName":"CS EVO","model":"CS EVO1","manufacturer":"BHM TECH","orderIndex":"N","grossPrice":3000,"swdCode":""},{"idProduct":"11652408","nfzCode":"P.02.01.00","tradeName":"CS EVO","model":"CS EVO1","manufacturer":"BHM TECH","orderIndex":"N","grossPrice":6800,"swdCode":""},{"idProduct":"10553384","nfzCode":"P.02.01.00","tradeName":"CS EVO","model":"CS EVO1","manufacturer":"BHM TECH","orderIndex":"N","grossPrice":4900,"swdCode":""},{"idProduct":"11652407","nfzCode":"P.02.01.01","tradeName":"ADHEAR","model":"Adhear User Kit","manufacturer":"MED-EL","orderIndex":"N","grossPrice":9600,"swdCode":""},{"idProduct":"10553389","nfzCode":"P.02.01.01","tradeName":"AN EVO","model":"AN EVO1","manufacturer":"BHM TECH","orderIndex":"N","grossPrice":1800,"swdCode":""},{"idProduct":"10553393","nfzCode":"P.02.01.01","tradeName":"Contact Mini","model":"Contact mini","manufacturer":"BHM TECH","orderIndex":"N","grossPrice":7900,"swdCode":""},{"idProduct":"10553392","nfzCode":"P.02.01.01","tradeName":"Contact Mini","model":"Contact mini","manufacturer":"BHM TECH","orderIndex":"N","grossPrice":6800,"swdCode":""},{"idProduct":"11652411","nfzCode":"P.02.01.01","tradeName":"Contact Mini","model":"Contact mini","manufacturer":"BHM TECH","orderIndex":"N","grossPrice":9900,"swdCode":""},{"idProduct":"11652410","nfzCode":"P.02.01.01","tradeName":"CS EVO","model":"CS EVO1","manufacturer":"BHM TECH","orderIndex":"N","grossPrice":6800,"swdCode":""},{"idProduct":"10553390","nfzCode":"P.02.01.01","tradeName":"CS EVO","model":"CS EVO1","manufacturer":"BHM TECH","orderIndex":"N","grossPrice":3000,"swdCode":""},{"idProduct":"10553391","nfzCode":"P.02.01.01","tradeName":"CS EVO","model":"CS EVO1","manufacturer":"BHM TECH","orderIndex":"N","grossPrice":4900,"swdCode":""},{"idProduct":"11428719","nfzCode":"P.03.01.00","tradeName":"HearLink","model":"Wkładka RITE miniFit","manufacturer":"SBO","orderIndex":"T","grossPrice":150,"swdCode":""},{"idProduct":"11428725","nfzCode":"P.03.01.00","tradeName":"HearLink","model":"Wkładka Flex miniFit","manufacturer":"SBO","orderIndex":"T","grossPrice":400,"swdCode":""},{"idProduct":"11428715","nfzCode":"P.03.01.00","tradeName":"HearLink","model":"Wkładka","manufacturer":"SBO","orderIndex":"T","grossPrice":150,"swdCode":""},{"idProduct":"11428723","nfzCode":"P.03.01.00","tradeName":"HearLink","model":"Wkładka VarioTherm","manufacturer":"SBO","orderIndex":"T","grossPrice":350,"swdCode":""},{"idProduct":"11428717","nfzCode":"P.03.01.00","tradeName":"HearLink","model":"Wkładka RITE","manufacturer":"SBO","orderIndex":"T","grossPrice":150,"swdCode":""},{"idProduct":"11428721","nfzCode":"P.03.01.00","tradeName":"HearLink","model":"Wkładka RITE Power","manufacturer":"SBO","orderIndex":"T","grossPrice":230,"swdCode":""},{"idProduct":"12909832","nfzCode":"P.03.01.00","tradeName":"INDYWIDUALNA WKŁADKA USZNA","model":"TWARDA","manufacturer":"GNP MAGNUSSON","orderIndex":"T","grossPrice":170,"swdCode":""},{"idProduct":"12909833","nfzCode":"P.03.01.00","tradeName":"INDYWIDUALNA WKŁADKA USZNA","model":"MIKROWKŁADKA","manufacturer":"GNP MAGNUSSON","orderIndex":"T","grossPrice":50,"swdCode":""},{"idProduct":"12909831","nfzCode":"P.03.01.00","tradeName":"INDYWIDUALNA WKŁADKA USZNA","model":"MIĘKKA","manufacturer":"GNP MAGNUSSON","orderIndex":"T","grossPrice":180,"swdCode":""},{"idProduct":"12924796","nfzCode":"P.03.01.00","tradeName":"WKŁADKA INDYWIDUALNA","model":"WKŁADKA TWARDA","manufacturer":"Oto-Laboratorium Damian ZajLc","orderIndex":"T","grossPrice":170,"swdCode":""},{"idProduct":"12924797","nfzCode":"P.03.01.00","tradeName":"WKŁADKA INDYWIDUALNA","model":"MICRO-WKŁADKA","manufacturer":"Oto-Laboratorium Damian ZajLc","orderIndex":"T","grossPrice":180,"swdCode":""},{"idProduct":"12924798","nfzCode":"P.03.01.00","tradeName":"WKŁADKA INDYWIDUALNA","model":"WKŁADKA MIĘKKA","manufacturer":"Oto-Laboratorium Damian ZajLc","orderIndex":"T","grossPrice":50,"swdCode":""},{"idProduct":"12910227","nfzCode":"P.03.01.00","tradeName":"Wkładka Indywidualna Micro-Wkładka","model":"Micro-Wkładka","manufacturer":"Oto-Laboratorium Damian Zając","orderIndex":"T","grossPrice":170,"swdCode":""},{"idProduct":"12910226","nfzCode":"P.03.01.00","tradeName":"Wkładka Indywidualna Twarda","model":"Wkładka Twarda","manufacturer":"Oto-Laboratorium Damian Zając","orderIndex":"T","grossPrice":170,"swdCode":""},{"idProduct":"12910441","nfzCode":"P.03.01.00","tradeName":"Wkładka uszna","model":"Wkładka uszna","manufacturer":"Starkey Hearing Technologies","orderIndex":"T","grossPrice":160,"swdCode":""},{"idProduct":"11428726","nfzCode":"P.03.01.01","tradeName":"HearLink","model":"Wkładka Flex miniFit","manufacturer":"SBO","orderIndex":"T","grossPrice":400,"swdCode":""},{"idProduct":"11428724","nfzCode":"P.03.01.01","tradeName":"HearLink","model":"Wkładka VarioTherm","manufacturer":"SBO","orderIndex":"T","grossPrice":350,"swdCode":""},{"idProduct":"11428722","nfzCode":"P.03.01.01","tradeName":"HearLink","model":"Wkładka RITE Power","manufacturer":"SBO","orderIndex":"T","grossPrice":230,"swdCode":""},{"idProduct":"11428720","nfzCode":"P.03.01.01","tradeName":"HearLink","model":"Wkładka RITE miniFit","manufacturer":"SBO","orderIndex":"T","grossPrice":150,"swdCode":""},{"idProduct":"11428718","nfzCode":"P.03.01.01","tradeName":"HearLink","model":"Wkładka RITE","manufacturer":"SBO","orderIndex":"T","grossPrice":150,"swdCode":""},{"idProduct":"11428716","nfzCode":"P.03.01.01","tradeName":"HearLink","model":"Wkładka","manufacturer":"SBO","orderIndex":"T","grossPrice":150,"swdCode":""},{"idProduct":"12909834","nfzCode":"P.03.01.01","tradeName":"INDYWIDUALNA WKŁADKA USZNA.","model":"MIĘKKA DZIECIĘCA.","manufacturer":"GNP MAGNUSSON","orderIndex":"T","grossPrice":180,"swdCode":""},{"idProduct":"12909835","nfzCode":"P.03.01.01","tradeName":"INDYWIDUALNA WKŁADKA USZNA.","model":"TWARDA DZIECIĘCA.","manufacturer":"GNP MAGNUSSON","orderIndex":"T","grossPrice":170,"swdCode":""},{"idProduct":"12909836","nfzCode":"P.03.01.01","tradeName":"INDYWIDUALNA WKŁADKA USZNA.","model":"MIKROWKŁADKA.","manufacturer":"GNP MAGNUSSON","orderIndex":"T","grossPrice":60,"swdCode":""},{"idProduct":"12924800","nfzCode":"P.03.01.01","tradeName":"Wkładka Indywidualna Micro-Wkładka","model":"Micro-Wkładka","manufacturer":"Oto-Laboratorium Damian ZajLc","orderIndex":"T","grossPrice":180,"swdCode":""},{"idProduct":"12910229","nfzCode":"P.03.01.01","tradeName":"Wkładka Indywidualna Micro-Wkładka","model":"Micro-Wkładka","manufacturer":"Oto-Laboratorium Damian Zając","orderIndex":"T","grossPrice":170,"swdCode":""},{"idProduct":"12924801","nfzCode":"P.03.01.01","tradeName":"Wkładka Indywidualna Miękka","model":"Wkładka Miękka","manufacturer":"Oto-Laboratorium Damian ZajLc","orderIndex":"T","grossPrice":60,"swdCode":""},{"idProduct":"12910228","nfzCode":"P.03.01.01","tradeName":"Wkładka Indywidualna Twarda","model":"Wkładka Twarda","manufacturer":"Oto-Laboratorium Damian Zając","orderIndex":"T","grossPrice":170,"swdCode":""},{"idProduct":"12924799","nfzCode":"P.03.01.01","tradeName":"Wkładka Indywidualna Twarda","model":"Wkładka Twarda","manufacturer":"Oto-Laboratorium Damian ZajLc","orderIndex":"T","grossPrice":170,"swdCode":""},{"idProduct":"12910546","nfzCode":"P.03.01.01","tradeName":"Wkładka uszna","model":"Wkładka uszna","manufacturer":"Starkey Hearing Technologies","orderIndex":"T","grossPrice":160,"swdCode":""},{"idProduct":"11652054","nfzCode":"P.04.01","tradeName":"Beltone myPal Micro","model":"Direct family myPal Micro SM-2M","manufacturer":"GN Hearing A/S","orderIndex":"N","grossPrice":6200,"swdCode":""},{"idProduct":"10586825","nfzCode":"P.04.01","tradeName":"Beltone myPal Pro","model":"Direct family myPal Pro SM-2P","manufacturer":"GN Hearing A/S","orderIndex":"N","grossPrice":5500,"swdCode":""},{"idProduct":"12924807","nfzCode":"P.04.01","tradeName":"BERNAFON EDU MIC","model":"EDU MIC","manufacturer":"SBO Hearing A/S","orderIndex":"N","grossPrice":13200,"swdCode":""},{"idProduct":"12924794","nfzCode":"P.04.01","tradeName":"MULTI-MIC+","model":"MULTI-MIC","manufacturer":"SM-3P","orderIndex":"GN Hearing  A/S","grossPrice":"N","swdCode":"5500"},{"idProduct":"12924795","nfzCode":"P.04.01","tradeName":"MULTI-MIC+","model":"MULTI-MIC+","manufacturer":"SM-3P","orderIndex":"GN Hearing  A/S","grossPrice":"N","swdCode":"9400"},{"idProduct":"12924806","nfzCode":"P.04.01","tradeName":"Oticon EDU MIC","model":"Oticon EDU MIC","manufacturer":"SBO","orderIndex":"N","grossPrice":5500,"swdCode":""},{"idProduct":"11652279","nfzCode":"P.04.01","tradeName":"Phonak Roger Clip-on Mic","model":"Phonak Roger Clip-on Mic","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":2600,"swdCode":""},{"idProduct":"11652280","nfzCode":"P.04.01","tradeName":"Phonak Roger On","model":"Phonak Roger On","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":5800,"swdCode":""},{"idProduct":"11652281","nfzCode":"P.04.01","tradeName":"Phonak Roger On iN","model":"Phonak Roger On iN","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":7500,"swdCode":""},{"idProduct":"11652282","nfzCode":"P.04.01","tradeName":"Phonak Roger Select","model":"Phonak Roger Select","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":5500,"swdCode":""},{"idProduct":"11652283","nfzCode":"P.04.01","tradeName":"Phonak Roger Table Mic II","model":"Phonak Roger Table Mic II","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":6900,"swdCode":""},{"idProduct":"10893924","nfzCode":"P.04.01","tradeName":"Phonak Roger Table Mic II","model":"Phonak Roger Table Mic II","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":4200,"swdCode":""},{"idProduct":"11652284","nfzCode":"P.04.01","tradeName":"Phonak Roger Table Mic II iN","model":"Phonak Roger Table Mic II iN","manufacturer":"Sonova AG","orderIndex":"N","grossPrice":8900,"swdCode":""},{"idProduct":"12909956","nfzCode":"P.04.01","tradeName":"ROGER 14","model":"ROGER 14 (02) STEREO ROGER SELECT W3  SYSTEM WSPOMAGAJĄCY SŁYSZENIE ROGER","manufacturer":"PHONAK AG","orderIndex":"N","grossPrice":9500,"swdCode":""},{"idProduct":"12909955","nfzCode":"P.04.01","tradeName":"ROGER 14","model":"ROGER 14 (02) STEREO ROGER SELECT P7  SYSTEM WSPOMAGAJĄCY SŁYSZENIE ROGER","manufacturer":"PHONAK AG","orderIndex":"N","grossPrice":9500,"swdCode":""},{"idProduct":"12909954","nfzCode":"P.04.01","tradeName":"ROGER 14","model":"ROGER 14 (02) STEREO ROGER SELECT P5  SYSTEM WSPOMAGAJĄCY SŁYSZENIE ROGER","manufacturer":"PHONAK AG","orderIndex":"N","grossPrice":9500,"swdCode":""},{"idProduct":"12909953","nfzCode":"P.04.01","tradeName":"ROGER 14","model":"ROGER 14 (02) MONO ROGER SELECT W3  SYSTEM WSPOMAGAJĄCY SŁYSZENIE ROGER","manufacturer":"PHONAK AG","orderIndex":"N","grossPrice":9500,"swdCode":""},{"idProduct":"12909952","nfzCode":"P.04.01","tradeName":"ROGER 14","model":"ROGER 14 (02) MONO ROGER SELECT P7  SYSTEM WSPOMAGAJĄCY SŁYSZENIE ROGER","manufacturer":"PHONAK AG","orderIndex":"N","grossPrice":9500,"swdCode":""},{"idProduct":"12909951","nfzCode":"P.04.01","tradeName":"ROGER 14","model":"ROGER 14 (02) MONO ROGER SELECT P5  SYSTEM WSPOMAGAJĄCY SŁYSZENIE ROGER","manufacturer":"PHONAK AG","orderIndex":"N","grossPrice":9500,"swdCode":""},{"idProduct":"12909950","nfzCode":"P.04.01","tradeName":"ROGER 14","model":"ROGER 14 (02) MONO CLIP-ON MIC SYSTEM WSPOMAGAJĄCY SŁYSZENIE ROGER","manufacturer":"PHONAK AG","orderIndex":"N","grossPrice":6000,"swdCode":""},{"idProduct":"12909957","nfzCode":"P.04.01","tradeName":"ROGER 14","model":"ROGER 14 (03) MONO ROGER SELECT P5  SYSTEM WSPOMAGAJĄCY SŁYSZENIE ROGER","manufacturer":"PHONAK AG","orderIndex":"N","grossPrice":9500,"swdCode":""},{"idProduct":"12909962","nfzCode":"P.04.01","tradeName":"ROGER 14","model":"ROGER 14 (03) STEREO ROGER SELECT W3  SYSTEM WSPOMAGAJĄCY SŁYSZENIE ROGER","manufacturer":"PHONAK AG","orderIndex":"N","grossPrice":9500,"swdCode":""},{"idProduct":"12909961","nfzCode":"P.04.01","tradeName":"ROGER 14","model":"ROGER 14 (03) STEREO ROGER SELECT P7  SYSTEM WSPOMAGAJĄCY SŁYSZENIE ROGER","manufacturer":"PHONAK AG","orderIndex":"N","grossPrice":9500,"swdCode":""},{"idProduct":"12909960","nfzCode":"P.04.01","tradeName":"ROGER 14","model":"ROGER 14 (03) STEREO ROGER SELECT P5  SYSTEM WSPOMAGAJĄCY SŁYSZENIE ROGER","manufacturer":"PHONAK AG","orderIndex":"N","grossPrice":9500,"swdCode":""},{"idProduct":"12909959","nfzCode":"P.04.01","tradeName":"ROGER 14","model":"ROGER 14 (03) MONO ROGER SELECT W3  SYSTEM WSPOMAGAJĄCY SŁYSZENIE ROGER","manufacturer":"PHONAK AG","orderIndex":"N","grossPrice":9500,"swdCode":""},{"idProduct":"12909958","nfzCode":"P.04.01","tradeName":"ROGER 14","model":"ROGER 14 (03) MONO ROGER SELECT P7  SYSTEM WSPOMAGAJĄCY SŁYSZENIE ROGER","manufacturer":"PHONAK AG","orderIndex":"N","grossPrice":9500,"swdCode":""},{"idProduct":"12909963","nfzCode":"P.04.01","tradeName":"ROGER 18","model":"ROGER 18 (02) MONO ROGER SELECT P5  SYSTEM WSPOMAGAJĄCY SŁYSZENIE ROGER","manufacturer":"PHONAK AG","orderIndex":"N","grossPrice":9500,"swdCode":""},{"idProduct":"12909977","nfzCode":"P.04.01","tradeName":"ROGER 18","model":"ROGER 18 (03) STEREO ROGER SELECT W3  SYSTEM WSPOMAGAJĄCY SŁYSZENIE ROGER","manufacturer":"PHONAK AG","orderIndex":"N","grossPrice":9500,"swdCode":""},{"idProduct":"12909965","nfzCode":"P.04.01","tradeName":"ROGER 18","model":"ROGER 18 (02) MONO ROGER SELECT W3  SYSTEM WSPOMAGAJĄCY SŁYSZENIE ROGER","manufacturer":"PHONAK AG","orderIndex":"N","grossPrice":9500,"swdCode":""},{"idProduct":"12909966","nfzCode":"P.04.01","tradeName":"ROGER 18","model":"ROGER 18 (02) ROGER 19 (02) STEREO CLIP-ON MIC 1.1 SYSTEM WSPOMAGAJĄCY SŁYSZENIE ROGER","manufacturer":"PHONAK AG","orderIndex":"N","grossPrice":6000,"swdCode":""},{"idProduct":"12909967","nfzCode":"P.04.01","tradeName":"ROGER 18","model":"ROGER 18 (02) STEREO ROGER SELECT P5  SYSTEM WSPOMAGAJĄCY SŁYSZENIE ROGER","manufacturer":"PHONAK AG","orderIndex":"N","grossPrice":9500,"swdCode":""},{"idProduct":"12909968","nfzCode":"P.04.01","tradeName":"ROGER 18","model":"ROGER 18 (02) STEREO ROGER SELECT P7  SYSTEM WSPOMAGAJĄCY SŁYSZENIE ROGER","manufacturer":"PHONAK AG","orderIndex":"N","grossPrice":9500,"swdCode":""},{"idProduct":"12909969","nfzCode":"P.04.01","tradeName":"ROGER 18","model":"ROGER 18 (02) STEREO ROGER SELECT W3  SYSTEM WSPOMAGAJĄCY SŁYSZENIE ROGER","manufacturer":"PHONAK AG","orderIndex":"N","grossPrice":9500,"swdCode":""},{"idProduct":"12909970","nfzCode":"P.04.01","tradeName":"ROGER 18","model":"ROGER 18 (02) STEREO TOUCHSCREEN MIC SYSTEM WSPOMAGAJĄCY SŁYSZENIE ROGER","manufacturer":"PHONAK AG","orderIndex":"N","grossPrice":6000,"swdCode":""},{"idProduct":"12909971","nfzCode":"P.04.01","tradeName":"ROGER 18","model":"ROGER 18 (03) MONO ROGER SELECT P5  SYSTEM WSPOMAGAJĄCY SŁYSZENIE ROGER","manufacturer":"PHONAK AG","orderIndex":"N","grossPrice":9500,"swdCode":""},{"idProduct":"12909976","nfzCode":"P.04.01","tradeName":"ROGER 18","model":"ROGER 18 (03) STEREO ROGER SELECT P7  SYSTEM WSPOMAGAJĄCY SŁYSZENIE ROGER","manufacturer":"PHONAK AG","orderIndex":"N","grossPrice":9500,"swdCode":""},{"idProduct":"12909975","nfzCode":"P.04.01","tradeName":"ROGER 18","model":"ROGER 18 (03) STEREO ROGER SELECT P5  SYSTEM WSPOMAGAJĄCY SŁYSZENIE ROGER","manufacturer":"PHONAK AG","orderIndex":"N","grossPrice":9500,"swdCode":""},{"idProduct":"12909974","nfzCode":"P.04.01","tradeName":"ROGER 18","model":"ROGER 18 (03) STEREO CLIP-ON MIC 1.1 SYSTEM WSPOMAGAJĄCY SŁYSZENIE ROGER","manufacturer":"PHONAK AG","orderIndex":"N","grossPrice":6000,"swdCode":""},{"idProduct":"12909973","nfzCode":"P.04.01","tradeName":"ROGER 18","model":"ROGER 18 (03) MONO ROGER SELECT W3  SYSTEM WSPOMAGAJĄCY SŁYSZENIE ROGER","manufacturer":"PHONAK AG","orderIndex":"N","grossPrice":9500,"swdCode":""},{"idProduct":"12909972","nfzCode":"P.04.01","tradeName":"ROGER 18","model":"ROGER 18 (03) MONO ROGER SELECT P7  SYSTEM WSPOMAGAJĄCY SŁYSZENIE ROGER","manufacturer":"PHONAK AG","orderIndex":"N","grossPrice":9500,"swdCode":""},{"idProduct":"12909964","nfzCode":"P.04.01","tradeName":"ROGER 18","model":"ROGER 18 (02) MONO ROGER SELECT P7  SYSTEM WSPOMAGAJĄCY SŁYSZENIE ROGER","manufacturer":"PHONAK AG","orderIndex":"N","grossPrice":9500,"swdCode":""},{"idProduct":"12909981","nfzCode":"P.04.01","tradeName":"ROGER 19","model":"ROGER 19 (02) MONO ROGER SELECT W3  SYSTEM WSPOMAGAJĄCY SŁYSZENIE ROGER","manufacturer":"PHONAK AG","orderIndex":"N","grossPrice":9500,"swdCode":""},{"idProduct":"12909982","nfzCode":"P.04.01","tradeName":"ROGER 19","model":"ROGER 19 (02) STEREO ROGER SELECT P5  SYSTEM WSPOMAGAJĄCY SŁYSZENIE ROGER","manufacturer":"PHONAK AG","orderIndex":"N","grossPrice":9500,"swdCode":""},{"idProduct":"12909983","nfzCode":"P.04.01","tradeName":"ROGER 19","model":"ROGER 19 (02) STEREO ROGER SELECT P7  SYSTEM WSPOMAGAJĄCY SŁYSZENIE ROGER","manufacturer":"PHONAK AG","orderIndex":"N","grossPrice":9500,"swdCode":""},{"idProduct":"12909984","nfzCode":"P.04.01","tradeName":"ROGER 19","model":"ROGER 19 (02) STEREO ROGER SELECT W3  SYSTEM WSPOMAGAJĄCY SŁYSZENIE ROGER","manufacturer":"PHONAK AG","orderIndex":"N","grossPrice":9500,"swdCode":""},{"idProduct":"12909988","nfzCode":"P.04.01","tradeName":"ROGER 19","model":"ROGER 19 (03) STEREO ROGER CLIP-ON MIC SYSTEM WSPOMAGAJĄCY SŁYSZENIE","manufacturer":"PHONAK AG","orderIndex":"N","grossPrice":6000,"swdCode":""},{"idProduct":"12909978","nfzCode":"P.04.01","tradeName":"ROGER 19","model":"ROGER 19 (02) MONO ROGER CLIP-ON MIC 1.1 SYSTEM WSPOMAGAJĄCY SŁYSZENIE ROGER","manufacturer":"PHONAK AG","orderIndex":"N","grossPrice":6000,"swdCode":""},{"idProduct":"12909979","nfzCode":"P.04.01","tradeName":"ROGER 19","model":"ROGER 19 (02) MONO ROGER SELECT P5  SYSTEM WSPOMAGAJĄCY SŁYSZENIE ROGER","manufacturer":"PHONAK AG","orderIndex":"N","grossPrice":9500,"swdCode":""},{"idProduct":"12909980","nfzCode":"P.04.01","tradeName":"ROGER 19","model":"ROGER 19 (02) MONO ROGER SELECT P7  SYSTEM WSPOMAGAJĄCY SŁYSZENIE ROGER","manufacturer":"PHONAK AG","orderIndex":"N","grossPrice":9500,"swdCode":""},{"idProduct":"12909993","nfzCode":"P.04.01","tradeName":"ROGER 20","model":"ROGER 20 (02) L9 T1 STEREO ROGER SELECT P5 SYSTEM WSPOMAGAJĄCY SŁYSZ","manufacturer":"SONOVA AG","orderIndex":"N","grossPrice":9500,"swdCode":""},{"idProduct":"12909992","nfzCode":"P.04.01","tradeName":"ROGER 20","model":"ROGER 20 (02) M12 STEREO ROGER SELECT W3 SYSTEM WSPOMAGAJĄCY SŁYSZ","manufacturer":"SONOVA AG","orderIndex":"N","grossPrice":9500,"swdCode":""},{"idProduct":"12910003","nfzCode":"P.04.01","tradeName":"ROGER 21","model":"ROGER X (03) P5 ROGER 21 (02) STEREO ROGER SELECT P5 SYST WSPOM SŁYSZ","manufacturer":"SONOVA AG","orderIndex":"N","grossPrice":9500,"swdCode":""},{"idProduct":"12910008","nfzCode":"P.04.01","tradeName":"ROGER FOCUS II","model":"ROGER FOCUS II STEREO ROGER SELECT P5 SYSTEM WSPOMAGAJĄCY SŁYSZENIE","manufacturer":"SONOVA AG","orderIndex":"N","grossPrice":9500,"swdCode":""},{"idProduct":"12910009","nfzCode":"P.04.01","tradeName":"ROGER FOCUS II","model":"ROGER FOCUS II STEREO ROGER SELECT P7 SYSTEM WSPOMAGAJĄCY SŁYSZENIE","manufacturer":"SONOVA AG","orderIndex":"N","grossPrice":9500,"swdCode":""},{"idProduct":"12910010","nfzCode":"P.04.01","tradeName":"ROGER FOCUS II","model":"ROGER FOCUS II MONO ROGER ON V2 P5 SYSTEM WSPOMAGAJĄCY SŁYSZENIE","manufacturer":"SONOVA AG","orderIndex":"N","grossPrice":10800,"swdCode":""},{"idProduct":"12910011","nfzCode":"P.04.01","tradeName":"ROGER FOCUS II","model":"ROGER FOCUS II MONO ROGER SELECT P7 SYSTEM WSPOMAGAJĄCY SŁYSZENIE","manufacturer":"SONOVA AG","orderIndex":"N","grossPrice":9500,"swdCode":""},{"idProduct":"12910012","nfzCode":"P.04.01","tradeName":"ROGER FOCUS II","model":"ROGER FOCUS II MONO ROGER SELECT W3 SYSTEM WSPOMAGAJĄCY SŁYSZENIE","manufacturer":"SONOVA AG","orderIndex":"N","grossPrice":9500,"swdCode":""},{"idProduct":"12910013","nfzCode":"P.04.01","tradeName":"ROGER FOCUS II","model":"ROGER FOCUS II MONO ROGER TABLE MIC II SYSTEM WSPOMAGAJĄCY SŁYSZENIE","manufacturer":"SONOVA AG","orderIndex":"N","grossPrice":6000,"swdCode":""},{"idProduct":"12910014","nfzCode":"P.04.01","tradeName":"ROGER FOCUS II","model":"ROGER FOCUS II MONO ROGER TOUCHSCREEN SYSTEM WSPOMAGAJĄCY SŁYSZENIE","manufacturer":"SONOVA AG","orderIndex":"N","grossPrice":6000,"swdCode":""},{"idProduct":"12910015","nfzCode":"P.04.01","tradeName":"ROGER FOCUS II","model":"ROGER FOCUS II ST. ROGER ON V2 P5 SYSTEM WSPOMAGAJĄCY SŁYSZENIE","manufacturer":"SONOVA AG","orderIndex":"N","grossPrice":14800,"swdCode":""},{"idProduct":"12910016","nfzCode":"P.04.01","tradeName":"ROGER FOCUS II","model":"ROGER FOCUS II ST. ROGER ON V2 P7 SYSTEM WSPOMAGAJĄCY SŁYSZENIE","manufacturer":"SONOVA AG","orderIndex":"N","grossPrice":14800,"swdCode":""},{"idProduct":"12910017","nfzCode":"P.04.01","tradeName":"ROGER FOCUS II","model":"ROGER FOCUS II STEREO ROGER SELECT W3 SYSTEM WSPOMAGAJĄCY SŁYSZENIE","manufacturer":"SONOVA AG","orderIndex":"N","grossPrice":9500,"swdCode":""},{"idProduct":"12910018","nfzCode":"P.04.01","tradeName":"ROGER FOCUS II","model":"ROGER FOCUS II ST. ROGER TABLE MIC II SYSTEM WSPOMAGAJĄCY SŁYSZENIE","manufacturer":"SONOVA AG","orderIndex":"N","grossPrice":6000,"swdCode":""},{"idProduct":"12910019","nfzCode":"P.04.01","tradeName":"ROGER FOCUS II","model":"ROGER FOCUS II ST. ROGER TOUCHSCREEN SYSTEM WSPOMAGAJĄCY SŁYSZENIE","manufacturer":"SONOVA AG","orderIndex":"N","grossPrice":6000,"swdCode":""},{"idProduct":"12910007","nfzCode":"P.04.01","tradeName":"ROGER FOCUS II","model":"ROGER FOCUS II STEREO ROGER CLIPON MIC SYSTEM WSPOMAGAJĄCY SŁYSZENIE","manufacturer":"SONOVA AG","orderIndex":"N","grossPrice":6000,"swdCode":""},{"idProduct":"12910006","nfzCode":"P.04.01","tradeName":"ROGER FOCUS II","model":"ROGER FOCUS II MONO ROGER SELECT P5 SYSTEM WSPOMAGAJĄCY SŁYSZENIE","manufacturer":"SONOVA AG","orderIndex":"N","grossPrice":9500,"swdCode":""},{"idProduct":"12910005","nfzCode":"P.04.01","tradeName":"ROGER FOCUS II","model":"ROGER FOCUS II MONO ROGER CLIPON MIC SYSTEM WSPOMAGAJĄCY SŁYSZENIE","manufacturer":"SONOVA AG","orderIndex":"N","grossPrice":6000,"swdCode":""},{"idProduct":"13303252","nfzCode":"P.04.01","tradeName":"ROGER FOCUS II","model":"ROGER FOCUS II-312 P8 MONO ROGER ON V2 P5 SYSTEM WSPOM. SŁYSZENIE","manufacturer":"SONOVA AG","orderIndex":"N","grossPrice":9900,"swdCode":""},{"idProduct":"13303251","nfzCode":"P.04.01","tradeName":"ROGER FOCUS II","model":"ROGER FOCUS II (T3) ST. ROGER SELECT P5 SYSTEM WSPOMAGAJĄCY SŁYSZENIE","manufacturer":"SONOVA AG","orderIndex":"N","grossPrice":12800,"swdCode":""},{"idProduct":"13303250","nfzCode":"P.04.01","tradeName":"ROGER FOCUS II","model":"ROGER FOCUS II (P8) MONO ROGER SELECT P5 SYSTEM WSPOMAGAJĄCY SŁYSZENIE","manufacturer":"SONOVA AG","orderIndex":"N","grossPrice":9800,"swdCode":""},{"idProduct":"13303249","nfzCode":"P.04.01","tradeName":"ROGER FOCUS II","model":"ROGER FOCUS II (M7) ST. ROGER ON V2 P7 SYSTEM WSPOMAGAJĄCY SŁYSZENIE","manufacturer":"SONOVA AG","orderIndex":"N","grossPrice":13800,"swdCode":""},{"idProduct":"13303248","nfzCode":"P.04.01","tradeName":"ROGER FOCUS II","model":"ROGER FOCUS II (M7) ST. ROGER ON V2 P5 SYSTEM WSPOMAGAJĄCY SŁYSZENIE","manufacturer":"SONOVA AG","orderIndex":"N","grossPrice":13800,"swdCode":""},{"idProduct":"13303247","nfzCode":"P.04.01","tradeName":"ROGER FOCUS II","model":"ROGER FOCUS II (M7) ST. ROGER CLIP-ON MIC SYSTEM WSPOMAGAJĄCY SŁYSZENIE","manufacturer":"SONOVA AG","orderIndex":"N","grossPrice":9800,"swdCode":""},{"idProduct":"13303246","nfzCode":"P.04.01","tradeName":"ROGER FOCUS II","model":"ROGER FOCUS II (M6) MONO ROGER CLIP-ON MIC SYSTEM WSPOMAGAJĄCY SŁYSZENIE","manufacturer":"SONOVA AG","orderIndex":"N","grossPrice":6800,"swdCode":""},{"idProduct":"13303245","nfzCode":"P.04.01","tradeName":"ROGER FOCUS II","model":"ROGER FOCUS II (H0) ST. ROGER ON V2 P5 SYSTEM WSPOMAGAJĄCY SŁYSZENIE","manufacturer":"SONOVA AG","orderIndex":"N","grossPrice":13800,"swdCode":""},{"idProduct":"13303244","nfzCode":"P.04.01","tradeName":"ROGER FOCUS II","model":"ROGER FOCUS II (H0) MONO ROGER ON V2 P5 SYSTEM WSPOMAGAJĄCY SŁYSZENIE","manufacturer":"SONOVA AG","orderIndex":"N","grossPrice":10700,"swdCode":""},{"idProduct":"12910030","nfzCode":"P.04.01","tradeName":"ROGER FOCUS II-312","model":"ROGER FOCUS II-312 P8 ST. ROGER ON V2 P5 SYSTEM WSPOMAGAJĄCY SŁYSZENIE","manufacturer":"SONOVA AG","orderIndex":"N","grossPrice":13800,"swdCode":""},{"idProduct":"12910020","nfzCode":"P.04.01","tradeName":"ROGER FOCUS II-312","model":"ROGER FOCUS II-312 MONO ROGER CLIPON MIC SYSTEM WSPOMAGAJĄCY SŁYSZENIE","manufacturer":"SONOVA AG","orderIndex":"N","grossPrice":6000,"swdCode":""},{"idProduct":"12910032","nfzCode":"P.04.01","tradeName":"ROGER FOCUS II-312","model":"ROGER FOCUS II-312 ST. ROGER ON V2 P7 SYSTEM WSPOMAGAJĄCY SŁYSZENIE","manufacturer":"SONOVA AG","orderIndex":"N","grossPrice":13800,"swdCode":""},{"idProduct":"12910033","nfzCode":"P.04.01","tradeName":"ROGER FOCUS II-312","model":"ROGER FOCUS II-312 MONO ROGER SELECT W3 SYSTEM WSPOMAGAJĄCY SŁYSZENIE","manufacturer":"SONOVA AG","orderIndex":"N","grossPrice":9500,"swdCode":""},{"idProduct":"12910034","nfzCode":"P.04.01","tradeName":"ROGER FOCUS II-312","model":"ROGER FOCUS II-312 MONO ROGER TABLE MIC II SYSTEM WSPOMAGAJĄCY SŁYSZENIE","manufacturer":"SONOVA AG","orderIndex":"N","grossPrice":6000,"swdCode":""},{"idProduct":"12910035","nfzCode":"P.04.01","tradeName":"ROGER FOCUS II-312","model":"ROGER FOCUS II-312 ST. ROGER SELECT W3 SYSTEM WSPOMAGAJĄCY SŁYSZENIE","manufacturer":"SONOVA AG","orderIndex":"N","grossPrice":9500,"swdCode":""},{"idProduct":"12910036","nfzCode":"P.04.01","tradeName":"ROGER FOCUS II-312","model":"ROGER FOCUS II-312 ST. ROGER TABLE MIC II SYSTEM WSPOMAGAJĄCY SŁYSZENIE","manufacturer":"SONOVA AG","orderIndex":"N","grossPrice":6000,"swdCode":""},{"idProduct":"12910031","nfzCode":"P.04.01","tradeName":"ROGER FOCUS II-312","model":"ROGER FOCUS II-312 ST. ROGER ON V2 P5 SYSTEM WSPOMAGAJĄCY SŁYSZENIE","manufacturer":"SONOVA AG","orderIndex":"N","grossPrice":13800,"swdCode":""},{"idProduct":"12910021","nfzCode":"P.04.01","tradeName":"ROGER FOCUS II-312","model":"ROGER FOCUS II-312 MONO ROGER ON V2 P5 SYSTEM WSPOMAGAJĄCY SŁYSZENIE","manufacturer":"SONOVA AG","orderIndex":"N","grossPrice":10300,"swdCode":""},{"idProduct":"12910022","nfzCode":"P.04.01","tradeName":"ROGER FOCUS II-312","model":"ROGER FOCUS II-312 MONO ROGER ON V2 P7 SYSTEM WSPOMAGAJĄCY SŁYSZENIE","manufacturer":"SONOVA AG","orderIndex":"N","grossPrice":10300,"swdCode":""},{"idProduct":"12910023","nfzCode":"P.04.01","tradeName":"ROGER FOCUS II-312","model":"ROGER FOCUS II-312 P8 MONO ROGER ON V2 P5 SYSTEM WSPOM. SŁYSZENIE","manufacturer":"SONOVA AG","orderIndex":"N","grossPrice":10300,"swdCode":""},{"idProduct":"12910024","nfzCode":"P.04.01","tradeName":"ROGER FOCUS II-312","model":"ROGER FOCUS II-312 MONO ROGER SELECT P5 SYSTEM WSPOMAGAJĄCY SŁYSZENIE","manufacturer":"SONOVA AG","orderIndex":"N","grossPrice":9500,"swdCode":""},{"idProduct":"12910029","nfzCode":"P.04.01","tradeName":"ROGER FOCUS II-312","model":"ROGER FOCUS II-312 ST. ROGER SELECT P7 SYSTEM WSPOMAGAJĄCY SŁYSZENIE","manufacturer":"SONOVA AG","orderIndex":"N","grossPrice":9500,"swdCode":""},{"idProduct":"12910028","nfzCode":"P.04.01","tradeName":"ROGER FOCUS II-312","model":"ROGER FOCUS II-312 ST. ROGER SELECT P5 SYSTEM WSPOMAGAJĄCY SŁYSZENIE","manufacturer":"SONOVA AG","orderIndex":"N","grossPrice":9500,"swdCode":""},{"idProduct":"12910027","nfzCode":"P.04.01","tradeName":"ROGER FOCUS II-312","model":"ROGER FOCUS II-312 ST. ROGER CLIPON MIC SYSTEM WSPOMAGAJĄCY SŁYSZENIE","manufacturer":"SONOVA AG","orderIndex":"N","grossPrice":6000,"swdCode":""},{"idProduct":"12910025","nfzCode":"P.04.01","tradeName":"ROGER FOCUS II-312","model":"ROGER FOCUS II-312 MONO ROGER SELECT P7 SYSTEM WSPOMAGAJĄCY SŁYSZENIE","manufacturer":"SONOVA AG","orderIndex":"N","grossPrice":9500,"swdCode":""},{"idProduct":"13303254","nfzCode":"P.04.01","tradeName":"ROGER NECKLOOP","model":"ROGER NECKLOOP (02) ROGER ON V2 P5 SYSTEM WSPOMAGAJĄCY SŁYSZENIE","manufacturer":"SONOVA AG","orderIndex":"N","grossPrice":7800,"swdCode":""},{"idProduct":"12910049","nfzCode":"P.04.01","tradeName":"ROGER NECKLOOP","model":"ROGER NECKLOOP (02) ROGER ON V2 P7 SYSTEM WSPOMAGAJĄCY SŁYSZENIE","manufacturer":"SONOVA AG","orderIndex":"N","grossPrice":8800,"swdCode":""},{"idProduct":"12910048","nfzCode":"P.04.01","tradeName":"ROGER NECKLOOP","model":"ROGER NECKLOOP (02) ROGER ON V2 P5 SYSTEM WSPOMAGAJĄCY SŁYSZENIE","manufacturer":"SONOVA AG","orderIndex":"N","grossPrice":8800,"swdCode":""},{"idProduct":"12910044","nfzCode":"P.04.01","tradeName":"ROGER NECKLOOP","model":"ROGER NECKLOOP (03) ROGER ON V2 P7 SYSTEM WSPOMAGAJĄCY SŁYSZENIE","manufacturer":"SONOVA AG","orderIndex":"N","grossPrice":8800,"swdCode":""},{"idProduct":"12910043","nfzCode":"P.04.01","tradeName":"ROGER NECKLOOP","model":"ROGER NECKLOOP (03) ROGER ON V2 P5 SYSTEM WSPOMAGAJĄCY SŁYSZENIE","manufacturer":"SONOVA AG","orderIndex":"N","grossPrice":8800,"swdCode":""},{"idProduct":"12909937","nfzCode":"P.04.01","tradeName":"ROGER X","model":"ROGER X (03) P5 MONO ROGER SELECT W3 SYSTEM WSPOM. SŁYSZENIE","manufacturer":"PHONAK AG","orderIndex":"N","grossPrice":9500,"swdCode":""},{"idProduct":"12909938","nfzCode":"P.04.01","tradeName":"ROGER X","model":"ROGER X (03) P5 MONO ROGER TABLE MIC II SYSTEM WSPOM. SŁYSZENIE","manufacturer":"PHONAK AG","orderIndex":"N","grossPrice":6000,"swdCode":""},{"idProduct":"12909939","nfzCode":"P.04.01","tradeName":"ROGER X","model":"ROGER X (03) P5 MONO ROGER TOUCHSCREEN SYSTEM WSPOM. SŁYSZENIE","manufacturer":"PHONAK AG","orderIndex":"N","grossPrice":6000,"swdCode":""},{"idProduct":"12909941","nfzCode":"P.04.01","tradeName":"ROGER X","model":"ROGER X (03) P5 STEREO ROGER SELECT P5 SYSTEM WSPOM. SŁYSZENIE","manufacturer":"PHONAK AG","orderIndex":"N","grossPrice":9500,"swdCode":""},{"idProduct":"12909942","nfzCode":"P.04.01","tradeName":"ROGER X","model":"ROGER X (03) P5 STEREO ROGER SELECT P7 SYSTEM WSPOM. SŁYSZENIE","manufacturer":"PHONAK AG","orderIndex":"N","grossPrice":9500,"swdCode":""},{"idProduct":"12909943","nfzCode":"P.04.01","tradeName":"ROGER X","model":"ROGER X (03) P5 STEREO ROGER SELECT W3 SYSTEM WSPOM. SŁYSZENIE","manufacturer":"PHONAK AG","orderIndex":"N","grossPrice":9500,"swdCode":""},{"idProduct":"12909944","nfzCode":"P.04.01","tradeName":"ROGER X","model":"ROGER X (03) P5 STEREO ROGER TABLE MIC II SYSTEM WSPOM. SŁYSZENIE","manufacturer":"PHONAK AG","orderIndex":"N","grossPrice":6000,"swdCode":""},{"idProduct":"12909945","nfzCode":"P.04.01","tradeName":"ROGER X","model":"ROGER X (03) P5 STEREO ROGER TOUCHSCREEN SYSTEM WSPOM. SŁYSZENIE","manufacturer":"PHONAK AG","orderIndex":"N","grossPrice":6000,"swdCode":""},{"idProduct":"12909946","nfzCode":"P.04.01","tradeName":"ROGER X","model":"ROGER X (03) P5 MONO ROGER ON V2 P5 SYSTEM WSPOMAGAJĄCY SŁYSZENIE","manufacturer":"PHONAK AG","orderIndex":"N","grossPrice":8800,"swdCode":""},{"idProduct":"12909947","nfzCode":"P.04.01","tradeName":"ROGER X","model":"ROGER X (03) P5 MONO ROGER ON V2 P7 SYSTEM WSPOMAGAJĄCY SŁYSZENIE","manufacturer":"PHONAK AG","orderIndex":"N","grossPrice":8800,"swdCode":""},{"idProduct":"12909948","nfzCode":"P.04.01","tradeName":"ROGER X","model":"ROGER X (03) P5 STEREO ROGER ON V2 P5 SYSTEM WSPOMAGAJĄCY SŁYSZENIE","manufacturer":"PHONAK AG","orderIndex":"N","grossPrice":8800,"swdCode":""},{"idProduct":"12909949","nfzCode":"P.04.01","tradeName":"ROGER X","model":"ROGER X (03) P5 STEREO ROGER ON V2 P7 SYSTEM WSPOMAGAJĄCY SŁYSZENIE","manufacturer":"PHONAK AG","orderIndex":"N","grossPrice":8800,"swdCode":""},{"idProduct":"13303256","nfzCode":"P.04.01","tradeName":"ROGER X","model":"ROGER X (03) P5 MONO ROGER CLIP-ON MIC 1.1. SYST. WSPOM. SŁYSZENIE","manufacturer":"PHONAK AG","orderIndex":"N","grossPrice":5500,"swdCode":""},{"idProduct":"13303257","nfzCode":"P.04.01","tradeName":"ROGER X","model":"ROGER X (03) P5 MONO ROGER ON V2 P5 SYSTEM WSPOMAGAJĄCY SŁYSZENIE","manufacturer":"PHONAK AG","orderIndex":"N","grossPrice":7800,"swdCode":""},{"idProduct":"13303258","nfzCode":"P.04.01","tradeName":"ROGER X","model":"ROGER X (03) P5 MONO ROGER SELECT P5 SYSTEM WSPOM. SŁYSZENIE","manufacturer":"PHONAK AG","orderIndex":"N","grossPrice":7700,"swdCode":""},{"idProduct":"13303260","nfzCode":"P.04.01","tradeName":"ROGER X","model":"ROGER X (03) P5 STEREO ROGER ON V2 P5 SYSTEM WSPOMAGAJĄCY SŁYSZENIE","manufacturer":"PHONAK AG","orderIndex":"N","grossPrice":9500,"swdCode":""},{"idProduct":"13303261","nfzCode":"P.04.01","tradeName":"ROGER X","model":"ROGER X (03) P5 STEREO ROGER SELECT P5 SYSTEM WSPOM. SŁYSZENIE","manufacturer":"PHONAK AG","orderIndex":"N","grossPrice":9100,"swdCode":""},{"idProduct":"12909921","nfzCode":"P.04.01","tradeName":"ROGER X","model":"ROGER X (02) P5 MONO ROGER CLIP-ON MIC SYSTEM WSPOMAGAJĄCY SŁYSZENIE","manufacturer":"PHONAK AG","orderIndex":"N","grossPrice":6000,"swdCode":""},{"idProduct":"12909923","nfzCode":"P.04.01","tradeName":"ROGER X","model":"ROGER X (02) P5 MONO ROGER SELECT P7 SYSTEM WSPOM. SŁYSZENIE ROGER","manufacturer":"PHONAK AG","orderIndex":"N","grossPrice":9500,"swdCode":""},{"idProduct":"12909924","nfzCode":"P.04.01","tradeName":"ROGER X","model":"ROGER X (02) P5 MONO ROGER SELECT W3 SYSTEM WSPOM. SŁYSZENIE ROGER","manufacturer":"PHONAK AG","orderIndex":"N","grossPrice":9500,"swdCode":""},{"idProduct":"12909926","nfzCode":"P.04.01","tradeName":"ROGER X","model":"ROGER X (02) P5 MONO ROGER ON V2 P5 SYSTEM WSPOMAGAJĄCY SŁYSZENIE","manufacturer":"PHONAK AG","orderIndex":"N","grossPrice":8800,"swdCode":""},{"idProduct":"12909927","nfzCode":"P.04.01","tradeName":"ROGER X","model":"ROGER X (02) P5 STEREO ROGER ON V2 P7 SYSTEM WSPOMAGAJĄCY SŁYSZENIE","manufacturer":"PHONAK AG","orderIndex":"N","grossPrice":8500,"swdCode":""},{"idProduct":"12909928","nfzCode":"P.04.01","tradeName":"ROGER X","model":"ROGER X (02) P5 STEREO ROGER ON V2 SYSTEM WSPOMAGAJĄCY SŁYSZENIE","manufacturer":"PHONAK AG","orderIndex":"N","grossPrice":9500,"swdCode":""},{"idProduct":"12909930","nfzCode":"P.04.01","tradeName":"ROGER X","model":"ROGER X (02) P5 STEREO ROGER SELECT P7 SYSTEM WSPOM. SŁYSZENIE ROGER","manufacturer":"PHONAK AG","orderIndex":"N","grossPrice":9500,"swdCode":""},{"idProduct":"12909931","nfzCode":"P.04.01","tradeName":"ROGER X","model":"ROGER X (02) P5 STEREO ROGER SELECT W3 SYSTEM WSPOM. SŁYSZENIE ROGER","manufacturer":"PHONAK AG","orderIndex":"N","grossPrice":9500,"swdCode":""},{"idProduct":"12909934","nfzCode":"P.04.01","tradeName":"ROGER X","model":"ROGER X (03) P5 MONO ROGER CLIP-ON MIC 1.1. SYST. WSPOM. SŁYSZENIE","manufacturer":"PHONAK AG","orderIndex":"N","grossPrice":6000,"swdCode":""},{"idProduct":"12909935","nfzCode":"P.04.01","tradeName":"ROGER X","model":"ROGER X (03) P5 MONO ROGER SELECT P5 SYSTEM WSPOM. SŁYSZENIE","manufacturer":"PHONAK AG","orderIndex":"N","grossPrice":9500,"swdCode":""},{"idProduct":"12909936","nfzCode":"P.04.01","tradeName":"ROGER X","model":"ROGER X (03) P5 MONO ROGER SELECT P7 SYSTEM WSPOM. SŁYSZENIE","manufacturer":"PHONAK AG","orderIndex":"N","grossPrice":9500,"swdCode":""},{"idProduct":"11871573","nfzCode":"P.04.01","tradeName":"URZĄDZENIE WSPOMAGAJĄCE SŁYSZENIE MULTI MIC","model":"MULTI MIC.","manufacturer":"RESOUND","orderIndex":"N","grossPrice":5500,"swdCode":""}];
const PRICING_MONTH_NAMES = [
  "styczeń",
  "luty",
  "marzec",
  "kwiecień",
  "maj",
  "czerwiec",
  "lipiec",
  "sierpień",
  "wrzesień",
  "październik",
  "listopad",
  "grudzień"
];
const PRICING_MANUFACTURER_TONES = [
  { bg: "#e8f6f2", strong: "#d6ece6", accent: "#4f9b8e", text: "#1f5d55" },
  { bg: "#eef6df", strong: "#dfedc7", accent: "#82a747", text: "#4f682b" },
  { bg: "#e7f2f8", strong: "#d5e8f2", accent: "#5798bd", text: "#285f7b" },
  { bg: "#f9e9ef", strong: "#f0d6e0", accent: "#bd6d8b", text: "#734259" },
  { bg: "#f0ecf8", strong: "#e4dcf0", accent: "#8e78b8", text: "#554a78" },
  { bg: "#fff1d9", strong: "#f3dfb8", accent: "#bc8a35", text: "#72521f" },
  { bg: "#e7f5e8", strong: "#d6ead8", accent: "#65a86e", text: "#376c40" },
  { bg: "#fde9df", strong: "#f2d6c9", accent: "#c67b5f", text: "#784635" },
  { bg: "#eaf1f4", strong: "#d9e6eb", accent: "#729cac", text: "#456777" },
  { bg: "#f4f5dc", strong: "#e7e9c3", accent: "#a5aa4f", text: "#626727" },
  { bg: "#e4f5f5", strong: "#d1eaea", accent: "#52a5a5", text: "#286567" },
  { bg: "#f7e8f5", strong: "#ecd4e8", accent: "#b76ba9", text: "#704165" },
  { bg: "#edf0fb", strong: "#dce2f4", accent: "#7484c4", text: "#45527d" },
  { bg: "#f7efe2", strong: "#eadcc7", accent: "#aa8556", text: "#664f31" },
  { bg: "#e6f3ec", strong: "#d3e7dc", accent: "#5a9d76", text: "#315f48" },
  { bg: "#fae7e7", strong: "#f0d2d2", accent: "#bd6a6a", text: "#743f3f" },
  { bg: "#e8f4ff", strong: "#d4e9fa", accent: "#5d9bcf", text: "#315f88" },
  { bg: "#f0f0e4", strong: "#e1e2cf", accent: "#92976b", text: "#555a39" },
  { bg: "#e9f7ed", strong: "#d7eddc", accent: "#59a66c", text: "#2f6740" },
  { bg: "#fbe9dd", strong: "#efd3c0", accent: "#c27f52", text: "#754b2e" },
  { bg: "#edf7fa", strong: "#d8edf3", accent: "#60a6b8", text: "#346773" },
  { bg: "#f8ebf0", strong: "#eed5de", accent: "#be7890", text: "#744859" },
  { bg: "#eff3e3", strong: "#e0e7cb", accent: "#90a55a", text: "#586733" },
  { bg: "#ebeefa", strong: "#dbe0f3", accent: "#7b87c0", text: "#4b537b" }
];
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
const dateTimeFormatter = new Intl.DateTimeFormat("pl-PL", { dateStyle: "short", timeStyle: "short" });
const collator = new Intl.Collator("pl", { sensitivity: "base", numeric: true });
const deviceDerived = new Map();
const repairDerived = new Map();
const demoDerived = new Map();
const serialIndex = new Map();
const customerNameCounts = new Map();
const customerDocumentIndex = new Map();
const activeDemoLoanCustomerIndex = new Map();
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
let activeDateInput = null;
let datePickerMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
let datePicker = null;
let pricingPriceIndex = null;
let pricingPriceMemo = new Map();
let pricingManufacturerToneMap = null;
let pricingNfzDefaultApplied = false;
let pricingSupabaseAvailable = null;
let pricingLoanAutofilledFromOffer = false;
let serialCopyToastTimeout = 0;
let lastCopiedSerialNumber = "";
let stockAudit = loadStockAudit();
let deviceNameCorrectionCandidates = [];
let modelQualityCandidates = [];
let personQualityCandidates = [];
let serialLengthProfiles = new Map();

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
  "serialNumber2",
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
  "manufacturerReturned",
  "manufacturerReturnedDate",
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

const pricingFields = [
  "idProduct",
  "nfzCode",
  "tradeName",
  "model",
  "manufacturer",
  "orderIndex",
  "grossPrice",
  "swdCode"
];

const DEVICE_DATE_FIELDS = ["receivedDate", "pickupDate", "returnDate"];
const REPAIR_DATE_FIELDS = ["receivedDate", "sentDate", "returnDate", "pickupDate"];
const DEMO_DATE_FIELDS = ["receivedDate", "manufacturerReturnDate", "manufacturerReturnedDate", "loanDate", "returnDate"];
const REPAIR_DATE_ORDER = [
  { field: "receivedDate", label: "Data przyjęcia", selector: "#repairReceivedDate" },
  { field: "sentDate", label: "Data wysłania", selector: "#repairSentDate" },
  { field: "returnDate", label: "Data powrotu", selector: "#repairReturnDate" },
  { field: "pickupDate", label: "Data odbioru", selector: "#repairPickupDate" }
];
const DEMO_DATE_VALIDATION_FIELDS = [
  { field: "receivedDate", label: "Data przyjęcia", selector: "#demoReceivedDate" },
  { field: "manufacturerReturnDate", label: "Termin zwrotu do producenta", selector: "#demoManufacturerReturnDate" },
  { field: "manufacturerReturnedDate", label: "Data zwrócenia do producenta", selector: "#demoManufacturerReturnedDate" },
  { field: "loanDate", label: "Data wypożyczenia", selector: "#demoLoanDate" },
  { field: "returnDate", label: "Data zwrotu z wypożyczenia", selector: "#demoReturnDate" }
];
const DEMO_DATE_CONSTRAINTS = [
  { field: "manufacturerReturnDate", previousField: "receivedDate" },
  { field: "manufacturerReturnedDate", previousField: "receivedDate" },
  { field: "manufacturerReturnedDate", previousField: "loanDate" },
  { field: "manufacturerReturnedDate", previousField: "returnDate" },
  { field: "loanDate", previousField: "receivedDate" },
  { field: "returnDate", previousField: "receivedDate" },
  { field: "returnDate", previousField: "loanDate" }
];
const REPAIR_WARRANTY_MONTHS = 36;

let records = [];
let repairRecords = [];
let demoRecords = [];
let pricingRecords = [];
let pricingMeta = loadPricingMeta();
let pricingLoanHistory = loadPricingLoanHistory();
let pricingOfferHistory = loadPricingOfferHistory();
let pricingOrderHistory = loadPricingOrderHistory();
let pricingComplaintHistory = loadPricingComplaintHistory();
let pricingPcprList = loadPricingPcprList();
let privatePayments = {};
let auditLogs = [];
let privatePaymentSyncWarningShown = false;
let auditLogSyncWarningShown = false;
let pricingLoanHistorySupabaseAvailable = null;
let pricingOfferHistorySupabaseAvailable = null;
let pricingOrderHistorySupabaseAvailable = null;
let pricingComplaintHistorySupabaseAvailable = null;
let pricingPcprListSupabaseAvailable = null;
let pricingPcprPlaceFilter = "";
let pricingPcprOfficeFilter = "";
let activePricingLoanHistoryId = "";
let activePricingPcprEditId = "";
let demoLoanHistoryDraft = [];
let demoCurrentAttachmentsDraft = [];
let sortState = { key: "receivedDate", direction: "desc" };
let repairSortState = { key: "receivedDate", direction: "desc" };
let demoSortState = { key: "receivedDate", direction: "desc" };
let activeNotebook = "devices";
let activeDeviceView = "database";
let activePricingView = "list";
let lastAgreementPricingView = "offer";
let dataControlIssuesCache = null;
let dataControlRenderToken = 0;
let dataControlBuildScheduled = false;
const tableRenderLimits = {
  devices: TABLE_RENDER_BATCH_SIZE,
  demo: TABLE_RENDER_BATCH_SIZE,
  repairs: TABLE_RENDER_BATCH_SIZE,
  repairOpen: TABLE_RENDER_BATCH_SIZE,
  dataControl: TABLE_RENDER_BATCH_SIZE
};

const recordsBody = document.querySelector("#recordsBody");
const devicesTable = document.querySelector(".devices-table");
const privatePaymentColumnHeader = document.querySelector("[data-private-payment-column]");
const privatePaymentField = document.querySelector("#privatePaymentField");
const paymentReceivedAmountInput = document.querySelector("#paymentReceivedAmount");
const paymentReceivedDateInput = document.querySelector("#paymentReceivedDate");
const emptyState = document.querySelector("#emptyState");
const repairRecordsBody = document.querySelector("#repairRecordsBody");
const repairEmptyState = document.querySelector("#repairEmptyState");
const repairOpenRecordsBody = document.querySelector("#repairOpenRecordsBody");
const repairOpenEmptyState = document.querySelector("#repairOpenEmptyState");
const demoRecordsBody = document.querySelector("#demoRecordsBody");
const demoEmptyState = document.querySelector("#demoEmptyState");
const pricingRecordsBody = document.querySelector("#pricingRecordsBody");
const pricingEmptyState = document.querySelector("#pricingEmptyState");
const pricingSearchInput = document.querySelector("#pricingSearchInput");
const pricingNfzFilter = document.querySelector("#pricingNfzFilter");
const pricingManufacturerFilter = document.querySelector("#pricingManufacturerFilter");
const pricingSummary = document.querySelector("#pricingSummary");
const pricingVersion = document.querySelector("#pricingVersion");
const importPricingBtn = document.querySelector("#importPricingBtn");
const replacePricingBtn = document.querySelector("#replacePricingBtn");
const resetPricingBtn = document.querySelector("#resetPricingBtn");
const pricingImportInput = document.querySelector("#pricingImportInput");
const pricingReplaceInput = document.querySelector("#pricingReplaceInput");
const pricingViewButtons = document.querySelectorAll(".pricing-view-button");
const pricingListView = document.querySelector("#pricingListView");
const pricingOfferView = document.querySelector("#pricingOfferView");
const pricingLoanView = document.querySelector("#pricingLoanView");
const pricingPcprView = document.querySelector("#pricingPcprView");
const pricingOrderView = document.querySelector("#pricingOrderView");
const pricingComplaintView = document.querySelector("#pricingComplaintView");
const pricingOfferDeviceList = document.querySelector("#pricingOfferDeviceList");
const offerCustomerInput = document.querySelector("#offerCustomerInput");
const offerAgeInput = document.querySelector("#offerAgeInput");
const offerDateInput = document.querySelector("#offerDateInput");
const offerLocationInput = document.querySelector("#offerLocationInput");
const offerPfronInput = document.querySelector("#offerPfronInput");
const offerPfronEnabledInput = document.querySelector("#offerPfronEnabledInput");
const offerNoNfzInput = document.querySelector("#offerNoNfzInput");
const offerDeviceInput1 = document.querySelector("#offerDeviceInput1");
const offerDeviceInput2 = document.querySelector("#offerDeviceInput2");
const offerDuplicateFirstBtn = document.querySelector("#offerDuplicateFirstBtn");
const offerMoveRightToLeftBtn = document.querySelector("#offerMoveRightToLeftBtn");
const offerMoveLeftToRightBtn = document.querySelector("#offerMoveLeftToRightBtn");
const printPricingOfferBtn = document.querySelector("#printPricingOfferBtn");
const offerTitle = document.querySelector("#offerTitle");
const offerMeta = document.querySelector("#offerMeta");
const offerEmptyState = document.querySelector("#offerEmptyState");
const offerAgeWarning = document.querySelector("#offerAgeWarning");
const offerContent = document.querySelector("#offerContent");
const offerItemsBody = document.querySelector("#offerItemsBody");
const offerPaymentsBody = document.querySelector("#offerPaymentsBody");
const offerPatientTotal = document.querySelector("#offerPatientTotal");
const loanContractNumberInput = document.querySelector("#loanContractNumberInput");
const loanDateInput = document.querySelector("#loanDateInput");
const loanCityInput = document.querySelector("#loanCityInput");
const loanDepositInput = document.querySelector("#loanDepositInput");
const loanPeriodFromInput = document.querySelector("#loanPeriodFromInput");
const loanPeriodToInput = document.querySelector("#loanPeriodToInput");
const loanCustomerInput = document.querySelector("#loanCustomerInput");
const loanAddressInput = document.querySelector("#loanAddressInput");
const loanDocumentInput = document.querySelector("#loanDocumentInput");
const loanPhoneInput = document.querySelector("#loanPhoneInput");
const loanRightDeviceInput = document.querySelector("#loanRightDeviceInput");
const loanRightSerialInput = document.querySelector("#loanRightSerialInput");
const loanRightManufacturerInput = document.querySelector("#loanRightManufacturerInput");
const loanRightValueInput = document.querySelector("#loanRightValueInput");
const loanLeftDeviceInput = document.querySelector("#loanLeftDeviceInput");
const loanLeftSerialInput = document.querySelector("#loanLeftSerialInput");
const loanLeftManufacturerInput = document.querySelector("#loanLeftManufacturerInput");
const loanLeftValueInput = document.querySelector("#loanLeftValueInput");
const loanChargerInput = document.querySelector("#loanChargerInput");
const loanChargerSerialInput = document.querySelector("#loanChargerSerialInput");
const loanChargerStateInput = document.querySelector("#loanChargerStateInput");
const loanChargerMissingValueInput = document.querySelector("#loanChargerMissingValueInput");
const loanIssueNotesInput = document.querySelector("#loanIssueNotesInput");
const loanReturnDateInput = document.querySelector("#loanReturnDateInput");
const loanDepositReturnDateInput = document.querySelector("#loanDepositReturnDateInput");
const loanDeductionsInput = document.querySelector("#loanDeductionsInput");
const loanDeductionReasonInput = document.querySelector("#loanDeductionReasonInput");
const loanCopyOfferBtn = document.querySelector("#loanCopyOfferBtn");
const loanDuplicateRightBtn = document.querySelector("#loanDuplicateRightBtn");
const loanMoveRightToLeftBtn = document.querySelector("#loanMoveRightToLeftBtn");
const loanMoveLeftToRightBtn = document.querySelector("#loanMoveLeftToRightBtn");
const loanClearDeviceButtons = document.querySelectorAll("[data-clear-loan-device]");
const loanSerialFields = document.querySelectorAll("[data-loan-serial-field]");
const loanPasteSerialButtons = document.querySelectorAll("[data-paste-loan-serial]");
const savePricingLoanBtn = document.querySelector("#savePricingLoanBtn");
const printPricingLoanBtn = document.querySelector("#printPricingLoanBtn");
const loanPrintMeta = document.querySelector("#loanPrintMeta");
const loanEquipmentBody = document.querySelector("#loanEquipmentBody");
const loanHistoryCount = document.querySelector("#loanHistoryCount");
const loanHistoryList = document.querySelector("#loanHistoryList");
const pcprForm = document.querySelector("#pcprForm");
const pcprOfficeInput = document.querySelector("#pcprOfficeInput");
const pcprOfficeAddressHint = document.querySelector("#pcprOfficeAddressHint");
const pcprCustomerInput = document.querySelector("#pcprCustomerInput");
const pcprPhoneInput = document.querySelector("#pcprPhoneInput");
const pcprPostalCodeInput = document.querySelector("#pcprPostalCodeInput");
const pcprCityInput = document.querySelector("#pcprCityInput");
const pcprStreetInput = document.querySelector("#pcprStreetInput");
const pcprModelInput = document.querySelector("#pcprModelInput");
const pcprModelInput2 = document.querySelector("#pcprModelInput2");
const pcprSecondModelField = document.querySelector("#pcprSecondModelField");
const addPcprSecondModelBtn = document.querySelector("#addPcprSecondModelBtn");
const removePcprSecondModelBtn = document.querySelector("#removePcprSecondModelBtn");
const pcprPlaceInput = document.querySelector("#pcprPlaceInput");
const pcprEarInputs = document.querySelectorAll("input[name='pcprEar']");
const pcprPlaceTabs = document.querySelectorAll("[data-pcpr-place-tab]");
const pcprOfficeTabs = document.querySelectorAll("[data-pcpr-office-tab]");
const savePcprBtn = document.querySelector("#savePcprBtn");
const cancelPcprEditBtn = document.querySelector("#cancelPcprEditBtn");
const pcprListCount = document.querySelector("#pcprListCount");
const pcprList = document.querySelector("#pcprList");
const resetPcprFiltersBtn = document.querySelector("#resetPcprFiltersBtn");
const orderNumberInput = document.querySelector("#orderNumberInput");
const orderDateInput = document.querySelector("#orderDateInput");
const orderCustomerInput = document.querySelector("#orderCustomerInput");
const orderPhoneInput = document.querySelector("#orderPhoneInput");
const orderLocationInput = document.querySelector("#orderLocationInput");
const orderNotesInput = document.querySelector("#orderNotesInput");
const orderItemsFormBody = document.querySelector("#orderItemsFormBody");
const addOrderItemBtn = document.querySelector("#addOrderItemBtn");
const orderCopyOfferBtn = document.querySelector("#orderCopyOfferBtn");
const newPricingOrderBtn = document.querySelector("#newPricingOrderBtn");
const savePricingOrderBtn = document.querySelector("#savePricingOrderBtn");
const printPricingOrderBtn = document.querySelector("#printPricingOrderBtn");
const orderTitle = document.querySelector("#orderTitle");
const orderMeta = document.querySelector("#orderMeta");
const orderEmptyState = document.querySelector("#orderEmptyState");
const orderContent = document.querySelector("#orderContent");
const orderItemsBody = document.querySelector("#orderItemsBody");
const complaintNumberInput = document.querySelector("#complaintNumberInput");
const complaintDateInput = document.querySelector("#complaintDateInput");
const complaintCustomerInput = document.querySelector("#complaintCustomerInput");
const complaintPhoneInput = document.querySelector("#complaintPhoneInput");
const complaintLocationInput = document.querySelector("#complaintLocationInput");
const complaintProductTypeInput = document.querySelector("#complaintProductTypeInput");
const complaintProductNameInput = document.querySelector("#complaintProductNameInput");
const complaintSerialInput = document.querySelector("#complaintSerialInput");
const complaintPurchaseDocumentInput = document.querySelector("#complaintPurchaseDocumentInput");
const complaintPurchaseDateInput = document.querySelector("#complaintPurchaseDateInput");
const complaintProductTypeInput2 = document.querySelector("#complaintProductTypeInput2");
const complaintProductNameInput2 = document.querySelector("#complaintProductNameInput2");
const complaintSerialInput2 = document.querySelector("#complaintSerialInput2");
const complaintPurchaseDocumentInput2 = document.querySelector("#complaintPurchaseDocumentInput2");
const complaintPurchaseDateInput2 = document.querySelector("#complaintPurchaseDateInput2");
const complaintRequestInput = document.querySelector("#complaintRequestInput");
const complaintDefectInput = document.querySelector("#complaintDefectInput");
const complaintNotesInput = document.querySelector("#complaintNotesInput");
const newPricingComplaintBtn = document.querySelector("#newPricingComplaintBtn");
const savePricingComplaintBtn = document.querySelector("#savePricingComplaintBtn");
const printPricingComplaintBtn = document.querySelector("#printPricingComplaintBtn");
const complaintTitle = document.querySelector("#complaintTitle");
const complaintMeta = document.querySelector("#complaintMeta");
const pricingHistoryView = document.querySelector("#pricingHistoryView");
const savePricingOfferBtn = document.querySelector("#savePricingOfferBtn");
const offerHistoryCount = document.querySelector("#offerHistoryCount");
const offerHistoryList = document.querySelector("#offerHistoryList");
const orderHistoryCount = document.querySelector("#orderHistoryCount");
const orderHistoryList = document.querySelector("#orderHistoryList");
const complaintHistoryCount = document.querySelector("#complaintHistoryCount");
const complaintHistoryList = document.querySelector("#complaintHistoryList");
const pricingHistoryPreviewDialog = document.querySelector("#pricingHistoryPreviewDialog");
const pricingHistoryPreviewTitle = document.querySelector("#pricingHistoryPreviewTitle");
const pricingHistoryPreviewContent = document.querySelector("#pricingHistoryPreviewContent");
const closePricingHistoryPreviewBtn = document.querySelector("#closePricingHistoryPreviewBtn");
const complaintCustomerMatchHint = document.querySelector("#complaintCustomerMatchHint");
const complaintCustomerDevicePicker = document.querySelector("#complaintCustomerDevicePicker");
const complaintCustomerDeviceSelect = document.querySelector("#complaintCustomerDeviceSelect");
const complaintUseDeviceItem1Btn = document.querySelector("#complaintUseDeviceItem1Btn");
const complaintUseDeviceItem2Btn = document.querySelector("#complaintUseDeviceItem2Btn");
const complaintWarrantyHint1 = document.querySelector("#complaintWarrantyHint1");
const complaintWarrantyHint2 = document.querySelector("#complaintWarrantyHint2");
const complaintProductsBody = document.querySelector("#complaintProductsBody");
const removeComplaintItemBtn1 = document.querySelector("#removeComplaintItemBtn1");
const removeComplaintItemBtn2 = document.querySelector("#removeComplaintItemBtn2");
const demoChecklistBody = document.querySelector("#demoChecklistBody");
const demoChecklistMeta = document.querySelector("#demoChecklistMeta");
const printDemoChecklistBtn = document.querySelector("#printDemoChecklistBtn");
const stockBody = document.querySelector("#stockBody");
const stockEmptyState = document.querySelector("#stockEmptyState");
const stockSummary = document.querySelector("#stockSummary");
const stockLocationSummary = document.querySelector("#stockLocationSummary");
const stockChecklistBody = document.querySelector("#stockChecklistBody");
const stockChecklistMeta = document.querySelector("#stockChecklistMeta");
const stockAuditSummary = document.querySelector("#stockAuditSummary");
const stockAuditPreview = document.querySelector("#stockAuditPreview");
const stockAuditPersonInput = document.querySelector("#stockAuditPerson");
const stockAuditDateInput = document.querySelector("#stockAuditDate");
const saveStockAuditBtn = document.querySelector("#saveStockAuditBtn");
const exportStockAuditPdfBtn = document.querySelector("#exportStockAuditPdfBtn");
const clearStockAuditBtn = document.querySelector("#clearStockAuditBtn");
const stockChecklistPerson = document.querySelector("#stockChecklistPerson");
const stockChecklistDate = document.querySelector("#stockChecklistDate");
const printStockChecklistBtn = document.querySelector("#printStockChecklistBtn");
const stockAuditReportMeta = document.querySelector("#stockAuditReportMeta");
const stockAuditReportSummary = document.querySelector("#stockAuditReportSummary");
const stockAuditReportBody = document.querySelector("#stockAuditReportBody");
const stockAuditReportPerson = document.querySelector("#stockAuditReportPerson");
const stockAuditReportDate = document.querySelector("#stockAuditReportDate");
const dataControlBody = document.querySelector("#dataControlBody");
const dataControlEmptyState = document.querySelector("#dataControlEmptyState");
const dataControlSummary = document.querySelector("#dataControlSummary");
const dataControlStats = document.querySelector("#dataControlStats");
const dataControlSearchInput = document.querySelector("#dataControlSearchInput");
const resetDataControlFiltersBtn = document.querySelector("#resetDataControlFiltersBtn");
const databaseRenderNotice = document.querySelector("#databaseRenderNotice");
const databaseRenderText = document.querySelector("#databaseRenderText");
const showMoreRecordsBtn = document.querySelector("#showMoreRecordsBtn");
const resetDeviceFiltersBtn = document.querySelector("#resetDeviceFiltersBtn");
const scrollTopBtn = document.querySelector("#scrollTopBtn");
const demoRenderNotice = document.querySelector("#demoRenderNotice");
const demoRenderText = document.querySelector("#demoRenderText");
const showMoreDemoBtn = document.querySelector("#showMoreDemoBtn");
const resetDemoFiltersBtn = document.querySelector("#resetDemoFiltersBtn");
const repairRenderNotice = document.querySelector("#repairRenderNotice");
const repairRenderText = document.querySelector("#repairRenderText");
const showMoreRepairBtn = document.querySelector("#showMoreRepairBtn");
const resetRepairFiltersBtn = document.querySelector("#resetRepairFiltersBtn");
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
const locationFilter = document.querySelector("#locationFilter");
const repairSearchInput = document.querySelector("#repairSearchInput");
const pasteInputButtons = document.querySelectorAll("[data-paste-target]");
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
const dialogSerial = document.querySelector("#dialogSerial");
const deleteBtn = document.querySelector("#deleteBtn");
const duplicateRecordBtn = document.querySelector("#duplicateRecordBtn");
const moveToDemoBtn = document.querySelector("#moveToDemoBtn");
const importInput = document.querySelector("#importInput");
const importRepairInput = document.querySelector("#importRepairInput");
const repairDialog = document.querySelector("#repairDialog");
const repairForm = document.querySelector("#repairForm");
const repairRecordEyebrow = document.querySelector("#repairRecordEyebrow");
const repairDialogTitle = document.querySelector("#repairDialogTitle");
const deleteRepairBtn = document.querySelector("#deleteRepairBtn");
const repairFormError = document.querySelector("#repairFormError");
const demoDialog = document.querySelector("#demoDialog");
const demoForm = document.querySelector("#demoForm");
const demoDialogTitle = document.querySelector("#demoDialogTitle");
const demoRecordEyebrow = document.querySelector("#demoRecordEyebrow");
const deleteDemoBtn = document.querySelector("#deleteDemoBtn");
const duplicateDemoBtn = document.querySelector("#duplicateDemoBtn");
const moveToDevicesBtn = document.querySelector("#moveToDevicesBtn");
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
const workstationBtn = document.querySelector("#workstationBtn");
const logoutBtn = document.querySelector("#logoutBtn");
const authDialog = document.querySelector("#authDialog");
const authForm = document.querySelector("#authForm");
const authEmail = document.querySelector("#authEmail");
const authPassword = document.querySelector("#authPassword");
const authError = document.querySelector("#authError");
const authSubmitBtn = document.querySelector("#authSubmitBtn");
const auditTrailTargets = {
  devices: {
    section: document.querySelector("#recordAuditTrail"),
    count: document.querySelector("#recordAuditTrailCount"),
    list: document.querySelector("#recordAuditTrailList")
  },
  repairs: {
    section: document.querySelector("#repairAuditTrail"),
    count: document.querySelector("#repairAuditTrailCount"),
    list: document.querySelector("#repairAuditTrailList")
  },
  demo: {
    section: document.querySelector("#demoAuditTrail"),
    count: document.querySelector("#demoAuditTrailCount"),
    list: document.querySelector("#demoAuditTrailList")
  }
};

function pricingUpdatedLabel() {
  const meta = currentPricingMeta();
  return `${PRICING_MONTH_NAMES[meta.updatedMonth - 1]} ${meta.updatedYear}`;
}

function pricingUpdatedDateTime() {
  const meta = currentPricingMeta();
  return `${meta.updatedYear}-${String(meta.updatedMonth).padStart(2, "0")}`;
}

function setCurrentYearTitle() {
  const year = new Date().getFullYear();
  const deviceTitle = `Zeszyt aparatów ${year}`;
  const repairTitle = `Zeszyt napraw i wkładek usznych ${year}`;
  const pricingTitle = `Cennik ${pricingUpdatedLabel()}`;
  const agreementsTitle = "Umowy";
  const title = activeNotebook === "repairs"
    ? repairTitle
    : activeNotebook === "pricing"
      ? pricingTitle
      : activeNotebook === "agreements"
        ? agreementsTitle
        : deviceTitle;

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
  if (!canViewPrivatePayments()) privatePayments = {};
  if (connectionUser) {
    connectionUser.textContent = currentSupabaseUser?.email || "";
    connectionUser.hidden = !currentSupabaseUser;
  }
  if (logoutBtn) logoutBtn.hidden = !currentSupabaseUser;
  updateWorkstationButton();
  updatePrivatePaymentVisibility();
  updatePricingManagementVisibility();
  if (activeNotebook === "pricing" || activeNotebook === "agreements") renderPricingRecords();
}

function normalizeWorkstationName(value) {
  return String(value ?? "").replace(/\s+/gu, " ").trim();
}

function currentWorkstationName() {
  return normalizeWorkstationName(localStorage.getItem(WORKSTATION_STORAGE_KEY));
}

function currentWorkstationUsageKey() {
  return normalize(currentWorkstationName() || "default");
}

function loadDocumentLocationUsage() {
  try {
    const raw = localStorage.getItem(DOCUMENT_LOCATION_USAGE_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveDocumentLocationUsage(usage) {
  localStorage.setItem(DOCUMENT_LOCATION_USAGE_STORAGE_KEY, JSON.stringify(usage || {}));
}

function documentLocationUsageBucket(workstation = currentWorkstationName()) {
  const key = normalize(workstation || "default");
  return key || "default";
}

function recordDocumentLocationUsage(location, workstation = currentWorkstationName()) {
  const normalizedLocation = normalizeDocumentLocationValue(location);
  if (!normalizedLocation) return;
  const usage = loadDocumentLocationUsage();
  const workstationKey = documentLocationUsageBucket(workstation);
  if (!usage[workstationKey] || typeof usage[workstationKey] !== "object") usage[workstationKey] = {};
  usage[workstationKey][normalizedLocation] = (usage[workstationKey][normalizedLocation] || 0) + 1;
  saveDocumentLocationUsage(usage);
}

function mostUsedDocumentLocationForWorkstation(workstation = currentWorkstationName()) {
  const usage = loadDocumentLocationUsage();
  const workstationKey = documentLocationUsageBucket(workstation);
  const bucket = usage[workstationKey];
  if (!bucket || typeof bucket !== "object") return DEFAULT_DOCUMENT_LOCATION;

  const ranked = DOCUMENT_LOCATIONS.map((entry, index) => ({
    value: entry.value,
    count: Number(bucket[entry.value] || 0),
    index
  })).sort((left, right) => {
    if (right.count !== left.count) return right.count - left.count;
    return left.index - right.index;
  });

  return ranked[0]?.count ? ranked[0].value : DEFAULT_DOCUMENT_LOCATION;
}

function suggestedDocumentLocation() {
  return mostUsedDocumentLocationForWorkstation(currentWorkstationName());
}

function updateWorkstationButton() {
  if (!workstationBtn) return;
  workstationBtn.hidden = !currentSupabaseUser;
  const name = currentWorkstationName();
  workstationBtn.textContent = name ? `Stanowisko: ${name}` : "Ustaw stanowisko";
  workstationBtn.title = name ? `To stanowisko: ${name}` : "Podaj T12, P50, P63 lub inicjały";
}

function promptForWorkstationName({ force = false } = {}) {
  const currentName = currentWorkstationName();
  if (currentName && !force) return currentName;

  const value = prompt("Podaj stanowisko: T12, P50, P63 lub inicjały.", currentName || "");
  if (value === null) {
    const fallbackName = currentName || "Nie ustawiono";
    if (!currentName) localStorage.setItem(WORKSTATION_STORAGE_KEY, fallbackName);
    updateWorkstationButton();
    return fallbackName;
  }

  const normalizedName = normalizeWorkstationName(value) || currentName || "Nie ustawiono";
  localStorage.setItem(WORKSTATION_STORAGE_KEY, normalizedName);
  updateWorkstationButton();
  return normalizedName;
}

function canViewPrivatePayments() {
  return String(currentSupabaseUser?.email || "").trim().toLowerCase() === PRIVATE_PAYMENT_EMAIL;
}

function canManageAuditLogs() {
  return String(currentSupabaseUser?.email || "").trim().toLowerCase() === PRIVATE_PAYMENT_EMAIL;
}

function canManagePricing() {
  if (!hasSupabaseConfig) return true;
  return String(currentSupabaseUser?.email || "").trim().toLowerCase() === PRIVATE_PAYMENT_EMAIL;
}

function canManagePricingLoanHistory() {
  if (!hasSupabaseConfig) return true;
  return String(currentSupabaseUser?.email || "").trim().toLowerCase() === PRIVATE_PAYMENT_EMAIL;
}

function canManagePricingPcprList() {
  if (!hasSupabaseConfig) return true;
  return String(currentSupabaseUser?.email || "").trim().toLowerCase() === PRIVATE_PAYMENT_EMAIL;
}

function updatePricingManagementVisibility() {
  const visible = canManagePricing();
  [importPricingBtn, replacePricingBtn, resetPricingBtn].forEach((button) => {
    if (!button) return;
    button.hidden = !visible;
    button.disabled = !visible;
  });
}

function updatePrivatePaymentVisibility() {
  const visible = canViewPrivatePayments();
  if (privatePaymentColumnHeader) privatePaymentColumnHeader.hidden = !visible;
  if (privatePaymentField) {
    privatePaymentField.hidden = !visible;
    privatePaymentField.style.display = visible ? "" : "none";
    privatePaymentField.setAttribute("aria-hidden", visible ? "false" : "true");
  }
  if (paymentReceivedAmountInput) {
    paymentReceivedAmountInput.disabled = !visible;
    if (!visible) paymentReceivedAmountInput.value = "";
  }
  if (paymentReceivedDateInput) {
    paymentReceivedDateInput.disabled = !visible;
    if (!visible) paymentReceivedDateInput.value = "";
  }
  devicesTable?.classList.toggle("private-payments-enabled", visible);
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

function normalizePaymentAmount(value) {
  return String(value ?? "").replace(/\s+/gu, " ").trim();
}

function normalizePrivatePaymentEntry(value) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const amount = normalizePaymentAmount(value.amount);
    const receivedDate = normalizeDateInput(value.receivedDate ?? value.received_date ?? "");
    return amount || receivedDate ? { amount, receivedDate } : null;
  }

  const amount = normalizePaymentAmount(value);
  return amount ? { amount, receivedDate: "" } : null;
}

function privatePaymentEntry(recordId) {
  return normalizePrivatePaymentEntry(privatePayments[String(recordId)] || null) || { amount: "", receivedDate: "" };
}

function privatePaymentHasValue(entry) {
  const normalizedEntry = normalizePrivatePaymentEntry(entry);
  return Boolean(normalizedEntry?.amount || normalizedEntry?.receivedDate);
}

function setPrivatePaymentEntry(recordId, entry) {
  if (!recordId) return;
  const normalizedEntry = normalizePrivatePaymentEntry(entry);
  if (normalizedEntry) {
    privatePayments[String(recordId)] = normalizedEntry;
  } else {
    delete privatePayments[String(recordId)];
  }
}

function paymentAmountToCents(value) {
  const text = normalizePaymentAmount(value)
    .replace(/\s+/gu, "")
    .replace(/(zł|pln)/giu, "")
    .replace(",", ".")
    .replace(/[^\d.-]/gu, "");
  if (!text) return null;
  const amount = Number.parseFloat(text);
  if (!Number.isFinite(amount)) return null;
  return Math.round(amount * 100);
}

function formatPaymentCents(cents) {
  const sign = cents < 0 ? "-" : "";
  const absolute = Math.abs(cents);
  const full = Math.floor(absolute / 100);
  const rest = absolute % 100;
  return rest ? `${sign}${full},${String(rest).padStart(2, "0")}` : `${sign}${full}`;
}

function privatePaymentInvoiceGroup(record) {
  const invoice = normalizeSalesInvoice(record?.salesInvoice);
  if (!invoice) return record?.id ? [record] : [];

  const customerKey = customerNameLookupKey(record?.customerName);
  const matches = records.filter((item) => {
    if (!item?.id || normalizeSalesInvoice(item.salesInvoice) !== invoice) return false;
    if (customerKey && customerNameLookupKey(item.customerName) !== customerKey) return false;
    return true;
  });

  return matches.length ? matches : record?.id ? [record] : [];
}

function privatePaymentUpdatesForRecord(record, entry) {
  if (!record?.id) return [];
  const normalizedEntry = normalizePrivatePaymentEntry(entry);
  const group = privatePaymentInvoiceGroup(record);
  if (group.length <= 1) return [{ recordId: record.id, entry: normalizedEntry }];

  const cents = paymentAmountToCents(normalizedEntry?.amount);
  if (cents === null) {
    return group.map((item) => ({ recordId: item.id, entry: normalizedEntry }));
  }

  const base = Math.trunc(cents / group.length);
  let remainder = cents - base * group.length;
  return group.map((item) => {
    const extra = remainder === 0 ? 0 : remainder > 0 ? 1 : -1;
    remainder -= extra;
    return {
      recordId: item.id,
      entry: {
        amount: formatPaymentCents(base + extra),
        receivedDate: normalizedEntry?.receivedDate || ""
      }
    };
  });
}

function privatePaymentFormEntry(record) {
  const entry = record?.id ? privatePaymentEntry(record.id) : { amount: "", receivedDate: "" };
  const group = privatePaymentInvoiceGroup(record);
  if (group.length <= 1) return entry;

  const centsValues = group
    .map((item) => paymentAmountToCents(privatePaymentEntry(item.id).amount))
    .filter((value) => value !== null);
  const totalAmount = centsValues.length ? formatPaymentCents(centsValues.reduce((sum, value) => sum + value, 0)) : entry.amount;
  const dates = group
    .map((item) => privatePaymentEntry(item.id).receivedDate)
    .filter(Boolean);
  const receivedDate = dates.every((date) => date === dates[0]) ? dates[0] || entry.receivedDate : entry.receivedDate;

  return { amount: totalAmount, receivedDate };
}

function applyPrivatePaymentUpdates(updates) {
  updates.forEach(({ recordId, entry }) => setPrivatePaymentEntry(recordId, entry));
  saveLocalPrivatePayments();
}

function persistPrivatePaymentUpdates(updates) {
  return Promise.all(updates.map(({ recordId, entry }) => persistPrivatePayment(recordId, entry)));
}

function loadLocalPrivatePayments() {
  try {
    const parsed = JSON.parse(localStorage.getItem(PRIVATE_PAYMENTS_STORAGE_KEY) || "{}");
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return Object.fromEntries(
      Object.entries(parsed)
        .map(([recordId, entry]) => [String(recordId), normalizePrivatePaymentEntry(entry)])
        .filter(([, entry]) => entry)
    );
  } catch {
    return {};
  }
}

function saveLocalPrivatePayments() {
  localStorage.setItem(PRIVATE_PAYMENTS_STORAGE_KEY, JSON.stringify(privatePayments));
}

async function loadPrivatePayments() {
  privatePayments = canViewPrivatePayments() ? loadLocalPrivatePayments() : {};
  if (!canViewPrivatePayments()) return privatePayments;

  if (hasSupabaseConfig) {
    const { data, error } = await supabaseClient
      .from(SUPABASE_PRIVATE_PAYMENTS_TABLE)
      .select("record_id, amount, received_date");

    if (error) {
      console.warn("Nie udało się pobrać prywatnych płatności:", error.message);
      return privatePayments;
    }

    privatePayments = Object.fromEntries(
      (data || [])
        .map((row) => [String(row.record_id), normalizePrivatePaymentEntry({ amount: row.amount, receivedDate: row.received_date })])
        .filter(([, entry]) => entry)
    );
    saveLocalPrivatePayments();
  }

  return privatePayments;
}

async function persistPrivatePayment(recordId, entry) {
  if (!canViewPrivatePayments() || !recordId) return;

  const normalizedEntry = normalizePrivatePaymentEntry(entry);
  setPrivatePaymentEntry(recordId, normalizedEntry);
  saveLocalPrivatePayments();

  if (!hasSupabaseConfig) return;

  try {
    if (normalizedEntry) {
      const { error } = await supabaseClient.from(SUPABASE_PRIVATE_PAYMENTS_TABLE).upsert({
        record_id: String(recordId),
        amount: normalizedEntry.amount,
        received_date: normalizedEntry.receivedDate,
        updated_at: new Date().toISOString(),
        updated_by: currentSupabaseUser?.id || null
      }, { onConflict: "record_id" });
      if (error) throw error;
      return;
    }

    const { error } = await supabaseClient
      .from(SUPABASE_PRIVATE_PAYMENTS_TABLE)
      .delete()
      .eq("record_id", String(recordId));
    if (error) throw error;
  } catch (error) {
    console.warn("Płatność zapisana lokalnie, ale bez synchronizacji Supabase:", error.message);
    if (!privatePaymentSyncWarningShown) {
      privatePaymentSyncWarningShown = true;
      alert("Płatność zapisana lokalnie, ale Supabase nie przyjął zapisu daty. Uruchom ponownie plik supabase-private-payments.sql w SQL Editor.");
    }
  }
}

async function deletePrivatePayment(recordId) {
  await persistPrivatePayment(recordId, null);
}

function normalizeAuditLogEntry(entry) {
  if (!entry || typeof entry !== "object") return null;
  const id = String(entry.id || makeId());
  const recordId = String(entry.recordId ?? entry.record_id ?? "").trim();
  const notebook = String(entry.notebook || "").trim();
  const action = String(entry.action || "").trim();
  if (!recordId || !notebook || !action) return null;

  return {
    id,
    recordId,
    notebook,
    action,
    recordLabel: String(entry.recordLabel ?? entry.record_label ?? "").trim(),
    workstation: normalizeWorkstationName(entry.workstation),
    userEmail: String(entry.userEmail ?? entry.user_email ?? "").trim(),
    createdAt: String(entry.createdAt ?? entry.created_at ?? new Date().toISOString()),
    data: entry.data && typeof entry.data === "object" ? entry.data : {}
  };
}

function loadLocalAuditLogs() {
  try {
    const parsed = JSON.parse(localStorage.getItem(AUDIT_LOG_STORAGE_KEY) || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeAuditLogEntry).filter(Boolean);
  } catch {
    return [];
  }
}

function saveLocalAuditLogs() {
  auditLogs = auditLogs
    .map(normalizeAuditLogEntry)
    .filter(Boolean)
    .sort((left, right) => String(right.createdAt).localeCompare(String(left.createdAt)))
    .slice(0, 1500);
  localStorage.setItem(AUDIT_LOG_STORAGE_KEY, JSON.stringify(auditLogs));
}

function appendLocalAuditLog(entry) {
  const normalizedEntry = normalizeAuditLogEntry(entry);
  if (!normalizedEntry) return null;
  auditLogs = [normalizedEntry, ...auditLogs.filter((item) => item.id !== normalizedEntry.id)];
  saveLocalAuditLogs();
  return normalizedEntry;
}

function auditActionLabel(action) {
  if (action === "add") return "Dodano";
  if (action === "edit") return "Edytowano";
  if (action === "delete") return "Usunięto";
  if (action === "move") return "Przeniesiono";
  return "Zmieniono";
}

function auditNotebookFields(notebook) {
  if (notebook === "repairs") return repairFields;
  if (notebook === "demo") return demoFields;
  return fields;
}

function auditFieldLabel(field) {
  const labels = {
    receivedDate: "Data przyjęcia",
    deviceName: "Model/nazwa",
    serialNumber: "Numer seryjny",
    serialNumber2: "Numer seryjny 2",
    type: "Status",
    status: "Status",
    category: "Typ",
    location: "Miejsce",
    pickupDate: "Data odbioru",
    customerName: "Imię i nazwisko",
    salesInvoice: "Faktura sprzedaży",
    returnDate: "Data powrotu/zwrotu",
    sentDate: "Data wysłania",
    waybillNumber: "NR WZ",
    ezwm: "EZWM",
    manufacturer: "Producent",
    manufacturerReturnDate: "Termin zwrotu do producenta",
    manufacturerReturnedDate: "Data zwrotu do producenta",
    manufacturerReturned: "Zwrócono do producenta",
    currentUser: "Aktualnie używany",
    loanDate: "Data wypożyczenia",
    purpose: "Charakter",
    notes: "Uwagi"
  };
  return labels[field] || field;
}

function auditCompareValue(value) {
  if (Array.isArray(value)) return JSON.stringify(value);
  if (value && typeof value === "object") return JSON.stringify(value);
  return String(value ?? "").trim();
}

function changedAuditFields(notebook, beforeRecord, afterRecord) {
  if (!beforeRecord || !afterRecord) return [];
  return auditNotebookFields(notebook)
    .filter((field) => auditCompareValue(beforeRecord[field]) !== auditCompareValue(afterRecord[field]))
    .map(auditFieldLabel);
}

function auditSnapshot(record) {
  if (!record) return null;
  try {
    return JSON.parse(JSON.stringify(record));
  } catch {
    return { ...record };
  }
}

function auditRecordLabel(notebook, record = {}) {
  if (notebook === "repairs") {
    return [
      titleCaseName(record.customerName),
      normalizeRepairCategory(record.category),
      normalizeDeviceName(record.deviceName),
      repairSerialNumbers(record).join(", ")
    ].filter(Boolean).join(" / ");
  }
  if (notebook === "demo") {
    return [normalizeDeviceName(record.deviceName), normalizeSerialNumber(record.serialNumber), normalizeDemoLocation(record.location)]
      .filter(Boolean)
      .join(" / ");
  }
  return [normalizeDeviceName(record.deviceName), normalizeSerialNumber(record.serialNumber), normalizeRepairLocation(record.location)]
    .filter(Boolean)
    .join(" / ");
}

function createAuditLogEntry({ notebook, action, recordId, beforeRecord = null, afterRecord = null }) {
  const record = afterRecord || beforeRecord || {};
  const changedFields = action === "edit" ? changedAuditFields(notebook, beforeRecord, afterRecord) : [];
  return normalizeAuditLogEntry({
    id: makeId(),
    recordId,
    notebook,
    action,
    recordLabel: auditRecordLabel(notebook, record),
    workstation: promptForWorkstationName(),
    userEmail: currentSupabaseUser?.email || "",
    createdAt: new Date().toISOString(),
    data: {
      changedFields,
      browser: navigator.userAgent || "",
      url: window.location.href || ""
    }
  });
}

function supabaseAuditLogRow(entry) {
  return {
    id: entry.id,
    record_id: entry.recordId,
    notebook: entry.notebook,
    action: entry.action,
    record_label: entry.recordLabel,
    workstation: entry.workstation,
    user_email: entry.userEmail,
    user_id: currentSupabaseUser?.id || null,
    created_at: entry.createdAt,
    data: entry.data || {}
  };
}

function auditLogFromSupabaseRow(row) {
  return normalizeAuditLogEntry({
    id: row.id,
    recordId: row.record_id,
    notebook: row.notebook,
    action: row.action,
    recordLabel: row.record_label,
    workstation: row.workstation,
    userEmail: row.user_email,
    createdAt: row.created_at,
    data: row.data
  });
}

function showAuditLogSyncWarning(error) {
  console.warn("Nie udało się zapisać historii zmian:", error?.message || error);
  if (auditLogSyncWarningShown) return;
  auditLogSyncWarningShown = true;
  alert("Rekord zapisany, ale historia zmian nie zapisała się w Supabase. Uruchom plik supabase-audit-log.sql w SQL Editor.");
}

async function persistAuditLog(entry) {
  const normalizedEntry = appendLocalAuditLog(entry);
  if (!normalizedEntry || !hasSupabaseConfig) return;

  try {
    await retrySupabaseWrite(async () => {
      const { error } = await supabaseClient.from(SUPABASE_AUDIT_TABLE).insert(supabaseAuditLogRow(normalizedEntry));
      if (error) throw error;
    });
  } catch (error) {
    showAuditLogSyncWarning(error);
  }
}

function logAuditEvent(options) {
  const entry = createAuditLogEntry(options);
  if (!entry) return;
  persistAuditLog(entry).catch(showAuditLogSyncWarning);
}

async function loadAuditLogsForRecord(notebook, recordId) {
  const localLogs = auditLogs
    .filter((entry) => entry.action !== "delete" && entry.notebook === notebook && entry.recordId === recordId)
    .sort((left, right) => String(right.createdAt).localeCompare(String(left.createdAt)))
    .slice(0, 20);

  if (!hasSupabaseConfig) return localLogs;

  try {
    const { data, error } = await supabaseClient
      .from(SUPABASE_AUDIT_TABLE)
      .select("id,record_id,notebook,action,record_label,workstation,user_email,created_at,data")
      .eq("notebook", notebook)
      .eq("record_id", recordId)
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) throw error;
    return (data || [])
      .map(auditLogFromSupabaseRow)
      .filter((entry) => entry && entry.action !== "delete");
  } catch (error) {
    console.warn("Nie udało się pobrać historii zmian:", error?.message || error);
    return localLogs;
  }
}

function formatAuditDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value || "");
  return dateTimeFormatter.format(date);
}

async function deleteAuditLogEntry(entry, notebook) {
  if (!canManageAuditLogs() || !entry?.id) return;
  if (!confirm("Usunąć ten wpis historii zmian?")) return;

  const previousLogs = auditLogs;
  auditLogs = auditLogs.filter((item) => item.id !== entry.id);
  saveLocalAuditLogs();
  renderAuditTrailEntries(notebook, auditLogs
    .filter((item) => item.notebook === notebook && item.recordId === entry.recordId)
    .sort((left, right) => String(right.createdAt).localeCompare(String(left.createdAt)))
    .slice(0, 20));

  if (!hasSupabaseConfig) return;

  try {
    await retrySupabaseWrite(async () => {
      const { error } = await supabaseClient.from(SUPABASE_AUDIT_TABLE).delete().eq("id", entry.id);
      if (error) throw error;
    });
    renderAuditTrail(notebook, entry.recordId);
  } catch (error) {
    auditLogs = previousLogs;
    saveLocalAuditLogs();
    renderAuditTrail(notebook, entry.recordId);
    alert(`Nie udało się usunąć historii zmian: ${errorText(error) || "nieznany błąd"}`);
  }
}

function createAuditTrailItem(entry, notebook) {
  const item = document.createElement("div");
  item.className = "audit-trail-item";

  const title = document.createElement("strong");
  title.textContent = `${auditActionLabel(entry.action)} · ${formatAuditDateTime(entry.createdAt)}`;

  const meta = document.createElement("span");
  meta.textContent = [
    entry.userEmail || "brak użytkownika",
    entry.workstation || "brak stanowiska"
  ].join(" · ");

  const changedFields = Array.isArray(entry.data?.changedFields) ? entry.data.changedFields : [];
  if (changedFields.length) {
    const details = document.createElement("span");
    details.textContent = `Zmieniono: ${changedFields.join(", ")}`;
    item.append(title, meta, details);
  } else {
    item.append(title, meta);
  }

  if (canManageAuditLogs()) {
    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "audit-trail-delete";
    deleteButton.textContent = "Usuń";
    deleteButton.addEventListener("click", () => deleteAuditLogEntry(entry, notebook));
    item.append(deleteButton);
  }

  return item;
}

function renderAuditTrailLoading(notebook) {
  const target = auditTrailTargets[notebook];
  if (!target?.section || !target.list || !target.count) return;
  target.section.hidden = false;
  target.count.textContent = "";
  target.list.innerHTML = '<p class="audit-trail-empty">Ładowanie historii...</p>';
}

function renderAuditTrailEntries(notebook, entries) {
  const target = auditTrailTargets[notebook];
  if (!target?.section || !target.list || !target.count) return;
  target.section.hidden = false;
  target.count.textContent = entries.length ? `${entries.length}` : "";
  if (!entries.length) {
    target.list.innerHTML = '<p class="audit-trail-empty">Brak historii zmian.</p>';
    return;
  }
  target.list.replaceChildren(...entries.map((entry) => createAuditTrailItem(entry, notebook)));
}

function renderAuditTrail(notebook, recordId) {
  const target = auditTrailTargets[notebook];
  if (!target?.section || !target.list || !target.count) return;
  if (!recordId) {
    target.section.hidden = true;
    target.count.textContent = "";
    target.list.replaceChildren();
    return;
  }

  renderAuditTrailLoading(notebook);
  loadAuditLogsForRecord(notebook, recordId).then((entries) => {
    renderAuditTrailEntries(notebook, entries);
  });
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

function isMissingSupabaseTableError(error) {
  const message = errorText(error).toLowerCase();
  return (
    message.includes("could not find the table") ||
    message.includes("schema cache") ||
    message.includes("does not exist") ||
    message.includes("relation") && message.includes("not found")
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
  const protectedIds = new Set(options.excludeIds || []);
  const staleIds = existingIds.filter((id) => !importedIds.has(id) && !protectedIds.has(id));
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
    const [
      sharedRecords,
      sharedRepairRecords,
      sharedDemoRecords,
      sharedPricingRecords,
      sharedLoanHistory,
      sharedOfferHistory,
      sharedOrderHistory,
      sharedComplaintHistory,
      sharedPcprList
    ] = await Promise.all([
      loadSupabaseTable(SUPABASE_DEVICE_TABLE, normalizeDeviceRecordsForUse, { excludeIdPrefix: DEMO_ID_PREFIX }),
      loadSupabaseTable(SUPABASE_REPAIR_TABLE, normalizeRepairRecordsForUse),
      loadSupabaseTable(
        SUPABASE_DEVICE_TABLE,
        (loadedRecords) => normalizeDemoRecordsForUse(loadedRecords.filter((record) => record.id !== DEMO_SEED_MARKER_ID)),
        { idPrefix: DEMO_ID_PREFIX }
      ),
      loadSupabasePricingRecords(),
      loadSupabasePricingLoanHistory(),
      loadSupabasePricingOfferHistory(),
      loadSupabasePricingOrderHistory(),
      loadSupabasePricingComplaintHistory(),
      loadSupabasePricingPcprList()
    ]);
    records = sharedRecords;
    repairRecords = sharedRepairRecords;
    demoRecords = sharedDemoRecords;
    if (sharedPricingRecords) pricingRecords = sharedPricingRecords;
    if (sharedLoanHistory) pricingLoanHistory = sharedLoanHistory;
    if (sharedOfferHistory) pricingOfferHistory = sharedOfferHistory;
    if (sharedOrderHistory) pricingOrderHistory = sharedOrderHistory;
    if (sharedComplaintHistory) pricingComplaintHistory = sharedComplaintHistory;
    if (sharedPcprList) pricingPcprList = sharedPcprList;
    await loadPrivatePayments();
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

async function refreshPricingFromSupabase() {
  if (!hasSupabaseConfig || !currentSupabaseUser) return;
  const [sharedPricingRecords, sharedLoanHistory, sharedOfferHistory, sharedOrderHistory, sharedComplaintHistory, sharedPcprList] = await Promise.all([
    loadSupabasePricingRecords(),
    loadSupabasePricingLoanHistory(),
    loadSupabasePricingOfferHistory(),
    loadSupabasePricingOrderHistory(),
    loadSupabasePricingComplaintHistory(),
    loadSupabasePricingPcprList()
  ]);
  if (!sharedPricingRecords && !sharedLoanHistory && !sharedOfferHistory && !sharedOrderHistory && !sharedComplaintHistory && !sharedPcprList) return;
  if (sharedPricingRecords) pricingRecords = sharedPricingRecords;
  if (sharedLoanHistory) pricingLoanHistory = sharedLoanHistory;
  if (sharedOfferHistory) pricingOfferHistory = sharedOfferHistory;
  if (sharedOrderHistory) pricingOrderHistory = sharedOrderHistory;
  if (sharedComplaintHistory) pricingComplaintHistory = sharedComplaintHistory;
  if (sharedPcprList) pricingPcprList = sharedPcprList;
  renderPricingRecords();
  if (!["pricing", "agreements"].includes(activeNotebook)) renderDeviceViews();
  setCurrentYearTitle();
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
  if (canViewPrivatePayments()) {
    loadPrivatePayments()
      .then(() => renderDeviceViews())
      .catch((error) => console.warn("Nie udało się odświeżyć prywatnych płatności:", error.message));
  }
  setConnectionStatus("online", "Supabase");
}

function subscribeToSupabaseChanges() {
  if (!hasSupabaseConfig || supabaseRealtimeChannel) return;

  let channel = supabaseClient
    .channel("zeszyt-live")
    .on("postgres_changes", { event: "*", schema: "public", table: SUPABASE_DEVICE_TABLE }, (payload) => {
      const id = payload.new?.id || payload.old?.id || "";
      if (id === DEMO_SEED_MARKER_ID) return;
      queueSupabaseChange(id.startsWith(DEMO_ID_PREFIX) ? "demo" : SUPABASE_DEVICE_TABLE, payload);
    })
    .on("postgres_changes", { event: "*", schema: "public", table: SUPABASE_REPAIR_TABLE }, (payload) =>
      queueSupabaseChange(SUPABASE_REPAIR_TABLE, payload)
    );

  if (canViewPrivatePayments()) {
    channel = channel.on("postgres_changes", { event: "*", schema: "public", table: SUPABASE_PRIVATE_PAYMENTS_TABLE }, () => {
      if (!canViewPrivatePayments()) return;
      loadPrivatePayments()
        .then(() => renderDeviceViews())
        .catch((error) => console.warn("Nie udało się odświeżyć prywatnych płatności:", error.message));
    });
  }

  if (pricingSupabaseAvailable !== false) {
    channel = channel.on("postgres_changes", { event: "*", schema: "public", table: SUPABASE_PRICING_TABLE }, () => {
      refreshPricingFromSupabase().catch((error) => console.warn("Nie udało się odświeżyć cennika:", error.message));
    });
  }

  if (pricingLoanHistorySupabaseAvailable !== false) {
    channel = channel.on("postgres_changes", { event: "*", schema: "public", table: SUPABASE_LOAN_CONTRACT_TABLE }, () => {
      loadSupabasePricingLoanHistory()
        .then(() => {
          if (!["pricing", "agreements"].includes(activeNotebook)) renderDeviceViews();
        })
        .catch((error) => console.warn("Nie udało się odświeżyć historii umów:", error.message));
    });
  }

  if (pricingOfferHistorySupabaseAvailable !== false) {
    channel = channel.on("postgres_changes", { event: "*", schema: "public", table: SUPABASE_OFFER_HISTORY_TABLE }, () => {
      loadSupabasePricingOfferHistory()
        .then(() => {
          if (!["pricing", "agreements"].includes(activeNotebook)) renderDeviceViews();
        })
        .catch((error) => console.warn("Nie udało się odświeżyć historii ofert:", error.message));
    });
  }

  if (pricingOrderHistorySupabaseAvailable !== false) {
    channel = channel.on("postgres_changes", { event: "*", schema: "public", table: SUPABASE_ORDER_HISTORY_TABLE }, () => {
      loadSupabasePricingOrderHistory()
        .then(() => {
          if (activePricingView === "order") renderPricingOrder();
        })
        .catch((error) => console.warn("Nie udało się odświeżyć historii zamówień:", error.message));
    });
  }

  if (pricingComplaintHistorySupabaseAvailable !== false) {
    channel = channel.on("postgres_changes", { event: "*", schema: "public", table: SUPABASE_COMPLAINT_HISTORY_TABLE }, () => {
      loadSupabasePricingComplaintHistory()
        .then(() => {
          if (activePricingView === "complaint") renderPricingComplaint();
        })
        .catch((error) => console.warn("Nie udało się odświeżyć historii reklamacji:", error.message));
    });
  }

  if (pricingPcprListSupabaseAvailable !== false) {
    channel = channel.on("postgres_changes", { event: "*", schema: "public", table: SUPABASE_PCPR_LIST_TABLE }, () => {
      loadSupabasePricingPcprList()
        .then(() => {
          if (activePricingView === "pcpr") renderPricingPcprList();
        })
        .catch((error) => console.warn("Nie udało się odświeżyć listy PCPR:", error.message));
    });
  }

  supabaseRealtimeChannel = channel.subscribe((status) => {
    if (status === "SUBSCRIBED") setConnectionStatus("online", "Supabase");
    if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
      setConnectionStatus("error", "Brak synchronizacji");
    }
  });
}

async function activateSupabaseSession(user) {
  updateConnectionUser(user);
  pricingLoanHistorySupabaseAvailable = null;
  pricingOfferHistorySupabaseAvailable = null;
  pricingOrderHistorySupabaseAvailable = null;
  pricingComplaintHistorySupabaseAvailable = null;
  pricingPcprListSupabaseAvailable = null;
  hideAuthDialog();
  setConnectionStatus("syncing", "Łączenie...");
  renderCachedRecordsBeforeSupabaseSync();
  await refreshRecordsFromSupabase({ throwOnError: true });
  await seedDemoRecordsIfEmpty();
  subscribeToSupabaseChanges();
  window.setTimeout(() => promptForWorkstationName(), 250);
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
  pricingLoanHistory = loadPricingLoanHistory();
  pricingOfferHistory = loadPricingOfferHistory();
  pricingOrderHistory = loadPricingOrderHistory();
  pricingComplaintHistory = loadPricingComplaintHistory();
  pricingPcprList = loadPricingPcprList();
  pricingLoanHistorySupabaseAvailable = null;
  pricingOfferHistorySupabaseAvailable = null;
  pricingOrderHistorySupabaseAvailable = null;
  pricingComplaintHistorySupabaseAvailable = null;
  pricingPcprListSupabaseAvailable = null;
  activePricingLoanHistoryId = "";
  rebuildDerivedData();
  render();
  setConnectionStatus("offline", "Zaloguj się");
  showAuthDialog();
}

function loadStockAudit() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STOCK_AUDIT_STORAGE_KEY) || "{}");
    return {
      checkedAt: isoDateForSave(parsed.checkedAt) || "",
      checkedBy: titleCaseName(parsed.checkedBy || ""),
      savedAt: String(parsed.savedAt || ""),
      checkedItems: Array.isArray(parsed.checkedItems) ? [...new Set(parsed.checkedItems.map(String).filter(Boolean))] : [],
      items: normalizeStockAuditItems(parsed.items)
    };
  } catch {
    return { checkedAt: "", checkedBy: "", savedAt: "", checkedItems: [], items: [] };
  }
}

function normalizeStockAuditItems(items) {
  if (!Array.isArray(items)) return [];
  const seen = new Set();
  const normalizedItems = [];

  items.forEach((item) => {
    const id = String(item?.id || "").trim();
    if (!id || seen.has(id)) return;
    seen.add(id);
    normalizedItems.push({
      id,
      deviceName: String(item?.deviceName || "Bez nazwy").trim() || "Bez nazwy",
      serialNumber: String(item?.serialNumber || "brak numeru").trim() || "brak numeru",
      location: normalizeRepairLocation(item?.location)
    });
  });

  return normalizedItems;
}

function stockAuditSnapshotItems(stockRecords = stockAuditRecords()) {
  return stockRecords.map((record) => ({
    id: String(record.id),
    deviceName: String(record.deviceName || "Bez nazwy").trim() || "Bez nazwy",
    serialNumber: String(record.serialNumber || "brak numeru").trim() || "brak numeru",
    location: normalizeRepairLocation(record.location)
  }));
}

function persistStockAudit(audit) {
  stockAudit = {
    checkedAt: isoDateForSave(audit.checkedAt) || todayInputValue(),
    checkedBy: titleCaseName(audit.checkedBy || ""),
    savedAt: audit.savedAt || new Date().toISOString(),
    checkedItems: Array.isArray(audit.checkedItems)
      ? [...new Set(audit.checkedItems.map(String).filter(Boolean))]
      : [...new Set((stockAudit.checkedItems || []).map(String).filter(Boolean))],
    items: normalizeStockAuditItems(Array.isArray(audit.items) ? audit.items : stockAudit.items)
  };
  localStorage.setItem(STOCK_AUDIT_STORAGE_KEY, JSON.stringify(stockAudit));
}

function stockAuditRecords() {
  return records.filter((record) => deviceDerived.get(record.id)?.isInStock);
}

function stockAuditCheckedCount(stockRecords = stockAuditRecords()) {
  const checkedItems = new Set(stockAudit.checkedItems || []);
  const auditItems = stockAuditResultItems(stockRecords);
  return auditItems.filter((item) => checkedItems.has(item.id)).length;
}

function stockAuditProgressLabel(stockRecords = stockAuditRecords()) {
  const stats = stockAuditResultStats(stockRecords);
  const missingLabel = stats.active ? ` · brak ${stats.missing}` : "";
  return `sprawdzone ${stats.checked}/${stats.total}${missingLabel}`;
}

function stockAuditLabel(stockRecords = stockAuditRecords()) {
  const progress = stockAuditProgressLabel(stockRecords);
  if (!stockAudit.checkedAt && !stockAudit.checkedBy) return `Brak zapisanego remanentu. · ${progress}`;
  const date = stockAudit.checkedAt ? formatDate(stockAudit.checkedAt) : "brak daty";
  const person = stockAudit.checkedBy || "brak osoby";
  return `Ostatni remanent: ${date} · ${person} · ${progress}`;
}

function renderStockAudit(stockRecords = stockAuditRecords()) {
  if (stockAuditSummary) {
    const progress = stockAuditProgressLabel(stockRecords);
    if (!stockAudit.checkedAt && !stockAudit.checkedBy) {
      stockAuditSummary.textContent = `Brak zapisanego remanentu. · ${progress}`;
    } else {
      stockAuditSummary.replaceChildren(
        "Ostatni remanent: ",
        createDateText(stockAudit.checkedAt) || "brak daty",
        ` · ${stockAudit.checkedBy || "brak osoby"} · ${progress}`
      );
    }
  }
  if (stockChecklistPerson) stockChecklistPerson.textContent = `Sprawdził(a): ${stockAudit.checkedBy || ""}`;
  setLabeledDateContent(stockChecklistDate, "Data: ", stockAudit.checkedAt, "");
  if (exportStockAuditPdfBtn) exportStockAuditPdfBtn.disabled = !isStockAuditActive();
  renderStockAuditPreview(stockRecords);
  renderStockAuditReport(stockRecords);
}

function stockAuditResultItems(stockRecords = stockAuditRecords()) {
  return stockAudit.items?.length ? stockAudit.items : stockAuditSnapshotItems(stockRecords);
}

function isStockAuditActive() {
  return Boolean(stockAudit.checkedItems?.length || stockAudit.items?.length);
}

function stockAuditResultStats(stockRecords = stockAuditRecords()) {
  const active = isStockAuditActive();
  const items = active ? stockAuditResultItems(stockRecords) : stockAuditSnapshotItems(stockRecords);
  const checkedItems = new Set(stockAudit.checkedItems || []);
  const checked = items.filter((item) => checkedItems.has(item.id)).length;
  return {
    active,
    checked,
    missing: Math.max(0, items.length - checked),
    total: items.length,
    items
  };
}

function renderStockAuditPreview(stockRecords = stockAuditRecords()) {
  if (!stockAuditPreview) return;
  const stats = stockAuditResultStats(stockRecords);

  if (!stats.active || !stats.total) {
    stockAuditPreview.hidden = true;
    stockAuditPreview.replaceChildren();
    return;
  }

  const checkedItems = new Set(stockAudit.checkedItems || []);
  const missingItems = stats.items.filter((item) => !checkedItems.has(item.id));
  const presentItems = stats.items.filter((item) => checkedItems.has(item.id));
  const missingPreviewLimit = 24;
  const presentPreviewLimit = 18;

  const header = document.createElement("div");
  header.className = "stock-audit-preview-head";
  header.append(
    createStockAuditPreviewCard("Było", stats.checked, "present"),
    createStockAuditPreviewCard("Nie było", stats.missing, "missing")
  );

  const lists = document.createElement("div");
  lists.className = "stock-audit-preview-lists";
  lists.append(
    createStockAuditPreviewList("Było", presentItems, "present", presentPreviewLimit),
    createStockAuditPreviewList("Nie było", missingItems, "missing", missingPreviewLimit)
  );

  stockAuditPreview.hidden = false;
  stockAuditPreview.replaceChildren(header, lists);
}

function createStockAuditPreviewCard(label, count, type) {
  const card = document.createElement("div");
  card.className = `stock-audit-preview-card ${type}`;
  const title = document.createElement("span");
  const value = document.createElement("strong");
  title.textContent = label;
  value.textContent = String(count);
  card.append(title, value);
  return card;
}

function createStockAuditPreviewList(label, items, type, limit) {
  const section = document.createElement("section");
  section.className = `stock-audit-preview-list ${type}`;
  const title = document.createElement("strong");
  const list = document.createElement("div");

  title.textContent = `${label}: ${items.length}`;
  list.className = "stock-audit-preview-items";

  items.slice(0, limit).forEach((item) => {
    const chip = document.createElement("span");
    chip.className = `stock-audit-preview-chip ${type}`;
    chip.textContent = `${item.serialNumber} · ${item.deviceName} · ${item.location}`;
    list.append(chip);
  });

  if (items.length > limit) {
    const more = document.createElement("span");
    more.className = "stock-audit-preview-more";
    more.textContent = `+ ${items.length - limit} więcej`;
    list.append(more);
  }

  if (!items.length) {
    const empty = document.createElement("span");
    empty.className = "stock-audit-preview-empty";
    empty.textContent = "Brak pozycji.";
    list.append(empty);
  }

  section.append(title, list);
  return section;
}

function sortedStockAuditReportItems(stockRecords = stockAuditRecords()) {
  const stats = stockAuditResultStats(stockRecords);
  const checkedItems = new Set(stockAudit.checkedItems || []);
  return stats.items
    .map((item) => ({
      ...item,
      status: checkedItems.has(item.id) ? "NA STANIE" : "BRAK"
    }))
    .sort((left, right) => {
      const byStatus = left.status === right.status ? 0 : left.status === "BRAK" ? -1 : 1;
      if (byStatus) return byStatus;
      const byLocation = collator.compare(left.location, right.location);
      if (byLocation) return byLocation;
      const byName = collator.compare(left.deviceName, right.deviceName);
      if (byName) return byName;
      return collator.compare(left.serialNumber, right.serialNumber);
    });
}

function renderStockAuditReport(stockRecords = stockAuditRecords()) {
  if (!stockAuditReportBody) return;

  const stats = stockAuditResultStats(stockRecords);
  const reportItems = sortedStockAuditReportItems(stockRecords);
  const dateText = stockAudit.checkedAt ? formatDate(stockAudit.checkedAt) : "brak daty";
  const personText = stockAudit.checkedBy || "brak osoby";

  if (stockAuditReportMeta) {
    stockAuditReportMeta.replaceChildren(
      "Data remanentu: ",
      createDateText(stockAudit.checkedAt) || dateText,
      ` · Sprawdzał(a): ${personText} · Razem: ${stats.total} · Na stanie: ${stats.checked} · Brak: ${stats.missing}`
    );
  }

  if (stockAuditReportPerson) stockAuditReportPerson.textContent = `Sprawdził(a): ${stockAudit.checkedBy || ""}`;
  setLabeledDateContent(stockAuditReportDate, "Data: ", stockAudit.checkedAt, "");

  if (stockAuditReportSummary) {
    const summaryItems = [
      ["Na stanie", stats.checked, "present"],
      ["Brak", stats.missing, "missing"],
      ["Razem", stats.total, "total"]
    ];

    stockAuditReportSummary.replaceChildren(...summaryItems.map(([label, value, type]) => {
      const item = document.createElement("div");
      const title = document.createElement("span");
      const count = document.createElement("strong");
      item.className = `stock-audit-report-stat ${type}`;
      title.textContent = label;
      count.textContent = String(value);
      item.append(title, count);
      return item;
    }));
  }

  const rows = reportItems.map((item, index) => {
    const row = document.createElement("tr");
    row.className = item.status === "NA STANIE" ? "stock-audit-report-present" : "stock-audit-report-missing";

    const nameLength = String(item.deviceName || "").length;
    if (nameLength > 42) row.classList.add("stock-audit-report-long-name");
    if (nameLength > 62) row.classList.add("stock-audit-report-very-long-name");

    [
      { value: String(index + 1), className: "audit-report-index" },
      { value: item.status, className: "audit-report-status" },
      { value: item.deviceName, className: "audit-report-device-name" },
      { value: item.serialNumber, className: "audit-report-serial" },
      { value: item.location, className: "audit-report-location" }
    ].forEach(({ value, className }) => {
      const cell = document.createElement("td");
      cell.className = className;
      cell.textContent = value;
      row.append(cell);
    });

    return row;
  });

  renderTableRows(stockAuditReportBody, rows);
}

function exportStockAuditPdf() {
  if (!isStockAuditActive()) {
    alert("Najpierw zapisz albo zaznacz remanent.");
    return;
  }

  renderStockAuditReport();
  const cleanup = () => document.body.classList.remove("stock-audit-pdf-print");
  document.body.classList.add("stock-audit-pdf-print");
  window.addEventListener("afterprint", cleanup, { once: true });
  window.print();
}

function fillStockAuditForm() {
  if (stockAuditPersonInput) stockAuditPersonInput.value = stockAudit.checkedBy || "";
  if (stockAuditDateInput) setDateInputValue(stockAuditDateInput, stockAudit.checkedAt || todayInputValue());
  renderStockAudit();
}

function saveStockAuditFromForm() {
  const checkedBy = titleCaseName(stockAuditPersonInput?.value || "");
  const checkedAt = isoDateForSave(stockAuditDateInput?.value) || todayInputValue();

  if (!checkedBy) {
    alert("Wpisz, kto sprawdził remanent.");
    stockAuditPersonInput?.focus();
    return;
  }

  persistStockAudit({
    checkedAt,
    checkedBy,
    checkedItems: stockAudit.checkedItems || [],
    items: stockAuditSnapshotItems()
  });
  fillStockAuditForm();
  renderStockView();
}

function isStockAuditItemChecked(recordId) {
  return new Set(stockAudit.checkedItems || []).has(String(recordId));
}

function toggleStockAuditItem(recordId) {
  if (!recordId) return;
  const checkedItems = new Set(stockAudit.checkedItems || []);
  const recordIdText = String(recordId);
  if (checkedItems.has(recordIdText)) {
    checkedItems.delete(recordIdText);
  } else {
    checkedItems.add(recordIdText);
  }

  const auditItems = stockAudit.items?.length ? [...stockAudit.items] : stockAuditSnapshotItems();
  if (!auditItems.some((item) => item.id === recordIdText)) {
    const stockRecord = records.find((record) => String(record.id) === recordIdText);
    if (stockRecord) auditItems.push(stockAuditSnapshotItems([stockRecord])[0]);
  }

  persistStockAudit({
    ...stockAudit,
    checkedItems: [...checkedItems],
    items: auditItems
  });
  renderStockView();
}

function clearStockAuditItems() {
  if (!stockAudit.checkedItems?.length && !stockAudit.items?.length) return;
  if (!confirm("Wyczyścić zaznaczenia remanentu?")) return;
  persistStockAudit({ ...stockAudit, checkedItems: [], items: [] });
  renderStockView();
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

  if (hasSharedServer) {
    try {
      const response = await fetch(DEMO_API_URL, { cache: "no-store" });
      if (!response.ok) throw new Error("Nie udało się pobrać aparatów demo.");
      const sharedRecords = await response.json();
      if (!Array.isArray(sharedRecords)) throw new Error("Aparaty demo mają niepoprawny format.");
      const normalizedRecords = normalizeDemoRecordsForUse(sharedRecords);
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(normalizedRecords));
      return normalizedRecords;
    } catch (error) {
      console.warn(error);
    }
  }

  return loadLocalDemoRecords();
}

function renderCachedRecordsBeforeSupabaseSync() {
  const cachedRecords = loadLocalRecords();
  const cachedRepairRecords = normalizeRepairRecordsForUse(loadLocalRepairRecords());
  const cachedDemoRecords = loadLocalDemoRecords();
  const hasCachedRecords = cachedRecords.length || cachedRepairRecords.length || cachedDemoRecords.length;
  if (!hasCachedRecords) return;

  records = cachedRecords;
  repairRecords = cachedRepairRecords;
  demoRecords = cachedDemoRecords;
  rebuildDerivedData();
  render();
  setConnectionStatus("syncing", "Odświeżam dane...");
}

async function refreshRecordsFromServer() {
  if (!hasSharedServer || document.hidden || recordDialog.open || repairDialog.open || demoDialog.open) return;

  try {
    const [deviceResponse, repairResponse, demoResponse] = await Promise.all([
      fetch(API_URL, { cache: "no-store" }),
      fetch(REPAIR_API_URL, { cache: "no-store" }),
      fetch(DEMO_API_URL, { cache: "no-store" })
    ]);
    if (!deviceResponse.ok) throw new Error("Nie udało się odświeżyć wspólnej bazy.");
    if (!repairResponse.ok) throw new Error("Nie udało się odświeżyć zeszytu napraw i wkładek.");
    if (!demoResponse.ok) throw new Error("Nie udało się odświeżyć aparatów demo.");

    const sharedRecords = await deviceResponse.json();
    const sharedRepairRecords = await repairResponse.json();
    const sharedDemoRecords = await demoResponse.json();
    if (!Array.isArray(sharedRecords)) throw new Error("Wspólna baza ma niepoprawny format.");
    if (!Array.isArray(sharedRepairRecords)) throw new Error("Zeszyt napraw i wkładek ma niepoprawny format.");
    if (!Array.isArray(sharedDemoRecords)) throw new Error("Aparaty demo mają niepoprawny format.");
    records = normalizeDeviceRecordsForUse(sharedRecords);
    repairRecords = normalizeRepairRecordsForUse(sharedRepairRecords);
    demoRecords = normalizeDemoRecordsForUse(sharedDemoRecords);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    localStorage.setItem(REPAIR_STORAGE_KEY, JSON.stringify(repairRecords));
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(demoRecords));
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

async function saveDemoRecords() {
  localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(demoRecords));
  if (hasSupabaseConfig) {
    await replaceSupabaseTable(SUPABASE_DEVICE_TABLE, demoRecords, { idPrefix: DEMO_ID_PREFIX, excludeIds: [DEMO_SEED_MARKER_ID] });
    return;
  }
  if (!hasSharedServer) return;

  const response = await fetch(DEMO_API_URL, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(demoRecords)
  });

  if (!response.ok) {
    throw new Error(`Nie udało się zapisać aparatów demo. Kod: ${response.status}`);
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
    return;
  }
  await saveDemoRecords();
}

async function persistDeletedDemoRecord(id) {
  localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(demoRecords));
  if (hasSupabaseConfig) {
    await deleteSupabaseRecord(SUPABASE_DEVICE_TABLE, id);
    return;
  }
  await saveDemoRecords();
}

function isoDateFromParts(year, month, day) {
  const numericYear = Number(year);
  const numericMonth = Number(month);
  const numericDay = Number(day);
  const date = new Date(numericYear, numericMonth - 1, numericDay);
  if (
    date.getFullYear() !== numericYear ||
    date.getMonth() !== numericMonth - 1 ||
    date.getDate() !== numericDay
  ) {
    return "";
  }
  return `${numericYear}-${String(numericMonth).padStart(2, "0")}-${String(numericDay).padStart(2, "0")}`;
}

function isoDateForSave(value) {
  const text = String(value ?? "").trim();
  if (!text) return "";

  const isoMatch = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T\s].*)?$/);
  if (isoMatch) return isoDateFromParts(isoMatch[1], isoMatch[2], isoMatch[3]);

  const displayMatch = text.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{2}|\d{4})(?:\s.*)?$/);
  if (displayMatch) {
    const year = displayMatch[3].length === 2 ? 2000 + Number(displayMatch[3]) : displayMatch[3];
    return isoDateFromParts(year, displayMatch[2], displayMatch[1]);
  }

  return "";
}

function parseIsoDate(value) {
  const isoDate = isoDateForSave(value);
  if (!isoDate) return null;
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function displayDateForInput(value) {
  const date = parseIsoDate(value);
  if (!date) return String(value ?? "").trim();
  return `${String(date.getDate()).padStart(2, "0")}.${String(date.getMonth() + 1).padStart(2, "0")}.${date.getFullYear()}`;
}

function normalizeFormDateFields(data, dateFields) {
  dateFields.forEach((field) => {
    data[field] = isoDateForSave(data[field]);
  });
  return data;
}

function setDateInputValue(selectorOrInput, value) {
  const input = typeof selectorOrInput === "string" ? document.querySelector(selectorOrInput) : selectorOrInput;
  if (input) {
    input.value = displayDateForInput(value);
    updateDateInputTodayState(input);
  }
}

function formatDate(value) {
  if (!value) return "";
  const date = parseIsoDate(value);
  if (!date) return String(value ?? "").trim();
  return dateFormatter.format(date);
}

function isTodayDate(value) {
  const isoDate = isoDateForSave(value);
  return Boolean(isoDate && isoDate === todayInputValue());
}

function createDateText(value) {
  const formattedDate = formatDate(value);
  if (!formattedDate) return "";

  const date = document.createElement("span");
  date.className = "date-text";
  if (isTodayDate(value)) date.classList.add("today-date");
  date.textContent = formattedDate;
  return date;
}

function fillTableCell(cell, value, emptyPlaceholder = "-") {
  if (value instanceof HTMLElement) {
    cell.append(value);
    return;
  }

  cell.textContent = value || emptyPlaceholder;
  if (!value) cell.classList.add("muted-cell");
}

function setLabeledDateContent(element, label, value, fallback = "") {
  if (!element) return;
  element.replaceChildren(label);
  element.append(createDateText(value) || fallback);
}

function updateDateInputTodayState(input) {
  if (!input) return;
  input.classList.toggle("today-date-input", isTodayDate(input.value));
}

function updateDateInputsTodayState(root = document) {
  root.querySelectorAll?.("input[data-date-picker]").forEach(updateDateInputTodayState);
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

function customerNameLookupKey(value) {
  return normalize(titleCaseName(value).replace(/\s+/gu, " ")).trim();
}

function normalizeSerialNumber(value) {
  return String(value ?? "").trim().toLocaleUpperCase("pl-PL");
}

function serialDuplicateKey(value) {
  const serial = normalizeSerialNumber(value);
  if (!serial) return "";

  const compact = serial.replace(/[\s-]+/gu, "");
  if (compact.startsWith("21") && compact.length > 2) return compact.slice(2);
  return compact;
}

function repairSerialNumbers(record) {
  const seen = new Set();
  return [record?.serialNumber, record?.serialNumber2]
    .map(normalizeSerialNumber)
    .filter((serial) => {
      const key = serialDuplicateKey(serial);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function normalizeSalesInvoice(value) {
  return String(value ?? "").trim().toLocaleUpperCase("pl-PL");
}

function normalizeSalesInvoiceInput(value) {
  return String(value ?? "").toLocaleUpperCase("pl-PL");
}

function normalizeDeviceName(value) {
  return String(value ?? "")
    .replace(/[-‐‑‒–—]+/gu, " - ")
    .replace(/\s+/gu, " ")
    .replace(/^\s*-\s*/u, "")
    .replace(/\s*-\s*$/u, "")
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
  return deviceNameCorrectionCandidates;
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

function compactQualityKey(value) {
  return normalize(value).replace(/[^\p{L}\p{N}]+/gu, "");
}

function compactSerialForLength(value) {
  return normalizeSerialNumber(value).replace(/[\s-]+/gu, "");
}

function serialLengthLabel(length) {
  if (length === 1) return "1 znak";
  if ([2, 3, 4].includes(length)) return `${length} znaki`;
  return `${length} znaków`;
}

function qualityDistanceLimit(length) {
  if (length >= 14) return 3;
  if (length >= 8) return 2;
  return 1;
}

function bestDisplayForm(displayForms) {
  return [...displayForms.entries()].sort((left, right) => right[1] - left[1] || collator.compare(left[0], right[0]))[0]?.[0] || "";
}

function buildTextQualityCandidates(values, normalizer, validator) {
  const candidates = new Map();

  values.forEach((value) => {
    const display = normalizer(value);
    if (!validator(display)) return;
    const key = compactQualityKey(display);
    if (key.length < 4) return;
    const entry = candidates.get(key) || { key, count: 0, displayForms: new Map(), length: key.length };
    entry.count += 1;
    entry.displayForms.set(display, (entry.displayForms.get(display) || 0) + 1);
    candidates.set(key, entry);
  });

  return [...candidates.values()]
    .map((candidate) => ({
      key: candidate.key,
      count: candidate.count,
      length: candidate.length,
      display: bestDisplayForm(candidate.displayForms)
    }))
    .sort((left, right) => right.count - left.count || collator.compare(left.display, right.display))
    .slice(0, MAX_QUALITY_HINT_CANDIDATES);
}

function isLikelyPersonSuggestion(value) {
  const name = titleCaseName(value).replace(/\s+/gu, " ").trim();
  if (name.length < 6 || name.length > 70) return false;
  if (!/\p{L}/u.test(name) || /\d/u.test(name)) return false;
  if (/https?:\/\//iu.test(name) || /\bwww\./iu.test(name) || /@/u.test(name)) return false;
  return name.split(/\s+/u).length >= 2;
}

function modelQualitySourceValues() {
  return [...records, ...demoRecords, ...repairRecords].map((record) => record.deviceName);
}

function personQualitySourceValues() {
  const values = [];
  records.forEach((record) => values.push(record.customerName));
  repairRecords.forEach((record) => values.push(record.customerName));
  demoRecords.forEach((record) => {
    values.push(record.currentUser);
    normalizeDemoLoanHistory(record.loanHistory).forEach((entry) => values.push(entry.currentUser));
  });
  return values;
}

function addSerialLengthProfile(profiles, key, label, serialNumber) {
  const serial = compactSerialForLength(serialNumber);
  if (key.length < 4 || serial.length < 3) return;
  const profile = profiles.get(key) || { key, label, count: 0, lengths: new Map() };
  profile.count += 1;
  profile.lengths.set(serial.length, (profile.lengths.get(serial.length) || 0) + 1);
  profiles.set(key, profile);
}

function serialProfileKeysForModel(deviceName) {
  const model = cleanModelSuggestion(deviceName);
  const modelKey = compactQualityKey(model);
  const firstToken = compactQualityKey(model.split(/\s+/u)[0] || "");
  return {
    exact: modelKey ? `model:${modelKey}` : "",
    family: firstToken ? `family:${firstToken}` : "",
    label: model
  };
}

function rebuildQualityHintCandidates() {
  const customerKeys = customerNameSuggestionKeys();
  modelQualityCandidates = buildTextQualityCandidates(
    modelQualitySourceValues(),
    cleanModelSuggestion,
    (value) => isLikelyModelSuggestion(value, customerKeys)
  );
  personQualityCandidates = buildTextQualityCandidates(personQualitySourceValues(), titleCaseName, isLikelyPersonSuggestion);

  const profiles = new Map();
  const addRecord = (record) => {
    const keys = serialProfileKeysForModel(record?.deviceName);
    [record?.serialNumber, record?.serialNumber2].forEach((serialNumber) => {
      if (keys.exact) addSerialLengthProfile(profiles, keys.exact, keys.label, serialNumber);
      if (keys.family) addSerialLengthProfile(profiles, keys.family, keys.label.split(/\s+/u)[0] || keys.label, serialNumber);
    });
  };

  records.forEach(addRecord);
  demoRecords.forEach(addRecord);
  repairRecords.forEach(addRecord);
  serialLengthProfiles = profiles;
}

function findTextQualitySuggestion(value, candidates, options = {}) {
  const enteredDisplay = options.normalizer ? options.normalizer(value) : String(value ?? "").trim();
  const enteredKey = compactQualityKey(enteredDisplay);
  if (enteredKey.length < (options.minLength || 5)) return null;
  if (candidates.some((candidate) => candidate.key === enteredKey)) return null;

  const limit = qualityDistanceLimit(enteredKey.length);
  const matches = candidates
    .map((candidate) => {
      const lengthGap = Math.abs(candidate.length - enteredKey.length);
      const distance = damerauLevenshtein(enteredKey, candidate.key);
      const sharesEdge =
        Math.min(candidate.length, enteredKey.length) >= (options.edgeMinLength || 6) &&
        (candidate.key.startsWith(enteredKey) || enteredKey.startsWith(candidate.key));
      const typoMatch = distance <= limit && lengthGap <= limit + 2;
      const lengthMatch = sharesEdge && lengthGap >= 2 && lengthGap <= (options.maxLengthGap || 8) && candidate.count >= (options.minPrefixCount || 2);
      if (!typoMatch && !lengthMatch) return null;
      return {
        ...candidate,
        distance,
        lengthGap,
        score: distance + lengthGap * 0.12 - Math.min(candidate.count, 12) * 0.03
      };
    })
    .filter(Boolean)
    .sort((left, right) => left.score - right.score || right.count - left.count || collator.compare(left.display, right.display));

  const best = matches[0];
  if (!best) return null;
  if (normalize(best.display).trim() === normalize(enteredDisplay).trim()) return null;
  return best;
}

function modelQualitySuggestion(value, currentId = "") {
  const normalizedValue = normalizeDeviceName(value);
  if (!normalizedValue) return null;

  const tokenCorrected = correctDeviceNameFromHistory(normalizedValue, currentId);
  if (tokenCorrected && tokenCorrected !== normalizedValue) {
    return {
      value: tokenCorrected,
      message: `Model wygląda podobnie do wcześniejszych wpisów. Sprawdź, czy chodzi o: ${tokenCorrected}.`
    };
  }

  const suggestion = findTextQualitySuggestion(normalizedValue, modelQualityCandidates, {
    normalizer: cleanModelSuggestion,
    minLength: 5,
    edgeMinLength: 5,
    maxLengthGap: 10,
    minPrefixCount: 2
  });
  if (!suggestion) return null;

  const lengthText = suggestion.lengthGap >= 3 ? " Długość nazwy różni się od podobnych wpisów." : "";
  return {
    value: suggestion.display,
    message: `Model jest podobny do wpisu z historii: ${suggestion.display}.${lengthText}`
  };
}

function personQualitySuggestion(value) {
  const normalizedValue = titleCaseName(value).replace(/\s+/gu, " ").trim();
  if (!normalizedValue) return null;
  const suggestion = findTextQualitySuggestion(normalizedValue, personQualityCandidates, {
    normalizer: titleCaseName,
    minLength: 7,
    edgeMinLength: 7,
    maxLengthGap: 8,
    minPrefixCount: 1
  });
  if (!suggestion) return null;

  return {
    value: suggestion.display,
    message: `Imię i nazwisko jest podobne do wcześniejszego wpisu: ${suggestion.display}.`
  };
}

function serialLengthProfileForModel(deviceName) {
  const keys = serialProfileKeysForModel(deviceName);
  const exact = keys.exact ? serialLengthProfiles.get(keys.exact) : null;
  if (exact && exact.count >= 3) return exact;
  const family = keys.family ? serialLengthProfiles.get(keys.family) : null;
  if (family && family.count >= 5) return family;
  return null;
}

function typicalSerialLengths(profile) {
  if (!profile || profile.count < 3) return [];
  const lengths = [...profile.lengths.entries()].sort((left, right) => right[1] - left[1] || left[0] - right[0]);
  const strongestCount = lengths[0]?.[1] || 0;
  if (strongestCount < 3 || strongestCount / profile.count < 0.42) return [];
  return lengths
    .filter(([, count]) => count >= Math.max(2, strongestCount * 0.55))
    .slice(0, 3)
    .map(([length]) => length)
    .sort((left, right) => left - right);
}

function serialQualitySuggestion(serialNumber, deviceName) {
  const serial = compactSerialForLength(serialNumber);
  if (serial.length < 4) return null;
  const profile = serialLengthProfileForModel(deviceName);
  const typicalLengths = typicalSerialLengths(profile);
  if (!typicalLengths.length || typicalLengths.includes(serial.length)) return null;

  const nearestGap = Math.min(...typicalLengths.map((length) => Math.abs(length - serial.length)));
  if (nearestGap < 2) return null;

  const typicalText = typicalLengths.map(serialLengthLabel).join(" lub ");
  return {
    message: `Numer seryjny ma ${serialLengthLabel(serial.length)}. Dla podobnych wpisów ${profile.label || "tego modelu"} najczęściej występuje ${typicalText}. Sprawdź, czy numer jest pełny.`
  };
}

function clearQualityHintInputs(form) {
  form?.querySelectorAll(".quality-suggestion-input").forEach((input) => input.classList.remove("quality-suggestion-input"));
}

function createQualityHintItem(hint, context) {
  const item = document.createElement("div");
  item.className = "quality-hint";
  const text = document.createElement("span");
  text.textContent = hint.message;
  item.append(text);

  if (hint.suggestion && hint.selector) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = `Użyj: ${hint.suggestion}`;
    button.addEventListener("click", () => {
      const input = document.querySelector(hint.selector);
      if (!input) return;
      input.value = hint.suggestion;
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
      renderQualityHints(context);
    });
    item.append(button);
  }

  return item;
}

function qualityHintConfig(context) {
  if (context === "devices") {
    return {
      form: recordForm,
      container: document.querySelector("#recordQualityHints"),
      currentId: document.querySelector("#recordId")?.value || "",
      fields: [
        { kind: "model", selector: "#deviceName", label: "Model aparatu" },
        { kind: "serial", selector: "#serialNumber", label: "Numer seryjny", modelSelector: "#deviceName" },
        { kind: "person", selector: "#customerName", label: "Imię i nazwisko" }
      ]
    };
  }

  if (context === "repairs") {
    return {
      form: repairForm,
      container: document.querySelector("#repairQualityHints"),
      currentId: document.querySelector("#repairId")?.value || "",
      fields: [
        { kind: "person", selector: "#repairCustomerName", label: "Imię i nazwisko" },
        { kind: "model", selector: "#repairDeviceName", label: "Aparat / wkładka" },
        { kind: "serial", selector: "#repairSerialNumber", label: "Numer seryjny 1", modelSelector: "#repairDeviceName" },
        { kind: "serial", selector: "#repairSerialNumber2", label: "Numer seryjny 2", modelSelector: "#repairDeviceName" }
      ]
    };
  }

  if (context === "demo") {
    return {
      form: demoForm,
      container: document.querySelector("#demoQualityHints"),
      currentId: document.querySelector("#demoId")?.value || "",
      fields: [
        { kind: "model", selector: "#demoDeviceName", label: "Nazwa aparatu" },
        { kind: "serial", selector: "#demoSerialNumber", label: "Numer seryjny", modelSelector: "#demoDeviceName" },
        { kind: "person", selector: "#demoCurrentUser", label: "Aktualnie używany" }
      ]
    };
  }

  return null;
}

function collectQualityHints(config) {
  const hints = [];
  config.fields.forEach((field) => {
    const input = document.querySelector(field.selector);
    if (!input) return;
    const value = String(input.value ?? "").trim();
    if (!value) return;

    let suggestion = null;
    if (field.kind === "model") suggestion = modelQualitySuggestion(value, config.currentId);
    if (field.kind === "person") suggestion = personQualitySuggestion(value);
    if (field.kind === "serial") {
      const modelValue = document.querySelector(field.modelSelector)?.value || "";
      suggestion = serialQualitySuggestion(value, modelValue);
    }
    if (!suggestion) return;

    input.classList.add("quality-suggestion-input");
    hints.push({
      selector: field.selector,
      suggestion: suggestion.value,
      message: `${field.label}: ${suggestion.message}`
    });
  });
  return hints;
}

function renderQualityHints(context) {
  const config = qualityHintConfig(context);
  if (!config?.container) return;
  clearQualityHintInputs(config.form);
  const hints = collectQualityHints(config).slice(0, 4);
  config.container.hidden = !hints.length;
  if (!hints.length) {
    config.container.replaceChildren();
    return;
  }

  const fragment = document.createDocumentFragment();
  hints.forEach((hint) => fragment.append(createQualityHintItem(hint, context)));
  config.container.replaceChildren(fragment);
}

function serialMatches(serialNumber, source, currentId) {
  const checkedSerial = serialDuplicateKey(serialNumber);
  if (!checkedSerial) return [];
  return (serialIndex.get(checkedSerial) || []).filter((match) => !(match.source === source && match.id === currentId));
}

function serviceSerialMatches(record, source) {
  if (source === "repairs") return [];
  return serialMatches(record.serialNumber, source, record.id)
    .filter((match) => match.source === "repairs")
    .sort(compareServiceSerialMatches);
}

function saleSerialMatchesForSerial(serialNumber, source, currentId) {
  if (source !== "repairs") return [];
  return serialMatches(serialNumber, source, currentId)
    .filter((match) => match.source === "devices" && match.isSold)
    .sort(compareSaleSerialMatches);
}

function duplicateSerialMatches(record, source) {
  if (source === "repairs") return [];
  return serialMatches(record.serialNumber, source, record.id).filter((match) => match.source !== "repairs");
}

function createDataControlDuplicateIndex() {
  const index = new Map();
  const addRecord = (record, source, notebook, label) => {
    const serial = serialDuplicateKey(record.serialNumber);
    if (!serial) return;
    if (!index.has(serial)) index.set(serial, []);
    index.get(serial).push({
      source,
      id: record.id,
      notebook,
      label
    });
  };

  records.forEach((record) => {
    addRecord(
      record,
      "devices",
      "Zeszyt aparatów",
      [record.deviceName, deviceDerived.get(record.id)?.displayType ?? displayType(record), record.customerName].filter(Boolean).join(" / ")
    );
  });

  demoRecords.forEach((record) => {
    addRecord(
      record,
      "demo",
      "Aparaty demo",
      [record.manufacturer, record.deviceName, demoDerived.get(record.id)?.status ?? demoStatus(record)].filter(Boolean).join(" / ")
    );
  });

  return index;
}

function dataControlDuplicateSerialMatches(record, source, duplicateIndex) {
  const checkedSerial = serialDuplicateKey(record.serialNumber);
  if (!checkedSerial) return [];
  const index = duplicateIndex || createDataControlDuplicateIndex();
  return (index.get(checkedSerial) || []).filter((match) => !(match.source === source && match.id === record.id));
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

function serviceSerialLastStage(match) {
  if (match.pickupDate) return { label: "Odbiór", date: match.pickupDate };
  if (match.returnDate) return { label: "Powrót", date: match.returnDate };
  if (match.sentDate) return { label: "Wysłane", date: match.sentDate };
  return null;
}

function serviceSerialSortValue(match) {
  return match.pickupDate || match.returnDate || match.sentDate || match.receivedDate || "";
}

function compareServiceSerialMatches(left, right) {
  return String(serviceSerialSortValue(right)).localeCompare(String(serviceSerialSortValue(left))) || collator.compare(left.label || "", right.label || "");
}

function serviceSerialHistoryLine(match) {
  const parts = [];
  if (match.receivedDate) parts.push(`Przyjęte: ${formatDate(match.receivedDate)}`);
  if (match.deviceName) parts.push(`Model: ${match.deviceName}`);

  const stage = serviceSerialLastStage(match);
  if (stage) parts.push(`${stage.label}: ${formatDate(stage.date)}`);

  return parts.length ? parts.join(" | ") : `${match.notebook}: ${match.label || "bez opisu"}`;
}

function serviceSerialTitle(matches) {
  if (!matches.length) return "";

  const matchList = matches
    .slice(0, 5)
    .map(serviceSerialHistoryLine)
    .join("\n");
  const extraCount = matches.length > 5 ? `\n+ ${matches.length - 5} więcej` : "";
  return `Historia serwisu:\n${matchList}${extraCount}`;
}

function saleSerialSortValue(match) {
  return match.pickupDate || match.receivedDate || "";
}

function compareSaleSerialMatches(left, right) {
  return String(saleSerialSortValue(right)).localeCompare(String(saleSerialSortValue(left))) || collator.compare(left.label || "", right.label || "");
}

function saleSerialHistoryLine(match) {
  const warrantyEnd = match.pickupDate ? addMonthsToIsoDate(match.pickupDate, REPAIR_WARRANTY_MONTHS) : "";
  return [
    `Miejsce: ${match.location || "brak"}`,
    `Sprzedaż: ${match.pickupDate ? formatDate(match.pickupDate) : "brak daty"}`,
    warrantyEnd ? `Gwarancja do: ${formatDate(warrantyEnd)}` : "Gwarancja: brak daty sprzedaży",
    `FV: ${match.salesInvoice || "brak"}`
  ].join(" | ");
}

function saleSerialTitle(matches) {
  if (!matches.length) return "";

  const matchList = matches
    .slice(0, 5)
    .map(saleSerialHistoryLine)
    .join("\n");
  const extraCount = matches.length > 5 ? `\n+ ${matches.length - 5} więcej` : "";
  return `Sprzedaż aparatu:\n${matchList}${extraCount}`;
}

function addMonthsToIsoDate(value, months) {
  const date = parseIsoDate(value);
  if (!date) return "";

  const originalDay = date.getDate();
  date.setMonth(date.getMonth() + months);
  if (date.getDate() !== originalDay) date.setDate(0);
  return isoDateFromParts(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

function repairWarrantyCheckEntries(record, currentId = "") {
  const checkDate = isoDateForSave(record?.receivedDate) || todayInputValue();
  return repairSerialNumbers(record).map((serialNumber) => {
    const saleMatches = saleSerialMatchesForSerial(serialNumber, "repairs", currentId);
    const saleMatch = saleMatches.find((match) => match.pickupDate) || saleMatches[0];
    const saleDate = saleMatch?.pickupDate || "";
    const warrantyEnd = saleDate ? addMonthsToIsoDate(saleDate, REPAIR_WARRANTY_MONTHS) : "";
    return {
      serialNumber,
      hasSaleMatch: Boolean(saleMatch),
      saleDate,
      warrantyEnd,
      checkDate,
      inWarranty: Boolean(saleDate && warrantyEnd && checkDate <= warrantyEnd)
    };
  });
}

function repairWarrantyEntryLabel(entry) {
  if (!entry.saleDate) return `${entry.serialNumber}: brak daty sprzedaży w Bazie`;
  return `${entry.serialNumber}: sprzedaż ${formatDate(entry.saleDate)}, gwarancja do ${formatDate(entry.warrantyEnd)}`;
}

function repairWarrantyWarning(record, currentId = "") {
  const category = normalizeRepairCategory(record?.category);
  if (category !== "NAPRAWA GWARANCYJNA" && category !== "NAPRAWA POGWARANCYJNA") return "";

  const entries = repairWarrantyCheckEntries(record, currentId);
  if (!entries.length) return "";

  const missingSaleDate = entries.filter((entry) => !entry.saleDate);
  const outOfWarranty = entries.filter((entry) => entry.saleDate && !entry.inWarranty);
  const inWarranty = entries.filter((entry) => entry.saleDate && entry.inWarranty);
  const checkedAt = formatDate(entries[0].checkDate);

  if (category === "NAPRAWA GWARANCYJNA" && outOfWarranty.length) {
    return `Wybrano naprawę gwarancyjną, ale wg Bazy gwarancja minęła (${REPAIR_WARRANTY_MONTHS} mies.). Data przyjęcia: ${checkedAt}. ${outOfWarranty.map(repairWarrantyEntryLabel).join(" | ")}`;
  }

  if (category === "NAPRAWA POGWARANCYJNA" && inWarranty.length) {
    return `Wybrano naprawę pogwarancyjną, ale wg Bazy aparat jest jeszcze w gwarancji. Data przyjęcia: ${checkedAt}. ${inWarranty.map(repairWarrantyEntryLabel).join(" | ")}`;
  }

  if (missingSaleDate.length) {
    return `Nie mogę potwierdzić gwarancji, bo brakuje daty sprzedaży w Bazie. ${missingSaleDate.map(repairWarrantyEntryLabel).join(" | ")}`;
  }

  return "";
}

function soldDeviceSaleDate(record) {
  const isSold = displayType(record) === "SPRZEDANY" || Boolean(String(record?.salesInvoice ?? "").trim());
  if (!isSold) return "";
  return isoDateForSave(record?.pickupDate);
}

function deviceWarrantyTooltip(record) {
  const saleDate = soldDeviceSaleDate(record);
  const isSold = displayType(record) === "SPRZEDANY" || Boolean(String(record?.salesInvoice ?? "").trim());
  if (!isSold) return "";
  if (!saleDate) return "Gwarancja: brak daty sprzedaży w Bazie";

  const warrantyEnd = addMonthsToIsoDate(saleDate, REPAIR_WARRANTY_MONTHS);
  const invoice = normalizeSalesInvoice(record?.salesInvoice);
  const location = String(record?.location || "").trim();

  return [
    `Sprzedaż: ${formatDate(saleDate)}`,
    warrantyEnd ? `Gwarancja do: ${formatDate(warrantyEnd)}` : "",
    invoice ? `FV: ${invoice}` : "",
    location ? `Miejsce: ${normalizeRepairLocation(location)}` : ""
  ].filter(Boolean).join("\n");
}

function deviceSerialWarrantyTitle(record) {
  const tooltip = deviceWarrantyTooltip(record);
  if (!tooltip) return "";
  return `Gwarancja aparatu (${REPAIR_WARRANTY_MONTHS} mies.):\n${tooltip}`;
}

function repairModelWarrantyTooltip(record) {
  const entries = repairWarrantyCheckEntries(record, record?.id).filter((entry) => entry.saleDate || entry.hasSaleMatch);
  if (!entries.length) return "";

  const lines = entries.map(repairWarrantyEntryLabel);
  return `Gwarancja wg Bazy (${REPAIR_WARRANTY_MONTHS} mies.):\n${lines.join("\n")}`;
}

function applyModelTooltip(element, tooltip, label) {
  if (!tooltip) return;
  element.classList.add("has-price");
  element.title = tooltip;
  element.dataset.priceTooltip = tooltip;
  element.setAttribute("aria-label", `${label}. ${tooltip.replace(/\n/gu, " ")}`);
}

function serialRelationTitle(duplicateMatches = [], serviceMatches = [], saleMatches = [], extraTitle = "") {
  return [extraTitle, duplicateSerialTitle(duplicateMatches), serviceSerialTitle(serviceMatches), saleSerialTitle(saleMatches)].filter(Boolean).join("\n\n");
}

function confirmSerialNumberSave(serialNumber, source, currentId) {
  const matches = serialMatches(serialNumber, source, currentId).filter((match) => match.source !== "repairs" && source !== "repairs");
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
  if (normalizedValue === "BEZ REFUNDACJI" || normalizedValue === "BEZ ZLECENIA") return "BEZ REFUNDACJI";
  return "";
}

function normalizeRepairCategory(category) {
  const normalizedCategory = String(category ?? "").trim().toLocaleUpperCase("pl-PL");
  if (normalizedCategory === "NAPRAWA") return "NAPRAWA GWARANCYJNA";
  if (normalizedCategory === "NAPRAWA GWARANCYJNA") return "NAPRAWA GWARANCYJNA";
  if (normalizedCategory === "NAPRAWA POGWARANCYJNA") return "NAPRAWA POGWARANCYJNA";
  if (normalizedCategory === "WKŁADKA USZNA") return "WKŁADKA USZNA";
  if (normalizedCategory === "WKŁADKA PRZECIWWODNA") return "WKŁADKA PRZECIWWODNA";
  if (normalizedCategory === "WKLADKA PRZECIWWODNA") return "WKŁADKA PRZECIWWODNA";
  if (normalizedCategory === "ZAMÓWIENIE" || normalizedCategory === "ZAMOWIENIE") return "ZAMÓWIENIE";
  return "WKŁADKA USZNA";
}

function normalizeRepairRecordForUse(record) {
  const normalizedRecord = { ...record };
  normalizedRecord.category = normalizeRepairCategory(normalizedRecord.category);
  normalizedRecord.location = normalizeRepairLocation(normalizedRecord.location);
  normalizedRecord.customerName = titleCaseName(normalizedRecord.customerName);
  normalizedRecord.serialNumber = normalizeSerialNumber(normalizedRecord.serialNumber);
  normalizedRecord.serialNumber2 = normalizeSerialNumber(normalizedRecord.serialNumber2);
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
  normalizedRecord.type = effectiveDeviceType(normalizedRecord, normalizedRecord.type || "NA STANIE");
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
  if (
    !normalizedRecord.manufacturerReturnedDate &&
    normalizeDemoStatus(normalizedRecord.status, normalizedRecord) === "ZWRÓCONO" &&
    normalizedRecord.manufacturerReturnDate &&
    !normalizedRecord.returnDate
  ) {
    normalizedRecord.manufacturerReturnedDate = normalizedRecord.manufacturerReturnDate;
  }
  normalizedRecord.manufacturerReturned = normalizeBooleanFlag(
    normalizedRecord.manufacturerReturned || normalizedRecord.manufacturerReturnedDate
  );
  normalizedRecord.status = normalizeDemoStatus(normalizedRecord.status, normalizedRecord);
  normalizedRecord.manufacturerReturnDateCleared = normalizeBooleanFlag(normalizedRecord.manufacturerReturnDateCleared);
  normalizedRecord.purpose = normalizeDemoPurpose(normalizedRecord.purpose);
  normalizedRecord.location = normalizeDemoLocation(normalizedRecord.location);
  normalizedRecord.loanHistory = normalizeDemoLoanHistory(normalizedRecord.loanHistory);
  normalizedRecord.currentAttachments = normalizeDemoAttachments(normalizedRecord.currentAttachments);
  normalizedRecord.sourceRow = String(normalizedRecord.sourceRow ?? "").trim();
  return normalizedRecord;
}

function normalizePricingRecordsForUse(recordsToNormalize) {
  if (!Array.isArray(recordsToNormalize)) return [];
  return recordsToNormalize
    .map(normalizePricingRecordForUse)
    .filter((record) => record.idProduct || record.tradeName || record.model || record.manufacturer);
}

function normalizePricingRecordForUse(record) {
  const repairedRecord = repairPricingRecordColumns(record);
  const normalizedRecord = {};
  pricingFields.forEach((field) => {
    normalizedRecord[field] = String(repairedRecord?.[field] ?? "").trim();
  });
  normalizedRecord.tradeName = normalizeAudibelTradeName(normalizedRecord);
  normalizedRecord.manufacturer = normalizePricingManufacturerName(normalizedRecord.manufacturer);
  normalizedRecord.grossPrice = normalizePricingPrice(repairedRecord?.grossPrice);
  return normalizedRecord;
}

function repairPricingRecordColumns(record) {
  const repairedRecord = { ...(record || {}) };
  const misplacedManufacturerValue = String(repairedRecord.manufacturer ?? "").trim();
  const misplacedManufacturerKey = normalize(misplacedManufacturerValue).trim();
  const looksLikeShiftedManufacturer =
    ["4 ghz", "sm-3p"].includes(misplacedManufacturerKey) &&
    String(repairedRecord.orderIndex ?? "").trim() &&
    normalize(repairedRecord.grossPrice) === "n" &&
    String(repairedRecord.swdCode ?? "").trim();

  if (looksLikeShiftedManufacturer) {
    repairedRecord.model = repairShiftedPricingModel(repairedRecord.model, misplacedManufacturerValue);
    repairedRecord.manufacturer = repairedRecord.orderIndex;
    repairedRecord.orderIndex = "N";
    repairedRecord.grossPrice = repairedRecord.swdCode;
    repairedRecord.swdCode = "";
  }

  return repairedRecord;
}

function repairShiftedPricingModel(model, shiftedValue) {
  const modelText = String(model ?? "").trim();
  const shiftedText = String(shiftedValue ?? "").trim();
  if (!modelText || !shiftedText) return modelText;
  if (normalize(modelText).includes(normalize(shiftedText).trim())) return modelText;
  if (normalize(shiftedText).trim() === "4 ghz" && /\b2$/u.test(modelText)) return `${modelText},4 GHz`;
  return `${modelText} ${shiftedText}`;
}

function normalizePricingManufacturerName(manufacturer) {
  return String(manufacturer || "")
    .replace(/\s+/gu, " ")
    .replace(/ZajLc/gu, "Zając")
    .trim();
}

function normalizeAudibelTradeName(record) {
  const tradeName = String(record.tradeName || "").trim();
  const model = String(record.model || "").trim();

  if (tradeName.startsWith("AUDIBEL ")) {
    return `Audibel ${tradeName.slice("AUDIBEL ".length)}`;
  }

  if (tradeName.startsWith("Signature Series") && model.startsWith("Audibel Signature Series")) {
    return `Audibel ${tradeName}`;
  }

  return tradeName;
}

function normalizePricingPrice(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const text = String(value ?? "")
    .replace(/\s/g, "")
    .replace(/zł|pln/gi, "")
    .replace(",", ".")
    .trim();
  if (!text) return "";
  const number = Number(text);
  return Number.isFinite(number) ? number : "";
}

function formatPricingAmount(value, groupSeparator = "\u00a0") {
  const number = normalizePricingPrice(value);
  if (number === "") return "";
  const decimals = Number.isInteger(number) ? 0 : 2;
  const sign = number < 0 ? "-" : "";
  const [integerPart, fractionPart] = Math.abs(number).toFixed(decimals).split(".");
  const groupedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, groupSeparator);
  return `${sign}${groupedInteger}${fractionPart ? `,${fractionPart}` : ""}`;
}

function formatPricingPrice(value) {
  const amount = formatPricingAmount(value);
  return amount ? `${amount} zł` : "";
}

function createPricingPriceElement(value) {
  const number = normalizePricingPrice(value);
  const wrap = document.createElement("span");
  wrap.className = "price-amount";
  if (number === "") {
    wrap.textContent = "-";
    return wrap;
  }

  const amount = formatPricingAmount(number, " ");
  const groups = amount.split(/[\s\u00a0\u202f]+/u).filter(Boolean);
  if (groups.length > 1) {
    groups.slice(0, -1).forEach((group, index) => {
      const thousands = document.createElement("span");
      thousands.className = "price-thousand-group";
      thousands.textContent = group;
      const separator = document.createElement("span");
      separator.className = "price-group-separator";
      separator.setAttribute("aria-hidden", "true");
      separator.textContent = "\u00a0";
      wrap.append(thousands, separator);
      if (index < groups.length - 2) separator.classList.add("price-group-separator-inner");
    });
    const rest = document.createElement("span");
    rest.className = "price-rest-group";
    rest.textContent = groups[groups.length - 1];
    wrap.append(rest);
  } else {
    wrap.textContent = amount;
  }
  wrap.append(document.createTextNode(" zł"));
  return wrap;
}

function resetPricingPriceLookup() {
  pricingPriceIndex = null;
  pricingPriceMemo = new Map();
  pricingManufacturerToneMap = null;
}

function pricingLookupText(value) {
  return normalizeDeviceName(value)
    .toLocaleLowerCase("pl-PL")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/gu, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}

function addPricingLookupVariant(variants, value) {
  const baseKey = pricingLookupText(value);
  if (!baseKey) return;

  const keys = new Set([baseKey]);
  const withoutGeneric = baseKey.replace(/^aparat sluchowy\s+(zauszny|wewnatrzuszny)?\s*/u, "").trim();
  if (withoutGeneric) keys.add(withoutGeneric);

  [...keys].forEach((key) => {
    const tokens = key.split(" ").filter(Boolean);
    if (tokens.length >= 3) variants.add(tokens.slice(1).join(" "));
    variants.add(key);
  });
}

function pricingLookupVariants(record) {
  const variants = new Set();
  addPricingLookupVariant(variants, record?.model);
  addPricingLookupVariant(variants, record?.tradeName);
  return [...variants].filter((key) => key.length >= 4);
}

function addPricingPriceIndexEntry(entriesByKey, key, record) {
  const price = normalizePricingPrice(record?.grossPrice);
  if (!key || price === "") return;

  const info = entriesByKey.get(key) || {
    prices: new Map(),
    sampleName: String(record?.tradeName || record?.model || "").trim(),
    sampleModel: String(record?.model || "").trim(),
    sampleTradeName: String(record?.tradeName || "").trim(),
    recordsCount: 0
  };
  if (!info.sampleModel && record?.model) info.sampleModel = String(record.model).trim();
  if (!info.sampleTradeName && record?.tradeName) info.sampleTradeName = String(record.tradeName).trim();
  info.prices.set(price, (info.prices.get(price) || 0) + 1);
  info.recordsCount += 1;
  entriesByKey.set(key, info);
}

function buildPricingPriceIndex() {
  const entriesByKey = new Map();
  pricingRecords.forEach((record) => {
    pricingLookupVariants(record).forEach((key) => addPricingPriceIndexEntry(entriesByKey, key, record));
  });

  const entries = [...entriesByKey.entries()]
    .map(([key, info]) => ({ key, info, tokens: key.split(" ").filter(Boolean) }))
    .sort((left, right) => right.key.length - left.key.length || right.tokens.length - left.tokens.length);

  return { entriesByKey, entries };
}

function getPricingPriceIndex() {
  if (!pricingPriceIndex) pricingPriceIndex = buildPricingPriceIndex();
  return pricingPriceIndex;
}

function summarizePricingPriceInfo(info) {
  const prices = [...info.prices.keys()].sort((left, right) => left - right);
  if (!prices.length) return null;

  const firstPrice = prices[0];
  const lastPrice = prices[prices.length - 1];
  const priceText = firstPrice === lastPrice
    ? formatPricingPrice(firstPrice)
    : `${formatPricingPrice(firstPrice)} - ${formatPricingPrice(lastPrice)}`;
  const details = [`Cena aparatu: ${priceText}`];

  if (info.sampleModel) details.push(`Model: ${info.sampleModel}`);
  if (info.sampleTradeName && info.sampleTradeName !== info.sampleModel) details.push(`Nazwa: ${info.sampleTradeName}`);
  if (!info.sampleTradeName && info.sampleName && info.sampleName !== info.sampleModel) details.push(`Nazwa: ${info.sampleName}`);

  return {
    priceText,
    tooltip: details.join("\n")
  };
}

function findLoosePricingPriceInfo(deviceKey, entries) {
  const deviceTokens = new Set(deviceKey.split(" ").filter(Boolean));
  let bestMatch = null;

  entries.forEach((entry) => {
    if (entry.key.length < 7 || entry.tokens.length < 2) return;

    const entryInDevice = deviceKey.includes(entry.key);
    const deviceInEntry = deviceKey.length >= 7 && entry.key.includes(deviceKey);
    if (!entryInDevice && !deviceInEntry) return;

    const commonTokens = entry.tokens.filter((token) => deviceTokens.has(token)).length;
    const tokenCoverage = commonTokens / Math.max(1, Math.min(entry.tokens.length, deviceTokens.size));
    if (tokenCoverage < 0.75) return;

    const score = (entryInDevice ? 200 : 100) + commonTokens * 12 + Math.min(entry.key.length, deviceKey.length);
    if (!bestMatch || score > bestMatch.score) bestMatch = { score, info: entry.info };
  });

  return bestMatch?.info || null;
}

function pricingPriceInfoForDeviceName(deviceName) {
  const deviceKey = pricingLookupText(deviceName);
  if (!deviceKey) return null;
  if (pricingPriceMemo.has(deviceKey)) return pricingPriceMemo.get(deviceKey);

  const index = getPricingPriceIndex();
  const exactInfo = index.entriesByKey.get(deviceKey);
  const info = exactInfo || findLoosePricingPriceInfo(deviceKey, index.entries);
  const result = info ? summarizePricingPriceInfo(info) : null;
  pricingPriceMemo.set(deviceKey, result);
  return result;
}

function buildPricingManufacturerToneMap() {
  const manufacturerValues = [...new Set(
    pricingRecords
      .map((record) => normalize(record.manufacturer).trim())
      .filter(Boolean)
  )].sort((left, right) => collator.compare(left, right));

  return new Map(manufacturerValues.map((manufacturer, index) => [
    manufacturer,
    PRICING_MANUFACTURER_TONES[index % PRICING_MANUFACTURER_TONES.length]
  ]));
}

function pricingManufacturerTone(manufacturer) {
  if (!pricingManufacturerToneMap) pricingManufacturerToneMap = buildPricingManufacturerToneMap();
  const key = normalize(manufacturer).trim();
  return pricingManufacturerToneMap.get(key) || PRICING_MANUFACTURER_TONES[0];
}

function pricingSeedRecords() {
  return normalizePricingRecordsForUse(window.PRICING_SEED_RECORDS || PRICING_EMBEDDED_RECORDS || []);
}

function defaultPricingMeta() {
  return {
    updatedMonth: PRICING_UPDATED_MONTH,
    updatedYear: PRICING_UPDATED_YEAR
  };
}

function normalizePricingMeta(meta) {
  const fallback = defaultPricingMeta();
  const updatedMonth = Number(meta?.updatedMonth);
  const updatedYear = Number(meta?.updatedYear);
  return {
    updatedMonth: updatedMonth >= 1 && updatedMonth <= 12 ? updatedMonth : fallback.updatedMonth,
    updatedYear: updatedYear >= 2000 && updatedYear <= 2100 ? updatedYear : fallback.updatedYear
  };
}

function loadPricingMeta() {
  try {
    return normalizePricingMeta(JSON.parse(localStorage.getItem(PRICING_META_STORAGE_KEY) || "null"));
  } catch (error) {
    console.warn(error);
    localStorage.removeItem(PRICING_META_STORAGE_KEY);
    return defaultPricingMeta();
  }
}

function savePricingMeta(meta = pricingMeta) {
  pricingMeta = normalizePricingMeta(meta);
  localStorage.setItem(PRICING_META_STORAGE_KEY, JSON.stringify(pricingMeta));
}

function currentPricingMeta() {
  pricingMeta = normalizePricingMeta(pricingMeta);
  return pricingMeta;
}

function markPricingUpdatedNow() {
  const now = new Date();
  savePricingMeta({
    updatedMonth: now.getMonth() + 1,
    updatedYear: now.getFullYear()
  });
}

function resetPricingMetaToSeed() {
  savePricingMeta(defaultPricingMeta());
}

function loadPricingRecords() {
  PRICING_LEGACY_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));

  try {
    const storedRecords = JSON.parse(localStorage.getItem(PRICING_STORAGE_KEY) || "null");
    if (Array.isArray(storedRecords) && storedRecords.length) {
      const normalizedStoredRecords = normalizePricingRecordsForUse(storedRecords);
      if (normalizedStoredRecords.length) return normalizedStoredRecords;
      localStorage.removeItem(PRICING_STORAGE_KEY);
    }
  } catch (error) {
    console.warn(error);
    localStorage.removeItem(PRICING_STORAGE_KEY);
  }
  return pricingSeedRecords();
}

function savePricingRecords() {
  resetPricingPriceLookup();
  pricingManufacturerToneMap = null;
  localStorage.setItem(PRICING_STORAGE_KEY, JSON.stringify(pricingRecords));
}

function ensurePricingRecordsLoaded() {
  if (pricingRecords.length) return;
  const seedRecords = pricingSeedRecords();
  if (!seedRecords.length) return;
  pricingRecords = seedRecords;
  savePricingRecords();
}

function pricingMetaRecordForSupabase() {
  return {
    id: PRICING_META_ROW_ID,
    kind: "pricing-meta",
    ...currentPricingMeta()
  };
}

function pricingSupabaseRecordId(record, index) {
  const rawKey = record.idProduct || pricingRecordKey(record) || `row-${index + 1}`;
  const slug = String(rawKey)
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-|-$/gu, "")
    .slice(0, 90);
  return `pricing-${slug || index + 1}`;
}

function pricingRecordsForSupabase(recordsToSave) {
  const seenIds = new Map();
  return normalizePricingRecordsForUse(recordsToSave).map((record, index) => {
    const baseId = pricingSupabaseRecordId(record, index);
    const seen = seenIds.get(baseId) || 0;
    seenIds.set(baseId, seen + 1);
    return {
      ...record,
      id: seen ? `${baseId}-${seen + 1}` : baseId
    };
  });
}

function splitSupabasePricingRows(rows) {
  const metaRow = rows.find((row) => row.id === PRICING_META_ROW_ID);
  if (metaRow) savePricingMeta(metaRow);
  return normalizePricingRecordsForUse(rows.filter((row) => row.id !== PRICING_META_ROW_ID));
}

async function loadSupabasePricingRecords() {
  if (!hasSupabaseConfig || !currentSupabaseUser || pricingSupabaseAvailable === false) return null;

  try {
    const rows = await loadSupabaseTable(SUPABASE_PRICING_TABLE, (loadedRows) => loadedRows);
    pricingSupabaseAvailable = true;
    const sharedPricingRecords = splitSupabasePricingRows(rows);
    if (!sharedPricingRecords.length) return null;
    localStorage.setItem(PRICING_STORAGE_KEY, JSON.stringify(sharedPricingRecords));
    return sharedPricingRecords;
  } catch (error) {
    console.warn(error);
    if (isMissingSupabaseTableError(error)) pricingSupabaseAvailable = false;
    return null;
  }
}

async function persistPricingRecords() {
  savePricingRecords();
  if (!hasSupabaseConfig || !currentSupabaseUser || pricingSupabaseAvailable === false) return;
  if (!canManagePricing()) throw new Error("Tylko konto satis@pracowniasluchu.pl może aktualizować cennik.");

  try {
    await replaceSupabaseTable(SUPABASE_PRICING_TABLE, [
      ...pricingRecordsForSupabase(pricingRecords),
      pricingMetaRecordForSupabase()
    ]);
    pricingSupabaseAvailable = true;
  } catch (error) {
    if (isMissingSupabaseTableError(error)) {
      pricingSupabaseAvailable = false;
      console.warn(error);
      return;
    }
    throw error;
  }
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
  if (record.manufacturerReturnedDate) return { date: record.manufacturerReturnedDate, source: "manufacturerReturned" };
  if (normalizeBooleanFlag(record.manufacturerReturned) === "1") return { date: "", source: "manufacturerReturned" };
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
  if (["manufacturerReturned", "returned"].includes(source)) return "";
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
  if (record.manufacturerReturnedDate || normalizeBooleanFlag(record.manufacturerReturned) === "1") return "ZWRÓCONO";
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
  if (record.manufacturerReturnedDate) return "ZWRÓCONO";
  if (status === "ZWRÓCONO") {
    if (record.returnDate) return "ZWRÓCONO";
    return demoStatusFromCurrentUser(record.currentUser);
  }
  const deadline = demoReturnDeadlineInfo(record);
  const returnDays = daysUntilDate(deadline.date);
  if (deadline.source === "loan" && demoReturnLevel(returnDays, deadline.source)) return "DO ZWROTU";
  return status;
}

function isActiveDemoLoan(record, status = demoStatus(record)) {
  const currentUser = titleCaseName(record?.currentUser);
  if (!currentUser || isoDateForSave(record?.returnDate)) return false;
  if (record?.manufacturerReturnedDate || normalizeBooleanFlag(record?.manufacturerReturned) === "1") return false;
  return status === "WYPOŻYCZONY" || status === "DO ZWROTU";
}

function addActiveDemoLoanCustomerIndexEntry(record, status) {
  if (!isActiveDemoLoan(record, status)) return;
  const customerKey = customerNameLookupKey(record.currentUser);
  if (!customerKey) return;
  const deadline = demoReturnDeadlineInfo(record);
  if (!activeDemoLoanCustomerIndex.has(customerKey)) activeDemoLoanCustomerIndex.set(customerKey, []);
  activeDemoLoanCustomerIndex.get(customerKey).push({
    id: record.id,
    currentUser: titleCaseName(record.currentUser),
    deviceName: normalizeLoanHistoryText(record.deviceName),
    serialNumber: normalizeSerialNumber(record.serialNumber),
    location: normalizeDemoLocation(record.location),
    loanDate: isoDateForSave(record.loanDate),
    returnDeadline: deadline.source === "loan" ? deadline.date : "",
    status
  });
}

function demoQualityIssues(record, serialCounts = null) {
  const issues = [];
  if (!record.receivedDate) issues.push("brak daty");
  if (!record.manufacturer) issues.push("brak producenta");
  if (!record.deviceName) issues.push("brak nazwy aparatu");
  if (!record.serialNumber) issues.push("brak numeru seryjnego");
  if (record.serialNumber && serialCounts?.get(serialDuplicateKey(record.serialNumber)) > 1) issues.push("powtórzony numer seryjny");
  if (/[?]{2,}/.test(`${record.location} ${record.currentUser} ${record.notes}`)) issues.push("niepewna informacja");
  if (/^\d{5}$/.test(record.location)) issues.push("miejsce zapisane jako liczba");
  return issues;
}

function displayType(record) {
  return effectiveDeviceType(record, record?.type || "NA STANIE");
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

function effectiveDeviceType(data, fallbackType = "NA STANIE") {
  return shouldAutoSetDeviceType(data)
    ? suggestedDeviceType(data, fallbackType)
    : normalizeDeviceType(fallbackType);
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
  const documentNumberIssues = repairDocumentNumberIssueMap(repairRecords);

  repairRecords.forEach((record) => {
    const category = normalizeRepairCategory(record.category);
    const status = effectiveRepairStatus(record);
    const location = normalizeRepairLocation(record.location);
    const closed = status === "ODEBRANE";
    const issues = documentNumberIssues.get(record.id) || [];
    const documentInfo = repairDocumentInfo(record);

    if (category.startsWith("NAPRAWA")) repairStats.repairs += 1;
    if (category.startsWith("WKŁADKA")) repairStats.inserts += 1;
    if (!closed) repairStats.open += 1;

    repairDerived.set(record.id, {
      category,
      status,
      location,
      closed,
      documentInfo,
      documentNumberIssues: issues,
      searchBlob: [
        ...repairFields.map((field) => record[field]),
        category,
        status,
        documentInfo.number,
        documentInfo.label,
        ...issues.flatMap((issue) => [issue.title, issue.detail])
      ].map(normalize).join("\n")
    });
  });
}

function rebuildDemoDerivedData() {
  demoDerived.clear();
  activeDemoLoanCustomerIndex.clear();
  demoStats = { all: demoRecords.length, stock: 0, loaned: 0, returnDue: 0 };
  const serialCounts = new Map();

  demoRecords.forEach((record) => {
    const serial = serialDuplicateKey(record.serialNumber);
    if (!serial) return;
    serialCounts.set(serial, (serialCounts.get(serial) || 0) + 1);
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
    addActiveDemoLoanCustomerIndexEntry(record, status);

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

function addCustomerDocumentIndexEntry(customerKey, entry) {
  if (!customerKey) return;
  if (!customerDocumentIndex.has(customerKey)) customerDocumentIndex.set(customerKey, []);
  customerDocumentIndex.get(customerKey).push(entry);
}

function rebuildCustomerDocumentIndex() {
  customerNameCounts.clear();
  customerDocumentIndex.clear();

  records.forEach((record) => {
    const customerKey = customerNameLookupKey(record.customerName);
    if (!customerKey) return;
    customerNameCounts.set(customerKey, (customerNameCounts.get(customerKey) || 0) + 1);
  });

  normalizePricingOfferHistory(pricingOfferHistory).forEach((entry) => {
    const customerKey = customerNameLookupKey(entry.customer);
    const itemsLabel = offerHistoryItemsLabel(entry);
    addCustomerDocumentIndexEntry(customerKey, {
      kind: "Oferta",
      date: entry.offerDate,
      itemsLabel,
      patient: entry.patient,
      linePrefix: `Oferta: ${formatDate(entry.offerDate) || "brak daty"}`
    });
  });

  normalizePricingLoanHistory(pricingLoanHistory).forEach((entry) => {
    const customerKey = customerNameLookupKey(entry.customer);
    const period = [formatDate(entry.periodFrom), formatDate(entry.periodTo)].filter(Boolean).join(" - ");
    addCustomerDocumentIndexEntry(customerKey, {
      kind: "Umowa",
      date: entry.periodFrom || entry.date,
      contractDate: entry.date,
      number: entry.number,
      period,
      serials: loanHistorySerials(entry),
      itemsLabel: loanHistoryItemsLabel(entry),
      linePrefix: `Umowa: ${formatDate(entry.date) || "brak daty"}`
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

function modelSuggestionSourceRecords() {
  return [...records, ...demoRecords];
}

function customerNameSuggestionKeys() {
  const keys = new Set();
  [...records, ...repairRecords].forEach((record) => {
    const name = normalizeDeviceName(record.customerName).toLocaleLowerCase("pl-PL");
    if (name) keys.add(name);
  });
  return keys;
}

function cleanModelSuggestion(value) {
  return normalizeDeviceName(value).replace(/\s{2,}/gu, " ").trim();
}

function isLikelyModelSuggestion(value, customerKeys = customerNameSuggestionKeys()) {
  const name = cleanModelSuggestion(value);
  if (name.length < 2 || name.length > 90) return false;
  const normalizedName = name.toLocaleLowerCase("pl-PL");
  if (customerKeys.has(normalizedName)) return false;
  if (/https?:\/\//iu.test(name) || /\bwww\./iu.test(name) || /@/u.test(name)) return false;
  if (/\.(pl|com|eu|net|org)\b/iu.test(name)) return false;
  if (/\b(ul|ulica|al|aleja|os|osiedle|tel|telefon|mail|email|nip|regon)\b/iu.test(normalizedName)) return false;
  if (/^\d+([/\s-]\d+)*$/u.test(name)) return false;
  return true;
}

function rankedModelSuggestions(sourceRecords) {
  const customerKeys = customerNameSuggestionKeys();
  const suggestions = new Map();

  sourceRecords.forEach((record) => {
    const name = cleanModelSuggestion(record.deviceName);
    if (!isLikelyModelSuggestion(name, customerKeys)) return;

    const key = name.toLocaleUpperCase("pl-PL");
    const suggestion = suggestions.get(key) || { count: 0, displayForms: new Map() };
    suggestion.count += 1;
    suggestion.displayForms.set(name, (suggestion.displayForms.get(name) || 0) + 1);
    suggestions.set(key, suggestion);
  });

  return [...suggestions.values()]
    .map((suggestion) => ({
      count: suggestion.count,
      name: [...suggestion.displayForms.entries()].sort((left, right) => right[1] - left[1] || collator.compare(left[0], right[0]))[0][0]
    }))
    .sort((left, right) => right.count - left.count || collator.compare(left.name, right.name))
    .slice(0, MAX_MODEL_NAME_SUGGESTIONS)
    .map((suggestion) => suggestion.name);
}

function rebuildDeviceNameCorrectionCandidates() {
  const candidates = new Map();
  const customerKeys = customerNameSuggestionKeys();

  records.forEach((record) => {
    const name = cleanModelSuggestion(record.deviceName);
    if (!isLikelyModelSuggestion(name, customerKeys)) return;
    const displayToken = name.split(" ")[0];
    const token = displayToken.toLocaleUpperCase("pl-PL");
    if (!/^\p{L}{4,}$/u.test(token)) return;
    const candidate = candidates.get(token) || { token, count: 0, displayForms: new Map() };
    candidate.count += 1;
    candidate.displayForms.set(displayToken, (candidate.displayForms.get(displayToken) || 0) + 1);
    candidates.set(token, candidate);
  });

  deviceNameCorrectionCandidates = [...candidates.values()]
    .filter((candidate) => candidate.count >= 3)
    .map((candidate) => ({
      token: candidate.token,
      count: candidate.count,
      displayToken: [...candidate.displayForms.entries()]
        .sort((left, right) => right[1] - left[1] || collator.compare(left[0], right[0]))[0][0]
    }));
}

function rebuildDemoFormSuggestions() {
  if (!demoManufacturerSuggestions || !demoDeviceNameSuggestions) return;

  const manufacturers = [...new Set(demoRecords.map((record) => String(record.manufacturer ?? "").trim()).filter(Boolean))].sort((left, right) =>
    collator.compare(left, right)
  );
  const models = rankedModelSuggestions(modelSuggestionSourceRecords());

  const manufacturerFragment = document.createDocumentFragment();
  manufacturers.forEach((manufacturer) => {
    const option = document.createElement("option");
    option.value = manufacturer;
    manufacturerFragment.append(option);
  });
  demoManufacturerSuggestions.replaceChildren(manufacturerFragment);

  const modelFragment = document.createDocumentFragment();
  models.forEach((model) => {
    const option = document.createElement("option");
    option.value = model;
    modelFragment.append(option);
  });
  demoDeviceNameSuggestions.replaceChildren(modelFragment);
}

function rebuildSerialIndex() {
  serialIndex.clear();

  records.forEach((record) => {
    const serial = serialDuplicateKey(record.serialNumber);
    if (!serial) return;
    if (!serialIndex.has(serial)) serialIndex.set(serial, []);
    serialIndex.get(serial).push({
      source: "devices",
      id: record.id,
      notebook: "Zeszyt aparatów",
      receivedDate: record.receivedDate,
      pickupDate: record.pickupDate,
      deviceName: record.deviceName,
      customerName: record.customerName,
      salesInvoice: record.salesInvoice,
      location: record.location,
      isSold: displayType(record) === "SPRZEDANY" || Boolean(String(record.salesInvoice ?? "").trim()),
      label: [record.deviceName, deviceDerived.get(record.id)?.displayType ?? displayType(record), record.customerName].filter(Boolean).join(" / ")
    });
  });

  repairRecords.forEach((record) => {
    repairSerialNumbers(record).forEach((serialNumber) => {
      const serial = serialDuplicateKey(serialNumber);
      if (!serial) return;
      if (!serialIndex.has(serial)) serialIndex.set(serial, []);
      serialIndex.get(serial).push({
        source: "repairs",
        id: record.id,
        notebook: "Zeszyt napraw i wkładek",
        serialNumber,
        receivedDate: record.receivedDate,
        sentDate: record.sentDate,
        returnDate: record.returnDate,
        pickupDate: record.pickupDate,
        deviceName: record.deviceName,
        customerName: record.customerName,
        label: [record.customerName, record.deviceName, repairDerived.get(record.id)?.status ?? effectiveRepairStatus(record)].filter(Boolean).join(" / ")
      });
    });
  });

  demoRecords.forEach((record) => {
    const serial = serialDuplicateKey(record.serialNumber);
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
  const names = rankedModelSuggestions(modelSuggestionSourceRecords());
  rebuildDeviceNameCorrectionCandidates();

  const fragment = document.createDocumentFragment();
  names.forEach((name) => {
    const option = document.createElement("option");
    option.value = name;
    fragment.append(option);
  });

  deviceNameSuggestions.replaceChildren(fragment);
}

function rebuildCustomerNameSuggestions() {
  const uniqueNames = new Map();
  const addName = (value) => {
    const name = titleCaseName(normalizeLoanHistoryText(value));
    const key = customerNameLookupKey(name);
    if (!key || !isLikelyPersonSuggestion(name) || uniqueNames.has(key)) return;
    uniqueNames.set(key, name);
  };

  records.forEach((record) => addName(record.customerName));
  repairRecords.forEach((record) => addName(record.customerName));
  demoRecords.forEach((record) => {
    addName(record.currentUser);
    normalizeDemoLoanHistory(record.loanHistory).forEach((entry) => addName(entry.currentUser));
  });
  normalizePricingOfferHistory(pricingOfferHistory).forEach((entry) => addName(entry.customer));
  normalizePricingLoanHistory(pricingLoanHistory).forEach((entry) => addName(entry.customer));
  normalizePricingOrderHistory(pricingOrderHistory).forEach((entry) => addName(entry.customer));
  normalizePricingComplaintHistory(pricingComplaintHistory).forEach((entry) => addName(entry.customer));
  normalizePricingPcprList(pricingPcprList).forEach((entry) => addName(entry.customer));

  const fragment = document.createDocumentFragment();
  [...uniqueNames.values()]
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
  invalidateDataControlCache();
  rebuildDeviceDerivedData();
  rebuildRepairDerivedData();
  rebuildDemoDerivedData();
  rebuildDemoManufacturerFilter();
  rebuildDemoFormSuggestions();
  rebuildSerialIndex();
  rebuildCustomerDocumentIndex();
  rebuildDeviceNameSuggestions();
  rebuildCustomerNameSuggestions();
  rebuildQualityHintCandidates();
}

function rebuildAfterDeviceChange() {
  invalidateDataControlCache();
  rebuildDeviceDerivedData();
  rebuildSerialIndex();
  rebuildCustomerDocumentIndex();
  rebuildDeviceNameSuggestions();
  rebuildCustomerNameSuggestions();
  rebuildQualityHintCandidates();
}

function rebuildAfterRepairChange() {
  invalidateDataControlCache();
  rebuildRepairDerivedData();
  rebuildSerialIndex();
  rebuildCustomerDocumentIndex();
  rebuildDeviceNameSuggestions();
  rebuildCustomerNameSuggestions();
  rebuildQualityHintCandidates();
}

function rebuildAfterDemoChange() {
  invalidateDataControlCache();
  rebuildDemoDerivedData();
  rebuildDemoManufacturerFilter();
  rebuildDemoFormSuggestions();
  rebuildSerialIndex();
  rebuildCustomerDocumentIndex();
  rebuildDeviceNameSuggestions();
  rebuildCustomerNameSuggestions();
  rebuildQualityHintCandidates();
}

function invalidateDataControlCache() {
  dataControlIssuesCache = null;
  dataControlRenderToken += 1;
  dataControlBuildScheduled = false;
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
  const selectedLocation = locationFilter.value;

  return records
    .filter((record) => {
      const meta = deviceDerived.get(record.id);
      const matchesType = !selectedType || meta?.displayType === selectedType;
      const matchesLocation = !selectedLocation || (meta?.location ?? normalizeRepairLocation(record.location)) === selectedLocation;
      const ezwm = normalizeEzwmStatus(record.ezwm);
      const matchesEzwm = !selectedEzwm || (selectedEzwm === "BRAK" ? !ezwm : ezwm === selectedEzwm);
      const age = meta?.age ?? null;
      const matchesFifo =
        !selectedFifo ||
        (!meta?.fifoExcluded && selectedFifo === "fifo") ||
        (!meta?.fifoExcluded && selectedFifo === "90" && age !== null && age >= 90) ||
        (!meta?.fifoExcluded && selectedFifo === "180" && age !== null && age >= 180);
      const matchesQuery = !query || meta?.searchBlob.includes(query);
      return matchesType && matchesLocation && matchesEzwm && matchesFifo && matchesQuery;
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
  updateDeviceTypeSelectStyles();
  updateDocumentLocationAccents();
  scheduleDemoReturnReminder();

  if (activeNotebook === "repairs") {
    updateStats();
    renderRepairRecords();
    return;
  }

  if (activeNotebook === "pricing" || activeNotebook === "agreements") {
    renderPricingRecords();
    return;
  }

  if (activeDeviceView === "dataControl") {
    renderDataControlView();
    return;
  }

  updateStats();

  if (activeDeviceView === "demo") {
    renderDemoRecords();
    return;
  }

  if (activeDeviceView === "stock") {
    renderStockView();
    return;
  }

  renderDeviceViews();
}

function renderDeviceViews() {
  updatePrivatePaymentVisibility();
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

function updatePricingNfzFilterOptions() {
  if (!pricingNfzFilter) return;
  const selectedValue = pricingNfzFilter.value;
  const codes = [...new Set(pricingRecords.map((record) => record.nfzCode).filter(Boolean))]
    .sort((left, right) => collator.compare(left, right));
  const currentOptions = [...pricingNfzFilter.options].slice(1).map((option) => option.value).join("|");
  if (currentOptions === codes.join("|")) return;

  pricingNfzFilter.replaceChildren(new Option("Wszystkie", ""));
  codes.forEach((code) => pricingNfzFilter.append(new Option(code, code)));
  pricingNfzFilter.value = codes.includes(selectedValue) ? selectedValue : "";
}

function applyDefaultPricingNfzFilter({ force = false } = {}) {
  if (!pricingNfzFilter) return;
  const hasDefaultCode = [...pricingNfzFilter.options].some((option) => option.value === DEFAULT_PRICING_NFZ_CODE);
  if (!hasDefaultCode) return;
  if (force || (!pricingNfzDefaultApplied && !pricingNfzFilter.value)) {
    pricingNfzFilter.value = DEFAULT_PRICING_NFZ_CODE;
  }
  pricingNfzDefaultApplied = true;
}

function updatePricingManufacturerFilterOptions() {
  if (!pricingManufacturerFilter) return;
  const selectedValue = pricingManufacturerFilter.value;
  const manufacturersByValue = new Map();
  pricingRecords.forEach((record) => {
    const manufacturer = String(record.manufacturer ?? "").trim();
    const value = normalize(manufacturer).trim();
    if (manufacturer && !manufacturersByValue.has(value)) manufacturersByValue.set(value, manufacturer);
  });
  const manufacturers = [...manufacturersByValue.entries()].sort((left, right) => collator.compare(left[1], right[1]));
  const currentOptions = [...pricingManufacturerFilter.options].slice(1).map((option) => option.value).join("|");
  const manufacturerValues = manufacturers.map(([value]) => value);
  if (currentOptions === manufacturerValues.join("|")) return;

  pricingManufacturerFilter.replaceChildren(new Option("Wszyscy", ""));
  manufacturers.forEach(([value, manufacturer]) => {
    pricingManufacturerFilter.append(new Option(manufacturer, value));
  });
  pricingManufacturerFilter.value = manufacturerValues.includes(selectedValue) ? selectedValue : "";
}

function filteredPricingRecords() {
  const query = normalize(pricingSearchInput?.value || "").trim();
  const selectedNfzCode = pricingNfzFilter?.value || "";
  const selectedManufacturer = pricingManufacturerFilter?.value || "";
  return pricingRecords.filter((record) => {
    if (selectedNfzCode && record.nfzCode !== selectedNfzCode) return false;
    if (selectedManufacturer && normalize(record.manufacturer).trim() !== selectedManufacturer) return false;
    return !query || pricingSearchBlob(record).includes(query);
  });
}

function pricingSearchBlob(record) {
  return pricingFields
    .map((field) => (field === "grossPrice" ? formatPricingPrice(record[field]) : record[field]))
    .map(normalize)
    .join("\n");
}

function renderPricingRecords() {
  ensurePricingRecordsLoaded();
  updatePricingNfzFilterOptions();
  applyDefaultPricingNfzFilter();
  updatePricingManufacturerFilterOptions();
  renderPricingOfferDeviceList();
  renderPricingOffer();
  renderPricingLoan();
  renderPricingPcprList();
  renderPricingOrder();
  renderPricingComplaint();
  renderPricingDocumentHistory();
  const visibleRecords = filteredPricingRecords();
  renderTableRows(pricingRecordsBody, visibleRecords.map(createPricingRow));
  pricingEmptyState.hidden = visibleRecords.length > 0;
  if (pricingSummary) {
    pricingSummary.textContent = pricingRecords.length
      ? `Wczytano ${pricingRecords.length} pozycji cennika. Widoczne: ${visibleRecords.length}.`
      : "Brak danych cennika. Odśwież stronę po wgraniu najnowszego app.js.";
  }
  if (pricingVersion) {
    pricingVersion.textContent = pricingUpdatedLabel();
    pricingVersion.dateTime = pricingUpdatedDateTime();
  }
  updateStats();
}

function addDaysToIsoDate(value, days) {
  const date = parseIsoDate(value);
  if (!date) return "";
  date.setDate(date.getDate() + days);
  return isoDateFromParts(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

function pricingOfferDeviceLabel(record) {
  return [
    record.model || record.tradeName,
    record.manufacturer,
    formatPricingPrice(record.grossPrice),
    record.idProduct
  ].filter(Boolean).join(" | ");
}

function normalizePricingNfzCode(value) {
  return String(value ?? "").trim().replace(/\s+/g, "").toLocaleUpperCase("pl-PL");
}

function pricingOfferAgeValue() {
  const value = Number.parseInt(String(offerAgeInput?.value ?? "").trim(), 10);
  return Number.isFinite(value) && value >= 0 ? value : null;
}

function formatOfferAge(age) {
  if (age === null) return "";
  if (age === 1) return "1 rok";
  const lastDigit = age % 10;
  const lastTwoDigits = age % 100;
  return lastDigit >= 2 && lastDigit <= 4 && !(lastTwoDigits >= 12 && lastTwoDigits <= 14)
    ? `${age} lata`
    : `${age} lat`;
}

function pricingOfferNfzSuffixForAge() {
  const age = pricingOfferAgeValue();
  if (age === null) return "";
  return age <= 26 ? "01" : "00";
}

function pricingOfferNfzCodeMatchesAge(record) {
  const suffix = pricingOfferNfzSuffixForAge();
  if (!suffix) return true;
  const code = normalizePricingNfzCode(record?.nfzCode);
  return code.endsWith(`.${suffix}`) || (!code.includes(".") && code.endsWith(suffix));
}

function pricingOfferPricedRecords() {
  return pricingRecords.filter((record) => normalizePricingPrice(record.grossPrice) !== "");
}

function pricingOfferSuggestedRecords() {
  return pricingOfferPricedRecords().filter(pricingOfferNfzCodeMatchesAge);
}

function pricingOfferDeviceName(record) {
  return record?.model || record?.tradeName || "aparat";
}

function pricingOfferNfzAmount(record) {
  const code = normalizePricingNfzCode(record?.nfzCode);
  const codeWithPrefix = code && !code.startsWith("P.") ? `P.${code}` : code;
  return Object.prototype.hasOwnProperty.call(PRICING_OFFER_NFZ_BY_CODE, codeWithPrefix)
    ? PRICING_OFFER_NFZ_BY_CODE[codeWithPrefix]
    : PRICING_OFFER_NFZ_PER_DEVICE;
}

function pricingOfferNfzDescription(items) {
  return items
    .map((record) => {
      const code = normalizePricingNfzCode(record?.nfzCode);
      const codeLabel = code ? ` (${code})` : "";
      return `${pricingOfferDeviceName(record)}${codeLabel} - ${formatPricingPrice(pricingOfferNfzAmount(record))}`;
    })
    .join("; ");
}

function pricingOfferRecordSearchText(record) {
  return normalize([
    pricingOfferDeviceLabel(record),
    record.tradeName,
    record.model,
    record.manufacturer,
    record.idProduct,
    record.nfzCode
  ].join(" "));
}

function renderPricingOfferDeviceList() {
  if (!pricingOfferDeviceList) return;
  const fragment = document.createDocumentFragment();
  if (pricingOfferAgeValue() === null) {
    pricingOfferDeviceList.replaceChildren(fragment);
    return;
  }
  pricingOfferSuggestedRecords()
    .slice()
    .sort((left, right) => collator.compare(left.model || left.tradeName, right.model || right.tradeName))
    .forEach((record) => {
      const option = document.createElement("option");
      option.value = pricingOfferDeviceLabel(record);
      option.label = [record.tradeName, record.nfzCode].filter(Boolean).join(" | ");
      fragment.append(option);
    });
  pricingOfferDeviceList.replaceChildren(fragment);
}

function findPricingOfferRecordInCandidates(value, candidates) {
  const text = String(value ?? "").trim();
  if (!text) return null;
  const query = normalize(text);
  return (
    candidates.find((record) => normalize(pricingOfferDeviceLabel(record)) === query) ||
    candidates.find((record) => normalize(record.idProduct) === query) ||
    candidates.find((record) => normalize(record.model) === query || normalize(record.tradeName) === query) ||
    candidates.find((record) => pricingOfferRecordSearchText(record).startsWith(query)) ||
    candidates.find((record) => pricingOfferRecordSearchText(record).includes(query)) ||
    null
  );
}

function findPricingOfferRecord(value) {
  const suggestedRecord = findPricingOfferRecordInCandidates(value, pricingOfferSuggestedRecords());
  return suggestedRecord || findPricingOfferRecordInCandidates(value, pricingOfferPricedRecords());
}

function selectedPricingOfferItems() {
  return [offerDeviceInput1, offerDeviceInput2]
    .map((input, index) => ({
      input,
      slot: index + 1,
      record: findPricingOfferRecord(input?.value)
    }))
    .filter((item) => item.record);
}

function removePricingOfferItem(item) {
  if (!item?.input) return;
  item.input.value = "";
  renderPricingOffer();
}

function selectedPricingOfferRecords() {
  return selectedPricingOfferItems()
    .map((item) => item.record)
    .filter(Boolean);
}

function setPricingOfferInput(input, record) {
  if (!input || !record) return;
  input.value = pricingOfferDeviceLabel(record);
}

function movePricingOfferDevice(fromInput, toInput, sourceLabel) {
  if (pricingOfferAgeValue() === null) {
    offerAgeInput?.focus();
    return;
  }
  if (!fromInput?.value.trim()) {
    alert(`Najpierw wybierz aparat ${sourceLabel}.`);
    return;
  }
  if (!toInput) return;
  toInput.value = fromInput.value;
  fromInput.value = "";
  renderPricingOffer();
}

function duplicatePricingOfferDevice() {
  if (pricingOfferAgeValue() === null) {
    offerAgeInput?.focus();
    return;
  }
  const source = offerDeviceInput1?.value.trim() ? offerDeviceInput1 : offerDeviceInput2;
  const target = source === offerDeviceInput1 ? offerDeviceInput2 : offerDeviceInput1;
  if (!source?.value.trim() || !target) {
    alert("Najpierw wybierz aparat P albo L.");
    return;
  }
  target.value = source.value;
  renderPricingOffer();
}

function addPricingRecordToOffer(record) {
  if (!record) return;
  if (!offerDeviceInput1 || !offerDeviceInput2) return;
  if (pricingOfferAgeValue() === null) {
    alert("Najpierw podaj wiek, aby wybrać aparat do oferty.");
    offerAgeInput?.focus();
    return;
  }

  if (!offerDeviceInput1.value.trim()) {
    setPricingOfferInput(offerDeviceInput1, record);
  } else if (!offerDeviceInput2.value.trim()) {
    setPricingOfferInput(offerDeviceInput2, record);
  } else if (confirm("Oferta ma już dwa aparaty. Podmienić drugi aparat?")) {
    setPricingOfferInput(offerDeviceInput2, record);
  } else {
    return;
  }

  if (activeNotebook !== "agreements") switchNotebook("agreements");
  switchPricingView("offer");
  renderPricingOffer();
  pricingOfferView?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function pricingOfferPfronAmount(maxAmount) {
  const amount = normalizePricingPrice(offerPfronInput?.value);
  if (amount === "") return 0;
  return Math.max(0, Math.min(amount, maxAmount));
}

function appendOfferCell(row, value, className = "") {
  const cell = document.createElement("td");
  cell.textContent = value || "-";
  if (className) cell.className = className;
  row.append(cell);
  return cell;
}

function appendOfferPriceCell(row, value, className = "amount-cell") {
  const cell = document.createElement("td");
  if (className) cell.className = className;
  cell.append(createPricingPriceElement(value));
  row.append(cell);
  return cell;
}

function renderPricingOfferItems(items) {
  if (!offerItemsBody) return;
  const rows = items.map((item, index) => {
    const record = item.record;
    const row = document.createElement("tr");
    if (!pricingOfferNfzCodeMatchesAge(record)) {
      row.classList.add("offer-age-mismatch");
      row.title = "Kod NFZ tej pozycji nie pasuje do wpisanego wieku.";
    }
    appendOfferCell(row, String(index + 1));

    const nameCell = document.createElement("td");
    const model = document.createElement("strong");
    model.textContent = record.model || record.tradeName || "Aparat";
    nameCell.append(model);
    row.append(nameCell);

    appendOfferCell(row, record.nfzCode);
    appendOfferPriceCell(row, record.grossPrice);

    const removeCell = document.createElement("td");
    removeCell.className = "offer-action-column";
    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "offer-remove-item-btn";
    removeButton.textContent = "Usuń";
    removeButton.title = `Usuń aparat ${item.slot} z oferty`;
    removeButton.addEventListener("click", () => removePricingOfferItem(item));
    removeCell.append(removeButton);
    row.append(removeCell);
    return row;
  });
  offerItemsBody.replaceChildren(...rows);
}

function renderPricingOfferAgeWarning(items) {
  if (!offerAgeWarning) return;
  const suffix = pricingOfferNfzSuffixForAge();
  const age = pricingOfferAgeValue();
  if (age === null) {
    offerAgeWarning.textContent = "Podaj wiek przed wyborem aparatu. Na tej podstawie wybierany jest właściwy kod NFZ.";
    offerAgeWarning.hidden = false;
    return;
  }
  if (!suffix || !items.length) {
    offerAgeWarning.hidden = true;
    offerAgeWarning.textContent = "";
    return;
  }

  const mismatches = items
    .map((item) => item.record)
    .filter((record) => !pricingOfferNfzCodeMatchesAge(record));

  if (!mismatches.length) {
    offerAgeWarning.hidden = true;
    offerAgeWarning.textContent = "";
    return;
  }

  const names = mismatches
    .map((record) => `${pricingOfferDeviceName(record)} (${normalizePricingNfzCode(record.nfzCode) || "brak kodu NFZ"})`)
    .join(", ");
  offerAgeWarning.textContent = `Wiek ${formatOfferAge(age)}: kod NFZ powinien kończyć się na .${suffix}. Sprawdź: ${names}.`;
  offerAgeWarning.hidden = false;
}

function renderPricingOfferPayments(items, totals) {
  if (!offerPaymentsBody) return;
  const itemsLabel = items.map((record) => record.model || record.tradeName || "aparat").join(", ");
  const customer = titleCaseName(offerCustomerInput?.value || "");
  const nfzDescription = totals.withoutNfz
    ? `Zakup bez refundacji NFZ: ${itemsLabel}`
    : `Dofinansowanie NFZ: ${pricingOfferNfzDescription(items)}`;
  const rows = [
    {
      payer: "NFZ",
      description: nfzDescription,
      amount: totals.nfz
    }
  ];

  if (totals.pfronEnabled) {
    rows.push({
      payer: "PFRON",
      description: `Dofinansowanie PFRON: ${itemsLabel}`,
      amount: totals.pfron
    });
  }

  rows.push({
    payer: customer ? `Pacjent - ${customer}` : "Pacjent",
    description: `Pozostała kwota za: ${itemsLabel}`,
    amount: totals.patient
  });

  offerPaymentsBody.replaceChildren(...rows.map((entry) => {
    const row = document.createElement("tr");
    appendOfferCell(row, entry.payer, "payer-cell");
    appendOfferCell(row, entry.description);
    appendOfferPriceCell(row, entry.amount);
    return row;
  }));
}

function ensurePricingOfferDate() {
  if (!offerDateInput) return todayInputValue();
  const currentDate = isoDateForSave(offerDateInput.value);
  if (currentDate) return currentDate;
  const today = todayInputValue();
  setDateInputValue(offerDateInput, today);
  return today;
}

function ensurePricingOfferLocation() {
  if (!offerLocationInput) return DEFAULT_DOCUMENT_LOCATION;
  const location = normalizeDocumentLocationValue(offerLocationInput.value);
  if (!location) {
    offerLocationInput.value = suggestedDocumentLocation();
    return normalizeDocumentLocationValue(offerLocationInput.value);
  }
  if (offerLocationInput.value !== location) offerLocationInput.value = location;
  return location;
}

function renderPricingOffer() {
  if (!pricingOfferView) return;
  const offerDate = ensurePricingOfferDate();
  const offerLocation = ensurePricingOfferLocation();
  updateDocumentLocationAccent(offerLocationInput);
  const validUntil = addDaysToIsoDate(offerDate, PRICING_OFFER_VALID_DAYS);
  const customer = titleCaseName(offerCustomerInput?.value || "");
  const age = pricingOfferAgeValue();
  const ageRequired = age === null;
  [offerDeviceInput1, offerDeviceInput2].forEach((input) => {
    if (input) input.disabled = ageRequired;
  });
  const hasOfferDevice = Boolean(offerDeviceInput1?.value.trim() || offerDeviceInput2?.value.trim());
  [offerDuplicateFirstBtn, offerMoveRightToLeftBtn, offerMoveLeftToRightBtn].forEach((button) => {
    if (button) button.disabled = ageRequired || !hasOfferDevice;
  });
  if (savePricingOfferBtn) savePricingOfferBtn.disabled = ageRequired || !hasOfferDevice;
  const customerAgeLabel = age === null ? "" : `, ${formatOfferAge(age)}`;
  const offerItems = selectedPricingOfferItems();
  const items = offerItems.map((item) => item.record);
  const total = items.reduce((sum, record) => sum + Number(normalizePricingPrice(record.grossPrice) || 0), 0);
  const withoutNfz = Boolean(offerNoNfzInput?.checked);
  const nfzLimit = items.reduce((sum, record) => sum + pricingOfferNfzAmount(record), 0);
  const nfz = withoutNfz ? 0 : Math.min(total, nfzLimit);
  const pfronEnabled = Boolean(offerPfronEnabledInput?.checked);
  if (offerPfronInput) offerPfronInput.disabled = !pfronEnabled;
  const pfron = pfronEnabled ? pricingOfferPfronAmount(Math.max(total - nfz, 0)) : 0;
  const patient = Math.max(total - nfz - pfron, 0);

  if (pfronEnabled && offerPfronInput && offerPfronInput.value && pfron !== normalizePricingPrice(offerPfronInput.value)) {
    offerPfronInput.title = "PFRON nie może przekroczyć kwoty po odliczeniu NFZ.";
  } else if (offerPfronInput) {
    offerPfronInput.title = "";
  }

  if (offerTitle) offerTitle.textContent = customer ? `Oferta dla ${customer}${customerAgeLabel}` : "Oferta aparatów słuchowych";
  if (offerMeta) {
    offerMeta.textContent = `Data oferty: ${formatDate(offerDate)} | Miejsce: ${offerLocation} | Ważna do: ${formatDate(validUntil)} | Okres obowiązywania: ${PRICING_OFFER_VALID_DAYS} dni`;
  }

  const hasItems = items.length > 0;
  if (offerEmptyState) offerEmptyState.hidden = hasItems;
  if (offerContent) offerContent.hidden = !hasItems;
  if (printPricingOfferBtn) printPricingOfferBtn.disabled = !hasItems;
  if (!hasItems) {
    if (offerItemsBody) offerItemsBody.replaceChildren();
    if (offerPaymentsBody) offerPaymentsBody.replaceChildren();
    renderPricingOfferAgeWarning([]);
    if (offerPatientTotal) offerPatientTotal.replaceChildren(createPricingPriceElement(0));
    return;
  }

  renderPricingOfferItems(offerItems);
  renderPricingOfferAgeWarning(offerItems);
  renderPricingOfferPayments(items, { total, nfz, pfron, patient, withoutNfz, pfronEnabled });
  if (offerPatientTotal) offerPatientTotal.replaceChildren(createPricingPriceElement(patient));
}

async function updatePricingRecordPrice(record) {
  if (!record || !canManagePricing()) return;
  const oldLabel = pricingOfferDeviceLabel(record);
  const previousPrice = record.grossPrice;
  const previousPricingMeta = pricingMeta;
  const currentPrice = normalizePricingPrice(record.grossPrice);
  const value = prompt("Nowa cena brutto:", currentPrice === "" ? "" : formatPricingPrice(currentPrice));
  if (value === null) return;

  const newPrice = normalizePricingPrice(value);
  if (newPrice === "" || newPrice < 0) {
    alert("Podaj poprawną cenę brutto.");
    return;
  }

  record.grossPrice = newPrice;
  const newLabel = pricingOfferDeviceLabel(record);
  [offerDeviceInput1, offerDeviceInput2].forEach((input) => {
    if (input && normalize(input.value) === normalize(oldLabel)) input.value = newLabel;
  });

  try {
    markPricingUpdatedNow();
    await persistPricingRecords();
    renderPricingRecords();
    setCurrentYearTitle();
  } catch (error) {
    record.grossPrice = previousPrice;
    pricingMeta = previousPricingMeta;
    [offerDeviceInput1, offerDeviceInput2].forEach((input) => {
      if (input && normalize(input.value) === normalize(newLabel)) input.value = oldLabel;
    });
    savePricingMeta();
    savePricingRecords();
    renderPricingRecords();
    alert(`Nie udało się zapisać ceny: ${error.message}`);
  }
}

async function deletePricingRecord(record) {
  if (!record || !canManagePricing()) return;

  const recordLabel = pricingOfferDeviceLabel(record);
  if (!confirm(`Usunąć pozycję z cennika: ${recordLabel}?`)) return;

  const previousPricingRecords = pricingRecords.slice();
  const previousPricingMeta = pricingMeta;
  const previousOfferValues = [offerDeviceInput1?.value || "", offerDeviceInput2?.value || ""];
  const recordIndex = pricingRecords.findIndex((item) => pricingRecordKey(item) === pricingRecordKey(record));
  if (recordIndex < 0) return;

  const [removedRecord] = pricingRecords.splice(recordIndex, 1);
  const removedLabel = pricingOfferDeviceLabel(removedRecord);
  [offerDeviceInput1, offerDeviceInput2].forEach((input) => {
    if (input && normalize(input.value) === normalize(removedLabel)) input.value = "";
  });

  try {
    markPricingUpdatedNow();
    await persistPricingRecords();
    renderPricingRecords();
    setCurrentYearTitle();
  } catch (error) {
    pricingRecords = previousPricingRecords;
    pricingMeta = previousPricingMeta;
    if (offerDeviceInput1) offerDeviceInput1.value = previousOfferValues[0];
    if (offerDeviceInput2) offerDeviceInput2.value = previousOfferValues[1];
    savePricingMeta();
    savePricingRecords();
    renderPricingRecords();
    alert(`Nie udało się usunąć pozycji: ${error.message}`);
  }
}

function switchPricingView(viewName) {
  activePricingView = ["list", "offer", "loan", "pcpr", "order", "complaint", "history"].includes(viewName) ? viewName : "list";
  if (activePricingView !== "list") lastAgreementPricingView = activePricingView;
  pricingViewButtons.forEach((button) => {
    const isActive = button.dataset.pricingView === activePricingView;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });
  if (pricingListView) pricingListView.hidden = activePricingView !== "list";
  if (pricingOfferView) pricingOfferView.hidden = activePricingView !== "offer";
  if (pricingLoanView) pricingLoanView.hidden = activePricingView !== "loan";
  if (pricingPcprView) pricingPcprView.hidden = activePricingView !== "pcpr";
  if (pricingOrderView) pricingOrderView.hidden = activePricingView !== "order";
  if (pricingComplaintView) pricingComplaintView.hidden = activePricingView !== "complaint";
  if (pricingHistoryView) pricingHistoryView.hidden = activePricingView !== "history";
  if (activePricingView === "offer") renderPricingOffer();
  if (activePricingView === "loan") renderPricingLoan();
  if (activePricingView === "pcpr") renderPricingPcprList();
  if (activePricingView === "order") renderPricingOrder();
  if (activePricingView === "complaint") renderPricingComplaint();
  if (activePricingView === "history") renderPricingDocumentHistory();
}

function printPricingOffer() {
  if (printPricingOfferBtn?.disabled) return;
  saveCurrentPricingOfferToHistory({ silent: true });
  const cleanup = () => document.body.classList.remove("pricing-offer-print");
  document.body.classList.add("pricing-offer-print");
  window.addEventListener("afterprint", cleanup, { once: true });
  window.print();
}

function normalizePricingOfferHistoryItem(item) {
  if (!item || typeof item !== "object") return null;
  const record = item.record && typeof item.record === "object" ? item.record : {};
  const normalizedItem = {
    model: normalizeLoanHistoryText(item.model || record.model || record.tradeName),
    tradeName: normalizeLoanHistoryText(item.tradeName || record.tradeName),
    manufacturer: normalizeLoanHistoryText(item.manufacturer || record.manufacturer),
    nfzCode: normalizeLoanHistoryText(item.nfzCode || record.nfzCode),
    grossPrice: normalizeLoanHistoryText(item.grossPrice ?? record.grossPrice)
  };
  return normalizedItem.model || normalizedItem.tradeName || normalizedItem.manufacturer || normalizedItem.grossPrice
    ? normalizedItem
    : null;
}

function pricingOfferHistoryEntryHasContent(entry) {
  return Boolean(normalizeLoanHistoryText(entry?.customer) || (Array.isArray(entry?.items) && entry.items.length));
}

function normalizePricingOfferHistoryEntry(entry) {
  if (!entry || typeof entry !== "object") return null;
  const offerDate = isoDateForSave(entry.offerDate || entry.date) || normalizeLoanHistoryText(entry.offerDate || entry.date);
  const items = (Array.isArray(entry.items) ? entry.items : [])
    .map(normalizePricingOfferHistoryItem)
    .filter(Boolean);
  const normalizedEntry = {
    id: normalizeLoanHistoryText(entry.id || makeId()),
    createdAt: normalizeLoanHistoryText(entry.createdAt || entry.savedAt || new Date().toISOString()),
    savedAt: normalizeLoanHistoryText(entry.savedAt || entry.updatedAt || entry.createdAt || new Date().toISOString()),
    savedBy: normalizeLoanHistoryText(entry.savedBy || entry.userEmail),
    workstation: normalizeLoanHistoryText(entry.workstation),
    customer: titleCaseName(entry.customer || ""),
    age: normalizeLoanHistoryText(entry.age),
    location: normalizeDocumentLocationValue(entry.location),
    offerDate,
    validUntil: isoDateForSave(entry.validUntil) || normalizeLoanHistoryText(entry.validUntil),
    withoutNfz: Boolean(entry.withoutNfz),
    pfronEnabled: Boolean(entry.pfronEnabled),
    total: normalizeLoanHistoryText(entry.total),
    nfz: normalizeLoanHistoryText(entry.nfz),
    pfron: normalizeLoanHistoryText(entry.pfron),
    patient: normalizeLoanHistoryText(entry.patient),
    items
  };
  return pricingOfferHistoryEntryHasContent(normalizedEntry) ? normalizedEntry : null;
}

function normalizePricingOfferHistory(entries) {
  if (!Array.isArray(entries)) return [];
  const normalizedEntries = [];
  const seenIds = new Set();
  entries.forEach((entry) => {
    const normalizedEntry = normalizePricingOfferHistoryEntry(entry);
    if (!normalizedEntry || seenIds.has(normalizedEntry.id)) return;
    seenIds.add(normalizedEntry.id);
    normalizedEntries.push(normalizedEntry);
  });
  return normalizedEntries
    .sort((left, right) => String(right.offerDate || right.savedAt).localeCompare(String(left.offerDate || left.savedAt)))
    .slice(0, MAX_PRICING_OFFER_HISTORY);
}

function loadPricingOfferHistory() {
  try {
    return normalizePricingOfferHistory(JSON.parse(localStorage.getItem(PRICING_OFFER_HISTORY_STORAGE_KEY) || "[]"));
  } catch (error) {
    console.warn(error);
    localStorage.removeItem(PRICING_OFFER_HISTORY_STORAGE_KEY);
    return [];
  }
}

function saveLocalPricingOfferHistory() {
  pricingOfferHistory = normalizePricingOfferHistory(pricingOfferHistory);
  localStorage.setItem(PRICING_OFFER_HISTORY_STORAGE_KEY, JSON.stringify(pricingOfferHistory));
}

function mergePricingOfferHistory(...historySets) {
  return normalizePricingOfferHistory(historySets.flat());
}

async function loadSupabasePricingOfferHistory() {
  if (!hasSupabaseConfig || !currentSupabaseUser || pricingOfferHistorySupabaseAvailable === false) return null;

  try {
    const sharedHistory = await loadSupabaseTable(SUPABASE_OFFER_HISTORY_TABLE, normalizePricingOfferHistory);
    pricingOfferHistorySupabaseAvailable = true;
    pricingOfferHistory = mergePricingOfferHistory(sharedHistory, pricingOfferHistory);
    saveLocalPricingOfferHistory();
    rebuildCustomerDocumentIndex();
    rebuildCustomerNameSuggestions();
    return pricingOfferHistory;
  } catch (error) {
    console.warn("Historia ofert działa lokalnie, bez tabeli Supabase:", error?.message || error);
    if (isMissingSupabaseTableError(error)) pricingOfferHistorySupabaseAvailable = false;
    return null;
  }
}

function currentPricingOfferSnapshot() {
  const offerDate = ensurePricingOfferDate();
  const location = ensurePricingOfferLocation();
  const items = selectedPricingOfferItems().map((item) => {
    const record = item.record;
    return normalizePricingOfferHistoryItem({
      model: record.model || record.tradeName,
      tradeName: record.tradeName,
      manufacturer: record.manufacturer,
      nfzCode: record.nfzCode,
      grossPrice: record.grossPrice
    });
  }).filter(Boolean);
  const total = items.reduce((sum, item) => sum + Number(normalizePricingPrice(item.grossPrice) || 0), 0);
  const withoutNfz = Boolean(offerNoNfzInput?.checked);
  const nfzLimit = selectedPricingOfferItems().reduce((sum, item) => sum + pricingOfferNfzAmount(item.record), 0);
  const nfz = withoutNfz ? 0 : Math.min(total, nfzLimit);
  const pfronEnabled = Boolean(offerPfronEnabledInput?.checked);
  const pfron = pfronEnabled ? pricingOfferPfronAmount(Math.max(total - nfz, 0)) : 0;
  const patient = Math.max(total - nfz - pfron, 0);
  const now = new Date().toISOString();

  return {
    id: makeId(),
    createdAt: now,
    savedAt: now,
    savedBy: currentSupabaseUser?.email || "",
    workstation: currentWorkstationName(),
    customer: titleCaseName(offerCustomerInput?.value || ""),
    age: pricingOfferAgeValue() ?? "",
    location,
    offerDate,
    validUntil: addDaysToIsoDate(offerDate, PRICING_OFFER_VALID_DAYS),
    withoutNfz,
    pfronEnabled,
    total,
    nfz,
    pfron,
    patient,
    items
  };
}

function pricingOfferSnapshotKey(entry) {
  return [
    entry?.customer,
    entry?.offerDate,
    entry?.location,
    (entry?.items || []).map((item) => [item.model, item.nfzCode, item.grossPrice].join(":")).join("|")
  ].map((value) => normalize(value)).join("|");
}

async function persistPricingOfferHistoryEntry(entry, { silent = false } = {}) {
  if (!hasSupabaseConfig || !currentSupabaseUser || pricingOfferHistorySupabaseAvailable === false) return;

  try {
    const { error } = await supabaseClient.from(SUPABASE_OFFER_HISTORY_TABLE).upsert(supabaseRecordRow(entry), { onConflict: "id" });
    if (error) throw error;
    pricingOfferHistorySupabaseAvailable = true;
  } catch (error) {
    if (isMissingSupabaseTableError(error)) {
      pricingOfferHistorySupabaseAvailable = false;
      console.warn("Oferta zapisana lokalnie. Brakuje tabeli Supabase:", error.message);
      return;
    }
    console.warn("Oferta zapisana lokalnie, bez synchronizacji Supabase:", error.message);
    if (!silent) alert("Oferta zapisana lokalnie. Supabase nie przyjął historii oferty, sprawdź połączenie.");
  }
}

function saveCurrentPricingOfferToHistory({ silent = false } = {}) {
  const snapshot = normalizePricingOfferHistoryEntry(currentPricingOfferSnapshot());
  if (!snapshot) {
    if (!silent) alert("Uzupełnij klienta lub aparat, żeby zapisać ofertę w historii.");
    return null;
  }
  const now = new Date().toISOString();
  const snapshotKey = pricingOfferSnapshotKey(snapshot);
  const existingEntry = pricingOfferHistory.find((entry) => pricingOfferSnapshotKey(entry) === snapshotKey);
  const historyEntry = normalizePricingOfferHistoryEntry({
    ...snapshot,
    id: existingEntry?.id || snapshot.id,
    createdAt: existingEntry?.createdAt || snapshot.createdAt,
    savedAt: now,
    savedBy: currentSupabaseUser?.email || snapshot.savedBy,
    workstation: currentWorkstationName() || snapshot.workstation
  });
  if (!historyEntry) return null;
  pricingOfferHistory = [
    historyEntry,
    ...pricingOfferHistory.filter((entry) => entry.id !== historyEntry.id)
  ].slice(0, MAX_PRICING_OFFER_HISTORY);
  saveLocalPricingOfferHistory();
  recordDocumentLocationUsage(historyEntry.location, historyEntry.workstation);
  rebuildCustomerDocumentIndex();
  rebuildCustomerNameSuggestions();
  persistPricingOfferHistoryEntry(historyEntry, { silent });
  renderPricingDocumentHistory();
  renderDeviceViews();
  if (!silent) alert("Oferta zapisana w historii.");
  return historyEntry;
}

function normalizeLoanHistoryText(value) {
  return String(value ?? "").replace(/\s+/gu, " ").trim();
}

function normalizeDocumentLocationValue(value) {
  const text = normalizeLoanHistoryText(value);
  const normalizedText = normalize(text);
  if (normalizedText === "p63" || normalizedText.includes("partyzant")) return "Bielsko-Biała, ul. Partyzantów 63";
  if (normalizedText.includes("pilsud") || normalizedText.includes("piłsud") || normalizedText.includes("żywiec") || normalizedText.includes("zywiec")) {
    return "Żywiec, al. Piłsudskiego 50";
  }
  if (normalizedText === "p50") return "Żywiec, al. Piłsudskiego 50";
  if (normalizedText === "t12" || normalizedText.includes("traugutta") || normalizedText === normalize("Bielsko-Biała")) {
    return DEFAULT_DOCUMENT_LOCATION;
  }
  return text || DEFAULT_DOCUMENT_LOCATION;
}

function documentLocationKey(value) {
  const directKey = normalizeLoanHistoryText(value).toLocaleUpperCase("pl-PL");
  if (["T12", "P50", "P63"].includes(directKey)) return directKey;
  const normalizedLocation = normalize(normalizeDocumentLocationValue(value));
  return DOCUMENT_LOCATIONS.find((location) => normalize(location.value) === normalizedLocation)?.key || "";
}

function updateDocumentLocationAccent(input) {
  if (!input) return;
  const field = input.closest(".document-location-field");
  if (!field) return;
  const locationKey = documentLocationKey(input.value);
  if (locationKey) {
    field.dataset.locationTone = locationKey;
  } else {
    delete field.dataset.locationTone;
  }
}

function updateDocumentLocationAccents() {
  [offerLocationInput, loanCityInput, orderLocationInput, complaintLocationInput].forEach(updateDocumentLocationAccent);
}

function normalizeLoanCityValue(value) {
  return normalizeDocumentLocationValue(value);
}

function normalizePricingLoanHistoryDevice(device, fallbackSide = "") {
  return {
    side: normalizeLoanHistoryText(device?.side || fallbackSide),
    model: normalizeLoanHistoryText(device?.model),
    serial: normalizeLoanHistoryText(device?.serial).toLocaleUpperCase("pl-PL"),
    manufacturer: normalizeLoanHistoryText(device?.manufacturer),
    year: normalizeLoanHistoryText(device?.year),
    value: normalizeLoanHistoryText(device?.value)
  };
}

function pricingLoanHistoryEntryHasContent(entry) {
  return Boolean(
    normalizeLoanHistoryText(entry?.number) ||
    normalizeLoanHistoryText(entry?.customer) ||
    hasLoanDeviceData(entry?.rightDevice || {}) ||
    hasLoanDeviceData(entry?.leftDevice || {})
  );
}

function normalizePricingLoanHistoryEntry(entry) {
  if (!entry || typeof entry !== "object") return null;
  const savedAt = normalizeLoanHistoryText(entry.savedAt || entry.updatedAt || entry.createdAt || new Date().toISOString());
  const devices = Array.isArray(entry.devices) ? entry.devices : [];
  const rightDevice = normalizePricingLoanHistoryDevice(
    entry.rightDevice || devices.find((device) => normalizeLoanHistoryText(device?.side).toLowerCase().includes("praw")) || {},
    "prawe"
  );
  const leftDevice = normalizePricingLoanHistoryDevice(
    entry.leftDevice || devices.find((device) => normalizeLoanHistoryText(device?.side).toLowerCase().includes("lew")) || {},
    "lewe"
  );
  const normalizedEntry = {
    id: normalizeLoanHistoryText(entry.id || makeId()),
    createdAt: normalizeLoanHistoryText(entry.createdAt || savedAt),
    savedAt,
    savedBy: normalizeLoanHistoryText(entry.savedBy || entry.userEmail),
    workstation: normalizeLoanHistoryText(entry.workstation),
    number: normalizeLoanHistoryText(entry.number),
    date: isoDateForSave(entry.date) || normalizeLoanHistoryText(entry.date),
    city: normalizeLoanCityValue(entry.city),
    deposit: normalizeLoanHistoryText(entry.deposit),
    periodFrom: isoDateForSave(entry.periodFrom) || normalizeLoanHistoryText(entry.periodFrom),
    periodTo: isoDateForSave(entry.periodTo) || normalizeLoanHistoryText(entry.periodTo),
    customer: titleCaseName(entry.customer || ""),
    address: normalizeLoanHistoryText(entry.address),
    document: normalizeLoanHistoryText(entry.document),
    phone: normalizeLoanHistoryText(entry.phone),
    rightDevice,
    leftDevice,
    charger: normalizeLoanHistoryText(entry.charger),
    chargerSerial: normalizeLoanHistoryText(entry.chargerSerial).toLocaleUpperCase("pl-PL"),
    chargerState: normalizeLoanHistoryText(entry.chargerState),
    chargerMissingValue: normalizeLoanHistoryText(entry.chargerMissingValue),
    issueNotes: normalizeLoanHistoryText(entry.issueNotes),
    returnDate: isoDateForSave(entry.returnDate) || normalizeLoanHistoryText(entry.returnDate),
    depositReturnDate: isoDateForSave(entry.depositReturnDate) || normalizeLoanHistoryText(entry.depositReturnDate),
    deductions: normalizeLoanHistoryText(entry.deductions),
    deductionReason: normalizeLoanHistoryText(entry.deductionReason)
  };

  return pricingLoanHistoryEntryHasContent(normalizedEntry) ? normalizedEntry : null;
}

function normalizePricingLoanHistory(entries) {
  if (!Array.isArray(entries)) return [];
  const normalizedEntries = [];
  const seenIds = new Set();
  entries.forEach((entry) => {
    const normalizedEntry = normalizePricingLoanHistoryEntry(entry);
    if (!normalizedEntry || seenIds.has(normalizedEntry.id)) return;
    seenIds.add(normalizedEntry.id);
    normalizedEntries.push(normalizedEntry);
  });

  return normalizedEntries
    .sort((left, right) => String(right.savedAt).localeCompare(String(left.savedAt)))
    .slice(0, MAX_PRICING_LOAN_HISTORY);
}

function loadPricingLoanHistory() {
  try {
    return normalizePricingLoanHistory(JSON.parse(localStorage.getItem(PRICING_LOAN_HISTORY_STORAGE_KEY) || "[]"));
  } catch (error) {
    console.warn(error);
    localStorage.removeItem(PRICING_LOAN_HISTORY_STORAGE_KEY);
    return [];
  }
}

function saveLocalPricingLoanHistory() {
  pricingLoanHistory = normalizePricingLoanHistory(pricingLoanHistory);
  localStorage.setItem(PRICING_LOAN_HISTORY_STORAGE_KEY, JSON.stringify(pricingLoanHistory));
}

function mergePricingLoanHistory(...historySets) {
  return normalizePricingLoanHistory(historySets.flat());
}

async function loadSupabasePricingLoanHistory() {
  if (!hasSupabaseConfig || !currentSupabaseUser || pricingLoanHistorySupabaseAvailable === false) return null;

  try {
    const sharedHistory = await loadSupabaseTable(SUPABASE_LOAN_CONTRACT_TABLE, normalizePricingLoanHistory);
    pricingLoanHistorySupabaseAvailable = true;
    pricingLoanHistory = mergePricingLoanHistory(sharedHistory, pricingLoanHistory);
    saveLocalPricingLoanHistory();
    rebuildCustomerDocumentIndex();
    rebuildCustomerNameSuggestions();
    if (loanContractNumberInput?.dataset.autoNumber === "1") ensureLoanContractNumber({ force: true });
    renderPricingLoanHistory();
    return pricingLoanHistory;
  } catch (error) {
    console.warn("Historia umów działa lokalnie, bez tabeli Supabase:", error?.message || error);
    if (isMissingSupabaseTableError(error)) pricingLoanHistorySupabaseAvailable = false;
    renderPricingLoanHistory();
    return null;
  }
}

function pricingLoanSnapshotKey(entry) {
  const rightDevice = entry?.rightDevice || {};
  const leftDevice = entry?.leftDevice || {};
  return [
    entry?.number,
    entry?.date,
    entry?.customer,
    entry?.periodFrom,
    entry?.periodTo,
    rightDevice.model,
    rightDevice.serial,
    leftDevice.model,
    leftDevice.serial
  ].map((value) => normalize(value)).join("|");
}

function loanContractNumberParts(value) {
  const match = normalizeLoanHistoryText(value).match(/^(\d+)\s*\/\s*(\d{1,2})(?:\s*\/\s*(\d{2}|\d{4}))?$/u);
  if (!match) return null;
  const sequence = Number(match[1]);
  const month = Number(match[2]);
  const year = match[3] ? (match[3].length === 2 ? 2000 + Number(match[3]) : Number(match[3])) : null;
  if (!Number.isInteger(sequence) || sequence < 1 || !Number.isInteger(month) || month < 1 || month > 12) return null;
  return { sequence, month, year };
}

function loanContractDateParts(value) {
  const date = parseIsoDate(value);
  if (!date) return null;
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1
  };
}

function monthlyDocumentNumber(sequence, month, year) {
  return `${sequence}/${String(month).padStart(2, "0")}/${year}`;
}

function nextLoanContractNumber(dateValue, ignoredId = "") {
  const target = loanContractDateParts(dateValue) || loanContractDateParts(todayInputValue());
  const targetMonth = target?.month || new Date().getMonth() + 1;
  const targetYear = target?.year || new Date().getFullYear();
  const maxSequence = pricingLoanHistory.reduce((maxValue, entry) => {
    if (ignoredId && entry.id === ignoredId) return maxValue;
    const numberParts = loanContractNumberParts(entry.number);
    if (!numberParts) return maxValue;
    const dateParts = loanContractDateParts(entry.date);
    const entryMonth = dateParts?.month || numberParts.month;
    const entryYear = dateParts?.year || numberParts.year || targetYear;
    if (entryMonth !== targetMonth || entryYear !== targetYear) return maxValue;
    return Math.max(maxValue, numberParts.sequence);
  }, 0);

  return monthlyDocumentNumber(maxSequence + 1, targetMonth, targetYear);
}

function ensureLoanContractNumber({ force = false } = {}) {
  if (!loanContractNumberInput) return;
  const currentNumber = loanInputValue(loanContractNumberInput);
  const isAutoNumber = loanContractNumberInput.dataset.autoNumber === "1";
  if (currentNumber && !force && !isAutoNumber) return;
  const dateValue = isoDateForSave(loanDateInput?.value) || todayInputValue();
  loanContractNumberInput.value = nextLoanContractNumber(dateValue, activePricingLoanHistoryId);
  loanContractNumberInput.dataset.autoNumber = "1";
}

function currentPricingLoanSnapshot() {
  ensurePricingLoanDefaults();
  ensureLoanContractNumber();
  const now = new Date().toISOString();
  return {
    id: makeId(),
    createdAt: now,
    savedAt: now,
    savedBy: currentSupabaseUser?.email || "",
    workstation: currentWorkstationName(),
    number: loanInputValue(loanContractNumberInput),
    date: isoDateForSave(loanDateInput?.value) || loanInputValue(loanDateInput),
    city: normalizeLoanCityValue(loanInputValue(loanCityInput)),
    deposit: loanInputValue(loanDepositInput),
    periodFrom: isoDateForSave(loanPeriodFromInput?.value) || loanInputValue(loanPeriodFromInput),
    periodTo: isoDateForSave(loanPeriodToInput?.value) || loanInputValue(loanPeriodToInput),
    customer: titleCaseName(loanInputValue(loanCustomerInput)),
    address: loanInputValue(loanAddressInput),
    document: loanInputValue(loanDocumentInput),
    phone: loanInputValue(loanPhoneInput),
    rightDevice: loanDeviceData("right"),
    leftDevice: loanDeviceData("left"),
    charger: loanInputValue(loanChargerInput),
    chargerSerial: loanInputValue(loanChargerSerialInput).toLocaleUpperCase("pl-PL"),
    chargerState: loanInputValue(loanChargerStateInput),
    chargerMissingValue: loanInputValue(loanChargerMissingValueInput),
    issueNotes: loanInputValue(loanIssueNotesInput),
    returnDate: isoDateForSave(loanReturnDateInput?.value) || loanInputValue(loanReturnDateInput),
    depositReturnDate: isoDateForSave(loanDepositReturnDateInput?.value) || loanInputValue(loanDepositReturnDateInput),
    deductions: loanInputValue(loanDeductionsInput),
    deductionReason: loanInputValue(loanDeductionReasonInput)
  };
}

async function persistPricingLoanHistoryEntry(entry, { silent = false } = {}) {
  if (!hasSupabaseConfig || !currentSupabaseUser || pricingLoanHistorySupabaseAvailable === false) return;

  try {
    const { error } = await supabaseClient.from(SUPABASE_LOAN_CONTRACT_TABLE).upsert(supabaseRecordRow(entry), { onConflict: "id" });
    if (error) throw error;
    pricingLoanHistorySupabaseAvailable = true;
  } catch (error) {
    if (isMissingSupabaseTableError(error)) {
      pricingLoanHistorySupabaseAvailable = false;
      console.warn("Historia umów zapisana lokalnie. Brakuje tabeli Supabase:", error.message);
      return;
    }

    console.warn("Historia umów zapisana lokalnie, bez synchronizacji Supabase:", error.message);
    if (!silent) alert("Umowa zapisana lokalnie. Supabase nie przyjął historii umowy, sprawdź połączenie i spróbuj ponownie.");
  }
}

function saveCurrentPricingLoanToHistory({ silent = false } = {}) {
  const snapshot = normalizePricingLoanHistoryEntry(currentPricingLoanSnapshot());
  if (!snapshot) {
    if (!silent) alert("Uzupełnij osobę lub aparat słuchowy, żeby zapisać umowę w historii.");
    return null;
  }

  const now = new Date().toISOString();
  const snapshotKey = pricingLoanSnapshotKey(snapshot);
  const existingIndex = activePricingLoanHistoryId
    ? pricingLoanHistory.findIndex((entry) => entry.id === activePricingLoanHistoryId)
    : pricingLoanHistory.findIndex((entry) => pricingLoanSnapshotKey(entry) === snapshotKey);
  const existingEntry = existingIndex >= 0 ? pricingLoanHistory[existingIndex] : null;
  const historyEntry = normalizePricingLoanHistoryEntry({
    ...snapshot,
    id: existingEntry?.id || snapshot.id,
    createdAt: existingEntry?.createdAt || snapshot.createdAt,
    savedAt: now,
    savedBy: currentSupabaseUser?.email || snapshot.savedBy,
    workstation: currentWorkstationName() || snapshot.workstation
  });

  if (!historyEntry) return null;
  pricingLoanHistory = [
    historyEntry,
    ...pricingLoanHistory.filter((entry) => entry.id !== historyEntry.id)
  ].slice(0, MAX_PRICING_LOAN_HISTORY);
  activePricingLoanHistoryId = historyEntry.id;
  saveLocalPricingLoanHistory();
  recordDocumentLocationUsage(historyEntry.city, historyEntry.workstation);
  rebuildCustomerDocumentIndex();
  rebuildCustomerNameSuggestions();
  renderPricingLoanHistory();
  renderDeviceViews();
  persistPricingLoanHistoryEntry(historyEntry, { silent });
  if (!silent) alert("Umowa zapisana w historii.");
  return historyEntry;
}

function setLoanSnapshotInput(input, value, options = {}) {
  if (!input) return;
  if (options.date) {
    setDateInputValue(input, value || "");
    return;
  }
  const text = options.title
    ? titleCaseName(value || "")
    : options.upper
      ? normalizeLoanHistoryText(value).toLocaleUpperCase("pl-PL")
      : String(value ?? "");
  input.value = text;
}

function restorePricingLoanFromHistory(entry) {
  const historyEntry = normalizePricingLoanHistoryEntry(entry);
  if (!historyEntry) return;
  activePricingLoanHistoryId = historyEntry.id;
  pricingLoanAutofilledFromOffer = true;
  setLoanSnapshotInput(loanContractNumberInput, historyEntry.number);
  if (loanContractNumberInput) loanContractNumberInput.dataset.autoNumber = "";
  setLoanSnapshotInput(loanDateInput, historyEntry.date, { date: true });
  setLoanSnapshotInput(loanCityInput, normalizeLoanCityValue(historyEntry.city));
  setLoanSnapshotInput(loanDepositInput, historyEntry.deposit);
  setLoanSnapshotInput(loanPeriodFromInput, historyEntry.periodFrom, { date: true });
  setLoanSnapshotInput(loanPeriodToInput, historyEntry.periodTo, { date: true });
  setLoanSnapshotInput(loanCustomerInput, historyEntry.customer, { title: true });
  setLoanSnapshotInput(loanAddressInput, historyEntry.address);
  setLoanSnapshotInput(loanDocumentInput, historyEntry.document);
  setLoanSnapshotInput(loanPhoneInput, historyEntry.phone);
  setLoanSnapshotInput(loanRightDeviceInput, historyEntry.rightDevice.model);
  setLoanSnapshotInput(loanRightSerialInput, historyEntry.rightDevice.serial, { upper: true });
  setLoanSnapshotInput(loanRightManufacturerInput, historyEntry.rightDevice.manufacturer);
  setLoanSnapshotInput(loanRightValueInput, historyEntry.rightDevice.value);
  setLoanSnapshotInput(loanLeftDeviceInput, historyEntry.leftDevice.model);
  setLoanSnapshotInput(loanLeftSerialInput, historyEntry.leftDevice.serial, { upper: true });
  setLoanSnapshotInput(loanLeftManufacturerInput, historyEntry.leftDevice.manufacturer);
  setLoanSnapshotInput(loanLeftValueInput, historyEntry.leftDevice.value);
  setLoanSnapshotInput(loanChargerInput, historyEntry.charger);
  setLoanSnapshotInput(loanChargerSerialInput, historyEntry.chargerSerial, { upper: true });
  setLoanSnapshotInput(loanChargerStateInput, historyEntry.chargerState);
  setLoanSnapshotInput(loanChargerMissingValueInput, historyEntry.chargerMissingValue);
  setLoanSnapshotInput(loanIssueNotesInput, historyEntry.issueNotes);
  setLoanSnapshotInput(loanReturnDateInput, historyEntry.returnDate, { date: true });
  setLoanSnapshotInput(loanDepositReturnDateInput, historyEntry.depositReturnDate, { date: true });
  setLoanSnapshotInput(loanDeductionsInput, historyEntry.deductions);
  setLoanSnapshotInput(loanDeductionReasonInput, historyEntry.deductionReason);
  renderPricingLoan();
  pricingLoanView?.scrollIntoView({ block: "start", behavior: "smooth" });
}

async function deletePricingLoanHistoryEntry(id) {
  if (!canManagePricingLoanHistory()) return;
  if (!confirm("Usunąć tę umowę z historii?")) return;
  pricingLoanHistory = pricingLoanHistory.filter((entry) => entry.id !== id);
  if (activePricingLoanHistoryId === id) activePricingLoanHistoryId = "";
  saveLocalPricingLoanHistory();
  rebuildCustomerDocumentIndex();
  if (loanContractNumberInput?.dataset.autoNumber === "1") ensureLoanContractNumber({ force: true });
  renderPricingLoanHistory();
  renderDeviceViews();

  if (!hasSupabaseConfig || !currentSupabaseUser || pricingLoanHistorySupabaseAvailable === false) return;
  try {
    const { error } = await supabaseClient.from(SUPABASE_LOAN_CONTRACT_TABLE).delete().eq("id", id);
    if (error) throw error;
  } catch (error) {
    if (isMissingSupabaseTableError(error)) {
      pricingLoanHistorySupabaseAvailable = false;
      return;
    }
    alert(`Nie udało się usunąć umowy z Supabase: ${error.message}`);
  }
}

function pricingLoanHistoryCountLabel(count) {
  if (count === 1) return "1 umowa";
  if (count > 1 && count < 5) return `${count} umowy`;
  return `${count} umów`;
}

function pricingLoanHistoryDeviceLabel(entry) {
  return [entry.rightDevice, entry.leftDevice]
    .filter(hasLoanDeviceData)
    .map((device) => [device.side, device.model, device.serial].filter(Boolean).join(" · "))
    .join(" | ");
}

function renderPricingLoanHistory() {
  if (!loanHistoryList || !loanHistoryCount) return;
  const history = normalizePricingLoanHistory(pricingLoanHistory);
  loanHistoryCount.textContent = pricingLoanHistoryCountLabel(history.length);
  if (!history.length) {
    const empty = document.createElement("p");
    empty.className = "loan-history-empty";
    empty.textContent = "Brak zapisanych umów.";
    loanHistoryList.replaceChildren(empty);
    return;
  }

  const canDelete = canManagePricingLoanHistory();
  const items = history.map((entry) => {
    const item = document.createElement("article");
    item.className = "loan-history-item";

    const content = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = entry.customer || "Bez użytkownika";
    const meta = document.createElement("small");
    const savedAt = formatAuditDateTime(entry.savedAt);
    const contractDetails = [
      entry.number ? `nr ${entry.number}` : "",
      entry.date ? `z ${formatDate(entry.date)}` : "",
      [entry.periodFrom, entry.periodTo].filter(Boolean).length
        ? `okres ${[formatDate(entry.periodFrom), formatDate(entry.periodTo)].filter(Boolean).join(" - ")}`
        : ""
    ].filter(Boolean).join(" · ");
    meta.textContent = [contractDetails, savedAt ? `zapis: ${savedAt}` : "", entry.workstation, entry.savedBy].filter(Boolean).join(" | ");
    const device = document.createElement("span");
    device.textContent = pricingLoanHistoryDeviceLabel(entry) || "Brak aparatu słuchowego";
    content.append(title, meta, device);

    const actions = document.createElement("div");
    actions.className = "loan-history-actions";
    const openButton = document.createElement("button");
    openButton.type = "button";
    openButton.className = "reset-filters-btn";
    openButton.textContent = "Otwórz";
    openButton.addEventListener("click", () => restorePricingLoanFromHistory(entry));
    actions.append(openButton);

    if (canDelete) {
      const removeButton = document.createElement("button");
      removeButton.type = "button";
      removeButton.className = "reset-filters-btn loan-history-remove";
      removeButton.textContent = "Usuń";
      removeButton.addEventListener("click", () => deletePricingLoanHistoryEntry(entry.id));
      actions.append(removeButton);
    }

    item.append(content, actions);
    return item;
  });
  loanHistoryList.replaceChildren(...items);
}

function pricingDocumentHistoryCountLabel(count, singular, few, plural) {
  if (count === 1) return `1 ${singular}`;
  if (count > 1 && count < 5) return `${count} ${few}`;
  return `${count} ${plural}`;
}

function createPricingDocumentHistoryItem(entry, { title, meta, details, onPreview, onOpen, onDelete }) {
  const item = document.createElement("article");
  item.className = "loan-history-item";

  const content = document.createElement("div");
  const heading = document.createElement("strong");
  heading.textContent = title || "Bez danych";
  const information = document.createElement("small");
  information.textContent = meta || "";
  const description = document.createElement("span");
  description.textContent = details || "Brak pozycji";
  content.append(heading);
  if (information.textContent) content.append(information);
  content.append(description);

  const actions = document.createElement("div");
  actions.className = "loan-history-actions";
  const previewButton = document.createElement("button");
  previewButton.type = "button";
  previewButton.className = "reset-filters-btn";
  previewButton.textContent = "Podgląd";
  previewButton.addEventListener("click", onPreview);
  const openButton = document.createElement("button");
  openButton.type = "button";
  openButton.className = "reset-filters-btn";
  openButton.textContent = "Otwórz";
  openButton.addEventListener("click", onOpen);
  actions.append(previewButton, openButton);
  if (typeof onDelete === "function") {
    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "reset-filters-btn loan-history-remove";
    deleteButton.textContent = "Usuń";
    deleteButton.addEventListener("click", onDelete);
    actions.append(deleteButton);
  }
  item.append(content, actions);
  return item;
}

function appendPricingHistoryPreviewField(container, label, value) {
  const field = document.createElement("div");
  field.className = "pricing-history-preview-field";
  const heading = document.createElement("span");
  heading.textContent = label;
  const content = document.createElement("strong");
  content.textContent = value || "-";
  field.append(heading, content);
  container.append(field);
}

function showPricingHistoryPreview(kind, entry) {
  if (!pricingHistoryPreviewDialog || !pricingHistoryPreviewContent) return;
  const content = document.createDocumentFragment();
  const summary = document.createElement("section");
  summary.className = "pricing-history-preview-grid";
  const items = document.createElement("section");
  items.className = "pricing-history-preview-items";
  const itemsTitle = document.createElement("h3");
  itemsTitle.textContent = "Pozycje";
  items.append(itemsTitle);

  if (kind === "offer") {
    const saved = normalizePricingOfferHistoryEntry(entry);
    if (!saved) return;
    if (pricingHistoryPreviewTitle) pricingHistoryPreviewTitle.textContent = `Oferta${saved.customer ? ` - ${saved.customer}` : ""}`;
    appendPricingHistoryPreviewField(summary, "Data oferty", formatDate(saved.offerDate));
    appendPricingHistoryPreviewField(summary, "Ważna do", formatDate(saved.validUntil));
    appendPricingHistoryPreviewField(summary, "Miejsce", saved.location);
    appendPricingHistoryPreviewField(summary, "Wiek", saved.age !== "" ? formatOfferAge(Number(saved.age)) : "");
    appendPricingHistoryPreviewField(summary, "Cena", formatPricingPrice(saved.total));
    appendPricingHistoryPreviewField(summary, "NFZ", formatPricingPrice(saved.nfz));
    appendPricingHistoryPreviewField(summary, "PFRON", formatPricingPrice(saved.pfron));
    appendPricingHistoryPreviewField(summary, "Do zapłaty", formatPricingPrice(saved.patient));
    saved.items.forEach((item, index) => {
      const row = document.createElement("p");
      row.textContent = `${index + 1}. ${[item.model || item.tradeName, item.manufacturer, item.nfzCode, formatPricingPrice(item.grossPrice)].filter(Boolean).join(" | ")}`;
      items.append(row);
    });
  } else if (kind === "order") {
    const saved = normalizePricingOrderHistoryEntry(entry);
    if (!saved) return;
    if (pricingHistoryPreviewTitle) pricingHistoryPreviewTitle.textContent = `Zamówienie${saved.number ? ` ${saved.number}` : ""}`;
    appendPricingHistoryPreviewField(summary, "Klient", saved.customer);
    appendPricingHistoryPreviewField(summary, "Data", formatDate(saved.date));
    appendPricingHistoryPreviewField(summary, "Telefon", saved.phone);
    appendPricingHistoryPreviewField(summary, "Miejsce", saved.location);
    appendPricingHistoryPreviewField(summary, "Uwagi", saved.notes);
    saved.items.forEach((item, index) => {
      const row = document.createElement("p");
      row.textContent = `${index + 1}. ${[pricingOrderTypeLabel(item.type), item.description, item.quantity ? `ilość: ${item.quantity}` : "", item.notes].filter(Boolean).join(" | ")}`;
      items.append(row);
    });
  } else {
    const saved = normalizePricingComplaintHistoryEntry(entry);
    if (!saved) return;
    if (pricingHistoryPreviewTitle) pricingHistoryPreviewTitle.textContent = `Reklamacja${saved.number ? ` ${saved.number}` : ""}`;
    appendPricingHistoryPreviewField(summary, "Klient", saved.customer);
    appendPricingHistoryPreviewField(summary, "Data", formatDate(saved.date));
    appendPricingHistoryPreviewField(summary, "Telefon", saved.phone);
    appendPricingHistoryPreviewField(summary, "Miejsce", saved.location);
    appendPricingHistoryPreviewField(summary, "Żądanie", pricingComplaintRequestLabel(saved.request));
    appendPricingHistoryPreviewField(summary, "Opis", saved.defect);
    appendPricingHistoryPreviewField(summary, "Uwagi", saved.notes);
    saved.items.forEach((item, index) => {
      const row = document.createElement("p");
      row.textContent = `${index + 1}. ${[pricingComplaintProductTypeLabel(item.productType), item.productName, item.serial, item.purchaseDocument, formatDate(item.purchaseDate)].filter(Boolean).join(" | ")}`;
      items.append(row);
    });
  }

  if (items.children.length === 1) {
    const empty = document.createElement("p");
    empty.textContent = "Brak pozycji.";
    items.append(empty);
  }
  content.append(summary, items);
  pricingHistoryPreviewContent.replaceChildren(content);
  pricingHistoryPreviewDialog.showModal();
}

function renderPricingHistoryList(list, countElement, entries, emptyText, countLabels, createItem) {
  if (!list || !countElement) return;
  countElement.textContent = pricingDocumentHistoryCountLabel(entries.length, ...countLabels);
  if (!entries.length) {
    const empty = document.createElement("p");
    empty.className = "loan-history-empty";
    empty.textContent = emptyText;
    list.replaceChildren(empty);
    return;
  }
  list.replaceChildren(...entries.map(createItem));
}

function restorePricingOfferFromHistory(entry) {
  const saved = normalizePricingOfferHistoryEntry(entry);
  if (!saved) return;
  if (offerCustomerInput) offerCustomerInput.value = saved.customer;
  if (offerAgeInput) offerAgeInput.value = saved.age;
  if (offerLocationInput) offerLocationInput.value = normalizeDocumentLocationValue(saved.location);
  setDateInputValue(offerDateInput, saved.offerDate);
  if (offerNoNfzInput) offerNoNfzInput.checked = saved.withoutNfz;
  if (offerPfronEnabledInput) offerPfronEnabledInput.checked = saved.pfronEnabled;
  if (offerPfronInput) offerPfronInput.value = saved.pfronEnabled ? String(saved.pfron || "") : "";
  [offerDeviceInput1, offerDeviceInput2].forEach((input, index) => {
    if (!input) return;
    const savedItem = saved.items[index];
    const record = findPricingOfferRecord(savedItem?.model || savedItem?.tradeName);
    input.value = record ? pricingOfferDeviceLabel(record) : (savedItem?.model || savedItem?.tradeName || "");
  });
  renderPricingOfferDeviceList();
  switchPricingView("offer");
  renderPricingOffer();
}

function restorePricingOrderFromHistory(entry) {
  const saved = normalizePricingOrderHistoryEntry(entry);
  if (!saved) return;
  if (orderNumberInput) {
    orderNumberInput.value = saved.number;
    orderNumberInput.dataset.autoNumber = "";
  }
  if (orderCustomerInput) orderCustomerInput.value = saved.customer;
  if (orderPhoneInput) orderPhoneInput.value = saved.phone;
  if (orderLocationInput) orderLocationInput.value = normalizeDocumentLocationValue(saved.location);
  if (orderNotesInput) orderNotesInput.value = saved.notes;
  setDateInputValue(orderDateInput, saved.date);
  clearPricingOrderRows();
  (saved.items.length ? saved.items : [{}]).forEach((savedItem) => addPricingOrderItemRow(savedItem));
  switchPricingView("order");
  renderPricingOrder();
}

function restorePricingComplaintFromHistory(entry) {
  const saved = normalizePricingComplaintHistoryEntry(entry);
  if (!saved) return;
  if (complaintNumberInput) {
    complaintNumberInput.value = saved.number;
    complaintNumberInput.dataset.autoNumber = "";
  }
  if (complaintCustomerInput) complaintCustomerInput.value = saved.customer;
  if (complaintPhoneInput) complaintPhoneInput.value = saved.phone;
  if (complaintLocationInput) complaintLocationInput.value = normalizeDocumentLocationValue(saved.location);
  if (complaintRequestInput) {
    complaintRequestInput.value = saved.request;
    complaintRequestInput.dataset.userChanged = "1";
  }
  if (complaintDefectInput) complaintDefectInput.value = saved.defect;
  if (complaintNotesInput) complaintNotesInput.value = saved.notes;
  setDateInputValue(complaintDateInput, saved.date);
  setComplaintItemFields(1, saved.items[0] || {});
  setComplaintItemFields(2, saved.items[1] || {});
  switchPricingView("complaint");
  renderPricingComplaint();
}

async function deletePricingComplaintHistoryEntry(id) {
  if (!canManagePricing()) return;
  const entry = pricingComplaintHistory.find((item) => item.id === id);
  if (!entry) return;
  const label = [entry.number ? `nr ${entry.number}` : "", entry.customer].filter(Boolean).join(" - ") || "bez danych";
  if (!confirm(`Trwale usunąć reklamację ${label} z historii?`)) return;

  const previousHistory = pricingComplaintHistory.slice();
  pricingComplaintHistory = pricingComplaintHistory.filter((item) => item.id !== id);
  saveLocalPricingComplaintHistory();
  rebuildCustomerNameSuggestions();
  rebuildCustomerDocumentIndex();
  renderPricingDocumentHistory();

  if (!hasSupabaseConfig || !currentSupabaseUser || pricingComplaintHistorySupabaseAvailable === false) return;
  try {
    const { error } = await supabaseClient.from(SUPABASE_COMPLAINT_HISTORY_TABLE).delete().eq("id", id);
    if (error) throw error;
  } catch (error) {
    pricingComplaintHistory = previousHistory;
    saveLocalPricingComplaintHistory();
    rebuildCustomerNameSuggestions();
    rebuildCustomerDocumentIndex();
    renderPricingDocumentHistory();
    alert(`Nie udało się usunąć reklamacji z Supabase: ${error.message}`);
  }
}

function renderPricingDocumentHistory() {
  const offers = normalizePricingOfferHistory(pricingOfferHistory);
  renderPricingHistoryList(
    offerHistoryList,
    offerHistoryCount,
    offers,
    "Brak zapisanych ofert.",
    ["oferta", "oferty", "ofert"],
    (entry) => createPricingDocumentHistoryItem(entry, {
      title: entry.customer || "Oferta bez osoby",
      meta: [
        entry.offerDate ? formatDate(entry.offerDate) : "",
        entry.age !== "" ? formatOfferAge(Number(entry.age)) : "",
        entry.location,
        formatAuditDateTime(entry.savedAt) ? `zapis: ${formatAuditDateTime(entry.savedAt)}` : ""
      ].filter(Boolean).join(" | "),
      details: entry.items.map((item) => item.model || item.tradeName).filter(Boolean).join(" | ") || "Brak aparatu",
      onPreview: () => showPricingHistoryPreview("offer", entry),
      onOpen: () => restorePricingOfferFromHistory(entry)
    })
  );

  const orders = normalizePricingOrderHistory(pricingOrderHistory);
  renderPricingHistoryList(
    orderHistoryList,
    orderHistoryCount,
    orders,
    "Brak zapisanych zamówień.",
    ["zamówienie", "zamówienia", "zamówień"],
    (entry) => createPricingDocumentHistoryItem(entry, {
      title: entry.customer || "Zamówienie bez osoby",
      meta: [entry.number ? `nr ${entry.number}` : "", entry.date ? formatDate(entry.date) : "", entry.location].filter(Boolean).join(" | "),
      details: entry.items.map((item) => [pricingOrderTypeLabel(item.type), item.description, item.quantity ? `x${item.quantity}` : ""].filter(Boolean).join(" ")).join(" | ") || "Brak pozycji",
      onPreview: () => showPricingHistoryPreview("order", entry),
      onOpen: () => restorePricingOrderFromHistory(entry)
    })
  );

  const complaints = normalizePricingComplaintHistory(pricingComplaintHistory);
  renderPricingHistoryList(
    complaintHistoryList,
    complaintHistoryCount,
    complaints,
    "Brak zapisanych reklamacji.",
    ["reklamacja", "reklamacje", "reklamacji"],
    (entry) => createPricingDocumentHistoryItem(entry, {
      title: entry.customer || "Reklamacja bez osoby",
      meta: [entry.number ? `nr ${entry.number}` : "", entry.date ? formatDate(entry.date) : "", pricingComplaintRequestLabel(entry.request)].filter(Boolean).join(" | "),
      details: entry.items.map((item) => [item.productName || pricingComplaintProductTypeLabel(item.productType), item.serial].filter(Boolean).join(" · ")).join(" | ") || "Brak produktu",
      onPreview: () => showPricingHistoryPreview("complaint", entry),
      onOpen: () => restorePricingComplaintFromHistory(entry),
      onDelete: canManagePricing() ? () => deletePricingComplaintHistoryEntry(entry.id) : null
    })
  );
}

function loanInputValue(input) {
  return String(input?.value ?? "").trim();
}

function setLoanInputValue(input, value, overwrite = false) {
  if (!input || !String(value ?? "").trim()) return;
  if (overwrite || !loanInputValue(input)) input.value = value;
}

function loanDateText(input) {
  const rawValue = loanInputValue(input);
  const isoDate = isoDateForSave(rawValue);
  return isoDate ? formatDate(isoDate) : rawValue;
}

function loanMoneyElement(value) {
  const number = normalizePricingPrice(value);
  if (number !== "") return createPricingPriceElement(number);
  const span = document.createElement("span");
  span.textContent = String(value ?? "").trim() || "-";
  return span;
}

function setLoanOutput(name, value) {
  document.querySelectorAll(`[data-loan-out="${name}"]`).forEach((element) => {
    element.textContent = String(value ?? "").trim() || "-";
  });
}

function setLoanMoneyOutput(name, value) {
  document.querySelectorAll(`[data-loan-out="${name}"]`).forEach((element) => {
    element.replaceChildren(loanMoneyElement(value));
  });
}

function loanDeviceInputs(side) {
  return side === "right"
    ? {
        device: loanRightDeviceInput,
        serial: loanRightSerialInput,
        manufacturer: loanRightManufacturerInput,
        value: loanRightValueInput
      }
    : {
        device: loanLeftDeviceInput,
        serial: loanLeftSerialInput,
        manufacturer: loanLeftManufacturerInput,
        value: loanLeftValueInput
      };
}

function loanAgreementYear() {
  const isoDate = isoDateForSave(loanDateInput?.value) || todayInputValue();
  return isoDate ? isoDate.slice(0, 4) : "";
}

function loanDeviceData(side) {
  const inputs = loanDeviceInputs(side);
  const record = findPricingOfferRecord(inputs.device?.value);
  return {
    side: side === "right" ? "prawe" : "lewe",
    model: record ? pricingOfferDeviceName(record) : loanInputValue(inputs.device),
    serial: loanInputValue(inputs.serial).toLocaleUpperCase("pl-PL"),
    manufacturer: loanInputValue(inputs.manufacturer) || record?.manufacturer || "",
    year: loanAgreementYear(),
    value: loanInputValue(inputs.value) || record?.grossPrice || ""
  };
}

function hasLoanDeviceData(device) {
  return Boolean(device.model || device.serial || device.manufacturer || device.value);
}

function fillLoanDeviceFromRecord(side, record, overwrite = false) {
  if (!record) return;
  const inputs = loanDeviceInputs(side);
  setLoanInputValue(inputs.device, pricingOfferDeviceName(record), overwrite);
  setLoanInputValue(inputs.manufacturer, record.manufacturer, overwrite);
  setLoanInputValue(inputs.value, formatPricingPrice(record.grossPrice), overwrite);
}

function setLoanMatchedInputValue(input, value, overwrite = false) {
  if (!input) return;
  const text = String(value ?? "").trim();
  if (overwrite) {
    input.value = text;
    return;
  }
  setLoanInputValue(input, text, false);
}

function loanDevicePricingRecord(deviceName, manufacturer = "") {
  const candidates = pricingOfferPricedRecords();
  const combinedValue = [deviceName, manufacturer].filter(Boolean).join(" ");
  return (
    findPricingOfferRecordInCandidates(combinedValue, candidates) ||
    findPricingOfferRecordInCandidates(deviceName, candidates) ||
    findPricingOfferRecord(deviceName)
  );
}

function loanDeviceMatchFromDeviceRecord(record) {
  const pricingRecord = loanDevicePricingRecord(record?.deviceName);
  return {
    source: "bazy aparatów",
    model: record?.deviceName || "",
    serial: normalizeSerialNumber(record?.serialNumber),
    manufacturer: pricingRecord?.manufacturer || "",
    value: pricingRecord?.grossPrice || ""
  };
}

function loanDeviceMatchFromDemoRecord(record) {
  const pricingRecord = loanDevicePricingRecord(record?.deviceName, record?.manufacturer);
  return {
    source: "demo",
    model: record?.deviceName || "",
    serial: normalizeSerialNumber(record?.serialNumber),
    manufacturer: record?.manufacturer || pricingRecord?.manufacturer || "",
    value: pricingRecord?.grossPrice || ""
  };
}

function findLoanDeviceBySerial(serialNumber) {
  const serialKey = serialDuplicateKey(serialNumber);
  if (!serialKey) return null;

  const deviceRecord = records.find((record) => serialDuplicateKey(record.serialNumber) === serialKey);
  if (deviceRecord) return loanDeviceMatchFromDeviceRecord(deviceRecord);

  const demoRecord = demoRecords.find((record) => serialDuplicateKey(record.serialNumber) === serialKey);
  if (demoRecord) return loanDeviceMatchFromDemoRecord(demoRecord);

  return null;
}

function loanSideFromSerialInput(input) {
  if (input === loanRightSerialInput) return "right";
  if (input === loanLeftSerialInput) return "left";
  return "";
}

function loanSerialField(side) {
  return Array.from(loanSerialFields).find((field) => field.dataset.loanSerialField === side) || null;
}

function loanPasteSerialButton(side) {
  return Array.from(loanPasteSerialButtons).find((button) => button.dataset.pasteLoanSerial === side) || null;
}

function updateLoanSerialPasteHint(side) {
  if (!side) return;
  const inputs = loanDeviceInputs(side);
  const field = loanSerialField(side);
  const button = loanPasteSerialButton(side);
  const canPaste = Boolean(inputs.serial && !loanInputValue(inputs.serial));

  field?.classList.toggle("has-paste-hint", canPaste);
  if (field) {
    if (canPaste) field.dataset.pasteHint = lastCopiedSerialNumber ? `Wklej ${lastCopiedSerialNumber}` : "Wklej skopiowany numer";
    else delete field.dataset.pasteHint;
  }

  if (button) {
    button.hidden = !canPaste;
    button.title = canPaste ? field?.dataset.pasteHint || "Wklej skopiowany numer" : "";
  }

  if (inputs.serial) {
    if (canPaste) {
      inputs.serial.title = lastCopiedSerialNumber ? `Wklej skopiowany nr: ${lastCopiedSerialNumber}` : "Wklej skopiowany numer";
    } else if (inputs.serial.title.startsWith("Wklej skopiowany nr:")) {
      inputs.serial.removeAttribute("title");
    } else if (inputs.serial.title === "Wklej skopiowany numer") {
      inputs.serial.removeAttribute("title");
    }
  }
}

function updateLoanSerialPasteHints() {
  updateLoanSerialPasteHint("right");
  updateLoanSerialPasteHint("left");
}

function rememberCopiedSerialNumber(serialText) {
  lastCopiedSerialNumber = normalizeSerialNumber(serialText);
  updateLoanSerialPasteHints();
}

function fillLoanDeviceFromSerial(side, overwrite = true) {
  const inputs = loanDeviceInputs(side);
  const serial = normalizeSerialNumber(inputs.serial?.value);
  if (!serial) {
    updateLoanSerialPasteHint(side);
    return false;
  }

  if (inputs.serial && inputs.serial.value !== serial) inputs.serial.value = serial;
  const match = findLoanDeviceBySerial(serial);
  if (!match) {
    updateLoanSerialPasteHint(side);
    return false;
  }

  setLoanMatchedInputValue(inputs.device, match.model, overwrite);
  setLoanMatchedInputValue(inputs.manufacturer, match.manufacturer, overwrite);
  setLoanMatchedInputValue(inputs.value, match.value ? formatPricingPrice(match.value) : "", overwrite);
  if (inputs.serial) inputs.serial.title = `Uzupełniono z ${match.source}`;
  updateLoanSerialPasteHint(side);
  renderPricingLoan();
  return true;
}

async function pasteCopiedSerialToLoanDevice(side) {
  const inputs = loanDeviceInputs(side);
  if (!inputs.serial || loanInputValue(inputs.serial)) return;

  let serial = lastCopiedSerialNumber;
  if (!serial && navigator.clipboard?.readText) {
    try {
      serial = normalizeSerialNumber(await navigator.clipboard.readText());
    } catch (error) {
      serial = "";
    }
  }

  if (!serial) {
    inputs.serial.placeholder = "Najpierw skopiuj numer";
    setTimeout(() => {
      if (inputs.serial && !loanInputValue(inputs.serial)) inputs.serial.placeholder = "";
    }, 1600);
    return;
  }

  rememberCopiedSerialNumber(serial);
  inputs.serial.value = serial;
  fillLoanDeviceFromSerial(side, true);
  updateLoanSerialPasteHints();
  renderPricingLoan();
}

function clearLoanDevice(side) {
  const inputs = loanDeviceInputs(side);
  [inputs.device, inputs.serial, inputs.manufacturer, inputs.value].forEach((input) => {
    if (input) input.value = "";
  });
  updateLoanSerialPasteHint(side);
  renderPricingLoan();
}

function autofillLoanDeviceFromInput(side, overwrite = false) {
  const inputs = loanDeviceInputs(side);
  const record = findPricingOfferRecord(inputs.device?.value);
  if (!record) return;
  fillLoanDeviceFromRecord(side, record, overwrite);
}

function setLoanDeviceValues(targetSide, sourceSide, { includeSerial = true } = {}) {
  const source = loanDeviceInputs(sourceSide);
  const target = loanDeviceInputs(targetSide);
  ["device", "manufacturer", "value"].forEach((field) => {
    if (target[field]) target[field].value = loanInputValue(source[field]);
  });
  if (target.serial) target.serial.value = includeSerial ? loanInputValue(source.serial).toLocaleUpperCase("pl-PL") : "";
}

function moveLoanDevice(sourceSide, targetSide) {
  const sourceData = loanDeviceData(sourceSide);
  if (!hasLoanDeviceData(sourceData)) {
    alert(`Najpierw uzupełnij aparat ${sourceSide === "right" ? "P" : "L"}.`);
    return;
  }
  setLoanDeviceValues(targetSide, sourceSide, { includeSerial: true });
  const source = loanDeviceInputs(sourceSide);
  [source.device, source.serial, source.manufacturer, source.value].forEach((input) => {
    if (input) input.value = "";
  });
  updateLoanSerialPasteHints();
  renderPricingLoan();
}

function duplicateLoanDevice() {
  const rightData = loanDeviceData("right");
  const leftData = loanDeviceData("left");
  const sourceSide = hasLoanDeviceData(rightData) ? "right" : hasLoanDeviceData(leftData) ? "left" : "";
  if (!sourceSide) {
    alert("Najpierw uzupełnij aparat P albo L.");
    return;
  }
  const targetSide = sourceSide === "right" ? "left" : "right";
  setLoanDeviceValues(targetSide, sourceSide, { includeSerial: false });
  updateLoanSerialPasteHints();
  renderPricingLoan();
}

function syncLoanFormFromOffer(overwrite = false) {
  setLoanInputValue(loanCustomerInput, titleCaseName(offerCustomerInput?.value || ""), overwrite);
  setLoanInputValue(loanCityInput, normalizeDocumentLocationValue(offerLocationInput?.value), overwrite);
  const offerDate = isoDateForSave(offerDateInput?.value);
  if (offerDate && (overwrite || !loanInputValue(loanDateInput))) setDateInputValue(loanDateInput, offerDate);
  if (offerDate && (overwrite || !loanInputValue(loanPeriodFromInput))) setDateInputValue(loanPeriodFromInput, offerDate);
  if (offerDate && (overwrite || !loanInputValue(loanPeriodToInput))) {
    setDateInputValue(loanPeriodToInput, addDaysToIsoDate(offerDate, PRICING_LOAN_DAYS));
  }

  const offerItems = selectedPricingOfferItems();
  fillLoanDeviceFromRecord("right", offerItems[0]?.record, overwrite);
  fillLoanDeviceFromRecord("left", offerItems[1]?.record, overwrite);
}

function ensurePricingLoanDefaults() {
  const today = todayInputValue();
  if (!loanInputValue(loanDateInput)) setDateInputValue(loanDateInput, today);
  if (!loanInputValue(loanPeriodFromInput)) setDateInputValue(loanPeriodFromInput, isoDateForSave(loanDateInput?.value) || today);
  if (!loanInputValue(loanPeriodToInput)) {
    setDateInputValue(loanPeriodToInput, addDaysToIsoDate(isoDateForSave(loanPeriodFromInput?.value) || today, PRICING_LOAN_DAYS));
  }
  if (!loanInputValue(loanCityInput)) setLoanInputValue(loanCityInput, suggestedDocumentLocation());
  else setLoanInputValue(loanCityInput, normalizeDocumentLocationValue(loanCityInput.value));
  setLoanInputValue(loanChargerStateInput, "wydano");
  setLoanInputValue(loanIssueNotesInput, "bez zastrzeżeń");
  if (!pricingLoanAutofilledFromOffer) {
    syncLoanFormFromOffer(false);
    pricingLoanAutofilledFromOffer = true;
  }
  ensureLoanContractNumber();
}

function renderPricingLoanEquipment(devices) {
  if (!loanEquipmentBody) return;
  const rows = devices.map((device) => {
    const row = document.createElement("tr");
    appendOfferCell(row, device.side);
    appendOfferCell(row, device.model);
    appendOfferCell(row, device.serial);
    appendOfferCell(row, device.manufacturer);
    appendOfferCell(row, device.year);
    const valueCell = document.createElement("td");
    valueCell.append(loanMoneyElement(device.value));
    row.append(valueCell);
    return row;
  });
  loanEquipmentBody.replaceChildren(...rows);
}

function renderPricingLoan() {
  if (!pricingLoanView) return;
  ensurePricingLoanDefaults();
  updateDocumentLocationAccent(loanCityInput);
  updateLoanSerialPasteHints();

  const dateText = loanDateText(loanDateInput);
  const periodFrom = loanDateText(loanPeriodFromInput);
  const periodTo = loanDateText(loanPeriodToInput);
  const periodText = [periodFrom, periodTo].filter(Boolean).join(" - ");
  const returnDate = loanDateText(loanReturnDateInput);
  const issueNotes = loanInputValue(loanIssueNotesInput) || "bez zastrzeżeń";
  const deductionReason = loanInputValue(loanDeductionReasonInput);
  const devices = [loanDeviceData("right"), loanDeviceData("left")];
  const visibleDevices = devices.map((device) => ({
    ...device,
    model: device.model || "-",
    serial: device.serial || "-",
    manufacturer: device.manufacturer || "-",
    year: device.year || "-",
    value: device.value || "-"
  }));

  if (loanPrintMeta) loanPrintMeta.textContent = `Data umowy: ${dateText || "-"} | Okres: ${periodText || "-"}`;
  setLoanOutput("number", loanInputValue(loanContractNumberInput));
  setLoanOutput("date", dateText);
  setLoanOutput("city", loanInputValue(loanCityInput));
  setLoanOutput("period", periodText);
  setLoanMoneyOutput("deposit", loanInputValue(loanDepositInput) || "0 zł");
  setLoanOutput("customer", titleCaseName(loanInputValue(loanCustomerInput)));
  setLoanOutput("address", loanInputValue(loanAddressInput));
  setLoanOutput("document", loanInputValue(loanDocumentInput));
  setLoanOutput("phone", loanInputValue(loanPhoneInput));
  setLoanOutput("charger", loanInputValue(loanChargerInput));
  setLoanOutput("chargerSerial", loanInputValue(loanChargerSerialInput).toLocaleUpperCase("pl-PL"));
  setLoanOutput("chargerState", loanInputValue(loanChargerStateInput));
  setLoanMoneyOutput("chargerMissingValue", loanInputValue(loanChargerMissingValueInput));
  setLoanOutput("issueNotes", issueNotes);
  setLoanOutput("issueProtocol", `${issueNotes}; instrukcja, ładowarka`);
  setLoanOutput("returnProtocol", `Data: ${returnDate || "-"}${deductionReason ? `; uwagi: ${deductionReason}` : ""}`);
  setLoanMoneyOutput("deductions", loanInputValue(loanDeductionsInput));
  setLoanOutput("deductionReason", deductionReason);
  setLoanOutput("depositReturnDate", loanDateText(loanDepositReturnDateInput));
  renderPricingLoanEquipment(visibleDevices);
  renderPricingLoanHistory();

  const hasRequiredContent = Boolean(loanInputValue(loanCustomerInput) || devices.some(hasLoanDeviceData));
  if (printPricingLoanBtn) printPricingLoanBtn.disabled = !hasRequiredContent;
}

function printPricingLoan() {
  if (printPricingLoanBtn?.disabled) return;
  renderPricingLoan();
  saveCurrentPricingLoanToHistory({ silent: true });
  const cleanup = () => document.body.classList.remove("pricing-loan-print");
  document.body.classList.add("pricing-loan-print");
  window.addEventListener("afterprint", cleanup, { once: true });
  window.print();
}

function normalizePricingPcprEar(value) {
  const text = normalizeLoanHistoryText(value).toLocaleUpperCase("pl-PL");
  if (text === "P" || text.includes("PRAW")) return "P";
  if (text === "L" || text.includes("LEW")) return "L";
  if (text === "B" || text === "OBA" || text.includes("OBYD")) return "B";
  return "";
}

function pricingPcprEarLabel(value) {
  const ear = normalizePricingPcprEar(value);
  if (ear === "P") return "Prawe";
  if (ear === "L") return "Lewe";
  if (ear === "B") return "Oba";
  return "";
}

function pcprOfficeRecord(value) {
  const key = normalize(value).trim();
  if (!key) return null;
  return PCPR_OFFICES.find((office) => normalize(office.name).trim() === key) || null;
}

function normalizePricingPcprOffice(value) {
  return pcprOfficeRecord(value)?.name || "";
}

function pricingPcprOfficeTone(value) {
  return pcprOfficeRecord(value)?.tone || "none";
}

function pcprPlaceForOffice(value) {
  return pcprOfficeRecord(value)?.place || "T12";
}

function normalizePcprPlace(value) {
  const text = normalizeLoanHistoryText(value).toLocaleUpperCase("pl-PL");
  return STOCK_LOCATIONS.includes(text) ? text : "";
}

function pcprPlaceTone(value) {
  const place = normalizePcprPlace(value);
  return place || "none";
}

function pcprOfficeAddressLabel(value) {
  const office = pcprOfficeRecord(value);
  if (!office) return "";
  return `${office.postalCode} ${office.city}, ${office.street}`;
}

function pcprOfficeContactLabel(value) {
  const office = pcprOfficeRecord(value);
  if (!office) return "";
  return [pcprOfficeAddressLabel(office.name), office.phone ? `tel. ${office.phone}` : ""].filter(Boolean).join(" | ");
}

function updatePcprOfficeHint() {
  const office = normalizePricingPcprOffice(pcprOfficeInput?.value);
  const tone = pricingPcprOfficeTone(office);
  const field = pcprOfficeInput?.closest(".pcpr-office-field");
  if (field) field.dataset.pcprOfficeTone = tone;
  if (!pcprOfficeAddressHint) return;
  pcprOfficeAddressHint.textContent = pcprOfficeContactLabel(office);
}

function pcprDigitGroups(digits, groups) {
  const parts = [];
  let offset = 0;
  groups.forEach((size) => {
    const part = digits.slice(offset, offset + size);
    if (part) parts.push(part);
    offset += size;
  });
  if (offset < digits.length) parts.push(digits.slice(offset));
  return parts.join(" ");
}

function pcprPhoneDigits(value) {
  let digits = String(value ?? "").replace(/\D+/g, "");
  if (digits.startsWith("0048")) digits = digits.slice(4);
  if (digits.startsWith("48") && digits.length > 9) digits = digits.slice(2);
  return digits.slice(0, 9);
}

function formatPcprPhone(value) {
  const digits = pcprPhoneDigits(value);
  if (!digits) return "";
  return /^[5-8]/u.test(digits)
    ? pcprDigitGroups(digits, [3, 3, 3])
    : pcprDigitGroups(digits, [2, 3, 2, 2]);
}

function formatPcprPostalCode(value) {
  const digits = String(value ?? "").replace(/\D+/g, "").slice(0, 5);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}-${digits.slice(2)}`;
}

function normalizePcprCity(value) {
  return titleCaseName(normalizeLoanHistoryText(value));
}

function normalizePcprStreet(value) {
  let text = normalizeLoanHistoryText(value)
    .replace(/\s*[–—]\s*/gu, " ")
    .replace(/\s*-\s*/gu, " ")
    .replace(/([^\d\s])(?=\d)/gu, "$1 ");
  if (!text) return "";

  const splitParts = text.split(/\s+/u).filter(Boolean);
  if (splitParts.length > 1) {
    const numberLike = splitParts.at(-1);
    if (/^\d[\d\p{L}/]*$/u.test(numberLike)) {
      const street = titleCaseName(splitParts.slice(0, -1).join(" "));
      return `${street} ${numberLike.toLocaleUpperCase("pl-PL")}`.trim();
    }
  }

  const match = text.match(/^(.+?)\s+(\d[\d\p{L}/ -]*)$/u);
  if (match) {
    return `${titleCaseName(match[1])} ${normalizeLoanHistoryText(match[2]).toLocaleUpperCase("pl-PL")}`;
  }

  text = titleCaseName(text);
  return text;
}

function parsePcprAddress(value) {
  const text = normalizeLoanHistoryText(value);
  const parsed = { postalCode: "", city: "", street: "" };
  if (!text) return parsed;

  const postalMatch = text.match(/(\d{2})[-\s]?(\d{3})\s+([^,]+)(?:,\s*(.+))?$/u);
  if (postalMatch) {
    parsed.postalCode = `${postalMatch[1]}-${postalMatch[2]}`;
    parsed.city = normalizePcprCity(postalMatch[3]);
    parsed.street = normalizePcprStreet(postalMatch[4]);
    return parsed;
  }

  const knownCity = ["Bielsko-Biała", "Żywiec"].find((city) => normalize(text).startsWith(normalize(city)));
  if (knownCity) {
    parsed.city = knownCity;
    parsed.street = normalizePcprStreet(text.slice(knownCity.length).replace(/^,\s*/u, ""));
    return parsed;
  }

  parsed.street = normalizePcprStreet(text);
  return parsed;
}

function pcprCityForPostalCode(postalCode, knownEntries = []) {
  const normalizedCode = formatPcprPostalCode(postalCode);
  if (!normalizedCode) return "";
  if (PCPR_POSTAL_CODE_CITY_MAP[normalizedCode]) return PCPR_POSTAL_CODE_CITY_MAP[normalizedCode];

  const match = knownEntries.find((entry) => formatPcprPostalCode(entry.postalCode) === normalizedCode && entry.city);
  return match ? normalizePcprCity(match.city) : "";
}

function pcprAddressLabel(entry) {
  const location = [formatPcprPostalCode(entry?.postalCode), normalizePcprCity(entry?.city)].filter(Boolean).join(" ");
  return [location, normalizeLoanHistoryText(entry?.street)].filter(Boolean).join(", ") || normalizeLoanHistoryText(entry?.address);
}

function syncPcprCityFromPostalCode({ force = false } = {}) {
  if (!pcprPostalCodeInput || !pcprCityInput) return;
  pcprPostalCodeInput.value = formatPcprPostalCode(pcprPostalCodeInput.value);
  const city = pcprCityForPostalCode(pcprPostalCodeInput.value, pricingPcprList);
  const cityWasAuto = pcprCityInput.dataset.autoCity === "1";
  if (!city) {
    if (cityWasAuto) {
      pcprCityInput.value = "";
      pcprCityInput.dataset.autoCity = "";
    }
    return;
  }
  if (force || cityWasAuto || !normalizeLoanHistoryText(pcprCityInput.value)) {
    pcprCityInput.value = city;
    pcprCityInput.dataset.autoCity = "1";
  }
}

function syncPcprPlaceFromOffice({ force = false } = {}) {
  if (!pcprPlaceInput) return;
  const office = normalizePricingPcprOffice(pcprOfficeInput?.value);
  const place = normalizePcprPlace(pcprPlaceInput.value);
  const mappedPlace = normalizePcprPlace(pcprPlaceForOffice(office));
  const placeWasAuto = pcprPlaceInput.dataset.autoPlace === "1";
  if (!mappedPlace) return;
  if (force || placeWasAuto || !place) {
    pcprPlaceInput.value = mappedPlace;
    pcprPlaceInput.dataset.autoPlace = "1";
    updateDocumentLocationAccent(pcprPlaceInput);
  }
}

function normalizePricingPcprItem(item) {
  if (!item || typeof item !== "object") return null;
  const savedAt = normalizeLoanHistoryText(item.savedAt || item.updatedAt || item.createdAt || new Date().toISOString());
  const record = findPricingOfferRecord(item.model);
  const secondRecord = findPricingOfferRecord(item.model2 || item.secondModel || item.model_2);
  const parsedAddress = parsePcprAddress(item.address);
  const postalCode = formatPcprPostalCode(item.postalCode || item.zipCode || parsedAddress.postalCode);
  const city = normalizePcprCity(item.city || parsedAddress.city || pcprCityForPostalCode(postalCode));
  const street = normalizePcprStreet(item.street || parsedAddress.street);
  const normalizedItem = {
    id: normalizeLoanHistoryText(item.id || makeId()),
    createdAt: normalizeLoanHistoryText(item.createdAt || savedAt),
    savedAt,
    savedBy: normalizeLoanHistoryText(item.savedBy || item.userEmail),
    workstation: normalizeLoanHistoryText(item.workstation),
    done: normalizeBooleanFlag(item.done || item.checked || item.completed),
    office: normalizePricingPcprOffice(item.office || item.pcpr || item.institution),
    place: normalizePcprPlace(item.place || pcprPlaceForOffice(item.office || item.pcpr || item.institution)),
    customer: titleCaseName(item.customer || item.customerName || ""),
    phone: formatPcprPhone(item.phone),
    postalCode,
    city,
    street,
    model: record ? pricingOfferDeviceName(record) : normalizeLoanHistoryText(item.model),
    model2: secondRecord ? pricingOfferDeviceName(secondRecord) : normalizeLoanHistoryText(item.model2 || item.secondModel || item.model_2),
    ear: normalizePricingPcprEar(item.ear || item.side)
  };
  normalizedItem.address = pcprAddressLabel(normalizedItem);

  return normalizedItem.office || normalizedItem.customer || normalizedItem.phone || normalizedItem.address || normalizedItem.model || normalizedItem.model2
    ? normalizedItem
    : null;
}

function normalizePricingPcprList(entries) {
  if (!Array.isArray(entries)) return [];
  const normalizedEntries = [];
  const seenIds = new Set();
  entries.forEach((entry) => {
    const normalizedEntry = normalizePricingPcprItem(entry);
    if (!normalizedEntry || seenIds.has(normalizedEntry.id)) return;
    seenIds.add(normalizedEntry.id);
    normalizedEntries.push(normalizedEntry);
  });

  return normalizedEntries
    .sort((left, right) => String(right.createdAt || right.savedAt).localeCompare(String(left.createdAt || left.savedAt)))
    .slice(0, MAX_PRICING_PCPR_LIST);
}

function loadPricingPcprList() {
  try {
    return normalizePricingPcprList(JSON.parse(localStorage.getItem(PRICING_PCPR_LIST_STORAGE_KEY) || "[]"));
  } catch (error) {
    console.warn(error);
    localStorage.removeItem(PRICING_PCPR_LIST_STORAGE_KEY);
    return [];
  }
}

function saveLocalPricingPcprList() {
  pricingPcprList = normalizePricingPcprList(pricingPcprList);
  localStorage.setItem(PRICING_PCPR_LIST_STORAGE_KEY, JSON.stringify(pricingPcprList));
}

function mergePricingPcprList(...listSets) {
  return normalizePricingPcprList(listSets.flat());
}

async function loadSupabasePricingPcprList() {
  if (!hasSupabaseConfig || !currentSupabaseUser || pricingPcprListSupabaseAvailable === false) return null;

  try {
    const sharedList = await loadSupabaseTable(SUPABASE_PCPR_LIST_TABLE, normalizePricingPcprList);
    pricingPcprListSupabaseAvailable = true;
    pricingPcprList = mergePricingPcprList(sharedList, pricingPcprList);
    saveLocalPricingPcprList();
    rebuildCustomerNameSuggestions();
    renderPricingPcprList();
    return pricingPcprList;
  } catch (error) {
    console.warn("Lista PCPR działa lokalnie, bez tabeli Supabase:", error?.message || error);
    if (isMissingSupabaseTableError(error)) pricingPcprListSupabaseAvailable = false;
    renderPricingPcprList();
    return null;
  }
}

async function persistPricingPcprItem(entry, { silent = false } = {}) {
  if (!hasSupabaseConfig || !currentSupabaseUser || pricingPcprListSupabaseAvailable === false) return;

  try {
    const { error } = await supabaseClient.from(SUPABASE_PCPR_LIST_TABLE).upsert(supabaseRecordRow(entry), { onConflict: "id" });
    if (error) throw error;
    pricingPcprListSupabaseAvailable = true;
  } catch (error) {
    if (isMissingSupabaseTableError(error)) {
      pricingPcprListSupabaseAvailable = false;
      console.warn("PCPR zapisany lokalnie. Brakuje tabeli Supabase:", error.message);
      if (!silent) alert("PCPR zapisany lokalnie. Żeby lista była wspólna dla użytkowników, uruchom w Supabase aktualny plik supabase-schema.sql.");
      return;
    }
    console.warn("PCPR zapisany lokalnie, bez synchronizacji Supabase:", error.message);
    if (!silent) alert("PCPR zapisany lokalnie. Supabase nie przyjął wpisu, sprawdź połączenie.");
  }
}

function selectedPcprEar() {
  return normalizePricingPcprEar([...pcprEarInputs].find((input) => input.checked)?.value);
}

function setPcprEar(value) {
  const ear = normalizePricingPcprEar(value);
  pcprEarInputs.forEach((input) => {
    input.checked = Boolean(ear && input.value === ear);
  });
}

function syncPcprModelFromPricing() {
  if (!pcprModelInput) return;
  const record = findPricingOfferRecord(pcprModelInput.value);
  if (record) pcprModelInput.value = pricingOfferDeviceName(record);
}

function syncPcprSecondModelFromPricing() {
  if (!pcprModelInput2) return;
  const record = findPricingOfferRecord(pcprModelInput2.value);
  if (record) pcprModelInput2.value = pricingOfferDeviceName(record);
}

function setPcprSecondModelVisible(visible) {
  if (pcprSecondModelField) pcprSecondModelField.hidden = !visible;
  if (addPcprSecondModelBtn) addPcprSecondModelBtn.hidden = visible;
  if (!visible && pcprModelInput2) pcprModelInput2.value = "";
}

function currentPricingPcprItemSnapshot() {
  syncPcprModelFromPricing();
  syncPcprSecondModelFromPricing();
  syncPcprCityFromPostalCode({ force: false });
  const now = new Date().toISOString();
  const existingEntry = activePricingPcprEditId ? pricingPcprList.find((entry) => entry.id === activePricingPcprEditId) : null;
  const postalCode = formatPcprPostalCode(pcprPostalCodeInput?.value);
  const city = normalizePcprCity(pcprCityInput?.value);
  const street = normalizePcprStreet(pcprStreetInput?.value);
  return {
    id: existingEntry?.id || makeId(),
    createdAt: existingEntry?.createdAt || now,
    savedAt: now,
    savedBy: currentSupabaseUser?.email || "",
    workstation: currentWorkstationName(),
    office: normalizePricingPcprOffice(pcprOfficeInput?.value),
    place: normalizePcprPlace(pcprPlaceInput?.value || pcprPlaceForOffice(pcprOfficeInput?.value)),
    customer: titleCaseName(pcprCustomerInput?.value || ""),
    phone: formatPcprPhone(pcprPhoneInput?.value),
    postalCode,
    city,
    street,
    address: pcprAddressLabel({ postalCode, city, street }),
    model: normalizeLoanHistoryText(pcprModelInput?.value),
    model2: normalizeLoanHistoryText(pcprModelInput2?.value),
    ear: selectedPcprEar()
  };
}

function setPcprOffice(value) {
  if (pcprOfficeInput) pcprOfficeInput.value = normalizePricingPcprOffice(value);
  updatePcprOfficeHint();
}

function updatePcprFormMode() {
  if (savePcprBtn) savePcprBtn.textContent = activePricingPcprEditId ? "Zapisz" : "Dodaj";
  if (cancelPcprEditBtn) cancelPcprEditBtn.hidden = !activePricingPcprEditId;
  pcprForm?.classList.toggle("editing", Boolean(activePricingPcprEditId));
}

function resetPricingPcprForm() {
  [pcprOfficeInput, pcprPlaceInput, pcprCustomerInput, pcprPhoneInput, pcprPostalCodeInput, pcprCityInput, pcprStreetInput, pcprModelInput, pcprModelInput2].forEach((input) => {
    if (input) input.value = "";
  });
  activePricingPcprEditId = "";
  if (pcprCityInput) pcprCityInput.dataset.autoCity = "";
  if (pcprPlaceInput) {
    pcprPlaceInput.value = "T12";
    pcprPlaceInput.dataset.autoPlace = "1";
    updateDocumentLocationAccent(pcprPlaceInput);
  }
  setPcprSecondModelVisible(false);
  setPcprEar("");
  updatePcprOfficeHint();
  updatePcprFormMode();
}

function editPricingPcprItem(id) {
  const entry = normalizePricingPcprItem(pricingPcprList.find((item) => item.id === id));
  if (!entry) return;
  activePricingPcprEditId = entry.id;
  setPcprOffice(entry.office);
  if (pcprPlaceInput) {
    pcprPlaceInput.value = normalizePcprPlace(entry.place || pcprPlaceForOffice(entry.office)) || "T12";
    pcprPlaceInput.dataset.autoPlace = "";
    updateDocumentLocationAccent(pcprPlaceInput);
  }
  if (pcprCustomerInput) pcprCustomerInput.value = entry.customer || "";
  if (pcprPhoneInput) pcprPhoneInput.value = entry.phone || "";
  if (pcprPostalCodeInput) pcprPostalCodeInput.value = entry.postalCode || "";
  if (pcprCityInput) {
    pcprCityInput.value = entry.city || "";
    pcprCityInput.dataset.autoCity = "";
  }
  if (pcprStreetInput) pcprStreetInput.value = entry.street || "";
  if (pcprModelInput) pcprModelInput.value = entry.model || "";
  if (pcprModelInput2) pcprModelInput2.value = entry.model2 || "";
  setPcprSecondModelVisible(Boolean(entry.model2));
  setPcprEar(entry.ear);
  updatePcprFormMode();
  pcprForm?.scrollIntoView({ block: "start", behavior: "smooth" });
  pcprCustomerInput?.focus();
}

function addPricingPcprItem(event) {
  event?.preventDefault();
  const entry = normalizePricingPcprItem(currentPricingPcprItemSnapshot());
  if (!entry?.customer) {
    alert("Wpisz imię i nazwisko do listy PCPR.");
    pcprCustomerInput?.focus();
    return;
  }

  pricingPcprList = [
    entry,
    ...pricingPcprList.filter((item) => item.id !== entry.id)
  ].slice(0, MAX_PRICING_PCPR_LIST);
  saveLocalPricingPcprList();
  renderPricingPcprList();
  persistPricingPcprItem(entry);
  resetPricingPcprForm();
  pcprCustomerInput?.focus();
}

function togglePricingPcprDone(id, checked) {
  const currentEntry = pricingPcprList.find((entry) => entry.id === id);
  if (!currentEntry) return;
  const updatedEntry = normalizePricingPcprItem({
    ...currentEntry,
    done: checked ? "1" : "",
    savedAt: new Date().toISOString(),
    savedBy: currentSupabaseUser?.email || currentEntry.savedBy,
    workstation: currentWorkstationName() || currentEntry.workstation
  });
  if (!updatedEntry) return;
  pricingPcprList = pricingPcprList.map((entry) => (entry.id === id ? updatedEntry : entry));
  saveLocalPricingPcprList();
  renderPricingPcprList();
  persistPricingPcprItem(updatedEntry, { silent: true });
}

async function deletePricingPcprItem(id) {
  if (!canManagePricingPcprList()) return;
  const entry = pricingPcprList.find((item) => item.id === id);
  if (!entry) return;
  if (!confirm(`Usunąć PCPR: ${entry.customer || "bez nazwiska"}?`)) return;

  const previousList = pricingPcprList;
  pricingPcprList = pricingPcprList.filter((item) => item.id !== id);
  saveLocalPricingPcprList();
  renderPricingPcprList();

  if (!hasSupabaseConfig || !currentSupabaseUser || pricingPcprListSupabaseAvailable === false) return;
  try {
    const { error } = await supabaseClient.from(SUPABASE_PCPR_LIST_TABLE).delete().eq("id", id);
    if (error) throw error;
  } catch (error) {
    pricingPcprList = previousList;
    saveLocalPricingPcprList();
    renderPricingPcprList();
    if (isMissingSupabaseTableError(error)) {
      pricingPcprListSupabaseAvailable = false;
      alert("Nie udało się usunąć PCPR, bo brakuje tabeli w Supabase.");
      return;
    }
    alert(`Nie udało się usunąć PCPR z Supabase: ${error.message}`);
  }
}

function pricingPcprListCountLabel(count) {
  if (count === 1) return "1 pozycja";
  if (count > 1 && count < 5) return `${count} pozycje`;
  return `${count} pozycji`;
}

function createPricingPcprItem(entry) {
  const item = document.createElement("article");
  item.className = "pcpr-item";
  if (entry.done) item.classList.add("done");
  if (entry.ear) item.dataset.ear = entry.ear;
  item.dataset.officeTone = pricingPcprOfficeTone(entry.office);

  const content = document.createElement("div");
  content.className = "pcpr-item-content";

  const place = normalizePcprPlace(entry.place || pcprPlaceForOffice(entry.office)) || "T12";
  const placeBadge = document.createElement("span");
  placeBadge.className = "pcpr-place-badge";
  placeBadge.dataset.locationTone = place;
  placeBadge.textContent = place;

  if (entry.office) {
    const office = document.createElement("div");
    office.className = "pcpr-item-office";
    const officeName = document.createElement("strong");
    officeName.textContent = entry.office;
    const officeAddress = document.createElement("small");
    officeAddress.textContent = pcprOfficeContactLabel(entry.office);
    office.append(officeName, placeBadge);
    if (officeAddress.textContent) office.append(officeAddress);
    content.append(office);
  } else {
    const placeLine = document.createElement("div");
    placeLine.className = "pcpr-item-place";
    placeLine.append(placeBadge);
    content.append(placeLine);
  }

  const nameLine = document.createElement("label");
  nameLine.className = "pcpr-item-name";
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = Boolean(entry.done);
  checkbox.addEventListener("change", () => togglePricingPcprDone(entry.id, checkbox.checked));
  const name = document.createElement("strong");
  name.textContent = entry.customer || "Bez nazwiska";
  nameLine.append(checkbox, name);

  const details = document.createElement("span");
  details.className = "pcpr-item-details";
  details.textContent = [
    entry.phone,
    pcprAddressLabel(entry)
  ].filter(Boolean).join(" | ");

  const model = document.createElement("span");
  model.className = "pcpr-item-model";
  model.textContent = [entry.model, entry.model2].filter(Boolean).join(" | ") || "Brak wstępnego modelu";

  const meta = document.createElement("small");
  const savedAt = formatAuditDateTime(entry.savedAt);
  meta.textContent = [savedAt ? `zapis: ${savedAt}` : "", entry.workstation, entry.savedBy].filter(Boolean).join(" | ");
  content.append(nameLine);
  if (details.textContent) content.append(details);
  content.append(model);
  if (meta.textContent) content.append(meta);

  const ear = document.createElement("span");
  ear.className = `pcpr-ear-badge pcpr-ear-${entry.ear || "none"}`;
  if (entry.ear === "B") {
    ear.className = "pcpr-ear-badge-group";
    const right = document.createElement("span");
    right.className = "pcpr-ear-badge pcpr-ear-P";
    right.textContent = "P";
    const left = document.createElement("span");
    left.className = "pcpr-ear-badge pcpr-ear-L";
    left.textContent = "L";
    ear.append(right, left);
  } else {
    ear.textContent = entry.ear || "-";
  }
  ear.title = pricingPcprEarLabel(entry.ear) || "Brak strony";

  const actions = document.createElement("div");
  actions.className = "pcpr-item-actions";
  actions.append(ear);

  const editButton = document.createElement("button");
  editButton.type = "button";
  editButton.className = "pcpr-edit-btn";
  editButton.textContent = "Edytuj";
  editButton.addEventListener("click", () => editPricingPcprItem(entry.id));
  actions.append(editButton);

  if (canManagePricingPcprList()) {
    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "pcpr-remove-btn";
    removeButton.textContent = "Usuń";
    removeButton.addEventListener("click", () => deletePricingPcprItem(entry.id));
    actions.append(removeButton);
  }

  item.append(content, actions);
  return item;
}

function updatePcprFilterTabs() {
  pcprPlaceTabs.forEach((button) => {
    const active = normalizePcprPlace(button.dataset.pcprPlaceTab || "") === normalizePcprPlace(pricingPcprPlaceFilter)
      || (!pricingPcprPlaceFilter && !button.dataset.pcprPlaceTab);
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  pcprOfficeTabs.forEach((button) => {
    const active = normalizeLoanHistoryText(button.dataset.pcprOfficeTab || "").toLocaleUpperCase("pl-PL")
      === normalizeLoanHistoryText(pricingPcprOfficeFilter).toLocaleUpperCase("pl-PL")
      || (!pricingPcprOfficeFilter && !button.dataset.pcprOfficeTab);
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function filteredPricingPcprList(list) {
  const placeFilter = normalizePcprPlace(pricingPcprPlaceFilter);
  const officeFilter = normalizeLoanHistoryText(pricingPcprOfficeFilter).toLocaleUpperCase("pl-PL");
  return list.filter((entry) => {
    const placeMatches = !placeFilter || normalizePcprPlace(entry.place) === placeFilter;
    const officeMatches = !officeFilter || entry.office.toLocaleUpperCase("pl-PL").startsWith(officeFilter);
    return placeMatches && officeMatches;
  });
}

function resetPricingPcprFilters() {
  pricingPcprPlaceFilter = "";
  pricingPcprOfficeFilter = "";
  updatePcprFilterTabs();
  renderPricingPcprList();
}

function renderPricingPcprList() {
  if (!pcprList || !pcprListCount) return;
  const allItems = normalizePricingPcprList(pricingPcprList);
  const list = filteredPricingPcprList(allItems);
  pcprListCount.textContent = list.length === allItems.length
    ? pricingPcprListCountLabel(list.length)
    : `${pricingPcprListCountLabel(list.length)} z ${allItems.length}`;
  if (!list.length) {
    const empty = document.createElement("p");
    empty.className = "loan-history-empty";
    empty.textContent = allItems.length ? "Brak pozycji PCPR dla wybranych filtrów." : "Brak pozycji PCPR.";
    pcprList.replaceChildren(empty);
    return;
  }

  pcprList.replaceChildren(...list.map(createPricingPcprItem));
}

function pricingOrderTypeLabel(value) {
  const type = normalizePricingOrderType(value);
  return {
    "APARAT SŁUCHOWY": "Aparat słuchowy",
    "WKŁADKA USZNA": "Wkładka uszna",
    "WKŁADKA PRZECIWWODNA": "Wkładka przeciwwodna"
  }[type] || type;
}

function normalizePricingOrderType(value) {
  const normalizedType = normalizeLoanHistoryText(value).toLocaleUpperCase("pl-PL");
  return PRICING_ORDER_TYPES.includes(normalizedType) ? normalizedType : PRICING_ORDER_TYPES[0];
}

function normalizePricingOrderItem(item) {
  if (!item || typeof item !== "object") return null;
  const type = normalizePricingOrderType(item.type);
  const quantity = normalizeLoanHistoryText(item.quantity || "1") || "1";
  const description = normalizeLoanHistoryText(item.description);
  const notes = normalizeLoanHistoryText(item.notes);
  return { type, quantity, description, notes };
}

function pricingOrderItemHasContent(item) {
  const normalizedItem = normalizePricingOrderItem(item);
  if (!normalizedItem) return false;
  return Boolean(
    normalizedItem.description ||
    normalizedItem.notes ||
    normalizedItem.quantity !== "1" ||
    normalizedItem.type !== PRICING_ORDER_TYPES[0]
  );
}

function normalizePricingOrderHistoryEntry(entry) {
  if (!entry || typeof entry !== "object") return null;
  const items = (Array.isArray(entry.items) ? entry.items : [])
    .map(normalizePricingOrderItem)
    .filter(pricingOrderItemHasContent);
  const savedAt = normalizeLoanHistoryText(entry.savedAt || entry.updatedAt || entry.createdAt || new Date().toISOString());
  const normalizedEntry = {
    id: normalizeLoanHistoryText(entry.id || makeId()),
    createdAt: normalizeLoanHistoryText(entry.createdAt || savedAt),
    savedAt,
    savedBy: normalizeLoanHistoryText(entry.savedBy || entry.userEmail),
    workstation: normalizeLoanHistoryText(entry.workstation),
    number: normalizeLoanHistoryText(entry.number),
    date: isoDateForSave(entry.date) || normalizeLoanHistoryText(entry.date),
    customer: titleCaseName(entry.customer || ""),
    phone: normalizeLoanHistoryText(entry.phone),
    location: normalizeDocumentLocationValue(entry.location),
    notes: normalizeLoanHistoryText(entry.notes),
    items
  };
  return normalizedEntry.number || normalizedEntry.customer || normalizedEntry.items.length ? normalizedEntry : null;
}

function normalizePricingOrderHistory(entries) {
  if (!Array.isArray(entries)) return [];
  const normalizedEntries = [];
  const seenIds = new Set();
  entries.forEach((entry) => {
    const normalizedEntry = normalizePricingOrderHistoryEntry(entry);
    if (!normalizedEntry || seenIds.has(normalizedEntry.id)) return;
    seenIds.add(normalizedEntry.id);
    normalizedEntries.push(normalizedEntry);
  });
  return normalizedEntries
    .sort((left, right) => String(right.date || right.savedAt).localeCompare(String(left.date || left.savedAt)))
    .slice(0, MAX_PRICING_ORDER_HISTORY);
}

function loadPricingOrderHistory() {
  try {
    return normalizePricingOrderHistory(JSON.parse(localStorage.getItem(PRICING_ORDER_HISTORY_STORAGE_KEY) || "[]"));
  } catch (error) {
    console.warn(error);
    localStorage.removeItem(PRICING_ORDER_HISTORY_STORAGE_KEY);
    return [];
  }
}

function saveLocalPricingOrderHistory() {
  pricingOrderHistory = normalizePricingOrderHistory(pricingOrderHistory);
  localStorage.setItem(PRICING_ORDER_HISTORY_STORAGE_KEY, JSON.stringify(pricingOrderHistory));
}

function mergePricingOrderHistory(...historySets) {
  return normalizePricingOrderHistory(historySets.flat());
}

async function loadSupabasePricingOrderHistory() {
  if (!hasSupabaseConfig || !currentSupabaseUser || pricingOrderHistorySupabaseAvailable === false) return null;

  try {
    const sharedHistory = await loadSupabaseTable(SUPABASE_ORDER_HISTORY_TABLE, normalizePricingOrderHistory);
    pricingOrderHistorySupabaseAvailable = true;
    pricingOrderHistory = mergePricingOrderHistory(sharedHistory, pricingOrderHistory);
    saveLocalPricingOrderHistory();
    rebuildCustomerNameSuggestions();
    if (orderNumberInput?.dataset.autoNumber === "1") ensurePricingOrderNumber({ force: true });
    return pricingOrderHistory;
  } catch (error) {
    console.warn("Historia zamówień działa lokalnie, bez tabeli Supabase:", error?.message || error);
    if (isMissingSupabaseTableError(error)) pricingOrderHistorySupabaseAvailable = false;
    return null;
  }
}

function nextPricingOrderNumber(dateValue, ignoredId = "") {
  const target = loanContractDateParts(dateValue) || loanContractDateParts(todayInputValue());
  const targetMonth = target?.month || new Date().getMonth() + 1;
  const targetYear = target?.year || new Date().getFullYear();
  const maxSequence = pricingOrderHistory.reduce((maxValue, entry) => {
    if (ignoredId && entry.id === ignoredId) return maxValue;
    const numberParts = loanContractNumberParts(entry.number);
    if (!numberParts) return maxValue;
    const dateParts = loanContractDateParts(entry.date);
    const entryMonth = dateParts?.month || numberParts.month;
    const entryYear = dateParts?.year || numberParts.year || targetYear;
    if (entryMonth !== targetMonth || entryYear !== targetYear) return maxValue;
    return Math.max(maxValue, numberParts.sequence);
  }, 0);

  return monthlyDocumentNumber(maxSequence + 1, targetMonth, targetYear);
}

function ensurePricingOrderNumber({ force = false } = {}) {
  if (!orderNumberInput) return;
  const currentNumber = loanInputValue(orderNumberInput);
  const isAutoNumber = orderNumberInput.dataset.autoNumber === "1";
  if (currentNumber && !force && !isAutoNumber) return;
  const dateValue = isoDateForSave(orderDateInput?.value) || todayInputValue();
  orderNumberInput.value = nextPricingOrderNumber(dateValue);
  orderNumberInput.dataset.autoNumber = "1";
}

function ensurePricingOrderDefaults() {
  const today = todayInputValue();
  if (!loanInputValue(orderDateInput)) setDateInputValue(orderDateInput, today);
  if (!loanInputValue(orderLocationInput)) orderLocationInput.value = suggestedDocumentLocation();
  else orderLocationInput.value = normalizeDocumentLocationValue(orderLocationInput.value);
  if (!orderItemsFormBody?.querySelector("[data-order-row]")) addPricingOrderItemRow();
  ensurePricingOrderNumber();
}

function orderInputValue(input) {
  return loanInputValue(input);
}

function pricingOrderSnapshotKey(entry) {
  return [
    entry?.number,
    entry?.date,
    entry?.customer,
    (entry?.items || []).map((item) => [item.type, item.quantity, item.description, item.notes].join(":")).join("|")
  ].map((value) => normalize(value)).join("|");
}

function pricingOrderFormItems({ includeBlank = false } = {}) {
  if (!orderItemsFormBody) return [];
  return [...orderItemsFormBody.querySelectorAll("[data-order-row]")]
    .map((row) => normalizePricingOrderItem({
      type: row.querySelector("[data-order-field='type']")?.value,
      quantity: row.querySelector("[data-order-field='quantity']")?.value,
      description: row.querySelector("[data-order-field='description']")?.value,
      notes: row.querySelector("[data-order-field='notes']")?.value
    }))
    .filter((item) => item && (includeBlank || pricingOrderItemHasContent(item)));
}

function currentPricingOrderSnapshot() {
  ensurePricingOrderDefaults();
  const now = new Date().toISOString();
  return {
    id: makeId(),
    createdAt: now,
    savedAt: now,
    savedBy: currentSupabaseUser?.email || "",
    workstation: currentWorkstationName(),
    number: orderInputValue(orderNumberInput),
    date: isoDateForSave(orderDateInput?.value) || orderInputValue(orderDateInput),
    customer: titleCaseName(orderInputValue(orderCustomerInput)),
    phone: orderInputValue(orderPhoneInput),
    location: normalizeDocumentLocationValue(orderInputValue(orderLocationInput)),
    notes: orderInputValue(orderNotesInput),
    items: pricingOrderFormItems()
  };
}

async function persistPricingOrderHistoryEntry(entry, { silent = false } = {}) {
  if (!hasSupabaseConfig || !currentSupabaseUser || pricingOrderHistorySupabaseAvailable === false) return;

  try {
    const { error } = await supabaseClient.from(SUPABASE_ORDER_HISTORY_TABLE).upsert(supabaseRecordRow(entry), { onConflict: "id" });
    if (error) throw error;
    pricingOrderHistorySupabaseAvailable = true;
  } catch (error) {
    if (isMissingSupabaseTableError(error)) {
      pricingOrderHistorySupabaseAvailable = false;
      console.warn("Zamówienie zapisane lokalnie. Brakuje tabeli Supabase:", error.message);
      return;
    }
    console.warn("Zamówienie zapisane lokalnie, bez synchronizacji Supabase:", error.message);
    if (!silent) alert("Zamówienie zapisane lokalnie. Supabase nie przyjął historii zamówienia, sprawdź połączenie.");
  }
}

function saveCurrentPricingOrderToHistory({ silent = false } = {}) {
  const snapshot = normalizePricingOrderHistoryEntry(currentPricingOrderSnapshot());
  if (!snapshot?.items.length) {
    if (!silent) alert("Dodaj przynajmniej jedną pozycję zamówienia.");
    return null;
  }
  const now = new Date().toISOString();
  const snapshotKey = pricingOrderSnapshotKey(snapshot);
  const existingEntry = pricingOrderHistory.find((entry) => pricingOrderSnapshotKey(entry) === snapshotKey || entry.number === snapshot.number);
  const historyEntry = normalizePricingOrderHistoryEntry({
    ...snapshot,
    id: existingEntry?.id || snapshot.id,
    createdAt: existingEntry?.createdAt || snapshot.createdAt,
    savedAt: now,
    savedBy: currentSupabaseUser?.email || snapshot.savedBy,
    workstation: currentWorkstationName() || snapshot.workstation
  });
  if (!historyEntry) return null;
  pricingOrderHistory = [
    historyEntry,
    ...pricingOrderHistory.filter((entry) => entry.id !== historyEntry.id)
  ].slice(0, MAX_PRICING_ORDER_HISTORY);
  saveLocalPricingOrderHistory();
  recordDocumentLocationUsage(historyEntry.location, historyEntry.workstation);
  rebuildCustomerNameSuggestions();
  persistPricingOrderHistoryEntry(historyEntry, { silent });
  renderPricingDocumentHistory();
  if (!silent) alert("Zamówienie zapisane w historii.");
  return historyEntry;
}

function documentLocationToRepairLocation(value) {
  const text = normalizeLoanHistoryText(value);
  const directLocation = String(text).trim().toLocaleUpperCase("pl-PL");
  if (["T12", "P50", "P63"].includes(directLocation)) return directLocation;
  const documentLocation = normalizeDocumentLocationValue(text);
  const match = DOCUMENT_LOCATIONS.find((location) => normalize(location.value) === normalize(documentLocation));
  return match?.key || normalizeRepairLocation(text);
}

function repairDocumentSourceTag(sourceType, sourceNumber) {
  const type = normalizeLoanHistoryText(sourceType).toLocaleUpperCase("pl-PL");
  const label = type === "COMPLAINT" ? "Reklamacja" : "Zamówienie";
  const number = normalizeLoanHistoryText(sourceNumber) || "bez numeru";
  return `[${label}: ${number}]`;
}

function repairDocumentSourceMatches(record, sourceType, sourceId, sourceNumber) {
  const checkedType = normalizeLoanHistoryText(sourceType).toLocaleUpperCase("pl-PL");
  const recordType = normalizeLoanHistoryText(record?.sourceDocumentType).toLocaleUpperCase("pl-PL");
  const recordSourceId = normalizeLoanHistoryText(record?.sourceDocumentId);
  const recordSourceNumber = normalizeLoanHistoryText(record?.sourceDocumentNumber);
  if (recordType && recordType !== checkedType) return false;
  if (sourceId && recordSourceId === sourceId) return true;
  if (sourceNumber && recordSourceNumber === sourceNumber) return true;
  const sourceTag = repairDocumentSourceTag(checkedType, sourceNumber);
  return Boolean(sourceNumber && normalize(record?.notes).includes(normalize(sourceTag)));
}

function normalizeRepairDocumentType(value) {
  const type = normalizeLoanHistoryText(value).toLocaleUpperCase("pl-PL");
  if (type === "ORDER" || type === "ZAMÓWIENIE" || type === "ZAMOWIENIE") return "ORDER";
  if (type === "COMPLAINT" || type === "REKLAMACJA") return "COMPLAINT";
  return "";
}

function repairDocumentTypeLabel(type) {
  return normalizeRepairDocumentType(type) === "COMPLAINT" ? "Reklamacja" : "Zamówienie";
}

function repairDocumentTagInfo(record) {
  const notes = String(record?.notes || "");
  const match = notes.match(/\[(Zamówienie|Zamowienie|Reklamacja)\s*:\s*([^\]]+)\]/iu);
  if (!match) return { type: "", number: "" };
  return {
    type: normalizeRepairDocumentType(match[1]),
    number: normalizeLoanHistoryText(match[2])
  };
}

function repairDocumentInfo(record) {
  const tag = repairDocumentTagInfo(record);
  const category = normalizeRepairCategory(record?.category);
  const type =
    normalizeRepairDocumentType(record?.sourceDocumentType) ||
    tag.type ||
    (category === "ZAMÓWIENIE" ? "ORDER" : "");
  const number = normalizeLoanHistoryText(record?.sourceDocumentNumber) || (tag.type === type ? tag.number : "");
  const parts = loanContractNumberParts(number);
  const dateParts = loanContractDateParts(record?.receivedDate);
  return {
    type,
    label: type ? repairDocumentTypeLabel(type) : "",
    number,
    parts,
    dateParts,
    groupMonth: parts?.month || null,
    groupYear: parts?.year || dateParts?.year || null,
    sequence: parts?.sequence || null,
    receivedDate: isoDateForSave(record?.receivedDate)
  };
}

function addRepairDocumentNumberIssue(issueMap, record, title, detail, severity = "warning") {
  if (!record?.id) return;
  const issue = { title, detail, severity, kind: "repair-document-number" };
  const existingIssues = issueMap.get(record.id) || [];
  if (!existingIssues.some((item) => item.title === title && item.detail === detail)) {
    existingIssues.push(issue);
    issueMap.set(record.id, existingIssues);
  }
}

function missingDocumentSequencesText(sequences, month, year) {
  const values = sequences.slice(0, 6).map((sequence) => monthlyDocumentNumber(sequence, month, year));
  const suffix = sequences.length > values.length ? ` i jeszcze ${sequences.length - values.length}` : "";
  return `${values.join(", ")}${suffix}`;
}

function repairDocumentNumberIssueMap(recordsToCheck = repairRecords) {
  const issueMap = new Map();
  const groups = new Map();

  recordsToCheck.forEach((record) => {
    const info = repairDocumentInfo(record);
    if (!info.type) return;

    if (!info.number) {
      addRepairDocumentNumberIssue(
        issueMap,
        record,
        `Brak numeru: ${info.label}`,
        `${info.label} w Naprawach nie ma zapisanego numeru dokumentu.`
      );
      return;
    }

    if (!info.parts) {
      addRepairDocumentNumberIssue(
        issueMap,
        record,
        `Nieprawidłowy numer: ${info.label}`,
        `Numer "${info.number}" nie pasuje do formatu np. 1/08/2026.`
      );
      return;
    }

    if (!info.groupYear) {
      addRepairDocumentNumberIssue(
        issueMap,
        record,
        `Brak roku w numerze: ${info.label}`,
        `Numer "${info.number}" nie ma roku, a wpis nie ma poprawnej daty przyjęcia.`
      );
      return;
    }

    if (info.receivedDate && info.dateParts) {
      if (info.parts.month !== info.dateParts.month || (info.parts.year && info.parts.year !== info.dateParts.year)) {
        addRepairDocumentNumberIssue(
          issueMap,
          record,
          `Numer poza miesiącem: ${info.label}`,
          `${info.label} ${info.number} nie pasuje do daty przyjęcia ${formatDate(info.receivedDate)}.`
        );
      }
    }

    const groupKey = `${info.type}-${info.groupYear}-${info.groupMonth}`;
    const group = groups.get(groupKey) || {
      type: info.type,
      label: info.label,
      year: info.groupYear,
      month: info.groupMonth,
      entries: []
    };
    group.entries.push({ record, info });
    groups.set(groupKey, group);
  });

  groups.forEach((group) => {
    const sequenceMap = new Map();
    group.entries.forEach((entry) => {
      const recordsForSequence = sequenceMap.get(entry.info.sequence) || [];
      recordsForSequence.push(entry);
      sequenceMap.set(entry.info.sequence, recordsForSequence);
    });

    sequenceMap.forEach((entries, sequence) => {
      if (entries.length < 2) return;
      entries.forEach(({ record }) => {
        addRepairDocumentNumberIssue(
          issueMap,
          record,
          `Duplikat numeru: ${group.label}`,
          `${group.label} ${monthlyDocumentNumber(sequence, group.month, group.year)} występuje ${entries.length} razy w Naprawach.`
        );
      });
    });

    const sequences = [...sequenceMap.keys()].filter(Number.isFinite).sort((left, right) => left - right);
    if (sequences.length) {
      const sequenceSet = new Set(sequences);
      const missingSequences = [];
      const lastSequence = sequences[sequences.length - 1];
      for (let sequence = 1; sequence <= lastSequence; sequence += 1) {
        if (!sequenceSet.has(sequence)) missingSequences.push(sequence);
      }
      if (missingSequences.length) {
        const firstAfterGap = group.entries
          .filter((entry) => entry.info.sequence > missingSequences[0])
          .sort((left, right) => left.info.sequence - right.info.sequence)[0];
        if (firstAfterGap) {
          addRepairDocumentNumberIssue(
            issueMap,
            firstAfterGap.record,
            `Luka w numeracji: ${group.label}`,
            `Brakuje numeru: ${missingDocumentSequencesText(missingSequences, group.month, group.year)}.`
          );
        }
      }
    }

    const datedEntries = group.entries
      .filter((entry) => entry.info.receivedDate)
      .sort((left, right) => {
        const byDate = String(left.info.receivedDate).localeCompare(String(right.info.receivedDate));
        if (byDate) return byDate;
        return left.info.sequence - right.info.sequence;
      });
    let maxEarlierSequence = 0;
    let maxEarlierEntry = null;
    datedEntries.forEach((entry) => {
      if (
        maxEarlierEntry &&
        entry.info.receivedDate > maxEarlierEntry.info.receivedDate &&
        entry.info.sequence < maxEarlierSequence
      ) {
        addRepairDocumentNumberIssue(
          issueMap,
          entry.record,
          `Cofnięta kolejność: ${group.label}`,
          `${group.label} ${entry.info.number} ma późniejszą datę przyjęcia niż ${maxEarlierEntry.info.number}, ale niższy numer.`
        );
      }
      if (entry.info.sequence > maxEarlierSequence) {
        maxEarlierSequence = entry.info.sequence;
        maxEarlierEntry = entry;
      }
    });
  });

  return issueMap;
}

function mergeDocumentRepairNotes(existingNotes, incomingNotes, sourceTag) {
  const currentNotes = normalizeLoanHistoryText(existingNotes);
  const nextNotes = normalizeLoanHistoryText(incomingNotes);
  if (!currentNotes) return nextNotes;
  if (!nextNotes || normalize(currentNotes).includes(normalize(sourceTag))) return currentNotes;
  return joinTransferNotes(currentNotes, nextNotes);
}

function pricingOrderRepairItemLabel(item) {
  const normalizedItem = normalizePricingOrderItem(item);
  if (!normalizedItem) return "";
  const typeLabel = pricingOrderTypeLabel(normalizedItem.type);
  const quantity = normalizedItem.quantity && normalizedItem.quantity !== "1" ? `${normalizedItem.quantity}x ` : "";
  const description = normalizedItem.description || typeLabel;
  const modelText = description && description !== typeLabel ? ` - ${description}` : "";
  const notesText = normalizedItem.notes ? ` (${normalizedItem.notes})` : "";
  return `${quantity}${typeLabel}${modelText}${notesText}`;
}

function pricingOrderRepairDeviceName(items) {
  return (items || [])
    .map(pricingOrderRepairItemLabel)
    .filter(Boolean)
    .join(" + ");
}

function pricingOrderRepairItemLine(item, index) {
  const itemLabel = pricingOrderRepairItemLabel(item);
  return itemLabel ? `${index + 1}. ${itemLabel}` : "";
}

function pricingComplaintRepairDeviceName(items) {
  return (items || [])
    .map((item) => normalizeLoanHistoryText(item.productName) || pricingComplaintProductTypeLabel(item.productType))
    .filter(Boolean)
    .join(" + ");
}

function pricingComplaintRepairItemLine(item, index) {
  const normalizedItem = normalizePricingComplaintItem(item);
  if (!pricingComplaintItemHasContent(normalizedItem)) return "";
  return [
    `${index + 1}. ${pricingComplaintProductTypeLabel(normalizedItem.productType)}`,
    normalizedItem.productName,
    normalizedItem.serial ? `nr ${normalizedItem.serial}` : "",
    normalizedItem.purchaseDocument ? `FV ${normalizedItem.purchaseDocument}` : "",
    normalizedItem.purchaseDate ? `sprzedaż ${formatDate(normalizedItem.purchaseDate)}` : ""
  ].filter(Boolean).join(" · ");
}

function pricingOrderRepairRecord(entry) {
  const normalizedEntry = normalizePricingOrderHistoryEntry(entry);
  if (!normalizedEntry?.items.length) return null;
  const sourceTag = repairDocumentSourceTag("ORDER", normalizedEntry.number);
  const itemLines = normalizedEntry.items.map(pricingOrderRepairItemLine).filter(Boolean);
  return normalizeRepairRecordForUse({
    id: makeId(),
    sourceDocumentType: "ORDER",
    sourceDocumentId: normalizedEntry.id,
    sourceDocumentNumber: normalizedEntry.number,
    receivedDate: isoDateForSave(normalizedEntry.date) || todayInputValue(),
    category: "ZAMÓWIENIE",
    location: documentLocationToRepairLocation(normalizedEntry.location),
    customerName: normalizedEntry.customer,
    deviceName: pricingOrderRepairDeviceName(normalizedEntry.items) || "Zamówienie",
    serialNumber: "",
    serialNumber2: "",
    status: "PRZYJĘTE",
    sentDate: "",
    returnDate: "",
    pickupDate: "",
    notes: joinTransferNotes(
      sourceTag,
      normalizedEntry.phone ? `Telefon: ${normalizedEntry.phone}` : "",
      itemLines.length ? "Pozycje:" : "",
      ...itemLines,
      normalizedEntry.notes ? `Uwagi: ${normalizedEntry.notes}` : ""
    )
  });
}

function pricingComplaintRepairRecord(entry) {
  const normalizedEntry = normalizePricingComplaintHistoryEntry(entry);
  if (!normalizedEntry) return null;
  const items = normalizePricingComplaintItems(normalizedEntry);
  const sourceTag = repairDocumentSourceTag("COMPLAINT", normalizedEntry.number);
  const itemLines = items.map(pricingComplaintRepairItemLine).filter(Boolean);
  return normalizeRepairRecordForUse({
    id: makeId(),
    sourceDocumentType: "COMPLAINT",
    sourceDocumentId: normalizedEntry.id,
    sourceDocumentNumber: normalizedEntry.number,
    receivedDate: isoDateForSave(normalizedEntry.date) || todayInputValue(),
    category: normalizePricingComplaintRequest(normalizedEntry.request),
    location: documentLocationToRepairLocation(normalizedEntry.location),
    customerName: normalizedEntry.customer,
    deviceName: pricingComplaintRepairDeviceName(items) || "Reklamacja",
    serialNumber: items[0]?.serial || "",
    serialNumber2: items[1]?.serial || "",
    status: "PRZYJĘTE",
    sentDate: "",
    returnDate: "",
    pickupDate: "",
    notes: joinTransferNotes(
      sourceTag,
      normalizedEntry.phone ? `Telefon: ${normalizedEntry.phone}` : "",
      `Żądanie: ${pricingComplaintRequestLabel(normalizedEntry.request)}`,
      itemLines.length ? "Pozycje:" : "",
      ...itemLines,
      normalizedEntry.defect ? `Opis wady: ${normalizedEntry.defect}` : "",
      normalizedEntry.notes ? `Uwagi: ${normalizedEntry.notes}` : ""
    )
  });
}

function mergeDocumentRepairRecord(existingRecord, incomingRecord) {
  if (!existingRecord) return incomingRecord;
  const sourceTag = repairDocumentSourceTag(incomingRecord.sourceDocumentType, incomingRecord.sourceDocumentNumber);
  return normalizeRepairRecordForUse({
    ...existingRecord,
    sourceDocumentType: incomingRecord.sourceDocumentType || existingRecord.sourceDocumentType,
    sourceDocumentId: incomingRecord.sourceDocumentId || existingRecord.sourceDocumentId,
    sourceDocumentNumber: incomingRecord.sourceDocumentNumber || existingRecord.sourceDocumentNumber,
    receivedDate: incomingRecord.receivedDate || existingRecord.receivedDate,
    category: incomingRecord.category || existingRecord.category,
    location: incomingRecord.location || existingRecord.location,
    customerName: incomingRecord.customerName || existingRecord.customerName,
    deviceName: incomingRecord.deviceName || existingRecord.deviceName,
    serialNumber: incomingRecord.serialNumber || existingRecord.serialNumber,
    serialNumber2: incomingRecord.serialNumber2 || existingRecord.serialNumber2,
    status: existingRecord.status || incomingRecord.status,
    notes: mergeDocumentRepairNotes(existingRecord.notes, incomingRecord.notes, sourceTag)
  });
}

function upsertRepairRecordFromDocument(incomingRecord) {
  if (!incomingRecord) return null;
  const existingIndex = repairRecords.findIndex((record) =>
    repairDocumentSourceMatches(
      record,
      incomingRecord.sourceDocumentType,
      incomingRecord.sourceDocumentId,
      incomingRecord.sourceDocumentNumber
    )
  );
  const existingRecord = existingIndex >= 0 ? repairRecords[existingIndex] : null;
  const savedRecord = mergeDocumentRepairRecord(existingRecord, incomingRecord);
  const isNewRecord = !existingRecord;
  repairRecords = existingRecord
    ? repairRecords.map((record, index) => (index === existingIndex ? savedRecord : record))
    : [savedRecord, ...repairRecords];
  localStorage.setItem(REPAIR_STORAGE_KEY, JSON.stringify(repairRecords));
  const persistPromise = persistRepairRecord(savedRecord);
  persistPromise
    .then(() => {
      if (isNewRecord) {
        logAuditEvent({
          notebook: "repairs",
          action: "add",
          recordId: savedRecord.id,
          beforeRecord: null,
          afterRecord: savedRecord
        });
      }
    })
    .catch((error) => console.warn("Nie udało się zsynchronizować wpisu dokumentu z zeszytem napraw:", error));
  rebuildAfterRepairChange();
  render();
  return savedRecord;
}

function syncPricingOrderToRepairNotebook(entry) {
  return upsertRepairRecordFromDocument(pricingOrderRepairRecord(entry));
}

function syncPricingComplaintToRepairNotebook(entry) {
  return upsertRepairRecordFromDocument(pricingComplaintRepairRecord(entry));
}

function createOrderTypeSelect(value) {
  const select = document.createElement("select");
  select.dataset.orderField = "type";
  PRICING_ORDER_TYPES.forEach((type) => {
    const option = document.createElement("option");
    option.value = type;
    option.textContent = pricingOrderTypeLabel(type);
    select.append(option);
  });
  select.value = normalizePricingOrderType(value);
  return select;
}

function addPricingOrderItemRow(item = {}) {
  if (!orderItemsFormBody) return null;
  const normalizedItem = normalizePricingOrderItem(item) || normalizePricingOrderItem({ type: PRICING_ORDER_TYPES[0], quantity: "1" });
  const row = document.createElement("tr");
  row.dataset.orderRow = "1";

  const typeCell = document.createElement("td");
  typeCell.append(createOrderTypeSelect(normalizedItem.type));

  const quantityCell = document.createElement("td");
  const quantityInput = document.createElement("input");
  quantityInput.type = "number";
  quantityInput.min = "1";
  quantityInput.step = "1";
  quantityInput.dataset.orderField = "quantity";
  quantityInput.value = normalizedItem.quantity || "1";
  quantityCell.append(quantityInput);

  const descriptionCell = document.createElement("td");
  const descriptionInput = document.createElement("input");
  descriptionInput.type = "text";
  descriptionInput.dataset.orderField = "description";
  descriptionInput.setAttribute("list", "pricingOfferDeviceList");
  descriptionInput.autocomplete = "off";
  descriptionInput.placeholder = "Model, wkładka, kolor, strona...";
  descriptionInput.value = normalizedItem.description || "";
  descriptionCell.append(descriptionInput);

  const notesCell = document.createElement("td");
  const notesInput = document.createElement("input");
  notesInput.type = "text";
  notesInput.dataset.orderField = "notes";
  notesInput.autocomplete = "off";
  notesInput.placeholder = "Uwagi";
  notesInput.value = normalizedItem.notes || "";
  notesCell.append(notesInput);

  const actionCell = document.createElement("td");
  const removeButton = document.createElement("button");
  removeButton.type = "button";
  removeButton.className = "order-remove-item-btn";
  removeButton.dataset.orderAction = "remove";
  removeButton.textContent = "Usuń";
  actionCell.append(removeButton);

  row.append(typeCell, quantityCell, descriptionCell, notesCell, actionCell);
  orderItemsFormBody.append(row);
  return row;
}

function clearPricingOrderRows() {
  orderItemsFormBody?.replaceChildren();
}

function updatePricingOrderAddButton() {
  if (!addOrderItemBtn) return;
  const rowCount = orderItemsFormBody?.querySelectorAll("[data-order-row]").length || 0;
  const isSecondPosition = rowCount <= 1;
  const label = isSecondPosition ? "Druga pozycja" : "Kolejna pozycja";
  const labelElement = addOrderItemBtn.querySelector("[data-order-add-label]");
  if (labelElement) labelElement.textContent = label;
  addOrderItemBtn.setAttribute(
    "aria-label",
    isSecondPosition ? "Dodaj drugą pozycję zamówienia" : "Dodaj kolejną pozycję zamówienia"
  );
}

function syncPricingOrderDescriptionForType(row) {
  if (!row) return;
  const type = normalizePricingOrderType(row.querySelector("[data-order-field='type']")?.value);
  const descriptionInput = row.querySelector("[data-order-field='description']");
  if (!descriptionInput || descriptionInput.value.trim()) return;
  if (type === "WKŁADKA USZNA" || type === "WKŁADKA PRZECIWWODNA") {
    descriptionInput.value = pricingOrderTypeLabel(type);
  }
}

function handlePricingOrderItemsInput(event) {
  const row = event.target.closest?.("[data-order-row]");
  if (event.target.matches?.("[data-order-field='type']")) syncPricingOrderDescriptionForType(row);
  renderPricingOrder();
}

function handlePricingOrderItemsClick(event) {
  const button = event.target.closest?.("[data-order-action='remove']");
  if (!button) return;
  const row = button.closest("[data-order-row]");
  row?.remove();
  if (!orderItemsFormBody?.querySelector("[data-order-row]")) addPricingOrderItemRow();
  renderPricingOrder();
}

function setOrderOutput(name, value) {
  document.querySelectorAll(`[data-order-out="${name}"]`).forEach((element) => {
    element.textContent = String(value ?? "").trim() || "-";
  });
}

function renderPricingOrderItems(items) {
  if (!orderItemsBody) return;
  const rows = items.map((item, index) => {
    const row = document.createElement("tr");
    const itemLabel = [pricingOrderTypeLabel(item.type), item.description].filter(Boolean).join(" - ");
    appendOfferCell(row, String(index + 1));
    appendOfferCell(row, itemLabel || pricingOrderTypeLabel(item.type), "order-type-cell");
    appendOfferCell(row, item.quantity || "1", "order-quantity-cell");
    appendOfferCell(row, item.notes);
    return row;
  });
  orderItemsBody.replaceChildren(...rows);
}

function renderPricingOrder() {
  if (!pricingOrderView) return;
  ensurePricingOrderDefaults();
  updateDocumentLocationAccent(orderLocationInput);

  const orderDate = isoDateForSave(orderDateInput?.value) || todayInputValue();
  const dateText = formatDate(orderDate) || orderInputValue(orderDateInput);
  const customer = titleCaseName(orderInputValue(orderCustomerInput));
  const items = pricingOrderFormItems();

  if (orderTitle) orderTitle.textContent = customer ? `Zamówienie dla ${customer}` : "Zamówienie";
  if (orderMeta) orderMeta.textContent = `Nr: ${orderInputValue(orderNumberInput) || "-"} | Data: ${dateText || "-"}`;
  setOrderOutput("number", orderInputValue(orderNumberInput));
  setOrderOutput("date", dateText);
  setOrderOutput("customer", customer);
  setOrderOutput("phone", orderInputValue(orderPhoneInput));
  setOrderOutput("location", normalizeDocumentLocationValue(orderInputValue(orderLocationInput)));
  setOrderOutput("notes", orderInputValue(orderNotesInput));

  const hasItems = items.length > 0;
  if (orderEmptyState) orderEmptyState.hidden = hasItems;
  if (orderContent) orderContent.hidden = !hasItems;
  if (printPricingOrderBtn) printPricingOrderBtn.disabled = !hasItems;
  renderPricingOrderItems(items);
  updatePricingOrderAddButton();
}

function copyPricingOfferToOrder() {
  const offerItems = selectedPricingOfferItems();
  if (!offerItems.length) {
    alert("Najpierw wybierz aparat w ofercie.");
    return;
  }

  clearPricingOrderRows();
  offerItems.forEach((item) => {
    addPricingOrderItemRow({
      type: "APARAT SŁUCHOWY",
      quantity: "1",
      description: pricingOfferDeviceName(item.record),
      notes: item.record.manufacturer || ""
    });
  });
  setLoanInputValue(orderCustomerInput, titleCaseName(orderInputValue(offerCustomerInput)), true);
  setLoanInputValue(orderLocationInput, normalizeDocumentLocationValue(offerLocationInput?.value), true);
  const offerDate = isoDateForSave(offerDateInput?.value);
  if (offerDate) setDateInputValue(orderDateInput, offerDate);
  if (orderNumberInput) orderNumberInput.dataset.autoNumber = "1";
  ensurePricingOrderNumber({ force: true });
  switchPricingView("order");
  renderPricingOrder();
}

function resetPricingOrderForm() {
  [orderCustomerInput, orderPhoneInput, orderNotesInput].forEach((input) => {
    if (input) input.value = "";
  });
  if (orderLocationInput) orderLocationInput.value = suggestedDocumentLocation();
  if (orderDateInput) setDateInputValue(orderDateInput, todayInputValue());
  clearPricingOrderRows();
  addPricingOrderItemRow();
  if (orderNumberInput) orderNumberInput.dataset.autoNumber = "1";
  ensurePricingOrderNumber({ force: true });
  renderPricingOrder();
}

function savePricingOrderAndRepairNotebook() {
  renderPricingOrder();
  const historyEntry = saveCurrentPricingOrderToHistory({ silent: true });
  if (!historyEntry) {
    alert("Dodaj przynajmniej jedną pozycję zamówienia.");
    return null;
  }
  syncPricingOrderToRepairNotebook(historyEntry);
  alert("Zamówienie zapisane i przekazane do Naprawy i wkładki.");
  return historyEntry;
}

function printPricingOrder() {
  if (printPricingOrderBtn?.disabled) return;
  renderPricingOrder();
  const cleanup = () => document.body.classList.remove("pricing-order-print");
  document.body.classList.add("pricing-order-print");
  window.addEventListener("afterprint", cleanup, { once: true });
  window.print();
}

function pricingComplaintProductTypeLabel(value) {
  const type = normalizePricingComplaintProductType(value);
  return {
    "APARAT SŁUCHOWY": "Aparat słuchowy",
    "WKŁADKA USZNA": "Wkładka uszna",
    "WKŁADKA PRZECIWWODNA": "Wkładka przeciwwodna",
    INNE: "Inne"
  }[type] || type;
}

function normalizePricingComplaintProductType(value) {
  const normalizedType = normalizeLoanHistoryText(value).toLocaleUpperCase("pl-PL");
  return PRICING_COMPLAINT_PRODUCT_TYPES.includes(normalizedType) ? normalizedType : PRICING_COMPLAINT_PRODUCT_TYPES[0];
}

function pricingComplaintRequestLabel(value) {
  const request = normalizePricingComplaintRequest(value);
  return {
    "NAPRAWA GWARANCYJNA": "Naprawa gwarancyjna",
    "NAPRAWA POGWARANCYJNA": "Naprawa pogwarancyjna"
  }[request] || request;
}

function normalizePricingComplaintRequest(value) {
  const normalizedRequest = normalizeLoanHistoryText(value).toLocaleUpperCase("pl-PL");
  if (normalizedRequest === "NAPRAWA" || normalizedRequest === "GWARANCYJNA") return "NAPRAWA GWARANCYJNA";
  if (normalizedRequest === "POGWARANCYJNA") return "NAPRAWA POGWARANCYJNA";
  return PRICING_COMPLAINT_REQUESTS.includes(normalizedRequest) ? normalizedRequest : PRICING_COMPLAINT_REQUESTS[0];
}

function pricingComplaintRequestTone(value) {
  const request = normalizePricingComplaintRequest(value);
  if (request === "NAPRAWA GWARANCYJNA") return "warranty";
  if (request === "NAPRAWA POGWARANCYJNA") return "out-of-warranty";
  return "";
}

function updatePricingComplaintRequestTone(value) {
  const tone = pricingComplaintRequestTone(value);
  if (complaintRequestInput) complaintRequestInput.dataset.requestTone = tone;
  document.querySelectorAll('[data-complaint-out="request"]').forEach((element) => {
    element.classList.toggle("complaint-request-badge", Boolean(tone));
    element.dataset.requestTone = tone;
  });
}

function complaintItemInputs(slot = 1) {
  return slot === 2
    ? {
        productType: complaintProductTypeInput2,
        productName: complaintProductNameInput2,
        serial: complaintSerialInput2,
        purchaseDocument: complaintPurchaseDocumentInput2,
        purchaseDate: complaintPurchaseDateInput2,
        warrantyHint: complaintWarrantyHint2
      }
    : {
        productType: complaintProductTypeInput,
        productName: complaintProductNameInput,
        serial: complaintSerialInput,
        purchaseDocument: complaintPurchaseDocumentInput,
        purchaseDate: complaintPurchaseDateInput,
        warrantyHint: complaintWarrantyHint1
      };
}

function complaintItemInputGroups() {
  return [complaintItemInputs(1), complaintItemInputs(2)];
}

function selectedComplaintProductNameFromInput(input) {
  const inputValue = complaintInputValue(input);
  const record = findPricingOfferRecord(inputValue);
  return record ? pricingOfferDeviceName(record) : inputValue;
}

function normalizePricingComplaintItem(item = {}) {
  const normalizedItem = {
    productType: normalizePricingComplaintProductType(item.productType),
    productName: normalizeLoanHistoryText(item.productName),
    serial: normalizeLoanHistoryText(item.serial).toLocaleUpperCase("pl-PL"),
    purchaseDocument: normalizeLoanHistoryText(item.purchaseDocument).toLocaleUpperCase("pl-PL"),
    purchaseDate: isoDateForSave(item.purchaseDate) || normalizeLoanHistoryText(item.purchaseDate)
  };
  return normalizedItem;
}

function pricingComplaintItemHasContent(item = {}) {
  const normalizedItem = normalizePricingComplaintItem(item);
  return Boolean(
    normalizedItem.productName ||
    normalizedItem.serial ||
    normalizedItem.purchaseDocument ||
    normalizedItem.purchaseDate
  );
}

function normalizePricingComplaintItems(entry = {}) {
  const rawItems = Array.isArray(entry.items) ? entry.items : [];
  const items = rawItems
    .map(normalizePricingComplaintItem)
    .filter(pricingComplaintItemHasContent)
    .slice(0, 2);

  const legacyItem = normalizePricingComplaintItem({
    productType: entry.productType,
    productName: entry.productName,
    serial: entry.serial,
    purchaseDocument: entry.purchaseDocument,
    purchaseDate: entry.purchaseDate
  });
  if (pricingComplaintItemHasContent(legacyItem) && !items.length) items.push(legacyItem);

  return items;
}

function pricingComplaintHistoryEntryHasContent(entry) {
  const items = normalizePricingComplaintItems(entry);
  return Boolean(
    normalizeLoanHistoryText(entry?.customer) ||
    normalizeLoanHistoryText(entry?.phone) ||
    items.length ||
    normalizeLoanHistoryText(entry?.defect) ||
    normalizeLoanHistoryText(entry?.notes)
  );
}

function normalizePricingComplaintHistoryEntry(entry) {
  if (!entry || typeof entry !== "object") return null;
  const savedAt = normalizeLoanHistoryText(entry.savedAt || entry.updatedAt || entry.createdAt || new Date().toISOString());
  const normalizedEntry = {
    id: normalizeLoanHistoryText(entry.id || makeId()),
    createdAt: normalizeLoanHistoryText(entry.createdAt || savedAt),
    savedAt,
    savedBy: normalizeLoanHistoryText(entry.savedBy || entry.userEmail),
    workstation: normalizeLoanHistoryText(entry.workstation),
    number: normalizeLoanHistoryText(entry.number),
    date: isoDateForSave(entry.date) || normalizeLoanHistoryText(entry.date),
    customer: titleCaseName(entry.customer || ""),
    phone: normalizeLoanHistoryText(entry.phone),
    location: normalizeDocumentLocationValue(entry.location),
    items: normalizePricingComplaintItems(entry),
    request: normalizePricingComplaintRequest(entry.request),
    defect: normalizeLoanHistoryText(entry.defect),
    notes: normalizeLoanHistoryText(entry.notes)
  };
  const firstItem = normalizedEntry.items[0] || normalizePricingComplaintItem();
  normalizedEntry.productType = firstItem.productType;
  normalizedEntry.productName = firstItem.productName || "";
  normalizedEntry.serial = firstItem.serial || "";
  normalizedEntry.purchaseDocument = firstItem.purchaseDocument || "";
  normalizedEntry.purchaseDate = firstItem.purchaseDate || "";
  return pricingComplaintHistoryEntryHasContent(normalizedEntry) ? normalizedEntry : null;
}

function normalizePricingComplaintHistory(entries) {
  if (!Array.isArray(entries)) return [];
  const normalizedEntries = [];
  const seenIds = new Set();
  entries.forEach((entry) => {
    const normalizedEntry = normalizePricingComplaintHistoryEntry(entry);
    if (!normalizedEntry || seenIds.has(normalizedEntry.id)) return;
    seenIds.add(normalizedEntry.id);
    normalizedEntries.push(normalizedEntry);
  });
  return normalizedEntries
    .sort((left, right) => String(right.date || right.savedAt).localeCompare(String(left.date || left.savedAt)))
    .slice(0, MAX_PRICING_COMPLAINT_HISTORY);
}

function loadPricingComplaintHistory() {
  try {
    return normalizePricingComplaintHistory(JSON.parse(localStorage.getItem(PRICING_COMPLAINT_HISTORY_STORAGE_KEY) || "[]"));
  } catch (error) {
    console.warn(error);
    localStorage.removeItem(PRICING_COMPLAINT_HISTORY_STORAGE_KEY);
    return [];
  }
}

function saveLocalPricingComplaintHistory() {
  pricingComplaintHistory = normalizePricingComplaintHistory(pricingComplaintHistory);
  localStorage.setItem(PRICING_COMPLAINT_HISTORY_STORAGE_KEY, JSON.stringify(pricingComplaintHistory));
}

function mergePricingComplaintHistory(...historySets) {
  return normalizePricingComplaintHistory(historySets.flat());
}

async function loadSupabasePricingComplaintHistory() {
  if (!hasSupabaseConfig || !currentSupabaseUser || pricingComplaintHistorySupabaseAvailable === false) return null;

  try {
    const sharedHistory = await loadSupabaseTable(SUPABASE_COMPLAINT_HISTORY_TABLE, normalizePricingComplaintHistory);
    pricingComplaintHistorySupabaseAvailable = true;
    pricingComplaintHistory = mergePricingComplaintHistory(sharedHistory, pricingComplaintHistory);
    saveLocalPricingComplaintHistory();
    rebuildCustomerNameSuggestions();
    if (complaintNumberInput?.dataset.autoNumber === "1") ensurePricingComplaintNumber({ force: true });
    return pricingComplaintHistory;
  } catch (error) {
    console.warn("Historia reklamacji działa lokalnie, bez tabeli Supabase:", error?.message || error);
    if (isMissingSupabaseTableError(error)) pricingComplaintHistorySupabaseAvailable = false;
    return null;
  }
}

async function persistPricingComplaintHistoryEntry(entry, { silent = false } = {}) {
  if (!hasSupabaseConfig || !currentSupabaseUser || pricingComplaintHistorySupabaseAvailable === false) return;

  try {
    const { error } = await supabaseClient.from(SUPABASE_COMPLAINT_HISTORY_TABLE).upsert(supabaseRecordRow(entry), { onConflict: "id" });
    if (error) throw error;
    pricingComplaintHistorySupabaseAvailable = true;
  } catch (error) {
    if (isMissingSupabaseTableError(error)) {
      pricingComplaintHistorySupabaseAvailable = false;
      console.warn("Reklamacja zapisana lokalnie. Brakuje tabeli Supabase:", error.message);
      return;
    }
    console.warn("Reklamacja zapisana lokalnie, bez synchronizacji Supabase:", error.message);
    if (!silent) alert("Reklamacja zapisana lokalnie. Supabase nie przyjął historii reklamacji, sprawdź połączenie.");
  }
}

function nextPricingComplaintNumber(dateValue, ignoredId = "") {
  const target = loanContractDateParts(dateValue) || loanContractDateParts(todayInputValue());
  const targetMonth = target?.month || new Date().getMonth() + 1;
  const targetYear = target?.year || new Date().getFullYear();
  const maxSequence = pricingComplaintHistory.reduce((maxValue, entry) => {
    if (ignoredId && entry.id === ignoredId) return maxValue;
    const numberParts = loanContractNumberParts(entry.number);
    if (!numberParts) return maxValue;
    const dateParts = loanContractDateParts(entry.date);
    const entryMonth = dateParts?.month || numberParts.month;
    const entryYear = dateParts?.year || numberParts.year || targetYear;
    if (entryMonth !== targetMonth || entryYear !== targetYear) return maxValue;
    return Math.max(maxValue, numberParts.sequence);
  }, 0);

  return monthlyDocumentNumber(maxSequence + 1, targetMonth, targetYear);
}

function complaintInputValue(input) {
  return loanInputValue(input);
}

function ensurePricingComplaintNumber({ force = false } = {}) {
  if (!complaintNumberInput) return;
  const currentNumber = complaintInputValue(complaintNumberInput);
  const isAutoNumber = complaintNumberInput.dataset.autoNumber === "1";
  if (currentNumber && !force && !isAutoNumber) return;
  const dateValue = isoDateForSave(complaintDateInput?.value) || todayInputValue();
  complaintNumberInput.value = nextPricingComplaintNumber(dateValue);
  complaintNumberInput.dataset.autoNumber = "1";
}

function ensurePricingComplaintDefaults() {
  const today = todayInputValue();
  if (!complaintInputValue(complaintDateInput)) setDateInputValue(complaintDateInput, today);
  if (!complaintInputValue(complaintLocationInput)) complaintLocationInput.value = suggestedDocumentLocation();
  else complaintLocationInput.value = normalizeDocumentLocationValue(complaintLocationInput.value);
  if (!complaintInputValue(complaintProductTypeInput)) complaintProductTypeInput.value = PRICING_COMPLAINT_PRODUCT_TYPES[0];
  if (!complaintInputValue(complaintProductTypeInput2)) complaintProductTypeInput2.value = PRICING_COMPLAINT_PRODUCT_TYPES[0];
  if (!complaintInputValue(complaintRequestInput)) complaintRequestInput.value = PRICING_COMPLAINT_REQUESTS[0];
  ensurePricingComplaintNumber();
}

function selectedComplaintProductName() {
  return selectedComplaintProductNameFromInput(complaintProductNameInput);
}

function complaintFormItem(slot = 1) {
  const inputs = complaintItemInputs(slot);
  return normalizePricingComplaintItem({
    productType: complaintInputValue(inputs.productType),
    productName: selectedComplaintProductNameFromInput(inputs.productName),
    serial: complaintInputValue(inputs.serial),
    purchaseDocument: complaintInputValue(inputs.purchaseDocument),
    purchaseDate: isoDateForSave(inputs.purchaseDate?.value) || complaintInputValue(inputs.purchaseDate)
  });
}

function complaintFormItems({ includeBlank = false } = {}) {
  return [complaintFormItem(1), complaintFormItem(2)]
    .filter((item) => includeBlank || pricingComplaintItemHasContent(item));
}

function setComplaintItemFields(slot = 1, item = {}) {
  const inputs = complaintItemInputs(slot);
  const normalizedItem = normalizePricingComplaintItem(item);
  if (inputs.productType) {
    inputs.productType.value = normalizedItem.productType || PRICING_COMPLAINT_PRODUCT_TYPES[0];
    inputs.productType.dataset.complaintAutofilled = "";
  }
  if (inputs.productName) {
    inputs.productName.value = normalizedItem.productName || "";
    inputs.productName.dataset.complaintAutofilled = "";
  }
  if (inputs.serial) {
    inputs.serial.value = normalizedItem.serial || "";
    inputs.serial.dataset.complaintAutofilled = "";
  }
  if (inputs.purchaseDocument) {
    inputs.purchaseDocument.value = normalizedItem.purchaseDocument || "";
    inputs.purchaseDocument.dataset.complaintAutofilled = "";
  }
  if (inputs.purchaseDate) {
    setDateInputValue(inputs.purchaseDate, normalizedItem.purchaseDate || "");
    inputs.purchaseDate.dataset.complaintAutofilled = "";
  }
  if (inputs.warrantyHint) {
    inputs.warrantyHint.hidden = true;
    inputs.warrantyHint.textContent = "";
    inputs.warrantyHint.classList.remove("warning");
  }
}

function clearComplaintItem(slot = 1) {
  setComplaintItemFields(slot, { productType: PRICING_COMPLAINT_PRODUCT_TYPES[0] });
}

function complaintItemCanBeCustomerAutofilled(slot = 1) {
  const inputs = complaintItemInputs(slot);
  const item = complaintFormItem(slot);
  if (!pricingComplaintItemHasContent(item)) return true;
  return [
    inputs.productName,
    inputs.serial,
    inputs.purchaseDocument,
    inputs.purchaseDate
  ].every((input) => !complaintInputValue(input) || input.dataset.complaintAutofilled === "1");
}

function removePricingComplaintItem(slot = 1) {
  if (slot === 1 && pricingComplaintItemHasContent(complaintFormItem(2))) {
    setComplaintItemFields(1, complaintFormItem(2));
    clearComplaintItem(2);
  } else {
    clearComplaintItem(slot);
  }
  syncComplaintRequestFromWarranty();
  updateComplaintWarrantyHints();
  renderPricingComplaint();
}

function currentPricingComplaintSnapshot() {
  ensurePricingComplaintDefaults();
  const now = new Date().toISOString();
  const items = complaintFormItems();
  const firstItem = items[0] || normalizePricingComplaintItem();
  return {
    id: makeId(),
    createdAt: now,
    savedAt: now,
    savedBy: currentSupabaseUser?.email || "",
    workstation: currentWorkstationName(),
    number: complaintInputValue(complaintNumberInput),
    date: isoDateForSave(complaintDateInput?.value) || complaintInputValue(complaintDateInput),
    customer: titleCaseName(complaintInputValue(complaintCustomerInput)),
    phone: complaintInputValue(complaintPhoneInput),
    location: normalizeDocumentLocationValue(complaintInputValue(complaintLocationInput)),
    items,
    productType: firstItem.productType,
    productName: firstItem.productName,
    serial: firstItem.serial,
    purchaseDocument: firstItem.purchaseDocument,
    purchaseDate: firstItem.purchaseDate,
    request: normalizePricingComplaintRequest(complaintInputValue(complaintRequestInput)),
    defect: complaintInputValue(complaintDefectInput),
    notes: complaintInputValue(complaintNotesInput)
  };
}

function pricingComplaintSnapshotKey(entry) {
  const itemsKey = (entry?.items || [])
    .map((item) => [
      item?.productType,
      item?.productName,
      item?.serial,
      item?.purchaseDocument,
      item?.purchaseDate
    ].map((value) => normalize(value)).join(":"))
    .join("|");
  return [
    entry?.number,
    entry?.date,
    entry?.customer,
    itemsKey,
    entry?.defect
  ].map((value) => normalize(value)).join("|");
}

function saveCurrentPricingComplaintToHistory({ silent = false } = {}) {
  const snapshot = normalizePricingComplaintHistoryEntry(currentPricingComplaintSnapshot());
  if (!snapshot) {
    if (!silent) alert("Uzupełnij klienta, produkt albo opis, żeby zapisać reklamację w historii.");
    return null;
  }
  const now = new Date().toISOString();
  const snapshotKey = pricingComplaintSnapshotKey(snapshot);
  const existingEntry = pricingComplaintHistory.find((entry) => pricingComplaintSnapshotKey(entry) === snapshotKey || entry.number === snapshot.number);
  const historyEntry = normalizePricingComplaintHistoryEntry({
    ...snapshot,
    id: existingEntry?.id || snapshot.id,
    createdAt: existingEntry?.createdAt || snapshot.createdAt,
    savedAt: now,
    savedBy: currentSupabaseUser?.email || snapshot.savedBy,
    workstation: currentWorkstationName() || snapshot.workstation
  });
  if (!historyEntry) return null;
  pricingComplaintHistory = [
    historyEntry,
    ...pricingComplaintHistory.filter((entry) => entry.id !== historyEntry.id)
  ].slice(0, MAX_PRICING_COMPLAINT_HISTORY);
  saveLocalPricingComplaintHistory();
  recordDocumentLocationUsage(historyEntry.location, historyEntry.workstation);
  rebuildCustomerNameSuggestions();
  persistPricingComplaintHistoryEntry(historyEntry, { silent });
  renderPricingDocumentHistory();
  return historyEntry;
}

function setComplaintOutput(name, value) {
  document.querySelectorAll(`[data-complaint-out="${name}"]`).forEach((element) => {
    element.textContent = String(value ?? "").trim() || "-";
  });
}

function complaintSaleDateSortValue(record) {
  return soldDeviceSaleDate(record) || isoDateForSave(record?.pickupDate) || isoDateForSave(record?.receivedDate) || "";
}

function soldDeviceMatchesForSerial(serialNumber) {
  const checkedSerial = serialDuplicateKey(serialNumber);
  if (!checkedSerial) return [];
  return records
    .filter((record) => serialDuplicateKey(record.serialNumber) === checkedSerial)
    .filter((record) => displayType(record) === "SPRZEDANY" || Boolean(String(record.salesInvoice ?? "").trim()))
    .sort((left, right) => {
      const byDate = String(complaintSaleDateSortValue(right)).localeCompare(String(complaintSaleDateSortValue(left)));
      if (byDate) return byDate;
      return collator.compare(String(right.salesInvoice || ""), String(left.salesInvoice || ""));
    });
}

function complaintDeviceMatchesForCustomer(customerName) {
  const customerKey = customerNameLookupKey(customerName);
  if (!customerKey) return [];
  return records
    .filter((record) => {
      if (customerNameLookupKey(record.customerName) !== customerKey) return false;
      return displayType(record) === "SPRZEDANY" || Boolean(String(record.salesInvoice ?? "").trim());
    })
    .sort((left, right) => {
      const rightDate = complaintSaleDateSortValue(right);
      const leftDate = complaintSaleDateSortValue(left);
      const byDate = String(rightDate).localeCompare(String(leftDate));
      if (byDate) return byDate;
      const rightHasSerial = normalizeSerialNumber(right.serialNumber) ? 1 : 0;
      const leftHasSerial = normalizeSerialNumber(left.serialNumber) ? 1 : 0;
      return rightHasSerial - leftHasSerial;
    });
}

function complaintCustomerDeviceLabel(record) {
  const saleDate = soldDeviceSaleDate(record);
  return [
    record.deviceName || "bez modelu",
    normalizeSerialNumber(record.serialNumber),
    saleDate ? formatDate(saleDate) : "",
    normalizeSalesInvoice(record.salesInvoice),
    record.location ? normalizeRepairLocation(record.location) : ""
  ].filter(Boolean).join(" · ");
}

function updateComplaintCustomerDevicePickerActions() {
  const disabled = !complaintCustomerDeviceSelect?.value;
  if (complaintUseDeviceItem1Btn) complaintUseDeviceItem1Btn.disabled = disabled;
  if (complaintUseDeviceItem2Btn) complaintUseDeviceItem2Btn.disabled = disabled;
}

function updateComplaintCustomerDevicePicker(matches = []) {
  if (!complaintCustomerDevicePicker || !complaintCustomerDeviceSelect) return;
  const currentValue = complaintCustomerDeviceSelect.value;
  const uniqueMatches = [];
  const seenIds = new Set();
  matches.forEach((record) => {
    if (!record?.id || seenIds.has(record.id)) return;
    seenIds.add(record.id);
    uniqueMatches.push(record);
  });

  if (!uniqueMatches.length) {
    complaintCustomerDevicePicker.hidden = true;
    complaintCustomerDeviceSelect.replaceChildren();
    updateComplaintCustomerDevicePickerActions();
    return;
  }

  const fragment = document.createDocumentFragment();
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Wybierz model z Bazy";
  fragment.append(placeholder);

  uniqueMatches.forEach((record) => {
    const option = document.createElement("option");
    option.value = record.id;
    option.textContent = complaintCustomerDeviceLabel(record);
    fragment.append(option);
  });

  complaintCustomerDeviceSelect.replaceChildren(fragment);
  if (uniqueMatches.some((record) => record.id === currentValue)) {
    complaintCustomerDeviceSelect.value = currentValue;
  } else {
    complaintCustomerDeviceSelect.value = uniqueMatches[0]?.id || "";
  }
  complaintCustomerDevicePicker.hidden = false;
  updateComplaintCustomerDevicePickerActions();
}

function complaintWarrantyRequestForInfo(info) {
  if (!info?.saleDate) return "";
  return info.inWarranty ? "NAPRAWA GWARANCYJNA" : "NAPRAWA POGWARANCYJNA";
}

function complaintWarrantyInfoForItem(item) {
  const normalizedItem = normalizePricingComplaintItem(item);
  const match = soldDeviceMatchesForSerial(normalizedItem.serial)[0] || null;
  const saleDate = (match && soldDeviceSaleDate(match)) || isoDateForSave(normalizedItem.purchaseDate) || "";
  const warrantyEnd = saleDate ? addMonthsToIsoDate(saleDate, REPAIR_WARRANTY_MONTHS) : "";
  const checkDate = isoDateForSave(complaintDateInput?.value) || todayInputValue();
  return {
    match,
    saleDate,
    warrantyEnd,
    checkDate,
    inWarranty: Boolean(saleDate && warrantyEnd && checkDate <= warrantyEnd),
    source: match && soldDeviceSaleDate(match) ? "database" : saleDate ? "manual" : ""
  };
}

function complaintSuggestedRequestForItems(items) {
  const filledItems = (items || []).filter(pricingComplaintItemHasContent);
  if (!filledItems.length) return "";
  const infos = filledItems.map(complaintWarrantyInfoForItem);
  if (infos.some((info) => !info.saleDate)) return "";
  if (infos.every((info) => info.inWarranty)) return "NAPRAWA GWARANCYJNA";
  if (infos.every((info) => !info.inWarranty)) return "NAPRAWA POGWARANCYJNA";
  return "";
}

function syncComplaintRequestFromWarranty(items = complaintFormItems()) {
  if (!complaintRequestInput || complaintRequestInput.dataset.userChanged === "1") return false;
  const suggestion = complaintSuggestedRequestForItems(items);
  if (!suggestion || complaintRequestInput.value === suggestion) return false;
  complaintRequestInput.value = suggestion;
  complaintRequestInput.dataset.complaintAutofilled = "1";
  return true;
}

function updateComplaintWarrantyHints(items = complaintFormItems({ includeBlank: true })) {
  const normalizedItems = [items[0] || normalizePricingComplaintItem(), items[1] || normalizePricingComplaintItem()];
  const selectedRequest = normalizePricingComplaintRequest(complaintInputValue(complaintRequestInput));

  normalizedItems.forEach((item, index) => {
    const hint = complaintItemInputs(index + 1).warrantyHint;
    if (!hint) return;
    hint.classList.remove("warning");
    if (!pricingComplaintItemHasContent(item)) {
      hint.hidden = true;
      hint.textContent = "";
      return;
    }

    const info = complaintWarrantyInfoForItem(item);
    const suggestedRequest = complaintWarrantyRequestForInfo(info);
    const parts = [];
    if (info.match) {
      parts.push(`Z Bazy: sprzedaż ${formatDate(info.saleDate) || "brak daty"}`);
      if (info.match.salesInvoice) parts.push(`FV ${normalizeSalesInvoice(info.match.salesInvoice)}`);
      if (info.match.location) parts.push(normalizeRepairLocation(info.match.location));
    } else if (item.serial) {
      parts.push(`Nie znaleziono sprzedaży w Bazie dla nr ${item.serial}`);
    }
    if (info.saleDate && !info.match) parts.push(`Wg wpisanej daty sprzedaży ${formatDate(info.saleDate)}`);
    if (info.warrantyEnd) parts.push(`gwarancja do ${formatDate(info.warrantyEnd)}`);
    if (suggestedRequest) parts.push(`sugerowane: ${pricingComplaintRequestLabel(suggestedRequest)}`);

    const conflict =
      (selectedRequest === "NAPRAWA GWARANCYJNA" && suggestedRequest === "NAPRAWA POGWARANCYJNA") ||
      (selectedRequest === "NAPRAWA POGWARANCYJNA" && suggestedRequest === "NAPRAWA GWARANCYJNA");
    if (conflict) {
      hint.classList.add("warning");
      parts.push("sprawdź żądanie");
    }

    hint.textContent = parts.filter(Boolean).join(" · ");
    hint.hidden = !hint.textContent;
  });
}

function setComplaintAutofillValue(input, value, { date = false, overwrite = false, transform = (text) => text } = {}) {
  if (!input) return false;
  const text = normalizeLoanHistoryText(value);
  if (!text) return false;
  const canAutofill = overwrite || !complaintInputValue(input) || input.dataset.complaintAutofilled === "1";
  if (!canAutofill) return false;
  if (date) {
    const isoDate = isoDateForSave(text);
    if (!isoDate) return false;
    setDateInputValue(input, isoDate);
  } else {
    input.value = transform(text);
  }
  input.dataset.complaintAutofilled = "1";
  return true;
}

function updateComplaintCustomerMatchHint(matchCount, matchedRecords = [], changed = false) {
  if (!complaintCustomerMatchHint) return;
  const matches = Array.isArray(matchedRecords) ? matchedRecords.filter(Boolean) : [matchedRecords].filter(Boolean);
  if (!matchCount || !matches.length) {
    complaintCustomerMatchHint.hidden = true;
    complaintCustomerMatchHint.textContent = "";
    return;
  }
  const details = matches
    .slice(0, 2)
    .map((record) => {
      const saleDate = soldDeviceSaleDate(record);
      return [
        record.deviceName,
        normalizeSerialNumber(record.serialNumber),
        saleDate ? formatDate(saleDate) : "",
        normalizeSalesInvoice(record.salesInvoice)
      ].filter(Boolean).join(" · ");
    })
    .filter(Boolean)
    .join(" | ");
  const prefix = changed ? "Uzupełniono z bazy" : "Znaleziono w bazie";
  const suffix = matchCount > matches.length ? `Znaleziono ${matchCount} sprzedane wpisy, uzupełniono pierwsze dwie pozycje.` : "";
  complaintCustomerMatchHint.textContent = [prefix, details, suffix].filter(Boolean).join(". ");
  complaintCustomerMatchHint.hidden = false;
}

function fillComplaintFromDeviceRecord(record, slot = 1, { overwrite = false } = {}) {
  if (!record) return false;
  const inputs = complaintItemInputs(slot);
  let changed = false;
  if (inputs.productType && (overwrite || !complaintInputValue(inputs.productType) || inputs.productType.dataset.complaintAutofilled === "1")) {
    inputs.productType.value = "APARAT SŁUCHOWY";
    inputs.productType.dataset.complaintAutofilled = "1";
    changed = true;
  }
  changed = setComplaintAutofillValue(inputs.productName, record.deviceName, { overwrite }) || changed;
  changed = setComplaintAutofillValue(inputs.serial, record.serialNumber, {
    overwrite,
    transform: (text) => normalizeSerialNumber(text)
  }) || changed;
  changed = setComplaintAutofillValue(inputs.purchaseDocument, record.salesInvoice, {
    overwrite,
    transform: (text) => normalizeSalesInvoice(text)
  }) || changed;
  changed = setComplaintAutofillValue(inputs.purchaseDate, soldDeviceSaleDate(record), { date: true, overwrite }) || changed;
  if (complaintLocationInput && record.location && (overwrite || !complaintInputValue(complaintLocationInput) || complaintLocationInput.dataset.complaintAutofilled === "1")) {
    complaintLocationInput.value = normalizeDocumentLocationValue(record.location);
    complaintLocationInput.dataset.complaintAutofilled = "1";
    changed = true;
  }
  return changed;
}

function selectedComplaintCustomerDeviceRecord() {
  const selectedId = complaintCustomerDeviceSelect?.value || "";
  if (!selectedId) return null;
  return records.find((record) => record.id === selectedId) || null;
}

function useComplaintCustomerDevice(slot = 1) {
  const record = selectedComplaintCustomerDeviceRecord();
  if (!record) return;
  fillComplaintFromDeviceRecord(record, slot, { overwrite: true });
  updateComplaintCustomerMatchHint(1, [record], true);
  syncComplaintRequestFromWarranty();
  renderPricingComplaint();
}

function syncPricingComplaintFromCustomer() {
  const customer = titleCaseName(complaintInputValue(complaintCustomerInput));
  if (!customer) {
    updateComplaintCustomerMatchHint(0);
    updateComplaintCustomerDevicePicker([]);
    return false;
  }
  const matches = complaintDeviceMatchesForCustomer(customer);
  if (!matches.length) {
    updateComplaintCustomerMatchHint(0);
    updateComplaintCustomerDevicePicker([]);
    return false;
  }
  updateComplaintCustomerDevicePicker(matches);
  let changed = false;
  const matchedRows = matches.slice(0, 2);
  [1, 2].forEach((slot) => {
    const record = matchedRows[slot - 1];
    const canAutofill = complaintItemCanBeCustomerAutofilled(slot);
    if (record) {
      changed = fillComplaintFromDeviceRecord(record, slot, { overwrite: canAutofill }) || changed;
    } else if (canAutofill && pricingComplaintItemHasContent(complaintFormItem(slot))) {
      clearComplaintItem(slot);
      changed = true;
    }
  });
  updateComplaintCustomerMatchHint(matches.length, matchedRows, changed);
  syncComplaintRequestFromWarranty();
  renderPricingComplaint();
  return true;
}

function syncComplaintItemFromSerial(slot = 1) {
  const inputs = complaintItemInputs(slot);
  const serial = complaintInputValue(inputs.serial);
  if (!serial) {
    updateComplaintWarrantyHints();
    renderPricingComplaint();
    return false;
  }
  const match = soldDeviceMatchesForSerial(serial)[0];
  if (!match) {
    updateComplaintWarrantyHints();
    renderPricingComplaint();
    return false;
  }
  const changed = fillComplaintFromDeviceRecord(match, slot);
  updateComplaintCustomerMatchHint(1, [match], changed);
  syncComplaintRequestFromWarranty();
  renderPricingComplaint();
  return true;
}

function complaintWarrantyTableLabel(item) {
  const info = complaintWarrantyInfoForItem(item);
  if (!info.saleDate) return item.serial ? "brak sprzedaży w Bazie" : "";
  if (!info.warrantyEnd) return "";
  return info.inWarranty
    ? `do ${formatDate(info.warrantyEnd)}`
    : `po gwarancji (${formatDate(info.warrantyEnd)})`;
}

function renderPricingComplaintProducts(items) {
  if (!complaintProductsBody) return;
  const visibleItems = (items || []).filter(pricingComplaintItemHasContent);
  if (!visibleItems.length) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 7;
    cell.textContent = "Brak pozycji";
    cell.className = "muted-cell";
    row.append(cell);
    renderTableRows(complaintProductsBody, [row]);
    return;
  }

  const rows = visibleItems.map((item, index) => {
    const row = document.createElement("tr");
    appendOfferCell(row, String(index + 1), "complaint-products-lp");
    appendOfferCell(row, pricingComplaintProductTypeLabel(item.productType));
    appendOfferCell(row, item.productName);
    appendOfferCell(row, item.serial, "complaint-products-serial");
    appendOfferCell(row, item.purchaseDocument);
    appendOfferCell(row, formatDate(item.purchaseDate) || item.purchaseDate);
    appendOfferCell(row, complaintWarrantyTableLabel(item));
    return row;
  });
  renderTableRows(complaintProductsBody, rows);
}

function renderPricingComplaint() {
  if (!pricingComplaintView) return;
  ensurePricingComplaintDefaults();
  updateDocumentLocationAccent(complaintLocationInput);

  const complaintDate = isoDateForSave(complaintDateInput?.value) || todayInputValue();
  const dateText = formatDate(complaintDate) || complaintInputValue(complaintDateInput);
  const customer = titleCaseName(complaintInputValue(complaintCustomerInput));
  const items = complaintFormItems();
  syncComplaintRequestFromWarranty(items);
  updateComplaintWarrantyHints(complaintFormItems({ includeBlank: true }));
  const request = normalizePricingComplaintRequest(complaintInputValue(complaintRequestInput));
  updatePricingComplaintRequestTone(request);
  const firstItem = items[0] || normalizePricingComplaintItem({
    productType: complaintInputValue(complaintProductTypeInput),
    productName: selectedComplaintProductName()
  });

  if (complaintTitle) complaintTitle.textContent = customer ? `Reklamacja - ${customer}` : "Reklamacja";
  if (complaintMeta) complaintMeta.textContent = `Nr: ${complaintInputValue(complaintNumberInput) || "-"} | Data: ${dateText || "-"}`;
  setComplaintOutput("number", complaintInputValue(complaintNumberInput));
  setComplaintOutput("date", dateText);
  setComplaintOutput("location", normalizeDocumentLocationValue(complaintInputValue(complaintLocationInput)));
  setComplaintOutput("customer", customer);
  setComplaintOutput("phone", complaintInputValue(complaintPhoneInput));
  setComplaintOutput("request", pricingComplaintRequestLabel(request));
  setComplaintOutput("productType", pricingComplaintProductTypeLabel(firstItem.productType));
  setComplaintOutput("productName", firstItem.productName);
  setComplaintOutput("serial", firstItem.serial);
  setComplaintOutput("purchaseDocument", firstItem.purchaseDocument);
  setComplaintOutput("purchaseDate", formatDate(firstItem.purchaseDate) || firstItem.purchaseDate);
  setComplaintOutput("defect", complaintInputValue(complaintDefectInput));
  setComplaintOutput("notes", complaintInputValue(complaintNotesInput));
  renderPricingComplaintProducts(items);
}

function syncComplaintProductNameForType(slot = 1) {
  const inputs = complaintItemInputs(slot);
  if (!inputs.productName) return;
  const productType = normalizePricingComplaintProductType(inputs.productType?.value);
  if (productType === "WKŁADKA USZNA" || productType === "WKŁADKA PRZECIWWODNA") {
    const canAutofill = !complaintInputValue(inputs.productName) || inputs.productName.dataset.complaintAutofilled === "1";
    if (!canAutofill) return;
    inputs.productName.value = pricingComplaintProductTypeLabel(productType);
    inputs.productName.dataset.complaintAutofilled = "1";
  }
}

function resetPricingComplaintForm() {
  [
    complaintCustomerInput,
    complaintPhoneInput,
    complaintProductNameInput,
    complaintSerialInput,
    complaintPurchaseDocumentInput,
    complaintPurchaseDateInput,
    complaintProductNameInput2,
    complaintSerialInput2,
    complaintPurchaseDocumentInput2,
    complaintPurchaseDateInput2,
    complaintDefectInput,
    complaintNotesInput
  ].forEach((input) => {
    if (input) {
      input.value = "";
      input.dataset.complaintAutofilled = "";
    }
  });
  if (complaintLocationInput) {
    complaintLocationInput.value = suggestedDocumentLocation();
    complaintLocationInput.dataset.complaintAutofilled = "";
  }
  if (complaintProductTypeInput) {
    complaintProductTypeInput.value = PRICING_COMPLAINT_PRODUCT_TYPES[0];
    complaintProductTypeInput.dataset.complaintAutofilled = "";
  }
  if (complaintProductTypeInput2) {
    complaintProductTypeInput2.value = PRICING_COMPLAINT_PRODUCT_TYPES[0];
    complaintProductTypeInput2.dataset.complaintAutofilled = "";
  }
  if (complaintRequestInput) {
    complaintRequestInput.value = PRICING_COMPLAINT_REQUESTS[0];
    complaintRequestInput.dataset.userChanged = "";
    complaintRequestInput.dataset.complaintAutofilled = "";
  }
  updateComplaintCustomerMatchHint(0);
  updateComplaintCustomerDevicePicker([]);
  updateComplaintWarrantyHints([]);
  if (complaintDateInput) setDateInputValue(complaintDateInput, todayInputValue());
  if (complaintNumberInput) complaintNumberInput.dataset.autoNumber = "1";
  ensurePricingComplaintNumber({ force: true });
  renderPricingComplaint();
}

function savePricingComplaintAndRepairNotebook() {
  renderPricingComplaint();
  const historyEntry = saveCurrentPricingComplaintToHistory({ silent: true });
  if (!historyEntry) {
    alert("Uzupełnij klienta, produkt albo opis, żeby zapisać reklamację.");
    return null;
  }
  syncPricingComplaintToRepairNotebook(historyEntry);
  alert("Reklamacja zapisana i przekazana do Naprawy i wkładki.");
  return historyEntry;
}

function printPricingComplaint() {
  renderPricingComplaint();
  const cleanup = () => document.body.classList.remove("pricing-complaint-print");
  document.body.classList.add("pricing-complaint-print");
  window.addEventListener("afterprint", cleanup, { once: true });
  window.print();
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
  if (!dataControlIssuesCache) {
    renderDataControlLoading();
    if (dataControlBuildScheduled) return;
    dataControlBuildScheduled = true;
    const token = dataControlRenderToken;
    const startBuild = () => {
      window.setTimeout(() => {
        dataControlBuildScheduled = false;
        if (token !== dataControlRenderToken) return;
        dataControlIssuesCache = buildDataControlIssues();
        renderDataControlResults(dataControlIssuesCache);
      }, 0);
    };

    if (window.requestAnimationFrame) {
      window.requestAnimationFrame(startBuild);
    } else {
      startBuild();
    }
    return;
  }

  renderDataControlResults(dataControlIssuesCache);
}

function renderDataControlLoading() {
  dataControlSummary.textContent = "Sprawdzam dane...";
  dataControlStats.replaceChildren();
  renderTableRows(dataControlBody, []);
  dataControlEmptyState.hidden = true;
  renderLimitNotice(dataControlRenderNotice, dataControlRenderText, 0, 0, "spraw");
  updateDataControlTopStats([]);
}

function renderDataControlResults(allIssues) {
  const issues = filteredDataControlIssues(allIssues);
  const renderedIssues = visibleTableItems(issues, "dataControl");

  updateDataControlTopStats(issues);
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
  const duplicateIndex = createDataControlDuplicateIndex();

  records.forEach((record) => {
    const duplicateMatches = dataControlDuplicateSerialMatches(record, "devices", duplicateIndex);
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
        duplicateSerialSummary(duplicateMatches),
        { duplicateMatches }
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
    if (type === "SPRZEDANY" && !["REALIZACJA", "BEZ REFUNDACJI"].includes(ezwm)) {
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
    const duplicateMatches = dataControlDuplicateSerialMatches(record, "demo", duplicateIndex);
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
        duplicateSerialSummary(duplicateMatches),
        { duplicateMatches }
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

  repairRecords.forEach((record) => {
    const meta = repairDerived.get(record.id);
    (meta?.documentNumberIssues || []).forEach((issue) => {
      addDataControlIssue(
        issues,
        record,
        "repairs",
        issue.severity || "warning",
        issue.kind || "repair-document-number",
        issue.title,
        issue.detail
      );
    });
  });

  return issues.sort(compareDataControlIssues);
}

function addDataControlIssue(issues, record, source, severity, kind, title, detail, extra = {}) {
  issues.push({
    id: `${source}-${record.id}-${kind}-${title}`,
    record,
    source,
    severity,
    kind,
    title,
    detail,
    serialNumber: normalizeSerialNumber(record.serialNumber),
    ...extra
  });
}

function updateDataControlTopStats(issues) {
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
  if (issue.source === "repairs") {
    const meta = repairDerived.get(record.id);
    const documentInfo = meta?.documentInfo || repairDocumentInfo(record);
    return [
      documentInfo.label && documentInfo.number ? `${documentInfo.label} ${documentInfo.number}` : "",
      record.customerName,
      record.deviceName
    ].filter(Boolean).join(" · ") || "Naprawa / wkładka";
  }
  return [record.deviceName, record.customerName].filter(Boolean).join(" · ") || "Aparat";
}

function dataControlNotebookLabel(source) {
  if (source === "demo") return "Demo";
  if (source === "repairs") return "Naprawy";
  return "Baza";
}

function createDataControlRow(issue) {
  const row = document.createElement("tr");
  row.className = `data-control-row ${issue.severity}`;

  const cells = [
    createDataSeverityPill(issue.severity),
    dataControlNotebookLabel(issue.source),
    dataControlRecordLabel(issue),
    issue.serialNumber ? createSerialPill(issue.serialNumber, issue.kind === "duplicate" ? issue.duplicateMatches || [] : []) : "",
    issue.title,
    issue.detail
  ];

  cells.forEach((value) => {
    const cell = document.createElement("td");
    fillTableCell(cell, value);
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

  if (issue.source === "repairs") {
    const record = repairRecords.find((item) => item.id === issue.record.id);
    if (!record) return;
    switchNotebook("repairs");
    switchView("repairDatabase", "repairs");
    openRepairDialog(record);
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
    repairs: issues.filter((issue) => issue.source === "repairs").length,
    demo: issues.filter((issue) => issue.source === "demo").length,
    all: totalCount
  };

  const fragment = document.createDocumentFragment();
  [
    ["Wszystkie", counts.all],
    ["Duplikaty", counts.duplicate],
    ["Pilne", counts.critical],
    ["Do sprawdzenia", counts.warning],
    ["Naprawy", counts.repairs],
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
  if (key === "serialNumber") return repairSerialNumbers(record).join(" ");
  if (key === "sourceDocumentNumber") return repairDocumentInfo(record).number;
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

function createDeviceNameCell(record) {
  const deviceName = String(record?.deviceName || "").trim();
  if (!deviceName) return "";

  const name = document.createElement("span");
  name.className = "device-name-cell";
  name.textContent = deviceName;

  const priceInfo = pricingPriceInfoForDeviceName(deviceName);
  applyModelTooltip(name, priceInfo?.tooltip || "", deviceName);

  return name;
}

function isoDateDistanceDays(leftValue, rightValue) {
  const leftDate = parseIsoDate(leftValue);
  const rightDate = parseIsoDate(rightValue);
  if (!leftDate || !rightDate) return null;
  return Math.round((rightDate - leftDate) / 86400000);
}

function customerDocumentTimingText(documentDate, purchaseDate) {
  const distance = isoDateDistanceDays(documentDate, purchaseDate);
  if (distance === null) return "";
  if (distance === 0) return "w dniu sprzedaży";
  if (distance > 0) return `${distance} dni przed sprzedażą`;
  return `${Math.abs(distance)} dni po sprzedaży`;
}

function customerSameNameCount(customerKey) {
  if (!customerKey) return 0;
  return customerNameCounts.get(customerKey) || 0;
}

function loanHistorySerials(entry) {
  if (Array.isArray(entry?.serials)) return entry.serials.map(serialDuplicateKey).filter(Boolean);
  return [entry?.rightDevice?.serial, entry?.leftDevice?.serial]
    .map(serialDuplicateKey)
    .filter(Boolean);
}

function loanHistoryMatchesRecordSerial(entry, record) {
  const recordSerial = serialDuplicateKey(record?.serialNumber);
  return Boolean(recordSerial && loanHistorySerials(entry).includes(recordSerial));
}

function offerHistoryItemsLabel(entry) {
  return (entry?.items || [])
    .map((item) => [item.model || item.tradeName, item.nfzCode, formatPricingPrice(item.grossPrice)].filter(Boolean).join(" / "))
    .filter(Boolean)
    .join("; ");
}

function loanHistoryItemsLabel(entry) {
  return [entry?.rightDevice, entry?.leftDevice]
    .filter(hasLoanDeviceData)
    .map((device) => [device.side, device.model, device.serial].filter(Boolean).join(" / "))
    .join("; ");
}

function scoreCustomerDocumentMatch(documentDate, purchaseDate, hasSerialMatch = false) {
  if (hasSerialMatch) return -1000;
  const distance = isoDateDistanceDays(documentDate, purchaseDate);
  if (distance === null) return 9000;
  if (distance >= 0) return distance;
  return 4000 + Math.abs(distance);
}

function customerOfferMatches(record, customerKey, sameNameCount) {
  const purchaseDate = isoDateForSave(record?.pickupDate);
  return (customerDocumentIndex.get(customerKey) || [])
    .filter((entry) => entry.kind === "Oferta")
    .map((entry) => {
      const timing = customerDocumentTimingText(entry.date, purchaseDate);
      const uncertain = sameNameCount > 1;
      return {
        kind: "Oferta",
        date: entry.date,
        score: scoreCustomerDocumentMatch(entry.date, purchaseDate),
        uncertain,
        line: [
          entry.linePrefix,
          timing,
          entry.itemsLabel,
          entry.patient ? `pacjent: ${formatPricingPrice(entry.patient)}` : ""
        ].filter(Boolean).join(" | ")
      };
    });
}

function customerLoanMatches(record, customerKey, sameNameCount) {
  const purchaseDate = isoDateForSave(record?.pickupDate);
  return (customerDocumentIndex.get(customerKey) || [])
    .filter((entry) => entry.kind === "Umowa")
    .map((entry) => {
      const hasSerialMatch = loanHistoryMatchesRecordSerial(entry, record);
      const documentDate = entry.date;
      const timing = customerDocumentTimingText(documentDate, purchaseDate);
      const uncertain = !hasSerialMatch && sameNameCount > 1;
      return {
        kind: "Umowa",
        date: documentDate,
        score: scoreCustomerDocumentMatch(documentDate, purchaseDate, hasSerialMatch),
        uncertain,
        line: [
          entry.linePrefix,
          entry.number ? `nr ${entry.number}` : "",
          entry.period ? `okres ${entry.period}` : "",
          timing,
          hasSerialMatch ? "nr seryjny zgodny" : sameNameCount > 1 ? "możliwe dopasowanie" : "",
          entry.itemsLabel
        ].filter(Boolean).join(" | ")
      };
    });
}

function customerDocumentInfoForRecord(record) {
  const customerKey = customerNameLookupKey(record?.customerName);
  if (!customerKey) return null;
  const sameNameCount = customerSameNameCount(customerKey);
  const matches = [
    ...customerOfferMatches(record, customerKey, sameNameCount),
    ...customerLoanMatches(record, customerKey, sameNameCount)
  ]
    .sort((left, right) => left.score - right.score || String(right.date).localeCompare(String(left.date)))
    .slice(0, 4);

  if (!matches.length) return null;
  const hasUncertainMatch = matches.some((match) => match.uncertain);
  const heading = hasUncertainMatch
    ? `Dokumenty klienta (powtórzone imię i nazwisko: ${sameNameCount}, sprawdź po datach):`
    : "Dokumenty klienta:";
  return {
    uncertain: hasUncertainMatch,
    tooltip: [heading, ...matches.map((match) => `• ${match.line}`)].join("\n")
  };
}

function soldDeviceHasCompletedPurchase(record) {
  return Boolean(normalizeSalesInvoice(record?.salesInvoice) && isoDateForSave(record?.pickupDate));
}

function activeDemoLoanLine(loan) {
  const model = [
    loan.deviceName || "Aparat demo",
    loan.serialNumber ? `nr ${loan.serialNumber}` : "",
    loan.location
  ].filter(Boolean).join(" / ");
  return [
    model,
    loan.status === "DO ZWROTU" ? "do zwrotu" : "wypożyczony",
    loan.loanDate ? `wypożyczono ${formatDate(loan.loanDate)}` : "",
    loan.returnDeadline ? `termin ${formatDate(loan.returnDeadline)}` : ""
  ].filter(Boolean).join(" | ");
}

function customerDemoLoanWarningForRecord(record) {
  if (!soldDeviceHasCompletedPurchase(record)) return null;
  const customerKey = customerNameLookupKey(record?.customerName);
  if (!customerKey) return null;
  const activeLoans = activeDemoLoanCustomerIndex.get(customerKey) || [];
  if (!activeLoans.length) return null;

  const saleDate = isoDateForSave(record.pickupDate);
  const invoice = normalizeSalesInvoice(record.salesInvoice);
  return {
    count: activeLoans.length,
    tooltip: [
      `Demo do zamknięcia: klient kupił aparat ${formatDate(saleDate)}${invoice ? `, FV ${invoice}` : ""}.`,
      "Zakończ wypożyczenie w zakładce Demo.",
      ...activeLoans.map((loan) => `• ${activeDemoLoanLine(loan)}`)
    ].join("\n")
  };
}

function createCustomerActivityCell(record) {
  const customerName = String(record?.customerName || "").trim();
  if (!customerName) return "";
  const wrap = document.createElement("span");
  wrap.className = "customer-activity-cell";
  const name = document.createElement("span");
  name.textContent = customerName;
  wrap.append(name);

  const documentInfo = customerDocumentInfoForRecord(record);
  const demoLoanWarning = customerDemoLoanWarningForRecord(record);
  if (documentInfo || demoLoanWarning) {
    wrap.classList.add("has-customer-docs");
    if (documentInfo?.uncertain) wrap.classList.add("customer-docs-uncertain");
    if (demoLoanWarning) wrap.classList.add("customer-demo-warning");
    const tooltip = [demoLoanWarning?.tooltip, documentInfo?.tooltip].filter(Boolean).join("\n\n");
    wrap.dataset.customerTooltip = tooltip;
    wrap.title = tooltip;
    wrap.tabIndex = 0;
    if (documentInfo) {
      const badge = document.createElement("span");
      badge.className = "customer-docs-badge";
      badge.textContent = "info";
      wrap.append(badge);
    }
    if (demoLoanWarning) {
      const badge = document.createElement("span");
      badge.className = "customer-docs-badge customer-demo-badge";
      badge.textContent = demoLoanWarning.count > 1 ? `demo ${demoLoanWarning.count}` : "demo";
      wrap.append(badge);
    }
  }
  return wrap;
}

function createRow(record) {
  const row = document.createElement("tr");
  const duplicateMatches = duplicateSerialMatches(record, "devices");
  const serviceMatches = serviceSerialMatches(record, "devices");
  if (duplicateMatches.length) {
    row.classList.add("serial-duplicate-row");
    row.title = serialRelationTitle(duplicateMatches, serviceMatches);
  } else if (serviceMatches.length) {
    row.classList.add("serial-service-row");
    row.title = serviceSerialTitle(serviceMatches);
  }
  if (displayType(record) === "SPRZEDANY") {
    row.classList.add("device-sold-row");
  }
  const level = deviceDerived.get(record.id)?.fifoLevel ?? fifoLevel(record);
  if (level) row.classList.add(`fifo-${level}`);

  const cells = [
    createDateText(record.receivedDate),
    createAgePill(record),
    createDeviceNameCell(record),
    createSerialPill(record.serialNumber, duplicateMatches, serviceMatches, [], deviceSerialWarrantyTitle(record)),
    createTypePill(displayType(record)),
    createLocationPill(record.location),
    createDateText(record.pickupDate),
    createCustomerActivityCell(record),
    record.salesInvoice,
    createEzwmCell(record),
    createWaybillCell(record.waybillNumber),
    record.notes,
    ...(canViewPrivatePayments() ? [createPrivatePaymentCell(record)] : [])
  ];

  cells.forEach((value) => {
    const cell = document.createElement("td");
    fillTableCell(cell, value);
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
  const serviceMatches = serviceSerialMatches(record, "demo");
  if (duplicateMatches.length) {
    row.classList.add("serial-duplicate-row");
    row.title = serialRelationTitle(duplicateMatches, serviceMatches);
  } else if (serviceMatches.length) {
    row.classList.add("serial-service-row");
    row.title = serviceSerialTitle(serviceMatches);
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
    createDateText(record.receivedDate),
    createDemoReturnDeadlineCell(meta),
    record.manufacturer,
    record.deviceName,
    createSerialPill(record.serialNumber, duplicateMatches, serviceMatches),
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

function createPricingRow(record, index) {
  const row = document.createElement("tr");
  const manufacturerTone = pricingManufacturerTone(record.manufacturer);
  row.classList.add("pricing-manufacturer-row");
  row.style.setProperty("--pricing-tone-bg", manufacturerTone.bg);
  row.style.setProperty("--pricing-tone-bg-strong", manufacturerTone.strong);
  row.style.setProperty("--pricing-tone-accent", manufacturerTone.accent);
  row.style.setProperty("--pricing-tone-text", manufacturerTone.text);
  const cells = [
    String(index + 1),
    record.idProduct,
    record.nfzCode,
    record.tradeName,
    record.model,
    record.manufacturer,
    record.orderIndex,
    formatPricingPrice(record.grossPrice),
    record.swdCode
  ];

  cells.forEach((value, cellIndex) => {
    const cell = document.createElement("td");
    if (cellIndex === 3) cell.classList.add("pricing-name-cell");
    if (cellIndex === 5) cell.classList.add("pricing-manufacturer-cell");
    if (cellIndex === 7) {
      cell.classList.add("pricing-price-cell");
      const wrap = document.createElement("span");
      wrap.className = "pricing-price-wrap";
      const text = document.createElement("span");
      text.className = "pricing-price-value";
      text.append(createPricingPriceElement(record.grossPrice));
      wrap.append(text);
      if (canManagePricing()) {
        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "pricing-price-edit-btn";
        editButton.textContent = "Zmień";
        editButton.title = "Popraw cenę brutto";
        editButton.addEventListener("click", () => updatePricingRecordPrice(record));
        wrap.append(editButton);
      }
      cell.append(wrap);
    } else {
      cell.textContent = value || "-";
    }
    if (!value) cell.classList.add("muted-cell");
    row.append(cell);
  });

  const offerCell = document.createElement("td");
  offerCell.className = "pricing-offer-action-cell row-actions";
  const offerButton = document.createElement("button");
  offerButton.type = "button";
  offerButton.className = "pricing-add-offer-btn";
  offerButton.textContent = "+";
  offerButton.title = "Dodaj aparat do oferty";
  offerButton.setAttribute("aria-label", `Dodaj do oferty: ${record.model || record.tradeName || "aparat"}`);
  offerButton.disabled = normalizePricingPrice(record.grossPrice) === "" || pricingOfferAgeValue() === null;
  if (pricingOfferAgeValue() === null) offerButton.title = "Najpierw podaj wiek w Ofercie.";
  offerButton.addEventListener("click", () => addPricingRecordToOffer(record));
  offerCell.append(offerButton);
  if (canManagePricing()) {
    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "pricing-remove-btn danger";
    removeButton.textContent = "×";
    removeButton.title = "Usuń pozycję z cennika";
    removeButton.setAttribute("aria-label", "Usuń pozycję z cennika");
    removeButton.addEventListener("click", () => deletePricingRecord(record));
    offerCell.append(removeButton);
  }
  row.append(offerCell);

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
    date.append("od ", createDateText(loanDate) || formatDate(loanDate));
    wrap.append(date);
  }
  return wrap;
}

function createDemoNotesCell(record) {
  const historyCount = effectiveDemoLoanHistory(record).length;
  const attachmentCount =
    normalizeDemoAttachments(record.currentAttachments).length +
    normalizeDemoLoanHistory(record.loanHistory).reduce((count, entry) => count + entry.attachments.length, 0);
  if (!record.notes && !record.loanDate && !record.returnDate && !record.manufacturerReturnedDate && !historyCount && !attachmentCount) return "";
  const wrap = document.createElement("div");
  wrap.className = "demo-notes-cell";

  if (record.loanDate) {
    const loanDate = document.createElement("span");
    loanDate.className = "demo-notes-loan-date";
    loanDate.append("Wypożyczono: ", createDateText(record.loanDate) || formatDate(record.loanDate));
    wrap.append(loanDate);
  }

  if (record.returnDate) {
    const returnDate = document.createElement("span");
    returnDate.className = "demo-notes-return-date";
    returnDate.append("Zwrócono: ", createDateText(record.returnDate) || formatDate(record.returnDate));
    wrap.append(returnDate);
  }

  if (record.manufacturerReturnedDate) {
    const manufacturerReturnedDate = document.createElement("span");
    manufacturerReturnedDate.className = "demo-notes-return-date";
    manufacturerReturnedDate.append("Do producenta: ", createDateText(record.manufacturerReturnedDate) || formatDate(record.manufacturerReturnedDate));
    wrap.append(manufacturerReturnedDate);
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
  if (isTodayDate(meta.returnDeadline)) date.classList.add("today-date");
  wrap.append(date);

  const time = document.createElement("small");
  time.textContent = demoReturnDeadlineLabel(meta);
  wrap.append(time);
  return wrap;
}

function demoReturnDeadlineLabel(meta) {
  if (!meta) return "";
  if (meta.returnSource === "manufacturerReturned") return "zwrócono do producenta";
  if (meta.returnSource === "returned") return "zwrócono";
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
    if (isTodayDate(meta.returnDeadline)) date.classList.add("today-date");
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

function createSerialPill(serialNumber, duplicateMatches = [], serviceMatches = [], saleMatches = [], extraTitle = "") {
  const pill = document.createElement("button");
  pill.className = "serial-pill";
  pill.type = "button";
  const hasSerialNumber = Boolean(String(serialNumber ?? "").trim());
  const serialText = hasSerialNumber ? String(serialNumber).trim() : "brak numeru";
  const relationTitle = serialRelationTitle(duplicateMatches, serviceMatches, saleMatches, extraTitle);
  const defaultTitle = relationTitle
    ? `Kliknij, aby skopiować numer seryjny. ${relationTitle}`
    : "Kliknij, aby skopiować numer seryjny";
  pill.title = defaultTitle;
  pill.setAttribute("aria-label", `Kopiuj numer seryjny ${serialText}`);

  const number = document.createElement("span");
  number.className = "serial-pill-number";
  number.textContent = serialText;
  const icon = createCopyIcon();
  pill.append(number);
  if (saleMatches.length) pill.append(createSaleSerialMarker());
  pill.append(icon);

  if (!hasSerialNumber) {
    pill.classList.add("empty");
    pill.disabled = true;
    pill.title = "Brak numeru seryjnego do skopiowania";
    pill.setAttribute("aria-label", "Brak numeru seryjnego do skopiowania");
    return pill;
  }

  if (duplicateMatches.length) {
    pill.classList.add("duplicate");
  } else if (serviceMatches.length) {
    pill.classList.add("service");
  } else if (saleMatches.length || extraTitle) {
    pill.classList.add("sale");
  }

  pill.addEventListener("click", (event) => {
    event.stopPropagation();
    copySerialNumber(serialText, pill, defaultTitle);
  });

  if (!duplicateMatches.length && !serviceMatches.length && !saleMatches.length && !extraTitle) return pill;

  const marker = document.createElement("small");
  if (duplicateMatches.length || serviceMatches.length) {
    marker.className = duplicateMatches.length ? "serial-duplicate-marker" : "serial-service-marker";
    marker.textContent = duplicateMatches.length ? "duplikat" : "serwis";
  }
  if (duplicateMatches.length || serviceMatches.length) pill.append(marker);

  if (duplicateMatches.length && serviceMatches.length) {
    const serviceMarker = document.createElement("small");
    serviceMarker.className = "serial-service-marker";
    serviceMarker.textContent = "serwis";
    pill.append(serviceMarker);
  }

  return pill;
}

function createSaleSerialMarker() {
  const marker = document.createElement("small");
  marker.className = "serial-sale-marker";
  marker.title = "Sprzedaż aparatu";
  marker.setAttribute("aria-hidden", "true");
  marker.textContent = "FV";
  return marker;
}

function createCopyIcon() {
  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  icon.classList.add("serial-copy-icon");
  icon.setAttribute("viewBox", "0 0 20 20");
  icon.setAttribute("aria-hidden", "true");

  const back = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  back.setAttribute("x", "5");
  back.setAttribute("y", "5");
  back.setAttribute("width", "9");
  back.setAttribute("height", "11");
  back.setAttribute("rx", "1.6");

  const front = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  front.setAttribute("x", "8");
  front.setAttribute("y", "3");
  front.setAttribute("width", "7");
  front.setAttribute("height", "10");
  front.setAttribute("rx", "1.4");

  [back, front].forEach((shape) => {
    shape.setAttribute("fill", "none");
    shape.setAttribute("stroke", "currentColor");
    shape.setAttribute("stroke-width", "1.5");
  });

  icon.append(back, front);
  return icon;
}

async function pasteClipboardToInput(targetId, format = "") {
  const input = document.querySelector(`#${targetId}`);
  if (!input) return;

  let text = "";
  try {
    text = navigator.clipboard?.readText ? await navigator.clipboard.readText() : "";
  } catch (error) {
    text = "";
  }

  if (!text && format === "serial") text = lastCopiedSerialNumber;
  if (!text) {
    const originalPlaceholder = input.placeholder;
    input.placeholder = "Najpierw skopiuj tekst";
    input.focus();
    setTimeout(() => {
      if (input.placeholder === "Najpierw skopiuj tekst") input.placeholder = originalPlaceholder;
    }, 1600);
    return;
  }

  input.value = format === "serial"
    ? normalizeSerialNumber(text)
    : normalizeLoanHistoryText(text);
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
  input.focus();
}

async function copySerialNumber(serialText, pill, defaultTitle) {
  if (!serialText || serialText === "brak numeru") return;

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(serialText);
    } else {
      copyTextWithFallback(serialText);
    }
    rememberCopiedSerialNumber(serialText);
    showSerialCopied(pill, defaultTitle);
  } catch (error) {
    pill.title = "Nie udało się skopiować numeru";
  }
}

function copyTextWithFallback(text) {
  const input = document.createElement("textarea");
  input.value = text;
  input.setAttribute("readonly", "");
  input.style.position = "fixed";
  input.style.top = "-1000px";
  input.style.opacity = "0";
  document.body.append(input);
  input.select();
  document.execCommand("copy");
  input.remove();
}

function showSerialCopied(pill, defaultTitle) {
  pill.classList.add("copied");
  pill.title = "Skopiowano numer seryjny";
  pill.setAttribute("aria-label", "Skopiowano numer seryjny");
  const copiedNumber = pill.querySelector(".serial-pill-number")?.textContent || "";
  if (copiedNumber) showSerialCopyToast(`Skopiowano: ${copiedNumber}`);
  window.clearTimeout(Number(pill.dataset.copyTimer || 0));
  pill.dataset.copyTimer = String(window.setTimeout(() => {
    pill.classList.remove("copied");
    pill.title = defaultTitle;
    const number = pill.querySelector(".serial-pill-number")?.textContent || "";
    pill.setAttribute("aria-label", `Kopiuj numer seryjny ${number}`);
    delete pill.dataset.copyTimer;
  }, 1100));
}

function showSerialCopyToast(message) {
  let toast = document.querySelector(".serial-copy-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "serial-copy-toast";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
    document.body.append(toast);
  }

  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(serialCopyToastTimeout);
  serialCopyToastTimeout = window.setTimeout(() => {
    toast.classList.remove("visible");
  }, 1300);
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
  const soldWithoutRealization = displayType(record) === "SPRZEDANY" && !["REALIZACJA", "BEZ REFUNDACJI"].includes(normalizedValue);

  if (!normalizedValue && !soldWithoutRealization) return "";

  const wrap = document.createElement("span");
  wrap.className = `ezwm-cell ${
    soldWithoutRealization
      ? "ezwm-alert"
      : normalizedValue === "POBRANE"
        ? "ezwm-progress"
        : normalizedValue === "BEZ REFUNDACJI"
          ? "ezwm-none"
          : "ezwm-picked"
  }`;
  wrap.title = soldWithoutRealization
    ? "Sprzedany bez EZWM realizacja"
    : normalizedValue === "POBRANE"
      ? "EZWM pobrane"
      : normalizedValue === "BEZ REFUNDACJI"
        ? "EZWM bez refundacji"
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
  } else if (normalizedValue === "BEZ REFUNDACJI") {
    path.setAttribute("d", "M5.2 5.2 14.8 14.8M7 4.5h6l2 2V15a1.2 1.2 0 0 1-1.2 1.2H6.2A1.2 1.2 0 0 1 5 15V5.7A1.2 1.2 0 0 1 6.2 4.5H13v2h2");
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

function privatePaymentAmount(recordId) {
  return privatePaymentEntry(recordId).amount;
}

function privatePaymentReceivedDate(recordId) {
  return privatePaymentEntry(recordId).receivedDate;
}

function createPrivatePaymentCell(record) {
  const amount = privatePaymentAmount(record?.id);
  if (!amount) return "";
  const receivedDate = privatePaymentReceivedDate(record?.id);

  const wrap = document.createElement("span");
  wrap.className = "private-payment-cell";
  wrap.textContent = "$";
  wrap.title = [`Odebrałem pieniądze: ${amount}`, receivedDate ? `Kiedy: ${displayDateForInput(receivedDate)}` : ""].filter(Boolean).join("\n");
  wrap.setAttribute("aria-label", wrap.title);
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

function createRepairDeviceNameCell(record) {
  const deviceName = String(record?.deviceName || "").trim();
  if (!deviceName) return "";

  const name = document.createElement("span");
  name.className = "device-name-cell";
  name.textContent = deviceName;
  return name;
}

function createRepairRow(record) {
  const row = document.createElement("tr");
  const meta = repairDerived.get(record.id);
  const status = meta?.status ?? effectiveRepairStatus(record);
  row.className = `repair-row ${statusClass(status)}`;
  const overdueClass = repairOverdueClass(record, status);
  if (overdueClass) row.classList.add(overdueClass);
  if (meta?.documentNumberIssues?.length) row.classList.add("repair-document-number-warning");
  const activeDateType = activeRepairDateType(record);
  const cells = [
    createDateText(record.receivedDate),
    createCategoryPill(record.category, record),
    createLocationPill(record.location),
    createRepairCustomerName(record.customerName, status),
    createRepairDeviceNameCell(record),
    createRepairSerialCell(record),
    createRepairDocumentNumberCell(record),
    createStatusPill(status),
    createDatePill(record.sentDate, "sent", activeDateType),
    createDatePill(record.returnDate, "return", activeDateType),
    createDatePill(record.pickupDate, "pickup", activeDateType),
    createRepairNotesCell(record)
  ];

  cells.forEach((value, index) => {
    const cell = document.createElement("td");
    if (index === 3 && status === "GOTOWE") {
      cell.classList.add("pickup-customer-cell");
    }
    fillTableCell(cell, value);
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

function createRepairNotesCell(record) {
  const meta = repairDerived.get(record.id);
  const issues = meta?.documentNumberIssues || [];
  const notes = normalizeLoanHistoryText(record?.notes);
  if (!notes && !issues.length) return "";

  const wrap = document.createElement("div");
  wrap.className = "repair-notes-cell";
  if (notes) {
    const preview = document.createElement("span");
    preview.className = "repair-notes-preview";
    preview.dataset.repairNotesTooltip = notes;
    preview.tabIndex = 0;
    preview.title = notes;
    preview.addEventListener("mouseenter", () => showRepairNotesTooltip(preview));
    preview.addEventListener("mouseleave", hideRepairNotesTooltip);
    preview.addEventListener("focus", () => showRepairNotesTooltip(preview));
    preview.addEventListener("blur", hideRepairNotesTooltip);
    const text = document.createElement("span");
    text.className = "repair-notes-preview-text";
    text.textContent = notes;
    preview.append(text);
    wrap.append(preview);
  }

  if (issues.length) {
    const warning = document.createElement("span");
    warning.className = "repair-number-warning";
    warning.textContent = `Numer: ${issues.map((issue) => issue.title).join(", ")}`;
    warning.title = issues.map((issue) => issue.detail).join("\n");
    wrap.append(warning);
  }
  return wrap;
}

function repairNotesTooltipElement() {
  let tooltip = document.querySelector("#repairNotesTooltip");
  if (tooltip) return tooltip;
  tooltip = document.createElement("div");
  tooltip.id = "repairNotesTooltip";
  tooltip.className = "repair-notes-tooltip";
  tooltip.setAttribute("role", "tooltip");
  tooltip.hidden = true;
  document.body.append(tooltip);
  return tooltip;
}

function showRepairNotesTooltip(anchor) {
  const text = normalizeLoanHistoryText(anchor?.dataset?.repairNotesTooltip);
  if (!anchor || !text) return;
  const tooltip = repairNotesTooltipElement();
  tooltip.textContent = text;
  tooltip.hidden = false;
  tooltip.style.visibility = "hidden";
  const anchorBox = anchor.getBoundingClientRect();
  const tooltipBox = tooltip.getBoundingClientRect();
  const left = Math.max(12, Math.min(anchorBox.right - tooltipBox.width, window.innerWidth - tooltipBox.width - 12));
  const topAbove = anchorBox.top - tooltipBox.height - 8;
  const top = topAbove >= 12 ? topAbove : Math.min(window.innerHeight - tooltipBox.height - 12, anchorBox.bottom + 8);
  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${Math.max(12, top)}px`;
  tooltip.style.visibility = "visible";
}

function hideRepairNotesTooltip() {
  const tooltip = document.querySelector("#repairNotesTooltip");
  if (tooltip) tooltip.hidden = true;
}

function createRepairSerialCell(record) {
  const serials = repairSerialNumbers(record);
  if (!serials.length) return "";

  const wrap = document.createElement("div");
  wrap.className = "repair-serial-list";
  serials.forEach((serialNumber) => {
    wrap.append(createSerialPill(serialNumber, [], [], saleSerialMatchesForSerial(serialNumber, "repairs", record.id)));
  });
  return wrap;
}

function createRepairDocumentNumberCell(record) {
  const documentInfo = repairDocumentInfo(record);
  if (!documentInfo.number) return "";

  const number = document.createElement("span");
  number.className = "repair-document-number";
  number.textContent = documentInfo.number;
  number.title = documentInfo.label ? `${documentInfo.label}: ${documentInfo.number}` : documentInfo.number;
  return number;
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

function createCategoryPill(category, record = null) {
  const pill = document.createElement("span");
  const normalizedCategory = normalizeRepairCategory(category);
  let className = "REPAIR";
  if (normalizedCategory === "WKŁADKA USZNA") className = "INSERT";
  if (normalizedCategory === "WKŁADKA PRZECIWWODNA") className = "WATER-INSERT";
  if (normalizedCategory === "ZAMÓWIENIE") className = "ORDER";
  if (normalizedCategory === "NAPRAWA POGWARANCYJNA") className = "OUT-OF-WARRANTY";
  pill.className = `type-pill ${className}`;
  pill.textContent = normalizedCategory;
  if (record) {
    const warrantyWarning = repairWarrantyWarning(record, record.id);
    if (warrantyWarning) {
      pill.classList.add("warranty-warning");
      pill.title = warrantyWarning;
    }
  }
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
  if (isTodayDate(value)) pill.classList.add("today-date");
  pill.textContent = formatDate(value);
  return pill;
}

function updateStats() {
  if (activeNotebook === "pricing") {
    const visibleCount = filteredPricingRecords().length;
    const meta = currentPricingMeta();
    document.querySelector("#countAll").textContent = String(meta.updatedMonth).padStart(2, "0");
    document.querySelector("#countSold").textContent = meta.updatedYear;
    document.querySelector("#countInvoice").textContent = pricingRecords.length;
    document.querySelector("#countStock").textContent = visibleCount;
    countAllLabel.textContent = "miesiąc";
    countSoldLabel.textContent = "rok";
    countInvoiceLabel.textContent = "pozycji";
    countStockLabel.textContent = "widoczne";
    return;
  }

  if (activeNotebook === "agreements") {
    document.querySelector("#countAll").textContent = "5";
    document.querySelector("#countSold").textContent = pricingOfferHistory.length;
    document.querySelector("#countInvoice").textContent = pricingLoanHistory.length;
    document.querySelector("#countStock").textContent = pricingPcprList.length;
    countAllLabel.textContent = "druki";
    countSoldLabel.textContent = "oferty";
    countInvoiceLabel.textContent = "umowy";
    countStockLabel.textContent = "PCPR";
    return;
  }

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
  renderStockAudit(stockRecords);
  renderStockChecklist(stockRecords, sections);
}

function renderStockChecklist(stockRecords, sections = stockLocationSections(stockRecords)) {
  const locationCounts = new Map(sections.map((section) => [section.location, section.records.length]));
  const stockBreakdown = STOCK_LOCATIONS.map((location) => `${location}: ${locationCounts.get(location) || 0}`).join(" · ");
  const auditActive = isStockAuditActive();

  stockSummary.textContent = formatDeviceCount(stockRecords.length);
  stockChecklistMeta.textContent = `${dateFormatter.format(new Date())} · ${formatDeviceCount(stockRecords.length)} na stanie · ${stockBreakdown}`;
  renderStockAudit(stockRecords);
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
      const checked = isStockAuditItemChecked(record.id);
      if (checked) checkbox.classList.add("checked");
      if (auditActive) row.classList.add(checked ? "stock-audit-row-present" : "stock-audit-row-missing");
      checkbox.setAttribute("aria-hidden", "true");

      const values = [
        String(rowNumber),
        checkbox,
        record.deviceName,
        record.serialNumber,
        normalizeRepairLocation(record.location),
        auditActive ? (checked ? "BYŁO" : "NIE BYŁO") : ""
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
        serialItems: []
      });
    }

    const group = groups.get(key);
    const age = deviceDerived.get(record.id)?.age ?? stockAge(record);
    group.count += 1;
    group.oldestAge = Math.max(group.oldestAge ?? -1, age ?? -1);
    group.serialItems.push({
      id: record.id,
      serialNumber: record.serialNumber || "brak numeru"
    });
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
  const values = [group.deviceName, createLocationPill(group.location), group.count, oldestText, createSerialList(group.serialItems)];

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

function createSerialList(serialItems) {
  const list = document.createElement("div");
  list.className = "serial-list";
  const auditActive = isStockAuditActive();

  serialItems
    .sort((left, right) => collator.compare(left.serialNumber, right.serialNumber))
    .forEach(({ id, serialNumber }) => {
      const item = document.createElement("button");
      const checked = isStockAuditItemChecked(id);
      item.className = "stock-audit-serial";
      item.type = "button";
      item.textContent = serialNumber;
      item.setAttribute("aria-pressed", String(checked));
      item.title = checked
        ? "Było w remanencie"
        : auditActive
          ? "Nie było w remanencie"
          : "Kliknij, aby zaznaczyć w remanencie";
      if (checked) item.classList.add("checked");
      if (auditActive && !checked) item.classList.add("missing");
      item.addEventListener("click", () => toggleStockAuditItem(id));
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
  if (viewName === "dataControl") {
    renderDataControlView();
    return;
  }

  updateStats();
  if (viewName === "demo") {
    renderDemoRecords();
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
    const visibleSectionId = activeNotebook === "agreements" ? "pricingNotebook" : `${notebookName}Notebook`;
    section.hidden = section.id !== visibleSectionId;
  });
  document.querySelector("#pricingNotebook")?.setAttribute("data-mode", activeNotebook === "agreements" ? "agreements" : "pricing");

  setCurrentYearTitle();

  if (activeNotebook === "repairs") {
    updateStats();
    renderRepairRecords();
    return;
  }

  if (activeNotebook === "pricing") {
    switchPricingView("list");
    renderPricingRecords();
    return;
  }

  if (activeNotebook === "agreements") {
    switchPricingView(lastAgreementPricingView || "offer");
    renderPricingRecords();
    return;
  }

  activeDeviceView = document.querySelector('.tab-button.active[data-view-group="devices"]')?.dataset.view || "database";
  if (activeDeviceView === "demo") {
    updateStats();
    renderDemoRecords();
    return;
  }
  if (activeDeviceView === "dataControl") {
    renderDataControlView();
    return;
  }
  if (activeDeviceView === "stock") {
    updateStats();
    renderStockView();
    return;
  }
  updateStats();
  renderDeviceViews();
}

function fillDeviceFormValues(record = {}) {
  fields.forEach((field) => {
    const input = document.querySelector(`#${field}`);
    const value = field === "type" && record ? displayType(record) : record?.[field] ?? "";
    input.value = DEVICE_DATE_FIELDS.includes(field) ? displayDateForInput(value) : value;
  });
}

function fillPrivatePaymentForm(record = {}) {
  updatePrivatePaymentVisibility();
  const entry = canViewPrivatePayments() && record?.id ? privatePaymentFormEntry(record) : { amount: "", receivedDate: "" };
  if (paymentReceivedAmountInput) paymentReceivedAmountInput.value = entry.amount;
  if (paymentReceivedDateInput) {
    paymentReceivedDateInput.value = displayDateForInput(entry.receivedDate);
    updateDateInputTodayState(paymentReceivedDateInput);
  }
}

function privatePaymentFormValue() {
  if (!canViewPrivatePayments()) return null;
  return normalizePrivatePaymentEntry({
    amount: paymentReceivedAmountInput?.value,
    receivedDate: paymentReceivedDateInput?.value
  });
}

function fillDemoFormValues(record = {}) {
  const fieldMap = {
    receivedDate: "#demoReceivedDate",
    manufacturerReturnDate: "#demoManufacturerReturnDate",
    manufacturerReturnDateCleared: "#demoManufacturerReturnDateCleared",
    manufacturerReturned: "#demoManufacturerReturned",
    manufacturerReturnedDate: "#demoManufacturerReturnedDate",
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
    const input = document.querySelector(fieldMap[field]);
    if (!input) return;
    const value = field === "purpose" ? normalizeDemoPurpose(record?.purpose) : record?.[field] ?? "";
    if (input.type === "checkbox") {
      input.checked = normalizeBooleanFlag(value) === "1" || Boolean(record?.manufacturerReturnedDate);
      return;
    }
    input.value = DEMO_DATE_FIELDS.includes(field) ? displayDateForInput(value) : value;
  });
}

function openDialog(record = null) {
  recordForm.reset();
  document.querySelector("#recordId").value = record?.id ?? "";
  dialogTitle.textContent = record ? modelTitleForRecord(record, "Aparat") : "Dodaj aparat";
  const serialNumber = normalizeSerialNumber(record?.serialNumber);
  dialogSerial.textContent = serialNumber;
  dialogSerial.hidden = !serialNumber;
  recordEyebrow.textContent = record ? `${records.findIndex((item) => item.id === record.id) + 1}/${records.length}` : "Nowy rekord";
  deleteBtn.hidden = !record;
  duplicateRecordBtn.hidden = !record;
  moveToDemoBtn.hidden = !record;

  fillDeviceFormValues(record);
  fillPrivatePaymentForm(record);

  if (!record) {
    setDateInputValue("#receivedDate", todayInputValue());
    document.querySelector("#type").value = "NA STANIE";
    document.querySelector("#location").value = "P63";
  }
  updateDateInputsTodayState(recordForm);
  renderQualityHints("devices");
  renderAuditTrail("devices", record?.id || "");
  recordDialog.showModal();
}

function openRepairDialog(record = null) {
  repairForm.reset();
  clearRepairDateOrderError();
  document.querySelector("#repairId").value = record?.id ?? "";
  deleteRepairBtn.hidden = !record;
  const repairLocationInput = document.querySelector("#repairLocation");
  delete repairLocationInput.dataset.userChanged;
  clearRepairLocationSuggestion(repairLocationInput);
  const normalizedRecord = record ? normalizeRepairRecordForUse(record) : null;
  repairRecordEyebrow.textContent = normalizedRecord ? repairDialogProductLabel(normalizedRecord) : "Produkt";
  repairDialogTitle.textContent = normalizedRecord ? repairDialogCustomerTitle(normalizedRecord) : "Dodaj naprawę lub wkładkę";

  const fieldMap = {
    receivedDate: "#repairReceivedDate",
    category: "#repairCategory",
    location: "#repairLocation",
    customerName: "#repairCustomerName",
    deviceName: "#repairDeviceName",
    serialNumber: "#repairSerialNumber",
    serialNumber2: "#repairSerialNumber2",
    status: "#repairStatus",
    sentDate: "#repairSentDate",
    returnDate: "#repairReturnDate",
    pickupDate: "#repairPickupDate",
    notes: "#repairNotes"
  };

  repairFields.forEach((field) => {
    const input = document.querySelector(fieldMap[field]);
    const value = normalizedRecord?.[field] ?? "";
    input.value = REPAIR_DATE_FIELDS.includes(field) ? displayDateForInput(value) : value;
  });

  if (!record) {
    setDateInputValue("#repairReceivedDate", todayInputValue());
    repairLocationInput.value = "P63";
    syncRepairDeviceNameFromCategory({ force: true });
  } else {
    repairLocationInput.dataset.userChanged = "1";
  }
  updateDateInputsTodayState(repairForm);
  updateRepairWarrantyHint();
  renderQualityHints("repairs");
  renderAuditTrail("repairs", record?.id || "");

  repairDialog.showModal();
}

function repairDialogProductLabel(record) {
  const product = normalizeDeviceName(record?.deviceName);
  if (product) return product;

  const category = normalizeRepairCategory(record?.category);
  if (category === "WKŁADKA USZNA") return "Wkładka uszna";
  if (category === "WKŁADKA PRZECIWWODNA") return "Wkładka przeciwwodna";
  if (category === "ZAMÓWIENIE") return "Zamówienie";
  if (category === "NAPRAWA GWARANCYJNA" || category === "NAPRAWA POGWARANCYJNA") return "Aparat";
  return "Produkt";
}

function repairDialogCustomerTitle(record) {
  return titleCaseName(record?.customerName) || "Brak imienia i nazwiska";
}

function openDemoDialog(record = null) {
  demoForm.reset();
  demoLoanHistoryDraft = record ? effectiveDemoLoanHistory(record) : [];
  demoCurrentAttachmentsDraft = record ? demoAttachmentDrafts(record.currentAttachments) : [];
  demoFormError.textContent = "";
  delete demoFormError.dataset.errorType;
  clearDemoDateValidationError();
  saveDemoBtn.disabled = false;
  saveDemoBtn.textContent = "Zapisz";
  const demoSerialNumberInput = document.querySelector("#demoSerialNumber");
  demoSerialNumberInput.required = !record;
  demoSerialNumberInput.setAttribute("aria-required", String(!record));
  document.querySelector("#demoSerialNumberLabel").textContent = record ? "Numer seryjny" : "Numer seryjny *";
  document.querySelector("#demoReturnDate").dataset.autoValue = "";
  document.querySelector("#demoManufacturerReturnDate").dataset.autoValue = "";
  document.querySelector("#demoManufacturerReturnedDate").dataset.autoValue = "";
  document.querySelector("#demoId").value = record?.id ?? "";
  demoDialogTitle.textContent = record ? demoDialogTitleForRecord(record) : "Dodaj aparat demo";
  demoRecordEyebrow.textContent = record
    ? `${demoRecords.findIndex((item) => item.id === record.id) + 1}/${demoRecords.length}`
    : "Nowy wpis";
  deleteDemoBtn.hidden = !record;
  duplicateDemoBtn.hidden = !record;
  moveToDevicesBtn.hidden = !record;

  fillDemoFormValues(record);

  if (record) {
    const returnDateInput = document.querySelector("#demoReturnDate");
    setDateInputValue(returnDateInput, record.returnDate || "");
    document.querySelector("#demoLocation").value = normalizeDemoLocation(record.location);
    document.querySelector("#demoCurrentUser").value = titleCaseName(record.currentUser);
    syncDemoStatusFromCurrentUser();
  }

  if (!record) {
    setDateInputValue("#demoReceivedDate", todayInputValue());
    document.querySelector("#demoStatus").value = "NA STANIE";
    document.querySelector("#demoPurpose").value = DEMO_PURPOSE_TEST;
    document.querySelector("#demoLocation").value = "P63";
    document.querySelector("#demoManufacturerReturned").checked = false;
    setDateInputValue("#demoManufacturerReturnedDate", "");
  }
  const calculatedManufacturerReturnDate = calculateDemoManufacturerReturnDate();
  const manufacturerReturnDateInput = document.querySelector("#demoManufacturerReturnDate");
  if (!manufacturerReturnDateInput.value && !isDemoManufacturerReturnDateClearedForm()) {
    syncDemoManufacturerReturnDate();
  } else if (isoDateForSave(manufacturerReturnDateInput.value) === calculatedManufacturerReturnDate) {
    manufacturerReturnDateInput.dataset.autoValue = calculatedManufacturerReturnDate;
  }
  updateDateInputsTodayState(demoForm);
  renderQualityHints("demo");
  renderDemoCurrentAttachments();
  renderDemoLoanHistory(record);
  renderAuditTrail("demo", record?.id || "");
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
    dates.append(
      createDateText(entry.loanDate) || "brak daty",
      " → ",
      createDateText(entry.returnDate) || "brak daty zwrotu"
    );
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
  closeDatePicker();
  recordDialog.close();
}

function closeRepairDialog() {
  closeDatePicker();
  repairDialog.close();
}

function closeDemoDialog() {
  closeDatePicker();
  demoDialog.close();
}

function formRecord() {
  const data = Object.fromEntries(new FormData(recordForm).entries());
  fields.forEach((field) => {
    data[field] = String(data[field] ?? "").trim();
  });
  normalizeFormDateFields(data, DEVICE_DATE_FIELDS);
  data.deviceName = correctDeviceNameFromHistory(data.deviceName, document.querySelector("#recordId").value);
  data.customerName = titleCaseName(data.customerName);
  data.serialNumber = normalizeSerialNumber(data.serialNumber);
  data.salesInvoice = normalizeSalesInvoice(data.salesInvoice);
  data.location = normalizeRepairLocation(data.location);
  data.type = effectiveDeviceType(data, data.type || "NA STANIE");
  data.ezwm = normalizeEzwmStatus(data.ezwm);
  return data;
}

function syncDeviceTypeFromFields() {
  const typeInput = document.querySelector("#type");
  if (!typeInput) return;

  const data = Object.fromEntries(new FormData(recordForm).entries());
  normalizeFormDateFields(data, DEVICE_DATE_FIELDS);
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

function repairLocationSuggestionSortValue(record) {
  return isoDateForSave(record?.pickupDate) || isoDateForSave(record?.returnDate) || isoDateForSave(record?.receivedDate) || "";
}

function suggestedRepairLocationForCustomer(customerName) {
  const customerKey = customerNameLookupKey(customerName);
  if (!customerKey) return "";

  const matches = records
    .filter((record) => customerNameLookupKey(record.customerName) === customerKey)
    .sort((left, right) =>
      String(repairLocationSuggestionSortValue(right)).localeCompare(String(repairLocationSuggestionSortValue(left)))
    );

  return matches.length ? normalizeRepairLocation(matches[0].location) : "";
}

function clearRepairLocationSuggestion(locationInput = document.querySelector("#repairLocation")) {
  if (!locationInput) return;
  locationInput.classList.remove("location-suggested");
  locationInput.removeAttribute("title");
  delete locationInput.dataset.suggestedLocation;
}

function syncRepairLocationFromCustomerName({ force = false } = {}) {
  const idInput = document.querySelector("#repairId");
  const customerInput = document.querySelector("#repairCustomerName");
  const locationInput = document.querySelector("#repairLocation");
  if (!idInput || !customerInput || !locationInput) return;
  if (idInput.value) {
    clearRepairLocationSuggestion(locationInput);
    return;
  }

  const suggestedLocation = suggestedRepairLocationForCustomer(customerInput.value);
  if (!suggestedLocation) {
    clearRepairLocationSuggestion(locationInput);
    return;
  }

  locationInput.dataset.suggestedLocation = suggestedLocation;
  locationInput.title = `Podpowiedź z Bazy dla tej osoby: ${suggestedLocation}`;
  locationInput.classList.add("location-suggested");
  if (force || locationInput.dataset.userChanged !== "1") {
    locationInput.value = suggestedLocation;
  }
}

function markRepairLocationManualChange(event) {
  const locationInput = event?.target || document.querySelector("#repairLocation");
  if (!locationInput) return;
  locationInput.dataset.userChanged = "1";
  clearRepairLocationSuggestion(locationInput);
}

function syncRepairDeviceNameFromCategory({ force = false } = {}) {
  const categoryInput = document.querySelector("#repairCategory");
  const deviceNameInput = document.querySelector("#repairDeviceName");
  if (!categoryInput || !deviceNameInput) return;
  const category = normalizeRepairCategory(categoryInput.value);
  const currentValue = normalizeDeviceName(deviceNameInput.value);
  const currentUpper = currentValue.toLocaleUpperCase("pl-PL");

  if (!category.startsWith("WKŁADKA")) {
    if (force && (currentUpper === "WKŁADKA USZNA" || currentUpper === "WKŁADKA PRZECIWWODNA")) {
      deviceNameInput.value = "";
    }
    return;
  }

  const suggestedName = category === "WKŁADKA PRZECIWWODNA" ? "Wkładka przeciwwodna" : "Wkładka uszna";
  if (force || !currentValue || currentUpper === "WKŁADKA USZNA" || currentUpper === "WKŁADKA PRZECIWWODNA") {
    deviceNameInput.value = suggestedName;
  }
}

function syncRepairCategoryInput() {
  syncRepairDeviceNameFromCategory({ force: true });
  updateRepairWarrantyHint();
}

function syncRepairCustomerNameInput(event) {
  event.target.value = titleCaseNameInput(event.target.value);
  syncRepairLocationFromCustomerName();
}

function finalizeRepairCustomerNameInput(event) {
  event.target.value = titleCaseName(event.target.value);
  syncRepairLocationFromCustomerName({ force: true });
}

function syncRepairSerialInput(event) {
  syncDemoUppercaseInput(event);
  if (validateRepairDateOrder()) updateRepairWarrantyHint();
}

function repairFormRecord() {
  const data = Object.fromEntries(new FormData(repairForm).entries());
  repairFields.forEach((field) => {
    data[field] = String(data[field] ?? "").trim();
  });
  normalizeFormDateFields(data, REPAIR_DATE_FIELDS);
  data.customerName = titleCaseName(data.customerName);
  data.serialNumber = normalizeSerialNumber(data.serialNumber);
  data.serialNumber2 = normalizeSerialNumber(data.serialNumber2);
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
  normalizeFormDateFields(data, DEMO_DATE_FIELDS);
  data.manufacturer = data.manufacturer.toLocaleUpperCase("pl-PL");
  data.serialNumber = normalizeSerialNumber(data.serialNumber);
  data.manufacturerReturnDateCleared = data.manufacturerReturnDate ? "" : normalizeBooleanFlag(data.manufacturerReturnDateCleared);
  data.manufacturerReturned = normalizeBooleanFlag(data.manufacturerReturned);
  if (data.manufacturerReturnedDate) data.manufacturerReturned = "1";
  if (data.manufacturerReturned === "1" && !data.manufacturerReturnedDate) data.manufacturerReturnedDate = todayInputValue();
  if (data.manufacturerReturned !== "1") data.manufacturerReturnedDate = "";
  data.purpose = normalizeDemoPurpose(data.purpose);
  data.location = normalizeDemoLocation(data.location);
  data.currentUser = titleCaseName(data.currentUser);
  data.loanHistory = normalizeDemoLoanHistory(demoLoanHistoryDraft);
  data.currentAttachments = normalizeDemoAttachments(demoCurrentAttachmentsDraft);
  data.loanHistoryManaged = true;
  const selectedStatus = normalizeDemoStatus(data.status, data);
  if (selectedStatus === "ZWRÓCONO" && !data.currentUser && !data.returnDate && !data.manufacturerReturnedDate) {
    data.manufacturerReturned = "1";
    data.manufacturerReturnedDate = todayInputValue();
  }
  if (data.manufacturerReturnedDate) {
    data.status = "ZWRÓCONO";
  } else if (data.returnDate && data.currentUser) {
    data.status = "ZWRÓCONO";
  }
  if (!data.manufacturerReturnedDate && !data.manufacturerReturnDate && data.status === "ZWRÓCONO" && data.currentUser) {
    if (!data.returnDate) data.returnDate = todayInputValue();
  } else if (data.currentUser && !data.loanDate) {
    data.loanDate = todayInputValue();
  }
  if (data.manufacturerReturnedDate || (data.status === "ZWRÓCONO" && data.currentUser)) {
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
  if (data.manufacturerReturnedDate) {
    const hasActiveLoan = Boolean(data.currentUser || existingRecord?.currentUser || data.loanDate || existingRecord?.loanDate);
    if (hasActiveLoan) {
      const completed = completeDemoLoan(existingRecord, {
        ...data,
        status: "ZWRÓCONO",
        returnDate: data.returnDate || data.manufacturerReturnedDate
      });
      return {
        ...completed,
        status: "ZWRÓCONO",
        manufacturerReturned: "1",
        manufacturerReturnedDate: data.manufacturerReturnedDate
      };
    }
    return {
      ...data,
      status: "ZWRÓCONO",
      manufacturerReturned: "1",
      loanHistory: history,
      currentUser: "",
      loanDate: "",
      returnDate: ""
    };
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

function joinTransferNotes(...parts) {
  return parts
    .map((part) => String(part ?? "").trim())
    .filter(Boolean)
    .join("\n");
}

function deviceRecordToDemoRecord(record) {
  const status = displayType(record);
  return normalizeDemoRecordForUse({
    id: `${DEMO_ID_PREFIX}${makeId()}`,
    receivedDate: record.receivedDate || todayInputValue(),
    manufacturerReturnDate: record.manufacturerReturnDate || "",
    manufacturerReturnDateCleared: record.manufacturerReturnDateCleared || "",
    manufacturerReturned: "",
    manufacturerReturnedDate: "",
    manufacturer: String(record.manufacturer || "").trim(),
    deviceName: record.deviceName,
    serialNumber: record.serialNumber,
    status: "NA STANIE",
    purpose: DEMO_PURPOSE_TEST,
    location: normalizeRepairLocation(record.location),
    currentUser: "",
    loanDate: "",
    returnDate: "",
    notes: joinTransferNotes(
      record.notes,
      status && status !== "NA STANIE" ? `Przeniesiono z bazy. Status: ${status}.` : "Przeniesiono z bazy.",
      record.customerName ? `Klient: ${record.customerName}.` : "",
      record.salesInvoice ? `Faktura: ${record.salesInvoice}.` : "",
      record.ezwm ? `EZWM: ${normalizeEzwmStatus(record.ezwm)}.` : "",
      record.waybillNumber ? `NR WZ: ${record.waybillNumber}.` : ""
    ),
    loanHistory: normalizeDemoLoanHistory(record.loanHistory),
    currentAttachments: normalizeDemoAttachments(record.currentAttachments),
    sourceRow: String(record.id || "")
  });
}

function demoRecordToDeviceRecord(record) {
  const demoStatusText = demoStatus(record);
  const deadline = demoReturnDeadline(record);
  return normalizeDeviceRecordForUse({
    id: makeId(),
    receivedDate: record.receivedDate || todayInputValue(),
    deviceName: record.deviceName,
    serialNumber: record.serialNumber,
    type: "NA STANIE",
    location: normalizeDemoLocation(record.location),
    pickupDate: "",
    customerName: "",
    salesInvoice: "",
    returnDate: "",
    waybillNumber: "",
    ezwm: "",
    notes: joinTransferNotes(
      record.notes,
      "Przeniesiono z demo.",
      record.manufacturer ? `Producent: ${record.manufacturer}.` : "",
      demoStatusText ? `Status demo: ${demoStatusText}.` : "",
      record.purpose ? `Charakter: ${normalizeDemoPurpose(record.purpose)}.` : "",
      record.currentUser ? `Ostatnio używany przez: ${record.currentUser}.` : "",
      record.loanDate ? `Data wypożyczenia: ${formatDate(record.loanDate)}.` : "",
      record.returnDate ? `Data zwrotu z wypożyczenia: ${formatDate(record.returnDate)}.` : "",
      record.manufacturerReturnedDate ? `Zwrócono do producenta: ${formatDate(record.manufacturerReturnedDate)}.` : "",
      deadline && !record.manufacturerReturnedDate ? `Termin zwrotu do producenta: ${formatDate(deadline)}.` : ""
    ),
    manufacturer: record.manufacturer,
    manufacturerReturnDate: record.manufacturerReturnDate,
    manufacturerReturnDateCleared: record.manufacturerReturnDateCleared,
    manufacturerReturned: record.manufacturerReturned,
    manufacturerReturnedDate: record.manufacturerReturnedDate,
    purpose: record.purpose,
    loanHistory: normalizeDemoLoanHistory(record.loanHistory),
    currentAttachments: normalizeDemoAttachments(record.currentAttachments),
    sourceRow: String(record.id || "")
  });
}

function statusFromRepairDates(data) {
  if (data.pickupDate) return "ODEBRANE";
  if (data.returnDate) return "GOTOWE";
  if (data.sentDate) return "W TRAKCIE";
  return data.receivedDate ? "PRZYJĘTE" : data.status || "PRZYJĘTE";
}

function repairDateOrderViolation(data) {
  for (let currentIndex = 1; currentIndex < REPAIR_DATE_ORDER.length; currentIndex += 1) {
    const current = REPAIR_DATE_ORDER[currentIndex];
    const currentDate = data[current.field];
    if (!currentDate) continue;

    for (let previousIndex = 0; previousIndex < currentIndex; previousIndex += 1) {
      const previous = REPAIR_DATE_ORDER[previousIndex];
      const previousDate = data[previous.field];
      if (previousDate && currentDate < previousDate) {
        return {
          field: current.field,
          selector: current.selector,
          message: `${current.label} nie może być wcześniejsza niż ${previous.label.toLocaleLowerCase("pl-PL")}. Kolejność: przyjęcie, wysłanie, powrót, odbiór.`
        };
      }
    }
  }

  return null;
}

function repairRequiredDateViolation(data) {
  if (data?.receivedDate) return null;
  return {
    field: "receivedDate",
    selector: "#repairReceivedDate",
    message: "Data przyjęcia jest wymagana. Bez daty przyjęcia nie można zapisać naprawy ani wkładki."
  };
}

function repairRequiredSerialViolation(data) {
  if (!data?.returnDate) return null;
  if (normalizeSerialNumber(data.serialNumber) || normalizeSerialNumber(data.serialNumber2)) return null;
  return {
    field: "serialNumber",
    selector: "#repairSerialNumber",
    message: "Jeśli wpisana jest data powrotu, wpisz numer seryjny aparatu lub wkładki."
  };
}

function repairDateValidationViolation(data) {
  return repairRequiredDateViolation(data) || repairDateOrderViolation(data) || repairRequiredSerialViolation(data);
}

function clearRepairDateOrderError() {
  if (repairFormError) repairFormError.textContent = "";
  REPAIR_DATE_ORDER.forEach(({ selector }) => {
    const input = document.querySelector(selector);
    input?.removeAttribute("aria-invalid");
    input?.closest(".date-input-wrap")?.classList.remove("invalid-date");
  });
  ["#repairSerialNumber", "#repairSerialNumber2"].forEach((selector) => {
    document.querySelector(selector)?.removeAttribute("aria-invalid");
  });
}

function showRepairDateOrderError(violation, options = {}) {
  clearRepairDateOrderError();
  if (!violation) return true;

  const input = document.querySelector(violation.selector);
  if (repairFormError) repairFormError.textContent = violation.message;
  input?.setAttribute("aria-invalid", "true");
  input?.closest(".date-input-wrap")?.classList.add("invalid-date");
  if (options.focus) input?.focus();
  return false;
}

function validateRepairDateOrder(data = repairFormRecord(), options = {}) {
  return showRepairDateOrderError(repairDateValidationViolation(data), options);
}

function demoDateFieldInfo(field) {
  return DEMO_DATE_VALIDATION_FIELDS.find((item) => item.field === field) || null;
}

function demoDateValidationData() {
  return Object.fromEntries(
    DEMO_DATE_VALIDATION_FIELDS.map(({ field, selector }) => [
      field,
      isoDateForSave(document.querySelector(selector)?.value)
    ])
  );
}

function demoInvalidDateViolation() {
  for (const fieldInfo of DEMO_DATE_VALIDATION_FIELDS) {
    const rawValue = String(document.querySelector(fieldInfo.selector)?.value ?? "").trim();
    if (rawValue && !isoDateForSave(rawValue)) {
      return {
        field: fieldInfo.field,
        selector: fieldInfo.selector,
        message: `${fieldInfo.label} ma nieprawidłowy format. Wpisz datę jako dd.mm.rrrr.`
      };
    }
  }
  return null;
}

function demoDateOrderViolation(data = demoDateValidationData()) {
  for (const constraint of DEMO_DATE_CONSTRAINTS) {
    const currentDate = data[constraint.field];
    const previousDate = data[constraint.previousField];
    if (!currentDate || !previousDate || currentDate >= previousDate) continue;

    const current = demoDateFieldInfo(constraint.field);
    const previous = demoDateFieldInfo(constraint.previousField);
    if (!current || !previous) continue;

    return {
      field: current.field,
      selector: current.selector,
      message: `${current.label} nie może być wcześniejsza niż ${previous.label.toLocaleLowerCase("pl-PL")}.`
    };
  }
  return null;
}

function demoDateValidationViolation(data = demoDateValidationData()) {
  return demoInvalidDateViolation() || demoDateOrderViolation(data);
}

function clearDemoDateValidationError() {
  if (demoFormError?.dataset.errorType === "date") {
    demoFormError.textContent = "";
    delete demoFormError.dataset.errorType;
  }
  DEMO_DATE_VALIDATION_FIELDS.forEach(({ selector }) => {
    const input = document.querySelector(selector);
    input?.removeAttribute("aria-invalid");
    input?.closest(".date-input-wrap")?.classList.remove("invalid-date");
  });
}

function showDemoDateValidationError(violation, options = {}) {
  clearDemoDateValidationError();
  if (!violation) return true;

  const input = document.querySelector(violation.selector);
  if (demoFormError) {
    demoFormError.textContent = violation.message;
    demoFormError.dataset.errorType = "date";
  }
  input?.setAttribute("aria-invalid", "true");
  input?.closest(".date-input-wrap")?.classList.add("invalid-date");
  if (options.focus) input?.focus();
  return false;
}

function validateDemoDateOrder(data = demoDateValidationData(), options = {}) {
  return showDemoDateValidationError(demoDateValidationViolation(data), options);
}

function updateRepairWarrantyHint(data = repairFormRecord()) {
  if (!repairFormError || repairDateValidationViolation(data)) return;
  repairFormError.textContent = repairWarrantyWarning(data, document.querySelector("#repairId").value);
}

function confirmRepairWarrantySave(data, currentId = "") {
  const warning = repairWarrantyWarning(data, currentId);
  if (!warning) return true;
  return confirm(`${warning}\n\nZapisać mimo to?`);
}

function syncRepairStatusFromDates() {
  const data = Object.fromEntries(new FormData(repairForm).entries());
  normalizeFormDateFields(data, REPAIR_DATE_FIELDS);
  data.serialNumber = normalizeSerialNumber(data.serialNumber);
  data.serialNumber2 = normalizeSerialNumber(data.serialNumber2);
  document.querySelector("#repairStatus").value = statusFromRepairDates(data);
  if (validateRepairDateOrder(data)) updateRepairWarrantyHint(data);
}

function syncDemoStatusFromCurrentUser(options = {}) {
  const currentUser = document.querySelector("#demoCurrentUser").value;
  const statusInput = document.querySelector("#demoStatus");
  const manufacturerReturned = isDemoManufacturerReturnedForm();
  const hasCurrentUser = Boolean(String(currentUser).trim());
  if (options.setLoanDate && hasCurrentUser && !document.querySelector("#demoLoanDate").value) {
    setDateInputValue("#demoLoanDate", todayInputValue());
  }
  if (hasCurrentUser) {
    document.querySelector("#demoReturnDate").value = "";
  } else if (options.clearLoanWhenEmpty) {
    document.querySelector("#demoLoanDate").value = "";
  }
  statusInput.value = manufacturerReturned ? "ZWRÓCONO" : demoStatusFromCurrentUser(currentUser);
}

function syncDemoReturnedStatus() {
  const statusInput = document.querySelector("#demoStatus");
  const hasActiveLoan = Boolean(document.querySelector("#demoCurrentUser").value.trim() || document.querySelector("#demoLoanDate").value);
  if (statusInput.value !== "ZWRÓCONO") {
    if (!hasActiveLoan) syncDemoManufacturerReturned(false);
    return;
  }

  if (hasActiveLoan) {
    const returnDateInput = document.querySelector("#demoReturnDate");
    if (!returnDateInput.value) setDateInputValue(returnDateInput, todayInputValue());
    returnDateInput.dataset.autoValue = "";
  } else {
    syncDemoManufacturerReturned(true);
  }
}

function isDemoManufacturerReturnedForm() {
  return Boolean(
    document.querySelector("#demoManufacturerReturned")?.checked ||
    isoDateForSave(document.querySelector("#demoManufacturerReturnedDate")?.value)
  );
}

function syncDemoManufacturerReturned(checked) {
  const checkbox = document.querySelector("#demoManufacturerReturned");
  const dateInput = document.querySelector("#demoManufacturerReturnedDate");
  if (!checkbox || !dateInput) return;

  checkbox.checked = Boolean(checked);
  if (checkbox.checked) {
    if (!dateInput.value) {
      setDateInputValue(dateInput, todayInputValue());
      dateInput.dataset.autoValue = todayInputValue();
    }
    document.querySelector("#demoStatus").value = "ZWRÓCONO";
    return;
  }

  setDateInputValue(dateInput, "");
  dateInput.dataset.autoValue = "";
  syncDemoStatusFromCurrentUser();
}

function markDemoManufacturerReturnedDateChange() {
  const input = document.querySelector("#demoManufacturerReturnedDate");
  const checkbox = document.querySelector("#demoManufacturerReturned");
  const currentValue = isoDateForSave(input.value);
  checkbox.checked = Boolean(currentValue);
  if (currentValue !== input.dataset.autoValue) input.dataset.autoValue = "";
  syncDemoStatusFromCurrentUser();
}

function calculateDemoManufacturerReturnDate() {
  const record = {
    receivedDate: isoDateForSave(document.querySelector("#demoReceivedDate").value),
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
  const currentValue = isoDateForSave(input.value);
  if (!currentValue || currentValue === previousAutoValue) setDateInputValue(input, nextAutoValue);
  input.dataset.autoValue = nextAutoValue;
  syncDemoStatusFromCurrentUser();
}

function markDemoManufacturerReturnDateChange() {
  const input = document.querySelector("#demoManufacturerReturnDate");
  const currentValue = isoDateForSave(input.value);
  document.querySelector("#demoManufacturerReturnDateCleared").value = currentValue ? "" : "1";
  if (currentValue !== input.dataset.autoValue) input.dataset.autoValue = "";
  syncDemoStatusFromCurrentUser();
}

function isDemoManufacturerReturnDateClearedForm() {
  return document.querySelector("#demoManufacturerReturnDateCleared").value === "1";
}

function markDemoReturnDateChange() {
  const input = document.querySelector("#demoReturnDate");
  const currentValue = isoDateForSave(input.value);
  if (currentValue !== input.dataset.autoValue) input.dataset.autoValue = "";
  const statusInput = document.querySelector("#demoStatus");
  const hasActiveLoan = Boolean(document.querySelector("#demoCurrentUser").value.trim());
  if (currentValue && hasActiveLoan) {
    statusInput.value = "ZWRÓCONO";
  } else if (!currentValue && statusInput.value === "ZWRÓCONO" && hasActiveLoan) {
    statusInput.value = "WYPOŻYCZONY";
  }
}

function syncUppercaseTextInput(event) {
  const input = event?.target;
  if (!input) return;
  const start = input.selectionStart;
  const end = input.selectionEnd;
  input.value = input.value.toLocaleUpperCase("pl-PL");
  if (typeof start === "number" && typeof end === "number") {
    input.setSelectionRange(start, end);
  }
}

function syncDemoUppercaseInput(event) {
  syncUppercaseTextInput(event);
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

function handleClearDateClick(event) {
  const button = event.target.closest(".clear-date-btn");
  if (!button) return;

  const targetId = button.dataset.target;
  const input = document.getElementById(targetId);
  if (!input) return;

  input.value = "";
  updateDateInputTodayState(input);

  if (targetId === "paymentReceivedDate") return;

  if (targetId.startsWith("demo")) {
    if (targetId === "demoReturnDate") markDemoReturnDateChange();
    if (targetId === "demoManufacturerReturnDate") markDemoManufacturerReturnDateChange();
    if (targetId === "demoManufacturerReturnedDate") markDemoManufacturerReturnedDateChange();
    validateDemoDateOrder();
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
  const privatePaymentValue = privatePaymentFormValue();
  let savedRecord;
  if (!confirmSerialNumberSave(data.serialNumber, "devices", id)) return;
  const previousDeviceRecord = id ? auditSnapshot(records.find((record) => record.id === id)) : null;
  const previousRecords = records;
  const previousPrivatePayments = { ...privatePayments };
  let privatePaymentUpdates = [];

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
  if (canViewPrivatePayments()) {
    privatePaymentUpdates = privatePaymentUpdatesForRecord(savedRecord, privatePaymentValue);
    applyPrivatePaymentUpdates(privatePaymentUpdates);
  }

  try {
    closeDialog();
    await nextFrame();
    const persistPromise = persistDeviceRecord(savedRecord);
    const privatePaymentPromise = canViewPrivatePayments()
      ? persistPrivatePaymentUpdates(privatePaymentUpdates)
      : Promise.resolve();
    persistPromise.catch(() => {});
    privatePaymentPromise.catch(() => {});
    rebuildAfterDeviceChange();
    render();
    await Promise.all([persistPromise, privatePaymentPromise]);
    logAuditEvent({
      notebook: "devices",
      action: id ? "edit" : "add",
      recordId: savedRecord.id,
      beforeRecord: previousDeviceRecord,
      afterRecord: savedRecord
    });
  } catch (error) {
    records = previousRecords;
    privatePayments = previousPrivatePayments;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    saveLocalPrivatePayments();
    rebuildAfterDeviceChange();
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
    const previousPrivatePayments = { ...privatePayments };
    records = records.filter((item) => item.id !== id);
    if (canViewPrivatePayments()) {
      delete privatePayments[String(id)];
      saveLocalPrivatePayments();
    }
    try {
      await Promise.all([
        persistDeletedDeviceRecord(id),
        canViewPrivatePayments() ? deletePrivatePayment(id) : Promise.resolve()
      ]);
      rebuildDerivedData();
      render();
      closeDialog();
    } catch (error) {
      records = previousRecords;
      privatePayments = previousPrivatePayments;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
      saveLocalPrivatePayments();
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
  if (!validateRepairDateOrder(data, { focus: true })) return;
  if (!confirmSerialNumberSave(data.serialNumber, "repairs", id)) return;
  if (!confirmRepairWarrantySave(data, id)) return;
  const previousRepairRecord = id ? auditSnapshot(repairRecords.find((record) => record.id === id)) : null;
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
    closeRepairDialog();
    await nextFrame();
    const persistPromise = persistRepairRecord(savedRecord);
    persistPromise.catch(() => {});
    rebuildAfterRepairChange();
    render();
    await persistPromise;
    logAuditEvent({
      notebook: "repairs",
      action: id ? "edit" : "add",
      recordId: savedRecord.id,
      beforeRecord: previousRepairRecord,
      afterRecord: savedRecord
    });
  } catch (error) {
    repairRecords = previousRepairRecords;
    localStorage.setItem(REPAIR_STORAGE_KEY, JSON.stringify(repairRecords));
    rebuildAfterRepairChange();
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
  delete demoFormError.dataset.errorType;
  if (!validateDemoDateOrder(undefined, { focus: true })) return;
  const id = document.querySelector("#demoId").value;
  const recordId = id || `${DEMO_ID_PREFIX}${makeId()}`;
  let data = demoFormRecord();
  if (!validateDemoDateOrder(data, { focus: true })) return;
  let savedRecord;
  if (!id && !data.serialNumber) {
    demoFormError.textContent = "Numer seryjny jest wymagany przy dodawaniu nowego aparatu demo.";
    document.querySelector("#demoSerialNumber").focus();
    return;
  }
  if (!confirmSerialNumberSave(data.serialNumber, "demo", id)) return;
  const previousDemoRecords = demoRecords;
  const existingRecord = id ? demoRecords.find((record) => record.id === id) : null;
  const previousDemoRecord = auditSnapshot(existingRecord);
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
    closeDemoDialog();
    await nextFrame();
    const persistPromise = persistDemoRecord(savedRecord);
    persistPromise.catch(() => {});
    rebuildAfterDemoChange();
    render();
    await persistPromise;
    logAuditEvent({
      notebook: "demo",
      action: id ? "edit" : "add",
      recordId: savedRecord.id,
      beforeRecord: previousDemoRecord,
      afterRecord: savedRecord
    });
    const savedPaths = new Set(demoAttachmentPaths(savedRecord));
    try {
      await removeDemoAttachmentPaths(previousAttachmentPaths.filter((path) => !savedPaths.has(path)));
    } catch (cleanupError) {
      console.warn(cleanupError);
    }
  } catch (error) {
    demoRecords = previousDemoRecords;
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(demoRecords));
    rebuildAfterDemoChange();
    render();
    if (demoDialog.open) {
      demoFormError.textContent = error.message || "Nie udało się zapisać rekordu.";
    } else {
      alert(error.message || "Nie udało się zapisać rekordu.");
    }
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

function currentDeviceRecordFromDialog() {
  const id = document.querySelector("#recordId").value;
  return id ? records.find((record) => record.id === id) : null;
}

function currentDemoRecordFromDialog() {
  const id = document.querySelector("#demoId").value;
  return id ? demoRecords.find((record) => record.id === id) : null;
}

function deviceDuplicateDraft(record) {
  return normalizeDeviceRecordForUse({
    receivedDate: todayInputValue(),
    deviceName: record?.deviceName || "",
    serialNumber: "",
    type: "NA STANIE",
    location: normalizeRepairLocation(record?.location),
    pickupDate: "",
    customerName: "",
    salesInvoice: "",
    returnDate: "",
    waybillNumber: "",
    ezwm: "",
    notes: ""
  });
}

function demoDuplicateDraft(record) {
  return normalizeDemoRecordForUse({
    receivedDate: todayInputValue(),
    manufacturerReturnDate: "",
    manufacturerReturnDateCleared: "",
    manufacturerReturned: "",
    manufacturerReturnedDate: "",
    manufacturer: record?.manufacturer || "",
    deviceName: record?.deviceName || "",
    serialNumber: "",
    status: "NA STANIE",
    purpose: normalizeDemoPurpose(record?.purpose),
    location: normalizeDemoLocation(record?.location),
    currentUser: "",
    loanDate: "",
    returnDate: "",
    notes: "",
    loanHistory: [],
    currentAttachments: [],
    sourceRow: String(record?.id || "")
  });
}

function duplicateCurrentDeviceRecord() {
  const record = currentDeviceRecordFromDialog();
  if (!record) return;
  const draft = deviceDuplicateDraft(record);
  closeDialog();
  window.setTimeout(() => {
    openDialog();
    fillDeviceFormValues(draft);
    document.querySelector("#recordId").value = "";
    dialogTitle.textContent = draft.deviceName || "Dodaj podobny aparat";
    recordEyebrow.textContent = "Nowy rekord";
    dialogSerial.textContent = "";
    dialogSerial.hidden = true;
    syncDeviceTypeFromFields();
  }, 0);
}

function duplicateCurrentDemoRecord() {
  const record = currentDemoRecordFromDialog();
  if (!record) return;
  const draft = demoDuplicateDraft(record);
  closeDemoDialog();
  window.setTimeout(() => {
    openDemoDialog();
    fillDemoFormValues(draft);
    document.querySelector("#demoId").value = "";
    demoDialogTitle.textContent = draft.deviceName || "Dodaj podobny aparat demo";
    demoRecordEyebrow.textContent = "Nowy wpis";
    demoLoanHistoryDraft = [];
    demoCurrentAttachmentsDraft = [];
    renderDemoCurrentAttachments();
    renderDemoLoanHistory(null);
    syncDemoManufacturerReturnDate();
  }, 0);
}

async function moveCurrentDeviceRecordToDemo() {
  const record = currentDeviceRecordFromDialog();
  if (!record) return;
  const moved = await moveDeviceRecordToDemo(record);
  if (moved) closeDialog();
}

async function moveCurrentDemoRecordToDevices() {
  const record = currentDemoRecordFromDialog();
  if (!record) return;
  const moved = await moveDemoRecordToDevices(record);
  if (moved) closeDemoDialog();
}

async function moveDeviceRecordToDemo(record) {
  if (!record?.id) return false;
  const label = `${record.deviceName || "Aparat"}${record.serialNumber ? ` (${record.serialNumber})` : ""}`;
  if (!confirm(`Przenieść ${label} z Bazy do Demo?`)) return false;

  const previousRecords = records;
  const previousDemoRecords = demoRecords;
  const previousPrivatePayments = { ...privatePayments };
  const movedRecord = deviceRecordToDemoRecord(record);

  records = records.filter((item) => item.id !== record.id);
  demoRecords = [movedRecord, ...demoRecords];
  if (canViewPrivatePayments()) {
    delete privatePayments[String(record.id)];
    saveLocalPrivatePayments();
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(demoRecords));
  rebuildDerivedData();
  render();

  try {
    await Promise.all([
      persistDemoRecord(movedRecord),
      persistDeletedDeviceRecord(record.id),
      canViewPrivatePayments() ? deletePrivatePayment(record.id) : Promise.resolve()
    ]);
    logAuditEvent({
      notebook: "demo",
      action: "move",
      recordId: movedRecord.id,
      beforeRecord: record,
      afterRecord: movedRecord
    });
    return true;
  } catch (error) {
    records = previousRecords;
    demoRecords = previousDemoRecords;
    privatePayments = previousPrivatePayments;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(demoRecords));
    saveLocalPrivatePayments();
    rebuildDerivedData();
    render();
    alert(error.message || "Nie udało się przenieść rekordu do Demo.");
    return false;
  }
}

async function moveDemoRecordToDevices(record) {
  if (!record?.id) return false;
  const label = `${record.deviceName || "Aparat demo"}${record.serialNumber ? ` (${record.serialNumber})` : ""}`;
  if (!confirm(`Przenieść ${label} z Demo do Zeszytu aparatów?`)) return false;

  const previousRecords = records;
  const previousDemoRecords = demoRecords;
  const movedRecord = demoRecordToDeviceRecord(record);

  demoRecords = demoRecords.filter((item) => item.id !== record.id);
  records = [movedRecord, ...records];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(demoRecords));
  rebuildDerivedData();
  render();

  try {
    await Promise.all([
      persistDeviceRecord(movedRecord),
      persistDeletedDemoRecord(record.id)
    ]);
    logAuditEvent({
      notebook: "devices",
      action: "move",
      recordId: movedRecord.id,
      beforeRecord: record,
      afterRecord: movedRecord
    });
    return true;
  } catch (error) {
    records = previousRecords;
    demoRecords = previousDemoRecords;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(demoRecords));
    rebuildDerivedData();
    render();
    alert(error.message || "Nie udało się przenieść rekordu do Bazy.");
    return false;
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
    "Numer seryjny 1",
    "Numer seryjny 2",
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
    record.serialNumber2 ?? "",
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

function importPricingCsv(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.addEventListener("load", async () => {
    const previousPricingRecords = pricingRecords;
    const previousPricingMeta = pricingMeta;
    try {
      const imported = parseCsv(reader.result);
      const importedPricingRecords = normalizePricingRecordsForUse(imported);
      if (!importedPricingRecords.length) throw new Error("CSV nie zawiera pozycji cennika.");

      const merged = mergePricingRecords(pricingRecords, importedPricingRecords);
      if (!confirm(`Import CSV: nowe pozycje ${merged.added}, aktualizacje ${merged.updated}. Kontynuować?`)) {
        pricingImportInput.value = "";
        return;
      }

      pricingRecords = merged.records;
      markPricingUpdatedNow();
      await persistPricingRecords();
      renderPricingRecords();
      pricingImportInput.value = "";
    } catch (error) {
      pricingRecords = previousPricingRecords;
      pricingMeta = previousPricingMeta;
      savePricingMeta();
      savePricingRecords();
      renderPricingRecords();
      pricingImportInput.value = "";
      alert(`Nie udało się zaimportować cennika: ${error.message}`);
    }
  });
  reader.readAsText(file);
}

function resetPricingFiltersAfterFullUpdate() {
  if (pricingSearchInput) pricingSearchInput.value = "";
  pricingNfzDefaultApplied = false;
  if (pricingNfzFilter) pricingNfzFilter.value = "";
  if (pricingManufacturerFilter) pricingManufacturerFilter.value = "";
}

function replacePricingCsv(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.addEventListener("load", async () => {
    const previousPricingRecords = pricingRecords;
    const previousPricingMeta = pricingMeta;
    try {
      const imported = parseCsv(reader.result);
      const importedPricingRecords = normalizePricingRecordsForUse(imported);
      if (!importedPricingRecords.length) throw new Error("CSV nie zawiera pozycji cennika.");

      const oldCount = pricingRecords.length;
      const newCount = importedPricingRecords.length;
      if (!confirm(`Wgrać nowy cennik CSV? Obecny cennik (${oldCount} pozycji) zostanie zastąpiony plikiem (${newCount} pozycji).`)) {
        pricingReplaceInput.value = "";
        return;
      }

      pricingRecords = importedPricingRecords;
      markPricingUpdatedNow();
      await persistPricingRecords();
      resetPricingFiltersAfterFullUpdate();
      renderPricingRecords();
      pricingReplaceInput.value = "";
    } catch (error) {
      pricingRecords = previousPricingRecords;
      pricingMeta = previousPricingMeta;
      savePricingMeta();
      savePricingRecords();
      renderPricingRecords();
      pricingReplaceInput.value = "";
      alert(`Nie udało się wgrać nowego cennika: ${error.message}`);
    }
  });
  reader.readAsText(file);
}

function pricingRecordKey(record) {
  if (record.idProduct) return `id:${normalize(record.idProduct)}`;
  return `name:${normalize([record.nfzCode, record.tradeName, record.model, record.manufacturer].join("|"))}`;
}

function mergePricingRecords(existingRecords, importedRecords) {
  const recordsToMerge = normalizePricingRecordsForUse(existingRecords);
  const indexByKey = new Map(recordsToMerge.map((record, index) => [pricingRecordKey(record), index]));
  let added = 0;
  let updated = 0;

  importedRecords.forEach((record) => {
    const key = pricingRecordKey(record);
    if (indexByKey.has(key)) {
      recordsToMerge[indexByKey.get(key)] = record;
      updated += 1;
      return;
    }
    indexByKey.set(key, recordsToMerge.length);
    recordsToMerge.push(record);
    added += 1;
  });

  return { records: recordsToMerge, added, updated };
}

async function resetPricingRecords() {
  const seedRecords = pricingSeedRecords();
  if (!seedRecords.length) {
    alert("Nie udało się wczytać cennika. Wgraj najnowszy app.js i odśwież stronę.");
    return;
  }
  if (pricingRecords.length && !confirm(`Przywrócić cennik z pliku (${seedRecords.length} pozycji)?`)) return;
  const previousPricingRecords = pricingRecords;
  const previousPricingMeta = pricingMeta;
  pricingRecords = seedRecords;
  resetPricingMetaToSeed();
  try {
    await persistPricingRecords();
    resetPricingFiltersAfterFullUpdate();
    renderPricingRecords();
  } catch (error) {
    pricingRecords = previousPricingRecords;
    pricingMeta = previousPricingMeta;
    savePricingMeta();
    savePricingRecords();
    renderPricingRecords();
    alert(`Nie udało się przywrócić cennika: ${error.message}`);
  }
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
  const delimiter = detectCsvDelimiter(normalizedContent);
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
    } else if (char === delimiter && !inQuotes) {
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

function detectCsvDelimiter(content) {
  const firstLine = String(content).split(/\r?\n/).find((line) => line.trim()) || "";
  const semicolons = (firstLine.match(/;/g) || []).length;
  const commas = (firstLine.match(/,/g) || []).length;
  return semicolons >= commas ? ";" : ",";
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
    "numer seryjny 1": "serialNumber",
    "nr seryjny 1": "serialNumber",
    "numer seryjny 2": "serialNumber2",
    "nr seryjny 2": "serialNumber2",
    "drugi numer seryjny": "serialNumber2",
    "drugi nr seryjny": "serialNumber2",
    "numer seryjny wkładki 2": "serialNumber2",
    "numer seryjny wkladki 2": "serialNumber2",
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
    "status": "status",
    "id prod handl": "idProduct",
    "id produktu": "idProduct",
    "kod srodka nfz": "nfzCode",
    "kod środka nfz": "nfzCode",
    "kod nfz": "nfzCode",
    "nazwa handlowa": "tradeName",
    "model": "model",
    "producent": "manufacturer",
    "ind zamow": "orderIndex",
    "ind zamów": "orderIndex",
    "cena brutto": "grossPrice",
    "kod prod swd": "swdCode",
    "kod swd": "swdCode"
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
  if ("serialNumber2" in normalizedRecord) {
    normalizedRecord.serialNumber2 = normalizeSerialNumber(normalizedRecord.serialNumber2);
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
  return isoDateForSave(text) || text;
}

function ensureDatePicker() {
  if (datePicker) return datePicker;
  datePicker = document.createElement("div");
  datePicker.className = "two-month-picker";
  datePicker.hidden = true;
  document.body.append(datePicker);
  return datePicker;
}

function setupDatePickers() {
  ensureDatePicker();
  document.querySelectorAll("input[data-date-picker]").forEach((input) => {
    updateDateInputTodayState(input);
    input.addEventListener("focus", () => openDatePicker(input));
    input.addEventListener("click", () => openDatePicker(input));
    input.addEventListener("blur", () => {
      const isoDate = isoDateForSave(input.value);
      if (isoDate) input.value = displayDateForInput(isoDate);
      updateDateInputTodayState(input);
    });
    input.addEventListener("input", () => updateDateInputTodayState(input));
    input.addEventListener("change", () => updateDateInputTodayState(input));
    input.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeDatePicker();
    });
  });

  document.addEventListener("mousedown", (event) => {
    const picker = ensureDatePicker();
    if (
      !picker.hidden &&
      activeDateInput &&
      !picker.contains(event.target) &&
      event.target !== activeDateInput
    ) {
      closeDatePicker();
    }
  });

  window.addEventListener("resize", positionDatePicker);
  window.addEventListener("scroll", positionDatePicker, true);
}

function openDatePicker(input) {
  const picker = ensureDatePicker();
  activeDateInput = input;

  const selectedDate = parseIsoDate(input.value);
  const baseDate = selectedDate || new Date();
  datePickerMonth = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);

  const hostDialog = input.closest("dialog");
  if (hostDialog && picker.parentElement !== hostDialog) {
    hostDialog.append(picker);
  } else if (!hostDialog && picker.parentElement !== document.body) {
    document.body.append(picker);
  }

  renderDatePicker();
  picker.hidden = false;
  positionDatePicker();
}

function closeDatePicker() {
  const picker = ensureDatePicker();
  picker.hidden = true;
  activeDateInput = null;
}

function positionDatePicker() {
  const picker = ensureDatePicker();
  if (picker.hidden || !activeDateInput) return;

  const rect = activeDateInput.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const pickerWidth = Math.min(620, viewportWidth - 24);
  picker.style.width = `${pickerWidth}px`;

  const left = Math.max(12, Math.min(rect.left, viewportWidth - pickerWidth - 12));
  const measuredHeight = picker.offsetHeight || 360;
  const hostDialog = activeDateInput.closest("dialog");
  const hostRect = hostDialog?.getBoundingClientRect();
  const bottomLimit = Math.min(viewportHeight - 12, hostRect ? hostRect.bottom - 12 : viewportHeight - 12);
  const belowTop = rect.bottom + 8;
  const aboveTop = rect.top - measuredHeight - 8;
  const top = belowTop + measuredHeight <= bottomLimit ? belowTop : Math.max(12, aboveTop);

  picker.style.left = `${left}px`;
  picker.style.top = `${top}px`;
}

function activeRepairDateMinimumInfo() {
  if (!activeDateInput) return null;

  const currentIndex = REPAIR_DATE_ORDER.findIndex(({ selector }) => document.querySelector(selector) === activeDateInput);
  if (currentIndex <= 0) return null;

  const previousDates = REPAIR_DATE_ORDER.slice(0, currentIndex)
    .map(({ field, label, selector }) => ({
      field,
      label,
      date: isoDateForSave(document.querySelector(selector)?.value)
    }))
    .filter(({ date }) => date);

  if (!previousDates.length) return null;

  return previousDates.reduce((latest, item) => (item.date > latest.date ? item : latest), previousDates[0]);
}

function activeDemoDateMinimumInfo() {
  if (!activeDateInput) return null;

  const current = DEMO_DATE_VALIDATION_FIELDS.find(({ selector }) => document.querySelector(selector) === activeDateInput);
  if (!current) return null;

  const previousDates = DEMO_DATE_CONSTRAINTS
    .filter((constraint) => constraint.field === current.field)
    .map((constraint) => {
      const previous = demoDateFieldInfo(constraint.previousField);
      return previous
        ? {
            field: previous.field,
            label: previous.label,
            date: isoDateForSave(document.querySelector(previous.selector)?.value)
          }
        : null;
    })
    .filter((item) => item?.date);

  if (!previousDates.length) return null;

  return previousDates.reduce((latest, item) => (item.date > latest.date ? item : latest), previousDates[0]);
}

function activeDateMinimumInfo() {
  return activeRepairDateMinimumInfo() || activeDemoDateMinimumInfo();
}

function renderDatePicker() {
  const picker = ensureDatePicker();
  const selectedDate = parseIsoDate(activeDateInput?.value);
  const today = new Date();
  const currentMonth = new Date(datePickerMonth.getFullYear(), datePickerMonth.getMonth(), 1);
  const nextMonth = new Date(datePickerMonth.getFullYear(), datePickerMonth.getMonth() + 1, 1);
  const dateMinimum = activeDateMinimumInfo();

  const head = document.createElement("div");
  head.className = "date-picker-head";

  const previousButton = document.createElement("button");
  previousButton.className = "date-picker-nav";
  previousButton.type = "button";
  previousButton.textContent = "‹";
  previousButton.setAttribute("aria-label", "Poprzedni miesiąc");
  previousButton.addEventListener("click", () => {
    datePickerMonth = new Date(datePickerMonth.getFullYear(), datePickerMonth.getMonth() - 1, 1);
    renderDatePicker();
  });

  const title = document.createElement("strong");
  title.textContent = "Wybierz datę";

  const nextButton = document.createElement("button");
  nextButton.className = "date-picker-nav";
  nextButton.type = "button";
  nextButton.textContent = "›";
  nextButton.setAttribute("aria-label", "Następny miesiąc");
  nextButton.addEventListener("click", () => {
    datePickerMonth = new Date(datePickerMonth.getFullYear(), datePickerMonth.getMonth() + 1, 1);
    renderDatePicker();
  });

  const clearButton = document.createElement("button");
  clearButton.className = "date-picker-clear";
  clearButton.type = "button";
  clearButton.textContent = "Wyczyść";
  clearButton.addEventListener("click", () => {
    if (!activeDateInput) return;
    activeDateInput.value = "";
    activeDateInput.dispatchEvent(new Event("input", { bubbles: true }));
    activeDateInput.dispatchEvent(new Event("change", { bubbles: true }));
    closeDatePicker();
  });

  head.append(previousButton, title, nextButton, clearButton);

  const hint = document.createElement("p");
  hint.className = "date-picker-hint";
  if (dateMinimum) {
    hint.textContent = `Czerwone daty są wcześniejsze niż ${dateMinimum.label.toLocaleLowerCase("pl-PL")} (${displayDateForInput(dateMinimum.date)}).`;
  }

  const months = document.createElement("div");
  months.className = "date-picker-months";
  months.append(
    createDatePickerMonth(currentMonth, selectedDate, today, dateMinimum),
    createDatePickerMonth(nextMonth, selectedDate, today, dateMinimum)
  );

  picker.replaceChildren(head, hint, months);
  positionDatePicker();
}

function createDatePickerMonth(monthDate, selectedDate, today, dateMinimum = null) {
  const month = document.createElement("section");
  month.className = "date-picker-month";
  const selectedIsoDate = selectedDate
    ? isoDateFromParts(selectedDate.getFullYear(), selectedDate.getMonth() + 1, selectedDate.getDate())
    : "";
  const todayIsoDate = isoDateFromParts(today.getFullYear(), today.getMonth() + 1, today.getDate());

  const title = document.createElement("h3");
  title.textContent = monthDate.toLocaleDateString("pl-PL", { month: "long", year: "numeric" });
  month.append(title);

  const grid = document.createElement("div");
  grid.className = "date-picker-grid";
  ["Pn", "Wt", "Śr", "Cz", "Pt", "Sb", "Nd"].forEach((weekday) => {
    const item = document.createElement("span");
    item.className = "date-picker-weekday";
    item.textContent = weekday;
    grid.append(item);
  });

  const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const leadingEmptyCells = (firstDay.getDay() + 6) % 7;
  for (let index = 0; index < leadingEmptyCells; index += 1) {
    const empty = document.createElement("span");
    empty.className = "date-picker-empty";
    grid.append(empty);
  }

  const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
  for (let day = 1; day <= daysInMonth; day += 1) {
    const isoDate = isoDateFromParts(monthDate.getFullYear(), monthDate.getMonth() + 1, day);
    const button = document.createElement("button");
    button.className = "date-picker-day";
    button.type = "button";
    button.textContent = String(day);
    button.dataset.value = isoDate;

    if (isoDate === selectedIsoDate) button.classList.add("selected");
    if (isoDate === todayIsoDate) button.classList.add("today");
    if (dateMinimum && isoDate < dateMinimum.date) {
      button.classList.add("invalid-order");
      button.title = `Ta data jest wcześniejsza niż ${dateMinimum.label.toLocaleLowerCase("pl-PL")} (${displayDateForInput(dateMinimum.date)}).`;
    }

    button.addEventListener("click", () => {
      if (!activeDateInput) return;
      activeDateInput.value = displayDateForInput(isoDate);
      activeDateInput.dispatchEvent(new Event("input", { bubbles: true }));
      activeDateInput.dispatchEvent(new Event("change", { bubbles: true }));
      closeDatePicker();
    });

    grid.append(button);
  }

  month.append(grid);
  return month;
}

function debounce(callback, wait) {
  let timeoutId = 0;
  return (...args) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => callback(...args), wait);
  };
}

function registerQualityHintListeners(context, selectors) {
  const update = debounce(() => renderQualityHints(context), SEARCH_DEBOUNCE_MS);
  selectors.forEach((selector) => {
    const input = document.querySelector(selector);
    if (!input) return;
    ["input", "change", "blur"].forEach((eventName) => input.addEventListener(eventName, update));
  });
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

function resetDeviceFilters() {
  searchInput.value = "";
  typeFilter.value = "";
  ezwmFilter.value = "";
  fifoFilter.value = "";
  locationFilter.value = "";
  resetAndRenderDeviceViews();
}

function resetDemoFilters() {
  demoSearchInput.value = "";
  demoStatusFilter.value = "";
  demoManufacturerFilter.value = "";
  demoLocationFilter.value = "";
  resetAndRenderDemoRecords();
}

function resetRepairFilters() {
  repairSearchInput.value = "";
  repairCategoryFilter.value = "";
  repairStatusFilter.value = "";
  repairLocationFilter.value = "";
  resetAndRenderRepairRecords();
}

function resetDataControlFilters() {
  dataControlSearchInput.value = "";
  resetTableRenderLimit("dataControl");
  renderDataControlView();
}

function updateScrollTopButton() {
  if (!scrollTopBtn) return;
  scrollTopBtn.hidden = window.scrollY < 700;
}

function scrollToPageTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function nextFrame() {
  return new Promise((resolve) => window.requestAnimationFrame(resolve));
}

document.querySelector("#addBtn").addEventListener("click", () => openDialog());
document.querySelector("#exportBtn").addEventListener("click", () => chooseExportFormat(exportCsv, exportJson));
document.querySelector("#importBtn").addEventListener("click", () => importInput.click());
document.querySelector("#printBtn").addEventListener("click", () => window.print());
printStockChecklistBtn.addEventListener("click", printStockChecklist);
saveStockAuditBtn?.addEventListener("click", saveStockAuditFromForm);
exportStockAuditPdfBtn?.addEventListener("click", exportStockAuditPdf);
clearStockAuditBtn?.addEventListener("click", clearStockAuditItems);
scrollTopBtn?.addEventListener("click", scrollToPageTop);
workstationBtn?.addEventListener("click", () => promptForWorkstationName({ force: true }));
window.addEventListener("scroll", updateScrollTopButton, { passive: true });
stockAuditPersonInput?.addEventListener("input", (event) => {
  event.target.value = titleCaseNameInput(event.target.value);
});
stockAuditPersonInput?.addEventListener("blur", (event) => {
  event.target.value = titleCaseName(event.target.value);
});
showMoreRecordsBtn.addEventListener("click", () => showMoreTableRows("devices", renderDeviceViews));
document.querySelector("#addRepairBtn").addEventListener("click", () => openRepairDialog());
document.querySelector("#exportRepairBtn").addEventListener("click", () => chooseExportFormat(exportRepairCsv, exportRepairJson));
document.querySelector("#importRepairBtn").addEventListener("click", () => importRepairInput.click());
document.querySelector("#printRepairBtn").addEventListener("click", () => window.print());
showMoreRepairBtn.addEventListener("click", () => showMoreTableRows("repairs", renderRepairRecords));
showMoreRepairOpenBtn.addEventListener("click", () => showMoreTableRows("repairOpen", renderRepairRecords));
document.querySelector("#addDemoBtn").addEventListener("click", () => openDemoDialog());
document.querySelector("#exportDemoBtn").addEventListener("click", exportDemoJson);
importPricingBtn?.addEventListener("click", () => pricingImportInput.click());
replacePricingBtn?.addEventListener("click", () => pricingReplaceInput.click());
resetPricingBtn?.addEventListener("click", resetPricingRecords);
pricingImportInput?.addEventListener("change", importPricingCsv);
pricingReplaceInput?.addEventListener("change", replacePricingCsv);
pricingSearchInput?.addEventListener("input", debounce(renderPricingRecords, SEARCH_DEBOUNCE_MS));
pricingNfzFilter?.addEventListener("change", () => {
  pricingNfzDefaultApplied = true;
  renderPricingRecords();
});
pricingManufacturerFilter?.addEventListener("change", renderPricingRecords);
pricingViewButtons.forEach((button) => {
  button.addEventListener("click", () => switchPricingView(button.dataset.pricingView));
});
pcprForm?.addEventListener("submit", addPricingPcprItem);
pcprCustomerInput?.addEventListener("input", (event) => {
  event.target.value = titleCaseNameInput(event.target.value);
});
pcprCustomerInput?.addEventListener("blur", (event) => {
  event.target.value = titleCaseName(event.target.value);
});
pcprOfficeInput?.addEventListener("change", updatePcprOfficeHint);
pcprOfficeInput?.addEventListener("change", () => syncPcprPlaceFromOffice({ force: false }));
cancelPcprEditBtn?.addEventListener("click", resetPricingPcprForm);
pcprPhoneInput?.addEventListener("input", (event) => {
  event.target.value = formatPcprPhone(event.target.value);
});
pcprPostalCodeInput?.addEventListener("input", (event) => {
  event.target.value = formatPcprPostalCode(event.target.value);
  syncPcprCityFromPostalCode({ force: false });
});
pcprPostalCodeInput?.addEventListener("blur", () => syncPcprCityFromPostalCode({ force: true }));
pcprCityInput?.addEventListener("input", () => {
  if (pcprCityInput) pcprCityInput.dataset.autoCity = "";
});
pcprCityInput?.addEventListener("blur", (event) => {
  event.target.value = normalizePcprCity(event.target.value);
});
pcprStreetInput?.addEventListener("blur", (event) => {
  event.target.value = normalizePcprStreet(event.target.value);
});
pcprModelInput?.addEventListener("change", syncPcprModelFromPricing);
pcprModelInput?.addEventListener("blur", syncPcprModelFromPricing);
pcprModelInput2?.addEventListener("change", syncPcprSecondModelFromPricing);
pcprModelInput2?.addEventListener("blur", syncPcprSecondModelFromPricing);
addPcprSecondModelBtn?.addEventListener("click", () => {
  setPcprSecondModelVisible(true);
  if (pcprModelInput2 && !pcprModelInput2.value.trim()) pcprModelInput2.value = pcprModelInput?.value || "";
  if (!pcprModelInput2?.value.trim()) pcprModelInput2?.focus();
});
removePcprSecondModelBtn?.addEventListener("click", () => setPcprSecondModelVisible(false));
pcprPlaceInput?.addEventListener("input", () => {
  if (pcprPlaceInput) pcprPlaceInput.dataset.autoPlace = "";
});
pcprPlaceInput?.addEventListener("change", (event) => {
  event.target.value = normalizePcprPlace(event.target.value) || "T12";
  if (pcprPlaceInput) pcprPlaceInput.dataset.autoPlace = "";
  updateDocumentLocationAccent(pcprPlaceInput);
});
pcprPlaceTabs.forEach((button) => {
  button.addEventListener("click", () => {
    pricingPcprPlaceFilter = button.dataset.pcprPlaceTab || "";
    updatePcprFilterTabs();
    renderPricingPcprList();
  });
});
pcprOfficeTabs.forEach((button) => {
  button.addEventListener("click", () => {
    pricingPcprOfficeFilter = button.dataset.pcprOfficeTab || "";
    updatePcprFilterTabs();
    renderPricingPcprList();
  });
});
resetPcprFiltersBtn?.addEventListener("click", resetPricingPcprFilters);
updatePcprOfficeHint();
updatePcprFilterTabs();
updatePcprFormMode();
[offerCustomerInput, offerDateInput, offerLocationInput, offerPfronInput, offerPfronEnabledInput, offerNoNfzInput, offerDeviceInput1, offerDeviceInput2].forEach((input) => {
  input?.addEventListener("input", renderPricingOffer);
  input?.addEventListener("change", renderPricingOffer);
});
offerAgeInput?.addEventListener("input", () => {
  renderPricingOfferDeviceList();
  renderPricingOffer();
  if (activeNotebook === "agreements" && activePricingView === "list") renderPricingRecords();
});
offerAgeInput?.addEventListener("change", () => {
  renderPricingOfferDeviceList();
  renderPricingOffer();
  if (activeNotebook === "agreements" && activePricingView === "list") renderPricingRecords();
});
offerCustomerInput?.addEventListener("input", (event) => {
  event.target.value = titleCaseNameInput(event.target.value);
});
offerCustomerInput?.addEventListener("blur", (event) => {
  event.target.value = titleCaseName(event.target.value);
  renderPricingOffer();
});
offerDuplicateFirstBtn?.addEventListener("click", () => {
  duplicatePricingOfferDevice();
});
offerMoveRightToLeftBtn?.addEventListener("click", () => movePricingOfferDevice(offerDeviceInput1, offerDeviceInput2, "P"));
offerMoveLeftToRightBtn?.addEventListener("click", () => movePricingOfferDevice(offerDeviceInput2, offerDeviceInput1, "L"));
savePricingOfferBtn?.addEventListener("click", () => saveCurrentPricingOfferToHistory());
printPricingOfferBtn?.addEventListener("click", printPricingOffer);
loanContractNumberInput?.addEventListener("input", () => {
  loanContractNumberInput.dataset.autoNumber = "";
}, { capture: true });
[
  loanContractNumberInput,
  loanDateInput,
  loanCityInput,
  loanDepositInput,
  loanPeriodFromInput,
  loanPeriodToInput,
  loanCustomerInput,
  loanAddressInput,
  loanDocumentInput,
  loanPhoneInput,
  loanRightDeviceInput,
  loanRightSerialInput,
  loanRightManufacturerInput,
  loanRightValueInput,
  loanLeftDeviceInput,
  loanLeftSerialInput,
  loanLeftManufacturerInput,
  loanLeftValueInput,
  loanChargerInput,
  loanChargerSerialInput,
  loanChargerStateInput,
  loanChargerMissingValueInput,
  loanIssueNotesInput,
  loanReturnDateInput,
  loanDepositReturnDateInput,
  loanDeductionsInput,
  loanDeductionReasonInput
].forEach((input) => {
  input?.addEventListener("input", renderPricingLoan);
  input?.addEventListener("change", renderPricingLoan);
});
loanCustomerInput?.addEventListener("input", (event) => {
  event.target.value = titleCaseNameInput(event.target.value);
});
loanCustomerInput?.addEventListener("blur", (event) => {
  event.target.value = titleCaseName(event.target.value);
  renderPricingLoan();
});
[loanRightSerialInput, loanLeftSerialInput, loanChargerSerialInput].forEach((input) => {
  input?.addEventListener("input", (event) => {
    event.target.value = event.target.value.toLocaleUpperCase("pl-PL");
  });
});
[loanRightSerialInput, loanLeftSerialInput].forEach((input) => {
  input?.addEventListener("input", () => fillLoanDeviceFromSerial(loanSideFromSerialInput(input), true));
  input?.addEventListener("change", () => fillLoanDeviceFromSerial(loanSideFromSerialInput(input), true));
  input?.addEventListener("blur", () => fillLoanDeviceFromSerial(loanSideFromSerialInput(input), true));
  input?.addEventListener("focus", () => updateLoanSerialPasteHint(loanSideFromSerialInput(input)));
  input?.addEventListener("mouseenter", () => updateLoanSerialPasteHint(loanSideFromSerialInput(input)));
});
loanSerialFields.forEach((field) => {
  field.addEventListener("mouseenter", () => updateLoanSerialPasteHint(field.dataset.loanSerialField));
});
loanPasteSerialButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    void pasteCopiedSerialToLoanDevice(button.dataset.pasteLoanSerial);
  });
});
loanClearDeviceButtons.forEach((button) => {
  button.addEventListener("click", () => clearLoanDevice(button.dataset.clearLoanDevice));
});
loanRightDeviceInput?.addEventListener("change", () => {
  autofillLoanDeviceFromInput("right", false);
  renderPricingLoan();
});
loanRightDeviceInput?.addEventListener("blur", () => {
  autofillLoanDeviceFromInput("right", false);
  renderPricingLoan();
});
loanLeftDeviceInput?.addEventListener("change", () => {
  autofillLoanDeviceFromInput("left", false);
  renderPricingLoan();
});
loanLeftDeviceInput?.addEventListener("blur", () => {
  autofillLoanDeviceFromInput("left", false);
  renderPricingLoan();
});
loanCopyOfferBtn?.addEventListener("click", () => {
  activePricingLoanHistoryId = "";
  if (loanContractNumberInput) loanContractNumberInput.dataset.autoNumber = "1";
  syncLoanFormFromOffer(true);
  ensureLoanContractNumber({ force: true });
  renderPricingLoan();
});
loanDuplicateRightBtn?.addEventListener("click", duplicateLoanDevice);
loanMoveRightToLeftBtn?.addEventListener("click", () => moveLoanDevice("right", "left"));
loanMoveLeftToRightBtn?.addEventListener("click", () => moveLoanDevice("left", "right"));
savePricingLoanBtn?.addEventListener("click", () => saveCurrentPricingLoanToHistory());
printPricingLoanBtn?.addEventListener("click", printPricingLoan);
orderNumberInput?.addEventListener("input", () => {
  orderNumberInput.dataset.autoNumber = "";
}, { capture: true });
orderDateInput?.addEventListener("change", () => {
  if (orderNumberInput?.dataset.autoNumber === "1") ensurePricingOrderNumber({ force: true });
  renderPricingOrder();
});
[
  orderNumberInput,
  orderDateInput,
  orderPhoneInput,
  orderLocationInput,
  orderNotesInput
].forEach((input) => {
  input?.addEventListener("input", renderPricingOrder);
  input?.addEventListener("change", renderPricingOrder);
});
orderCustomerInput?.addEventListener("input", (event) => {
  event.target.value = titleCaseNameInput(event.target.value);
  renderPricingOrder();
});
orderCustomerInput?.addEventListener("blur", (event) => {
  event.target.value = titleCaseName(event.target.value);
  renderPricingOrder();
});
orderItemsFormBody?.addEventListener("input", handlePricingOrderItemsInput);
orderItemsFormBody?.addEventListener("change", handlePricingOrderItemsInput);
orderItemsFormBody?.addEventListener("click", handlePricingOrderItemsClick);
addOrderItemBtn?.addEventListener("click", () => {
  addPricingOrderItemRow();
  renderPricingOrder();
});
orderCopyOfferBtn?.addEventListener("click", copyPricingOfferToOrder);
newPricingOrderBtn?.addEventListener("click", resetPricingOrderForm);
savePricingOrderBtn?.addEventListener("click", savePricingOrderAndRepairNotebook);
printPricingOrderBtn?.addEventListener("click", printPricingOrder);
complaintNumberInput?.addEventListener("input", () => {
  complaintNumberInput.dataset.autoNumber = "";
}, { capture: true });
complaintDateInput?.addEventListener("change", () => {
  if (complaintNumberInput?.dataset.autoNumber === "1") ensurePricingComplaintNumber({ force: true });
  renderPricingComplaint();
});
[
  complaintNumberInput,
  complaintDateInput,
  complaintPhoneInput,
  complaintLocationInput,
  complaintProductTypeInput,
  complaintProductNameInput,
  complaintSerialInput,
  complaintPurchaseDocumentInput,
  complaintPurchaseDateInput,
  complaintProductTypeInput2,
  complaintProductNameInput2,
  complaintSerialInput2,
  complaintPurchaseDocumentInput2,
  complaintPurchaseDateInput2,
  complaintDefectInput,
  complaintNotesInput
].forEach((input) => {
  input?.addEventListener("input", renderPricingComplaint);
  input?.addEventListener("change", renderPricingComplaint);
});
complaintCustomerInput?.addEventListener("input", (event) => {
  event.target.value = titleCaseNameInput(event.target.value);
  updateComplaintCustomerDevicePicker([]);
  renderPricingComplaint();
});
complaintCustomerInput?.addEventListener("change", (event) => {
  event.target.value = titleCaseName(event.target.value);
  syncPricingComplaintFromCustomer();
});
complaintCustomerInput?.addEventListener("blur", (event) => {
  event.target.value = titleCaseName(event.target.value);
  syncPricingComplaintFromCustomer();
});
[
  complaintLocationInput,
  complaintProductTypeInput,
  complaintProductNameInput,
  complaintSerialInput,
  complaintPurchaseDocumentInput,
  complaintPurchaseDateInput,
  complaintProductTypeInput2,
  complaintProductNameInput2,
  complaintSerialInput2,
  complaintPurchaseDocumentInput2,
  complaintPurchaseDateInput2
].forEach((input) => {
  input?.addEventListener("input", () => {
    input.dataset.complaintAutofilled = "";
  }, { capture: true });
  input?.addEventListener("change", () => {
    input.dataset.complaintAutofilled = "";
  }, { capture: true });
});
complaintRequestInput?.addEventListener("input", () => {
  complaintRequestInput.dataset.userChanged = "1";
  renderPricingComplaint();
});
complaintRequestInput?.addEventListener("change", () => {
  complaintRequestInput.dataset.userChanged = "1";
  renderPricingComplaint();
});
complaintCustomerDeviceSelect?.addEventListener("change", updateComplaintCustomerDevicePickerActions);
complaintUseDeviceItem1Btn?.addEventListener("click", () => useComplaintCustomerDevice(1));
complaintUseDeviceItem2Btn?.addEventListener("click", () => useComplaintCustomerDevice(2));
[1, 2].forEach((slot) => {
  const inputs = complaintItemInputs(slot);
  inputs.productType?.addEventListener("change", () => {
    syncComplaintProductNameForType(slot);
    renderPricingComplaint();
  });
  inputs.serial?.addEventListener("input", (event) => {
    event.target.value = event.target.value.toLocaleUpperCase("pl-PL");
    renderPricingComplaint();
  });
  inputs.serial?.addEventListener("change", () => syncComplaintItemFromSerial(slot));
  inputs.serial?.addEventListener("blur", () => syncComplaintItemFromSerial(slot));
  inputs.purchaseDocument?.addEventListener("input", (event) => {
    event.target.value = event.target.value.toLocaleUpperCase("pl-PL");
    renderPricingComplaint();
  });
});
newPricingComplaintBtn?.addEventListener("click", resetPricingComplaintForm);
removeComplaintItemBtn1?.addEventListener("click", () => removePricingComplaintItem(1));
removeComplaintItemBtn2?.addEventListener("click", () => removePricingComplaintItem(2));
savePricingComplaintBtn?.addEventListener("click", savePricingComplaintAndRepairNotebook);
printPricingComplaintBtn?.addEventListener("click", printPricingComplaint);
printDemoChecklistBtn.addEventListener("click", printDemoChecklist);
showMoreDemoBtn.addEventListener("click", () => showMoreTableRows("demo", renderDemoRecords));
showMoreDataControlBtn.addEventListener("click", () => showMoreTableRows("dataControl", renderDataControlView));
resetDeviceFiltersBtn?.addEventListener("click", resetDeviceFilters);
resetDemoFiltersBtn?.addEventListener("click", resetDemoFilters);
resetRepairFiltersBtn?.addEventListener("click", resetRepairFilters);
resetDataControlFiltersBtn?.addEventListener("click", resetDataControlFilters);
dataControlSearchInput.addEventListener("input", debounce(() => {
  resetTableRenderLimit("dataControl");
  renderDataControlView();
}, SEARCH_DEBOUNCE_MS));
document.querySelector("#closeDialogBtn").addEventListener("click", closeDialog);
document.querySelector("#cancelBtn").addEventListener("click", closeDialog);
document.querySelector("#closeRepairDialogBtn").addEventListener("click", closeRepairDialog);
document.querySelector("#cancelRepairBtn").addEventListener("click", closeRepairDialog);
document.querySelector("#closeDemoDialogBtn").addEventListener("click", closeDemoDialog);
document.querySelector("#cancelDemoBtn").addEventListener("click", closeDemoDialog);
closePricingHistoryPreviewBtn?.addEventListener("click", () => pricingHistoryPreviewDialog?.close());
[recordDialog, repairDialog, demoDialog].forEach((dialog) => dialog.addEventListener("close", closeDatePicker));
deleteBtn.addEventListener("click", deleteCurrentRecord);
duplicateRecordBtn.addEventListener("click", duplicateCurrentDeviceRecord);
moveToDemoBtn.addEventListener("click", moveCurrentDeviceRecordToDemo);
deleteRepairBtn.addEventListener("click", deleteCurrentRepairRecord);
deleteDemoBtn.addEventListener("click", deleteCurrentDemoRecord);
duplicateDemoBtn.addEventListener("click", duplicateCurrentDemoRecord);
moveToDevicesBtn.addEventListener("click", moveCurrentDemoRecordToDevices);
recordForm.addEventListener("submit", saveFormRecord);
repairForm.addEventListener("submit", saveRepairFormRecord);
demoForm.addEventListener("submit", saveDemoFormRecord);
recordForm.addEventListener("click", handleClearDateClick);
repairForm.addEventListener("click", handleClearDateClick);
demoForm.addEventListener("click", handleClearDateClick);
registerQualityHintListeners("devices", ["#deviceName", "#serialNumber", "#customerName"]);
registerQualityHintListeners("repairs", ["#repairCustomerName", "#repairDeviceName", "#repairSerialNumber", "#repairSerialNumber2"]);
registerQualityHintListeners("demo", ["#demoDeviceName", "#demoSerialNumber", "#demoCurrentUser"]);
document.querySelector("#customerName").addEventListener("input", syncDeviceTypeFromFields);
document.querySelector("#salesInvoice").addEventListener("input", syncSalesInvoiceUppercase);
document.querySelector("#deviceName").addEventListener("blur", correctDeviceNameInput);
document.querySelector("#serialNumber").addEventListener("input", syncUppercaseTextInput);
document.querySelector("#returnDate").addEventListener("change", syncDeviceTypeFromFields);
typeSelect.addEventListener("change", syncStockLocationFromType);
pasteInputButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    void pasteClipboardToInput(button.dataset.pasteTarget, button.dataset.pasteFormat || "");
  });
});
searchInput.addEventListener("input", debounce(resetAndRenderDeviceViews, SEARCH_DEBOUNCE_MS));
typeFilter.addEventListener("change", resetAndRenderDeviceViews);
ezwmFilter.addEventListener("change", resetAndRenderDeviceViews);
fifoFilter.addEventListener("change", resetAndRenderDeviceViews);
locationFilter.addEventListener("change", resetAndRenderDeviceViews);
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
document.querySelector("#repairCategory").addEventListener("change", syncRepairCategoryInput);
document.querySelector("#repairCustomerName").addEventListener("input", syncRepairCustomerNameInput);
document.querySelector("#repairCustomerName").addEventListener("blur", finalizeRepairCustomerNameInput);
document.querySelector("#repairLocation").addEventListener("change", markRepairLocationManualChange);
document.querySelector("#repairSerialNumber").addEventListener("input", syncRepairSerialInput);
document.querySelector("#repairSerialNumber2").addEventListener("input", syncRepairSerialInput);
document.querySelector("#demoReceivedDate").addEventListener("change", syncDemoManufacturerReturnDate);
document.querySelector("#demoManufacturerReturnDate").addEventListener("change", markDemoManufacturerReturnDateChange);
document.querySelector("#demoManufacturerReturned").addEventListener("change", (event) => syncDemoManufacturerReturned(event.target.checked));
document.querySelector("#demoManufacturerReturnedDate").addEventListener("change", markDemoManufacturerReturnedDateChange);
document.querySelector("#demoReturnDate").addEventListener("change", markDemoReturnDateChange);
document.querySelector("#demoManufacturer").addEventListener("input", syncDemoUppercaseInput);
document.querySelector("#demoDeviceName").addEventListener("input", syncDemoManufacturerReturnDate);
document.querySelector("#demoSerialNumber").addEventListener("input", syncDemoUppercaseInput);
document.querySelector("#demoCurrentUser").addEventListener("input", formatDemoCurrentUserInput);
document.querySelector("#demoCurrentUser").addEventListener("blur", finalizeDemoCurrentUserInput);
document.querySelector("#demoStatus").addEventListener("change", syncDemoReturnedStatus);
DEMO_DATE_VALIDATION_FIELDS.forEach(({ selector }) => {
  const input = document.querySelector(selector);
  input?.addEventListener("change", () => validateDemoDateOrder());
  input?.addEventListener("blur", () => validateDemoDateOrder());
});
document.querySelector("#demoManufacturerReturned").addEventListener("change", () => validateDemoDateOrder());
document.querySelector("#demoStatus").addEventListener("change", () => validateDemoDateOrder());
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

setupDatePickers();
fillStockAuditForm();
updateScrollTopButton();

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
  pricingRecords = loadPricingRecords();
  auditLogs = loadLocalAuditLogs();
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
  privatePayments = loadLocalPrivatePayments();
  updatePrivatePaymentVisibility();
  [records, repairRecords, demoRecords] = await Promise.all([loadRecords(), loadRepairRecords(), loadDemoRecords()]);
  rebuildDerivedData();
  render();

  if (hasSharedServer) {
    window.setInterval(refreshRecordsFromServer, SERVER_REFRESH_MS);
  }
}

init();
