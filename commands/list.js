const fs = require('fs')
const path = require('path')

module.exports = {
    name: 'list',
    description: 'List of available GameBooks.',
    guildOnly: false,
    cooldown: 5,
    execute(message) {
        // Gets all .json files in gamebooks folder
        const gamebookFile = fs.readdirSync('./gamebooks').filter((file) => file.endsWith('.json'))
        let reply = 'The available GameBooks are:'

        // Gets the name of all files
        for (const file of gamebookFile)
            reply += `\n\`${path.basename(file, path.extname(file))}\``

        message.channel.send(reply)
    }
}