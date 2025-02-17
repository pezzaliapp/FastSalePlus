// File: app.js

document.addEventListener("DOMContentLoaded", function () {
    caricaPreventiviSalvati();
    aggiornaTotaleGenerale();
});

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
    document.querySelectorAll(".articolo").forEach(articolo => {
        const codice = articolo.querySelector(".codice") ? articolo.querySelector(".codice").value : "";
        const descrizione = articolo.querySelector(".descrizione") ? articolo.querySelector(".descrizione").value : "";
        const prezzoLordo = articolo.querySelector(".prezzoLordo") ? articolo.querySelector(".prezzoLordo").value : "";
        const sconto = articolo.querySelector(".sconto") ? articolo.querySelector(".sconto").value : "";
        const prezzoNetto = articolo.querySelector(".prezzoNetto") ? articolo.querySelector(".prezzoNetto").value : "";
        const quantita = articolo.querySelector(".quantita") ? articolo.querySelector(".quantita").value : "";
        const prezzoTotale = articolo.querySelector(".prezzoTotale") ? articolo.querySelector(".prezzoTotale").value : "";
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
    document.getElementById("citta").value = data.datiCliente.citta;
    document.getElementById("indirizzo").value = data.datiCliente.indirizzo;
    document.getElementById("telefono").value = data.datiCliente.telefono;
    document.getElementById("email").value = data.datiCliente.email;
    
    const container = document.getElementById("articoli-container");
    container.innerHTML = "";
    data.articoli.forEach(article => {
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
    const selezionati = Array.from(select.selectedOptions).map(option => parseInt(option.value));
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
            <label>Prezzo Lordo (€): <input type="number" class="prezzoLordo" step="0.01" oninput="calcolaPrezzo(this)"></label>
            <label>Sconto (%): <input type="number" class="sconto" step="0.01" oninput="calcolaPrezzo(this)"></label>
            <label>Prezzo Netto (€): <input type="text" class="prezzoNetto"></label>
            <label>Quantità: <input type="number" class="quantita" step="1" value="1" oninput="calcolaPrezzo(this)"></label>
            <label>Prezzo Totale (€): <input type="text" class="prezzoTotale" readonly></label>
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

function calcolaPrezzo(input) {
    const row = input.closest(".articolo");
    const prezzoLordo = parseFloat(row.querySelector(".prezzoLordo").value) || 0;
    const sconto = parseFloat(row.querySelector(".sconto").value) || 0;
    const quantita = parseInt(row.querySelector(".quantita").value) || 1;
    const prezzoNettoField = row.querySelector(".prezzoNetto");
    // Se il campo prezzo netto è vuoto, calcolalo automaticamente
    if (!prezzoNettoField.value) {
        prezzoNettoField.value = (prezzoLordo * (1 - sconto / 100)).toFixed(2);
    }
    // Usa il valore presente (manuale o calcolato) per il calcolo del prezzo totale
    const manualNetto = parseFloat(prezzoNettoField.value) || 0;
    const prezzoTotale = manualNetto * quantita;
    row.querySelector(".prezzoTotale").value = prezzoTotale.toFixed(2);
    aggiornaTotaleGenerale();
}

function aggiornaTotaleGenerale() {
    let totaleGenerale = 0;
    document.querySelectorAll(".prezzoTotale").forEach(input => {
        totaleGenerale += parseFloat(input.value) || 0;
    });
    document.getElementById("totaleArticoli").textContent = `Totale Articoli: ${totaleGenerale.toFixed(2)}€`;
    calcolaMarginalita();
}

function calcolaMarginalita() {
    const totaleArticoliText = document.getElementById("totaleArticoli").textContent;
    const totaleArticoli = parseFloat(totaleArticoliText.replace(/[^0-9.,]/g, "").replace(',', '.')) || 0;
    const margine = parseFloat(document.getElementById("margine").value) || 0;
    let nuovoTotale = totaleArticoli;
    if (margine > 0) {
        nuovoTotale = totaleArticoli / (1 - margine / 100);
    }
    document.getElementById("totaleMarginalita").textContent = `Nuovo Totale Articoli: ${nuovoTotale.toFixed(2)}€`;
    calcolaTotaleFinale();
}

function calcolaTotaleFinale() {
    const totaleMarginalitaText = document.getElementById("totaleMarginalita").textContent;
    const nuovoTotale = parseFloat(totaleMarginalitaText.replace(/[^0-9.,]/g, "").replace(',', '.')) || 0;
    const costoTrasporto = parseFloat(document.getElementById("costoTrasporto").value) || 0;
    const costoInstallazione = parseFloat(document.getElementById("costoInstallazione").value) || 0;
    const totaleFinale = nuovoTotale + costoTrasporto + costoInstallazione;
    document.getElementById("totaleFinale").textContent = `Totale Finale: ${totaleFinale.toFixed(2)}€`;
}

function aggiungiArticoloConDati(dati) {
    const container = document.getElementById("articoli-container");
    const idUnico = Date.now() + Math.floor(Math.random() * 1000);
    const div = document.createElement("div");
    div.classList.add("articolo");
    div.innerHTML = `
        <details id="articolo-${idUnico}" open>
            <summary>${dati.codice || "Nuovo Articolo"}</summary>
            <label>Codice: <input type="text" class="codice" value="${dati.codice || ""}" oninput="aggiornaTitolo(this, ${idUnico})"></label>
            <label>Descrizione: <input type="text" class="descrizione" value="${dati.descrizione || ""}"></label>
            <label>Prezzo Lordo (€): <input type="number" class="prezzoLordo" step="0.01" value="${dati.prezzoLordo || ""}" oninput="calcolaPrezzo(this)"></label>
            <label>Sconto (%): <input type="number" class="sconto" step="0.01" value="${dati.sconto || ""}" oninput="calcolaPrezzo(this)"></label>
            <label>Prezzo Netto (€): <input type="text" class="prezzoNetto" value="${dati.prezzoNetto || ""}"></label>
            <label>Quantità: <input type="number" class="quantita" step="1" value="${dati.quantita || 1}" oninput="calcolaPrezzo(this)"></label>
            <label>Prezzo Totale (€): <input type="text" class="prezzoTotale" value="${dati.prezzoTotale || ""}" readonly></label>
            <button onclick="salvaArticolo(${idUnico})">Salva</button>
            <button onclick="rimuoviArticolo(this)">Rimuovi</button>
        </details>
    `;
    container.appendChild(div);
}

// ------------------------------
// FUNZIONI DI GENERAZIONE DEL CONTENUTO (PDF/WHATSAPP)
// ------------------------------

function generaContenuto() {
    let contenuto = "";
    
    // Data corrente (formattata come gg/mm/aaaa)
    let oggi = new Date();
    let giorno = oggi.getDate().toString().padStart(2, "0");
    let mese = (oggi.getMonth() + 1).toString().padStart(2, "0");
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
    
    if (document.getElementById("mostraCodici").checked) {
        // Modalità semplificata
        contenuto += "Articoli:\n";
        const articoli = document.querySelectorAll(".articolo");
        articoli.forEach(articolo => {
            const codice = articolo.querySelector(".codice") ? articolo.querySelector(".codice").value : "";
            const descrizione = articolo.querySelector(".descrizione") ? articolo.querySelector(".descrizione").value : "";
            const quantita = articolo.querySelector(".quantita") ? articolo.querySelector(".quantita").value : "";
            contenuto += `Codice: ${codice}\n`;
            contenuto += `  Descrizione: ${descrizione}\n`;
            contenuto += `  Quantità: ${quantita}\n\n`;
        });
        if (document.getElementById("mostraTrasporto").checked) {
            contenuto += "Trasporto: " + (parseFloat(document.getElementById("costoTrasporto").value) || 0).toFixed(2) + "€\n";
            contenuto += "Installazione: " + (parseFloat(document.getElementById("costoInstallazione").value) || 0).toFixed(2) + "€\n";
        }
        contenuto += document.getElementById("totaleFinale").textContent + "\n";
        contenuto += "Prezzi sono al netto di IVA del 22%.\n";
    } else {
        // Modalità dettagliata: elenca ciascun articolo con tutti i dati
        contenuto += "Articoli:\n";
        const articoli = document.querySelectorAll(".articolo");
        articoli.forEach(articolo => {
            const codice = articolo.querySelector(".codice") ? articolo.querySelector(".codice").value : "";
            const descrizione = articolo.querySelector(".descrizione") ? articolo.querySelector(".descrizione").value : "";
            const prezzoLordo = articolo.querySelector(".prezzoLordo") ? articolo.querySelector(".prezzoLordo").value : "";
            const sconto = articolo.querySelector(".sconto") ? articolo.querySelector(".sconto").value : "";
            const prezzoNetto = articolo.querySelector(".prezzoNetto") ? articolo.querySelector(".prezzoNetto").value : "";
            const quantita = articolo.querySelector(".quantita") ? articolo.querySelector(".quantita").value : "";
            const prezzoTotale = articolo.querySelector(".prezzoTotale") ? articolo.querySelector(".prezzoTotale").value : "";
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
        
        if (
            !document.getElementById("mostraPrezzi").checked &&
            !document.getElementById("mostraMarginalita").checked &&
            !document.getElementById("mostraTrasporto").checked
        ) {
            // Nessun flag selezionato: visualizza prima il margine, poi Totale Articoli, Nuovo Totale Articoli, Trasporto, Installazione e Totale Finale
            contenuto += "Margine: " + (document.getElementById("margine").value || "0") + "%\n";
            contenuto += document.getElementById("totaleArticoli").textContent + "\n";
            contenuto += document.getElementById("totaleMarginalita").textContent + "\n";
            contenuto += "Trasporto: " + (parseFloat(document.getElementById("costoTrasporto").value) || 0).toFixed(2) + "€\n";
            contenuto += "Installazione: " + (parseFloat(document.getElementById("costoInstallazione").value) || 0).toFixed(2) + "€\n";
            contenuto += document.getElementById("totaleFinale").textContent + "\n";
        } else {
            // Se almeno un flag è selezionato, mantiene il comportamento precedente
            contenuto += document.getElementById("totaleArticoli").textContent + "\n";
            if(document.getElementById("mostraMarginalita").checked) {
                contenuto += document.getElementById("totaleMarginalita").textContent + "\n";
            }
            if(document.getElementById("mostraTrasporto").checked) {
                contenuto += "Trasporto: " + (parseFloat(document.getElementById("costoTrasporto").value) || 0).toFixed(2) + "€\n";
                contenuto += "Installazione: " + (parseFloat(document.getElementById("costoInstallazione").value) || 0).toFixed(2) + "€\n";
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
