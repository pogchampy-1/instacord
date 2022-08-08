const { Client, ChatInputCommandInteraction, ApplicationCommandOptionType, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ComponentType } = require("discord.js");
const { profiles } = require("../../models/profile");

module.exports = {
    data: {
        name: "follower",
        description: "View your followers and following",
        options: [
            {
                name: "view",
                description: "View your followers and following",
                type: ApplicationCommandOptionType.Subcommand,
            }
        ]
    },
    /** @param {{ client: Client;  interaction: ChatInputCommandInteraction; }} */
    execute: async ({ interaction, client }) => {
        const sub = interaction.options.getSubcommand();

        const data = await profiles.findOne({ _id: interaction.user?.id });

        if (!data) return interaction.reply({
            content: `You are not registered in the client!`,
            ephemeral: true
        });

        if (sub === "view") {
            if (!data.following?.length && !data.followers?.length) return interaction.reply({
                content: `You are not following anyone`,
                ephemeral: true
            });

            const mappedFollowers = await Promise?.all(
                data.followers?.flatMap(async (x) => {
                    const fetch = await profiles.findOne({ _id: x });

                    return [
                        `${fetch.username}`,
                        `<t:${~~(new Date(fetch.createdAt)?.getTime() / 1000)}:D>`
                    ].join(" • ")
                })
            );

            const mappedFollowing = await Promise?.all(
                data.following?.flatMap(async (x) => {
                    const fetch = await profiles.findOne({ _id: x });
    
                    return [
                        `${fetch.username}`,
                        `<t:${~~(new Date(fetch.createdAt)?.getTime() / 1000)}:D>`
                    ].join(" • ")
                })
            );

            /** @param {boolean} state @param {string} text */
            const components = (state, text) => [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId("next")
                        .setDisabled(state)
                        .setLabel(text)
                        .setStyle(ButtonStyle.Secondary)
                )
            ];

            const msg = await interaction.reply({
                embeds: [
                    new EmbedBuilder().setAuthor({
                        name: `${data?.username}'s Followers`,
                        iconURL: interaction.user?.displayAvatarURL()
                    }).setDescription(mappedFollowers?.join("\n") || "Seems empty, maybe someone hasn't landed on your profile yet?").setColor(0x2f3136).setFooter({ text: `Joined InstaCord: ${new Date(data.createdAt)?.toLocaleDateString()}`, iconURL: client.user?.displayAvatarURL() })
                ],
                components: components(false, "Following"),
                ephemeral: true,
                fetchReply: true
            });

            const collector = msg.createMessageComponentCollector({
                filter: (u) => u.user?.id === interaction.user?.id,
                time: 60000,
                componentType: ComponentType.Button
            });

            collector.on("collect", async (collect) => {
                if (collect.customId === "next") {
                    collect.deferUpdate().catch(() => { });
                    if (collect.message.embeds[0]?.author?.name?.endsWith("Followers")) {
                        interaction.editReply({
                            embeds: [
                                new EmbedBuilder()
                                    .setAuthor({ name: `${data.username}'s Following`, iconURL: interaction.user?.displayAvatarURL() })
                                    .setDescription(mappedFollowing?.join("\n") || `Seems empty, maybe try looking for someone you like with \`/browse\``).setColor(0x2f3136).setFooter({ text: `Joined InstaCord: ${new Date(data.createdAt)?.toLocaleDateString()}`, iconURL: client.user?.displayAvatarURL() })
                            ],
                            components: components(false, "Followers")
                        })
                    } else {
                        interaction.editReply({
                            embeds: [
                                new EmbedBuilder().setAuthor({
                                    name: `${data?.username}'s Followers`,
                                    iconURL: interaction.user?.displayAvatarURL()
                                }).setDescription(mappedFollowers?.join("\n") || "Seems empty, maybe someone hasn't landed on your profile yet?").setColor(0x2f3136).setFooter({ text: `Joined InstaCord: ${new Date(data.createdAt)?.toLocaleDateString()}`, iconURL: client.user?.displayAvatarURL() })
                            ],
                            components: components(false, "Following")
                        })
                    }
                }
            });

            collector.on("end", () => {
                interaction.editReply({
                    components: components(true, "Following")
                })
            });
        }
    }
}