
import GlobalData from 'GlobalData'

//var Perform = require('Perform')  //会引起递归引用，不能有

var mCfgProcedure = require('../data/DataProcedure')
var mCfgTactics = require('../data/DataTactics')

let dGlobalData = new GlobalData();
let dEnum = dGlobalData.GetEnum();

module.exports = {
  GetProcedureRate: GetProcedureRate,
  IsPassProcedure: IsPassProcedure,
  IsShotProcedure: IsShotProcedure,
  IsNoBallProcedure: IsNoBallProcedure,
  IsDribbleProcedure: IsDribbleProcedure,
  LaunchProcedure: LaunchProcedure,
  CalcuLinkDefendRate: CalcuLinkDefendRate,
  CalcuRhythmRate: CalcuRhythmRate,
  CalcuMarkingRoutineRate: CalcuMarkingRoutineRate,
  GetRoleAttributes: GetRoleAttributes,
  GetFootmanPerform2: GetFootmanPerform2,
}

let mFunctionMap = 
{
    ["ShortPass"]: ProcedureRate_ShortPass,
    ["DirectPass"]: ProcedureRate_DirectPass,
    ["NeutralPass"]: ProcedureRate_NeutralPass,
    ["LongPass"]: ProcedureRate_LongPass,
    ["CrossPass"]: ProcedureRate_CrossPass,
    ["RunRestriPosi"]: ProcedureRate_RunRestriPosi,
    ["DribbleOver"]: ProcedureRate_DribbleOver,
    ["DribbleForShot"]: ProcedureRate_DribbleForShot,
    ["LeftShot"]: ProcedureRate_LeftShot,
    ["RightShot"]: ProcedureRate_RightShot,
    ["Shot"]: ProcedureRate_Shot,
    ["HeadShot"]: ProcedureRate_HeadShot,
    ["LongShot"]: ProcedureRate_LongShot,
}

//========================================================================
let bScoreLog = false;  //是否显示分数的变化，false：不显示；true：显示
let fRateHighest_Common = 1;  //通用的最高概率
let fRateLowest_Common = 0.3; //通用的最低概率
let fRateLowest_LongShot = 0.0; //远射的最低概率
let fRateLowest_ShortPass = 0.7; //远射的最低概率
let fRateLowest_RunRestriPosi = 0.6; //跑位的最低概率
let iMaxAbility = 20;   //属性值的最大值
let fRateUnitStep = 0.5;  //单个环节的基础成功率
let fRateTwoStepFree = 0.0;  //最终环节(两步骤)的成功率加成，用于后期调数值的宽余额度
let fRateOneStepFree = 0.0;  //最终环节(一步骤)的成功率加成，用于后期调数值的宽余额度
let fLossBallVlaue = 0.1; //当概率差异多大时，会导致丢球权
let fMarkingRoutine_FixRate = 0.8 //重点盯防某个套路的减成(减之后是多少)

let fReducePower_DirectPass = 0.01; //扣除1%的体力
let fReducePower_LongPass = 0.005;  //扣除0.5%的体力
let fReducePower_ShotCommon = 0.005;  //全部射门都扣这个
let fReducePower_RunRestriPosi = 0.005;  
let fReducePower_DribbleForShot = 0.005; 
let fReducePower_DribbleOver = 0.01; 

let emCallForm_GetRate = 1; //调用方式：获取成功率
let emCallForm_Launch = 2; //调用方式：调用并修改数据

//========================================================================
function IsPassProcedure(strProcedureType)
{
  //console.log("Procedure.js, IsPassProcedure,  strProcedureType = " + strProcedureType);
  if (strProcedureType == "ShortPass" || strProcedureType == "DirectPass" || strProcedureType == "NeutralPass" || strProcedureType == "LongPass"
    || strProcedureType == "CrossPass")
    return true;
  else
    return false;
}

function IsShotProcedure(strProcedureType)
{
  //console.log("Procedure.js, IsShotProcedure,  strProcedureType = " + strProcedureType);
  if (strProcedureType == "LeftShot" || strProcedureType == "RightShot" || strProcedureType == "Shot" || strProcedureType == "HeadShot" 
    || strProcedureType == "LongShot")
    return true;
  else
    return false;
}

function IsDribbleProcedure(strProcedureType) {
  //console.log("Procedure.js, IsDribbleProcedure,  strProcedureType = " + strProcedureType);
  if (strProcedureType == "DribbleForShot")
    return true;
  else
    return false;
}

function IsNoBallProcedure(strProcedureType) 
{
  //console.log("Procedure.js, IsNoballProcedure,  strProcedureType = " + strProcedureType);
  if (strProcedureType == "RunRestriPosi")
    return true;
  else
    return false;
}

//==========================================================================================
function GetRoleAttributes(oRole) 
{
  if (oRole == null)
  {
    console.error("Procedure.js, GetRoleAttributes");
  }
  //console.log(oRole);
  //let oAttributes = {};
  //暂时，未完成

  return oRole;
}

function LaunchProcedure(oOutParam, iCurProcedureIndex, strType, strAttackFromRole, strAttackToRole, strDefendFromRole, strDefendToRole, oExtRateEffect) 
{
  if (mFunctionMap[strType] == null) {
    console.error("Pocedure.js, LaunchProcedure, mFunctionMap[strType] == null, strType = " + strType);
    return;
  }

  let oRates = new Object();
  let oResult = { fRate: 0.0, fDefendScore1: 0, fDefendScore2: 0 };
  let iCallForm = emCallForm_Launch;
  mFunctionMap[strType](oRates, iCurProcedureIndex, strAttackFromRole, strAttackToRole, strDefendFromRole, strDefendToRole, oExtRateEffect, iCallForm);

  let fRandValue1 = Math.random();
  oOutParam.fDiffRate = fRandValue1 - oRates.fRate;
  //console.log("Pocedure.js, LaunchProcedure, run procedure fRate = " + fRate + ", fRandValue = " + fRandValue);
  if (oOutParam.fDiffRate >= 0)
  {
    //失败
    if (oOutParam.fDiffRate >= fLossBallVlaue)
    {
      //丢掉球权
      let fRandValue2 = Math.random();
      let fFirstLostRate = (oRates.fDefendScore1 * 1.0) / (oRates.fDefendScore1 + oRates.fDefendScore2);
      if (fRandValue2 <= fFirstLostRate)
        return dEnum.emProcResut_Fail1; //第一步失败并丢掉球权
      else
        return dEnum.emProcResut_Fail3; //第二步失败并丢掉球权
    }
    else
    {
      //没丢球权
      let fRandValue2 = Math.random();
      let fFirstLostRate = (oRates.fDefendScore1 * 1.0) / (oRates.fDefendScore1 + oRates.fDefendScore2);
      if (fRandValue2 <= fFirstLostRate)
        return dEnum.emProcResut_Fail2; //第一步失败但没丢掉球权
      else
        return dEnum.emProcResut_Fail4; //第二步失败但没丢掉球权

    }
  }
  else
  {
    //成功
    return dEnum.emProcResut_Succeed;
  }
}

function GetProcedureRate(strType, iCurProcedureIndex, strAttackFromRole, strAttackToRole, strDefendFromRole, strDefendToRole, oExtRateEffect)
{
  //console.log("Procedure.js, GetProcedureRate, strAttackFromRole = " + strAttackFromRole + " strAttackToRole = " + strAttackToRole + " strDefendFromRole = " + strDefendFromRole + " strDefendToRole = " + strDefendToRole);

  let fRate = 0.0;
  if (mFunctionMap[strType] == null)
  {
    console.error("mFunctionMap[strType] == null, strType = " + strType);
    return fRate;
  }

  //let oRates = new Object();
  let oResult = { fRate: 0.0, iDefendScore1: 0, iDefendScore2:0};
  let iCallForm = emCallForm_GetRate;
  mFunctionMap[strType](oResult, iCurProcedureIndex, strAttackFromRole, strAttackToRole, strDefendFromRole, strDefendToRole, oExtRateEffect, iCallForm);

  //console.log("Procedure.js, GetProcedureRate, strType = " + strType + ", oResult.fRate = " + oResult.fRate);

  return oResult.fRate;
}


//计算单个角色在某个环节的分数,最高20
function CalcuScore1(oOutParam, oAttr1, dConfigCell1, strFuncName, mMarkingFootmanMap) {
  //console.log("Procedure.js, CalcuScore1, dDataCell = ");
  //console.log(oAttr);
  //console.log(dConfigCell);

  //oOutParam = { fScoreR: 0, fScore1: 0, fScore2 : 0 };
  //console.log("Procedure.js, CalcuScore1, mMarkingFootmanMap = ", mMarkingFootmanMap);

  let fValue = 0;
  let fTotalPercent = 0;
  oOutParam.fScore1 = 0.0;
  oOutParam.fScore2 = 0.0;
  for (let property in dConfigCell1) {
    let fAttrValue = 0.0;
    if (property == "Free")
      fAttrValue = 0.0;
    else if (oAttr1[property] == null) {
      console.error("Procedure.js,CalcuScore,oAttr1[property] == null, property = " + property);
      fAttrValue = 0.0;
    }
    else {
      //console.log("Procedure.js, CalcuScore1, oAttr1[property] = " + oAttr1[property]);
      fAttrValue = oAttr1[property];
      //console.log("Procedure.js, CalcuScore1, fAttrValue = " + fAttrValue);
    }

    fValue += fAttrValue * dConfigCell1[property];
    oOutParam.fScore1 += fAttrValue * dConfigCell1[property];
    fTotalPercent += dConfigCell1[property];
  }

  oOutParam.fScoreR = parseFloat(fValue.toFixed(2));
  oOutParam.fScore1 = parseFloat(oOutParam.fScore1.toFixed(2));
  //console.log("Procedure.js, CalcuScore1, oOutParam.fScoreR = " + oOutParam.fScoreR);

  fTotalPercent = parseFloat(fTotalPercent.toFixed(2));
  if (fTotalPercent != 1) {
    console.error("Procedure.js, CalcuScore1, fTotalPercent != 1, strFuncName = " + strFuncName + ", dConfigCell1 = ");
    console.error(dConfigCell1);
  }

  return oOutParam.fScoreR;
}


