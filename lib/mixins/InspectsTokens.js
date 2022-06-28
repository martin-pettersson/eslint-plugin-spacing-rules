const InspectsTokens = {
    isNotCommaToken(token) {
        return token.value !== "," || token.type !== "Punctuator";
    },

    isTokenOnSameLine(left, right) {
        return left.loc.end.line === right.loc.start.line;
    },

    isClosingBracketToken(token) {
        return token.value === "]" && token.type === "Punctuator";
    },

    isClosingBraceToken(token) {
        return token.value === "}" && token.type === "Punctuator";
    }
};

module.exports = InspectsTokens;
