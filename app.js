// File: app.js

document.addEventListener("DOMContentLoaded", function () {
  caricaPreventiviSalvati();
  aggiornaTotaleGenerale();
});

// ------------------------------
// FUNZIONI DI FORMATTAZIONE / PARSING
// ------------------------------

/**
 * parseNumberITA(str)
 * - Rimuove caratteri superflui (spazi, €, ecc.).
 * - Elimina i punti (.) che presumiamo come separatori migliaia.
 * - Trasforma la virgola (,) in punto (.) come separatore decimale.
 * - Con parseFloat otteniamo un numero. Se non valido -> 0.
 */
function parseNumberITA(str) {
  if (!str) return 0;
  // Elimina tutto ciò che non è cifra, punto, virgola o segno meno
  let pulito = str.replace(/[^\d.,-]/g, '');
  // Rimuove i punti di troppo (usati come separatori migliaia)
  // Esempio: "3.000,50" -> "3000,50"
  pulito = pulito.replace(/\./g, '');
  // Poi sostituisce la virgola con il punto decimale
  pulito = pulito.replace(',', '.');
  let valore = parseFloat(pulito);
  if (isNaN(valore)) valore = 0;
  return valore;
}

/**
 * formatNumberITA(num, withCurrency)
 * - Usa localizzazione italiana: separatore migliaia "." e decimali ",".
 * - 2 decimali di default.
 * - Se withCurrency = true -> aggiunge "€" in fondo.
 */
function formatNumberITA(num, withCurrency = false) {
  // Ci assicuriamo che sia un numero
  const numero = isNaN(num) ? 0 : num;
  // Formattiamo con lo standard it-IT (2 decimali)
  let opzioni = {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  };
  // Esempio "3.000,50"
  let formattato = new Intl.NumberFormat('it-IT', opzioni).format(numero);
  if (withCurrency) {
    formattato += '€';
  }
  return formattato;
}

// ------------------------------
// FUNZIONI DI GESTIONE DEI PREVENTIVI
// ------------------------------

function caricaPreventiviSalvati() {
  aggiornaListaPreventivi();
}

function getPreventivoData() {
  const datiCliente = {
    nomeAzienda: document.getElementById("nomeAzienda").value,
    citta: document.getElementById("citta").value,
    indirizzo: document.getElementById("indirizzo").value,
    telefono: document.getElementById("telefono").value,
    email: document.getElementById("email").value,
  };

  const articoli = [];
  document.querySelectorAll(".articolo").forEach((articolo) => {
    const codice = articolo.querySelector(".codice")?.value || "";
    const descrizione = articolo.querySelector(".descrizione")?.value || "";
    const prezzoLordo = articolo.querySelector(".prezzoLordo")?.value || "";
    const sconto = articolo.querySelector(".sconto")?.value || ""; // percentuale
    const prezzoNetto = articolo.querySelector(".prezzoNetto")?.value || "";
    const quantita = articolo.querySelector(".quantita")?.value || "";
    const prezzoTotale = articolo.querySelector(".prezzoTotale")?.value || "";
    articoli.push({ codice, descrizione, prezzoLordo, sconto, prezzoNetto, quantita, prezzoTotale });
  });

  const checkboxes = {
    mostraCodici: document.getElementById("mostraCodici").checked,
    mostraPrezzi: document.getElementById("mostraPrezzi").checked,
    mostraMarginalita: document.getElementById("mostraMarginalita").checked,
    mostraTrasporto: document.getElementById("mostraTrasporto").checked,
  };

  return {
    datiCliente,
    articoli,
    margine: document.getElementById("margine").value, // percentuale, lasciamo invariato
    costoTrasporto: document.getElementById("costoTrasporto").value,
    costoInstallazione: document.getElementById("costoInstallazione").value,
    modalitaPagamento: document.getElementById("modalitaPagamento").value,
    checkboxes,
  };
}

