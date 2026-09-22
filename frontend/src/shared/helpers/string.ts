export const capitalize = (str: string): string =>
  str
    .toLowerCase()
    .replace(/\p{L}/gu, (char, offset, fullString) => {
      const prevChar = fullString[offset - 1];
      const isWordStart = offset === 0 || !/\p{L}/u.test(prevChar);
      return isWordStart ? char.toUpperCase() : char;
    })
    .replace(/\b(?:de|des|du|d'|l'| d’|l’|la)\b/gi, (match, offset) =>
      offset === 0 ? match : match.toLowerCase()
    );

export const capitalizeList = (str: string, separator = ' / '): string =>
  str.split(separator).map(capitalize).join(separator);    

export const orthograph = (str: string): string =>  str
  .replace("L ",() =>"l’" )
  .replace("Av ",() =>"Avenue " )
  .replace("Bd ",() =>"Boulevard " )
  .replace("Pl ",() =>"Place " )
  ;

export const sanitizeString = (str: string): string => capitalizeList(orthograph(capitalize(str)));
