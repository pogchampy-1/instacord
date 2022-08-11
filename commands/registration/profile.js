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
            },
            {
                name: "update",
                description: "Update your InstaCord profile",
                type: ApplicationCommandOptionType.Subcommand,
                options: [
                    {
                        name: "module",
                        description: "Input a module",
                        type: ApplicationCommandOptionType.String,
                        choices: [
                            { name: "username", value: "username" },
                            { name: "bio", value: "bio" },
                            { name: "age", value: "age" },
                            { name: "birthday", value: "birthday" },
                            { name: "gender", value: "gender" },
                            { name: "country", value: "country" },
                            { name: "banner", value: "banner" },
                        ],
                        required: true
                    },
                    {
                        name: "value",
                        description: "Input a value",
                        type: ApplicationCommandOptionType.String,
                        autocomplete: true,
                        required: true
                    }
                ]
            }
        ]
    },
    /** @param {{ client: Client; interaction: ChatInputCommandInteraction; }} */
    execute: async ({ interaction }) => {
        const sub = interaction.options.getSubcommand();
        const username = interaction.options.getString("username");
        const age = interaction.options.getInteger("age");
        const gender = interaction.options.getString("gender");
        const country = interaction.options.getString("country");
        const birthday = interaction.options.getString("birthday");
        const bio = interaction.options.getString("bio") || null;
        const banner = interaction.options.getString("background") || "black";
        const mod = interaction.options.getString("module");
        const value = interaction.options.getString("value");

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
                following: [],
                followers: [],
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

                let fontSize = 30;

                do {
                    context.font = `bold ${fontSize -= 10}px Cascadia Code`;
                } while (context.measureText(text).width > canvas.width - 300);

                return context.font;
            };
            const canvas = Canvas.createCanvas(700, 250);
            const ctx = canvas.getContext("2d");

            const circle = {
                x: canvas.width / 11.0,
                y: canvas.height / 4.0,
                radius: 30
            }

            let image = await Canvas.loadImage(`./assets/backgrounds/${data.banner}.png`);

            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

            ctx.strokeStyle = "#009ff";

            ctx.strokeRect(0, 0, canvas.width, canvas.height);

            ctx.font = applyText(canvas, data.username);

            ctx.fillStyle = "#ffffff";

            ctx.fillText(data.username, canvas.width / 7.0, canvas.height / 3.7);

            ctx.font = "bold 20px Cascadia Code";

            ctx.fillStyle = "#ffffff";
            
            ctx.fillText(data.gender, 600, canvas.height / 3.8)

            ctx.font = 'bold 25px Cascadia Code';

            ctx.fillStyle = "#ffffff";

            ctx.fillText(data.bio ? `${data.bio}` : "Not set", 25, canvas.height / 1.7);

            ctx.font = 'bold 10px Cascadia Code';

            ctx.fillStyle = "#ffffff";

            ctx.fillText(`• Birthday ${new Date(data.birthday)?.toLocaleDateString()} - ${data.age} years old`, 25, canvas.height / 1.3);

            ctx.font = 'bold 10px Cascadia Code';

            ctx.fillStyle = "#ffffff";

            ctx.fillText(`• Followers: ${data.followers?.length} - Following: ${data.following?.length}`, 25, canvas.height / 1.2);

            ctx.font = "bold 10px Cascadia Code";

            ctx.fillStyle = "#ffffff";

            ctx.fillText(`• Country: ${data.country}`, 25, canvas.height / 1.1);

            ctx.beginPath();

            ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2, true);

            ctx.closePath();

            ctx.clip();

            const avatar = await Canvas.loadImage(interaction.user?.displayAvatarURL({ extension: "jpg" }));
            const aspect = avatar.width / avatar.height;

            const hsx = circle.radius * Math.max(1.0 / aspect, 1.0);
            const hsy = circle.radius * Math.max(aspect, 1.0);
            ctx.drawImage(avatar, circle.x - hsx, circle.y - hsy, hsx * 2, hsy * 2);

            const attachment = new AttachmentBuilder(await canvas.encode("png"), { name: "profile.png" });

            interaction.reply({
                files: [attachment],
                ephemeral: true
            }).catch(() => console.log("An error occured!"));
        } else if (sub === "update") {
            if (!data) return interaction.reply({
                content: `You are not registered in the client!`,
                ephemeral: true
            });
            if (mod === "username") {
                data.username = value?.toString();
                await data.save({ safe: true }).catch(() => { });
            } else if (mod === "bio") {
                data.bio = value?.toString();
                await data.save({ safe: true }).catch(() => { });
            } else if (mod === "age") {
                if (parseInt(value) < 13 || parseInt(value) > 100) return interaction.reply({
                    content: "Invalid age provided",
                    ephemeral: true
                });

                data.age = parseInt(value);
                await data.save({ safe: true }).catch(() => { })
            } else if (mod === "birthday") {
                if (!validateBirthday.test(value)) return interaction.reply({
                    content: `You have provided an invalid birth date!`,
                    ephemeral: true
                });

                data.birthday = new Date(value);
                await data.save({ safe: true }).catch(() => { });
            } else if (mod === "gender") {
                if (!["male", "female"]?.some((x) => x === value?.toLowerCase())) return interaction.reply({
                    content: "Invalid gender provided",
                    ephemeral: true
                });

                data.gender = `${value[0].toUpperCase()}${value.slice(1).toLowerCase()}`;
                await data.save({ safe: true }).catch(() => { });
            } else if (mod === "country") {
                if (!countryList?.includes(value.toString())) return interaction.reply({
                    content: `You have provided an invalid country!`,
                    ephemeral: true
                });

                data.country = value?.toString();
                await data.save({ safe: true }).catch(() => { });
            } else if (mod === "banner") {
                if (!["blue", "green", "black", "blurple", "indigo", "orange", "red", "violet", "yellow"]?.some((x) => x === value?.toLowerCase())) return interaction.reply({
                    content: `Invalid background color provided`,
                    ephemeral: true
                });

                data.banner = value?.toString();
                await data.save({ safe: true }).catch(() => { });
            }

            interaction.reply({
                content: `Updated **${mod}** to **${value?.toString()}**`,
                ephemeral: true
            });
        }
    }
};
