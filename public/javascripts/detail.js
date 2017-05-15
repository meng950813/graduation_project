var upload_task = new upload_file($('#file'),$('#upload'),$('#upload .progress-inner'));

var dialog = new show_result_dialog($("#animateDialog"),$("#animateDialog .close-btn"));

/* 学生提交上传内容 */
/*if($('#sub-task') != undefined){
  
  $("#sub-task").onclick = function(event){
    if(upload_task.getChanged()){
      var data = getContent();
      
      if(data != null){
        var task = Number.parseInt(event.target.getAttribute("data-task"),10);
        data.task_id = task != 0?task:null;

        data.file_path = upload_task.getPath();
        
        var url = "/task/upload";
      
        AJAX.post(url,data,function(result){
          if(result.ok == true){
            dialog.showResult(true);
            upload_task.cleanChange();
          }else{
            dialog.showResult(false);
          }
        });
      }
    }
  }
}*/

/* 设置 textarea change 监听事件 */
/*(function(){
  if( $("textarea") ){
    if(isIE()){
      $("textarea").forEach(function(target){
        target.onpropertychange = textareaChange(target);
      });
    }else{
      $("textarea").forEach(function(target){
        target.addEventListener("input", textareaChange.bind(target), false);
      })
    }
  }
})();

function textareaChange(event){
  classie.remove(event.target,"border-danger");
  upload_task.setChanged();
}



function getContent(){
  var data = {
    aims     : null,
    works    : null,
    process  : null,
    reference: null
  };
  
  for(var key in data){
    data[key] = getValue($("#"+key));
    if(data[key] == null)
      return null;
  }
  return data;
}*/

/**
 * 判断给出的元素(textarea)内容是否为空:
 * 如果为空,返回null,修改 textarea 样式
 * 否则返回元素内容
 *
 * @param {[type]} target [目标元素]
 *
 * @return {Boolean} [description]
 */
/*function getValue(target){
  var value = target.value.trim();
  if( value == "" ){
    classie.add(target,"border-danger");
    return null;
  }
  return value;
}*/
var textAreaId = {
  aims     : null,
  works    : null,
  process  : null,
  reference: null
};

var stuUpload = new stuUploadContent(
  $('#sub-task'),
  upload_task,
  dialog,
  "/task/upload",
  textAreaId,
  $(".in-detail")
);