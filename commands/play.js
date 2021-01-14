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
    // Initialization character
    let player = {
        combativeness: utils.getRandomInt(10, 19),
        resistance: utils.getRandomInt(20, 29)
    }

    // Sends player stats embed
    message.channel.send({ embed: makeStatEmbed(player, gamebook) })

    message.channel.send(`Starting ${(gamebook.info.title !== '' ? ` \`${gamebook.info.title}\`` : 'the GameBook')}, good luck!`)

    let choice = 1
    let stop = false
    let retreat
    let lose

    do {
        var currChapter = GBlib.getChapter(gamebook, choice)
        let reply = `-=-=-=-=-=-=-=-=-=-=-=-=-=- Chapter no. ${currChapter.number} -=-=-=-=-=-=-=-=-=-=-=-=-=-`
        await message.channel.send(reply)
        await utils.sendDescription(message, currChapter.description)

        retreat = false
        lose = false

        // executes actions
        for (let i = 0; (i < currChapter.actions.length && !retreat && !lose && !stop); i++) {
            const action = currChapter.actions[i]
            switch (currChapter.actions[i].type) {
                case 'fight':
                    await actionFight(action, i)
                    break
                case 'diceRoll':
                    await actionDiceRoll(action)
                    break
                case 'exit':
                    await actionExit(action)
                    break
            }
        }
    } while (!currChapter.flag_ending && !currChapter.flag_deadly && !stop && !lose)

    if (currChapter.flag_ending)
        await message.reply('game over!\n🎉 YOU WIN 🎉')
    else if (currChapter.flag_deadly || lose)
        await message.reply('game over!\n💀 YOU LOSE 💀')
    else
        await message.reply('bot stopped, see you 👋')

    async function actionFight(action, i) {
        let adversary = {
            name: action.adversaryName,
            combativeness: action.adversaryCombativeness,
            resistance: action.adversaryResistance
        }

        let roundNo = 1
        while (player.resistance > 0 && adversary.resistance > 0 && !retreat && !stop) {
            // fight
            let filter = (reaction, user) => {
                if (action.chapterOnRetreat)
                    return user.id == message.author.id && (reaction.emoji.name == '⚔' || reaction.emoji.name == '🏃' || reaction.emoji.name == '🛑')
                else
                    return user.id == message.author.id && (reaction.emoji.name == '⚔' || reaction.emoji.name == '🛑')
            }

            await message.channel.send({ embed: makeFightEmbed(player, adversary, roundNo) })
            .then(async (msg) => {
                await msg.react('⚔')
                if (action.chapterOnRetreat) await msg.react('🏃')
                await msg.react('🛑')

                await msg.awaitReactions(filter, { max: 1, time: TIME, errors: ['time'] })
                .then(async (collected) => {
                    const reaction = collected.first()

                    if (reaction.emoji.name == '⚔') {
                        let combatRatio = player.combativeness - adversary.combativeness
                        let number = utils.getRandomInt(0, 9)
                        let { adversaryResult, playerResult } = GBlib.calculateResults(number, combatRatio)
                        player.resistance = (playerResult == 'D') ? 0 : player.resistance - playerResult
                        adversary.resistance = (adversaryResult == 'D') ? 0 : adversary.resistance - adversaryResult
                        
                        let reply = `You got ${number} on the dice roll.\n` +
                                    `You attacks for ${playerResult} damage.\n` +
                                    `Adversary attacks for ${adversaryResult} damage.`
                        await message.channel.send(reply)

                        // adversary death
                        if (adversary.resistance <= 0) {
                            await message.channel.send(`You killed ${adversary.name}`)
                            await message.channel.send({ embed: makeStatEmbed(player) })
                        }
                        // player death
                        if (player.resistance <= 0) {
                            if (action.chapterOnDefeat) {
                                choice = action.chapterOnDefeat
                                retreat = true
                            } else {
                                lose = true
                            }
                            message.channel.send({ embed: makeStatEmbed(player) })
                        }
                    } else if (reaction.emoji.name == '🏃') {
                        choice = action.chapterOnRetreat
                        retreat = true
                    } else
                        stop = true
                })
                .catch(async (error) => {
                    console.log(error)
                    await message.reply('it\'s been too long and you haven\'t made your choice.')
                    stop = true
                })
            })
            roundNo += 1
        }
    }

    async function actionDiceRoll(action) {
        let filter = (reaction, user) => {
            return user.id == message.author.id && (reaction.emoji.name == '🎲' || reaction.emoji.name == '🛑')
        }

        await message.channel.send({ embed: makeDiceRollEmbed(action) })
        .then(async (msg) => {
            await msg.react('🎲')
            await msg.react('🛑')

            await msg.awaitReactions(filter, { max: 1, time: TIME, errors: ['time'] })
            .then(async (collected) => {
                const reaction = collected.first()

                if (reaction.emoji.name == '🎲') {
                    let min = action.minValue
                    let max = action.maxValue
                    value = utils.getRandomInt(min, max)
                    await message.channel.send(`You rolled the die and got: ${value}`)
                    if (value >= action.minValueToWin) {
                        await message.channel.send('You won!')
                    } else if (action.chapterOnDefeat) {
                        choice = action.chapterOnDefeat
                        retreat = true
                    } else {
                        lose = true
                    }
                } else
                    stop = true
            })
            .catch(async (error) => {
                console.log(error)
                await message.reply('it\'s been too long and you haven\'t made your choice.')
                stop = true
            })
        })
    }

    async function actionExit(action) {
        let arrayChoices = utils.getReactArray(action.chapters)

        let filter = (reaction, user) => {
            return getReact(arrayChoices).includes(reaction.emoji.name) && user.id === message.author.id
        }

        await message.channel.send(nextChapterReply(arrayChoices))
        .then(async (msg) => {
            for (let i = 0; (i < arrayChoices.length); i++)
                msg.react(arrayChoices[i].react)
            await msg.awaitReactions(filter, { max: 1, time: TIME, errors: ['time'] })
            .then(async (collected) => {
                const reaction = collected.first()

                if (reaction.emoji.name !== '🛑') {
                    choice = utils.getChapterFromReact(arrayChoices, reaction.emoji.name)
                    retreat = true
                } else
                    stop = true
            })
            .catch(async () => {
                await message.reply('it\'s been too long and you haven\'t made your choice.')
                stop = true
            })
        })
    }
}

function makeStatEmbed(player, gamebook) {
    const embed = {
        color: 0x0099ff,
        title: 'Your character stats',
        description: 'These are the stats for the fight.\nTip: If the Resistance goes zero you will die.',
        fields: [
            {
                name: 'Combativeness',
                value: player.combativeness
            },
            {
                name: 'Resistance',
                value: (player.resistance < 0) ? 0 :  player.resistance
            }
        ]
    }
    if (gamebook && gamebook.info.title !== '')
        embed.footer = { text: gamebook.info.title}

    return embed
}

function makeFightEmbed(player, adversary, roundNo) {
    const embed = {
        color: 0x0099ff,
        author: { name: `Round no. ${roundNo}`},
        title: `Fighting against ${adversary.name}`,
        fields: [
            {
                name: 'Your stats',
                value: `\`Combativeness: ${player.combativeness}\nResistance: ${player.resistance}\``,
                inline: true
            },
            {
                name: 'Adversary stats',
                value: `\`Combativeness: ${adversary.combativeness}\nResistance: ${adversary.resistance}\``,
                inline: true
            },
        ],
        footer: { text: 'React to choose action'}
    }

    return embed
}

function makeDiceRollEmbed(action) {
    let min = action.minValue
    let max = action.maxValue
    const embed = {
        color: 0x0099ff,
        title: 'Dice roll',
        description: `Roll a dice [${min} - ${max}], and get your opponent's highest value to win and continue.`,
        fields: [
            {
                name: `Number to beat`,
                value: action.minValueToWin - 1
            }
        ],
        footer: { text: 'React to choose action'}
    }

    return embed
}

function nextChapterReply(reactArr) {
    let reply = 'Make a decision:'
    for (var i = 0; (i < reactArr.length - 1); i++)
        reply += `\n${reactArr[i].react} =>\t\`${reactArr[i].num}\``
    return reply
}

// Returns an array of reactions
function getReact(arr) {
    let result = []
    for (var i = 0; (i < arr.length); i++)
        result.push(arr[i].react)

    return result
}