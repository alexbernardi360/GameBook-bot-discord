// Requires external module
const path = require('path')
const main_path = path.dirname(require.main.filename)
const GBlib = require(`${main_path}/lib/GBlib`)

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
        const info = GBlib.readJSON(gamebookName).info
        
        if (info) {
            if (!info.title || info.title ==  '') info.title = gamebookName
            if (info.author == '') info.author = undefined
            if (info.version == '') info.version = undefined
            if (info.revision == '') info.revision = undefined

            let embed = {
                color: 0x0099ff,
                title: info.title,
                fields: [
                    { name: 'Author', value: info.author },
                    { name: 'Version', value: info.version },
                    { name: 'Revision', value: info.revision }
                ],
                timestamp: new Date()
            }

            message.channel.send({ embed: embed })
        } else
            message.reply('404: GameBook not found')
    }
}