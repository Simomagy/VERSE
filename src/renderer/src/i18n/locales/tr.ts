const tr = {
  // ── Common ────────────────────────────────────────────────────────────────
  'common.cancel': 'İPTAL',
  'common.save': 'KAYDET',
  'common.saving': 'KAYDEDİLİYOR...',
  'common.update': 'GÜNCELLE',
  'common.confirm': 'ONAYLA',
  'common.close': 'KAPALI',
  'common.remove': 'Kaldır',
  'common.notes': 'NOTLAR',
  'common.optional': 'İsteğe Bağlı...',
  'common.none': '—',
  'common.undone': 'Bu geri alınamaz.',

  // ── Onboarding ────────────────────────────────────────────────────────────
  'onboarding.subtitle': 'UEX Corp Companion — İlk Lansman',

  'onboarding.language.header': 'DİL SEÇ',
  'onboarding.language.hint': 'VERSE için görüntüleme dilini seçin.',
  'onboarding.language.label': 'GÖRÜNTÜ DİLİ',
  'onboarding.language.continue': 'DEVAM ET',

  'onboarding.token.header': 'API kimlik doğrulaması gereklidir',
  'onboarding.token.description': 'UEX Corp Bearer Token',
  'onboarding.token.body':
    'VERSE, piyasa verilerine, rafineri yöntemlerine, emtia fiyatlarına ve istasyon bilgilerine erişmek için bir UEX Corp Uygulama Tokeni gerektirir.',
  'onboarding.token.link': 'Tokeninizi uexcorp.space/api/my-apps adresinden alın.',
  'onboarding.token.label': 'UYGULAMA TOKENİ',
  'onboarding.token.placeholder': 'Bearer Tokeni buraya yapıştırın...',
  'onboarding.token.skip': 'ŞİMDİLİK ATLA',
  'onboarding.token.connect': 'BAĞLAN',
  'onboarding.token.saving': 'KAYDEDİLİYOR...',
  'onboarding.token.footer':
    'Token şifrelenir ve yerel olarak saklanır. Ayarlar bölümünden istediğiniz zaman güncelleyebilirsiniz.',
  'onboarding.token.error': 'Jeton kaydedilemedi. Lütfen tekrar deneyin.',

  // ── Settings ──────────────────────────────────────────────────────────────
  'settings.title': 'Sistem Yapılandırması',

  'settings.auth.header': 'API KIMLIK DOĞRULAMASI',
  'settings.auth.tokensFrom': 'Tokenler',
  'settings.auth.appToken.label': 'Uygulama Tokeni',
  'settings.auth.appToken.description': 'Piyasa fiyatları, güzergahlar, kamuya açık veriler',
  'settings.auth.appToken.active': 'AKTİF',
  'settings.auth.appToken.notSet': 'AYARLANMAMIŞ',
  'settings.auth.appToken.placeholder': 'Uygulama Tokenini Girin...',
  'settings.auth.save': 'KAYDET',
  'settings.auth.toast.saving': 'Uygulama Tokeni Kaydediliyor...',
  'settings.auth.toast.success': 'Uygulama Tokeni Kaydedildi',
  'settings.auth.toast.error': 'Uygulama Tokeni Kaydedilemedi',

  'settings.hotkey.header': 'KÜRESEL KISAYOL TUŞU',
  'settings.hotkey.description': 'VERSE gizlemek, göstermek için kısayol tuşu',
  'settings.hotkey.placeholder': 'Örnek: CommandEr Control+Shift+V',
  'settings.hotkey.current': 'Akım:',
  'settings.hotkey.modifiers': 'Değiştirici Tuşlar: CommandOrControl, Alt, Shift, Ctrl, Command (Mac)',
  'settings.hotkey.update': 'GÜNCELLE',
  'settings.hotkey.toast.saving': 'Kısayol tuşu kaydediliyor...',
  'settings.hotkey.toast.success': 'Kısayol tuşu güncellendi',
  'settings.hotkey.toast.error': 'Kısayol tuşu kaydedilemedi — kullanımda olabilir',

  'settings.preferences.header': 'TERCİHLER',
  'settings.preferences.language.label': 'Dil',
  'settings.preferences.language.description': 'Arayüz için görüntüleme dili',
  'settings.preferences.language.credits': 'Çeviri kredileri',
  'settings.preferences.language.creditsBy': 'tarafından',
  'settings.preferences.minimizeToTray.label': 'Tepsiye Küçült',
  'settings.preferences.minimizeToTray.description':
    'Pencere kapatıldığında sistem tepsisinde çalışmaya devam et',
  'settings.preferences.notifications.label': 'Bildirimler',
  'settings.preferences.notifications.description':
    'Önemli olaylar için masaüstü bildirimleri',

  'settings.devTools.header': '⚡ GELİŞTİRİCİ ARAÇLARI',
  'settings.devTools.description': 'Yalnızca geliştirme modunda görünür',
  'settings.devTools.previewOnboarding': 'Karşılama Ekranını Önizle',

  'settings.about.author': 'Prysma Studio tarafından sevgiyle geliştirildi ♥',
  'settings.about.version': 'Versiyon {{version}}',

  // ── Trades ────────────────────────────────────────────────────────────────
  'trades.title': 'İşlem Günlüğü',
  'trades.runsLogged': '{{count}} KOŞU KAYDEDİLDİ',
  'trades.logRun': 'İŞLEM KOŞUSU KAYDET',
  'trades.noTrades': 'KAYITLI İŞLEM YOK',
  'trades.noTradesFilter': 'BU FİLTRE İLE İŞLEM YOK',

  'trades.filter.all': 'TÜMÜ',
  'trades.filter.buy': 'AL',
  'trades.filter.sell': 'SAT',

  'trades.col.route': 'ROTA / EMTİALAR',
  'trades.col.buy': 'AL',
  'trades.col.sell': 'SAT',
  'trades.col.profit': 'KÂR',

  'trades.stats.revenue': 'GELİR',
  'trades.stats.costs': 'MALİYETLER',
  'trades.stats.netProfit': 'NET KÂR',
  'trades.stats.volume': 'HACİM',

  'trades.modal.titleLog': 'İŞLEM KOŞUSU KAYDET',
  'trades.modal.titleEdit': 'İŞLEM KOŞUSUNU DÜZENLE',
  'trades.modal.from': 'NEREDEN',
  'trades.modal.to': 'NEREYE',
  'trades.modal.vessel': 'GEMİ',
  'trades.modal.vesselNone': '— Yok / Belirtilmedi —',
  'trades.modal.commodities': 'EMTİALAR',
  'trades.modal.clickToToggle': 'AL/SAT değiştirmek için OP\'ye tıklayın',
  'trades.modal.totalBuy': 'TOPLAM ALIŞ',
  'trades.modal.totalSell': 'TOPLAM SATIŞ',
  'trades.modal.netProfit': 'NET KÂR',
  'trades.modal.cancel': 'İPTAL',
  'trades.modal.saving': 'KAYDEDİLİYOR...',
  'trades.modal.updateRun': 'KOŞUYU GÜNCELLE',
  'trades.modal.logRun': 'İŞLEM KOŞUSU KAYDET',

  'trades.items.op': 'OP',
  'trades.items.commodity': 'EMTİA',
  'trades.items.scu': 'SCU',
  'trades.items.pricePerScu': 'FİYAT/SCU',
  'trades.items.total': 'TOPLAM',
  'trades.items.addCommodity': 'EMTİA EKLE',
  'trades.items.autoFilledUex': 'UEX fiyatlarından otomatik dolduruldu',
  'trades.items.switchToAuto': 'Otomatiğe geç',
  'trades.items.enterManually': 'Manuel gir',

  'trades.summary.title': 'ÖZET',
  'trades.summary.tradeRecap': 'İŞLEM ÖZETİ',
  'trades.summary.fillCommodities': 'Özeti görmek için emtiaları doldurun',
  'trades.summary.net': 'net',
  'trades.summary.estimated': 'tahmini',
  'trades.summary.cost': 'maliyet',
  'trades.summary.buy': 'AL',
  'trades.summary.sell': 'SAT',
  'trades.summary.net2': 'NET',

  'trades.menu.edit': 'İşlem Koşusunu Düzenle',
  'trades.menu.createSell': 'Satış Koşusu Oluştur',
  'trades.menu.remove': 'Kaldır',

  'trades.confirm.deleteTitle': 'İşlemleri Sil',
  'trades.confirm.deleteMessage':
    '{{count}} işlem koşusu{{s}} silinsin mi? Bu işlem geri alınamaz.',
  'trades.confirm.removeTitle': 'İşlemi Kaldır',
  'trades.confirm.removeMessage': '"{{from}}{{to}}" işlem koşusu kaldırılsın mı?',

  'trades.bulk.delete': '{{count}} KOŞU{{s}} SİL',
  'trades.row.createSell': 'SAT',
  'trades.row.pricesRefresh': 'FİYATLAR',
  'trades.row.refreshIn': '{{s}}sn',

  // ── Refineries ────────────────────────────────────────────────────────────
  'refineries.title': 'Rafineri Günlüğü',
  'refineries.jobsLogged': '{{count}} İŞ KAYDEDİLDİ',
  'refineries.logJob': 'İŞ KAYDET',
  'refineries.noJobs': 'KAYITLI RAFİNERİ İŞİ YOK',
  'refineries.noJobsHint': 'Verim ve kâr takibi için ilk işinizi kaydedin',

  'refineries.col.locationMethod': 'KONUM · YÖNTEM · MİNERALLER',
  'refineries.col.metrics': 'SCU · DEĞER · KÂR · ZAMANLAYICI',

  'refineries.stats.estValue': 'TAHMİNİ DEĞER',
  'refineries.stats.refineCost': 'RAFİNE MALİYETİ',
  'refineries.stats.netProfit': 'NET KÂR',
  'refineries.stats.scuProcessed': 'İŞLENEN SCU',

  'refineries.modal.titleLog': 'RAFİNERİ İŞİ KAYDET',
  'refineries.modal.titleEdit': 'RAFİNERİ İŞİNİ DÜZENLE',
  'refineries.modal.refinery': 'RAFİNERİ KONUMU',
  'refineries.modal.method': 'RAFİNE YÖNTEMİ',
  'refineries.modal.methodNone': '— Yöntem Seçin —',
  'refineries.modal.minerals': 'MİNERALLER',
  'refineries.modal.yieldHint': 'Verim: A=otomatik (UEX) · M=manuel',
  'refineries.modal.estValue': 'TAHMİNİ DEĞER',
  'refineries.modal.refineCost': 'RAFİNE MALİYETİ',
  'refineries.modal.netProfit': 'NET KÂR',
  'refineries.modal.duration': 'RAFİNE SÜRESİ',
  'refineries.modal.cost': 'RAFİNE MALİYETİ (aUEC)',
  'refineries.modal.cancel': 'İPTAL',
  'refineries.modal.logJob': 'İŞ KAYDET',
  'refineries.modal.saveJob': 'İŞİ KAYDET',
  'refineries.modal.logging': 'KAYDEDİLİYOR...',
  'refineries.modal.saving': 'KAYDEDİLİYOR...',

  'refineries.minerals.mineral': 'MİNERAL',
  'refineries.minerals.scuIn': 'cSCU GİRİŞ',
  'refineries.minerals.yield': 'VERİM %',
  'refineries.minerals.scuOut': 'cSCU ÇIKIŞ',
  'refineries.minerals.pricePerScu': 'FİYAT/SCU',
  'refineries.minerals.addMineral': 'MİNERAL EKLE',
  'refineries.minerals.yieldManualTitle': 'Manuel mod — tekrar otomatiğe (UEX) geçmek için tıklayın',
  'refineries.minerals.yieldAutoTitle': 'Otomatik mod (UEX) — manuel girmek için tıklayın',

  'refineries.row.done': 'TAMAMLANDI',
  'refineries.row.scu': 'SCU',
  'refineries.row.estValue': 'TAHMİNİ DEĞER',
  'refineries.row.profit': 'KÂR',
  'refineries.row.sell': 'SAT',

  'refineries.menu.edit': 'İşi Düzenle',
  'refineries.menu.createSell': 'Satış İşlemi Oluştur',
  'refineries.menu.remove': 'Kaldır',

  'refineries.confirm.removeTitle': 'İşi Kaldır',
  'refineries.confirm.removeMessage':
    '"{{refinery}}" konumundaki rafineri işi kaldırılsın mı? Bu işlem geri alınamaz.',

  'refineries.bulk.sell': '{{count}} İŞ{{s}} SAT',

  // ── Wallet ────────────────────────────────────────────────────────────────
  'wallet.title': 'Cüzdan',
  'wallet.entriesLogged': '{{count}} KAYIT GİRİLDİ',
  'wallet.addEntry': 'KAYIT EKLE',
  'wallet.noEntries': 'KAYITLI GİRİŞ YOK',
  'wallet.noEntriesFilter': 'BU FİLTRE İLE KAYIT YOK',
  'wallet.noEntriesHint': 'Gelir, gider veya bakiye anlık görüntüsü kaydetmek için KAYIT EKLE\'yi kullanın',

  'wallet.stats.totalIncome': 'TOPLAM GELİR',
  'wallet.stats.totalExpenses': 'TOPLAM GİDER',
  'wallet.stats.balance': 'GÜNCEL BAKİYE',

  'wallet.col.description': 'AÇIKLAMA / KATEGORİ',
  'wallet.col.source': 'KAYNAK',
  'wallet.col.when': 'TARİH',
  'wallet.col.amount': 'TUTAR',

  'wallet.type.income': 'GELİR',
  'wallet.type.expense': 'GİDER',
  'wallet.type.adjustment': 'DÜZELTME',
  'wallet.type.adjustmentReset': ' (bakiye sıfırlama)',
  'wallet.type.trade': 'İŞLEM',

  'wallet.form.amount': 'TUTAR (aUEC)',
  'wallet.form.category': 'KATEGORİ',
  'wallet.form.description': 'AÇIKLAMA',
  'wallet.form.descriptionPlaceholder': 'örn. Laranite seferi Shubin → TDD...',
  'wallet.form.cancel': 'İPTAL',
  'wallet.form.confirm': 'ONAYLA',
  'wallet.form.saving': 'KAYDEDİLİYOR...',

  'wallet.category.trading': 'Ticaret',
  'wallet.category.mining': 'Madencilik',
  'wallet.category.refinery': 'Rafineri',
  'wallet.category.bounty': 'Ödül Avı',
  'wallet.category.salvage': 'Kurtarma',
  'wallet.category.mission': 'Görev',
  'wallet.category.other': 'Diğer',

  'wallet.menu.edit': 'Kaydı Düzenle',
  'wallet.menu.remove': 'Kaldır',

  'wallet.confirm.deleteTitle': 'Kayıtları Sil',
  'wallet.confirm.deleteMessage':
   '{{count}} cüzdan kayd{{y}} silinsin mi? Bu işlem geri alınamaz.',
  'wallet.confirm.removeTitle': 'Kaydı Kaldır',
  'wallet.confirm.removeMessage': '"{{description}}" ({{amount}}) kaldırılsın mı?',

  'wallet.bulk.delete': '{{count}} KAYDI SİL',
  'wallet.row.trade': 'İŞLEM',
  'wallet.row.managedByTrades': 'İşlemler tarafından otomatik yönetilir',
  'wallet.row.cancel': 'İPTAL',
  'wallet.row.confirm': 'ONAYLA',
  'wallet.row.saving': 'KAYDEDİLİYOR...',

  // ── Equipment ─────────────────────────────────────────────────────────────
  'equipment.title': 'Ekipman Veritabanı',
  'equipment.loading': 'YÜKLENİYOR...',
  'equipment.noItems': 'ÜRÜN BULUNAMADI',
  'equipment.noItemsSearch': '"{{search}}" için sonuç bulunamadı',
  'equipment.itemCount': '{{count}} ürün',
  'equipment.clearImageCache': 'Görsel önbelleğini temizle',
  'equipment.thanks': 'Fikir için {{name}}\'e teşekkürler ♥',

  'equipment.filter.brand': 'MARKA',
  'equipment.filter.slot': 'YUVA',
  'equipment.filter.type': 'TÜR',
  'equipment.filter.size': 'BOYUT',
  'equipment.filter.grade': 'SINIF',
  'equipment.filter.available': 'MEVCUT',

  'equipment.detail.title': 'ÜRÜN DETAYI',
  'equipment.detail.description': 'AÇIKLAMA',
  'equipment.detail.whereToBuy': 'NEREDEN SATIN ALINIR',
  'equipment.detail.noShops': 'Bu ürün için bilinen bir mağaza yok',
  'equipment.detail.col.terminal': 'TERMİNAL',
  'equipment.detail.col.buy': 'SATIN AL',
  'equipment.detail.col.system': 'SİSTEM',
  'equipment.detail.size': 'BOYUT',
  'equipment.detail.mfr': 'ÜRETİCİ',
  'equipment.detail.version': 'SÜRÜM',
  'equipment.detail.close': 'KAPAT',

  'equipment.pagination.prev': 'ÖNCEKİ',
  'equipment.pagination.next': 'SONRAKİ',

  // ── Fleet ─────────────────────────────────────────────────────────────────
  'fleet.title': 'Filo Kaydı',
  'fleet.vesselsRegistered': '{{count}} {{vessel}} KAYITLI',
  'fleet.vessel': 'GEMİ',
  'fleet.vessels': 'GEMİLER',
  'fleet.addVessel': 'GEMİ EKLE',
  'fleet.noVessels': 'KAYITLI GEMİ YOK',
  'fleet.dbAvailable': 'VERİTABANINDA {{count}} GEMİ MEVCUT',
  'fleet.dbLoading': 'Veritabanı yükleniyor...',
  'fleet.totalScu': '· TOPLAM {{scu}} SCU',

  'fleet.modal.title': 'GEMİ EKLE',
  'fleet.modal.searchPlaceholder': 'İsim, üretici, rol...',
  'fleet.modal.noResults': 'GEMİ BULUNAMADI',
  'fleet.modal.nicknameLabel': 'ÇAĞRI İŞARETİ / TAKMA AD',
  'fleet.modal.nicknameHint': 'Resmi adı kullanmak için boş bırakın',
  'fleet.modal.back': 'GERİ',
  'fleet.modal.register': 'GEMİYİ KAYDET',
  'fleet.modal.registering': 'KAYDEDİLİYOR...',

  'fleet.confirm.removeTitle': 'Gemiyi Kaldır',
  'fleet.confirm.removeMessage': '"{{name}}" filonuzdan kaldırılsın mı?',

  // ── Commodities ───────────────────────────────────────────────────────────
  'commodities.title': 'Emtialar',
  'commodities.searchPlaceholder': 'Emtia ara...',
  'commodities.refresh': 'Yenile',
  'commodities.noResults': 'Aramanızla eşleşen emtia bulunamadı',
  'commodities.selectHint': 'Terminal fiyatlarını görmek için bir emtia seçin',
  'commodities.selectHintSub': 'Pazar listesindeki herhangi bir satıra tıklayın',

  'commodities.col.code': 'KOD',
  'commodities.col.name': 'AD',
  'commodities.col.sell': 'SAT',
  'commodities.col.buy': 'AL',
  'commodities.col.spread': 'SPREAD',
  'commodities.filter.all': 'TÜMÜ',
  'commodities.card.bestSell': 'EN İYİ SATIŞ',
  'commodities.card.bestBuy': 'EN İYİ ALIM',
  'commodities.card.margin': 'MARJ',

  'commodities.detail.terminals': '{{count}} TERMİNAL',
  'commodities.detail.tab.sell': 'SAT',
  'commodities.detail.tab.buy': 'AL',
  'commodities.detail.col.terminal': 'TERMİNAL',
  'commodities.detail.col.system': 'SİSTEM',
  'commodities.detail.col.planet': 'GEZEGEN',
  'commodities.detail.col.inventory': 'ENVANTER',
  'commodities.detail.col.price': 'FİYAT',
  'commodities.detail.col.updated': 'GÜNCELLENDİ',
  'commodities.detail.noTerminals': 'Bu işlem için uygun terminal bulunmuyor',

  // ── Home / Dashboard ──────────────────────────────────────────────────────
  'home.title': 'GÖSTERGE PANELİ',

  'home.fleet.title': 'FİLO',
  'home.fleet.emptyTitle': 'Kayıtlı gemi yok',
  'home.fleet.empty': 'Filonuzu takip etmeye başlamak için ilk geminizi kaydedin.',
  'home.fleet.vessels': 'GEMİLER',
  'home.fleet.viewAll': 'TÜMÜNÜ GÖR',
  'home.fleet.more': 'daha fazla',

  'home.trades.title': 'SON İŞLEMLER',
  'home.trades.emptyTitle': 'Kayıtlı işlem yok',
  'home.trades.empty': 'Kârınızı takip etmek için işlem koşularını kaydetmeye başlayın.',
  'home.trades.totalProfit': 'SON 5 KÂR',
  'home.trades.logTrade': 'İŞLEM KAYDET',

  'home.refinery.title': 'AKTİF İŞLER',
  'home.refinery.emptyTitle': 'Aktif iş yok',
  'home.refinery.empty': 'Devam eden rafineri işi yok. Takibe başlamak için bir iş kaydedin.',
  'home.refinery.ready': 'HAZIR',
  'home.refinery.logJob': 'İŞ KAYDET',
  'home.refinery.noTimer': 'Zamanlayıcı ayarlanmadı',

  'home.wallet.title': 'CÜZDAN',
  'home.wallet.emptyTitle': 'Cüzdan boş',
  'home.wallet.empty': 'aUEC bakiyenizi ve gelirlerinizi takip etmeye başlayın.',
  'home.wallet.balance': 'BAKİYE',
  'home.wallet.weeklyIncome': 'GELİR 7G',
  'home.wallet.weeklyExpense': 'GİDER 7G',
  'home.wallet.trend': 'TREND',
  'home.wallet.addEntry': 'KAYIT EKLE',

  'home.commodities.title': 'EN İYİ FIRSATLAR',
  'home.commodities.emptyTitle': 'Fiyat verisi yok',
  'home.commodities.empty': 'Ticaret fırsatlarını görmek için UEX tokenınızı bağlayın ve emtia fiyatlarını yükleyin.',
  'home.commodities.margin': 'MARJ',
  'home.commodities.buy': 'AL',
  'home.commodities.sell': 'SAT',
  'home.commodities.refresh': 'YENİLE',

  'home.stats.title': 'HIZLI İSTATİSTİKLER',
  'home.stats.weeklyProfit': 'HAFTALIK KÂR',
  'home.stats.walletTrend': 'CÜZDAN TRENDİ',
  'home.stats.avgProfit': 'ORT / İŞLEM',
  'home.stats.noData': 'İstatistikleri görmek için işlem ve cüzdan kayıtları ekleyin.',
  'home.stats.noDataTitle': 'Henüz veri yok',

  // ── Home header ───────────────────────────────────────────────────────────
  'home.subtitle': 'VERSE YARDIMCISI',

  // ── Home quick-action modal ───────────────────────────────────────────────
  'home.modal.section.fleet': 'Filo',
  'home.modal.section.trades': 'İşlemler',
  'home.modal.section.refinery': 'Rafineri',
  'home.modal.section.wallet': 'Cüzdan',
  'home.modal.openTitle': '{{section}} bölümüne açılsın mı?',
  'home.modal.openBody': 'Bu işlemi kaydetmek için {{section}} bölümüne gidin.',
  'home.modal.cancel': 'İPTAL',
  'home.modal.goTo': '{{section}} bölümüne git',

  // ── Commodities widget column headers ─────────────────────────────────────
  'home.commodities.col.code': 'KOD',
  'home.commodities.col.commodity': 'EMTİA',

  // ── Trades widget column headers ──────────────────────────────────────────
  'home.trades.col.route': 'ROTA · EMTİA',
  'home.trades.col.profit': 'KÂR',
  'home.trades.col.when': 'TARİH',
} as const

export type TranslationKey = keyof typeof tr

export default tr
