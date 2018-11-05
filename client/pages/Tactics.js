
import DataBus from 'databus'
import GlobalData from 'GlobalData'
let databus = new DataBus();

var Procedure = require('Procedure')
var mCfgFootman = require('../data/DataFootman')
var mCfgAttackRoutine = require('../data/DataAttackRoutine')

let dGlobalData = new GlobalData();
let dEnum = dGlobalData.GetEnum();

//var mCfgProcedure = require('../data/DataProcedure')

module.exports = {
  GetValidRoutineCount: GetValidRoutineCount,
  GetRoutineSucceedRate: GetRoutineSucceedRate,
  GetValidRoutineMap: GetValidRoutineMap,
  GetFootmanNameFromPos: GetFootmanNameFromPos,
  GetPositionFit: GetPositionFit,
  IsAttackRoutineValid: IsAttackRoutineValid,
  CalcuLinkDefendRate: CalcuLinkDefendRate,
  CalcuRhythmRate: CalcuRhythmRate,
  GetMarkingFootmanMap: GetMarkingFootmanMap,
  MakeExtRateEffect: MakeExtRateEffect,
}




//========================================================================
//获取进攻套路的成功率
function GetRoutineSucceedRate(dTactics, dFormation, strRoutineName, dOpponentBase, dOpponentTactics, dOpponentFormation, bConsiderMarking)
{
  //console.log("Tactics.js, GetRoutineSucceedRate, dOpponentTactics = ");
  //console.log(dOpponentTactics);
  //console.log("Tactics.js, GetRoutineSucceedRate, dOpponentFormation = ", dOpponentFormation);

  let fRate = 0.0;
  if (mCfgAttackRoutine[strRoutineName] == null)
  {
    console.error("mCfgAttackRoutine[strRoutineName] == null, strRoutineName = " + strRoutineName);
    return fRate;
  }
    
  let dConfigRoutine = mCfgAttackRoutine[strRoutineName];
  if (IsAttackRoutineValid(dConfigRoutine, dTactics, dFormation) == false)
  {
    return fRate;
  }

  //console.log("Tactics.js, GetRoutineSucceedRate, dOpponentTactics = ", dOpponentTactics);

  //额外加成减成效果
  let dAttackData = null;
  let dDefendData = null;
  let dFitData = null;
  if (dGlobalData.bInMatch == true)
  {
    if (dOpponentBase.strTeamName == dGlobalData.aMatchingDataArray[1].strTeamName)
    {
      dAttackData = dGlobalData.aMatchingDataArray[0];
      dDefendData = dGlobalData.aMatchingDataArray[1];
    }
    else 
    {
      dAttackData = dGlobalData.aMatchingDataArray[1];
      dDefendData = dGlobalData.aMatchingDataArray[0];
    }
  }

  let oExtRateEffect = MakeExtRateEffect(dTactics, dFormation, dOpponentBase, dOpponentTactics, dOpponentFormation, strRoutineName, dAttackData, dDefendData, dFitData, bConsiderMarking);

  //console.log("Tactics.js, GetRoutineSucceedRate, oExtRateEffect.mMarkingFootmanMap = ");
  //console.log(oExtRateEffect.mMarkingFootmanMap);

  let aProcedureArray = dConfigRoutine["Procedure"];
  fRate = 1.0
  for (let i = 0; i < aProcedureArray.length; i++)
  {
    let dOneProcedure = aProcedureArray[i];
    let strPos1 = dOneProcedure["AttackFromRole"];
    let strPos2 = dOneProcedure["AttackToRole"];
    let strPos3 = dOneProcedure["DefendFromRole"];
    let strPos4 = dOneProcedure["DefendToRole"];
    //console.log("Tactics.js, GetRoutineSucceedRate, strPos1 = " + strPos1 + ", strPos2 = " + strPos2 + ", strPos3 = " + strPos3 + ", strPos4 = " + strPos4);
    let strFootmanName_1 = GetFootmanNameFromPos(dFormation, strPos1);
    let strFootmanName_2 = GetFootmanNameFromPos(dFormation, strPos2);
    let strFootmanName_3 = GetFootmanNameFromPos(dOpponentFormation, strPos3);
    let strFootmanName_4 = GetFootmanNameFromPos(dOpponentFormation, strPos4);

    if (strFootmanName_1 == "" || strFootmanName_2 == "")
    {
      console.error("Tactics.js, GetRoutineSucceedRate, FootmanName1 2 == null");
      return 0.0;
    }
    let oFootman1 = mCfgFootman[strFootmanName_1];
    let oFootman2 = mCfgFootman[strFootmanName_2];
    let oFootman3 = mCfgFootman[strFootmanName_3];
    let oFootman4 = mCfgFootman[strFootmanName_4];
    
    let dFitData = {}
    dFitData.emFit1 = GetPositionFit(dFormation, strPos1);
    dFitData.emFit2 = GetPositionFit(dFormation, strPos2);
    dFitData.emFit3 = GetPositionFit(dOpponentFormation, strPos3);
    dFitData.emFit4 = GetPositionFit(dOpponentFormation, strPos4);

    oExtRateEffect.dFitData = dFitData; //为提高运行效率，所以这么处理
    
    let iCurProcedureIndex = i;
    let fRate_ = Procedure.GetProcedureRate(dOneProcedure["Type"], iCurProcedureIndex, oFootman1, oFootman2, oFootman3, oFootman4, oExtRateEffect);
    if (fRate_ == "NaN") 
    {
      console.error("Tactics.js, GetRoutineSucceedRate, fRate == NaN, strRoutineName = " + strRoutineName + ", i = " + i);
    }

    //console.log("Tactics.js, GetRoutineSucceedRate, fRate = " + fRate + " fRate_ = " + fRate_);

    fRate = fRate * fRate_;
  }

  fRate = parseFloat(fRate.toFixed(4));

  if (dGlobalData.bTestRate == true)
    console.log("Tactics.js, GetRoutineSucceedRate, strRoutineName = " + strRoutineName + " fRate = " + fRate);

  return fRate;
}

