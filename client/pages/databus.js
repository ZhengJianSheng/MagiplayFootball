import Pool from './base/pool'

var mCfgFootman = require('../data/DataFootman')
var mCfgFormation = require('../data/DataFormation')
var mCfgTactics = require('../data/DataTactics')
var mCfgClub = require('../data/DataClub')
var mCfgAttackRoutine = require('../data/DataAttackRoutine')
var mCfgProcedure = require('../data/DataProcedure')


let iDefaultFormIndex = 0;     //默认选择的阵型
let iDefaultMentalIndex = 2; //默认的心态编号
let iDefaultRhythmIndex = 2; //默认的节奏编号
let iDefaultPosWidthIndex = 1;  //默认的站位宽度
let iDefaultDefendDepthIndex = 1; //默认的防线宽度

/**
 * 全局状态管理器
 */
let instance
export default class DataBus {
  constructor() {
    if ( instance )
      return instance

    instance = this

    this.pool = new Pool()

    this.Reset("")
  }

  DeepCopy(source) 
  {
    var sourceCopy = source instanceof Array ? [] : {};
    for (var item in source) 
    {
      sourceCopy[item] = typeof source[item] === 'object' ? instance.DeepCopy(source[item]) : source[item];
    }
    return sourceCopy;
  }

  Reset(strTeamName) 
  {
    this.ResetBase(strTeamName);
    this.ResetFormation(strTeamName);
    this.ResetTeam(strTeamName);
    this.ResetTactics();
  }

  //--------------------------------------------------------------------------------------------
  ResetBase(strTeamName)
  {
    this.dBase = {};
    let data = this.dBase;
    data.strTeamName = strTeamName;
    data.strOpponentName = ""; 
  }

  MakeBaseData_Opponent(strClubName, strOpponentName) {
    let dBase = {};
    dBase.strTeamName = strClubName;
    dBase.strOpponentName = strOpponentName; 
    return dBase;
  }

  //--------------------------------------------------------------------------------------------
  ResetFormation(strClubName) 
  {
    //console.log("databus.js, ResetFormation, strClubName = " + strClubName);

    if (strClubName == "")
      return;
    this.dFormation = {};
    this.dFormationBackup = {}
    let data = this.dFormation;
    let dCfgClub = mCfgClub[strClubName];
   
    data.iSelFormIndex = iDefaultFormIndex; //选择的阵型编号

    data.aFormationArray = [];
    data.aFormNameArray = [];
    let iFormationCount = 3;
    data.aFormationArray = new Array(iFormationCount);
    data.aFormNameArray = new Array(iFormationCount);
    this.InitOneFormation(strClubName, 0, dCfgClub.strFormation0);
    this.InitOneFormation(strClubName, 1, dCfgClub.strFormation1);
    this.InitOneFormation(strClubName, 2, dCfgClub.strFormation2);
    
    /*
    data.aFormationArray[0] = [];
    data.aFormationArray[0] = this.DeepCopy(mCfgFormation[dCfgClub.strFormation0].aPointArray);
    data.aFormationArray[1] = this.DeepCopy(mCfgFormation[dCfgClub.strFormation1].aPointArray);
    data.aFormationArray[2] = this.DeepCopy(mCfgFormation[dCfgClub.strFormation2].aPointArray);

    for (let j=0; j<3; j++)
    {
      let aPointArray = data.aFormationArray[j];
      for (let strPos in dCfgClub.Formation.FootmanList) {
        let strFootmanName = dCfgClub.Formation.FootmanList[strPos];
        let ID = mCfgFootman[strFootmanName].ID;
        let strNumber = mCfgFootman[strFootmanName].LikeNumber;
        for (let i = 0; i < aPointArray.length; i++) {
          if (aPointArray[i].strPos == strPos || aPointArray[i].strPos2 == strPos) {
            aPointArray[i] = this.InitOnePoint(aPointArray[i].x, aPointArray[i].y, ID, strNumber, strFootmanName, aPointArray[i].strDesc, aPointArray[i].strPos, aPointArray[i].strPos2, 0);
            break;
          }
        }
      }
    }
    */
  }

