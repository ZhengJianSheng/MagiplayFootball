
import DataBus from 'databus'
import GlobalData from 'GlobalData'
var Tactics = require('Tactics')
var Util = require('../utils/util.js')
var mCfgAttackRoutine = require('../data/DataAttackRoutine')
var mCfgTactics = require('../data/DataTactics')
var Perform = require('Perform')
var Commentary = require('Commentary')

let databus = new DataBus();
let dGlobalData = new GlobalData();
let dEnum = dGlobalData.GetEnum();


module.exports =
{
  SetMarkingBySucceedRate: SetMarkingBySucceedRate,
  SetMarking: SetMarking,
  ClearMarking: ClearMarking,
  CheckDoMarking: CheckDoMarking,
  SelectRoutine,
}

//AI根据进攻套路成功率，进行盯防
function SetMarkingBySucceedRate(dBase, dFormation, dTactics, dOpponentBase, dOpponentFormation, dOpponentTactics) {

  //console.log("AI.js, SetMarkingBySucceedRate, dFormation = ", dFormation);
  //console.log("AI.js, SetMarkingBySucceedRate, dOpponentFormation = ", dOpponentFormation);
  //----------------------------------------------------------------------------------
  //设置盯人
  
  {
    let mRoutineMap = Tactics.GetValidRoutineMap(dOpponentTactics, dOpponentFormation)
    let aShoterArray = [];  //成功率排序用
    //把每个球员的套路输放进数组
    for (let strRoutineName in mRoutineMap) {
      // [{ID:0, strPos: "", strName:"", strDesc:"", fRate:0.0f, iUsedAttackCount: 0}]
      //let fRate = Tactics.GetRoutineSucceedRate(dOpponentTactics, dOpponentFormation, strRoutineName, dBase, dTactics, dFormation);
      let strFootmanName = Tactics.GetFootmanNameFromPos(dOpponentFormation, mRoutineMap[strRoutineName].ShotRole);

      let bHasFind = false;
      for (let i = 0; i < aShoterArray.length; i++) {
        if (aShoterArray[i].strFootmanName == strFootmanName) {
          aShoterArray[i].iCount += 1;
          bHasFind = true;
          break;
        }
      }
      if (bHasFind == false) {
        aShoterArray.push({ "strFootmanName": strFootmanName, "iCount": 1 })
      }
    }
    //onsole.log("AI.js, SetMarkingBySucceedRate, aShoterArray = ", Util.DeepCopy(aShoterArray));
    //根据次数排序
    Util.SortArray(aShoterArray, "iCount");
    //console.log("AI.js, SetMarkingBySucceedRate, aShoterArray = ", Util.DeepCopy(aShoterArray));

    //获得可以盯人的次数
    let iMarkingFootmanCount = parseInt((dTactics.iLeftDefendPoint / 2).toFixed(0));
    if (iMarkingFootmanCount > aShoterArray.length)
      iMarkingFootmanCount = aShoterArray.length;

    //设置订谁
    let dDefnedData = dTactics.mOpponentDefendMap[dBase.strOpponentName];

    for (let i = 0; i < iMarkingFootmanCount; i++) {
      let strName = aShoterArray[i].strFootmanName;
      //console.log("AI.js, SetMarking, strName = " + strName);
      dDefnedData.mMarkingFootmanMap[strName] = 1;
      dTactics.iLeftDefendPoint--;
    }
    //console.log("AI.js, SetMarkingBySucceedRate, mMarkingFootmanMap = ", dDefnedData.mMarkingFootmanMap);
  }
  
  //----------------------------------------------------------------------------------
  //设置盯防套路

  {
    let mRoutineMap = Tactics.GetValidRoutineMap(dOpponentTactics, dOpponentFormation)
    let aRoutineArray = [];
    for (let strRoutineName in mRoutineMap) {
      // [{ID:0, strPos: "", strName:"", strDesc:"", fRate:0.0f, iUsedAttackCount: 0}]
      let bConsiderMarking = true;
      let fRate = Tactics.GetRoutineSucceedRate(dOpponentTactics, dOpponentFormation, strRoutineName, dBase, dTactics, dFormation, bConsiderMarking);
      let strFootmanName = Tactics.GetFootmanNameFromPos(dOpponentFormation, mRoutineMap[strRoutineName].ShotRole);

      aRoutineArray.push({ "strRoutineName": strRoutineName, "fRate": fRate })
    }

    //console.log("AI.js, SetMarkingBySucceedRate, aRoutineArray = ", Util.DeepCopy(aRoutineArray));
    //根据成功率排序
    Util.SortArray(aRoutineArray, "fRate");
    //console.log("AI.js, SetMarkingBySucceedRate, aRoutineArray = ", Util.DeepCopy(aRoutineArray));

    //获得可以盯防的次数
    let iMarkingRoutineCount = dTactics.iLeftDefendPoint;
    if (iMarkingRoutineCount > aRoutineArray.length)
      iMarkingRoutineCount = aRoutineArray.length;

    //console.log("AI.js, SetMarking, iMarkingRoutineCount = ", iMarkingRoutineCount + " iLeftDefendPoint = " + dTactics.iLeftDefendPoint);
    let dDefnedData = dTactics.mOpponentDefendMap[dBase.strOpponentName];
    for (let i = 0; i < iMarkingRoutineCount; i++) {
      //console.log("AI.js, SetMarking, aRoutineArray[" + i + "] = ", aRoutineArray[i]);
      let strRoutineName = aRoutineArray[i].strRoutineName;
      //console.log("AI.js, SetMarking, strRoutineName = " + strRoutineName);
      if (dDefnedData.mMarkingRoutineMap[strRoutineName] == null)
        dDefnedData.mMarkingRoutineMap[strRoutineName] = 0;
      dDefnedData.mMarkingRoutineMap[strRoutineName] += 1;
      dTactics.iLeftDefendPoint--;
    }
    //console.log("AI.js, SetMarkingBySucceedRate, mMarkingRoutineMap = ", dDefnedData.mMarkingRoutineMap);
  }
}

