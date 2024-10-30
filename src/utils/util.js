export const formatAmount = (amount, decimals = 0) => {
    if (isNaN(amount) || isNaN(decimals)) {
        throw new Error('Invalid input');
    }

    return parseFloat(amount)
        .toFixed(decimals)
        .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};
