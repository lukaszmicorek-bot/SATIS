(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.SatisTinnitusForms = api;
})(typeof window === "undefined" ? null : window, function () {
  "use strict";
  const definitions = {
    thi: {
      title: "Kwestionariusz Uciążliwości Szumu Usznego (THI)", max: 100,
      instruction: "Celem tych pytań jest identyfikacja problemów, jakie może powodować Twój szum uszny. Aby wypełnić kwestionariusz, zaznacz odpowiednią wartość przy każdym pytaniu. Odpowiedz na wszystkie pytania.",
      answers: [{ label: "Tak", value: 4 }, { label: "Nie", value: 0 }, { label: "Czasem", value: 2 }],
      questions: [
        ["F1", "Czy z powodu szumu usznego masz trudności z koncentracją?"],
        ["F2", "Czy głośność szumu usznego utrudnia Ci słyszenie innych osób?"],
        ["E3", "Czy Twój szum uszny sprawia, że odczuwasz złość?"],
        ["F4", "Czy szum uszny wywołuje uczucie dezorientacji?"],
        ["C5", "Czy z powodu szumu usznego pojawia się poczucie desperacji?"],
        ["E6", "Czy często skarżysz się na swój szum uszny?"],
        ["F7", "Czy z powodu szumu usznego masz trudności z zasypianiem w nocy?"],
        ["C8", "Czy masz wrażenie, że nie możesz uciec od swojego szumu usznego?"],
        ["F9", "Czy Twój szum uszny przeszkadza Ci w cieszeniu się aktywnościami towarzyskimi (np. wyjściem do restauracji, kina)?"],
        ["E10", "Czy z powodu szumu usznego czujesz frustrację?"],
        ["C11", "Czy z powodu szumu usznego masz poczucie, że cierpisz na poważną chorobę?"],
        ["F12", "Czy Twój szum uszny utrudnia Ci czerpanie radości z życia?"],
        ["F13", "Czy Twój szum uszny przeszkadza Ci w pracy lub obowiązkach domowych?"],
        ["F14", "Czy z powodu szumu usznego często jesteś rozdrażniony?"],
        ["F15", "Czy z powodu szumu usznego masz trudności z czytaniem?"],
        ["E16", "Czy szum uszny powoduje przygnębienie?"],
        ["E17", "Czy masz poczucie, że szum uszny powoduje napięcia w Twoich relacjach rodzinnych i towarzyskich?"],
        ["F18", "Czy trudno Ci skupić uwagę na czymś innym niż Twój szum uszny?"],
        ["C19", "Czy masz poczucie, że nie masz kontroli nad swoim szumem usznym?"],
        ["F20", "Czy z powodu szumu usznego często czujesz zmęczenie?"],
        ["E21", "Czy z powodu szumu usznego odczuwasz depresję?"],
        ["E22", "Czy szum uszny wywołuje uczucie niepokoju?"],
        ["C23", "Czy pojawia się poczucie braku możliwości radzenia sobie z szumem usznym?"],
        ["F24", "Czy Twój szum uszny nasila się w sytuacjach stresowych?"],
        ["E25", "Czy Twój szum uszny powoduje uczucie niepewności?"]
      ],
      source: "THI · Klasyfikacja nasilenia: McCombe i wsp., 2001.",
      grades: [
        { max: 16, label: "Stopień 1 · Nieznaczny", range: "0–16", description: "Szum uszny słyszalny tylko w cichym otoczeniu." },
        { max: 36, label: "Stopień 2 · Łagodny", range: "18–36", description: "Łatwo maskowany przez dźwięki otoczenia, zwykle zapomniany podczas codziennych aktywności." },
        { max: 56, label: "Stopień 3 · Umiarkowany", range: "38–56", description: "Słyszalny w obecności hałasu w tle, jednak codzienne obowiązki mogą być nadal wykonywane." },
        { max: 76, label: "Stopień 4 · Ciężki", range: "58–76", description: "Słyszalny prawie zawsze, zakłóca sen i może utrudniać codzienne aktywności." },
        { max: 100, label: "Stopień 5 · Krytyczny", range: "78–100", description: "Zawsze słyszalny, powoduje znaczne zakłócenia snu i trudności w wykonywaniu jakichkolwiek działań." }
      ]
    },
    trq: {
      title: "Kwestionariusz Reakcji na Szum Uszny (TRQ)", max: 104,
      instruction: "Ten kwestionariusz ma na celu określenie, jaki wpływ szum uszny ma na Twoje codzienne życie, samopoczucie i ogólne funkcjonowanie. Niektóre z poniższych stwierdzeń mogą Cię dotyczyć, inne nie. Prosimy o udzielenie odpowiedzi na wszystkie pytania, zaznaczając liczbę, która najlepiej odzwierciedla wpływ szumu usznego na Ciebie w ciągu ostatniego tygodnia.",
      answers: [{ label: "Wcale nie", value: 0 }, { label: "Przez krótki czas", value: 1 }, { label: "Czasami", value: 2 }, { label: "Przez znaczną część czasu", value: 3 }, { label: "Prawie przez cały czas", value: 4 }],
      questions: [
        "sprawia, że czuję się nieszczęśliwy(-a).", "powoduje, że odczuwam napięcie.",
        "sprawia, że jestem rozdrażniony(-a).", "powoduje u mnie uczucie złości.",
        "doprowadził mnie do płaczu.", "sprawia, że unikam cichych miejsc.",
        "sprawia, że mam mniejszą ochotę wychodzić z domu.", "sprawia, że czuję się przygnębiony(-a).",
        "mnie irytuje.", "powoduje, że czuję się zdezorientowany(-a).", "doprowadza mnie do szaleństwa.",
        "ogranicza moją radość z życia.", "utrudnia mi koncentrację.", "utrudnia mi relaks.",
        "sprawia, że czuję się zaniepokojony(-a).", "sprawia, że czuję się bezradny(-a).",
        "powoduje, że czuję się sfrustrowany(-a).", "przeszkadza mi w pracy.", "sprawia, że odczuwam rozpacz.",
        "sprawia, że unikam głośnych miejsc.", "sprawia, że unikam sytuacji towarzyskich.",
        "sprawia, że tracę nadzieję na przyszłość.", "zakłóca mój sen.", "sprawia, że mam myśli samobójcze.",
        "wywołuje u mnie napady paniki.", "sprawia, że czuję się dręczony(-a)."
      ].map((text, index) => [String(index + 1), `… ${text}`]),
      source: "TRQ · Wilson i wsp., 1991. Ocena dotyczy ostatniego tygodnia."
    }
  };

  function score(kind, answers) {
    const definition = definitions[kind];
    if (!definition) throw new Error("Nieznany kwestionariusz.");
    const allowed = definition.answers.map(answer => answer.value);
    const values = definition.questions.map((_, index) => {
      const value = answers[index];
      if (value === "" || value == null || !["number", "string"].includes(typeof value)) return null;
      if (typeof value === "string" && !/^[0-4]$/u.test(value)) return null;
      return allowed.includes(Number(value)) ? Number(value) : null;
    });
    const answered = values.filter(value => value !== null).length;
    const total = values.reduce((sum, value) => sum + (value ?? 0), 0);
    const complete = answered === values.length;
    return { total, answered, count: values.length, max: definition.max, complete,
      grade: kind === "thi" && complete ? definition.grades.find(grade => total <= grade.max) : null,
      review: kind === "trq" && values[23] !== null && values[23] > 0 };
  }

  function create(api) {
    const document = api.document;
    const states = new Map();
    let printing = false, activePrintCleanup = null;
    function node(tag, className, text) {
      const result = document.createElement(tag);
      if (className) result.className = className;
      if (text !== undefined) result.textContent = text;
      return result;
    }
    function answers(state) {
      return state.rows.map(row => row.querySelector("input:checked")?.value ?? null);
    }
    function render(kind) {
      const state = states.get(kind);
      if (!state) return;
      const result = score(kind, answers(state));
      state.nameOut.textContent = api.name(state.customer.value) || "................................";
      state.dateOut.textContent = api.iso(state.date.value) ? api.formatDate(api.iso(state.date.value)) : "................";
      state.total.textContent = `${result.complete ? "Wynik" : "Wynik częściowy"}: ${result.total} / ${result.max}`;
      state.progress.textContent = `${result.answered} / ${result.count} odpowiedzi`;
      state.interpretation.textContent = result.grade ? `${result.grade.label} (${result.grade.range} pkt). ${result.grade.description}`
        : result.complete ? "" : "Uzupełnij wszystkie odpowiedzi, aby otrzymać pełny wynik.";
      state.interpretation.hidden = !state.interpretation.textContent;
      state.gradeRows.forEach(({row, grade, marker}) => {
        const current = result.grade === grade;
        row.classList.toggle("tinnitus-grade-current", current);
        marker.hidden = !current;
        if (current) row.setAttribute("aria-current", "true");
        else row.removeAttribute("aria-current");
      });
      state.review.hidden = !result.review;
      state.rows.forEach(row => row.querySelectorAll(".tinnitus-answer").forEach(label => {
        label.querySelector(".tinnitus-print-mark").textContent = label.querySelector("input").checked ? "X" : "";
      }));
      if (state.validationRequested) validate(kind, false);
    }
    function validate(kind, report = true) {
      const state = states.get(kind);
      if (!state) return false;
      if (report) state.validationRequested = true;
      const missing = [];
      state.customer.setCustomValidity(api.fullName(state.customer.value) ? "" : "Wpisz imię i nazwisko.");
      state.date.setCustomValidity(api.iso(state.date.value) ? "" : "Wybierz prawidłową datę badania.");
      for (const input of [state.customer, state.date]) {
        const invalid = !input.checkValidity();
        input.setAttribute("aria-invalid", String(invalid));
        if (invalid) missing.push(input);
      }
      state.rows.forEach(row => {
        const selected = Boolean(row.querySelector("input:checked"));
        row.classList.toggle("tinnitus-missing", !selected);
        row.querySelectorAll("input").forEach(input => {
          input.setCustomValidity(selected ? "" : "Wybierz jedną odpowiedź w tym wierszu.");
          input.setAttribute("aria-invalid", String(!selected));
        });
        if (!selected) missing.push(row.querySelector("input"));
      });
      state.status.textContent = missing.length ? "Przed wydrukiem uzupełnij imię i nazwisko, datę badania oraz wszystkie odpowiedzi. Braki są oznaczone." : "";
      if (report && missing.length) {
        missing[0].scrollIntoView({block: "center", behavior: "smooth"});
        missing[0].focus({preventScroll: true});
        missing[0].reportValidity();
      }
      return missing.length === 0;
    }
    function reset(kind) {
      const state = states.get(kind);
      if (!state) return;
      api.clearUndo();
      state.validationRequested = false;
      state.dirty = false;
      state.customer.value = "";
      state.date.value = api.today();
      state.editor.querySelectorAll("input").forEach(input => {
        if (input.type === "radio") input.checked = false;
        input.setCustomValidity(""); input.removeAttribute("aria-invalid");
      });
      state.rows.forEach(row => row.classList.remove("tinnitus-missing"));
      state.status.textContent = "";
      render(kind);
    }
    async function print(kind) {
      if (printing || activePrintCleanup) return false;
      if (!validate(kind)) return false;
      printing = true;
      try {
        render(kind);
        if (api.offlineActive()) return await api.offlinePrint(kind);
        const output = node("section"); output.id = "tinnitusPrint";
        const copy = states.get(kind).paper.cloneNode(true);
        copy.removeAttribute("id");
        copy.querySelectorAll("[id]").forEach(element => element.removeAttribute("id"));
        output.append(copy); document.body.append(output); document.body.classList.add("tinnitus-print");
        const cleanup = () => {
          output.remove(); document.body.classList.remove("tinnitus-print");
          api.window.removeEventListener("afterprint", cleanup);
          activePrintCleanup = null;
        };
        activePrintCleanup = cleanup;
        api.window.addEventListener("afterprint", cleanup, {once: true});
        return await api.print(cleanup);
      } catch (error) {
        activePrintCleanup?.();
        throw error;
      } finally {printing = false;}
    }
    for (const [kind, definition] of Object.entries(definitions)) {
      const view = api.views[kind];
      if (!view) continue;
      const editor = node("section", "offer-builder unified-document-editor tinnitus-editor");
      const metadata = node("div", "tinnitus-fields");
      const customer = node("input", "satis-private-search"); customer.id = `${kind}CustomerInput`; customer.required = true;customer.type = "search";
      customer.autocomplete = "off"; customer.setAttribute("list", "customerNameSuggestions");
      const nameLabel = node("label", "person-name-field");nameLabel.append(node("span", "", "Imię i nazwisko *"), customer);
      const date = node("input");date.id = `${kind}DateInput`;date.type = "text";date.required = true;
      date.autocomplete = "off";date.placeholder = "DD.MM.RRRR";date.setAttribute("data-date-picker", "");
      const dateLabel = node("label");dateLabel.append(node("span", "", "Data badania *"), date);
      metadata.append(nameLabel, dateLabel);
      const actions = node("div", "offer-actions");
      const newButton = node("button", "reset-filters-btn document-new-btn", "Nowy formularz");newButton.type = "button";
      const printButton = node("button", "tinnitus-print-button", "Drukuj / PDF");printButton.type = "button";
      printButton.id = `print${kind.toUpperCase()}Btn`;
      actions.append(newButton, printButton);
      const status = node("p", "tinnitus-status");status.setAttribute("role", "status");status.setAttribute("aria-live", "polite");
      const paper = node("article", `tinnitus-document tinnitus-${kind}`);paper.id = `${kind}Print`;
      const header = node("header", "rodo-print-head");
      const heading = node("div");heading.append(node("span", "rodo-print-kicker", "SATIS · Pracownia Słuchu"), node("h2", "", definition.title));
      const logo = node("img");logo.src = "satis-monogram.png";logo.alt = "SATIS";header.append(heading, logo);
      const nameOut = node("strong"), dateOut = node("strong"), patient = node("p", "tinnitus-patient");
      patient.append(node("span", "", "Imię i nazwisko: "), nameOut, node("span", "", "Data badania: "), dateOut);
      const table = node("table", "tinnitus-table"), thead = node("thead"), head = node("tr");
      const numberHead = node("th", "tinnitus-number", "Nr");numberHead.scope = "col";
      const questionHead = node("th", "tinnitus-question", kind === "trq" ? "Mój szum uszny…" : "Pytanie");questionHead.scope = "col";
      head.append(numberHead, questionHead);
      definition.answers.forEach(answer => {
        const th = node("th", "tinnitus-choice-head");th.scope = "col";
        th.append(node("span", "", answer.label), node("b", "", String(answer.value)));head.append(th);
      });
      thead.append(head);const tbody = node("tbody"), rows = [];
      definition.questions.forEach(([code, question], index) => {
        const row = node("tr"), prompt = node("th", "tinnitus-question", question);prompt.scope = "row";
        row.append(node("td", "tinnitus-number", code), prompt);
        definition.answers.forEach(answer => {
          const cell = node("td"), label = node("label", "tinnitus-answer"), input = node("input");
          input.type = "radio";input.name = `${kind}Answer${index + 1}`;input.id = `${kind}Answer${index + 1}Value${answer.value}`;input.value = String(answer.value);
          input.setAttribute("aria-label", `${code}. ${question} ${answer.label} (${answer.value} pkt)`);
          label.append(input, node("span", "tinnitus-print-mark"));cell.append(label);row.append(cell);
        });
        rows.push(row);tbody.append(row);
      });
      table.append(thead, tbody);const scroll = node("div", "tinnitus-table-scroll");scroll.append(table);
      const total = node("strong"), progress = node("span", "tinnitus-progress"), summary = node("div", "tinnitus-summary");
      summary.setAttribute("role", "status");summary.setAttribute("aria-live", "polite");summary.append(total, progress);
      const interpretation = node("p", "tinnitus-interpretation");
      const gradeRows = [], gradeSection = node("section", "tinnitus-grade-section");
      if (definition.grades) {
        const gradeTable = node("table", "tinnitus-grade-table"), gradeHead = node("thead"), gradeHeader = node("tr");
        gradeTable.append(node("caption", "", "Interpretacja wyniku THI"));
        ["Wynik (pkt)", "Stopień", "Opis"].forEach(text => {
          const cell = node("th", "", text);cell.scope = "col";gradeHeader.append(cell);
        });
        gradeHead.append(gradeHeader);const gradeBody = node("tbody");
        definition.grades.forEach((grade, index) => {
          const row = node("tr", `tinnitus-grade-row tinnitus-grade-${index + 1}`), label = node("td", "", grade.label);
          const marker = node("span", "tinnitus-grade-marker", "Twój wynik");marker.hidden = true;label.append(marker);
          row.append(node("td", "", grade.range), label, node("td", "", grade.description));
          gradeBody.append(row);gradeRows.push({row, grade, marker});
        });
        gradeTable.append(gradeHead, gradeBody);gradeSection.append(gradeTable);
      } else {
        gradeSection.hidden = true;
      }
      const review = node("p", "tinnitus-review", "Odpowiedź w pytaniu 24 wymaga bezpośredniego omówienia z pacjentem.");review.hidden = true;
      paper.append(header, patient, node("p", "tinnitus-instruction", definition.instruction), scroll, summary, interpretation, gradeSection,
        node("p", "tinnitus-source", definition.source));
      editor.append(metadata, actions, status, review, paper,
        node("p", "document-form-note tinnitus-privacy", "Dane i wyniki tego formularza nie są zapisywane ani synchronizowane. Po wydrukowaniu przechowuj dokument bezpiecznie."));
      view.append(editor);
      states.set(kind, {view, editor, paper, customer, date, rows, gradeRows, nameOut, dateOut, total, progress, interpretation, review, status, actions, newButton, dirty: false});
      editor.addEventListener("input", () => {states.get(kind).dirty = true;render(kind);});
      editor.addEventListener("change", () => {states.get(kind).dirty = true;render(kind);});
      customer.addEventListener("blur", () => {customer.value = api.name(customer.value);render(kind);});
      printButton.addEventListener("click", () => void print(kind).catch(() => {status.textContent = "Nie udało się przygotować wydruku. Spróbuj ponownie.";}));
      newButton.addEventListener("click", () => {
        if (states.get(kind).dirty && !api.confirm("Wyczyścić dane i odpowiedzi tego kwestionariusza?")) return;
        reset(kind);customer.focus();
      });
      reset(kind);
    }
    return { render, validate, reset, print, clear() {activePrintCleanup?.();for (const kind of states.keys()) reset(kind);},
      printSource(kind) {return states.get(kind)?.paper;},
      alignToolbars() {for (const state of states.values()) {
        const tools = state.editor.querySelector(".form-undo-tools");
        if (tools) {tools.prepend(state.newButton);tools.append(state.actions);}
      }} };
  }
  return {definitions, score, create};
});
