document.addEventListener("DOMContentLoaded", function () {
    caricaDatiSalvati();
});

function aggiungiArticolo() {
    const container = document.getElementById("articoli-container");
    const idUnico = Date.now();

    const div = document.createElement("div");
    div.classList.add("articolo");
    div.innerHTML = `
        <details id="articolo-${idUnico}">
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

function aggiornaTitolo(input, id) {
    const summary = document.querySelector(`#articolo-${id} summary`);
    summary.textContent = input.value || "Nuovo Articolo";
}

function salvaArticolo(id) {
    document.getElementById(`articolo-${id}`).open = false;
    salvaDati();
}

function rimuoviArticolo(btn) {
    btn.parentElement.parentElement.remove();
    salvaDati();
}

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

function aggiornaTotaleGenerale() {
    let totaleGenerale = 0;
    document.querySelectorAll(".prezzoTotale").forEach(input => {
        totaleGenerale += parseFloat(input.value) || 0;
    });

    document.getElementById("totaleArticoli").textContent = `Totale Articoli: ${totaleGenerale.toFixed(2)}€`;
    calcolaMarginalita();
}

function calcolaMarginalita() {
    const totaleArticoli = parseFloat(document.getElementById("totaleArticoli").textContent.replace(/[^0-9.,]/g, "")) || 0;
    const margine = parseFloat(document.getElementById("margine").value) || 0;
    
    if (margine > 0) {
        const nuovoTotale = totaleArticoli / (1 - margine / 100);
        document.getElementById("totaleMarginalita").textContent = `Nuovo Totale Articoli: ${nuovoTotale.toFixed(2)}€`;
    } else {
        document.getElementById("totaleMarginalita").textContent = "Nuovo Totale Articoli: 0,00€";
    }
    calcolaTotaleFinale();
}

function calcolaTotaleFinale() {
    const nuovoTotale = parseFloat(document.getElementById("totaleMarginalita").textContent.replace(/[^0-9.,]/g, "")) || 0;
    const costoTrasporto = parseFloat(document.getElementById("costoTrasporto").value) || 0;
    const costoInstallazione = parseFloat(document.getElementById("costoInstallazione").value) || 0;

    const totaleFinale = nuovoTotale + costoTrasporto + costoInstallazione;
    document.getElementById("totaleFinale").textContent = `Totale Finale: ${totaleFinale.toFixed(2)}€`;
}

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

    aggiornaTotaleGenerale();
}

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
            aggiornaTitolo(lastRow.querySelector(".codice"), lastRow.id.split('-')[1]);
        });
    }

    aggiornaTotaleGenerale();
}
