import GlobalData from 'GlobalData'

var Procedure = require('Procedure')
var mCfgFootman = require('../data/DataFootman')
var Util = require('../utils/util.js')

let dGlobalData = new GlobalData();
let dEnum = dGlobalData.GetEnum();

module.exports = {
  GetDataFromFootmanPerform: GetDataFromFootmanPerform,
  AddSucceedProcedure: AddSucceedProcedure,
  AddFailProcedure: AddFailProcedure,
  AddGoal: AddGoal,
  AddAssist: AddAssist,
  AddShotOnTarget: AddShotOnTarget,
  AddControl: AddControl,
  AddTackling: AddTackling,
  ReducePower: ReducePower,
  MarkFootmanFieldStatus: MarkFootmanFieldStatus,
  RoutineFinish: RoutineFinish,
}

function GetMatchingData(aMatchingDataArray, iTeamID) {

  let aMatchingData = null;
  if (iTeamID == 1)
    aMatchingData = aMatchingDataArray[0];
  else if (iTeamID == 2)
    aMatchingData = aMatchingDataArray[1];

  return aMatchingData;
}

function GetFootmanPerform(aMatchingDataArray, iTeamID, strFootmanName)
{

  let aMatchingData = GetMatchingData(aMatchingDataArray, iTeamID);

  return Procedure.GetFootmanPerform2(aMatchingData, strFootmanName) ;
}


function GetTeamPerform(aMatchingDataArray, iTeamID) 
{
  let aMatchingData = null;
  if (iTeamID == 1)
    aMatchingData = aMatchingDataArray[0];
  else if (iTeamID == 2)
    aMatchingData = aMatchingDataArray[1];

  let mTeamPerform = aMatchingData.mTeamPerform;
  
  return mTeamPerform;
}

//标记某个球员被换下
function MarkFootmanFieldStatus(dMatchingData, strFootmanName, iFieldStatus)
{
  //let dMatchingData = GetMatchingData(aMatchingDataArray, iTeamID);

  let dFootman = Procedure.GetFootmanPerform2(dMatchingData, strFootmanName);
  if (dFootman == null)
  {
    console.error("Perfomr.js, MarkFootmanOutField, dFootman == null, strFootmanName = " + strFootmanName);
    console.error("Perfomr.js, MarkFootmanOutField, dFootman == null, dMatchingData = ", dMatchingData);
  }
  
  dFootman.iFieldStatus = iFieldStatus;
  //console.log("Perfomr.js, MarkFootmanOutField, dFootman = ",  dFootman);
  
  //console.log("Perform.js, MarkFootmanFieldStatus, 1 aFootmanPerform = ", Util.DeepCopy(aMatchingData.aFootmanPerform));
  dGlobalData.SortFootmanPerform(dMatchingData.aFootmanPerform, "iFieldStatus");
  //console.log("Perform.js, MarkFootmanFieldStatus, 2 aFootmanPerform = ", Util.DeepCopy(aMatchingData.aFootmanPerform));
}

function GetPerformProcedureData(mTeamPerform, strProcedureName)
{
  for (let i = 0; i < mTeamPerform.aProcedureArray.length; i++)
  {
    if (mTeamPerform.aProcedureArray[i].strProcedureName == strProcedureName)
      return mTeamPerform.aProcedureArray[i];
  }

  return null;
}

function GetPerformRoutineData(mTeamPerform, strRoutineName)
{
  for (let i = 0; i < mTeamPerform.aRoutineArray.length; i++)
  {
    if (mTeamPerform.aRoutineArray[i].strRoutineName == strRoutineName)
      return mTeamPerform.aRoutineArray[i];
  }

  return null;
}


function AddSucceedProcedure(strProcedureType, aMatchingDataArray, iTeamID, strFootmanName) 
{
  let dFootman = GetFootmanPerform(aMatchingDataArray, iTeamID, strFootmanName);
  if (dFootman == null)
    console.error("Perfomr.js, AddSucceedProcedure, dFootman == null, strFootmanName = " + strFootmanName);
  let mTeamPerform = GetTeamPerform(aMatchingDataArray, iTeamID);
  if (mTeamPerform == null)
    console.error("Perfomr.js, AddFailProcedure, mTeamPerform == null, iTeamID = " + iTeamID);

  //console.log("Perfomr.js, AddSucceedProcedure, dFootman = ");
  //console.log(dFootman);

  if (Procedure.IsPassProcedure(strProcedureType) == true)
  {
    dFootman.iPassSucceed++;
    dFootman.iPassTotal = dFootman.iPassSucceed + dFootman.iPassFail;
    mTeamPerform.iPassSucceed++;
    mTeamPerform.iPassTotal = mTeamPerform.iPassSucceed + mTeamPerform.iPassFail;
    mTeamPerform.strPassPercent = parseFloat((mTeamPerform.iPassSucceed * 100.0 / mTeamPerform.iPassTotal).toFixed(0)) + "%";
    //console.log("Perfomr.js, AddSucceedProcedure, iPassSucceed++, strFootmanName = " + strFootmanName + " iPassTotal = " + dFootman.iPassTotal + " iPassSucceed = " + dFootman.iPassSucceed + " iPassFail = " + dFootman.iPassFail);
  }
  else if (Procedure.IsShotProcedure(strProcedureType) == true)
  {
    dFootman.iShot++;
    mTeamPerform.iShot++;
  }

  //console.log("Perfomr.js, AddSucceedProcedure, dFootman = ");
  //console.log(dFootman);
  
  let dProcedure = GetPerformProcedureData(mTeamPerform, strProcedureType);
  dProcedure.iTotalCount++;
  dProcedure.iSucceedCount++;
  dProcedure.strSucceedRate = parseFloat((dProcedure.iSucceedCount * 100.0 / dProcedure.iTotalCount).toFixed(0)) + "%";
  if (dProcedure.mFootmanData[strFootmanName] == null)
    dProcedure.mFootmanData[strFootmanName] = 0;
  dProcedure.mFootmanData[strFootmanName]++;
}

