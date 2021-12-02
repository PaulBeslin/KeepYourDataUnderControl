//Modify this to change the text inside the pseudo-tag.
const tag = 'KCoyD'; //Keep Control of your Data

//Only change these if you want to replace the [tag][/tag] format.
const textPrefix = String.raw`[${ tag }]`;
const textSuffix = String.raw`[/${ tag }]`;
//Escaping is needed for regex.
const regexPrefix = textPrefix.replace('[', '\\[').replace(']', '\\]');
const regexSuffix = textSuffix.replace('[', '\\[').replace(']', '\\]').replace('/', '\\/');


/**
 * Decorates an URL using a constant pseudo-tag.
 * @param {string} url The URL to encode.
 * @returns {string} The encoded URL.
 */
function encode_text_url(url) {
    return textPrefix + url + textSuffix;
}

/**
 * Finds all URLs pointing to a stored text in the given string.
 * URLs are transformed into another string, then replaced in the original string parameter.
 * @param {string} text The text to parse (should come from the HTML page).
 * @param {Function} func_translate The function called to transform the URL string into another string.
 * 
 * @returns {string} The original string, where all URLs are replaced.
 */
function replace_urls_in_string(text, func_translate) {
    //Match anything between the two pseudo-tags.
    const url_regex = new RegExp(regexPrefix + '(.+)' + regexSuffix, 'g');

    var replaced_text = text.replaceAll(url_regex, function (_, url) { return func_translate(url); });

    return replaced_text;
}