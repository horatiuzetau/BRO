var Election = artifacts.require("./Election.sol");

module.exports = function(deployer) {
  deployer.deploy(Election, ['cand1', 'cand2', 'cand3']);
};
