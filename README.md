# FastSalePlus - Gestione Preventivi e Integrazioni PWA

**FastSalePlus** è una Progressive Web App (PWA) progettata per semplificare la gestione dei preventivi, offrendo un’interfaccia intuitiva e funzionalità avanzate per la creazione, il calcolo e la condivisione dei preventivi in formato it-IT.

## Caratteristiche Principali

- **Gestione dei Dati Cliente:**  
  Inserisci facilmente nome azienda, città, indirizzo, telefono ed email.

- **Gestione degli Articoli:**  
  Aggiungi e modifica articoli specificando:
  - Codice e descrizione
  - Prezzo lordo, sconto e prezzo netto (calcolato automaticamente oppure inserito manualmente)
  - Quantità  
  I calcoli (totali, margine, costi aggiuntivi) vengono effettuati in tempo reale, interpretando correttamente i numeri in formato italiano (es. "4.000,57").

- **Calcolo Automatico dei Totali:**  
  Il sistema esegue:
  - La somma dei prezzi totali degli articoli
  - L’applicazione del margine desiderato
  - L’aggiunta dei costi di trasporto e installazione

- **Output Personalizzato:**  
  Genera preventivi in formato testo (PDF simulato) o inviali direttamente via WhatsApp.  
  Scegli la modalità semplificata (mostra solo codici, descrizioni e quantità) oppure quella dettagliata (con tutti i valori).

- **Integrazione Dinamica:**  
  - **EasyPrice:** Invia dinamicamente il Totale Finale a [EasyPrice](https://pezzaliapp.github.io/EasyPrice/) (il coltellino svizzero del venditore) per ulteriori calcoli, come la simulazione di noleggio e il calcolo dei costi.
  - **FlexRentCalc:** Apri direttamente [FlexRentCalc](https://pezzaliapp.github.io/FlexRentCalc/) per configurare e calcolare in modo flessibile la rata mensile, le spese contrattuali e altri parametri relativi al noleggio, con la possibilità di inviare il report via WhatsApp.

## Ecosistema pezzaliAPP

FastSalePlus è parte di un ecosistema di soluzioni PWA sviluppate da **pezzaliAPP**. Oltre a FastSalePlus, puoi esplorare:

- **EasyPrice:**  
  [https://pezzaliapp.github.io/EasyPrice/](https://pezzaliapp.github.io/EasyPrice/)  
  Un'applicazione web che offre un calcolatore prezzi e simulatore di noleggio. Calcola il prezzo netto, compensi, costi di trasporto e installazione e genera report PDF condivisibili via WhatsApp.

- **FlexRentCalc:**  
  [https://pezzaliapp.github.io/FlexRentCalc/](https://pezzaliapp.github.io/FlexRentCalc/)  
  Un’app dedicata al calcolo flessibile della rata mensile, delle spese di contratto e dei costi giornalieri/orari, con invio diretto dei risultati tramite WhatsApp.

Altre app complementari (per fatturazione, CRM, monitoraggio inventario o dashboard di vendita) potranno essere integrate per offrire una suite completa di strumenti per la gestione commerciale.

## Installazione e Utilizzo

1. **Clona la Repository:**

   ```bash
   git clone https://github.com/pezzaliapp/FastSalePlus.git

2.	Apri l’app nel Browser:
Puoi aprire direttamente il file index.html oppure utilizzare un server locale (ad es. Live Server) per una migliore esperienza.
3.	Inserisci i Dati e Genera il Preventivo:
	
 •	Compila i dati del cliente e aggiungi gli articoli, inserendo i numeri nel formato italiano (es. “4.000,57”).
	
 •	Il sistema calcola automaticamente i totali, applica il margine e somma i costi aggiuntivi (trasporto e installazione).
•	Scegli le opzioni di output per generare il preventivo in modalità semplificata o dettagliata.
	
 •	Usa i pulsanti per generare il file di testo (PDF simulato) o inviare il preventivo via WhatsApp.
4.	Collegamenti Dinamici:
	
 •	Usa il pulsante per inviare il Totale Finale a EasyPrice (viene passato come parametro nella query string).
	
 •	Usa il pulsante dedicato per aprire FlexRentCalc.

Contributi

I contributi sono benvenuti! Se desideri migliorare FastSalePlus o aggiungere nuove funzionalità, sentiti libero di forkarla e inviare una pull request.

Licenza

Questo progetto è distribuito sotto la Licenza MIT.

Contatti

Per domande o suggerimenti, contattami via email: pezzalialessandro@gmail.com
GitHub: pezzaliapp
