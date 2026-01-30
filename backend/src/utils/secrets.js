const { SecretsManagerClient, GetSecretValueCommand } = require("@aws-sdk/client-secrets-manager");

const client = new SecretsManagerClient({
    region: process.env.AWS_REGION || "eu-west-1",
});

let cachedSecrets = null;

const fetchSecrets = async () => {
    if (cachedSecrets) return cachedSecrets;

    const secretName = "devtinder/secrets"; // Consolidated secret name

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
                return cachedSecrets;
            } catch (parseError) {
                console.error("CRITICAL: Failed to parse secrets JSON from AWS Secrets Manager. Ensure the secret is a valid Key/Value (JSON) object.");
                throw parseError;
            }
        }
    } catch (error) {
        console.error("Error fetching secrets from AWS Secrets Manager:", error);
        return null;
    }
};

const getJWTPrivateKey = async () => {
    const secrets = await fetchSecrets();
    return secrets?.JWT_PRIVATE_KEY || process.env.JWT_PRIVATE_KEY;
};

const getJWTPublicKey = async () => {
    const secrets = await fetchSecrets();
    return secrets?.JWT_PUBLIC_KEY || process.env.JWT_PUBLIC_KEY;
};

const getMongoURI = async () => {
    const secrets = await fetchSecrets();
    return secrets?.MONGO_URI || process.env.MONGO_URI;
};

module.exports = { getJWTPrivateKey, getJWTPublicKey, getMongoURI };