//计算两个角色在某个环节的分数,最高20
function CalcuScore2(oOutParam, oAttr1, dConfigCell1, oAttr2, dConfigCell2, strFuncName) {
  //console.log("Procedure.js, CalcuScore2, dDataCell = ");
  //console.log(oAttr);
  //console.log(dConfigCell);

  //oOutParam = { fScoreR: 0, fScore1: 0, fScore2 : 0 };

  let fValue = 0;
  let fTotalPercent = 0;
  oOutParam.fScore1 = 0.0;
  oOutParam.fScore2 = 0.0;
  for (let property in dConfigCell1) {
    let fAttrValue = 0.0;
    if (property == "Free")
      fAttrValue = 0.0;
    else if (oAttr1[property] == null) {
      console.error("Procedure.js,CalcuScore,oAttr1[property] == null, property = " + property);
      fAttrValue = 0.0;
    }
    else
      fAttrValue = oAttr1[property];

    fValue += fAttrValue * dConfigCell1[property];
    oOutParam.fScore1 += fAttrValue * dConfigCell1[property];
    fTotalPercent += dConfigCell1[property];
  }

  //---------------------------------------------------------------------
  for (let property in dConfigCell2) {
    let fAttrValue = 0.0;
    if (property == "Free")
      fAttrValue = 0.0;
    else if (oAttr2[property] == null) {
      console.error("Procedure.js,CalcuScore,oAttr2[property] == null, property = " + property);
      fAttrValue = 0.0;
    }
    else
      fAttrValue = oAttr2[property];

    fValue += fAttrValue * dConfigCell2[property];
    oOutParam.fScore2 += fAttrValue * dConfigCell2[property];
    fTotalPercent += dConfigCell2[property];
  }

  
  oOutParam.fScoreR = parseFloat(fValue.toFixed(2));
  oOutParam.fScore1 = parseFloat(oOutParam.fScore1.toFixed(2));
  oOutParam.fScore2 = parseFloat(oOutParam.fScore2.toFixed(2));
  //console.log("Procedure.js, CalcuScore2, oOutParam.fScoreR = " + oOutParam.fScoreR);

  fTotalPercent = parseFloat(fTotalPercent.toFixed(2));
  if (fTotalPercent != 1) {
    console.error("Procedure.js, CalcuScore2, fTotalPercent != 1, strFuncName = " + strFuncName + ", dConfigCell1 = ");
    console.error(dConfigCell1);
    console.error("Procedure.js, CalcuScore2, fTotalPercent != 1, strFuncName = " + strFuncName + ", dConfigCell2 = ");
    console.error(dConfigCell2);
  }

  return oOutParam.fScoreR;
}



function CalcuSucceedRate(fScoreInitiative, fScorePassive, fRateHighest, fRateLowest)
{
  //console.log("Procedure.js, CalcuSucceedRate, fScoreInitiative = " + fScoreInitiative + " fScorePassive = " + fScorePassive + " fRateHighest = " + fRateHighest + " fRateLowest = " + fRateLowest);

  //不要限制分数，这样会导致后面很多加成失效
  // if (fScoreInitiative > 20)
  //   fScoreInitiative = 20;
  // else if (fScoreInitiative < 0)
  //   fScoreInitiative = 0;
  
  // if (fScorePassive > 20)
  //   fScorePassive = 20;
  // else if (fScorePassive < 0)
  //   fScorePassive = 0;

  let fRate1 = (fScoreInitiative - fScorePassive) / 20 + 1;
  let fRate2 = fRate1 * fRate1 / 2;
  let fRate = LimitRate(fRate2, fRateHighest, fRateLowest);

  fRate = parseFloat(fRate.toFixed(2));

  if (dGlobalData.bTestRate == true)
    console.log("Procedure.js, CalcuSucceedRate, fScoreInitiative = " + fScoreInitiative + " fScorePassive = " + fScorePassive + " fRate = " + fRate);
  //console.log("Procedure.js, CalcuSucceedRate, fRate1 = " + fRate1 + " fRate2 = " + fRate2 + " fRate = " + fRate)


  return fRate;
}

function LimitRate(fRateOrigin, fRateHighest, fRateLowest) 
{
  let fRate = fRateOrigin;
  if (fRate > fRateHighest)
    fRate = fRateHighest;
  else if (fRate < fRateLowest)
    fRate = fRateLowest;
  
  return fRate;
}

function IncreaseScoreByRate(fScoreOrigin, fRate)
{
  if (-0.000001 < fRate && fRate < 0.000001)
    return fScoreOrigin;
  let fScore = fScoreOrigin * (1 + fRate);
  fScore = parseFloat(fScore.toFixed(2));
  //console.log("Procedure.js, IncreaseScoreByRate, fScoreOrigin = " + fScoreOrigin + " fRate = " + fRate + " fScore = " + fScore);
  return fScore;
}


function DecreaseScoreByRate(fScoreOrigin, fRate) {
  if (-0.000001 < fRate && fRate < 0.000001)
    return fScoreOrigin;
  //console.log("Procedure.js, DecreaseScoreByRate, fScoreOrigin = " + fScoreOrigin + " fRate = " + fRate);
  let fScore = fScoreOrigin * (1 - fRate);
  fScore = parseFloat(fScore.toFixed(2));

  //console.log("Procedure.js, DecreaseScoreByRate, fScoreOrigin = " + fScoreOrigin + " fScore = " + fScore + " fRate = " + fRate);

  return fScore;
}

function IncreaseByStep(fRateOrigin, iCurProcedureIndex)
{
  let fStepsRate = CalcuProcedureStepsRate(iCurProcedureIndex);
  let fRate = fRateOrigin + fStepsRate;
  fRate = parseFloat(fRate.toFixed(2));
  return fRate;
}

function IncreaseByProcedureBase(fRateOrigin, emProcedureType)
{
  //console.log("Procedure.js, IncreaseByProcedureBase, emProcedureType = " + emProcedureType );

  let fBaseSucceedRate = mCfgProcedure[emProcedureType]["BaseSucceedRate"];
  let fRate = fRateOrigin * fBaseSucceedRate;
  fRate = parseFloat(fRate.toFixed(2));

  //console.log("Procedure.js, IncreaseByProcedureBase, emProcedureType = " + emProcedureType + " fRateOrigin = " + fRateOrigin + " fBaseSucceedRate = " + fBaseSucceedRate + " fRate = " + fRate);

  return fRate;
}
//========================================================================

