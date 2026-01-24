# Customer Site Refactoring Guide

## Aligning with Admin Panel Changes

This guide outlines all the changes you need to make to your customer-facing site (Liper Pizza) to align with the admin panel refactoring.

---

## 🎯 Overview of Changes

### 1. **Order Data Structure Changes**

### 2. **Typography System Migration**

### 3. **Color Scheme Update (Maroon Theme)**

### 4. **Delivery Timestamp Handling**

---

## 📦 1. Order Data Structure Changes

### **A. Update OrderData Type Definition**

**File:** `types/productsTypes.ts` or `types/orderTypes.ts`

**Changes:**

```typescript
export type OrderData = {
  id: string;
  customer_email: string | null;
  customer_name?: string;
  shippingInfo?: ShippingInfo;
  productsList: ProductType[];
  status: "Processing" | "Shipped" | "Delivered" | "Cancelled";

  // ✅ CHANGED: Now using milliseconds instead of Timestamp
  createdAt: number; // Milliseconds since epoch

  // ✅ CHANGED: Renamed from 'deleverAt' and using milliseconds
  deliveredAt?: number; // Milliseconds - delivery timestamp

  // ✅ REMOVED: deleveratstamp (consolidated into deliveredAt)

  totalAmount: number;
  driverId?: string;
  paymentMethod?: string;
  transactionReference?: string;

  // Offer fields
  isOffer?: boolean;
  offerId?: string;
  offerTitle?: string;
  offerImage?: string;
};
```

**Action Items:**

- [ ] Remove `deleveratstamp` field
- [ ] Rename `deleverAt` to `deliveredAt`
- [ ] Ensure `deliveredAt` is stored as `number` (milliseconds)
- [ ] Update `createdAt` to be `number` (milliseconds)

---

### **B. Update Order Creation/Submission**

**Files to Update:**

- Order checkout/submission components
- Cart checkout logic
- Order creation services

**Before:**

```typescript
const orderData = {
  // ... other fields
  createdAt: Timestamp.fromDate(new Date()),
  deliveredAt: "", // or some string
};
```

**After:**

```typescript
const orderData = {
  // ... other fields
  createdAt: Date.now(), // Milliseconds
  // deliveredAt is NOT set on creation (only when delivered)
};
```

**Action Items:**

- [ ] Replace `Timestamp.fromDate(new Date())` with `Date.now()`
- [ ] Remove any initial `deliveredAt` or `deleverAt` values on order creation
- [ ] Ensure all timestamps are stored as numbers

---

### **C. Update Order Display Components**

**Files to Update:**

- Order history/list components
- Order detail pages
- Order status displays

**Before:**

```typescript
// Displaying order date
<p>{new Date(order.createdAt.toDate()).toLocaleDateString()}</p>

// Or with string
<p>{order.deliveredAt}</p>
```

**After:**

```typescript
// Convert milliseconds to Date
<p>{new Date(order.createdAt).toLocaleDateString()}</p>

// For delivered orders
{order.deliveredAt && (
  <p>{new Date(order.deliveredAt).toLocaleDateString()}</p>
)}
```

**Helper Function:**

```typescript
// Create a utility function
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('ar-SD', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Usage
<p>{formatDate(order.createdAt)}</p>
```

**Action Items:**

- [ ] Update all date displays to use `new Date(timestamp)`
- [ ] Remove `.toDate()` calls on timestamps
- [ ] Add null checks for `deliveredAt` before displaying
- [ ] Create and use `formatDate` helper function

---

### **D. Update Order Queries/Filters**

**Files to Update:**

- Order fetching services
- Order history queries

**Before:**

```typescript
const ordersQuery = query(
  ordersRef,
  where("createdAt", ">=", Timestamp.fromDate(startDate)),
  where("createdAt", "<=", Timestamp.fromDate(endDate)),
);
```

**After:**