function salvaPreventivo() {
  const nomePreventivo = prompt("Inserisci il nome del preventivo:");
  if (!nomePreventivo) return;
  const preventivoData = getPreventivoData();
  preventivoData.nome = nomePreventivo;
  let preventivi = JSON.parse(localStorage.getItem("preventivi")) || [];
  preventivi.push(preventivoData);
  localStorage.setItem("preventivi", JSON.stringify(preventivi));
  aggiornaListaPreventivi();
}

function popolaForm(data) {
  document.getElementById("nomeAzienda").value = data.datiCliente.nomeAzienda;
  document.getElementById("citta").value = data.datiCliente.citta;
  document.getElementById("indirizzo").value = data.datiCliente.indirizzo;
  document.getElementById("telefono").value = data.datiCliente.telefono;
  document.getElementById("email").value = data.datiCliente.email;

  const container = document.getElementById("articoli-container");
  container.innerHTML = "";
  data.articoli.forEach((article) => {
    aggiungiArticoloConDati(article);
  });

  document.getElementById("margine").value = data.margine; // lascio invariata la percentuale
  document.getElementById("costoTrasporto").value = data.costoTrasporto;
  document.getElementById("costoInstallazione").value = data.costoInstallazione;
  document.getElementById("modalitaPagamento").value = data.modalitaPagamento;

  document.getElementById("mostraCodici").checked = data.checkboxes.mostraCodici;
  document.getElementById("mostraPrezzi").checked = data.checkboxes.mostraPrezzi;
  document.getElementById("mostraMarginalita").checked = data.checkboxes.mostraMarginalita;
  document.getElementById("mostraTrasporto").checked = data.checkboxes.mostraTrasporto;

  aggiornaTotaleGenerale();
}

function richiamaPreventivo() {
  const select = document.getElementById("listaPreventivi");
  const index = select.value;
  if (index === "") return;
  let preventivi = JSON.parse(localStorage.getItem("preventivi")) || [];
  popolaForm(preventivi[index]);
}

function eliminaPreventiviSelezionati() {
  const select = document.getElementById("listaPreventivi");
  let preventivi = JSON.parse(localStorage.getItem("preventivi")) || [];
  const selezionati = Array.from(select.selectedOptions).map((option) => parseInt(option.value));
  preventivi = preventivi.filter((_, index) => !selezionati.includes(index));
  localStorage.setItem("preventivi", JSON.stringify(preventivi));
  aggiornaListaPreventivi();
}

function aggiornaListaPreventivi() {
  const select = document.getElementById("listaPreventivi");
  select.innerHTML = "";
  let preventivi = JSON.parse(localStorage.getItem("preventivi")) || [];
  preventivi.forEach((preventivo, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = preventivo.nome;
    select.appendChild(option);
  });
  select.disabled = preventivi.length === 0;
}

// ------------------------------
// FUNZIONI DI GESTIONE DEGLI ARTICOLI
// ------------------------------

function aggiungiArticolo() {
  const container = document.getElementById("articoli-container");
  const idUnico = Date.now();
  const div = document.createElement("div");
  div.classList.add("articolo");
  div.innerHTML = `
    <details id="articolo-${idUnico}" open>
      <summary>Nuovo Articolo</summary>
      <label>Codice: <input type="text" class="codice" oninput="aggiornaTitolo(this, ${idUnico})"></label>
      <label>Descrizione: <input type="text" class="descrizione"></label>
      <!-- Prezzo Lordo -->
      <label>Prezzo Lordo (€):
        <input type="text" class="prezzoLordo" oninput="calcolaPrezzo(this)">
      </label>
      <!-- Sconto in %: lo lasciamo invariato -->
      <label>Sconto (%):
        <input type="number" class="sconto" step="0.01" oninput="calcolaPrezzo(this)">
      </label>
      <!-- Prezzo Netto -->
      <label>Prezzo Netto (€):
        <input type="text" class="prezzoNetto" oninput="calcolaPrezzo(this)">
      </label>
      <!-- Quantità -->
      <label>Quantità:
        <input type="text" class="quantita" value="1" oninput="calcolaPrezzo(this)">
      </label>
      <label>Prezzo Totale (€):
        <input type="text" class="prezzoTotale" readonly>
      </label>
      <button onclick="salvaArticolo(${idUnico})">Salva</button>
      <button onclick="rimuoviArticolo(this)">Rimuovi</button>
    </details>
  `;
  container.appendChild(div);
}

