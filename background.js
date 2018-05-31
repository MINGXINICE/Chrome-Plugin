
// chrome事件注册
chrome.tabs.onSelectionChanged.addListener(function(tabId, selectInfo) {
  Restore()
  localStorage.clear();
});
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  Restore()
  localStorage.clear();
});

// jquery-mask控制时间输入格式
$(document).ready(function () {$('.time').mask('00:00:00');});

// 文件上传初始化
hljs.initHighlightingOnLoad();

// 全局变量
var tabUrl = {};
var domain = "http://ohea9dxab.bkt.clouddn.com/";
var dataReg  = /\d{8}/;
var playCountReg  = /^['']|[0-9]\d*$/;
var strLength = /^\w{200,200}$/;
var CNdata = {}; // 国内数据对象
var FGdata = {}; // 境外数据对象
var apiState = 0; // 请求成功个数
var apiError  = 0; // 请求失败个数
var CNFG = 0; // 0:境内    1：境外
var upData = { // 提交对象
  videoResource : {title: "", sourceUrl: "", imageUrl: "", brief: "", publishTime: 19700101, author: "", tags: "", playCount: 0, videoDuration: "", kws: "", mark: "", userId: ""}
}
var errorText = '';
var nodataText = '';
var tip = '';

// 加载
function Loading(tabUrl) {
  console.log('发送url:', tabUrl, JSON.stringify(tabUrl));
  Restore(); //加载前恢复状态
  CNload(tabUrl); //调用国内API
  FGload(tabUrl); //调用境外API
}

//测试 重新加载
function Reload() {
  $("#reload").on('click',function () {
    errorText = '';
    nodataText = '';
    Loading(tabUrl);
  })
}

// 国内API
function CNload(tabUrl){
  console.log("inCNload")
  $.ajax({  //视频url解析API
    type : 'POST',
    url : 'http://op2.dewmobile.net:8080/app/rest/v2/services/videomachine_PluginInService/pageInfo',
    data : JSON.stringify(tabUrl),
    contentType: 'application/json',
    success : function (data) {
      console.log("CNdata:",data) //服务端返回的解析结果
      nodataText += '<div>CN-data:'+data+'</div><hr>';
      CNdata = data;
      if(CNdata != undefined && CNdata['sourceUrl'] != undefined){
        apiState++;
        CNFG = 0;
      }
    },
    error : function (msg) {
      apiError++;
      console.error("国内失败："+msg);
    },
    complete : function (data) {
      errorText += '<div>CN-status:'+data.status+'</div><hr>'+
                    '<div>CN-errorText:'+data.statusText+'</div><hr>'
      if(apiState == 1){
        $("#errorblock").html('')
        console.log("渲染国内")
        Fordata(CNdata)
        SuccessState()
      }else if(apiState == 0){
        console.log("国内无数据")
        tip = '<div id="error"><div>ERROR LOG：</div>'+nodataText+errorText+'<div id="reload" style="color: #fff">Reload</div></div>';
        $("#errorblock").html(tip)
        Reload();
        failedState();
      }
      if(apiError == 2){
        tip = '<div id="error"><div>ERROR LOG:</div>'+nodataText+errorText+'<div id="reload" style="color: #fff">Reload</div></div>';
        $("#errorblock").html(tip)
        Reload();
        alert("Your browser doesn't support this service.");
      }
    }
  })
}

