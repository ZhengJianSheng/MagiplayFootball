import DataBus from 'databus'
import GlobalData from 'GlobalData'
var Tactics = require('Tactics')
var Util = require('../utils/util.js')
var mCfgAttackRoutine = require('../data/DataAttackRoutine')
var Perform = require('Perform')
var Commentary = require('Commentary')

let databus = new DataBus();
let dGlobalData = new GlobalData();
let dEnum = dGlobalData.GetEnum();


module.exports =
  {
  AI_PowerSubstitute: AI_PowerSubstitute,
  ReplaceFootman: ReplaceFootman,
  }


//AI根据体力剩余，进行换人
function AI_PowerSubstitute(dMatchingDataArray) 
{
  let dMatchingData = dMatchingDataArray[1];
  //console.log("Substitute.js, AI_PowerSubstitute, begin");

  let dBase = dMatchingData.dBase;
  let dFormation = dMatchingData.dFormation;
  //let dTactics = dMatchingData.dTactics;
  let aPointArray = dFormation.aFormationArray[dFormation.iSelFormIndex];

  let aFootmanPerform = dMatchingData.aFootmanPerform;

  let iSubstituteCount = dEnum.iMaxReplacedCount - dMatchingData.aFootmanReplacedArray.length;
  if (iSubstituteCount <= 0) {
    //console.log("Substitute.js, AI_PowerSubstitute, return 1");
    return;
  }

  //console.log("Substitute.js, AI_PowerSubstitute, iSubstituteCount = " + iSubstituteCount);

  let aDataArray = [];
  for (var i = 0; i < aPointArray.length; i++) {
    let strFootmanName = aPointArray[i].strName;
    let dOneData = Perform.GetDataFromFootmanPerform(aFootmanPerform, strFootmanName);
    if (dOneData.fPhysicalPower < dEnum.fSubstitutePower) {
      aDataArray.push(
        {
          "strFootmanName": strFootmanName,
          "fPhysicalPower": dOneData.fPhysicalPower,
          "strPos": aPointArray[i].strPos,
          "strPos2": aPointArray[i].strPos2,
        })
    }
  }

  if (aDataArray.length == 0) {
    //console.log("Substitute.js, AI_PowerSubstitute, return 2");
    return;
  }

  Util.SortArray(aDataArray, "fPhysicalPower", dEnum.emSort_Up);

  //console.log("Substitute.js, AI_PowerSubstitute, aDataArray = ", aDataArray);

  let iLeftCount = iSubstituteCount;
  for (let i = 0; i < aDataArray.length; i++) {

    //console.log("Substitute.js, AI_PowerSubstitute, aDataArray.length = ", aDataArray.length + " i = " + i + " iLeftCount = " + iLeftCount);

    if (iLeftCount <= 0)
      break;

    //换人
    let strWeakMan = aDataArray[i].strFootmanName;
    let strWeakPosition1 = aDataArray[i].strPos;
    let strWeakPosition2 = aDataArray[i].strPos2;
    let strNewMan = FindGoodFootmanToReplace(dMatchingData, strWeakMan, strWeakPosition1, strWeakPosition2);
    if (strNewMan == "")
      continue;

    //console.log("Substitute.js, AI_PowerSubstitute, strWeakMan = " + strWeakMan + " strWeakPosition1 = " + strWeakPosition1 + " strWeakPosition2 = " + strWeakPosition2 + " strNewMan = " + strNewMan);

    ReplaceFootman(dMatchingDataArray[1], strWeakMan, strNewMan, dMatchingDataArray[0]);

    let strCommentary = Commentary.MakeCommentary_MakeReplaceText(dBase.strTeamName, strWeakMan, strNewMan);
    Commentary.AddCommentary(dGlobalData.aCommentaryArray, dEnum.emCommentaryType_System, strCommentary, 0);

    iLeftCount--;
  }

  //console.log("Substitute.js, AI_PowerSubstitute, end");
}

