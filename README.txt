AURA REFORM — V10
=================

V10'da:
- Ana sayfa branş kutuları: büyük harfli başlıklar (PILATES / YOGA / FITNESS / DANCE),
  aynı alt yazılar, sağda ışık halkalı görsel, her branşın kendi rengi.
  Görseller: assets/cards/card-<branş>.jpg (tasarım ekran görüntüsünden kırpıldı —
  orijinal yüksek çözünürlüklü görseller gelirse aynı adla üzerine kaydedin).
- Ana sayfa arka planı: yazıların arkasında üst kenarı ışıldayan büyük karanlık küre
  (hareketsiz — yazılar net okunur); kürenin kenarının rastgele bir bölümünden doğup sayfa
  kenarına kadar dışa doğru genişleyen yumuşak aura dalgaları ve dışa saçılan zerreler
  (her tur sonunda yeni rastgele açı).
  Hareketi GPU yapar — canvas ve her karede çalışan JS yok.
- Branş kutularında görseldeki halkanın etrafında dönen iki ışık parıltısı.
- Branş galerileri: imleçle eğilme efekti ve fotoğraf sayısı kaldırıldı.
- Fotoğraflarda sağ tık menüsü ve sürükleyerek kaydetme kapalı.

AURA REFORM — V9
================

V9'da (menü):
- Menü sırası: PILATES · YOGA · FITNESS · DANCE · HAKKIMIZDA · SSS · İLETİŞİM (tüm sayfalarda).
- HAKKIMIZDA → trainer.html (sekme başlığı "Hakkımızda").
- Yorumlar şimdilik kaldırıldı: menüden çıkarıldı, yorumlar.html dosyası duruyor ama
  hiçbir sayfadan bağlantı yok. Geri eklemek için menülere
  <a href="yorumlar.html">YORUMLAR</a> eklemek yeterli.

