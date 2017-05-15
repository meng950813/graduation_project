function upload_file (file,upload,progress_inner) {
  'use strict';

  this.file = file;
  this.upload = upload;

  this.progress_inner = progress_inner;

  this.xhr = new XMLHttpRequest();

  this.filePath = null;

  this.upload.addEventListener('click', this.uploadFile.bind(this), false);

  this.file.onclick = this.cleanUploadResult.bind(this);
}
// 点击上传
upload_file.prototype.uploadFile = function(event) {
  console.log(this.file.value);

  if(this.file.value == ""){
    classie.add(this.file,"no-file");
    return;
  }else{
    classie.remove(this.file,"no-file");
  }

  this.upload.setAttribute("disabled","");
  classie.remove(this.progress_inner,"notransition");
  // 添加 state-loading 类
  classie.add(this.upload,'state-loading');

  var formData = new FormData();
  formData.append('upload_file', this.file.files[0]);
 

  this.xhr.onload = this.uploadSuccess.bind(this);
  this.xhr.upload.onprogress = this.setProgress.bind(this);
  this.xhr.open('post', '/upload', true);
  this.xhr.send(formData);
}

// 成功上传
upload_file.prototype.uploadSuccess = function(result) {
  if (this.xhr.readyState === 4) {
    
    var  result = JSON.parse(this.xhr.responseText);
    
    classie.remove(this.upload,'state-loading');
    if(result.ok){
      this.path = result.path;
      classie.add(this.upload,'state-success');
    }
    else{
      classie.add(this.upload,'state-error');
      this.file.value="";
    }
    setTimeout(this.stop.bind(this),2000);
  }
}

// 进度条
upload_file.prototype.setProgress = function(event) {
  if (event.lengthComputable) {
    var complete = Number.parseInt(event.loaded / event.total * 100);
    // progress.innerHTML = complete + '%';
    this.progress_inner.style.width = complete+"%";
  }
}

/* 上传结束,显示结果 */
upload_file.prototype.stop = function(){
  this.progress_inner.style.width = "0%";
  this.progress_inner.style.opacity = 1;
  classie.add(this.progress_inner,"notransition");

  // this.upload.className="progress-button";
  this.upload.removeAttribute("disabled");
}

/* 重新上传，清空上次结果样式，不管成功/失败 */
upload_file.prototype.cleanUploadResult = function(){
  classie.remove(this.upload,"state-success");
  classie.remove(this.upload,"state-error");
}

upload_file.prototype.getPath = function(){
  return this.path;
}

var test = new upload_file($('#file'),$('#upload'),$('#upload .progress-inner'));