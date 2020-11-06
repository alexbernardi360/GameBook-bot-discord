// Requires external module
const path = require('path')
const main_path = path.dirname(require.main.filename)
const GBlib = require(`${main_path}/lib/GBlib`)

module.exports = {
    name: 'intro',
    aliases: ['introdution', 'get-intro'],
    description: 'Gets introdution from a GameBook.',
    guildOnly: false,
    args: true,
    usage: '<GameBook name>',
    cooldown: 5,
    execute(message, args) {
        const gamebookName = args.join(' ')
        const gamebook = GBlib.readJSON(gamebookName)
        
        if (gamebook) {
            let reply = `Intro from **${gamebook.info.title}**`
            reply +=  `\n\`${gamebook.intro.chapter_title}\``
            reply +=  `\n\`${gamebook.intro.description}\``
            message.channel.send(reply)
        } else {
            message.reply('404: GameBook not found')
        }
    }
}