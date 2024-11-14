# E-Commerce App

Ini adalah proyek aplikasi e-commerce yang dibangun menggunakan **Express.js** untuk backend dan **React.js** (dengan Vite) untuk frontend. Aplikasi ini menggunakan **MongoDB** sebagai database, dan **Cloudinary** untuk penyimpanan gambar.

## Daftar Isi

- [Cara Menjalankan Aplikasi](#cara-menjalankan-aplikasi)
  - [Prasyarat](#prasyarat)
  - [1. Clone Repository](#1-clone-repository)
  - [2. Konfigurasi Environment Variables](#2-konfigurasi-environment-variables)
    - [Backend (.env)](#backend-env)
    - [Frontend (.env.local)](#frontend-envlocal)
  - [3. Menjalankan Backend](#3-menjalankan-backend)
  - [4. Menjalankan Frontend](#4-menjalankan-frontend)

## Cara Menjalankan Aplikasi

### Prasyarat

Pastikan Anda telah menginstal:

- [Node.js](https://nodejs.org/en/) versi terbaru
- [MongoDB](https://www.mongodb.com/) (Anda dapat menggunakan MongoDB Atlas)
- [Vite](https://vitejs.dev/)

### 1. Clone Repository

```bash
git clone https://github.com/faukiofficial/ecommerce-MERN.git
cd ecommerce-MERN
```

### 2. Konfigurasi Environment Variables

- Backend (.env)
    - MONGO_URI=
    - PORT=
    - CLOUDINARY_CLOUD_NAME=
    - CLOUDINARY_API_KEY=
    - CLOUDINARY_API_SECRET=
    - JWT_SECRET=
    - NODE_ENV=

- Frontend (.env.local)
    - VITE_RAJAONGKIR_KEY=

 ### 3. Menjalankan Backend

 ```bash
cd server
npm install
npm start
```

 ### 4. Menjalankan Frontend

 ```bash
cd client
npm install
npm run dev
```