// 线上：op2.dewmobile.net
// 海外API
function FGload(tabUrl) {
  console.log("inFGload")
  $.ajax({  //视频url解析API
    type : 'POST',
    url : 'http://47.88.61.140:8080/app/rest/v2/services/videomachine_PluginInService/pageInfo',
    data : JSON.stringify(tabUrl),
    contentType: 'application/json',
    success : function (data) {
      console.log("FNdata:",data) //服务端返回的解析结果
      nodataText += '<div>FN-data:'+data+'</div><hr>';
      FGdata = data;
      if(FGdata != undefined && FGdata['sourceUrl'] != undefined){
        apiState++;
        CNFG = 1;
      }
    },
    error : function (msg) {
      apiError++;
      console.error("海外失败："+msg);
      console.error(msg);
    },
    complete : function (data) {
      errorText += '<div>FN-status:'+data.status+'</div><hr>'+
                    '<div>FN-errorText:'+data.statusText+'</div><hr>'
      if(apiState == 1){
        console.log("渲染海外")
        $("#errorblock").html('')
        Fordata(FGdata)
        SuccessState();
      }else if(apiState == 0){
        console.log("海外无数据")
        tip = '<div id="error"><div>ERROR LOG:</div>'+nodataText+errorText+'<div id="reload" style="color: #fff">Reload</div></div>';
        $("#errorblock").html(tip)
        Reload();
        failedState();
      }
      if(apiError == 2){
        alert("Your browser doesn't support this service.");
        tip = '<div id="error"><div>ERROR LOG:</div>'+nodataText+errorText+'<div id="reload" style="color: #fff">Reload</div></div>';
        $("#errorblock").html(tip)
        Reload();
      }
    }
  })
}

// 加载赋值
function Fordata(data) {
  console.log("inFordata")
  //imageUrl
  $("#thumbLink").attr('value',data.imageUrl);
  //userId
  if(localStorage.getItem("userId")){
    $("#userId").val(localStorage.getItem("userId"));
  }else{
    $("#userId").attr('value',data.userId);
  }
  //title
  if(localStorage.getItem("title")){
    $("#title").val(localStorage.getItem("title"));
  }else{
    $("#title").attr('value',data.title);
  }
  //sourceUrl
  $("#sourceUrl").attr('value',data.sourceUrl);
  //brief
  if(localStorage.getItem("brief")){
      $("#brief").val(localStorage.getItem("brief"));
  }else{
    if(!strLength.test(data.brief)){
      $("#brief").val(data.brief.substr(0,200))
    }else {
      $("#brief").val(data.brief);
    }
  }
  // publishTime
  // console.log(todaystr)
  if(data.publishTime==0){
    $("#publishTime").attr('value',todaystr);
  }else {
    $("#publishTime").attr('value',data.publishTime);
  }
  //author
  // if(localStorage.getItem("author")){
  //   $("#author").val(localStorage.getItem("author"));
  // }else{
  //   $("#author").attr('value',data.author);
  // }
  //tag
  if(localStorage.getItem("tag")){
    $("#tag").val(localStorage.getItem("tag"));
  }else{
    $("#tag").attr('value',data.tag);
  }
  //playCount
  if(localStorage.getItem("playCount")){
    $("#playCount").val(localStorage.getItem("playCount"));
  }else{
    if(data.playCount=='' || data.playCount==undefined){
      $("#playCount").attr('value',0);
    }else {
      $("#playCount").attr('value',data.playCount);
    }
  }
  playCountReg.test(data.playCount) ? $("#playCount").attr('value',data.playCount) : $("#playCount").attr('value','');
  //videoDuration
  if(localStorage.getItem("videoDuration")){
    $("#videoDuration").val(localStorage.getItem("videoDuration"));
  }else{
    $("#videoDuration").attr('value',data.videoDuration);
  }
  //kws
  if(localStorage.getItem("kws")){
    $("#kws").val(localStorage.getItem("kws"));
  }else{
    $("#kws").attr('value',data.kws);
  }
}

// Uid自动补全
$.post("http://101.251.230.81:9491/recommend/getRobotUids", function (data) {
  var availableTags = data;
  var input = document.getElementById("userId");
  var uidList = [];
  for( var i = 0; i < availableTags.length; i++){
    var current = availableTags[i];
    var list   = {};
    list.label = current;
    list.value = current.substring(0, current.indexOf("("));
    uidList.push(list);
  }
  new Awesomplete(input, {
    minChars : 1,
    list : uidList
  });
});

