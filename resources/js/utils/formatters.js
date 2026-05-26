/**
 * formatCurrency(value)
 * Formats a number into Indonesian Rupiah (IDR) currency format.
 */
export const formatCurrency = (val) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(val || 0);
};

/**
 * formatNumber(value)
 * Formats large integers with Indonesian thousand separators.
 */
export const formatNumber = (val) => {
  return new Intl.NumberFormat('id-ID').format(val || 0);
};

/**
 * formatPercent(value)
 * Formats decimal growth values into percentage strings.
 */
export const formatPercent = (val) => {
  const percent = (val || 0).toFixed(1);
  return `${percent}%`;
};

/**
 * parseCurrencyToNumber(string)
 * Useful for stripping formatting back to integers for backend processing.
 */
export const parseCurrencyToNumber = (formattedVal) => {
  return parseInt(formattedVal.toString().replace(/\D/g, "")) || 0;
};
