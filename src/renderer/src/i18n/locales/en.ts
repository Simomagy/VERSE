const en = {
  // ── Common ────────────────────────────────────────────────────────────────
  'common.cancel': 'CANCEL',
  'common.save': 'SAVE',
  'common.saving': 'SAVING...',
  'common.update': 'UPDATE',
  'common.confirm': 'CONFIRM',
  'common.close': 'CLOSE',
  'common.remove': 'Remove',
  'common.notes': 'NOTES',
  'common.optional': 'Optional...',
  'common.none': '—',
  'common.undone': 'This cannot be undone.',

  // ── Onboarding ────────────────────────────────────────────────────────────
  'onboarding.subtitle': 'UEX Corp Companion — First Launch',

  'onboarding.language.header': 'SELECT LANGUAGE',
  'onboarding.language.hint': 'Choose the display language for VERSE.',
  'onboarding.language.label': 'DISPLAY LANGUAGE',
  'onboarding.language.continue': 'CONTINUE',

  'onboarding.token.header': 'API AUTHENTICATION REQUIRED',
  'onboarding.token.description': 'UEX Corp Bearer Token',
  'onboarding.token.body':
    'VERSE requires a UEX Corp Application Token to access market data, refinery methods, commodity prices and station information.',
  'onboarding.token.link': 'Get your token at uexcorp.space/api/my-apps',
  'onboarding.token.label': 'APPLICATION TOKEN',
  'onboarding.token.placeholder': 'Paste your Bearer token here...',
  'onboarding.token.skip': 'SKIP FOR NOW',
  'onboarding.token.connect': 'CONNECT',
  'onboarding.token.saving': 'SAVING...',
  'onboarding.token.footer':
    'Token is encrypted and stored locally. You can update it anytime in Settings.',
  'onboarding.token.error': 'Failed to save token. Please try again.',

  // ── Settings ──────────────────────────────────────────────────────────────
  'settings.title': 'System Config',

  'settings.auth.header': 'API AUTHENTICATION',
  'settings.auth.tokensFrom': 'Tokens from',
  'settings.auth.appToken.label': 'Application Token',
  'settings.auth.appToken.description': 'Market prices, routes, public data',
  'settings.auth.appToken.active': 'ACTIVE',
  'settings.auth.appToken.notSet': 'NOT SET',
  'settings.auth.appToken.placeholder': 'Enter application token...',
  'settings.auth.save': 'SAVE',
  'settings.auth.toast.saving': 'Saving application token...',
  'settings.auth.toast.success': 'Application token saved',
  'settings.auth.toast.error': 'Failed to save application token',

  'settings.hotkey.header': 'GLOBAL HOTKEY',
  'settings.hotkey.description': 'Keyboard shortcut to show/hide VERSE',
  'settings.hotkey.placeholder': 'e.g. CommandOrControl+Shift+V',
  'settings.hotkey.current': 'Current:',
  'settings.hotkey.modifiers': 'Modifiers: CommandOrControl, Alt, Shift, Ctrl, Command (Mac)',
  'settings.hotkey.update': 'UPDATE',
  'settings.hotkey.toast.saving': 'Registering hotkey...',
  'settings.hotkey.toast.success': 'Hotkey updated',
  'settings.hotkey.toast.error': 'Failed to register hotkey — may be in use',

  'settings.preferences.header': 'PREFERENCES',
  'settings.preferences.language.label': 'Language',
  'settings.preferences.language.description': 'Display language for the interface',
  'settings.preferences.minimizeToTray.label': 'Minimize to Tray',
  'settings.preferences.minimizeToTray.description':
    'Keep running in system tray when window is closed',
  'settings.preferences.notifications.label': 'Notifications',
  'settings.preferences.notifications.description':
    'Desktop notifications for important events',

  'settings.devTools.header': '⚡ DEV TOOLS',
  'settings.devTools.description': 'Only visible in development mode',
  'settings.devTools.previewOnboarding': 'Preview Onboarding',

  'settings.about.author': 'Built with ♥ by Prysma Studio',
  'settings.about.version': 'Version {{version}}',

  // ── Trades ────────────────────────────────────────────────────────────────
  'trades.title': 'Trade Log',
  'trades.runsLogged': '{{count}} RUNS LOGGED',
  'trades.logRun': 'LOG TRADE RUN',
  'trades.noTrades': 'NO TRADES LOGGED',
  'trades.noTradesFilter': 'NO TRADES WITH THIS FILTER',

  'trades.filter.all': 'ALL',
  'trades.filter.buy': 'BUY',
  'trades.filter.sell': 'SELL',

  'trades.col.route': 'ROUTE / COMMODITIES',
  'trades.col.buy': 'BUY',
  'trades.col.sell': 'SELL',
  'trades.col.profit': 'PROFIT',

  'trades.stats.revenue': 'REVENUE',
  'trades.stats.costs': 'COSTS',
  'trades.stats.netProfit': 'NET PROFIT',
  'trades.stats.volume': 'VOLUME',

  'trades.modal.titleLog': 'LOG TRADE RUN',
  'trades.modal.titleEdit': 'EDIT TRADE RUN',
  'trades.modal.from': 'FROM',
  'trades.modal.to': 'TO',
  'trades.modal.vessel': 'VESSEL',
  'trades.modal.vesselNone': '— None / Unspecified —',
  'trades.modal.commodities': 'COMMODITIES',
  'trades.modal.clickToToggle': 'Click OP to toggle BUY/SELL',
  'trades.modal.totalBuy': 'TOTAL BUY',
  'trades.modal.totalSell': 'TOTAL SELL',
  'trades.modal.netProfit': 'NET PROFIT',
  'trades.modal.cancel': 'CANCEL',
  'trades.modal.saving': 'SAVING...',
  'trades.modal.updateRun': 'UPDATE RUN',
  'trades.modal.logRun': 'LOG TRADE RUN',

  'trades.items.op': 'OP',
  'trades.items.commodity': 'COMMODITY',
  'trades.items.scu': 'SCU',
  'trades.items.pricePerScu': 'PRICE/SCU',
  'trades.items.total': 'TOTAL',
  'trades.items.addCommodity': 'ADD COMMODITY',
  'trades.items.autoFilledUex': 'Auto-filled from UEX prices',
  'trades.items.switchToAuto': 'Switch to auto',
  'trades.items.enterManually': 'Enter manually',

  'trades.summary.title': 'SUMMARY',
  'trades.summary.tradeRecap': 'TRADE RECAP',
  'trades.summary.fillCommodities': 'Fill in commodities to see the recap',
  'trades.summary.net': 'net',
  'trades.summary.estimated': 'estimated',
  'trades.summary.cost': 'cost',
  'trades.summary.buy': 'BUY',
  'trades.summary.sell': 'SELL',
  'trades.summary.net2': 'NET',

  'trades.menu.edit': 'Edit Trade Run',
  'trades.menu.createSell': 'Create Sell Run',
  'trades.menu.remove': 'Remove',

  'trades.confirm.deleteTitle': 'Delete Trades',
  'trades.confirm.deleteMessage':
    'Delete {{count}} trade run{{s}}? This cannot be undone.',
  'trades.confirm.removeTitle': 'Remove Trade',
  'trades.confirm.removeMessage': 'Remove trade run "{{from}}{{to}}"?',

  'trades.bulk.delete': 'DELETE {{count}} RUN{{s}}',
  'trades.row.createSell': 'SELL',
  'trades.row.pricesRefresh': 'PRICES',
  'trades.row.refreshIn': '{{s}}s',

  // ── Refineries ────────────────────────────────────────────────────────────
  'refineries.title': 'Refinery Log',
  'refineries.jobsLogged': '{{count}} JOBS LOGGED',
  'refineries.logJob': 'LOG JOB',
  'refineries.noJobs': 'NO REFINERY JOBS LOGGED',
  'refineries.noJobsHint': 'Log your first job to track yields and profits',

  'refineries.col.locationMethod': 'LOCATION · METHOD · MINERALS',
  'refineries.col.metrics': 'SCU · VALUE · PROFIT · TIMER',

  'refineries.stats.estValue': 'EST. VALUE',
  'refineries.stats.refineCost': 'REFINE COST',
  'refineries.stats.netProfit': 'NET PROFIT',
  'refineries.stats.scuProcessed': 'SCU PROCESSED',

  'refineries.modal.titleLog': 'LOG REFINERY JOB',
  'refineries.modal.titleEdit': 'EDIT REFINERY JOB',
  'refineries.modal.refinery': 'REFINERY LOCATION',
  'refineries.modal.method': 'REFINING METHOD',
  'refineries.modal.methodNone': '— Select Method —',
  'refineries.modal.minerals': 'MINERALS',
  'refineries.modal.yieldHint': 'Yield: A=auto (UEX) · M=manual',
  'refineries.modal.estValue': 'EST. VALUE',
  'refineries.modal.refineCost': 'REFINE COST',
  'refineries.modal.netProfit': 'NET PROFIT',
  'refineries.modal.duration': 'REFINE DURATION',
  'refineries.modal.cost': 'REFINING COST (aUEC)',
  'refineries.modal.cancel': 'CANCEL',
  'refineries.modal.logJob': 'LOG JOB',
  'refineries.modal.saveJob': 'SAVE JOB',
  'refineries.modal.logging': 'LOGGING...',
  'refineries.modal.saving': 'SAVING...',

  'refineries.minerals.mineral': 'MINERAL',
  'refineries.minerals.scuIn': 'cSCU IN',
  'refineries.minerals.yield': 'YIELD %',
  'refineries.minerals.scuOut': 'cSCU OUT',
  'refineries.minerals.pricePerScu': 'PRICE/SCU',
  'refineries.minerals.addMineral': 'ADD MINERAL',
  'refineries.minerals.yieldManualTitle': 'Manual mode — click to switch back to auto (UEX)',
  'refineries.minerals.yieldAutoTitle': 'Auto mode (UEX) — click to enter manually',

  'refineries.row.done': 'DONE',
  'refineries.row.scu': 'SCU',
  'refineries.row.estValue': 'EST. VALUE',
  'refineries.row.profit': 'PROFIT',
  'refineries.row.sell': 'SELL',

  'refineries.menu.edit': 'Edit Job',
  'refineries.menu.createSell': 'Create Sell Trade',
  'refineries.menu.remove': 'Remove',

  'refineries.confirm.removeTitle': 'Remove Job',
  'refineries.confirm.removeMessage':
    'Remove refinery job at "{{refinery}}"? This cannot be undone.',

  'refineries.bulk.sell': 'SELL {{count}} JOB{{s}}',

  // ── Wallet ────────────────────────────────────────────────────────────────
  'wallet.title': 'Wallet',
  'wallet.entriesLogged': '{{count}} ENTRIES LOGGED',
  'wallet.addEntry': 'ADD ENTRY',
  'wallet.noEntries': 'NO ENTRIES LOGGED',
  'wallet.noEntriesFilter': 'NO ENTRIES WITH THIS FILTER',
  'wallet.noEntriesHint': 'Use ADD ENTRY to record income, expenses or balance snapshots',

  'wallet.stats.totalIncome': 'TOTAL INCOME',
  'wallet.stats.totalExpenses': 'TOTAL EXPENSES',
  'wallet.stats.balance': 'CURRENT BALANCE',

  'wallet.filter.all': 'ALL',
  'wallet.filter.income': 'INCOME',
  'wallet.filter.expense': 'EXPENSE',
  'wallet.filter.adjustment': 'ADJUSTMENT',
  'wallet.filter.trade': 'TRADE',

  'wallet.col.description': 'DESCRIPTION / CATEGORY',
  'wallet.col.source': 'SOURCE',
  'wallet.col.when': 'WHEN',
  'wallet.col.amount': 'AMOUNT',

  'wallet.type.income': 'INCOME',
  'wallet.type.expense': 'EXPENSE',
  'wallet.type.adjustment': 'ADJUSTMENT',
  'wallet.type.adjustmentReset': ' (balance reset)',
  'wallet.type.trade': 'TRADE',

  'wallet.form.amount': 'AMOUNT (aUEC)',
  'wallet.form.category': 'CATEGORY',
  'wallet.form.description': 'DESCRIPTION',
  'wallet.form.descriptionPlaceholder': 'e.g. Laranite run Shubin → TDD...',
  'wallet.form.cancel': 'CANCEL',
  'wallet.form.confirm': 'CONFIRM',
  'wallet.form.saving': 'SAVING...',

  'wallet.category.trading': 'Trading',
  'wallet.category.mining': 'Mining',
  'wallet.category.refinery': 'Refinery',
  'wallet.category.bounty': 'Bounty',
  'wallet.category.salvage': 'Salvage',
  'wallet.category.mission': 'Mission',
  'wallet.category.other': 'Other',

  'wallet.menu.edit': 'Edit Entry',
  'wallet.menu.remove': 'Remove',

  'wallet.confirm.deleteTitle': 'Delete Entries',
  'wallet.confirm.deleteMessage':
    'Delete {{count}} wallet entr{{y}}? This cannot be undone.',
  'wallet.confirm.removeTitle': 'Remove Entry',
  'wallet.confirm.removeMessage': 'Remove "{{description}}" ({{amount}})?',

  'wallet.bulk.delete': 'DELETE {{count}} ENTR{{y}}',
  'wallet.row.trade': 'TRADE',
  'wallet.row.managedByTrades': 'Managed automatically by trades',
  'wallet.row.cancel': 'CANCEL',
  'wallet.row.confirm': 'CONFIRM',
  'wallet.row.saving': 'SAVING...',

  // ── Equipment ─────────────────────────────────────────────────────────────
  'equipment.title': 'Equipment Database',
  'equipment.loading': 'LOADING...',
  'equipment.noItems': 'NO ITEMS FOUND',
  'equipment.noItemsSearch': 'No results for "{{search}}"',
  'equipment.itemCount': '{{count}} items',
  'equipment.clearImageCache': 'Clear image cache',
  'equipment.thanks': 'Thanks to {{name}} for the idea ♥',

  'equipment.filter.brand': 'BRAND',
  'equipment.filter.slot': 'SLOT',
  'equipment.filter.type': 'TYPE',
  'equipment.filter.size': 'SIZE',

  'equipment.detail.title': 'ITEM DETAIL',
  'equipment.detail.description': 'DESCRIPTION',
  'equipment.detail.whereToBuy': 'WHERE TO BUY',
  'equipment.detail.noShops': 'No known shops for this item',
  'equipment.detail.col.terminal': 'TERMINAL',
  'equipment.detail.col.buy': 'BUY',
  'equipment.detail.col.system': 'SYSTEM',
  'equipment.detail.size': 'SIZE',
  'equipment.detail.mfr': 'MFR',
  'equipment.detail.version': 'VERSION',
  'equipment.detail.close': 'CLOSE',

  'equipment.pagination.prev': 'PREV',
  'equipment.pagination.next': 'NEXT',

  // ── Fleet ─────────────────────────────────────────────────────────────────
  'fleet.title': 'Fleet Registry',
  'fleet.vesselsRegistered': '{{count}} {{vessel}} REGISTERED',
  'fleet.vessel': 'VESSEL',
  'fleet.vessels': 'VESSELS',
  'fleet.addVessel': 'ADD VESSEL',
  'fleet.noVessels': 'NO VESSELS REGISTERED',
  'fleet.dbAvailable': '{{count}} VESSELS AVAILABLE IN DATABASE',
  'fleet.dbLoading': 'Loading database...',
  'fleet.totalScu': '· {{scu}} SCU TOTAL',

  'fleet.modal.title': 'ADD VESSEL',
  'fleet.modal.searchPlaceholder': 'Name, manufacturer, role...',
  'fleet.modal.noResults': 'NO VESSELS FOUND',
  'fleet.modal.nicknameLabel': 'CALLSIGN / NICKNAME',
  'fleet.modal.nicknameHint': 'Leave empty to use official name',
  'fleet.modal.back': 'BACK',
  'fleet.modal.register': 'REGISTER VESSEL',
  'fleet.modal.registering': 'REGISTERING...',

  'fleet.confirm.removeTitle': 'Remove Ship',
  'fleet.confirm.removeMessage': 'Remove "{{name}}" from your fleet?',

  // ── Commodities ───────────────────────────────────────────────────────────
  'commodities.title': 'Commodities',
  'commodities.searchPlaceholder': 'Search commodities...',
  'commodities.refresh': 'Refresh',
  'commodities.noResults': 'No commodities match your search',
  'commodities.selectHint': 'Select a commodity to see terminal prices',
  'commodities.selectHintSub': 'Click any row in the market list',

  'commodities.col.code': 'CODE',
  'commodities.col.name': 'NAME',
  'commodities.col.sell': 'SELL',
  'commodities.col.buy': 'BUY',

  'commodities.detail.terminals': '{{count}} TERMINALS',
  'commodities.detail.tab.sell': 'SELL',
  'commodities.detail.tab.buy': 'BUY',
  'commodities.detail.col.terminal': 'TERMINAL',
  'commodities.detail.col.system': 'SYSTEM',
  'commodities.detail.col.planet': 'PLANET',
  'commodities.detail.col.inventory': 'INVENTORY',
  'commodities.detail.col.price': 'PRICE',
  'commodities.detail.col.updated': 'UPDATED',
  'commodities.detail.noTerminals': 'No terminals available for this operation',

  // ── Home / Dashboard ──────────────────────────────────────────────────────
  'home.title': 'DASHBOARD',

  'home.fleet.title': 'FLEET',
  'home.fleet.emptyTitle': 'No vessels registered',
  'home.fleet.empty': 'Register your first ship to start tracking your fleet.',
  'home.fleet.vessels': 'VESSELS',
  'home.fleet.viewAll': 'VIEW ALL',
  'home.fleet.more': 'more',

  'home.trades.title': 'RECENT TRADES',
  'home.trades.emptyTitle': 'No trades logged',
  'home.trades.empty': 'Start logging trade runs to track your profits.',
  'home.trades.totalProfit': 'LAST 5 PROFIT',
  'home.trades.logTrade': 'LOG TRADE',

  'home.refinery.title': 'ACTIVE JOBS',
  'home.refinery.emptyTitle': 'No active jobs',
  'home.refinery.empty': 'No refinery jobs in progress. Log a job to start tracking.',
  'home.refinery.ready': 'READY',
  'home.refinery.logJob': 'LOG JOB',
  'home.refinery.noTimer': 'No timer set',

  'home.wallet.title': 'WALLET',
  'home.wallet.emptyTitle': 'Wallet is empty',
  'home.wallet.empty': 'Start tracking your aUEC balance and income.',
  'home.wallet.balance': 'BALANCE',
  'home.wallet.weeklyIncome': 'INCOME 7D',
  'home.wallet.weeklyExpense': 'EXPENSE 7D',
  'home.wallet.trend': 'TREND',
  'home.wallet.addEntry': 'ADD ENTRY',

  'home.commodities.title': 'TOP OPPORTUNITIES',
  'home.commodities.emptyTitle': 'No price data',
  'home.commodities.empty': 'Connect your UEX token and load commodity prices to see trading opportunities.',
  'home.commodities.margin': 'MARGIN',
  'home.commodities.buy': 'BUY',
  'home.commodities.sell': 'SELL',
  'home.commodities.refresh': 'REFRESH',

  'home.stats.title': 'QUICK STATS',
  'home.stats.weeklyProfit': 'WEEKLY PROFIT',
  'home.stats.walletTrend': 'WALLET TREND',
  'home.stats.avgProfit': 'AVG / TRADE',
  'home.stats.noData': 'Log trades and wallet entries to see stats.',
  'home.stats.noDataTitle': 'No data yet',

  // ── Home header ───────────────────────────────────────────────────────────
  'home.subtitle': 'VERSE COMPANION',

  // ── Home quick-action modal ───────────────────────────────────────────────
  'home.modal.section.fleet': 'Fleet',
  'home.modal.section.trades': 'Trades',
  'home.modal.section.refinery': 'Refinery',
  'home.modal.section.wallet': 'Wallet',
  'home.modal.openTitle': 'Open {{section}}?',
  'home.modal.openBody': 'Navigate to the {{section}} section to log this action.',
  'home.modal.cancel': 'CANCEL',
  'home.modal.goTo': 'GO TO {{section}}',

  // ── Commodities widget column headers ─────────────────────────────────────
  'home.commodities.col.code': 'CODE',
  'home.commodities.col.commodity': 'COMMODITY',

  // ── Trades widget column headers ──────────────────────────────────────────
  'home.trades.col.route': 'ROUTE · COMMODITY',
  'home.trades.col.profit': 'PROFIT',
  'home.trades.col.when': 'WHEN'
} as const

export type TranslationKey = keyof typeof en

export default en
