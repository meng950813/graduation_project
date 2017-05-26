var pro_id = $("#send-id").getAttribute("data-id"),
		data={};

data.id = parseInt(pro_id)||0;

$(".in-detail").addEventListener("click",function(event){
	var target = event.target;
	// console.log(target);
	/* 平时成绩 */
	if(target.id == "score-usual"){
		data.type = 0;
	}
	/* 导师评分 */
	else if(target.id == "score-tutor"){
		data.type = 1;
	}
	/* 评审成绩 */
	else if(target.id == "score-appraise"){
		data.type = 2;
	}
	/* 答辩成绩 */
	else if(target.id == "score-reply"){
		data.type = 3;
	}
	else{
		return;
	}
	/* 尚未获取数据 */
	if(!target.getAttribute("got")){
		/* 获取并填充数据 */
		getInfo(data,target);
	}
	translate(target);
});

function getInfo(data,target){
	console.log("get Info");
	var url = "/score/detail";
	AJAX.post(url,data,function(result){
		if(!result.ok){
			target.setAttribute("got",true);
			var parent = target.parentNode.parentNode;
			var aim = parent.querySelector(".score-detail tbody");
			
			aim.innerHTML = dataToHTML(result);
		}
	});
}

/**
 * 将数据填充到 tbody 中
 *
 * @param {[type]} data   [json数据]
 */
function dataToHTML(data){
		var html = '';
		for(var i in data){
			html += '<tr>';
			for(var key in data[i]){
				console.log("data "+key+ " : "+ data[i][key]);
				html += `<td>${data[i][key]}</td>`;
			}
			html += "</tr>";
		}
		console.log(html);
	return html;
}

function translate(target){
	var parent = target.parentNode.parentNode;
	classie.toggle(parent,"show-detail");
}