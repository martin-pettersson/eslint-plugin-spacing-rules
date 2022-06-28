import meta from "./meta.json" assert { type: "json" };
import RuleFactory from "./RuleFactory.js";

const ruleFactory = new RuleFactory();

export default { meta, create: ruleFactory.createRule.bind(ruleFactory) };
