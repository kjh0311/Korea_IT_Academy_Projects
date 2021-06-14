// 윗 주석
class CodeAnalyzer { // 옆 주석

    splitCode(script) {

        // script = " " + script;
        // 주석 처리
        var result = this.splitByComments(script);
        var uncommentedScript = result.uncommentedScript;
        // console.log("주석 제거 후:", script);
        var comments = result.comments;

        var uncommented = this.splitByFunctionsUncommented(uncommentedScript);

        // uncommented.outsider = uncommented.outsider.substring(1);
        var commented = this.recoverComments(uncommented, comments);

        commented.outsider = commented.outsider.trim();
        uncommented.outsider = uncommented.outsider.trim();


        // 쓰기 더 좋은 형태로 변환
        // outsider도 functions의 원소와 같은 형식으로 통일
        var outsider = {            
            uncommented: {
                name: "[함수 바깥의 내용]",
                content: uncommented.outsider
            },
            commented: {
                name: "[함수 바깥의 내용]",
                content: commented.outsider
            }
        };

        var functions = [];

        for (var i=0; i<commented.functions.length; i++) {
            functions.push({
                uncommented: uncommented.functions[i],
                commented: commented.functions[i]
            })
        }

        return {outsider, functions, uncommented, commented, comments};
    }


    splitByComments(script) {
        var uncommentedScript = "";

        // 줄 내림 제외한 모든 공백
        var lineFrontSpaces = "[ \f\r\t\v\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff]*";
        // 한 줄
        var oneLine = "[^\n]*\n";
        // 여러 줄 (*뒤에는 /가 오지 않거나, *이 오지 않아야함)
        var multiLine = "(?:(?:\\*[^/])|[^\\*])*";
        
        var lineComment = "(" + lineFrontSpaces + "//" + oneLine + ")";
        var blockComment = "(/\\*" + multiLine + "\\*/)";
        var pattern = lineComment + "|" + blockComment;
        // var pattern = lineComment;
        // var pattern = blockComment;

        // console.log("블록주석 패턴:", blockComment);
        // console.log("주석 패턴:", pattern);

        // "s"는 줄바꿈 문자도 .에 포함한다는 의미
        var regExp = new RegExp(pattern, "s");

        var result = "";
        var comments = [];

        // 마지막 줄 검사 가능하게 함
        script += "\n";

        // 테스트 코드 (주석 해제하여 사용)
        // result = script.match(regExp);
        // console.log(result);
        // return { uncommentedScript: script, comments: null };
        // 테스트 코드 끝

        // result[0]: 줄 주석, 블록 주석 둘 중 발견된 것
        // result[1]: 줄 주석 (아닌 경우 undefined)
        // result[2]: 블록 주석 (아닌 경우 undefined)
        while (result = script.match(regExp)) {
            var text = result[0];
            var startIndex = script.search(regExp);
            // uncommentedScript += script.substring(0, startIndex+2);            
            uncommentedScript += script.substring(0, startIndex );                        
            // 추후 원래 코드 복원을 위해 상대적인 위치를 저장함
            comments.push({ 
                text, 
                startIndex
            });
            // console.log(text);
            
            // 발견한 함수 이후로 동일한 작업을 반복
            if (result[1] == undefined) { // 블록주석                
                script = script.substring(startIndex + text.length + 1 );                
            } else { // 줄 주석 (개행문자가 포함되므로 한 칸 덜 이동)
                script = script.substring(startIndex + text.length );
            }
            
        }
        uncommentedScript += script;
        return { uncommentedScript, comments };
    }

