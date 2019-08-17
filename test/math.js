assert = require("chai").assert;
let Web3 = require("web3");
let ganache = require("ganache-core");

let pkg = require("../package.js");
pkg.types.reloadTypes("../tmp/combined.json");
let math = require("../util/floatMath.js")
let fMath = math.floatMath;

let testPoints = require("./points.js");

let web3 = new Web3(ganache.provider({
    gasLimit: 0xffffffff,
    allowUnlimitedContractSize: true,
    debug: true
}));

let approxTolerance = 10 ** -6;
let floatEqTolerance = 10 ** -12;

let toBN = web3.utils.toBN;
let toWei = (n) => web3.utils.toWei(n.toString());

let assertCloseBN = (a, b, tolerance) => {
    tolerance = toBN(toWei(tolerance));
    let diff = toBN(a).sub(toBN(b)).abs();
    assert(diff.lt(tolerance), `assertCloseBN( ${a}, ${b}, ${tolerance} )`);
}

describe("floatMath.js", function () {
    for( let pt of testPoints.spotPricePoints ) {
        var desc = `${pt.res} ~= spotPrice(${pt.Bi}, ${pt.Wi}, ${pt.Bo}, ${pt.Wo})`;
        it(desc, function () {
            assert.closeTo(pt.res, fMath.spotPrice(pt.Bi, pt.Wi, pt.Bo, pt.Wo), floatEqTolerance);
        });
    }
    for( let pt of testPoints.calc_OutGivenInPoints ) {
        var desc = `${pt.res} == swapIMathExact(${pt.Bi}, ${pt.Wi}, ${pt.Bo}, ${pt.Wo}, ${pt.Ai}, ${pt.fee})`;
        it(desc, function () {
            assert.closeTo( pt.res, fMath.calc_OutGivenInExact(pt.Bi, pt.Wi, pt.Bo, pt.Wo, pt.Ai, pt.fee)
                          , floatEqTolerance);
        });
    }
    for( let pt of testPoints.calc_OutGivenInPoints ) {
        var desc = `${pt.res} ~= swapIMathApprox(${pt.Bi}, ${pt.Wi}, ${pt.Bo}, ${pt.Wo}, ${pt.Ai}, ${pt.fee})`;
        it(desc, function () {
            assert.closeTo( pt.res, fMath.calc_OutGivenInApprox(pt.Bi, pt.Wi, pt.Bo, pt.Wo, pt.Ai, pt.fee)
                          , approxTolerance);
        });
    }

    for( let pt of testPoints.calc_InGivenOutPoints ) {
        var desc = `${pt.res} == calc_InGivenOutExact(${pt.Bi}, ${pt.Wi}, ${pt.Bo}, ${pt.Wo}, ${pt.Ao}, ${pt.fee})`;
        it(desc, function () {
            assert.closeTo( pt.res, fMath.calc_InGivenOutExact(pt.Bi, pt.Wi, pt.Bo, pt.Wo, pt.Ao, pt.fee)
                          , floatEqTolerance);
        });
    }

    for( let pt of testPoints.calc_InGivenOutPoints ) {
        var desc = `${pt.res} ~= calc_InGivenOutApprox(${pt.Bi}, ${pt.Wi}, ${pt.Bo}, ${pt.Wo}, ${pt.Ao}, ${pt.fee})`;
        it(desc, function () {
            assert.closeTo( pt.res, fMath.calc_InGivenOutApprox(pt.Bi, pt.Wi, pt.Bo, pt.Wo, pt.Ao, pt.fee)
                          , approxTolerance);
        });
    }

    for( let pt of testPoints.amountUpToPricePoints ) {
        var desc = `${pt.res} ~= amountUpToPriceExact(${pt.Bi}, ${pt.Wi}, ${pt.Bo}, ${pt.Wo}, ${pt.SER1}, ${pt.fee})`;
        it(desc, function () {
            assert.closeTo( pt.res, fMath.amountUpToPriceExact(pt.Bi, pt.Wi, pt.Bo, pt.Wo, pt.SER1, pt.fee)
                          , approxTolerance);
        });
    }
    for( let pt of testPoints.amountUpToPricePoints ) {
        var desc = `${pt.res} ~= amountUpToPriceApprox(${pt.Bi}, ${pt.Wi}, ${pt.Bo}, ${pt.Wo}, ${pt.SER1}, ${pt.fee})`;
        it(desc, function () {
            assert.closeTo( pt.res, fMath.amountUpToPriceApprox(pt.Bi, pt.Wi, pt.Bo, pt.Wo, pt.SER1, pt.fee)
                          , approxTolerance);
        });
    }
    for( let pt of testPoints.powPoints) {
        var desc = `${pt.res} ~= powApprox(${pt.base}, ${pt.exp})`;
        it(desc, function () {
            assert.closeTo( pt.res, fMath.powApprox(pt.base, pt.exp)
                          , approxTolerance);
        });
    }

    for( let pt of testPoints.valuePoints) {
        let tokens = pt.tokens;
        let res    = pt.res;
        var desc = `${res} ~= getValue(${tokens})`;
        it(desc, function () {
            assert.closeTo( res, fMath.getValue(tokens)
                          , approxTolerance);
        });
    }

    for( let pt of testPoints.refSpotPricePoints) {
        let Bo     = pt.Bo;
        let Wo     = pt.Wo;
        let tokens = pt.tokens;
        let res    = pt.res;
        var desc = `${res} ~= getRefSpotPrice(Bo, Wo, ${tokens})`;
        it(desc, function () {
            assert.closeTo( res, fMath.getRefSpotPrice(Bo, Wo, tokens)
                          , approxTolerance);
        });
    }

    it("powApprox approximate float precision range", () => {
        for( base = 1.95; base > 0.05; base *= 0.95 ) {
            for( exponent = 10; exponent > 0.1; exponent *= 0.95) {
                assert.closeTo(base ** exponent
                              , fMath.powApprox(base, exponent)
                              , 0.001
                              , `base: ${base}, exponent: ${exponent}`);
            }
        }
    });

    it("should throw if Ai >= Bi", () => {
        assert.throws(() => { fMath.swapIMathExact(1, 2, 2, 2, 1, 0); });
    });
    it("should throw if fee >= 1", () => {
        assert.throws(() => { fMath.swapIMathExact(2, 2, 2, 2, 2, 1); });
    });
    it("should throw if any arg except fee is 0", () => {
        assert.throws(() => { fMath.swapIMathExact(0, 1, 1, 1, 0.1, 0); });
        assert.throws(() => { fMath.swapIMathExact(1, 0, 1, 1, 0.1, 0); });
        assert.throws(() => { fMath.swapIMathExact(1, 1, 0, 1, 0.1, 0); });
        assert.throws(() => { fMath.swapIMathExact(1, 1, 1, 0, 0.1, 0); });
        assert.throws(() => { fMath.swapIMathExact(1, 1, 1, 1, 0, 0); });
        assert.throws(() => { fMath.swapIMathApprox(0, 1, 1, 1, 0.1, 0); });
        assert.throws(() => { fMath.swapIMathApprox(1, 0, 1, 1, 0.1, 0); });
        assert.throws(() => { fMath.swapIMathApprox(1, 1, 0, 1, 0.1, 0); });
        assert.throws(() => { fMath.swapIMathApprox(1, 1, 1, 0, 0.1, 0); });
        assert.throws(() => { fMath.swapIMathApprox(1, 1, 1, 1, 0, 0); });
    });

});