function MakeExtRateEffect(dTactics, dFormation, dOpponentBase, dOpponentTactics, dOpponentFormation, strRoutineName, dAttackMatchData, dDefendMatchData, dFitData, bConsiderMarking)
{
  //let dTactics = dAttackData.dTactics;
  //let dFormation = dAttackData.dFormation;
  //let dOpponentTactics = dDefendData.dTactics;
  //let dOpponentFormation = dDefendData.dFormation;

  //console.log("Tactics.js, MakeExtRateEffect, dOpponentTactics = ", dOpponentTactics);

  //额外加成减成效果
  let oExtRateEffect = {};
  //链式防守加成效果
  oExtRateEffect.fLinkDefendRate = CalcuLinkDefendRate(dOpponentTactics, dOpponentFormation);
  //比赛节奏加成效果
  oExtRateEffect.fRhythmRate = CalcuRhythmRate(dTactics, dFormation, dOpponentTactics, dOpponentFormation);
  //重点防御套路效果
  oExtRateEffect.fMarkingRoutineRate = Procedure.CalcuMarkingRoutineRate(strRoutineName, dOpponentTactics, dOpponentBase);
  //重点盯防对象
  oExtRateEffect.mMarkingFootmanMap = GetMarkingFootmanMap(dOpponentBase, dOpponentTactics);
  //套路基础加成效果
  oExtRateEffect.fRoutineBaseRate = mCfgAttackRoutine[strRoutineName]["BaseRate"];
  //站位宽度
  oExtRateEffect.iPosWidthIndex = dTactics.iPosWidthIndex;
  oExtRateEffect.iOpponentPosWidthIndex = dOpponentTactics.iPosWidthIndex;
  //防守深度
  oExtRateEffect.iDefendDepthIndex = dTactics.iDefendDepthIndex;
  oExtRateEffect.iOpponentDefendDepthIndex = dOpponentTactics.iDefendDepthIndex;

  oExtRateEffect.dAttackMatchData = dAttackMatchData;
  oExtRateEffect.dDefendMatchData = dDefendMatchData;

  oExtRateEffect.dFitData = dFitData;

  oExtRateEffect.bConsiderMarking = bConsiderMarking;
  //if (dAttackMatchData != null)
  //  oExtRateEffect.fPowerReduceAttackRate = Procedure.CalcuPowerReduceAttackRate(AttackFromRole, fPowerRate1, AttackToRole, fPowerRate2);
  //CalcuPowerReduceAttackRate

  return oExtRateEffect;
}



