// Requires external modules
const fs = require('fs')
const path = require('path')
const Parser = require('gamebook-api').Parser
const download = require('download')
const MessageAttachment = require('discord.js').MessageAttachment

const TIME = 300000

module.exports = {
    name: 'parse',
    aliases: ['parser'],
    description: 'Convert a GameBook from SQLite3 to JSON conforming to the schema.',
    guildOnly: false,
    args: false,
    cooldown: 5,
    async execute(message) {
        message.reply('Send me a GameBook in a SQLite3 file!\nI will try to convert it to a JSON file.')

        let filter = (msg) => msg.author == message.author

        message.channel.awaitMessages(filter, {max: 1, time: TIME, errors: ['time']})
        .then(async (collected) => {
            let attachments = collected.first().attachments.first()
            if (!attachments)
                return await message.reply('try sending me a file, see you 👋')

            const dest = './tmp'

            if (!fs.existsSync(dest))
                fs.mkdirSync(dest)

            const buffer = await download(attachments.url)

            const timestamp = new Date().getTime()
            const DBPath = `${dest}/${timestamp}.db`
            fs.writeFileSync(DBPath, buffer)

            const JSONPath = `${dest}/${timestamp}.json`
            const result = await convert(DBPath, JSONPath)
            if (result) {
                const title = path.basename(attachments.name, path.extname(attachments.name))
                const replyAttachment = new MessageAttachment(JSONPath, `${title}.json`)
                await message.channel.send('this is your GameBook in JSON format!', replyAttachment)

                fs.unlinkSync(JSONPath)
            } else {
                await message.reply('i can\'t do it, I\'m sorry ...')
            }

            fs.unlinkSync(DBPath)
        })
        .catch((collected) => {
            message.reply('it\'s been too long and you haven\'t sent any files.')
        })
    }
}

async function convert(input_path, output_path) {
    try {
        // Instantiate the Parser class
        const parser = new Parser(input_path)
        // Exporting the object to file
        await parser.exportToFile(output_path)
    } catch (error) {
        return false
    }
    return true
}