  InitOneFormation(strClubName, iFormIndex, strFormationName) {

    //console.log("databus.js, InitOneFormation, strClubName = " + strClubName + " iFormIndex = " + iFormIndex + " strFormationName = " + strFormationName);

    let data = this.dFormation;
    if (iFormIndex >= data.aFormationArray.length)
    {
      console.error("databus.js, InitOneFormation, iFormIndex >= data.aFormationArray.length");
      return;
    }
    if (mCfgFormation[strFormationName] == null) {
      console.error("databus.js, InitOneFormation, mCfgFormation[strFormationName] == null, strFormationName = " + strFormationName);
      return;
    }

    let dCfgClub = mCfgClub[strClubName];
    data.aFormationArray[iFormIndex] = this.DeepCopy(mCfgFormation[strFormationName].aPointArray);
    data.aFormNameArray[iFormIndex] = strFormationName;
    /*
    let aPointArray = data.aFormationArray[iFormIndex];
    for (let strPos in dCfgClub.Formation.FootmanList) {
      let strFootmanName = dCfgClub.Formation.FootmanList[strPos];
      let ID = mCfgFootman[strFootmanName].ID;
      let strNumber = mCfgFootman[strFootmanName].LikeNumber;
      for (let i = 0; i < aPointArray.length; i++) {
        if (aPointArray[i].strPos == strPos || aPointArray[i].strPos2 == strPos) {
          aPointArray[i] = this.InitOnePoint(aPointArray[i].x, aPointArray[i].y, ID, strNumber, strFootmanName, aPointArray[i].strDesc, aPointArray[i].strPos, aPointArray[i].strPos2, 0);
          break;
        }
      }
    }
    */

  }

  MakeFormationData_Opponent(strClubName) {

    let dFormation = {};
    if (mCfgClub[strClubName] == null)
      return null;

    let dCfgClub = mCfgClub[strClubName];

    dFormation.iSelFormIndex = 0; //选择的阵型编号
    dFormation.aFormationArray = [];
    dFormation.aFormationArray[0] = [];
    let bNeedShowMarking = false;
    dFormation.aFormationArray[0] = this.MakePointArray_Opponent(strClubName, bNeedShowMarking);
    dFormation.aFormNameArray = [];
    dFormation.aFormNameArray[0] = mCfgClub[strClubName].Formation.Name;;
    return dFormation;

  }

  InitOnePoint(x, y, ID, strNumber, strName, strDesc, strPos, strPos2, iMarkingStatus)
  {
    let dPoint = {};
    dPoint.x = x;
    dPoint.y = y;
    dPoint.ID = ID;
    dPoint.strNumber = strNumber;
    dPoint.iSelStatus = 0;
    dPoint.strName = strName;
    dPoint.strDesc = strDesc;
    dPoint.strPos = strPos;
    dPoint.strPos2 = strPos2;
    dPoint.iMarkingStatus = iMarkingStatus;
    return dPoint;
  }
  
