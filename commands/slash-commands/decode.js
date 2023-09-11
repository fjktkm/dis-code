const { SlashCommandBuilder } = require('discord.js');
const crypto = require('crypto');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('decode')
        .setDescription('Decode an encoded message using RSA.')
        .addStringOption(option =>
            option.setName('privatekey')
                .setDescription('The entire private key in JWK format for decoding.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('encodedmessage')
                .setDescription('The encoded message you want to decode.')
                .setRequired(true)),
    async execute(interaction) {
        const privateKeyJWK = JSON.parse(interaction.options.getString('privatekey'));
        const encodedMessage = Buffer.from(interaction.options.getString('encodedmessage'), 'base64');

        // Construct the private key in PEM format using the provided JWK
        const privateKeyPEM = crypto.createPrivateKey({
            key: privateKeyJWK,
            format: 'jwk',
            type: 'pkcs1'
        }).export({
            type: 'pkcs8',
            format: 'pem'
        });

        try {
            const decryptedMessage = crypto.privateDecrypt(privateKeyPEM, encodedMessage);
            await interaction.reply({
                content: `Decoded Message:\n\`\`\`${decryptedMessage.toString()}\`\`\``,
                ephemeral: true
            });
        } catch (error) {
            await interaction.reply({
                content: 'Error decoding the message. Please ensure you provided a valid private key in JWK format and an encoded message.',
                ephemeral: true
            });
        }
    },
};