function ProcedureRate_Base1(oResult, strProcedureName, dPackParam, iCurProcedureIndex, oExtRateEffect, iCallForm)
{
  //console.log("Procedure.js, ProcedureRate_Base1, SelectRoutine, bConsiderMarking = " + oExtRateEffect.bConsiderMarking);
  let strFuncName = "ProcedureRate_" + strProcedureName;
  let dCfgAttack = mCfgProcedure[strProcedureName]["Logic"]["Attack"];
  let dCfgDefend = mCfgProcedure[strProcedureName]["Logic"]["Defend"];

  //-------------------------------------------------------------------------------------------------------------
  //计算进攻分数
  let oScoreAttack = { fScoreR: 0, fScore1: 0, fScore2: 0 };
  //计算基础分数，考虑了被盯人的因素
  CalcuScore1(oScoreAttack, dPackParam.oAttr1, dPackParam.dPropertyConfig[0], strFuncName);
  //盯防球员
  if (oExtRateEffect.bConsiderMarking == true) {
    if (dCfgAttack["MarkingFootman"] == 1) {
      let fMarkingFootmanRate = CalcuMarkingFootmanRate(dPackParam.oAttr1["Name"], oExtRateEffect.mMarkingFootmanMap);
      oScoreAttack.fScoreR = DecreaseScoreByRate(oScoreAttack.fScoreR, fMarkingFootmanRate);
      if (bScoreLog) { console.log("Procedure.js, ProcedureRate_Base1, MarkingFootman, fScoreRAttack = " + oScoreAttack.fScoreR); }
    }
  }
  //节奏快慢
  if (dCfgAttack["Rhythm"] == 1) {
    oScoreAttack.fScoreR = IncreaseScoreByRate(oScoreAttack.fScoreR, oExtRateEffect.fRhythmRate);
    if (bScoreLog) { console.log("Procedure.js, ProcedureRate_Base1, Rhythm, fScoreRAttack = " + oScoreAttack.fScoreR); }
  }
  //盯防套路
  if (oExtRateEffect.bConsiderMarking == true)
  {
    if (dCfgAttack["MarkingRoutine"] == 1) {
      oScoreAttack.fScoreR = DecreaseScoreByRate(oScoreAttack.fScoreR, oExtRateEffect.fMarkingRoutineRate);
      if (bScoreLog) { console.log("Procedure.js, ProcedureRate_Base1, MarkingRoutine, fScoreRAttack = " + oScoreAttack.fScoreR); }
    }
  }
  //套路基础加成
  if (dCfgAttack["RoutineBase"] == 1) {
    oScoreAttack.fScoreR = IncreaseScoreByRate(oScoreAttack.fScoreR, oExtRateEffect.fRoutineBaseRate);
    if (bScoreLog) { console.log("Procedure.js, ProcedureRate_Base1, RoutineBase, fScoreRAttack = " + oScoreAttack.fScoreR); }
  }
  //体力
  if (dCfgAttack["PowerReduce"] == 1) {
    let fPowerAttackRate = CalcuPowerReduceAttackRate(dPackParam.oAttr1, dPackParam.oAttr1, oExtRateEffect.dAttackMatchData);
    oScoreAttack.fScoreR = DecreaseScoreByRate(oScoreAttack.fScoreR, fPowerAttackRate);
    if (bScoreLog) { console.log("Procedure.js, ProcedureRate_Base1, PowerReduce, fScoreRAttack = " + oScoreAttack.fScoreR); }
  }
  //位置熟悉程度
  if (dCfgAttack["PosFit"] == 1) {
    let fAttackPosFitRate = CalcuPosFitRate1(oExtRateEffect.dFitData.emFit1);
    oScoreAttack.fScoreR = DecreaseScoreByRate(oScoreAttack.fScoreR, fAttackPosFitRate);
    if (bScoreLog) { console.log("Procedure.js, ProcedureRate_Base1, PosFit, fScoreRAttack = " + oScoreAttack.fScoreR); }
  }
  //站位宽度
  if (dCfgAttack["PosWidth"] == 1) {
    let fPosWidthRate_A = GetPosWidthRate(oExtRateEffect.iPosWidthIndex, strProcedureName, "Attack");
    oScoreAttack.fScoreR = IncreaseScoreByRate(oScoreAttack.fScoreR, fPosWidthRate_A);
    if (bScoreLog) { console.log("Procedure.js, ProcedureRate_Base1, PosWidth, fScoreRAttack = " + oScoreAttack.fScoreR); }
  }
  //防线深度
  if (dCfgAttack["DefendDepth"] == 1) {
    let fDefendDepthRate_A = GetDefendDepthRate(oExtRateEffect.iDefendDepthIndex, strProcedureName, "Attack");
    oScoreAttack.fScoreR = IncreaseScoreByRate(oScoreAttack.fScoreR, fDefendDepthRate_A);
    if (bScoreLog) { console.log("Procedure.js, ProcedureRate_Base1, DefendDepth, fScoreRAttack = " + oScoreAttack.fScoreR); }
  }

  //-------------------------------------------------------------------------------------------------------------
  //计算防守分数
  let oScoreDefend = { fScoreR: 0, fScore1: 0, fScore2: 0 };
  //计算基础分数
  CalcuScore1(oScoreDefend, dPackParam.oAttr3, dPackParam.dPropertyConfig[2], strFuncName, {});
  if (bScoreLog) { console.log("Procedure.js, ProcedureRate_Base1, Origin, fScoreRDefend = " + oScoreDefend.fScoreR); }

  //链式防守
  if (dCfgDefend["LinkDefend"] == 1) {
    oScoreDefend.fScoreR = IncreaseScoreByRate(oScoreDefend.fScoreR, oExtRateEffect.fLinkDefendRate);
    if (bScoreLog) { console.log("Procedure.js, ProcedureRate_Base1, LinkDefend, fScoreRDefend = " + oScoreDefend.fScoreR); }
  }
    
  //勇敢侵略
  if (dCfgDefend["BraveAggres"] == 1) {
    let fBraveAggresRate = CalcuBraveAggressionRate1(dPackParam.oAttr1, dPackParam.oAttr3);
    oScoreDefend.fScoreR = IncreaseScoreByRate(oScoreDefend.fScoreR, fBraveAggresRate);
    if (bScoreLog) { console.log("Procedure.js, ProcedureRate_Base1, BraveAggres, fScoreRDefend = " + oScoreDefend.fScoreR); }
  }
  //体力
  if (dCfgDefend["PowerReduce"] == 1) {
    let fPowerDefendRate = CalcuPowerReduceDefendRate(dPackParam.oAttr3, dPackParam.oAttr3, oExtRateEffect.dDefendMatchData);
    oScoreDefend.fScoreR = DecreaseScoreByRate(oScoreDefend.fScoreR, fPowerDefendRate);
    if (bScoreLog) { console.log("Procedure.js, ProcedureRate_Base1, PowerReduce, fScoreRDefend = " + oScoreDefend.fScoreR); }
  }
  //位置熟悉程度
  if (dCfgDefend["PosFit"] == 1) {
    let fDefendPosFitRate = CalcuPosFitRate1(oExtRateEffect.dFitData.emFit3);
    oScoreDefend.fScoreR = DecreaseScoreByRate(oScoreDefend.fScoreR, fDefendPosFitRate);
    if (bScoreLog) { console.log("Procedure.js, ProcedureRate_Base1, PosFit, fScoreRDefend = " + oScoreDefend.fScoreR); }
  }
  //站位宽度
  if (dCfgDefend["PosWidth"] == 1) {
    let fPosWidthRate_D = GetPosWidthRate(oExtRateEffect.iOpponentPosWidthIndex, strProcedureName, "Defend");
    oScoreDefend.fScoreR = IncreaseScoreByRate(oScoreDefend.fScoreR, fPosWidthRate_D);
    if (bScoreLog) { console.log("Procedure.js, ProcedureRate_Base1, PosWidth, fScoreRDefend = " + oScoreDefend.fScoreR); }
  }
  //防线深度
  if (dCfgDefend["DefendDepth"] == 1) {
    let fDefendDepthRate_D = GetDefendDepthRate(oExtRateEffect.iOpponentDefendDepthIndex, strProcedureName, "Defend");
    oScoreDefend.fScoreR = IncreaseScoreByRate(oScoreDefend.fScoreR, fDefendDepthRate_D);
    if (bScoreLog) { console.log("Procedure.js, ProcedureRate_Base1, DefendDepth, fScoreRDefend = " + oScoreDefend.fScoreR); }
  }

  //-------------------------------------------------------------------------------------------------------------
  //根据双方分数计算成功率
  oResult.fRate = CalcuSucceedRate(oScoreAttack.fScoreR, oScoreDefend.fScoreR, dPackParam.fRateHighest, dPackParam.fRateLowest);
  //动作基础系数调整
  oResult.fRate = IncreaseByProcedureBase(oResult.fRate, strProcedureName);
  //套路步数调整
  oResult.fRate = IncreaseByStep(oResult.fRate, iCurProcedureIndex);
  //对成功率做最高和最低调整
  oResult.fRate = LimitRate(oResult.fRate, dPackParam.fRateHighest, dPackParam.fRateLowest);

  //console.log("Procedure.js, " + strFuncName + ", fRate = " + oResult.fRate + " fDefendScore1 = " + oResult.fDefendScore1 + " fDefendScore2 = " + oResult.fDefendScore2);
  if (dGlobalData.bTestRate == true)
    console.log("Procedure.js, " + strFuncName + ", fRate = " + oResult.fRate);

  //-------------------------------------------------------------------------------------------------------------
  //对外部输出防守者分数，决定是否丢球
  oResult.fDefendScore1 = oScoreDefend.fScore1;
  oResult.fDefendScore2 = oScoreDefend.fScore2;

  return oResult.fRate;
}

