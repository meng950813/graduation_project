var dialog = new show_result_dialog($("#animateDialog"),$("#animateDialog .close-btn"));

$("#choose-state").addEventListener("click",function(event){
	var target = event.target || window.event.target;

	if(classie.has(target,"agree")){
		var data = getData(target);
		data.result = 1;
		sendResult(data,target);
	}
	else if(classie.has(target,"reject")){
		var data = getData(target);
		data.result = 0;
		sendResult(data,target);
	}
},false);

function sendResult(data,target){

	AJAX.post("/tutor/deal_choose",data,function(result){

		if(result.ok == true){
			classie.add(target.parentNode.parentNode,"dealed");
			dialog.showResult(true);
		}else{
			dialog.showResult(false);
		}
	});
}

function getData(target){
	var data = {};
	data.pro_id = target.getAttribute("data-id");
	data.stu_id = target.getAttribute("data-stu");
	data.cho_id = target.getAttribute("data-cho");
	data.pro_name = target.parentNode.parentNode.getAttribute("title");
	return data;
}