//日期插件
var date = new Date();
var month = date.getMonth()+1;
var day = date.getDate();
month = (month.toString())[1] ? month : '0'+month;
day = (day.toString())[1] ? day : '0'+day;
var todaystr = date.getFullYear()+''+month+''+day;
$("#publishTime").attr("value",todaystr);
var mySchedule = new Schedule({
  el: '#schedule-box',
  clickCb: function (y,m,d) {
    var fm = (m.toString())[1] ? m : '0'+m;
    var fd = (d.toString())[1] ? d : '0'+d;
    var dateStr = y +''+ fm +''+ fd;
    $("#publishTime").prop("value",dateStr);
    $("#datewrap").fadeOut();
  },
  nextMonthCb: function (y,m,d) {},
  nextYeayCb: function (y,m,d) {},
  prevMonthCb: function (y,m,d) {},
  prevYearCb: function (y,m,d) {}
});
$("#datebtn").on("click",function () {
  $("#datewrap").fadeIn()
})

// 恢复状态
function Restore() {
  chrome.browserAction.setBadgeText({text:""});
  CNdata = {}; // 国内数据对象
  FGdata = {}; // 境外数据对象
  apiState = 0; // 请求成功个数
  apiError  = 0; // 请求失败个数
  CNFG = 0; // 0:境内    1：境外
};

// 加载成功
function SuccessState() {
  $("#pop").fadeOut();
  chrome.browserAction.setBadgeText({text:"√"});
  chrome.browserAction.setBadgeBackgroundColor({color:"green"});
};

// 加载失败
function failedState() {
  $("#pop").fadeOut();
  chrome.browserAction.setBadgeText({text:"×"});
  chrome.browserAction.setBadgeBackgroundColor({color:"red"});
};

// 点击图标，获取url
chrome.tabs.getSelected(function(tab) {
  tabUrl = {url:tab.url};
  Loading(tabUrl);
});

// 提交表单
$('#send').on('click', function () {
  upData.videoResource.title         = $("#title").val().trim();
  upData.videoResource.sourceUrl     = $("#sourceUrl").val();
  upData.videoResource.imageUrl      = $("#thumbLink").val();
  upData.videoResource.brief         = $("#brief").val().trim();
  upData.videoResource.publishTime   = $("#publishTime").val().trim();
  // upData.videoResource.author        = $("#author").val().trim();
  upData.videoResource.tags          = $("#tag").val().trim();
  upData.videoResource.playCount     = $("#playCount").val().trim();
  upData.videoResource.kws           = $("#kws").val().trim().replace(/，/ig,',');
  upData.videoResource.videoDuration = $("#videoDuration").val().trim().replace(/：/ig,':');
  upData.videoResource.mark          = $("input[name='mark']:checked").val();
  upData.videoResource.userId        = $("#userId").val();

  if(upData.videoResource.title==''){
    alert('Please fill the title！')
    return false;
  }
  if(upData.videoResource.sourceUrl==''){
    alert('Please fill the sourceUrl！')
    return false;
  }
  if(upData.videoResource.imageUrl==''){
    alert('Please fill the imageUrl！')
    return false;
  }
  if(upData.videoResource.publishTime==''){
    alert('Please fill the publishTime！')
    return false;
  }else if(!dataReg.test(upData.videoResource.publishTime)){
    alert("Format error, please fill as the format at '20170101'")
    return false;
  }
  // if(upData.videoResource.tags==''){
  //   alert('Please fill the tags!')
  //   return false;
  // }
  if(upData.videoResource.playCount==''){
    upData.videoResource.playCount = 0;
  }else if(!playCountReg.test(upData.videoResource.playCount)){
    alert('Format error,the playCount must be positive zero or integer!')
    return false;
  }
  if(upData.videoResource.userId==''){
    alert('Please fill the userId!')
    return false;
  }

  console.log('提交内容：',upData) //查看提交内容
  $.ajax({  // 提交API
    type : 'POST',
    url : 'http://op2.dewmobile.net:8080/app/rest/v2/services/videomachine_PluginInService/savePageInfo',
    data : JSON.stringify(upData),
    contentType: 'application/json',
    success : function (data) {
      $('#op-send').addClass('op-success');
      console.log(data)
    },
    error : function (msg) {
      $('#op-send').addClass('op-failed');
      console.error(msg);
    }
  })
})

