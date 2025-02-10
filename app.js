// Caricamento dei dati salvati al caricamento della pagina
document.addEventListener("DOMContentLoaded", function() {
    caricaDatiSalvati();
});

// Funzione per aggiungere un articolo
function aggiungiArticolo() {
    const container = document.getElementById("articoli-container");

    const div = document.createElement("div");
    div.classList.add("articolo");

    div.innerHTML = `
        <label>Codice: <input type="text" class="codice"></label>
        <label>Descrizione: <input type="text" class="descrizione"></label>
        <label>Prezzo Lordo (€): <input type="number" class="prezzoLordo" step="0.01" oninput="calcolaPrezzo(this)"></label>
        <label>Sconto (%): <input type="number" class="sconto" step="0.01" oninput="calcolaPrezzo(this)"></label>
        <label>Prezzo Netto (€): <input type="text" class="prezzoNetto" readonly></label>
        <label>Quantità: <input type="number" class="quantita" step="1" oninput="calcolaPrezzo(this)"></label>
        <label>Prezzo Totale (€): <input type="text" class="prezzoTotale" readonly></label>
        <button onclick="rimuoviArticolo(this)">Rimuovi</button>
    `;

    container.appendChild(div);
}

// Funzione per rimuovere un articolo
function rimuoviArticolo(btn) {
    btn.parentElement.remove();
}

// Funzione per calcolare prezzo netto e totale
function calcolaPrezzo(input) {
    const row = input.parentElement.parentElement;
    const prezzoLordo = parseFloat(row.querySelector(".prezzoLordo").value) || 0;
    const sconto = parseFloat(row.querySelector(".sconto").value) || 0;
    const quantita = parseInt(row.querySelector(".quantita").value) || 1;

    const prezzoNetto = prezzoLordo * (1 - sconto / 100);
    const prezzoTotale = prezzoNetto * quantita;

    row.querySelector(".prezzoNetto").value = prezzoNetto.toFixed(2);
    row.querySelector(".prezzoTotale").value = prezzoTotale.toFixed(2);
}

// Funzione per salvare i dati nel localStorage
function salvaDati() {
    const cliente = {
        nomeAzienda: document.getElementById("nomeAzienda").value,
        citta: document.getElementById("citta").value,
        indirizzo: document.getElementById("indirizzo").value,
        telefono: document.getElementById("telefono").value,
        email: document.getElementById("email").value,
    };

    const articoli = [];
    document.querySelectorAll(".articolo").forEach(articolo => {
        articoli.push({
            codice: articolo.querySelector(".codice").value,
            descrizione: articolo.querySelector(".descrizione").value,
            prezzoLordo: articolo.querySelector(".prezzoLordo").value,
            sconto: articolo.querySelector(".sconto").value,
            prezzoNetto: articolo.querySelector(".prezzoNetto").value,
            quantita: articolo.querySelector(".quantita").value,
            prezzoTotale: articolo.querySelector(".prezzoTotale").value
        });
    });

    const marginalita = {
        mc: document.getElementById("margine").value,
        trasporto: document.getElementById("trasporto").value,
        costoTrasporto: document.getElementById("costoTrasporto").value,
        installazione: document.getElementById("installazione").value,
        costoInstallazione: document.getElementById("costoInstallazione").value
    };

    localStorage.setItem("cliente", JSON.stringify(cliente));
    localStorage.setItem("articoli", JSON.stringify(articoli));
    localStorage.setItem("marginalita", JSON.stringify(marginalita));

    alert("Dati salvati con successo!");
}

// Funzione per caricare i dati salvati
function caricaDatiSalvati() {
    const cliente = JSON.parse(localStorage.getItem("cliente"));
    if (cliente) {
        document.getElementById("nomeAzienda").value = cliente.nomeAzienda;
        document.getElementById("citta").value = cliente.citta;
        document.getElementById("indirizzo").value = cliente.indirizzo;
        document.getElementById("telefono").value = cliente.telefono;
        document.getElementById("email").value = cliente.email;
    }

    const articoli = JSON.parse(localStorage.getItem("articoli"));
    if (articoli) {
        articoli.forEach(articolo => {
            aggiungiArticolo();
            const rows = document.querySelectorAll(".articolo");
            const lastRow = rows[rows.length - 1];
            lastRow.querySelector(".codice").value = articolo.codice;
            lastRow.querySelector(".descrizione").value = articolo.descrizione;
            lastRow.querySelector(".prezzoLordo").value = articolo.prezzoLordo;
            lastRow.querySelector(".sconto").value = articolo.sconto;
            lastRow.querySelector(".prezzoNetto").value = articolo.prezzoNetto;
            lastRow.querySelector(".quantita").value = articolo.quantita;
            lastRow.querySelector(".prezzoTotale").value = articolo.prezzoTotale;
        });
    }

    const marginalita = JSON.parse(localStorage.getItem("marginalita"));
    if (marginalita) {
        document.getElementById("margine").value = marginalita.mc;
        document.getElementById("trasporto").value = marginalita.trasporto;
        document.getElementById("costoTrasporto").value = marginalita.costoTrasporto;
        document.getElementById("installazione").value = marginalita.installazione;
        document.getElementById("costoInstallazione").value = marginalita.costoInstallazione;
    }
}

// Funzione per generare il PDF (da completare)
function generaPDF() {
    alert("Funzione per la generazione PDF in sviluppo...");
}

// Funzione per inviare dati su WhatsApp (da completare)
function inviaWhatsApp() {
    alert("Funzione per l'invio su WhatsApp in sviluppo...");
}
