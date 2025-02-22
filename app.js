// File: app.js

document.addEventListener("DOMContentLoaded", function () {
  caricaPreventiviSalvati();
  aggiornaTotaleGenerale();
});

// -----------------------------------------------------
// 1) FUNZIONI DI PARSING/FORMATTAZIONE ALL'ITALIANA
// -----------------------------------------------------

/** 
 * parseNumberITA(str)
 * Interpreta "4.000,50" come 4000.50
 * - Rimuove i punti (usati per migliaia)
 * - Converte la virgola in punto
 * - Esegue parseFloat
 */
function parseNumberITA(str) {
  if (!str) return 0;
  let pulito = str.replace(/[^\d.,-]/g, "");  // Elimina simboli non numerici
  pulito = pulito.replace(/\./g, "");          // Rimuove i punti
  pulito = pulito.replace(",", ".");           // Virgola -> Punto
  let val = parseFloat(pulito);
  return isNaN(val) ? 0 : val;
}

/**
 * formatNumberITA(num)
 * Restituisce un numero in stile it-IT, es. 4000.5 => "4.000,50"
 */
function formatNumberITA(num) {
  if (isNaN(num)) num = 0;
  return new Intl.NumberFormat("it-IT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
}

// -----------------------------------------------------
// 2) GESTIONE PREVENTIVI
// -----------------------------------------------------

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
  document.querySelectorAll(".articolo").forEach(articolo => {
    const codice       = articolo.querySelector(".codice")?.value || "";
    const descrizione  = articolo.querySelector(".descrizione")?.value || "";
    const prezzoLordo  = articolo.querySelector(".prezzoLordo")?.value || "";
    const sconto       = articolo.querySelector(".sconto")?.value || "";
    const prezzoNetto  = articolo.querySelector(".prezzoNetto")?.value || "";
    const quantita     = articolo.querySelector(".quantita")?.value || "";
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
    margine: document.getElementById("margine").value,
    costoTrasporto: document.getElementById("costoTrasporto").value,
    costoInstallazione: document.getElementById("costoInstallazione").value,
    modalitaPagamento: document.getElementById("modalitaPagamento").value,
    checkboxes
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
  document.getElementById("citta").value       = data.datiCliente.citta;
  document.getElementById("indirizzo").value   = data.datiCliente.indirizzo;
  document.getElementById("telefono").value    = data.datiCliente.telefono;
  document.getElementById("email").value       = data.datiCliente.email;

  const container = document.getElementById("articoli-container");
  container.innerHTML = "";
  data.articoli.forEach(article => {
    aggiungiArticoloConDati(article);
  });

  document.getElementById("margine").value             = data.margine;
  document.getElementById("costoTrasporto").value      = data.costoTrasporto;
  document.getElementById("costoInstallazione").value  = data.costoInstallazione;
  document.getElementById("modalitaPagamento").value   = data.modalitaPagamento;

  document.getElementById("mostraCodici").checked      = data.checkboxes.mostraCodici;
  document.getElementById("mostraPrezzi").checked      = data.checkboxes.mostraPrezzi;
  document.getElementById("mostraMarginalita").checked = data.checkboxes.mostraMarginalita;
  document.getElementById("mostraTrasporto").checked   = data.checkboxes.mostraTrasporto;

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
  const selezionati = Array.from(select.selectedOptions).map(option => parseInt(option.value));
  preventivi = preventivi.filter((_, idx) => !selezionati.includes(idx));
  localStorage.setItem("preventivi", JSON.stringify(preventivi));
  aggiornaListaPreventivi();
}

function aggiornaListaPreventivi() {
  const select = document.getElementById("listaPreventivi");
  select.innerHTML = "";
  let preventivi = JSON.parse(localStorage.getItem("preventivi")) || [];
  preventivi.forEach((p, i) => {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = p.nome;
    select.appendChild(option);
  });
  select.disabled = preventivi.length === 0;
}

// -----------------------------------------------------
// 3) GESTIONE ARTICOLI
// -----------------------------------------------------

function aggiungiArticolo() {
  const container = document.getElementById("articoli-container");
  const idUnico = Date.now();
  const div = document.createElement("div");
  div.classList.add("articolo");
  div.innerHTML = `
    <details id="articolo-${idUnico}" open>
      <summary>Nuovo Articolo</summary>
      <label>Codice: 
        <input type="text" class="codice" oninput="aggiornaTitolo(this, ${idUnico})">
      </label>
      <label>Descrizione: 
        <input type="text" class="descrizione">
      </label>
      <label>Prezzo Lordo (€): 
        <input type="text" class="prezzoLordo" oninput="calcolaPrezzo(this)">
      </label>
      <label>Sconto (%): 
        <input type="number" class="sconto" step="0.01" oninput="calcolaPrezzo(this)">
      </label>
      <label>Prezzo Netto (€):
        <input type="text" class="prezzoNetto" oninput="calcolaPrezzo(this)">
      </label>
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
  const idUnico   = Date.now() + Math.floor(Math.random() * 1000);
  const div       = document.createElement("div");
  div.classList.add("articolo");
  div.innerHTML = `
    <details id="articolo-${idUnico}" open>
      <summary>${dati.codice || "Nuovo Articolo"}</summary>
      <label>Codice:
        <input type="text" class="codice" 
          value="${dati.codice || ""}" 
          oninput="aggiornaTitolo(this, ${idUnico})">
      </label>
      <label>Descrizione:
        <input type="text" class="descrizione" 
          value="${dati.descrizione || ""}">
      </label>
      <label>Prezzo Lordo (€):
        <input type="text" class="prezzoLordo" 
          value="${dati.prezzoLordo || ""}" 
          oninput="calcolaPrezzo(this)">
      </label>
      <label>Sconto (%):
        <input type="number" class="sconto" step="0.01"
          value="${dati.sconto || ""}" 
          oninput="calcolaPrezzo(this)">
      </label>
      <label>Prezzo Netto (€):
        <input type="text" class="prezzoNetto" 
          value="${dati.prezzoNetto || ""}" 
          oninput="calcolaPrezzo(this)">
      </label>
      <label>Quantità:
        <input type="text" class="quantita" value="${dati.quantita || 1}"
          oninput="calcolaPrezzo(this)">
      </label>
      <label>Prezzo Totale (€):
        <input type="text" class="prezzoTotale"
          value="${dati.prezzoTotale || ""}" 
          readonly>
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

// -----------------------------------------------------
// 4) CALCOLO PREZZI ARTICOLO
// -----------------------------------------------------
function calcolaPrezzo(input) {
  const row = input.closest(".articolo");

  // Interpretiamo come numeri in stile it-IT
  let prezzoLordo = parseNumberITA(row.querySelector(".prezzoLordo").value);
  let sconto      = parseFloat(row.querySelector(".sconto").value) || 0;
  let quantita    = parseNumberITA(row.querySelector(".quantita").value);

  const prezzoNettoEl = row.querySelector(".prezzoNetto");
  let prezzoNetto     = parseNumberITA(prezzoNettoEl.value);

  // Se l'input è Prezzo Lordo o Sconto, ricalcoliamo Prezzo Netto
  if (input.classList.contains("prezzoLordo") || input.classList.contains("sconto")) {
    prezzoNetto = prezzoLordo * (1 - sconto / 100);
    // Sovrascriviamo il Prezzo Netto col valore formattato
    prezzoNettoEl.value = formatNumberITA(prezzoNetto);
  }
  // Se l'input è Prezzo Netto, usiamo il valore digitato manualmente.
  // Importante: per leggere correttamente il valore formattato in stile it-IT, usiamo parseNumberITA
  const manualNetto = parseNumberITA(prezzoNettoEl.value) || 0;
  let prezzoTotale = manualNetto * quantita;
  row.querySelector(".prezzoTotale").value = formatNumberITA(prezzoTotale);

  aggiornaTotaleGenerale();
}

// -----------------------------------------------------
// 5) CALCOLO TOTALI (Articoli, Margine, Trasporto, etc.)
// -----------------------------------------------------
function aggiornaTotaleGenerale() {
  let totaleGenerale = 0;
  document.querySelectorAll(".prezzoTotale").forEach(input => {
    totaleGenerale += parseNumberITA(input.value);
  });
  document.getElementById("totaleArticoli").textContent =
    `Totale Articoli: ${formatNumberITA(totaleGenerale)}€`;
  calcolaMarginalita();
}

function calcolaMarginalita() {
  const testoTotale = document.getElementById("totaleArticoli").textContent;
  let match = testoTotale.match(/([\d.,]+)/);
  let totaleArticoli = 0;
  if (match) {
    totaleArticoli = parseNumberITA(match[1]);
  }
  const margine = parseFloat(document.getElementById("margine").value) || 0;
  let nuovoTotale = totaleArticoli;
  if (margine > 0) {
    nuovoTotale = totaleArticoli / (1 - margine / 100);
  }
  document.getElementById("totaleMarginalita").textContent =
    `Nuovo Totale Articoli: ${formatNumberITA(nuovoTotale)}€`;
  calcolaTotaleFinale();
}

function calcolaTotaleFinale() {
  const trasportoVal     = document.getElementById("costoTrasporto").value;
  const installazioneVal = document.getElementById("costoInstallazione").value;

  let trasportoNum      = parseNumberITA(trasportoVal);
  let installazioneNum  = parseNumberITA(installazioneVal);

  const testoMarginalita = document.getElementById("totaleMarginalita").textContent;
  let match = testoMarginalita.match(/([\d.,]+)/);
  let nuovoTotale = 0;
  if (match) {
    nuovoTotale = parseNumberITA(match[1]);
  }

  let finale = nuovoTotale + trasportoNum + installazioneNum;
  document.getElementById("totaleFinale").textContent =
    `Totale Finale: ${formatNumberITA(finale)}€`;
}

// -----------------------------------------------------
// 6) GENERAZIONE CONTENUTO (PDF / WhatsApp)
// -----------------------------------------------------
function formatTrasportoInstallazione(val) {
  if (!val.trim()) return "0,00";
  let n = parseNumberITA(val);
  return formatNumberITA(n) + "€";
}

function generaContenuto() {
  let contenuto = "";

  let oggi = new Date();
  let gg   = String(oggi.getDate()).padStart(2, "0");
  let mm   = String(oggi.getMonth() + 1).padStart(2, "0");
  let yyyy = oggi.getFullYear();
  contenuto += `Data: ${gg}/${mm}/${yyyy}\n\n`;

  // Dati Cliente
  contenuto += "Dati Cliente:\n";
  contenuto += `Nome Azienda: ${document.getElementById("nomeAzienda").value}\n`;
  contenuto += `Città: ${document.getElementById("citta").value}\n`;
  contenuto += `Indirizzo: ${document.getElementById("indirizzo").value}\n`;
  contenuto += `Cell/Tel.: ${document.getElementById("telefono").value}\n`;
  contenuto += `Email: ${document.getElementById("email").value}\n\n`;

  if (document.getElementById("mostraCodici").checked) {
    // Modalità semplificata
    contenuto += "Articoli:\n";
    const articoli = document.querySelectorAll(".articolo");
    articoli.forEach(art => {
      const codice       = art.querySelector(".codice")?.value || "";
      const descrizione  = art.querySelector(".descrizione")?.value || "";
      const quantita     = art.querySelector(".quantita")?.value || "";
      contenuto += `Codice: ${codice}\n`;
      contenuto += `  Descrizione: ${descrizione}\n`;
      contenuto += `  Quantità: ${quantita}\n\n`;
    });
    if (document.getElementById("mostraTrasporto").checked) {
      const tv = document.getElementById("costoTrasporto").value;
      const iv = document.getElementById("costoInstallazione").value;
      contenuto += `Trasporto: ${formatTrasportoInstallazione(tv)}\n`;
      contenuto += `Installazione: ${formatTrasportoInstallazione(iv)}\n`;
    }
    contenuto += document.getElementById("totaleFinale").textContent + "\n";
    contenuto += "Prezzi sono al netto di IVA del 22%.\n";
  } else {
    // Modalità dettagliata
    contenuto += "Articoli:\n";
    const articoli = document.querySelectorAll(".articolo");
    articoli.forEach(art => {
      const codice       = art.querySelector(".codice")?.value || "";
      const descrizione  = art.querySelector(".descrizione")?.value || "";
      const lordo        = art.querySelector(".prezzoLordo")?.value || "";
      const sconto       = art.querySelector(".sconto")?.value || "";
      const netto        = art.querySelector(".prezzoNetto")?.value || "";
      const quantita     = art.querySelector(".quantita")?.value || "";
      const totale       = art.querySelector(".prezzoTotale")?.value || "";
      contenuto += `Codice: ${codice}\n`;
      contenuto += `  Descrizione: ${descrizione}\n`;
      contenuto += `  Prezzo Lordo: ${lordo}€\n`;
      contenuto += `  Sconto: ${sconto}%\n`;
      if (document.getElementById("mostraPrezzi").checked) {
        contenuto += `  Prezzo Netto: ${netto}€\n`;
      }
      contenuto += `  Quantità: ${quantita}\n`;
      contenuto += `  Prezzo Totale: ${totale}€\n\n`;
    });

    const mp = document.getElementById("mostraPrezzi").checked;
    const mm = document.getElementById("mostraMarginalita").checked;
    const mt = document.getElementById("mostraTrasporto").checked;

    if (!mp && !mm && !mt) {
      contenuto += `Margine: ${document.getElementById("margine").value || "0"}%\n`;
      contenuto += document.getElementById("totaleArticoli").textContent + "\n";
      contenuto += document.getElementById("totaleMarginalita").textContent + "\n";
      const tv = document.getElementById("costoTrasporto").value;
      const iv = document.getElementById("costoInstallazione").value;
      contenuto += `Trasporto: ${formatTrasportoInstallazione(tv)}\n`;
      contenuto += `Installazione: ${formatTrasportoInstallazione(iv)}\n`;
      contenuto += document.getElementById("totaleFinale").textContent + "\n";
    } else {
      contenuto += document.getElementById("totaleArticoli").textContent + "\n";
      if(document.getElementById("mostraMarginalita").checked) {
        contenuto += document.getElementById("totaleMarginalita").textContent + "\n";
      }
      if(document.getElementById("mostraTrasporto").checked) {
        const tv = document.getElementById("costoTrasporto").value;
        const iv = document.getElementById("costoInstallazione").value;
        contenuto += `Trasporto: ${formatTrasportoInstallazione(tv)}\n`;
        contenuto += `Installazione: ${formatTrasportoInstallazione(iv)}\n`;
      }
      contenuto += document.getElementById("totaleFinale").textContent + "\n";
    }
    contenuto += "\nModalità di Pagamento: " + document.getElementById("modalitaPagamento").value + "\n";
  }

  return contenuto;
}

function generaPDF() {
  const testo = generaContenuto();
  const blob = new Blob([testo], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "preventivo.txt";
  a.click();
  URL.revokeObjectURL(url);
}

function inviaWhatsApp() {
  const testo = generaContenuto();
  const encoded = encodeURIComponent(testo);
  const link = `https://wa.me/?text=${encoded}`;
  window.open(link, "_blank");
}

// -----------------------------------------------------
// 7) COLLEGAMENTO DINAMICO A EASYPRICE
// -----------------------------------------------------
function inviaADynamicEasyPrice() {
  // Raccogliamo il Totale Finale e lo inviamo come parametro 'totale'
  let totaleText = document.getElementById("totaleFinale").textContent; // es. "Totale Finale: 1.234,56€"
  // Rimuoviamo il prefisso e il simbolo dell'euro:
  let totale = totaleText.replace("Totale Finale:", "").replace("€", "").trim();
  let url = "https://pezzaliapp.github.io/EasyPrice/?totale=" + encodeURIComponent(totale);
  window.open(url, "_blank");
}

// -----------------------------------------------------
// 8) COLLEGAMENTO DINAMICO A FLEXRENTCALC
// -----------------------------------------------------
function apriFlexRentCalc() {
  window.open("https://pezzaliapp.github.io/FlexRentCalc/", "_blank");
}
