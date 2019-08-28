let Web3 = require("web3");
let ganache = require("ganache-core");
let assert = require("chai").assert;
let pkg = require("../pkg.js");
pkg.types.loadTypes("../tmp/combined.json");

let web3 = new Web3(ganache.provider({
    gasLimit: 0xffffffff,
    allowUnlimitedContractSize: true,
    debug: true
}));

let scene = require("./scene.js");

describe("manager and pooling", async () => {
    let env = {};
    let accts;
    let admin;
    beforeEach(async () => {
        accts = await web3.eth.getAccounts();
        admin = accts[0];
        env = await scene.phase3(web3);
        env.accts = accts;
        env.admin = admin;
    });

    it("join/exit", async () => {
        await env.bpool.methods.makeJoinable()
                       .send({from: env.admin, gas:0xffffffff});
        let ABalBefore = await env.bpool.methods.getBalance(env.acoin._address).call();
        let BBalBefore = await env.bpool.methods.getBalance(env.acoin._address).call();
        let PSupplyBefore = await env.bpool.methods.getPoolTokenSupply().call();

        await env.bpool.methods.joinPool(web3.utils.toWei('1.0'))
                       .send({from: env.admin, gas:0xffffffff});
        let ABalMiddle = await env.bpool.methods.getBalance(env.acoin._address).call();
        let BBalMiddle = await env.bpool.methods.getBalance(env.acoin._address).call();
        let PSupplyMiddle = await env.bpool.methods.getPoolTokenSupply().call();

        await env.bpool.methods.exitPool(web3.utils.toWei('1.0'))
                       .send({from: env.admin, gas:0xffffffff});

        let ABalAfter = await env.bpool.methods.getBalance(env.acoin._address).call();
        let BBalAfter = await env.bpool.methods.getBalance(env.acoin._address).call();
        let PSupplyAfter = await env.bpool.methods.getPoolTokenSupply().call();

        console.warn("TODO");
    });

});
