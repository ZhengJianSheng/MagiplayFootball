module.exports={
  "ShortPass": 
    {
      "Chinese": "短传",
      "BaseSucceedRate": 1.0, //短传成功率太低了，效果不好，改成1.0
      "Logic":
        {
          "Attack":
            {
              "MarkingFootman": 1,
              "Rhythm": 1,
              "MarkingRoutine": 1,
              "RoutineBase":1,
              "PowerReduce":1,
              "PosFit":1,
              "PosWidth":1,
              "DefendDepth":1,
            },
          "Defend":
            {
              "LinkDefend": 0,
              "BraveAggres":1,
              "PowerReduce":1,
              "PosFit":1,
              "PosWidth":1,
              "DefendDepth":1,
            },
        }
    },
  "DirectPass":
    {
      "Chinese": "直传",
      "BaseSucceedRate": 1.1, //0
      "Logic":
        {
          "Attack":
            {
              "MarkingFootman": 1,
              "Rhythm": 1,
              "MarkingRoutine": 1,
              "RoutineBase": 1,
              "PowerReduce": 1,
              "PosFit": 1,
              "PosWidth": 1,
              "DefendDepth": 1,
            },
          "Defend":
            {
              "LinkDefend": 1,
              "BraveAggres": 1,
              "PowerReduce": 1,
              "PosFit": 1,
              "PosWidth": 1,
              "DefendDepth": 1,
            },
        }
    },
  "NeutralPass":
    {
      "Chinese": "传空档",
      "BaseSucceedRate": 1.0, //0
      "Logic":
        {
          "Attack":
            {
              "MarkingFootman": 1,
              "Rhythm": 1,
              "MarkingRoutine": 1,
              "RoutineBase": 1,
              "PowerReduce": 1,
              "PosFit": 1,
              "PosWidth": 1,
              "DefendDepth": 1,
            },
          "Defend":
            {
              "LinkDefend": 1,
              "BraveAggres": 1,
              "PowerReduce": 1,
              "PosFit": 1,
              "PosWidth": 1,
              "DefendDepth": 1,
            },
        }
    },
  "LongPass":
    {
      "Chinese": "长传",
      "BaseSucceedRate": 1.0, //0
      "Logic":
        {
          "Attack":
            {
              "MarkingFootman": 1,
              "Rhythm": 1,
              "MarkingRoutine": 1,
              "RoutineBase": 1,
              "PowerReduce": 1,
              "PosFit": 1,
              "PosWidth": 1,
              "DefendDepth": 1,
            },
          "Defend":
            {
              "LinkDefend": 1,
              "BraveAggres": 1,
              "PowerReduce": 1,
              "PosFit": 1,
              "PosWidth": 1,
              "DefendDepth": 1,
            },
        }
    },
  "CrossPass":
    {
      "Chinese": "传中",
      "BaseSucceedRate": 1.1, //0
      "Logic":
        {
          "Attack":
            {
              "MarkingFootman": 1,
              "Rhythm": 1,
              "MarkingRoutine": 1,
              "RoutineBase": 1,
              "PowerReduce": 1,
              "PosFit": 1,
              "PosWidth": 1,
              "DefendDepth": 1,
            },
          "Defend":
            {
              "LinkDefend": 1,
              "BraveAggres": 1,
              "PowerReduce": 1,
              "PosFit": 1,
              "PosWidth": 1,
              "DefendDepth": 1,
            },
        }
    },
  "RunRestriPosi":
    {
      "Chinese": "跑位",
      "BaseSucceedRate": 1.4, //0.3
      "Logic":
        {
          "Attack":
            {
              "MarkingFootman": 1,
              "Rhythm": 1,
              "MarkingRoutine": 1,
              "RoutineBase": 1,
              "PowerReduce": 1,
              "PosFit": 1,
              "PosWidth": 1,
              "DefendDepth": 1,
            },
          "Defend":
            {
              "LinkDefend": 1,
              "BraveAggres": 0,
              "PowerReduce": 1,
              "PosFit": 1,
              "PosWidth": 1,
              "DefendDepth": 1,
            },
        }
    },
  "DribbleOver":
    {
      "Chinese": "过人",
      "BaseSucceedRate": 1.0, //0
      "Logic":
        {
          "Attack":
            {
              "MarkingFootman": 1,
              "Rhythm": 1,
              "MarkingRoutine": 1,
              "RoutineBase": 1,
              "PowerReduce": 1,
              "PosFit": 1,
              "PosWidth": 1,
              "DefendDepth": 1,
            },
          "Defend":
            {
              "LinkDefend": 1,
              "BraveAggres": 1,
              "PowerReduce": 1,
              "PosFit": 1,
              "PosWidth": 1,
              "DefendDepth": 1,
            },
        }
    },
  "DribbleForShot":
    {
      "Chinese": "拉扯空档",
      "BaseSucceedRate": 0.8, //0
      "Logic":
        {
          "Attack":
            {
              "MarkingFootman": 1,
              "Rhythm": 1,
              "MarkingRoutine": 1,
              "RoutineBase": 1,
              "PowerReduce": 1,
              "PosFit": 1,
              "PosWidth": 1,
              "DefendDepth": 1,
            },
          "Defend":
            {
              "LinkDefend": 1,
              "BraveAggres": 1,
              "PowerReduce": 1,
              "PosFit": 1,
              "PosWidth": 1,
              "DefendDepth": 1,
            },
        }
    },
  "LeftShot":
    {
      "Chinese": "左脚弧线射门",
      "BaseSucceedRate": 1.0, //0
      "Logic":
        {
          "Attack":
            {
              "MarkingFootman": 1,
              "Rhythm": 1,
              "MarkingRoutine": 1,
              "RoutineBase": 1,
              "PowerReduce": 1,
              "PosFit": 1,
              "PosWidth": 1,
              "DefendDepth": 1,
            },
          "Defend":
            {
              "LinkDefend": 1,
              "BraveAggres": 1,
              "PowerReduce": 1,
              "PosFit": 1,
              "PosWidth": 1,
              "DefendDepth": 1,
            },
        }
    },
  "RightShot":
    {
      "Chinese": "右脚弧线射门",
      "BaseSucceedRate": 1.0, //0
      "Logic":
        {
          "Attack":
            {
              "MarkingFootman": 1,
              "Rhythm": 1,
              "MarkingRoutine": 1,
              "RoutineBase": 1,
              "PowerReduce": 1,
              "PosFit": 1,
              "PosWidth": 1,
              "DefendDepth": 1,
            },
          "Defend":
            {
              "LinkDefend": 1,
              "BraveAggres": 1,
              "PowerReduce": 1,
              "PosFit": 1,
              "PosWidth": 1,
              "DefendDepth": 1,
            },
        }
    },
  "Shot":
    {
      "Chinese": "常规射门",
      "BaseSucceedRate": 1.0, //0
      "Logic":
        {
          "Attack":
            {
              "MarkingFootman": 1,
              "Rhythm": 1,
              "MarkingRoutine": 1,
              "RoutineBase": 1,
              "PowerReduce": 1,
              "PosFit": 1,
              "PosWidth": 1,
              "DefendDepth": 1,
            },
          "Defend":
            {
              "LinkDefend": 1,
              "BraveAggres": 1,
              "PowerReduce": 1,
              "PosFit": 1,
              "PosWidth": 1,
              "DefendDepth": 1,
            },
        }
    },
  "HeadShot":
    {
      "Chinese": "头球射门",
      "BaseSucceedRate": 1.2, //0
      "Logic":
        {
          "Attack":
            {
              "MarkingFootman": 1,
              "Rhythm": 1,
              "MarkingRoutine": 1,
              "RoutineBase": 1,
              "PowerReduce": 1,
              "PosFit": 1,
              "PosWidth": 1,
              "DefendDepth": 1,
            },
          "Defend":
            {
              "LinkDefend": 1,
              "BraveAggres": 1,
              "PowerReduce": 1,
              "PosFit": 1,
              "PosWidth": 1,
              "DefendDepth": 1,
            },
        }
    },
  "LongShot":
    {
      "Chinese": "远射",
      "BaseSucceedRate": 0.2, //0
      "Logic":
        {
          "Attack":
            {
              "MarkingFootman": 1,
              "Rhythm": 1,
              "MarkingRoutine": 1,
              "RoutineBase": 1,
              "PowerReduce": 1,
              "PosFit": 1,
              "PosWidth": 1,
              "DefendDepth": 1,
            },
          "Defend":
            {
              "LinkDefend": 1,
              "BraveAggres": 1,
              "PowerReduce": 1,
              "PosFit": 1,
              "PosWidth": 1,
              "DefendDepth": 1,
            },
        }
    },
}

