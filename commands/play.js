// Requires external module
const path = require('path')
const fs = require('fs')
const download = require('download')

// requires internal modules
const GBlib = require('../lib/GBlib')
const utils = require('../lib/utils')
const validateFile = require('../lib/utils').validateFile
const convert = require('../lib/utils').convert

const TIME = 600000

module.exports = {
    name: 'play',
    aliases: ['start'],
    description: 'Start a GameBook reading.',
    guildOnly: false,
    cooldown: 5,
    async execute(message, args) {
        message.reply('send me a GameBook in JSON or SQLite3 format, I\'ll try to read it.')

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

            if (attachments.attachment.endsWith('.json')) {         // Validation
                const JSONPath = `${dest}/${timestamp}.json`
                fs.writeFileSync(JSONPath, buffer)

                const result = validateFile(JSONPath)
                if (!result)
                    await message.reply('This is not a JSON file... 😒')
                else if (result.valid) {
                    const gamebook = JSON.parse(fs.readFileSync(JSONPath))
                    startGameBook(message, gamebook)
                } else
                    await message.reply('Error: the file is not well written, \`!parse\` to find out more.')

                fs.unlinkSync(JSONPath)
            }
            else if (attachments.attachment.endsWith('.db')) {      // Parsing
                const DBPath = `${dest}/${timestamp}.db`
                fs.writeFileSync(DBPath, buffer)

                const JSONPath = `${dest}/${timestamp}.json`
                const result = await convert(DBPath, JSONPath)
                if (result) {
                    const gamebook = JSON.parse(fs.readFileSync(JSONPath))
                    startGameBook(message, gamebook)
                    fs.unlinkSync(JSONPath)
                } else {
                    await message.reply('i can\'t do it, I\'m sorry...')
                }

            fs.unlinkSync(DBPath)
            } else {                                                // File not supported
                await message.reply('I\'m sorry but I don\'t understand this file, try a .json or .db file.')
            }
        })
        .catch(() => {
            message.reply('it\'s been too long and you haven\'t sent any files.')
        })
    }
}

async function startGameBook(message, gamebook) {
    message.channel.send(`Starting ${(gamebook.info.title != '' ? ` \`${gamebook.info.title}\`` : 'the GameBook')}, good luck!`)

        let choice = 1
        let stop = false

        do {
            var currChapter = GBlib.getChapter(gamebook, choice)
            let reply = `Chapter no. ${currChapter.number}`
            await message.channel.send(reply)
            await utils.sendDescription(message, currChapter.description)

            let arrayChoices = utils.getReactArray(currChapter.next_chapters)

            let filter = (reaction, user) => {
                return getReact(arrayChoices).includes(reaction.emoji.name) && user.id === message.author.id
            }

            await message.channel.send(nextChapterReply(arrayChoices))
            .then(async (msg) => {
                for (var i = 0; (i < arrayChoices.length); i++)
                    await msg.react(arrayChoices[i].react)
                await msg.awaitReactions(filter, { max: 1, time: TIME, errors: ['time'] })
                .then(async (collected) => {
                    const reaction = collected.first()

                    if (reaction.emoji.name !== '🛑')
                        choice = utils.getChapterFromReact(arrayChoices, reaction.emoji.name)
                    else
                        stop = true
                })
                .catch(async (collected) => {
                    await message.reply('it\'s been too long and you haven\'t made your choice.')
                    stop = true
                })
            })
        } while (!currChapter.flag_ending && !currChapter.flag_deadly && !stop)

        if (currChapter.flag_ending)
            await message.reply('game over!\n🎉 YOU WIN 🎉')
        else if (currChapter.flag_deadly)
            await message.reply('game over!\n💀 YOU LOSE 💀')
        else
            await message.reply('bot stopped, see you 👋')
}

function nextChapterReply(reactArr) {
    let reply = 'Make a decision:'
    for (var i = 0; (i < reactArr.length - 1); i++)
        reply += `\n${reactArr[i].react} =>\t\`${reactArr[i].num}\``
    return reply
}

// Returns an array of reactions
function getReact(arr){
    let result = []
    for (var i = 0; (i < arr.length); i++) {
        result.push(arr[i].react)
    }
    return result
}