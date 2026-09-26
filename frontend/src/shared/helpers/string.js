export const capitalize = (str) => str
    .toLowerCase()
    .replace(/\p{L}/gu, (char, offset, fullString) => {
    const prevChar = fullString[offset - 1];
    const isWordStart = offset === 0 || !/\p{L}/u.test(prevChar);
    return isWordStart ? char.toUpperCase() : char;
})
    .replace(/\b(?:de|des|du|d'|l'| d’|l’|la)\b/gi, (match, offset) => offset === 0 ? match : match.toLowerCase());
export const capitalizeList = (str, separator = ' / ') => str.split(separator).map(capitalize).join(separator);
export const orthograph = (str) => str
    .replace("L ", () => "l’")
    .replace("Av ", () => "Avenue ")
    .replace("Bd ", () => "Boulevard ")
    .replace("Pl ", () => "Place ");
export const sanitizeString = (str) => capitalizeList(orthograph(capitalize(str)));
export function slugify(text) {
    if (typeof text !== 'string') {
        return '';
    }
    return text
        .normalize('NFD') // accents
        .replace(/[\u0300-\u036f]/g, '') // remove diacritics
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '') // remove special characters
        .replace(/[\s_]+/g, '-') // replace spaces/underscores by dash
        .replace(/-+/g, '-') // no multiple dash
        .replace(/^-/, '')
        .replace(/-$/, '');
}
//# sourceMappingURL=string.js.map