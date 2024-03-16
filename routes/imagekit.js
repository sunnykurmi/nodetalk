var ImageKit = require("imagekit");
require("dotenv").config({ path: "./.env" });


exports.initImagekit = function(){
    // Load environment variables
    const publicKey = process.env.PUBLICKEY_IMAGEKIT;
    const privateKey = process.env.PRIVATEKEY_IMAGEKIT;
    const endpointUrl = process.env.ENDPOINT_URL;

    // Check if required environment variables are present
    if (!publicKey || !privateKey || !endpointUrl) {
        console.error("Missing one or more required environment variables.");
        return null; // Return null to indicate failure
    }
    
    try {
        var imagekit = new ImageKit({
            publicKey: publicKey,
            privateKey: privateKey,
            urlEndpoint: endpointUrl
        });
        console.log("ImageKit initialized successfully.");
        return imagekit; // Return initialized ImageKit instance
    } catch (error) {
        console.error("Error initializing ImageKit:", error);
        return null; // Return null to indicate failure
    }
};
