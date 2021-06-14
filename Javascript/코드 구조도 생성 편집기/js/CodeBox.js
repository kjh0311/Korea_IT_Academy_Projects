// 코드 집합 (예를들어, 함수 바깥 코드)이나 함수를 모아놓는 박스
class CodeBox {

    // 지역변수는 저장하지 못 하므로 전역변수를 만들어야 하는데,
    // 항목마다 전역변수를 만드는 것은 배열보다는 클래스나 JSON을 사용해야 한다.
    // JSON을 선택해도 불편하므로 class를 선택하였다.

    constructor(container, code, realignAllLevels) {

        
        this.container = container;
        this.uncommented = code.uncommented; // 분석용
        this.commented = code.commented; // 출력용
        // 전체적으로 모두 정렬하는 함수를 전달함
        this.realignAllLevels = realignAllLevels;

        // console.log(this.name);
        var title = this.commented.name;
        var content = this.commented.content;

        this.marginRight = 10;

        this.boxDiv = document.createElement("div");
        this.pTag = document.createElement("p");
        this.textarea = document.createElement("textarea");
        // var br = document.createElement("br");
    
        this.boxDiv.style.border = "1px solid black";
        this.boxDiv.style.boxSizing = "border-box";
        this.boxDiv.style.marginBottom = "10px";
        this.boxDiv.style.marginRight = this.marginRight + "px";
        this.boxDiv.style.display = "inline-block";
        // this.functionDiv.style.padding = "0px";

        this.pTag.style.margin = "0px";
        this.pTag.style.padding = "10px";
    
        this.textarea.style.width = "500px";
        this.textarea.style.margin = "0px";
        this.textarea.style.display = "none";
        this.textarea.wrap = "off";
        // textarea.className = "content";
        // textarea.style.height = "500px";
        // textarea.style.overflow = "visible";
    
        this.pTag.innerText = title;
        this.textarea.value = content;


        this.pTag.addEventListener("click", this.toggleTextarea.bind(this));        

        // down, up 둘 다 동일한 이벤트를 줘야 정상 작동함        
        // this.textarea.addEventListener("load", this.resizeTextarea.bind(this));
        this.textarea.addEventListener("keydown", this.resizeTextarea.bind(this));
        this.textarea.addEventListener("keyup", this.resizeTextarea.bind(this));
        // 그리고 위 두 줄이 오류 안 난다는게 신기함
        // this가 this.textarea의 this라는 의미라기 보단,
        // 그 객체와 감싸고 있는 CodeAndFunctionBox 객체의 this를 병합한 의미의 this인 듯
        // 즉, 익명함수 선언시 자동 바인딩(bind) 처리가 되는 듯
    

        this.boxDiv.appendChild(this.pTag);
        this.boxDiv.appendChild(this.textarea);            
    
        this.container.appendChild(this.boxDiv);
        // this.container.appendChild(br);
    
        // resize는 container에 추가한 이후에야 적용됨
        // 그리고 container도 다른 곳에 이미 추가되어 있어야함
        this.resizeTextarea();

        // 이 박스의 함수를 호출하는 함수의 인덱스를 저장
        this.childFunctionArray = [];
        // 이 박스의 함수가 호출하는 함수의 박스의 레퍼런스를 저장
        // childBox 연결, 가운데 위치 정렬에 사용
        this.childBoxArray = [];

        this.lineCanvasArray = [];
    }


    addChildFunction(elem) {
        this.childFunctionArray.push(elem);
    }

    addChildBox(childBox) {
        this.childBoxArray.push(childBox);
    }

    getChildFunctionArray() {
        return this.childFunctionArray;
    }
    
    getChildBoxArray() {
        return this.childBoxArray;
    }


    // 재귀함수로 마지막 노드를 얻어온다.
    getLeafBoxes() {
        if (this.childBoxArray.length == 0) {
            // console.log("잎사귀 도달");
            // console.log([this]);
            return new Array(this);
        } else {
            var result = [];
            for (var i=0; i<this.childBoxArray.length ; i++) {
                var childResult = this.childBoxArray[i].getLeafBoxes();
                // console.log("childResult:", childResult);
                // result.push(this.childBoxArray[i].getLeafBoxes());
                // result.concat(childResult);
                // console.log("concat이후 result:", result);
                for (var j=0; j<childResult.length; j++) {
                    result.push(childResult[j]);
                }
            }
            // console.log("result:", result);
            return result;
        }
    }


