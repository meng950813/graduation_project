/* 工具类 */
;
( function(window){
	"use strict";

	function classReg(className){
		return new RegExp("(^|\\s+)" + className + "(\\s+||$)");
	}

	var hasClass,addClass,removeClass;

	if("classList" in document.documentElement){

		hasClass = function(elem,c){
			return elem.classList.contains(c);
		};
		addClass = function(elem,c){
			elem.classList.add(c);
		};
		removeClass = function(elem,c){
			elem.classList.remove(c);
		};
	}
	else{
		hasClass = function(elem,c){
			return classReg(c).test(elem.className);
		};

		addClass = function(elem,c){
			if(!hasClass(elem,c)){
				elem.className += (" "+c);
			}
		};

		removeClass = function(elem,c){
			elem.className = elem.className.replace(classReg(c));
		};
	}

	function toggleClass(elem,c){
		hasClass(elem,c)?removeClass(elem,c):addClass(elem,c);
	}

	var classie = {
		hasClass : hasClass,
		addClass : addClass,
		removeClass : removeClass,
		toggleClass : toggleClass,

		// short name
		has : hasClass,
		add : addClass,
		remove : removeClass,
		toggle : toggleClass
	};

	// transport ==> 将 classie 变为全局对象
	if ( typeof define === 'function' && define.amd ) {
	  // AMD
	  define( classie );
	} else {
	  // browser global
	  window.classie = classie;
	}
} )(window);


/*  封装$ */
;window.$ = HTMLElement.prototype.$ = function(selector){
	var elem = document.querySelectorAll(selector);

	return elem.length == 0 ? null
				:elem.length == 1 ? elem[0]
				:elem;
}

/* 封装ajax */
window.AJAX = HTMLElement.prototype.AJAX  = {

	post : function(url,data,callback){
		var xhr = new window.XMLHttpRequest();
		xhr.open("post",url,true);
		xhr.setRequestHeader('Content-Type', 'application/json;charset=utf-8');    //设置HTTP header字段
	  xhr.onreadystatechange = function () {
			// readyState==4 : 请求已完成;  304未修改
      if (xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 304)) {
        callback(JSON.parse(xhr.responseText));
    	}
    };
    xhr.send(JSON.stringify(data));
	},

	get : function(url,callback){
		var xhr = new window.XMLHttpRequest();
		xhr.open('GET',url,true);
		xhr.onreadystatechange=function(){
			if (xhr.readyState == 4 && xhr.status == 200 || xhr.status == 304) { 
				callback(JSON.parse(xhr.responseText));  //从服务器获得数据
			}
		};
		xhr.send(null);
	}
}




/* 设置导航栏高度 */
function set_nav_height(){
	var nav_container = $("#nav-container"),
			nav = nav_container.clientHeight;
	var article = $("#article").clientHeight;
	if(nav < article){
		nav_container.style.position="absolute";
	}
}
set_nav_height();






/**
 * 实现文件上传及特效
 *
 * @param {[type]} file           [input file 元素]
 * @param {[type]} upload         [点击上传的元素]
 * @param {[type]} progress_inner [显示进度的元素]
 *
 */
function upload_file (file,upload_btn,progress_inner) {
  'use strict';

  this.file = file;
  this.upload = upload_btn;

  this.progress_inner = progress_inner;

  this.xhr = new XMLHttpRequest();

  this.filePath = null;
  this.isChanged = false;

  this.upload.addEventListener('click', this.uploadFile.bind(this), false);

  this.file.onclick = this.cleanUploadResult.bind(this);
}
// 点击上传
upload_file.prototype.uploadFile = function(event) {
  // console.log(this.file.value);

  if(this.file.value == ""){
    classie.add(this.file,"no-file");
    return;
  }else{
    classie.remove(this.file,"no-file");
  }

  this.upload.setAttribute("disabled","");
  classie.remove(this.progress_inner,"notransition");
  // 添加 state-loading 类
  classie.add(this.upload,'state-loading');

  var formData = new FormData();
  formData.append('upload_file', this.file.files[0]);
 

  this.xhr.onload = this.uploadSuccess.bind(this);
  this.xhr.upload.onprogress = this.setProgress.bind(this);
  this.xhr.open('post', '/upload', true);
  this.xhr.send(formData);
}

// 成功上传
upload_file.prototype.uploadSuccess = function(result) {
  if (this.xhr.readyState === 4) {
    
    var  result = JSON.parse(this.xhr.responseText);
    
    classie.remove(this.upload,'state-loading');
    if(result.ok){
      this.path = result.path;
      this.setChanged();
      classie.add(this.upload,'state-success');
    }
    else{
      classie.add(this.upload,'state-error');
      this.file.value="";
  		this.upload.removeAttribute("disabled");
    }
    setTimeout(this.stop.bind(this),2000);
  }
}

