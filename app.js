// File: app.js

document.addEventListener("DOMContentLoaded", function () {
  caricaPreventiviSalvati();
  aggiornaTotaleGenerale();
});

// ------------------------------
// FUNZIONI DI FORMATTAZIONE / PARSING
// ------------------------------

function parseNumberITA(str) {
  if (!str) return 0;
  // Elimina caratteri non utili (€, spazi, ecc.)
  let pulito = str.replace(/[^\d.,-]/g, '');
  // Rimuove i punti per considerare le migliaia
  pulito = pulito.replace(/\./g, '');
  // Sostituisce la virgola con il punto
  pulito = pulito.replace(',', '.');
  let valore = parseFloat(pulito);
  return isNaN(valore) ? 0 : valore;
}

function formatNumberITA(num) {
  const numero = isNaN(num) ? 0 : num;
  return new Intl.NumberFormat('it-IT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numero); // Esempio "3.000,50"
}

/**
 * Funzione da richiamare onblur: 
 * 1) facciamo parseNumberITA (per trasformare l'input in un numero),
 * 2) formattiamo con formatNumberITA
 * 3) riscriviamo nel campo
 */
function formatAutomatico(input) {
  let valoreNum = parseNumberITA(input.value);
  input.value = formatNumberITA(valoreNum);
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
    const sconto = articolo.querySelector(".sconto")?.value || ""; // percentuale, resta invariato
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
    margine: document.getElementById("margine").value,
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

  document.getElementById("margine").value = data.margine;
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
  // Notare la differenza: oninput fa calcolo, onblur formatta
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
        <input 
          type="text" 
          class="prezzoLordo" 
          oninput="calcolaPrezzo(this)" 
          onblur="formatAutomatico(this)">
      </label>
      <label>Sconto (%): 
        <input 
          type="number" 
          class="sconto" 
          step="0.01" 
          oninput="calcolaPrezzo(this)">
      </label>
      <label>Prezzo Netto (€): 
        <input 
          type="text" 
          class="prezzoNetto" 
          oninput="calcolaPrezzo(this)"
          onblur="formatAutomatico(this)">
      </label>
      <label>Quantità: 
        <input 
          type="text" 
          class="quantita" 
          value="1" 
          oninput="calcolaPrezzo(this)"
          onblur="formatAutomatico(this)">
      </label>
      <label>Prezzo Totale (€): 
        <input 
          type="text" 
          class="prezzoTotale" 
          readonly>
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
        <input 
          type="text" 
          class="codice" 
          value="${dati.codice || ""}" 
          oninput="aggiornaTitolo(this, ${idUnico})">
      </label>
      <label>Descrizione:
        <input 
          type="text" 
          class="descrizione" 
          value="${dati.descrizione || ""}">
      </label>
      <label>Prezzo Lordo (€):
        <input 
          type="text" 
          class="prezzoLordo" 
          value="${dati.prezzoLordo || ""}" 
          oninput="calcolaPrezzo(this)" 
          onblur="formatAutomatico(this)">
      </label>
      <label>Sconto (%):
        <input 
          type="number" 
          class="sconto" 
          step="0.01" 
          value="${dati.sconto || ""}" 
          oninput="calcolaPrezzo(this)">
      </label>
      <label>Prezzo Netto (€):
        <input 
          type="text" 
          class="prezzoNetto" 
          value="${dati.prezzoNetto || ""}" 
          oninput="calcolaPrezzo(this)"
          onblur="formatAutomatico(this)">
      </label>
      <label>Quantità:
        <input 
          type="text" 
          class="quantita" 
          value="${dati.quantita || 1}" 
          oninput="calcolaPrezzo(this)"
          onblur="formatAutomatico(this)">
      </label>
      <label>Prezzo Totale (€):
        <input 
          type="text" 
          class="prezzoTotale" 
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

// ------------------------------
// CALCOLO PREZZO ARTICOLO
// ------------------------------
function calcolaPrezzo(input) {
  const row = input.closest(".articolo");

  // 1) Leggiamo i campi convertendoli in numero
  let prezzoLordo = parseNumberITA(row.querySelector(".prezzoLordo").value);
  let sconto = parseFloat(row.querySelector(".sconto").value) || 0;
  let quantita = parseNumberITA(row.querySelector(".quantita").value);

  let prezzoNettoEl = row.querySelector(".prezzoNetto");
  let prezzoNetto = parseNumberITA(prezzoNettoEl.value);

  // Se l'utente ha modificato Prezzo Lordo o Sconto, ricalcoliamo il Netto
  if (
    input.classList.contains("prezzoLordo") ||
    input.classList.contains("sconto")
  ) {
    prezzoNetto = prezzoLordo * (1 - sconto / 100);
    // Non formattiamo subito (lo faremo in onblur), aggiorniamo solo il valore
    prezzoNettoEl.value = prezzoNetto.toString();
  }

  // Prezzo Totale
  let prezzoTotale = prezzoNetto * quantita;
  row.querySelector(".prezzoTotale").value = prezzoTotale.toString();

  aggiornaTotaleGenerale();
}

// ------------------------------
// CALCOLO TOTALI
// ------------------------------
function aggiornaTotaleGenerale() {
  let totaleGenerale = 0;
  document.querySelectorAll(".prezzoTotale").forEach((input) => {
    let val = parseNumberITA(input.value);
    totaleGenerale += val;
  });
  // Mostriamo formattato
  document.getElementById("totaleArticoli").textContent =
    "Totale Articoli: " + formatNumberITA(totaleGenerale) + "€";
  calcolaMarginalita();
}

function calcolaMarginalita() {
  // Esempio: "Totale Articoli: 3.000,50€"
  const totalTxt = document.getElementById("totaleArticoli").textContent;
  let match = totalTxt.match(/([\d.,]+)/);
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
    "Nuovo Totale Articoli: " + formatNumberITA(nuovoTotale) + "€";
  calcolaTotaleFinale();
}

function calcolaTotaleFinale() {
  const trasportoVal = document.getElementById("costoTrasporto").value;
  const installazioneVal = document.getElementById("costoInstallazione").value;

  let trasportoNum = parseNumberITA(trasportoVal);
  let installazioneNum = parseNumberITA(installazioneVal);

  const totalTxt = document.getElementById("totaleMarginalita").textContent;
  let match = totalTxt.match(/([\d.,]+)/);
  let nuovoTotale = 0;
  if (match) {
    nuovoTotale = parseNumberITA(match[1]);
  }

  const finale = nuovoTotale + trasportoNum + installazioneNum;
  document.getElementById("totaleFinale").textContent =
    "Totale Finale: " + formatNumberITA(finale) + "€";
}

// ------------------------------
// FUNZIONI DI GENERAZIONE DEL CONTENUTO (PDF/WHATSAPP)
// ------------------------------

function generaContenuto() {
  // ... rimane identico a prima, non cambia la logica di formattazione
  // Usa i valori attuali dei campi (che a onblur saranno già formattati).
  // ...
  // [Copiato tutto il tuo codice di generazione contenuto PDF/WhatsApp]
  // ...
  let contenuto = "";

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

  // E così via...
  // (Mantieni la tua parte "if mostraCodici... else... " identica)
  // ...
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