function aggiungiArticoloConDati(dati) {
  const container = document.getElementById("articoli-container");
  const idUnico = Date.now() + Math.floor(Math.random() * 1000);
  const div = document.createElement("div");
  div.classList.add("articolo");
  div.innerHTML = `
    <details id="articolo-${idUnico}" open>
      <summary>${dati.codice || "Nuovo Articolo"}</summary>
      <label>Codice:
        <input type="text" class="codice" value="${dati.codice || ""}" oninput="aggiornaTitolo(this, ${idUnico})">
      </label>
      <label>Descrizione:
        <input type="text" class="descrizione" value="${dati.descrizione || ""}">
      </label>
      <label>Prezzo Lordo (€):
        <input type="text" class="prezzoLordo" value="${dati.prezzoLordo || ""}" oninput="calcolaPrezzo(this)">
      </label>
      <label>Sconto (%):
        <input type="number" class="sconto" step="0.01" value="${dati.sconto || ""}" oninput="calcolaPrezzo(this)">
      </label>
      <label>Prezzo Netto (€):
        <input type="text" class="prezzoNetto" value="${dati.prezzoNetto || ""}" oninput="calcolaPrezzo(this)">
      </label>
      <label>Quantità:
        <input type="text" class="quantita" value="${dati.quantita || 1}" oninput="calcolaPrezzo(this)">
      </label>
      <label>Prezzo Totale (€):
        <input type="text" class="prezzoTotale" value="${dati.prezzoTotale || ""}" readonly>
      </label>
      <button onclick="salvaArticolo(${idUnico})">Salva</button>
      <button onclick="rimuoviArticolo(this)">Rimuovi</button>
    </details>
  `;
  container.appendChild(div);
}

function aggiornaTitolo(input, id) {
  const summary = document.querySelector(`#articolo-${id} summary`);
  summary.textContent = input.value || "Nuovo Articolo";
}

function salvaArticolo(id) {
  document.getElementById(`articolo-${id}`).open = false;
}

function rimuoviArticolo(btn) {
  btn.parentElement.parentElement.remove();
  aggiornaTotaleGenerale();
}

// ------------------------------
// CALCOLO PREZZO ARTICOLO
// ------------------------------

function calcolaPrezzo(input) {
  const row = input.closest(".articolo");

  // 1) Leggiamo i campi di testo interpretandoli come numeri
  let prezzoLordo = parseNumberITA(row.querySelector(".prezzoLordo").value);
  let sconto = parseFloat(row.querySelector(".sconto").value) || 0; // in %
  let quantita = parseNumberITA(row.querySelector(".quantita").value);

  // 2) Calcoliamo prezzo netto
  const prezzoNettoEl = row.querySelector(".prezzoNetto");
  let prezzoNetto = parseNumberITA(prezzoNettoEl.value);

  // Se l'input modificato è il Prezzo Lordo o lo sconto, ricalcoliamo il Netto
  if (input.classList.contains("prezzoLordo") || input.classList.contains("sconto")) {
    prezzoNetto = prezzoLordo * (1 - sconto / 100);
    // Aggiorniamo il campo con il formato "it-IT"
    prezzoNettoEl.value = formatNumberITA(prezzoNetto);
  }

  // 3) Prezzo Totale = prezzoNetto * quantita
  let prezzoTotale = prezzoNetto * quantita;
  row.querySelector(".prezzoTotale").value = formatNumberITA(prezzoTotale);

  // 4) Ri-formattiamo i campi Lordo, Netto e Quantità
  //    (se vuoi farlo *solo* onblur, basta spostarli su onblur e togliere qui)
  row.querySelector(".prezzoLordo").value = formatNumberITA(prezzoLordo);
  row.querySelector(".quantita").value = formatNumberITA(quantita, false);
  // prezzoNetto già aggiornato sopra

  aggiornaTotaleGenerale();
}

