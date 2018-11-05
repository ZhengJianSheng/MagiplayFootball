import Pool from './base/pool'
import DataBus from 'databus'

var mCfgClub = require('../data/DataClub')
var Util = require('../utils/util.js')

let databus = new DataBus();

let instance
/**
 * 全局状态管理器
 */
export default class GlobalData {
  constructor() {
    if ( instance )
      return instance

    instance = this

    //this.pool = new Pool()

    this.Reset()
  }

  GetEnum()
  {
    return instance.dEnum;
  }

  InitEnum()
  {
    //console.log("GlobalData.js, InitEnum");

    let dEnum = {};
    dEnum.emProcResut_Succeed = 0;  //成功
    dEnum.emProcResut_Fail1 = 1;  //第一步失败并丢掉球权
    dEnum.emProcResut_Fail2 = 2;  //第一步失败但没丢掉球权
    dEnum.emProcResut_Fail3 = 3;  //第二步失败并丢掉球权
    dEnum.emProcResut_Fail4 = 4;  //第二步失败但没丢掉球权

    dEnum.ppName = "Name";  //名字
    dEnum.ppAcceleration = "Acceleration";  //加速
    dEnum.ppSpeed = "Speed";         //速度
    dEnum.ppAgility = "Agility";       //灵活
    dEnum.ppStrong = "Strong";  //强壮
    dEnum.ppTeamwork = "Teamwork";  //团队
    dEnum.ppBrave = "Brave";  //勇敢
    dEnum.ppAggression = "Aggression";  //侵略
    dEnum.ppEndurance = "Endurance";  //耐力
    dEnum.ppWill = "Will";  //意志
    dEnum.ppWorkRate = "WorkRate";  //工作投入

    dEnum.emRhythm_VerySlow = 0;  //非常慢
    dEnum.emRhythm_Slow = 1;      //慢
    dEnum.emRhythm_Nommal = 2;    //均衡
    dEnum.emRhythm_Fast = 3;      //快
    dEnum.emRhythm_VeryFast = 4;  //非常快

    dEnum.emShortPass = "ShortPass";
    dEnum.emDirectPass = "DirectPass";
    dEnum.emNeutralPass = "NeutralPass";
    dEnum.emLongPass = "LongPass";
    dEnum.emCrossPass = "CrossPass";
    dEnum.emRunRestriPosi = "RunRestriPosi";
    dEnum.emDribbleOver = "DribbleOver";
    dEnum.emDribbleForShot = "DribbleForShot";
    dEnum.emLeftShot = "LeftShot";
    dEnum.emRightShot = "RightShot";
    dEnum.emShot = "Shot";
    dEnum.emLongShot = "LongShot";
    dEnum.emHeadShot = "HeadShot";

    //查看比赛信息类型
    dEnum.emMatchInfo_None = -1;  //不是在比赛界面
    dEnum.emMatchInfo_0 = 0;  //阵型
    dEnum.emMatchInfo_1 = 1;  //状况
    dEnum.emMatchInfo_2 = 2;  //进球
    dEnum.emMatchInfo_3 = 3;  //对手

    //解说类型
    dEnum.emCommentaryType_Goal = 1;      //进球
    dEnum.emCommentaryType_Highlight = 2; //亮点
    dEnum.emCommentaryType_Assist = 3;    //助教
    dEnum.emCommentaryType_System = 4;    //系统

    //上传状态
    dEnum.emFieldStatus_InField = 0;    //在场上
    dEnum.emFieldStatus_Substitute = 1; //在替补席上
    dEnum.emFieldStatus_OutField = 2;   //被换下

    dEnum.iMaxReplacedCount = 3;  //最大换人数目

    //位置合适程度
    dEnum.emPositionFit_1 = 1;  //完全对应
    dEnum.emPositionFit_2 = 2;  //可以兼顾

    //排序升降
    dEnum.emSort_Down = 1;  //降序
    dEnum.emSort_Up = 2;  //升序

    //小于多少体力会提示换人和AI自动换人
    dEnum.fSubstitutePower = 0.78
    //dEnum.fSubstitutePower = 1;

    return dEnum;
  }

