//Modify this to change the text inside the pseudo-tag.
const tag = 'KCoyD'; //Keep Control of your Data

//Only change these if you want to replace the [tag][/tag] format.
const textPrefix = String.raw`[${ tag }]`;
const textSuffix = String.raw`[/${ tag }]`;
//Escaping is needed for regex.
const regexPrefix = textPrefix.replace('[', '\\[').replace(']', '\\]');
const regexSuffix = textSuffix.replace('[', '\\[').replace(']', '\\]').replace('/', '\\/');

//RegEx used to replace URLs.
const url_regex = new RegExp(regexPrefix + '(.+)' + regexSuffix, 'g');


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
 * @param {Function} func_translate The synchronous function called to transform the URL string into another string.
 * 
 * @returns {string} The original string, where all URLs are replaced.
 */
function replace_urls(text, func_translate) {
    return text.replaceAll(url_regex, function (a, url) {
        return func_translate(url);
    });
}

/**
 * Finds all URLs pointing to a stored text in the given string.
 * URLs are transformed into another string, then replaced in the original string parameter.
 * This version allows to use an async function to execute the transformation of the URL.
 * @param {string} text The text to parse (should come from the HTML page).
 * @param {Function} func_translate The asynchronous function called to transform the URL string into another string.
 *
 * @returns {string} The original string, where all URLs are replaced.
 */
async function replace_urls_async(text, func_translate) {
    const promises = [];

    //Collect promises for each detected URL.
    text.replaceAll(url_regex, function (_, url) {
        promises.push(func_translate(url));
    });

    //Wait for async calls to end, then replace URLs.
    const data = await Promise.all(promises);
    return text.replaceAll(url_regex, function (a,b) {
        return data.shift();
    });
}

export {encode_text_url,replace_urls,replace_urls_async}