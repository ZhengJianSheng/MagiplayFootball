//import DataBus from 'databus'
import GlobalData from 'GlobalData'

var mCfgClub = require('../data/DataClub')

//let databus = new DataBus();

//var Procedure = require('Procedure')
//var mCfgFootman = require('../data/DataFootman')
//var mCfgAttackRoutine = require('../data/DataAttackRoutine')

let dGlobalData = new GlobalData();
let dEnum = dGlobalData.GetEnum();

module.exports = 
{
  GetTeamChineseName: GetTeamChineseName,
  AddCommentary: AddCommentary,
  MakeCommentary_Goal: MakeCommentary_Goal,
  MakeCommentary_Shot: MakeCommentary_Shot,
  MakeCommentary_Pass: MakeCommentary_Pass,
  MakeCommentary_Tackling: MakeCommentary_Tackling,
  MakeCommentary_Marking: MakeCommentary_Marking,
  MakeCommentary_DefendStopShot: MakeCommentary_DefendStopShot,
  MakeCommentary_ShotOutTarget: MakeCommentary_ShotOutTarget,
  MakeCommentary_GoalKeeperHoldBall: MakeCommentary_GoalKeeperHoldBall,
  MakeCommentary_GoalKeeperStopShot: MakeCommentary_GoalKeeperStopShot,
  MakeCommentary_Dribble: MakeCommentary_Dribble,
  MakeCommentary_GameReady: MakeCommentary_GameReady,
  MakeCommentary_GameStart: MakeCommentary_GameStart,
  MakeCommentary_FirstHalfEnd: MakeCommentary_FirstHalfEnd,
  MakeCommentary_SecondHalfStart: MakeCommentary_SecondHalfStart,
  MakeCommentary_GameEnd: MakeCommentary_GameEnd,
  MakeCommentary_HoldBall: MakeCommentary_HoldBall,
  MakeCommentary_LauchAttack: MakeCommentary_LauchAttack,
  MakeCommentary_RunRestri: MakeCommentary_RunRestri,
  MakeCommentary_RunRestriFail: MakeCommentary_RunRestriFail,
  MakeCommentary_MiddleSnatch: MakeCommentary_MiddleSnatch,
  MakeCommentary_SubstituteRewind: MakeCommentary_SubstituteRewind,
  MakeUsedRoutineText: MakeUsedRoutineText,   //这不是一个解说，借宝地一用
  MakeCommentary_MakeReplaceText: MakeCommentary_MakeReplaceText,
  MakeCommentary_ChangeTacticsNotify: MakeCommentary_ChangeTacticsNotify,
}

function InitOneCommentary(iType, strText, emTeamID, iMinute, iSecond) {
  let data =
    {
      iType: iType,
      strText: strText,
      iTeamID: emTeamID,
      strMinute: FixStrTime(iMinute),
      strSecond: FixStrTime(iSecond),
    }
  return data;
}

function FixStrTime(iNumber) 
{
  let strNumber = "";
  if (iNumber < 10)
    strNumber = "0" + iNumber.toString();
  else
    strNumber = iNumber.toString();

  return strNumber;
}

//添加解说
function AddCommentary(aCommentaryArray, emCommentaryType, strCommentary, emTeamID) 
{
  //console.log("match.hs, AddCommentary, emCommentaryType = " + emCommentaryType + ", strCommentary = " + strCommentary + ", emTeamID = " + emTeamID);
  if (strCommentary == "")
    return;
  if (emTeamID == null) {
    console.error("match.hs, AddCommentary, emTeamID == null");
    return;
  }

  aCommentaryArray.push(InitOneCommentary(emCommentaryType, strCommentary, emTeamID, dGlobalData.iMinute, dGlobalData.iSecond));
}

function GetTeamChineseName(strTeamName)
{
  if (strTeamName == "")
  {
    return "";
  }

  let dCfgClub = mCfgClub[strTeamName];
  return dCfgClub.Chinese;
}
//=====================================================================================================
//进球
function MakeCommentary_Goal(strShooterName, strAssisterName, strProcedureType)
{
  //console.log("Commentary.js, MakeCommentary_Goal,  strProcedureType = " + strProcedureType);
  /*
  let strPassDesc = "";
  if (strProcedureType == "ShortPass")
    strPassDesc = "短传喂饼";
  else if (strProcedureType == "DirectPass")
    strPassDesc = "直传";
  else if (strProcedureType == "NeutralPass")
    strPassDesc = "妙传";
  else if (strProcedureType == "LongPass")
    strPassDesc = "长传";

  let strCommentary = strShooterName + "进球了！！！助攻来自" + strAssisterName + "的" + strPassDesc + "。";
  */
  let strCommentary = strShooterName + "进球了！！！来自" + strAssisterName + "的助攻。";

  return strCommentary;
}