function ProcedureRate_Base2(oResult, strProcedureName, dPackParam, iCurProcedureIndex, oExtRateEffect, iCallForm) 
{
  //console.log("Procedure.js, ProcedureRate_Base2, SelectRoutine, bConsiderMarking = " + oExtRateEffect.bConsiderMarking);
  //console.log("Procedure.js, ProcedureRate_Base2, strProcedureName = " + strProcedureName);
  let strFuncName = "ProcedureRate_" + strProcedureName;
  let dCfgAttack = mCfgProcedure[strProcedureName]["Logic"]["Attack"];
  let dCfgDefend = mCfgProcedure[strProcedureName]["Logic"]["Defend"];

  //-------------------------------------------------------------------------------------------------------------
  //计算进攻分数
  let oScoreAttack = { fScoreR: 0, fScore1: 0, fScore2: 0 };
  //计算基础分数，考虑了被盯人的因素
  CalcuScore2(oScoreAttack, dPackParam.oAttr1, dPackParam.dPropertyConfig[0], dPackParam.oAttr2, dPackParam.dPropertyConfig[1], strFuncName);
  if (bScoreLog) { console.log("Procedure.js, ProcedureRate_Base2, Origin, fScoreRAttack = " + oScoreAttack.fScoreR);}
  //盯防球员
  if (oExtRateEffect.bConsiderMarking == true) {
    if (dCfgAttack["MarkingFootman"] == 1) {
      let fMarkingFootmanRate = CalcuMarkingFootmanRate(dPackParam.oAttr1["Name"], oExtRateEffect.mMarkingFootmanMap);
      oScoreAttack.fScoreR = DecreaseScoreByRate(oScoreAttack.fScoreR, fMarkingFootmanRate);
      if (bScoreLog) { console.log("Procedure.js, ProcedureRate_Base2, MarkingFootman, fScoreRAttack = " + oScoreAttack.fScoreR); }
    }
  }
  //节奏快慢
  if (dCfgAttack["Rhythm"] == 1) {
    oScoreAttack.fScoreR = IncreaseScoreByRate(oScoreAttack.fScoreR, oExtRateEffect.fRhythmRate);
    if (bScoreLog) { console.log("Procedure.js, ProcedureRate_Base2, Rhythm, fScoreRAttack = " + oScoreAttack.fScoreR); }
  }
  //盯防套路
  if (oExtRateEffect.bConsiderMarking == true) {
    if (dCfgAttack["MarkingRoutine"] == 1) {
      oScoreAttack.fScoreR = DecreaseScoreByRate(oScoreAttack.fScoreR, oExtRateEffect.fMarkingRoutineRate);
      if (bScoreLog) { console.log("Procedure.js, ProcedureRate_Base2, MarkingRoutine, fScoreRAttack = " + oScoreAttack.fScoreR); }
    } 
  }
  //套路基础加成
  if (dCfgAttack["RoutineBase"] == 1) {
    oScoreAttack.fScoreR = IncreaseScoreByRate(oScoreAttack.fScoreR, oExtRateEffect.fRoutineBaseRate);
    if (bScoreLog) { console.log("Procedure.js, ProcedureRate_Base2, RoutineBase, fScoreRAttack = " + oScoreAttack.fScoreR); }
  }
  //体力
  if (dCfgAttack["PowerReduce"] == 1) {
    let fPoweRate_A = CalcuPowerReduceAttackRate(dPackParam.oAttr1, dPackParam.oAttr2, oExtRateEffect.dAttackMatchData);
    oScoreAttack.fScoreR = DecreaseScoreByRate(oScoreAttack.fScoreR, fPoweRate_A);
    if (bScoreLog) { console.log("Procedure.js, ProcedureRate_Base2, PowerReduce, fScoreRAttack = " + oScoreAttack.fScoreR); }
  }
  //位置熟悉程度
  if (dCfgAttack["PosFit"] == 1) {
    let fPosFitRate_A = CalcuPosFitRate2(oExtRateEffect.dFitData.emFit1, oExtRateEffect.dFitData.emFit2);
    oScoreAttack.fScoreR = DecreaseScoreByRate(oScoreAttack.fScoreR, fPosFitRate_A);
    if (bScoreLog) { console.log("Procedure.js, ProcedureRate_Base2, PosFit, fScoreRAttack = " + oScoreAttack.fScoreR); }
  }
  //站位宽度
  if (dCfgAttack["PosWidth"] == 1) {
    let fPosWidthRate_A = GetPosWidthRate(oExtRateEffect.iPosWidthIndex, strProcedureName, "Attack");
    oScoreAttack.fScoreR = IncreaseScoreByRate(oScoreAttack.fScoreR, fPosWidthRate_A);
    if (bScoreLog) { console.log("Procedure.js, ProcedureRate_Base2, PosWidth, fScoreRAttack = " + oScoreAttack.fScoreR); }
  }
  //防线深度
  if (dCfgAttack["DefendDepth"] == 1) {
    let fDefendDepthRate_A = GetDefendDepthRate(oExtRateEffect.iDefendDepthIndex, strProcedureName, "Attack");
    oScoreAttack.fScoreR = IncreaseScoreByRate(oScoreAttack.fScoreR, fDefendDepthRate_A);
    if (bScoreLog) { console.log("Procedure.js, ProcedureRate_Base2, DefendDepth, fScoreRAttack = " + oScoreAttack.fScoreR); }
  }

  //-------------------------------------------------------------------------------------------------------------
  //计算防守分数
  let oScoreDefend = { fScoreR: 0, fScore1: 0, fScore2: 0 };
  //计算基础分数
  CalcuScore2(oScoreDefend, dPackParam.oAttr3, dPackParam.dPropertyConfig[2], dPackParam.oAttr4, dPackParam.dPropertyConfig[3], strFuncName, {});
  if (bScoreLog) { console.log("Procedure.js, ProcedureRate_Base2, Origin, fScoreRDefend = " + oScoreDefend.fScoreR); }

  //链式防守
  if (dCfgDefend["LinkDefend"] == 1) {
    oScoreDefend.fScoreR = IncreaseScoreByRate(oScoreDefend.fScoreR, oExtRateEffect.fLinkDefendRate);
    if (bScoreLog) { console.log("Procedure.js, ProcedureRate_Base2, LinkDefend, fScoreRDefend = " + oScoreDefend.fScoreR); }
  }
    
  //勇敢侵略
  if (dCfgDefend["BraveAggres"] == 1) {
    let fBraveAggresRate = CalcuBraveAggressionRate2(dPackParam.oAttr1, dPackParam.oAttr2, dPackParam.oAttr3, dPackParam.oAttr4);
    oScoreDefend.fScoreR = IncreaseScoreByRate(oScoreDefend.fScoreR, fBraveAggresRate);
    if (bScoreLog) { console.log("Procedure.js, ProcedureRate_Base2, BraveAggres, fScoreRDefend = " + oScoreDefend.fScoreR); }
  }
  //体力
  if (dCfgDefend["PowerReduce"] == 1) {
    let fPowerRate_D = CalcuPowerReduceDefendRate(dPackParam.oAttr3, dPackParam.oAttr4, oExtRateEffect.dDefendMatchData);
    oScoreDefend.fScoreR = DecreaseScoreByRate(oScoreDefend.fScoreR, fPowerRate_D);
    if (bScoreLog) { console.log("Procedure.js, ProcedureRate_Base2, PowerReduce, fScoreRDefend = " + oScoreDefend.fScoreR); }
  }
  //位置熟悉程度
  if (dCfgDefend["PosFit"] == 1) {
    let fPosFitRate_D = CalcuPosFitRate2(oExtRateEffect.dFitData.emFit3, oExtRateEffect.dFitData.emFit4);
    oScoreDefend.fScoreR = DecreaseScoreByRate(oScoreDefend.fScoreR, fPosFitRate_D);
    if (bScoreLog) { console.log("Procedure.js, ProcedureRate_Base2, PosFit, fScoreRDefend = " + oScoreDefend.fScoreR); }
  }
  //站位宽度
  if (dCfgDefend["PosWidth"] == 1) {
    let fPosWidthRate_D = GetPosWidthRate(oExtRateEffect.iOpponentPosWidthIndex, strProcedureName, "Defend");
    oScoreDefend.fScoreR = IncreaseScoreByRate(oScoreDefend.fScoreR, fPosWidthRate_D);
    if (bScoreLog) { console.log("Procedure.js, ProcedureRate_Base2, PosWidth, fScoreRDefend = " + oScoreDefend.fScoreR); }
  }
  //防线深度
  if (dCfgDefend["DefendDepth"] == 1) {
    let fDefendDepthRate_D = GetDefendDepthRate(oExtRateEffect.iOpponentDefendDepthIndex, strProcedureName, "Defend");
    oScoreDefend.fScoreR = IncreaseScoreByRate(oScoreDefend.fScoreR, fDefendDepthRate_D);
    if (bScoreLog) { console.log("Procedure.js, ProcedureRate_Base2, DefendDepth, fScoreRDefend = " + oScoreDefend.fScoreR); }
  }

  //-------------------------------------------------------------------------------------------------------------
  //根据双方分数计算成功率
  oResult.fRate = CalcuSucceedRate(oScoreAttack.fScoreR, oScoreDefend.fScoreR, dPackParam.fRateHighest, dPackParam.fRateLowest);
  //动作基础系数调整
  oResult.fRate = IncreaseByProcedureBase(oResult.fRate, strProcedureName);
  //套路步数调整
  oResult.fRate = IncreaseByStep(oResult.fRate, iCurProcedureIndex);
  //对成功率做最高和最低调整
  oResult.fRate = LimitRate(oResult.fRate, dPackParam.fRateHighest, dPackParam.fRateLowest);

  //console.log("Procedure.js, " + strFuncName + ", fRate = " + oResult.fRate + " fDefendScore1 = " + oResult.fDefendScore1 + " fDefendScore2 = " + oResult.fDefendScore2);
  if (dGlobalData.bTestRate == true)
    console.log("Procedure.js, " + strFuncName + ", fRate = " + oResult.fRate);

  //-------------------------------------------------------------------------------------------------------------
  //对外部输出防守者分数，决定是否丢球
  oResult.fDefendScore1 = oScoreDefend.fScore1;
  oResult.fDefendScore2 = oScoreDefend.fScore2;

  return oResult.fRate;
}

//短传
function ProcedureRate_ShortPass(oResult, iCurProcedureIndex, AttackFromRole, AttackToRole, DefendFromRole, DefendToRole, oExtRateEffect, iCallForm) 
{
  //console.log("ProcedureRate_ShortPass, oExtRateEffect = ");
  //console.log(oExtRateEffect);
  
  let oAttr1 = GetRoleAttributes(AttackFromRole);
  let oAttr2 = GetRoleAttributes(AttackToRole);
  let oAttr3 = GetRoleAttributes(DefendFromRole);
  let oAttr4 = GetRoleAttributes(DefendToRole);
  let strProcedureName = dEnum.emShortPass;

  let dConfig =
    [
      { "Technique": 0.1, "Anticipation": 0.1, "Pass": 0.3},
      { "Technique": 0.1, "Anticipation": 0.1, "Catch": 0.3},
      { "Anticipation": 0.1, "Tackling": 0.1},
      { "Anticipation": 0.1, "Tackling": 0.2, "Positioning": 0.2, "Concentration": 0.1, "Free": 0.2},
    ]

  let dPackParam = {};
  dPackParam.oAttr1 = oAttr1;
  dPackParam.oAttr2 = oAttr2;
  dPackParam.oAttr3 = oAttr3;
  dPackParam.oAttr4 = oAttr4;
  dPackParam.dPropertyConfig = dConfig;

  dPackParam.fRateHighest = fRateHighest_Common;
  dPackParam.fRateLowest = fRateLowest_ShortPass;

  ProcedureRate_Base2(oResult, strProcedureName, dPackParam, iCurProcedureIndex, oExtRateEffect, iCallForm);

  return oResult.fRate;
}


//直传
function ProcedureRate_DirectPass(oResult, iCurProcedureIndex, AttackFromRole, AttackToRole, DefendFromRole, DefendToRole, oExtRateEffect, iCallForm) 
{
  let oAttr1 = GetRoleAttributes(AttackFromRole);
  let oAttr2 = GetRoleAttributes(AttackToRole);
  let oAttr3 = GetRoleAttributes(DefendFromRole);
  let oAttr4 = GetRoleAttributes(DefendToRole);

  let strProcedureName = dEnum.emDirectPass;

  let dConfig =
    [
      { "Technique": 0.05, "Anticipation": 0.05, "Pass": 0.1, "Vision": 0.2, "Decision": 0.2 },
      { "Anticipation": 0.05, "Strong": 0.05, "Catch": 0.05, "Movement": 0.1, "Acceleration": 0.05, "Speed": 0.1  },
      { "Anticipation": 0.05, "Tackling": 0.1 },
      { "Anticipation": 0.05, "Strong": 0.05, "Tackling": 0.1, "Marking": 0.1, "Positioning": 0.1, "Concentration": 0.2, "Acceleration": 0.15, "Speed": 0.1  },
    ]

  let dPackParam = {};
  dPackParam.oAttr1 = oAttr1;
  dPackParam.oAttr2 = oAttr2;
  dPackParam.oAttr3 = oAttr3;
  dPackParam.oAttr4 = oAttr4;
  dPackParam.dPropertyConfig = dConfig;

  dPackParam.fRateHighest = fRateHighest_Common;
  dPackParam.fRateLowest = fRateLowest_Common;

  ProcedureRate_Base2(oResult, strProcedureName, dPackParam, iCurProcedureIndex, oExtRateEffect, iCallForm) 

  //扣除体力
  if (iCallForm == emCallForm_Launch) 
  {
    //console.log("Procedure.js, " + strFuncName + ", dAttackMatchData = ", oExtRateEffect.dAttackMatchData);
    ReducePower2(oExtRateEffect.dAttackMatchData, AttackToRole.Name, fReducePower_DirectPass);
    ReducePower2(oExtRateEffect.dDefendMatchData, DefendToRole.Name, fReducePower_DirectPass);
  }

  return oResult.fRate;
}

