module.exports={
  //巴萨系列
  "Inside-R-1":  //DR和SC引开对方两个后卫，AMR内切射门
    {  
      "Name": "Inside-R-1",
      "Desc": "DR下底回传，AMR内切射门",  //内切射门
      "BaseRate": 0.1,    //基础加成效果，对个别特殊数据进行个别调整
      "ShotRole" : "AMR",
      "CoexistRoles": [],
      "Rhythm" : [0, 1, 2],
      "Procedure" : [
        { "Type": "ShortPass", "AttackFromRole": "DMC", "AttackToRole": "MCR", "DefendFromRole": "SC", "DefendToRole": "MCL", "IsMain":0}, //短传
        { "Type": "DirectPass", "AttackFromRole": "MCR", "AttackToRole": "WBR", "DefendFromRole": "MCL", "DefendToRole": "AML"},      //直传(冲刺跑)
        { "Type": "NeutralPass", "AttackFromRole": "WBR", "AttackToRole": "AMR", "DefendFromRole": "AML", "DefendToRole": "DL"},     //传空档
        { "Type": "RunRestriPosi", "AttackFromRole": "SC", "AttackToRole": "SC", "DefendFromRole": "DCL", "DefendToRole": "DCL"},    //大禁区内跑位
        { "Type": "DribbleForShot", "AttackFromRole": "AMR", "AttackToRole": "AMR", "DefendFromRole": "DMC", "DefendToRole": "DMC"}, //射门前盘带选位
        { "Type": "LeftShot", "AttackFromRole": "AMR", "AttackToRole": "AMR", "DefendFromRole": "DCL", "DefendToRole": "GK"},       //中短距离左脚射门
      ],
      "AttackGood": ["4-1-2-2-1"],
      "AttackBad": [],
      "DefendGood": [],
      "DefendBad": [],
    },
  "Inside-L-1": //DL和SC引开对方两个后卫，AML内切射门
    {
      "Name": "Inside-L-1",
      "Desc": "DL下底回传，AML内切射门", //内切射门
      "BaseRate": 0.1,
      "ShotRole": "AML",
       "CoexistRoles": [],
      "Rhythm": [0, 1, 2],
      "Procedure": [
        { "Type": "ShortPass", "AttackFromRole": "DMC", "AttackToRole": "MCL", "DefendFromRole": "SC", "DefendToRole": "MCR", "IsMain": 0 }, //短传
        { "Type": "DirectPass", "AttackFromRole": "MCL", "AttackToRole": "WBL", "DefendFromRole": "MCR", "DefendToRole": "AMR" },      //直传(冲刺跑)
        { "Type": "NeutralPass", "AttackFromRole": "WBL", "AttackToRole": "AML", "DefendFromRole": "AMR", "DefendToRole": "DR" },     //传空档
        { "Type": "RunRestriPosi", "AttackFromRole": "SC", "AttackToRole": "SC", "DefendFromRole": "DCR", "DefendToRole": "DCR" },    //大禁区内跑位
        { "Type": "DribbleForShot", "AttackFromRole": "AML", "AttackToRole": "AML", "DefendFromRole": "DMC", "DefendToRole": "DMC" }, //射门前盘带选位
        { "Type": "RightShot", "AttackFromRole": "AML", "AttackToRole": "AML", "DefendFromRole": "DCR", "DefendToRole": "GK" },       //中短距离左脚射门
      ],
      "AttackGood": ["4-1-2-2-1"],
      "AttackBad": [],
      "DefendGood": [],
      "DefendBad": [],
    },
  "Inside-R-2": //DR和AMR引开对方边后卫和后腰，SC跑空档射门
    {
      "Name": "Inside-R-2",
      "Desc": "AMR内切直塞，SC抢点射门",
      "BaseRate": 0.0,
      "ShotRole": "SC",
      "CoexistRoles": [],
      "Rhythm": [0, 1, 2],
      "Procedure": [
        { "Type": "ShortPass", "AttackFromRole": "DMC", "AttackToRole": "MCR", "DefendFromRole": "SC", "DefendToRole": "MCL", "IsMain": 0 }, //短传
        { "Type": "DirectPass", "AttackFromRole": "MCR", "AttackToRole": "WBR", "DefendFromRole": "MCL", "DefendToRole": "AML" },      //直传(冲刺跑)
        { "Type": "NeutralPass", "AttackFromRole": "WBR", "AttackToRole": "AMR", "DefendFromRole": "AML", "DefendToRole": "DL" },     //传空档
        { "Type": "RunRestriPosi", "AttackFromRole": "SC", "AttackToRole": "SC", "DefendFromRole": "DCL", "DefendToRole": "DCL" },    //大禁区内跑位
        { "Type": "NeutralPass", "AttackFromRole": "AMR", "AttackToRole": "SC", "DefendFromRole": "DMC", "DefendToRole": "DCL" }, //传空档
        { "Type": "Shot", "AttackFromRole": "SC", "AttackToRole": "SC", "DefendFromRole": "DCL", "DefendToRole": "GK" },       //中短距离射门
      ],
      "AttackGood": ["4-1-2-2-1"],
      "AttackBad": [],
      "DefendGood": [],
      "DefendBad": [],
    },
  "Inside-L-2": //DL和AML引开对方边后卫和后腰，SC跑空档射门
    {
      "Name": "Inside-L-1",
      "Desc": "AML内切直塞，SC抢点射门",
      "BaseRate": 0.0,
      "ShotRole": "SC",
      "CoexistRoles": [],
      "Rhythm": [0, 1, 2],
      "Procedure": [
        { "Type": "ShortPass", "AttackFromRole": "DMC", "AttackToRole": "MCL", "DefendFromRole": "SC", "DefendToRole": "MCR", "IsMain": 0 }, //短传
        { "Type": "DirectPass", "AttackFromRole": "MCL", "AttackToRole": "WBL", "DefendFromRole": "MCR", "DefendToRole": "AMR" },      //直传(冲刺跑)
        { "Type": "NeutralPass", "AttackFromRole": "WBL", "AttackToRole": "AML", "DefendFromRole": "AMR", "DefendToRole": "DR" },     //传空档
        { "Type": "RunRestriPosi", "AttackFromRole": "SC", "AttackToRole": "SC", "DefendFromRole": "DCR", "DefendToRole": "DCR" },    //大禁区内跑位
        { "Type": "NeutralPass", "AttackFromRole": "AML", "AttackToRole": "SC", "DefendFromRole": "DMC", "DefendToRole": "DCR" }, //传空档
        { "Type": "Shot", "AttackFromRole": "SC", "AttackToRole": "SC", "DefendFromRole": "DCR", "DefendToRole": "GK" },       //中短距离射门
      ],
      "AttackGood": ["4-1-2-2-1"],
      "AttackBad": [],
      "DefendGood": [],
      "DefendBad": [],
    },

  //皇马系列
  "Wide-L-1": 
    {
      "Name": "Wide-L-1",
      "Desc": "DR45度角长传，AML冲刺头球射门",
      "BaseRate": 0,
      "ShotRole": "AML",
      "CoexistRoles": [],
      "Rhythm": [2, 3 ,4],
      "Procedure": [
        { "Type": "ShortPass", "AttackFromRole": "MCR", "AttackToRole": "WBR", "DefendFromRole": "AMC", "DefendToRole": "ML" },     //短传
        { "Type": "RunRestriPosi", "AttackFromRole": "SC", "AttackToRole": "SC", "DefendFromRole": "DCR", "DefendToRole": "DCR" },//大禁区内跑位
        { "Type": "RunRestriPosi", "AttackFromRole": "AML", "AttackToRole": "AML", "DefendFromRole": "DR", "DefendToRole": "DR" },//大禁区内跑位
        { "Type": "LongPass", "AttackFromRole": "WBR", "AttackToRole": "AML", "DefendFromRole": "ML", "DefendToRole": "DR" },     //长传
        { "Type": "HeadShot", "AttackFromRole": "AML", "AttackToRole": "AML", "DefendFromRole": "DCR", "DefendToRole": "GK" },    //头球射门
      ],
      "AttackGood": ["4-0-2-3-1"],
      "AttackBad": [],
      "DefendGood": [],
      "DefendBad": [],
    },
  "Wide-R-1": 
    {
      "Name": "Wide-R-1",
      "Desc": "DL45度角长传，AMR冲刺头球射门",
      "BaseRate": 0,
      "ShotRole": "AMR",
      "CoexistRoles": [],
      "Rhythm": [2, 3, 4],
      "Procedure": [
        { "Type": "ShortPass", "AttackFromRole": "MCL", "AttackToRole": "WBL", "DefendFromRole": "AMC", "DefendToRole": "MR" },     //短传
        { "Type": "RunRestriPosi", "AttackFromRole": "SC", "AttackToRole": "SC", "DefendFromRole": "DCL", "DefendToRole": "DCL" },//大禁区内跑位
        { "Type": "RunRestriPosi", "AttackFromRole": "AMR", "AttackToRole": "AMR", "DefendFromRole": "DL", "DefendToRole": "DL" },//大禁区内跑位
        { "Type": "LongPass", "AttackFromRole": "WBL", "AttackToRole": "AMR", "DefendFromRole": "MR", "DefendToRole": "DL" },     //长传
        { "Type": "HeadShot", "AttackFromRole": "AMR", "AttackToRole": "AMR", "DefendFromRole": "DCL", "DefendToRole": "GK" },    //头球射门
      ],
      "AttackGood": ["4-0-2-3-1"],
      "AttackBad": [],
      "DefendGood": [],
      "DefendBad": [],
    },

  "Wide-L-2": 
    {
      "Name": "Wide-L-2",
      "Desc": "AMC传威胁球，AML插上射门",
      "BaseRate": 0.0,
      "ShotRole": "AML",
      "CoexistRoles": ["AMC"],
      "Rhythm": [1, 2, 3],
      "Procedure": [
        { "Type": "ShortPass", "AttackFromRole": "MCL", "AttackToRole": "MCR", "DefendFromRole": "MCR", "DefendToRole": "MCL" },     //短传
        { "Type": "ShortPass", "AttackFromRole": "MCR", "AttackToRole": "AMC", "DefendFromRole": "MCL", "DefendToRole": "DMC" },  //传空档
        { "Type": "RunRestriPosi", "AttackFromRole": "AML", "AttackToRole": "AML", "DefendFromRole": "DCR", "DefendToRole": "DCR" },//大禁区内跑位
        { "Type": "DirectPass", "AttackFromRole": "AMC", "AttackToRole": "AML", "DefendFromRole": "DMC", "DefendToRole": "DCR" }, //直传(冲刺跑)
        { "Type": "Shot", "AttackFromRole": "AML", "AttackToRole": "AML", "DefendFromRole": "DCR", "DefendToRole": "GK" },        //中短距离射门
      ],
      "AttackGood": ["4-0-2-3-1"],
      "AttackBad": [],
      "DefendGood": [],
      "DefendBad": [],
    },
  "Wide-R-2":
    {
      "Name": "Wide-R-2",
      "Desc": "AMC传威胁球，AMR插上射门",
      "BaseRate": 0.0,
      "ShotRole": "AMR",
      "CoexistRoles": ["AMC"],
      "Rhythm": [1, 2, 3],
      "Procedure": [
        { "Type": "ShortPass", "AttackFromRole": "MCR", "AttackToRole": "MCL", "DefendFromRole": "MCL", "DefendToRole": "MCR" },     //短传
        { "Type": "ShortPass", "AttackFromRole": "MCL", "AttackToRole": "AMC", "DefendFromRole": "MCR", "DefendToRole": "DMC" },  //传空档
        { "Type": "RunRestriPosi", "AttackFromRole": "AMR", "AttackToRole": "AMR", "DefendFromRole": "DCL", "DefendToRole": "DCL" },//大禁区内跑位
        { "Type": "DirectPass", "AttackFromRole": "AMC", "AttackToRole": "AMR", "DefendFromRole": "DMC", "DefendToRole": "DCL" }, //直传(冲刺跑)
        { "Type": "Shot", "AttackFromRole": "AMR", "AttackToRole": "AMR", "DefendFromRole": "DCL", "DefendToRole": "GK" },        //中短距离射门(自动选择合适脚
      ],
      "AttackGood": ["4-0-2-3-1"],
      "AttackBad": [],
      "DefendGood": [],
      "DefendBad": [],
    },

  //曼联系列
  "Wing-L-1":
    {
      "Name": "Wing-L-1",
      "Desc": "DL和AML侧翼联合突破后传中,SC射门",
      "BaseRate": 0.1,
      "ShotRole": "SC",
      "CoexistRoles": ["AML", "SC", "FC"],
      "Rhythm": [2, 3, 4],
      "Procedure": [
        { "Type": "ShortPass", "AttackFromRole": "MC", "AttackToRole": "DL", "DefendFromRole": "DMC", "DefendToRole": "MR", "IsMain": 0},
        { "Type": "NeutralPass", "AttackFromRole": "DL", "AttackToRole": "AML", "DefendFromRole": "MR", "DefendToRole": "DR" },
        { "Type": "CrossPass", "AttackFromRole": "AML", "AttackToRole": "SC", "DefendFromRole": "DR", "DefendToRole": "DCL" },
        { "Type": "RunRestriPosi", "AttackFromRole": "SC", "AttackToRole": "SC", "DefendFromRole": "DCL", "DefendToRole": "DCL" },
        { "Type": "HeadShot", "AttackFromRole": "SC", "AttackToRole": "SC", "DefendFromRole": "DCL", "DefendToRole": "GK" },
      ],
    },

  "Wing-R-1":
    {
      "Name": "Wing-R-1",
      "Desc": "DR和AMR侧翼联合突破后传中,SC射门",
      "BaseRate": 0.1,
      "ShotRole": "SC",
      "CoexistRoles": ["AMR", "SC", "FC"],
      "Rhythm": [2, 3, 4],
      "Procedure": [
        { "Type": "ShortPass", "AttackFromRole": "MC", "AttackToRole": "DR", "DefendFromRole": "DMC", "DefendToRole": "ML", "IsMain": 0 },
        { "Type": "NeutralPass", "AttackFromRole": "DR", "AttackToRole": "AMR", "DefendFromRole": "ML", "DefendToRole": "DL" },
        { "Type": "CrossPass", "AttackFromRole": "AMR", "AttackToRole": "SC", "DefendFromRole": "DL", "DefendToRole": "DCR" },
        { "Type": "RunRestriPosi", "AttackFromRole": "SC", "AttackToRole": "SC", "DefendFromRole": "DCR", "DefendToRole": "DCR" },
        { "Type": "HeadShot", "AttackFromRole": "SC", "AttackToRole": "SC", "DefendFromRole": "DCR", "DefendToRole": "GK" },
      ],
    },

  "Wing-L-2":
    {
      "Name": "Wing-L-2",
      "Desc": "DL和AML侧翼联合突破后传中,FC射门",
      "BaseRate": 0.1,
      "ShotRole": "FC",
      "CoexistRoles": ["AML", "SC", "FC"],
      "Rhythm": [2, 3, 4],
      "Procedure": [
        { "Type": "ShortPass", "AttackFromRole": "MC", "AttackToRole": "DL", "DefendFromRole": "DMC", "DefendToRole": "MR", "IsMain": 0 },
        { "Type": "NeutralPass", "AttackFromRole": "DL", "AttackToRole": "AML", "DefendFromRole": "MR", "DefendToRole": "DR" },
        { "Type": "CrossPass", "AttackFromRole": "AML", "AttackToRole": "SC", "DefendFromRole": "DR", "DefendToRole": "DCL" },
        { "Type": "RunRestriPosi", "AttackFromRole": "FC", "AttackToRole": "FC", "DefendFromRole": "DCL", "DefendToRole": "DCL" },
        { "Type": "HeadShot", "AttackFromRole": "FC", "AttackToRole": "FC", "DefendFromRole": "DCL", "DefendToRole": "GK" },
      ],
    },

  "Wing-R-2":
    {
      "Name": "Wing-R-2",
      "Desc": "DR和AMR侧翼联合突破后传中,FC射门",
      "BaseRate": 0.1,
      "ShotRole": "FC",
      "CoexistRoles": ["AMR", "SC", "FC"],
      "Rhythm": [2, 3, 4],
      "Procedure": [
        { "Type": "ShortPass", "AttackFromRole": "MC", "AttackToRole": "DR", "DefendFromRole": "DMC", "DefendToRole": "ML", "IsMain": 0 },
        { "Type": "NeutralPass", "AttackFromRole": "DR", "AttackToRole": "AMR", "DefendFromRole": "ML", "DefendToRole": "DL" },
        { "Type": "CrossPass", "AttackFromRole": "AMR", "AttackToRole": "SC", "DefendFromRole": "DL", "DefendToRole": "DCR" },
        { "Type": "RunRestriPosi", "AttackFromRole": "FC", "AttackToRole": "FC", "DefendFromRole": "DCR", "DefendToRole": "DCR" },
        { "Type": "HeadShot", "AttackFromRole": "FC", "AttackToRole": "FC", "DefendFromRole": "DCR", "DefendToRole": "GK" },
      ],
    },

  //传中系列
  "Cross-L-1":
    {
      "Name": "Cross-L-1",
      "Desc": "MCL分边给AML传中，SC抢点射门",
      "BaseRate": 0.1,
      "ShotRole": "SC",
      "CoexistRoles": ["SC", "FC", "AML"],
      "Rhythm": [3, 4],
      "Procedure": [
        { "Type": "DirectPass", "AttackFromRole": "MCL", "AttackToRole": "AML", "DefendFromRole": "MCR", "DefendToRole": "DR" },
        { "Type": "CrossPass", "AttackFromRole": "AML", "AttackToRole": "SC", "DefendFromRole": "DR", "DefendToRole": "DL" },
        { "Type": "RunRestriPosi", "AttackFromRole": "MCR", "AttackToRole": "MCR", "DefendFromRole": "DCL", "DefendToRole": "DCL" },
        { "Type": "RunRestriPosi", "AttackFromRole": "FC", "AttackToRole": "FC", "DefendFromRole": "DCR", "DefendToRole": "DCR" },
        { "Type": "HeadShot", "AttackFromRole": "SC", "AttackToRole": "SC", "DefendFromRole": "DL", "DefendToRole": "GK" },
      ],
      "AttackGood": ["4-0-4-0-2"],
      "AttackBad": [],
      "DefendGood": [],
      "DefendBad": [],
    },
  "Cross-L-2":
    {
      "Name": "Cross-L-2",
      "Desc": "MCL分边给AML传中，FC抢点射门",
      "BaseRate": 0.1,
      "ShotRole": "FC",
      "CoexistRoles": ["SC", "FC", "AML"],
      "Rhythm": [3, 4],
      "Procedure": [
        { "Type": "DirectPass", "AttackFromRole": "MCL", "AttackToRole": "AML", "DefendFromRole": "MCR", "DefendToRole": "DR" },
        { "Type": "CrossPass", "AttackFromRole": "AML", "AttackToRole": "FC", "DefendFromRole": "DR", "DefendToRole": "DL" },
        { "Type": "RunRestriPosi", "AttackFromRole": "MCR", "AttackToRole": "MCR", "DefendFromRole": "DCL", "DefendToRole": "DCL" },
        { "Type": "RunRestriPosi", "AttackFromRole": "SC", "AttackToRole": "SC", "DefendFromRole": "DCR", "DefendToRole": "DCR" },
        { "Type": "HeadShot", "AttackFromRole": "FC", "AttackToRole": "FC", "DefendFromRole": "DL", "DefendToRole": "GK" },
      ],
      "AttackGood": ["4-0-4-0-2"],
      "AttackBad": [],
      "DefendGood": [],
      "DefendBad": [],
    },
  "Cross-L-3":
    {
      "Name": "Cross-L-3",
      "Desc": "MCL分边给AML传中，MCR抢点射门",
      "BaseRate": 0.1,
      "ShotRole": "MCR",
      "CoexistRoles": ["SC", "FC", "MCR"],
      "Rhythm": [2, 3, 4],
      "Procedure": [
        { "Type": "DirectPass", "AttackFromRole": "MCL", "AttackToRole": "AML", "DefendFromRole": "MCR", "DefendToRole": "DR" },
        { "Type": "CrossPass", "AttackFromRole": "AML", "AttackToRole": "MCR", "DefendFromRole": "DR", "DefendToRole": "DMC" },
        { "Type": "RunRestriPosi", "AttackFromRole": "FC", "AttackToRole": "FC", "DefendFromRole": "DCR", "DefendToRole": "DCR" },
        { "Type": "RunRestriPosi", "AttackFromRole": "SC", "AttackToRole": "SC", "DefendFromRole": "DCL", "DefendToRole": "DCL" },
        { "Type": "HeadShot", "AttackFromRole": "MCR", "AttackToRole": "MCR", "DefendFromRole": "DMC", "DefendToRole": "GK" },
      ],
      "AttackGood": ["4-0-4-0-2"],
      "AttackBad": [],
      "DefendGood": [],
      "DefendBad": [],
    },
  "Cross-R-1":
    {
      "Name": "Cross-R-1",
      "Desc": "MCR分边给AMR传中，SC抢点射门",
      "BaseRate": 0.1,
      "ShotRole": "SC",
      "CoexistRoles": ["SC", "FC", "MCL"],
      "Rhythm": [3, 4],
      "Procedure": [
        { "Type": "DirectPass", "AttackFromRole": "MCR", "AttackToRole": "AMR", "DefendFromRole": "MCL", "DefendToRole": "DL" },
        { "Type": "CrossPass", "AttackFromRole": "AMR", "AttackToRole": "SC", "DefendFromRole": "DL", "DefendToRole": "DR" },
        { "Type": "RunRestriPosi", "AttackFromRole": "FC", "AttackToRole": "FC", "DefendFromRole": "DCL", "DefendToRole": "DCL" },
        { "Type": "RunRestriPosi", "AttackFromRole": "MCL", "AttackToRole": "MCL", "DefendFromRole": "DCR", "DefendToRole": "DCR" },
        { "Type": "HeadShot", "AttackFromRole": "SC", "AttackToRole": "SC", "DefendFromRole": "DR", "DefendToRole": "GK" },
      ],
      "AttackGood": ["4-0-4-0-2"],
      "AttackBad": [],
      "DefendGood": [],
      "DefendBad": [],
    },
  "Cross-R-2":
    {
      "Name": "Cross-R-2",
      "Desc": "MCR分边给AMR传中，FC抢点射门",
      "BaseRate": 0.1,
      "ShotRole": "FC",
      "CoexistRoles": ["SC", "FC", "MCL"],
      "Rhythm": [3, 4],
      "Procedure": [
        { "Type": "DirectPass", "AttackFromRole": "MCR", "AttackToRole": "AMR", "DefendFromRole": "MCL", "DefendToRole": "DL" },
        { "Type": "CrossPass", "AttackFromRole": "AMR", "AttackToRole": "FC", "DefendFromRole": "DL", "DefendToRole": "DR" },
        { "Type": "RunRestriPosi", "AttackFromRole": "SC", "AttackToRole": "SC", "DefendFromRole": "DCL", "DefendToRole": "DCL" },
        { "Type": "RunRestriPosi", "AttackFromRole": "MCL", "AttackToRole": "MCL", "DefendFromRole": "DCR", "DefendToRole": "DCR" },
        { "Type": "HeadShot", "AttackFromRole": "FC", "AttackToRole": "FC", "DefendFromRole": "DR", "DefendToRole": "GK" },
      ],
      "AttackGood": ["4-0-4-0-2"],
      "AttackBad": [],
      "DefendGood": [],
      "DefendBad": [],
    },
  "Cross-R-3":
    {
      "Name": "Cross-R-3",
      "Desc": "MCR分边给AMR传中，MCL抢点射门",
      "BaseRate": 0.1,
      "ShotRole": "MC",
      "CoexistRoles": ["SC", "FC", "MCL"],
      "Rhythm": [2, 3, 4],
      "Procedure": [
        { "Type": "DirectPass", "AttackFromRole": "MCR", "AttackToRole": "AMR", "DefendFromRole": "MCL", "DefendToRole": "DL" },
        { "Type": "CrossPass", "AttackFromRole": "AMR", "AttackToRole": "MCL", "DefendFromRole": "DL", "DefendToRole": "DR" },
        { "Type": "RunRestriPosi", "AttackFromRole": "FC", "AttackToRole": "FC", "DefendFromRole": "DCL", "DefendToRole": "DCL" },
        { "Type": "RunRestriPosi", "AttackFromRole": "SC", "AttackToRole": "SC", "DefendFromRole": "DCR", "DefendToRole": "DCR" },
        { "Type": "HeadShot", "AttackFromRole": "MCL", "AttackToRole": "MCL", "DefendFromRole": "DR", "DefendToRole": "GK" },
      ],
      "AttackGood": ["4-0-4-0-2"],
      "AttackBad": [],
      "DefendGood": [],
      "DefendBad": [],
    },

  //远射系列
  "Long-M-1":
    {
      "Name": "Long-M-1",
      "Desc": "压上禁区，MC中场远射",
      "BaseRate": 0,
      "ShotRole": "MC",
      "CoexistRoles": ["DMC", "MC", "AMC"],
      "Rhythm": [0, 1, 2, 3 ,4],
      "Procedure": [
        { "Type": "ShortPass", "AttackFromRole": "DMC", "AttackToRole": "AMC", "DefendFromRole": "AMC", "DefendToRole": "DMC" },
        { "Type": "ShortPass", "AttackFromRole": "AMC", "AttackToRole": "MC", "DefendFromRole": "DMC", "DefendToRole": "MC" },
        { "Type": "RunRestriPosi", "AttackFromRole": "AMC", "AttackToRole": "AMC", "DefendFromRole": "DMC", "DefendToRole": "DMC" },
        { "Type": "LongShot", "AttackFromRole": "MC", "AttackToRole": "MC", "DefendFromRole": "MC", "DefendToRole": "GK" },
      ],
      "AttackGood": [],
      "AttackBad": [],
      "DefendGood": [],
      "DefendBad": [],
    },
  "Long-M-2":
    {
      "Name": "Long-M-2",
      "Desc": "压上禁区，DMC中场远射",
      "BaseRate": 0,
      "ShotRole": "DMC",
      "CoexistRoles": ["DMC", "MC", "AMC"],
      "Rhythm": [0, 1, 2, 3, 4],
      "Procedure": [
        { "Type": "ShortPass", "AttackFromRole": "DMC", "AttackToRole": "AMC", "DefendFromRole": "AMC", "DefendToRole": "DMC" },
        { "Type": "ShortPass", "AttackFromRole": "AMC", "AttackToRole": "MC", "DefendFromRole": "DMC", "DefendToRole": "MC" },
        { "Type": "RunRestriPosi", "AttackFromRole": "AMC", "AttackToRole": "AMC", "DefendFromRole": "DMC", "DefendToRole": "DMC" },
        { "Type": "LongShot", "AttackFromRole": "DMC", "AttackToRole": "DMC", "DefendFromRole": "AMC", "DefendToRole": "GK" },
      ],
      "AttackGood": [],
      "AttackBad": [],
      "DefendGood": [],
      "DefendBad": [],
    },
  "Long-D-R":
    {
      "Name": "Long-D-R",
      "Desc": "压上禁区，DR中场远射",
      "BaseRate": 0,
      "ShotRole": "DR",
      "CoexistRoles": ["DR", "AMR", "AMC"],
      "Rhythm": [0, 1, 2, 3, 4],
      "Procedure": [
        { "Type": "ShortPass", "AttackFromRole": "MC", "AttackToRole": "AMR", "DefendFromRole": "MC", "DefendToRole": "DL" },
        { "Type": "ShortPass", "AttackFromRole": "AMR", "AttackToRole": "DR", "DefendFromRole": "DL", "DefendToRole": "AML" },
        { "Type": "RunRestriPosi", "AttackFromRole": "AMC", "AttackToRole": "AMC", "DefendFromRole": "DMC", "DefendToRole": "DMC" },
        { "Type": "RunRestriPosi", "AttackFromRole": "AMR", "AttackToRole": "AMR", "DefendFromRole": "DL", "DefendToRole": "DL" },
        { "Type": "LongShot", "AttackFromRole": "DR", "AttackToRole": "DR", "DefendFromRole": "AML", "DefendToRole": "GK" },
      ],
      "AttackGood": [],
      "AttackBad": [],
      "DefendGood": [],
      "DefendBad": [],
    },
  "Long-D-L":
    {
      "Name": "Long-D-L",
      "Desc": "压上禁区，DL中场远射",
      "BaseRate": 0,
      "ShotRole": "DL",
      "CoexistRoles": ["DL", "AML", "AMC"],
      "Rhythm": [0, 1, 2, 3, 4],
      "Procedure": [
        { "Type": "ShortPass", "AttackFromRole": "MC", "AttackToRole": "AML", "DefendFromRole": "MC", "DefendToRole": "DR" },
        { "Type": "ShortPass", "AttackFromRole": "AML", "AttackToRole": "DL", "DefendFromRole": "DR", "DefendToRole": "AMR" },
        { "Type": "RunRestriPosi", "AttackFromRole": "AMC", "AttackToRole": "AMC", "DefendFromRole": "DMC", "DefendToRole": "DMC" },
        { "Type": "RunRestriPosi", "AttackFromRole": "AML", "AttackToRole": "AML", "DefendFromRole": "DR", "DefendToRole": "DR" },
        { "Type": "LongShot", "AttackFromRole": "DL", "AttackToRole": "DL", "DefendFromRole": "AMR", "DefendToRole": "GK" },
      ],
      "AttackGood": [],
      "AttackBad": [],
      "DefendGood": [],
      "DefendBad": [],
    },

  //过人系列
  "Dribble-L-1":
    {
      "Name": "Dribble-L-1",
      "Desc": "AML过掉后卫后，直接射门",
      "BaseRate": 0,
      "ShotRole": "AML",
      "CoexistRoles": [],
      "Rhythm": [0, 1, 2, 3, 4],
      "Procedure": [
        { "Type": "ShortPass", "AttackFromRole": "DMC", "AttackToRole": "AML", "DefendFromRole": "AMC", "DefendToRole": "DR" },
        { "Type": "DribbleOver", "AttackFromRole": "AML", "AttackToRole": "AML", "DefendFromRole": "DR", "DefendToRole": "DR" },
        { "Type": "RunRestriPosi", "AttackFromRole": "SC", "AttackToRole": "SC", "DefendFromRole": "DCL", "DefendToRole": "DCL" },
        { "Type": "DribbleForShot", "AttackFromRole": "AML", "AttackToRole": "AML", "DefendFromRole": "DCR", "DefendToRole": "DCR" }, 
        { "Type": "RightShot", "AttackFromRole": "AML", "AttackToRole": "AML", "DefendFromRole": "DCR", "DefendToRole": "GK" },
      ],
      "AttackGood": [],
      "AttackBad": [],
      "DefendGood": [],
      "DefendBad": [],
    },
  "Dribble-R-1":
    {
      "Name": "Dribble-R-1",
      "Desc": "AMR过掉后卫后，直接射门",
      "BaseRate": 0,
      "ShotRole": "AMR",
      "CoexistRoles": [],
      "Rhythm": [0, 1, 2, 3, 4],
      "Procedure": [
        { "Type": "ShortPass", "AttackFromRole": "DMC", "AttackToRole": "AMR", "DefendFromRole": "AMC", "DefendToRole": "DL" },
        { "Type": "DribbleOver", "AttackFromRole": "AMR", "AttackToRole": "AMR", "DefendFromRole": "DL", "DefendToRole": "DL" },
        { "Type": "RunRestriPosi", "AttackFromRole": "SC", "AttackToRole": "SC", "DefendFromRole": "DCR", "DefendToRole": "DCR" },
        { "Type": "DribbleForShot", "AttackFromRole": "AMR", "AttackToRole": "AMR", "DefendFromRole": "DCL", "DefendToRole": "DCL" },
        { "Type": "LeftShot", "AttackFromRole": "AMR", "AttackToRole": "AMR", "DefendFromRole": "DCL", "DefendToRole": "GK" },
      ],
      "AttackGood": [],
      "AttackBad": [],
      "DefendGood": [],
      "DefendBad": [],
    },
  "Dribble-L-2":
    {
      "Name": "Dribble-L-2",
      "Desc": "AML过掉后卫后，传给AMR射门",
      "BaseRate": 0,
      "ShotRole": "AMR",
      "CoexistRoles": [],
      "Rhythm": [0, 1, 2, 3, 4],
      "Procedure": [
        { "Type": "ShortPass", "AttackFromRole": "DMC", "AttackToRole": "AML", "DefendFromRole": "AMC", "DefendToRole": "DR" },
        { "Type": "DribbleOver", "AttackFromRole": "AML", "AttackToRole": "AML", "DefendFromRole": "DR", "DefendToRole": "DR" },
        { "Type": "RunRestriPosi", "AttackFromRole": "SC", "AttackToRole": "SC", "DefendFromRole": "DCR", "DefendToRole": "DCR" },
        { "Type": "ShortPass", "AttackFromRole": "AML", "AttackToRole": "AMR", "DefendFromRole": "DCL", "DefendToRole": "DCL" },
        { "Type": "Shot", "AttackFromRole": "AMR", "AttackToRole": "AMR", "DefendFromRole": "DCL", "DefendToRole": "GK" },
      ],
      "AttackGood": [],
      "AttackBad": [],
      "DefendGood": [],
      "DefendBad": [],
    },
  "Dribble-R-2":
    {
      "Name": "Dribble-R-2",
      "Desc": "AMR过掉后卫后，传给AML射门",
      "BaseRate": 0,
      "ShotRole": "AML",
      "CoexistRoles": [],
      "Rhythm": [0, 1, 2, 3, 4],
      "Procedure": [
        { "Type": "ShortPass", "AttackFromRole": "DMC", "AttackToRole": "AMR", "DefendFromRole": "AMC", "DefendToRole": "DL" },
        { "Type": "DribbleOver", "AttackFromRole": "AMR", "AttackToRole": "AMR", "DefendFromRole": "DL", "DefendToRole": "DL" },
        { "Type": "RunRestriPosi", "AttackFromRole": "SC", "AttackToRole": "SC", "DefendFromRole": "DCL", "DefendToRole": "DCL" },
        { "Type": "ShortPass", "AttackFromRole": "AMR", "AttackToRole": "AML", "DefendFromRole": "DCR", "DefendToRole": "DCR" },
        { "Type": "Shot", "AttackFromRole": "AML", "AttackToRole": "AML", "DefendFromRole": "DCR", "DefendToRole": "GK" },
      ],
      "AttackGood": [],
      "AttackBad": [],
      "DefendGood": [],
      "DefendBad": [],
    },
}


