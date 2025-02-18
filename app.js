// File: app.js

document.addEventListener("DOMContentLoaded", function () {
  caricaPreventiviSalvati();
  aggiornaTotaleGenerale();
});

// --------------------------------------------------------
// 1) FUNZIONI DI FORMATTAZIONE E PARSING DEI NUMERI
// --------------------------------------------------------

/**
 * parseNumberITA(str)
 * Converte una stringa in numero "all'italiana":
 * - Rimuove simboli come € e spazi
 * - Elimina i punti (usati come separatori di migliaia)
 * - Converte la virgola in punto per interpretarla come decimale
 * - Usa parseFloat. Se non è un numero, restituisce 0.
 */
function parseNumberITA(str) {
  if (!str) return 0;
  let pulito = str.replace(/[^\d.,-]/g, '');   // rimuove caratteri non utili (€, spazi, ecc.)
  pulito = pulito.replace(/\./g, '');         // rimuove i punti (migliaia)
  pulito = pulito.replace(',', '.');          // sostituisce virgola con punto
  let valore = parseFloat(pulito);
  return isNaN(valore) ? 0 : valore;
}

/**
 * formatNumberITA(num)
 * Restituisce una stringa con 2 decimali, usando
 * il separatore migliaia “.” e decimali “,” in stile it-IT.
 */
