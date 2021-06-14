function extractScriptInHtml(html){
    var parser = new DOMParser();
    var htmlDoc = parser.parseFromString(html,"text/html");

    var script = "";
    var len = htmlDoc.getElementsByTagName("script").length;
    for (var i=0; i<len; i++) {
    
        // console.log(htmlDoc.getElementsByTagName("script")[i]);
        var element = htmlDoc.getElementsByTagName("script")[i];

        // 추후 여기서 element의 src 속성을 분석해서 어느 파일을 참조하는지도
        // 표시하는 기능을 만들 필요 있음
        if (element.hasChildNodes()) {
            script += element.childNodes[0].nodeValue;
        }
    }
    return script;
}


// 출처: https://elena90.tistory.com/entry/Java-Script-파일명에서-확장자-추출하기-lastIndexOf [오니님의짱꺤뽀]
/**
 * 파일명에서 확장자명 추출
 * @param filename   파일명
 * @returns _fileExt 확장자명
 */
function getExtensionOfFilename(filename) {

    var _fileLen = filename.length;
    /** 
     * lastIndexOf('.') 
     * 뒤에서부터 '.'의 위치를 찾기위한 함수
     * 검색 문자의 위치를 반환한다.
     * 파일 이름에 '.'이 포함되는 경우가 있기 때문에 lastIndexOf() 사용
     */
    var _lastDot = filename.lastIndexOf('.');
    // 확장자 명만 추출한 후 소문자로 변경
    var _fileExt = filename.substring(_lastDot, _fileLen).toLowerCase();
    return _fileExt;
}


// 출처: https://chaewonkong.github.io/posts/js-deep-copy.html
function cloneJsonObject(obj) {
    var clone = {};
    for (var key in obj) {
      if (typeof obj[key] == "object" && obj[key] != null) {
        clone[key] = cloneObject(obj[key]);
      } else {
        clone[key] = obj[key];
      }
    }
  
    return clone;
}


// 출처: http://www.gisdeveloper.co.kr/?p=5564
function saveToFile_Chrome(fileName, content) {
  var blob = new Blob([content], { type: 'text/plain' });
  objURL = window.URL.createObjectURL(blob);
          
  // 이전에 생성된 메모리 해제
  if (window.__Xr_objURL_forCreatingFile__) {
      window.URL.revokeObjectURL(window.__Xr_objURL_forCreatingFile__);
  }
  window.__Xr_objURL_forCreatingFile__ = objURL;
  var a = document.createElement('a');
  a.download = fileName;
  a.href = objURL;
  a.click();
}

function saveToFile_IE(fileName, content) {
  var blob = new Blob([content], { type: "text/plain", endings: "native" });
  window.navigator.msSaveBlob(blob, fileName);
  //window.navigator.msSaveOrOpenBlob(blob, fileName);
}

function checkIE() {
  return (navigator.appName === 'Netscape' && navigator.userAgent.search('Trident') !== -1) ||
      navigator.userAgent.toLowerCase().indexOf("msie") !== -1;
}


function saveToFile(fileName, content) {

}


// 출처: https://pythonq.com/so/javascript/10058
// Function to download data to a file
function download(data, filename, type) {
  var file = new Blob([data], {type: type});
  if (window.navigator.msSaveOrOpenBlob) // IE10+
      window.navigator.msSaveOrOpenBlob(file, filename);
  else { // Others
      var a = document.createElement("a"),
              url = URL.createObjectURL(file);
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(function() {
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);  
      }, 0); 
  }
}


// 출처: http://paxcel.net/blog/savedownload-file-using-html5-javascript-the-download-attribute-2/
/* function exportToCSV() {

  var csv = "Abc, DEF, GHI, JKLM";
  
  csvData = 'data:text/csv;charset=utf-8,' + csv;
  
  //For IE
  
  if (navigator.appName == "Microsoft Internet Explorer") {  
    myFrame.document.open("text/html", "replace");  
    myFrame.document.write(uuu);  
    myFrame.document.close();  
    myFrame.focus();
    myFrame.document.execCommand('SaveAs', true, 'data.xls');  
  }  
  else {  
    //Others    
    $('#btnExport').attr({'href': csvData, 'target': '_blank' });  
  }
} */


/* 
// 다음과 같은 방법으로 사용

$("#btnExport ").on('click', function (event) {
  exportToCSV.apply();
});

*/


/* function getNewFileHandle() {
  const opts = {
    types: [{
      description: 'Text file',
      accept: {'text/plain': ['.txt']},
    }],
  };
  return window.showSaveFilePicker(opts);
} */