// ------------------------------
// CALCOLO TOTALI
// ------------------------------

function aggiornaTotaleGenerale() {
  // Somma di tutti i "prezzoTotale"
  let totaleGenerale = 0;
  document.querySelectorAll(".prezzoTotale").forEach((input) => {
    let val = parseNumberITA(input.value);
    totaleGenerale += val;
  });
  document.getElementById("totaleArticoli").textContent =
    "Totale Articoli: " + formatNumberITA(totaleGenerale) + "€";
  calcolaMarginalita();
}

function calcolaMarginalita() {
  const totaleArticoliText = document.getElementById("totaleArticoli").textContent;
  // esempio "Totale Articoli: 3.000,50€"
  // rimuoviamo tutto il testo e parse
  let match = totaleArticoliText.match(/([\d.,]+)/);
  let totaleArticoli = 0;
  if (match) {
    totaleArticoli = parseNumberITA(match[1]);
  }
  const margine = parseFloat(document.getElementById("margine").value) || 0; // %
  let nuovoTotale = totaleArticoli;
  if (margine > 0) {
    nuovoTotale = totaleArticoli / (1 - margine / 100);
  }
  document.getElementById("totaleMarginalita").textContent =
    "Nuovo Totale Articoli: " + formatNumberITA(nuovoTotale) + "€";
  calcolaTotaleFinale();
}

function calcolaTotaleFinale() {
  // Leggiamo trasporto e installazione
  const trasportoVal = document.getElementById("costoTrasporto").value;
  const installazioneVal = document.getElementById("costoInstallazione").value;

  const trasportoNum = parseNumberITA(trasportoVal);
  const installazioneNum = parseNumberITA(installazioneVal);

  // Leggiamo il "nuovoTotale" dalla riga "Nuovo Totale Articoli"
  const totaleMarginalitaText = document.getElementById("totaleMarginalita").textContent;
  let match = totaleMarginalitaText.match(/([\d.,]+)/);
  let nuovoTotale = 0;
  if (match) {
    nuovoTotale = parseNumberITA(match[1]);
  }

  const totaleFinale = nuovoTotale + trasportoNum + installazioneNum;
  document.getElementById("totaleFinale").textContent =
    "Totale Finale: " + formatNumberITA(totaleFinale) + "€";
}

// ------------------------------
// FUNZIONI DI GENERAZIONE CONTENUTO (PDF/WHATSAPP)
// ------------------------------

