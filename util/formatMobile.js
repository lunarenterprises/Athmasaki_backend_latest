module.exports.addCountryCode = (mobile, defaultCode = '+91') => {
    // Remove any spaces for consistency
    mobile = mobile.toString().trim();

    // If mobile already starts with a + followed by digits, return as-is
    if (/^\+\d+/.test(mobile)) {
        return mobile;
    }

    // Add the default country code
    return defaultCode + mobile;
}