// 上传缩略图
var uploader = Qiniu.uploader({
  runtimes: 'html5,flash,html4',
  browse_button: 'pickfiles',
  drop_element: 'container',
  max_file_size: '2000mb',
  flash_swf_url: 'bower_components/plupload/js/Moxie.swf',
  dragdrop: true,
  chunk_size: '4mb',
  multi_selection: !(moxie.core.utils.Env.OS.toLowerCase()==="ios"),
  uptoken : "rQ7At7jVvB9Y5MUc9YfG7C8pEkCJH6ZWgHuEVZNH:WXwVoSlXstFr8BXHSydSYH6t9ys=:eyJzY29wZSI6InZpZGVvIiwiZGVhZGxpbmUiOjE1NDIyNjc5MjZ9",
  domain:domain ,
  get_new_uptoken: false,
  auto_start: true,
  log_level: 5,
  init: {
    'BeforeChunkUpload':function (up,file) {
    },
    'FilesAdded': function(up, files) {// 文件添加进队列后,处理相关的事情
      $('#progress').show();
      $('table').show();
      $('#success').hide();
      plupload.each(files, function(file) {
        var progress = new FileProgress(file, 'fsUploadProgress');
        progress.setStatus("等待...");
        progress.bindUploadCancel(up);
      })
    },
    'BeforeUpload': function(up, file) { // 每个文件上传前,处理相关的事情
    },
    'UploadProgress': function(up, file) { // 每个文件上传时,处理相关的事情
      var progress   = new FileProgress(file, 'fsUploadProgress');
      var chunk_size = plupload.parseSize(this.getOption('chunk_size'));
      progress.setProgress(file.percent + "%", file.speed, chunk_size);
    },
    'UploadComplete': function(up, file) {  // 队列文件处理完毕后,处理相关的事情
    },
    'FileUploaded': function(up, file, info) { // 每个文件上传成功后,处理相关的事情
      var sourceLink = JSON.parse(info.response).key;
      console.log(sourceLink)
      $("#thumbimg").attr("src","http://video.kuaiya.cn/"+sourceLink); //显示在预览中的图片路径
      var progress  = new FileProgress(file, 'fsUploadProgress');
      progress.setComplete(up, info);
      $('#progress').hide();
      $('#op-up').addClass("op-success");
    },
    'Error': function(up, err, errTip) {
      console.log(err)
      $('#op-up').addClass("op-failed");
    },
    'Key': function(up, file) { // 若想在前端对每个文件的key进行个性化处理，可以配置该函数
      var key = 'img/'+ hex_md5(file.name)+"."+file.type.substr(file.type.indexOf("/")+1,file.type.length); // 该配置必须要在 unique_names: false , save_key: false 时才生效
      $('#thumbLink').attr("value",'http://video.kuaiya.cn/'+key); //传输给后台的七牛路径
      console.log(key)
      return key;
    }
  }
});

// 获取标签
bindTagEvent("tag-add-btn","tagTree2","tag");

// 本地存储
$("#userId").blur(function () {
  localStorage.setItem("userId",$("#userId").val())
})
$("#title").blur(function () {
  localStorage.setItem("title",$("#title").val())
})
$("#brief").blur(function () {
  localStorage.setItem("brief",$("#brief").val())
})
// $("#author").blur(function () {
//   localStorage.setItem("author",$("#author").val())
// })
$("#tags").blur(function () {
  localStorage.setItem("tags",$("#tags").val())
})
// $("#publishTime").change(function () {
//   alert($("#publishTime").val())
// })
$("#playCount").blur(function () {
  localStorage.setItem("playCount",$("#playCount").val())
})
$("#videoDuration").blur(function () {
  localStorage.setItem("videoDuration",$("#videoDuration").val())
})
$("#kws").blur(function () {
  localStorage.setItem("kws",$("#kws").val())
})







