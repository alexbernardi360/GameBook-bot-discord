// Requires external modules
const fs = require('fs')
const download = require('download')
const validate = require('gamebook-api').validate
const readJSON = require('gamebook-api').readJSON

const TIME = 300000

module.exports = {
    name: 'validate',
    aliases: ['validator'],
    description: 'Validate a GameBook in JSON format according to the scheme.',
    guildOnly: false,
    args: false,
    cooldown: 5,
    async execute(message) {
        message.reply('send me a GameBook in JSON format, I will tell you if it is valid according to the scheme.')

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
            const JSONPath = `${dest}/${timestamp}.json`
            fs.writeFileSync(JSONPath, buffer)

            const result = validateFile(JSONPath)
            if (!result)
                await message.reply('This is not a JSON file... 😒')
            else if (result.valid)
                await message.reply('No error: GameBook validated!')
            else
                await message.reply(`Error: JSON not validated.\n\`${result.errors}\``)

            fs.unlinkSync(JSONPath)
        })
        .catch(() => {
                message.reply('it\'s been too long and you haven\'t sent any files.')
            })
    }
}

function validateFile(file_path) {
    try {
        let instance = readJSON(file_path)
        var result = validate(instance)
    } catch (error) {
        return undefined
    }

    return result
}