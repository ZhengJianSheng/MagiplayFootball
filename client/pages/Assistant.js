import DataBus from 'databus'
//var Tactics = require('Tactics')
//var util = require('../utils/util.js')
//var mCfgAttackRoutine = require('../data/DataAttackRoutine')
let databus = new DataBus();
var mCfgClub = require('../data/DataClub')
var mCfgFootman = require('../data/DataFootman')

import GlobalData from 'GlobalData'

var Perform = require('Perform')
var Util = require('../utils/util.js')
var Commentary = require('Commentary')

let dGlobalData = new GlobalData();
let dEnum = dGlobalData.GetEnum();

module.exports =
  {
  CheckPowerSubstitute: CheckPowerSubstitute,
  AssisantSelectFootman: AssisantSelectFootman,
  //SwitchSelectFootman: SwitchSelectFootman,
  AutoSelectFootman: AutoSelectFootman,
  AssisantSelectFootman2: AssisantSelectFootman2,
  }

//根据体力剩余，提醒换人
function CheckPowerSubstitute(aCommentaryArray, aPointArray, aFootmanPerform, iSubstituteCount) 
{
  //console.log("Assistant.js, CheckPowerSubstitute, aPointArray = ", aPointArray);
  //console.log("Assistant.js, CheckPowerSubstitute, aFootmanPerform = ", aFootmanPerform);

  let aDataArray = [];
  for (var i = 0; i < aPointArray.length; i++) {
    let strFootmanName = aPointArray[i].strName;
    let dOneData = Perform.GetDataFromFootmanPerform(aFootmanPerform, strFootmanName);
    if (dOneData.fPhysicalPower < dEnum.fSubstitutePower)
    {
      aDataArray.push({ "strFootmanName": strFootmanName, "fPhysicalPower": dOneData.fPhysicalPower, "strPhysicalPower": dOneData.strPhysicalPower })
    }
  }

  if (aDataArray.length == 0)
    return;

  Util.SortArray(aDataArray, "fPhysicalPower", 1);

  let iLoopCount = iSubstituteCount;
  if (aDataArray.length < iLoopCount)
    iLoopCount = aDataArray.length;

  for (let i = 0; i < iLoopCount; i++)
  {
    let strCommentary = Commentary.MakeCommentary_SubstituteRewind(aDataArray[i].strFootmanName, aDataArray[i].strPhysicalPower);
    Commentary.AddCommentary(aCommentaryArray, dEnum.emCommentaryType_System, strCommentary, 0);
  }
}

function AssisantSelectFootman() {

  let dBase = databus.dBase;
  let strClubName = dBase.strTeamName;
  let dCfgClub = mCfgClub[strClubName];
  let dFormation = databus.dFormation;
  let iFormationCount = 3;
  //for (let j = 0; j < iFormationCount; j++) 
  let j = dFormation.iSelFormIndex;
  {
    let aPointArray = dFormation.aFormationArray[j];
    for (let strPos in dCfgClub.Formation.FootmanList) {
      let strFootmanName = dCfgClub.Formation.FootmanList[strPos];
      let ID = mCfgFootman[strFootmanName].ID;
      let strNumber = mCfgFootman[strFootmanName].LikeNumber;
      for (let i = 0; i < aPointArray.length; i++) {
        if (aPointArray[i].strPos == strPos || aPointArray[i].strPos2 == strPos) {
          aPointArray[i] = databus.InitOnePoint(aPointArray[i].x, aPointArray[i].y, ID, strNumber, strFootmanName, aPointArray[i].strDesc, aPointArray[i].strPos, aPointArray[i].strPos2, 0);
          break;
        }
      }
    }
  }
}