//AI根据玩家已经设置了次数的套路，进行盯防
function SetMarking(dBase, dFormation, dTactics, dOpponentBase, dOpponentFormation, dOpponentTactics)
{
  //console.log("AI.js, SetMarking, iLeftDefendPoint = " + dTactics.iLeftDefendPoint);

  //--------------------------------------------------------------------------------------
  //获得我方进攻套路列表, 放进数组
  let aShoterArray = [];
  for (let strRoutineName in dOpponentTactics.mRoutineCountMap)
  {
    let iRoutineCount = dOpponentTactics.mRoutineCountMap[strRoutineName];
    if (iRoutineCount <= 0)
      continue;

    let dConfigRoutine = mCfgAttackRoutine[strRoutineName];
    let strShotPos = dConfigRoutine["ShotRole"];
    let strFootmanName = Tactics.GetFootmanNameFromPos(dOpponentFormation, strShotPos);
    
    let bHasFind = false;
    for (let i = 0; i < aShoterArray.length; i++)
    {
      if (aShoterArray[i].strFootmanName == strFootmanName)
      {
        aShoterArray[i].iCount += iRoutineCount;
        bHasFind = true;
        break;
      }
    }
    if (bHasFind == false)
    {
      aShoterArray.push({ "strFootmanName": strFootmanName, "iCount": iRoutineCount})
    }
  }

  //console.log("AI.js, SetMarking, aShoterArray = ", Util.DeepCopy(aShoterArray));
  //对数组进行排序
  Util.SortArray(aShoterArray, "iCount");
  //console.log("AI.js, SetMarking, aShoterArray = ", aShoterArray);
  //console.log("AI.js, SetMarking, dBase = ", dBase);

  //获得可以盯人的次数
  //console.log("AI.js, SetMarking, iLeftDefendPoint = ", dTactics.iLeftDefendPoint);
  let iMarkingFootmanCount = parseInt( (dTactics.iLeftDefendPoint / 2).toFixed(0) );
  //console.log("AI.js, SetMarking, iMarkingFootmanCount = ", iMarkingFootmanCount);
  if (iMarkingFootmanCount > aShoterArray.length)
    iMarkingFootmanCount = aShoterArray.length;

  for (let i = 0; i < iMarkingFootmanCount; i++)
  {
    let dDefnedData = dTactics.mOpponentDefendMap[dBase.strOpponentName];
    let strName = aShoterArray[i].strFootmanName;
    //console.log("AI.js, SetMarking, strName = " + strName);
    dDefnedData.mMarkingFootmanMap[strName] = 1;
    dTactics.iLeftDefendPoint--;
  }
  //console.log("AI.js, SetMarking, dTactics = ", dTactics);

  //console.log("AI.js, SetMarking, iLeftDefendPoint = " + dTactics.iLeftDefendPoint);
  //--------------------------------------------------------------------------------------
  //获得对方进攻套路列表
  let aRoutineArray = [];
  for (let strRoutineName in dOpponentTactics.mRoutineCountMap) {
    let iRoutineCount = dOpponentTactics.mRoutineCountMap[strRoutineName];
    if (iRoutineCount <= 0)
      continue;

    let bConsiderMarking = true;
    let fRate = Tactics.GetRoutineSucceedRate(dOpponentTactics, dOpponentFormation, strRoutineName, dBase, dTactics, dFormation, bConsiderMarking);

    let bHasFind = false;
    for (let i = 0; i < aRoutineArray.length; i++) {
      if (aRoutineArray[i].strRoutineName == strRoutineName) {
        aRoutineArray[i].fRate += fRate;
        bHasFind = true;
        break;
      }
    }
    if (bHasFind == false) {
      aRoutineArray.push({ "strRoutineName": strRoutineName, "fRate": fRate })
    }
  }
  //console.log("AI.js, SetMarking, aRoutineArray = ", Util.DeepCopy(aRoutineArray));

  //根据成功率排序
  Util.SortArray(aRoutineArray, "fRate");
  //console.log("AI.js, SetMarking, aRoutineArray = ", aRoutineArray);

  //获得可以盯防的次数
  let iMarkingRoutineCount = dTactics.iLeftDefendPoint;
  if (iMarkingRoutineCount > aRoutineArray.length)
    iMarkingRoutineCount = aRoutineArray.length;

  //console.log("AI.js, SetMarking, iMarkingRoutineCount = ", iMarkingRoutineCount + " iLeftDefendPoint = " + dTactics.iLeftDefendPoint);
  let dDefnedData = dTactics.mOpponentDefendMap[dBase.strOpponentName];
  for (let i = 0; i < iMarkingRoutineCount; i++) {
    //console.log("AI.js, SetMarking, aRoutineArray[" + i + "] = ", aRoutineArray[i]);
    let strRoutineName = aRoutineArray[i].strRoutineName;
    //console.log("AI.js, SetMarking, strRoutineName = " + strRoutineName);
    if (dDefnedData.mMarkingRoutineMap[strRoutineName] == null)
      dDefnedData.mMarkingRoutineMap[strRoutineName] = 0;
    dDefnedData.mMarkingRoutineMap[strRoutineName] += 1;
    dTactics.iLeftDefendPoint--;
  }
  //console.log("AI.js, SetMarking, mMarkingRoutineMap = ", dDefnedData.mMarkingRoutineMap);
  //console.log("AI.js, SetMarking, iLeftDefendPoint = " + dTactics.iLeftDefendPoint);
}