    // var uncommented = {outsider, functions};
    recoverComments(uncommented, comments) {

        // 0과 functions의 첫 원소,
        // functions의 첫 원소와 두 번째 원소의 인덱스를
        // comments의 인덱스와 비교하여
        // outsider나 functions의 적절한 위치에 복원
        var outsider = uncommented.outsider;
        // 복원하여 만든 텍스트는 복사본이므로 원본 변경 안 됨

        // functions는 배열의 레퍼런스 이므로, 안에 내용을 바꾸면
        // 원본이 바뀌므로 복사함
        var functions = uncommented.functions.slice();

        // 함수 바깥 기준 인덱스로, 실질적으로 절대 인덱스가 됨
        // 함수의 길이를 제외한 절대 인덱스
        var outsiderCommentIndex = 0;
        var outsiderLastFunctionEndIndex = 0;
        var j=0;
        
        for (var i=0; i<comments.length; i++) {
            var comment = comments[i];
            var commentStart = comment.startIndex;
            var commentText = comment.text;
            var inserted = false;

            // 마지막 주석의 끝 위치에서 상대적인 시작지점을 더해서 절대 위치를 구함
            outsiderCommentIndex += commentStart;

            // 다음 while문은 반복의 의미는 아니고, 조건부 재실행의 의미            
            // 맞는 위치를 찾은 경우 break하고 inserted를 true로 바꿈
            while (j<functions.length) {
                // 즉, 한 번만 실행될 수도 있고,
                // 한 번 사용한 원소는 재사용 안 함
                // 그리고 배열의 원소는 uncommented.functions와
                // 동일한 JSON 오브젝트를 가리키면 안 되기 때문에
                // 새로 복사해서 생성함
                functions[j] = cloneJsonObject( functions[j] );
                // 이와같이 함수를 조사한 경우에는 복사된 별개의 오브젝트가 생성되고,
                // 조사하지 않은 경우에는 uncommented.functions와 동일한 레퍼런스를
                // 원소로 가짐                

                // functionStart: 지난 함수의 끝과의 상대적인 차이
                // var functionStart = functions[j].startIndex;                
                var outsiderFunctionIndex = 
                        outsiderLastFunctionEndIndex + 
                        functions[j].startIndex;

                var functionName = functions[j].name;
                var content = functions[j].content;
                var functionLength = content.length;
                var outsiderFunctionEndIndex = outsiderFunctionIndex + functionLength;
                // console.log("functionName: ", functionName);
                // console.log("commentText: ", commentText);
                // console.log("outsiderFunctionIndex: ", outsiderFunctionIndex);
                // console.log("outsiderFunctionEndIndex: ", outsiderFunctionEndIndex);
                // console.log("outsiderCommentIndex: ", outsiderCommentIndex);
                
                // 주석을 제거한 이후 함수의 위치가 주석의 위치와 같다면
                // 주석이 함수의 바로 앞에 있었다고 판단함
                // -1을 해야 바로 앞에 있는 주석이 안으로 안 들어감
                if ( outsiderCommentIndex <= outsiderFunctionIndex ) {
                    // 프로토타입 한 줄 줄이는 경우
                    var indexBack = outsiderCommentIndex - 1;
                    // outsiderCommentIndex++;
                    // 삽입
                    outsider = 
                        outsider.substring(0, outsiderCommentIndex) +
                        commentText +
                        outsider.substring(outsiderCommentIndex);
                    
                    // 커서를 주석 뒤로 옮김
                    outsiderCommentIndex += commentText.length;
                    // 실제 함수의 상대 위치를 주석의 길이만큼 증가
                    functions[j].startIndex += commentText.length;
                    inserted = true;
                    break;
                }
                else {                    
                    var content = functions[j].content;
                    var functionLength = content.length;
                    var outsiderFunctionEndIndex = outsiderFunctionIndex + functionLength;

                    // 중괄호 끝과 주석의 위치가 동일하면 주석이 먼저 있던 것으로 간주함
                    if (outsiderCommentIndex <= outsiderFunctionEndIndex) {
                        // 함수와 주석의 상대 위치 차이를 구한다.
                        var commentPosition = outsiderCommentIndex - outsiderFunctionIndex;
                        // 수정 결과의 레퍼런스를 단지 content라는 지역변수에 복사하면 안 되고,
                        // functions[j]의 content 레퍼런스를 수정해야함
                        functions[j].content = 
                            content.substring(0, commentPosition) +
                            commentText +
                            content.substring(commentPosition);
                        inserted = true;

                        outsiderCommentIndex += commentText.length;
                        break;
                    } else {
                        // 다음 함수에 대해서 진행한다.
                        // 함수에 대한 분석은 끝났으니, outsider 상의 위치는
                        // 함수의 크기를 제외한 위치로 한다.
                        var prototypeLength = functions[j].prototype.length;
                        outsiderCommentIndex = outsiderCommentIndex - functionLength + prototypeLength + 1;
                        outsiderLastFunctionEndIndex = outsiderFunctionEndIndex - functionLength + prototypeLength;
                        j++;
                    }
                }
            }

            // 함수가 없거나 마지막까지 찾은 경우
            if (inserted == false) {
                // 주석을 outsider의 commentStart 위치에 넣기
                // outsiderCommentIndex += commentStart;
                // 삽입
                outsider = 
                    outsider.substring(0, outsiderCommentIndex) +
                    commentText +
                    outsider.substring(outsiderCommentIndex);
                // 커서를 주석 뒤로 옮김
                outsiderCommentIndex += commentText.length;
            }
            // 이거 HTML 내 스크립트일 경우 후반부에서 공백이 재생되지 않는 기현상이 발생함
        }
        return { outsider, functions };
    }