function AssisantSelectFootman2() {

  let dTeam = databus.dTeam;
  let dFormation = databus.dFormation;
  let aPointArray = dFormation.aFormationArray[dFormation.iSelFormIndex];
  for (let i = 0; i < aPointArray.length; i++) {
    aPointArray[i].ID = 0;
    aPointArray[i].strNumber = "";
    aPointArray[i].strName = "";
  }

  let aFootmanArray = dTeam.aFootmanArray;
  //console.log("Assistant.js, AssisantSelectFootman2, aFootmanArray = ", aFootmanArray);
  //--------------------------------------------------------
  //PositionA
  for (let i = 0; i < aPointArray.length; i++) {
    
    if (aPointArray[i].ID != 0)
      continue;

    let iTopAbility = 0;
    let iTopAbilityIndex = -1;
    for (let j = 0; j < aFootmanArray.length; j++) {
      let dFootman = aFootmanArray[j];
      let strName = dFootman.Name;

      //判断是不是已经在阵上
      let bAlreadyIn = false;
      for (let k = 0; k < aPointArray.length; k++) {
        if (aPointArray[k].strName == strName) {
          bAlreadyIn = true;
          break;
        }
      }
      if (bAlreadyIn == true)
        continue;
      //console.log("Assistant.js, AssisantSelectFootman2, strPos = " + aPointArray[i].strPos + " strName = " + strName);

      let dCfgFootman = mCfgFootman[strName];
      if (PositionEqual(aPointArray[i].strPos, dCfgFootman.PositionA) == false)
        continue;
      //console.log("Assistant.js, AssisantSelectFootman2, strPos = " + aPointArray[i].strPos + " PositionA = " + dCfgFootman.PositionA);

      let iAbility = dCfgFootman.Ability;
      if (iAbility > iTopAbility)
      {
        iTopAbility = iAbility;
        iTopAbilityIndex = j;
      }
      //console.log("Assistant.js, AssisantSelectFootman2, iTopAbility = " + iTopAbility + " iTopAbilityIndex = " + iTopAbilityIndex);
    }

    //找到合适球员了
    if (iTopAbilityIndex != -1)
    {
      let dBestFootman = aFootmanArray[iTopAbilityIndex];
      //console.log("Assistant.js, AssisantSelectFootman2, iTopAbilityIndex = " + iTopAbilityIndex + " iTopAbility = " + iTopAbility + " strPos = " + aPointArray[i].strPos + " strName = " + dBestFootman.Name);
      aPointArray[i] = databus.InitOnePoint(aPointArray[i].x, aPointArray[i].y, dBestFootman.ID, dBestFootman.LikeNumber, dBestFootman.Name, aPointArray[i].strDesc, aPointArray[i].strPos, aPointArray[i].strPos2, 0);
    }
  }

  //--------------------------------------------------------
  //PositionB
  for (let i = 0; i < aPointArray.length; i++) {

    if (aPointArray[i].ID != 0)
      continue;

    let iTopAbility = 0;
    let iTopAbilityIndex = -1;
    for (let j = 0; j < aFootmanArray.length; j++) {
      let dFootman = aFootmanArray[j];
      let strName = dFootman.Name;

      //判断是不是已经在阵上
      let bAlreadyIn = false;
      for (let k = 0; k < aPointArray.length; k++) {
        if (aPointArray[k].strName == strName) {
          bAlreadyIn = true;
          break;
        }
      }
      if (bAlreadyIn == true)
        continue;
      //console.log("Assistant.js, AssisantSelectFootman2, strPos = " + aPointArray[i].strPos + " strName = " + strName);

      let dCfgFootman = mCfgFootman[strName];
      if (PositionEqual(aPointArray[i].strPos, dCfgFootman.PositionB) == false)
        continue;
      //console.log("Assistant.js, AssisantSelectFootman2, strPos = " + aPointArray[i].strPos + " PositionA = " + dCfgFootman.PositionA);

      let iAbility = dCfgFootman.Ability;
      if (iAbility > iTopAbility) {
        iTopAbility = iAbility;
        iTopAbilityIndex = j;
      }
      //console.log("Assistant.js, AssisantSelectFootman2, iTopAbility = " + iTopAbility + " iTopAbilityIndex = " + iTopAbilityIndex);
    }

    //找到合适球员了
    if (iTopAbilityIndex != -1) {
      let dBestFootman = aFootmanArray[iTopAbilityIndex];
      //console.log("Assistant.js, AssisantSelectFootman2, iTopAbilityIndex = " + iTopAbilityIndex + " iTopAbility = " + iTopAbility + " strPos = " + aPointArray[i].strPos + " strName = " + dBestFootman.Name);
      aPointArray[i] = databus.InitOnePoint(aPointArray[i].x, aPointArray[i].y, dBestFootman.ID, dBestFootman.LikeNumber, dBestFootman.Name, aPointArray[i].strDesc, aPointArray[i].strPos, aPointArray[i].strPos2, 0);
    }
  }

  //--------------------------------------------------------
  //PositionC
  for (let i = 0; i < aPointArray.length; i++) {

    if (aPointArray[i].ID != 0)
      continue;

    let iTopAbility = 0;
    let iTopAbilityIndex = -1;
    for (let j = 0; j < aFootmanArray.length; j++) {
      let dFootman = aFootmanArray[j];
      let strName = dFootman.Name;

      //判断是不是已经在阵上
      let bAlreadyIn = false;
      for (let k = 0; k < aPointArray.length; k++) {
        if (aPointArray[k].strName == strName) {
          bAlreadyIn = true;
          break;
        }
      }
      if (bAlreadyIn == true)
        continue;
      //console.log("Assistant.js, AssisantSelectFootman2, strPos = " + aPointArray[i].strPos + " strName = " + strName);

      let dCfgFootman = mCfgFootman[strName];
      if (PositionEqual(aPointArray[i].strPos, dCfgFootman.PositionC) == false)
        continue;
      //console.log("Assistant.js, AssisantSelectFootman2, strPos = " + aPointArray[i].strPos + " PositionA = " + dCfgFootman.PositionA);

      let iAbility = dCfgFootman.Ability;
      if (iAbility > iTopAbility) {
        iTopAbility = iAbility;
        iTopAbilityIndex = j;
      }
      //console.log("Assistant.js, AssisantSelectFootman2, iTopAbility = " + iTopAbility + " iTopAbilityIndex = " + iTopAbilityIndex);
    }

    //找到合适球员了
    if (iTopAbilityIndex != -1) {
      let dBestFootman = aFootmanArray[iTopAbilityIndex];
      //console.log("Assistant.js, AssisantSelectFootman2, iTopAbilityIndex = " + iTopAbilityIndex + " iTopAbility = " + iTopAbility + " strPos = " + aPointArray[i].strPos + " strName = " + dBestFootman.Name);
      aPointArray[i] = databus.InitOnePoint(aPointArray[i].x, aPointArray[i].y, dBestFootman.ID, dBestFootman.LikeNumber, dBestFootman.Name, aPointArray[i].strDesc, aPointArray[i].strPos, aPointArray[i].strPos2, 0);
    }
  }

  //--------------------------------------------------------
  //strPos PositionABC
  for (let i = 0; i < aPointArray.length; i++) {

    if (aPointArray[i].ID != 0)
      continue;

    let iTopAbility = 0;
    let iTopAbilityIndex = -1;
    for (let j = 0; j < aFootmanArray.length; j++) {
      let dFootman = aFootmanArray[j];
      let strName = dFootman.Name;

      //判断是不是已经在阵上
      let bAlreadyIn = false;
      for (let k = 0; k < aPointArray.length; k++) {
        if (aPointArray[k].strName == strName) {
          bAlreadyIn = true;
          break;
        }
      }
      if (bAlreadyIn == true)
        continue;
      //console.log("Assistant.js, AssisantSelectFootman2, strPos = " + aPointArray[i].strPos + " strName = " + strName);

      let dCfgFootman = mCfgFootman[strName];
      if (PositionEqual(aPointArray[i].strPos2, dCfgFootman.PositionA) == false && 
        PositionEqual(aPointArray[i].strPos2, dCfgFootman.PositionB) == false &&
        PositionEqual(aPointArray[i].strPos2, dCfgFootman.PositionC) == false)
        continue;
      //console.log("Assistant.js, AssisantSelectFootman2, strPos = " + aPointArray[i].strPos + " PositionA = " + dCfgFootman.PositionA);

      let iAbility = dCfgFootman.Ability;
      if (iAbility > iTopAbility) {
        iTopAbility = iAbility;
        iTopAbilityIndex = j;
      }
      //console.log("Assistant.js, AssisantSelectFootman2, iTopAbility = " + iTopAbility + " iTopAbilityIndex = " + iTopAbilityIndex);
    }

    //找到合适球员了
    if (iTopAbilityIndex != -1) {
      let dBestFootman = aFootmanArray[iTopAbilityIndex];
      //console.log("Assistant.js, AssisantSelectFootman2, iTopAbilityIndex = " + iTopAbilityIndex + " iTopAbility = " + iTopAbility + " strPos = " + aPointArray[i].strPos + " strName = " + dBestFootman.Name);
      aPointArray[i] = databus.InitOnePoint(aPointArray[i].x, aPointArray[i].y, dBestFootman.ID, dBestFootman.LikeNumber, dBestFootman.Name, aPointArray[i].strDesc, aPointArray[i].strPos, aPointArray[i].strPos2, 0);
    }
  }
}