```typescript
const startMillis = startDate.getTime();
const endMillis = endDate.getTime();

const ordersQuery = query(
  ordersRef,
  where("createdAt", ">=", startMillis),
  where("createdAt", "<=", endMillis),
);
```

**Action Items:**

- [ ] Convert Date objects to milliseconds using `.getTime()`
- [ ] Remove `Timestamp.fromDate()` conversions
- [ ] Update all date-based queries to use milliseconds

---

## 🎨 2. Typography System Migration

### **A. Add Typography Utility Classes**

**File:** `app/globals.css` or `styles/globals.css`

**Add these classes:**

```css
@layer components {
  /* Typography Utility Classes - Scale with root font size */
  .text-tiny {
    font-size: 0.625rem; /* 10px at 16px root */
    line-height: 1.4;
  }

  .text-small {
    font-size: 0.75rem; /* 12px at 16px root */
    line-height: 1.5;
  }

  .text-medium {
    font-size: 0.875rem; /* 14px at 16px root */
    line-height: 1.5;
  }

  .text-base {
    font-size: 1rem; /* 16px at 16px root */
    line-height: 1.5;
  }

  .text-big {
    font-size: 1.125rem; /* 18px at 16px root */
    line-height: 1.5;
  }

  .text-large {
    font-size: 1.25rem; /* 20px at 16px root */
    line-height: 1.4;
  }

  .text-huge {
    font-size: 1.5rem; /* 24px at 16px root */
    line-height: 1.3;
  }

  /* Font Weight Utilities */
  .font-regular {
    font-weight: 400;
  }
  .font-medium {
    font-weight: 500;
  }
  .font-semibold {
    font-weight: 600;
  }
  .font-bold {
    font-weight: 700;
  }
  .font-black {
    font-weight: 900;
  }
}
```

**Action Items:**

- [ ] Add typography classes to global CSS
- [ ] Test that classes work correctly

---

### **B. Replace Hard-Coded Font Sizes**

**Mapping Guide:**

```
text-[8px]  → text-tiny   (10px)
text-[9px]  → text-tiny   (10px)
text-[10px] → text-tiny   (10px)
text-[11px] → text-small  (12px)
text-[12px] → text-small  (12px)
text-[14px] → text-medium (14px)
text-[16px] → text-base   (16px)
text-[18px] → text-big    (18px)
text-[20px] → text-large  (20px)
text-[24px] → text-huge   (24px)
```

**Search & Replace:**

```bash
# Find all hard-coded font sizes
grep -r "text-\[[0-9]\+px\]" app/

# Replace examples:
text-[10px] → text-tiny
text-[12px] → text-small
text-[14px] → text-medium
```

**Action Items:**

- [ ] Search for all `text-[Xpx]` patterns
- [ ] Replace with semantic classes
- [ ] Test all pages for visual consistency

---

## 🎨 3. Color Scheme Update (Maroon Theme)

### **A. Update CSS Variables**

**File:** `app/globals.css` or `styles/globals.css`

**Replace:**

```css
:root {
  /* OLD - Red Theme */
  --primary-color: #fa6363;
  --accent-color: #f87171;

  /* NEW - Maroon Theme */
  --primary-color: #800020; /* Deep Maroon */
  --accent-color: #a0153e; /* Lighter Maroon */
}

.dark {
  /* OLD */
  --primary: #ef4444;

  /* NEW */
  --primary: #c41e3a; /* Bright Maroon for dark mode */
}
```

**Action Items:**

- [ ] Update primary color to `#800020`
- [ ] Update accent color to `#a0153e`
- [ ] Update dark mode primary to `#c41e3a`
- [ ] Test both light and dark modes

---

### **B. Update Chart Colors (if applicable)**

**File:** `app/globals.css`

```css
:root {
  --chart-1: #800020; /* Deep Maroon */
  --chart-2: #1a1a1a; /* Secondary Black */
  --chart-3: #a0153e; /* Lighter Maroon */
  --chart-4: #c41e3a; /* Bright Maroon */
  --chart-5: #5c0011; /* Dark Maroon */
}
```