//传空档
function ProcedureRate_NeutralPass(oResult, iCurProcedureIndex, AttackFromRole, AttackToRole, DefendFromRole, DefendToRole, oExtRateEffect, iCallForm) 
{
  let oAttr1 = GetRoleAttributes(AttackFromRole);
  let oAttr2 = GetRoleAttributes(AttackToRole);
  let oAttr3 = GetRoleAttributes(DefendFromRole);
  let oAttr4 = GetRoleAttributes(DefendToRole);

  let strProcedureName = dEnum.emNeutralPass;

  let dConfig = 
  [
      { "Technique": 0.05, "Anticipation": 0.05, "Pass": 0.1, "Vision": 0.2, "Decision": 0.15},
      { "Technique": 0.05, "Anticipation": 0.05, "Catch": 0.1, "Movement": 0.15, "Acceleration": 0.1 },
      { "Anticipation": 0.05, "Tackling": 0.1 },
      { "Anticipation": 0.1, "Tackling": 0.1, "Marking": 0.2, "Positioning": 0.25, "Concentration": 0.1, "Acceleration": 0.1 },
  ]

  let dPackParam = {};
  dPackParam.oAttr1 = oAttr1;
  dPackParam.oAttr2 = oAttr2;
  dPackParam.oAttr3 = oAttr3;
  dPackParam.oAttr4 = oAttr4;
  dPackParam.dPropertyConfig = dConfig;

  dPackParam.fRateHighest = fRateHighest_Common;
  dPackParam.fRateLowest = fRateLowest_Common;

  ProcedureRate_Base2(oResult, strProcedureName, dPackParam, iCurProcedureIndex, oExtRateEffect, iCallForm);

  return oResult.fRate;
}


//长传
function ProcedureRate_LongPass(oResult, iCurProcedureIndex, AttackFromRole, AttackToRole, DefendFromRole, DefendToRole, oExtRateEffect, iCallForm) 
{
  let oAttr1 = GetRoleAttributes(AttackFromRole);
  let oAttr2 = GetRoleAttributes(AttackToRole);
  let oAttr3 = GetRoleAttributes(DefendFromRole);
  let oAttr4 = GetRoleAttributes(DefendToRole);

  let strProcedureName = dEnum.emLongPass;

  let dConfig =
    [
      { "Anticipation": 0.05, "Pass": 0.2, "Vision": 0.1},
      { "Anticipation": 0.05, "Strong": 0.1, "Catch": 0.1, "Movement": 0.1, "Jump": 0.1, "Acceleration": 0.1, "Speed": 0.1 },
      { "Anticipation": 0.05, "Tackling": 0.1},
      { "Anticipation": 0.05, "Strong": 0.1, "Tackling": 0.1, "Marking": 0.1, "Positioning": 0.1, "Concentration": 0.1, "Jump": 0.1, "Acceleration": 0.1, "Speed": 0.1},
    ]

  let dPackParam = {};
  dPackParam.oAttr1 = oAttr1;
  dPackParam.oAttr2 = oAttr2;
  dPackParam.oAttr3 = oAttr3;
  dPackParam.oAttr4 = oAttr4;
  dPackParam.dPropertyConfig = dConfig;

  dPackParam.fRateHighest = fRateHighest_Common;
  dPackParam.fRateLowest = fRateLowest_Common;

  ProcedureRate_Base2(oResult, strProcedureName, dPackParam, iCurProcedureIndex, oExtRateEffect, iCallForm);

  //扣除体力
  if (iCallForm == emCallForm_Launch) 
  {
    //console.log("Procedure.js, " + strFuncName + ", dAttackMatchData = ", oExtRateEffect.dAttackMatchData);
    ReducePower2(oExtRateEffect.dAttackMatchData, AttackToRole.Name, fReducePower_LongPass);
    ReducePower2(oExtRateEffect.dDefendMatchData, DefendToRole.Name, fReducePower_LongPass);
  }

  return oResult.fRate;
}


//传中
function ProcedureRate_CrossPass(oResult, iCurProcedureIndex, AttackFromRole, AttackToRole, DefendFromRole, DefendToRole, oExtRateEffect, iCallForm) {
  let oAttr1 = GetRoleAttributes(AttackFromRole);
  let oAttr2 = GetRoleAttributes(AttackToRole);
  let oAttr3 = GetRoleAttributes(DefendFromRole);
  let oAttr4 = GetRoleAttributes(DefendToRole);

  let strProcedureName = dEnum.emCrossPass;

  let dConfig =
    [
      { "Anticipation": 0.05, "Vision": 0.1, "Cross": 0.3 },
      { "Anticipation": 0.05, "Strong": 0.1, "Movement": 0.1, "Jump": 0.1, "Acceleration": 0.1, "Speed": 0.1 },
      { "Anticipation": 0.05, "Tackling": 0.1 },
      { "Anticipation": 0.15, "Strong": 0.1, "Marking": 0.1, "Positioning": 0.3, "Head": 0.1, "Jump": 0.1 },
    ]

  let dPackParam = {};
  dPackParam.oAttr1 = oAttr1;
  dPackParam.oAttr2 = oAttr2;
  dPackParam.oAttr3 = oAttr3;
  dPackParam.oAttr4 = oAttr4;
  dPackParam.dPropertyConfig = dConfig;

  dPackParam.fRateHighest = fRateHighest_Common;
  dPackParam.fRateLowest = fRateLowest_Common;

  ProcedureRate_Base2(oResult, strProcedureName, dPackParam, iCurProcedureIndex, oExtRateEffect, iCallForm);

  return oResult.fRate;
}

//大禁区内跑位
function ProcedureRate_RunRestriPosi(oResult, iCurProcedureIndex, AttackFromRole, AttackToRole, DefendFromRole, DefendToRole, oExtRateEffect, iCallForm) 
{
  let oAttr1 = GetRoleAttributes(AttackFromRole);
  let oAttr3 = GetRoleAttributes(DefendFromRole);

  let strProcedureName = dEnum.emRunRestriPosi;

  let dConfig =
    [
      { "Anticipation": 0.2, "Movement": 0.5, "Agility": 0.1, "Acceleration": 0.2},
      { },
      { "Anticipation": 0.2, "Marking": 0.2, "Concentration": 0.2, "Acceleration": 0.2, "Positioning": 0.2},
      { },
    ]

  let dPackParam = {};
  dPackParam.oAttr1 = oAttr1;
  dPackParam.oAttr3 = oAttr3;
  dPackParam.dPropertyConfig = dConfig;

  dPackParam.fRateHighest = fRateHighest_Common;
  dPackParam.fRateLowest = fRateLowest_RunRestriPosi;

  ProcedureRate_Base1(oResult, strProcedureName, dPackParam, iCurProcedureIndex, oExtRateEffect, iCallForm);

  //扣除体力
  if (iCallForm == emCallForm_Launch)  
  {
    //console.log("Procedure.js, " + strFuncName + " ReducePower2, dAttackMatchData = ", oExtRateEffect.dAttackMatchData);
    ReducePower2(oExtRateEffect.dAttackMatchData, AttackFromRole.Name, fReducePower_RunRestriPosi);
  }

  return oResult.fRate;
}


//过人
function ProcedureRate_DribbleOver(oResult, iCurProcedureIndex, AttackFromRole, AttackToRole, DefendFromRole, DefendToRole, oExtRateEffect, iCallForm) {
  let oAttr1 = GetRoleAttributes(AttackFromRole);
  let oAttr3 = GetRoleAttributes(DefendFromRole);

  let strProcedureName = dEnum.emDribbleOver;

  let dConfig =
    [
      { "Technique": 0.1, "Dribbling": 0.3, "Talent": 0.2, "Balance": 0.1, "Acceleration": 0.1, "Agility": 0.2 },
      {},
      { "Anticipation": 0.2, "Tackling": 0.3, "Composure": 0.1, "Balance": 0.1, "Acceleration": 0.1, "Agility": 0.2 },
      {},
    ]

  let dPackParam = {};
  dPackParam.oAttr1 = oAttr1;
  dPackParam.oAttr3 = oAttr3;
  dPackParam.dPropertyConfig = dConfig;

  dPackParam.fRateHighest = fRateHighest_Common;
  dPackParam.fRateLowest = fRateLowest_Common;

  ProcedureRate_Base1(oResult, strProcedureName, dPackParam, iCurProcedureIndex, oExtRateEffect, iCallForm);

  //扣除体力
  if (iCallForm == emCallForm_Launch) 
  {
    //console.log("Procedure.js, " + strFuncName + " ReducePower2, dAttackMatchData = ", oExtRateEffect.dAttackMatchData);
    ReducePower2(oExtRateEffect.dAttackMatchData, AttackFromRole.Name, fReducePower_DribbleOver);
  }

  return oResult.fRate;
}

