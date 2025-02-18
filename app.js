// File: app.js

document.addEventListener("DOMContentLoaded", function () {
  caricaPreventiviSalvati();
  aggiornaTotaleGenerale();
});

// ---------------------------------------------
// 1) Funzioni di parsing e formattazione
// ---------------------------------------------

/**
 * parseNumberITA(str)
 * Permette di digitare "4.000" per 4000, oppure "1.234,56" per 1234.56
 * - Rimuove i punti usati come separatori di migliaia
 * - Converte la virgola in punto
 * - parseFloat per ottenere un numero
 * - Se non valido => 0
 */
function parseNumberITA(str) {
  if (!str) return 0;
  let pulito = str.replace(/[^\d.,-]/g, "");  // rimuove eventuali simboli non validi
  pulito = pulito.replace(/\./g, "");         // rimuove i '.' usati come migliaia
  pulito = pulito.replace(",", ".");          // sostituisce ',' con '.'
  let valore = parseFloat(pulito);
  return isNaN(valore) ? 0 : valore;
}

// ---------------------------------------------
// 2) Gestione Preventivi
// ---------------------------------------------

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
    const codice       = articolo.querySelector(".codice")?.value || "";
    const descrizione  = articolo.querySelector(".descrizione")?.value || "";
    const prezzoLordo  = articolo.querySelector(".prezzoLordo")?.value || "";
    const sconto       = articolo.querySelector(".sconto")?.value || "";
    const prezzoNetto  = articolo.querySelector(".prezzoNetto")?.value || "";
    const quantita     = articolo.querySelector(".quantita")?.value || "";
    const prezzoTotale = articolo.querySelector(".prezzoTotale")?.value || "";
    articoli.push({
      codice, descrizione, prezzoLordo, sconto, prezzoNetto, quantita, prezzoTotale
    });
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
  document.getElementById("citta").value       = data.datiCliente.citta;
  document.getElementById("indirizzo").value   = data.datiCliente.indirizzo;
  document.getElementById("telefono").value    = data.datiCliente.telefono;
  document.getElementById("email").value       = data.datiCliente.email;

  const container = document.getElementById("articoli-container");
  container.innerHTML = "";
  data.articoli.forEach((article) => {
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
  const index  = select.value;
  if (index === "") return;
  let preventivi = JSON.parse(localStorage.getItem("preventivi")) || [];
  popolaForm(preventivi[index]);
}

function eliminaPreventiviSelezionati() {
  const select = document.getElementById("listaPreventivi");
  let preventivi = JSON.parse(localStorage.getItem("preventivi")) || [];
  const selezionati = Array.from(select.selectedOptions).map((option) => parseInt(option.value));
  preventivi = preventivi.filter((_, idx) => !selezionati.includes(idx));
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

// ---------------------------------------------
// 3) Gestione Articoli
// ---------------------------------------------

function aggiungiArticolo() {
  const container = document.getElementById("articoli-container");
  const idUnico = Date.now();
  const div = document.createElement("div");
  div.classList.add("articolo");

  // Nota: "type='text'" per prezzoLordo, prezzoNetto, quantita, così "4.000" è accettato
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
  const idUnico = Date.now() + Math.floor(Math.random() * 1000);
  const div = document.createElement("div");
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
        <input type="text" class="descrizione" value="${dati.descrizione || ""}">
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
        <input type="text" class="quantita"
          value="${dati.quantita || 1}"
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

// ----------------------------------------------------
// 4) Calcolo Prezzi
// ----------------------------------------------------

function calcolaPrezzo(input) {
  const row = input.closest(".articolo");

  // Leggiamo i campi come numeri "all'italiana"
  let prezzoLordo = parseNumberITA(row.querySelector(".prezzoLordo").value);
  let sconto      = parseFloat(row.querySelector(".sconto").value) || 0; // % => number "normale"
  let quantita    = parseNumberITA(row.querySelector(".quantita").value);

  const prezzoNettoEl = row.querySelector(".prezzoNetto");
  let prezzoNetto = parseNumberITA(prezzoNettoEl.value);

  // Se è stato modificato il Prezzo Lordo o lo Sconto, ricalcoliamo il Netto
  if (input.classList.contains("prezzoLordo") || input.classList.contains("sconto")) {
    prezzoNetto = prezzoLordo * (1 - sconto / 100);
    prezzoNettoEl.value = prezzoNetto.toFixed(2); // aggiorniamo come stringa
  }
  // Altrimenti, se è stato modificato il Prezzo Netto, lasciamo quello immesso dall'utente

  const prezzoTotale = prezzoNetto * quantita;
  row.querySelector(".prezzoTotale").value = prezzoTotale.toFixed(2);

  aggiornaTotaleGenerale();
}

function aggiornaTotaleGenerale() {
  let totaleGenerale = 0;
  document.querySelectorAll(".prezzoTotale").forEach((input) => {
    totaleGenerale += parseFloat(input.value) || 0;
  });
  document.getElementById("totaleArticoli").textContent =
    `Totale Articoli: ${totaleGenerale.toFixed(2)}€`;
  calcolaMarginalita();
}

function calcolaMarginalita() {
  const totaleArticoliText = document.getElementById("totaleArticoli").textContent;
  const totaleArticoli = parseFloat(
    totaleArticoliText.replace(/[^0-9.,]/g, "").replace(",", ".")
  ) || 0;

  const margine = parseFloat(document.getElementById("margine").value) || 0;
  let nuovoTotale = totaleArticoli;
  if (margine > 0) {
    nuovoTotale = totaleArticoli / (1 - margine / 100);
  }
  document.getElementById("totaleMarginalita").textContent =
    `Nuovo Totale Articoli: ${nuovoTotale.toFixed(2)}€`;
  calcolaTotaleFinale();
}

function calcolaTotaleFinale() {
  const trasportoVal     = document.getElementById("costoTrasporto").value.trim();
  const installazioneVal = document.getElementById("costoInstallazione").value.trim();

  // Proviamo a interpretare come numero
  let trasportoNum = parseNumberITA(trasportoVal);
  let installazioneNum = parseNumberITA(installazioneVal);

  const totaleMarginalitaText = document.getElementById("totaleMarginalita").textContent;
  const nuovoTotale = parseFloat(
    totaleMarginalitaText.replace(/[^0-9.,]/g, "").replace(",", ".")
  ) || 0;

  const totaleFinale = nuovoTotale + trasportoNum + installazioneNum;
  document.getElementById("totaleFinale").textContent =
    `Totale Finale: ${totaleFinale.toFixed(2)}€`;
}

// ----------------------------------------------------
// 5) Stampa PDF/WhatsApp
// ----------------------------------------------------

function formatTrasportoInstallazione(val) {
  if (!val.trim()) {
    return "0,00";
  }
  let num = parseNumberITA(val);
  if (isNaN(num) || num === 0) {
    // se l'utente ha inserito testo tipo "incluso" o "gratuito", lasciamo così
    // se è 0 perché parseNumberITA ha restituito 0, verifichiamo se era un testo
    // ma se vuoi considerare "0" => "0,00€"
    if (!/^\d/.test(val)) {
      // se non inizia con cifra, assumiamo che sia testo
      return val;
    }
    // altrimenti mettiamo 0,00
    return "0,00";
  } else {
    return num.toFixed(2) + "€";
  }
}

function generaContenuto() {
  let contenuto = "";

  // Data corrente (gg/mm/aaaa)
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

  // Controlliamo se mostraCodici
  if (document.getElementById("mostraCodici").checked) {
    // Modalità semplificata
    contenuto += "Articoli:\n";
    const articoli = document.querySelectorAll(".articolo");
    articoli.forEach((articolo) => {
      const codice      = articolo.querySelector(".codice")?.value || "";
      const descrizione = articolo.querySelector(".descrizione")?.value || "";
      const quantita    = articolo.querySelector(".quantita")?.value || "";
      contenuto += `Codice: ${codice}\n`;
      contenuto += `  Descrizione: ${descrizione}\n`;
      contenuto += `  Quantità: ${quantita}\n\n`;
    });

    // Trasporto/Installazione se richiesto
    if (document.getElementById("mostraTrasporto").checked) {
      const trasportoVal = document.getElementById("costoTrasporto").value;
      const installazioneVal = document.getElementById("costoInstallazione").value;
      contenuto += `Trasporto: ${formatTrasportoInstallazione(trasportoVal)}\n`;
      contenuto += `Installazione: ${formatTrasportoInstallazione(installazioneVal)}\n`;
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
      contenuto += `  Prezzo Lordo: ${prezzoLordo}€\n`;
      contenuto += `  Sconto: ${sconto}%\n`;
      if (document.getElementById("mostraPrezzi").checked) {
        contenuto += `  Prezzo Netto: ${prezzoNetto}€\n`;
      }
      contenuto += `  Quantità: ${quantita}\n`;
      contenuto += `  Prezzo Totale: ${prezzoTotale}€\n\n`;
    });

    // Flag vari
    const mostraPrezzi      = document.getElementById("mostraPrezzi").checked;
    const mostraMarginalita = document.getElementById("mostraMarginalita").checked;
    const mostraTrasporto   = document.getElementById("mostraTrasporto").checked;

    if (!mostraPrezzi && !mostraMarginalita && !mostraTrasporto) {
      // Nessun flag: mostriamo tutto
      contenuto += `Margine: ${document.getElementById("margine").value || "0"}%\n`;
      contenuto += document.getElementById("totaleArticoli").textContent + "\n";
      contenuto += document.getElementById("totaleMarginalita").textContent + "\n";
      const trasportoVal = document.getElementById("costoTrasporto").value;
      const installazioneVal = document.getElementById("costoInstallazione").value;
      contenuto += `Trasporto: ${formatTrasportoInstallazione(trasportoVal)}\n`;
      contenuto += `Installazione: ${formatTrasportoInstallazione(installazioneVal)}\n`;
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
        contenuto += `Trasporto: ${formatTrasportoInstallazione(trasportoVal)}\n`;
        contenuto += `Installazione: ${formatTrasportoInstallazione(installazioneVal)}\n`;
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
