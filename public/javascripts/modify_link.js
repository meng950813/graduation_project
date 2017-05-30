 var dialog = new show_result_dialog(
 	$("#animateDialog"),
 	$("#animateDialog .close-btn")
 );

 $("#sub_btn").onclick = function(event){
 	var data = {},
 			phone = $("#phone"),
 			mail = $("#mail");

 	data.phone =phone.value;
 	data.mail =mail.value;
 	
 	var exg_phone = /^1[3578]\d{9}$/,
 			exg_mail = /^\w+@\w+.com$/;

 	console.log(exg_phone.test(data.phone));
 	console.log(exg_mail.test(data.mail));
 	if(exg_phone.test(data.phone)){
 		classie.remove(phone.parentNode,"showError");
 	}else{
 		classie.add(phone.parentNode,"showError");
 		return;
 	}
 	if(exg_mail.test(data.mail)){
 		classie.remove(mail.parentNode,"showError");
 	}else{
 		classie.add(mail.parentNode,"showError");
 		return;
 	}

 	AJAX.post("/modify_link",data,(result)=>{
 		if(result.ok == true){
 			dialog.showResult(true);
 		}
 		else{
 			dialog.showResult(false);
 		}
 	});
 };