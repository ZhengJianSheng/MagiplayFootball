const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}


// 显示繁忙提示
var showBusy = text => wx.showToast({
    title: text,
    icon: 'loading',
    duration: 10000
})

// 显示成功提示
var showSuccess = text => wx.showToast({
    title: text,
    icon: 'success'
})

// 显示失败提示
var showModel = (title, content) => {
    wx.hideToast();

    wx.showModal({
        title,
        content: JSON.stringify(content),
        showCancel: false
    })
}

function DeepCopy(source)
{
  var sourceCopy = source instanceof Array ? [] : {};
  for (var item in source) {
    sourceCopy[item] = typeof source[item] === 'object' ? DeepCopy(source[item]) : source[item];
  }
  return sourceCopy;
}

function ShowTips(strText) 
{
  wx.showModal({
    title: '',
    content: strText,
    showCancel: false,
    success: function (res) {
      if (res.confirm) {
        //console.log('用户点击确定')
      } else {
        //console.log('用户点击取消')
      }
    }
  })
}

//iUppper: 1: 降序; 2: 升序
function SortArray(aDataArray, strSortProp, strDataType = "str", iUppper = 1)
{
  //console.log("util.js, SortArray, strSortProp = " + strSortProp + " strDataType = " + strDataType + " iUppper = " + iUppper);

  for (let i = 0; i < aDataArray.length; i++) {
    for (let j = i + 1; j < aDataArray.length; j++) {
      let data1 = aDataArray[i][strSortProp];
      let data2 = aDataArray[j][strSortProp];
      if (strDataType == "float") {
        data1 = parseFloat(data1);
        data2 = parseFloat(data2);
      }
      else if (strDataType == "int") {
        data1 = parseInt(data1);
        data2 = parseInt(data2);
      }
      else if(strDataType == "str") {
      }

      if (iUppper == 1) //降序
      {
        if (data2 > data1) {
          let dTemp = aDataArray[i];
          aDataArray[i] = aDataArray[j];
          aDataArray[j] = dTemp;
        }
      }
      else if (iUppper == 2)  //升序
      {
        if (data2 < data1) {
          let dTemp = aDataArray[i];
          aDataArray[i] = aDataArray[j];
          aDataArray[j] = dTemp;
        }
      }
    } 
  }
}

module.exports = { formatTime, showBusy, showSuccess, showModel, 
  DeepCopy,
  ShowTips, 
  SortArray 
  }
