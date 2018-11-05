module.exports={
  "MentalPoint": [
    { "Attack": 2, "Defend": 8}, //全力防守
    { "Attack": 3, "Defend": 6 }, //防守
    { "Attack": 4, "Defend": 5 }, //均衡
    { "Attack": 5, "Defend": 4 }, //进攻
    { "Attack": 7, "Defend": 3 }, //全力进攻
  ],

  "RhythmPoint": [
    { "PowerConsume": 4, "ConsumeDesc": "少" }, //非常慢
    { "PowerConsume": 5, "ConsumeDesc": "较少" }, //较慢
    { "PowerConsume": 6, "ConsumeDesc": "一般" }, //均衡
    { "PowerConsume": 7, "ConsumeDesc": "较多" }, //较快
    { "PowerConsume": 8, "ConsumeDesc": "多" }, //非常快
  ],

  //计算链式防守带来的进攻分数减成
  "LinkDefend":[
    { "TotalTeamwork": 60, "Rate": 0.0 },
    { "TotalTeamwork": 70, "Rate": 0.04 },
    { "TotalTeamwork": 80, "Rate": 0.08 },
    { "TotalTeamwork": 90, "Rate": 0.12 },
    { "TotalTeamwork": 100, "Rate": 0.16 },
    { "TotalTeamwork": 110, "Rate": 0.20 },
    { "TotalTeamwork": 120, "Rate": 0.24 },
    { "TotalTeamwork": 1000, "Rate": 0.28 },  //防呆设置
  ],

  //计算比赛节奏带来的分数加成
  //慢节奏和快节奏
  "RhythmRate1":[
    { "Diff": -50, "Rate": -0.10 },
    { "Diff": -40, "Rate": -0.08 },
    { "Diff": -30, "Rate": -0.06 },
    { "Diff": -20, "Rate": -0.04 },
    { "Diff": -10, "Rate": -0.02 },
    { "Diff": 0, "Rate": 0.0 },
    { "Diff": 10, "Rate": 0.02 },
    { "Diff": 20, "Rate": 0.04 },
    { "Diff": 30, "Rate": 0.06 },
    { "Diff": 40, "Rate": 0.08 },
    { "Diff": 50, "Rate": 0.10 },
    { "Diff": 1000, "Rate": 0.12 },  //防呆设置
  ],
   //极慢节奏和极快节奏.(极慢节奏和极快节奏效果是一样的)
  "RhythmRate2": [    
    { "Diff": -50, "Rate": -0.10 },
    { "Diff": -40, "Rate": -0.08 },
    { "Diff": -30, "Rate": -0.06 },
    { "Diff": -20, "Rate": -0.04 },
    { "Diff": -10, "Rate": -0.02 },
    { "Diff": 0, "Rate": 0.0 },
    { "Diff": 10, "Rate": 0.03 },
    { "Diff": 20, "Rate": 0.06 },
    { "Diff": 30, "Rate": 0.09 },
    { "Diff": 40, "Rate": 0.12 },
    { "Diff": 50, "Rate": 0.15 },
    { "Diff": 1000, "Rate": 0.18 },  //防呆设置
  ],
  
  //计算球员侵略勇敢差值给防守球员带来的分数加成
  "BraveAggressionRate":[
    { "Diff": 0, "Rate": 0 },
    { "Diff": 2, "Rate": 0.02 },
    { "Diff": 4, "Rate": 0.04 },
    { "Diff": 6, "Rate": 0.06 },
    { "Diff": 8, "Rate": 0.08 },
    { "Diff": 10, "Rate": 0.10 },
    { "Diff": 1000, "Rate": 0.12 },//防呆设置
  ],
  
  //计算战术套路的多步带来的加成
  "StepsRate": [
    { "ProcedureIndex": 3, "Rate": 0 },       //0
    { "ProcedureIndex": 4, "Rate": 0 },    //0.05
    { "ProcedureIndex": 5, "Rate": 0 },    //0.10
    { "ProcedureIndex": 6, "Rate": 0 },    //0.15
    { "ProcedureIndex": 1000, "Rate": 0 },//防呆设置 //0.20
  ],

  //计算体力下降带来的减成
  "PowerReduce": [
    { "iAbility": 10, "Rate": 0 },
    { "ProcedureIndex": 4, "Rate": 0.05 },
    { "ProcedureIndex": 5, "Rate": 0.10 },
    { "ProcedureIndex": 6, "Rate": 0.15 },
    { "ProcedureIndex": 1000, "Rate": 0.20 },//防呆设置
  ],
  
  "PosWidth" : [
    //收缩
    { 
      "Attack": //对进攻的影响
        {
          "Increase": { "ShortPass": 0.1, "NeutralPass": 0.1, },  //有利方面
          "IncreaseShowDesc": "短传、传空档",

          "Reduce": { "LongPass": 0.1, "DirectPass": 0.1, "CrossPass": 0.1, },    //不利方面
          "ReduceShowDesc": "长传、直传、传中",
        },
      "Defend": //对防守的影响
        {
          "Increase": { "ShortPass": 0.1, "NeutralPass": 0.1, "RunRestriPosi": 0.1, "DribbleForShot": 0.1, "DribbleOver": 0.1, }, //有利方面
          "IncreaseShowDesc": "短传、传空档、跑位、拉扯空档、过人",

          "Reduce": { "LongPass": 0.1, "DirectPass": 0.1, "CrossPass": 0.1 }, //不利方面
          "ReduceShowDesc": "长传、直传、传中",
        }
    },
    //均衡
    {
      "Attack":
        {
          "Increase": {},
          "IncreaseShowDesc": "无",

          "Reduce": {},
          "ReduceShowDesc": "无",
        },
      "Defend":
        {
          "Increase": {},
          "IncreaseShowDesc": "无",

          "Reduce": {},
          "ReduceShowDesc": "无",
        }
    },
    //拉开
    {
      "Attack": //对进攻的影响
        {
          "Increase": { "LongPass": 0.1, "DirectPass": 0.1, "CrossPass": 0.1, }, //有利方面
          "IncreaseShowDesc": "长传、直传、传中",

          "Reduce": { "ShortPass": 0.1, "NeutralPass": 0.1, }, //不利方面
          "ReduceShowDesc": "短传、传空档",
        },
      "Defend": //对防守的影响
        {
          "Increase": { "LongPass": 0.1, "DirectPass": 0.1, "CrossPass": 0.1, },  //有利方面
          "IncreaseShowDesc": "长传、直传、传中",

          "Reduce": { "ShortPass": 0.1, "NeutralPass": 0.1, "RunRestriPosi": 0.1, "DribbleForShot": 0.1, "DribbleOver": 0.1, }, //不利方面
          "ReduceShowDesc": "短传、传空档、跑位、拉扯空档、过人",
        }
    },
  ],

  "DefendDepth": [
    //收缩
    {
      "Attack": 
        {
          "Increase": { "LongPass": 0.1, "DirectPass": 0.1, "CrossPass": 0.1,},
          "IncreaseShowDesc": "长传、直传、传中",

          "Reduce": { "ShortPass": 0.1,},
          "ReduceShowDesc": "短传",
        },
      "Defend":
        {
          "Increase": { "ShortPass": 0.1, "DirectPass": 0.1, "NeutralPass": 0.1, "LongPass": 0.1, "CrossPass": 0.1, "RunRestriPosi": 0.1, "DribbleOver": 0.1, "Shot": 0.1, },
          "IncreaseShowDesc": "所有传球、跑位、过人、抢点射门",

          "Reduce": { "LeftShot": 0.1, "RightShot": 0.1, "LongShot": 0.15,},
          "ReduceShowDesc": "内切射门，远射",
        }
    },
    //均衡
    {
      "Attack":
        {
          "Increase": {  },
          "IncreaseShowDesc": "无",

          "Reduce": {},
          "ReduceShowDesc": "无",
        },
      "Defend":
        {
          "Increase": {},
          "IncreaseShowDesc": "无",

          "Reduce": {},
          "ReduceShowDesc": "无",
        }
    },
    //前压
    {
      "Attack": 
        {
          "Increase": { "ShortPass": 0.1, "NeutralPass": 0.1, "RunRestriPosi": 0.1, "DribbleForShot": 0.1, "LeftShot": 0.1, "RightShot": 0.1, "Shot": 0.1, "LongShot": 0.1,},
          "IncreaseShowDesc": "短传、传空档、跑位、拉扯空档、射门",

          "Reduce": {},
          "ReduceShowDesc": "无",
        },
      "Defend": 
        {
          "Increase": { "ShortPass": 0.1,},
          "IncreaseShowDesc": "短传",

          "Reduce": { "LongPass": 0.1, "DirectPass": 0.1, "CrossPass": 0.1,},
          "ReduceShowDesc": "长传、直传、传中",
        },
    },
  ],
}

/*
"ShortPass"
"DirectPass"
"NeutralPass"
"LongPass"
"CrossPass"
"RunRestriPosi"
"DribbleOver"
"DribbleForShot"
"LeftShot"
"RightShot"
"Shot"
"HeadShot"
"LongShot"
*/