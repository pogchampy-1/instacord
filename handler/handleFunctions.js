const { Client } = require("discord.js");
const { readdirSync } = require("node:fs");
const { connect } = require("mongoose");

/** @param {Client} client */
module.exports = (client) => {
    // Events
    const eventFiles = readdirSync("./events/").filter((event) => event.endsWith(".js"));
    for (let file of eventFiles) {
        const event = require(`../events/${file}`);

        if (!event?.data?.name) return;

        if (event.data.once) {
            client.once(event.data.name, (...args) => event.execute(client, ...args));
        } else {
            client.on(event.data.name, (...args) => event.execute(client, ...args))
        }
    }

    // Slash Commands
    const slashCommands = [];
    readdirSync("./commands/").forEach((dir) => {
        const commandFiles = readdirSync(`./commands/${dir}/`).filter((file) => file.endsWith(".js"));
        
        for (let file of commandFiles) {
            const command = require(`../commands/${dir}/${file}`);


            if (!command.data?.name) return;
            client.commands.set(command.data.name, command);
            slashCommands.push(command.data)
        }
    });

    client.once("ready", async () => {
        await client.guilds.cache.get("888760200620834876").commands.set(slashCommands)
    });

    connect(process.env.mongoDB)
}