const { SlashCommandBuilder } = require('discord.js');
const crypto = require('crypto');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('decode')
        .setDescription('Decode an encoded message using RSA.')
        .addStringOption(option =>
            option.setName('privatekey_p')
                .setDescription('The "p" component of the RSA private key for decoding.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('privatekey_q')
                .setDescription('The "q" component of the RSA private key for decoding.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('encodedmessage')
                .setDescription('The encoded message you want to decode.')
                .setRequired(true)),
    async execute(interaction) {
        const p = Buffer.from(interaction.options.getString('privatekey_p'), 'hex');
        const q = Buffer.from(interaction.options.getString('privatekey_q'), 'hex');
        const encodedMessage = Buffer.from(interaction.options.getString('encodedmessage'), 'base64');

        // Construct the private key in PEM format using p and q
        const privateKeyPEM = crypto.createPrivateKey({
            key: {
                kty: 'RSA',
                n: null,
                e: Buffer.from('010001', 'hex'), // This is 65537 in hex, a common choice for e
                d: null,
                p: p,
                q: q,
                dp: null,
                dq: null,
                qi: null
            },
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
                content: 'Error decoding the message. Please ensure you provided valid "p" and "q" components of the RSA private key and an encoded message.',
                ephemeral: true
            });
        }
    },
};
