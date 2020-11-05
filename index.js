// Import external modules
require('dotenv').config()
const fs = require('fs')
const Discord = require('discord.js')

const client = new Discord.Client()
client.commands = new Discord.Collection()
const cooldowns = new Discord.Collection()

const commandFile = fs.readdirSync('./commands').filter((file) => file.endsWith('.js'))

for (const file of commandFile) {
    const command = require(`./commands/${file}`)
    client.commands.set(command.name, command)
}

const prefix = '!'

const TOKEN = process.env.TOKEN

// On 'ready' event
client.once('ready', () => {
    console.info(`Logged in as ${client.user.tag}`)
})

// On 'message' event with dynamic command 
client.on('message', (message) => {
    // If the message doesn't start with the prefix, exit
    if (!message.content.startsWith(prefix) || message.author.bot) return

    // Split arguments
    const args = message.content.slice(prefix.length).trim().split(/ +/)
    const commandName = args.shift().toLowerCase()

    // If the command is not recognized, exit
    const command = client.commands.get(commandName) 
        || client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName))
    if (!command) return

    // Check for commands that shouldn't work in DMs
    if (command.guildOnly && message.channel.type === 'dm')
        return message.reply('I can\'t execute that command inside DMs!')

    // Check on arguments
    if (args.length < command.args) {
        let reply = `Too few arguments, ${message.author}!`

        if (command.usage)
            reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``

        return message.channel.send(reply)
    }

    // Check over the cooldown for each user
    if (!cooldowns.has(command.name))
        cooldowns.set(command.name, new Discord.Collection())

    const now = Date.now()
    const timestamps = cooldowns.get(command.name)
    const cooldownAmount = (command.cooldown || 3) * 1000;

    if (timestamps.has(message.author.id)){
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            return message.reply(`Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
        }
    }

    timestamps.set(message.author.id, now)
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount)

    try {
        command.execute(message, args)
    } catch (error) {
        console.error(error)
        message.reply('There was an error trying to execute that command!')
    }
})

client.login(TOKEN)