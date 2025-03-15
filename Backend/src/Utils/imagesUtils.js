export function parseImages(userId, imagesToParse) {
    const { API_HOST, API_PORT, API_VERSION } = process.env;

    const images = [];
    for (const imageToParse of imagesToParse) {
        const image = {
            imageId: imageToParse.id,
            imageURL: `http://${API_HOST}:${API_PORT}/api/v${API_VERSION}/users/${userId}/images/${imageToParse.id}`,
        };
        images.push(image);
    }
    return images;
}