//找个合适的人来替换需要被换下的人
function FindGoodFootmanToReplace(dMatchingData, strWeakMan, strWeakPosition1, strWeakPosition2) {
  //console.log("Substitute.js, FindGoodFootmanToReplace, begin, strWeakMan = " + strWeakMan + " strWeakPosition1 = " + strWeakPosition1 + " strWeakPosition2 = " + strWeakPosition2);

  let dTeam = dMatchingData.dTeam;
  let dFormation = dMatchingData.dFormation;
  let aPointArray = dFormation.aFormationArray[dFormation.iSelFormIndex];
  let strNewMan = "";

  let aValidFootmanArray = []; //可以用于换人的数组

  //console.log("Substitute.js, FindGoodFootmanToReplace, dTeam.aFootmanArray = ", dTeam.aFootmanArray);

  for (let i = 0; i < dTeam.aFootmanArray.length; i++) {
    let strThisMan = dTeam.aFootmanArray[i].Name;
    //判断是不是自己
    if (strThisMan == strWeakMan)
      continue;

    //判断是不是已经在场上
    let bIsValid = true;
    for (let j = 0; j < aPointArray.length; j++) {
      if (strThisMan == aPointArray[j].strName) {
        bIsValid = false;
        break;
      }
    }
    if (bIsValid == false)
      continue;

    //判断是不是已经被换下的
    for (let j = 0; j < dMatchingData.aFootmanReplacedArray; j++) {
      if (strThisMan == dMatchingData.aFootmanReplacedArray[j]) {
        bIsValid = false;
        break;
      }
    }
    if (bIsValid == false)
      continue;

    aValidFootmanArray.push(dTeam.aFootmanArray[i]);

  }

  //console.log("Substitute.js, FindGoodFootmanToReplace, aValidFootmanArray = ", aValidFootmanArray);

  for (let i = 0; i < aValidFootmanArray.length; i++) {
    if (strWeakPosition1 == aValidFootmanArray[i].PositionA) {
      strNewMan = aValidFootmanArray[i].Name;
      break;
    }
  }
  if (strNewMan == "") {
    for (let i = 0; i < aValidFootmanArray.length; i++) {
      if (strWeakPosition1 == aValidFootmanArray[i].PositionB) {
        strNewMan = aValidFootmanArray[i].Name;
        break;
      }
    }
  }
  if (strNewMan == "") {
    for (let i = 0; i < aValidFootmanArray.length; i++) {
      if (strWeakPosition1 == aValidFootmanArray[i].PositionC) {
        strNewMan = aValidFootmanArray[i].Name;
        break;
      }
    }
  }
  if (strNewMan == "") {
    for (let i = 0; i < aValidFootmanArray.length; i++) {
      if (strWeakPosition2 == aValidFootmanArray[i].PositionA) {
        strNewMan = aValidFootmanArray[i].Name;
        break;
      }
    }
  }
  if (strNewMan == "") {
    for (let i = 0; i < aValidFootmanArray.length; i++) {
      if (strWeakPosition2 == aValidFootmanArray[i].PositionB) {
        strNewMan = aValidFootmanArray[i].Name;
        break;
      }
    }
  }
  if (strNewMan == "") {
    for (let i = 0; i < aValidFootmanArray.length; i++) {
      if (strWeakPosition2 == aValidFootmanArray[i].PositionC) {
        strNewMan = aValidFootmanArray[i].Name;
        break;
      }
    }
  }
  //console.log("Substitute.js, FindGoodFootmanToReplace, end, strNewMan = " + strNewMan);

  return strNewMan;
}

