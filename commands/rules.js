// Requires external module
const path = require('path')
const main_path = path.dirname(require.main.filename)
const GBlib = require(`${main_path}/lib/GBlib`)

module.exports = {
    name: 'rules',
    aliases: ['get-rules'],
    description: 'Gets rules from a GameBook.',
    guildOnly: false,
    args: true,
    usage: '<GameBook name>',
    cooldown: 5,
    execute(message, args) {
        const gamebookName = args.join(' ')
        const gamebook = GBlib.readJSON(gamebookName)
        
        if (gamebook) {
            let reply = `Rules from **${gamebook.info.title}**`
            reply +=  `\n\`${gamebook.rules.chapter_title}\``
            reply +=  `\n\`${gamebook.rules.description}\``
            message.channel.send(reply)
        } else {
            message.reply('404: GameBook not found')
        }
    }
}