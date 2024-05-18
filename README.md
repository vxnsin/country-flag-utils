# Country-Flag-utils

This npm package allows you to fetch flags of various countries and get information about them.

## Installation

To use the package in your project, install it with the following command:

```bash
npm install country-flag-utils
```

## Usage

In your File:

```javascript
const flag = require('country-flag-utils') //Import the Package
```

### Get Flag

To retrieve information about a flag, use the `getFlag(countryIdentifier, language)` function. Example:

```javascript
// Get flag and name of Germany
console.log(flag.getFlag("de"));
console.log(flag.getFlag("de", flag.Language.ENGLISH));

// Output:
{
  name: 'Germany',
  code: 'de',
  url: 'https://www.welt-flaggen.de/data/flags/h160/de.webp'
}
```

### Get Flag URL

To retrieve the URL of a flag, use the `getFlagUrl(countryIdentifier)` function. Example:

```javascript
// Get flag URL of Germany
console.log(flag.getFlagUrl("de"));

// Output:
https://www.welt-flaggen.de/data/flags/h160/de.webp
```

### Get Random Flag

To fetch random information about a flag, use the `getRandomFlag(language)` function. Example:

```javascript
// Get a Random Flag
console.log(flag.getRandomFlag());
console.log(flag.getRandomFlag(flag.Language.ENGLISH));

// Output:
{
  name: 'Germany',
  code: 'de',
  url: 'https://www.welt-flaggen.de/data/flags/h160/de.webp'
}
```

### Language
`More languages will be Supported in the Future!`
---
```javascript
flag.Language.LANGUAGE
```

## Functions

- `getFlag(countryIdentifier, language)`: Returns information about the flag and name of a country based on its identifier. Language is optional and defaults to English.

- `getFlagUrl(countryIdentifier)`: Returns the URL of a country's flag based on its identifier.

- `getRandomFlag(language)`: Returns random information about the flag and name of a country, optionally in a specific language.
```