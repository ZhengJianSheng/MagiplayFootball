
import DataBus from 'databus'
import GlobalData from 'GlobalData'
let databus = new DataBus();
let dGlobalData = new GlobalData();
let dEnum = dGlobalData.GetEnum();

var Procedure = require('Procedure')
var mCfgFootman = require('../data/DataFootman')
var mCfgAttackRoutine = require('../data/DataAttackRoutine')
var mCfgFormation = require('../data/DataFormation')
var Perform = require('Perform')

let imBallPath = "../../image/ball1.png"
let imBallRedPath = "../../image/ball_red.png"

module.exports = {
  GetFieldX: GetFieldX,
  GetFieldY: GetFieldY,
  DrawFormation_InSetting: DrawFormation_InSetting,
  DrawFormation_InMatch: DrawFormation_InMatch,

}

let iOutBorder = 10;  //和formation.wxss的FormationSetting .Formation 的border属性一致
let iPointDiameter = 10;  //球场圆点的直径

let iFieldWidth = 300;        //最外白线宽度
let iFieldHeight = 200;       //最外白线高度
let iRestriWidth = 60;        //大禁区宽度
let iRestriHeight = 120;      //大禁区高度
let iSmallRestriWidth = 25;   //小禁区宽度
let iSmallRestriHeight = 50;  //小禁区高度
let iInerWidthBorder = 20;  //边线到绿色球场边缘的距离
let iInerHeightBorder = 20;  //边线到绿色球场边缘的距离
let iGoalXOffset = 20;  //进球显示距离球员圆点的x距离
let iGoalYOffset = 10;  //进球显示距离球员圆点的y距离
let iPowerXOffset = 22;  //体力显示距离球员圆点的x距离
let iPowerYOffset = 10;  //体力显示距离球员圆点的y距离


function GetFieldX(event)
{
  let x = event.detail.x - iOutBorder - event.currentTarget.offsetLeft - iInerWidthBorder;
  return x;
}

function GetFieldY(event) 
{
  let y = event.detail.y - event.currentTarget.offsetTop - iInerHeightBorder;
  return y;
}

//function GetReverseFieldX(x1) {
//  let x = (iFieldWidth - x1) - iOutBorder - event.currentTarget.offsetLeft - iInerWidthBorder;
//  return x;
//}

//设置阵型战术时的绘制球场
function DrawFormation_InSetting(dFormation, dTactics, aPointArray, strCanvasID, aFootmanPerform) 
{
  //console.log("DrawFormation.js, DrawFormation_InSetting");

  var context = wx.createContext();
  DrawWhiteLine(context, iInerWidthBorder, iInerHeightBorder, iFieldWidth, iFieldHeight, iRestriWidth, iRestriHeight, iSmallRestriWidth, iSmallRestriHeight);
  let bIsReverse = false;
  let iTeamMark = 1;
  let iMatchInfoIndex = dEnum.emMatchInfo_None;
  DrawPointArray(context, iInerWidthBorder, iInerHeightBorder, aPointArray, bIsReverse, iTeamMark, iMatchInfoIndex);

  if (dGlobalData.bInMatch == true)
  {
    DrawSituation(context, aPointArray, aFootmanPerform, bIsReverse);
  }

  DrawFormationName(context, dFormation);

  wx.drawCanvas({
    canvasId: strCanvasID,
    actions: context.getActions()
  })
}



function DrawFormation_InMatch(aPointArray, strCanvasID, iMatchInfoIndex, aFootmanPerform, iMatchMark, iTeamMark, dFormation)
{
  //console.log("DrawFormation.js, DrawFormation_InMatch, aPointArray = ", aPointArray);

  //对aFootmanPerform 进行排序
  //console.log("DrawFormation.js, DrawFormation_InMatch, iMatchInfoIndex = " + iMatchInfoIndex);
  var context = wx.createContext();
  DrawWhiteLine(context, iInerWidthBorder, iInerHeightBorder, iFieldWidth, iFieldHeight, iRestriWidth, iRestriHeight, iSmallRestriWidth, iSmallRestriHeight);
  let bIsReverse = CalcuReverse(iMatchMark, iTeamMark);
  DrawPointArray(context, iInerWidthBorder, iInerHeightBorder, aPointArray, bIsReverse, iTeamMark, iMatchInfoIndex);

  if (iMatchInfoIndex == dEnum.emMatchInfo_1) 
  {
    DrawSituation(context, aPointArray, aFootmanPerform, bIsReverse);
  }
  else if (iMatchInfoIndex == dEnum.emMatchInfo_2)
  {
    DrawGoalAssist(context, aPointArray, aFootmanPerform, bIsReverse);
  }
  else if (iMatchInfoIndex == dEnum.emMatchInfo_3)
  {
    DrawGoalAssist(context, aPointArray, aFootmanPerform, bIsReverse);
  }

  DrawFormationName(context, dFormation);

  wx.drawCanvas({
    canvasId: strCanvasID,
    actions: context.getActions()
  })
}

