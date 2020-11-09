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
    arr.sort()
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
