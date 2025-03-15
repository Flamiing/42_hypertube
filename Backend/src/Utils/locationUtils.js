export function getDistance(locationOne, locationTwo) {
    const R = 6371; // Radious of the earth in KM
    const dLat =
        ((locationTwo.latitude - locationOne.latitude) * Math.PI) / 180;
    const dLon =
        ((locationTwo.longitude - locationOne.longitude) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((locationOne.latitude * Math.PI) / 180) *
            Math.cos((locationTwo.latitude * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}
