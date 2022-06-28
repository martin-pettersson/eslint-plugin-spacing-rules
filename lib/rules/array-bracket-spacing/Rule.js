const { InspectsNodes, InspectsTokens } = require("../../mixins/index.js");

class Rule {
    #context;
    #shouldBeSpaced;
    #options;

    constructor(context) {
        this.#context = context;
        this.#shouldBeSpaced = this.#context.options[0] === "always";
        this.#options = {
            singleElementException: this.#isOptionSet("singleValue"),
            objectsInArraysException: this.#isOptionSet("objectsInArrays"),
            arraysInArraysException: this.#isOptionSet("arraysInArrays"),
            destructuringAssignmentsException: this.#isOptionSet("destructuringAssignments")
        };
    }

    validateArraySpacing(node) {
        if (this.#shouldBeSpaced && node.elements.length === 0) {
            return;
        }

        const sourceCode = this.#context.getSourceCode();
        const isException = this.#options.destructuringAssignmentsException && node.type === "ArrayPattern";
        const shouldBeSpaced = (this.#shouldBeSpaced && !isException) || (!this.#shouldBeSpaced && isException);
        const first = sourceCode.getFirstToken(node);
        const second = sourceCode.getFirstToken(node, 1);
        const last = node.typeAnnotation ? sourceCode.getTokenBefore(node.typeAnnotation) : sourceCode.getLastToken(node);
        const penultimate = sourceCode.getTokenBefore(last);
        const firstElement = node.elements[0];
        const lastElement = node.elements[node.elements.length - 1];
        const openingBracketMustBeSpaced = (
            (this.#options.objectsInArraysException && this.isObjectType(firstElement)) ||
            (this.#options.arraysInArraysException && this.isArrayType(firstElement)) ||
            (this.#options.singleElementException && node.elements.length === 1)
        ) ? !shouldBeSpaced : shouldBeSpaced;
        const closingBracketMustBeSpaced = (
            (this.#options.objectsInArraysException && this.isObjectType(lastElement)) ||
            (this.#options.arraysInArraysException && this.isArrayType(lastElement)) ||
            (this.#options.singleElementException && node.elements.length === 1)
        ) ? !shouldBeSpaced : shouldBeSpaced;

        if (this.isTokenOnSameLine(first, second)) {
            if (openingBracketMustBeSpaced && !sourceCode.isSpaceBetweenTokens(first, second)) {
                this.#reportRequiredBeginningSpace(node, first);
            }

            if (!openingBracketMustBeSpaced && sourceCode.isSpaceBetweenTokens(first, second)) {
                this.#reportNoBeginningSpace(node, first);
            }
        }

        if (first !== penultimate && this.isTokenOnSameLine(penultimate, last)) {
            if (closingBracketMustBeSpaced && !sourceCode.isSpaceBetweenTokens(penultimate, last)) {
                this.#reportRequiredEndingSpace(node, last);
            }

            if (!closingBracketMustBeSpaced && sourceCode.isSpaceBetweenTokens(penultimate, last)) {
                this.#reportNoEndingSpace(node, last);
            }
        }
    }

    #isOptionSet(option) {
        return this.#context.options[1] ? this.#context.options[1][option] === !this.#shouldBeSpaced : false;
    }

    #reportNoBeginningSpace(node, token) {
        const nextToken = this.#context.getSourceCode().getTokenAfter(token);

        this.#context.report({
            node,
            loc: { start: token.loc.end, end: nextToken.loc.start },
            messageId: "unexpectedSpaceAfter",
            data: {
                tokenValue: token.value
            },
            fix(fixer) {
                return fixer.removeRange([token.range[1], nextToken.range[0]]);
            }
        });
    }

    #reportNoEndingSpace(node, token) {
        const previousToken = this.#context.getSourceCode().getTokenBefore(token);

        this.#context.report({
            node,
            loc: { start: previousToken.loc.end, end: token.loc.start },
            messageId: "unexpectedSpaceBefore",
            data: {
                tokenValue: token.value
            },
            fix(fixer) {
                return fixer.removeRange([previousToken.range[1], token.range[0]]);
            }
        });
    }

    #reportRequiredBeginningSpace(node, token) {
        this.#context.report({
            node,
            loc: token.loc,
            messageId: "missingSpaceAfter",
            data: {
                tokenValue: token.value
            },
            fix(fixer) {
                return fixer.insertTextAfter(token, " ");
            }
        });
    }

    #reportRequiredEndingSpace(node, token) {
        this.#context.report({
            node,
            loc: token.loc,
            messageId: "missingSpaceBefore",
            data: {
                tokenValue: token.value
            },
            fix(fixer) {
                return fixer.insertTextBefore(token, " ");
            }
        });
    }
}

Object.assign(Rule.prototype, InspectsNodes);
Object.assign(Rule.prototype, InspectsTokens);

module.exports = Rule;