//从位置处获得球员名字
function GetFootmanNameFromPos(dFormation, strPos)
{
  //console.log("Tactics.js, GetFootmanNameFromPos, dFormation = ", dFormation);

  
  let strName = "";
  let aPointArray = dFormation.aFormationArray[dFormation.iSelFormIndex];
  for (let i = 0; i < aPointArray.length; i++)
  {
    if (aPointArray[i].strPos == strPos)
    {
      //console.log(aPointArray[i].strPos);
      strName = aPointArray[i].strName;
      break;
    }
  }

  if (strName == "") 
  {
    for (let i = 0; i < aPointArray.length; i++) {
      if (aPointArray[i].strPos2 == strPos) {
        //console.log(aPointArray[i].strPos);
        strName = aPointArray[i].strName;
        break;
      }
    }
  }

  if (strName == "")
  {
    console.error("GetFootmanNameFromPos == null, strPos = " + strPos);
  }

  //console.log("Tactics.js, GetFootmanNameFromPos, strPos = " + strPos + " strName = " + strName);
  
  return strName;
}

function GetPositionFit(dFormation, strPos) {
  //console.log(dFormation);
  let strName = "";
  let aPointArray = dFormation.aFormationArray[dFormation.iSelFormIndex];
  for (let i = 0; i < aPointArray.length; i++) {
    if (aPointArray[i].strPos == strPos) {
      return dEnum.emPositionFit_1;
    }
  }

  if (strName == "") {
    for (let i = 0; i < aPointArray.length; i++) {
      if (aPointArray[i].strPos2 == strPos) {
        //console.log("Tactics.js, GetPositionFit, aPointArray = ", aPointArray);
        //console.log("Tactics.js, GetPositionFit, need Pos = " + strPos + " man Pos1 = " + aPointArray[i].strPos + " man Pos2 = " + aPointArray[i].strPos2);
        return dEnum.emPositionFit_2;
      }
    }
  }

  return dEnum.emPositionFit_2;
}

//计算链式防守加成效果
function CalcuLinkDefendRate(dOpponentTactics, dOpponentFormation)
{
  //console.log("Tactics.js, CalcuLinkDefendRate,dOpponentFormation = ", dOpponentFormation);
  let dNames = {}
  dNames.strFootmanName_1 = GetFootmanNameFromPos(dOpponentFormation, "DL");
  dNames.strFootmanName_2 = GetFootmanNameFromPos(dOpponentFormation, "DCL");
  dNames.strFootmanName_3 = GetFootmanNameFromPos(dOpponentFormation, "DCR");
  dNames.strFootmanName_4 = GetFootmanNameFromPos(dOpponentFormation, "DR");
  dNames.strFootmanName_5 = GetFootmanNameFromPos(dOpponentFormation, "DMC");
  dNames.strFootmanName_6 = GetFootmanNameFromPos(dOpponentFormation, "MC");
  
  //console.log("Tactics.js, CalcuLinkDefendRate, dNames = ", dNames);
  //console.log("Tactics.js, CalcuLinkDefendRate,dOpponentFormation = ", dOpponentFormation);

  let oFootman1 = mCfgFootman[dNames.strFootmanName_1];
  let oFootman2 = mCfgFootman[dNames.strFootmanName_2];
  let oFootman3 = mCfgFootman[dNames.strFootmanName_3];
  let oFootman4 = mCfgFootman[dNames.strFootmanName_4];
  let oFootman5 = mCfgFootman[dNames.strFootmanName_5];
  //console.log("Tactics.js, CalcuLinkDefendRate,strFootmanName_6 = " + strFootmanName_6);
  let oFootman6 = mCfgFootman[dNames.strFootmanName_6];

  let fRate = Procedure.CalcuLinkDefendRate(oFootman1, oFootman2, oFootman3, oFootman4, oFootman5, oFootman6);

  return parseFloat(fRate);;
}

