export interface City {
  id: number;
  name: string;
  districts: string[];
}

export const Cities: City[] = [
  {
    id: 1,
    name: "Adana",
    districts: ["Aladağ", "Seyhan", "Yüreğir", "Çukurova", "Sarıçam", "Ceyhan", "Kozan", "İmamoğlu", "Karataş", "Karaisalı", "Pozantı", "Yumurtalık", "Tufanbeyli", "Feke", "Saimbeyli"]
  },
  {
    id: 2,
    name: "Adıyaman",
    districts: ["Merkez", "Kahta", "Besni", "Gölbaşı", "Gerger", "Sincik", "Çelikhan", "Tut", "Samsat"]
  },
  {
    id: 3,
    name: "Afyonkarahisar",
    districts: ["Merkez", "Sandıklı", "Dinar", "Bolvadin", "Sinanpaşa", "Emirdağ", "Şuhut", "Çay", "İhsaniye", "İscehisar", "Sultandağı", "Çobanlar", "Dazkırı", "Başmakçı", "Hocalar", "Bayat", "Evciler", "Kızılören"]
  },
  {
    id: 4,
    name: "Ağrı",
    districts: ["Merkez", "Patnos", "Doğubayazıt", "Diyadin", "Eleşkirt", "Tutak", "Taşlıçay", "Hamur"]
  },
  {
    id: 5,
    name: "Amasya",
    districts: ["Merkez", "Merzifon", "Suluova", "Taşova", "Göynücek", "Hamamözü"]
  },
  {
    id: 6,
    name: "Ankara",
    districts: ["Çankaya", "Keçiören", "Yenimahalle", "Mamak", "Etimesgut", "Sincan", "Altındağ", "Pursaklar", "Gölbaşı", "Polatlı", "Çubuk", "Kahramankazan", "Beypazarı", "Haymana", "Elmadağ", "Akyurt", "Şereflikoçhisar", "Bala", "Kızılcahamam", "Nallıhan", "Ayaş", "Çamlıdere", "Kalecik", "Güdül", "Evren"]
  },
  {
    id: 7,
    name: "Antalya",
    districts: ["Kepez", "Muratpaşa", "Alanya", "Manavgat", "Konyaaltı", "Serik", "Aksu", "Kumluca", "Döşemealtı", "Kaş", "Korkuteli", "Gazipaşa", "Finike", "Kemer", "Elmalı", "Demre", "Akseki", "Gündoğmuş", "İbradi"]
  },
  {
    id: 8,
    name: "Artvin",
    districts: ["Merkez", "Hopa", "Borçka", "Arhavi", "Yusufeli", "Şavşat", "Ardanuç", "Kemalpaşa", "Murgul"]
  },
  {
    id: 9,
    name: "Aydın",
    districts: ["Efeler", "Nazilli", "Söke", "Kuşadası", "Didim", "İncirliova", "Çine", "Germencik", "Bozdoğan", "Köşk", "Kuyucak", "Koçarlı", "Sultanhisar", "Karacasu", "Buharkent", "Yenipazar", "Karpuzlu"]
  },
  {
    id: 10,
    name: "Balıkesir",
    districts: ["Altıeylül", "Karesi", "Edremit", "Bandırma", "Gönen", "Ayvalık", "Burhaniye", "Bigadiç", "Susurluk", "Dursunbey", "Sındırgı", "Erdek", "İvrindi", "Havran", "Kepsut", "Manyas", "Savaştepe", "Gömeç", "Balya", "Marmara"]
  },
  {
    id: 11,
    name: "Bilecik",
    districts: ["Merkez", "Bozüyük", "Osmaneli", "Söğüt", "Gölpazarı", "Pazaryeri", "İnhisar", "Yenipazar"]
  },
  {
    id: 12,
    name: "Bingöl",
    districts: ["Merkez", "Genç", "Solhan", "Karlıova", "Adaklı", "Kiğı", "Yedisu", "Yayladere"]
  },
  {
    id: 13,
    name: "Bitlis",
    districts: ["Tatvan", "Merkez", "Güroymak", "Ahlat", "Hizan", "Mutki", "Adilcevaz"]
  },
  {
    id: 14,
    name: "Bolu",
    districts: ["Merkez", "Gerede", "Mudurnu", "Göynük", "Mengen", "Yeniçağa", "Dörtdivan", "Seben", "Kıbrıscık"]
  },
  {
    id: 15,
    name: "Burdur",
    districts: ["Merkez", "Bucak", "Gölhisar", "Yeşilova", "Çavdır", "Tefenni", "Ağlasun", "Karamanlı", "Altınyayla", "Çeltikçi", "Kemer"]
  },
  {
    id: 16,
    name: "Bursa",
    districts: ["Osmangazi", "Yıldırım", "Nilüfer", "İnegöl", "Gemlik", "Mustafakemalpa", "Mudanya", "Gürsu", "Karacabey", "Orhangazi", "Kestel", "Yenişehir", "İznik", "Orhaneli", "Keles", "Büyükorhan", "Harmancık"]
  },
  {
    id: 17,
    name: "Çanakkale",
    districts: ["Merkez", "Biga", "Çan", "Gelibolu", "Ayvacık", "Ezine", "Yenice", "Bayramiç", "Lapseki", "Gökçeada", "Eceabat", "Bozcaada"]
  },
  {
    id: 18,
    name: "Çankırı",
    districts: ["Merkez", "Orta", "Çerkeş", "Ilgaz", "Şabanözü", "Kurşunlu", "Yapraklı", "Kızılırmak", "Eldivan", "Atkaracalar", "Korgun", "Bayramören"]
  },
  {
    id: 19,
    name: "Çorum",
    districts: ["Merkez", "Sungurlu", "Osmancık", "İskilip", "Alaca", "Bayat", "Kargı", "Mecitözü", "Ortaköy", "Uğurludağ", "Dodurga", "Oğuzlar", "Laçin", "Boğazkale"]
  },
  {
    id: 20,
    name: "Denizli",
    districts: ["Pamukkale", "Merkezefendi", "Çivril", "Acıpayam", "Tavas", "Honaz", "Sarayköy", "Buldan", "Kale", "Çal", "Çameli", "Serinhisar", "Bozkurt", "Güney", "Çardak", "Bekilli", "Beyağaç", "Babadağ", "Baklan"]
  },
  {
    id: 21,
    name: "Diyarbakır",
    districts: ["Bağlar", "Kayapınar", "Yenişehir", "Ergani", "Bismil", "Sur", "Silvan", "Çınar", "Çermik", "Dicle", "Kulp", "Hani", "Lice", "Eğil", "Hazro", "Kocaköy", "Çüngüş"]
  },
  {
    id: 22,
    name: "Edirne",
    districts: ["Merkez", "Keşan", "Uzunköprü", "İpsala", "Havsa", "Meriç", "Enez", "Süloğlu", "Lalapaşa"]
  },
  {
    id: 23,
    name: "Elazığ",
    districts: ["Merkez", "Kovancılar", "Karakoçan", "Palu", "Baskil", "Arıcak", "Maden", "Sivrice", "Keban", "Alacakaya", "Ağın"]
  },
  {
    id: 24,
    name: "Erzincan",
    districts: ["Merkez", "Tercan", "Üzümlü", "Refahiye", "Çayırlı", "İliç", "Kemah", "Kemaliye", "Otlukbeli"]
  },
  {
    id: 25,
    name: "Erzurum",
    districts: ["Yakutiye", "Palandöken", "Aziziye", "Horasan", "Oltu", "Pasinler", "Karayazı", "Hınıs", "Tekman", "Aşkale", "Karaçoban", "Şenkaya", "Çat", "Tortum", "Köprüköy", "İspir", "Narman", "Uzundere", "Olur", "Pazaryolu"]
  },
  {
    id: 26,
    name: "Eskişehir",
    districts: ["Odunpazarı", "Tepebaşı", "Sivrihisar", "Çifteler", "Seyitgazi", "Alpu", "Mihalıççık", "Mahmudiye", "Beylikova", "İnönü", "Günyüzü", "Sarıcakaya", "Mihalgazi", "Han"]
  },
  {
    id: 27,
    name: "Gaziantep",
    districts: ["Şahinbey", "Şehitkamil", "Nizip", "İslahiye", "Nurdağı", "Araban", "Oğuzeli", "Yavuzeli", "Karkamış"]
  },
  {
    id: 28,
    name: "Giresun",
    districts: ["Merkez", "Bulancak", "Espiye", "Görele", "Tirebolu", "Şebinkarahisar", "Keşap", "Dereli", "Yağlıdere", "Piraziz", "Eynesil", "Alucra", "Çamoluk", "Güce", "Doğankent", "Çanakçı"]
  },
  {
    id: 29,
    name: "Gümüşhane",
    districts: ["Merkez", "Kelkit", "Şiran", "Kürtün", "Torul", "Köse"]
  },
  {
    id: 30,
    name: "Hakkari",
    districts: ["Yüksekova", "Merkez", "Şemdinli", "Derecik", "Çukurca"]
  },
  {
    id: 31,
    name: "Hatay",
    districts: ["Antakya", "İskenderun", "Defne", "Dörtyol", "Samandağ", "Kırıkhan", "Reyhanlı", "Arsuz", "Altınözü", "Hassa", "Payas", "Erzin", "Yayladağı", "Belen", "Kumlu"]
  },
  {
    id: 32,
    name: "Isparta",
    districts: ["Merkez", "Yalvaç", "Eğirdir", "Şarkikaraağaç", "Gelendost", "Keçiborlu", "Senirkent", "Sütçüler", "Gönen", "Uluborlu", "Atabey", "Aksu", "Yenişarbademli"]
  },
  {
    id: 33,
    name: "Mersin",
    districts: ["Tarsus", "Toroslar", "Akdeniz", "Yenişehir", "Mezitli", "Erdemli", "Silifke", "Anamur", "Mut", "Bozyazı", "Gülnar", "Aydıncık", "Çamlıyayla"]
  },
  {
    id: 34,
    name: "İstanbul",
    districts: ["Esenyurt", "Küçükçekmece", "Bağcılar", "Pendik", "Ümraniye", "Bahçelievler", "Üsküdar", "Sultangazi", "Maltepe", "Gaziosmanpaşa", "Kartal", "Kadıköy", "Esenler", "Kağıthane", "Fatih", "Avcılar", "Başakşehir", "Ataşehir", "Sancaktepe", "Eyüp", "Sarıyer", "Beylikdüzü", "Sultanbeyli", "Güngören", "Zeytinburnu", "Şişli", "Bayrampaşa", "Arnavutköy", "Tuzla", "Çekmeköy", "Büyükçekmece", "Beykoz", "Beyoğlu", "Bakırköy", "Silivri", "Beşiktaş", "Çatalca", "Şile", "Adalar"]
  },
  {
    id: 35,
    name: "İzmir",
    districts: ["Buca", "Karabağlar", "Bornova", "Konak", "Karşıyaka", "Bayraklı", "Çiğli", "Torbalı", "Menemen", "Gaziemir", "Ödemiş", "Kemalpaşa", "Bergama", "Aliağa", "Menderes", "Tire", "Balçova", "Urla", "Narlıdere", "Dikili", "Kiraz", "Seferihisar", "Çeşme", "Bayındır", "Selçuk", "Foça", "Güzelbahçe", "Kınık", "Beydağ", "Karaburun"]
  },
  {
    id: 36,
    name: "Kars",
    districts: ["Merkez", "Kağızman", "Sarıkamış", "Selim", "Digor", "Arpaçay", "Akyaka", "Susuz"]
  },
  {
    id: 37,
    name: "Kastamonu",
    districts: ["Merkez", "Tosya", "Taşköprü", "Cide", "İnebolu", "Araç", "Bozkurt", "Daday", "Azdavay", "Çatalzeytin", "Doğanyurt", "Küre", "Pınarbaşı", "İhsangazi", "Şenpazar", "Abana", "Hanönü", "Seydiler", "Ağlı"]
  },
  {
    id: 38,
    name: "Kayseri",
    districts: ["Melikgazi", "Kocasinan", "Talas", "Develi", "Yahyalı", "Bünyan", "Pınarbaşı", "Tomarza", "Yeşilhisar", "Sarıoğlan", "Hacılar", "Sarız", "Felahiye", "Akkışla", "Özvatan"]
  },
  {
    id: 39,
    name: "Kırklareli",
    districts: ["Lüleburgaz", "Merkez", "Babaeski", "Vize", "Pınarhisar", "Demirköy", "Pehlivanköy", "Kofçaz"]
  },
  {
    id: 40,
    name: "Kırşehir",
    districts: ["Merkez", "Kaman", "Mucur", "Çiçekdağı", "Akpınar", "Boztepe", "Akçakent"]
  },
  {
    id: 41,
    name: "Kocaeli",
    districts: ["Gebze", "İzmit", "Darıca", "Körfez", "Gölcük", "Derince", "Çayırova", "Kartepe", "Başiskele", "Karamürsel", "Kandıra", "Dilovası"]
  },
  {
    id: 42,
    name: "Konya",
    districts: ["Selçuklu", "Meram", "Karatay", "Ereğli", "Akşehir", "Beyşehir", "Çumra", "Seydişehir", "Ilgın", "Cihanbeyli", "Kulu", "Karapınar", "Kadınhanı", "Sarayönü", "Bozkır", "Yunak", "Hüyük", "Doğanhisar", "Altınekin", "Hadim", "Çeltik", "Güneysınır", "Emirgazi", "Taşkent", "Tuzlukçu", "Derebucak", "Akören", "Ahırlı", "Derbent", "Halkapınar", "Yalıhüyük"]
  },
  {
    id: 43,
    name: "Kütahya",
    districts: ["Merkez", "Tavşanlı", "Simav", "Gediz", "Emet", "Altıntaş", "Domaniç", "Hisarcık", "Aslanapa", "Çavdarhisar", "Şaphane", "Pazarlar", "Dumlupınar"]
  },
  {
    id: 44,
    name: "Malatya",
    districts: ["Yeşilyurt", "Battalgazi", "Doğanşehir", "Akçadağ", "Darende", "Hekimhan", "Yazıhan", "Pütürge", "Arapgir", "Kuluncak", "Arguvan", "Kale", "Doğanyol"]
  },
  {
    id: 45,
    name: "Manisa",
    districts: ["Yunusemre", "Akhisar", "Şehzadeler", "Turgutlu", "Salihli", "Soma", "Alaşehir", "Saruhanlı", "Kula", "Demirci", "Kırıkağaç", "Sarıgöl", "Gördes", "Selendi", "Ahmetli", "Gölmarmara", "Köprübaşı"]
  },
  {
    id: 46,
    name: "Kahramanmaraş",
    districts: ["Onikişubat", "Dulkadiroğlu", "Elbistan", "Afşin", "Türkoğlu", "Pazarcık", "Göksun", "Andırın", "Çağlayancerit", "Nurhak", "Ekinözü"]
  },
  {
    id: 47,
    name: "Mardin",
    districts: ["Kızıltepe", "Artuklu", "Midyat", "Nusaybin", "Derik", "Mazıdağı", "Dargeçit", "Savur", "Yeşilli", "Ömerli"]
  },
  {
    id: 48,
    name: "Muğla",
    districts: ["Bodrum", "Fethiye", "Milas", "Menteşe", "Marmaris", "Seydikemer", "Ortaca", "Yatağan", "Dalaman", "Köyceğiz", "Ula", "Datça", "Kavaklıdere"]
  },
  {
    id: 49,
    name: "Muş",
    districts: ["Merkez", "Bulanık", "Malazgirt", "Varto", "Korkut", "Hasköy"]
  },
  {
    id: 50,
    name: "Nevşehir",
    districts: ["Merkez", "Ürgüp", "Avanos", "Gülşehir", "Derinkuyu", "Acıgöl", "Kozaklı", "Hacıbektaş"]
  },
  {
    id: 51,
    name: "Niğde",
    districts: ["Merkez", "Bor", "Çiftlik", "Ulukışla", "Altunhisar", "Çamardı"]
  },
  {
    id: 52,
    name: "Ordu",
    districts: ["Altınordu", "Ünye", "Fatsa", "Perşembe", "Kumru", "Korgan", "Gölköy", "Ulubey", "Mesudiye", "Akkuş", "Aybastı", "Gürgentepe", "İkizce", "Çatalpınar", "Çaybaşı", "Çamaş", "Kabataş", "Kabadüz", "Gülyalı"]
  },
  {
    id: 53,
    name: "Rize",
    districts: ["Merkez", "Çayeli", "Ardeşen", "Pazar", "Fındıklı", "Kalkandere", "Güneysu", "İyidere", "İkizdere", "Derepazarı", "Çamlıhemşin", "Hemşin"]
  },
  {
    id: 54,
    name: "Sakarya",
    districts: ["Adapazarı", "Serdivan", "Akyazı", "Erenler", "Hendek", "Karasu", "Geyve", "Arifiye", "Sapanca", "Pamukova", "Ferizli", "Kocaali", "Kaynarca", "Söğütlü", "Karapürçek", "Taraklı"]
  },
  {
    id: 55,
    name: "Samsun",
    districts: ["İlkadım", "Atakum", "Bafra", "Çarşamba", "Canik", "Vezirköprü", "Terme", "Tekkeköy", "Havza", "19 Mayıs", "Alaçam", "Salıpazarı", "Ayvacık", "Kavak", "Asarcık", "Ladik", "Yakakent"]
  },
  {
    id: 56,
    name: "Siirt",
    districts: ["Merkez", "Kurtalan", "Pervari", "Baykan", "Şirvan", "Eruh", "Tillo"]
  },
  {
    id: 57,
    name: "Sinop",
    districts: ["Merkez", "Boyabat", "Gerze", "Ayancık", "Durağan", "Türkeli", "Erfelek", "Saraydüzü", "Dikmen"]
  },
  {
    id: 58,
    name: "Sivas",
    districts: ["Merkez", "Şarkışla", "Yıldızeli", "Suşehri", "Gemerek", "Zara", "Kangal", "Gürün", "Divriği", "Koyulhisar", "Hafik", "Ulaş", "Altınyayla", "İmranlı", "Akıncılar", "Gölova", "Doğanşar"]
  },
  {
    id: 59,
    name: "Tekirdağ",
    districts: ["Çorlu", "Süleymanpaşa", "Çerkezköy", "Kapaklı", "Ergene", "Malkara", "Saray", "Şarköy", "Hayrabolu", "Muratlı", "Marmaraereğlisi"]
  },
  {
    id: 60,
    name: "Tokat",
    districts: ["Merkez", "Erbaa", "Turhal", "Niksar", "Zile", "Reşadiye", "Almus", "Pazar", "Yeşilyurt", "Artova", "Sulusaray", "Başçiftlik"]
  },
  {
    id: 61,
    name: "Trabzon",
    districts: ["Ortahisar", "Akçaabat", "Araklı", "Of", "Yomra", "Arsin", "Vakfıkebir", "Sürmene", "Maçka", "Beşikdüzü", "Çarşıbaşı", "Çaykara", "Tonya", "Düzköy", "Şalpazarı", "Hayrat", "Köprübaşı", "Dernekpazarı"]
  },
  {
    id: 62,
    name: "Tunceli",
    districts: ["Merkez", "Pertek", "Mazgirt", "Çemişgezek", "Ovacık", "Hozat", "Pülümür", "Nazımiye"]
  },
  {
    id: 63,
    name: "Şanlıurfa",
    districts: ["Eyyübiye", "Haliliye", "Siverek", "Viranşehir", "Karaköprü", "Akçakale", "Suruç", "Birecik", "Harran", "Ceylanpınar", "Bozova", "Hilvan"]
  },
  {
    id: 64,
    name: "Uşak",
    districts: ["Merkez", "Banaz", "Eşme", "Sivaslı", "Ulubey", "Karahallı"]
  },
  {
    id: 65,
    name: "Van",
    districts: ["İpekyolu", "Erciş", "Tuşba", "Edremit", "Özalp", "Çaldıran", "Başkale", "Muradiye", "Gürpınar", "Gevaş", "Saray", "Çatak", "Bahçesaray"]
  },
  {
    id: 66,
    name: "Yozgat",
    districts: ["Merkez", "Sorgun", "Akdağmadeni", "Yerköy", "Boğazlıyan", "Sarıkaya", "Çekerek", "Şefaatli", "Saraykent", "Çayıralan", "Kadışehri", "Aydıncık", "Yenifakılı", "Çandır"]
  },
  {
    id: 67,
    name: "Zonguldak",
    districts: ["Ereğli", "Merkez", "Çaycuma", "Devrek", "Kozlu", "Alaplı", "Kilimli", "Gökçebey"]
  },
  {
    id: 68,
    name: "Aksaray",
    districts: ["Merkez", "Ortaköy", "Eskil", "Gülağaç", "Güzelyurt", "Sultanhanı", "Ağaçören", "Sarıyahşi"]
  },
  {
    id: 69,
    name: "Bayburt",
    districts: ["Merkez", "Demirözü", "Aydıntepe"]
  },
  {
    id: 70,
    name: "Karaman",
    districts: ["Merkez", "Ermenek", "Sarıveliler", "Ayrancı", "Kazımkarabekir", "Başyayla"]
  },
  {
    id: 71,
    name: "Kırıkkale",
    districts: ["Merkez", "Yahşihan", "Keskin", "Delice", "Sulakyurt", "Bahşili", "Balışeyh", "Karakeçili", "Çelebi"]
  },
  {
    id: 72,
    name: "Batman",
    districts: ["Merkez", "Kozluk", "Sason", "Beşiri", "Gercüş", "Hasankeyf"]
  },
  {
    id: 73,
    name: "Şırnak",
    districts: ["Cizre", "Silopi", "Merkez", "İdil", "Uludere", "Beytüşşebap", "Güçlükonak"]
  },
  {
    id: 74,
    name: "Bartın",
    districts: ["Merkez", "Ulus", "Amasra", "Kurucaşile"]
  },
  {
    id: 75,
    name: "Ardahan",
    districts: ["Merkez", "Göle", "Çıldır", "Hanak", "Posof", "Damal"]
  },
  {
    id: 76,
    name: "Iğdır",
    districts: ["Merkez", "Tuzluca", "Aralık", "Karakoyunlu"]
  },
  {
    id: 77,
    name: "Yalova",
    districts: ["Merkez", "Çiftlikköy", "Çınarcık", "Altınova", "Armutlu", "Termal"]
  },
  {
    id: 78,
    name: "Karabük",
    districts: ["Merkez", "Safranbolu", "Yenice", "Eskipazar", "Eflani", "Ovacık"]
  },
  {
    id: 79,
    name: "Kilis",
    districts: ["Merkez", "Musabeyli", "Elbeyli", "Polateli"]
  },
  {
    id: 80,
    name: "Osmaniye",
    districts: ["Merkez", "Kadirli", "Düziçi", "Bahçe", "Toprakkale", "Sumbas", "Hasanbeyli"]
  },
  {
    id: 81,
    name: "Düzce",
    districts: ["Merkez", "Akçakoca", "Kaynaşlı", "Gölyaka", "Çilimli", "Yığılca", "Gümüşova", "Cumayeri"]
  }
];