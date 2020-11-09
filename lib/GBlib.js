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