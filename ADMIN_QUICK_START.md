# Featured Products Admin - Quick Start Guide

## Access the Page
Go to: **http://your-app/admin/featured-products**

---

## Quick Actions

### ➕ Add a New Product
1. Click **"Add Product"** button (top right)
2. Fill in the form:
   - **Product Name** ⭐ (required)
   - Category (optional) - e.g., "Premium", "Standard"
   - Price (optional) - e.g., "$99.99"
   - Description (optional)
   - Product Image (optional)
3. To upload image:
   - Click the gray dashed box OR
   - Drag & drop an image file
   - Wait for upload confirmation
4. Click **"Create Product"** button
5. ✅ Product added!

### ✏️ Edit a Product
1. Find the product card in the list
2. Click **"Edit"** button
3. Modify any fields
4. To change image:
   - Upload new image by clicking area
   - OR click X button to remove old image, then upload new one
5. Click **"Update Product"** button
6. ✅ Changes saved!

### ⭐ Feature a Product (Homepage)
1. Find the product card
2. Check the **"Featured"** checkbox
3. ✅ Product now appears on homepage!
4. **Note:** Only 4 products can be featured at once

### 🗑️ Delete a Product
1. Click the **trash icon** on product card
2. Click **"Delete"** in the confirmation popup
3. ✅ Product removed!

---

## File Upload Info

### What Files Can I Upload?
✅ **Allowed:**
- JPEG/JPG images
- PNG images
- GIF images
- WebP images
- SVG images

❌ **Not Allowed:**
- PDF, Word docs, spreadsheets
- Videos
- Other file types

### Limits
- **Max File Size:** 5 MB
- **Image Quality:** Keep high quality for better appearance
- **Recommended Size:** 1000x1000 pixels minimum

### Where Are Images Stored?
- **Server Location:** `/assets/` directory
- **Web URL:** `https://zira-tech.com/assets/img_XXXXXX.jpg`
- **Automatic:** System handles all the details

---

## Common Tasks

### I want to feature 4 specific products
1. Add/select your 4 best products
2. Check "Featured" on each of the 4
3. They'll automatically appear on homepage
4. Only 4 can be featured at once - system will warn you

### I want to replace a product's image
1. Click **"Edit"** on the product
2. Click the **X button** on the current image
3. Click the area to upload a new image
4. Select new image file
5. Click **"Update Product"**
6. ✅ Image replaced!

### I want to remove a product from homepage
1. Find the product card
2. **Uncheck** the "Featured" checkbox
3. ✅ Product removed from homepage (but still in database)

### I want to delete a product completely
1. Click **trash icon** on product card
2. Confirm deletion
3. ✅ Product and image removed from database

---

## Form Tips

### Product Name
- Make it clear and descriptive
- Example: "Premium Support Package"
- This appears on homepage and product cards

### Category
- Optional but recommended
- Helps organize products
- Examples: "Premium", "Enterprise", "Starter"
- Shows as badge on product card

### Price
- Optional but recommended
- Format: Numbers with decimals (e.g., 99.99)
- Automatically formatted to currency
- Shows as bold orange text on card

### Description
- Optional brief product info
- Keep under 100 words for cleaner display
- Appears in product card preview
- Supports multiple lines

### Product Image
- Optional but highly recommended
- Appears as thumbnail on product card
- Appears large on featured products homepage
- Upload quality images for best appearance

---

## Error Messages & What They Mean

| Error | Reason | Fix |
|-------|--------|-----|
| "Product name is required" | You didn't fill in the name | Enter a product name |
| "Please select a valid image file" | File isn't an image | Upload a PNG, JPG, GIF, WebP, or SVG |
| "Image size must be less than 5MB" | Image file too large | Compress the image or use smaller file |
| "Failed to upload image" | Server issue | Try again, or check file format |
| "Failed to save product" | Database issue | Check internet connection, try again |
| "Maximum 4 featured products allowed" | Too many featured | Uncheck feature on another product first |

---

## Best Practices

✅ **Do:**
- Use high-quality images (1000x1000 pixels or larger)
- Keep product names clear and descriptive
- Include helpful descriptions
- Feature your best/most popular products
- Update products regularly
- Test links on homepage

❌ **Don't:**
- Upload very large files (stick under 5MB)
- Use blurry or low-quality images
- Leave product names blank
- Feature products you don't really recommend
- Delete products without backing them up first
- Upload non-image files

---

## Getting Help

### Images Not Uploading?
1. Check file is actual image (PNG, JPG, GIF, etc.)
2. Check file size under 5MB
3. Try a different image
4. Refresh the page and try again

### Products Not Showing?
1. Check "Featured" checkbox is checked (if you want homepage)
2. Refresh the page
3. Check internet connection

### Need More Help?
Contact support with:
- What you were doing
- Error message you saw
- Screenshot (if possible)
- Product details (name, if applicable)

---

## Storage Location

All images are automatically stored at:
- **Server Path:** `/assets/img_XXXXXX.jpg`
- **Web URL:** `https://zira-tech.com/assets/img_XXXXXX.jpg`
- **Auto-managed:** System handles all uploads and organization

---

## Tips for Best Results

### Homepage Display
- Featured products show in grid of 4
- Larger images look better
- Quality matters - use good product photos
- Clear names are important

### Image Quality
- Minimum: 800x800 pixels
- Recommended: 1200x1200 pixels
- Format: JPG for photos, PNG for graphics
- Size: Keep under 500KB if possible

### Content
- Catchy product names
- Brief, compelling descriptions
- Accurate pricing
- Professional images

---

## Summary of Changes Made

✅ **What's Working:**
- Upload images to /assets/ directory
- Create new products
- Edit existing products
- Change product images
- Delete products
- Feature up to 4 products
- View on homepage

✅ **What's Secure:**
- File validation (checks it's actually an image)
- File size limits (prevents huge files)
- Secure storage (can't be executed)
- Database protection

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Tab | Navigate form fields |
| Enter | Submit form |
| Escape | Close dialogs |
| Del | Focus delete button (when on card) |

---

**Version:** 1.0  
**Last Updated:** 2024  
**Status:** ✅ Production Ready
