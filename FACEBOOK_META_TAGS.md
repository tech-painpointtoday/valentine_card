# Facebook Meta Tags Setup

## ✅ What's Been Done

I've implemented server-side meta tag handling so that Facebook and other social media platforms can properly read your card meta descriptions.

### Changes Made:

1. **Created PHP meta handler** (`public/meta-handler.php` and `dist/meta-handler.php`)
   - Dynamically serves different meta tags based on URL
   - Card URLs (`/card/*`) now show: "เธอได้รับการ์ดวาเลนไทน์นะ 💖"
   - Home page shows the original creation message

2. **Updated `.htaccess` files** (both `public/.htaccess` and `dist/.htaccess`)
   - Routes all requests through the PHP handler
   - Preserves client-side routing functionality

3. **Added Vite plugin**
   - Automatically copies the correct PHP file to `dist/` during build
   - Works in both development and production

4. **Updated `CardLanding.tsx`**
   - Removed client-side meta tag updates (they don't work for Facebook)
   - Kept page title update for better user experience

## 🚀 How to Deploy

### For Development (using `npm run dev`):
The Vite plugin will handle meta tags automatically.

### For Production:
1. Run the build command:
   ```bash
   npm run build
   ```

2. Deploy the `dist/` folder to your production server (card.yourhome.co.th)

3. Make sure your server supports:
   - PHP (you're using XAMPP, so this is already ✅)
   - `.htaccess` with mod_rewrite enabled

## 🔄 Clear Facebook Cache

**IMPORTANT:** Facebook caches meta tags for previously shared URLs. To see the new description, you need to clear Facebook's cache:

### Method 1: Facebook Sharing Debugger (Recommended)
1. Go to: https://developers.facebook.com/tools/debug/
2. Paste your card URL: `https://card.yourhome.co.th/card/vr4b4hveen2o32g5rd02u`
3. Click **"Debug"**
4. Click **"Scrape Again"** to refresh the cache
5. Share the link again on Facebook - it should now show the correct description!

### Method 2: Add URL Parameter (Quick Fix)
Add a query parameter to force Facebook to see it as a new URL:
- `https://card.yourhome.co.th/card/vr4b4hveen2o32g5rd02u?v=2`

## 📝 Meta Tags Configuration

### For Card URLs (`/card/*`):
- **Title**: คุณได้รับการ์ดวาเลนไทน์ 💖
- **Description**: เธอได้รับการ์ดวาเลนไทน์นะ 💖

### For Home Page (`/`):
- **Title**: สร้างการ์ดวาเลนไทน์ - Valentine Card Maker
- **Description**: สร้างการ์ดวาเลนไทน์พิเศษให้คนสำคัญของคุณ พร้อมข้อความและของขวัญที่น่ารัก

## 🧪 Testing

To verify it's working:

1. **Check Server Response:**
   ```bash
   curl -I https://card.yourhome.co.th/card/vr4b4hveen2o32g5rd02u
   ```
   Should return `Content-Type: text/html; charset=UTF-8`

2. **View Source:**
   - Open the card URL in your browser
   - Right-click → "View Page Source"
   - Check that the meta tags show: "เธอได้รับการ์ดวาเลนไทน์นะ 💖"

3. **Test with Facebook Debugger:**
   - Use the link above to check what Facebook sees

## ⚠️ Troubleshooting

### If Facebook still shows old description:
1. Clear cache using Facebook Sharing Debugger
2. Wait 24 hours (Facebook's cache can be persistent)
3. Try sharing with a URL parameter: `?v=2` or `?refresh=1`

### If PHP file is not working:
1. Check that PHP is enabled on your server
2. Check that `.htaccess` is being read (Apache `AllowOverride All`)
3. Check file permissions on `meta-handler.php`

### If assets are not loading:
1. Check that the build process completed successfully
2. Verify all asset paths in `dist/index.html`
3. Check browser console for 404 errors

## 📧 Support

If you encounter any issues, check:
- Apache error logs
- Browser console errors
- PHP error logs

Good luck! 🎉
