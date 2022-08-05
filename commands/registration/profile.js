const { Client, ChatInputCommandInteraction, ApplicationCommandOptionType, AttachmentBuilder } = require("discord.js");
const { countryList } = require("../../json/countries.json");
const { profiles } = require("../../models/profile");
const Canvas = require("@napi-rs/canvas");

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
                        description: "Input a birthday (dd m yyyy)",
                        type: ApplicationCommandOptionType.String,
                        required: true
                    },
                    {
                        name: "bio",
                        description: "Input a bio",
                        type: ApplicationCommandOptionType.String,
                        required: false
                    },
                    {
                        name: "background",
                        description: "Input a background color",
                        type: ApplicationCommandOptionType.String,
                        choices: [
                            { name: "black", value: "black" },
                            { name: "blue", value: "blue" },
                            { name: "blurple", value: "blurple" },
                            { name: "green", value: "green" },
                            { name: "indigo", value: "indigo" },
                            { name: "orange", value: "orange" },
                            { name: "red", value: "red" },
                            { name: "violet", value: "violet" },
                            { name: "yellow", value: "yellow" }
                        ],
                        required: false,
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
        const banner = interaction.options.getString("background") || "black";

        let validateBirthday = /^(3[01]|[12][0-9]|0[1-9]) (January|February|March|April|May|June|July|August|September|October|November|December) \b(19|20)\d\d\b$/i;

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
                banner,
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

            await profiles.deleteOne({ _id: interaction.user?.id }).catch(() => { });

            interaction.reply({
                content: `Successfully deleted your account!`,
                ephemeral: true
            }).catch(() => { });
        } else if (sub === "view") {
            if (!data) return interaction.reply({
                content: `You are not registered in the client!`,
                ephemeral: true
            });

            const applyText = (canvas, text) => {
                const context = canvas.getContext("2d");

                let fontSize = 70;

                do {
                    context.font = `bold ${fontSize -= 10}px Cascadia Code`;
                } while (context.measureText(text).width > canvas.width - 300);

                return context.font;
            };
            const canvas = Canvas.createCanvas(700, 250);
            const ctx = canvas.getContext("2d");

            let image = await Canvas.loadImage(`./assets/backgrounds/${data.banner}.png`);

            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

            ctx.strokeStyle = "#009ff";

            ctx.strokeRect(0, 0, canvas.width, canvas.height);

            ctx.font = applyText(canvas, data.username);

            ctx.fillStyle = "#ffffff";

            ctx.fillText(data.username, canvas.width / 2.5, canvas.height / 1.9);

            ctx.font = 'bold 15px Cascadia Code';

            ctx.fillStyle = "#ffffff";

            ctx.fillText(data.bio ? `Bio: ${data.bio}` : "Bio: Not set", canvas.width / 2.5, canvas.height / 1.4);

            ctx.font = 'bold 15px Cascadia Code';

            ctx.textAlign = "right";

            ctx.fillStyle = "#ffffff";

            ctx.fillText(`Info: ${data.age} | ${data.gender} | ${new Date(data.birthday)?.toLocaleDateString()}`, 675, canvas.height / 1.4);

            ctx.font = 'bold 10px Cascadia Code';

            ctx.fillStyle = "#ffffff";

            ctx.fillText(`Followers: ${data.followers}`, 350, canvas.height / 1.1);

            ctx.font = 'bold 10px Cascadia Code';

            ctx.fillStyle = "#ffffff";

            ctx.fillText(`Following: ${data.following}`, 450, canvas.height / 1.1);

            ctx.font = "bold 10px Cascadia Code";

            ctx.fillStyle = "#ffffff";

            ctx.fillText(`Country: ${data.country}`, 675, canvas.height / 1.1);

            ctx.beginPath();

            ctx.arc(125, 125, 100, 0, Math.PI * 2, true);

            ctx.closePath();

            ctx.clip();

            const avatar = await Canvas.loadImage(interaction.user?.displayAvatarURL({ extension: "jpg" }));

            ctx.drawImage(avatar, 25, 25, 200, 200);

            const attachment = new AttachmentBuilder(await canvas.encode("png"), { name: "profile.png" });

            interaction.reply({
                files: [attachment],
                ephemeral: true
            }).catch(() => console.log("An error occured!"));
        }
    }
};