import { InspectsTokens } from "@martin-pettersson/eslint-plugin-spacing-rules/mixins";

class Rule {
    #context;
    #shouldBeSpaced;
    #options;

    constructor(context) {
        this.#context = context;
        this.#shouldBeSpaced = this.#context.options[0] === "always";
        this.#options = {
            arraysInObjectsException: this.#isOptionSet("arraysInObjects"),
            objectsInObjectsException: this.#isOptionSet("objectsInObjects"),
            destructuringAssignmentsException: this.#isOptionSet("destructuringAssignments")
        };
    }

    checkForObjectDestructuringAssignment(node) {
        if (node.properties.length === 0) {
            return;
        }

        const first = this.#context.getSourceCode().getFirstToken(node);
        const last = this.#getClosingBraceOfObject(node);

        this.#validateBraceSpacing(
            node,
            first,
            this.#context.getSourceCode().getTokenAfter(first, { includeComments: true }),
            this.#context.getSourceCode().getTokenBefore(last, { includeComments: true }),
            last,
            true
        );
    }

    checkForObject(node) {
        if (node.properties.length === 0) {
            return;
        }

        const sourceCode = this.#context.getSourceCode();
        const first = sourceCode.getFirstToken(node);
        const last = this.#getClosingBraceOfObject(node);

        this.#validateBraceSpacing(
            node,
            first,
            sourceCode.getTokenAfter(first, { includeComments: true }),
            sourceCode.getTokenBefore(last, { includeComments: true }),
            last
        );
    }

    checkForImport(node) {
        if (node.specifiers.length === 0) {
            return;
        }

        const sourceCode = this.#context.getSourceCode();
        const lastSpecifier = node.specifiers[node.specifiers.length - 1];
        let firstSpecifier = node.specifiers[0];

        if (lastSpecifier.type !== "ImportSpecifier") {
            return;
        }

        if (firstSpecifier.type !== "ImportSpecifier") {
            firstSpecifier = node.specifiers[1];
        }

        const first = sourceCode.getTokenBefore(firstSpecifier);
        const last = sourceCode.getTokenAfter(lastSpecifier, this.isNotCommaToken);

        this.#validateBraceSpacing(
            node,
            first,
            sourceCode.getTokenAfter(first, { includeComments: true }),
            sourceCode.getTokenBefore(last, { includeComments: true }),
            last,
            true
        );
    }

    checkForExport(node) {
        if (node.specifiers.length === 0) {
            return;
        }

        const sourceCode = this.#context.getSourceCode();
        const first = sourceCode.getTokenBefore(node.specifiers[0]);
        const last = sourceCode.getTokenAfter(node.specifiers[node.specifiers.length - 1], this.isNotCommaToken);

        this.#validateBraceSpacing(
            node,
            first,
            sourceCode.getTokenAfter(first, { includeComments: true }),
            sourceCode.getTokenBefore(last, { includeComments: true }),
            last
        );
    }

    #isOptionSet(option) {
        return this.#context.options[1] ? this.#context.options[1][option] === !this.#shouldBeSpaced : false;
    }

    #reportNoBeginningSpace(node, token) {
        const nextToken = this.#context.getSourceCode().getTokenAfter(token, { includeComments: true });

        this.#context.report({
            node,
            loc: {
                start: token.loc.end,
                end: nextToken.loc.start
            },
            messageId: "unexpectedSpaceAfter",
            data: {
                token: token.value
            },
            fix(fixer) {
                return fixer.removeRange([token.range[1], nextToken.range[0]]);
            }
        });
    }

    #reportNoEndingSpace(node, token) {
        const previousToken = this.#context.getSourceCode().getTokenBefore(token, { includeComments: true });

        this.#context.report({
            node,
            loc: {
                start: previousToken.loc.end,
                end: token.loc.start
            },
            messageId: "unexpectedSpaceBefore",
            data: {
                token: token.value
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
            messageId: "requireSpaceAfter",
            data: {
                token: token.value
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
            messageId: "requireSpaceBefore",
            data: {
                token: token.value
            },
            fix(fixer) {
                return fixer.insertTextBefore(token, " ");
            }
        });
    }

    #validateBraceSpacing(node, first, second, penultimate, last, isDestructuringAssignment = false) {
        const sourceCode = this.#context.getSourceCode();
        const isException = this.#options.destructuringAssignmentsException && isDestructuringAssignment;
        const shouldBeSpaced = (this.#shouldBeSpaced && !isException) || (!this.#shouldBeSpaced && isException);

        if (this.isTokenOnSameLine(first, second)) {
            const firstSpaced = sourceCode.isSpaceBetweenTokens(first, second);

            if (shouldBeSpaced && !firstSpaced) {
                this.#reportRequiredBeginningSpace(node, first);
            }

            if (!shouldBeSpaced && firstSpaced && second.type !== "Line") {
                this.#reportNoBeginningSpace(node, first);
            }
        }

        if (this.isTokenOnSameLine(penultimate, last)) {
            const shouldCheckPenultimate = (
                (this.#options.arraysInObjectsException && this.isClosingBracketToken(penultimate)) ||
                (this.#options.objectsInObjectsException && this.isClosingBraceToken(penultimate))
            );
            const penultimateType = shouldCheckPenultimate ?
                sourceCode.getNodeByRangeIndex(penultimate.range[0]).type :
                false;
            const closingCurlyBraceMustBeSpaced = (
                (this.#options.arraysInObjectsException && penultimateType === "ArrayExpression") ||
                (
                    this.#options.objectsInObjectsException &&
                    (penultimateType === "ObjectExpression" || penultimateType === "ObjectPattern")
                )
            ) ? !shouldBeSpaced : shouldBeSpaced;
            const lastSpaced = sourceCode.isSpaceBetweenTokens(penultimate, last);

            if (closingCurlyBraceMustBeSpaced && !lastSpaced) {
                this.#reportRequiredEndingSpace(node, last);
            }

            if (!closingCurlyBraceMustBeSpaced && lastSpaced) {
                this.#reportNoEndingSpace(node, last);
            }
        }
    }

    #getClosingBraceOfObject(node) {
        const lastProperty = node.properties[node.properties.length - 1];

        return this.#context.getSourceCode().getTokenAfter(lastProperty, this.isClosingBraceToken);
    }
}

Object.assign(Rule.prototype, InspectsTokens);

export default Rule;
