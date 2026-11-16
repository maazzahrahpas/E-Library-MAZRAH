import { Book, Category, LiteracyChallenge, BadgeDefinition, Announcement, SystemSettings } from '../types/library';

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-1', name: "Al-Qur'an dan Tafsir", slug: 'al-quran-tafsir', icon: 'BookOpen', bookCount: 14, description: 'Kajian ayat suci Al-Qur\'an, kaidah tafsir tematik, dan asbabun nuzul.', color: 'from-emerald-500 to-teal-600' },
  { id: 'cat-2', name: 'Hadis & Ilmu Hadis', slug: 'hadis', icon: 'Scroll', bookCount: 12, description: 'Kumpulan hadis shahih, musthalah hadis, dan syarah hadis arbain.', color: 'from-teal-500 to-cyan-600' },
  { id: 'cat-3', name: 'Akidah dan Akhlak', slug: 'akidah-akhlak', icon: 'HeartHandshake', bookCount: 15, description: 'Penanaman keimanan kuat, tasawuf akhlaki, dan adab thalabul ilmi.', color: 'from-indigo-500 to-violet-600' },
  { id: 'cat-4', name: 'Fikih & Ushul Fikih', slug: 'fikih', icon: 'Scale', bookCount: 18, description: 'Hukum ibadah, muamalah kontemporer, faraidh, dan ushul fiqh madrasah.', color: 'from-purple-500 to-indigo-600' },
  { id: 'cat-5', name: 'Sejarah Kebudayaan Islam', slug: 'ski', icon: 'Hourglass', bookCount: 10, description: 'Sejarah Khulafaur Rasyidin, Bani Umayyah, Abbasiyah, dan peradaban Nusantara.', color: 'from-amber-500 to-orange-600' },
  { id: 'cat-6', name: 'Bahasa Arab & Sastra', slug: 'bahasa-arab', icon: 'Languages', bookCount: 11, description: 'Nahwu, Sharaf, Balaghah, dan muhadatsah praktis santri madrasah.', color: 'from-blue-500 to-indigo-600' },
  { id: 'cat-7', name: 'Bahasa Indonesia', slug: 'bahasa-indonesia', icon: 'Feather', bookCount: 16, description: 'Apresiasi sastra nusantara, tata bahasa baku, dan karya ilmiah remaja.', color: 'from-rose-500 to-pink-600' },
  { id: 'cat-8', name: 'Bahasa Inggris', slug: 'bahasa-inggris', icon: 'Globe', bookCount: 13, description: 'Academic English, TOEFL preparation, and global communicative skills.', color: 'from-cyan-500 to-blue-600' },
  { id: 'cat-9', name: 'Matematika Terapan', slug: 'matematika', icon: 'Binary', bookCount: 14, description: 'Kalkulus, aljabar linier, statistika probabilitas, dan olimpiade madrasah.', color: 'from-violet-500 to-purple-700' },
  { id: 'cat-10', name: 'Sains & Teknologi (IPA)', slug: 'sains-ipa', icon: 'Atom', bookCount: 20, description: 'Biologi sel, fisika kuantum dasar, kimia analitik, dan informatika madrasah.', color: 'from-sky-500 to-blue-700' },
  { id: 'cat-11', name: 'Sosial & Humaniora (IPS)', slug: 'sosial-ips', icon: 'Users', bookCount: 12, description: 'Ekonomi syariah, sosiologi masyarakat pedesaan-perkotaan, dan geografi.', color: 'from-emerald-600 to-green-700' },
  { id: 'cat-12', name: 'Pengembangan Diri & Motivasi', slug: 'pengembangan-diri', icon: 'Sparkles', bookCount: 17, description: 'Mindset juara, manajemen waktu belajar, dan kepemimpinan generasi muslim.', color: 'from-amber-500 to-yellow-600' },
  { id: 'cat-13', name: 'Novel & Fiksi Inspiratif', slug: 'novel-fiksi', icon: 'BookMarked', bookCount: 15, description: 'Novel edukatif, kisah perjuangan santri, dan fiksi penuh hikmah.', color: 'from-fuchsia-500 to-purple-600' }
];

