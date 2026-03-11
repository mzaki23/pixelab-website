# PIXELAB.ID - Creative Digital Agency Website

Website agency kreatif dengan desain monotone (hitam-putih-abu) yang modern dan profesional, dilengkapi dengan dashboard admin untuk mengelola konten.

## 🎨 Fitur Website

### Frontend (User-Facing)
- **Homepage** dengan hero section yang eye-catching
- **Services** - 4 layanan utama (Social Media Management, Event Documentation, Content Creation, Graphic Design)
- **Portfolio** - Grid portfolio dengan filter berdasarkan kategori
- **About Us** - Informasi agency dan team
- **Testimonials** - Review dari klien
- **Contact Form** - Form untuk inquiry dengan validasi
- **Responsive Design** - Mobile-friendly

### Admin Dashboard
- **Authentication** - Login system sederhana
- **Overview Dashboard** - Statistik dan pesan terbaru
- **Portfolio Management** - CRUD portfolio items
- **Testimonials Management** - CRUD testimonials
- **Messages Management** - Lihat dan hapus pesan dari contact form

## 🚀 Cara Menggunakan

### 1. Setup Website
1. Upload semua file ke hosting (index.html, styles.css, script.js, admin.html, admin-styles.css, admin-script.js)
2. Pastikan semua file berada di root directory yang sama
3. Akses website melalui domain Anda

### 2. Login ke Admin Dashboard
1. Buka `admin.html` atau klik tombol "Admin" di navigation
2. Login dengan kredensial default:
   - **Username:** admin
   - **Password:** admin123
3. Setelah login, Anda akan masuk ke dashboard

### 3. Mengelola Portfolio
1. Klik menu "Portfolio" di sidebar
2. Klik "Add New Project" untuk menambah project baru
3. Isi form:
   - Project Title
   - Category (Social Media, Event, Content, Design)
   - Image URL (gunakan URL gambar dari Unsplash atau hosting Anda)
4. Klik "Save Project"
5. Untuk edit/delete, klik tombol pada tabel

### 4. Mengelola Testimonials
1. Klik menu "Testimonials" di sidebar
2. Klik "Add Testimonial"
3. Isi form dengan testimonial text, nama author, dan company
4. Klik "Save Testimonial"

### 5. Melihat Pesan dari Contact Form
1. Klik menu "Messages" di sidebar
2. Semua pesan dari contact form akan muncul di sini
3. Anda bisa menghapus pesan yang sudah dibaca

## 📁 Struktur File

```
pixelab-website/
│
├── index.html              # Homepage utama
├── styles.css              # Styling untuk homepage
├── script.js               # JavaScript untuk homepage
│
├── admin.html              # Admin dashboard
├── admin-styles.css        # Styling untuk admin dashboard
└── admin-script.js         # JavaScript untuk admin dashboard
```

## 🎨 Desain & Styling

### Color Palette (Monotone)
- Black: `#000000`
- White: `#FFFFFF`
- Gray variations: `#1a1a1a` hingga `#f5f5f5`

### Typography
- **Display Font:** Archivo Black (untuk headings)
- **Body Font:** DM Sans (untuk paragraf)
- **Mono Font:** Space Mono (untuk labels & buttons)

### Design Philosophy
- **Brutalist Minimalism** - Bold, clean, dan straightforward
- **Editorial Elegance** - Tipografi yang kuat dengan spacing yang tepat
- **High Contrast** - Menggunakan kontras hitam-putih untuk visual impact

## 💾 Data Storage

Website ini menggunakan **localStorage** browser untuk menyimpan data:
- Portfolio items
- Testimonials
- Contact messages
- Admin login status

**Catatan:** Data akan tersimpan di browser. Untuk production, disarankan menggunakan backend database seperti MySQL, MongoDB, atau Firebase.

## 🔒 Keamanan

### Login Admin
- Username: `admin`
- Password: `admin123`

**PENTING:** Untuk production:
1. Ganti password default
2. Implementasi backend authentication (PHP, Node.js, dll)
3. Gunakan HTTPS
4. Tambahkan rate limiting untuk login attempts

## 🌐 Hosting

Website ini bisa di-hosting di:
- **Netlify** (gratis, recommended)
- **Vercel** (gratis)
- **GitHub Pages** (gratis)
- **Shared Hosting** (cPanel)
- **VPS** (DigitalOcean, AWS, dll)

### Cara Upload ke Netlify:
1. Daftar di netlify.com
2. Drag & drop folder website
3. Domain otomatis dibuat (atau custom domain)
4. Done!

## 📝 Customization

### Mengganti Logo & Brand
1. Edit file `index.html` dan `admin.html`
2. Cari "PIXELAB.ID" dan ganti dengan nama brand Anda
3. Update meta tags untuk SEO

### Mengganti Warna
1. Edit file `styles.css` dan `admin-styles.css`
2. Ubah CSS variables di `:root`
3. Sesuaikan warna sesuai brand identity

### Menambah/Mengurangi Services
1. Edit section `services` di `index.html`
2. Tambah/kurangi `.service-card`
3. Sesuaikan grid layout di CSS jika perlu

## 🐛 Troubleshooting

### Portfolio tidak muncul?
- Cek browser console (F12) untuk error
- Pastikan localStorage tidak penuh
- Clear cache dan reload

### Login admin tidak bisa?
- Pastikan JavaScript enabled
- Cek kredensial: admin / admin123
- Clear localStorage: `localStorage.clear()`

### Gambar tidak muncul?
- Pastikan URL gambar valid
- Gunakan HTTPS URL untuk gambar
- Cek apakah gambar di-block oleh CORS

## 📞 Support

Untuk pertanyaan atau bantuan:
- Email: hello@pixelab.id
- WhatsApp: +62 812-3456-7890
- Instagram: @pixelab.id

## 📄 License

Website template ini free to use untuk personal dan commercial projects.

---

**Built with ❤️ by Claude for Pixelab.id**

Version 1.0 - March 2024