  MakePointArray_Opponent(strClubName, bNeedShowMarking = false) 
  {

    //console.log("formation.js, MakePointArray_Opponent, strClubName = " + strClubName);

    if (mCfgClub[strClubName] == null)
      return null;

    let strFormationName = mCfgClub[strClubName].Formation.Name;
    if (mCfgFormation[strFormationName] == null)
      return null;

    let aFootmanList = mCfgClub[strClubName].Formation.FootmanList;
    let aTemplateArray = mCfgFormation[strFormationName].aPointArray;
    let aResultPointArray = [];

    for (let i = 0; i < aTemplateArray.length; i++) {
      //console.log("formation.js, MakePointArray_FromCfg, aTemplateArray[i] = ");
      //console.log(aTemplateArray[i]);
      let cell =
        {
          x: aTemplateArray[i].x,
          y: aTemplateArray[i].y,

          strNumber: "",
          iMarkingStatus: 0,
          strDesc: aTemplateArray[i].strDesc,
          strPos: aTemplateArray[i].strPos,
          strPos2: aTemplateArray[i].strPos2,
        }

      for (let strPos in aFootmanList) {
        //console.log("formation.js, MakePointArray_FromCfg, strPos = " + strPos + " cell.strPos = " + cell.strPos);
        if (strPos == cell.strPos || strPos == cell.strPos2) 
        {
          //console.log("formation.js, MakePointArray_FromCfg, strPos == cell.strPos, strPos = " + strPos);
          let strFootmanName = aFootmanList[strPos];
          cell.ID = mCfgFootman[strFootmanName].ID;
          cell.strName = strFootmanName;
          cell.strNumber = mCfgFootman[strFootmanName].LikeNumber;
          //console.log(mCfgFootman[strFootmanName]);
          //console.log(cell.strNumberm);
          break;
        }
      }

      
      if (bNeedShowMarking == true)
      {
        let dBase = this.dBase;
        let dTactics = this.dTactics;
        //console.log("formation.js, MakePointArray_Opponent, 3, dDefnedData = ", dTactics.mOpponentDefendMap[dBase.strOpponentName]);
        let dDefnedData = dTactics.mOpponentDefendMap[dBase.strOpponentName];
        if (dDefnedData.mMarkingFootmanMap[cell.strName] != null) {
          cell.iMarkingStatus = 1;
        }
      }
      
      aResultPointArray.push(this.InitOnePoint(cell.x, cell.y, cell.ID, cell.strNumber, cell.strName, cell.strDesc, cell.strPos, cell.strPos2,               cell.iMarkingStatus));
    }

    //console.log("aResultPointArray = ");
    //console.log(aResultPointArray);

    return aResultPointArray;
  }

  IsFormationSettingOK(dFormation)
  {
    if (dFormation == null)
    {
      console.error("databus.js, IsFormationSettingOK, dFormation == null");
      return false;
    }
    let aPointArray = dFormation.aFormationArray[dFormation.iSelFormIndex];
    //console.log(aPointArray);
    for (let i = 0; i < aPointArray.length; i++)
    {
      if (aPointArray[i].strName == "")
      {
        //console.log("databus.js, IsFormationSettingOK, return false");
        return false;
      }
    }
    //console.log("databus.js, IsFormationSettingOK, return true");
    return true;
  }
  
  //--------------------------------------------------------------------------------------------
  ResetTeam(strTeamName)
  {
    //console.log("databus.js, ResetTeam");
    this.dTeam = {}
    let dTeam = this.dTeam;
    dTeam.aFootmanArray = [];

    this.FillFootmanToTeam(dTeam.aFootmanArray, strTeamName);
  }

  FillFootmanToTeam(aFootmanArray, strTeamName) 
  {
    let iFootmanCount = 0;
    //for (var i = 0, len = mCfgFootman.length; i < len; i++) {
    for (var strName in mCfgFootman) {
      //console.log("mCfgFootman[strName] = " + JSON.stringify(mCfgFootman[i]));
      if (mCfgFootman[strName]["TeamName"] == strTeamName) {
        //暂时，后面要调用正式的球员初始化函数
        aFootmanArray[iFootmanCount] =
          {
            //ID: Number(mCfgFootman[strName]["ID"]), //为什么要转成数字？这会导致两边数据不一致
            ID: mCfgFootman[strName]["ID"],
            Name: mCfgFootman[strName]["Name"],
            LikeNumber: mCfgFootman[strName]["LikeNumber"],
            TeamName: mCfgFootman[strName]["TeamName"],
            PositionA: mCfgFootman[strName]["PositionA"],
            PositionB: mCfgFootman[strName]["PositionB"],
            PositionC: mCfgFootman[strName]["PositionC"],
          };

        iFootmanCount++;
      }
    }
    //console.log("team.js, FillFootmanToTeam, aFootmanArray = ");
    //console.log(aFootmanArray);
  }

