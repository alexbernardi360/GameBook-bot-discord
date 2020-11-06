// Requires external module
const path = require('path')
const main_path = path.dirname(require.main.filename)
const GBlib = require(main_path + '/lib/GBlib')

module.exports = {
    name: 'info',
    aliases: ['information', 'get-info'],
    description: 'Gets information from a GameBook.',
    guildOnly: false,
    args: true,
    usage: '<GameBook name>',
    cooldown: 5,
    execute(message, args) {
        const gamebookName = args.join(' ')
        const gamebook = GBlib.readJSON(gamebookName)
        
        if (gamebook) {
            let reply = `\`title:\t    ${gamebook.info.title}\``
            reply +=  `\n\`author:\t   ${gamebook.info.author}\``
            reply +=  `\n\`version:\t  ${gamebook.info.version}\``
            reply +=  `\n\`revision:\t ${gamebook.info.revision}\``
            message.channel.send(reply)
        } else {
            message.reply('404: GameBook not found')
        }
    }
}