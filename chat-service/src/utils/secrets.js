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
            cachedSecrets = JSON.parse(response.SecretString);
            return cachedSecrets;
        }
    } catch (error) {
        console.error("Error fetching secrets from AWS Secrets Manager:", error);
        return null;
    }
};

const getMongoURI = async () => {
    const secrets = await fetchSecrets();
    return secrets?.MONGO_URI || process.env.MONGO_URI;
};

const getJWTPublicKey = async () => {
    const secrets = await fetchSecrets();
    return secrets?.JWT_PUBLIC_KEY || process.env.JWT_PUBLIC_KEY;
};

module.exports = { getMongoURI, getJWTPublicKey };
// Note: Private Key is only needed by main backend, so we don't include getJWTPrivateKey here
