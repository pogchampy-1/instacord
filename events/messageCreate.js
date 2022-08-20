const { EmbedBuilder, Message, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    data: {
        name: "messageCreate",
        once: false
    },
    /** @param {Client} client @param {Message} message */
    execute: async (client, message) => {
        
        if (message.author.bot || !message.guild) return;


        const embed = new EmbedBuilder()
            .setColor(0x2f3136)
            .setThumbnail(client.user.displayAvatarURL())
            .setDescription(`Hey ${message.author?.toString()}, my name is **InstaCord!**\n\nI bring **social media** and **meeting people** to Discord!\n\nI **only** function through slash commands (/). If you cannot see them, try re-inviting me!`)
            .setFooter({ text: "InstaCord", iconURL: client.user.displayAvatarURL() });

        const buttons = new ActionRowBuilder.addComponents([
            new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setLabel("Invite me")
            .setURL(`https://discord.com/api/oauth2/authorize?client_id=1002627058918228068&permissions=2684734464&scope=bot%20applications.commands`),  
            new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setLabel("Support Server")
            .setURL(`https://discord.com`),
        ]);

       

        if (message.content.match(/^<@!?1002627058918228068>$/)) {
            return message.reply(
              {
                embeds: [embed], components: [buttons]
              }
            );
         }
    }
}
