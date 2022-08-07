const { Client, ChatInputCommandInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require("discord.js");
const { profiles } = require("../../models/profile");

module.exports = {
    data: {
        name: "browse",
        description: "Browse through different InstaCord profiles",
    },
    /** @param {{ client: Client; interaction: ChatInputCommandInteraction; }} */
    execute: async ({ interaction, client }) => {
        const data = await profiles.findOne({ _id: interaction.user?.id });

        if (!data) return interaction.reply({
            content: `You are not registered in the client!`,
            ephemeral: true
        });

        const getData = (await profiles.find()).filter((x) => x.username !== data.username);

        if (!getData?.length) return interaction.reply({
            content: `Unable to locate any InstaCord users!`,
            ephemeral: true
        });

        let randomUser = getData[Math.floor(Math.random() * getData.length)];

        /** @param {boolean} state @param {string[]} args */
        const components = (state, args) => [
            new ActionRowBuilder().addComponents([
                new ButtonBuilder()
                    .setCustomId("next")
                    .setDisabled(state)
                    .setLabel(args[0])
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId("follow")
                    .setDisabled(state)
                    .setLabel(args[1])
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId("end")
                    .setDisabled(state)
                    .setLabel(args[2])
                    .setStyle(ButtonStyle.Secondary)
            ])
        ];

        const embed = new EmbedBuilder()
            .setAuthor({ name: `We've found someone - ${randomUser.username}`, iconURL: client.user.displayAvatarURL() })
            .setColor(0x2f3136)

        interaction.reply({
            embeds: [
                embed.setDescription(randomUser.bio ? randomUser.bio : "Not set").addFields(
                        [
                        {
                            name: "Age 👤",
                            value: `${randomUser.age}`,
                            inline: true,
                        },
                        {
                            name: "Birthday 🎂",
                            value:`<t:${~~(new Date(randomUser.birthday)?.getTime() / 1000)}:D>`,
                            inline: true,
                        },
                        {
                            name: "Gender 🧬",
                            value: randomUser.gender,
                            inline: true
                        },
                        {
                            name: "Country 🌏",
                            value: randomUser.country,
                            inline: true,
                        },
                        {
                            name: "Followers 📊",
                            value: `${randomUser.followers?.length?.toLocaleString()}`,
                            inline: true
                        },
                        {
                            name: "Following 📊",
                            value: `${randomUser.following?.length?.toLocaleString()}`,
                            inline: true
                        },
                        {
                            name: "Banner 🏳️",
                            value: randomUser.banner
                        }
                    ]
                ).setFooter({ text: `Joined InstaCord: ${new Date(randomUser.createdAt)?.toLocaleDateString()}`, iconURL: client.user.displayAvatarURL() }).setThumbnail(
                    (await client.users.fetch(randomUser._id))?.displayAvatarURL()
                )
            ],
            components: components(true, ["Next Page", data.following?.includes(randomUser._id) ? "Unfollow" : "Follow", "End Interaction"]),
            ephemeral: true
        });
    }
}