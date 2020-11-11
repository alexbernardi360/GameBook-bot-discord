// Import external modules
const fs = require('fs')
const path = require('path')

// Import internal modules
const main_path = path.dirname(require.main.filename)
const GBlib = require(`${main_path}/lib/GBlib`)

module.exports = {
    name: 'list',
    description: 'List of available GameBooks.',
    guildOnly: false,
    cooldown: 5,
    execute(message) {
        // Gets all .json files in gamebooks folder
        const gamebookFiles = fs.readdirSync('./gamebooks').filter((file) => file.endsWith('.json'))

        const embed = {
            color: 0x0099ff,
            title: 'GameBooks list',
            description: 'The available GameBooks are:',
            fields: [],
            timestamp: new Date()
        }

        let i = 1
        for (const file of gamebookFiles)
            embed.description += `\n${i++}. \`${path.basename(file, path.extname(file))}\``

        message.channel.send({ embed: embed })
    }
}