function PositionEqual(strPos1, strPos2) {
  if (strPos1 == "MC") {
    if (strPos2 == "MCL")
      return true;
    else if (strPos2 == "MCR")
      return true;
    else
      return (strPos1 == strPos2)
  }
  else if (strPos1 == "DC") {
    if (strPos2 == "DCL")
      return true;
    else if (strPos2 == "DCR")
      return true;
    else
      return (strPos1 == strPos2)
  }
  else if (strPos2 == "MC") {
    if (strPos1 == "MCL")
      return true;
    else if (strPos1 == "MCR")
      return true;
    else
      return (strPos1 == strPos2)
  }
  else if (strPos2 == "DC") {
    if (strPos1 == "DCL")
      return true;
    else if (strPos1 == "DCR")
      return true;
    else
      return (strPos1 == strPos2)
  }
  else
    return (strPos1 == strPos2)
}

//切换阵型时自动选择球员
/*
function SwitchSelectFootman(dFormation, iOldIndex, iNewIndex) {

  //console.log("databus.js, SwitchSelectFootman");

  let aOldArray = dFormation.aFormationArray[iOldIndex];
  let aNewArray = dFormation.aFormationArray[iNewIndex];

  AutoSelectFootman(aOldArray, aNewArray);
}
*/

function AutoSelectFootman(aOldArray, aNewArray) {

  //console.log("databus.js, AutoSelectFootman");

  if (dGlobalData.bInMatch == true) {
    for (let i = 0; i < aNewArray.length; i++) {
      aNewArray[i].ID = 0;
      aNewArray[i].strName = 0;
      aNewArray[i].strNumber = 0;
    }
  }

  //PositionA
  for (let i = 0; i < aNewArray.length; i++) {
    if (aNewArray[i].ID != 0)
      continue;

    for (let j = 0; j < aOldArray.length; j++) {
      let strFootmanName = aOldArray[j].strName;
      if (strFootmanName == "")
        continue;
      //console.log("databus.js, SwitchSelectFootman, strPos = " + aNewArray[i].strPos + " PositionA = " + mCfgFootman[strFootmanName].PositionA + " strFootmanName = " + strFootmanName);
      if (PositionEqual(mCfgFootman[strFootmanName].PositionA, aNewArray[i].strPos)) {
        let bAlreadyIn = false;
        for (let k = 0; k < aNewArray.length; k++) {
          if (aNewArray[k].strName == strFootmanName) {
            bAlreadyIn = true;
            break;
          }
        }
        if (bAlreadyIn == true) {
          //console.log("databus.js, SwitchSelectFootman, already in");
          continue;
        }

        let ID = mCfgFootman[strFootmanName].ID;
        let strNumber = mCfgFootman[strFootmanName].LikeNumber;
        aNewArray[i] = databus.InitOnePoint(aNewArray[i].x, aNewArray[i].y, ID, strNumber, strFootmanName, aNewArray[i].strDesc, aNewArray[i].strPos, aNewArray[i].strPos2, 0);
        //console.log("databus.js, SwitchSelectFootman, find! strFootmanName = " + strFootmanName);
        break;
      }
    }
  }

  //console.log("databus.js, SwitchSelectFootman, Sel PointArray = ", dFormation.aFormationArray[dFormation.iSelFormIndex]);

  //PositionB
  for (let i = 0; i < aNewArray.length; i++) {
    if (aNewArray[i].ID != 0)
      continue;

    for (let j = 0; j < aOldArray.length; j++) {
      let strFootmanName = aOldArray[j].strName;
      if (strFootmanName == "")
        continue;
      //console.log("databus.js, SwitchSelectFootman, strPos = " + aNewArray[i].strPos + " PositionB = " + mCfgFootman[strFootmanName].PositionB + " strFootmanName = " + strFootmanName);
      if (PositionEqual(mCfgFootman[strFootmanName].PositionB, aNewArray[i].strPos)) {
        let bAlreadyIn = false;
        for (let k = 0; k < aNewArray.length; k++) {
          if (aNewArray[k].strName == strFootmanName) {
            bAlreadyIn = true;
            break;
          }
        }
        if (bAlreadyIn == true) {
          //console.log("databus.js, SwitchSelectFootman, already in");
          continue;
        }

        let ID = mCfgFootman[strFootmanName].ID;
        let strNumber = mCfgFootman[strFootmanName].LikeNumber;
        aNewArray[i] = databus.InitOnePoint(aNewArray[i].x, aNewArray[i].y, ID, strNumber, strFootmanName, aNewArray[i].strDesc, aNewArray[i].strPos, aNewArray[i].strPos2, 0);
        //console.log("databus.js, SwitchSelectFootman, find! strFootmanName = " + strFootmanName);
        break;
      }
    }
  }

  //PositionC
  for (let i = 0; i < aNewArray.length; i++) {
    if (aNewArray[i].ID != 0)
      continue;

    for (let j = 0; j < aOldArray.length; j++) {
      let strFootmanName = aOldArray[j].strName;
      if (strFootmanName == "")
        continue;
      //console.log("databus.js, SwitchSelectFootman, strPos = " + aNewArray[i].strPos + " PositionC = " + mCfgFootman[strFootmanName].PositionC + " strFootmanName = " + strFootmanName);
      if (PositionEqual(mCfgFootman[strFootmanName].PositionC, aNewArray[i].strPos)) {
        let bAlreadyIn = false;
        for (let k = 0; k < aNewArray.length; k++) {
          if (aNewArray[k].strName == strFootmanName) {
            bAlreadyIn = true;
            break;
          }
        }
        if (bAlreadyIn == true) {
          //console.log("databus.js, SwitchSelectFootman, already in");
          continue;
        }

        let ID = mCfgFootman[strFootmanName].ID;
        let strNumber = mCfgFootman[strFootmanName].LikeNumber;
        aNewArray[i] = databus.InitOnePoint(aNewArray[i].x, aNewArray[i].y, ID, strNumber, strFootmanName, aNewArray[i].strDesc, aNewArray[i].strPos, aNewArray[i].strPos2, 0);
        //console.log("databus.js, SwitchSelectFootman, find! strFootmanName = " + strFootmanName);
        break;
      }
    }
  }

  //不管什么位置了，有人就选
  for (let i = 0; i < aNewArray.length; i++) {
    if (aNewArray[i].ID != 0)
      continue;

    for (let j = 0; j < aOldArray.length; j++) {
      let strFootmanName = aOldArray[j].strName;
      if (strFootmanName == "")
        continue;

      let bAlreadyIn = false;
      for (let k = 0; k < aNewArray.length; k++) {
        if (aNewArray[k].strName == strFootmanName) {
          bAlreadyIn = true;
          break;
        }
      }
      if (bAlreadyIn == true)
        continue;

      let ID = mCfgFootman[strFootmanName].ID;
      let strNumber = mCfgFootman[strFootmanName].LikeNumber;
      aNewArray[i] = databus.InitOnePoint(aNewArray[i].x, aNewArray[i].y, ID, strNumber, strFootmanName, aNewArray[i].strDesc, aNewArray[i].strPos, aNewArray[i].strPos2, 0);
    }
  }
}