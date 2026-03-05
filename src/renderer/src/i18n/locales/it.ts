const it = {
	// ── Common ────────────────────────────────────────────────────────────────
	'common.cancel': 'ANNULLA',
	'common.save': 'SALVA',
	'common.saving': 'SALVATAGGIO...',
	'common.update': 'AGGIORNA',
	'common.confirm': 'CONFERMA',
	'common.close': 'CHIUDI',
	'common.remove': 'Rimuovi',
	'common.notes': 'NOTE',
	'common.optional': 'Opzionale...',
	'common.none': '—',
	'common.undone': 'Questa azione non può essere annullata.',

	// ── Onboarding ────────────────────────────────────────────────────────────
	'onboarding.subtitle': 'UEX Corp Companion — Primo Avvio',

	'onboarding.language.header': 'SELEZIONA LINGUA',
	'onboarding.language.hint': 'Scegli la lingua di visualizzazione per V.E.R.S.E.',
	'onboarding.language.label': 'LINGUA DI VISUALIZZAZIONE',
	'onboarding.language.continue': 'CONTINUA',

	'onboarding.token.header': 'AUTENTICAZIONE API RICHIESTA',
	'onboarding.token.description': 'Token Bearer UEX Corp',
	'onboarding.token.body':
	  'V.E.R.S.E. richiede un Application Token di UEX Corp per accedere ai dati di mercato, metodi di raffinazione, prezzi delle merci e informazioni sulle stazioni.',
	'onboarding.token.link': 'Ottieni il tuo token su uexcorp.space/api/my-apps',
	'onboarding.token.label': 'APPLICATION TOKEN',
	'onboarding.token.placeholder': 'Incolla qui il tuo token Bearer...',
	'onboarding.token.skip': 'SALTA PER ORA',
	'onboarding.token.connect': 'CONNETTI',
	'onboarding.token.saving': 'SALVATAGGIO...',
	'onboarding.token.footer':
	  'Il token è crittografato e salvato localmente. Puoi aggiornarlo in qualsiasi momento nelle Impostazioni.',
	'onboarding.token.error': 'Impossibile salvare il token. Riprova.',

	// ── Settings ──────────────────────────────────────────────────────────────
	'settings.title': 'Configurazione di Sistema',

	'settings.auth.header': 'AUTENTICAZIONE API',
	'settings.auth.tokensFrom': 'Token forniti da',
	'settings.auth.appToken.label': 'Application Token',
	'settings.auth.appToken.description': 'Prezzi di mercato, rotte, dati pubblici',
	'settings.auth.appToken.active': 'ATTIVO',
	'settings.auth.appToken.notSet': 'NON IMPOSTATO',
	'settings.auth.appToken.placeholder': 'Inserisci l\'application token...',
	'settings.auth.save': 'SALVA',
	'settings.auth.toast.saving': 'Salvataggio application token...',
	'settings.auth.toast.success': 'Application token salvato',
	'settings.auth.toast.error': 'Impossibile salvare l\'application token',

	'settings.hotkey.header': 'SCORCIATOIA GLOBALE',
	'settings.hotkey.description': 'Scorciatoia da tastiera per mostrare/nascondere V.E.R.S.E.',
	'settings.hotkey.placeholder': 'es. CommandOrControl+Shift+V',
	'settings.hotkey.current': 'Attuale:',
	'settings.hotkey.modifiers': 'Modificatori: CommandOrControl, Alt, Shift, Ctrl, Command (Mac)',
	'settings.hotkey.update': 'AGGIORNA',
	'settings.hotkey.toast.saving': 'Registrazione scorciatoia...',
	'settings.hotkey.toast.success': 'Scorciatoia aggiornata',
	'settings.hotkey.toast.error': 'Impossibile registrare la scorciatoia — potrebbe essere già in uso',

	'settings.preferences.header': 'PREFERENZE',
	'settings.preferences.language.label': 'Lingua',
	'settings.preferences.language.description': 'Lingua di visualizzazione dell\'interfaccia',
	'settings.preferences.language.credits': 'Crediti di traduzione',
	'settings.preferences.language.creditsBy': 'di',
	'settings.preferences.minimizeToTray.label': 'Riduci nella Tray',
	'settings.preferences.minimizeToTray.description':
	  'Mantieni l\'app in esecuzione nella barra delle applicazioni alla chiusura',
	'settings.preferences.notifications.label': 'Notifiche',
	'settings.preferences.notifications.description':
	  'Notifiche desktop per eventi importanti',

	'settings.devTools.header': '⚡ STRUMENTI SVILUPPATORE',
	'settings.devTools.description': 'Visibili solo in modalità sviluppo',
	'settings.devTools.previewOnboarding': 'Anteprima Onboarding',

	'settings.about.author': 'Creato con ♥ da Prysma Studio',
	'settings.about.version': 'Versione {{version}}',

	// ── Trades ────────────────────────────────────────────────────────────────
	'trades.title': 'Registro Commerciale',
	'trades.runsLogged': '{{count}} TRATTE REGISTRATE',
	'trades.logRun': 'REGISTRA TRATTA',
	'trades.noTrades': 'NESSUNA TRATTA REGISTRATA',
	'trades.noTradesFilter': 'NESSUNA TRATTA CON QUESTO FILTRO',

	'trades.filter.all': 'TUTTE',
	'trades.filter.buy': 'ACQUISTO',
	'trades.filter.sell': 'VENDITA',

	'trades.col.route': 'ROTTA / MERCI',
	'trades.col.buy': 'ACQUISTO',
	'trades.col.sell': 'VENDITA',
	'trades.col.profit': 'PROFITTO',

	'trades.stats.revenue': 'ENTRATE',
	'trades.stats.costs': 'COSTI',
	'trades.stats.netProfit': 'PROFITTO NETTO',
	'trades.stats.volume': 'VOLUME',

	'trades.modal.titleLog': 'REGISTRA TRATTA COMMERCIALE',
	'trades.modal.titleEdit': 'MODIFICA TRATTA COMMERCIALE',
	'trades.modal.from': 'DA',
	'trades.modal.to': 'A',
	'trades.modal.vessel': 'NAVE',
	'trades.modal.vesselNone': '— Nessuna / Non specificata —',
	'trades.modal.commodities': 'MERCI',
	'trades.modal.clickToToggle': 'Clicca OP per alternare ACQUISTO/VENDITA',
	'trades.modal.totalBuy': 'TOTALE ACQUISTO',
	'trades.modal.totalSell': 'TOTALE VENDITA',
	'trades.modal.netProfit': 'PROFITTO NETTO',
	'trades.modal.cancel': 'ANNULLA',
	'trades.modal.saving': 'SALVATAGGIO...',
	'trades.modal.updateRun': 'AGGIORNA TRATTA',
	'trades.modal.logRun': 'REGISTRA TRATTA',

	'trades.items.op': 'OP',
	'trades.items.commodity': 'MERCE',
	'trades.items.scu': 'SCU',
	'trades.items.pricePerScu': 'PREZZO/SCU',
	'trades.items.total': 'TOTALE',
	'trades.items.addCommodity': 'AGGIUNGI MERCE',
	'trades.items.autoFilledUex': 'Compilato automaticamente dai prezzi UEX',
	'trades.items.switchToAuto': 'Passa ad automatico',
	'trades.items.enterManually': 'Inserisci manualmente',

	'trades.summary.title': 'RIEPILOGO',
	'trades.summary.tradeRecap': 'RECAPITOLO TRATTA',
	'trades.summary.fillCommodities': 'Compila le merci per vedere il riepilogo',
	'trades.summary.net': 'netto',
	'trades.summary.estimated': 'stimato',
	'trades.summary.cost': 'costo',
	'trades.summary.buy': 'ACQUISTA',
	'trades.summary.sell': 'VENDI',
	'trades.summary.net2': 'NETTO',

	'trades.menu.edit': 'Modifica Tratta',
	'trades.menu.createSell': 'Crea Tratta di Vendita',
	'trades.menu.remove': 'Rimuovi',

	'trades.confirm.deleteTitle': 'Elimina Tratte',
	'trades.confirm.deleteMessage':
	  'Eliminare {{count}} tratt{{s}} commercial{{s}}? Questa azione non può essere annullata.',
	'trades.confirm.removeTitle': 'Rimuovi Tratta',
	'trades.confirm.removeMessage': 'Rimuovere la tratta commerciale "{{from}}{{to}}"?',

	'trades.bulk.delete': 'ELIMINA {{count}} TRATT{{s}}',
	'trades.row.createSell': 'VENDI',
	'trades.row.pricesRefresh': 'PREZZI',
	'trades.row.refreshIn': '{{s}}s',

	// ── Refineries ────────────────────────────────────────────────────────────
	'refineries.title': 'Registro Raffineria',
	'refineries.jobsLogged': '{{count}} LAVORI REGISTRATI',
	'refineries.logJob': 'REGISTRA LAVORO',
	'refineries.noJobs': 'NESSUN LAVORO DI RAFFINAZIONE REGISTRATO',
	'refineries.noJobsHint': 'Registra il tuo primo lavoro per tracciare rese e profitti',

	'refineries.col.locationMethod': 'LUOGO · METODO · MINERALI',
	'refineries.col.metrics': 'SCU · VALORE · PROFITTO · TIMER',

	'refineries.stats.estValue': 'VALORE STIM.',
	'refineries.stats.refineCost': 'COSTO RAFF.',
	'refineries.stats.netProfit': 'PROFITTO NETTO',
	'refineries.stats.scuProcessed': 'SCU PROCESSATI',

	'refineries.modal.titleLog': 'REGISTRA LAVORO RAFFINERIA',
	'refineries.modal.titleEdit': 'MODIFICA LAVORO RAFFINERIA',
	'refineries.modal.refinery': 'LUOGO RAFFINERIA',
	'refineries.modal.method': 'METODO DI RAFFINAZIONE',
	'refineries.modal.methodNone': '— Seleziona Metodo —',
	'refineries.modal.minerals': 'MINERALI',
	'refineries.modal.yieldHint': 'Resa: A=auto (UEX) · M=manuale',
	'refineries.modal.estValue': 'VALORE STIM.',
	'refineries.modal.refineCost': 'COSTO RAFF.',
	'refineries.modal.netProfit': 'PROFITTO NETTO',
	'refineries.modal.duration': 'DURATA RAFFINAZIONE',
	'refineries.modal.cost': 'COSTO RAFFINAZIONE (aUEC)',
	'refineries.modal.cancel': 'ANNULLA',
	'refineries.modal.logJob': 'REGISTRA LAVORO',
	'refineries.modal.saveJob': 'SALVA LAVORO',
	'refineries.modal.logging': 'REGISTRAZIONE...',
	'refineries.modal.saving': 'SALVATAGGIO...',

	'refineries.minerals.mineral': 'MINERALE',
	'refineries.minerals.scuIn': 'cSCU INGRESSO',
	'refineries.minerals.yield': 'RESA %',
	'refineries.minerals.scuOut': 'cSCU USCITA',
	'refineries.minerals.pricePerScu': 'PREZZO/SCU',
	'refineries.minerals.addMineral': 'AGGIUNGI MINERALE',
	'refineries.minerals.yieldManualTitle': 'Modalità manuale — clicca per tornare ad auto (UEX)',
	'refineries.minerals.yieldAutoTitle': 'Modalità auto (UEX) — clicca per inserire manualmente',

	'refineries.row.done': 'COMPLETATO',
	'refineries.row.scu': 'SCU',
	'refineries.row.estValue': 'VALORE STIM.',
	'refineries.row.profit': 'PROFITTO',
	'refineries.row.sell': 'VENDI',

	'refineries.menu.edit': 'Modifica Lavoro',
	'refineries.menu.createSell': 'Crea Vendita',
	'refineries.menu.remove': 'Rimuovi',

	'refineries.confirm.removeTitle': 'Rimuovi Lavoro',
	'refineries.confirm.removeMessage':
	  'Rimuovere il lavoro di raffinazione presso "{{refinery}}"? Questa azione non può essere annullata.',

	'refineries.bulk.sell': 'VENDI {{count}} LAVOR{{s}}',

	// ── Wallet ────────────────────────────────────────────────────────────────
	'wallet.title': 'Portafoglio',
	'wallet.entriesLogged': '{{count}} TRANSAZIONI REGISTRATE',
	'wallet.addEntry': 'AGGIUNGI TRANSAZIONE',
	'wallet.noEntries': 'NESSUNA TRANSAZIONE REGISTRATA',
	'wallet.noEntriesFilter': 'NESSUNA TRANSAZIONE CON QUESTO FILTRO',
	'wallet.noEntriesHint': 'Usa AGGIUNGI TRANSAZIONE per registrare entrate, uscite o istantanee del saldo',

	'wallet.stats.totalIncome': 'ENTRATE TOTALI',
	'wallet.stats.totalExpenses': 'USCITE TOTALI',
	'wallet.stats.balance': 'SALDO ATTUALE',

	'wallet.filter.all': 'TUTTE',
	'wallet.filter.income': 'ENTRATE',
	'wallet.filter.expense': 'USCITE',
	'wallet.filter.adjustment': 'RETTIFICA',
	'wallet.filter.trade': 'COMMERCIO',

	'wallet.col.description': 'DESCRIZIONE / CATEGORIA',
	'wallet.col.source': 'FONTE',
	'wallet.col.when': 'QUANDO',
	'wallet.col.amount': 'IMPORTO',

	'wallet.type.income': 'ENTRATA',
	'wallet.type.expense': 'USCITA',
	'wallet.type.adjustment': 'RETTIFICA',
	'wallet.type.adjustmentReset': ' (ripristino saldo)',
	'wallet.type.trade': 'COMMERCIO',

	'wallet.form.amount': 'IMPORTO (aUEC)',
	'wallet.form.category': 'CATEGORIA',
	'wallet.form.description': 'DESCRIZIONE',
	'wallet.form.descriptionPlaceholder': 'es. Viaggio di Laranite Shubin → TDD...',
	'wallet.form.cancel': 'ANNULLA',
	'wallet.form.confirm': 'CONFERMA',
	'wallet.form.saving': 'SALVATAGGIO...',

	'wallet.category.trading': 'Commercio',
	'wallet.category.mining': 'Estrazione',
	'wallet.category.refinery': 'Raffineria',
	'wallet.category.bounty': 'Taglie',
	'wallet.category.salvage': 'Recupero',
	'wallet.category.mission': 'Missione',
	'wallet.category.other': 'Altro',

	'wallet.menu.edit': 'Modifica Transazione',
	'wallet.menu.remove': 'Rimuovi',

	'wallet.confirm.deleteTitle': 'Elimina Transazioni',
	'wallet.confirm.deleteMessage':
	  'Eliminare {{count}} transazion{{y}} del portafoglio? Questa azione non può essere annullata.',
	'wallet.confirm.removeTitle': 'Rimuovi Transazione',
	'wallet.confirm.removeMessage': 'Rimuovere "{{description}}" ({{amount}})?',

	'wallet.bulk.delete': 'ELIMINA {{count}} TRANSAZION{{y}}',
	'wallet.row.trade': 'COMMERCIO',
	'wallet.row.managedByTrades': 'Gestito automaticamente dalle tratte commerciali',
	'wallet.row.cancel': 'ANNULLA',
	'wallet.row.confirm': 'CONFERMA',
	'wallet.row.saving': 'SALVATAGGIO...',

	// ── Equipment ─────────────────────────────────────────────────────────────
	'equipment.title': 'Database Equipaggiamento',
	'equipment.loading': 'CARICAMENTO...',
	'equipment.noItems': 'NESSUN OGGETTO TROVATO',
	'equipment.noItemsSearch': 'Nessun risultato per "{{search}}"',
	'equipment.itemCount': '{{count}} oggetti',
	'equipment.clearImageCache': 'Svuota cache immagini',
	'equipment.thanks': 'Grazie a {{name}} per l\'idea ♥',

	'equipment.filter.brand': 'MARCA',
	'equipment.filter.slot': 'SLOT',
	'equipment.filter.type': 'TIPO',
	'equipment.filter.size': 'TAGLIA',
	'equipment.filter.grade': 'CLASSE',
	'equipment.filter.available': 'DISPON.',

	'equipment.detail.title': 'DETTAGLIO OGGETTO',
	'equipment.detail.description': 'DESCRIZIONE',
	'equipment.detail.whereToBuy': 'DOVE ACQUISTARE',
	'equipment.detail.noShops': 'Nessun negozio noto per questo oggetto',
	'equipment.detail.col.terminal': 'TERMINALE',
	'equipment.detail.col.buy': 'ACQUISTO',
	'equipment.detail.col.system': 'SISTEMA',
	'equipment.detail.size': 'TAGLIA',
	'equipment.detail.mfr': 'PROD',
	'equipment.detail.version': 'VERSIONE',
	'equipment.detail.close': 'CHIUDI',

	'equipment.pagination.prev': 'PREC',
	'equipment.pagination.next': 'SUCC',

	// ── Fleet ─────────────────────────────────────────────────────────────────
	'fleet.title': 'Registro Flotta',
	'fleet.vesselsRegistered': '{{count}} {{vessel}} REGISTRATI',
	'fleet.vessel': 'NAVE',
	'fleet.vessels': 'NAVI',
	'fleet.addVessel': 'AGGIUNGI NAVE',
	'fleet.noVessels': 'NESSUNA NAVE REGISTRATA',
	'fleet.dbAvailable': '{{count}} NAVI DISPONIBILI NEL DATABASE',
	'fleet.dbLoading': 'Caricamento database...',
	'fleet.totalScu': '· {{scu}} SCU TOTALI',

	'fleet.modal.title': 'AGGIUNGI NAVE',
	'fleet.modal.searchPlaceholder': 'Nome, produttore, ruolo...',
	'fleet.modal.noResults': 'NESSUNA NAVE TROVATA',
	'fleet.modal.nicknameLabel': 'CALLSIGN / SOPRANNOME',
	'fleet.modal.nicknameHint': 'Lascia vuoto per usare il nome ufficiale',
	'fleet.modal.back': 'INDIETRO',
	'fleet.modal.register': 'REGISTRA NAVE',
	'fleet.modal.registering': 'REGISTRAZIONE...',

	'fleet.confirm.removeTitle': 'Rimuovi Nave',
	'fleet.confirm.removeMessage': 'Rimuovere "{{name}}" dalla tua flotta?',

	// ── Commodities ───────────────────────────────────────────────────────────
	'commodities.title': 'Merci',
	'commodities.searchPlaceholder': 'Cerca merci...',
	'commodities.refresh': 'Aggiorna',
	'commodities.noResults': 'Nessuna merce corrisponde alla tua ricerca',
	'commodities.selectHint': 'Seleziona una merce per vedere i prezzi ai terminali',
	'commodities.selectHintSub': 'Clicca su qualsiasi riga nella lista di mercato',

	'commodities.col.code': 'CODICE',
	'commodities.col.name': 'NOME',
	'commodities.col.sell': 'VENDITA',
	'commodities.col.buy': 'ACQUISTO',
	'commodities.col.spread': 'SPREAD',
	'commodities.filter.all': 'TUTTI',
	'commodities.card.bestSell': 'MIGLIOR VENDITA',
	'commodities.card.bestBuy': 'MIGLIOR ACQUISTO',
	'commodities.card.margin': 'MARGINE',

	'commodities.detail.terminals': '{{count}} TERMINALI',
	'commodities.detail.tab.sell': 'VENDITA',
	'commodities.detail.tab.buy': 'ACQUISTO',
	'commodities.detail.col.terminal': 'TERMINALE',
	'commodities.detail.col.system': 'SISTEMA',
	'commodities.detail.col.planet': 'PIANETA',
	'commodities.detail.col.inventory': 'INVENTARIO',
	'commodities.detail.col.price': 'PREZZO',
	'commodities.detail.col.updated': 'AGGIORNATO',
	'commodities.detail.noTerminals': 'Nessun terminale disponibile per questa operazione',

	// ── Home / Dashboard ──────────────────────────────────────────────────────
	'home.title': 'DASHBOARD',

	'home.fleet.title': 'FLOTTA',
	'home.fleet.emptyTitle': 'Nessuna nave registrata',
	'home.fleet.empty': 'Registra la tua prima nave per iniziare a tracciare la tua flotta.',
	'home.fleet.vessels': 'NAVI',
	'home.fleet.viewAll': 'VEDI TUTTE',
	'home.fleet.more': 'altro',

	'home.trades.title': 'TRATTE RECENTI',
	'home.trades.emptyTitle': 'Nessuna tratta registrata',
	'home.trades.empty': 'Inizia a registrare i viaggi commerciali per tracciare i tuoi profitti.',
	'home.trades.totalProfit': 'PROFITTO ULTIME 5',
	'home.trades.logTrade': 'REGISTRA TRATTA',

	'home.refinery.title': 'LAVORI ATTIVI',
	'home.refinery.emptyTitle': 'Nessun lavoro attivo',
	'home.refinery.empty': 'Nessun lavoro di raffinazione in corso. Registra un lavoro per iniziare a tracciarlo.',
	'home.refinery.ready': 'PRONTO',
	'home.refinery.logJob': 'REGISTRA LAVORO',
	'home.refinery.noTimer': 'Nessun timer impostato',

	'home.wallet.title': 'PORTAFOGLIO',
	'home.wallet.emptyTitle': 'Il portafoglio è vuoto',
	'home.wallet.empty': 'Inizia a tracciare il tuo saldo aUEC e le tue entrate.',
	'home.wallet.balance': 'SALDO',
	'home.wallet.weeklyIncome': 'ENTRATE 7G',
	'home.wallet.weeklyExpense': 'USCITE 7G',
	'home.wallet.trend': 'ANDAMENTO',
	'home.wallet.addEntry': 'AGGIUNGI',

	'home.commodities.title': 'MIGLIORI OPPORTUNITÀ',
	'home.commodities.emptyTitle': 'Nessun dato sui prezzi',
	'home.commodities.empty': 'Connetti il tuo token UEX e carica i prezzi delle merci per vedere le opportunità commerciali.',
	'home.commodities.margin': 'MARGINE',
	'home.commodities.buy': 'ACQUISTO',
	'home.commodities.sell': 'VENDITA',
	'home.commodities.refresh': 'AGGIORNA',

	'home.stats.title': 'STATISTICHE RAPIDE',
	'home.stats.weeklyProfit': 'PROFITTO SETTIMANALE',
	'home.stats.walletTrend': 'ANDAMENTO PORTAFOGLIO',
	'home.stats.avgProfit': 'MEDIA / TRATTA',
	'home.stats.noData': 'Registra tratte e transazioni per vedere le statistiche.',
	'home.stats.noDataTitle': 'Ancora nessun dato',

	// ── Home header ───────────────────────────────────────────────────────────
	'home.subtitle': 'VERSE COMPANION',

	// ── Home quick-action modal ───────────────────────────────────────────────
	'home.modal.section.fleet': 'Flotta',
	'home.modal.section.trades': 'Commercio',
	'home.modal.section.refinery': 'Raffineria',
	'home.modal.section.wallet': 'Portafoglio',
	'home.modal.openTitle': 'Aprire {{section}}?',
	'home.modal.openBody': 'Naviga verso la sezione {{section}} per registrare questa azione.',
	'home.modal.cancel': 'ANNULLA',
	'home.modal.goTo': 'VAI A {{section}}',

	// ── Commodities widget column headers ─────────────────────────────────────
	'home.commodities.col.code': 'CODICE',
	'home.commodities.col.commodity': 'MERCE',

	// ── Trades widget column headers ──────────────────────────────────────────
	'home.trades.col.route': 'ROTTA · MERCE',
	'home.trades.col.profit': 'PROFITTO',
	'home.trades.col.when': 'QUANDO'
  } as const

  export type TranslationKey = keyof typeof it

  export default it
