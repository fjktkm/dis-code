const { SlashCommandBuilder } = require('discord.js');
const crypto = require('crypto');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('encode')
        .setDescription('Encode a message using RSA.')
        .addStringOption(option =>
            option.setName('publickey_n')
                .setDescription('The "n" component of the RSA public key for encoding.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('message')
                .setDescription('The message you want to encode.')
                .setRequired(true)),
    async execute(interaction) {
        const publicKeyN = interaction.options.getString('publickey_n');
        const message = interaction.options.getString('message');

        // Construct the public key in PEM format using n and a fixed public exponent e
        const publicKeyPEM = crypto.createPublicKey({
            key: {
                kty: 'RSA',
                n: Buffer.from(publicKeyN, 'hex'),
                e: Buffer.from('010001', 'hex'), // This is 65537 in hex, a common choice for e
            },
            format: 'jwk',
            type: 'pkcs1'
        }).export({
            type: 'spki',
            format: 'pem'
        });

        try {
            const encryptedMessage = crypto.publicEncrypt(publicKeyPEM, Buffer.from(message));
            await interaction.reply(`Encoded Message:\n\`\`\`${encryptedMessage.toString('base64')}\`\`\``);
        } catch (error) {
            await interaction.reply({
                content: 'Error encoding the message. Please ensure you provided a valid "n" component of the RSA public key.',
                ephemeral: true
            });
        }
    },
};