export const INITIAL_BOOKS: Book[] = [
  {
    id: 'book-001',
    title: 'Fikih Ibadah & Muamalah Kontemporer Madrasah Aliyah',
    author: 'Drs. H. Ahmad Mustofa, M.Ag',
    publisher: 'Pustaka MA Az Zahrah Pasuruan Press',
    year: 2024,
    isbn: '978-602-8821-41-2',
    category: 'Fikih & Ushul Fikih',
    synopsis: 'Buku rujukan komprehensif bagi santri dan siswa MA Az Zahrah kelas X-XII yang mengupas tuntas hukum fikih madzhab Syafi\'i mulai dari thaharah, shalat berjamaah, zakat produktif, hingga transaksi digital dompet elektronik masa kini.',
    pages: 184,
    format: 'pdf',
    coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    availableCopies: 12,
    totalCopies: 15,
    classLevel: 'Semua',
    subject: 'Fikih',
    isPopular: true,
    isFeatured: true,
    rating: 4.9,
    reviewCount: 38,
    readsCount: 245,
    createdAt: '2026-01-10T08:00:00Z',
    contentSnippet: `BAB I: KEDUDUKAN HUKUM ISLAM DALAM KEHIDUPAN MODERN
Fikih secara etimologis bermakna pemahaman yang mendalam (al-fahmu al-’amiq). Di era revolusi digital abad ke-21, siswa MA Az Zahrah Pasuruan dituntut mampu membedakan prinsip tsawabit (pokok ajaran yang tetap) dan mutaghayyirat (hal fleksibel yang beradaptasi dengan kemaslahatan zaman).

Pasal 1: Bersuci dan Urgensi Menjaga Ekosistem Lingkungan
Air adalah salah satu nikmat agung Allah SWT. Islam membagi air ke dalam empat kategori: thahir muthahhir (suci menyucikan), thahir ghairu muthahhir (suci tidak menyucikan), makruh, dan mutanajjis. Di lingkungan madrasah, penghematan air wudhu merupakan bagian dari akhlakul karimah.

Pasal 2: Shalat Khusyu' Sebagai Fondasi Mental Santri
Shalat bukan semata kewajiban formal rukun Islam, melainkan media dialog langsung seorang hamba dengan Sang Pencipta. Khusyu' diawali dengan ketertiban batin, kejernihan pikiran, dan pemahaman makna setiap bacaan shalat.`
  },
  {
    id: 'book-002',
    title: 'Tafsir Tematik Ayat-Ayat Sains & Kosmologi untuk Generasi Z',
    author: 'Dr. Nurul Hidayati, M.Pd & Tim Guru MAZRAH',
    publisher: 'Madrasah Az Zahrah Pasuruan Publishing',
    year: 2025,
    isbn: '978-623-7190-12-8',
    category: "Al-Qur'an dan Tafsir",
    synopsis: 'Menjelaskan harmonisasi ayat-ayat kauniyah Al-Qur\'an dengan penemuan sains modern mulai dari teori Big Bang, siklus hidrologi, hingga anatomi embriologi manusia dengan pendekatan visual interaktif.',
    pages: 210,
    format: 'pdf',
    coverUrl: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?auto=format&fit=crop&w=600&q=80',
    availableCopies: 8,
    totalCopies: 10,
    classLevel: 'XI',
    subject: "Al-Qur'an Hadis",
    isPopular: true,
    isFeatured: true,
    rating: 4.8,
    reviewCount: 29,
    readsCount: 310,
    createdAt: '2026-02-15T09:30:00Z',
    contentSnippet: `MUKADIMAH: AL-QUR'AN DAN MISTERI ALAM SEMESTA
Surah Al-Anbiya ayat 30 berbunyi: "Dan apakah orang-orang kafir tidak mengetahui bahwa langit dan bumi keduanya dahulu menyatu, kemudian Kami pisahkan antara keduanya..."
Para mufassir modern menggarisbawahi keselarasan deskripsi Qur'ani ini dengan teori kosmologi modern mengenai pemuaian alam semesta.

Bab 2: Siklus Hujan dan Lapisan Atmosfer Pelindung
Al-Qur'an menyebutkan langit yang diciptakan sebagai "saqfan mahfuzhan" (atap yang terpelihara). Fenomena medan magnet bumi (Van Allen Belt) dan lapisan ozon yang memfilter radiasi ultraviolet ultraviolet matahari merupakan bukti nyata kebesaran Sang Maha Perancang.`
  },
  {
    id: 'book-003',
    title: 'Sejarah Peradaban Islam Nusantara & Jejak Ulama Pasuruan',
    author: 'K.H. Zainal Arifin & Sholahuddin Al-Ayyubi',
    publisher: 'Pustaka Nahdliyyin Pasuruan',
    year: 2024,
    isbn: '978-602-5441-99-3',
    category: 'Sejarah Kebudayaan Islam',
    synopsis: 'Mengungkap khazanah emas dakwah Islam santun Walisongo di pesisir Jawa Timur, peran pelabuhan Pasuruan tempo doeloe, serta keteladanan ulama kharismatik KH. Abdul Hamid Pasuruan dalam membangun peradaban santun.',
    pages: 165,
    format: 'pdf',
    coverUrl: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=600&q=80',
    availableCopies: 14,
    totalCopies: 15,
    classLevel: 'X',
    subject: 'SKI',
    isPopular: true,
    isFeatured: false,
    rating: 5.0,
    reviewCount: 45,
    readsCount: 412,
    createdAt: '2026-01-20T11:00:00Z',
    contentSnippet: `BAB 1: KOTA PASURUAN DALAM PETA DAKWAH MARITIM JAWA TIMUR
Kota Pasuruan pada abad ke-16 hingga 18 merupakan salah satu simpul perdagangan rempah dan pelabuhan laut utama di pesisir utara Jawa. Jalur ini menjadi pintu masuk syiar Islam yang damai melalui akulturasi budaya, perdagangan yang jujur, dan perkawinan antar warga bangsawan dan saudagar muslim.

Bab 2: Warisan Karomah & Akhlak Mbah Hamid Pasuruan
Keteladanan K.H. Abdul Hamid Pasuruan melegenda karena keluasan kasih sayang beliau kepada semua kalangan masyarakat, santri, dan pejabat. Kerendahan hati beliau dalam memuliakan tamu dan kesabaran dalam menuntut ilmu menjadi inspirasi abadi santri MA Az Zahrah.`
  },
  {
    id: 'book-004',
    title: 'Biologi Modern Berbasis Riset & Nilai Islami Kelas XI MA',
    author: 'Siti Rahmawati, S.Si, M.Biotech',
    publisher: 'Erlangga Madrasah Series',
    year: 2025,
    isbn: '978-602-2987-01-5',
    category: 'Sains & Teknologi (IPA)',
    synopsis: 'Membahas struktur sel, sistem pencernaan, respirasi, sirkulasi darah, genetika molekuler, dan bioteknologi modern dengan studi kasus kesehatan santri serta praktikum laboratorium virtual.',
    pages: 240,
    format: 'pdf',
    coverUrl: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=600&q=80',
    availableCopies: 9,
    totalCopies: 12,
    classLevel: 'XI',
    subject: 'Biologi',
    isPopular: false,
    isFeatured: false,
    rating: 4.7,
    reviewCount: 22,
    readsCount: 180,
    createdAt: '2026-02-01T14:20:00Z',
    contentSnippet: `BAB 3: KEINDAHAN STRUKTUR DNA DAN KROMOSOM
DNA (Deoxyribonucleic Acid) tersusun atas untaian heliks ganda yang menyimpan miliaran kode genetik informasi hayati. Dalam perspektif tadabbur alam, ketelitian replikasi DNA membuktikan tiada sesuatupun yang tercipta secara kebetulan di muka bumi ini.`
  },
  {
    id: 'book-005',
    title: 'Menembus Langit Cita: Seni Manajemen Waktu & Produktivitas Santri',
    author: 'Muhammad Rifqi Ramadhani, S.Psi',
    publisher: 'Gagas Inspirasi Pasuruan',
    year: 2025,
    isbn: '978-623-8812-70-1',
    category: 'Pengembangan Diri & Motivasi',
    synopsis: 'Buku praktis pembakar semangat bagi siswa MA Az Zahrah agar mahir menyeimbangkan hafalan Al-Qur\'an, tugas kurikulum nasional, organisasi OSIM, serta persiapan seleksi PTN dan beasiswa luar negeri.',
    pages: 148,
    format: 'pdf',
    coverUrl: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=600&q=80',
    availableCopies: 15,
    totalCopies: 20,
    classLevel: 'Semua',
    subject: 'Bimbingan Konseling',
    isPopular: true,
    isFeatured: true,
    rating: 4.9,
    reviewCount: 56,
    readsCount: 520,
    createdAt: '2026-01-05T10:15:00Z',
    contentSnippet: `BAB 1: PARADOKS WAKTU 24 JAM
Setiap manusia diberikan modal waktu yang sama persis: 1.440 menit setiap hari. Yang membedakan seorang pemenang dan yang tertinggal adalah prioritas (al-awlawiyyat).
Rumus Eisenhower Matrix untuk Santri MAZRAH:
1. Mendesak & Penting: Shalat fardhu, tugas esok hari, ujian semester.
2. Tidak Mendesak tapi Penting: Membaca buku literasi, menghafal Al-Qur'an, olahraga, investasi keterampilan coding.`
  },
  {
    id: 'book-006',
    title: 'Matematika Peminatan & Penalaran Logis untuk Kelas XII',
    author: 'Ir. Budi Santoso, M.Sc',
    publisher: 'Madrasah Sains Terpadu',
    year: 2024,
    isbn: '978-602-4412-88-0',
    category: 'Matematika Terapan',
    synopsis: 'Dilengkapi trik cepat kalkulus diferensial, integral substitusi, trigonometri analitik, dan strategi menaklukkan soal UTBK SNBT serta Olimpiade Sains Madrasah (KSM).',
    pages: 198,
    format: 'pdf',
    coverUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80',
    availableCopies: 10,
    totalCopies: 10,
    classLevel: 'XII',
    subject: 'Matematika',
    isPopular: false,
    isFeatured: false,
    rating: 4.6,
    reviewCount: 18,
    readsCount: 165,
    createdAt: '2026-02-10T16:00:00Z',
    contentSnippet: `BAB 4: INTEGRAL DAN APLIKASI LUAS DAERAH
Integral tentu merupakan limit dari penjumlahan Riemann. Konsep ini digunakan dalam arsitektur modern kubah masjid hingga kalkulasi volume roket antariksa.`
  },
  {
    id: 'book-007',
    title: 'Santri Menatap Mentari: Kumpulan Cerpen Inspiratif Siswa MA Az Zahrah',
    author: 'Komunitas Literasi Pena MAZRAH',
    publisher: 'Az Zahrah Creative Press',
    year: 2025,
    isbn: '978-623-9912-33-4',
    category: 'Novel & Fiksi Inspiratif',
    synopsis: 'Antologi cerita pendek karya santriwati dan santriwan MA Az Zahrah Kota Pasuruan yang merekam suka duka menggapai mimpi, persahabatan di asrama, cinta ilmu, dan cinta tanah air.',
    pages: 172,
    format: 'pdf',
    coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80',
    availableCopies: 18,
    totalCopies: 20,
    classLevel: 'Semua',
    subject: 'Bahasa Indonesia',
    isPopular: true,
    isFeatured: true,
    rating: 4.9,
    reviewCount: 64,
    readsCount: 489,
    createdAt: '2026-01-28T13:45:00Z',
    contentSnippet: `CERPEN 1: LENTERA DI SUDUT PERPUSTAKAAN
Oleh: Aisyah Nur Fathimah (Kelas XI MIA)
Malam itu angin dari Selat Madura berhembus sejuk menyapa pelataran MA Az Zahrah. Di sudut ruang baca perpustakaan, aroma kertas buku tua berpadu dengan ketenangan malam yang hening. Farhan masih menatap lembar catatan rumusnya dengan mata berbinar...`
  },
  {
    id: 'book-008',
    title: 'Nahwu & Shorof Praktis Metode Al-Azhar Pasuruan',
    author: 'Ust. H. Mahrus Ali, Lc',
    publisher: 'Pustaka Santri Pasuruan',
    year: 2024,
    isbn: '978-602-7712-40-1',
    category: 'Bahasa Arab & Sastra',
    synopsis: 'Metode cepat memahami kaidah i\'rob jurumiyyah, tasrif istilahi dan lughawi, serta teknik membaca kitab kuning gundul tanpa harakat dengan sistem mind-mapping ramah pemula.',
    pages: 156,
    format: 'pdf',
    coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80',
    availableCopies: 11,
    totalCopies: 15,
    classLevel: 'X',
    subject: 'Bahasa Arab',
    isPopular: true,
    isFeatured: false,
    rating: 4.8,
    reviewCount: 31,
    readsCount: 290,
    createdAt: '2026-02-05T09:00:00Z',
    contentSnippet: `PASAL KALAM:
Kalam menurut ulama Nahwu adalah: Lafazh yang tersusun, berfaedah (memberi kepahaman), dan berbahasa Arab. Pembagian kata terbagi tiga: Isim (kata benda), Fi'il (kata kerja), dan Huruf (kata sambung).`
  }
];