//计算比赛节奏加成效果
function CalcuRhythmRate(dTactics, dFormation, dOpponentTactics, dOpponentFormation)
{
  let strFootmanName_1 = GetFootmanNameFromPos(dFormation, "SC");
  let strFootmanName_2 = GetFootmanNameFromPos(dFormation, "AML");
  let strFootmanName_3 = GetFootmanNameFromPos(dFormation, "AMR");
  let strFootmanName_4 = GetFootmanNameFromPos(dFormation, "AMC");
  let strFootmanName_5 = GetFootmanNameFromPos(dFormation, "MC");

  let oFootman1 = mCfgFootman[strFootmanName_1];
  let oFootman2 = mCfgFootman[strFootmanName_2];
  let oFootman3 = mCfgFootman[strFootmanName_3];
  let oFootman4 = mCfgFootman[strFootmanName_4];
  let oFootman5 = mCfgFootman[strFootmanName_5];

  let strFootmanName_6 = GetFootmanNameFromPos(dOpponentFormation, "DL");
  let strFootmanName_7 = GetFootmanNameFromPos(dOpponentFormation, "DCL");
  let strFootmanName_8 = GetFootmanNameFromPos(dOpponentFormation, "DCR");
  let strFootmanName_9 = GetFootmanNameFromPos(dOpponentFormation, "DR");
  let strFootmanName_10 = GetFootmanNameFromPos(dOpponentFormation, "DMC");
  

  let oFootman6 = mCfgFootman[strFootmanName_6];
  let oFootman7 = mCfgFootman[strFootmanName_7];
  let oFootman8 = mCfgFootman[strFootmanName_8];
  let oFootman9 = mCfgFootman[strFootmanName_9];
  let oFootman10 = mCfgFootman[strFootmanName_10];

  let fRate = Procedure.CalcuRhythmRate(dTactics.iRhythmIndex, oFootman1, oFootman2, oFootman3, oFootman4, oFootman5, oFootman6, oFootman7,               oFootman8, oFootman9, oFootman10);

  return parseFloat(fRate);

}


//========================================================================


//获取有效的进攻套路里数据
function GetValidRoutineMap(dTactics, dFormation) {
  let dAttackRoutineMap = {}

  for (let key in mCfgAttackRoutine) {
    let dConfigCell = mCfgAttackRoutine[key];
    if (IsAttackRoutineValid(dConfigCell, dTactics, dFormation) == true)
    {
      //dAttackRoutineMap[key] = databus.DeepCopy(dConfigCell);
      dAttackRoutineMap[key] = dConfigCell;
    }
  }

  return dAttackRoutineMap;
}

//获取有效的进攻套路数目
function GetValidRoutineCount(dTactics, dFormation)
{
  let iCount = 0;
  for (let key in mCfgAttackRoutine)
  {
    let dConfigCell = mCfgAttackRoutine[key];
    if (IsAttackRoutineValid(dConfigCell, dTactics, dFormation) == true)
      iCount++;
  }

  return iCount;
}