    // 주석이 없는 코드만 분석함
    splitByFunctionsUncommented(uncommentedScript) {
        var mustNotNormalCharactor = "\\W";

        var mustSpace = "\\s+";
        var canSpace = "\\s*";
        var canUnderBar = "_*";
        var alphabetOneMore = "[a-zA-Z]+";

        // 함수명을 추출할 수 있도록 괄호로 감쌈
        var functionName = "(" + canUnderBar + alphabetOneMore + ")";
        // 도출 과정이 너무 길어서 함수로 만듬
        var canParameters = this.assembleCanParameterRegex();

        // regex 문자열 완성
        var regexString = 
            // function 바로 앞에 일반 문자 금지, 
            // uncommentedScript 앞에는 공백 문자 추가
            mustNotNormalCharactor +
            // 함수명 정의
            "(function" + mustSpace + functionName + canSpace +
            // 파라미터 받기 (괄호 안에 파라미터 입력 가능)
            "\\(" + canParameters + "\\)" + canSpace + 
            // 중괄호 시작부터 끝까지 내용 가져오기
            "{)(.*)";
        // console.log(regexString);

        // "s"는 줄바꿈 문자도 .에 포함한다는 의미
        var regExp = new RegExp(regexString, "s");

        // 여기서 스크립트를 분석하고 결과를 반환함
        var functions = [];
        var result;

        // 테스트 코드
        // result = script.match(regExp);
        // console.log(result);
        // // for (var i=0; i<result.length; i++) {
        // //     console.log(result[i]);
        // // }
        // return;
        // 테스트 코드 종료

        // 함수 바깥의 것을 기록함
        var outsider = "";
        uncommentedScript = "\n" + uncommentedScript;
        // 재귀패턴 처리를 위한 반복        
        while (result = uncommentedScript.match(regExp)) {
            var startIndex = uncommentedScript.search(regExp)+1;
            var beforeOpenBrace = result[1];
            var name = result[2];            
            // 중괄호 이후 함수의 끝을 확인하여 함수 내용을 알아냄
            var afterOpenBrace = result[3];
            var endFunctionIndex = this.findEndFunctionIndex(afterOpenBrace);
            var content = beforeOpenBrace + afterOpenBrace.
                                    substring(0, endFunctionIndex+1);

            var prototype = beforeOpenBrace + "...";

            outsider += uncommentedScript.substring(0, startIndex);
            outsider += prototype;
            functions.push({ startIndex, name, content, prototype });
            // 발견한 함수 이후로 동일한 작업을 반복
            uncommentedScript = afterOpenBrace.substring(endFunctionIndex);
        }
        outsider += uncommentedScript;
        outsider = outsider.substring(1);
        return {outsider, functions} ;        
    }