//射门前盘带选位
function ProcedureRate_DribbleForShot(oResult, iCurProcedureIndex, AttackFromRole, AttackToRole, DefendFromRole, DefendToRole, oExtRateEffect, iCallForm) 
{
  let oAttr1 = GetRoleAttributes(AttackFromRole);
  let oAttr3 = GetRoleAttributes(DefendFromRole);

  let strProcedureName = dEnum.emDribbleForShot;

  let dConfig =
    [
      { "Technique": 0.1, "Dribbling": 0.3, "Talent": 0.2, "Decision": 0.1, "Balance": 0.1, "Acceleration": 0.1, "Agility": 0.1 },
      {},
      { "Positioning": 0.3, "Tackling": 0.2, "Composure": 0.1, "Balance": 0.1, "Concentration": 0.1, "Acceleration": 0.1, "Agility": 0.1 },
      {},
    ]

  let dPackParam = {};
  dPackParam.oAttr1 = oAttr1;
  dPackParam.oAttr3 = oAttr3;
  dPackParam.dPropertyConfig = dConfig;

  dPackParam.fRateHighest = fRateHighest_Common;
  dPackParam.fRateLowest = fRateLowest_Common;

  ProcedureRate_Base1(oResult, strProcedureName, dPackParam, iCurProcedureIndex, oExtRateEffect, iCallForm);

  //扣除体力
  if (iCallForm == emCallForm_Launch) 
  {
    //console.log("Procedure.js, " + strFuncName + ", dAttackMatchData = ", oExtRateEffect.dAttackMatchData);
    ReducePower2(oExtRateEffect.dAttackMatchData, AttackFromRole.Name, fReducePower_DribbleForShot);
  }

  return oResult.fRate;
}

//中短距离左脚射门
function ProcedureRate_LeftShot(oResult, iCurProcedureIndex, AttackFromRole, AttackToRole, DefendFromRole, DefendToRole, oExtRateEffect, iCallForm) 
{
  let oAttr1 = GetRoleAttributes(AttackFromRole);
  let oAttr2 = GetRoleAttributes(AttackToRole);
  let oAttr3 = GetRoleAttributes(DefendFromRole);
  let oAttr4 = GetRoleAttributes(DefendToRole);

  let strProcedureName = dEnum.emLeftShot;

  //console.log(oAttr1);
  let dConfig =
    [
      { "Technique": 0.2, "Shot": 0.3, "Talent": 0.1, "Composure": 0.1, "Decision": 0.2, "LeftFoot": 0.1 },
      { },
      { "Positioning": 0.2, "Marking": 0.1, "Composure": 0.1},
      { "Jump": 0.2, "Concentration": 0.1, "Reflexes": 0.15, "Handling": 0.15},
    ]

  let dPackParam = {};
  dPackParam.oAttr1 = oAttr1;
  dPackParam.oAttr2 = oAttr2;
  dPackParam.oAttr3 = oAttr3;
  dPackParam.oAttr4 = oAttr4;
  dPackParam.dPropertyConfig = dConfig;

  dPackParam.fRateHighest = fRateHighest_Common;
  dPackParam.fRateLowest = fRateLowest_Common;

  ProcedureRate_Base2(oResult, strProcedureName, dPackParam, iCurProcedureIndex, oExtRateEffect, iCallForm);

  //扣除体力
  if (iCallForm == emCallForm_Launch) 
  {
    //console.log("Procedure.js, " + strFuncName + " ReducePower2, dAttackMatchData = ", oExtRateEffect.dAttackMatchData);
    ReducePower2(oExtRateEffect.dAttackMatchData, AttackFromRole.Name, fReducePower_ShotCommon);
  }

  return oResult.fRate;
}


//中短距离右脚射门
function ProcedureRate_RightShot(oResult, iCurProcedureIndex, AttackFromRole, AttackToRole, DefendFromRole, DefendToRole, oExtRateEffect, iCallForm) 
{
  let oAttr1 = GetRoleAttributes(AttackFromRole);
  let oAttr2 = GetRoleAttributes(AttackToRole);
  let oAttr3 = GetRoleAttributes(DefendFromRole);
  let oAttr4 = GetRoleAttributes(DefendToRole);

  let strProcedureName = dEnum.emRightShot;

  //console.log(oAttr1);
  let dConfig =
    [
      { "Technique": 0.2, "Shot": 0.3, "Talent": 0.1, "Composure": 0.1, "Decision": 0.2, "RightFoot": 0.1 },
      { },
      { "Positioning": 0.2, "Marking": 0.1, "Composure": 0.1 },
      { "Jump": 0.2, "Concentration": 0.1, "Reflexes": 0.15, "Handling": 0.15 },
    ]

  let dPackParam = {};
  dPackParam.oAttr1 = oAttr1;
  dPackParam.oAttr2 = oAttr2;
  dPackParam.oAttr3 = oAttr3;
  dPackParam.oAttr4 = oAttr4;
  dPackParam.dPropertyConfig = dConfig;

  dPackParam.fRateHighest = fRateHighest_Common;
  dPackParam.fRateLowest = fRateLowest_Common;

  ProcedureRate_Base2(oResult, strProcedureName, dPackParam, iCurProcedureIndex, oExtRateEffect, iCallForm);
  //扣除体力
  if (iCallForm == emCallForm_Launch) 
  {
    //console.log("Procedure.js, " + strFuncName + " ReducePower2, dAttackMatchData = ", oExtRateEffect.dAttackMatchData);
    ReducePower2(oExtRateEffect.dAttackMatchData, AttackFromRole.Name, fReducePower_ShotCommon);
  }

  return oResult.fRate;
}

//中短距离射门(自动选择优势脚)
function ProcedureRate_Shot(oResult, iCurProcedureIndex, AttackFromRole, AttackToRole, DefendFromRole, DefendToRole, oExtRateEffect, iCallForm) 
{
  let oAttr1 = GetRoleAttributes(AttackFromRole);
  let oAttr2 = GetRoleAttributes(AttackToRole);
  let oAttr3 = GetRoleAttributes(DefendFromRole);
  let oAttr4 = GetRoleAttributes(DefendToRole);

  let strProcedureName = dEnum.emShot;

  //console.log(oAttr1);
  let dConfig =
    [
      { "Technique": 0.2, "Shot": 0.3, "Talent": 0.1, "Composure": 0.1, "Decision": 0.2, "Balance": 0.1 },
      { },
      { "Positioning": 0.2, "Marking": 0.2, "Composure": 0.1 },
      { "Jump": 0.1, "CommandDefend": 0.1, "Reflexes": 0.2, "Handling": 0.1 },
    ]

  let dPackParam = {};
  dPackParam.oAttr1 = oAttr1;
  dPackParam.oAttr2 = oAttr2;
  dPackParam.oAttr3 = oAttr3;
  dPackParam.oAttr4 = oAttr4;
  dPackParam.dPropertyConfig = dConfig;

  dPackParam.fRateHighest = fRateHighest_Common;
  dPackParam.fRateLowest = fRateLowest_Common;

  ProcedureRate_Base2(oResult, strProcedureName, dPackParam, iCurProcedureIndex, oExtRateEffect, iCallForm);

  //扣除体力
  if (iCallForm == emCallForm_Launch) 
  {
    //console.log("Procedure.js, " + strFuncName + " ReducePower2, dAttackMatchData = ", oExtRateEffect.dAttackMatchData);
    ReducePower2(oExtRateEffect.dAttackMatchData, AttackFromRole.Name, fReducePower_ShotCommon);
  }

  return oResult.fRate;
}


//远射
function ProcedureRate_LongShot(oResult, iCurProcedureIndex, AttackFromRole, AttackToRole, DefendFromRole, DefendToRole, oExtRateEffect, iCallForm) {
  let oAttr1 = GetRoleAttributes(AttackFromRole);
  let oAttr2 = GetRoleAttributes(AttackToRole);
  let oAttr3 = GetRoleAttributes(DefendFromRole);
  let oAttr4 = GetRoleAttributes(DefendToRole);

  let strProcedureName = dEnum.emLongShot;

  //console.log(oAttr1);
  let dConfig =
    [
      { "Technique": 0.2, "Anticipation": 0.1, "LongShot": 0.4, "Composure": 0.1, "Strong": 0.1, "Decision": 0.1 },
      {},
      { "Positioning": 0.1, "Marking": 0.1},
      { "StopAir": 0.3, "Jump": 0.2, "Reflexes": 0.1, "Handling": 0.1, "Acceleration": 0.1 },
    ]

  let dPackParam = {};
  dPackParam.oAttr1 = oAttr1;
  dPackParam.oAttr2 = oAttr2;
  dPackParam.oAttr3 = oAttr3;
  dPackParam.oAttr4 = oAttr4;
  dPackParam.dPropertyConfig = dConfig;

  dPackParam.fRateHighest = fRateHighest_Common;
  dPackParam.fRateLowest = fRateLowest_LongShot;

  ProcedureRate_Base2(oResult, strProcedureName, dPackParam, iCurProcedureIndex, oExtRateEffect, iCallForm);

  //扣除体力
  if (iCallForm == emCallForm_Launch) 
  {
    //console.log("Procedure.js, " + strFuncName + " ReducePower2, dAttackMatchData = ", oExtRateEffect.dAttackMatchData);
    ReducePower2(oExtRateEffect.dAttackMatchData, AttackFromRole.Name, fReducePower_ShotCommon);
  }

  return oResult.fRate;
}

//头球射门
function ProcedureRate_HeadShot(oResult, iCurProcedureIndex, AttackFromRole, AttackToRole, DefendFromRole, DefendToRole, oExtRateEffect, iCallForm) 
{
  let oAttr1 = GetRoleAttributes(AttackFromRole);
  let oAttr2 = GetRoleAttributes(AttackToRole);
  let oAttr3 = GetRoleAttributes(DefendFromRole);
  let oAttr4 = GetRoleAttributes(DefendToRole);

  let strProcedureName = dEnum.emHeadShot;
  //console.log(oAttr4);
  let dConfig =
    [
      { "Strong": 0.1, "Head": 0.3, "Jump": 0.3, "Composure": 0.1, "Decision": 0.1, "Balance": 0.1 },
      { },
      { "Jump": 0.3, "Marking": 0.1 },
      { "Jump": 0.1, "StopCross": 0.1, "Reflexes": 0.2, "StopAir": 0.2 },
    ]

  let dPackParam = {};
  dPackParam.oAttr1 = oAttr1;
  dPackParam.oAttr2 = oAttr2;
  dPackParam.oAttr3 = oAttr3;
  dPackParam.oAttr4 = oAttr4;
  dPackParam.dPropertyConfig = dConfig;

  dPackParam.fRateHighest = fRateHighest_Common;
  dPackParam.fRateLowest = fRateLowest_Common;

  ProcedureRate_Base2(oResult, strProcedureName, dPackParam, iCurProcedureIndex, oExtRateEffect, iCallForm);

  //扣除体力
  if (iCallForm == emCallForm_Launch) 
  {
    //console.log("Procedure.js, " + strFuncName + " ReducePower2, dAttackMatchData = ", oExtRateEffect.dAttackMatchData);
    ReducePower2(oExtRateEffect.dAttackMatchData, AttackFromRole.Name, fReducePower_ShotCommon);
  }

  return oResult.fRate;
}