export const INITIAL_CHALLENGES: LiteracyChallenge[] = [
  {
    id: 'chal-01',
    title: 'Tantangan Khatam 5 Buku Ramadhan & Syawal',
    description: 'Selesaikan membaca minimal 5 buku keislaman dan sains dalam rentang waktu 30 hari untuk memperkuat literasi keagamaan dan intelektual.',
    targetBooks: 5,
    targetDays: 30,
    rewardPoints: 250,
    badgeReward: 'Master Reader',
    startDate: '2026-03-01',
    endDate: '2026-04-30',
    participantsCount: 142,
    isActive: true
  },
  {
    id: 'chal-02',
    title: 'Safari Literasi Ulama Nusantara',
    description: 'Jelajahi dan ulas 3 buku sejarah Islam Nusantara dan biografi ulama Jawa Timur.',
    targetBooks: 3,
    targetDays: 14,
    rewardPoints: 150,
    badgeReward: 'Book Explorer',
    startDate: '2026-03-10',
    endDate: '2026-03-31',
    participantsCount: 88,
    isActive: true
  },
  {
    id: 'chal-03',
    title: 'Pekan Sains & Matematika Madrasah',
    description: 'Baca modul praktikum sains dan selesaikan tantangan logika numerik.',
    targetBooks: 2,
    targetDays: 7,
    rewardPoints: 100,
    badgeReward: 'Madrasah Scholar',
    startDate: '2026-03-15',
    endDate: '2026-03-25',
    participantsCount: 65,
    isActive: true
  }
];

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  { id: 'new-reader', name: 'New Reader', description: 'Membaca buku pertama di E-Library MAZRAH', icon: 'Sparkles', category: 'reading', requiredPoints: 20, color: 'from-blue-400 to-indigo-500' },
  { id: 'book-explorer', name: 'Book Explorer', description: 'Membaca dari 3 kategori buku berbeda', icon: 'Compass', category: 'reading', requiredPoints: 100, color: 'from-emerald-400 to-teal-600' },
  { id: 'reading-enthusiast', name: 'Reading Enthusiast', description: 'Mencapai total 500 poin literasi aktif', icon: 'Flame', category: 'reading', requiredPoints: 500, color: 'from-amber-400 to-orange-500' },
  { id: 'master-reader', name: 'Master Reader', description: 'Menyelesaikan 10 buku digital secara tuntas', icon: 'Award', category: 'reading', requiredPoints: 1000, color: 'from-purple-500 to-pink-500' },
  { id: 'literacy-champion', name: 'Literacy Champion', description: 'Peringkat 1 Leaderboard Madrasah Az Zahrah', icon: 'Crown', category: 'special', requiredPoints: 2000, color: 'from-yellow-400 to-amber-600' },
  { id: 'daily-streaker', name: 'Daily Streaker', description: 'Membaca berturut-turut selama 7 hari tanpa putus', icon: 'Zap', category: 'streak', requiredPoints: 300, color: 'from-rose-500 to-red-600' },
  { id: 'madrasah-scholar', name: 'Madrasah Scholar', description: 'Menulis 5 ulasan berbobot dan menyelesaikan buku rujukan fikih & tafsir', icon: 'GraduationCap', category: 'special', requiredPoints: 750, color: 'from-teal-500 to-cyan-600' },
  { id: 'night-owl', name: 'Night Owl Reader', description: 'Membaca di atas jam 20:00 untuk tadabbur ilmu malam', icon: 'Moon', category: 'special', requiredPoints: 150, color: 'from-violet-600 to-indigo-800' }
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-01',
    title: 'Peluncuran Resmi E-Library MAZRAH MA Az Zahrah Pasuruan',
    content: 'Alhamdulillah, platform perpustakaan digital resmi E-Library MAZRAH telah diluncurkan. Seluruh siswa kelas X, XI, dan XII dapat masuk menggunakan akun madrasah dan menikmati fasilitas ribuan buku digital, modul ajar, dan gamifikasi literasi bertabur hadiah menarik.',
    authorName: 'Ustadzah Siti Aminah, S.Pd',
    authorRole: 'Kepala Perpustakaan MAZRAH',
    priority: 'penting',
    targetAudience: 'Semua',
    createdAt: '2026-03-01T07:30:00Z'
  },
  {
    id: 'ann-02',
    title: 'Sayembara Resensi Buku & Duta Literasi MAZRAH 2026',
    content: 'Diberitahukan kepada seluruh santri MA Az Zahrah, raih poin literasi tertinggi dan tulis ulasan terbaik di aplikasi E-Library MAZRAH. Pemenang bulanan akan dinobatkan sebagai Duta Literasi Madrasah dan mendapatkan sertifikat kehormatan serta voucher beasiswa buku.',
    authorName: 'H. Ahmad Fauzi, M.Pd.I',
    authorRole: 'Waka Kesiswaan',
    priority: 'penting',
    targetAudience: 'Siswa',
    createdAt: '2026-03-02T10:00:00Z'
  },
  {
    id: 'ann-03',
    title: 'Tata Tertib Peminjaman Buku Fisik dan Akses Digital',
    content: 'Maksimal peminjaman buku fisik adalah 3 buku selama 7 hari kerja. Keterlambatan pengembalian dikenakan infaq denda sebesar Rp 1.000,- per hari untuk pemeliharaan buku perpustakaan. Akses baca digital dapat dinikmati 24 jam bebas biaya.',
    authorName: 'Petugas Sirkulasi',
    authorRole: 'Admin Perpustakaan',
    priority: 'normal',
    targetAudience: 'Semua',
    createdAt: '2026-03-03T08:15:00Z'
  }
];

export const INITIAL_SETTINGS: SystemSettings = {
  appName: 'E-Library MAZRAH',
  madrasahName: 'MA AZ ZAHRAH KOTA PASURUAN',
  maxBorrowDays: 7,
  maxBorrowBooks: 3,
  finePerDay: 1000,
  dailyReadingTargetMinutes: 15,
  announcementBanner: 'Jelajahi Dunia, Mulai dari Membaca — MA Az Zahrah Pasuruan'
};
