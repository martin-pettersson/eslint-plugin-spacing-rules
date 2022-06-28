import Rule from "./Rule.js";

class RuleFactory {
    createRule(context) {
        const rule = new Rule(context);

        return {
            ArrayPattern: rule.validateArraySpacing.bind(rule),
            ArrayExpression: rule.validateArraySpacing.bind(rule)
        };
    }
}

export default RuleFactory;
