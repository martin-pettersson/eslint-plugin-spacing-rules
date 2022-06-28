const RuleFactory = require("./RuleFactory.js");

module.exports = {
    meta: require("./meta.json"),
    create: new RuleFactory().createRule
};