//这个进攻套路是否可用
function IsAttackRoutineValid(dConfigCell, dTactics, dFormation) 
{
  //console.log("Tactics.js, IsAttackRoutineValid");
  //console.log(dFormation);
  let aPointArray = dFormation.aFormationArray[dFormation.iSelFormIndex]; 
  //console.log(aPointArray);
  let iRhythmIndex = dTactics.iRhythmIndex;

  //阵型有没这个位置
  let strPos = dConfigCell["ShotRole"];
  if (IsFormationHasPos(aPointArray, strPos) == false)
  {
    //console.log("Tactics.js, RoutineNotValid, IsFormationHasPos == false");
    return false;
  }

  //位置上是否有人
  let strName = GetFootmanNameFromPos(dFormation, strPos);
  if (strName == "")
  {
    //console.log("Tactics.js, RoutineNotValid, GetFootmanNameFromPos == null");
    return false;
  }

  //节奏是否允许
  let aRhythmArray = dConfigCell["Rhythm"];
  if (IsRhythmValid(aRhythmArray, iRhythmIndex) == false) {
    //console.log("Tactics.js, IsRhythmValid == false");
    return false;
  }

  //每个环节是否都有人
  let strAttackRoutineName = dConfigCell["Name"];
  let aProcedureArray = dConfigCell["Procedure"];
  for (let i = 0; i < aProcedureArray.length; i++) 
  {
    let dProcedureCell = aProcedureArray[i];
    //console.log(dProcedureCell);
    if (IsFormationHasPos(aPointArray, dProcedureCell.AttackFromRole) == false)
    {
      //console.log("Tactics.js, RoutineNotValid, IsFormationHasPos == false, AttackFromRole RoutineName = " + strAttackRoutineName);
      return false;
    } 
    if (IsFormationHasPos(aPointArray, dProcedureCell.AttackToRole) == false)
    {
      //console.log("Tactics.js, RoutineNotValid, IsFormationHasPos == false, AttackToRole RoutineName = " + strAttackRoutineName);
      return false;
    }
  }

  //共存角色
  let aCoexistRoleArray = dConfigCell["CoexistRoles"];
  let aExistName = [];
  for (let i = 0; i < aCoexistRoleArray.length; i++ )
  {
    let strPos = aCoexistRoleArray[i];
    let strFootmanName = GetFootmanNameFromPos(dFormation, strPos);
    if (aExistName.indexOf(strFootmanName) != -1)
    {
      //console.log("Tactics.js, RoutineNotValid, aExistName.indexOf(strFootmanName) != -1, strPos = " + strPos);
      return false;
    }
    aExistName.push(strFootmanName);
  }
  
  //console.log("Tactics.js, RoutineName = " + strAttackRoutineName + " aExistName = ");
  //console.log(aExistName);

  //console.log("Tactics.js, RoutineValid, Name = " + strAttackRoutineName);

  return true;
}

//阵型有没这个位置
function IsFormationHasPos(aPointArray, strPos) 
{
  //console.log("Tactics.js, IsFormationHasPos");
  //console.log(strPos);
  //console.log(aPointArray);
  //console.log(aPointArray.length);
  
  for (let i = 0; i < aPointArray.length; i++) {
    //console.log(aPointArray[i].strDesc);
    if (aPointArray[i].strPos == strPos) {
      return true;
    }
  }

  for (let i = 0; i < aPointArray.length; i++) {
    if (aPointArray[i].strPos2 == strPos) {
      return true;
    }
  }
  return false;
}

//节奏是否允许
function IsRhythmValid(aRhythmArray, iRhythmIndex) {
  for (let i = 0; i < aRhythmArray.length; i++) {
    if (aRhythmArray[i] == iRhythmIndex) {
      return true;
    }
  }
  return false;
}


//=========================================================

function GetMarkingFootmanMap(dOpponentBase, dOpponentTactics) {
  let map = {}
  if (dOpponentTactics.mOpponentDefendMap != null)
    map = dOpponentTactics.mOpponentDefendMap[dOpponentBase.strOpponentName].mMarkingFootmanMap;
  return map;
}
