export function getCSSVariable(name) {
    return getComputedStyle(document.documentElement)
        .getPropertyValue(name)
        .trim();
}
//# sourceMappingURL=getCSSVariable.js.map