// pages/formation/formation.js
import DataBus from '../databus'
import GlobalData from '../GlobalData'

var Procedure = require('../Procedure')
var AI = require('../AI')
var Tactics = require('../Tactics')
var Perform = require('../Perform')
var DrawFormation = require('../DrawFormation')
var mCfgFootman = require('../../data/DataFootman')
var mCfgFormation = require('../../data/DataFormation')
var mCfgTactics = require('../../data/DataTactics')
var mCfgClub = require('../../data/DataClub')
var Util = require('../../utils/util.js')
var Commentary = require('../Commentary')
var Substitute = require('../Substitute')
var Assistant = require('../Assistant')

let databus = new DataBus();
let dGlobalData = new GlobalData();
let dEnum = dGlobalData.GetEnum();

let iOutBorder = 10;  //和formation.wxss的FormationSetting .Formation 的border属性一致
let iInerBorder = 20;  //边线到绿色球场边缘的距离
let iPointDiameter = 10;  //球场圆点的直径
let iExtPointClick = 5;  //为方便选中球场圆点而扩充的距离

let iDefaulFunctionIndex = 0;  //起始功能索引号
let aCellArray = [];  //界面下半部分的球员列表

let emSortType_AttackRout_Default = 0;  //默认顺序
let emSortType_AttackRout_Name  = 1;  //以名字排序
let emSortType_AttackRout_Rate  = 2;  //以成功率排序
let emSortType_AttackRout_Count = 3;  //以次数排序

let emSortType_DefendRout_Default = 0;  //默认顺序
let emSortType_DefendRout_Name = 1;  //以名字排序
let emSortType_DefendRout_Rate = 2;  //以成功率排序
let emSortType_DefendRout_Count = 3;  //以次数排序

let emFunctionIndex_GoField = 0;  //上阵
let emFunctionIndex_Strategy = 1;  //策略
let emFunctionIndex_Attack = 2;  //进攻
let emFunctionIndex_Defend = 3;  //防守

