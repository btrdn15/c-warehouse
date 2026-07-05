# Агуулах — Бараа хяналт

Солонгосоос Монгол руу контейнероор бараа тээвэрлэх хяналтын вэбсайт.

## Локал дээр ажиллуулах

```bash
npm install
npm run dev
```

Дараа нь http://localhost:3000 нээнэ.

## Интернэт дээр гаргах (цөөн хүнд л)

### 1. GitHub руу оруулах

```bash
git init
git add .
git commit -m "warehouse app"
git remote add origin https://github.com/ТАНЫ-НЭР/warehouse.git
git push -u origin main
```

### 2. Railway дээр deploy (зөвлөмж)

1. [railway.app](https://railway.app) → бүртгүүлнэ
2. **New Project** → **Deploy from GitHub repo** → энэ repo-гоо сонгоно
3. **Variables** хэсэгт нэмнэ:
   - `SITE_PASSWORD` = тааралцах нууц үг (жишээ: `agulaah2026`)
4. **Settings** → **Volumes** → volume нэмээд mount path: `/app/data`
   - SQLite өгөгдөл устахгүй байхын тулд заавал хэрэгтэй
5. Deploy дууссаны дараа **Settings** → **Networking** → **Generate Domain**
   - `xxx.up.railway.app` гэх URL гарна

### 3. Хэдэн хүндээ хуваалцах

- Railway-ийн URL + нууц үгийг (`SITE_PASSWORD`) зөвхөн хэрэглэх хүмүүстээ илгээнэ
- Domain худалдаж авах шаардлагагүй
- Хэн ч URL-ийг мэдэхгүй, нууц үггүй бол орох боломжгүй

### Render (өөр сонголт)

1. [render.com](https://render.com) → Web Service
2. Build: `npm install && npm run build`
3. Start: `npm start`
4. Environment: `SITE_PASSWORD=танай-нууц-үг`
5. Disk нэмж `/app/data` mount хийнэ

## Нууц үг

- `SITE_PASSWORD` тохируулбал нэвтрэх хуудас гарна
- Локал дээр нууц үггүй ажиллуулах бол env variable тохируулахгүй байна
- Production дээр заавал тохируулаарай

## Технологи

- Next.js 15, Tailwind CSS, SQLite
