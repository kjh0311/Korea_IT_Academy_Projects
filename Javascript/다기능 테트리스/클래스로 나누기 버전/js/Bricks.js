class Bricks {

    // const blockShapes에 있는 블록 하나 선택하고 복사해서 만듬
    constructor() {
        this.data = brickShapeManager.copyRandomBrickShape();
        // Brick의 속성이라고 보긴 어렵지만 구현을 쉽게하기 위해서 넣음
        this.colorIndex = Math.ceil(
            Math.random() * (viewer.block_colors.length-1)
            );
        this.i=0;
        this.j=0;
        this.blockMovingInterval;
    }


    // 블록의 위치(blockLocation)를 지정하고 이동시킴
    locateToCenterTop(boardInfo) {
        // 벽돌을 아래에서 부터 찾은 위치를 기준으로 블록의 위치를 지정함
        var data = this.data;
        for (var i=data.length-1; i>=0; i--) {
            var found = false;
            for (var j=0; j<data[i].length; j++) {
                if (data[i][j] == "*") {
                    this.i = boardInfo.upperRows-i-1; // 초기에는 0부터 시작해서 1, 2로 증가 가능함
                    this.j = Math.ceil( 
                        (boardInfo.cols - data[0].length) / 2
                    );
                    found = true;
                    break;
                }
            }
            if (found) {
                break;
            }
        }
    }

    startToMoveDown() {
        this.blockMovingInterval = setInterval(()=>{
            this.moveDown();
        }, 1000);
        return this.blockMovingInterval;
    }

    stop() {
        clearInterval(this.blockMovingInterval);
    }

    onArrowKeyDown(key) {
        // 방향키 입력을 받음
        const LEFT = 37, UP = 38, RIGHT = 39, DOWN = 40;        
        switch (key) {
        case LEFT:
            return this.moveHorizon(-1);
        case UP:
            return this.spinBlocks(true);
        case RIGHT:
            return this.moveHorizon(1);
        case DOWN:
            return this.moveDown();
        }    
    }


    // 블록(currentBlocks)의 좌표(blockLocation)를 이동시키고 반영함
    moveDown() {
        var collision;

        this.fillBricks(false);
        this.i++;
        collision = this.checkCollision();
        if (collision) {
            // console.log("하강 충돌 판정 당시 boardData: "+boardData);
            // console.log("하강 충돌 판정 당시 colorNumber: "+currentBlocks.colorNumber);
            this.i--;
        }
        this.fillBricks(true);

        // fillBlock보다 먼저 실행되면 안 되는 동작은 아래에
        if (collision) {
            this.stop(); // 자신의 역할은 여기서 마감함
            brickBoardController.checkFilledAndProcess();
            brickBoardController.changeBricks();
        }
    }

    // moveDown과 화살표 방향키 연관성 때문에 여기에 놓음
    moveHorizon(direction) {
        var collision;

        // console.log("총 지우기 이전 boardData: "+boardData);
        this.fillBricks(false);
        // console.log("총 지운 후 boardData: "+boardData);

        this.j+=direction;
        collision = this.checkCollision();
        if (collision) {
            this.j-=direction;
        }
        this.fillBricks(true);
    }


    spinBlocks(clockWise) {
        var collision;

        // console.log("총 지우기 이전 boardData: "+boardData);
        this.fillBricks(false);
        // console.log("총 지운 후 boardData: "+boardData);

        this.spinBlocksData(true);
        collision = this.checkCollision();
        if (collision) {
            console.log("회전 시 충돌 발생으로 되돌림");
            this.spinBlocksData(false);
        }

        this.fillBricks(true);
    }


    spinBlocksData(clockWise) {

        var data = this.data;
        var newColumns = data.length;
        var newRows = data[0].length;
        var newData = new Array(newRows);

        for (var i=0; i<newRows; i++) {
            newData[i] = "";
        }

        // if (clockWise) {
        //     console.log("회전하기 전");
        // } else {
        //     console.log("되돌리기 전");
        // }

        // for (var i=0; i<data.length; i++) {
        //     console.log(data[i]);
        // }

        // 세로로 검사해서 (i와 j 순서를 바꿈) 가로로 추가한다.
        for (var i=0; i<newRows; i++) {
            for (var j=0; j<newColumns; j++) {
                if (clockWise) {
                    newData[i] += data[newColumns-1-j][i];
                } else {
                    newData[i] += data[j][newRows-1-i];
                }
            }
        }
        this.data = newData;
        // if (clockWise) {
        //     console.log("회전 후");
        // } else {
        //     console.log("되돌린 후");
        // }

        // for (var i=0; i<newData.length; i++) {
        //     console.log(newData[i]);
        // }
    }

    // false: 지우기, true: 쓰기
    fillBricks(flag) {
        var data = this.data;        
        for (var i=0; i<data.length; i++) {
            for (var j=0; j<data[i].length; j++) {                
                if (data[i][j]=="*") {
                    var boardI = this.i + i;
                    var boardJ = this.j + j;
                    brickBoardController.fillOneBlock(flag, boardI, boardJ, this.colorIndex);
                }        
            }
        }
    }

    // 벽이나 다른 돌과의 충돌체크
    checkCollision() {
        var data = this.data;
        // 모든 블록에 대해
        for (var i=0; i<data.length; i++) {
            for (var j=0; j<data[i].length; j++) {
                // 블록의 보드 상 위치를 구하고
                if (data[i][j]=="*") {
                    var boardI = this.i + i;
                    var boardJ = this.j + j;

                    // 보드에서 사용 가능한 위치가 아닐 때 충돌로 판정
                    if (!brickBoardController.
                        checkAvailableIndex(boardI, boardJ))
                    {
                        return true;
                    }
                }
            }
        }
        return false;
    }
}