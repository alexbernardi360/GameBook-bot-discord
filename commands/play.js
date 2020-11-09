// Requires external module
const path = require('path')
const main_path = path.dirname(require.main.filename)
const GBlib = require(`${main_path}/lib/GBlib`)
const utils = require(`${main_path}/lib/utils`)

const TIME = 600000

module.exports = {
    name: 'play',
    aliases: ['start'],
    description: 'Start a GameBook reading.',
    guildOnly: false,
    args: true,
    usage: '<GameBook name>',
    cooldown: 5,
    async execute(message, args) {
        const gamebookName = args.join(' ')
        const gamebook = GBlib.readJSON(gamebookName)

        await message.channel.send(`Starting \`${gamebook.info.title}\`, good luck!`)

        let choice = 1
        let currChapter
        let stop = false

        do {
            currChapter = GBlib.getChapter(gamebook, choice)
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