document.addEventListener("DOMContentLoaded", function () {
    caricaDatiSalvati();
});

// Funzione per aggiungere un articolo
function aggiungiArticolo() {
    const container = document.getElementById("articoli-container");

    const div = document.createElement("div");
    div.classList.add("articolo");

    const idUnico = Date.now(); // Identificativo univoco per il menu a tendina

    div.innerHTML = `
        <details id="articolo-${idUnico}">
            <summary>Nuovo Articolo</summary>
            <label>Codice: <input type="text" class="codice"></label>
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

// Funzione per salvare un articolo e chiuderlo nel menu a tendina
function salvaArticolo(id) {
    document.getElementById(`articolo-${id}`).open = false;
    salvaDati();
}

// Funzione per rimuovere un articolo
function rimuoviArticolo(btn) {
    btn.parentElement.parentElement.remove();
    salvaDati();
}

// Funzione per calcolare prezzo netto e totale
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

// Funzione per aggiornare il totale generale di tutti gli articoli
function aggiornaTotaleGenerale() {
    let totaleGenerale = 0;
    document.querySelectorAll(".prezzoTotale").forEach(input => {
        totaleGenerale += parseFloat(input.value) || 0;
    });

    document.getElementById("totaleArticoli").textContent = `Totale Articoli: ${totaleGenerale.toFixed(2)}€`;
}

// Funzione per salvare i dati nel localStorage
function salvaDati() {
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

    localStorage.setItem("articoli", JSON.stringify(articoli));
    aggiornaTotaleGenerale();
}

// Funzione per caricare i dati salvati
function caricaDatiSalvati() {
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

    aggiornaTotaleGenerale();
}
