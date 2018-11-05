import DataBus from '../databus'
import GlobalData from '../GlobalData'

var Tactics = require('../Tactics')
var Util = require('../../utils/util.js')

let databus = new DataBus();
let dGlobalData = new GlobalData();

var mCfgClub = require('../../data/DataClub')


Page({

  /**
   * 页面的初始数据
   */
  data: {

    strSelfTips: "",    //自己队伍信息提示
    strOpponentTips: "", //对手信息提示
    strMatchTips:"",  //比赛提示
    iInMatch: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) 
  {
    this.GameInit();


  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () 
  {
    //console.log("mainboard.js, onShow");
    //console.log("mainboard.js, onShow, strTeamName = " + databus.dBase.strTeamName + " strOpponentTips = " + databus.dBase.strOpponentName);
    if (databus.dBase.strTeamName == "")
      this.data.strSelfTips = "选择主队";
    else 
    {
      this.data.strSelfTips = "主队：" + mCfgClub[databus.dBase.strTeamName].Chinese;
    }

    if (databus.dBase.strOpponentName == "")
      this.data.strOpponentTips = "选择对手";
    else
    {
      this.data.strOpponentTips = "对手：" + mCfgClub[databus.dBase.strOpponentName].Chinese;
    }

    this.data.iInMatch = dGlobalData.bInMatch;
    if (dGlobalData.bInMatch == false)
      this.data.strMatchTips = "开始比赛";
    else
      this.data.strMatchTips = "回到比赛";

    this.setData({
      strSelfTips: this.data.strSelfTips,
      strOpponentTips: this.data.strOpponentTips,
      iInMatch: this.data.iInMatch,
      strMatchTips: this.data.strMatchTips,
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },

  //====================================================================================

  GameInit: function(e) 
  {
    databus.LoadData();
    let dBase = databus.dBase;
    if (dBase.strOpponentName != "")
      dGlobalData.SelectOpponent(dBase.strOpponentName);

    dGlobalData.strViewTeamName = dBase.strTeamName;  //正在查看哪队数据
    //this.SelectOpponent("RealMadrid");
  },

  //========================================================================
  /*
  SelectOpponent: function(strOpponentName) 
  {
    //console.log("mainboard.js, SelectOpponent, strOpponentName = " + strOpponentName);
    let dBase = databus.dBase;

    dBase.strOpponentName = strOpponentName;

    let dTactics = databus.dTactics;
    if(dTactics.mOpponentDefendMap[strOpponentName] == null) 
    {
      dTactics.mOpponentDefendMap[strOpponentName] = databus.InitDefendData();
    }

    dOpponentBase = dGlobalData.GetBaseData(strOpponentName);
    dOpponentBase.strOpponentName = dBase.strTeamName;

    console.log("mainboard.js, SelectOpponent, dOpponentBase = ", dOpponentBase);
  },
  */
  
  GotoSelectTeam: function (event) {

    let selecttype = event.target.dataset.selecttype;
    dGlobalData.iSelectTeamType = selecttype;
    if (dGlobalData.iSelectTeamType == 2)
    {
      let dBase = databus.dBase;
      if (dBase.strTeamName == "") {
        Util.ShowTips("请先选择主队");
        return;
      }
    }
    if (dGlobalData.bInMatch == true) {
      Util.ShowTips("请先完成比赛");
      return;
    }
    //console.log("GotoSelectTeam, selecttype = " + selecttype)

    var url = '../selectteam/selectteam';
    //console.log("GotoSelectTeam, url = " + url)
    wx.navigateTo({
      url
    })
  },

  GotoTeam: function (e) {

    let dBase = databus.dBase;
    if (dBase.strTeamName == "") {
      Util.ShowTips("请先选择队伍");
      return;
    }
    
    var url = '../team/team';
    //console.log("GotoTeam, url = " + url)
    wx.navigateTo({
      url
    })
  },

  GotoFormation: function (e) 
  {
    let dBase = databus.dBase;
    if (dBase.strOpponentName == "")
    {
      Util.ShowTips("请先选择对手");
      return;
    }
    if (dGlobalData.bInMatch == true) {
      Util.ShowTips("比赛过程中请在比赛界面设置战术");
      return;
    }
    
    var url = '../formation/formation';
    //console.log("function GotoFormation, url = " + url)
    wx.navigateTo({
      url
    })
  },

  GotoMatch: function (e) {

    let dBase = databus.dBase;
    if (dBase.strOpponentName == "") {
      Util.ShowTips("请先选择对手");
      return;
    }

    let dTactics = databus.dTactics;
    if (dTactics.iLeftAttackPoint > 0) {
      Util.ShowTips("请完成战术的进攻设置");
      return;
    }
    if (dTactics.iLeftDefendPoint > 0) {
      Util.ShowTips("请完成战术的防守设置");
      return;
    }
    
    var url = '../match/match';
    //console.log("function GotoMatch, url = " + url)
    wx.navigateTo({
      url
    })
  },

  AbandonMatch: function (e) {

    dGlobalData.MatchFinish();
    this.onShow();
  },



})