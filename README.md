# FastSale - Gestione Preventivi

**FastSale - Gestione Preventivi** è una Progressive Web App (PWA) pensata per la gestione e la generazione di preventivi per le aziende.  
L'applicazione permette di:

- Inserire i dati del cliente.
- Aggiungere articoli con codice, descrizione, prezzi, sconti e quantità.
- Calcolare automaticamente i totali e applicare una percentuale di margine.
- Inserire costi aggiuntivi (trasporto e installazione) e ottenere il Totale Finale.
- Personalizzare l'output per la stampa o per l'invio via WhatsApp, scegliendo quali informazioni includere tramite opzioni (checkbox).
- Salvare, richiamare e modificare preventivi salvati nel browser.

---

## Caratteristiche

- **Gestione Dati Cliente:**  
  Inserisci nome aziendale, città, indirizzo, telefono ed email.

- **Gestione Dinamica degli Articoli:**  
  Aggiungi articoli specificando:
  - Codice e descrizione.
  - Prezzo lordo, sconto (con calcolo automatico di Prezzo Netto e Prezzo Totale).
  - Quantità.

- **Calcolo dei Totali:**  
  - **Totale Articoli:** Somma dei prezzi totali degli articoli.
  - **Nuovo Totale Articoli:** Totale aggiornato applicando il margine percentuale.
  - **Costi Aggiuntivi:** Trasporto e Installazione.
  - **Totale Finale:** Somma del Nuovo Totale Articoli, trasporto e installazione.

- **Opzioni di Stampa Personalizzabili:**  
  Utilizza le checkbox per decidere quali dettagli includere nell'output:
  - *Mostra Codici Articolo*: Se attivo, viene utilizzata una modalità semplificata.
  - *Mostra Prezzi Netti*, *Mostra Marginalità*, *Trasporto e Installazione Inclusi*: Permettono ulteriori personalizzazioni.
  
  **Modalità Dettagliata (nessun flag selezionato):**  
  L'output visualizzerà, nell'ordine:
  1. **Margine:** Il valore inserito (es. "Margine: 10%").
  2. **Totale Articoli.**
  3. **Nuovo Totale Articoli.**
  4. **Trasporto.**
  5. **Installazione.**
  6. **Totale Finale.**
  7. **Modalità di Pagamento.**

- **Generazione e Condivisione del Preventivo:**  
  - **PDF Simulato:** Scarica il preventivo come file di testo.
  - **Invio via WhatsApp:** Condividi il preventivo direttamente su WhatsApp.

- **Salvataggio e Richiamo dei Preventivi:**  
  I preventivi vengono salvati nel browser (utilizzando il localStorage) e possono essere richiamati e modificati in un secondo momento.

---

## Come Funziona

1. **Inserimento Dati:**  
   Compila il form con i dati del cliente e aggiungi gli articoli tramite il pulsante "Aggiungi Articolo".

2. **Calcolo Automatico:**  
   I campi *Prezzo Netto* e *Prezzo Totale* vengono aggiornati in tempo reale. Inserendo il margine, il Nuovo Totale Articoli e il Totale Finale vengono aggiornati automaticamente.

3. **Output Personalizzato:**  
   Seleziona le checkbox per decidere quali informazioni includere nell'output.  
   - Se **nessun flag** viene selezionato, l'output dettagliato mostra prima il margine (es. "Margine: 10%"), poi il Totale Articoli, il Nuovo Totale Articoli, i costi di Trasporto e Installazione, ed infine il Totale Finale, seguito dalla Modalità di Pagamento.
   - Se vengono selezionati flag, l'output varia in base alle opzioni scelte.

4. **Generazione e Condivisione:**  
   - Clicca su **Genera PDF** per scaricare il preventivo come file di testo.
   - Oppure clicca su **Invia su WhatsApp** per condividere il preventivo tramite WhatsApp.

5. **Salvataggio/Richiamo:**  
   - Salva i preventivi per poterli richiamare e modificare in seguito.
   - Usa il menu a tendina per selezionare un preventivo salvato e modificarlo.

---

## Installazione

1. **Scarica il Progetto:**  
   Clona il repository o scarica il file ZIP:

   ```bash
   git clone https://github.com/tuo-username/FastSale.git

2.	Apri l’Applicazione:
   
Apri il file index.html in un browser moderno.
Per sfruttare appieno le funzionalità PWA, utilizza un server locale (ad esempio, Live Server per VSCode).

3.	Installa come PWA (Opzionale):
   
Su dispositivi compatibili, potrai installare l’applicazione sulla home screen per un’esperienza offline.

Utilizzo

	1.	Inserisci i Dati del Cliente:
Compila il form con le informazioni richieste.

	2.	Aggiungi Articoli:
Clicca su “Aggiungi Articolo” per inserire i dettagli di ciascun articolo.

	3.	Configura l’Output:
Seleziona le checkbox per personalizzare i dettagli da includere nel preventivo.

	4.	Visualizza i Totali:
I totali vengono calcolati automaticamente in base ai dati inseriti.

	5.	Genera Preventivo:
 
•	Clicca su Genera PDF per scaricare il file di testo del preventivo.
 
•	Oppure clicca su Invia su WhatsApp per condividere il preventivo.
 
	6.	Salva e Richiama Preventivi:
 
•	Utilizza il pulsante Salva Preventivo per salvare il preventivo nel browser.
•	Usa il menu a tendina per richiamare e modificare i preventivi salvati.

Struttura dei File

	•	index.html: Interfaccia utente principale.
	•	app.js: Logica JavaScript per la gestione dei dati, il calcolo dei totali, il salvataggio e la generazione dell’output.
	•	style.css: (se presente) File CSS per lo stile dell’applicazione.
	•	manifest.json: (se presente) File di configurazione per la PWA.

Contributi

I contributi sono i benvenuti! Se desideri migliorare l’applicazione, per favore forka il repository e invia una pull request.

Licenza

Questo progetto è distribuito sotto la Licenza MIT.

Contatti

Per domande o suggerimenti, contattami via email: pezzalialessandro@gmail.com
GitHub: pezzaliapp

---
