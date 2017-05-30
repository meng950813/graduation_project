$("#submitBtn").onclick = function(event){
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
	// 
	var url = "./dologin";
	console.log(data);
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