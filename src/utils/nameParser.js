/**
 * Utility to smartly extract a clean First Name from any email address.
 * e.g. john.doe@university.edu -> John
 * e.g. alex_smith123@gmail.com -> Alex
 * e.g. sarah@stanford.edu -> Sarah
 */
export const extractFirstNameFromEmail = (email) => {
  if (!email || typeof email !== 'string') return 'Friend';
  const username = email.split('@')[0];
  if (!username) return 'Friend';

  // Split by dots, underscores, dashes, pluses
  const parts = username.split(/[._\-+]/).filter(p => p.length > 0);
  if (parts.length === 0) return 'Friend';

  // Look for the first part that has at least 2 non-digit chars
  let namePart = parts.find(p => !/^\d+$/.test(p) && p.replace(/\d+/g, '').length >= 2);
  if (!namePart) namePart = parts[0];

  // Clean numbers
  const cleaned = namePart.replace(/\d+/g, '');
  if (!cleaned || cleaned.length < 2) return 'Friend';

  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
};
