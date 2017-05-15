$("#submitBtn").onclick = function(event){
	console.log("submit");
	var data = {};
	data.usernum = $('#usernum').value;
	data.pwd = $('#pwd').value;

	if(!(/^\d{0,13}$/.test(data.usernum)) || data.usernum == ""){
		showError($("#usernum"));
		return;
	}
	// if(data.pwd == ""){
	// 	showError($("#pwdError"));
	// 	return;
	// }

	radio = $("input[name='identity']");

	// 选中第一个表示学生身份登陆，否则导师
	data.identity = radio[0].checked?0:1;

	var url = "/login";
	AJAX.post(url,data,function(result){

		// result = JSON.parse(result);
		// console.log(result.identity);

		if(result.pwdError === true){
			showError($("#pwd"));
		}
		else if(result.userError === true){
			showError($("#usernum"));
		}
		// 登录成功
		else{
			window.location.href = result.url;
		}
	});
}

function showError(target){
	$logger("show error");
	var pNode = target.parentNode || target.parentElement;
	classie.add(pNode,"showError");
}