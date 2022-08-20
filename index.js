require("dotenv").config({ path: ".env" });
const { Client, Collection, GatewayIntentBits } = require("discord.js");


const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages
    ],
    allowedMentions: {
        repliedUser: false,
        parse: ["users"]
    },
});

client.commands = new Collection();

require("./handler/handleFunctions")(client);

client.login(process.env.botToken);