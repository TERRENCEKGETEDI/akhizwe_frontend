/**
 * Format data balance value to display in MB or GB
 * @param {number} value - Data balance value in MB
 * @returns {string} Formatted string with appropriate unit
 */
export const formatDataBalance = (value) => {
  if (value >= 1024) {
    // Convert to GB if value is 1024MB or more
    const gbValue = value / 1024;
    return `${gbValue.toFixed(2)} GB`;
  } else {
    // Display in MB for smaller values
    return `${Math.round(value)} MB`;
  }
};

/**
 * Format currency values
 * @param {number} value - Currency value
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (value) => {
  return `R${parseFloat(value).toFixed(2)}`;
};