  Reset()
  {
    //console.log("GlobalData.js, Reset");

    this.dEnum = this.InitEnum();
    //console.log("GlobalData.js, Reset, this.dEnum = ");
    //console.log(this.dEnum);
    let dBase = databus.dBase;

    this.Club = {};
    for (let strClubName in mCfgClub)
    {
      this.Club[strClubName] = {};
      let data = this.Club[strClubName];
      data.dBase = databus.MakeBaseData_Opponent(strClubName, dBase.strTeamName);
      data.dFormation = databus.MakeFormationData_Opponent(strClubName);
      data.dTactics = databus.MakeTacticsData_Opponent(strClubName);
      data.dTactics.mOpponentDefendMap[dBase.strTeamName] = databus.InitDefendData();
      data.dTeam = databus.MakeTeamData_Opponent(strClubName);
    }

    this.iSelectTeamType = 0; //主界面的功能，1：选择队伍；2：选择对手
    this.bInitMatchData = false;   //是否已初始化match数据
    this.bInMatch = false;   //是否正在比赛
    this.aMatchingDataArray = new Array(2);  //比赛进行时的数据  //InitMatchingData
    this.iHoldBallIndex = 0;  //哪边队伍正在持球
    this.strHoldBallName = ""; //持球球员的名字
    this.iOpponentMarked = false; //显示对方盯防情况下数据
    this.strLostBallName = ""; //丢球球员的名字
    this.bHasChangeTactics = false; //是否有修改了战术

    this.dMatchData = {};
    
    this.aCommentaryArray = [];
    this.iMinute = 0;    //时间，分钟
    this.iSecond = 0;  //时间，秒

    this.bTestRate = false;

    console.log("GlobalData.js, Reset, this.Club = ", this.Club);
  }

  ResetBase() {
    console.log("GlobalData.js, ResetBase");
    let dBase = databus.dBase;

    for (let strClubName in mCfgClub) {
      this.Club[strClubName].dBase = databus.MakeBaseData_Opponent(strClubName, dBase.strTeamName);
    }
  }

  GetBaseData(strClubName) {
    if (this.Club[strClubName] == null)
      return null;

    return this.Club[strClubName].dBase;
  }

  GetFormationData(strClubName)
  {
    //console.log("GlobalData.js, GetFormationData, strClubName = " + strClubName + " dFormation = ");

    if (this.Club[strClubName] == null)
      return null;

    //console.log(this.Club[strClubName].dFormation);

    //console.log("GlobalData.js, GetFormationData, strClubName = " + strClubName + " dFormation = ", this.Club[strClubName].dFormation);

    return this.Club[strClubName].dFormation;
  }

  GetTacticsData(strClubName) {
    if (this.Club[strClubName] == null)
      return null;

    return this.Club[strClubName].dTactics;
  }

  GetTeamData(strClubName) {
    if (this.Club[strClubName] == null)
      return null;

    return this.Club[strClubName].dTeam;
  }

  SelectOpponent(strOpponentName) 
  {
    //console.log("selectteam.js, SelectOpponent, strOpponentName = " + strOpponentName);
    let dBase = databus.dBase;

    let bChangeOpponent = false;
    if (dBase.strOpponentName != strOpponentName)
      bChangeOpponent = true;

    dBase.strOpponentName = strOpponentName;

    if (bChangeOpponent == true)
    {
      databus.ResetTacticsDefendData(strOpponentName);
    }
    
    //let dTactics = databus.dTactics;
    //if (dTactics.mOpponentDefendMap[strOpponentName] == null) {
    //  dTactics.mOpponentDefendMap[strOpponentName] = databus.InitDefendData();
    //}

    let dOpponentBase = this.GetBaseData(strOpponentName);
    dOpponentBase.strOpponentName = dBase.strTeamName;

    let dOpponentTactics = this.GetTacticsData(strOpponentName);
    dOpponentTactics.mOpponentDefendMap = {}
    dOpponentTactics.mOpponentDefendMap[dBase.strTeamName] = databus.InitDefendData(dBase.strTeamName);

    //console.log("GlobalData.js, SelectOpponent, dOpponentTactics = ", dOpponentTactics);

    databus.SaveData();
  }

  UpdateMatchingData() {
    //console.log("ConfirmChangeTactics, aMatchingDataArray = ");
    //console.log(aMatchingDataArray);
    let dMatchingData = this.aMatchingDataArray[0];

    let iLeftRoutineCount = dMatchingData.aAttackRoutineArray.length;

    dMatchingData.dFormation = databus.dFormation;
    dMatchingData.dTactics = databus.dTactics;

    dMatchingData.aAttackRoutineArray = [];
    for (let strRoutineName in dMatchingData.dTactics.mRoutineCountMap) {
      let iCount = dMatchingData.dTactics.mRoutineCountMap[strRoutineName];
      if (iCount > 0) {
        for (let i = 0; i < iCount; i++) {
          dMatchingData.aAttackRoutineArray.push(strRoutineName);
          if (dMatchingData.aAttackRoutineArray.length >= iLeftRoutineCount) {
            break;
          }
        }
      }
    }

    this.bHasChangeTactics = false;
    //console.log("UpdateMatchingData, dMatchingData.aAttackRoutineArray = ", dMatchingData.aAttackRoutineArray);
  }

