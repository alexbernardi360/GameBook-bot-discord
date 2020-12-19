const gb = require('gamebook-api')

const REGIONAL_INDICATOR_A = 127462

exports.sendDescription = async (message, text) => {
    let arr = splitText(text)
    for (var i = 0; (i < arr.length); i++)
        await message.channel.send(`\`${arr[i]}\``)
}

exports.getRegionalIndicator = (ch) => {
    if (!isLetter(ch)) return undefined

    let dist = ch.toLowerCase().charCodeAt(0) - 'a'.charCodeAt(0)
    let result = REGIONAL_INDICATOR_A + dist

    return eval(`'\\u{${result.toString(16)}}'`)
}

exports.getReactArray = (arr) => {
    var result = []
    for (var i = 0; (i < arr.length); i++) {
        var elem = { num: arr[i], react: this.getRegionalIndicator(getChar(i)) }
        result.push(elem)
    }
    result.push({num: 'Stop', react: '🛑'})
    return result
}

exports.getChapterFromReact = (arr, react) => {
    return arr.find((element) => {
        return element.react == react
    }).num
}

exports.validateFile = (file_path) => {
    try {
        let instance = gb.readJSON(file_path)
        var result = gb.validate(instance)
    } catch (error) {
        return undefined
    }

    return result
}

exports.convert = async (input_path, output_path) => {
    try {
        // Instantiate the Parser class
        const parser = new gb.Parser(input_path)
        // Exporting the object to file
        await parser.exportToFile(output_path)
    } catch (error) {
        return false
    }
    return true
}

/**
 * Returns a random integer between min (inclusive) and max (inclusive).
 * The value is no lower than min (or the next integer greater than min
 * if min isn't an integer) and no greater than max (or the next integer
 * lower than max if max isn't an integer).
 * Using Math.round() will give you a non-uniform distribution!
 */
exports.getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function isLetter(str) {
    return str.length === 1 && str.match(/[A-Z|a-z]/i)
}

// Gets char number i
function getChar(i) {
    return String.fromCharCode('a'.charCodeAt(0) + i);
}

function splitText(text) {
    return text.match(/.{1,1200}(\s|$)/g);
}