//清空盯人(重置战术)
function ClearMarking(dBase, dFormation, dTactics) 
{
  //console.log("AI.js, ClearMarking, iLeftDefendPoint = " + dTactics.iLeftDefendPoint);

  let dDefnedData = dTactics.mOpponentDefendMap[dBase.strOpponentName];

  //console.log("AI.js, ClearMarking, mMarkingFootmanMap = ", dDefnedData.mMarkingFootmanMap);

  for (let strName in dDefnedData.mMarkingFootmanMap)
  {
    delete dDefnedData.mMarkingFootmanMap[strName];
    dTactics.iLeftDefendPoint++;
  }

  //console.log("AI.js, ClearMarking, iLeftDefendPoint = " + dTactics.iLeftDefendPoint);

  for (let strRoutineName in dDefnedData.mMarkingRoutineMap) {
    dTactics.iLeftDefendPoint += dDefnedData.mMarkingRoutineMap[strRoutineName];
    delete dDefnedData.mMarkingRoutineMap[strRoutineName];
  }

  //console.log("AI.js, ClearMarking, iLeftDefendPoint = " + dTactics.iLeftDefendPoint);
}

function CheckDoMarking(dBase, dFormation, dTactics, dOpponentBase, dOpponentFormation, dOpponentTactics) 
{



}