//射门
function MakeCommentary_Shot(strShooterName, strProcedureType)
{
  //console.log("Commentary.js, MakeCommentary_Shot,  strProcedureType = " + strProcedureType);
  //strShooterName = '<color=#D2691E>' + strShooterName + '</font>';
  //strShooterName = '<font style="color:#D2691E">' + strShooterName + '</font>';

  let strCommentary = "";
  if (strProcedureType == dEnum.emLeftShot)
    strCommentary = strShooterName + "在大禁区内切后左脚劲射！";
  else if (strProcedureType == dEnum.emRightShot)
    strCommentary = strShooterName + "在大禁区内切后右脚劲射！";
  else if (strProcedureType == dEnum.emShot)
    strCommentary = strShooterName + "在门前一个角度刁钻的射门！";
  else if (strProcedureType == dEnum.emHeadShot)
    strCommentary = strShooterName + "头球射门！";
  else if (strProcedureType == dEnum.emLongShot)
    strCommentary = strShooterName + "大力远射！";

  return strCommentary;
}

//传球
function MakeCommentary_Pass(strPassFrom, strPassTo, strProcedureType) 
{
  //console.log("Commentary.js, MakeCommentary_Pass,  strProcedureType = " + strProcedureType);
  let strCommentary = "";
  if (strProcedureType == "ShortPass")
  {
    strCommentary = strPassFrom + "把球传给" + strPassTo;
  }
  else if (strProcedureType == "DirectPass")
  {
    strCommentary = strPassFrom + "直塞传给" + strPassTo;
  } 
  else if (strProcedureType == "NeutralPass")
  {
    strCommentary = strPassFrom + "传给跑空档的" + strPassTo;
  }
  else if (strProcedureType == "LongPass")
  {
    strCommentary = strPassFrom + "长传给" + strPassTo;
  }
    
  return strCommentary;
}

//抢断
function MakeCommentary_Tackling(strPassFrom, strDefendFrom, strProcedureType) 
{
  //console.log("Commentary.js, MakeCommentary_Tackling,  strProcedureType = " + strProcedureType);
  //let strCommentary = strDefendFrom + "从" + strPassFrom + "脚下抢下了皮球";
  let strCommentary = "皮球被" + strDefendFrom + "抢断了";

  return strCommentary;
}

//拦截
function MakeCommentary_Marking(strPassTo, strDefendTo, strProcedureType) 
{
  //console.log("Commentary.js, MakeCommentary_Marking,  strProcedureType = " + strProcedureType);
  //let strCommentary = strDefendTo + "抢在" + strPassTo + "之前拦截下皮球";
  let strCommentary = "皮球被" + strDefendTo + "拦截了";

  return strCommentary;
}

//后卫封堵射门
function MakeCommentary_DefendStopShot(strShooterName, strDefendFrom, strProcedureType)
{
  let strCommentary = strDefendFrom + "成功封堵住" + strShooterName + "的射门";

  return strCommentary;
}

//射门不中目标
function MakeCommentary_ShotOutTarget(strShooterName) {

  let strCommentary = strShooterName + "的射门打偏了";

  return strCommentary;
}

//射门被扑住
function MakeCommentary_GoalKeeperHoldBall(strShooterName, strGKName, strProcedureType) {

  let strCommentary = "";
  if (strProcedureType == "HeadShot")
    //strCommentary = strShooterName + "的头球力方向太正，" + strGKName + "站着就把球没收了";
    strCommentary = strGKName + "救住了" + strShooterName + "的头球";
  else
    //strCommentary = strGKName + "反应灵敏，扑救住" + strShooterName + "的射门";
    strCommentary = strGKName + "救住了" + strShooterName + "的射门";

  return strCommentary;
}

//门将挡出射门
function MakeCommentary_GoalKeeperStopShot(strShooterName, strGKName, strProcedureType) {

  let strCommentary = "";
  if (strProcedureType == "HeadShot")
    //strCommentary = strShooterName + "的头球速度不够，" + strGKName + "伸手挡出了射门";
    strCommentary = strGKName + "挡出了" + strShooterName + "的头球";
  else
    //strCommentary = strGKName + "奋力挡出了" + strShooterName + "的劲射";
    strCommentary = strGKName + "挡出了" + strShooterName + "的射门";

  return strCommentary;
}

//盘带过人
function MakeCommentary_Dribble(strDribblerName, strDefendFrom, strProcedureType) 
{
  let strCommentary = strDribblerName + "华丽的盘带过掉了" + strDefendFrom;

  return strCommentary;
}