//=====================================================================================================
//计算球员盯防带来的减成
function CalcuMarkingFootmanRate(strFootmanName, mMarkingFootmanMap) {

  let fMarkingFootmanRate = 0.2;
  let fRate = 0.0;
  if (mMarkingFootmanMap[strFootmanName] != null) {
    fRate = fMarkingFootmanRate;
  }

  return fRate;
}

//计算链式防守带来的进攻分数减成
function CalcuLinkDefendRate(DLRole, DCLRole, DCRRole, DRRole, DMCRole, MCRole)
{
  //console.log("Procedure.js, CalcuLinkDefendRate");
  //console.log(DLRole);
  //console.log(DCLRole);
  //console.log(DCRRole);
  //console.log(DRRole);
  //console.log(DMCRole);
  //console.log(MCRole);

  let fRate = 0.0;
  let iTotalTeamwork = 0.0;
  //console.log("Procedure.js, CalcuLinkDefendRate, dGlobalData = ", dGlobalData);
  //console.log("Procedure.js, CalcuLinkDefendRate, dEnum = ", dGlobalData.dEnum);

  let oAttr = GetRoleAttributes(DLRole);
  //console.log("Procedure.js, CalcuLinkDefendRate, oAttr = ", oAttr);
  iTotalTeamwork += parseInt(oAttr[dEnum.ppTeamwork]);
  oAttr = GetRoleAttributes(DCLRole);
  iTotalTeamwork += parseInt(oAttr[dEnum.ppTeamwork]);
  oAttr = GetRoleAttributes(DCRRole);
  iTotalTeamwork += parseInt(oAttr[dEnum.ppTeamwork]);
  oAttr = GetRoleAttributes(DRRole);
  iTotalTeamwork += parseInt(oAttr[dEnum.ppTeamwork]);
  oAttr = GetRoleAttributes(DMCRole);
  iTotalTeamwork += parseInt(oAttr[dEnum.ppTeamwork]);
  oAttr = GetRoleAttributes(MCRole);
  iTotalTeamwork += parseInt(oAttr[dEnum.ppTeamwork]);
  
  //20 * 6
  let cfgData = mCfgTactics["LinkDefend"];
  for (let i = 0; i < cfgData.length; i++)
  {
    if (iTotalTeamwork <= cfgData[i]["TotalTeamwork"])
    {
      fRate = cfgData[i]["Rate"];
      break;
    }
  }
  
  fRate = parseFloat(fRate.toFixed(2));
  //console.log("Procedure.js, CalcuLinkDefendRate, iTotalTeamwork = " + iTotalTeamwork + ", fRate = " + fRate);

  return fRate;
}

//计算比赛节奏带来的分数加成
function CalcuRhythmRate(iRhythmIndex, AttackSCRole, AttackAMLRole, AttackAMRRole, AttackAMCRole, AttackMCRole
                          ,DefendDLRole, DefendDCLRole, DefendDCRRole, DefendDRRole, DefendDMCRole) {
  let fRate = 0.0;

  let dTotal = 
  {
      iTotalAttackAcceleration: 0.0,
      iTotalAttackSpeed: 0.0,
      iTotalAttackAgility: 0.0,
      iTotalAttackStrong: 0.0,
      iTotalDefendAcceleration: 0.0,
      iTotalDefendkSpeed: 0.0,
      iTotalDefendAgility: 0.0,
      iTotalDefendStrong: 0.0,
  }

  RhythmRate_AddData(dTotal, AttackSCRole, 1);
  RhythmRate_AddData(dTotal, AttackAMLRole, 1);
  RhythmRate_AddData(dTotal, AttackAMRRole, 1);
  RhythmRate_AddData(dTotal, AttackAMCRole, 1);
  RhythmRate_AddData(dTotal, AttackMCRole, 1);
  RhythmRate_AddData(dTotal, DefendDLRole, 2);
  RhythmRate_AddData(dTotal, DefendDCLRole, 2);
  RhythmRate_AddData(dTotal, DefendDCRRole, 2);
  RhythmRate_AddData(dTotal, DefendDRRole, 2);
  RhythmRate_AddData(dTotal, DefendDMCRole, 2);
  //console.log(dTotal);
  let iDiff = 0;
  if (iRhythmIndex == dEnum.emRhythm_VerySlow || iRhythmIndex == dEnum.emRhythm_Slow)
  {
    //考虑加速，灵活 
    let iValue1 = dTotal.iTotalAttackAcceleration + dTotal.iTotalAttackAgility;
    let iValue2 = dTotal.iTotalDefendAcceleration + dTotal.iTotalDefendAgility;
    iDiff = iValue1 - iValue2;
  }
  else if (iRhythmIndex == dEnum.emRhythm_VeryFast || iRhythmIndex == dEnum.emRhythm_Fast) 
  {
    //考虑速度，力量
    let iValue1 = dTotal.iTotalAttackSpeed + dTotal.iTotalAttackStrong;
    let iValue2 = dTotal.iTotalDefendkSpeed + dTotal.iTotalDefendStrong;
    iDiff = iValue1 - iValue2;
  }
  else
  {
    fRate = 0.0;
  }

  if (iRhythmIndex == dEnum.emRhythm_Slow || iRhythmIndex == dEnum.emRhythm_Fast)
  {
    let cfgData = mCfgTactics["RhythmRate1"];
    for (let i = 0; i < cfgData.length; i++) {
      if (iDiff <= cfgData[i]["Diff"]) {
        fRate = cfgData[i]["Rate"];
        break;
      }
    }

    fRate = parseFloat(fRate.toFixed(2));
  }
  else if (iRhythmIndex == dEnum.emRhythm_VerySlow || iRhythmIndex == dEnum.emRhythm_VeryFast) {
    let cfgData = mCfgTactics["RhythmRate2"];
    for (let i = 0; i < cfgData.length; i++) {
      if (iDiff <= cfgData[i]["Diff"]) {
        fRate = cfgData[i]["Rate"];
        break;
      }
    }

    fRate = parseFloat(fRate.toFixed(2));
  }
  
  //console.log("Procedure.js, CalcuRhythmRate, iDiff = " + iDiff + ", fRate = " + fRate);

  return fRate;
}

function RhythmRate_AddData(dTotal, oRole, iAttackDefned)
 {
  //console.log("Procedure.js, RhythmRate_AddData, iAttackDefned = " + iAttackDefned + ", dTotal = , oRole = ");
  //console.log(dTotal);
  //console.log(oRole);

  let oAttr = GetRoleAttributes(oRole);
  if (iAttackDefned == 1) {
    dTotal.iTotalAttackAcceleration += parseInt(oAttr[dEnum.ppAcceleration]);
    dTotal.iTotalAttackAgility += parseInt(oAttr[dEnum.ppAgility]);
    dTotal.iTotalAttackSpeed += parseInt(oAttr[dEnum.ppSpeed]);
    dTotal.iTotalAttackStrong += parseInt(oAttr[dEnum.ppStrong]);
  }
  else if (iAttackDefned == 2) {
    dTotal.iTotalDefendAcceleration += parseInt(oAttr[dEnum.ppAcceleration]);
    dTotal.iTotalDefendAgility += parseInt(oAttr[dEnum.ppAgility]);
    dTotal.iTotalDefendkSpeed += parseInt(oAttr[dEnum.ppSpeed]);
    dTotal.iTotalDefendStrong += parseInt(oAttr[dEnum.ppStrong]);
  }
}

//计算球员侵略勇敢差值给防守球员带来的分数加成
function CalcuBraveAggressionRate1(oAttrAttackFromRole, oAttrDefendFromRole) {
  let oAttr1 = oAttrAttackFromRole;
  let oAttr3 = oAttrDefendFromRole;

  let iBrave1 = oAttr1[dEnum.ppBrave];
  let iAggression3 = oAttr3[dEnum.ppAggression];

  let fRate1 = CalcuBARate_(iBrave1, iAggression3);

  let fRate = fRate1;

  //console.log("Procedure.js, CalcuBraveAggressionRate1, fRate = " + fRate);

  return fRate;
}

function CalcuBraveAggressionRate2(oAttrAttackFromRole, oAttrAttackToRole, oAttrDefendFromRole, oAttrDefendToRole) 
{
  let oAttr1 = oAttrAttackFromRole;
  let oAttr2 = oAttrAttackToRole;
  let oAttr3 = oAttrDefendFromRole;
  let oAttr4 = oAttrDefendToRole;

  let iBrave1 = oAttr1[dEnum.ppBrave];
  let iBrave2 = oAttr2[dEnum.ppBrave];
  let iAggression3 = oAttr3[dEnum.ppAggression];
  let iAggression4 = oAttr4[dEnum.ppAggression];

  let fRate1 = CalcuBARate_(iBrave1, iAggression3);
  let fRate2 = CalcuBARate_(iBrave2, iAggression4);

  let fRate = fRate1 + fRate2;

  //console.log("Procedure.js, CalcuBraveAggressionRate2, fRate = " + fRate);

  return fRate;
}

function CalcuBARate_(iBrave, iAggression)
{
  let iDiff = iAggression - iBrave;
  let fRate = 0;
  let cfgData = mCfgTactics["BraveAggressionRate"];
  for (let i = 0; i < cfgData.length; i++) {
    if (iDiff <= cfgData[i]["Diff"]) {
      fRate = cfgData[i]["Rate"];
      break;
    }
  }

  //console.log("Procedure.js, CalcuBARate_, iBrave = " + iBrave + ", iAggression = " + iAggression + ", iDiff = " + iDiff + ", fRate = " + fRate);
  return fRate;
}

