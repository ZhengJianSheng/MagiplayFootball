// pages/team/team.js

import DataBus from '../databus'
import GlobalData from '../GlobalData'

var mCfgFootman = require('../../data/DataFootman')
var mCfgPosRelated = require('../../data/DataPosRelated')
var mCfgClub = require('../../data/DataClub')
var Util = require('../../utils/util.js')

let databus = new DataBus()
let dGlobalData = new GlobalData();

let aAttributeTemplate = 
[
    "Corner", "Cross", "Dribbling", "Shot", "Catch", "FreeKick", "Head",
    "LongShot", "OutLine", "Marking", "Pass", "Penalty", "Tackling", "Technique",
    "Aggression", "Anticipation", "Brave", "Composure", "Concentration", "Vision", "Decision",
    "Will", "Talent", "Influence", "Movement", "Positioning", "Teamwork", "WorkRate",
    "Acceleration", "Agility", "Balance", "Jump", "Constitution", "Speed", "Endurance",
    "Strong", "StopAir", "CommandDefend", "StopCross", "Handling", "OneOnOnes", "Reflexes",
    "RushingOut",
];

Page({
  /**
   * 页面的初始数据
   */
  data: {
    iWindowWidth: 0,
    iWindowHeight: 0,
    iInfoIndex: -1,   //选择的位置索引
    iFootmanIndex: -1,  //选择的球员索引
    strPositionA: "AMR",
    strPositionB: "AMC",
    strPositionC: "SC",

    test1: 1,
    mRelated:{},    //位置关联的属性
    mAttribute:{},  //属性值
    mFontColor:{},  //字体颜色
    aCellArray: [],
    //acolor: "#FF0000",
    iIsGKPos : 0, //是不是门将位置
    strTeamNameChn:"",
  },



  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) 
  {
    //------------------------------------------------------
    let that = this;
    wx.getSystemInfo({
      success: function (res) {
        let clientWidth = res.windowWidth;
        let clientHeight = res.windowHeight;
        //let rpxR = 640 / clientWidth;    //比例
        //let  calc = clientHeight * rpxR;
        //console.log(clientHeight)
        //console.log(clientWidth)
        that.setData({
          iWindowWidth: 100,
          iWindowHeight: 200,
        });
      }
    });
    //------------------------------------------------------

    //this.InitData();
    this.PickTeamFootman();
    
    //this.FlashView(); //ClickFootman_里会执行
  },
  
  InitData: function () 
  {
    //let mRelated = this.data.mRelated;
    //mRelated["Technique"] = 1;

    //console.log("team.js,InitData,mRelated = ");
    //console.log(this.data.mRelated);

    let dTeam = databus.dTeam;
    let dCell = this.data;

    for (var i = 0, len = dTeam.aFootmanArray.length; i < len; i++) {
      dCell.aCellArray[i] = {}
      dCell.aCellArray[i].ID = dTeam.aFootmanArray[i].ID;
      let strName = dTeam.aFootmanArray[i].Name;
      dCell.aCellArray[i].Name = strName;
      dCell.aCellArray[i].LikeNumber = dTeam.aFootmanArray[i].LikeNumber;
      dCell.aCellArray[i].iPrice = mCfgFootman[strName]["Price"];
      dCell.aCellArray[i].iAbility = mCfgFootman[strName]["Ability"];
      dCell.aCellArray[i].strPositionA = mCfgFootman[strName]["PositionA"];
      dCell.aCellArray[i].iSelStatus = 0;
    }
  },
  //========================================================================
  FlashView: function () 
  {
    this.FlashView_TopHalfRegion();
    this.FlashView_ButtomHalfRegion();
  },

  FlashView_TopHalfRegion:function()
  {
    //console.log("team.js, FlashView_TopHalfRegion, iIsGKPos = " + this.data.iIsGKPos);
    this.setData({
      iInfoIndex: this.data.iInfoIndex,
      strPositionA: this.data.strPositionA,
      strPositionB: this.data.strPositionB,
      strPositionC: this.data.strPositionC,
      mRelated: this.data.mRelated,
      mAttribute: this.data.mAttribute,
      mFontColor: this.data.mFontColor,
      iIsGKPos: this.data.iIsGKPos,
      strTeamNameChn: this.data.strTeamNameChn,
    })
  },

  FlashView_ButtomHalfRegion: function () 
  {
    this.setData({
      aCellArray: this.data.aCellArray,
    })
  },
  
  //========================================================================
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.PickTeamFootman();
    let that = this;
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {},
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {},
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

  //========================================================================

  ChangeInfoBtn: function (event)
  {
    //console.log("team.js, ChangeInfoBtn, index = " + event.target.dataset.index);
    let iIndex = event.target.dataset.index;

    if (this.data.iInfoIndex != iIndex) {
      this.data.iInfoIndex = iIndex;
      this.FillRelated(iIndex);
    }
    else {
      this.data.iInfoIndex = -1;
      this.data.mRelated = [];
    }

    this.FlashView();
  },

  ClickFootman: function (event)
  {
    let iIndex = event.target.dataset.index;
    this.ClickFootman_(iIndex);
  },

  ClickFootman_: function (iIndex) 
  {
    this.data.iFootmanIndex = iIndex;
    let aCellArray = this.data.aCellArray;
    //console.log("team.js, ClickFootman, iIndex = " + iIndex);
    if (iIndex >= aCellArray.length) {
      return;
    }

    let dCellData = aCellArray[iIndex];
    if (dCellData.iSelStatus == 0) {
      dCellData.iSelStatus = 1;

      for (let i = 0; i < aCellArray.length; i++) {
        if (i != iIndex) {
          aCellArray[i].iSelStatus = 0;
        }
      }
    }
    else {
      dCellData.iSelStatus = 0;
    }

    let strFootmanName = dCellData.Name;
    let oFootman = mCfgFootman[strFootmanName];
    this.data.strPositionA = oFootman['PositionA'];
    this.data.strPositionB = oFootman['PositionB'];
    this.data.strPositionC = oFootman['PositionC'];

    if (dCellData.iSelStatus == 1)
    {
      this.data.iInfoIndex = 0;
      this.FillRelated(this.data.iInfoIndex);
      this.FillAttribute(this.data.iFootmanIndex);
      this.FillFontColor(this.data.iFootmanIndex);
    }
    else if (dCellData.iSelStatus == 0) {
      this.data.iInfoIndex = -1;
      this.data.mRelated = [];
      this.data.mFontColor = [];
    }

    if (this.data.strPositionA == "GK" || this.data.strPositionB == "GK" || this.data.strPositionC == "GK")
    {
      this.data.iIsGKPos = 1;
    }
    else
    {
      this.data.iIsGKPos = 0;
    }

    this.FlashView();
  },

  //========================================================================

  FillRelated: function(iIndex)
  {
    let strPos = "";
    if (iIndex == 0)
      strPos = this.data.strPositionA;
    else if (iIndex == 1)
      strPos = this.data.strPositionB;
    else if (iIndex == 2)
      strPos = this.data.strPositionC;

    if (mCfgPosRelated[strPos] == null)
    {
      console.error("team.js, FillRelated, mCfgPosRelated[strPos] == null, strPos = " + strPos);
      return;
    }
    
    this.data.mRelated = {};
    let mRelated = this.data.mRelated;

    let aCfgArray = mCfgPosRelated[strPos];
    for (let i = 0; i < aCfgArray.length; i++)
    {
      mRelated[aCfgArray[i]] = 1;
    }

    //console.log("team.js, FillRelated, mRelated = ");
    //console.log(this.data.mRelated);
  },

  FillAttribute: function (iIndex) {

    let aCellArray = this.data.aCellArray;
    if (iIndex >= aCellArray.length) {
      return;
    }
    let dCellData = aCellArray[iIndex];

    let strFootmanName = dCellData.Name;
    if (mCfgFootman[strFootmanName] == null) {
      console.error("team.js, FillAttribute, mCfgFootman[strFootmanName] == null, strFootmanName = " + strFootmanName);
      return;
    }

    this.data.mAttribute = {};
    //console.log(aAttributeTemplate);
    //console.log(aAttributeTemplate[0]);
    //console.log(mCfgFootman[strFootmanName][aAttributeTemplate[0]]);
    for (let i = 0; i < aAttributeTemplate.length; i++) 
    {
      this.data.mAttribute[aAttributeTemplate[i]] = mCfgFootman[strFootmanName][aAttributeTemplate[i]];
    }

    //console.log("team.js, FillAttribute, mAttribute = ");
    //console.log(this.data.mAttribute);
  },

  FillFontColor: function (iIndex) {

    let aCellArray = this.data.aCellArray;
    if (iIndex >= aCellArray.length) {
      return;
    }
    let dCellData = aCellArray[iIndex];

    let strFootmanName = dCellData.Name;
    if (mCfgFootman[strFootmanName] == null) {
      console.error("team.js, FillAttribute, mCfgFootman[strFootmanName] == null, strFootmanName = " + strFootmanName);
      return;
    }

    this.data.mFontColor = {};

    for (let i = 0; i < aAttributeTemplate.length; i++) 
    {
      let iValue = mCfgFootman[strFootmanName][aAttributeTemplate[i]];
      let strColor = "";
      if (iValue > 15)
        strColor = "#000000";
      else if (iValue > 10)
        strColor = "#696969";
      else if (iValue > 5)
        strColor = "#808080";
      else
        strColor = "#A9A9A9";

      this.data.mFontColor[aAttributeTemplate[i]] = strColor;
    }

    //console.log("team.js, FillAttribute, mAttribute = ");
    //console.log(this.data.mAttribute);
  },

  GotoSelectTeam: function (event) {

    let selecttype = event.target.dataset.selecttype;
    dGlobalData.iSelectTeamType = selecttype;

    //console.log("GotoSelectTeam, selecttype = " + selecttype)

    var url = '../selectteam/selectteam';
    //console.log("GotoSelectTeam, url = " + url)
    wx.navigateTo({
      url
    })
  },

  PickTeamFootman: function () {
    //console.log("team.js, PickTeamFootman, ");
    let dCell = this.data;
    dCell.aCellArray = [];
    let strViewTeamName = dGlobalData.strViewTeamName;
    this.data.strTeamNameChn = mCfgClub[strViewTeamName].Chinese;;
    //console.log("team.js, PickTeamFootman, strViewTeamName = " + strViewTeamName);
    let i = 0;
    for (var strName in mCfgFootman) 
    {
      //console.log("mCfgFootman[strName] = " + JSON.stringify(mCfgFootman[i]));
      //console.log("team.js, PickTeamFootman, strName = " + strName);
      if (mCfgFootman[strName]["TeamName"] == strViewTeamName) 
      {
        //console.log("team.js, PickTeamFootman, strName = " + strName);
        let dFootman = mCfgFootman[strName];

        dCell.aCellArray[i] = {}
        dCell.aCellArray[i].ID = dFootman.ID;
        dCell.aCellArray[i].Name = strName;
        dCell.aCellArray[i].LikeNumber = dFootman.LikeNumber;
        dCell.aCellArray[i].iPrice = dFootman["Price"];
        dCell.aCellArray[i].iAbility = dFootman["Ability"];
        dCell.aCellArray[i].strPositionA = dFootman["PositionA"];
        dCell.aCellArray[i].iSelStatus = 0;
        i++;
        //console.log("team.js, PickTeamFootman, i = " + i);
      }
    }
    this.FlashView();
    let iFootmanIndex = 0;
    this.ClickFootman_(iFootmanIndex);
  },

  //=======================================================================================
  //表现数据排序
  SortFootmanData: function (event) {
    let iSortType = event.target.dataset.type;

    console.log("team.js, SortFootmanData, iSortType = " + iSortType);

    let strSortKey = "";
    if (iSortType == 1)
      strSortKey = "Name";
    else if (iSortType == 2)
      strSortKey = "strPositionA";
    else if (iSortType == 3)
      strSortKey = "iPrice";
    else if (iSortType == 4)
      strSortKey = "iAbility";
    else if (iSortType == 5)
      strSortKey = "LikeNumber";

    //console.log("team.js, SortCellData, aCellArray = ", Util.DeepCopy(this.data.aCellArray));
    //console.log("team.js, SortCellData, strSortKey = " + strSortKey);
    this.SortFootmanData_Sub(this.data.aCellArray, strSortKey);
    //console.log("team.js, SortCellData, aCellArray = ", Util.DeepCopy(this.data.aCellArray));
    this.FlashView();
  },

  SortFootmanData_Sub: function (aCellArray, strSortKey) {
    let strDataType = "";
    let iUppper = 1;  //1:降序；2：升序
    if (strSortKey == "Name") {
      strDataType = "str";
      iUppper = 2;
    }
    else if (strSortKey == "strPositionA") {
      strDataType = "str";
      iUppper = 2;
    }
    else if (strSortKey == "iPrice") {
      strDataType = "int";
      iUppper = 1;
    }
    else if (strSortKey == "iAbility") {
      strDataType = "int";
      iUppper = 1;
    }
    else if (strSortKey == "LikeNumber") {
      strDataType = "int";
      iUppper = 2;
    }
    console.log("team.js, SortFootmanData_Sub, strSortKey = " + strSortKey + " strDataType = " + strDataType + " iUppper = " + iUppper);
    Util.SortArray(aCellArray, strSortKey, strDataType, iUppper)
  },

})