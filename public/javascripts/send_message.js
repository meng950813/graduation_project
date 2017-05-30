var canSend = false,
		search_area = $("#s-receiver");

var dialog = new show_result_dialog(
	$("#animateDialog"),
	$("#animateDialog .close-btn")
);

if(search_area){
	var eventName = "input";  
	if(isIE()){
		eventName = "propertychange";
  }
	$('#receiver').addEventListener(eventName,function(event){
		var target = event.target;
		if(target.nodeName == "INPUT"){
			var value = target.value.trim();
			if(value == ''){
				classie.remove(search_area,"show");
			}else{
				get_user_info(value,search_area);
				classie.add(search_area,"show");
			}
		}else{
			return;
		}
	},false);

	search_area.addEventListener("click",function(event){
		var target = event.target;
		
		if(target.nodeName == "P" && !classie.has(target,"no-user")){
			$('#receiver').setAttribute("data-id",target.getAttribute("data-id"));
			$('#receiver').value = target.getAttribute("data-name");
			classie.remove(search_area,"show");
		}
	},false);
}

/* 传入名字，返回查询结果 */
function get_user_info(key,target){
	var url = "/get_user_info?key="+key;
	AJAX.get(url,(result)=>{
		fillDataToHTML(result,target);
	})
}

function fillDataToHTML(data,target){
	var html='';
	if(data.length == 0){
		html += `<p class='no-user'>无此用户</p>`;
	}else{
		for(var i in data){
			// console.log(data[i]);
				html += `<p data-id=${data[i].id} data-name="${data[i].username}">${data[i].username}</p>`;
		}
	}
	target.innerHTML = html;
}

/* 判断是否可以发送信息 */
function canSendMessage(data){
	// console.log(data);
	if($('#receiver').value.trim() == ""|| isNaN(data.id)){
		canSend = false;
		classie.add($('#receiver'),"border-danger");
	}
	else if(data.content == ""){
		canSend = false;
		classie.add($("#m_title"),"border-danger");
	}else if(data.title == ""){
		canSend = false;
		classie.add($("#content"),"border-danger");
	}
	else{
		canSend = true;
	}
}


$("#sub-btn").onclick = function(event){
	var data = {};
	data.id = $('#receiver').getAttribute("data-id");
	data.title = $("#m_title").value.trim();
	data.content = $("#content").value.trim();
	
	canSendMessage(data);
	
	if(canSend){
		AJAX.post("/send_message",data,function(result){
			dialog.showResult(result.ok);
		});
	}
}