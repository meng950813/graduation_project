/**
 * 提交事件
 *
 * @param {[type]} sub_btn 		[提交按钮元素]
 * @param {[type]} dialog  		[弹窗对象]
 * @param {[type]} pro_name 	[输入课题名称的 input 元素]
 * @param {[type]} pro_type  	[输入课题类型的 select 元素]
 * @param {[type]} pro_nature [输入课题性质的 select 元素]
 * @param {[type]} major 			[输入针对专业的 select 元素]
 * @param {[type]}         [description]
 *
 * @return {[type]} [description]
 */
function publishProject(sub_btn,dialog,pro_name,pro_type,pro_nature,major){
	this.sub_btn  	= sub_btn;
	this.dialog 		= dialog;
	this.pro_name 	= pro_name;
	this.pro_type 	= pro_type;
	this.pro_nature = pro_nature;
	this.major 			= major;

	this.inputChanged = false;

	/* 设置 input 输入监听事件 */
	this.listenInput();

	// 点击上传事件
	this.sub_btn.addEventListener("click",this.publish.bind(this),false);
}

publishProject.prototype.publish = function(){
	if( !this.canPublish() ) return;

	var data = {};

	data.pro_name = getValue(this.pro_name);
	if(data.pro_name == null) return;

	var pro_id = parseInt(this.sub_btn.getAttribute("data-id"),10);
	if(!isNaN(pro_id) && pro_id > 0){
		data.pro_id = pro_id;
	}

	data.pro_type 	= this.getOptionValue(this.pro_type);
	data.pro_nature = this.getOptionValue(this.pro_nature);
	data.major_id 	= this.getOptionValue(this.major);

	AJAX.post("/tutor/publish_project",data,function(result){
		// 成功
		if(result.ok == true){
			this.dialog.showResult(0);
		}
		// 课题名重复
		else if(result.nameErr == true){
			this.dialog.showResult(1);
		}
		// 不知道为啥错
		else{
			this.dialog.showResult(2);
		}
	}.bind(this));
}
/* input 输入监听事件 */
publishProject.prototype.listenInput = function(){
	var eventName = "input";
	if(isIE()){
		eventName = "propertychange";
	}
	this.pro_name.addEventListener(eventName,function(event){
		if(!this.inputChanged){
			this.inputChanged = true;
		}
	}.bind(this),false);
}

publishProject.prototype.canPublish = function(){
	if(this.inputChanged || 
		 this.pro_type.selectIndex != 0 || 
		 this.pro_nature.selectIndex != 0 ||
		 this.major.selectIndex != 0 
		)
		return true;
	return false;
}
publishProject.prototype.getOptionValue = function(target){
	return target.options[target.selectedIndex].value;
}



var result_dialog = new show_result_dialog($("#animateDialog"),$("#close-btn"));

/* 重定义 showResult 函数，type = [0=>succee,1=>name-error,2=>error] */
result_dialog.showResult = function(result){
	var classname = result == 0?"showSuccess"
									: (result == 1?"nameError":"showFail");
	classie.add(this.dialog,"showAnimateDialog");
	classie.add(this.dialog,classname);
}

var publish = new publishProject(
		$("#publish-btn"),
		result_dialog,
		$("#pro_name"),
		$("#pro_type"),
		$("#pro_nature"),
		$("#major")
	);

/* 继续发布 */
$("#republish").cilck = function(){
	publish.pro_name.value = "";
}
