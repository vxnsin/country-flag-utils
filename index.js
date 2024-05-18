const fs = require('fs');
const path = require('path');
/**
 * @typedef {Object} Language
 * @property {string} GERMAN
 * @property {string} ENGLISH 
 */
const Language = {
    GERMAN: "de",
    ENGLISH: "en",
};

const DEFAULT_LANGUAGE = Language.ENGLISH; 
const baseUrl = "https://www.welt-flaggen.de/data/flags/h160/";

function loadCountries() {
    const countriesDir = path.join(__dirname, './countries');
    const files = fs.readdirSync(countriesDir);
    const countries = {};
    files.forEach(file => {
        const filePath = path.join(countriesDir, file);
        const lang = path.parse(file).name; 
        try {
            const data = fs.readFileSync(filePath);
            countries[lang] = JSON.parse(data);
        } catch (error) {
            console.error(`Error loading countries for language ${lang}:`, error);
        }
    });
    return countries;
}
/**
 * Returns a suggested country name based on a similar name.
 * @param {string} countryIdentifier - The country identifier.
 * @param {string} language - The language code for the language of the country (default to English).
 * @returns {string|null} A suggested country name if a similar name is found, otherwise null.
 */
function suggestCountryName(countryIdentifier, language = DEFAULT_LANGUAGE) {
    const normalizedIdentifier = countryIdentifier.trim().toLowerCase();

    const similarNames = [];
    for (let lang in countries) {
        const countryNames = Object.values(countries[lang]);
        for (let name of countryNames) {
            if (name.toLowerCase().includes(normalizedIdentifier)) {
                similarNames.push(name);
            }
        }
    }

    if (similarNames.length > 0) {
        return `Did you mean ${similarNames.join(', ')}?`;
    } else {
        return null;
    }
}

const countries = loadCountries();

/**
 * Returns the flag and name of the country based on the country identifier.
 * @param {string} countryIdentifier - The country identifier (can be either the country code or the country name).
 * @param {string} language - The language code for the language of the country (default to English).
 * @returns {{name: string, code: string, url: string}|null} The flag and name of the country or null if the identifier is invalid.
 */
function getFlag(countryIdentifier, language = DEFAULT_LANGUAGE) {
    if (typeof countryIdentifier !== 'string' || /\d/.test(countryIdentifier)) {
        throw new TypeError('Country identifier must be a non-numeric string');
    }
    const normalizedIdentifier = countryIdentifier.trim().toLowerCase();
    let countryCode = null;
    if (countries[language][normalizedIdentifier]) {
        countryCode = normalizedIdentifier;
    } else {
        for (let lang in countries) {
            const countryCodes = Object.keys(countries[lang]);
            for (let code of countryCodes) {
                if (countries[lang][code].toLowerCase() === normalizedIdentifier) {
                    countryCode = code;
                    break;
                }
            }
            if (countryCode) break;
        }
    }

    if (!countryCode) {
        const suggestion = suggestCountryName(countryIdentifier, language);
        if (suggestion) {
            throw new TypeError(`Invalid country: ${countryIdentifier}. ${suggestion}`);
        } else {
            throw new TypeError(`Invalid country: ${countryIdentifier}`);
        }
    }

    return {
        name: countries[language][countryCode],
        code: countryCode,
        url: baseUrl + countryCode + ".webp"
    };
}
/**
 * Returns the URL of a country's flag based on the country identifier.
 * @param {string} countryIdentifier - The country identifier.
 * @returns {string|null} The URL of the country's flag or null if the identifier is invalid.
 */
function getFlagUrl(countryIdentifier) {
    if (typeof countryIdentifier !== 'string' || /\d/.test(countryIdentifier)) {
        throw new TypeError('Country identifier must be a non-numeric string');
    }
    const normalizedIdentifier = countryIdentifier.trim().toLowerCase();

    let countryName = countries["en"][normalizedIdentifier];
    if (countryName) {
        return baseUrl + normalizedIdentifier + ".webp";
    }

    for (let lang in countries) {
        const countryCodes = Object.keys(countries[lang]);
        for (let code of countryCodes) {
            if (countries[lang][code].toLowerCase() === normalizedIdentifier) {
                return baseUrl + code + ".webp";
            }
        }
    }
    const suggestion = suggestCountryName(countryIdentifier);
    if (suggestion) {
        throw new TypeError(`Invalid country: ${countryIdentifier}. ${suggestion}`);
    } else {
        throw new TypeError(`Invalid country: ${countryIdentifier}`);
    }
}
/**
 * Returns a random flag and the name of the country.
 * @param {string} language - The country identifier.
 * @returns {{name: string, url: string}} The flag and the name of the country.
 */
function getRandomFlag(language = DEFAULT_LANGUAGE) {
    const countryKeys = Object.keys(countries[language]);
    const randomIndex = Math.floor(Math.random() * countryKeys.length);
    const randomCountry = countryKeys[randomIndex];
    const countryName = countries[language][randomCountry]; 
    return {
        name: countryName,
        code: randomCountry,
        url: baseUrl + randomCountry + ".webp"
    };
}
module.exports = {
    Language,
    getFlag,
    getFlagUrl,
    getRandomFlag,
};