//换人
function ReplaceFootman(dMatchingData, strOldMan, strNewMan, dOtherMatchingData) {
  console.log("Substitute.js, ReplaceFootman, begin, strOldMan = " + strOldMan + " strNewMan = " + strNewMan);

  let dTeam = dMatchingData.dTeam;
  let dFormation = dMatchingData.dFormation;
  let aPointArray = dFormation.aFormationArray[dFormation.iSelFormIndex];
  let iPointIndex = -1;

  //修改上阵数据
  let dPoint = null;
  for (let i = 0; i < aPointArray.length; i++) {
    if (aPointArray[i].strName == strOldMan) {
      dPoint = aPointArray[i];
      iPointIndex = i;
      break;
    }
  }
  if (dPoint == null) {
    console.error("Substitute.js, ReplaceFootman, dPoint == null, strOldMan = " + strOldMan)
    return;
  }

  //判断strNewMan是不是阵中的人
  {
    for (let i = 0; i < aPointArray.length; i++) {
      if (aPointArray[i].strName == strNewMan) {
        //做替换就行了
        let dNewPoint = aPointArray[i];
        let dOldPoint = dPoint;

        let dTemp = {ID: dOldPoint.ID, LikeNumber: dOldPoint.LikeNumber, strName: dOldPoint.strName};
        dOldPoint.ID = dNewPoint.ID;
        dOldPoint.LikeNumber = dNewPoint.LikeNumber;
        dOldPoint.strName = dNewPoint.strName;
        dNewPoint.ID = dTemp.ID;
        dNewPoint.LikeNumber = dTemp.LikeNumber;
        dNewPoint.strName = dTemp.strName;
        //let dTempPoint = databus.InitOnePoint(dOldPoint.x, dOldPoint.y, dOldPoint.ID, dOldPoint.LikeNumber, dOldPoint.strName, dOldPoint.strDesc, dOldPoint.strPos, dOldPoint.strPos2, 0);
        //dOldPoint = databus.InitOnePoint(dNewPoint.x, dNewPoint.y, dNewPoint.ID, dNewPoint.LikeNumber, dNewPoint.strName, dNewPoint.strDesc, dNewPoint.strPos, dNewPoint.strPos2, 0);
        //dNewPoint = databus.InitOnePoint(dTempPoint.x, dTempPoint.y, dTempPoint.ID, dTempPoint.LikeNumber, dTempPoint.strName, dTempPoint.strDesc, dTempPoint.strPos, dTempPoint.strPos2, 0);
        return;
      }
    }
  }

  //console.log("Substitute.js, ReplaceFootman, dPoint = ", dPoint);

  let dTeamManData = null;
  for (let i = 0; i < dTeam.aFootmanArray.length; i++) {
    let strThisMan = dTeam.aFootmanArray[i].Name;
    //判断是不是自己
    if (strThisMan == strNewMan) {
      dTeamManData = dTeam.aFootmanArray[i];
      break;
    }
  }
  if (dTeamManData == null) {
    console.error("Substitute.js, ReplaceFootman, dTeamManData == null, strNewMan = " + strNewMan)
    return;
  }

  //console.log("Substitute.js, ReplaceFootman, dTeamManData = ", dTeamManData);

  dFormation.aFormationArray[dFormation.iSelFormIndex][iPointIndex] = databus.InitOnePoint(dPoint.x, dPoint.y, dTeamManData.ID, dTeamManData.LikeNumber, strNewMan, dPoint.strDesc, dPoint.strPos, dPoint.strPos2, 0);

  dMatchingData.aFootmanReplacedArray.push(strOldMan);

  //console.log("Substitute.js, ReplaceFootman, aFootmanReplacedArray = ", dMatchingData.aFootmanReplacedArray);
  //console.log("Substitute.js, ReplaceFootman, aPointArray = ", dFormation.aFormationArray[dFormation.iSelFormIndex]);

  //修改表现数据
  Perform.MarkFootmanFieldStatus(dMatchingData, strNewMan, dEnum.emFieldStatus_InField);
  Perform.MarkFootmanFieldStatus(dMatchingData, strOldMan, dEnum.emFieldStatus_OutField);

  

  //--------------------------------------------------------------
  {
    let dDefendData = dOtherMatchingData.dTactics.mOpponentDefendMap[dOtherMatchingData.dBase.strOpponentName];
    //console.log("Substitute.js, ReplaceFootman, mMarkingFootmanMap = ", Util.DeepCopy(dDefendData.mMarkingFootmanMap));
    if (dDefendData.mMarkingFootmanMap[strOldMan] != null)
    {
      delete dDefendData.mMarkingFootmanMap[strOldMan];
      dOtherMatchingData.dTactics.iLeftDefendPoint++;
    }
    //console.log("Substitute.js, ReplaceFootman, mMarkingFootmanMap = ", Util.DeepCopy(dDefendData.mMarkingFootmanMap));
  }

  //console.log("Substitute.js, ReplaceFootman, end");

}
