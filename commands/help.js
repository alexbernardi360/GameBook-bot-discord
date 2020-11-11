module.exports = {
    name: 'help',
    aliases: ['h'],
    description: 'List all of my commands or info about a specific command.',
    guildOnly: false,
    usage: '[command name]',
    cooldown: 5,
    execute(message, args) {
        const prefix = '!'
        const { commands } = message.client

        if (!args.length)
            message.author.send({ embed: makeHelpEmbed(commands, prefix) })
                .then(() => {
                    if (message.channel.type !== 'dm')
                        message.reply('I\'ve sent you a DM  with all my commands!')
                })
                .catch((error) => {
                    console.error(`Could not send help DM to ${message.author.tag}.\n`, error)
                    message.reply('It seems like I can\'t DM you! Do you have DMs disabled?')
                })
        else {
            const name = args[0].toLowerCase()
            const command = commands.get(name) || commands.find((c) => c.aliases && c.aliases.includes(name))

            if (command)
                message.channel.send({ embed: makeCommandEmbed(command, prefix) })
            else
                message.reply('That\'s not a valid command!')
        }
    }
}

function makeCommandEmbed(command, prefix) {
    const embed = {
        color: 0x0099ff,
        title: command.name,
        fields: [],
        timestamp: new Date(),
        footer: { text: `Cooldown: ${command.cooldown || 3} second(s)`}
    }

    if (command.description) embed.description = command.description
    if (command.aliases) {
        let aliases = {
            name: 'Aliases',
            value: command.aliases.join(', '),
            inline: false
        }
        embed.fields.push(aliases)
    }
    if (command.usage) {
        let usage = {
            name: 'Usage',
            value: `${prefix}${command.name} ${command.usage}`,
            inline: false
        }
        embed.fields.push(usage)
    }

    return embed
}

function makeHelpEmbed(commands, prefix) {
    const embed = {
        color: 0x0099ff,
        title: 'Help',
        description: 'Here\'s a list of all my commands',
        fields: [],
        timestamp: new Date()
    }
    const blank = { name: '\u200B', value: '\u200B' }
    const tip = {
        name: 'Tip',
        value: `You can send \`${prefix}help [command name]\` to get info on a specific command!`,
        inline: false
    }

    embed.fields.push(commands.map((command) => {
        return {
            name: command.name,
            value: command.description,
            inline: true
        }
    }))
    embed.fields.push(blank)
    embed.fields.push(tip)

    return embed
}