  UpdateFieldStatus(dMatchingData) 
  {
    let dFormation = dMatchingData.dFormation;
    let aFootmanPerform = dMatchingData.aFootmanPerform;
    let aPointArray = dFormation.aFormationArray[dFormation.iSelFormIndex];

    for (let i = 0; i < aFootmanPerform.length; i++) {
      aFootmanPerform[i].iFieldStatus = this.dEnum.emFieldStatus_Substitute;
      for (let j = 0; j < aPointArray.length; j++) {
        if (aPointArray[j].strName == aFootmanPerform[i].strName) {
          aFootmanPerform[i].iFieldStatus = this.dEnum.emFieldStatus_InField;
          break;
        }
      }
    }

    //console.log("GlobalData.js, UpdateFieldStatus, 1 aFootmanPerform = ", Util.DeepCopy(aFootmanPerform));

    this.SortFootmanPerform(aFootmanPerform, "iFieldStatus");

    //console.log("GlobalData.js, UpdateFieldStatus, 2 aFootmanPerform = ", Util.DeepCopy(aFootmanPerform));
  }

  SortFootmanPerform(aFootmanPerform, strSelfSortKey) 
  {
    //console.log("GlobalData.js, SortFootmanPerform, strSelfSortKey = ", strSelfSortKey);

    //let aNewArray = Util.DeepCopy(aFootmanPerform);
    //Util.SortArray(aNewArray, "iFieldStatus", "int", 2)
    //return aNewArray;

    let strDataType = "";
    let iUppper = 1;
    if (strSelfSortKey == "iFieldStatus") {
      strDataType = "int";
      iUppper = 2;
    }
    else if (strSelfSortKey == "strName") {
      strDataType = "str";
      iUppper = 2;
    }
    else if (strSelfSortKey == "iPassSucceed") {
      strDataType = "int";
      iUppper = 1;
    }
    else if (strSelfSortKey == "iAssist") {
      strDataType = "int";
      iUppper = 1;
    }
    else if (strSelfSortKey == "iShot") {
      strDataType = "int";
      iUppper = 1;
    }
    else if (strSelfSortKey == "iGoal") {
      strDataType = "int";
      iUppper = 1;
    }
    else if (strSelfSortKey == "iTackling") {
      strDataType = "int";
      iUppper = 1;
    }
    else if (strSelfSortKey == "strPhysicalPower") {
      strDataType = "int";
      iUppper = 2;
    }

    Util.SortArray(aFootmanPerform, strSelfSortKey, strDataType, iUppper)
    return aFootmanPerform;
  }

  MatchFinish()
  {
    this.bInMatch = false;
    databus.RecoverData();
    this.Reset();
    //this.data.bIsInit = false;
    this.bInitMatchData = false;
  }

  UpdateMarkingStatus(dMatchingDataA, dMatchingDataB) 
  {
    let dBase = dMatchingDataA.dBase;
    let dFormation = dMatchingDataA.dFormation;
    let dTactics = dMatchingDataA.dTactics;
    let dOpponentBase = dMatchingDataB.dBase;
    let dOpponentFormation = dMatchingDataB.dFormation;
    let dOpponentTactics = dMatchingDataB.dTactics;

    let aPointArray = dFormation.aFormationArray[dFormation.iSelFormIndex];

    let dOpponentDefendData = dOpponentTactics.mOpponentDefendMap[dBase.strTeamName];
    //console.log("match.js, UpdateMarkingStatus, dOpponentDefendData.mMarkingFootmanMap = ", dOpponentDefendData.mMarkingFootmanMap);

    for (let i = 0; i < aPointArray.length; i++) {
      if (dOpponentDefendData.mMarkingFootmanMap[aPointArray[i].strName] != null &&
        dOpponentDefendData.mMarkingFootmanMap[aPointArray[i].strName] > 0) {
        aPointArray[i].iMarkingStatus = 1;
        //console.log("match.js, UpdateMarkingStatus, iMarkingStatus = 1, strName = " + aPointArray[i].strName );
      }
      else {
        aPointArray[i].iMarkingStatus = 0;
        //console.log("match.js, UpdateMarkingStatus, iMarkingStatus = 0, strName = " + aPointArray[i].strName);
      }
    }
  }
}
