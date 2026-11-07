const regionMap = {
    '+84': '0', // Việt Nam
    '+1': '1', // Mỹ
    '+44': '0', // Anh
    '+91': '', // Ấn Độ
};
function formatPhoneNumberWithRegion(phoneNumber) {
    for (const [regionCode, replacement] of Object.entries(regionMap)) {
        if (phoneNumber?.startsWith(regionCode)) {
            return replacement + phoneNumber.slice(regionCode.length);
        }
    }
    return phoneNumber;
};

export default formatPhoneNumberWithRegion;