  MakeTeamData_Opponent(strClubName) {
    let dTeam = {};
    if (mCfgClub[strClubName] == null)
      return null;

    let dCfgClub = mCfgClub[strClubName];
    dTeam.aFootmanArray = [];

    let iFootmanCount = 0;
    for (var strName in mCfgFootman) {
      if (mCfgFootman[strName]["TeamName"] == strClubName) {
        dTeam.aFootmanArray[iFootmanCount] =
        {
          //ID: Number(mCfgFootman[strName]["ID"]), //为什么要转成数字？这会导致两边数据不一致
          ID: mCfgFootman[strName]["ID"],
          Name: strName,
          LikeNumber: mCfgFootman[strName]["LikeNumber"],
          TeamName: mCfgFootman[strName]["TeamName"],
          PositionA: mCfgFootman[strName]["PositionA"],
          PositionB: mCfgFootman[strName]["PositionB"],
          PositionC: mCfgFootman[strName]["PositionC"],
        };

        iFootmanCount++;
      }
    }

    //console.log("databus.js, MakeTeamData_Opponent, dTactics.dTeam = ");
    //console.log(dTeam);

    return dTeam;
  }

  //--------------------------------------------------------------------------------------------
  ResetTactics()
  {
    //console.log("databus.js, ResetTactics");
    this.dTactics = {}
    this.dTacticsBackup = {}
    let dTactics = this.dTactics;
    dTactics.iMentalIndex = iDefaultMentalIndex;
    dTactics.iRhythmIndex = iDefaultRhythmIndex;
    dTactics.iPosWidthIndex = iDefaultPosWidthIndex;
    dTactics.iDefendDepthIndex = iDefaultDefendDepthIndex;
    
    dTactics.iLeftAttackPoint = mCfgTactics.MentalPoint[dTactics.iMentalIndex].Attack;
    dTactics.iLeftDefendPoint = mCfgTactics.MentalPoint[dTactics.iMentalIndex].Defend;
    dTactics.mRoutineCountMap = {};   //key:RoutineName(对应DataAttackRoutine.js的key); value:Count;  
    dTactics.mOpponentDefendMap = {}; //key:strClubName; value: DefendData
    //示例：
    //dTactics.mOpponentDefendMap[strOpponentName] = this.InitDefendData();
  }

  InitDefendData(strOpponentName) {
    let data =
      {
        strOpponentName: strOpponentName,
        mMarkingFootmanMap: {},   //key:球员名字; value:盯防点数
        mMarkingRoutineMap: {},   //key:套路名字; value:盯防点数
      };

    return data;
  }

  //重置防守数据，在切换对手时需要
  ResetTacticsDefendData(strOpponentName) {
    let dTactics = this.dTactics;
    dTactics.iLeftDefendPoint = mCfgTactics.MentalPoint[dTactics.iMentalIndex].Defend;
    dTactics.mOpponentDefendMap[strOpponentName] = this.InitDefendData();

    //console.log("databus.js, ResetTacticsDefendData, mOpponentDefendMap = ", dTactics.mOpponentDefendMap);
  }

  MakeTacticsData_Opponent(strClubName)
  {
    let dTactics = {};
    if (mCfgClub[strClubName] == null)
      return null;

    let dCfgClub = mCfgClub[strClubName];

    dTactics.iMentalIndex = dCfgClub.iMentalIndex;
    dTactics.iRhythmIndex = dCfgClub.iRhythmIndex;
    dTactics.iPosWidthIndex = dCfgClub.iPosWidthIndex;
    dTactics.iDefendDepthIndex = dCfgClub.iDefendDepthIndex;
    dTactics.iLeftAttackPoint = mCfgTactics.MentalPoint[dTactics.iMentalIndex].Attack;
    dTactics.iLeftDefendPoint = mCfgTactics.MentalPoint[dTactics.iMentalIndex].Defend;
    dTactics.mRoutineCountMap = {};
    dTactics.mOpponentDefendMap = {};

    for (let strRoutineName in dCfgClub.TacticsAttack) {
      dTactics.mRoutineCountMap[strRoutineName] = dCfgClub.TacticsAttack[strRoutineName];
    }

    //console.log("databus.js, MakeTacticsData_Opponent, dTactics.mRoutineCountMap = ");
    //console.log(dTactics.mRoutineCountMap);

    return dTactics;
  }