function generaContenuto() {
  let contenuto = "";

  // Data corrente (formattata come gg/mm/aaaa)
  let oggi = new Date();
  let giorno = String(oggi.getDate()).padStart(2, "0");
  let mese = String(oggi.getMonth() + 1).padStart(2, "0");
  let anno = oggi.getFullYear();
  let dataFormattata = `${giorno}/${mese}/${anno}`;
  contenuto += `Data: ${dataFormattata}\n\n`;

  // Dati Cliente
  contenuto += "Dati Cliente:\n";
  contenuto += `Nome Azienda: ${document.getElementById("nomeAzienda").value}\n`;
  contenuto += `Città: ${document.getElementById("citta").value}\n`;
  contenuto += `Indirizzo: ${document.getElementById("indirizzo").value}\n`;
  contenuto += `Cell/Tel.: ${document.getElementById("telefono").value}\n`;
  contenuto += `Email: ${document.getElementById("email").value}\n\n`;

  // Semplificata o dettagliata
  if (document.getElementById("mostraCodici").checked) {
    // Modalità semplificata
    contenuto += "Articoli:\n";
    const articoli = document.querySelectorAll(".articolo");
    articoli.forEach((articolo) => {
      const codice = articolo.querySelector(".codice")?.value || "";
      const descrizione = articolo.querySelector(".descrizione")?.value || "";
      const quantita = articolo.querySelector(".quantita")?.value || "";
      contenuto += `Codice: ${codice}\n`;
      contenuto += `  Descrizione: ${descrizione}\n`;
      contenuto += `  Quantità: ${quantita}\n\n`;
    });

    // Trasporto + Installazione, se flag attivo
    if (document.getElementById("mostraTrasporto").checked) {
      const trasportoVal = document.getElementById("costoTrasporto").value;
      const installazioneVal = document.getElementById("costoInstallazione").value;
      contenuto += `Trasporto: ${trasportoVal}\n`;
      contenuto += `Installazione: ${installazioneVal}\n`;
    }

    contenuto += document.getElementById("totaleFinale").textContent + "\n";
    contenuto += "Prezzi sono al netto di IVA del 22%.\n";
  } else {
    // Modalità dettagliata
    contenuto += "Articoli:\n";
    const articoli = document.querySelectorAll(".articolo");
    articoli.forEach((articolo) => {
      const codice = articolo.querySelector(".codice")?.value || "";
      const descrizione = articolo.querySelector(".descrizione")?.value || "";
      const prezzoLordo = articolo.querySelector(".prezzoLordo")?.value || "";
      const sconto = articolo.querySelector(".sconto")?.value || "";
      const prezzoNetto = articolo.querySelector(".prezzoNetto")?.value || "";
      const quantita = articolo.querySelector(".quantita")?.value || "";
      const prezzoTotale = articolo.querySelector(".prezzoTotale")?.value || "";
      contenuto += `Codice: ${codice}\n`;
      contenuto += `  Descrizione: ${descrizione}\n`;
      contenuto += `  Prezzo Lordo: ${prezzoLordo}\n`; // già in formattazione it-IT
      contenuto += `  Sconto: ${sconto}%\n`; // percentuale invariata
      if (document.getElementById("mostraPrezzi").checked) {
        contenuto += `  Prezzo Netto: ${prezzoNetto}\n`;
      }
      contenuto += `  Quantità: ${quantita}\n`;
      contenuto += `  Prezzo Totale: ${prezzoTotale}\n\n`;
    });

    // Flag
    const mostraPrezzi = document.getElementById("mostraPrezzi").checked;
    const mostraMarginalita = document.getElementById("mostraMarginalita").checked;
    const mostraTrasporto = document.getElementById("mostraTrasporto").checked;

    if (!mostraPrezzi && !mostraMarginalita && !mostraTrasporto) {
      // Nessun flag: mostriamo tutto
      contenuto += "Margine: " + (document.getElementById("margine").value || "0") + "%\n";
      contenuto += document.getElementById("totaleArticoli").textContent + "\n";
      contenuto += document.getElementById("totaleMarginalita").textContent + "\n";

      const trasportoVal = document.getElementById("costoTrasporto").value;
      const installazioneVal = document.getElementById("costoInstallazione").value;
      contenuto += `Trasporto: ${trasportoVal}\n`;
      contenuto += `Installazione: ${installazioneVal}\n`;

      contenuto += document.getElementById("totaleFinale").textContent + "\n";
    } else {
      // Almeno un flag
      contenuto += document.getElementById("totaleArticoli").textContent + "\n";
      if (mostraMarginalita) {
        contenuto += document.getElementById("totaleMarginalita").textContent + "\n";
      }
      if (mostraTrasporto) {
        const trasportoVal = document.getElementById("costoTrasporto").value;
        const installazioneVal = document.getElementById("costoInstallazione").value;
        contenuto += `Trasporto: ${trasportoVal}\n`;
        contenuto += `Installazione: ${installazioneVal}\n`;
      }
      contenuto += document.getElementById("totaleFinale").textContent + "\n";
    }

    contenuto += "\nModalità di Pagamento: " + document.getElementById("modalitaPagamento").value + "\n";
  }

  return contenuto;
}

function generaPDF() {
  const contenuto = generaContenuto();
  const blob = new Blob([contenuto], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "preventivo.txt";
  a.click();
  URL.revokeObjectURL(url);
}

function inviaWhatsApp() {
  const testo = generaContenuto();
  const encodedText = encodeURIComponent(testo);
  const whatsappUrl = `https://wa.me/?text=${encodedText}`;
  window.open(whatsappUrl, "_blank");
}
