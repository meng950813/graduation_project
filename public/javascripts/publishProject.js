/* 点击下拉菜单获取专业信息 */
$("#major").onclick = function(event){
	var self = this;
	AJAX.get("/tutor/getMajor",function(data){
		if(data.ok == true){
			var nowOption = self.options[self.selectedIndex];
			var allOptions = setMajor(data.result);
			self.innerHTML = nowOption+allOptions;
		}else{
			console.log("get major error");
		}
	})
}

/* 根据传入的专业信息生成html语句 */
function setMajor(major_info){
	var html = "";
	for(var i in major_info){
		html += `<option value='${major_info[i].id}'>${major_info[i].name}</option>`;
	}
	return html;
}