    setLeft(left) {
        var boxDiv = this.boxDiv;
        boxDiv.style.position = "absolute";
        boxDiv.style.left = left + "px";
    }

    addLeft(leftDiff) {
        var boxDiv = this.boxDiv;
        boxDiv.style.left = parseFloat(boxDiv.style.left) + leftDiff + "px";
    }


    alignLeafBoxes() {
        // 첫 번째 노드의 위치는 0으로 표시하여,
        // 좌표를 설정하지 않도록함
        var rightAndMargin = 0;
        // 잎사귀가 전혀 없어서 좌표설정한 항목이 없는 경우에도
        // 0을 리턴함
        for (var i=0; i<this.childBoxArray.length; i++) {
            var childBox = this.childBoxArray[i];
            // 앞선 결과의 rightAndMargin를 left로 넣는다.
            rightAndMargin = childBox.setLeftRecurively(rightAndMargin);
        }
        return rightAndMargin;
    }

    // 잎사귀끼리 X축을 일정한 간격으로 배치
    setLeftRecurively(nextLeft) {
        var rightAndMargin = 0;

        // 잎사귀 노드일 경우
        if (this.childBoxArray.length == 0) {
            // 맨 왼쪽 노드는 제외함
            if (nextLeft > 0) {
                this.setLeft(nextLeft);
            }
            rightAndMargin = this.getRightAndMargin();
        }
        else {
            for (var i=0; i<this.childBoxArray.length; i++) {
                var childBox = this.childBoxArray[i];
                nextLeft = childBox.setLeftRecurively(nextLeft);
            }
            rightAndMargin = this.getRightAndMargin();
            if (rightAndMargin < nextLeft) {
                rightAndMargin = nextLeft;
            }
        }
        return rightAndMargin;
    }

    centerAmongChildBoxes() {
        var result = this.centerAmongChildBoxesLeftRight();
        // console.log("centerAmongChildBoxes 재귀");
        var levelWidth = result.rightAndMargin - result.left;
        return levelWidth;
    }


    centerAmongChildBoxesLeftRight() {
        var left = 0;
        var right = 0;

        // 잎사귀 박스는 무조건 else에 걸림
        var childBoxArray = this.childBoxArray;        
        if (childBoxArray.length > 0) {
            var mostLeftBox = childBoxArray[0];
            var mostLeftResult = mostLeftBox.centerAmongChildBoxesLeftRight();
            var mostLeft = mostLeftResult.left;

            // console.log("mostLeft:", mostLeft);

            // 차일드의 가장 왼쪽보다 자신의 왼쪽이 더 작으면,
            // 자신의 왼쪽을 mostLeft로 채택한다.
            // if (mostLeft > this.getLeft()) {
            //     mostLeft = this.getLeft();
            // }

            var mostRight;
            // var leftRightMargin = mostLeftResult.rightMargin;

            for (var i=1; i<childBoxArray.length-1; i++) {
                var box = childBoxArray[i];
                var result = box.centerAmongChildBoxesLeftRight();

                // 잎사귀 맨 왼쪽이 아닌 전체 왼쪽을
                // 잎사귀 맨 왼쪽 위치에 오게 한 후
                // 다시 가운데로
                // var leafLeft = box.getLeafLeft();
                // console.log("result.left:", result.left, "leafLeft:", leafLeft);
                // if (result.left < leafLeft) {
                //     console.log(box.commented.name);
                // //     var difference = leafLeft - result.left;
                // //     box.setLeftRecurively(leafLeft + difference);
                // //     box.centerAmongChildBoxesLeftRight();
                // }
            }
            // 원소가 1개면 중복연산 안 함
            if (childBoxArray.length-1 == 0) {
                mostRight = mostLeftResult.right;
            } else {
                mostRight = childBoxArray[childBoxArray.length-1].centerAmongChildBoxesLeftRight().right;
            }
            var width = this.getClientRect().width;

            // console.log("this.setLeft 하기 전");
            // console.log("mostLeft:", mostLeft, "mostRight:", mostRight, "width:", width);
            this.setLeft((mostLeft + mostRight - width) / 2);
            left = mostLeft;
            right = mostRight;
        } else {
            left = this.getClientRect().left;
            right = this.getClientRect().right;
        }

        return {left, right};
    }