//绘制球场白线
function DrawWhiteLine(context, iInerWidthBorder, iInerHeightBorder, iFieldWidth, iFieldHeight, iRestriWidth, iRestriHeight, iSmallRestriWidth, iSmallRestriHeight) 
{
  //console.log("DrawFormation.js, DrawWhiteLine,");
  context.lineWidth = 2;
  context.strokeStyle = "#F5FFFA";

  let iDist1 = (iFieldHeight - iRestriHeight) / 2;
  let iDist2 = (iFieldHeight - iSmallRestriHeight) / 2;

  context.strokeRect(iInerWidthBorder + 0, iInerHeightBorder + 0, iFieldWidth, iFieldHeight); //外围边线
  context.strokeRect(iInerWidthBorder + 0, iInerHeightBorder + iDist1, iRestriWidth, iRestriHeight); //我方大禁区
  context.strokeRect(iInerWidthBorder + iFieldWidth - iRestriWidth, iInerHeightBorder + iDist1, iRestriWidth, iRestriHeight); //敌方大禁区
  context.strokeRect(iInerWidthBorder + 0, iInerHeightBorder + iDist2, iSmallRestriWidth, iSmallRestriHeight); //我方小禁区
  context.strokeRect(iInerWidthBorder + iFieldWidth - iSmallRestriWidth,
    iInerHeightBorder + iDist2, iSmallRestriWidth, iSmallRestriHeight); //敌方小禁区
  context.arc(iInerWidthBorder + iFieldWidth / 2, iInerHeightBorder + iFieldHeight / 2, 50, 0, 2 * Math.PI); //中圈
  context.moveTo(iInerWidthBorder + iFieldWidth / 2, iInerHeightBorder);  //中线
  context.lineTo(iInerWidthBorder + iFieldWidth / 2, iInerHeightBorder + iFieldHeight); //中线
  context.stroke(); //绘制

  //console.log("DrawFormation.js, DrawWhiteLine finish,");
}

//绘制阵型点
function DrawPointArray(context, iInerWidthBorder, iInerHeightBorder, aPointArray, bIsReverse, iTeamMark, iMatchInfoIndex) 
{
  //console.log("DrawFormation.js, DrawPointArray, strHoldBallName = " + dGlobalData.strHoldBallName + " strLostBallName = " + dGlobalData.strLostBallName);

  for (var i = 0; i < aPointArray.length; i++) {
    let strDesc = "";
    if (aPointArray[i].strName == "") {
      strDesc = aPointArray[i].strDesc;
    }
    else {
      strDesc = aPointArray[i].strName;
    }
    DrawPoint(context, aPointArray[i].x, aPointArray[i].y, aPointArray[i].strNumber, aPointArray[i].iSelStatus, strDesc, aPointArray[i].iMarkingStatus, bIsReverse, iTeamMark, iMatchInfoIndex);
  }

  //console.log("DrawFormation.js, DrawPointArray finish,");
}

function DrawFormationName(context, dFormation) {

  //console.log("DrawFormation.js, DrawFormationName, dFormation = ", dFormation);
  let strFormationName = dFormation.aFormNameArray[dFormation.iSelFormIndex];
  let dCfg = mCfgFormation[strFormationName];
  let strText = dCfg.strChinese;
  let iNumberX = iFieldWidth / 2 + iInerWidthBorder;
  let iNumberY = 16;
  context.font = "16px Arial";
  context.textAlign = "center";
  context.setFillStyle('#FFFFFF')
  context.fillText(strText, iNumberX, iNumberY);

}

