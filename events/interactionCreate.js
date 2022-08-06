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
                const focused = interaction.options.getFocused(true);
                if (interaction.options.getSubcommand() === "register") {
                    if (focused?.name !== "country") return;

                    if (!focused.value.trim().length) return interaction.respond([
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
                } else if (interaction.options.getSubcommand() === "update") {
                    if (focused?.name === "value") {
                        /** @type {string[]} */
                        let choices;
                        /** @type {string[]} */
                        let filtered;
                        if (interaction.options.getString("value") === "banner") {
                            if (!focused.value.trim().length) return interaction.respond(
                                [
                                    { 
                                        name: "Input a background color",
                                        value: "null"
                                    }
                                ]
                            );
                            choices = ["black", "blue", "blurple", "green", "indigo", "orange", "red", "violet", "yellow"]
                            filtered = choices.filter((x) => x.startsWith(focused.value))?.slice(0, 25)
                            await interaction.respond(
                                filtered.map((x) => ({
                                    name: x,
                                    value: x
                                }))
                            );
                        } else if (interaction.options.getString("value") === "gender") {
                            if (!focused.value.trim().length) return interaction.respond(
                                [
                                    { 
                                        name: "Input a gender",
                                        value: "null"
                                    }
                                ]
                            );
                            choices = ["male", "female"]
                            filtered = choices.filter((x) => x.startsWith(focused.value))?.slice(0, 25)
                            await interaction.respond(
                                filtered.map((x) => ({
                                    name: x,
                                    value: x
                                }))
                            );
                        } else if (interaction.options.getString("value") === "country") {
                            if (!focused.value.trim().length) return interaction.respond([
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
                        } else {
                            await interaction.respond(
                                [
                                    {
                                        name: "Autocomplete is for country, gender and background",
                                        value: "null"
                                    }
                                ]
                            ).catch(() => { })
                        }
                    }
                }
            }
        }
    }
}