    centerAmongChildBoxesInLoop() {
        var childBoxArray = this.childBoxArray;
        // 잎사귀 박스는 무조건 else에 걸림
        if (childBoxArray.length > 0) {
            var mostLeft = childBoxArray[0].getClientRect().left;
            var mostRight = childBoxArray[childBoxArray.length-1].getClientRect().right;
            var width = this.getClientRect().width;

            this.setLeft( (mostLeft + mostRight - width) / 2 );
        } else {
            return;
        }
    }


    getClientRect() {
        const boxDiv = this.boxDiv;
        // DomRect 구하기 (각종 좌표값이 들어있는 객체)
        const boxRect = boxDiv.getBoundingClientRect();
        return boxRect;
    }

    // 자주 필요한 정보는 따로 메서드로 제공
    getWidthAndMargin() { 
        return this.getClientRect().width + this.marginRight;
    }
    
    getRightAndMargin() {
        // console.log(this.getClientRect());
        return this.getClientRect().right + this.marginRight;
    }

    getLeft() {
        // console.log(this.getClientRect());
        return this.getClientRect().left;
    }

    getLeafLeft() {
        if (this.childBoxArray.length == 0) {
            return this.getLeft();
        }
        else {
            return this.childBoxArray[0].getLeafLeft();
        } 
    }

    getDiv() {
        return this.boxDiv;
    }


    // 선은 다른 레벨을 넘나드는 절대위치에 그려야 하므로
    // 모든 레벨의 wrapper를 입력받아서 그곳에 그림
    // 절대위치, 상대위치 구하기 참고 사이트
    // https://mommoo.tistory.com/85
    connectChildBoxes(wrapperForAllLevels) {
        // resize 할 경우를 위해 다시 그리기 위해 기억함
        this.wrapperForAllLevels = wrapperForAllLevels;

        const boxDiv = this.boxDiv;
        const boxRect = boxDiv.getBoundingClientRect(); // DomRect 구하기 (각종 좌표값이 들어있는 객체)

        const boxBottom = boxRect.bottom;
        const boxCenter = (boxRect.left + boxRect.right) / 2;
        
        // console.log("this.childBoxArray.length:", this.childBoxArray.length);
        for (var i=0; i<this.childBoxArray.length; i++) {
            var box = this.childBoxArray[i];
            var canvas = this.connectLine(box, boxBottom, boxCenter);
            wrapperForAllLevels.appendChild(canvas);
            this.lineCanvasArray.push(canvas);
            box.connectChildBoxes(wrapperForAllLevels);
        }
    }

    eraseAllLines() {
        if ( this.wrapperForAllLevels != undefined) {
            var length = this.lineCanvasArray.length;
            for (var i=0; i<length; i++) {
                var canvas = this.lineCanvasArray.shift();
                this.wrapperForAllLevels.removeChild(canvas);
            }
        }
    }