    // 복잡해서 분할함
    // 은연 중에 강사님의 비법을 따라하게됨
    assembleCanParameterRegex() {
        var canUnderBar = "_*";
        var alphabetOneMore = "[a-zA-Z]+";    

        var variableName = canUnderBar + alphabetOneMore;

        var canSpace = "\\s*";
        
        // 변수 2개 이상 받을 때,
        // 콤마 양옆에 띄어쓰기 가능, 오른쪽에는 변수명
        var commaAndVariable = canSpace + "," + canSpace + variableName;
        var canCommaAndVariableRepeatable = "(?:" + commaAndVariable + ")*";

        // 변수가 온다면 변수 오른쪽에 ,와 추가적인 변수가 올 수 있음
        var canVariables = 
            "(?:" + variableName + canCommaAndVariableRepeatable + ")?";

        // 변수가 올 수 있고, 변수 양옆에 띄어쓰기 가능
        return canSpace + canVariables + canSpace;
    }

    // count가 -1이 되면 해당 인덱스를 리턴
    findEndFunctionIndex(afterBrace) {
        var count = 0;
        var i=0;

        for (i=0; i<afterBrace.length; i++) {
            if (afterBrace.charAt(i) == "{") {
                count++;
            } else if (afterBrace.charAt(i) == "}") {
                count--;
                if (count<0) {
                    return i;
                }
            }
        }
        // 함수가 미완결된 비정상적인 경우
        return i;
    }
    // 저거 regex로 구현하려면 [{}] 패턴으로 검색해서 리턴값이 { 인지 } 인지 확인하고,
    // count에 반영해야함
    // 그러면 일 두 번하는 느낌일텐데, 주석잡는건 그렇게 구현해보겠음


    // 함수 내에서 다른 함수가 호출되는 것을 찾음
    findFunctionCall(script, functionName) {
        var mustNotNormalCharactor = "\\W";
        var canSpace = "\\s*";
        
        // 형식을 체크하기는 어려우므로 그냥 함수 이름만 들어가면 인정하기
        var regexString = 
            mustNotNormalCharactor + functionName + mustNotNormalCharactor;

            // 다음과 같이 체크하기는 어려우므로 그냥 함수 이름이 
            // var canParameters = this.assembleCanParameterRegex();
            /* +
            // 파라미터 받기 (괄호 안에 파라미터 입력 가능)
            "\\(" + canParameters + "\\)"; */

        // console.log(regexString);
        // "s"는 줄바꿈 문자도 .에 포함한다는 의미
        var regExp = new RegExp(regexString, "s");

        // return script.match(regExp);

        // 함수 호출이 존재하면 그 위치를 반환
        // 없으면 -1을 반환
        var excluedString = "function";        
        script = " " + script;
        var result = script.search(regExp);

        var excluedLength = excluedString.length;
        if (result > excluedLength && script.substring(result-excluedLength, result) == "function") {

            // console.log("검사할 문자열" + script.substring(result-excluedLength, result));
            return -1;
        } else {
            return result;
        }
    }

    replaceFunctionMark(outsider, commented) {
        var mustNotNormalCharactor = "\\W";

        var mustSpace = "\\s+";
        var canSpace = "\\s*";

        // 도출 과정이 너무 길어서 함수로 만듬
        var canParameters = this.assembleCanParameterRegex();

        // regex 문자열 완성
        var regexString = 
            // function 바로 앞에 일반 문자 금지, 
            // uncommentedScript 앞에는 공백 문자 추가
            mustNotNormalCharactor +
            // 함수명 정의
            "(function" + mustSpace + commented.name + canSpace +
            // 파라미터 받기 (괄호 안에 파라미터 입력 가능)
            "\\(" + canParameters + "\\)" + canSpace + 
            // 중괄호 시작부터 끝까지 내용 가져오기
            "{\\.\\.\\.})";

        console.log(regexString);
        var regExp = new RegExp(regexString);
        var result = outsider.match(regExp);

        return outsider.replace(result[1], commented.content);
    }
}


// return outsider.replace(regExp, commented.content);

// var result = outsider.match(regExp, commented.content);

// var str = "function init() {...} sdfsdfsd";
// str = str.replace(result[1], commented.content);
// console.log(str);

// console.log(result[1]);
// console.log(commented.content);

// 아래는 테스트 주석

// /*

/*
//ㄴㅇㄴㅇㄹㄴ
*/

// ㅇㄴㄹㄴㅇ /* ㅇㄹ */