function DrawSituation(context, aPointArray, aFootmanPerform, bIsReverse)
{
  //console.log("DrawFormation.js, DrawSituation, aFootmanPerform = ");
  //console.log(aFootmanPerform);

  for (var i = 0; i < aPointArray.length; i++) 
  {
    let dOneData = Perform.GetDataFromFootmanPerform(aFootmanPerform, aPointArray[i].strName)

    //体能
    {
      let iPointX = aPointArray[i].x;
      let iPointY = aPointArray[i].y;
      if (bIsReverse == true) {
        iPointX = ReverseX(aPointArray[i].x);
        iPointY = ReverseY(aPointArray[i].y);
      }

      let x = iInerWidthBorder + iPointX + iPowerXOffset;
      let y = iInerHeightBorder + iPointY + iPowerYOffset;
      let iLen = 7;

      let iNumberX = x;
      let iNumberY = y + iLen / 2 + 1;
      context.font = "15px Arial";
      context.setFillStyle('#FFFFFF')
      let iMaxWidth = 20;
      let strText = dOneData.strPhysicalPower;
      context.fillText(strText, iNumberX, iNumberY, iMaxWidth);
    }

    //黄牌
    //dOneData.iYellowCard = 1;
    if (dOneData.iYellowCard > 0) 
    {
      //console.log("DrawFormation.js, DrawSituation, dOneData.iYellowCard = " + dOneData.iYellowCard);
      let iPointX = aPointArray[i].x;
      let iPointY = aPointArray[i].y;
      if (bIsReverse == true) {
        iPointX = ReverseX(aPointArray[i].x);
        iPointY = ReverseY(aPointArray[i].y);
      }

      let x = iInerWidthBorder + iPointX - iPowerXOffset;
      let y = iInerHeightBorder + iPointY + iPowerYOffset;

      let iLen = 7;
      context.beginPath(0)
      context.rect(x+2, y-5, 7, 10)
      context.setFillStyle('#FFFF00');
      context.setStrokeStyle('rgba(1,1,1,0)')
      context.fill()
      context.stroke()
    }
  }

}


function DrawGoalAssist(context, aPointArray, aFootmanPerform, bIsReverse)
{
  //console.log("DrawFormation.js, DrawGoalAssist, aPointArray = ", aPointArray);
  //console.log("DrawFormation.js, DrawGoalAssist, aFootmanPerform = ", aFootmanPerform);
  
  for (var i = 0; i < aPointArray.length; i++) 
  {
    let dOneData = Perform.GetDataFromFootmanPerform(aFootmanPerform, aPointArray[i].strName)
    if (dOneData == null)
    {
      console.error("DrawFormation.js, DrawGoalAssist, dOneData == null, strName = " + aPointArray[i].strName);
    }
    //dOneData.iGoal = 1;
    //dOneData.iAssist = 1;

    //进球
    if (dOneData.iGoal > 0)
    {
      let iPointX = aPointArray[i].x;
      let iPointY = aPointArray[i].y;
      if (bIsReverse == true) {
        iPointX = ReverseX(aPointArray[i].x);
        iPointY = ReverseY(aPointArray[i].y);
      }

      let x = iInerWidthBorder + iPointX + iGoalXOffset;
      let y = iInerHeightBorder + iPointY + iGoalYOffset;
      //console.log("DrawFormation.js, DrawGoalAssist, goal, x1 = " + aPointArray[i].x + " x2 = " + iPointX + " x3 = " + x);
      //console.log("DrawFormation.js, DrawGoalAssist, goal, y1 = " + aPointArray[i].y + " y2 = " + iPointY + " y3 = " + y);

      let iLen = 7;
      context.beginPath(0)
      context.arc(x, y, iLen, 0, Math.PI * 2)
      context.setFillStyle('#FFFFFF');
      context.setStrokeStyle('rgba(1,1,1,0)')
      context.fill()
      context.stroke()

      let iNumberX = x;
      let iNumberY = y + iLen / 2 + 1;
      context.font = "14px Arial";
      context.setFillStyle('#000000')
      let iMaxWidth = 20;
      let strText = dOneData.iGoal.toString();
      context.fillText(strText, iNumberX, iNumberY, iMaxWidth);
    }

    //助攻
    if (dOneData.iAssist > 0)
    {
      let iPointX = aPointArray[i].x;
      let iPointY = aPointArray[i].y;
      if (bIsReverse == true) {
        iPointX = ReverseX(aPointArray[i].x);
        iPointY = ReverseY(aPointArray[i].y);
      }

      let x = iInerWidthBorder + iPointX - iGoalXOffset;
      let y = iInerHeightBorder + iPointY + iGoalYOffset;;

      //console.log("DrawFormation.js, DrawGoalAssist, assist, x1 = " + aPointArray[i].x + " x2 = " + iPointX + " x3 = " + x);
      //console.log("DrawFormation.js, DrawGoalAssist, assist, y1 = " + aPointArray[i].y + " y2 = " + iPointY + " y3 = " + y);

      let iLen = 7;
      context.beginPath(0)
      context.arc(x, y, iLen, 0, Math.PI * 2)
      context.setFillStyle('#A9A9A9');
      context.setStrokeStyle('rgba(1,1,1,0)')
      context.fill()
      context.stroke()

      let iNumberX = x;
      let iNumberY = y + iLen / 2 + 1;
      context.font = "14px Arial";
      context.setFillStyle('#000000')
      let iMaxWidth = 20;
      let strText = dOneData.iAssist.toString();
      context.fillText(strText, iNumberX, iNumberY, iMaxWidth);
    }
  }
}