    connectLine(childBox, boxBottom, boxCenter) {
        const childBoxDiv = childBox.getDiv();
        const childBoxRect = childBoxDiv.getBoundingClientRect(); // DomRect 구하기 (각종 좌표값이 들어있는 객체)

        const childTop = childBoxRect.top;
        const childCenter = (childBoxRect.left + childBoxRect.right) / 2;


        var canvas = document.createElement("canvas");

        // 1. canvas의 위치와 크기를 정한다.
        var left = (boxCenter<childCenter)?boxCenter:childCenter;
        var width = Math.abs(boxCenter - childCenter);// + 200;// + 30 + 50;
        var top = boxBottom;
        // console.log(boxBottom);
        var height = childTop - boxBottom;// + 200;// + 30;
        if (width < 1 ) width = 1;

        canvas.style.position = "absolute";
        canvas.style.left = left + "px";
        canvas.style.top = top + "px";
        canvas.style.zIndex = 2;
        // style.width와 height는 쓰면 안 됨
        // canvas.style.width = width + "px";            
        // canvas.style.height = height + "px";            
        // 다음 속성으로 대체
        canvas.width = width;
        canvas.height = height;

        // 2. 생성된 canvas에 그린다.
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        if (childCenter > boxCenter) {
            ctx.moveTo(0, 0);
            ctx.lineTo(width, height);
        } else {
            ctx.moveTo(width, 0);
            ctx.lineTo(0, height);
        }
        ctx.stroke();
        ctx.closePath();
        
        return canvas;
    }



    // 변경하려면, 변경 전 후 가로, 세로 길이 차이를 구해서 레벨 크기에 반영해야함
    toggleTextarea(){
        var prev = this.boxDiv.getBoundingClientRect();
        // console.log("이전 높이:", rect.height);
        // var prevHeight = rect.height;
        if (this.textarea.style.display == "inline-block") {
            this.textarea.style.display = "none";
        } else {
            this.textarea.style.display = "inline-block";
            this.resizeTextarea();
        }

        var cur = this.boxDiv.getBoundingClientRect();

        var widthDifference = cur.width - prev.width;
        var heightDiffernce = cur.height - prev.height;

        this.container.style.width = parseFloat(this.container.style.width) + widthDifference + "px";
        this.container.style.height = parseFloat(this.container.style.height) + heightDiffernce + "px";
        // console.log("제목 클릭");
        this.realignAllLevels();
    }

    
    resizeTextarea() {
        var textarea = this.textarea;

        textarea.style.height = "1px";
        textarea.style.height = (/* 12+ */textarea.scrollHeight)+"px";
        
        textarea.style.width = "1px";
        textarea.style.width = (/* 12+ */textarea.scrollWidth)+"px";
    }
    // 출처: https://zetawiki.com/wiki/HTML_textarea_%EC%9E%90%EB%8F%99_%EB%86%92%EC%9D%B4_%EC%A1%B0%EC%A0%88

    // https가 아니어서 아래 메서드는 사용 불가
    /*
    async showSaveFileDialog() {
        const opts = {
            types: [
                {
                    description: 'Javascript',
                    accept: {'text/javascript': ['.js']},
                },
            ],
        };

        try {
            const fileHandle = window.showSaveFilePicker(opts);
            // console.log(fileHandle);
            // console.log(await fileHandle);
            this.fileHandle = await fileHandle;            
            // Create a FileSystemWritableFileStream to write to.
            const writable = await fileHandle.createWritable();        
            // Write the contents of the file to the stream.
            // console.log(this.commented.content);
            // var blob = new Blob([content], { type: "text/javascript"});
            // saveAs(jsonBlob, this.fileHandle.name);
            await writable.write(this.commented.content);        
            // Close the file and write the contents to disk.
            await writable.close();
            
        } catch (err) {
            console.log(err);
            // console.error(err.name)
        }
    } */


    saveTextAll() {
        // 수정된 경우 반영
        // this.commented를 생성자에서
        // this.commented = code.commented로 설정한 이후
        // 한 번도 안 건드렸으므로 code.commented의 내용이 변결됨
        if (this.commented.content != this.textarea.value) {
            console.log("수정사항 반영");
            console.log("변경 전");
            console.log(this.commented.content);
            this.commented.content = this.textarea.value;
            console.log("변경 후");
            console.log(this.commented.content);
        }

        for (var childBox of this.childBoxArray) {
            childBox.saveTextAll();
        }
    }


    isChanged() {        
        if (this.commented.content != this.textarea.value) {
            return true;
        } else if (this.childBoxArray > 0) {            
            for (var childBox of this.childBoxArray) {
                if (childBox.isChanged()) {
                    return true;
                }
            }
        } else {
            return false;
        }
    }
}