const { Client, ChatInputCommandInteraction, ApplicationCommandOptionType } = require("discord.js");
const { countryList } = require("../../json/countries.json");
const { profiles } = require("../../models/profile");

module.exports = {
    data: {
        name: "profile",
        description: "All commands related to your InstaCord profile",
        options: [
            {
                name: "register",
                description: "Register yourself on the client",
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: "username",
                        description: "Input a username",
                        type: ApplicationCommandOptionType.String,
                        required: true
                    },
                    {
                        name: "age",
                        description: "Input an age",
                        type: ApplicationCommandOptionType.Integer,
                        minValue: 13,
                        maxValue: 100,
                        required: true
                    },
                    {
                        name: "gender",
                        description: "Input a gender",
                        type: ApplicationCommandOptionType.String,
                        choices: [
                            {
                                name: "Male",
                                value: "Male"
                            },
                            {
                                name: "Female",
                                value: "Female"
                            }
                        ],
                        required: true
                    },
                    {
                        name: "country",
                        description: "Input a country",
                        type: ApplicationCommandOptionType.String,
                        autocomplete: true,
                        required: true
                    },
                    {
                        name: "birthday",
                        description: "Input a birthday (dd-mm-yyyy)",
                        type: ApplicationCommandOptionType.String,
                        required: true
                    },
                    {
                        name: "bio",
                        description: "Input a bio",
                        type: ApplicationCommandOptionType.String,
                        required: false
                    }
                ]
            },
            {
                name: "unregister",
                description: "Unregister yourself on the client",
                type: ApplicationCommandOptionType.Subcommand
            },
            {
                name: "view",
                description: "View your InstaCord profile",
                type: ApplicationCommandOptionType.Subcommand
            }
        ]
    },
    /** @param {{ client: Client; interaction: ChatInputCommandInteraction; }} */
    execute: async ({ client, interaction }) => {
        const sub = interaction.options.getSubcommand();
        const username = interaction.options.getString("username");
        const age = interaction.options.getInteger("age");
        const gender = interaction.options.getString("gender");
        const country = interaction.options.getString("country");
        const birthday = interaction.options.getString("birthday");
        const bio = interaction.options.getString("bio") || null;

        let validateBirthday = /^(3[01]|[12][0-9]|0[1-9]) (January|February|March|April|May|June|July|August|September|October|November|December) \b(19|20)\d\d\b$/i

        const data = await profiles.findOne({ _id: interaction.user?.id });

        if (sub === "register") {
            if (data) return interaction.reply({
                content: `You already have an account registered as **${data?.username}**`,
                ephemeral: true
            });

            if (!validateBirthday.test(birthday)) return interaction.reply({
                content: `You have provided an invalid birth date!`,
                ephemeral: true
            });

            if (!countryList?.includes(country.toString())) return interaction.reply({
                content: `You have provided an invalid country!`,
                ephemeral: true
            });

            new profiles({
                _id: interaction.user?.id,
                username,
                bio,
                age,
                birthday: new Date(birthday),
                gender,
                country,
                following: 0,
                followers: 0,
            }).save();

            interaction.reply({
                content: `Successfully created your account under the username **${username}**`,
                ephemeral: true
            });
        } else if (sub === "unregister") {
            if (!data) return interaction.reply({
                content: `You are not registered in the client!`,
                ephemeral: true
            });

            await profiles.deleteOne({ _id: interaction.user?.id }).catch(() => {}); 

            interaction.reply({
                content: `Successfully deleted your account!`,
                ephemeral: true
            }).catch(() => {});
        } 
    }
}