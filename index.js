const fs = require('fs');
const path = require('path');
/**
 * @typedef {Object} Language - Objekt, das die verfügbaren Sprachen enthält.
 * @property {string} GERMAN - Deutsch
 * @property {string} ENGLISH - Englisch
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
        const lang = path.parse(file).name; // Extrahiere die Sprache aus dem Dateinamen
        try {
            const data = fs.readFileSync(filePath);
            countries[lang] = JSON.parse(data);
        } catch (error) {
            console.error(`Error loading countries for language ${lang}:`, error);
        }
    });
    return countries;
}

const countries = loadCountries();

/**
 * Gibt die Flagge und den Namen des Landes anhand des Länderidentifikators zurück.
 * @param {string} countryIdentifier - Der Länderidentifikator.
 * @param {lang} language - Der Länderidentifikator.
 * @returns {{name: string, url: string}|null} Die Flagge und den Namen des Landes oder null, falls der Identifikator ungültig ist.
 */
function getFlag(countryIdentifier, language = DEFAULT_LANGUAGE) {
    const normalizedIdentifier = countryIdentifier.trim().toLowerCase();
    const countryName = countries[language][normalizedIdentifier]; // Verwende die Sprache, um das richtige Länderobjekt auszuwählen
    if (!countryName) return null; 
    return {
        name: countryName,
        url: baseUrl + normalizedIdentifier + ".webp"
        
    };
}
/**
 * Gibt die URL der Flagge eines Landes anhand des Länderidentifikators zurück.
 * @param {string} countryIdentifier - Der Länderidentifikator.
 * @returns {string|null} Die URL der Flagge des Landes oder null, falls der Identifikator ungültig ist.
 */
function getFlagUrl(countryIdentifier) {
    const normalizedIdentifier = countryIdentifier.trim().toLowerCase();
    const countryName = countrys["en"][normalizedIdentifier];
    if (!countryName) return null; 
    return baseUrl + normalizedIdentifier + ".webp";
}

/**
 * Gibt zufällig eine Flagge und den Namen des Landes zurück.
 * @returns {{name: string, url: string}} Die Flagge und den Namen des Landes.
 */
function getRandomFlag(lang) {
    const countryKeys = Object.keys(countries[lang]); // Verwende die Sprache, um das richtige Länderobjekt auszuwählen
    const randomIndex = Math.floor(Math.random() * countryKeys.length);
    const randomCountry = countryKeys[randomIndex];
    const countryName = countries[lang][randomCountry]; // Auch hier muss die Sprache verwendet werden
    return {
        name: countryName,
        url: baseUrl + randomCountry + ".webp"
    };
}
module.exports = {
    Language,
    getFlag,
    getFlagUrl,
    getRandomFlag,
};
