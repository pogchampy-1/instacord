const { EmbedBuilder, Message, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    data: {
        name: "messageCreate",
        once: false
    },
    /** @param {Client} client @param {Message} message */
    execute: async (client, message) => {
        
        if (message.author.bot) return;
        if (message.channel.type === "DM") return;


        let embed = new EmbedBuilder()
        .setTitle("You mentioned me!")
        .setColor("PINK")
        .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
        .setDescription(`Hey ${message.author.username}, my name is **InstaCord!**\n\nI bring **social media** and **meeting people** to Discord!\n\nI **only** function through slash commands (/). If you cannot see them, try re-inviting the bot! `)
        .setFooter({ text: "InstaCord", iconURL: client.user.displayAvatarURL({ dynamic: true }) });

        const Buttons = new ActionRowBuilder.addComponents([
            new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setLabel("Invite me!")
            .setURL(`https://discord.com/api/oauth2/authorize?client_id=botID&permissions=permissionInt&scope=bot%20applications.commands`), //replace botID with bot's ID and permissionInt with the permissions integer 


            new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setLabel("Vote!")
            .setURL(`voteLink`), //replace voteLink with bot's vote link



            new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setLabel("Support Server!")
            .setURL(`supportServerLink`), //replace supportServerLink with bot's support server link
        ]);

       

        if (message.content ===`<@!${client.user.id}>` || message.content === `<@${client.user.id}>`) {
            return message.channel.send(
              {
                embeds: [embed], components: [Buttons]
              }
            );
          }
       
    }
}