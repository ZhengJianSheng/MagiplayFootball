// pages/match/match.js
import DataBus from '../databus'
import GlobalData from '../GlobalData'

var DrawFormation = require('../DrawFormation')
var Tactics = require('../Tactics')
var Procedure = require('../Procedure')
var Commentary = require('../Commentary')
var Perform = require('../Perform')
var mCfgAttackRoutine = require('../../data/DataAttackRoutine')
var mCfgFootman = require('../../data/DataFootman')
var mCfgTactics = require('../../data/DataTactics')
var AI = require('../AI')
var mCfgClub = require('../../data/DataClub')
var Assistant = require('../Assistant')
var Substitute = require('../Substitute')
var Util = require('../../utils/util.js')

let databus = new DataBus();
let dGlobalData = new GlobalData();
let dEnum = dGlobalData.GetEnum();

let emProcClass_Pass = "Pass"; //传球类型的Procedure
let emProcClass_Shot = "Shot"; //射门类型的Procedure
let emProcClass_Dribble = "Dribble";  //盘带类型的Procedure
let emProcClass_RunRestri = "RunRestri";  //跑位类型的Procedure

let emMatchStatus_NotStart = 1; //还没开始
let emMatchStatus_FirstHalf = 2; //上半场
let emMatchStatus_FirstHalf_Stop = 3; //上半场暂停中
let emMatchStatus_MiddleRest = 4; //中场休息
let emMatchStatus_SecondHalf = 5; //下半场
let emMatchStatus_SecondHalf_Stop = 6; //下半场暂停中
let emMatchStatus_End = 7; //比赛结束

let emTeam1 = 1;  //自己
let emTeam2 = 2;   //对方 

//数据类型大类
let emBigShowType_Data = 0;       //数据
let emBigShowType_Procedure = 1;  //动作
let emBigShowType_Routine = 2;    //套路
let emBigShowType_Commentray = 3; //解说

//动作数据的小类型
let emShowProcedureType_Self = 0;   //已方
let emShowProcedureType_Opponent = 1; //对方
let emShowProcedureType_Wait = 2; //备用

//套路数据的小类型
let emShowRoutineType_Self = 0;   //已方
let emShowRoutineType_Opponent = 1; //对方
let emShowRoutineType_Wait = 2; //备用


let iTestFast = 0;  //设置为1时没有进攻套路，比赛飞快进行
let bTestProcedure = false;

let iRoutineRandomSplit = 60;  //每个战术间隔多少秒  //60

let TipsAdustButtonShow1 = "战术";
let TipsAdustButtonShow2 = "等待";

//主循环定时器
const __ = {
  timer: Symbol('timer'),
}
let iTimeInterval = 600; //定时器间隔，单位毫秒
let iTimeFastInterval = 100;//无战术进行时的定时器间隔，单位毫秒   (不要用1毫秒，会导致显示和数据处理不同步)
let iTimeGoalInterval = 300;//进球时的定时器间隔，单位毫秒



let iDefaultGoldCounting = 9;   //进球后闪烁多少秒
let iResetRoutineMinute = 15;  //多少分钟重置双方的进攻套路

let iUpdateMarkingInterval = (iResetRoutineMinute * 2 + 5) * 60;  //多少秒调整盯人设置

let iSubstituteRemindInterval = 300;  //间隔多少秒提醒换人
//let iSubstituteRemindInterval = 60;

let emUpdateMarking_ByRate = 1; //根据对方成功率设置盯人
let emUpdateMarking_ByUsed = 2; //根据对方使用的战术套路设置盯人

//---------------------------------------------------------------------