// 进度条
upload_file.prototype.setProgress = function(event) {
  if (event.lengthComputable) {
    var complete = Number.parseInt(event.loaded / event.total * 100);
    // progress.innerHTML = complete + '%';
    this.progress_inner.style.width = complete+"%";
  }
}

/* 上传结束,显示结果 */
upload_file.prototype.stop = function(){
  this.progress_inner.style.width = "0%";
  this.progress_inner.style.opacity = 1;
  classie.add(this.progress_inner,"notransition");

  // this.upload.className="progress-button";
}

/* 重新上传，清空上次结果样式，不管成功/失败 */
upload_file.prototype.cleanUploadResult = function(){
  classie.remove(this.upload,"state-success");
  classie.remove(this.upload,"state-error");
}
/* 返回上传路径 */
upload_file.prototype.getPath = function(){
  return this.path;
}
upload_file.prototype.setChanged = function(){
	this.isChanged = true;
}
upload_file.prototype.getChanged = function(){
	return this.isChanged;
}
/* 当传输成功后，将保存数据清空，防止重复提交 */
upload_file.prototype.cleanChange = function(){
	this.isChanged = false;
}





/**
 * show result dialog
 *
 * @param {[type]} dialog    [弹窗元素]
 * @param {[type]} close_btn [关闭弹窗的元素]
 *
 */
function show_result_dialog(dialog, close_btn){
	this.dialog 		= dialog;
	this.close_btn 	= close_btn;

	/* 设置关闭弹窗的监听事件 */
	this.close_btn.onclick = this.closeDialog.bind(this);
}

show_result_dialog.prototype.closeDialog = function(){
	classie.remove(this.dialog,"showAnimateDialog");
}
show_result_dialog.prototype.showResult = function(success){
	var classname = success == true?"showSuccess":"showFail";
	classie.add(this.dialog,"showAnimateDialog");
	classie.add(this.dialog,classname);
}




/**
 * 学生提交内容函数
 *
 * @param {[type]} sub_btn [提交元素]
 * @param {[type]} upload  [控制上传文件及特效的对象]
 * @param {[type]} dialog  [控制弹出窗的对象]
 * @param {[type]} url     [上传内容路径]
 * @param {[type]} textarea    [上传内容，传入的参数只有 textarea 元素的id,值为null]
 *            例： textarea = {
										    aims     : null,
										    works    : null,
										    process  : null,
										    reference: null
										  };
 * @param {[type]} parentElem  [所有 textarea 元素的父元素，用于设置事件监听]
 * @param {[type]} annexUpload [控制上传附件及特效的对象]
 *
 */
function stuUploadContent(sub_btn,upload,dialog,url,textAreaId,parentElem,annexUpload){
	this.sub_btn 		= sub_btn;
	this.upload 		= upload;
	this.dialog 		= dialog;
	this.url 				= url;
	this.textAreaId	= textAreaId;
	this.parentElem = parentElem;
	this.annexUpload= annexUpload;


	if(this.parentElem != undefined || this.parentElem != null){
		/* 设置 textarea change 监听事件 */
		this.listenAreaChange();
	}

	/* 设置 提交按钮点击事件  */
	this.sub_btn.onclick = this.submitClick.bind(this);
}
/* 设置 textarea change 监听事件 : 通过传入 textAreaId 的键名获取元素 */
stuUploadContent.prototype.listenAreaChange = function(){
	var eventName = "input";  /* 非 ie 浏览器的 change 事件名 */
	if(isIE()){
		/* ie 浏览器的 change 事件名 */
		eventName = "propertychange";
  }

  this.parentElem.addEventListener(eventName, function(event){
  	var target = event.target;
  	if(target.nodeName == "TEXTAREA"){
  		classie.remove(target,"border-danger");
  		this.upload.setChanged();
  	}
  }.bind(this), false);
}

/* 设置 提交按钮点击事件 */
stuUploadContent.prototype.submitClick = function(){
	if(this.upload.getChanged() || this.annexUpload.getChanged()){
    var data ={};
    if(this.textAreaId != undefined){
    	data = this.getAreaText();
    }
    
    if(data != null){
      var id = Number.parseInt(this.sub_btn.getAttribute("data-id"),10);
      data.id = id > 0?id:null;

      data.file_path = this.upload.getPath();

      if(this.annexUpload != undefined){
      	data.annex_path = this.annexUpload.getPath();
      }
    	
      AJAX.post(this.url,data,function(result){
        if(result.ok == true){
          this.dialog.showResult(true);
          this.upload.cleanChange();
          if(this.annexUpload != undefined)
          	this.annexUpload.cleanChange();
        }else{
          this.dialog.showResult(false);
        }
      }.bind(this));
    }
  }
}

/* 获取 textarea 元素中的输入内容 */
stuUploadContent.prototype.getAreaText = function(){
	for(var key in this.textAreaId){
    this.textAreaId[key] = getValue($("#"+key));
    if(this.textAreaId[key] == null)
      return null;
  }
  return this.textAreaId;
}

