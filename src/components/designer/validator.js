// ----------------------------------------------------------------------
// Production Pre-Flight Email Design Validation Engine
// Validates visual objects, text content, image assets, links, and accessibility
// before exporting, publishing, or sending inbox tests.
// ----------------------------------------------------------------------

export function validateEmailDesign(objects, canvasWidth = 640) {
  const issues = [];

  if (!objects || objects.length === 0) {
    issues.push({
      type: 'warning',
      title: 'Empty Canvas',
      message: 'Your canvas has no objects. Add text, images, or buttons before publishing.'
    });
    return { isValid: false, issues };
  }

  let hasUnsubscribe = false;
  let hasMainContent = false;

  objects.forEach((obj, idx) => {
    const label = obj.name || `Object #${idx + 1}`;

    // 1. Check canvas bounds
    if (obj.x < -20 || (obj.x + obj.width) > canvasWidth + 20) {
      issues.push({
        type: 'warning',
        title: 'Canvas Boundary Overflow',
        message: `"${label}" extends beyond the email artboard boundaries (${canvasWidth}px). It may cause horizontal scrolling on mobile email clients.`,
        objectId: obj.id
      });
    }

    // 2. Image Validations
    if (obj.type === 'image') {
      hasMainContent = true;
      if (!obj.url) {
        issues.push({
          type: 'error',
          title: 'Missing Image Source',
          message: `"${label}" has no valid image URL configured.`,
          objectId: obj.id
        });
      }
      if (!obj.alt || obj.alt.trim() === '') {
        issues.push({
          type: 'warning',
          title: 'Missing Accessibility Alt Text',
          message: `"${label}" does not have alternative text (alt text). Screen readers and blocked image clients will not display content.`,
          objectId: obj.id
        });
      }
    }

    // 3. Button Validations
    if (obj.type === 'button') {
      hasMainContent = true;
      if (!obj.url || obj.url === '#' || obj.url.trim() === '') {
        issues.push({
          type: 'warning',
          title: 'Unset Button URL',
          message: `CTA button "${obj.text || label}" does not have a destination URL configured.`,
          objectId: obj.id
        });
      }
      if (!obj.text || obj.text.trim() === '') {
        issues.push({
          type: 'error',
          title: 'Empty Button Text',
          message: `CTA button "${label}" has empty text.`,
          objectId: obj.id
        });
      }
    }

    // 4. Text Validations & Unsubscribe Check
    if (obj.type === 'text') {
      hasMainContent = true;
      if (!obj.text || obj.text.trim() === '') {
        issues.push({
          type: 'warning',
          title: 'Empty Text Block',
          message: `"${label}" contains no text content.`,
          objectId: obj.id
        });
      }
      if (obj.text && obj.text.includes('{{unsubscribe_url}}')) {
        hasUnsubscribe = true;
      }
    }

    // 5. Social Links Check
    if (obj.type === 'social') {
      if (obj.urls) {
        Object.entries(obj.urls).forEach(([plat, url]) => {
          if (!url || url.includes('...')) {
            issues.push({
              type: 'info',
              title: 'Unconfigured Social Link',
              message: `Social row "${label}" has default placeholder link for ${plat}.`,
              objectId: obj.id
            });
          }
        });
      }
    }
  });

  // Mandatory Unsubscribe Mechanism Warning
  if (!hasUnsubscribe) {
    issues.push({
      type: 'info',
      title: 'Missing Unsubscribe Variable',
      message: 'Consider inserting {{unsubscribe_url}} in a footer text block to maintain CAN-SPAM compliance.',
    });
  }

  const hasErrors = issues.some(i => i.type === 'error');
  return {
    isValid: !hasErrors,
    issues
  };
}
