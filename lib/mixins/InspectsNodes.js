const InspectsNodes = {
    isObjectType(node) {
        return node && (node.type === "ObjectExpression" || node.type === "ObjectPattern");
    },

    isArrayType(node) {
        return node && (node.type === "ArrayExpression" || node.type === "ArrayPattern");
    }
};

module.exports = InspectsNodes;
