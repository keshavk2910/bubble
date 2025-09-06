/**
 * Generate URL-friendly slug from title and display ID
 * @param {string} title - The listing title
 * @param {string|number} displayId - The BZ-X display ID or listing_id number
 * @returns {string} - URL-friendly slug
 */
export function generateListingSlug(title, displayId) {
  if (!title) return '';

  // Clean and normalize title
  const cleanTitle = title
    .toLowerCase()
    .trim()
    // Remove special characters except spaces, hyphens, and alphanumeric
    .replace(/[^a-z0-9\s\-]/g, '')
    // Replace multiple spaces with single space
    .replace(/\s+/g, ' ')
    // Replace spaces with hyphens
    .replace(/\s/g, '-')
    // Remove multiple consecutive hyphens
    .replace(/-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '');

  // Format display ID (handle both BZ-X format and numbers)
  let formattedDisplayId;
  if (typeof displayId === 'string' && displayId.startsWith('BZ-')) {
    formattedDisplayId = displayId.toLowerCase();
  } else {
    formattedDisplayId = `bz-${displayId}`;
  }

  // Combine title and display ID
  const slug = `${cleanTitle}-${formattedDisplayId}`;

  // Ensure slug isn't too long (max 100 characters for SEO)
  return slug.length > 100 ? slug.substring(0, 97) + '...' : slug;
}

/**
 * Parse listing slug to extract display ID
 * @param {string} slug - The URL slug
 * @returns {string|null} - The display ID (BZ-X format) or null if not found
 */
export function parseDisplayIdFromSlug(slug) {
  if (!slug) return null;
  
  // Match BZ-X pattern at the end of slug
  const match = slug.match(/bz-(\d+)$/i);
  return match ? `BZ-${match[1]}` : null;
}

/**
 * Validate and sanitize slug
 * @param {string} slug - The slug to validate
 * @returns {boolean} - Whether slug is valid
 */
export function isValidSlug(slug) {
  if (!slug || typeof slug !== 'string') return false;
  
  // Check if slug matches expected pattern
  const slugPattern = /^[a-z0-9-]+bz-\d+$/i;
  return slugPattern.test(slug);
}

/**
 * Generate unique slug (handles duplicates by adding suffix)
 * @param {string} baseSlug - The base slug
 * @param {function} checkExists - Function to check if slug exists
 * @returns {string} - Unique slug
 */
export async function generateUniqueSlug(baseSlug, checkExists) {
  let slug = baseSlug;
  let counter = 1;

  while (await checkExists(slug)) {
    // Add numeric suffix if slug already exists
    const parts = baseSlug.split('-');
    const displayId = parts.pop(); // Get BZ-X part
    const titlePart = parts.join('-');
    
    slug = `${titlePart}-${counter}-${displayId}`;
    counter++;
  }

  return slug;
}

/**
 * Format display ID for consistent usage
 * @param {number} listingId - The numeric listing ID
 * @returns {string} - Formatted display ID (BZ-X)
 */
export function formatDisplayId(listingId) {
  return `BZ-${listingId}`;
}

// Example usage:
// generateListingSlug("2018 Pressure Pro Truck Mount", "BZ-1") 
// → "2018-pressure-pro-truck-mount-bz-1"

// generateListingSlug("Commercial Bin Cleaning Business!", 42)
// → "commercial-bin-cleaning-business-bz-42"