// 나름의 약속:
// 한 칸: block
// 여러 칸으로 이루어진 케릭터: bricks
// 보드 안의 모든 칸으로 이루어진 배열: board

class Viewer {

    // 이 클래스 덕분에 전역변수 대거 정리함
    constructor(boardInfo) {

        this.boardInfo = boardInfo;

        this.boardWidth = 300;
        this.boardHeight = 600;
        this.nextSpaceWidth = 100;
        this.nextSpaceHeight = 100;

        // 벽돌의 화면 표시를 저장할 배열 선언
        this.boardDivs = new Array(boardInfo.rows);
        for (var i=0; i<boardInfo.rows; i++) {
            this.boardDivs[i] = new Array(boardInfo.cols)
            for (var j=0; j<boardInfo.cols; j++) {
                this.boardDivs[i][j] = null;
            }
        }
        // 다음 벽돌 생성/교체/삭제 시 마다 생성과 삭제를 반복
        this.nextBlockDivs = null;

        // 색상은 element의 class 이름에 반영
        // 비어있는 것은 0(흰색)으로 표시
        this.no_block_color = "white";
        this.block_colors = [this.no_block_color, "darkgray", "red", "orange", "yellow", "green", "blue", "navy", "purple", "lightgray"];


        // 화면에 표시할 격자를 저장할 배열 선언
        this.boardGridViewDivs = new Array(boardInfo.rows);
        for (var i=0; i<boardInfo.rows; i++) {
            this.boardGridViewDivs[i] = new Array(boardInfo.cols);
        }
    }
    

    showGridView() {
        boardInfo = this.boardInfo;

        // 초기화면 그리기
        for (var i=0; i<boardInfo.rows; i++) {
            for (var j=0; j<boardInfo.cols; j++) {
                // i, j 위치에 무색 사각형을 그리고 boardGridView에 저장
                this.boardGridViewDivs[i][j] = 
                    this.createRectangleDivByIndexToBoard(i, j, 0);
            }
        }
    }

    createRectangleDivByIndexToBoard(i,j, colorIndex) {
        boardInfo = this.boardInfo;

        var blockDiv = document.createElement("div");
    
        var width = this.boardWidth / boardInfo.cols;
        var height = this.boardHeight / boardInfo.innerRows;
    
        var left = j*width;
        var top = (i-boardInfo.upperRows)*height;
    
        // blockDiv.style.border = "1px solid black";
        return this.createRectangleDiv("board", blockDiv, left, top, width, height, colorIndex);
    }
    
    
    // createBlocks에 blocksAreNext이 true일 때 호출되는 메서드
    showNextBricks(newBlocks) {
        boardInfo = this.boardInfo;

        var blockWidth = this.boardWidth / boardInfo.cols;
        var blockHeight = this.boardHeight / boardInfo.innerRows;    
    
        // 버려졌던 packBlockShape 함수가 여기서 사용
        // 이 결과를 기준으로 정가운데에 배치
        var packedNextBlockData = brickShapeManager.packBlockShape(newBlocks.data);
    
        var packedNextCols = packedNextBlockData[0].length;
        var packedNextRows = packedNextBlockData.length;
    
        var totalNextBlockWidth =  packedNextCols * blockWidth;
        var totalNextBlockHeight = packedNextRows * blockHeight;
    
    
        // 벽돌의 너비나 높이가 다음 칸을 넘으면
        // 너비와 높이 중 더 큰 것을 기준으로
        // 비율 축소함
    
        // 방법
        // 1. 일단 너비 검사해서 너비가 크면 축소
        // 2. 1번의 결과에서 높이를 기준으로 다시 검사해서 높이가 크면 축소함
        // 3. 축소하려면 비율 인자를 저장함
    
        var shrinkFactor = 1.0;
        if (totalNextBlockWidth > this.nextSpaceWidth) {
            // 곱하면 비율로 작아지는 것으로 함
            shrinkFactor = this.nextSpaceWidth / totalNextBlockWidth;
        }
        if (totalNextBlockHeight * shrinkFactor > this.nextSpaceHeight) {
            // 곱하면 비율로 작아지는 것으로 함
            shrinkFactor = this.nextSpaceHeight / (totalNextBlockHeight * shrinkFactor );
        }
    
        totalNextBlockWidth *= shrinkFactor;
        totalNextBlockHeight *= shrinkFactor;
    
        blockWidth *= shrinkFactor;
        blockHeight *= shrinkFactor;
        
        // 비율 축소 끝    
    
        var baseLeft = (this.nextSpaceWidth - totalNextBlockWidth) / 2;
        var baseTop = (this.nextSpaceHeight - totalNextBlockHeight) / 2;
    
        // div 행렬 준비
        var nextBlockDivs = new Array(packedNextRows);
    
        for (var i=0; i<packedNextBlockData.length; i++) {
            nextBlockDivs[i] = new Array(packedNextCols);
            for (var j=0; j<packedNextBlockData[i].length; j++) {
                var blockDiv = document.createElement("div");
    
                var left = baseLeft + j*blockWidth;
                var top = baseTop + i*blockHeight;
                var colorIndex = newBlocks.colorIndex;
    
                if (packedNextBlockData[i][j] == "*") {
                    nextBlockDivs[i][j] = this.createRectangleDiv
                        ("next", blockDiv, 
                        left, top,
                        blockWidth, blockHeight,
                        colorIndex);
    
                    // 세로로 마지막이거나 아랫칸이 비어있으면 아랫쪽 경계선도 만든다.
                    if (i+1 == packedNextBlockData.length || packedNextBlockData[i+1][j] != "*") {
                        nextBlockDivs[i][j].style.borderBottom = "1px solid black";
                    }
                    // 가로로 마지막이거나 오른쪽칸이 비어있으면 오른쪽 경계선도 만든다.
                    if (j+1 == packedNextBlockData[i].length || packedNextBlockData[i][j+1] != "*") {
                        nextBlockDivs[i][j].style.borderRight = "1px solid black";
                    }
                }
                else {
                    nextBlockDivs[i][j] = null;
                }            
            }
            console.log(packedNextBlockData[i]);
        }
        this.nextBlockDivs = nextBlockDivs;
    }


