# Featured Products - Quick Fixes & Action Items

## 🔴 CRITICAL Issues (Fix Immediately)

### 1. No Authentication on Image Upload
**Location:** `api-enhanced.php` (image upload handler)
**Issue:** Anyone can upload images to `/assets/` if they know the URL
**Impact:** Unauthorized file uploads, disk space abuse, security risk
**Fix:** Add authentication check before allowing upload

```php
// ADD THIS TO api-enhanced.php BEFORE LINE 210
if ($action === 'upload_image') {
    // Check if user has authentication token/session
    $auth_token = $_GET['token'] ?? null;
    if (!$auth_token || !verifyAdminToken($auth_token)) {
        http_response_code(401);
        echo json_encode(["error" => "Unauthorized"]);
        exit;
    }
    
    // ... rest of upload code
}
```

**Frontend Change Required:**
```typescript
// In AdminFeaturedProducts.tsx, update handleImageUpload()
const response = await fetch('https://zira-tech.com/api.php?action=upload_image&token=' + authToken, {
    method: 'POST',
    body: formData,
});
```

---

### 2. No CSRF Protection
**Location:** All POST/PUT/DELETE operations
**Issue:** Cross-Site Request Forgery attacks possible
**Impact:** Unauthorized modifications to products
**Fix:** Implement CSRF tokens

```typescript
// Add to API requests
const csrfToken = localStorage.getItem('csrf_token');
const response = await fetch(url, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,
    },
    body: JSON.stringify(data),
});
```

---

### 3. No Backend Authentication Verification
**Location:** `api-enhanced.php` (all CRUD operations)
**Issue:** Backend doesn't check if user is admin before allowing operations
**Impact:** Anyone can create/edit/delete products if they know the API structure
**Fix:** Add authentication check at top of api-enhanced.php

```php
// ADD AFTER DATABASE CONNECTION (around line 30)
// Check authentication
$auth_token = $_GET['token'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? null;
if (!$auth_token || !verifyAdminToken($auth_token)) {
    // Allow GET requests (public read)
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        http_response_code(401);
        echo json_encode(["error" => "Unauthorized"]);
        exit;
    }
}
```

---

## 🟡 HIGH Priority Issues

### 4. Image Files Not Deleted on Product Delete
**Location:** `src/pages/AdminFeaturedProducts.tsx` - `handleDeleteProduct()`
**Issue:** When product deleted, image file remains on server (orphaned files)
**Impact:** Disk space waste, accumulates over time
**Timeline:** Implement in next update

```typescript
// BEFORE: Direct delete
await productsAPI.delete(productId);

// AFTER: Delete product and image
const handleDeleteProduct = async (productId: number) => {
    try {
        const product = products.find(p => p.id === productId);
        
        if (product?.image_url) {
            // Delete the image file from server
            await fetch('https://zira-tech.com/api.php?action=delete_image&token=' + authToken, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image_url: product.image_url }),
            });
        }
        
        // Then delete the product
        await productsAPI.delete(productId);
        // ... rest of code
    }
};
```

---

### 5. Image Files Not Deleted on Product Edit
**Location:** `src/pages/AdminFeaturedProducts.tsx` - `handleAddProduct()`
**Issue:** When product image updated, old image remains on server
**Impact:** Disk space waste
**Timeline:** Implement in next update

```typescript
// BEFORE: Just update with new URL
await productsAPI.update(editingId, { image_url: newImageUrl });

// AFTER: Delete old image first if changed
if (editingId && oldProduct?.image_url !== newImageUrl && oldProduct?.image_url) {
    // Delete old image
    await fetch('https://zira-tech.com/api.php?action=delete_image&token=' + authToken, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_url: oldProduct.image_url }),
    });
}
```

---

### 6. No Fallback URL - Requires Valid Response
**Location:** `src/pages/AdminFeaturedProducts.tsx` - Line 76
**Issue:** Fallback uses `file.name` which could cause collisions
**Fix:** Remove fallback, require explicit URL from backend

```typescript
// BEFORE:
const imageUrl = data.url || data.image_url || `https://zira-tech.com/assets/${file.name}`;

// AFTER:
if (!data.url && !data.image_url) {
    throw new Error('Upload failed: No URL returned from server');
}
const imageUrl = data.url || data.image_url;

// Add validation
if (!imageUrl.startsWith('https://zira-tech.com/assets/')) {
    throw new Error('Invalid image URL returned from server');
}
```

---

## 🟠 MEDIUM Priority Issues

### 7. Generic Error Messages
**Location:** Multiple catch blocks in `AdminFeaturedProducts.tsx`
**Issue:** Users see "Failed to upload image" without knowing why
**Fix:** Pass detailed error messages to user

```typescript
// BEFORE:
catch (err) {
    console.error('Upload error:', err);
    toast.error('Failed to upload image');
}