function AddFailProcedure(strProcedureType, aMatchingDataArray, iTeamID, strFootmanName) 
{
  let dFootman = GetFootmanPerform(aMatchingDataArray, iTeamID, strFootmanName);

  if (dFootman == null)
    console.error("Perfomr.js, AddFailProcedure, dFootman == null, strFootmanName = " + strFootmanName);

  let mTeamPerform = GetTeamPerform(aMatchingDataArray, iTeamID);
  if (mTeamPerform == null)
    console.error("Perfomr.js, AddFailProcedure, mTeamPerform == null, iTeamID = " + iTeamID);
  
  if (Procedure.IsPassProcedure(strProcedureType) == true) 
  {
    dFootman.iPassFail++;
    dFootman.iPassTotal = dFootman.iPassSucceed + dFootman.iPassFail;
    mTeamPerform.iPassFail++;
    mTeamPerform.iPassTotal = mTeamPerform.iPassSucceed + mTeamPerform.iPassFail;
    mTeamPerform.strPassPercent = parseFloat((mTeamPerform.iPassSucceed * 100.0 / mTeamPerform.iPassTotal).toFixed(0)) + "%";
    //console.log("Perfomr.js, AddFailProcedure, iPassFail++, strFootmanName = " + strFootmanName + " iPassTotal = " + dFootman.iPassTotal + " iPassSucceed = " + dFootman.iPassSucceed + " iPassFail = " + dFootman.iPassFail);
  }
  else if (Procedure.IsShotProcedure(strProcedureType) == true) 
  {
    dFootman.iShot++;
    mTeamPerform.iShot++;
  }

  //console.log("Perfomr.js, AddFailProcedure, dFootman = ");
  //console.log(dFootman);

  let dProcedure = GetPerformProcedureData(mTeamPerform, strProcedureType);
  dProcedure.iTotalCount++;
  //dProcedure.iSucceedCount++; 失败的话这里就不加了
  dProcedure.strSucceedRate = parseFloat((dProcedure.iSucceedCount * 100.0 / dProcedure.iTotalCount).toFixed(0)) + "%";
  if (dProcedure.mFootmanData[strFootmanName] == null)
    dProcedure.mFootmanData[strFootmanName] = 0;
  dProcedure.mFootmanData[strFootmanName]++;
}


function AddGoal(aMatchingDataArray, iTeamID, strFootmanName) 
{
  let dFootman = GetFootmanPerform(aMatchingDataArray, iTeamID, strFootmanName);

  if (dFootman == null)
    console.error("Perfomr.js, AddGoal, dFootman == null, strFootmanName = " + strFootmanName);

  dFootman.iGoal++;

  let mTeamPerform = GetTeamPerform(aMatchingDataArray, iTeamID);
  if (mTeamPerform == null)
    console.error("Perfomr.js, AddGoal, mTeamPerform == null, iTeamID = " + iTeamID);
  mTeamPerform.iGoal++;
}

function AddAssist(aMatchingDataArray, iTeamID, strFootmanName) 
{
  let dFootman = GetFootmanPerform(aMatchingDataArray, iTeamID, strFootmanName);
  if (dFootman == null)
    console.error("Perfomr.js, AddAssist, dFootman == null, strFootmanName = " + strFootmanName);

  dFootman.iAssist++;
}

function AddShotOnTarget(aMatchingDataArray, iTeamID, strFootmanName) {
  let dFootman = GetFootmanPerform(aMatchingDataArray, iTeamID, strFootmanName);
  if (dFootman == null)
    console.error("Perfomr.js, AddShotOnTarget, dFootman == null, strFootmanName = " + strFootmanName);

  dFootman.iShotOnTarget++;

  let mTeamPerform = GetTeamPerform(aMatchingDataArray, iTeamID);
  if (mTeamPerform == null)
    console.error("Perfomr.js, AddShotOnTarget, mTeamPerform == null, iTeamID = " + iTeamID);

  mTeamPerform.iShotOnTarget++;
}

