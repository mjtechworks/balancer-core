const truffleAssert = require('truffle-assertions');
const BPool = artifacts.require('BPool');
const BFactory = artifacts.require('BFactory');
const TToken = artifacts.require('TToken');
const TTokenFactory = artifacts.require('TTokenFactory');

contract('BPool', async (accounts) => {
  const admin = accounts[0];
  const user1 = accounts[1];
  const user2 = accounts[2];
  const toHex = web3.utils.toHex;
  const toWei = web3.utils.toWei;
  const fromWei = web3.utils.fromWei;
  const errorDelta = 10**-8;
  const MAX = web3.utils.toTwosComplement(-1);

  let tokens;           // token factory / registry
  let WETH, MKR, DAI, XXX; // addresses
  let weth, mkr, dai, xxx; // TTokens
  let factory;          // BPool factory
  let pool;             // first pool w/ defaults
  let POOL;             //   pool address

  before(async () => {
    tokens = await TTokenFactory.deployed();
    factory = await BFactory.deployed();

    POOL = await factory.newBPool.call();
    await factory.newBPool();
    pool = await BPool.at(POOL);

    await tokens.build(toHex("WETH"));
    await tokens.build(toHex("MKR"));
    await tokens.build(toHex("DAI"));
    await tokens.build(toHex("XXX"));

    WETH = await tokens.get.call(toHex("WETH"));
    MKR = await tokens.get.call(toHex("MKR"));
    DAI = await tokens.get.call(toHex("DAI"));
    XXX = await tokens.get.call(toHex("XXX"));

    weth = await TToken.at(WETH);
    mkr = await TToken.at(MKR);
    dai = await TToken.at(DAI);
    xxx = await TToken.at(XXX);

    /*
      Tests assume token prices
      WETH - $200
      MKR  - $500
      DAI  - $1
      XXX  - $0
    */

    // Admin balances
    await weth.mint(toWei('50'));
    await mkr.mint(toWei('20'));
    await dai.mint(toWei('10000'));
    await xxx.mint(toWei('0'));

    // User1 balances
    await weth.mint(toWei('25'), {from: user1});
    await mkr.mint(toWei('4'), {from: user1});
    await dai.mint(toWei('40000'), {from: user1});
    await xxx.mint(toWei('10'), {from: user1});

    // User2 balances
    await weth.mint(toWei('12.2222'), {from: user2});
    await mkr.mint(toWei('1.015333'), {from: user2});
    await dai.mint(toWei('0'), {from: user2});
    await xxx.mint(toWei('51'), {from: user2});

  });

  describe('Pool Initialization', () => {

    
  });

  describe('Binding Tokens', () => {

    it('Pool starts with no bound tokens', async () => {
      let numTokens = await pool.getNumTokens();
      assert.equal(0, numTokens);
      let isBound = await pool.isBound.call(WETH);
      assert(!isBound)
    });

    it('Fails binding tokens that are not approved', async () => {
      await truffleAssert.reverts(pool.bind(MKR, toWei('10'), toWei('2.5')), 'ERR_BTOKEN_BAD_CALLER');
    });

    it('Admin approves tokens', async () => {
      await weth.approve(POOL, MAX);
      await mkr.approve(POOL, MAX);
      await dai.approve(POOL, MAX);
      await xxx.approve(POOL, MAX);
    });

    it('Fails binding weights and balances outside MIX MAX', async () => {
      await truffleAssert.reverts(pool.bind(WETH, toWei('51'), toWei('1')), 'ERR_INSUFFICIENT_BAL');
      await truffleAssert.reverts(pool.bind(MKR, toWei('0.0000001'), toWei('1')), 'ERR_MIN_BALANCE');
      await truffleAssert.reverts(pool.bind(MKR, toWei('10000000000000000'), toWei('1')), 'ERR_MAX_BALANCE');
      await truffleAssert.reverts(pool.bind(DAI, toWei('1000'), toWei('0.99')), 'ERR_MIN_WEIGHT');
      await truffleAssert.reverts(pool.bind(WETH, toWei('5'), toWei('50.01')), 'ERR_MAX_WEIGHT');
    });

    it('Admin binds tokens', async () => {
      // Equal weights WETH, MKR, DAI
      await pool.bind(WETH, toWei('50'), toWei('5'));
      await pool.bind(MKR, toWei('20'), toWei('5'));
      await pool.bind(DAI, toWei('10000'), toWei('5'));
      let numTokens = await pool.getNumTokens();
      assert.equal(3, numTokens);
      let totalDernomWeight = await pool.getTotalDenormalizedWeight();
      assert.equal(15, fromWei(totalDernomWeight));
      let wethNormWeight = await pool.getNormalizedWeight(WETH);
      assert.equal(0.333333333333333333, fromWei(wethNormWeight));
      let mkrBalance = await pool.getBalance(MKR);
      assert.equal(20, fromWei(mkrBalance));
    });

    it('Fails binding above MAX TOTAL WEIGHT', async () => {
      await truffleAssert.reverts(pool.bind(XXX, toWei('1'), toWei('40')), 'ERR_MAX_TOTAL_WEIGHT');
    });

    it('Fails rebinding token or unbinding random token', async () => {
      await truffleAssert.reverts(pool.bind(WETH, toWei('0'), toWei('1')), 'ERR_IS_BOUND');
      await truffleAssert.reverts(pool.rebind(XXX, toWei('0'), toWei('1')), 'ERR_NOT_BOUND');
      await truffleAssert.reverts(pool.unbind(XXX), 'ERR_NOT_BOUND');
    });

    it('Get current tokens', async () => {
      let currentTokens = await pool.getCurrentTokens();
      assert.sameMembers(currentTokens, [WETH, MKR, DAI]);
    });

    it('Fails getting final tokens before finalized', async () => {
      await truffleAssert.reverts(pool.getFinalTokens(), 'ERR_NOT_FINALIZED');
    });

  });

  describe('Finalizing pool', () => {

    it('Fails when other users interact before finalizing', async () => {
      await truffleAssert.reverts(pool.bind(WETH, toWei('5'), toWei('5'), { from: user1 }), 'ERR_NOT_CONTROLLER');
      await truffleAssert.reverts(pool.rebind(WETH, toWei('5'), toWei('5'), { from: user1 }), 'ERR_NOT_CONTROLLER');
      await truffleAssert.reverts(pool.joinPool(toWei('1'), { from: user1 }), 'ERR_NOT_FINALIZED');
      await truffleAssert.reverts(pool.unbind(DAI, { from: user1 }), 'ERR_NOT_CONTROLLER');
    });

    it('Fails calling any swap before finalizing', async () => {
      await truffleAssert.reverts(pool.swap_ExactAmountIn(WETH, toWei('2.5'), DAI, toWei('475'), toWei('200')), 'ERR_SWAP_NOT_PUBLIC');
      await truffleAssert.reverts(pool.swap_ExactAmountIn(DAI, toWei('2.5'), WETH, toWei('475'), toWei('200')), 'ERR_SWAP_NOT_PUBLIC');
      await truffleAssert.reverts(pool.swap_ExactAmountOut(WETH, toWei('2.5'), DAI, toWei('475'), toWei('200')), 'ERR_SWAP_NOT_PUBLIC');
      await truffleAssert.reverts(pool.swap_ExactAmountOut(DAI, toWei('2.5'), WETH, toWei('475'), toWei('200')), 'ERR_SWAP_NOT_PUBLIC');
      await truffleAssert.reverts(pool.swap_ExactMarginalPrice(WETH, toWei('2.5'), DAI, toWei('475'), toWei('200')), 'ERR_SWAP_NOT_PUBLIC');
      await truffleAssert.reverts(pool.swap_ExactMarginalPrice(DAI, toWei('2.5'), WETH, toWei('475'), toWei('200')), 'ERR_SWAP_NOT_PUBLIC');
      await truffleAssert.reverts(pool.joinswap_ExternAmountIn(WETH, toWei('2.5')), 'ERR_SWAP_NOT_PUBLIC');
      await truffleAssert.reverts(pool.joinswap_PoolAmountOut(toWei('2.5'), WETH), 'ERR_SWAP_NOT_PUBLIC');
      await truffleAssert.reverts(pool.exitswap_PoolAmountIn(toWei('2.5'), WETH), 'ERR_SWAP_NOT_PUBLIC');
      await truffleAssert.reverts(pool.exitswap_ExternAmountOut(WETH, toWei('2.5')), 'ERR_SWAP_NOT_PUBLIC');
    });

    it('Fails setting high swap fees', async () => {
      await truffleAssert.reverts(pool.setSwapFee(toWei('0.11')), 'ERR_MAX_FEE');
    });

    it('Fails nonadmin sets fees or controller', async () => {
      await truffleAssert.reverts(pool.setSwapFee(toWei('0.003'), { from : user1 }), 'ERR_NOT_CONTROLLER');
      await truffleAssert.reverts(pool.setController(user1, { from: user1 }), 'ERR_NOT_CONTROLLER');
    });

    it('Admin sets swap fees', async () => {
      await pool.setSwapFee(toWei('0.003'));
      let swapFee = await pool.getSwapFee();
      assert.equal(0.003, fromWei(swapFee));
    });

    it('Fails nonadmin finalizes pool', async () => {
      await truffleAssert.reverts(pool.finalize(toWei('100'), { from: user1 }), 'ERR_NOT_CONTROLLER');
    });

    it('Fails setting supply below min supply', async () => {
      await truffleAssert.reverts(pool.finalize(toWei('0.99')), 'ERR_MIN_POOL_SUPPLY');
    });

    it('Admin finalizes pool', async () => {
      let tx = await pool.finalize(toWei('100'));
      let adminBal = await pool.balanceOf(admin);
      assert.equal(100, fromWei(adminBal));

      truffleAssert.eventEmitted(tx, 'Move', (event) => {
        return event.dst === admin;
      });
    });

    it('Fails finalizing pool after finalized', async () => {
      await truffleAssert.reverts(pool.finalize(toWei('100')), 'ERR_IS_FINALIZED');
    });

    it('Fails binding new token after finalized', async () => {
      await truffleAssert.reverts(pool.bind(XXX, toWei('10'), toWei('5')), 'ERR_IS_FINALIZED');
      await truffleAssert.reverts(pool.rebind(DAI, toWei('10'), toWei('5')), 'ERR_IS_FINALIZED');
    });

    it('Get final tokens', async () => {
      let finalTokens = await pool.getFinalTokens();
      assert.sameMembers(finalTokens, [WETH, MKR, DAI]);
    });

  });

  describe('User interactions', () => {

    it('Other users approve tokens', async () => {
      await weth.approve(POOL, MAX, { from: user1 });
      await mkr.approve(POOL, MAX, { from: user1 });
      await dai.approve(POOL, MAX, { from: user1 });
      await xxx.approve(POOL, MAX, { from: user1 });

      await weth.approve(POOL, MAX, { from: user2 });
      await mkr.approve(POOL, MAX, { from: user2 });
      await dai.approve(POOL, MAX, { from: user2 });
      await xxx.approve(POOL, MAX, { from: user2 });
    });

    it('User1 joins pool', async () => {
      await pool.joinPool(toWei('5'), { from: user1 });
      let daiBalance = await pool.getBalance(DAI);
      assert.equal(10500, fromWei(daiBalance));
      let userWethBalance = await weth.balanceOf(user1);
      assert.equal(22.5, fromWei(userWethBalance));
    });

    /*
      Current pool balances
      WETH - 52.5
      MKR - 21
      DAI - 10,500
      XXX - 0
    */

    it('Fails admin unbinding token after finalized and others joined', async () => {
      await truffleAssert.reverts(pool.unbind(DAI), 'ERR_IS_FINALIZED');
    });

    it('getSpotPriceSansFee and getSpotPrice', async () => {
      let wethPrice = await pool.getSpotPriceSansFee(DAI, WETH);
      assert.equal(200, fromWei(wethPrice))

      let wethPriceFee = await pool.getSpotPrice(DAI, WETH);
      let wethPriceFeeCheck = ((10500 / 5) / (52.5 / 5)) * (1 / (1 - 0.003));
      // 200.6018054162487462
      assert.equal(fromWei(wethPriceFee), wethPriceFeeCheck);
    });

    it('Fail swap_ExactAmountIn unbound or over min max ratios', async () => {
      await truffleAssert.reverts(pool.swap_ExactAmountIn(WETH, toWei('2.5'), XXX, toWei('100'), toWei('200'), { from: user2 }), 'ERR_NOT_BOUND');
      await truffleAssert.reverts(pool.swap_ExactAmountIn(WETH, toWei('26.5'), DAI, toWei('5000'), toWei('200'), { from: user2 }), 'ERR_MAX_IN_RATIO');
    });

    it('swap_ExactAmountIn', async () => {
      // 2.5 WETH -> DAI
      // Bo * (1 - (Bi/(Bi + Ai * (1 - fee)))^(Wi/Wo))
      let amountOut = 10500 * (1 - (52.5/(52.5 + (2.5 * (1 - 0.003))))**(5/5));
      let txr = await pool.swap_ExactAmountIn(WETH, toWei('2.5'), DAI, toWei('475'), toWei('200'), { from: user2 });
      let log = txr.logs[4];
      assert.equal(log.event, 'LOG_SWAP');
      // 475.905805337091423
      assert.approximately(Number(amountOut), Number(fromWei(log.args[4])), errorDelta);

      let userDaiBalance = await dai.balanceOf(user2);
      assert.equal(fromWei(userDaiBalance), Number(fromWei(log.args[4])));

      // 182.804672101083406128
      let wethPrice = await pool.getSpotPrice(DAI, WETH);
      let wethPriceFeeCheck = ((10024.094194662908577 / 5) / (55 / 5)) * (1 / (1 - 0.003));
      assert.approximately(Number(fromWei(wethPrice)), Number(wethPriceFeeCheck), errorDelta);

      let daiNormWeight = await pool.getNormalizedWeight(DAI);
      assert.equal(0.333333333333333333, fromWei(daiNormWeight));
    });

    it('swap_ExactAmountOut', async () => {
      // ETH -> 1 MKR
      // Bi * ((Bo/(Bo - Ao))^(Wo/Wi) - 1) / (1 - fee)
      let amountIn = 55 * ((21/(21 - 1))**(5/5) - 1) / (1 - 0.003)
      let txr = await pool.swap_ExactAmountOut(WETH, toWei('3'), MKR, toWei('1.0'), toWei('500'), { from: user2 })
      let log = txr.logs[4]
      assert.equal(log.event, 'LOG_SWAP');
      // 2.758274824473420261
      assert.approximately(Number(amountIn), Number(fromWei(log.args[3])), errorDelta);
    });

    it('Fails calling any swap on unbound token', async () => {
      await truffleAssert.reverts(pool.swap_ExactAmountIn(XXX, toWei('2.5'), DAI, toWei('475'), toWei('200')), 'ERR_NOT_BOUND');
      await truffleAssert.reverts(pool.swap_ExactAmountIn(DAI, toWei('2.5'), XXX, toWei('475'), toWei('200')), 'ERR_NOT_BOUND');
      await truffleAssert.reverts(pool.swap_ExactAmountOut(XXX, toWei('2.5'), DAI, toWei('475'), toWei('200')), 'ERR_NOT_BOUND');
      await truffleAssert.reverts(pool.swap_ExactAmountOut(DAI, toWei('2.5'), XXX, toWei('475'), toWei('200')), 'ERR_NOT_BOUND');
      await truffleAssert.reverts(pool.swap_ExactMarginalPrice(XXX, toWei('2.5'), DAI, toWei('475'), toWei('200')), 'ERR_NOT_BOUND');
      await truffleAssert.reverts(pool.swap_ExactMarginalPrice(DAI, toWei('2.5'), XXX, toWei('475'), toWei('200')), 'ERR_NOT_BOUND');
      await truffleAssert.reverts(pool.joinswap_ExternAmountIn(XXX, toWei('2.5')), 'ERR_NOT_BOUND');
      await truffleAssert.reverts(pool.joinswap_PoolAmountOut(toWei('2.5'), XXX), 'ERR_NOT_BOUND');
      await truffleAssert.reverts(pool.exitswap_PoolAmountIn(toWei('2.5'), XXX), 'ERR_NOT_BOUND');
      await truffleAssert.reverts(pool.exitswap_ExternAmountOut(XXX, toWei('2.5')), 'ERR_NOT_BOUND');
    });

    it('Fails calling weights, balances, spot prices on unbound token', async () => {
      await truffleAssert.reverts(pool.getDenormalizedWeight(XXX), 'ERR_NOT_BOUND');
      await truffleAssert.reverts(pool.getNormalizedWeight(XXX), 'ERR_NOT_BOUND');
      await truffleAssert.reverts(pool.getBalance(XXX), 'ERR_NOT_BOUND');
      await truffleAssert.reverts(pool.getSpotPrice(DAI, XXX), 'ERR_NOT_BOUND');
      await truffleAssert.reverts(pool.getSpotPrice(XXX, DAI), 'ERR_NOT_BOUND');
      await truffleAssert.reverts(pool.getSpotPriceSansFee(DAI, XXX), 'ERR_NOT_BOUND');
      await truffleAssert.reverts(pool.getSpotPriceSansFee(XXX, DAI), 'ERR_NOT_BOUND');
    });

  });


});