//计算战术套路的多步带来的加成
function CalcuProcedureStepsRate(iCurProcedureIndex)
{
  let cfgData = mCfgTactics["StepsRate"];
  let fRate = 0;
  for (let i = 0; i < cfgData.length; i++) {
    if (iCurProcedureIndex <= cfgData[i]["ProcedureIndex"]) {
      fRate = cfgData[i]["Rate"];
      break;
    }
  }

  //console.log("Procedure.js, CalcuProcedureStepsRate, iCurProcedureIndex = " + iCurProcedureIndex + ", fRate = " + fRate);

  return fRate;
}

//计算重点盯防套路带来的减成
function CalcuMarkingRoutineRate(strRoutineName, dOpponentTactics, dOpponentBase) {
  //console.log("Procedure.js, CalcuMarkingRoutineRate, dOpponentBase = ", dOpponentBase);
  //console.log("Procedure.js, CalcuMarkingRoutineRate, dOpponentTactics = ", dOpponentTactics);

  let fRate = 0;
  if (dOpponentTactics.mOpponentDefendMap != null) {
    let dDefendData = dOpponentTactics.mOpponentDefendMap[dOpponentBase.strOpponentName];
    //console.log("Procedure.js, CalcuMarkingRoutineRate, dDefendData = ", dDefendData);
    let mMarkingRoutineMap = dDefendData.mMarkingRoutineMap;
    if (mMarkingRoutineMap[strRoutineName] != null) {
      let iMarkingCount = mMarkingRoutineMap[strRoutineName];
      fRate = 1 - Math.pow(fMarkingRoutine_FixRate, iMarkingCount);
    }
  }

  //console.log("Procedure.js, CalcuMarkingRoutineRate, fRate = " + fRate);
  return fRate;
}

//计算球员体力下降给进攻球员带来的的分数减成
function CalcuPowerReduceAttackRate(oAttrAttackFromRole, oAttrAttackToRole, dAttackData) 
{
  //球的是平均值，所以如果只需要计算一个人的话，两个参数输入同一个人是没有问题的

  //console.log("Procedure.js, CalcuPowerReduceAttackRate");

  //let oAttr1 = GetRoleAttributes(AttackFromRole);
  let oAttr1 = oAttrAttackFromRole;
  //let oAttr2 = GetRoleAttributes(AttackToRole);
  let oAttr2 = oAttrAttackToRole;

  let fRate = 0.0;
  if (dAttackData == null)
    return fRate;

  let dFootmanPerform1 = GetFootmanPerform2(dAttackData, oAttr1[dEnum.ppName]);
  let dFootmanPerform2 = GetFootmanPerform2(dAttackData, oAttr1[dEnum.ppName]);

  let fPowerRate1 = dFootmanPerform1.fPhysicalPower;
  let fPowerRate2 = dFootmanPerform2.fPhysicalPower;

  //if (oAttr2[dEnum.ppName] == "Messi")
  //{
    //fPowerRate2 = 0.75;
    //console.log("Procedure.js, CalcuPowerReduceAttackRate, test reduce power");
  //}
    

  let fWill1 = oAttr1[dEnum.ppWill];
  let fWill2 = oAttr2[dEnum.ppWill];
  
  //console.log("Procedure.js, CalcuPowerReduceAttackRate, fPowerRate1 = " + fPowerRate1 + " fWill1 = " + fWill1);

  let fRate1 = (1 - fPowerRate1) * CalcuPRARate_(fWill1);
  let fRate2 = (1 - fPowerRate2) * CalcuPRARate_(fWill2);

  fRate = (fRate1 + fRate2) / 2;

  //if (oAttr2[dEnum.ppName] == "Messi") {
    //console.log("Procedure.js, CalcuPowerReduceAttackRate, fRate = " + fRate);
  //}
  

  return fRate;
}

//计算球员体力下降给防守球员带来的的分数减成
function CalcuPowerReduceDefendRate(DefendFromRole, DefendToRole, dDefendData) 
{
  //console.log("Procedure.js, CalcuPowerReduceDefendRate");

  let oAttr1 = GetRoleAttributes(DefendFromRole);
  let oAttr2 = GetRoleAttributes(DefendToRole);

  let fRate = 0.0;
  if (dDefendData == null)
    return fRate;

  let dFootmanPerform1 = GetFootmanPerform2(dDefendData, oAttr1[dEnum.ppName]);
  let dFootmanPerform2 = GetFootmanPerform2(dDefendData, oAttr1[dEnum.ppName]);

  let fPowerRate1 = dFootmanPerform1.fPhysicalPower;
  let fPowerRate2 = dFootmanPerform2.fPhysicalPower;

  let fTeamwork1 = oAttr1[dEnum.ppTeamwork];
  let fTeamwork2 = oAttr2[dEnum.ppTeamwork];

  let fRate1 = (1 - fPowerRate1) * CalcuPRARate_(fTeamwork1);
  let fRate2 = (1 - fPowerRate1) * CalcuPRARate_(fTeamwork2);

  fRate = (fRate1 + fRate2) / 2;

  //console.log("Procedure.js, CalcuPowerReduceDefendRate, fRate = " + fRate);

  return fRate;
}

//计算球员体力下降给进攻球员带来的的分数减成(削减多少比例,比如要减一成,就返回0.1)
function CalcuPosFitRate1(emFitA) {
  //return 0; //暂时

  let iValue = 0;
  if (emFitA == dEnum.emPositionFit_1)
    iValue += 2;
  else if (emFitA == dEnum.emPositionFit_2)
    iValue += 1;

  if (iValue == 2)
    return 0;
  else if (iValue == 1)
    return 0.2;
  else
    return 0.3;
}

function CalcuPosFitRate2(emFitA, emFitB) 
{
  //return 0; //暂时
  
  let iValue = 0;
  if (emFitA == dEnum.emPositionFit_1)
    iValue += 2;
  else if (emFitA == dEnum.emPositionFit_2)
    iValue += 1;

  if (emFitB == dEnum.emPositionFit_1)
    iValue += 2;
  else if (emFitB == dEnum.emPositionFit_2)
    iValue += 1;

  if (iValue == 4)
    return 0;
  else if (iValue == 3)
    return 0.1;
  else if (iValue == 2)
    return 0.2;
  else 
    return 0.3;
}

function GetFootmanPerform2(dMatchingData, strFootmanName) {

  let aFootmanPerform = dMatchingData.aFootmanPerform;
  let dFootman = null;
  for (let i = 0; i < aFootmanPerform.length; i++) {
    if (aFootmanPerform[i].strName == strFootmanName) {
      dFootman = aFootmanPerform[i];
      break;
    }
  }
  return dFootman;
}

function ReducePower2(dMatchingData, strFootmanName, fReduceValue) 
{
  //fReduceValue: 扣除的体力值，是一个百分比值

  let dFootmanPerform = GetFootmanPerform2(dMatchingData, strFootmanName);
  if (dFootmanPerform == null) {
    console.error("Procedure.js, ReducePower2, dFootmanPerform == null, strFootmanName = " + strFootmanName);
    return;
  }

  dFootmanPerform.fPhysicalPower -= fReduceValue;
  if (dFootmanPerform.fPhysicalPower < 0)
    dFootmanPerform.fPhysicalPower = 0;
  dFootmanPerform.strPhysicalPower = Math.floor(dFootmanPerform.fPhysicalPower * 100) + "%";

  //console.log("Procedure.js, ReducePower2, strFootmanName = " + strFootmanName + " strPhysicalPower = " + dFootmanPerform.strPhysicalPower + " fReduceValue = " + fReduceValue);
}

function CalcuPRARate_(fAbility) {

  let fRate = (20 - fAbility / 2) * 1.0 / 20;

  //console.log("Procedure.js, CalcuPRARate_, fAbility = " + fAbility + " fRate = " + fRate);
  return fRate;
}

function GetPosWidthRate(iPosWidthIndex, srtProcedureName, strAttOrDef)
{
  //mCfgTactics["PosWidth"][dTactics.iPosWidthIndex]["Attack"]["IncreaseShowDesc"];

  //strAttOrDef: "Attack" or "Defend"
  let fRate = 0.0;
  let fRate1 = mCfgTactics["PosWidth"][iPosWidthIndex][strAttOrDef]["Increase"][srtProcedureName];
  if (fRate1 != null)
    fRate = fRate1;
  else 
  {
    let fRate2 = mCfgTactics["PosWidth"][iPosWidthIndex][strAttOrDef]["Reduce"][srtProcedureName];
    if (fRate2 != null)
      fRate = fRate2;
  }

  //console.log("Procedure.js, GetPosWidthRate, iPosWidthIndex = " + iPosWidthIndex + " srtProcedureName = " + srtProcedureName + " strAttOrDef = " + strAttOrDef + " fRate = " + fRate);

  return fRate;
}

function GetDefendDepthRate(iDefendDepthIndex, srtProcedureName, strAttOrDef) {
  //mCfgTactics["PosWidth"][dTactics.iPosWidthIndex]["Attack"]["IncreaseShowDesc"];

  //strAttOrDef: "Attack" or "Defend"
  let fRate = 0.0;
  let fRate1 = mCfgTactics["DefendDepth"][iDefendDepthIndex][strAttOrDef]["Increase"][srtProcedureName];
  if (fRate1 != null)
    fRate = fRate1;
  else {
    let fRate2 = mCfgTactics["DefendDepth"][iDefendDepthIndex][strAttOrDef]["Reduce"][srtProcedureName];
    if (fRate2 != null)
      fRate = fRate2;
  }

  //console.log("Procedure.js, GetDefendDepthRate, iDefendDepthIndex = " + iDefendDepthIndex + " srtProcedureName = " + srtProcedureName + " strAttOrDef = " + strAttOrDef + " fRate = " + fRate);

  return fRate;
}