**Action Items:**

- [ ] Update chart colors if you have analytics/charts
- [ ] Test chart visibility

---

## 📝 4. Product Quantity in Orders

### **A. Ensure Product Quantities are Saved**

**In ProductType:**

```typescript
export interface ProductType {
  id: string;
  p_name: string;
  p_cost: number | string;
  p_cat: string;
  p_details: string;
  p_imgs: ProductImage[];
  p_qu?: number; // ✅ Quantity field
  // ... other fields
}
```

**When adding to cart:**

```typescript
const cartItem = {
  ...product,
  p_qu: quantity, // Make sure quantity is included
};
```

**Action Items:**

- [ ] Ensure `p_qu` is set when adding products to cart
- [ ] Verify quantities are saved in order data
- [ ] Display quantities in order history

---

## 🚀 Implementation Checklist

### **Phase 1: Type Definitions**

- [ ] Update `OrderData` type
- [ ] Remove `deleveratstamp` references
- [ ] Rename `deleverAt` to `deliveredAt`
- [ ] Ensure all timestamps are `number` type

### **Phase 2: Order Creation**

- [ ] Update order submission to use `Date.now()`
- [ ] Remove Timestamp imports where not needed
- [ ] Test order creation flow

### **Phase 3: Order Display**

- [ ] Update all date displays to use milliseconds
- [ ] Create `formatDate` helper function
- [ ] Update order history components
- [ ] Update order detail pages

### **Phase 4: Typography**

- [ ] Add typography classes to CSS
- [ ] Search for all `text-[Xpx]` patterns
- [ ] Replace with semantic classes
- [ ] Test all pages

### **Phase 5: Color Scheme**

- [ ] Update CSS variables to maroon
- [ ] Test light mode
- [ ] Test dark mode
- [ ] Verify all UI elements

### **Phase 6: Testing**

- [ ] Test order creation
- [ ] Test order history display
- [ ] Test date formatting
- [ ] Test responsive design
- [ ] Test accessibility (font scaling)

---

## 🔍 Files to Check

### **Priority 1 (Critical):**

- [ ] `types/productsTypes.ts` or `types/orderTypes.ts`
- [ ] Order creation/checkout components
- [ ] Order history/list components
- [ ] `app/globals.css`

### **Priority 2 (Important):**

- [ ] Order detail pages
- [ ] Cart components
- [ ] Order services/API calls
- [ ] Date formatting utilities

### **Priority 3 (Nice to have):**

- [ ] Analytics components (if any)
- [ ] Admin-facing components
- [ ] Email templates (if they show dates)

---

## 💡 Pro Tips

1. **Create a migration branch:**

   ```bash
   git checkout -b refactor/align-with-admin
   ```

2. **Test incrementally:**
   - Update types first
   - Then update one component at a time
   - Test after each change

3. **Use TypeScript errors as a guide:**
   - After updating types, TypeScript will show you where changes are needed

4. **Keep a backup:**
   - Commit before starting
   - Test thoroughly before merging

5. **Search patterns to find issues:**

   ```bash
   # Find Timestamp usage
   grep -r "Timestamp" app/

   # Find old field names
   grep -r "deleverAt\|deleveratstamp" app/

   # Find hard-coded font sizes
   grep -r "text-\[[0-9]\+px\]" app/
   ```

---

## 📞 Need Help?

If you encounter issues:

1. Check TypeScript errors first
2. Verify Firebase data structure matches new types
3. Test with existing orders in database
4. Ensure date conversions are correct

---

## ✅ Final Verification

After completing all changes:

- [ ] All orders display correctly
- [ ] Dates show properly formatted
- [ ] New orders save with correct timestamp format
- [ ] Typography is consistent across all pages
- [ ] Maroon theme is applied everywhere
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Responsive design works
- [ ] Dark mode works (if applicable)

---

**Last Updated:** 2026-01-17
**Version:** 1.0