function formatNumberITA(num) {
  const numero = isNaN(num) ? 0 : num;
  return new Intl.NumberFormat('it-IT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numero);
}

/**
 * formatAutomatico(input)
 * Funzione da chiamare onblur per i campi “testo”
 * che contengono numeri (es. Prezzi, Quantità, Trasporto...):
 * - Legge il contenuto e lo converte in un numero
 * - Lo formatta “all’italiana” con 2 decimali
 * - Lo riscrive nel campo
 */
function formatAutomatico(input) {
  let valoreNum = parseNumberITA(input.value);
  input.value = formatNumberITA(valoreNum);
}

// --------------------------------------------------------
// 2) FUNZIONI DI GESTIONE DEI PREVENTIVI (Salva, Richiama, etc.)
// --------------------------------------------------------

function caricaPreventiviSalvati() {
  aggiornaListaPreventivi();
}

function getPreventivoData() {
  // Dati Cliente
  const datiCliente = {
    nomeAzienda: document.getElementById("nomeAzienda").value,
    citta: document.getElementById("citta").value,
    indirizzo: document.getElementById("indirizzo").value,
    telefono: document.getElementById("telefono").value,
    email: document.getElementById("email").value,
  };

  // Articoli
  const articoli = [];
  document.querySelectorAll(".articolo").forEach((articolo) => {
    const codice       = articolo.querySelector(".codice")?.value || "";
    const descrizione  = articolo.querySelector(".descrizione")?.value || "";
    const prezzoLordo  = articolo.querySelector(".prezzoLordo")?.value || "";
    const sconto       = articolo.querySelector(".sconto")?.value || "";  // percentuale
    const prezzoNetto  = articolo.querySelector(".prezzoNetto")?.value || "";
    const quantita     = articolo.querySelector(".quantita")?.value || "";
    const prezzoTotale = articolo.querySelector(".prezzoTotale")?.value || "";
    articoli.push({ codice, descrizione, prezzoLordo, sconto, prezzoNetto, quantita, prezzoTotale });
  });

  // Checkboxes
  const checkboxes = {
    mostraCodici: document.getElementById("mostraCodici").checked,
    mostraPrezzi: document.getElementById("mostraPrezzi").checked,
    mostraMarginalita: document.getElementById("mostraMarginalita").checked,
    mostraTrasporto: document.getElementById("mostraTrasporto").checked,
  };

  return {
    datiCliente,
    articoli,
    margine: document.getElementById("margine").value,  // percentuale, lo lasciamo invariato
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
  // Dati cliente
  document.getElementById("nomeAzienda").value = data.datiCliente.nomeAzienda;
  document.getElementById("citta").value       = data.datiCliente.citta;
  document.getElementById("indirizzo").value   = data.datiCliente.indirizzo;
  document.getElementById("telefono").value    = data.datiCliente.telefono;
  document.getElementById("email").value       = data.datiCliente.email;

  // Articoli
  const container = document.getElementById("articoli-container");
  container.innerHTML = "";
  data.articoli.forEach((article) => {
    aggiungiArticoloConDati(article);
  });

  // Margine, trasporto, installazione, pagamento
  document.getElementById("margine").value             = data.margine;
  document.getElementById("costoTrasporto").value      = data.costoTrasporto;
  document.getElementById("costoInstallazione").value  = data.costoInstallazione;
  document.getElementById("modalitaPagamento").value   = data.modalitaPagamento;

  // Checkboxes
  document.getElementById("mostraCodici").checked       = data.checkboxes.mostraCodici;
  document.getElementById("mostraPrezzi").checked       = data.checkboxes.mostraPrezzi;
  document.getElementById("mostraMarginalita").checked  = data.checkboxes.mostraMarginalita;
  document.getElementById("mostraTrasporto").checked    = data.checkboxes.mostraTrasporto;

  // Ricalcola i totali
  aggiornaTotaleGenerale();
}

function richiamaPreventivo() {
  const select = document.getElementById("listaPreventivi");
  const index  = select.value;
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

// --------------------------------------------------------
// 3) FUNZIONI DI GESTIONE DEGLI ARTICOLI
// --------------------------------------------------------

function aggiungiArticolo() {
  const container = document.getElementById("articoli-container");
  const idUnico = Date.now();
  const div = document.createElement("div");
  div.classList.add("articolo");

  // Qui, notare che usiamo oninput per calcolare, e onblur per formattare
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
  // Stessa logica, ma popoliamo i campi con i valori esistenti
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
  // Semplicemente chiude il <details>
  document.getElementById(`articolo-${id}`).open = false;
}

function rimuoviArticolo(btn) {
  btn.parentElement.parentElement.remove();
  aggiornaTotaleGenerale();
}

// --------------------------------------------------------
// 4) CALCOLO DEI PREZZI / TOTALE
// --------------------------------------------------------

/**
 * calcolaPrezzo(input)
 * Viene chiamata da oninput in uno dei campi dell'articolo (prezzo lordo, sconto, prezzo netto, quantità).
 * Non formattiamo subito il campo (questo lo facciamo onblur), ma:
 * - leggiamo i valori come numeri con parseNumberITA
 * - se l'utente ha cambiato Lordo o Sconto, ricalcoliamo il Netto
 * - calcoliamo Totale = Netto * Quantità
 * - aggiorniamo i totali generali
 */
function calcolaPrezzo(input) {
  const row = input.closest(".articolo");

  // Leggiamo i campi come numeri
  let prezzoLordo = parseNumberITA(row.querySelector(".prezzoLordo").value);
  let sconto      = parseFloat(row.querySelector(".sconto").value) || 0;  // % => no formattazione
  let quantita    = parseNumberITA(row.querySelector(".quantita").value);

  // Prezzo Netto (può essere inserito manualmente oppure ricalcolato)
  let prezzoNettoEl = row.querySelector(".prezzoNetto");
  let prezzoNetto = parseNumberITA(prezzoNettoEl.value);

  // Se l'input modificato è .prezzoLordo o .sconto -> ricalcolo del netto
  if (input.classList.contains("prezzoLordo") || input.classList.contains("sconto")) {
    prezzoNetto = prezzoLordo * (1 - sconto / 100);
    prezzoNettoEl.value = prezzoNetto.toString();
  }

  // Calcolo prezzo totale
  let prezzoTotale = prezzoNetto * quantita;
  row.querySelector(".prezzoTotale").value = prezzoTotale.toString();

  // Aggiorna i totali
  aggiornaTotaleGenerale();
}

/**
 * aggiornaTotaleGenerale()
 * Somma tutti i "prezzoTotale" e aggiorna l'etichetta "Totale Articoli"
 * poi richiama calcolaMarginalita()
 */
function aggiornaTotaleGenerale() {
  let totaleGenerale = 0;
  document.querySelectorAll(".prezzoTotale").forEach((input) => {
    let val = parseNumberITA(input.value);
    totaleGenerale += val;
  });
  document.getElementById("totaleArticoli").textContent =
    "Totale Articoli: " + formatNumberITA(totaleGenerale) + "€";
  calcolaMarginalita();
}

/**
 * calcolaMarginalita()
 * - legge il Totale Articoli (già formattato) e lo converte in numero
 * - applica la marginalità in %
 * - aggiorna "Nuovo Totale Articoli"
 * - richiama calcolaTotaleFinale()
 */
function calcolaMarginalita() {
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

/**
 * calcolaTotaleFinale()
 * - legge trasporto e installazione come numeri
 * - legge "Nuovo Totale Articoli"
 * - somma tutto e aggiorna "Totale Finale"
 */
function calcolaTotaleFinale() {
  const trasportoVal      = document.getElementById("costoTrasporto").value;
  const installazioneVal  = document.getElementById("costoInstallazione").value;

  let trasportoNum      = parseNumberITA(trasportoVal);
  let installazioneNum  = parseNumberITA(installazioneVal);

  const totMarginTxt = document.getElementById("totaleMarginalita").textContent;
  let match = totMarginTxt.match(/([\d.,]+)/);
  let nuovoTotale = 0;
  if (match) {
    nuovoTotale = parseNumberITA(match[1]);
  }

  const finale = nuovoTotale + trasportoNum + installazioneNum;
  document.getElementById("totaleFinale").textContent =
    "Totale Finale: " + formatNumberITA(finale) + "€";
}

// --------------------------------------------------------
// 5) FUNZIONI DI GENERAZIONE CONTENUTO (PDF/WHATSAPP)
// --------------------------------------------------------

function generaContenuto() {
  let contenuto = "";

  // Data corrente (gg/mm/aaaa)
  let oggi = new Date();
  let giorno = String(oggi.getDate()).padStart(2, "0");
  let mese   = String(oggi.getMonth() + 1).padStart(2, "0");
  let anno   = oggi.getFullYear();
  let dataFormattata = `${giorno}/${mese}/${anno}`;
  contenuto += `Data: ${dataFormattata}\n\n`;

  // Dati Cliente
  contenuto += "Dati Cliente:\n";
  contenuto += `Nome Azienda: ${document.getElementById("nomeAzienda").value}\n`;
  contenuto += `Città: ${document.getElementById("citta").value}\n`;
  contenuto += `Indirizzo: ${document.getElementById("indirizzo").value}\n`;
  contenuto += `Cell/Tel.: ${document.getElementById("telefono").value}\n`;
  contenuto += `Email: ${document.getElementById("email").value}\n\n`;

  // Se "mostraCodici" è spuntato -> modalità semplificata
  if (document.getElementById("mostraCodici").checked) {
    contenuto += "Articoli:\n";
    const articoli = document.querySelectorAll(".articolo");
    articoli.forEach((articolo) => {
      const codice       = articolo.querySelector(".codice")?.value || "";
      const descrizione  = articolo.querySelector(".descrizione")?.value || "";
      const quantita     = articolo.querySelector(".quantita")?.value || "";
      contenuto += `Codice: ${codice}\n`;
      contenuto += `  Descrizione: ${descrizione}\n`;
      contenuto += `  Quantità: ${quantita}\n\n`;
    });

    // Se "mostraTrasporto" è spuntato, stampiamo trasporto/inst.
    if (document.getElementById("mostraTrasporto").checked) {
      const trasportoVal     = document.getElementById("costoTrasporto").value;
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
      const codice       = articolo.querySelector(".codice")?.value || "";
      const descrizione  = articolo.querySelector(".descrizione")?.value || "";
      const prezzoLordo  = articolo.querySelector(".prezzoLordo")?.value || "";
      const sconto       = articolo.querySelector(".sconto")?.value || "";
      const prezzoNetto  = articolo.querySelector(".prezzoNetto")?.value || "";
      const quantita     = articolo.querySelector(".quantita")?.value || "";
      const prezzoTotale = articolo.querySelector(".prezzoTotale")?.value || "";
      contenuto += `Codice: ${codice}\n`;
      contenuto += `  Descrizione: ${descrizione}\n`;
      contenuto += `  Prezzo Lordo: ${prezzoLordo}\n`;
      contenuto += `  Sconto: ${sconto}%\n`;
      if (document.getElementById("mostraPrezzi").checked) {
        contenuto += `  Prezzo Netto: ${prezzoNetto}\n`;
      }
      contenuto += `  Quantità: ${quantita}\n`;
      contenuto += `  Prezzo Totale: ${prezzoTotale}\n\n`;
    });

    // Verifichiamo i flag
    const mostraPrezzi      = document.getElementById("mostraPrezzi").checked;
    const mostraMarginalita = document.getElementById("mostraMarginalita").checked;
    const mostraTrasporto   = document.getElementById("mostraTrasporto").checked;

    if (!mostraPrezzi && !mostraMarginalita && !mostraTrasporto) {
      // Nessun flag: mostro tutto (margine, trasporto, ecc.)
      contenuto += "Margine: " + (document.getElementById("margine").value || "0") + "%\n";
      contenuto += document.getElementById("totaleArticoli").textContent + "\n";
      contenuto += document.getElementById("totaleMarginalita").textContent + "\n";
      const trasportoVal     = document.getElementById("costoTrasporto").value;
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
        const trasportoVal     = document.getElementById("costoTrasporto").value;
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

/**
 * generaPDF()
 * Genera un file di testo (preventivo.txt) scaricabile
 * con i contenuti prodotti da generaContenuto().
 */
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

/**
 * inviaWhatsApp()
 * Apre WhatsApp Web con il testo generato, codificato in URL
 */
function inviaWhatsApp() {
  const testo = generaContenuto();
  const encodedText = encodeURIComponent(testo);
  const whatsappUrl = `https://wa.me/?text=${encodedText}`;
  window.open(whatsappUrl, "_blank");
}
