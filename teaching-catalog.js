window.CpaTeachingCatalog=[
  {
    "n": 1,
    "unit": "u01",
    "anchors": [
      "ch06-underlying",
      "ch06-forward",
      "ch06-futures",
      "ch06-option",
      "ch06-initial-payment"
    ],
    "title": "合约约定现金流，标的价格决定结果",
    "question": "切换合约：谁有权选择，谁必须履约，什么时候收付款？",
    "reference": "经典资料主题对照＋本章内容设计"
  },
  {
    "n": 2,
    "unit": "u01",
    "anchors": [
      "ch06-swap-forwards",
      "ch06-leverage"
    ],
    "title": "互换逐期结算，保证金改变收益率分母",
    "question": "选择互换或保证金，观察金额与收益率各自依赖什么。",
    "reference": "经典资料主题对照＋本章内容设计"
  },
  {
    "n": 3,
    "unit": "u01",
    "anchors": [
      "ch06-short-hedge",
      "ch06-long-hedge",
      "ch06-effective-hedge-price",
      "ch06-fx-short",
      "ch06-fx-long"
    ],
    "title": "采购做多、销售做空，先认清业务方向",
    "question": "先选采购或销售，再改变市场价格和基差，看综合价格。",
    "reference": "经典资料主题对照＋本章内容设计"
  },
  {
    "n": 4,
    "unit": "u02",
    "anchors": [
      "ch06-full-four-positions",
      "ch06-full-call-put"
    ],
    "title": "四种头寸按同一价格核对",
    "question": "在比较表中核对：同一合约买卖双方的金额如何相抵？",
    "reference": "MIT 15.401 第5、7—13页"
  },
  {
    "n": 5,
    "unit": "u02",
    "anchors": [
      "ch06-full-call-payoff",
      "ch06-full-call-profit"
    ],
    "title": "看涨买方：行权与回本相差一笔期权费",
    "question": "在执行价、仍亏区和回本点之间移动，比较两条线。",
    "reference": "MIT 15.401 第5、7—13页",
    "label": "5a",
    "fixed": {
      "type": "call"
    }
  },
  {
    "n": 6,
    "unit": "u02",
    "anchors": [
      "ch06-full-contract-scale",
      "ch06-full-exercise-time"
    ],
    "title": "每股金额乘合约规模，行权还要看日期",
    "question": "改变份数和乘数，再检查今天支付与到期收入的单位。",
    "reference": "MIT 15.401 第5、7—13页"
  },
  {
    "n": 7,
    "unit": "u03",
    "anchors": [
      "ch06-full-protective-example",
      "ch06-full-protective-put"
    ],
    "title": "保护性看跌：股票下跌，由看跌收入补上",
    "question": "逐行计算股票和看跌收入，观察总收入在哪里停止下降。",
    "reference": "MIT 15.401 第5、7—13页",
    "label": "7a",
    "fixed": {
      "type": "protect"
    }
  },
  {
    "n": 8,
    "unit": "u03",
    "anchors": [
      "ch06-full-quantity-match"
    ],
    "title": "保护数量决定剩余股票敞口",
    "question": "逐步增加保护数量：从没有保护到刚好覆盖，再到超额保护。",
    "reference": "MIT 15.401 第5、7—13页"
  },
  {
    "n": 9,
    "unit": "u03",
    "anchors": [
      "ch06-full-strategy-dividends"
    ],
    "title": "持股收到的现金股利也计入组合损益",
    "question": "先沿时间轴记现金流，再用不同到期股价逐行核对。",
    "reference": "MIT 15.401 第5、7—13页",
    "label": "9a",
    "fixed": {
      "mode": "dividend"
    }
  },
  {
    "n": 10,
    "unit": "u03",
    "anchors": [
      "ch06-full-multiple-strikes",
      "ch06-full-multiple-strikes-maximum"
    ],
    "title": "三个执行价把收入分成四段",
    "question": "跨过28、39和50，观察新增的期权腿怎样改变斜率。",
    "reference": "MIT 15.401 第5、7—13页"
  },
  {
    "n": 11,
    "unit": "u03",
    "anchors": [
      "ch06-full-fx-setup",
      "ch06-full-fx-payoffs",
      "ch06-full-fx-breakpoints"
    ],
    "title": "两侧名义本金不同，回本距离就不同",
    "question": "先看执行汇率附近，再比较大幅升值和贬值两种情景。",
    "reference": "MIT 15.401 第5、7—13页"
  },
  {
    "n": 12,
    "unit": "u04",
    "anchors": [
      "ch06-full-intrinsic-value",
      "ch06-full-moneyness",
      "ch06-full-time-value"
    ],
    "title": "同一股价处的竖向差额就是时间价值",
    "question": "固定当前股价104元，单独改变期限或波动率，观察价值差额。",
    "reference": "经典资料主题对照＋本章内容设计"
  },
  {
    "n": 13,
    "unit": "u04",
    "anchors": [
      "ch06-full-volatility-effect"
    ],
    "title": "保持均值不变，扩大波动可抬高买方支付",
    "question": "把两个未来股价向均值两侧推远，比较看涨和看跌的支付。",
    "reference": "经典资料主题对照＋本章内容设计"
  },
  {
    "n": 14,
    "unit": "u04",
    "anchors": [
      "ch06-full-six-factors",
      "ch06-full-spot-strike-effects",
      "ch06-full-rate-effect",
      "ch06-full-dividend-effect",
      "ch06-full-maturity-effect"
    ],
    "title": "因素方向来自条件，期限不能一概而论",
    "question": "每次只提高一个因素，核对看涨、看跌以及适用条件。",
    "reference": "经典资料主题对照＋本章内容设计"
  },
  {
    "n": 15,
    "unit": "u04",
    "anchors": [
      "ch06-full-sell-or-exercise",
      "ch06-full-call-upper-bound",
      "ch06-full-european-time-example",
      "ch06-full-put-price-bounds"
    ],
    "title": "出售得到报价，行权只得到内在价值",
    "question": "在同一时点比较可交易报价与执行净收入，检查行权资格。",
    "reference": "经典资料主题对照＋本章内容设计"
  },
  {
    "n": 16,
    "unit": "u05",
    "anchors": [
      "ch06-full-replication-equations",
      "ch06-full-replication-call",
      "ch06-full-hedging-principle"
    ],
    "title": "用两种状态的差额求出复制持股数",
    "question": "先试持有1股，再用上下状态差额求H并确定借款。",
    "reference": "MIT 15.401 第17—21页"
  },
  {
    "n": 17,
    "unit": "u05",
    "anchors": [
      "ch06-full-replication-principle",
      "ch06-full-replication-arbitrage"
    ],
    "title": "贵的卖出、便宜的买入，未来收支相抵",
    "question": "把期权报价调高或调低，核对今天及两个未来状态的净现金。",
    "reference": "MIT 15.401 第17—21页"
  },
  {
    "n": 18,
    "unit": "u05",
    "anchors": [
      "ch06-full-risk-neutral-weight",
      "ch06-full-risk-neutral-example",
      "ch06-full-no-arbitrage-condition"
    ],
    "title": "先让股票价格配平，再用同一权重定价",
    "question": "改变真实上涨概率与无风险利率，比较谁会改变模型价格。",
    "reference": "MIT 15.401 第17—21页"
  },
  {
    "n": 19,
    "unit": "u05",
    "anchors": [
      "ch06-full-replication-put",
      "ch06-full-multiple-strike-pricing"
    ],
    "title": "看跌支付随股价下降，复制持股数为负",
    "question": "切换看涨和看跌，观察两个到期支付之差的正负。",
    "reference": "MIT 15.401 第17—21页"
  },
  {
    "n": 20,
    "unit": "u06",
    "anchors": [
      "ch06-full-binomial-structure",
      "ch06-full-binomial-call-terminal",
      "ch06-full-binomial-call-backward"
    ],
    "title": "终点算支付，父节点加权并折现一期",
    "question": "选择父节点，跟着两条子分支算期望额和折现额。",
    "reference": "Damodaran 配套讲义第14页"
  },
  {
    "n": 21,
    "unit": "u06",
    "anchors": [
      "ch06-full-binomial-dynamic-replication"
    ],
    "title": "来到新节点，持股比例也要重新计算",
    "question": "选择已经到达的节点，比较复制持股数与现金头寸。",
    "reference": "Damodaran 配套讲义第14页"
  },
  {
    "n": 22,
    "unit": "u06",
    "anchors": [
      "ch06-full-binomial-rate",
      "ch06-full-crr",
      "ch06-full-six-step-setup",
      "ch06-full-six-step-backward"
    ],
    "title": "总期限固定，期数变化要同时换算参数",
    "question": "固定半年和年化波动率，比较2、6、12、24期。",
    "reference": "Damodaran 配套讲义第14页"
  },
  {
    "n": 23,
    "unit": "u06",
    "anchors": [
      "ch06-full-american-rule",
      "ch06-full-american-put-example"
    ],
    "title": "美式每个节点都比较行权与继续价值",
    "question": "选择上涨或下跌节点，比较当前行权收入与下一期机会。",
    "reference": "Damodaran 配套讲义第14页"
  },
  {
    "n": 24,
    "unit": "u07",
    "anchors": [
      "ch06-full-bs-parameters",
      "ch06-full-bs-formula",
      "ch06-full-bs-example-input",
      "ch06-full-bs-example-price",
      "ch06-full-bs-rate"
    ],
    "title": "BS先统一单位，再算两个价值项的差",
    "question": "改变现价，看d值、N值、股票项与执行价项一起更新。",
    "reference": "经典资料主题对照＋本章内容设计"
  },
  {
    "n": 25,
    "unit": "u07",
    "anchors": [
      "ch06-full-normal-table",
      "ch06-full-bs-probability"
    ],
    "title": "累计正态概率是左侧面积",
    "question": "移动z，观察左侧累计面积与N(z)的对应。",
    "reference": "经典资料主题对照＋本章内容设计",
    "label": "25a",
    "fixed": {
      "mode": "cdf"
    }
  },
  {
    "n": 26,
    "unit": "u07",
    "anchors": [
      "ch06-full-put-call-parity",
      "ch06-full-parity-arbitrage"
    ],
    "title": "两种组合终值相同，今天成本应相同",
    "question": "跨过执行价，核对两组合的每项终值；再观察错价套利。",
    "reference": "经典资料主题对照＋本章内容设计"
  },
  {
    "n": 27,
    "unit": "u07",
    "anchors": [
      "ch06-full-bs-dividend-yield",
      "ch06-full-bs-cash-dividend"
    ],
    "title": "现金股利和连续股利率使用不同输入",
    "question": "分别输入固定现金金额或连续收益率，检查它们进入公式的位置。",
    "reference": "经典资料主题对照＋本章内容设计"
  },
  {
    "n": 28,
    "unit": "u08",
    "anchors": [
      "ch06-full-real-types",
      "ch06-full-real-model",
      "ch06-full-real-expansion-choice"
    ],
    "title": "先看企业拥有什么选择，再对应期权",
    "question": "切换等待、扩张与退出，辨认企业行动和市场结果。",
    "reference": "Damodaran 配套讲义第27、51、58—60页"
  },
  {
    "n": 29,
    "unit": "u08",
    "anchors": [
      "ch06-full-real-wearable-input",
      "ch06-full-real-expansion-formula"
    ],
    "title": "智能穿戴扩张：经营现金与投资分别折现",
    "question": "核对智能穿戴产线扩张的决定时点和现金流归属。",
    "reference": "Damodaran 配套讲义第27、51、58—60页",
    "label": "29a",
    "fixed": {
      "type": "wearable"
    }
  },
  {
    "n": 30,
    "unit": "u08",
    "anchors": [
      "ch06-full-real-distribution",
      "ch06-full-real-delay-input",
      "ch06-full-real-delay-answer",
      "ch06-full-real-delay-threshold"
    ],
    "title": "经营资产收现金，等待者保留投资选择",
    "question": "先看已投产资产怎样校准q，再看等待者真正拿到什么。",
    "reference": "Damodaran 配套讲义第27、51、58—60页"
  },
  {
    "n": 31,
    "unit": "u08",
    "anchors": [
      "ch06-full-real-patent-input",
      "ch06-full-real-patent-answer",
      "ch06-full-real-delay-build"
    ],
    "title": "到期日固定，等一年就少经营一年",
    "question": "把设备投资从600改到700，比较立即投产与等待的价值。",
    "reference": "Damodaran 配套讲义第27、51、58—60页"
  },
  {
    "n": 32,
    "unit": "u08",
    "anchors": [
      "ch06-full-real-equipment-answer"
    ],
    "title": "设备退出：先收经营现金，再比较继续与出售",
    "question": "比较低需求和高需求时，第一年收款后的继续价值与出售金额。",
    "reference": "Damodaran 配套讲义第27、51、58—60页",
    "label": "32a",
    "fixed": {
      "type": "equipment"
    }
  },
  {
    "n": 34,
    "unit": "u02",
    "anchors": [
      "ch06-full-short-call"
    ],
    "title": "看涨卖方：收取费用，承担上涨支付",
    "question": "观察股价上升时，收取的期权费何时不足以覆盖支付。",
    "reference": "MIT 15.401 第5、7—13页",
    "label": "5b",
    "fixed": {
      "type": "call"
    },
    "lesson": 5,
    "short": true
  },
  {
    "n": 33,
    "unit": "u02",
    "anchors": [
      "ch06-full-put-payoff"
    ],
    "title": "看跌买方：股价下降才产生执行收入",
    "question": "从几个到期股价出发，算看跌收入，再扣期权费。",
    "reference": "MIT 15.401 第5、7—13页",
    "label": "5c",
    "fixed": {
      "type": "put"
    },
    "lesson": 5
  },
  {
    "n": 35,
    "unit": "u02",
    "anchors": [
      "ch06-full-put-risk"
    ],
    "title": "看跌卖方：股价下降会增加履约支付",
    "question": "把执行收入和期初收取的期权费分开计算。",
    "reference": "MIT 15.401 第5、7—13页",
    "label": "5d",
    "fixed": {
      "type": "put"
    },
    "lesson": 5,
    "short": true
  },
  {
    "n": 36,
    "unit": "u03",
    "anchors": [
      "ch06-full-covered-example",
      "ch06-full-covered-call"
    ],
    "title": "抛补性看涨：收取费用，放弃部分上涨收益",
    "question": "从股票市值中扣除看涨空头支付，再计算净损益。",
    "reference": "MIT 15.401 第5、7—13页",
    "label": "7b",
    "fixed": {
      "type": "covered"
    },
    "lesson": 7
  },
  {
    "n": 37,
    "unit": "u03",
    "anchors": [
      "ch06-full-long-straddle",
      "ch06-full-straddle-breakeven"
    ],
    "title": "多头对敲：大涨或大跌，才覆盖双份期权费",
    "question": "分别计算两份买入期权，找出50和70两个回本点。",
    "reference": "MIT 15.401 第5、7—13页",
    "label": "7c",
    "fixed": {
      "type": "long"
    },
    "lesson": 7
  },
  {
    "n": 38,
    "unit": "u03",
    "anchors": [
      "ch06-full-short-straddle"
    ],
    "title": "空头对敲：收入有限，两端都承担支付",
    "question": "先记收到的10元，再观察股价偏离60后要付出多少。",
    "reference": "MIT 15.401 第5、7—13页",
    "label": "7d",
    "fixed": {
      "type": "short"
    },
    "lesson": 7
  },
  {
    "n": 39,
    "unit": "u03",
    "anchors": [
      "ch06-full-equal-capital"
    ],
    "title": "同为62,500元：保护性看跌与看涨杠杆",
    "question": "同一到期股价下，甲的保护与乙的杠杆怎样改变全部持仓的损益？",
    "reference": "本节“相同投入下的保护与杠杆”算例；图中按原题的持仓数量、期权费与股利计算。",
    "label": "9b",
    "fixed": {
      "mode": "capital"
    },
    "lesson": 9
  },
  {
    "n": 40,
    "unit": "u07",
    "anchors": [
      "ch06-full-bs-volatility-example"
    ],
    "title": "先算每期离散程度，再把波动率年化",
    "question": "比较观测周期变化后，年化波动率如何换算。",
    "reference": "经典资料主题对照＋本章内容设计",
    "label": "25b",
    "fixed": {
      "mode": "sigma"
    },
    "lesson": 25
  },
  {
    "n": 42,
    "unit": "u08",
    "anchors": [
      "ch06-full-real-storage-input"
    ],
    "title": "存储技术扩张：二期现金流对应未来投资",
    "question": "对齐存储升级的决定时点、经营现金流和今日价值。",
    "reference": "Damodaran 配套讲义第27、51、58—60页",
    "label": "29b",
    "fixed": {
      "type": "storage"
    },
    "lesson": 29
  },
  {
    "n": 41,
    "unit": "u08",
    "anchors": [
      "ch06-full-real-mine-terminal",
      "ch06-full-real-mine-backward",
      "ch06-full-real-mine-increment",
      "ch06-full-real-mine-dcf"
    ],
    "title": "矿山退出：每个年末重新比较继续与清算",
    "question": "选择矿山年次与节点，核对当期现金、继续价值和清算额。",
    "reference": "Damodaran 配套讲义第27、51、58—60页",
    "label": "32b",
    "fixed": {
      "type": "mine"
    },
    "lesson": 32
  },
  {
    "n": 43,
    "unit": "u03",
    "anchors": [
      "ch06-full-locked-versus-finite"
    ],
    "title": "组合保底与单独看跌的金额上限",
    "question": "一个靠组合抵销形成保底，一个因股价不能小于零而存在上限。",
    "reference": "本章保护性看跌与看跌多头定义；参考经典教材的同尺度收益图，自行设计联动对照"
  }
];
