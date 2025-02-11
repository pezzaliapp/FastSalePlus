document.addEventListener("DOMContentLoaded", function () {
    caricaPreventiviSalvati();
    aggiornaTotaleGenerale();
});

// Funzione per caricare i preventivi salvati (richiama l'aggiornamento della lista)
function caricaPreventiviSalvati() {
    aggiornaListaPreventivi();
}

// Funzione per aggiungere un articolo
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
            <label>Prezzo Netto (€): <input type="text" class="prezzoNetto" readonly></label>
            <label>Quantità: <input type="number" class="quantita" step="1" oninput="calcolaPrezzo(this)"></label>
            <label>Prezzo Totale (€): <input type="text" class="prezzoTotale" readonly></label>
            <button onclick="salvaArticolo(${idUnico})">Salva</button>
            <button onclick="rimuoviArticolo(this)">Rimuovi</button>
        </details>
    `;

    container.appendChild(div);
}

// Aggiorna il nome dell'articolo nel menu a tendina
function aggiornaTitolo(input, id) {
    const summary = document.querySelector(`#articolo-${id} summary`);
    summary.textContent = input.value || "Nuovo Articolo";
}

// Salva un articolo (chiude il dettaglio)
function salvaArticolo(id) {
    document.getElementById(`articolo-${id}`).open = false;
}

// Rimuove un articolo e aggiorna il totale
function rimuoviArticolo(btn) {
    btn.parentElement.parentElement.remove();
    aggiornaTotaleGenerale();
}

// Calcola il prezzo netto e totale per l'articolo modificato
function calcolaPrezzo(input) {
    const row = input.closest(".articolo");
    const prezzoLordo = parseFloat(row.querySelector(".prezzoLordo").value) || 0;
    const sconto = parseFloat(row.querySelector(".sconto").value) || 0;
    const quantita = parseInt(row.querySelector(".quantita").value) || 1;

    const prezzoNetto = prezzoLordo * (1 - sconto / 100);
    const prezzoTotale = prezzoNetto * quantita;

    row.querySelector(".prezzoNetto").value = prezzoNetto.toFixed(2);
    row.querySelector(".prezzoTotale").value = prezzoTotale.toFixed(2);
    
    aggiornaTotaleGenerale();
}

// Aggiorna il totale degli articoli presenti
function aggiornaTotaleGenerale() {
    let totaleGenerale = 0;
    document.querySelectorAll(".prezzoTotale").forEach(input => {
        totaleGenerale += parseFloat(input.value) || 0;
    });

    document.getElementById("totaleArticoli").textContent = `Totale Articoli: ${totaleGenerale.toFixed(2)}€`;
    calcolaMarginalita();
}

// Calcola il totale considerando la marginalità inserita
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

// Calcola il totale finale aggiungendo trasporto e installazione
function calcolaTotaleFinale() {
    const totaleMarginalitaText = document.getElementById("totaleMarginalita").textContent;
    const nuovoTotale = parseFloat(totaleMarginalitaText.replace(/[^0-9.,]/g, "").replace(',', '.')) || 0;
    const costoTrasporto = parseFloat(document.getElementById("costoTrasporto").value) || 0;
    const costoInstallazione = parseFloat(document.getElementById("costoInstallazione").value) || 0;

    const totaleFinale = nuovoTotale + costoTrasporto + costoInstallazione;
    document.getElementById("totaleFinale").textContent = `Totale Finale: ${totaleFinale.toFixed(2)}€`;
}

// Funzione per generare il contenuto completo del preventivo
function generaContenuto() {
    let contenuto = "";
    
    // Aggiunge la data corrente (formattata come gg/mm/aaaa)
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

    // Se il flag "Mostra Codici Articolo" è selezionato, utilizza il formato semplificato:
    if (document.getElementById("mostraCodici").checked) {
        contenuto += "Articoli:\n";
        const articoli = document.querySelectorAll(".articolo");
        articoli.forEach(articolo => {
            const codice = articolo.querySelector(".codice") ? articolo.querySelector(".codice").value : "";
            const descrizione = articolo.querySelector(".descrizione") ? articolo.querySelector(".descrizione").value : "";
            const quantita = articolo.querySelector(".quantita") ? articolo.querySelector(".quantita").value : "";
            // NON viene più visualizzato "Articolo X:"; invece viene sempre visualizzato il codice
            contenuto += `Codice: ${codice}\n`;
            contenuto += `  Descrizione: ${descrizione}\n`;
            contenuto += `  Quantità: ${quantita}\n\n`;
        });
        // Totale e nota IVA
        contenuto += document.getElementById("totaleFinale").textContent + "\n";
        contenuto += "Prezzi sono al netto di IVA del 22%.\n";
    } else {
        // Versione dettagliata
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

            // Invece di "Articolo X:" viene stampato il codice dell'articolo
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

        // Totali
        contenuto += document.getElementById("totaleArticoli").textContent + "\n";
        if (document.getElementById("mostraMarginalita").checked) {
            contenuto += document.getElementById("totaleMarginalita").textContent + "\n";
        }
        if (document.getElementById("mostraTrasporto").checked) {
            contenuto += document.getElementById("totaleFinale").textContent + "\n";
        }

        // Modalità di Pagamento
        contenuto += "\nModalità di Pagamento: " + document.getElementById("modalitaPagamento").value + "\n";
    }
    
    return contenuto;
}

// Funzione per generare il PDF (in questo caso un file di testo)
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

// Funzione per inviare il preventivo via WhatsApp
function inviaWhatsApp() {
    const testo = generaContenuto();
    const encodedText = encodeURIComponent(testo);
    const whatsappUrl = `https://wa.me/?text=${encodedText}`;

    window.open(whatsappUrl, "_blank");
}

// Funzione per salvare un preventivo nel localStorage
function salvaPreventivo() {
    let preventivi = JSON.parse(localStorage.getItem("preventivi")) || [];
    const nomePreventivo = prompt("Inserisci il nome del preventivo:");
    if (!nomePreventivo) return;

    const preventivo = {
        nome: nomePreventivo,
        dati: generaContenuto()
    };

    preventivi.push(preventivo);
    localStorage.setItem("preventivi", JSON.stringify(preventivi));
    aggiornaListaPreventivi();
}

// Funzione per richiamare un preventivo salvato
function richiamaPreventivo() {
    const select = document.getElementById("listaPreventivi");
    const index = select.value;
    if (index === "") return;

    let preventivi = JSON.parse(localStorage.getItem("preventivi")) || [];
    alert("Contenuto del preventivo:\n\n" + preventivi[index].dati);
}

// Funzione per eliminare i preventivi selezionati
function eliminaPreventiviSelezionati() {
    const select = document.getElementById("listaPreventivi");
    let preventivi = JSON.parse(localStorage.getItem("preventivi")) || [];

    const selezionati = Array.from(select.selectedOptions).map(option => parseInt(option.value));
    preventivi = preventivi.filter((_, index) => !selezionati.includes(index));

    localStorage.setItem("preventivi", JSON.stringify(preventivi));
    aggiornaListaPreventivi();
}

// Funzione per aggiornare la lista dei preventivi salvati
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
