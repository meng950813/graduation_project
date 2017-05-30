 var dialog = new show_result_dialog(
 	$("#animateDialog"),
 	$("#animateDialog .close-btn")
 );

$("#new-apply").addEventListener("click",function(event){
	var target = event.target;
	// console.log(target);
	if(classie.has(target,'del')){
		var data = {id:0},parent_line;
		data.id = target.getAttribute("data-id");

		// console.log(data);
		
		if(!isNaN(data.id) && data.id > 0){
			parent_line = target.parentNode.parentNode;
			AJAX.post("/del_message",data,function(result){
				console.log(result);
				if(result.ok){
					classie.add(parent_line,"dealed");
				}
				dialog.showResult(result.ok);
			});
		}
	}
},false);
