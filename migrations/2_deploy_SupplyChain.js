var SupplyChain = artifacts.require("SupplyChain");

module.exports = function(deployer) {
  // Deploy the ProductTracker contract
  deployer.deploy(SupplyChain);
};
