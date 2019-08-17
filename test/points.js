module.exports.spotPricePoints = [
    {res: 4, Bi: 1, Wi: 0.2, Bo: 10, Wo: 0.5},
    {res: 1/4, Bi: 10, Wi: 0.5, Bo: 1, Wo: 0.2},

    {res: 0.00025, Bi: 6000, Wi: 0.3, Bo: 1, Wo: 0.2},
    {res: 1/0.00025, Bi: 1, Wi: 0.2, Bo: 6000, Wo: 0.3},

    {res: 1000, Bi: 10, Wi: 0.5, Bo: 6000, Wo: 0.3},
    {res: 1/1000, Bi: 6000, Wi: 0.3, Bo: 10, Wo: 0.5}
];

module.exports.calc_OutGivenInPoints = [
    {res: (1 - Math.pow((2/(2+1)),(0.1/0.1))) * 2, Bi: 2, Wi: 0.1, Bo: 2, Wo: 0.1, Ai: 1, fee: 0},//2/3
    {res: (1 - Math.pow((20/(20+10)),(0.1/0.1))) * 20, Bi: 20, Wi: 0.1, Bo: 20, Wo: 0.1, Ai: 10, fee: 0},//20/3
    {res: (1 - Math.pow((200/(200+1)),(0.5/0.3))) * 20, Bi: 200, Wi: 0.5, Bo: 20, Wo: 0.3, Ai: 1, fee: 0}, //10/9
    {res: (1 - Math.pow((235/(235+32)),(0.5/0.2)))*150, Bi: 235, Wi: 0.5, Bo: 150, Wo: 0.2, Ai: 32, fee: 0},
    {res: (1 - Math.pow((2/(2+1*0.98)),(0.1/0.1))) * 2, Bi: 2, Wi: 0.1, Bo: 2, Wo: 0.1, Ai: 1, fee: 0.02},//2/3
    {res: (1 - Math.pow((20/(20+10*0.99)),(0.1/0.1))) * 20, Bi: 20, Wi: 0.1, Bo: 20, Wo: 0.1, Ai: 10, fee: 0.01},//20/3
    {res: (1 - Math.pow((200/(200+1*0.97)),(0.5/0.3))) * 20, Bi: 200, Wi: 0.5, Bo: 20, Wo: 0.3, Ai: 1, fee: 0.03}, //10/9
    {res: (1 - Math.pow((235/(235+32*0.9)),(0.5/0.2)))*150, Bi: 235, Wi: 0.5, Bo: 150, Wo: 0.2, Ai: 32, fee: 0.1},
]

module.exports.calc_InGivenOutPoints = [
    {res: (Math.pow((2/(2 - 1)), (0.1/0.1)) - 1) * 2, Bi: 2, Wi: 0.1, Bo: 2, Wo: 0.1, Ao: 1, fee: 0},//2
    {res: (Math.pow((20/(20 - 10)), (0.1/0.1)) - 1) * 20, Bi: 20, Wi: 0.1, Bo: 20, Wo: 0.1, Ao: 10, fee: 0},//20
    {res: (Math.pow((600/(600 - 4)), (0.3/0.5)) - 1) * 523, Bi: 523, Wi: 0.5, Bo: 600, Wo: 0.3, Ao: 4, fee: 0},
    {res: (Math.pow((523/(523 - 70)), (0.2/0.5)) - 1) * 600, Bi: 600, Wi: 0.5, Bo: 523, Wo: 0.2, Ao: 70, fee: 0},
    {res: (Math.pow((2/(2 - 1)), (0.1/0.1)) - 1) * 2 / 0.98, Bi: 2, Wi: 0.1, Bo: 2, Wo: 0.1, Ao: 1, fee: 0.02},//2
    {res: (Math.pow((20/(20 - 10)), (0.1/0.1)) - 1) * 20 / 0.99, Bi: 20, Wi: 0.1, Bo: 20, Wo: 0.1, Ao: 10, fee: 0.01},//20
    {res: (Math.pow((600/(600 - 4)), (0.3/0.5)) - 1) * 523 / 0.97, Bi: 523, Wi: 0.5, Bo: 600, Wo: 0.3, Ao: 4, fee: 0.03},
    {res: (Math.pow((523/(523 - 70)), (0.2/0.5)) - 1) * 600 / 0.9, Bi: 600, Wi: 0.5, Bo: 523, Wo: 0.2, Ao: 70, fee: 0.1},
]

module.exports.amountUpToPricePoints = [
    {res: 1.06008957447, Bi: 10, Wi: 0.3, Bo: 5260, Wo: 0.3, SER1: 430, fee: 0},
    {res: 0.12011996945, Bi: 10, Wi: 0.2, Bo: 4405, Wo: 0.1, SER1: 850, fee: 0},
    {res: 0,             Bi: 10, Wi: 0.5, Bo: 8810, Wo: 0.5, SER1: 881, fee: 0},
    {res: 0.97653399825, Bi: 10, Wi: 0.2, Bo: 4600, Wo: 0.4, SER1: 200, fee: 0},
    {res: 1.08172405558, Bi: 10, Wi: 0.3, Bo: 5260, Wo: 0.3, SER1: 430, fee: 0.02},
    {res: 0.12133330247, Bi: 10, Wi: 0.2, Bo: 4405, Wo: 0.1, SER1: 850, fee: 0.01},
    {res: 0,             Bi: 10, Wi: 0.5, Bo: 8810, Wo: 0.5, SER1: 881, fee: 0.03},
    {res: 1.08503777583, Bi: 10, Wi: 0.2, Bo: 4600, Wo: 0.4, SER1: 200, fee: 0.1},
];

module.exports.powPoints = [
    {res: 1.1 ** 1.5,    base: 1.1, exp: 1.5},
    {res: 0 ** 0,        base: 1.0,   exp: 0},
    {res: 1.05 ** 0,     base: 1.05, exp: 0},
    {res: 1.01 ** 0.2,   base: 1.01, exp: 0.2},
    {res: 0.9 ** 1.5,    base: 0.9, exp: 1.5},
    {res: 0.95 ** 0,     base: 0.95, exp: 0},
    {res: 0.91 ** 0.2,   base: 0.91, exp: 0.2},
    {res: 0.9 ** 0.2,    base: 0.9, exp: 0.2},
    {res: 1.5 ** 1.5,    base: 1.5, exp: 1.5},
];

module.exports.valuePoints = [
    {res: 0, tokens: []},
    {res: Math.pow(300, 0.399)*Math.pow(875, 0.2)*Math.pow(372, 0.001)*Math.pow(282, 0.3)*Math.pow(2, 0.1), 
        tokens: [[300, 0.399],
                 [875, 0.2],
                 [372, 0.001],
                 [282, 0.3],
                 [2,   0.1]]},
];

module.exports.refSpotPricePoints = [
    {res: (526/0.32)/(Math.pow(300, 0.399)*Math.pow(874, 0.2)*Math.pow(375, 0.001)*Math.pow(282, 0.3)*Math.pow(2, 0.1)), 
        Bo: 526,
        Wo: 0.32,

        tokens: [[300, 0.399],
                 [874, 0.2],
                 [375, 0.001],
                 [282, 0.3],
                 [2,   0.1]],}
];