V9'da (sayfa geçişleri):
- Sayfalar arası yumuşak geçiş: menü çubuğu sabit kalır, eski sayfa koyu bir "aura
  perdesine" (yumuşak marka ışıkları) dönüşür, yeni sayfa aynı perdeden belirir.
  Chrome/Edge/Safari'de tarayıcının View Transitions özelliğiyle; site dosya olarak
  (file://) açıldığında veya diğer tarayıcılarda JS ile — ikisi aynı görünür.
- Menü çubuğunun giriş animasyonu ziyaret başına bir kez oynar; site içinde gezerken
  sayfa içeriği yarı sürede gelir (CSS'teki --seq).

V9'da (performans — ilk açılıştaki takılma):
- Yazı tipleri CSS @import yerine her sayfanın <head> kısmından doğrudan yüklenir.
- Sayfa geçişinde tam ekran bulanıklık kaldırıldı (yumuşaklığı aura perdesi verir).
- Aura ışıkları yarım çözünürlükte, saniyede ~30 kare çizilir; hareket sayfa açıldıktan
  ~0,7 sn sonra başlar; yalnızca boyut gerçekten değişince yeniden kurulur.
- Ana sayfa: tam ekran filtre animasyonu ve (video dosyası yoksa) boş video katmanı kaldırıldı.
- SSS kartlarında arka plan bulanıklığı yerine koyu dolgu.
- Ana sayfada yazılar animasyonsuz, anında görünür; sadece branş kutuları sonradan gelir.
- Branş sayfalarında kutu efektleri kaldırıldı: galeri çerçevesinin dönen kenarı ve nabız
  hâlesi sabitlendi, program kutuları animasyonsuz (üzerine gelince efektleri duruyor).
- Sayfa başlıklarında harf kesilmesi düzeltildi ("Yoga"daki g, "İletişim"deki İ noktası).
- Aura ışıkları: ana sayfada tam sürüm; diğer sayfalarda hafif sürüm
  (V10: diğer sayfalarda canvas yerine ortadan iki yana yavaşça kayan dikey aura dalgaları
  ve süzülen küçük ışık topları — yalnızca CSS; aşağıdaki V9 notu eski hâli anlatır.)
  (V9: canvas'ta data-aura-waves="lite"): daha soluk, daha az perde ve zerre, ~20 kare/sn —
  tam sürümün iş yükünün yaklaşık %23'ü.
- Tüm sayfalarda kayma hareketleri kaldırıldı: öğeler aşağıdan/yukarıdan/yandan kayarak
  gelmez, sadece yumuşakça belirir (menü, logo, yazılar, kutular, kartlar, sayfa geçişi).
  Hakkımızda rozetinin süzülmesi ve ana sayfa arka plan görselinin kayması da durduruldu.

V9'da (ana sayfa — sınıf ve ders türleri):
- Branş kutularının üstünde ikonlu etiket bandı:
  Sınıflar: Kadınlara özel · Erkeklere özel · Karma · Çocuk
  Dersler: Stüdyo · Online · Outdoor · Kurumsal

V9'da (SSS):
- Branş sayfası formatı: solda başlık + WhatsApp/telefon kartları, sağda ışıklı akordeon.
- Aynı anda tek soru açık kalır; masaüstünde en uzun cevap açıkken bile tek ekran.

V9'da (Hakkımızda / İletişim):
- Branş sayfalarıyla aynı çerçeve: aura ışıkları, altın vurgular, masaüstünde tek ekran.
- Hakkımızda: ışıklı çerçevede portre, 0'dan sayan "20+ yıl" rozeti, federasyon kartları.
- İletişim: halkalı ikonlu iletişim kartları, koyu temalı harita ve konumda atan aura
  halkaları, "Yol tarifi al" butonu.
- NOT: Instagram bağlantısı hâlâ https://www.instagram.com/ — gerçek profil adresiyle
  değiştirin (contact.html).

V9'da (branş sayfaları: pilates / yoga / fitness / dance):
- Ana sayfa tarzında yeniden tasarlandı: aura ışıkları, altın vurgular, masaüstünde tek ekran
  (1280x720 – 1920x1080 arası ölçüldü). Solda metin + programlar, sağda fotoğraf galerisi.
- Galeri: yumuşak geçiş + yavaş yakınlaşma, ilerleme çizgisi (üzerine gelince durur),
  küçük resimler, oklar, klavye ve parmakla kaydırma, imlece göre hafif 3B eğim.
- Fotoğraflar: assets/gallery/<branş>/<branş>-01.jpg ... (Gallery klasöründen kopyalandı).
  Fotoğraf değiştirmek için aynı adla üzerine kaydetmek yeterli; sayı değişirse
  sayfadaki slayt ve küçük resim listesini de güncelleyin.
- Galerinin altında KVKK notu var.

V9'da (ana sayfa):
- Ana sayfa tüm cihazlarda tek, ortalı sütun. Büyük logo kaldırıldı (menüde logo var).
- Masaüstünde (1280x720 ve üstü) her şey tek ekrana sığar; telefonda sayfa kayar.
- Slogan, tanıtım metni ve Atatürk alıntısı kaldırıldı.
- Yazı sırası: LONGEVITY & WELLNESS STUDIO → Aura Reform; longevity ve wellness... →
  4 hizmet (numarasız) → Her detay "Kişiye Özel"... → AURA REFORM İLE GENÇ KALMAK
  BİR YAŞAM BİÇİMİDİR. (tek satır, el yazısı yok) → Egzersiz Niteliği & Hijyen Standartları... → branş kutuları.
- Kenarlarda kuzey ışığı gibi dalgalanan aura perdeleri, kenar hâlesi ve süzülen ışık zerreleri (canvas).
- Menü çubuğu (tüm sayfalarda): logo girişi + nefes alan parıltı + üzerinden geçen ışık,
  menü bağlantıları sırayla gelir, üzerine gelince/aktif sayfada renkli alt çizgi,
  İLETİŞİM butonunda dönen ışıklı kenar, alt çizgide akan aura ışığı,
  telefonda menü düğmesi X'e dönüşür ve menü öğeleri kayarak gelir.
- Logoya giriş + ışık süzülme efekti, branş kutularına giriş ve ışık takibi eklendi.
- Aşağıdaki öğeler ekrana girdikçe animasyonla gelir.
- Tüm animasyonlar "hareketi azalt" ayarı açık cihazlarda kapanır.

AURA REFORM — V7
================

Bu sürümde:
- PILATES / FITNESS yazımları Türkçe büyük harf dönüşümünden bağımsız hale getirildi.
- Branş sayfaları tek ekranlık premium sayfa düzenine dönüştürüldü.
- "Aura yaklaşımı" kaldırıldı; yerine kayan görsel galerisi geldi.
- Açıklamalar, programlar ve alıntılar korundu.
- Branş videoları ayrı modal pencerede açılıyor.
- Yorum kartlarına avatar alanı eklendi ve kartlar yatay kayıyor.
- İletişim bölümünün haritası korunurken sağ bölüm daha görsel/efektli hale getirildi.
- Logo dosyası güncel logoMain.png ile yenilendi.

GERÇEK GÖRSELLERİ DEĞİŞTİRME
-----------------------------
Her branş için örnek dosyalar:
assets/placeholders/pilates-01.svg ... pilates-04.svg
assets/placeholders/fitness-01.svg ... fitness-04.svg
assets/placeholders/yoga-01.svg ... yoga-04.svg
assets/placeholders/dance-01.svg ... dance-04.svg

HTML içinde src değerlerini kendi jpg/png/webp dosyalarınızla değiştirebilirsiniz.

VİDEOLAR
--------
assets/media/pilates.mp4
assets/media/fitness.mp4
assets/media/yoga.mp4
assets/media/dance.mp4

YORUM AVATARLARI
----------------
Şu an assets/avatars/avatar-01.svg ... avatar-06.svg generic yer tutuculardır.
Gerçek danışan fotoğrafları onaylıysa aynı alanlarda kendi fotoğraflarınızla değiştirilebilir.

INSTAGRAM
---------
contact.html içindeki https://www.instagram.com/ adresini gerçek Aura Reform Instagram profili ile değiştirin.