// AFTER:
catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Upload error:', errorMessage);
    toast.error(`Upload failed: ${errorMessage}`);
}
```

---

### 8. Form Submit Button Not Disabled During Save
**Location:** `src/pages/AdminFeaturedProducts.tsx` - Submit button (Line 408)
**Issue:** User can click submit multiple times, creating duplicate products
**Fix:** Add loading state to submit button

```typescript
// BEFORE:
<Button
    type="submit"
    className="bg-brand-orange hover:bg-brand-orange-dark text-white"
>
    {editingId ? 'Update' : 'Create'} Product
</Button>

// AFTER:
const [isSaving, setIsSaving] = useState(false);

// In handleAddProduct, wrap with setIsSaving(true/false)

<Button
    type="submit"
    disabled={isSaving || isUploading}
    className="bg-brand-orange hover:bg-brand-orange-dark text-white disabled:opacity-50"
>
    {isSaving ? 'Saving...' : (editingId ? 'Update' : 'Create')} Product
</Button>
```

---

### 9. Missing Price Validation
**Location:** `src/pages/AdminFeaturedProducts.tsx` - `handleAddProduct()`
**Issue:** Can save negative or extremely large prices
**Fix:** Add validation

```typescript
if (formData.price) {
    const price = parseFloat(formData.price);
    if (price < 0) {
        toast.error('Price cannot be negative');
        return;
    }
    if (price > 999999.99) {
        toast.error('Price too large (max 999,999.99)');
        return;
    }
}
```

---

### 10. SVG Files Security Risk
**Location:** `api-enhanced.php` - allowed MIME types
**Issue:** SVG files can contain embedded JavaScript
**Risk:** Potential XSS vulnerability if SVG embedded in HTML
**Fix:** Either disallow SVG or sanitize

```php
// OPTION 1: Disallow SVG
$allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// OPTION 2: Add SVG sanitization
if ($mimeType === 'image/svg+xml') {
    // Sanitize SVG to remove scripts
    $svg = file_get_contents($fileTmp);
    $svg = preg_replace('/<script\b[^>]*>(.*?)<\/script>/is', '', $svg);
    $svg = preg_replace('/on\w+\s*=/i', '', $svg);
    file_put_contents($fileTmp, $svg);
}
```

---

## 📋 MEDIUM Priority - Code Quality

### 11. Inconsistent API Response Formats
**Location:** `src/lib/api.ts` vs `src/lib/apiClient.ts`
**Issue:** Different API clients return different response structures
**Fix:** Standardize all responses

```typescript
// Standard response format (use everywhere):
{
    "success": boolean,
    "data": any,
    "message": string,
    "error": string | null
}
```

---

### 12. Missing Input Validation
**Location:** `src/pages/AdminFeaturedProducts.tsx`
**Issues:**
- Product name: no length limit
- Category: no validation
- Description: could be very long

**Fix:** Add validation constants

```typescript
const VALIDATION = {
    name: { min: 1, max: 255 },
    category: { min: 0, max: 100 },
    description: { max: 2000 },
    price: { min: 0, max: 999999.99 },
};

// In form submission:
if (formData.name.length < VALIDATION.name.min || 
    formData.name.length > VALIDATION.name.max) {
    toast.error(`Product name must be 1-255 characters`);
    return;
}
```

---

### 13. No Image Dimensions Validation
**Location:** `src/pages/AdminFeaturedProducts.tsx`
**Issue:** Can upload images that are too small or wrong aspect ratio
**Fix:** Validate image dimensions on frontend

```typescript
const validateImageDimensions = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            if (img.width < 200 || img.height < 200) {
                toast.error('Image must be at least 200x200 pixels');
                resolve(false);
            } else if (img.width > 4000 || img.height > 4000) {
                toast.error('Image must be smaller than 4000x4000 pixels');
                resolve(false);
            } else {
                resolve(true);
            }
        };
        img.src = URL.createObjectURL(file);
    });
};
```

---

### 14. No Accessibility Improvements
**Location:** Various UI components
**Issues:**
- Upload area should be `<button>` not `<div>`
- Delete button missing aria-label
- Spinner missing aria-busy

**Quick Fixes:**
```tsx
// Image upload area - BEFORE:
<div onClick={() => fileInputRef.current?.click()} className="...">

// AFTER:
<button
    type="button"
    onClick={() => fileInputRef.current?.click()}
    className="w-full h-48 border-2 border-dashed..."
    aria-label="Click or drag to upload product image"
>

// Delete button - BEFORE:
<button ... className="..."><X className="h-4 w-4" /></button>

// AFTER:
<button ... aria-label="Remove product image"><X className="h-4 w-4" /></button>
```

---

## ✅ QUICK WINS (Easy Fixes)

### 15. Add Loading State During Form Submit
```typescript
// Add to state:
const [isSaving, setIsSaving] = useState(false);

