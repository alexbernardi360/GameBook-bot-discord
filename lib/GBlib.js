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