//---------------------------------------------------------------------------------------
//寻找最优战术套路
function SelectRoutine(dBase, dFormation, dTactics, dOpponentBase, dOpponentFormation, dOpponentTactics, bConsiderMarking)
{
  //console.log("AI.js, SelectRoutine, start");
  //console.log("AI.js, SelectRoutine, bConsiderMarking = ", bConsiderMarking);

  let mRoutineMap = Tactics.GetValidRoutineMap(dTactics, dFormation)
  let aRoutineArray = [];
  for (let strRoutineName in mRoutineMap) {
    // [{ID:0, strPos: "", strName:"", strDesc:"", fRate:0.0f, iUsedAttackCount: 0}]
    let fRate = Tactics.GetRoutineSucceedRate(dTactics, dFormation, strRoutineName, dOpponentBase, dOpponentTactics, dOpponentFormation, bConsiderMarking);
    let strFootmanName = Tactics.GetFootmanNameFromPos(dFormation, mRoutineMap[strRoutineName].ShotRole);

    aRoutineArray.push({ "strRoutineName": strRoutineName, "fRate": fRate, "strFootmanName": strFootmanName, })
  }

  //console.log("AI.js, SelectRoutine, aRoutineArray = ", Util.DeepCopy(aRoutineArray));
  //根据成功率排序
  Util.SortArray(aRoutineArray, "fRate");
  //console.log("AI.js, SelectRoutine, aRoutineArray = ", Util.DeepCopy(aRoutineArray));

  //获得进攻次数
  let iAttackPoint = mCfgTactics.MentalPoint[dTactics.iMentalIndex].Attack
  //console.log("AI.js, SelectRoutine, iAttackPoint = " + iAttackPoint);
  let iLoopCount = iAttackPoint;
  if (iLoopCount > aRoutineArray.length)
    iLoopCount = aRoutineArray.length;

  dTactics.mRoutineCountMap = {};
  let mUsedFootman = {};
  let iUsedCount = 0;
  for (let i = 0; i < iLoopCount; i++)
  {
    //console.log("AI.js, SelectRoutine, mRoutineCountMap = ", Util.DeepCopy(dTactics.mRoutineCountMap));
    if (mUsedFootman[aRoutineArray[i].strFootmanName] != null)
      continue;
    dTactics.mRoutineCountMap[aRoutineArray[i].strRoutineName] = 1;
    mUsedFootman[aRoutineArray[i].strFootmanName] = 1;
    iUsedCount++;
  }
  
  //console.log("AI.js, SelectRoutine, step1, mRoutineCountMap = ", Util.DeepCopy(dTactics.mRoutineCountMap));
  if (iUsedCount < iLoopCount)
  {
    let iLeftLoopCount = iLoopCount - iUsedCount;
    for (let i = 0; i < iLeftLoopCount; i++) {
      if (dTactics.mRoutineCountMap[aRoutineArray[i].strRoutineName] != null)
      {
        dTactics.mRoutineCountMap[aRoutineArray[i].strRoutineName] = 1;
      }
    }
  }

  //console.log("AI.js, SelectRoutine, step2, mRoutineCountMap = ", Util.DeepCopy(dTactics.mRoutineCountMap));
}