import Rule from "./Rule.js";

class RuleFactory {
    createRule(context) {
        const rule = new Rule(context);

        return {
            ObjectPattern: rule.checkForObjectDestructuringAssignment.bind(rule),
            ObjectExpression: rule.checkForObject.bind(rule),
            ImportDeclaration: rule.checkForImport.bind(rule),
            ExportNamedDeclaration: rule.checkForExport.bind(rule)
        };
    }
}

export default RuleFactory;
