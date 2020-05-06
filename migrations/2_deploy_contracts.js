var Election = artifacts.require("./Election.sol");

module.exports = function(deployer) {
  deployer.deploy(Election, ['Roberto Marinaru', 'Gropita Mironel', 'Soricica Andreiasu', 'Vasile Pop', 'Toma Cocolino', 'Bolda Neacsu']);
};
