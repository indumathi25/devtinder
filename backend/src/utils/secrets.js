const { SecretsManagerClient, GetSecretValueCommand } = require("@aws-sdk/client-secrets-manager");

const client = new SecretsManagerClient({
    region: process.env.AWS_REGION || "eu-west-1",
});

let cachedSecrets = null;

const fetchSecrets = async () => {
    if (cachedSecrets) return cachedSecrets;

    const secretName = "devtinder/secrets";

    try {
        const response = await client.send(
            new GetSecretValueCommand({
                SecretId: secretName,
                VersionStage: "AWSCURRENT",
            })
        );

        if (response.SecretString) {
            try {
                cachedSecrets = JSON.parse(response.SecretString);
                console.log(`Successfully retrieved secrets from AWS. Keys found: ${Object.keys(cachedSecrets).join(', ')}`);
                return cachedSecrets;
            } catch (parseError) {
                console.error("CRITICAL: Failed to parse secrets JSON from AWS Secrets Manager.");
                throw parseError;
            }
        }
    } catch (error) {
        console.warn("Notice: AWS Secrets Manager unreachable. This is normal during local development.");
        return null;
    }
};

const getJWTPrivateKey = async () => {
    const secrets = await fetchSecrets();
    const key = secrets?.JWT_PRIVATE_KEY || process.env.JWT_PRIVATE_KEY;
    if (!key) console.warn("WARN: JWT_PRIVATE_KEY not found.");
    return key;
};

const getJWTPublicKey = async () => {
    const secrets = await fetchSecrets();
    const key = secrets?.JWT_PUBLIC_KEY || process.env.JWT_PUBLIC_KEY;
    if (!key) console.warn("WARN: JWT_PUBLIC_KEY not found.");
    return key;
};

const getMongoURI = async () => {
    const secrets = await fetchSecrets();
    const uri = secrets?.MONGO_URI || process.env.MONGO_URI;
    if (!uri) {
        console.error("CRITICAL: MONGO_URI is missing from both AWS and Environment.");
    } else {
        console.log("MONGO_URI found successfully.");
    }
    return uri;
};

module.exports = { getJWTPrivateKey, getJWTPublicKey, getMongoURI };
