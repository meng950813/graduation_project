var select_project_name,select_project_id,select_project_publisher,select_target_td;

$("#show-process").addEventListener("click",function(event){
	var target = event.target || window.event.target;
	// 判断响应元素
	if(classie.has(target,"selectProBtn")){
		
		var td_pro_name = target.parentNode.parentNode.querySelector(".pro-name");

		var pro_id = parseInt(target.getAttribute("data"),10),
				tutor_id = parseInt(td_pro_name.getAttribute("data"),10);

		console.log("pro_id : "+pro_id + "    tutor_id : "+tutor_id);
		
		if(isNaN(pro_id) || isNaN(tutor_id))
			return;
		select_project_id 				= pro_id;
		select_project_publisher 	= tutor_id;
		select_project_name 			= td_pro_name.innerText;
		select_target_td 					= target.parentNode;

		$("#animateDialog .project-name").innerText = select_project_name;
		// 显示对话框
		classie.toggle($("#animateDialog"),"showAnimateDialog");
	}
},false);

// 关闭选择对话框
$(".close-btn").onclick = function(event){
	classie.remove($("#animateDialog"),"showAnimateDialog");
};


$(".submit-btn").onclick = function(){
	// 有课题id
	if(!isNaN(select_project_id) && !isNaN(select_project_publisher)){
		var url = "/choose/choosePro",
				data = {
					pro_id 		: select_project_id,
					pro_name 	: select_project_name,
					tutor_id 	: select_project_publisher
				};
		AJAX.post(url,data,function(result){
			var animateDialog = $("#animateDialog")
			// 成功
			if(result.ok == true){
				classie.remove(animateDialog,"showFail");
				classie.add(animateDialog,"showSuccess");
				select_target_td.innerHTML = "<h3 class='color-warning'>等待导师审核</h3> ";
			}else{
				classie.add(animateDialog,"showFail");
				classie.remove(animateDialog,"showSuccess");
			}
			// 重置保存内容
			select_project_publisher = select_project_id = select_project_name = select_target_td = undefined;
		})
	}
};