    eraseBoard() {
        this.removeDivsToNull("board", this.boardDivs);
    }

    // 모든 칸을 컨테이너로부터 제거하고 null로 채움
    removeDivsToNull(containerId, divArray) {
        var container = document.getElementById(containerId);
        if (divArray != null) {
            for (var i=0; i<divArray.length; i++) {
                for (var j=0; j<divArray[i].length; j++) {
                    var div = divArray[i][j];
                    if (div != null) {
                        container.removeChild(div);
                    }
                    divArray[i][j] = null;
                }            
            }
        }
    }

    eraseNextBricks() {
        // this.nextBlockDivs는 어차피 null로 바꿔 제거할 배열이지만
        // 편의상 clearBoard()에서 사용한 removeDivsToNull 메서드를 재활용함
        this.removeDivsToNull("next", this.nextBlockDivs);
        // nextBlockDivs는 새로 그리려면 지웠다가 다시 만들어야 함
        this.nextBlockDivs = null;
    } 

    
    createRectangleDiv(containerId, blockDiv, left, top, width, height, colorIndex) {
        blockDiv.style.width = width+"px";
        blockDiv.style.height = height+"px";
        blockDiv.style.left = left + "px";
        blockDiv.style.top = top + "px";
    
        blockDiv.style.display = "inline-block";
        // absolute 속성을 주면 상위 컨테이너에 relative 속성을 명시해야함
        blockDiv.style.position = "absolute";    
        blockDiv.style.boxSizing = "border-box";
        blockDiv.style.backgroundColor = this.block_colors [ colorIndex % this.block_colors.length] ;
    
        if (left > 0) {
            blockDiv.style.borderLeft = "1px solid black";
        }
        if (top > 0) {
            blockDiv.style.borderTop = "1px solid black";
        }
        if (top < 0) {
            blockDiv.style.visibility = "hidden";
        }
    
        var board = document.getElementById(containerId);
        board.appendChild(blockDiv);
    
        // 배열에 div를 저장해야 나중에 지울 수 있음
        return blockDiv;
    }


    // 여기에 에니메이션을 넣을 수도 있음
    eraseLine(boardI) {
        for (var boardJ=0; boardJ<boardInfo.cols; boardJ++) {
            this.eraseBlockByIndex(boardI, boardJ);
        }

        boardInfo = this.boardInfo;

        for (var i=boardI; i>0; i--) {
            this.boardDivs[i] = this.boardDivs[i-1];

            // top을 index를 근거로 다시 계산해서 벽돌이 보이는 위치를
            // 한 줄 내린다.
            for (var j=0; j<boardInfo.cols; j++) {
                var blockDiv = this.boardDivs[i][j];

                if ( blockDiv != null ) {
                    var height = this.boardHeight / boardInfo.innerRows;
                    var top = (i-boardInfo.upperRows)*height;
                    blockDiv.style.top = parseInt(blockDiv.style.top) + height + "px";
                }
            }
        }
        // 맨 윗줄 데이터 초기화
        this.boardDivs[0] = new Array(boardInfo.cols);
        for (var j=0; j<boardInfo.cols; j++) {
            this.boardDivs[0][j] = null;
        }
        debugPrinter.printBoardDiv(this.boardDivs);
    }


    showBlockByIndex(i, j, colorIndex) {
        this.boardDivs[i][j] = 
            this.createRectangleDivByIndexToBoard(i, j, colorIndex);
    }


    eraseBlockByIndex(i, j) {
        if (this.boardDivs[i][j] != null) {
            console.log
            var board = document.getElementById("board");
            board.removeChild(this.boardDivs[i][j]);
            this.boardDivs[i][j] = null;
        }
    }
}