Page({

  /**
   * 页面的初始数据
   */
  data: {
    iSelFormIndex: databus.iDefaultFormIndex, //选择的阵型编号
    iFunctionIndex: iDefaulFunctionIndex,   //选择的功能编号

    //绿色球场界面
    aPointArray:[],

    //上阵界面部分
    aCellArray: aCellArray,  //界面下半部分的球员列表
    
    //策略界面部分
    iMentalIndex: databus.iDefaultMentalIndex, //默认的心态编号
    iAttackPoint: 0,    //进攻点数
    iDefendPoint: 0,    //防守点数
    iRhythmIndex: databus.iDefaultRhythmIndex,  //默认的节奏编号
    iAttackRoutineCount : 0,  //进攻套路数目
    strConsumeDesc: "",
    iPosWidthIndex: 1,  //站位宽度
    iDefendDepthIndex: 1,  //防线深度



    //进攻界面部分
    iLeftAttackCount: 0, //剩余可用的进攻点数
    iLeftDefendPoint: 0, //剩余可用的防守点数
    aRoutineArray : [],   //进攻套路
    // [{ID:0, strPos: "", strName:"", strDesc:"", fRate:0.0f, iUsedAttackCount: 0}]
    iOpponentMarked : false,  //显示对方盯防情况下数据
    iInMatch:0, //是否在比赛中
    iSortType_AttackRout: emSortType_AttackRout_Default,  //进攻套路排序类型

    //防守界面部分
    strOpponentChinese: "",
    mMarkingMap : {},   //key:球员名字; value:盯防点数
    strMarkingText : "", //被盯防的球员的连起来的文本
    aOpponentRoutineArray: [],  //对手的进攻套路
    iSortType_DefendRout: emSortType_DefendRout_Default,  //防守套路排序类型
    // [{ID:0, strPos: "", strName:"", strDesc:"", fRate:0.0f, iUsedAttackCount: 0}]

    //比赛部分
    aCurrentChangeArray: [],  //当前界面的换人数据(比如刚换上就换下)
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) 
  {
    //console.log("formation.js, onLoad");
    this.InitCellData();
    //this.FlashView(); 

    dGlobalData.bInitMatchData = false; //强制重建比赛数据

    //测试代码
    this.TestRate();
  },

  

  //====================================================================
  //Part: Team
  

  //====================================================================
  //Part: Formation

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.drawFormation();
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.FlashView(); 
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {},
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () 
  {
    //console.log("formation.js, onUnload");
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {},
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {},
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {},

  //=========================================================================
  DoSave : function() {
    //console.log("formation.js, DoSave");
    console.log("formation.js, DoSave, dGlobalData = ", dGlobalData);

    if (dGlobalData.bInMatch == true) {

      this.data.aCurrentChangeArray = [];

      let dTactics = databus.dTactics;
      if (dTactics.iLeftAttackPoint > 0) {
        Util.ShowTips("请完成战术的进攻设置");
        return;
      }
      if (dTactics.iLeftDefendPoint > 0) {
        Util.ShowTips("请完成战术的防守设置");
        return;
      }
    }
    
    if (dGlobalData.bInMatch == true)
    {
      dGlobalData.UpdateMatchingData();
      wx.navigateBack();
    }
    else
    {
      //Util.ShowTips("保存成功");
      databus.SaveData();
      wx.navigateBack();
    }
    
  },

  DoLoad: function () {
    //console.log("formation.js, DoLoad");
    databus.LoadData();
    this.FlashView();
  },

  InitCellData: function () 
  {
    //onsole.log("formation.js, InitCellData");
    let dTeam = databus.dTeam;
    let dData = this.data;

    for (var i = 0, len = dTeam.aFootmanArray.length; i < len; i++) {
      dData.aCellArray[i] = {}
      dData.aCellArray[i].ID = dTeam.aFootmanArray[i].ID;
      let strName = dTeam.aFootmanArray[i].Name;
      dData.aCellArray[i].Name = strName;
      dData.aCellArray[i].LikeNumber = dTeam.aFootmanArray[i].LikeNumber;
      dData.aCellArray[i].iSelStatus = 0;
      dData.aCellArray[i].Ability = mCfgFootman[strName]["Ability"];
      dData.aCellArray[i].PositionA = mCfgFootman[strName]["PositionA"];
      dData.aCellArray[i].PositionB = mCfgFootman[strName]["PositionB"];
      dData.aCellArray[i].PositionC = mCfgFootman[strName]["PositionC"];
      dData.aCellArray[i].IsInField = false;
      dData.aCellArray[i].strPhysicalPower = "100%";
      dData.aCellArray[i].fPhysicalPower = 1.0;

      if (dGlobalData.bInMatch == false)
        dData.aCellArray[i].iIsRelpaced = 0;//是否在比赛中被换下
      else 
      {
        let dMatchingData = dGlobalData.aMatchingDataArray[0];
        dData.aCellArray[i].iIsRelpaced = 0;
        for (let j = 0; j < dMatchingData.aFootmanReplacedArray.length; j++)
        {
          if (dMatchingData.aFootmanReplacedArray[j] == strName)
          {
            dData.aCellArray[i].iIsRelpaced = 1;
          }
        }
      }
    }

    //console.log("formation.js, InitCellData, aCellArray =");
    //console.log(dData.aCellArray);
  },

  //刷新整个界面
  FlashView: function () {
    //console.log("formation.js, FlashView");

    let dBase = databus.dBase;
    let dFormation = databus.dFormation;
    let dTactics = databus.dTactics;
    let iFunctionIndex = this.data.iFunctionIndex;
    //console.log("formation.js, FlashView, iFunctionIndex = " + iFunctionIndex);
    this.drawFormation();

    if (dBase.strOpponentName != "")
    {
      let dCfgClub = mCfgClub[dBase.strOpponentName];
      this.data.strOpponentChinese = dCfgClub.Chinese;
    }
    
    this.setData({
      strOpponentChinese: this.data.strOpponentChinese,
      iInMatch: dGlobalData.bInMatch == true ? 1 : 0,
    })

    if (iFunctionIndex == emFunctionIndex_GoField)
    {
      //上阵
      this.UpdateIsInField();
      this.UpdatePhysicalPower();
      //排序
      //暂时
      this.setData({
        iSelFormIndex: dFormation.iSelFormIndex,
        iFunctionIndex: iFunctionIndex,
        aCellArray: this.data.aCellArray,
      })
    }
    else if (iFunctionIndex == emFunctionIndex_Strategy)
    {
      //策略
      //console.log("tactics.js, FlashView, iMentalIndex = " + dTactics.iMentalIndex);
      //console.log(mCfgTactics.MentalPoint);
      //console.log("tactics.js, FlashView, iAttackPoint = " + iAttackPoint + ", iDefendPoint = " + iDefendPoint);
      let iAttackPoint = mCfgTactics.MentalPoint[dTactics.iMentalIndex].Attack;
      let iDefendPoint = mCfgTactics.MentalPoint[dTactics.iMentalIndex].Defend;
      let iAttackRoutineCount = Tactics.GetValidRoutineCount(dTactics, dFormation);
      let strConsumeDesc = mCfgTactics.RhythmPoint[dTactics.iRhythmIndex].ConsumeDesc;

      let strPosWidthDesc1 = mCfgTactics["PosWidth"][dTactics.iPosWidthIndex]["Attack"]["IncreaseShowDesc"];
      let strPosWidthDesc2 = mCfgTactics["PosWidth"][dTactics.iPosWidthIndex]["Attack"]["ReduceShowDesc"];
      let strPosWidthDesc3 = mCfgTactics["PosWidth"][dTactics.iPosWidthIndex]["Defend"]["IncreaseShowDesc"];
      let strPosWidthDesc4 = mCfgTactics["PosWidth"][dTactics.iPosWidthIndex]["Defend"]["ReduceShowDesc"];

      let strDefendDepthDesc1 = mCfgTactics["DefendDepth"][dTactics.iDefendDepthIndex]["Attack"]["IncreaseShowDesc"];
      let strDefendDepthDesc2 = mCfgTactics["DefendDepth"][dTactics.iDefendDepthIndex]["Attack"]["ReduceShowDesc"];
      let strDefendDepthDesc3 = mCfgTactics["DefendDepth"][dTactics.iDefendDepthIndex]["Defend"]["IncreaseShowDesc"];
      let strDefendDepthDesc4 = mCfgTactics["DefendDepth"][dTactics.iDefendDepthIndex]["Defend"]["ReduceShowDesc"];

      this.setData({
        iSelFormIndex: dFormation.iSelFormIndex,
        iFunctionIndex: iFunctionIndex,
        iMentalIndex: dTactics.iMentalIndex,
        iAttackPoint: iAttackPoint,
        iDefendPoint: iDefendPoint,
        iRhythmIndex: dTactics.iRhythmIndex,
        iAttackRoutineCount: iAttackRoutineCount,
        strConsumeDesc: strConsumeDesc,
        iPosWidthIndex: dTactics.iPosWidthIndex,
        iDefendDepthIndex: dTactics.iDefendDepthIndex,
        strPosWidthDesc1: strPosWidthDesc1,
        strPosWidthDesc2: strPosWidthDesc2,
        strPosWidthDesc3: strPosWidthDesc3,
        strPosWidthDesc4: strPosWidthDesc4,
        strDefendDepthDesc1: strDefendDepthDesc1,
        strDefendDepthDesc2: strDefendDepthDesc2,
        strDefendDepthDesc3: strDefendDepthDesc3,
        strDefendDepthDesc4: strDefendDepthDesc4,
      })
    }
    else if (iFunctionIndex == emFunctionIndex_Attack) 
    {
      //进攻
      let strOpponentName = dBase.strOpponentName;
      let dOpponentBase = dGlobalData.GetBaseData(strOpponentName);
      let dOpponentFormation = dGlobalData.GetFormationData(strOpponentName);
      let dOpponentTactics = dGlobalData.GetTacticsData(strOpponentName);
      
      let mRoutineMap = Tactics.GetValidRoutineMap(dTactics, dFormation)
      //console.log(mRoutineMap);
      this.data.aRoutineArray = [];
      for (let strRoutineName in mRoutineMap)
      {
        // [{ID:0, strPos: "", strName:"", strDesc:"", fRate:0.0f, iUsedAttackCount: 0}]
        let bConsiderMarking = true;
        let fRate = Tactics.GetRoutineSucceedRate(dTactics, dFormation, strRoutineName, dOpponentBase, dOpponentTactics, dOpponentFormation, bConsiderMarking);
        let strName = Tactics.GetFootmanNameFromPos(dFormation, mRoutineMap[strRoutineName].ShotRole);
        let aJoinArray = [];
        for (let j=0; j <mRoutineMap[strRoutineName]["Procedure"].length; j++) {
          let lProcedure = mRoutineMap[strRoutineName]["Procedure"][j];
          let strPos1 = lProcedure["AttackFromRole"];
          let strPos2 = lProcedure["AttackToRole"];

          if (lProcedure["IsMain"] == 0)
            continue;

          if (aJoinArray.indexOf(strPos1) == -1) 
            aJoinArray.push(strPos1);
          if (aJoinArray.indexOf(strPos2) == -1)
            aJoinArray.push(strPos2);
          //console.log(aJoinArray);
        }
        
        let strJoinList = "";
        for (let j = 0; j < aJoinArray.length; j++) 
        {
          if (j != 0)
            strJoinList += " ";
          strJoinList += aJoinArray[j];
        }

        let iAttackCount = 0;
        if (dTactics.mRoutineCountMap[strRoutineName] == null)
          iAttackCount = 0;
        else
          iAttackCount = dTactics.mRoutineCountMap[strRoutineName];

        let iIsMarking = 0;
        if (dGlobalData.bInMatch == true)
        {
          let dOpponentDefendData = dGlobalData.aMatchingDataArray[1].dTactics.mOpponentDefendMap[dBase.strTeamName];
          let iMRC = dOpponentDefendData.mMarkingRoutineMap[strRoutineName];
          if (iMRC != null && iMRC > 0) {
            iIsMarking = 1;
          }
        }
        else
        {
          let dOpponentTactics = dGlobalData.GetTacticsData(dBase.strOpponentName);
          let dOpponentDefendData = dOpponentTactics.mOpponentDefendMap[dBase.strTeamName];
          let iMRC = dOpponentDefendData.mMarkingRoutineMap[strRoutineName];
          if (iMRC != null && iMRC > 0) {
            iIsMarking = 1;
          }
        }
        
        let dOne = {
          strRoutineName: strRoutineName,
          strPos: mRoutineMap[strRoutineName].ShotRole,
          strName: strName,
          strDesc: mRoutineMap[strRoutineName].Desc,
          strJoinList:strJoinList,
          fRate: (fRate*100).toFixed(2),
          iAttackCount: iAttackCount,
          iIsMarking: iIsMarking,
        }
        this.data.aRoutineArray.push(dOne);
      }
      //console.log(this.data.aRoutineArray);

      this.SortAttackRoutineArray(this.data.aRoutineArray);

      this.setData({
        iSelFormIndex: dFormation.iSelFormIndex,
        iFunctionIndex: iFunctionIndex,
        iLeftAttackPoint: dTactics.iLeftAttackPoint,
        aRoutineArray: this.data.aRoutineArray,
        iOpponentMarked: dGlobalData.iOpponentMarked,
      })
    }
    else if (iFunctionIndex == emFunctionIndex_Defend) {
      //防守
      let dBase = databus.dBase;
      let dFormation = databus.dFormation;
      let dTactics = databus.dTactics;
      //下一场对手
      let strOpponentName = dBase.strOpponentName;

      //设置盯人界面部分
      let dDefnedData = dTactics.mOpponentDefendMap[strOpponentName];
      let strMarkingText = "";
      for (let strFootmanName in dDefnedData.mMarkingFootmanMap)
      {
        if (strMarkingText != "")
          strMarkingText += ", ";
        strMarkingText += strFootmanName;
      }
      if (strMarkingText == "")
        strMarkingText = "不设置盯人"  //占据一行，不要空着
      //console.log(dDefnedData.mMarkingFootmanMap);
      //console.log("formation.js, strMarkingText = " + strMarkingText);

      //设置进攻套路界面部分
      this.data.aOpponentRoutineArray = [];
      if (databus.IsFormationSettingOK(dFormation) == true) 
      {
        let dOpponentBase = dGlobalData.GetBaseData(strOpponentName);
        let dOpponentFormation = dGlobalData.GetFormationData(strOpponentName);
        let dOpponentTactics = dGlobalData.GetTacticsData(strOpponentName);
        let mRoutineMap = Tactics.GetValidRoutineMap(dOpponentTactics, dOpponentFormation)


        for (let strRoutineName in mRoutineMap) {
          // [{ID:0, strPos: "", strName:"", strDesc:"", fRate:0.0f, iUsedAttackCount: 0}]
          let bConsiderMarking = true;
          let fRate = Tactics.GetRoutineSucceedRate(dOpponentTactics, dOpponentFormation, strRoutineName, dBase, dTactics, dFormation, bConsiderMarking);
          let strName = Tactics.GetFootmanNameFromPos(dOpponentFormation, mRoutineMap[strRoutineName].ShotRole);
          let aJoinArray = [];
          for (let j = 0; j < mRoutineMap[strRoutineName]["Procedure"].length; j++) {
            let lProcedure = mRoutineMap[strRoutineName]["Procedure"][j];
            let strPos1 = lProcedure["AttackFromRole"];
            let strPos2 = lProcedure["AttackToRole"];
            if (aJoinArray.indexOf(strPos1) == -1)
              aJoinArray.push(strPos1);
            if (aJoinArray.indexOf(strPos2) == -1)
              aJoinArray.push(strPos2);
            //console.log(aJoinArray);
          }

          let strJoinList = "";
          for (let j = 0; j < aJoinArray.length; j++) {
            if (j != 0)
              strJoinList += " ";
            strJoinList += aJoinArray[j];
          }

          let iDefendCount = 0;
          let mMarkingRoutineMap = dTactics.mOpponentDefendMap[dBase.strOpponentName].mMarkingRoutineMap;
          if (mMarkingRoutineMap[strRoutineName] == null)
            iDefendCount = 0;
          else
            iDefendCount = mMarkingRoutineMap[strRoutineName];

          let iIsMarking = 0;
          if (dGlobalData.bInMatch == true) {
            let dDefnedData = dGlobalData.aMatchingDataArray[0].dTactics.mOpponentDefendMap[dOpponentBase.strTeamName];
            let iMRC = dDefnedData.mMarkingRoutineMap[strRoutineName];
            if (iMRC != null && iMRC > 0) {
              iIsMarking = 1;
            }
          }
          else {
            let dTactics = databus.dTactics;
            let dDefnedData = dTactics.mOpponentDefendMap[dOpponentBase.strTeamName];
            let iMRC = dDefnedData.mMarkingRoutineMap[strRoutineName];
            if (iMRC != null && iMRC > 0) {
              iIsMarking = 1;
            }
          }

          let dOne = {
            strRoutineName: strRoutineName,
            strPos: mRoutineMap[strRoutineName].ShotRole,
            strName: strName,
            strDesc: mRoutineMap[strRoutineName].Desc,
            strJoinList: strJoinList,
            fRate: (fRate * 100).toFixed(0),
            iDefendCount: iDefendCount,
            iIsMarking: iIsMarking,
          }
          this.data.aOpponentRoutineArray.push(dOne);
        }

        this.SortDefendRoutineArray(this.data.aOpponentRoutineArray);
      }
      
      //更新数据到界面
      this.setData({
        iFunctionIndex: iFunctionIndex,
        iLeftDefendPoint: dTactics.iLeftDefendPoint,
        strMarkingText: strMarkingText,
        aOpponentRoutineArray: this.data.aOpponentRoutineArray,
      })
    }
  },

  drawFormation: function () {

    let dBase = null;
    let dFormation = null;
    let dTactics = null;

    if (dGlobalData.bInMatch == false) {
      dBase = databus.dBase;
      dFormation = databus.dFormation;
      dTactics = databus.dTactics;
    }
    else {
      dBase = dGlobalData.aMatchingDataArray[0].dBase;
      dFormation = dGlobalData.aMatchingDataArray[0].dFormation;
      dTactics = dGlobalData.aMatchingDataArray[0].dTactics;
    }

    let strCanvasID = 'formation';
    //console.log("formation.js, drawFormation, dFormation = ", dFormation);

    let iFunctionIndex = this.data.iFunctionIndex;
    let aPointArray = [];
    if (iFunctionIndex == emFunctionIndex_GoField) {
      aPointArray = Util.DeepCopy(dFormation.aFormationArray[dFormation.iSelFormIndex]);
      for (let i = 0; i < aPointArray.length; i++) {
        aPointArray[i].iMarkingStatus = 0;
      }
    }
    else if (iFunctionIndex == emFunctionIndex_Strategy) {
      aPointArray = Util.DeepCopy(dFormation.aFormationArray[dFormation.iSelFormIndex]);
      for (let i = 0; i < aPointArray.length; i++) {
        aPointArray[i].iMarkingStatus = 0;
      }
    }
    else if (iFunctionIndex == emFunctionIndex_Attack) {
      aPointArray = Util.DeepCopy(dFormation.aFormationArray[dFormation.iSelFormIndex]);
      if (dGlobalData.bInMatch == false) {
        for (let i = 0; i < aPointArray.length; i++) {
          aPointArray[i].iMarkingStatus = 0;
        }
      }
    }
    else if (iFunctionIndex == emFunctionIndex_Defend) {
      //let bNeedShowMarking = true;
      //aPointArray = databus.MakePointArray_Opponent(dBase.strOpponentName, bNeedShowMarking); //这个无法在对方换人后正确显示上场队员
      //aPointArray = dGlobalData.GetFormationData(dBase.strOpponentName).aFormationArray[0]; //这个无法显示Marking对象
      
      if (dGlobalData.bInMatch == true)
      {
        aPointArray = Util.DeepCopy(dGlobalData.aMatchingDataArray[1].dFormation.aFormationArray[0]);
      }
      else
      {    
        let bNeedShowMarking = true;
        aPointArray = databus.MakePointArray_Opponent(dBase.strOpponentName, bNeedShowMarking);
      }
    }
    else {
      aPointArray = dFormation.aFormationArray[dFormation.iSelFormIndex];
    }

    let aFootmanPerform = {}; //比赛时才用到
    if (dGlobalData.bInMatch == true)
    {
      if (iFunctionIndex == emFunctionIndex_Defend)
        aFootmanPerform = dGlobalData.aMatchingDataArray[1].aFootmanPerform;
      else
        aFootmanPerform = dGlobalData.aMatchingDataArray[0].aFootmanPerform;
    }
    //console.log("formation.js, drawFormation, aPointArray = ", aPointArray);
    DrawFormation.DrawFormation_InSetting(dFormation, dTactics, aPointArray, strCanvasID, aFootmanPerform);

    return;
  },

  //点击球场界面的球员
  ClickFormationPoint: function (event) {
    //console.log("formation.js, ClickFormationPoint");
    //console.log(event);
    console.log("formation.js, ClickFormationPoint, iFunctionIndex = " + this.data.iFunctionIndex);
    if (this.data.iFunctionIndex == 3)
    {
      this.ClickFormationPoint_InDefned(event);
      return;
    }
    else if (this.data.iFunctionIndex == 1 || this.data.iFunctionIndex == 2) 
    {
      return;
    }

    //var canvas = this.getElementById("formation");
    //console.log(canvas);
    let dCellData = this.data;
    let dBase = databus.dBase;
    let dFormation = databus.dFormation;
    let aPointArray = dFormation.aFormationArray[dFormation.iSelFormIndex];
    let x = DrawFormation.GetFieldX(event);
    let y = DrawFormation.GetFieldY(event);
    //console.log("formation.js, ClickFormationPoint, detail.x=" + event.detail.x + ", detail.y=" + event.detail.y);
    //console.log("formation.js, ClickFormationPoint, x=" + x + ", y=" + y);

    let iSelPointIndex = -1;
    for (var i = 0; i < aPointArray.length; i++)
    {
      let iLeft = aPointArray[i].x - iPointDiameter / 2;
      let iRight = aPointArray[i].x + iPointDiameter / 2;
      let iTop = aPointArray[i].y - iPointDiameter / 2;
      let iButtom = aPointArray[i].y + iPointDiameter / 2;
      let strNumber = aPointArray[i].strNumber;

      if (iLeft - iExtPointClick <= x && x <= iRight + iExtPointClick && 
        iTop - iExtPointClick <= y && y <= iButtom + iExtPointClick)
      {
        //console.log("formation.js, click point number is " + aPointArray[i].strNumber);
        iSelPointIndex = i; //设置为选中状态
        break;
      }
      else 
      {
        //console.log("formation.js, number = " + strNumber + ", iLeft = " + iLeft + ", iRight = " + iRight + ", iTop = " + iTop + ", iButtom = " + iButtom);
      }
    }

    //console.log("formation.js, ClickFormationPoint 1");
    //没有选中
    if (iSelPointIndex == -1)
    {
      return;
    }
    else
    {
      //console.log("formation.js, ClickFormationPoint 2");
      
      
      //查找之前选中的队员
      let iSelCellIndex = -1;
      for (let j = 0; j < dCellData.aCellArray.length; j++) {
        if (dCellData.aCellArray[j].iSelStatus == 1) {
          iSelCellIndex = j;
          break;
        }
      }
      let dSelPoint = aPointArray[iSelPointIndex];
      
      let dSelPointCopy = Util.DeepCopy(dSelPoint);
      let strReplacedName = dSelPoint.strName;  //被换下的球员
      if (iSelCellIndex == -1)
      {
        if (dGlobalData.bInMatch == true)
        {
          Util.ShowTips("比赛换人时，请先点击要换上的球员");
          return;
        }
        dSelPoint.ID = 0;
        dSelPoint.strName = "";
        dSelPoint.strNumber = "";
        this.drawFormation();
        this.FlashView();
        return;
      }

      
      //console.log(dSelPoint);
      let dSelCell = dCellData.aCellArray[iSelCellIndex];
      //console.log(dSelCell);

      if (dGlobalData.bInMatch == true)
      {
        let bAlreadyIn = false;
        for (let k = 0; k < aPointArray.length; k++) {
          if (aPointArray[k].strName == dSelCell.Name){
            bAlreadyIn = true;
            break;
          }
        }
        if (bAlreadyIn == false) {
          if (this.data.aCurrentChangeArray.indexOf(dSelPoint.strName) != -1) {
            Util.ShowTips("刚换上的球员不能被换下");
            return;
          }
        }
        let strOldMan = strReplacedName;
        let strNewMan = dSelCell.Name;
        Substitute.ReplaceFootman(dGlobalData.aMatchingDataArray[0], strOldMan, strNewMan, dGlobalData.aMatchingDataArray[1]);

        this.data.aCurrentChangeArray.push(strNewMan);
      }
      else
      {
        dSelPoint.ID = dSelCell.ID;
        dSelPoint.strName = dSelCell.Name;
        dSelPoint.strNumber = dSelCell.LikeNumber;
        //console.log(dSelPoint);

        //如果之前已经放在其他地方，那这里就把它清掉或者替换
        for (let j = 0; j < aPointArray.length; j++) {
          if (j == iSelPointIndex) {
            continue;
          }
          if (aPointArray[j].ID == dSelPoint.ID) {
            aPointArray[j].ID = dSelPointCopy.ID;
            aPointArray[j].strName = dSelPointCopy.strName;
            aPointArray[j].strNumber = dSelPointCopy.strNumber;
            break;
          }
        }

        dSelCell.iSelStatus = 0;
      }

      //绘制图形
      this.drawFormation();
    }
    
    this.FlashView();
  },

  //点击上阵界面的球员
  ClickFootman: function (event) {
    //console.log("formation.js, ClickFootman,");
    let iIndex = event.target.dataset.index;
    //console.log("formation.js, ClickFootman, index = " + iIndex);
    //console.log(event);

    let dMatchingData = dGlobalData.aMatchingDataArray[0];
    if (dGlobalData.bInMatch == true && dMatchingData.aFootmanReplacedArray.length >= dEnum.iMaxReplacedCount)
    {
      return;
    }

    let data = this.data;

    if (iIndex >= data.aCellArray.length){
      return;
    }

    let dCellData = data.aCellArray[iIndex];
    if (dCellData.iSelStatus == 0)
    {
      if (dGlobalData.bInMatch == true && dCellData.iIsRelpaced == 1) 
      {
        return;
      }
      dCellData.iSelStatus = 1;
      for (let i = 0; i < data.aCellArray.length; i++) {
        if (i != iIndex) {
          data.aCellArray[i].iSelStatus = 0;
        }
      }
    }
    else {
      dCellData.iSelStatus = 0;
    }

    this.FlashView();
    //this.setData({
    //  aCellArray: data.aCellArray
    //})

    //console.log(data.aCellArray);

    
  },

  UpdateIsInField: function() 
  {
    //console.log("formation.js, UpdateIsInField,");
    let dFormation = databus.dFormation;
    let aPointArray = dFormation.aFormationArray[dFormation.iSelFormIndex];

    for (let i = 0; i < this.data.aCellArray.length; i++)
    {
      this.data.aCellArray[i].IsInField = 0;
      for (let j = 0; j < aPointArray.length; j++) 
      {
        if (aPointArray[j].ID == this.data.aCellArray[i].ID) 
        {
          this.data.aCellArray[i].IsInField = 1;
          break;
        }
      }
    }
  },

  UpdatePhysicalPower: function () {
    //console.log("formation.js, UpdatePhysicalPower,");

    if (dGlobalData.bInMatch == false)
    {
      return;
    }

    let dFormation = databus.dFormation;
    let aPointArray = dFormation.aFormationArray[dFormation.iSelFormIndex];
    let aFootmanPerform = dGlobalData.aMatchingDataArray[0].aFootmanPerform;

    for (let i = 0; i < this.data.aCellArray.length; i++) {
      for (let j = 0; j < aPointArray.length; j++) {
        if (aPointArray[j].ID == this.data.aCellArray[i].ID) {
          let dOneData = Perform.GetDataFromFootmanPerform(aFootmanPerform, aPointArray[j].strName)
          this.data.aCellArray[i].fPhysicalPower = dOneData.fPhysicalPower;
          this.data.aCellArray[i].strPhysicalPower = dOneData.strPhysicalPower;
          break;
        }
      }
    }

    //console.log("formation.js, UpdatePhysicalPower,aCellArray = ", this.data.aCellArray);
  },
  
  //是否设置好上阵了
  IsGoFieldFinish:function()
  {
    //console.log("formation.js, IsGoFieldFinish,");
    let dFormation = databus.dFormation;
    let aPointArray = dFormation.aFormationArray[dFormation.iSelFormIndex];
    for (let j = 0; j < aPointArray.length; j++) {
      if (aPointArray[j].ID == 0) {
        return false;
      }
    }
    return true;
  },

  //====================================================================================
  SelectFormation: function (event) {

    if (dGlobalData.bInMatch == true) {
      Util.ShowTips("比赛过程中只能使用已预设的三阵型");
      return;
    }
    var url = '../selectformation/selectformation';
    //console.log("GotoSelectTeam, url = " + url)
    wx.navigateTo({
      url
    })
  },

  ChangeSelFormIndex: function (event) {
    let dFormation = databus.dFormation;
    //console.log("formation.js, ChangeSelFormIndex, index = " + event.target.dataset.index);
    let iOldIndex = dFormation.iSelFormIndex;
    let iNewIndex = event.target.dataset.index;
    dFormation.iSelFormIndex = iNewIndex;

    this.data.iFunctionIndex = 0;

    //Assistant.SwitchSelectFootman(dFormation, iOldIndex, iNewIndex);
    let aOldArray = dFormation.aFormationArray[iOldIndex];
    let aNewArray = dFormation.aFormationArray[iNewIndex];
    Assistant.AutoSelectFootman(aOldArray, aNewArray);

    this.ClearAttDefSetting();

    this.FlashView();

    //if (iOldIndex != dFormation.iSelFormIndex) {
    //  this.drawFormation();
    //}

  },

  ChangeFunctionIndex: function (event) {
    console.log("formation.js, ChangeFunctionIndex, index = " + event.target.dataset.index);
    let iIndex = event.target.dataset.index;
    if (iIndex > 0) {
      if (this.IsGoFieldFinish() == false)
      {
        Util.ShowTips("请完成上阵设置");
        return;
      }
    }

    this.data.iFunctionIndex = iIndex;

    this.FlashView();
  },

  CheckBoxChange: function (event) {
    //console.log("formation.js, CheckBoxChange, value = ", event.detail.value);

    let dValue = event.detail.value;
    let dBase = databus.dBase;
    let dFormation = databus.dFormation;
    let dTactics = databus.dTactics;
    let dOpponentBase = dGlobalData.GetBaseData(dBase.strOpponentName);
    let dOpponentFormation = dGlobalData.GetFormationData(dBase.strOpponentName);
    let dOpponentTactics = dGlobalData.GetTacticsData(dBase.strOpponentName);
    
    if (dValue.length > 0 && dValue[0] == "Marked")
    {
      dGlobalData.iOpponentMarked = 1;
      //console.log("formation.js, CheckBoxChange 1" );
      AI.ClearMarking(dOpponentBase, dOpponentFormation, dOpponentTactics);
      AI.SetMarkingBySucceedRate(dOpponentBase, dOpponentFormation, dOpponentTactics, dBase, dFormation, dTactics)
    }
    else
    {
      dGlobalData.iOpponentMarked = 0;
      AI.ClearMarking(dOpponentBase, dOpponentFormation, dOpponentTactics);

      //console.log("formation.js, CheckBoxChange 2");
    }

    //console.log("formation.js, CheckBoxChange, dGlobalData.iOpponentMarked = " + dGlobalData.iOpponentMarked);
    dGlobalData.bInMatch
    this.setData({
      iOpponentMarked: dGlobalData.iOpponentMarked,
      iInMatch: dGlobalData.bInMatch==true ? 1 : 0,
    })

    this.FlashView();
  },

  AssisantSelectFootman: function (event) {
    Assistant.AssisantSelectFootman2();
    this.FlashView();
  },

  //=======================================================================================
  //策略界面部分

  //改变心态
  ChangeMentalIndex: function (event) {
    
    let dTactics = databus.dTactics;
    dTactics.iMentalIndex = event.target.dataset.index;
    this.ClearAttDefSetting();
    /*
    dTactics.iLeftAttackPoint = mCfgTactics.MentalPoint[dTactics.iMentalIndex].Attack;
    dTactics.iLeftDefendPoint = mCfgTactics.MentalPoint[dTactics.iMentalIndex].Defend;
    dTactics.mRoutineCountMap = {};
    for (let strTeamName in dTactics.mOpponentDefendMap)
      dTactics.mOpponentDefendMap[strTeamName] = databus.InitDefendData();
      
    //更新盯人状态
    if (dGlobalData.bInMatch == true) {
      dGlobalData.UpdateMarkingStatus(dGlobalData.aMatchingDataArray[0], dGlobalData.aMatchingDataArray[1]);
      dGlobalData.UpdateMarkingStatus(dGlobalData.aMatchingDataArray[1], dGlobalData.aMatchingDataArray[0]);
    }
    */
    //console.log("tactics.js, ChangeMentalIndex, dTactics.iLeftAttackPoint = " + dTactics.iLeftAttackPoint);

    this.FlashView();
  },

  //改变节奏
  ChangeRhythmIndex: function (event) {
    let dTactics = databus.dTactics;
    //console.log("tactics.js, ChangeRhythmIndex, index = " + event.target.dataset.index);
    //let iOldIndex = dTactics.iRhythmIndex;
    dTactics.iRhythmIndex = event.target.dataset.index;

    this.ClearAttDefSetting();
    /*
    dTactics.iLeftAttackPoint = mCfgTactics.MentalPoint[dTactics.iMentalIndex].Attack;
    dTactics.iLeftDefendPoint = mCfgTactics.MentalPoint[dTactics.iMentalIndex].Defend;
    dTactics.mRoutineCountMap = {};
    for (let strTeamName in dTactics.mOpponentDefendMap)
      dTactics.mOpponentDefendMap[strTeamName] = databus.InitDefendData();

    //更新盯人状态
    if (dGlobalData.bInMatch == true) {
      dGlobalData.UpdateMarkingStatus(dGlobalData.aMatchingDataArray[0], dGlobalData.aMatchingDataArray[1]);
      dGlobalData.UpdateMarkingStatus(dGlobalData.aMatchingDataArray[1], dGlobalData.aMatchingDataArray[0]);
    }
    */
    this.FlashView();
  },

  ClearAttDefSetting: function (event) {

    let dTactics = databus.dTactics;
    dTactics.iLeftAttackPoint = mCfgTactics.MentalPoint[dTactics.iMentalIndex].Attack;
    dTactics.iLeftDefendPoint = mCfgTactics.MentalPoint[dTactics.iMentalIndex].Defend;
    dTactics.mRoutineCountMap = {};
    for (let strTeamName in dTactics.mOpponentDefendMap)
      dTactics.mOpponentDefendMap[strTeamName] = databus.InitDefendData();

    //更新盯人状态
    if (dGlobalData.bInMatch == true) {
      dGlobalData.UpdateMarkingStatus(dGlobalData.aMatchingDataArray[0], dGlobalData.aMatchingDataArray[1]);
      dGlobalData.UpdateMarkingStatus(dGlobalData.aMatchingDataArray[1], dGlobalData.aMatchingDataArray[0]);
    }
  },

  ChangePosWidthIndex: function (event) {
    let dTactics = databus.dTactics;
    //console.log("tactics.js, ChangePosWidthIndex, index = " + event.target.dataset.index);
    //let iOldIndex = dTactics.iRhythmIndex;
    dTactics.iPosWidthIndex = event.target.dataset.index;

    this.FlashView();
  },

  ChangeDefendDepthIndex: function (event) {
    let dTactics = databus.dTactics;
    //console.log("tactics.js, ChangeDefendDepthIndex, index = " + event.target.dataset.index);
    //let iOldIndex = dTactics.iRhythmIndex;
    dTactics.iDefendDepthIndex = event.target.dataset.index;

    this.FlashView();
  },
  
  //=======================================================================================
  //进攻界面
  ResetAttackShowData: function()
  {
    let dTactics = databus.dTactics;
    let iLeftAttackPoint = mCfgTactics.MentalPoint[dTactics.iMentalIndex].Attack;

    this.data.iLeftAttackPoint = iLeftAttackPoint;
    this.data.aRoutineArray = [];
  },

  AddAttackCount: function (event)
  {
    //console.log("formation.js, AddAttackCount, strRoutineName = " + event.target.dataset.strroutinename);
    let strRoutineName = event.target.dataset.strroutinename;
    let dTactics = databus.dTactics;

    if (dTactics.iLeftAttackPoint <= 0)
      return;

    if (dTactics.mRoutineCountMap[strRoutineName] == null)
    {
      dTactics.mRoutineCountMap[strRoutineName] = 0;
    }
    dTactics.mRoutineCountMap[strRoutineName]++;
    dTactics.iLeftAttackPoint--;

    this.FlashView();
  },
  ReduceAttackCount: function (event) {
    //console.log("formation.js, ReduceAttackCount, strRoutineName = " + event.target.dataset.strroutinename);
    let strRoutineName = event.target.dataset.strroutinename;
    let dTactics = databus.dTactics;
    if (dTactics.mRoutineCountMap[strRoutineName] == null) {
      dTactics.mRoutineCountMap[strRoutineName] = 0;
    }
    if (dTactics.mRoutineCountMap[strRoutineName] <= 0)
      return;
    dTactics.mRoutineCountMap[strRoutineName]--;
    dTactics.iLeftAttackPoint++;
    this.FlashView();
  },

  //=======================================================================================
  //防守界面
  ClickFormationPoint_InDefned: function(event)
  {
    let x = event.detail.x - iOutBorder - event.currentTarget.offsetLeft - iInerBorder;
    let y = event.detail.y - event.currentTarget.offsetTop - iInerBorder;

    //console.log("formation.js, ClickFormationPoint, detail.x=" + event.detail.x + ", detail.y=" + event.detail.y);
    //console.log("formation.js, ClickFormationPoint_InDefned, x=" + x + ", y=" + y);

    let dBase = databus.dBase;
    let bNeedShowMarking = true;
    let aPointArray = [];
    if (dGlobalData.bInMatch == false)
      aPointArray = databus.MakePointArray_Opponent(dBase.strOpponentName, bNeedShowMarking);
    else 
      aPointArray = dGlobalData.aMatchingDataArray[1].dFormation.aFormationArray[0];

    let iSelPointIndex = -1;
    for (let i = 0; i < aPointArray.length; i++) {
      let iLeft = aPointArray[i].x - iPointDiameter / 2;
      let iRight = aPointArray[i].x + iPointDiameter / 2;
      let iTop = aPointArray[i].y - iPointDiameter / 2;
      let iButtom = aPointArray[i].y + iPointDiameter / 2;
      let strName = aPointArray[i].strName;

      if (iLeft - iExtPointClick <= x && x <= iRight + iExtPointClick && iTop - iExtPointClick <= y && y <= iButtom + iExtPointClick) {
        //console.log("formation.js, click point number is " + aPointArray[i].strNumber);
        iSelPointIndex = i; //设置为选中状态
        break;
      }
      else {
        //console.log("formation.js, strName = " + strName + ", iLeft = " + iLeft + ", iRight = " + iRight + ", iTop = " + iTop + ", iButtom = " + iButtom);
      }
    }

    //console.log("formation.js, ClickFormationPoint_InDefned iSelPointIndex = " + iSelPointIndex);
    //没有选中
    if (iSelPointIndex == -1) {
      return;
    }
    else {
      //console.log("formation.js, ClickFormationPoint_InDefned aPointArray[iSelPointIndex] = ", aPointArray[iSelPointIndex]);
      let dBase = databus.dBase;
      let dTactics = databus.dTactics;
      
      let dDefnedData = dTactics.mOpponentDefendMap[dBase.strOpponentName];
      let strName = aPointArray[iSelPointIndex].strName;
      if (aPointArray[iSelPointIndex].iMarkingStatus == 0)
      {
        if (dTactics.iLeftDefendPoint <= 0)
          return;
        aPointArray[iSelPointIndex].iMarkingStatus = 1;
        dDefnedData.mMarkingFootmanMap[strName] = 1;
        dTactics.iLeftDefendPoint--;
      }
      else if (aPointArray[iSelPointIndex].iMarkingStatus == 1)
      {
        aPointArray[iSelPointIndex].iMarkingStatus = 0;
        delete dDefnedData.mMarkingFootmanMap[strName];
        dTactics.iLeftDefendPoint++;
      }
        
      //console.log("formation.js, ClickFormationPoint_InDefned, mMarkingFootmanMap = ", dDefnedData.mMarkingFootmanMap);

      this.setData({
        aPointArray: aPointArray
      })

      this.FlashView();

    }
  },

  GetMarkingCount: function() 
  {
    let dBase = databus.dBase;
    let dTactics = databus.dTactics;
    let iCount = 0;
    //console.log("formation.js, GetMarkingCount, mOpponentDefendMap = ");
    //console.log(dTactics.mOpponentDefendMap);

    for (let strFootmanName in dTactics.mOpponentDefendMap[dBase.strOpponentName].mMarkingFootmanMap)
      iCount++;

    let mMarkingRoutineMap = dTactics.mOpponentDefendMap[dBase.strOpponentName].mMarkingRoutineMap;
    for (let strRoutineName in mMarkingRoutineMap)
      iCount += mMarkingRoutineMap[strRoutineName];

    //console.log("formation.js, GetMarkingCount, iCount = " + iCount);

    return iCount;
  },

  AddDefendCount: function (event) {
    //console.log("formation.js, AddAttackCount, strRoutineName = " + event.target.dataset.strroutinename);
    let strRoutineName = event.target.dataset.strroutinename;
    let dBase = databus.dBase;
    let dTactics = databus.dTactics;

    if (dTactics.iLeftDefendPoint <= 0)
      return;

    let dDefendData = dTactics.mOpponentDefendMap[dBase.strOpponentName];
    //console.log(dBase.strOpponentName);
    if (dDefendData.mMarkingRoutineMap[strRoutineName] == null) {
      dDefendData.mMarkingRoutineMap[strRoutineName] = 0;
    }
    dDefendData.mMarkingRoutineMap[strRoutineName]++;
    dTactics.iLeftDefendPoint--;

    this.FlashView();
  },
  ReduceDefendCount: function (event) {
    //console.log("formation.js, ReduceAttackCount, strRoutineName = " + event.target.dataset.strroutinename);
    let strRoutineName = event.target.dataset.strroutinename;
    let dBase = databus.dBase;
    let dTactics = databus.dTactics;

    let dDefendData = dTactics.mOpponentDefendMap[dBase.strOpponentName];
    if (dDefendData.mMarkingRoutineMap[strRoutineName] == null) {
      dDefendData.mMarkingRoutineMap[strRoutineName] = 0;
    }
    if (dDefendData.mMarkingRoutineMap[strRoutineName] <= 0)
      return;
    dDefendData.mMarkingRoutineMap[strRoutineName]--;
    dTactics.iLeftDefendPoint++;

    this.FlashView();
  },
  //=======================================================================================
  //排序处理
  SortAttackRoutine: function (event) 
  {
    let iSortType = event.target.dataset.type;
    //console.log("Procedure.js, SortAttackRoutine, iSortType = " + iSortType);
    this.data.iSortType_AttackRout = iSortType;
    this.FlashView();
  },
  SortDefendRoutine: function (event) {
    let iSortType = event.target.dataset.type;
    //console.log("Procedure.js, SortDefendRoutine, iSortType = " + iSortType);
    this.data.iSortType_DefendRout = iSortType;
    this.FlashView();
  },

  SortAttackRoutineArray: function (aRoutineArray)
  {
    //console.log("Procedure.js, SortAttackRoutineArray, ");

    if (this.data.iSortType_AttackRout == emSortType_AttackRout_Default)
    {
      //以成功率排序
      Util.SortArray(aRoutineArray, "fRate", "float", 1);
    }
    else if (this.data.iSortType_AttackRout == emSortType_AttackRout_Name)
    {
      //以名字排序
      Util.SortArray(aRoutineArray, "strName", "str", 2);
    }
    else if (this.data.iSortType_AttackRout == emSortType_AttackRout_Rate) 
    {
      //以成功率排序
      Util.SortArray(aRoutineArray, "fRate", "float", 1);
    }
    else if (this.data.iSortType_AttackRout == emSortType_AttackRout_Count) 
    {
      //以次数排序
      Util.SortArray(aRoutineArray, "iAttackCount", "int", 1);
    }
  },

  SortDefendRoutineArray: function (aRoutineArray) {
    //console.log("Procedure.js, SortDefendRoutineArray, ");

    if (this.data.iSortType_DefendRout == emSortType_DefendRout_Default) {
      //以成功率排序
      Util.SortArray(aRoutineArray, "fRate", "float", 1);
    }
    else if (this.data.iSortType_DefendRout == emSortType_DefendRout_Name) {
      //以名字排序
      Util.SortArray(aRoutineArray, "strName", "str", 2);
    }
    else if (this.data.iSortType_DefendRout == emSortType_DefendRout_Rate) {
      //以成功率排序
      Util.SortArray(aRoutineArray, "fRate", "float", 1);
    }
    else if (this.data.iSortType_DefendRout == emSortType_DefendRout_Count) {
      //以次数排序
      Util.SortArray(aRoutineArray, "iDefendCount", "int", 1);
    }
  },

  //=======================================================================================
  //表现数据排序
  SortCellData: function (event)
  {
    let iSortType = event.target.dataset.type;

    console.log("formation.js, SortCellData, iSortType = " + iSortType);

    let strSortKey = "";
    if (iSortType == 1)
      strSortKey = "LikeNumber";
    else if (iSortType == 2)
      strSortKey = "Name";
    else if (iSortType == 3)
      strSortKey = "PositionA";
    else if (iSortType == 4)
      strSortKey = "Ability";
    else if (iSortType == 5)
      strSortKey = "fPhysicalPower";

    //console.log("formation.js, SortCellData, aCellArray = ", Util.DeepCopy(this.data.aCellArray));
    //console.log("formation.js, SortCellData, strSortKey = " + strSortKey);
    this.SortCellData_Sub(this.data.aCellArray, strSortKey);
    //console.log("formation.js, SortCellData, aCellArray = ", Util.DeepCopy(this.data.aCellArray));
    this.FlashView();
  },

  SortCellData_Sub: function (aCellArray, strSortKey)
  {
    let strDataType = "";
    let iUppper = 1;  //1:降序；2：升序
    if(strSortKey == "LikeNumber") {
      strDataType = "int";
      iUppper = 2;
    }
    else if (strSortKey == "Name") {
      strDataType = "str";
      iUppper = 2;
    }
    else if (strSortKey == "PositionA") {
      strDataType = "str";
      iUppper = 1;
    }
    else if (strSortKey == "Ability") {
      strDataType = "int";
      iUppper = 1;
    }
    else if (strSortKey == "fPhysicalPower") {
      strDataType = "float";
      iUppper = 2;
    }

    Util.SortArray(aCellArray, strSortKey, strDataType, iUppper)
  },

  //=======================================================================================
  TestRate: function() 
  { 
  },
})