function ReverseX(x)
{
  let iReverseX = iFieldWidth - x;
  return iReverseX;
}

function ReverseY(y) 
{
  let iTextHeight = 10; //球员名字所占高度
  let iReverseY = iFieldHeight - iTextHeight - y;
  return iReverseY;
}

function DrawPoint(context, iPointX, iPointY, strNumber, iSelStatus, strName, iMarkingStatus, bIsReverse, iTeamMark, iMatchInfoIndex) 
{
  //console.log("DrawFormation.js, DrawPoint x=" + x + ", y=" + y + ", strHoldBallName = " + dGlobalData.strHoldBallName + ", strName = " + strName);
  //console.log("DrawFormation.js, dGlobalData =", dGlobalData);
  
  if (bIsReverse == true)
  {
    //let iTextHeight = 10; //球员名字所占高度
    //x = iFieldWidth - (x - iInerWidthBorder) + iInerWidthBorder;
    //y = iFieldHeight - iTextHeight - (y - iInerHeightBorder) + iInerHeightBorder;
    iPointX = ReverseX(iPointX);
    iPointY = ReverseY(iPointY);
  }
  let x = iPointX + iInerWidthBorder;
  let y = iPointY + iInerHeightBorder;

  let iLen = iPointDiameter;
  context.beginPath(0)
  context.arc(x, y, iLen, 0, Math.PI * 2)
  if (iSelStatus == 1) {
    context.setFillStyle('#1E90FF');  //道奇蓝
  }
  else {
    if (iTeamMark == 1)
      context.setFillStyle('#FFFF00');    //黄色
    else if (iTeamMark == 2)
      //context.setFillStyle('#00FFFF');    //青色
      //context.setFillStyle('#00FF00');    //酸橙色
      //context.setFillStyle('#DC143C');     //猩红
      context.setFillStyle('#C0C0C0');      //银白色
      //context.setFillStyle('#808080');      //灰色
    
  }

  if (iMarkingStatus == 1) {
    context.setFillStyle('#1E90FF');  //道奇蓝
  }

  context.setStrokeStyle('rgba(1,1,1,0)')
  context.fill()
  context.stroke()

  let iNumberX = x;
  let iNumberY = y + iLen / 2 + 2;
  context.font = "18px Arial";
  context.textAlign = "center";
  context.setFillStyle('#000000');
  context.fillText(strNumber, iNumberX, iNumberY);


  context.font = "14px Arial";
  context.setFillStyle('#FFFFFF')
  let iMaxWidth = 60;
  context.fillText(strName, iNumberX, iNumberY + 20, iMaxWidth);
  //console.log("formation.js, strName =" + strName);

  if (iMatchInfoIndex == dEnum.emMatchInfo_0) 
  {
    //绘制持球球员
    if (dGlobalData.strLostBallName == strName) {
      context.drawImage(imBallRedPath, x + 10, y, 16, 16);
    }
    //if (dGlobalData.strHoldBallName == strName && dGlobalData.strLostBallName == "") {
    if (dGlobalData.strHoldBallName == strName && dGlobalData.strHoldBallName != dGlobalData.strLostBallName) {
      context.drawImage(imBallPath, x + 10, y, 16, 16);
    }
  }

  

}

function CalcuReverse(iMatchMark, iTeamMark)
{
  let bReverse = false;
  if (iMatchMark == 1 && iTeamMark == 1)  //上半场，已方
    bReverse = false;
  else if (iMatchMark == 1 && iTeamMark == 2)  //上半场，对方
    bReverse = true;
  else if (iMatchMark == 2 && iTeamMark == 1)  //下半场，已方
    bReverse = true;
  else if (iMatchMark == 2 && iTeamMark == 2)  //下半场，对方
    bReverse = false;

  return bReverse;
}

{
  //绘制矩形
  //context.rect(x + 10, y, 16, 16)
  //context.setFillStyle('#228B22')
  //context.fill()
  //context.draw()
}
  