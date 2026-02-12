# Valentine Card Maker 💖

เว็บแอปพลิเคชันสำหรับสร้างการ์ดวาเลนไทน์สุดน่ารักพร้อมระบบเลือกของขวัญแบบโต้ตอบ

## 🎯 Features

### สำหรับผู้ส่ง (Sender)
- **ขั้นตอนที่ 1**: อัปโหลดรูปภาพและเขียนข้อความหวานๆ
- **ขั้นตอนที่ 2**: เพิ่มของขวัญ 3-8 รายการ (รูปภาพ + ชื่อของขวัญ)
- รับลิงก์แชร์เพื่อส่งให้คนพิเศษ

### สำหรับผู้รับ (Receiver)
- **หน้า Landing**: ปุ่ม "No thanks" ที่หนีไปมา (ต้องกดค้างไว้ 2 วินาทีถึงจะปฏิเสธได้)
- **หน้าเปิดการ์ด**: Animation 3D flip เปิดการ์ด
- **หน้าเลือกของขวัญ**: เลือก 1 ใน gifts ที่ผู้ส่งเตรียมไว้
- **หน้าสรุป**: ดูการ์ดและของขวัญที่เลือก, บันทึกเป็นรูป, แชร์

## 🏗️ Architecture

### Frontend
- **React 18** + **TypeScript**
- **React Router** (Data Mode) - 6 หน้าหลัก
- **Tailwind CSS v4** - Styling system
- **Motion (Framer Motion)** - Animations
- **Sonner** - Toast notifications
- **html2canvas** - Save as image
- **qrcode.react** - QR code generation

### Backend (Supabase)
- **Hono Web Server** - Edge function API
- **Supabase Storage** - เก็บรูปภาพ (5MB limit per file)
- **KV Store** - เก็บข้อมูลการ์ด (key-value database)

## 📁 Project Structure

```
/src/app
├── pages/
│   ├── Home.tsx              # หน้าแรก
│   ├── CreateCard.tsx        # สร้างการ์ด (2 steps)
│   ├── CardLanding.tsx       # Landing page สำหรับผู้รับ
│   ├── CardReveal.tsx        # เปิดการ์ดแบบ 3D flip
│   ├── GiftSelection.tsx     # เลือกของขวัญ
│   ├── CardSummary.tsx       # สรุปและแชร์
│   └── NotFound.tsx          # 404 page
├── utils/
│   ├── api.ts                # API client สำหรับเรียก backend
│   └── clipboard.ts          # Clipboard utilities
├── components/               # React components
├── types.ts                  # TypeScript types
├── routes.ts                 # React Router config
└── App.tsx                   # Main app component

/supabase/functions/server
├── index.tsx                 # Hono web server with endpoints:
│                             #   POST /make-server-3a715eba/cards
│                             #   GET  /make-server-3a715eba/cards/:cardId
│                             #   PUT  /make-server-3a715eba/cards/:cardId/choice
│                             #   POST /make-server-3a715eba/upload
└── kv_store.tsx              # Key-value store utilities
```

## 🔌 API Endpoints

### `POST /make-server-3a715eba/cards`
สร้างการ์ดใหม่
```json
{
  "cardId": "abc123",
  "senderImage": "storage/...",
  "message": "Happy Valentine's Day!",
  "gifts": [
    { "id": "1", "name": "Chocolate", "image": "storage/..." }
  ]
}
```

### `GET /make-server-3a715eba/cards/:cardId`
ดึงข้อมูลการ์ด (แปลง storage paths เป็น signed URLs อัตโนมัติ)

### `PUT /make-server-3a715eba/cards/:cardId/choice`
บันทึกของขวัญที่ผู้รับเลือก
```json
{
  "receiverChoice": "1"
}
```

### `POST /make-server-3a715eba/upload`
อัปโหลดรูปภาพไปยัง Supabase Storage
- รับ FormData with `file` field
- ส่งกลับ `path` ที่เก็บไว้

## 🎨 Design System

### สี (Colors)
- **Primary**: ชมพู/แดงอ่อน (Valentine theme)
- **Accent**: โทนเสริม
- **Secondary**: ปุ่มรอง
- **Muted**: พื้นหลังรอง

### Animations
- Micro-interactions ทุกที่
- Confetti effect เมื่อเลือกของขวัญ
- 3D card flip animation
- Floating hearts and icons
- Smooth page transitions

### Responsive Design
- ใช้งานได้ทั้ง Desktop และ Mobile
- Grid layouts ปรับตามขนาดหน้าจอ
- Touch-friendly สำหรับ mobile

## 🔐 Data Storage

### Supabase Storage Bucket
- **Name**: `make-3a715eba-valentine-cards`
- **Type**: Private bucket
- **Size Limit**: 5MB per file
- **File Types**: JPEG, PNG

### KV Store
- **Key Pattern**: `card:{cardId}`
- **Value**: JSON object containing card data
- Auto-generated signed URLs (1 hour expiry)

## 🚀 Getting Started

1. แอปพลิเคชันเชื่อมต่อกับ Supabase อัตโนมัติ
2. กดปุ่ม "Create Your Card" เพื่อสร้างการ์ด
3. อัปโหลดรูปและเขียนข้อความ
4. เพิ่มของขวัญ 3-8 รายการ
5. คัดลอกลิงก์และแชร์ให้คนพิเศษ

## 📱 User Flow

```
Sender:
Home → Create (Step 1) → Create (Step 2) → Success (Copy Link)

Receiver:
Card Landing → Card Reveal → Gift Selection → Card Summary
     ↓
Share / Save as Image
```

## 🛡️ Accessibility Features

- Semantic HTML
- ARIA labels
- Keyboard navigation support
- Screen reader friendly
- Touch-friendly tap targets
- Loading states with visual feedback

## 🎭 Special Features

1. **"No thanks" Button**: หนีจากการกดเมาส์ 5 ครั้ง, ต้องกดค้าง 2 วินาทีถึงจะยืนยัน
2. **Progress Indicators**: แสดงสถานะการสร้างการ์ด
3. **Image Validation**: ตรวจสอบขนาดไฟล์ (max 5MB)
4. **Toast Notifications**: แจ้งเตือนที่สวยงามและชัดเจน
5. **Confetti Animation**: Effect พิเศษเมื่อเลือกของขวัญ
6. **Save as Image**: บันทึกการ์ดเป็นรูปภาพด้วย html2canvas

## 💡 Technical Highlights

- **Loading States**: แสดงสถานะการโหลดทุกที่
- **Error Handling**: จัดการ errors อย่างสวยงาม
- **Optimistic UI**: Upload images ทันทีเมื่อเลือกไฟล์
- **Signed URLs**: ความปลอดภัยสำหรับไฟล์ใน private bucket
- **Clean Code**: TypeScript types ครบถ้วน, separated concerns

---

Made with 💖 for Valentine's Day 2026
