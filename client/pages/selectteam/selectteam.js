// pages/selectteam/selectteam.js

var mCfgClub = require('../../data/DataClub')

import DataBus from '../databus'
import GlobalData from '../GlobalData'

let dGlobalData = new GlobalData();
let databus = new DataBus();

Page({

  /**
   * 页面的初始数据
   */
  data: 
  {
    aSelectArray:[],  //可供选择的队伍  
    strSelfTeamName:"", //自己队伍名字
    iSelectTeamType:0, //主界面的功能，1：选择队伍；2：选择对手
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) 
  {
    for (let strTeamName in mCfgClub)
    {
      let dClub = 
      {
          strTeamName: strTeamName,
          strChinese: mCfgClub[strTeamName].Chinese,
      }

      this.data.aSelectArray.push(dClub);
    }

    //console.log("selectteam.js, aSelectArray = ");
    //console.log(this.data.aSelectArray);

    this.FlashView();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let dBase = databus.dBase;
    this.data.strSelfTeamName = dBase.strTeamName;
    this.data.iSelectTeamType = dGlobalData.iSelectTeamType;

    //console.log("selectteam.js, strSelfTeamName = " + this.data.strSelfTeamName + ", iSelectTeamType = " + this.data.iSelectTeamType);
    this.FlashView();
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

  //===========================================================
  FlashView()
  {
    this.setData({
      aSelectArray: this.data.aSelectArray,
      strSelfTeamName: this.data.strSelfTeamName, 
      iSelectTeamType: this.data.iSelectTeamType,
    })
  },

  ClickClub: function (event) 
  {
    let iIndex = event.target.dataset.index;
    //console.log("selectteam.js, ClickClub, iIndex = " + iIndex);
    //console.log("selectteam.js, ClickClub, iIndex = " + iIndex + " dGlobalData.iSelectTeamType = " + dGlobalData.iSelectTeamType);
    if (iIndex == null) //当点在两个选项之间时，会是null值
      return;

    let dClub = this.data.aSelectArray[iIndex];
    if (dGlobalData.iSelectTeamType == 1)
    {
      SelectSelfTeam(dClub.strTeamName);
    }
    else if (dGlobalData.iSelectTeamType == 2) 
    {
      dGlobalData.SelectOpponent(dClub.strTeamName);
    }
    else if (dGlobalData.iSelectTeamType == 3) {
      dGlobalData.strViewTeamName = dClub.strTeamName;
    }

    wx.navigateBack();
  },
})

function SelectSelfTeam(strTeamName) 
{
  //console.log("selectteam.js, SelectSelfTeam, strTeamName = " + strTeamName);
  databus.Reset(strTeamName);
  databus.SaveData();
  dGlobalData.ResetBase();
  dGlobalData.strViewTeamName = strTeamName;
}

