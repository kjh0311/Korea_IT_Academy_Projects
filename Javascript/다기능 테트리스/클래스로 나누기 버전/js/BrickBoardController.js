
// 벽돌과 보드에 대한 제어자
class BrickBoardController {

    constructor(boardInfo) {
        this.boardInfo = boardInfo;

        // 유효한 벽돌 상태를 저장 (-과 *로 표시)
        this.boardData = new Array(boardInfo.rows);
        this.initializeBoard(this.boardData);   

        this.filledLine = "";
        for (var i=0; i<boardInfo.cols; i++) {
            this.filledLine += "*";
        }

        this.emptyLine = "";
        for (var i=0; i<boardInfo.cols; i++) {
            this.emptyLine += "-";
        }

        this.currentBricks = null;
        this.nextBricks = null;
    }


    // 레퍼런스를 전달하므로 내용물을 바꾸면
    // 인자로 전달한 배열의 내용도 바뀜
    initializeBoard(boardData) {
        var boardInfo = this.boardInfo;
        for (var i=0; i<boardInfo.rows; i++) {
            boardData[i] = "";
            for (var j=0; j<boardInfo.cols; j++) {
                boardData[i] += "-";
            }
        }
    }


    // 벽돌 초기 생성
    createAndMoveDownBricks() {
        // class를 의미적으로 분할함
        this.currentBricks = new Bricks();
        this.nextBricks = this.createNextAndMoveDownBricks();
    }

    // 2번째 이후 생성
    // 코드 구조때문에 만든 함수
    createNextAndMoveDownBricks() {
        var nextBricks = new Bricks();
        viewer.showNextBricks(nextBricks);
        this.currentBricks.
            locateToCenterTop(this.boardInfo);
        this.currentBricks.startToMoveDown();        
        return nextBricks;
    }

    changeBricks() {
        this.currentBricks = this.nextBricks;
        viewer.eraseNextBricks();
        this.nextBricks = this.createNextAndMoveDownBricks();
    }

    startMoveDownBricks() {
        // moveDown 메서드를 떠넘기기 위해서 한번 더 떠넘김
        this.currentBricks.startToMoveDown();
    }

    stopBricks() {
        this.currentBricks.stop();
    }


    clearBoardAndNext() {
        this.currentBricks.stop();
        this.currentBricks = null;
        this.nextBricks = null;
        this.initializeBoard(this.boardData);
        viewer.eraseBoard();
        viewer.eraseNextBricks();
    }


    fillOneBlock(flag, boardI, boardJ, colorIndex) {
        var boardData = this.boardData;
        var line = boardData[boardI];

        boardData[boardI] = line.substr(0, boardJ) + (flag?'*':'-') + line.substr(boardJ+1);
        if (flag) {
            // console.log("채운 후 boardData: "+boardData[blockI][blockJ]);
            viewer.showBlockByIndex(boardI, boardJ, colorIndex);
        }
        else {
            // console.log("한 칸 지운 후 boardData: "+boardData[blockI]);            
            viewer.eraseBlockByIndex(boardI, boardJ);
        }
    }


    checkAvailableIndex(boardI, boardJ) {
        var boardData = this.boardData;
        var boardInfo = this.boardInfo;

        // i가 0보다 작으면 기록을 안 하므로
        // 충돌검사를 면제함
        if (boardI >= 0) {
            // console.log("boardI>=0");
            if (boardJ < 0 || 
                boardInfo.cols <= boardJ ||
                boardInfo.rows <= boardI || 
                boardData[boardI][boardJ] == "*")
            {
                // console.log("충돌 발생");
                return false;
            } else {
                return true;
            }
        } else {
            // console.log("boardI<0");
            return true;
        }
    }


    checkFilledAndProcess() {
        var currentBricks = this.currentBricks;

        for (var i=0; i<currentBricks.data.length; i++) {
            for (var j=0; j<currentBricks.data[i].length; j++) {
                
                if (currentBricks.data[i][j]=="*") {
                    var boardI = currentBricks.i + i;
                    var line = this.boardData[boardI];
                    // console.log("line: " + line);
                    // console.log("this.filledLine: " + this.filledLine);
                    // console.log("boardData: " + boardData);
                    if (line == this.filledLine) {
                    // 다음 주석 이용해서 벽돌 쌓기 모드 만드는 것도 재밌을 듯
                    // if (boardI == rows-1) {
                        this.eraseLineAndDownUpperBlocks(boardI);
                    }
                    // *이 속한 줄 검사하면
                    // 같은 줄에 다른 블록을
                    // 검사할 필요는 없음
                    break;
                }
            }
        }
    }

    eraseLineAndDownUpperBlocks(boardI) {
        console.log('eraseLineAndDownUpperBlocks');
        console.log("처리 전");
        // this.boardData 레퍼런스를 저장
        var boardData = this.boardData;
        debugPrinter.printBoardData(boardData);

        // 한 줄을 화면에서 지움
        viewer.eraseLine(boardI);        
        // 위에 것을 한 줄 씩 내림, 맨 윗줄은 다 비워야함
        // 레퍼런스가 가리키는 내용을 바꾸므로 실제 내용도 바뀜
        for (var i=boardI; i>0; i--)  {
            boardData[i] = boardData[i-1];
        }
        // 맨 윗줄 데이터 초기화
        boardData[0] = this.emptyLine;

        console.log("처리 후");
        debugPrinter.printBoardData(boardData);        
        // printBlockDivStyleTop();
        // 보드 데이터는 제대로 적용 되었는데, 보드 뷰가 이상하다.
    }


    onArrowKeyDown(key) {
        // 사용중인 벽돌이 존재할 때만 키 입력을 넘김
        if (this.currentBricks != null) {
            this.currentBricks.onArrowKeyDown(key);
        }        
    }

}