  //==========================================================================================
  //比赛前备份好原先的战术和阵型数据
  BackupData()
  {
    this.dFormationBackup = this.DeepCopy(this.dFormation);
    this.dTacticsBackup = this.DeepCopy(this.dTactics);
  }

  RecoverData()
  {
    this.dFormation = this.DeepCopy(this.dFormationBackup);
    this.dTactics = this.DeepCopy(this.dTacticsBackup);
  }

  MatchingBackupData() {
    console.log("databus.js, MatchingBackupData");
    this.dMatchingBackup_Formation = this.DeepCopy(this.dFormation);
    this.dMatchingBackup_Tactics = this.DeepCopy(this.dTactics);
  }

  MatchingRecoverData() {
    console.log("databus.js, MatchingRecoverData");
    this.dFormation = this.DeepCopy(this.dMatchingBackup_Formation);
    this.dTactics = this.DeepCopy(this.dMatchingBackup_Tactics);
  }

  //==========================================================================================
  SaveData()
  {
    //console.log("databus.js, SaveData, this.dFormation = ");
    //console.log(JSON.stringify(instance.dFormation));

    this.BackupData();

    wx.setStorage({
      key: "Base",
      data: JSON.stringify(instance.dBase),
      success: function (res) {
        //console.log("databus.js, SaveData, Save Base data success");
      },
      fail: function (res) {
        console.log("databus.js, SaveData, Save Base data fail");
      },
      complete: function (res) {
        //console.log("databus.js, SaveData, Save Base data complete");
      },
    });
    wx.setStorage({
      key: "Formation",
      data: JSON.stringify(instance.dFormation),
      success: function (res) {
        //console.log("databus.js, SaveData, Save Formation data success");
      },
      fail: function (res) {
        console.log("databus.js, SaveData, Save Formation data fail");
      },
      complete: function (res) {
        //console.log("databus.js, SaveData, Save Formation data complete");
      },
    });
    wx.setStorage({
      key: "Team",
      data: JSON.stringify(instance.dTeam),
      success: function (res) {
        //console.log("databus.js, SaveData, Save Team data success");
      },
      fail: function (res) {
        console.log("databus.js, SaveData, Save Team data fail");
      },
      complete: function (res) {
        //console.log("databus.js, SaveData, Save Team data complete");
      },
    });
    wx.setStorage({
      key: "Tactics",
      data: JSON.stringify(instance.dTactics),
      success: function (res) {
        //console.log("databus.js, SaveData, Save Tactics data success");
      },
      fail: function (res) {
        console.log("databus.js, SaveData, Save Tactics data fail");
      },
      complete: function (res) {
        //console.log("databus.js, SaveData, Save Tactics data complete");
      },
    });
    
  }

  LoadData()
  {
    //console.log("databus.js, LoadData");

    try {
      var value = wx.getStorageSync('Base')
      //console.log("databus.js, LoadData, value = ");
      //console.log(value);
      if (value) {
        instance.dBase = instance.DeepCopy(JSON.parse(value));
        //console.log("databus.js, LoadData, Load Base data succeed");
        //console.log(JSON.parse(value));
      }
    } catch (e) {
      console.log("databus.js, LoadData, Load Base data fail, e=");
      console.log(e);
    }
    try {
      var value = wx.getStorageSync('Formation')
      if (value) {
        instance.dFormation = instance.DeepCopy(JSON.parse(value));
       // console.log("databus.js, LoadData, Load Formation data succeed");
      }
    } catch (e) {
      console.log("databus.js, LoadData, Load Formation data fail, e=");
      console.log(e);
    }
    try {
      var value = wx.getStorageSync('Team')
      if (value) {
        instance.dTeam = instance.DeepCopy(JSON.parse(value));
        //console.log("databus.js, LoadData, Load Team data succeed");
      }
    } catch (e) {
      console.log("databus.js, LoadData, Load Team data fail, e=");
      console.log(e);
    }
    try {
      var value = wx.getStorageSync('Tactics')
      if (value) {
        instance.dTactics = instance.DeepCopy(JSON.parse(value));
        //console.log("databus.js, LoadData, Load Tactics data succeed");
      }
    } catch (e) {
      console.log("databus.js, LoadData, Load Tactics data fail, e=");
      console.log(e);
    }
  }
  
