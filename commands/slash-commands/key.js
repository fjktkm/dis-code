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
                format: 'components'
            }
        });

        // Extract n (modulus) from the public key
        const n = crypto.createPublicKey(publicKey).export({
            type: 'pkcs1',
            format: 'components'
        }).n;

        // Extract p and q from the private key
        const { p, q } = privateKey;

        await interaction.reply(`Public Key (n):\n\`\`\`${n.toString('hex')}\`\`\``);

        await interaction.followUp({
            content: `Private Key components:\np: \`\`\`${p.toString('hex')}\`\`\`\nq: \`\`\`${q.toString('hex')}\`\`\``,
            ephemeral: true
        });
    },
};