Page({

  //========================================================================
  //页面初始化
  data: {
    
    //--------------------------------------------------------------------
    //主循环部分
    iInterval: iTimeInterval,
    iMatchStatus: emMatchStatus_NotStart, //比赛状态
    strMatchStatusDesc: "",  //比赛状态的描述
    iLeftSecondsStartRoutine:0, //还有多少秒开启战术
    iWaitingAdust: 0, //是否等待调整战术
    iLeftSecondsUpdateMarking:0, //还有多少秒更新盯人战术
    iLeftSecondsSubstituteRemind:0, //还有多少秒提醒换人

    //--------------------------------------------------------------------
    //界面数据
    
    iScrollTop : 0, //解说滚动条
    //aCommentaryArray:[],  //解说数据    //放到global里面了
    iCurCommentaryInex: -1,  //播放到哪个解说的索引，不考虑不展示的解说
    aShowCommentaryArray: [],  //需要展示的数据
    dCurShowCommentary: {}, //当前要显示的解说
    
    iShowGoal:1,
    iShowHighlight: 1,
    iShowAssist: 1,
    iShowSystem: 1,

    iInfoIndex: 0,   //顶上显示信息的索引号
    iBigShowType: 0, //下面的展示数据类型(大), 0:数据；1:解说
    iShowDataSubType:0,   //显示数据的小类型

    aShowProcedureArray: [],  //动作面板数据
    iShowProcedureType: emShowProcedureType_Self,   //显示动作数据的小类型, 0:已方; 1:对方

    aShowRoutineArray: [],  //套路面板数据
    iShowRoutineType: emShowRoutineType_Self,   //显示套路数据的小类型, 0:已方; 1:对方

    //iMinute: 0,       //时间，分钟
    strMinute: "00",  //时间，分钟
    //iSecond: 0,       //时间，秒
    strSecond: "00",  //时间，秒

    strAssisterName:"", //助攻者名字 

    aFootmanPerform: [],  //我方球员表现数据
    aOpponentFootmanPerform: [],  //对方球员表现数据
    mTeamPerform: {},     //我方队伍表现数据
    mOpponentTeamPerform: {}, //对方队伍表现数据

    strAdustButtonShow: TipsAdustButtonShow1, //战术按钮显示
    strUsedRoutineText: "", //当时使用的战术套路提示

    strSelfSortKey: "",      //比赛数据界面上的排序key(已方)
    strOpponentSortKey: "",  //比赛数据界面上的排序key(对方)

    //---------------------------------------------------------------------
    //运行逻辑数据
    //iHoldBallIndex: 0,  //哪边队伍正在持球  放到dGlobalData那边了
    iShowHoldBallIndex: 0,  //显示哪边队伍正在持球
    iMatchMark:0, //比赛进程标识，0：未开始；1：上半场；2：下半场；3：结束
    aShowMatchingDataArray: dGlobalData.aMatchingDataArray,  //比赛进行时的数据,只用作展示用，外部的aMatchingDataArray才是母体
    iRoutineStatus: 0, //当前的进攻套路执行状态，0：未执行或执行完成；1：执行中;2:双方都使用完了
    dAttackRoutine: null,  //使用的进攻套路
    iCurProcedureIndex: 0, //当前进行到的ProcedureIndex
    iNextResetRoutineMinute: iResetRoutineMinute, //下一次重置双方的进攻套路的分钟数
    iNextPowerMinute: 1,//下一次扣除体力的分钟数
    iGoalCounting : 0,  //进球后的闪烁次数

  },

  ResetData: function() 
  {
    //--------------------------------------------------------------------
    //主循环部分
    this.data.iInterval = iTimeInterval;
    this.data.iMatchStatus = emMatchStatus_NotStart;
    this.data.strMatchStatusDesc = "";
    this.data.iLeftSecondsStartRoutine = 0;
    this.data.iWaitingAdust = 0;
    this.data.iLeftSecondsUpdateMarking = 0;
    this.data.iLeftSecondsSubstituteRemind = 0;

    //--------------------------------------------------------------------
    //界面数据
    this.data.iScrollTop = 0;
    //this.data.aCommentaryArray = [];
    this.data.iCurCommentaryInex = -1;
    this.data.aShowCommentaryArray = [];
    this.data.dCurShowCommentary = { };
    this.data.iShowGoal = 1;
    this.data.iShowHighlight = 1;
    this.data.iShowAssist = 1;
    this.data.iShowSystem = 1;
    this.data.iInfoIndex = 0;
    this.data.iBigShowType = 0;
    this.data.iShowDataSubType = 0;
    this.data.aShowProcedureArray = []; //动作面板数据
    this.data.iShowProcedureType = emShowProcedureType_Self;   //显示动作数据的小类型, 0:已方; 1:对方
    this.data.aShowRoutineArray = [];  //套路面板数据
    this.data.iShowRoutineType = emShowRoutineType_Self;   //显示套路数据的小类型, 0:已方; 1:对方

    this.data.strMinute = "00";
    this.data.strSecond = "00";
    this.data.strAssisterName = "";
    this.data.aFootmanPerform = [];
    this.data.aOpponentFootmanPerform = [];
    this.data.mTeamPerform = { };
    this.data.mOpponentTeamPerform = { };
    this.data.strAdustButtonShow = TipsAdustButtonShow1;
    this.data.strUsedRoutineText = "战术反馈";
    this.data.strSelfSortKey = "iFieldStatus";      //比赛数据界面上的排序key(已方)
    this.data.strOpponentSortKey = "iFieldStatus";  //比赛数据界面上的排序key(对方)
    

    //---------------------------------------------------------------------
    //运行逻辑数据
    this.data.iShowHoldBallIndex = 0;
    this.data.iMatchMark = 0;
    this.data.aShowMatchingDataArray = dGlobalData.aMatchingDataArray;
    this.data.iRoutineStatus = 0;
    this.data.dAttackRoutine = null;
    this.data.iCurProcedureIndex = 0;
    this.data.iNextResetRoutineMinute = iResetRoutineMinute;
    this.data.iNextPowerMinute = 1;
    this.data.iGoalCounting = 0;

    //----------------------------------------------
    //外围数据
    dGlobalData.aCommentaryArray = [];
    dGlobalData.iHoldBallIndex = 0;
    dGlobalData.aMatchingDataArray = new Array(2);  //比赛进行时的数据  //InitMatchingData
    dGlobalData.iMinute = 0;    //时间，分钟
    dGlobalData.iSecond = 0;  //时间，秒
  },


  //========================================================================================================
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
    if (dGlobalData.bInitMatchData == false)
    {
      this.ResetData();
      //console.log("match.js, onLoad, start init");

      databus.BackupData();
      let dBase = databus.dBase;
      let dFormation = databus.dFormation;
      let dTactics = databus.dTactics;
      let dTeam = databus.dTeam;
      dGlobalData.aMatchingDataArray[0] = databus.InitMatchingData(dBase.strTeamName, dBase, dFormation, dTactics, dTeam);
      dGlobalData.UpdateFieldStatus(dGlobalData.aMatchingDataArray[0]);
      dGlobalData.SortFootmanPerform(dGlobalData.aMatchingDataArray[0].aFootmanPerform, "iFieldStatus");
      
      let dOpponentBase = dGlobalData.GetBaseData(dBase.strOpponentName);
      let dOpponentFormation = dGlobalData.GetFormationData(dBase.strOpponentName);
      let dOpponentTactics = dGlobalData.GetTacticsData(dBase.strOpponentName);
      let dOpponentTeam = dGlobalData.GetTeamData(dBase.strOpponentName);
      dGlobalData.aMatchingDataArray[1] = databus.InitMatchingData(dBase.strOpponentName, dOpponentBase, dOpponentFormation, dOpponentTactics, dOpponentTeam);

      this.data.aShowMatchingDataArray = dGlobalData.aMatchingDataArray;

      //主循环定时器
      this[__.timer] = null;
      this.data.iMatchStatus = emMatchStatus_NotStart;
      this.SetMatchStatusDesc();

      let strCommentary = Commentary.MakeCommentary_GameReady();
      Commentary.AddCommentary(dGlobalData.aCommentaryArray, dEnum.emCommentaryType_System, strCommentary, 0);
      this.data.iCurCommentaryInex = 0;
      this.data.dCurShowCommentary = dGlobalData.aCommentaryArray[this.data.iCurCommentaryInex];
      
      //设置盯人和进攻战术
      let bShowCommentary = false;
      this.AI_UpdateMarking(emUpdateMarking_ByRate, bShowCommentary);

      //更新盯人状态
      dGlobalData.UpdateMarkingStatus(dGlobalData.aMatchingDataArray[0], dGlobalData.aMatchingDataArray[1]);
      dGlobalData.UpdateMarkingStatus(dGlobalData.aMatchingDataArray[1], dGlobalData.aMatchingDataArray[0]);
      //更新上场状态
      dGlobalData.UpdateFieldStatus(dGlobalData.aMatchingDataArray[1]);
      dGlobalData.SortFootmanPerform(dGlobalData.aMatchingDataArray[1].aFootmanPerform, "iFieldStatus");
      
      console.log("match.js, onLoad, aMatchingDataArray[0] = ", dGlobalData.aMatchingDataArray[0]);
      console.log("match.js, onLoad, aMatchingDataArray[1] = ", dGlobalData.aMatchingDataArray[1]);

      dGlobalData.bInitMatchData = true;

      //console.log("match.js, onLoad, aShowMatchingDataArray = ", this.data.aShowMatchingDataArray);

      //this.TestCommentary();
      //console.log("match.js, onLoad, dCurShowCommentary = ");
      //console.log(this.data.dCurShowCommentary);
    } 

    if (dGlobalData.bInMatch == true)
    {
      this.data = dGlobalData.dMatchData;
    }
    //console.log(this.data);
    this.FlashView(1); 
  },

  

  //====================================================================================
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () 
  {
    //console.log("match.js, onShow, iWaitingAdust = " + this.data.iWaitingAdust);
    //修改了战术但没点保存,还原数据
    console.log("match.js, onShow");
    if (dGlobalData.bHasChangeTactics == true) 
    {
      console.log("match.js, onShow 1");
      dGlobalData.bHasChangeTactics = false;
      databus.MatchingRecoverData();
    }

    this.FlashView();   //换人后返回要立刻刷新
    //this.setData({
    //  iWaitingAdust: this.data.iWaitingAdust,
    //})
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    console.log("match.js, onHide");
  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    console.log("match.js, onUnload");

    if (dGlobalData.bInMatch == true)
    {
      this.MatchStop();

      dGlobalData.dMatchData = this.data;
    }
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

  //====================================================================================
  //点击操作
  ChangeInfoIndex: function (event) 
  {
    //console.log("match.js, ChangeInfoIndex, index = " + event.target.dataset.index);
    this.setData({
      iInfoIndex: event.target.dataset.index,
    })

    this.FlashView(2);
  },

  SetCommentaryShow: function (event) 
  {
    //console.log("match.js, SetCommentaryShow, index = " + event.target.dataset.index);
    let index = event.target.dataset.index;
    if (index == 0)
      this.data.iShowGoal = (this.data.iShowGoal + 1 ) % 2;
    else if (index == 1)
      this.data.iShowHighlight = (this.data.iShowHighlight + 1) % 2;
    else if (index == 2)
      this.data.iShowAssist = (this.data.iShowAssist + 1) % 2;
    else if (index == 3)
    {
      this.data.iShowSystem = (this.data.iShowSystem + 1) % 2;
    }

    this.setData({
      iShowGoal: this.data.iShowGoal,
      iShowHighlight: this.data.iShowHighlight,
      iShowAssist : this.data.iShowAssist,
      iShowSystem: this.data.iShowSystem,
    })

    this.FlashView(3);
  },

  
  ChangeMatchStatus: function() {

    if (this.data.iMatchStatus == emMatchStatus_NotStart)
    {
      this.data.iMatchStatus = emMatchStatus_FirstHalf;
      //this.data.iMatchStatus = emMatchStatus_SecondHalf;
      this.MatchBegin();
    }
    else if (this.data.iMatchStatus == emMatchStatus_FirstHalf) 
    {
      //this.data.iMatchStatus = emMatchStatus_FirstHalf_Stop;  //在MatchStop内部处理
      this.MatchStop();
    }
    else if (this.data.iMatchStatus == emMatchStatus_FirstHalf_Stop) {
      this.data.iMatchStatus = emMatchStatus_FirstHalf;
      this.MatchContinue();
    }
    else if (this.data.iMatchStatus == emMatchStatus_MiddleRest) {
      this.data.iMatchStatus = emMatchStatus_SecondHalf;
      this.MatchSecondHalfStart();
    }
    else if (this.data.iMatchStatus == emMatchStatus_SecondHalf) {
      //this.data.iMatchStatus = emMatchStatus_SecondHalf_Stop; //在MatchStop内部处理
      this.MatchStop();
    }
    else if (this.data.iMatchStatus == emMatchStatus_SecondHalf_Stop) {
      this.data.iMatchStatus = emMatchStatus_SecondHalf;
      this.MatchContinue();
    }
    else if (this.data.iMatchStatus == emMatchStatus_End) {
      this.data.iMatchStatus = emMatchStatus_End;
      this.MatchFinish();
    }
  },

  ChangeBigShowType: function () {
    this.data.iBigShowType = (this.data.iBigShowType + 1) % 4;
    console.log("match.js, ChangeBigShowType, iBigShowType = " + this.data.iBigShowType );
    this.setData({
      iBigShowType: this.data.iBigShowType,
    })
    this.FlashView(4);
  },

  ChangeShowDataSubType: function (event) {
    let index = event.target.dataset.index;
    this.data.iShowDataSubType = index;
    //console.log("match.js, ChangeShowDataSubType, iShowDataSubType = " + this.data.iShowDataSubType );
    this.setData({
      iShowDataSubType: this.data.iShowDataSubType,
    })
    this.FlashView(5);
  },

  ChangeShowProcedure: function (event) {
    let index = event.target.dataset.index;

    if (index >= 2)
      return;

    this.data.iShowProcedureType = index;
    
    //console.log("match.js, ChangeShowProcedure, iShowProcedureType = " + this.data.iShowProcedureType );
    this.setData({
      iShowProcedureType: this.data.iShowProcedureType,
    })
    this.FlashView(6);
  },

  ChangeShowRoutine: function (event) {
    let index = event.target.dataset.index;

    if (index >= 2)
      return;

    this.data.iShowRoutineType = index;

    //console.log("match.js, ChangeShowProcedure, iShowRoutineType = " + this.data.iShowRoutineType );
    this.setData({
      iShowRoutineType: this.data.iShowRoutineType,
    })
    this.FlashView(7);
  },

  //====================================================================================
  //显示画面
  FlashView: function (iCallFrom = 0) 
  {
    //console.log("match.js, FlashView, iCallFrom = " + iCallFrom);

    this.FlashView_TopHalfRegion();
    this.FlashView_MiddleRegion();
    this.FlashView_ButtomHalfRegion();
  },

  FlashView_TopHalfRegion: function () {
    //console.log("match.js, FlashView_TopHalfRegion, " );

    let iInfoIndex = this.data.iInfoIndex;
    let dBase = dGlobalData.aMatchingDataArray[0].dBase;
    let dFormation = dGlobalData.aMatchingDataArray[0].dFormation;
    let dTactics = dGlobalData.aMatchingDataArray[0].dTactics;
    let strCanvasID = 'matchcanvas';
    

    if (iInfoIndex == 0 )
    {
      if (this.data.iShowHoldBallIndex == 0)
      {
        let iTeamMark = 1;
        let aPointArray = Util.DeepCopy(dFormation.aFormationArray[dFormation.iSelFormIndex]);
        for (let i = 0; i < aPointArray.length; i++) {
          aPointArray[i].iMarkingStatus = 0;
        }
        //console.log("match.js, FlashView_TopHalfRegion, aPointArray = ", aPointArray);
        DrawFormation.DrawFormation_InMatch(aPointArray, strCanvasID, this.data.iInfoIndex, {}, this.data.iMatchMark, iTeamMark, dFormation);
      }
      else if (this.data.iShowHoldBallIndex == 1) 
      {
        //let bNeedShowMarking = false;
        let iTeamMark = 2;
        //let aPointArray = databus.MakePointArray_Opponent(dBase.strOpponentName, bNeedShowMarking);
        //这里需要一个持久的数据(不能是临时的)，后面的功能才做得下去
        let dOpponentFormation = dGlobalData.aMatchingDataArray[1].dFormation;
        let aPointArray = Util.DeepCopy(dOpponentFormation.aFormationArray[dOpponentFormation.iSelFormIndex]); 
        for (let i = 0; i < aPointArray.length; i++) {
          aPointArray[i].iMarkingStatus = 0;
        }
        DrawFormation.DrawFormation_InMatch(aPointArray, strCanvasID, this.data.iInfoIndex, {}, this.data.iMatchMark, iTeamMark, dOpponentFormation);
      }
    }
    else if (iInfoIndex == 1)
    {
      let aFootmanPerform = dGlobalData.aMatchingDataArray[0].aFootmanPerform;

      let iTeamMark = 1;
      let aPointArray = Util.DeepCopy(dFormation.aFormationArray[dFormation.iSelFormIndex]);
      for (let i = 0; i < aPointArray.length; i++) {
        aPointArray[i].iMarkingStatus = 0;
      }
      DrawFormation.DrawFormation_InMatch(aPointArray, strCanvasID, this.data.iInfoIndex, aFootmanPerform, this.data.iMatchMark, iTeamMark, dFormation);
    }
    else if (iInfoIndex == 2)
    {
      let aFootmanPerform = dGlobalData.aMatchingDataArray[0].aFootmanPerform;
      let iTeamMark = 1;
      let aPointArray = Util.DeepCopy(dFormation.aFormationArray[dFormation.iSelFormIndex]);
      for (let i = 0; i < aPointArray.length; i++) {
        aPointArray[i].iMarkingStatus = 0;
      }
      DrawFormation.DrawFormation_InMatch(aPointArray, strCanvasID, this.data.iInfoIndex, aFootmanPerform, this.data.iMatchMark, iTeamMark, dFormation);
    }
    else if (iInfoIndex == 3) 
    {
      //let bNeedShowMarking = true;
      //let aPointArray = databus.MakePointArray_Opponent(dBase.strOpponentName, bNeedShowMarking);
      //这里需要一个持久的数据(不能是临时的)，后面的功能才做得下去
      let dOpponentFormation = dGlobalData.aMatchingDataArray[1].dFormation;
      let aPointArray = Util.DeepCopy(dOpponentFormation.aFormationArray[dOpponentFormation.iSelFormIndex]); 
      for (let i = 0; i < aPointArray.length; i++) {
        aPointArray[i].iMarkingStatus = 0;
      }
      let aFootmanPerform = dGlobalData.aMatchingDataArray[1].aFootmanPerform;
      let iTeamMark = 2;
      DrawFormation.DrawFormation_InMatch(aPointArray, strCanvasID, this.data.iInfoIndex, aFootmanPerform, this.data.iMatchMark, iTeamMark, dOpponentFormation);
    }

    //console.log("match.js, FlashView_TopHalfRegion, iWaitingAdust = " + this.data.iWaitingAdust);
    this.setData({
      iHoldBallIndex: dGlobalData.iHoldBallIndex,
      iShowHoldBallIndex: this.data.iShowHoldBallIndex,
    })
  },

  FlashView_MiddleRegion: function () 
  {
    //console.log("match.js, FlashView_MiddleRegion, " );

    //console.log("match.js, FlashView_MiddleRegion, this.data.aShowMatchingDataArray = ");
    //console.log(this.data.aShowMatchingDataArray);

    this.setData({
      aShowMatchingDataArray: dGlobalData.aMatchingDataArray,
      strMinute: this.data.strMinute,
      strSecond: this.data.strSecond,
    })
  },

  FlashView_ButtomHalfRegion: function () 
  {
    //console.log("match.js, FlashView_ButtonHalfRegion, " );

    //============================================================
    if (this.data.iBigShowType == emBigShowType_Data)  //显示数据
    {
      //console.log("match.js, FlashView_ButtonHalfRegion");
      this.setData({
        iBigShowType: this.data.iBigShowType,
        iShowDataSubType: this.data.iShowDataSubType,
        iShowProcedureType: this.data.iShowProcedureType,
        aFootmanPerform: this.data.aShowMatchingDataArray[0].aFootmanPerform,
        aOpponentFootmanPerform: this.data.aShowMatchingDataArray[1].aFootmanPerform,
        dCurShowCommentary: this.data.dCurShowCommentary,
        strMatchStatusDesc: this.data.strMatchStatusDesc,
        iGoalCounting: this.data.iGoalCounting,
      });
      if (this.data.iShowDataSubType == 0)  //数据里的球队
      {
        let mTeamPerform = this.data.aShowMatchingDataArray[0].mTeamPerform;
        let mOpponentTeamPerform = this.data.aShowMatchingDataArray[1].mTeamPerform;
        mTeamPerform.fControlPercent = mTeamPerform.iControl * 1.0 / (mTeamPerform.iControl + mOpponentTeamPerform.iControl);
        mOpponentTeamPerform.fControlPercent = 1 - mTeamPerform.fControlPercent;
        mTeamPerform.fControlPercent = (mTeamPerform.fControlPercent*100).toFixed(0) + "%";
        mOpponentTeamPerform.fControlPercent = (mOpponentTeamPerform.fControlPercent * 100).toFixed(0) + "%";

        this.setData({
          mTeamPerform: this.data.aShowMatchingDataArray[0].mTeamPerform,
          mOpponentTeamPerform: this.data.aShowMatchingDataArray[1].mTeamPerform,
          strUsedRoutineText: this.data.strUsedRoutineText,
        });

        //console.log("match.js, FlashView_ButtonHalfRegion, dCurShowCommentary = ");
        //console.log(this.data.dCurShowCommentary);
      }
      else if (this.data.iShowDataSubType == 1) //数据里的球员
      {
        let aFootmanPerform = this.data.aShowMatchingDataArray[0].aFootmanPerform;

        this.setData({
          aFootmanPerform: aFootmanPerform,
        });

        //console.log("match.js, FlashView_ButtomHalfRegion, aFootmanPerform = ", this.data.aFootmanPerform);
      }
      else if (this.data.iShowDataSubType == 2) { //数据里的对手
        this.setData({
          aOpponentFootmanPerform: this.data.aShowMatchingDataArray[1].aFootmanPerform,
        });
      }

      //console.log("match.js, FlashView_ButtomHalfRegion, aFootmanPerform = ");
      //console.log(this.data.aFootmanPerform);
      //console.log("match.js, FlashView_ButtomHalfRegion, iBigShowType = " + this.data.iBigShowType + " iShowDataSubType = " + this.data.iShowDataSubType)
    }
    else if (this.data.iBigShowType == emBigShowType_Procedure)  //显示动作成功率
    {
      //console.log("match.js, FlashView_ButtonHalfRegion, iBigShowType == 2");

      let dMatchingData = null;
      if (this.data.iShowProcedureType == emShowProcedureType_Self) //已方
        dMatchingData = dGlobalData.aMatchingDataArray[0];
      else if (this.data.iShowProcedureType == emShowProcedureType_Opponent) //对方
        dMatchingData = dGlobalData.aMatchingDataArray[1];
      else if (this.data.iShowProcedureType == emShowProcedureType_Wait) //备用
        return;
      
      //console.log("match.js, FlashView_ButtonHalfRegion, aProcedureArray = ", dMatchingData.mTeamPerform.aProcedureArray);
      this.data.aShowProcedureArray = this.TransferProcedureArrayToShow(dMatchingData.mTeamPerform.aProcedureArray);
      //console.log("match.js, FlashView_ButtonHalfRegion, aShowProcedureArray = ", this.data.aShowProcedureArray);
      this.setData({
        aShowProcedureArray: this.data.aShowProcedureArray,
      });
    }
    else if (this.data.iBigShowType == emBigShowType_Routine)  //显示套路数据
    {
      let dMatchingData = null;
      if (this.data.iShowRoutineType == emShowRoutineType_Self) //已方
        dMatchingData = dGlobalData.aMatchingDataArray[0];
      else if (this.data.iShowRoutineType == emShowRoutineType_Opponent) //对方
        dMatchingData = dGlobalData.aMatchingDataArray[1];
      else if (this.data.iShowRoutineType == emShowRoutineType_Wait) //备用
        return;

      //console.log("match.js, FlashView_ButtonHalfRegion, aRoutineArray = ", dMatchingData.mTeamPerform.aRoutineArray);
      this.data.aShowRoutineArray = this.TransferRoutineArrayToShow(dMatchingData.mTeamPerform.aRoutineArray);
      //this.data.aShowRoutineArray = Util.DeepCopy(dMatchingData.mTeamPerform.aRoutineArray);
      //console.log("match.js, FlashView_ButtonHalfRegion, aShowRoutineArray = ", this.data.aShowRoutineArray);
      this.setData({
        aShowRoutineArray: this.data.aShowRoutineArray,
      });
    }
    else if (this.data.iBigShowType == emBigShowType_Commentray)  //显示解说
    {
      //console.log("match.js, FlashView_ButtonHalfRegion, aCommentaryArray = ");
      //console.log(dGlobalData.aCommentaryArray);
      this.FlashCommentary();
    }
  },

  TransferProcedureArrayToShow: function (aProcedureArray)
  {
    let aShowArray = Util.DeepCopy(aProcedureArray);
    for (let i = 0; i < aShowArray.length; i++) 
    {
      aShowArray[i].strMostDoName = ""; //做这个做得最多的那个人
      let iMostCount = 0;
      for (let strFootmanName in aShowArray[i].mFootmanData)
      {
        let iThisCount = aShowArray[i].mFootmanData[strFootmanName];
        if (iMostCount < iThisCount)
        {
          iMostCount = iThisCount;
          aShowArray[i].strMostDoName = strFootmanName;
        }
      }
    }
    return aShowArray;
  },

  TransferRoutineArrayToShow: function (aRoutineArray) {
    let aShowArray = [];
    for (let i = 0; i < aRoutineArray.length; i++) {
      if (aRoutineArray[i].iTotalCount == 0)
        continue;

      aShowArray.push(aRoutineArray[i]);
    }
    return aShowArray;
  },
  

  FlashCommentary:function()
  {
    //console.log("match.js, FlashCommentary");

    let aCommentaryArray = dGlobalData.aCommentaryArray;
    this.data.aShowCommentaryArray = [];
    let aShowCommentaryArray = this.data.aShowCommentaryArray;
    let iCount = 0;
    //for (let i = 0; i < aCommentaryArray.length; i++) {
    for (let i = 0; i <= this.data.iCurCommentaryInex; i++) {
      if (aCommentaryArray[i].iType == dEnum.emCommentaryType_Goal && this.data.iShowGoal == 1)
        aShowCommentaryArray.push(aCommentaryArray[i]);
      if (aCommentaryArray[i].iType == dEnum.emCommentaryType_Highlight && this.data.iShowHighlight == 1)
        aShowCommentaryArray.push(aCommentaryArray[i]);
      if (aCommentaryArray[i].iType == dEnum.emCommentaryType_Assist && this.data.iShowAssist == 1)
        aShowCommentaryArray.push(aCommentaryArray[i]);
      if (aCommentaryArray[i].iType == dEnum.emCommentaryType_System && this.data.iShowSystem == 1)
        aShowCommentaryArray.push(aCommentaryArray[i]);
    }

    //let iShowCount = this.CalcuShowCommentaryCount();
    let iShowCount = this.data.aShowCommentaryArray.length;
    this.data.iScrollTop = 20 * iShowCount;    //这里的20对应CommentarySub的height:20px
    //console.log("match.js, FlashView_ButtomHalfRegion, iShowCount = " + iShowCount + ", iScrollTop = " + this.data.iScrollTop);
    this.setData({
      aShowCommentaryArray: this.data.aShowCommentaryArray,
      iScrollTop: this.data.iScrollTop,
      dCurShowCommentary: this.data.dCurShowCommentary,
      iGoalCounting: this.data.iGoalCounting,
      strUsedRoutineText: this.data.strUsedRoutineText,
    })
  },

  FlashView_Part:function()
  {
    if (this.data.iInfoIndex == 0) {
      let strCanvasID = 'matchcanvas';
      if (this.data.iShowHoldBallIndex == 0) {
        let dFormation = dGlobalData.aMatchingDataArray[0].dFormation;
        let aPointArray = Util.DeepCopy(dFormation.aFormationArray[dFormation.iSelFormIndex]);
        for (let i = 0; i < aPointArray.length; i++) {
          aPointArray[i].iMarkingStatus = 0;
        }
        let iTeamMark = 1;
        DrawFormation.DrawFormation_InMatch(aPointArray, strCanvasID, this.data.iInfoIndex, {}, this.data.iMatchMark, iTeamMark, dFormation);
      }
      else if (this.data.iShowHoldBallIndex == 1) {
        let dBase = databus.dBase;
        let bNeedShowMarking = false;
        //let aPointArray = databus.MakePointArray_Opponent(dBase.strOpponentName, bNeedShowMarking);
        let dOpponentFormation = dGlobalData.aMatchingDataArray[1].dFormation;
        let aPointArray = Util.DeepCopy(dOpponentFormation.aFormationArray[dOpponentFormation.iSelFormIndex]);
        for (let i = 0; i < aPointArray.length; i++) {
          aPointArray[i].iMarkingStatus = 0;
        }
        let iTeamMark = 2;
        DrawFormation.DrawFormation_InMatch(aPointArray, strCanvasID, this.data.iInfoIndex, {}, this.data.iMatchMark, iTeamMark, dOpponentFormation);
      }
    }

    //刷新解说
    this.FlashCommentary();
    //刷新时间
    this.setData({
      iHoldBallIndex: dGlobalData.iHoldBallIndex,
      iShowHoldBallIndex: this.data.iShowHoldBallIndex,
      strMinute: this.data.strMinute,
      strSecond: this.data.strSecond,
    })
  },

  //表现数据排序
  SortPerformData: function (event)
  {
    let iSortType = event.target.dataset.type;

    //console.log("match.js, SortPerformData, iSortType = " + iSortType);

    let aFootmanPerform = null;
    if (iSortType <= 10)
      aFootmanPerform = dGlobalData.aMatchingDataArray[0].aFootmanPerform;
    else if (iSortType <= 20)
      aFootmanPerform = dGlobalData.aMatchingDataArray[1].aFootmanPerform;

    let iSub = iSortType % 10;

    //console.log("match.js, SortPerformData, 1 aFootmanPerform = ", Util.DeepCopy(aFootmanPerform));

    if (iSub == 1)
      dGlobalData.SortFootmanPerform(aFootmanPerform, "strName");
    else if (iSub == 2)
      dGlobalData.SortFootmanPerform(aFootmanPerform, "iPassSucceed");
    else if (iSub == 3)
      dGlobalData.SortFootmanPerform(aFootmanPerform, "iAssist");
    else if (iSub == 4)
      dGlobalData.SortFootmanPerform(aFootmanPerform, "iShot");
    else if (iSub == 5)
      dGlobalData.SortFootmanPerform(aFootmanPerform, "iGoal");
    else if (iSub == 6)
      dGlobalData.SortFootmanPerform(aFootmanPerform, "iTackling");
    else if (iSub == 7)
      dGlobalData.SortFootmanPerform(aFootmanPerform, "strPhysicalPower");

    //console.log("match.js, SortPerformData, 2 aFootmanPerform = ", Util.DeepCopy(aFootmanPerform));

    //this.setData({
    //  aFootmanPerform: aFootmanPerform,
    //});

    //this.FlashView_ButtomHalfRegion();
    this.FlashView(8);
  },

  //====================================================================================
  //比赛逻辑

  //执行进攻套路的一个环节
  LaunchOneProcedure: function() 
  {
    //console.log("match.js, LaunchOneProcedure, begin, iCurProcedureIndex = " + this.data.iCurProcedureIndex);
    //console.log("match.js, LaunchOneProcedure, aMatchingDataArray = ");
    //console.log(this.data.aShowMatchingDataArray);

    let bStopWhile = false; //是否打断外面的while循环

    //准备好数据
    let dAttackData = dGlobalData.aMatchingDataArray[dGlobalData.iHoldBallIndex];
    let dDefendData = dGlobalData.aMatchingDataArray[(dGlobalData.iHoldBallIndex + 1) % 2];
    let dBase = dAttackData.dBase;
    let dTactics = dAttackData.dTactics;
    let dFormation = dAttackData.dFormation;
    //let dOpponentFormation = dGlobalData.GetFormationData(dDefendData.strTeamName);
    //let dOpponentTactics = dGlobalData.GetTacticsData(dDefendData.strTeamName);
    let dOpponentBase = dDefendData.dBase;
    let dOpponentTactics = dDefendData.dTactics;
    let dOpponentFormation = dDefendData.dFormation;

    let dEnum = dGlobalData.GetEnum();
    //console.log("match.js, LaunchOneProcedure, dEnum = ");
    //console.log(dEnum);

    //开始进行每个环节
    let strAssisterPassType = "";
    let dConfigRoutine = this.data.dAttackRoutine;
    let aProcedureArray = dConfigRoutine["Procedure"];
    let strRoutineName = dConfigRoutine["Name"];

    if (this.data.iCurProcedureIndex >= aProcedureArray.length)
    {
      console.error("match.js, LaunchOneProcedure, iCurProcedureIndex >= aProcedureArray.length, iCurProcedureIndex = " + this.data.iCurProcedureIndex + ", aProcedureArray.length = " + aProcedureArray.length);
      return bStopWhile;
    }
      
    let dOneProcedure = aProcedureArray[this.data.iCurProcedureIndex];
    let strProcedureType = dOneProcedure["Type"];
    let strPos1 = dOneProcedure["AttackFromRole"];
    let strPos2 = dOneProcedure["AttackToRole"];
    let strPos3 = dOneProcedure["DefendFromRole"];
    let strPos4 = dOneProcedure["DefendToRole"];
    //console.log("Tactics.js, GetRoutineSucceedRate, strPos1 = " + strPos1 + ", strPos2 = " + strPos2 + ", strPos3 = " + strPos3 + ", strPos4 = " + strPos4);
    
    let strFootmanName_1 = Tactics.GetFootmanNameFromPos(dFormation, strPos1);
    //console.log("Tactics.js, test, strPos1 = " + strPos1 + ", strFootmanName_1 = " + strFootmanName_1);
    let strFootmanName_2 = Tactics.GetFootmanNameFromPos(dFormation, strPos2);
    let strFootmanName_3 = Tactics.GetFootmanNameFromPos(dOpponentFormation, strPos3);
    let strFootmanName_4 = Tactics.GetFootmanNameFromPos(dOpponentFormation, strPos4);

    if (strFootmanName_1 == "" )
    {
      console.error("match.js, LaunchOneProcedure, strFootmanName_1 == null, strPos1 = " + strPos1 + ", strProcedureType = " + strProcedureType);
      return bStopWhile;
    }
    if (strFootmanName_2 == "") {
      console.error("match.js, LaunchOneProcedure, strFootmanName_2 == null, strPos2 = " + strPos2 + ", strProcedureType = " + strProcedureType);
      return bStopWhile;
    }
    if (strFootmanName_3 == "") {
      console.error("match.js, LaunchOneProcedure, strFootmanName_3 == null, strPos3 = " + strPos3 + ", strProcedureType = " + strProcedureType);
      return bStopWhile;
    }
    if (strFootmanName_4 == "") {
      console.error("match.js, LaunchOneProcedure, strFootmanName_4 == null, strPos4 = " + strPos4 + ", strProcedureType = " + strProcedureType);
      return bStopWhile;
    }

    let oFootman1 = mCfgFootman[strFootmanName_1];
    let oFootman2 = mCfgFootman[strFootmanName_2];
    let oFootman3 = mCfgFootman[strFootmanName_3];
    let oFootman4 = mCfgFootman[strFootmanName_4];
    
    let dFitData = {}
    dFitData.emFit1 = Tactics.GetPositionFit(dFormation, strPos1);
    dFitData.emFit2 = Tactics.GetPositionFit(dFormation, strPos2);
    dFitData.emFit3 = Tactics.GetPositionFit(dOpponentFormation, strPos3);
    dFitData.emFit4 = Tactics.GetPositionFit(dOpponentFormation, strPos4);

    //console.log("match.js, LaunchAttack, strProcedureType = " + strProcedureType);
    let strProcClass = "";
    //如果是传球，就记录传球的人，有可能成为助攻者
    if (Procedure.IsPassProcedure(strProcedureType) == true)
    {
      this.data.strAssisterName = strFootmanName_1;
      //console.log("match.js, LaunchAttack2 2, strProcedureType = " + strProcedureType + " strAssisterName = " + strAssisterName);
      strAssisterPassType = strProcedureType;
      strProcClass = emProcClass_Pass;
      let strCommentary = Commentary.MakeCommentary_Pass(strFootmanName_1, strFootmanName_2, strProcedureType);
      Commentary.AddCommentary(dGlobalData.aCommentaryArray, dEnum.emCommentaryType_Highlight, strCommentary, this.GetAttackTeamID());
      bStopWhile = true;
      dGlobalData.strHoldBallName = strFootmanName_1;
    }

    //如果是射门，就记录进解说
    if (Procedure.IsShotProcedure(strProcedureType) == true) 
    {
      let strShooterName = strFootmanName_1;
      let strCommentary = Commentary.MakeCommentary_Shot(strShooterName, strProcedureType);
      Commentary.AddCommentary(dGlobalData.aCommentaryArray, dEnum.emCommentaryType_Highlight, strCommentary, this.GetAttackTeamID());
      strProcClass = emProcClass_Shot;
      bStopWhile = true;
      dGlobalData.strHoldBallName = strFootmanName_1;
    }

    //如果是盘带，就记录进解说
    if (Procedure.IsDribbleProcedure(strProcedureType) == true) {
      strProcClass = emProcClass_Dribble;
      dGlobalData.strHoldBallName = strFootmanName_1;
    }
    if (Procedure.IsNoBallProcedure(strProcedureType) == true) {
      strProcClass = emProcClass_RunRestri;
    }

    //添加控球指数
    Perform.AddControl(dGlobalData.aMatchingDataArray, this.GetAttackTeamID(), 1);

    //额外加成减成效果
    let bConsiderMarking = true;
    let oExtRateEffect = Tactics.MakeExtRateEffect(dTactics, dFormation, dOpponentBase, dOpponentTactics, dOpponentFormation, strRoutineName, dAttackData, dDefendData, dFitData, bConsiderMarking);
    let oOutParam = {fDiffRate : 0.0};
    let iResult = Procedure.LaunchProcedure(oOutParam, this.data.iCurProcedureIndex, strProcedureType, oFootman1, oFootman2, oFootman3, oFootman4, oExtRateEffect);
    //console.log("match.js, LaunchOneProcedure, run procedure type = " + strProcedureType + " iCurProcedureIndex = " + this.data.iCurProcedureIndex +" iResult = " + iResult);
    if (iResult == dEnum.emProcResut_Succeed)
    {
      //成功
      if (bTestProcedure)
        console.log("match.js, LaunchOneProcedure, run procedure type = " + strProcedureType + " succeed");

      Perform.AddSucceedProcedure(strProcedureType, dGlobalData.aMatchingDataArray, this.GetAttackTeamID(), strFootmanName_1);

      if (strProcClass == emProcClass_Pass) {
        
      }
      else if (strProcClass == emProcClass_Dribble) 
      {
        let strCommentary = Commentary.MakeCommentary_Dribble(strFootmanName_1, strFootmanName_3, strProcedureType);
        Commentary.AddCommentary(dGlobalData.aCommentaryArray, dEnum.emCommentaryType_Highlight, strCommentary, this.GetAttackTeamID());
        bStopWhile = true;
      }
      else if (strProcClass == emProcClass_RunRestri) {
        let strCommentary = Commentary.MakeCommentary_RunRestri(strFootmanName_1);
        Commentary.AddCommentary(dGlobalData.aCommentaryArray, dEnum.emCommentaryType_Highlight, strCommentary, this.GetAttackTeamID());
        bStopWhile = true;
      }
      else if (strProcClass == emProcClass_Shot) 
      {
        let strShooterName = strFootmanName_1;
        //进球了
        this.LaunchGoal(strShooterName, this.data.strAssisterName, strAssisterPassType);
        bStopWhile = true;

        let bIsSucceed = true;
        this.RoutineEnd(bIsSucceed);
        this.LossBall();
      }

      this.data.iCurProcedureIndex++;
    }
    else if (iResult == dEnum.emProcResut_Fail1     //第一步失败并丢掉球权
      || iResult == dEnum.emProcResut_Fail2)        //第一步失败但没丢掉球权
    {
      //失败
      if (bTestProcedure)
        console.log("match.js, LaunchOneProcedure, LaunchProcedure step 1 fail , strProcedureType = " + strProcedureType);

      Perform.AddFailProcedure(strProcedureType, dGlobalData.aMatchingDataArray, this.GetAttackTeamID(), strFootmanName_1);
      if (strFootmanName_2 != "")  
        dGlobalData.strLostBallName = strFootmanName_2;
      else 
        dGlobalData.strLostBallName = strFootmanName_1;

      if (strProcClass == emProcClass_Pass || strProcClass == emProcClass_Dribble)
      {
        let strCommentary = Commentary.MakeCommentary_Tackling(strFootmanName_1, strFootmanName_3, strProcedureType);
        //console.log("match.js, LaunchOneProcedure, LaunchProcedure step 1 fail , strCommentary = " + strCommentary);
        Commentary.AddCommentary(dGlobalData.aCommentaryArray, dEnum.emCommentaryType_Highlight, strCommentary, this.GetDefendTeamID());
        bStopWhile = true;
      }
      else if (strProcClass == emProcClass_Shot) {
        let strCommentary = Commentary.MakeCommentary_DefendStopShot(strFootmanName_1, strFootmanName_3, strProcedureType);
        //console.log("match.js, LaunchOneProcedure, LaunchProcedure step 1 fail , strCommentary = " + strCommentary);
        Commentary.AddCommentary(dGlobalData.aCommentaryArray, dEnum.emCommentaryType_Highlight, strCommentary, this.GetDefendTeamID());
        bStopWhile = true;
      }
      else if (strProcClass == emProcClass_RunRestri) {
        let strCommentary = Commentary.MakeCommentary_RunRestriFail(strFootmanName_1, strFootmanName_3, strProcedureType);
        Commentary.AddCommentary(dGlobalData.aCommentaryArray, dEnum.emCommentaryType_Highlight, strCommentary, this.GetAttackTeamID());
        bStopWhile = true;
      }

      let bIsSucceed = false;
      this.RoutineEnd(bIsSucceed);

      if (iResult == dEnum.emProcResut_Fail1)
      {
        this.LossBall();
        Perform.AddTackling(dGlobalData.aMatchingDataArray, this.GetDefendTeamID(), strFootmanName_2) 
      }
        
    }
    else if (iResult == dEnum.emProcResut_Fail3     //第二步失败并丢掉球权
      || iResult == dEnum.emProcResut_Fail4)      //第二步失败但没丢掉球权
    {
      //失败
      if (bTestProcedure)
        console.log("match.js, LaunchOneProcedure, LaunchProcedure step 2 fail , strProcedureType = " + strProcedureType);

      Perform.AddFailProcedure(strProcedureType, dGlobalData.aMatchingDataArray, this.GetAttackTeamID(), strFootmanName_1);
      if (strFootmanName_2 != "")
        dGlobalData.strLostBallName = strFootmanName_2;
      else
        dGlobalData.strLostBallName = strFootmanName_1;

      let bShotLostBall = false;  //因为射门而失去球权
      if (strProcClass == emProcClass_Pass) 
      {
        let strCommentary = Commentary.MakeCommentary_Marking(strFootmanName_2, strFootmanName_4, strProcedureType);
        //console.log("match.js, LaunchOneProcedure, LaunchProcedure step 2 fail , strCommentary = " + strCommentary);
        Commentary.AddCommentary(dGlobalData.aCommentaryArray, dEnum.emCommentaryType_Highlight, strCommentary, this.GetDefendTeamID());
        bStopWhile = true;
      }
      else if (strProcClass == emProcClass_Shot) {

        let strCommentary = "";
        //根据射门差值，计算何种射门结果
        if (oOutParam.fDiffRate >= 0.2) { //射不中
          bShotLostBall = true;
          strCommentary = Commentary.MakeCommentary_ShotOutTarget(strFootmanName_2);
        }
        else if (oOutParam.fDiffRate >= 0.1) { //射中被扑住
          bShotLostBall = true;
          strCommentary = Commentary.MakeCommentary_GoalKeeperHoldBall(strFootmanName_2, strFootmanName_4, strProcedureType);
          Perform.AddShotOnTarget(dGlobalData.aMatchingDataArray, this.GetAttackTeamID(), strFootmanName_2);
        }
        else if (oOutParam.fDiffRate >= 0.0) { //射中被挡出
          strCommentary = Commentary.MakeCommentary_GoalKeeperStopShot(strFootmanName_2, strFootmanName_4, strProcedureType);
          Perform.AddShotOnTarget(dGlobalData.aMatchingDataArray, this.GetAttackTeamID(), strFootmanName_2);
        }

        //console.log("match.js, LaunchOneProcedure, LaunchProcedure step 1 fail , strCommentary = " + strCommentary);
        Commentary.AddCommentary(dGlobalData.aCommentaryArray, dEnum.emCommentaryType_Highlight, strCommentary, this.GetDefendTeamID());
        bStopWhile = true;
      }

      let bIsSucceed = false;
      this.RoutineEnd(bIsSucceed);

      if (iResult == dEnum.emProcResut_Fail3 || bShotLostBall == true)
        this.LossBall();
      if (iResult == dEnum.emProcResut_Fail3)
        Perform.AddTackling(dGlobalData.aMatchingDataArray, this.GetAttackTeamID(), strFootmanName_4) 
    }
    else
    {
      console.error("match.js, LaunchOneProcedure, else ");
    }
    
    return bStopWhile;
  },
  
  //进球了
  LaunchGoal: function (strShooterName, strAssisterName, strProcedureType) 
  {
    //console.log("match.js, LaunchGoal, begin, strShooterName = " + strShooterName);
    let dAttackData = dGlobalData.aMatchingDataArray[dGlobalData.iHoldBallIndex];
    //let dDefendData = this.aMatchingDataArray[(dGlobalData.iHoldBallIndex + 1) % 2];
    //let dBase = dAttackData.dBase;
    //let dTactics = dAttackData.dTactics;
    //let dFormation = dAttackData.dFormation;
    //let dOpponentFormation = dGlobalData.GetFormationData(dDefendData.strTeamName);
    //let dOpponentTactics = dGlobalData.GetTacticsData(dDefendData.strTeamName);

    dAttackData.iScore++;

    this.data.iGoalCounting = iDefaultGoldCounting;

    let strCommentary = Commentary.MakeCommentary_Goal(strShooterName, strAssisterName, strProcedureType);
    Commentary.AddCommentary(dGlobalData.aCommentaryArray, dEnum.emCommentaryType_Goal, strCommentary, this.GetAttackTeamID());

    Perform.AddGoal(dGlobalData.aMatchingDataArray, this.GetAttackTeamID(), strShooterName);
    Perform.AddAssist(dGlobalData.aMatchingDataArray, this.GetAttackTeamID(), strAssisterName);
    Perform.AddShotOnTarget(dGlobalData.aMatchingDataArray, this.GetAttackTeamID(), strShooterName);

    //Ai自动调整盯人战术
    let bShowCommentary = true;
    this.AI_UpdateMarking(emUpdateMarking_ByUsed, bShowCommentary);
  },

  //判断谁是进攻方
  GetAttackTeamID: function()
  {
    return dGlobalData.iHoldBallIndex == 0 ? 1 : 2;
  },

  //判断谁是防守方
  GetDefendTeamID: function () {
    return dGlobalData.iHoldBallIndex == 0 ? 2 : 1;
  },


  //丢失球权
  LossBall: function ()
  {
    dGlobalData.iHoldBallIndex = (dGlobalData.iHoldBallIndex + 1) % 2;

    let dAttackData = dGlobalData.aMatchingDataArray[dGlobalData.iHoldBallIndex];
    let strCommentary = Commentary.MakeCommentary_HoldBall(dAttackData.dBase.strTeamName);
    Commentary.AddCommentary(dGlobalData.aCommentaryArray, dEnum.emCommentaryType_Highlight, strCommentary, this.GetAttackTeamID());
  },

  //扣除体力
  ReducePower: function ()
  {
    let dFormation = databus.dFormation;
    let dTactics = databus.dTactics;

    Perform.ReducePower(dGlobalData.aMatchingDataArray, this.GetAttackTeamID());
    Perform.ReducePower(dGlobalData.aMatchingDataArray, this.GetDefendTeamID());
  },


  //=============================================================================================
  //主循环
  MatchBegin: function () {
    //console.log("match.hs, MatchBegin, aMatchingDataArray = ");
    //console.log(this.aMatchingDataArray);
    dGlobalData.iHoldBallIndex = 0;
    this.data.iMatchMark = 1;

    let strCommentary = Commentary.MakeCommentary_GameStart();
    Commentary.AddCommentary(dGlobalData.aCommentaryArray, dEnum.emCommentaryType_System, strCommentary, 0);

    //重置双方的进攻套路
    this.ResetRoutine();

    //设置对方盯防战术
    let bShowCommentary = false;
    this.AI_UpdateMarking(emUpdateMarking_ByRate, bShowCommentary);

    //刷新画面
    this.FlashView(9);

    //console.log("match.js, MatchBegin, setInterval");
    this[__.timer] = setInterval(
      this.MatchLoop.bind(this),
      this.data.iInterval,
    )
    this.SetMatchStatusDesc();
    dGlobalData.bInMatch = true;
    dGlobalData.strHoldBallName = ""; //持球球员的名字
    dGlobalData.strLostBallName = "";
  },

  MatchLoop: function () 
  {
    //----------------------------------------------------------
    //逻辑修改部分

    //console.log("match.js, MatchLoop, this.data.iRoutineStatus = " + this.data.iRoutineStatus);
    //慢速下，解说往后移一个
    if (dGlobalData.aCommentaryArray.length - 1 > this.data.iCurCommentaryInex) 
    {
      if (this.data.dCurShowCommentary.iType == dEnum.emCommentaryType_Goal && this.data.iGoalCounting > 0)
      {
        this.data.iGoalCounting--;
        //console.log("match.js, MatchLoop, iGoalCounting = " + this.data.iGoalCounting);
      }
      else
      {
        this.data.iCurCommentaryInex++;
        this.data.dCurShowCommentary = dGlobalData.aCommentaryArray[this.data.iCurCommentaryInex];
      //console.log("match.js, MatchLoop, dCurShowCommentary = " + this.data.dCurShowCommentary.strText );
      }
    }

    //设置进球的刷新频率
    if (this.data.iGoalCounting > 0 && this.data.iGoalCounting < iDefaultGoldCounting)
    {
      if (this.data.iInterval == iTimeInterval) {
        this.data.iInterval = iTimeGoalInterval;
        if (this[__.timer]) {
          clearInterval(this[__.timer])
          this[__.timer] = setInterval(this.MatchLoop.bind(this), this.data.iInterval)
        }
      }
    }
    else if (this.data.iGoalCounting == 0)
    {
      if (this.data.iInterval == iTimeGoalInterval) {
        this.data.iInterval = iTimeInterval;
        if (this[__.timer]) {
          clearInterval(this[__.timer])
          this[__.timer] = setInterval(this.MatchLoop.bind(this), this.data.iInterval)
        }
      }
    }
    
    //解说播报结束后，处理比赛逻辑
    if (dGlobalData.aCommentaryArray.length - 1 == this.data.iCurCommentaryInex)
    {
      if (this.data.iRoutineStatus == 1) {
        this.data.iShowHoldBallIndex = dGlobalData.iHoldBallIndex;

        let bHasCommentary = this.LaunchOneProcedure();
        let iWhileLoopCount = 0;
        while (bHasCommentary == false) {
          if (this.data.iRoutineStatus == 0 || this.data.iRoutineStatus == 2)
            break;
          bHasCommentary = this.LaunchOneProcedure();
          iWhileLoopCount++;
          if (iWhileLoopCount > 20)
            break;
        }
      }
    }

    //时间前进
    this.TimeIncrease();
    
    //检查时间导致的状况改变
    this.CheckTimeOver();
    
    //----------------------------------------------------------
    //界面刷新部分 (必须在逻辑处理后执行)
    if (this.data.iInterval == iTimeFastInterval)
    {
      //快时钟下只刷新时间
      this.FlashView_MiddleRegion();
    }
    else
    {
      //慢时钟下所有数据都有可能需要刷新

      //刷新界面
      if (dGlobalData.aCommentaryArray.length - 1 == this.data.iCurCommentaryInex) {
        //解说已到最后一条时，全部刷新
        this.FlashView(10);
      }
      else {
        //解说未到最后一条时，部分刷新，主要是刷新解说
        this.FlashView_Part();
      }
    }

    //----------------------------------------------------------
    //时钟处理部分 (必须在界面刷新后执行)

    //比赛状态中快时钟和慢时钟的相互切换
    if (this.data.iMatchStatus == emMatchStatus_FirstHalf || this.data.iMatchStatus == emMatchStatus_SecondHalf) {
      //慢转快
      if (dGlobalData.aCommentaryArray.length - 1 == this.data.iCurCommentaryInex && (this.data.iRoutineStatus == 0 || this.data.iRoutineStatus == 2)) {
        //只有播报结束，并且状态0或2，才能快进
        if (this.data.iInterval == iTimeInterval) {
          //console.log("match.js, MatchLoop, set fast interval");
          this.data.iInterval = iTimeFastInterval;
          if (this[__.timer]) {
            clearInterval(this[__.timer])
            this[__.timer] = setInterval(this.MatchLoop.bind(this), this.data.iInterval)
          }
        }
      }
      //快转慢
      if (dGlobalData.aCommentaryArray.length - 1 > this.data.iCurCommentaryInex || this.data.iRoutineStatus == 1) {
        //只有播报未结束，并且状态1，设置慢进
        if (this.data.iInterval == iTimeFastInterval) {
          this.data.iInterval = iTimeInterval;
          //console.log("match.js, MatchLoop, set normal interval");
          if (this[__.timer]) {
            clearInterval(this[__.timer])
            this[__.timer] = setInterval(this.MatchLoop.bind(this), this.data.iInterval)
          }
        }
      }
    }

    //中场休息和比赛结束状态中，清除时钟
    if (this.data.iMatchStatus == emMatchStatus_MiddleRest || this.data.iMatchStatus == emMatchStatus_End) {
      //console.log("match.js, MatchLoop, aCommentaryArray.length - 1 = " + (dGlobalData.aCommentaryArray.length - 1));
      //console.log("match.js, MatchLoop, iCurCommentaryInex = " + this.data.iCurCommentaryInex);
      //console.log("match.js, MatchLoop, iRoutineStatus = " + this.data.iRoutineStatus);
      if (dGlobalData.aCommentaryArray.length - 1 == this.data.iCurCommentaryInex && (this.data.iRoutineStatus == 0 || this.data.iRoutineStatus == 2)) {
        if (this[__.timer]) {
          clearInterval(this[__.timer])
          //console.log("match.js, MatchLoop, clearInterval, dCurShowCommentary = ", this.data.dCurShowCommentary);
          //this.FlashView_Part();
        }
      }
    }

    //----------------------------------------------------------
    //操作部分
    if (this.data.iInterval == iTimeFastInterval)
    {
      let bNeedChange = this.CheckGoToTactics();
      if (bNeedChange == true) {
        this.HandleChangeTactics();
        return;
      }
    }
  },

  //根据体力剩余，提醒换人
  CheckPowerSubstitute: function () 
  {
    Substitute.AI_PowerSubstitute(dGlobalData.aMatchingDataArray);
    //console.log("match.js, CheckPowerSubstitute, ");
    //重新计算时间
    this.data.iLeftSecondsSubstituteRemind = iSubstituteRemindInterval;

    //let dBase = databus.dBase;
    let dFormation = databus.dFormation;
    //let dTactics = databus.dTactics;
    let aPointArray = dFormation.aFormationArray[dFormation.iSelFormIndex];

    let dMatchingData = dGlobalData.aMatchingDataArray[0];
    let aFootmanPerform = dMatchingData.aFootmanPerform;

    let iSubstituteCount = dEnum.iMaxReplacedCount - dMatchingData.aFootmanReplacedArray.length;
    if (iSubstituteCount <= 0)
      return;
    
    //根据体力剩余，提醒换人
    Assistant.CheckPowerSubstitute(dGlobalData.aCommentaryArray, aPointArray, aFootmanPerform, iSubstituteCount);
  },
  


  HandleChangeTactics: function ()
  {
    if (this.data.iMatchStatus == emMatchStatus_NotStart) { }
    else if (this.data.iMatchStatus == emMatchStatus_FirstHalf) {
      this.data.iMatchStatus = emMatchStatus_FirstHalf_Stop;
      this.MatchStop();
    }
    else if (this.data.iMatchStatus == emMatchStatus_FirstHalf_Stop) { }
    else if (this.data.iMatchStatus == emMatchStatus_MiddleRest) { }
    else if (this.data.iMatchStatus == emMatchStatus_SecondHalf) {
      this.data.iMatchStatus = emMatchStatus_SecondHalf_Stop;
      this.MatchStop();
    }
    else if (this.data.iMatchStatus == emMatchStatus_SecondHalf_Stop) { }
    else if (this.data.iMatchStatus == emMatchStatus_End) { }
    this.GoToTactics();
  },

  //重置攻防双方的使用的战术
  ResetRoutine: function () {
    
    //console.log("match.js, ResetRoutine");
    let dAttackData = dGlobalData.aMatchingDataArray[dGlobalData.iHoldBallIndex];
    let dDefendData = dGlobalData.aMatchingDataArray[(dGlobalData.iHoldBallIndex + 1) % 2];
    let dBase = dAttackData.dBase;
    let dTactics = dAttackData.dTactics;
    let dFormation = dAttackData.dFormation;
    let dOpponentBase = dDefendData.dBase;
    let dOpponentTactics = dDefendData.dTactics;
    let dOpponentFormation = dDefendData.dFormation;

    //攻方
    dAttackData.aAttackRoutineArray = [];
    if (iTestFast == 0)
    {
      for (let strRoutineName in dTactics.mRoutineCountMap) {
        let iCount = dTactics.mRoutineCountMap[strRoutineName];
        if (iCount > 0) {
          for (let i = 0; i < iCount; i++) {
            dAttackData.aAttackRoutineArray.push(strRoutineName);
          }
        }
      }

      //如果实际可用进攻点，比数组aAttackRoutineArray要小(AI会出现这种情况)，就根据实际可用点数来做随机
      let iValidCount = mCfgTactics.MentalPoint[dTactics.iMentalIndex].Attack;
      //console.log("match.js, ResetRoutine, dAttackData Array.length = " + dAttackData.aAttackRoutineArray.length + " iValidCount = " + iValidCount);
      while (dAttackData.aAttackRoutineArray.length > iValidCount) {
        let iDelIndex = Math.floor(Math.random() * dAttackData.aAttackRoutineArray.length);
        dAttackData.aAttackRoutineArray.splice(iDelIndex, 1);
      }

      //console.log("match.js, ResetRoutine, dAttackData.aAttackRoutineArray = ", dAttackData.aAttackRoutineArray);
    }
    
    //防方
    dDefendData.aAttackRoutineArray = [];
    if (iTestFast == 0)
    {
      for (let strRoutineName in dOpponentTactics.mRoutineCountMap) {
        let iCount = dOpponentTactics.mRoutineCountMap[strRoutineName];
        if (iCount > 0) {
          for (let i = 0; i < iCount; i++) {
            dDefendData.aAttackRoutineArray.push(strRoutineName);
          }
        }
      }

      //如果实际可用进攻点，比数组aAttackRoutineArray要小(AI会出现这种情况)，就根据实际可用点数来做随机
      let iValidCount = mCfgTactics.MentalPoint[dOpponentTactics.iMentalIndex].Attack;
      //console.log("match.js, ResetRoutine, dDefendData Array.length = " + dDefendData.aAttackRoutineArray.length + " iValidCount = " + iValidCount);
      
      while (dDefendData.aAttackRoutineArray.length > iValidCount) {
        //console.log("match.js, ResetRoutine, dDefendData.aAttackRoutineArray = ", dDefendData.aAttackRoutineArray);
        let iDelIndex = Math.floor(Math.random() * dDefendData.aAttackRoutineArray.length);
        dDefendData.aAttackRoutineArray.splice(iDelIndex, 1);
      }

      //console.log("match.js, ResetRoutine, dDefendData.aAttackRoutineArray = ", dDefendData.aAttackRoutineArray);
    }
    

    //防方重置盯人设置
    //改在 AI_UpdateMarking 里面做
    //AI.ClearMarking(dOpponentBase, dOpponentFormation, dOpponentTactics);
    //AI.SetMarking(dOpponentBase, dOpponentFormation, dOpponentTactics, dBase, dFormation, dTactics);

    this.data.iRoutineStatus = 0;
    let iSeconds = Math.floor(Math.random() * iRoutineRandomSplit);
    this.data.iLeftSecondsStartRoutine = iSeconds;

    this.data.strAssisterName = "";
  },

  RoutineStart: function () {

    //console.log("match.js, RoutineStart, aMatchingDataArray[0] = ");
    //console.log(dGlobalData.aMatchingDataArray);

    //准备好数据
    let dAttackData = dGlobalData.aMatchingDataArray[dGlobalData.iHoldBallIndex];
    let dDefendData = dGlobalData.aMatchingDataArray[(dGlobalData.iHoldBallIndex + 1) % 2];
    let dBase = dAttackData.dBase;
    let dTactics = dAttackData.dTactics;
    let dFormation = dAttackData.dFormation;
    let dOpponentTactics = dDefendData.dTactics;
    let dOpponentFormation = dDefendData.dFormation;

    //console.log("match.js, RoutineStart, dAttackData.aAttackRoutineArray = ");
    //console.log(dAttackData.aAttackRoutineArray);

    //选择一个进攻套路
    if (dAttackData.aAttackRoutineArray.length == 0) {
      if (dDefendData.aAttackRoutineArray.length == 0) {
        this.data.iRoutineStatus = 2;
        this.LaunchMiddleSnatch();
        return;
      }
      else {
        this.LossBall();
        return;
      }
    }

    dGlobalData.strHoldBallName = "";
    dGlobalData.strLostBallName = "";

    //console.log("match.js, RoutineStart, aAttackRoutineArray = ");
    //console.log(dAttackData.aAttackRoutineArray);

    //随机获得一个要使用的进攻套路
    let iRandValue = Math.floor(Math.random() * dAttackData.aAttackRoutineArray.length);
    //console.log("match.js, LaunchAttack, iRandValue = " + iRandValue);
    let strRoutineName = dAttackData.aAttackRoutineArray[iRandValue];
    let dConfigRoutine = mCfgAttackRoutine[strRoutineName];

    //console.log(dBase);
    console.log("match.js, RoutineStart, strTeamName = " + dBase.strTeamName + ", strRoutineName = " + strRoutineName);

    let strCommentary = Commentary.MakeCommentary_LauchAttack(dBase.strTeamName);
    Commentary.AddCommentary(dGlobalData.aCommentaryArray, dEnum.emCommentaryType_Highlight, strCommentary, this.GetAttackTeamID());

    //判断有效性
    if (mCfgAttackRoutine[strRoutineName] == null) {
      console.error("match.js, LaunchAttack, dConfigRoutine == null, strRoutineName = " + strRoutineName);
      return;
    }
    if (Tactics.IsAttackRoutineValid(dConfigRoutine, dTactics, dFormation) == false) {
      console.error("match.js, LaunchAttack, IsAttackRoutineValid == false, strRoutineName = " + strRoutineName);
      //return;   //为避免游戏卡住，这里报个错就好了，不要return
    }

    this.data.dAttackRoutine = dConfigRoutine;
    //console.log("match.js, RoutineStart, dAttackRoutine = ");
    //console.log(this.data.dAttackRoutine);

    //从数组中删除这个元素
    let iDelIndex = dAttackData.aAttackRoutineArray.indexOf(strRoutineName);
    dAttackData.aAttackRoutineArray.splice(iDelIndex, 1);
    //console.log("match.js, RoutineStart, TeamName = " + dAttackData.strTeamName + ", aAttackRoutineArray = ");
    //console.log(dAttackData.aAttackRoutineArray);

    this.data.iCurProcedureIndex = 0;

    this.data.iRoutineStatus = 1;

    this.SetMatchStatusDesc();
    
    //战术反馈
    //console.log("match.js, RoutineStart, strTeamName = ", dAttackData.dBase.strTeamName);
    this.data.strUsedRoutineText = Commentary.MakeUsedRoutineText(dAttackData.dBase.strTeamName, strRoutineName);

    return;
  },

  LaunchMiddleSnatch: function() {
    Perform.AddControl(dGlobalData.aMatchingDataArray, this.GetAttackTeamID(), 5);
    Perform.AddControl(dGlobalData.aMatchingDataArray, this.GetDefendTeamID(), 5);
    
    let strCommentary = Commentary.MakeCommentary_MiddleSnatch();
    Commentary.AddCommentary(dGlobalData.aCommentaryArray, dEnum.emCommentaryType_Highlight, strCommentary, this.GetAttackTeamID());
  },

  RoutineEnd: function (bIsSucceed) {

    //计算套路完成度
    let iValue1 = this.data.iCurProcedureIndex + 1;
    let iValue2 = this.data.dAttackRoutine["Procedure"].length;
    let fProgramValue = iValue1 / iValue2;
    
    //----------------------------------------------------------------
    //套路结束逻辑处理
    this.data.iRoutineStatus = 0;
    this.data.iCurProcedureIndex = 0;

    let dAttackData = dGlobalData.aMatchingDataArray[dGlobalData.iHoldBallIndex];
    let dDefendData = dGlobalData.aMatchingDataArray[(dGlobalData.iHoldBallIndex + 1) % 2];

    if (dAttackData.aAttackRoutineArray.length != 0 || dDefendData.aAttackRoutineArray.length != 0) {
      let iSeconds = Math.floor(Math.random() * iRoutineRandomSplit);
      this.data.iLeftSecondsStartRoutine = iSeconds;
    }

    //dGlobalData.strHoldBallName = "";

    let strRoutineName = this.data.dAttackRoutine.Name;
    Perform.RoutineFinish(dAttackData, strRoutineName, bIsSucceed, fProgramValue)

    return;
  },

  MatchStop: function () {
    if (this.data.iMatchStatus == emMatchStatus_FirstHalf) {
      this.data.iMatchStatus = emMatchStatus_FirstHalf_Stop;
    }
    else if (this.data.iMatchStatus == emMatchStatus_SecondHalf) {
      this.data.iMatchStatus = emMatchStatus_SecondHalf_Stop;
    }


    //console.log("match.hs, MatchStop, ");
    if (this[__.timer])
      clearInterval(this[__.timer]) 

    this.SetMatchStatusDesc();
  },
  MatchContinue: function () {
    //console.log("match.hs, MatchContinue, ");
    console.log("match.hs, MatchContinue, iHoldBallIndex = " + dGlobalData.iHoldBallIndex);
    //console.log("match.js, MatchContinue, setInterval");
    this[__.timer] = setInterval(
      this.MatchLoop.bind(this),
      this.data.iInterval,
    )
    this.SetMatchStatusDesc();
  },
  MatchFirstHalfEnd: function () {
    console.log("match.js, MatchFirstHalfEnd");
    let strCommentary = Commentary.MakeCommentary_FirstHalfEnd(
      dGlobalData.aMatchingDataArray[0].iScore,
      dGlobalData.aMatchingDataArray[0].strTeamName,
      dGlobalData.aMatchingDataArray[1].iScore,
      dGlobalData.aMatchingDataArray[1].strTeamName);
    this.AddCommentary(dGlobalData.aCommentaryArray, dEnum.emCommentaryType_System, strCommentary, 0);
    
    this.FlashView(11);

    this.SetMatchStatusDesc();
  },

  MatchSecondHalfStart: function () {
    console.log("match.js, MatchSecondHalfStart");
    this.data.iMatchMark = 2;
    let strCommentary = Commentary.MakeCommentary_SecondHalfStart();
    Commentary.AddCommentary(dGlobalData.aCommentaryArray, dEnum.emCommentaryType_System, strCommentary, 0);

    this.FlashView(12);

    //console.log("match.js, MatchSecondHalfStart, setInterval");
    this[__.timer] = setInterval(
      this.MatchLoop.bind(this),
      this.data.iInterval,
    )

    this.SetMatchStatusDesc();
  },

  MatchOver: function () {
    //console.log("match.js, MatchOver");
    let strCommentary = Commentary.MakeCommentary_GameEnd(
        dGlobalData.aMatchingDataArray[0].iScore, 
        dGlobalData.aMatchingDataArray[0].strTeamName, 
        dGlobalData.aMatchingDataArray[1].iScore, 
        dGlobalData.aMatchingDataArray[1].strTeamName);

    this.AddCommentary(dGlobalData.aCommentaryArray, dEnum.emCommentaryType_System, strCommentary, 0);

    this.data.iMatchStatus = emMatchStatus_End;
    this.data.iMatchMark = 3;
    this.FlashView(13);
    
    //databus.RecoverData();
    //console.log("match.js, MatchOver, aShowCommentaryArray = ");
    //console.log(this.data.aShowCommentaryArray);
    //console.log("match.js, MatchOver, aCommentaryArray = ");
    //console.log(dGlobalData.aCommentaryArray);

    this.SetMatchStatusDesc();
  },

  MatchFinish: function () {
    console.log("match.js, MatchFinish");
   
    dGlobalData.MatchFinish();
    //dGlobalData.bInMatch = false;
    //databus.RecoverData();
    //dGlobalData.bInitMatchData = false;

    //var url = '../mainboard/mainboard';
    //wx.navigateTo({ url })
    wx.navigateBack();
  },

  SetMatchStatusDesc: function () 
  {
    if (this.data.iMatchStatus == emMatchStatus_NotStart) {
      this.data.strMatchStatusDesc = "开始";
    }
    else if (this.data.iMatchStatus == emMatchStatus_FirstHalf) {
      this.data.strMatchStatusDesc = "暂停";
    }
    else if (this.data.iMatchStatus == emMatchStatus_FirstHalf_Stop) {
      this.data.strMatchStatusDesc = "继续";
    }
    else if (this.data.iMatchStatus == emMatchStatus_MiddleRest) {
      this.data.strMatchStatusDesc = "开始";
    }
    else if (this.data.iMatchStatus == emMatchStatus_SecondHalf) {
      this.data.strMatchStatusDesc = "暂停";
    }
    else if (this.data.iMatchStatus == emMatchStatus_SecondHalf_Stop) {
      this.data.strMatchStatusDesc = "继续";
    }
    else if (this.data.iMatchStatus == emMatchStatus_End) {
      this.data.strMatchStatusDesc = "结束";
    }

    this.setData({
      strMatchStatusDesc: this.data.strMatchStatusDesc
    })

    //console.log("match.js, SetMatchStatusDesc, strMatchStatusDesc = " + this.data.strMatchStatusDesc);
  },

  AddCommentary: function (aCommentaryArray, emCommentaryType, strCommentary, emTeamID) {
    //console.log("match.js, AddCommentary");
    if (this.data.iInterval != iTimeInterval) {
      this.data.iInterval = iTimeInterval;
      if (this[__.timer]) {
        clearInterval(this[__.timer])
        this[__.timer] = setInterval(this.MatchLoop.bind(this), this.data.iInterval)
      }
    }

    Commentary.AddCommentary(dGlobalData.aCommentaryArray, dEnum.emCommentaryType_System, strCommentary, 0);
  },

  //=============================================================================================
  //比赛时间
  TimeIncrease: function () 
  {
    //console.log("match.js, TimeIncrease, ");
    let iAddSecond = 0;
    if (this.data.iInterval == iTimeFastInterval)
    {
      let iCrossSeconds = 10;
      iAddSecond = iCrossSeconds - dGlobalData.iSecond % iCrossSeconds;
      if (iAddSecond == 0)
        iAddSecond = iCrossSeconds;
    }
    else 
    {
      iAddSecond = 1;
    }

    dGlobalData.iSecond += iAddSecond;
    if (this.data.iLeftSecondsStartRoutine > 0)
     {
      this.data.iLeftSecondsStartRoutine -= iAddSecond;
      if (this.data.iLeftSecondsStartRoutine < 0)
        this.data.iLeftSecondsStartRoutine = 0;
    }
    if (this.data.iLeftSecondsUpdateMarking > 0) {
      this.data.iLeftSecondsUpdateMarking -= iAddSecond;
      if (this.data.iLeftSecondsUpdateMarking < 0)
        this.data.iLeftSecondsUpdateMarking = 0;
    }
    if (this.data.iLeftSecondsSubstituteRemind > 0) {
      this.data.iLeftSecondsSubstituteRemind -= iAddSecond;
      if (this.data.iLeftSecondsSubstituteRemind < 0)
        this.data.iLeftSecondsSubstituteRemind = 0;
    }
    
    if (dGlobalData.iSecond >= 60) {
      dGlobalData.iMinute++;
      dGlobalData.iSecond = dGlobalData.iSecond - 60;
    }
   
    //dGlobalData.iMinute = dGlobalData.iMinute + 10;   //测试模式
    this.FixStrTime();

    //console.log("match.js, TimeIncrease, time = " + this.data.strMinute + ":" + this.data.strSecond);
  },

  FixStrTime: function () 
  {
    if (dGlobalData.iSecond < 10)
      this.data.strSecond = "0" + dGlobalData.iSecond.toString();
    else
      this.data.strSecond = dGlobalData.iSecond.toString();

    if (dGlobalData.iMinute < 10)
      this.data.strMinute = "0" + dGlobalData.iMinute.toString();
    else
      this.data.strMinute = dGlobalData.iMinute.toString();
  },

  //检查比赛过程中关键时间点并触发事件
  CheckTimeOver: function ()
  {
    //console.log("match.js, CheckTimeOver, iMinute = " + dGlobalData.iMinute + ", iRoutineStatus + " + dGlobalData.iRoutineStatus);

    //console.log("match.js, CheckTimeOver, iMinute = " + dGlobalData.iMinute + ", iNextResetRoutineMinute + " + dGlobalData.iNextResetRoutineMinute);

    if (this.data.iMatchStatus == emMatchStatus_End)
    {
      //避免比赛结束后还会添加解说
      return; 
    }

    if (this.data.iLeftSecondsStartRoutine == 0)
    {
      if (this.data.iRoutineStatus == 0)
      {
        //重置使用的战术套路
        this.RoutineStart();
      }
    }
    if (this.data.iLeftSecondsUpdateMarking == 0) 
    {
      //更新盯人设置
      let bShowCommentary = true;
      this.AI_UpdateMarking(emUpdateMarking_ByUsed, bShowCommentary);
    }
    if (this.data.iLeftSecondsSubstituteRemind == 0) {
      //检查球员体力，提示换人
      this.CheckPowerSubstitute();
    }
    
    if (dGlobalData.iMinute >= this.data.iNextResetRoutineMinute) 
    {
      this.data.iNextResetRoutineMinute = dGlobalData.iMinute + iResetRoutineMinute;
      this.ResetRoutine();
    }

    if (dGlobalData.iMinute >= this.data.iNextPowerMinute) {
      this.data.iNextPowerMinute = dGlobalData.iMinute + 1;
      this.ReducePower();
    }

    if (dGlobalData.iMinute >= 45 && 
      this.data.iMatchStatus == emMatchStatus_FirstHalf && 
      (this.data.iRoutineStatus == 0 || this.data.iRoutineStatus == 2))
    {
      //console.log("match.js, CheckTimeOver, 1");
      dGlobalData.iMinute = 45;
      dGlobalData.iSecond = 0;
      this.FixStrTime();
      this.data.iMatchStatus = emMatchStatus_MiddleRest;
      this.MatchFirstHalfEnd();
      this.SetMatchStatusDesc();
    }

    
    if (dGlobalData.iMinute >= 90 && 
      this.data.iMatchStatus == emMatchStatus_SecondHalf && 
      (this.data.iRoutineStatus == 0 || this.data.iRoutineStatus == 2))
    {
      //console.log("match.js, CheckTimeOver, 2");
      this.MatchOver();
    }
    
    /*
    if (dGlobalData.iMinute >= 5 &&
      this.data.iMatchStatus == emMatchStatus_FirstHalf &&
      (this.data.iRoutineStatus == 0 || this.data.iRoutineStatus == 2)) {
      //console.log("match.js, CheckTimeOver, 2");
      this.MatchOver();
    }
    */
  },

  //==================================================================================
  //调整战术部分
  AdjustTactics: function () {
    //console.log("function AdjustTactics, iWaitingAdust = " + this.data.iWaitingAdust);

    //未开始和休息状态可以直接修改战术
    if (this.data.iMatchStatus == emMatchStatus_NotStart ||
      this.data.iMatchStatus == emMatchStatus_MiddleRest ||
      this.data.iMatchStatus == emMatchStatus_End)
    {
      this.GoToTactics();
      return;
    }
    //暂停并且快进状态可以直接修改战术
    if ((this.data.iMatchStatus == emMatchStatus_FirstHalf_Stop || this.data.iMatchStatus == emMatchStatus_SecondHalf_Stop) &&
      this.data.iInterval == iTimeFastInterval     
      )
    {
      this.GoToTactics();
      return;
    }

    //比赛开始中并且慢进，就要等待一下才能修改战术
    if (this.data.iWaitingAdust == 1) //已经按了战术按钮就直接退出
      return;

    //设置标志位，修改字体
    this.setData({
      iWaitingAdust: 1,
      strAdustButtonShow: TipsAdustButtonShow2,
    })
  },

  CheckGoToTactics: function () {
    //console.log("CheckGoToTactics");
    if (this.data.iWaitingAdust == 1) {
      this.setData({
        iWaitingAdust: 0,
        strAdustButtonShow: TipsAdustButtonShow1,
      })

      return true;
    }
    else
      return false;
  },

  GoToTactics: function () 
  {
    databus.MatchingBackupData();
    var url = '../formation/formation';
    wx.navigateTo({ url })

    dGlobalData.bHasChangeTactics = true;
  },

  //ai盯人部分
  AI_UpdateMarking: function (iType, bShowCommentary) 
  {  
    //console.log("match.js, AI_UpdateMarking");
    //重新计算时间
    this.data.iLeftSecondsUpdateMarking = iUpdateMarkingInterval;

    //获取数据
    let dPlayerData = dGlobalData.aMatchingDataArray[0];
    let dAIData = dGlobalData.aMatchingDataArray[1];

    let dPlayerBase = dPlayerData.dBase;
    let dPlayerTactics = dPlayerData.dTactics;
    let dPlayerFormation = dPlayerData.dFormation;
    let dAIBase = dAIData.dBase;
    let dAITactics = dAIData.dTactics;
    let dAIFormation = dAIData.dFormation;

    //防方重置盯人设置
    AI.ClearMarking(dAIBase, dAIFormation, dAITactics);
    let bConsiderMarking = true;
    if (iType == emUpdateMarking_ByRate)
    {
      //只考虑成功率，不考虑盯人
      AI.SetMarkingBySucceedRate(dAIBase, dAIFormation, dAITactics, dPlayerBase, dPlayerFormation, dPlayerTactics);
      bConsiderMarking = false;
    }
    else if (iType == emUpdateMarking_ByUsed)
    {
      // /考虑盯人后的成功率
      AI.SetMarking(dAIBase, dAIFormation, dAITactics, dPlayerBase, dPlayerFormation, dPlayerTactics);
      bConsiderMarking = true;
    }

    //AI根据最新的胜率调整进攻套路
    AI.SelectRoutine(dAIBase, dAIFormation, dAITactics, dPlayerBase, dPlayerFormation, dPlayerTactics, bConsiderMarking);

    if (bShowCommentary == true)
    {
      let strCommentary = Commentary.MakeCommentary_ChangeTacticsNotify(dAIBase.strTeamName);
      Commentary.AddCommentary(dGlobalData.aCommentaryArray, dEnum.emCommentaryType_System, strCommentary, 0);
    }
  },
})

//================================================================================