  //============================================================================================================
  //比赛过程中的数据
  InitMatchingData(strTeamName, dBase, dFormation, dTactics, dTeam) 
  {
    let data =
      {
        strTeamName: strTeamName,
        strChinese: mCfgClub[strTeamName].Chinese,
        iScore: 0,
        dBase: dBase,
        dFormation: dFormation,
        dTactics: dTactics,
        dTeam: dTeam,
        aAttackRoutineArray: [], //里面存放DataAttackRoutinue.js里的键值
        aFootmanPerform: [],  //球员的表现数据
        mTeamPerform: {},  //球队的表现数据
        aFootmanReplacedArray: [],  //被换下的球员
        //aOpponentGoalRoutineArray: [],  //对手进球的套路
      }

    data.aFootmanPerform = this.InitFootmanPerformData(dTeam);
    data.mTeamPerform = this.InitTeamPerformData();

    return data;
  }

  InitFootmanPerformData(dTeam) 
  {
    let aFootmanPerform = [];

    let aFootmanArray = dTeam.aFootmanArray;
    for (let i = 0; i < aFootmanArray.length; i++) {
      aFootmanPerform[i] = {}
      let dOne = aFootmanPerform[i];
      dOne.strName = aFootmanArray[i].Name;
      dOne.iGoal = 0;
      dOne.iAssist = 0;
      dOne.iShot = 0;
      dOne.iShotOnTarget = 0;
      dOne.fScore = 0;
      dOne.iPassSucceed = 0;
      dOne.iPassFail = 0;
      dOne.iPassTotal = 0;
      dOne.iTackling = 0;
      dOne.fPhysicalPower = 1.0;
      dOne.strPhysicalPower = "100%";
      dOne.iYellowCard = 0;
      dOne.iFieldStatus = 0;  //上场状态
    }

    return aFootmanPerform;
  }

  InitTeamPerformData() {
    let mTeamPerform = {};
    mTeamPerform.iGoal = 0;
    mTeamPerform.iShot = 0;
    mTeamPerform.iShotOnTarget = 0;
    mTeamPerform.fScore = 0;
    mTeamPerform.iPassSucceed = 0;
    mTeamPerform.iPassFail = 0;
    mTeamPerform.iPassTotal = 0;
    mTeamPerform.strPassPercent = 0.0;
    mTeamPerform.iControl = 1;  //控球指数(初始值为1避免除0错误)
    mTeamPerform.fControlPercent = "0%";  //控球率
    mTeamPerform.iTackling = 0;

    //动作统计
    mTeamPerform.aProcedureArray = [];
    for (let strProcedureName in mCfgProcedure)
    {
      let dCfgOneProc = mCfgProcedure[strProcedureName];

      mTeamPerform.aProcedureArray.push(
        {
          strProcedureName: strProcedureName,
          strChinese: dCfgOneProc.Chinese,
          iTotalCount: 0,
          iSucceedCount: 0,
          strSucceedRate: "0%",
          mFootmanData:{
            //Key: FootmanName; Value: TotalCount
          }
        }
      );
    }

    //套路统计
    mTeamPerform.aRoutineArray = [];
    for (let strRoutineName in mCfgAttackRoutine) {
      let dCfgOneRoutine = mCfgAttackRoutine[strRoutineName];

      mTeamPerform.aRoutineArray.push(
        {
          strRoutineName: strRoutineName,
          iTotalCount: 0,
          iSucceedCount: 0,
          fTotalProgramValue:0.0,
          strAverageProgram: "0%",
        }
      );
    }
    return mTeamPerform;
  }
}