//比赛准备开始
function MakeCommentary_GameReady() {
  let strCommentary = "比赛准备开始";
  //console.log("Commentary.js, MakeCommentary_GameReady,  strCommentary = " + strCommentary);
  return strCommentary;
}

//比赛开始
function MakeCommentary_GameStart() {
  let strCommentary = "比赛开始了！";

  return strCommentary;
}
//上半场结束
function MakeCommentary_FirstHalfEnd(iScore1, strTeamName1, iScore2, strTeamName2) {
  let strCommentary = "";
  if (iScore1 > iScore2)
    strCommentary = "上半场结束，" + GetTeamChineseName(strTeamName1) + "暂时" + iScore1 + "比" + iScore2 + "领先" + GetTeamChineseName(strTeamName2);
  else if (iScore2 > iScore1)
    strCommentary = "上半场结束，" + GetTeamChineseName(strTeamName2) + "暂时" + iScore2 + "比" + iScore1 + "领先" + GetTeamChineseName(strTeamName1);
  else 
    strCommentary = "上半场结束，" + GetTeamChineseName(strTeamName1) + "和" + GetTeamChineseName(strTeamName2) + "暂时" + iScore1 + "比" + iScore2 + "打成平手";
  return strCommentary;
}
//下半场开始
function MakeCommentary_SecondHalfStart() {
  let strCommentary = "下半场的比赛开始了！";

  return strCommentary;
}
//比赛结束
function MakeCommentary_GameEnd(iScore1, strTeamName1, iScore2, strTeamName2) {
  //console.log("Commentary.js, MakeCommentary_GameEnd");
  let strCommentary = "";
  if (iScore1 > iScore2)
    strCommentary = "比赛结束了，" + GetTeamChineseName(strTeamName1) + iScore1 + "比" + iScore2 + "战胜了" + GetTeamChineseName(strTeamName2) + "！！";
  else if (iScore2 > iScore1)
    strCommentary = "比赛结束了，" + GetTeamChineseName(strTeamName2) + iScore2 + "比" + iScore1 + "战胜了" + GetTeamChineseName(strTeamName1) + "！！";
  else
    strCommentary = "比赛结束了，" + GetTeamChineseName(strTeamName1) + "和" + GetTeamChineseName(strTeamName2) + "" + iScore1 + "比" + iScore2 + "打成平手";
  return strCommentary;
}

//获得球权
function MakeCommentary_HoldBall(strTeamName) {
  let strCommentary = GetTeamChineseName(strTeamName) + "获得了球权";
  //console.log("Commentary.js, MakeCommentary_HoldBall,  strCommentary = " + strCommentary);
  return strCommentary;
}

//发起进攻
function MakeCommentary_LauchAttack(strTeamName) {
  let strCommentary = GetTeamChineseName(strTeamName) + "发起进攻";
  return strCommentary;
}


//尝试跑位
function MakeCommentary_RunRestri(strRunerName) 
{
  let strCommentary = strRunerName + "往禁区跑位";
  return strCommentary;
}

//跑位失败
function MakeCommentary_RunRestriFail(strRunerName, strDefendFrom) 
{
  //let strCommentary = strDefendFrom + "把" + strRunerName + "的位置卡死了，战术失败";
  let strCommentary = strRunerName + "的跑位被" + strDefendFrom + "盯死，战术失败";
  return strCommentary;
}

//中场拼抢
function MakeCommentary_MiddleSnatch() {
  let strCommentary = "两队正在中场展开激烈的拼抢";
  //console.log("Commentary.js, MakeCommentary_MiddleSnatch,  stop! stop! stop! stop! stop! stop! stop! stop! ");
  return strCommentary;
}

//提醒换人
function MakeCommentary_SubstituteRewind(strFootmanName, strPhysicalPower) {

  let strCommentary = strFootmanName + "体力只剩" + strPhysicalPower + ", 属性下降,建议换下";
  //console.log("Commentary.js, MakeCommentary_SubstituteRewind, strCommentary = " + strCommentary);

  return strCommentary;


}

//战术反馈
function MakeUsedRoutineText(strTeamName, strRoutineName)
{
  let strCommentary = GetTeamChineseName(strTeamName) + ": " + strRoutineName;
  return strCommentary;
}

//换人提示
function MakeCommentary_MakeReplaceText(strTeamName, strOldManName, strNewManName) {

  let strCommentary = GetTeamChineseName(strTeamName) + "换下" + strOldManName + ", 换上" + strNewManName;

  return strCommentary;
}

//战术调整提示
function MakeCommentary_ChangeTacticsNotify(strTeamName) 
{
  let strCommentary = GetTeamChineseName(strTeamName) + "调整了战术";
  return strCommentary;
}