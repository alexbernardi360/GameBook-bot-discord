// Requires external module
const path = require('path')
const main_path = path.dirname(require.main.filename)
const fs = require('fs')

// Reads a .json gamebook
exports.readJSON = (gamebookName) => {
    const path_file = `${main_path}/gamebooks/${gamebookName}.json`
    if (!fs.existsSync(path_file)) return
    const rawdata = fs.readFileSync(path_file)
    return JSON.parse(rawdata)
}

// Get a chapter from a gamebook
exports.getChapter = (gamebook, number) => {
    if (number > gamebook.chapters.length || number < 1) return undefined
        return gamebook.chapters.find((element) => {
            return element.number == number
        })
}

const adversaryCombatResults = [
    [  6,  7,  8,  9, 10, 11, 12, 14, 16, 18,'D','D','D' ],
    [  0,  0,  0,  0,  1,  2,  3,  4,  5,  6,  7,  8,  9 ],
    [  0,  0,  0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10 ],
    [  0,  0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11 ],
    [  0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12 ],
    [  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 14 ],
    [  2,  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 14, 16 ],
    [  3,  4,  5,  6,  7,  8,  9, 10, 11, 12, 14, 16, 18 ],
    [  4,  5,  6,  7,  8,  9, 10, 11, 12, 14, 16, 18,'D' ],
    [  5,  6,  7,  8,  9, 10, 11, 12, 14, 16, 18,'D','D' ]
]

const playerCombateResults = [
    [  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0 ],
    ['D','D',  8,  6,  6,  5,  5,  5,  4,  4,  4,  3,  3 ],
    ['D',  8,  7,  6,  5,  5,  4,  4,  3,  3,  3,  3,  2 ],
    [  8,  7,  6,  5,  5,  5,  4,  4,  3,  3,  2,  2,  2 ],
    [  8,  7,  6,  5,  4,  4,  3,  3,  2,  2,  2,  2,  2 ],
    [  7,  6,  5,  4,  4,  3,  2,  2,  2,  2,  2,  2,  1 ],
    [  6,  6,  5,  4,  3,  2,  2,  2,  2,  1,  1,  1,  1 ],
    [  5,  5,  4,  3,  2,  2,  1,  1,  1,  0,  0,  0,  0 ],
    [  4,  4,  3,  2,  1,  1,  0,  0,  0,  0,  0,  0,  0 ],
    [  3,  3,  2,  0,  0,  0,  0,  0,  0,  0,  0,  0,  0 ]
]

exports.calculateResults = (number, combatRatio) => {
    let column = findColumn(combatRatio)
    let adversaryResult = adversaryCombatResults[number][column]
    let playerResult = playerCombateResults[number][column]
    return ({adversaryResult, playerResult})
}

function findColumn(combatRatio) {
    if (combatRatio <= -11) return 0
    if (combatRatio <= -9)  return 1
    if (combatRatio <= -7)  return 2
    if (combatRatio <= -5)  return 3
    if (combatRatio <= -3)  return 4
    if (combatRatio <= -1)  return 5
    if (combatRatio == 0)   return 6
    if (combatRatio <= 2)   return 7
    if (combatRatio <= 4)   return 8
    if (combatRatio <= 6)   return 9
    if (combatRatio <= 8)   return 10
    if (combatRatio <= 10)  return 11
    if (combatRatio >= 11)  return 12
}