function AddControl(aMatchingDataArray, iTeamID, iAddValue) {

  let mTeamPerform = GetTeamPerform(aMatchingDataArray, iTeamID);
  if (mTeamPerform == null)
    console.error("Perfomr.js, AddShotOnTarget, mTeamPerform == null, iTeamID = " + iTeamID);

  mTeamPerform.iControl += iAddValue;

  //console.log("Perfomr.js, AddControl, iTeamID = " + iTeamID + " iControl = " + mTeamPerform.iControl);
}


function AddTackling(aMatchingDataArray, iTeamID, strFootmanName) 
{
  let dFootman = GetFootmanPerform(aMatchingDataArray, iTeamID, strFootmanName);
  if (dFootman == null)
    console.error("Perfomr.js, AddTackling, dFootman == null, strFootmanName = " + strFootmanName);
  dFootman.iTackling++;

  let mTeamPerform = GetTeamPerform(aMatchingDataArray, iTeamID);
  if (mTeamPerform == null)
    console.error("Perfomr.js, AddTackling, mTeamPerform == null, iTeamID = " + iTeamID);
  mTeamPerform.iTackling++;
}


//扣除体力
function ReducePower(aMatchingDataArray, iTeamID) 
{
  let aMatchingData = null;
  if (iTeamID == 1)
    aMatchingData = aMatchingDataArray[0];
  else if (iTeamID == 2)
    aMatchingData = aMatchingDataArray[1];

  let dFormation = aMatchingData.dFormation;
  let dTactics = aMatchingData.dTactics;

  //获取比赛节奏
  let iRhythmIndex = dTactics.iRhythmIndex;

  //遍历每个球员
  let aPointArray = dFormation.aFormationArray[dFormation.iSelFormIndex];
  for (let i = 0; i < aPointArray.length; i++) 
  {
    let strFootmanName = aPointArray[i].strName;
    let dFootmanPerform = GetFootmanPerform(aMatchingDataArray, iTeamID, strFootmanName);
    if (dFootmanPerform == null)
    {
      console.error("Perfomr.js, functionReducePower, dFootmanPerform == null, strFootmanName = " + strFootmanName);
      continue;
    }
      
    //获取耐力值
    let oFootman = mCfgFootman[strFootmanName];
    let oAttr = Procedure.GetRoleAttributes(oFootman);
    let iEndurance = oAttr[dEnum.ppEndurance];

    let fRhythmRate = 1.0
    if (iRhythmIndex == 0)
      fRhythmRate = 0.8;
    else if (iRhythmIndex == 1)
      fRhythmRate = 0.9;
    else if (iRhythmIndex == 2)
      fRhythmRate = 1.0;
    else if (iRhythmIndex == 3)
      fRhythmRate = 1.1;
    else if (iRhythmIndex == 4)
      fRhythmRate = 1.2;

    let fBaseValue = 0.003; //基础扣除体能值 0.003%(每分钟)
    let fReduceValue = fBaseValue * ((10 - iEndurance) * 1.0 / 20 + 1.0) * fRhythmRate;
  
    dFootmanPerform.fPhysicalPower -= fReduceValue;
    if (dFootmanPerform.fPhysicalPower < 0)
      dFootmanPerform.fPhysicalPower = 0;
    dFootmanPerform.strPhysicalPower = Math.floor(dFootmanPerform.fPhysicalPower * 100) + "%";

    //console.log("Perfomr.js, ReducePower, strPhysicalPower = " + dFootmanPerform.strPhysicalPower + " fReduceValue = " + fReduceValue + " iRhythmIndex = " + iRhythmIndex + " iEndurance = " + iEndurance);
  }
}


function GetDataFromFootmanPerform(aFootmanPerform, strFootmanName) {
  for (let i = 0; i < aFootmanPerform.length; i++) {
    if (aFootmanPerform[i].strName == strFootmanName) {
      return aFootmanPerform[i];
    }
  }

  return null;
}

function RoutineFinish(dMatchingData, strRoutineName, bIsSucceed, fProgramValue)
{
  //fProgramValue: 完成度，float类型，0到1

  let dRoutine = GetPerformRoutineData(dMatchingData.mTeamPerform, strRoutineName);
  dRoutine.iTotalCount++;
  dRoutine.fTotalProgramValue += fProgramValue;
  
  if (bIsSucceed == true)
  {
    dRoutine.iSucceedCount++;
  }
  dRoutine.strAverageProgram = parseFloat((dRoutine.fTotalProgramValue * 100.0 / dRoutine.iTotalCount ).toFixed(0)) + "%";

  //console.log("Perform.js, RoutineFinish, mTeamPerform = ", dMatchingData.mTeamPerform);
  //console.log("Perform.js, RoutineFinish, strRoutineName = " + strRoutineName + " bIsSucceed = " + bIsSucceed + " fProgramValue = " + fProgramValue + 
  //  " strAverageProgram = " + dRoutine.strAverageProgram);
}