const { SecretsManagerClient, GetSecretValueCommand } = require("@aws-sdk/client-secrets-manager");

const client = new SecretsManagerClient({
    region: process.env.AWS_REGION || "eu-west-1",
});

let cachedPrivateKey = null;

const getJWTPrivateKey = async () => {
    if (cachedPrivateKey) return cachedPrivateKey;

    const secretName = "devtinder/jwt_private_key";

    try {
        const response = await client.send(
            new GetSecretValueCommand({
                SecretId: secretName,
                VersionStage: "AWSCURRENT",
            })
        );

        if (response.SecretString) {
            cachedPrivateKey = response.SecretString;
            return cachedPrivateKey;
        }
    } catch (error) {
        console.error("Error fetching secret from AWS Secrets Manager:", error);
        // Fallback to environment variable for local development
        return process.env.JWT_PRIVATE_KEY;
    }
};

module.exports = { getJWTPrivateKey };