/**
 * 判断给出的元素(textarea)内容是否为空:
 * 如果为空,返回null,修改 textarea 样式
 * 否则返回元素内容
 *
 * @param {[type]} target [目标元素]
 */
function getValue(target){
	// console.log(target);
	if(target == null || target == undefined) return null;
  var value = target.value.trim();
  if( value == "" ){
    classie.add(target,"border-danger");
    return null;
  }
  return value;
}

/*
  利用IE与标准浏览器在处理数组的toString方法的差异做成：
  对于标准游览器，如果数组里面最后一个字符为逗号，JS 引擎会自动剔除它
*/
function isIE(){
  if(!-[1,])
    return true;
  return false;
}



/**
 * 导师上传评价
 *
 * @param {[type]} sub_btn   [确定上传按钮]
 * @param {[type]} dialog    [弹出窗]
 * @param {[type]} radio_btn [单选元素]
 * @param {[type]} text      [输入评价的textarea元素]
 * @param {[type]} url       [上传路径]
 * @param {[type]} type      [评论的具体阶段：]
 *                           任务书  :2
 *                           开题报告:3
 *
 */
function uploadReview(sub_btn,dialog,radio_btn,text,url,type){
	this.sub_btn 			= sub_btn;
	this.dialog				= dialog;
	this.radio_btn		= radio_btn;
	this.text					= text;
	this.url					= url;
	this.type 				= type;

	this.isChanged  	= false;

	this.sub_btn.onclick = this.uploadReview.bind(this);
	
	this.listenAreaChange();
}

uploadReview.prototype.uploadReview = function(){
	var data = {};
	data.comments = getValue(this.text);
	
	if(data.comments == null) return;

	if(this.isChanged){
		// 获取课题 id
		var id = Number.parseInt(this.sub_btn.getAttribute("data-id"),10);
  	if(id > 0){
  		data.id = id;
  	}
  	else{
  		return;
  	}
  	// 根据第一个单选框(通过)是否被选中判断结果
		data.status = this.radio_btn[0].checked?1:2;
		data.type  	= this.type;

		console.dir(data);
		AJAX.post(this.url,data,function(result){
			 if(result.ok == true){
          this.dialog.showResult(true);
          this.isChanged = false;
        }else{
          this.dialog.showResult(false);
        }
		}.bind(this));
	}
}
uploadReview.prototype.listenAreaChange = function(){
	var eventName = "input";
	if(isIE()){
		eventName = "propertychange";
	}
	this.text.addEventListener(eventName,function(event){
		var target = event.target;
  	if(target.nodeName == "TEXTAREA"){
  		classie.remove(target,"border-danger");
  		this.isChanged = true;
  	}
	}.bind(this),false);
}





/**
 * 导师提交评分的函数
 *
 * @param {[type]} sub_btn    [提交按钮]
 * @param {[type]} dialog_obj [弹出窗对象]
 * @param {[type]} input_obj  [输入框的父元素，用于添加监听函数]
 * @param {[type]} url  			[上传路径]
 * @param {[type]} data  			[输入参数]
 *
 * @return {[type]} [description]
 */
function  sub_score(sub_btn,dialog_obj,input_parent,url,data){
	this.sub_btn 			= sub_btn;
	this.dialog_obj 	= dialog_obj;
	this.input_parent = input_parent;
	this.url 					= url;

	this.data 				= data;

	// 当内容修改时才能提交
	this.canSubmit  = false;

	// 设置响应事件
	this.setEvent();

	// 设置点击上传函数
	this.sub_btn.click = this.submit_score.bind(this,event);
}

sub_score.prototype.setEvent = function(){
	var eventName = "input";
	if(isIE()){
		eventName = "propertychange";
	}
	this.input_parent.addEventListener(eventName,function(event){
		var target = event.target;
		if(target.nodeName == "INPUT"){
			
			this.canSubmit = true;

			var max 	= parseInt(target.getAttribute("max"),10),
					value = parseInt(target.value,10);
			if(value > max || value < 0){
				classie.add(target,"border-danger");
				this.canSubmit = false;
			}else {
				classie.remove(target,"border-danger");
			}
		}
	}.bind(this),false);
}
sub_score.prototype.submit_score = function(event){

	for(var key in this.data){
		var score = getValue($("#"+key));
		if(score == null) return;
		this.data[key] = parseInt(score,10);
	}

	var pro_id = parseInt(event.target.getAttribute("data-id"),10);

	if(isNaN(pro_id) || pro_id < 1) return;

	if(this.canSubmit){
		
		this.data.pro_id = pro_id;

		AJAX.post(this.url,this.data,function(result){
			if(result.ok == true){
				this.dialog.showResult(true);
			}
			else{
				this.dialog.showResult(false);
			}
		})
	}
}


