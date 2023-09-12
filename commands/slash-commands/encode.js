const { SlashCommandBuilder } = require('discord.js');
const crypto = require('crypto');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('encode')
        .setDescription('Encode a message using RSA.')
        .addStringOption(option =>
            option.setName('publickey')
                .setDescription('The entire public key in JWK format for encoding.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('message')
                .setDescription('The message you want to encode.')
                .setRequired(true)),
    async execute(interaction) {
        const publicKeyJWK = JSON.parse(interaction.options.getString('publickey'));
        const message = interaction.options.getString('message');

        // Construct the public key in PEM format using the provided JWK
        const publicKeyPEM = crypto.createPublicKey({
            key: publicKeyJWK,
            format: 'jwk',
            type: 'pkcs1'
        }).export({
            type: 'spki',
            format: 'pem'
        });

        try {
            const encryptedMessage = crypto.publicEncrypt(publicKeyPEM, Buffer.from(message));
            await interaction.reply(`Encoded Message:\n\`\`\`${encryptedMessage.toString('base64')}\`\`\``);
            await interaction.followUp({
                content: `Message:\n\`\`\`${message}\`\`\``,
                ephemeral: true
            });
        } catch (error) {
            await interaction.reply({
                content: 'Error encoding the message. Please ensure you provided a valid public key in JWK format.',
                ephemeral: true
            });
        }
    },
};
