const { SlashCommandBuilder } = require('discord.js');
const crypto = require('crypto');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('key')
        .setDescription('Generate keys.'),
    async execute(interaction) {
        const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: {
                type: 'spki',
                format: 'pem'
            },
            privateKeyEncoding: {
                type: 'pkcs1',
                format: 'pem'
            }
        });

        const publicKeyJWK = crypto.createPublicKey(publicKey).export({
            format: 'jwk'
        });

        const privateKeyJWK = crypto.createPrivateKey(privateKey).export({
            format: 'jwk'
        });

        await interaction.reply(`Public Key:\n\`\`\`${JSON.stringify(publicKeyJWK, null, 2)}\`\`\``);

        await interaction.followUp({
            content: `Private Key:\n\`\`\`${JSON.stringify(privateKeyJWK, null, 2)}\`\`\``,
            ephemeral: true
        });
    },
};