describe("BMath", () => {
    for( let pt of testPoints.powPoints ) {
        
        let desc = `${pt.res} ~= math.bpow(${pt.base}, ${pt.exp})`;
        it(desc, async () => {
            let accts = await web3.eth.getAccounts();
            let math = await pkg.types.deploy(web3, accts[0], "BMath");
            let base = toWei(pt.base).toString();
            let exp  = toWei(pt.exp).toString();
            var actual = await math.methods.bpow(base, exp).call()
            assertCloseBN(toWei(pt.res), web3.utils.toBN(actual), approxTolerance);
        });
    }
    for( let pt of testPoints.spotPricePoints ) {
        let res = toWei(pt.res);
        let Bi = toWei(pt.Bi).toString();
        let Wi = toWei(pt.Wi).toString();
        let Bo = toWei(pt.Bo).toString();
        let Wo = toWei(pt.Wo).toString();
        let desc = `${pt.res} ~= bMath.spotPrice(${pt.Bi}, ${pt.Wi}, ${pt.Bo}, ${pt.Wo})`;
        it(desc, async () => {
            let accts = await web3.eth.getAccounts();
            let math = await pkg.types.deploy(web3, accts[0], "BMath");
            var actual = await math.methods.spotPrice(Bi, Wi, Bo, Wo).call()
            assertCloseBN(toBN(res), web3.utils.toBN(actual), approxTolerance);
        });
    }

    for( let pt of testPoints.amountUpToPricePoints ) {
        let res  = toWei(pt.res);
        let SER1 = toWei(pt.SER1).toString();
        let Bi   = toWei(pt.Bi).toString();
        let Wi   = toWei(pt.Wi).toString();
        let Bo   = toWei(pt.Bo).toString();
        let Wo   = toWei(pt.Wo).toString();
        let fee  = toWei(pt.fee).toString();
        let desc = `${pt.res} ~= bMath.amountUpToPriceApprox(${pt.Bi}, ${pt.Wi}, ${pt.Bo}, ${pt.Wo}, ${pt.SER1}, ${pt.fee})`;
        it(desc, async () => {
            let accts = await web3.eth.getAccounts();
            let math = await pkg.types.deploy(web3, accts[0], "BMath");
            var actual = await math.methods.amountUpToPriceApprox(Bi, Wi, Bo, Wo, SER1, fee).call()
            assertCloseBN(toBN(res), web3.utils.toBN(actual), approxTolerance);
        });
    }
 
    for( let pt of testPoints.calc_OutGivenInPoints ) {
        let res = toWei(pt.res);
        let Bi = toWei(pt.Bi).toString();
        let Wi = toWei(pt.Wi).toString();
        let Bo = toWei(pt.Bo).toString();
        let Wo = toWei(pt.Wo).toString();
        let Ai = toWei(pt.Ai).toString();
        let fee = toWei(pt.fee).toString();
        var desc = `${pt.res} ~= bMath.calc_OutGivenIn(${pt.Bi}, ${pt.Wi}, ${pt.Bo}, ${pt.Wo}, ${pt.Ai}, ${pt.fee})`;
        it(desc, async () => {
            let accts = await web3.eth.getAccounts();
            let math = await pkg.types.deploy(web3, accts[0], "BMath");
            var actual = await math.methods.calc_OutGivenIn(Bi, Wi, Bo, Wo, Ai, fee).call();
            assertCloseBN(res, web3.utils.toBN(actual), approxTolerance);
        });
    }

    for( let pt of testPoints.calc_InGivenOutPoints ) {
        let res = toWei(pt.res);
        let Bi = toWei(pt.Bi).toString();
        let Wi = toWei(pt.Wi).toString();
        let Bo = toWei(pt.Bo).toString();
        let Wo = toWei(pt.Wo).toString();
        let Ao = toWei(pt.Ao).toString();
        let fee = toWei(pt.fee).toString();
        var desc = `${pt.res} ~= bMath.calc_InGivenOutPoints(${pt.Bi}, ${pt.Wi}, ${pt.Bo}, ${pt.Wo}, ${pt.Ao}, ${pt.fee})`;
        it(desc, async () => {
            accts = await web3.eth.getAccounts();
            math = await pkg.types.deploy(web3, accts[0], "BMath");
            var actual = await math.methods.calc_InGivenOut(Bi, Wi, Bo, Wo, Ao, fee).call();
            assertCloseBN(res, web3.utils.toBN(actual), approxTolerance);
        });
    }
});