// Wrap handleAddProduct:
const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
        // ... existing code
    } finally {
        setIsSaving(false);
    }
};
```

### 16. Show Image Dimensions in Preview
```tsx
{imagePreview && (
    <div className="relative ...">
        <img ... onLoad={(e) => {
            const { width, height } = (e.target as HTMLImageElement);
            console.log(`Image: ${width}x${height}`);
        }} />
        <p className="text-xs text-gray-500">
            {/* Display dimensions here */}
        </p>
    </div>
)}
```

### 17. Add Drag & Drop Support
```tsx
const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-brand-orange', 'bg-orange-50');
};

const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('border-brand-orange', 'bg-orange-50');
};

const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleImageUpload(file);
};

// Add to upload area:
<div
    onDragOver={handleDragOver}
    onDragLeave={handleDragLeave}
    onDrop={handleDrop}
    className="..."
>
```

---

## Implementation Priority & Effort

| Issue | Priority | Effort | Time | Status |
|-------|----------|--------|------|--------|
| No authentication on upload | 🔴 CRITICAL | High | 2h | ❌ Not Started |
| No CSRF protection | 🔴 CRITICAL | High | 2h | ❌ Not Started |
| No backend auth check | 🔴 CRITICAL | High | 2h | ❌ Not Started |
| Image cleanup on delete | 🟡 HIGH | Medium | 1h | ❌ Not Started |
| Image cleanup on edit | 🟡 HIGH | Medium | 1h | ❌ Not Started |
| Remove fallback URL | 🟡 HIGH | Low | 15m | ❌ Not Started |
| Generic error messages | 🟠 MEDIUM | Low | 30m | ❌ Not Started |
| Add submit button disabled | 🟠 MEDIUM | Low | 20m | ❌ Not Started |
| Price validation | 🟠 MEDIUM | Low | 20m | ❌ Not Started |
| SVG sanitization | 🟠 MEDIUM | Medium | 45m | ❌ Not Started |
| API response standardization | 🟠 MEDIUM | High | 3h | ❌ Not Started |
| Input validation | 🟠 MEDIUM | Medium | 1h | ❌ Not Started |
| Image dimension validation | 🟠 MEDIUM | Medium | 1h | ❌ Not Started |
| Accessibility improvements | 🟠 MEDIUM | Low | 45m | ❌ Not Started |
| Drag & drop support | ✅ NICE-TO-HAVE | Medium | 1h | ❌ Not Started |

**Total Critical Work:** ~6 hours
**Total High Priority:** ~2 hours
**Total Medium Priority:** ~7.5 hours
**Total Optional:** ~1 hour

---

## Testing Checklist

After implementing fixes, test these scenarios:

- [ ] Upload without authentication token - should fail
- [ ] Create product with CSRF token validation
- [ ] Edit product and change image - old image deleted
- [ ] Delete product - image file deleted from server
- [ ] Submit form multiple times - only saves once
- [ ] Upload negative price - validation error
- [ ] Upload image dimensions too small - validation error
- [ ] Upload SVG file - properly sanitized
- [ ] Drag and drop image - works same as click upload
- [ ] Broken image in preview - shows error state
- [ ] Very long product name - truncated/validated
- [ ] Empty category field - optional works

---

## Monitoring & Logging

### Add to Monitor Production Issues

```typescript
// Log all API errors
const logApiError = (operation: string, error: any) => {
    const errorLog = {
        operation,
        timestamp: new Date().toISOString(),
        error: error.message,
        stack: error.stack,
        userId: user?.id,
    };
    console.error('API Error:', errorLog);
    // Send to error tracking service (Sentry, etc.)
};
```

### Monitor Disk Usage

```php
// Periodic task to clean orphaned images
// Images not referenced in products table for >7 days
// Check /assets/ directory and database
```

---

## Deployment Checklist

- [ ] All critical security fixes implemented
- [ ] All unit tests passing
- [ ] All integration tests passing
- [ ] API response formats standardized
- [ ] Error messages are helpful
- [ ] Image cleanup implemented
- [ ] Authentication verified on all endpoints
- [ ] CSRF tokens implemented
- [ ] Rate limiting configured
- [ ] Monitoring/logging configured
- [ ] Database backups scheduled
- [ ] Asset directory permissions verified (0755)
- [ ] CORS headers reviewed
- [ ] SVG files handled safely

---

## Questions to Answer Before Deployment

1. **How are admin users authenticated currently?**
   - Answer: Check `useAuth()` hook and authentication flow

2. **What session/token mechanism is used?**
   - Answer: Needed to implement auth check in image upload

3. **Is there a rate limiting system in place?**
   - Answer: Check if backend/server has rate limits

4. **How should orphaned images be cleaned up?**
   - Answer: Automatic task or manual cleanup utility?

5. **Are there image size/dimension requirements?**
   - Answer: Needed for dimension validation

6. **Should SVG files be allowed?**
   - Answer: Disallow or sanitize?

7. **What's the plan for image optimization?**
   - Answer: Resize/compress before storage?

8. **Is there a CDN for image delivery?**
   - Answer: Use CDN or serve directly?

---

**Last Updated:** 2024
**Status:** Ready for Implementation
**Next Review:** After critical fixes implemented
