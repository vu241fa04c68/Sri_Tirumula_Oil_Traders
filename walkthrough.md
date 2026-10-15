# Walkthrough - Sri Tirumala Oil Traders Mobile Commerce Application

We have successfully built a COMPLETE, PRODUCTION-READY mobile commerce platform for **Sri Tirumala Oil Traders** (శ్రీ తిరుమల ఆయిల్ ట్రేడర్స్), supporting both **Customer** and **Vendor/Shop Owner** mobile apps, bilingual support (**English & Telugu**), Firebase integration, real-time visual order tracking, inventory management, and a premium local store branding identity.

---

## Key Achievements & Features Implemented

### 1. Dual App Architecture (Customer App + Vendor App)
- **Unified Expo Router Structure**: Unified entry router with role-based routing (`app/(auth)`, `app/(customer)`, `app/(vendor)`).
- **Security Guard**: Role guard (`role === 'vendor'`) protecting all vendor routes, preventing customers from accessing owner functionality simply by typing routes.

### 2. Full Bilingual Support (English ↔ Telugu / తెలుగు)
- **Centralized i18n Architecture**: `src/i18n/en.ts` and `src/i18n/te.ts`.
- **Instant Language Swapping**: Instant context update when toggling English ↔ తెలుగు without restarting the application.
- **Dual-Language Products**: Supports dual English and Telugu product titles and descriptions (e.g. *Freedom Refined Sunflower Oil / ఫ్రీడమ్ రిఫైన్డ్ సన్‌ఫ్లవర్ ఆయిల్*).

### 3. Customer App Features & Screens
- **Entry / Splash Screen** (`app/index.tsx`): Language picker, quick start for store shopping or owner portal.
- **Home Screen** (`app/(customer)/home.tsx`): Shop banner (Sri Tirumala Oil Traders), search bar, category chips (Kirana, Cooking Oils, Pelli Sarukulu, Homemade Pickles, Festival Supplies, Daily Essentials), featured product cards, popular oils, and bulk wedding inquiry card.
- **Product Details** (`app/(customer)/product/[id].tsx`): Stock level check, quantity selector, add to cart, subtotal calculation.
- **Search System** (`app/(customer)/search.tsx`): Instant product filtering by English name, Telugu name, or category.
- **Cart & Checkout** (`app/(customer)/cart.tsx`, `app/(customer)/checkout.tsx`): Real-time stock validation, delivery charge calculation (Free delivery above ₹1000), address CRUD, payment method selection (Cash on Delivery / Pay & Pick up at store).
- **Real-Time Visual Order Tracking** (`app/(customer)/tracking/[id].tsx`): 6-stage visual timeline (Order Placed → Accepted → Preparing → Ready → Out for Delivery → Delivered).
- **Contact Shop Action** (`src/components/CallShopButton.tsx`): Direct phone dialing action to `8008413774`.

### 4. Vendor / Shop Owner App Features & Screens
- **Vendor Admin Login** (`app/(auth)/vendor-login.tsx`): Secure password login (Default: `admin8008413774`).
- **Owner Dashboard** (`app/(vendor)/dashboard.tsx`): Real-time sales counter (Today's Sales ₹), Today's Orders, Pending, Completed, Cancelled, Low stock warning banner.
- **Order Management Queue** (`app/(vendor)/orders.tsx`): One-tap order status progression (Accept → Prepare → Ready → Out for Delivery → Complete) with confirmation modals.
- **Product Catalog Management** (`app/(vendor)/products.tsx`, `app/(vendor)/product/add.tsx`): Add, edit, toggle active status, and delete products with bilingual fields.
- **Inventory & Stock Manager** (`app/(vendor)/inventory.tsx`): Inline quick stock adjustment buttons (-5, -1, +1, +10) with visual stock status badges.
- **Registered Customer Roster** (`app/(vendor)/customers.tsx`): Customer phone numbers, order counts, and total spending metrics.
- **Shop Settings** (`app/(vendor)/settings.tsx`): Configure shop name, phone (`8008413774`), address, delivery fees, and minimum order threshold.

### 5. Backend & Security Setup
- **Firestore Security Rules** (`firestore.rules`): Role-based permissions enforcing public read for products/categories, owner write for catalog/inventory, and owner/customer access for orders.
- **Zero TypeScript Errors**: Clean `npx tsc --noEmit` compilation.

---

## How to Run the Application

### 1. Start Metro / Web Bundler
In terminal, navigate to the project directory and run:
```bash
cd c:\Users\annap\Desktop\SriTirumalaCustomer
npm start
```
or to launch directly in web browser:
```bash
npm run web
```
