 var dialog = new show_result_dialog(
 	$("#animateDialog"),
 	$("#animateDialog .close-btn")
 );

 $("#sub_btn").onclick = function(event){
 	var data = {};

 	data.pwd = $("#pwd").value;
 	var new_pwd = $("#new-pwd").value;
 	var new_pwd_2 = $("#new-pwd-2").value;
 	
 	if(new_pwd !== new_pwd_2 || new_pwd == ""){
 		classie.add($("#new-pwd-2").parentNode,"showError");
 		classie.add($("#new-pwd-2"),"border-danger");
 		return;
 	}
 	data.new_pwd = new_pwd;
 	AJAX.post("/modify_pwd",data,(result)=>{

 		if(result.ok == false){
 			if(result.type == 1){
 				classie.add($("#pwd").parentNode,"showError");
 				classie.add($("#pwd"),"border-danger");
 			}
 			else{
 				dialog.showResult(false);
 			}
 		}
 		else if(result.ok == true){
 			dialog.showResult(true);
 			classie.remove($("#pwd"),"border-danger");
 			classie.remove($("#new-pwd-2"),"border-danger");

 		}else{
 			console.log("bad ajax");
 		}
 	});
 };