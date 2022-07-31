const { Client, Interaction, InteractionType } = require("discord.js");
const { countryList } = require("../json/countries.json");

module.exports = {
    data: {
        name: "interactionCreate",
        once: false
    },
    /** @param {Client} client @param {Interaction} interaction */
    execute: async (client, interaction) => {
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);

            if (!command) return;

            await command.execute({ 
                client, 
                interaction
            });
        }

        if (interaction.type === InteractionType.ApplicationCommandAutocomplete) {
            if (interaction.commandName === "profile") {
                if (interaction.options.getSubcommand() === "register") {
                    const focused = interaction.options.getFocused(true);

                    if (focused?.name !== "country") return;

                    if (!focused.value?.toString().trim().length) return interaction.respond([
                        {
                            name: "Input a country",
                            value: "null"
                        }
                    ]);

                    const choices = [...new Set(countryList.map((c) => c?.toString()))];
                    const filtered = choices.filter((x) => x.startsWith(focused.value))?.slice(0, 25);
                    await interaction.respond(
                        filtered.map((x) => ({
                            name: x,
                            value: x
                        }))
                    )
                }
            }
        }
    }
}