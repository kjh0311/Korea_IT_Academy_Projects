// 블록(currentBlocks)의 좌표(blockLocation)를 이동시키고 반영함
function moveDown() {
    var collision;

    fillBlocks(false);
    blockLocation.i++;
    collision = checkCollision();
    if (collision) {
        // console.log("하강 충돌 판정 당시 boardData: "+boardData);
        // console.log("하강 충돌 판정 당시 colorNumber: "+currentBlocks.colorNumber);
        blockLocation.i--;
    }
    fillBlocks(true);

    // fillBlock보다 먼저 실행되면 안 되는 동작은 아래에
    if (collision) {
        checkFilledAndProcess();
        clearInterval(blockMovingInterval);
        blockMovingInterval = locateAndMoveDown(nextBlocks);
        nextBlocks = createBlocks();

        // 기존의 다음 블록 칸에 내용이 있으면 지운다.
        if (nextBlockDivs != null) {
            console.log("다음 블록 칸 기존 내용 지우기");
            nextBlockDivs = eraseNextBlockDivs(nextBlockDivs);
        }
        nextBlockDivs = showNextBlocks(nextBlocks);
    }
}

// moveDown과 화살표 방향키 연관성 때문에 여기에 놓음
function moveHorizon(direction) {
    var collision;

    // console.log("총 지우기 이전 boardData: "+boardData);
    fillBlocks(false);
    // console.log("총 지운 후 boardData: "+boardData);

    blockLocation.j+=direction;
    collision = checkCollision();
    if (collision) {
        blockLocation.j-=direction;
    }
    fillBlocks(true);
}


function spinBlocks(clockWise) {
    var collision;

    // console.log("총 지우기 이전 boardData: "+boardData);
    fillBlocks(false);
    // console.log("총 지운 후 boardData: "+boardData);

    spinBlocksData(true);
    collision = checkCollision();
    if (collision) {
        console.log("회전 시 충돌 발생으로 되돌림");
        spinBlocksData(false);
    }

    fillBlocks(true);
}


function spinBlocksData(clockWise) {

    var data = currentBlocks.data;
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
    currentBlocks.data = newData;
    // if (clockWise) {
    //     console.log("회전 후");
    // } else {
    //     console.log("되돌린 후");
    // }

    // for (var i=0; i<newData.length; i++) {
    //     console.log(newData[i]);
    // }
}

// flase: 지우기, true: 쓰기
function fillBlocks(flag) {
    var data = currentBlocks.data;
    for (var i=0; i<data.length; i++) {
        for (var j=0; j<data[i].length; j++) {
            
            if (data[i][j]=="*") {
                var blockI = blockLocation.i + i;
                var blockJ = blockLocation.j + j;

            
                var line = blocksData[blockI];
                if (flag) {
                    // console.log("채우기 전 boardData: "+boardData[blockI][blockJ]);
                    // boardData[blockI][blockJ] = '*';

                    blocksData[blockI] = line.substr(0, blockJ) + '*' + line.substr(blockJ+1);
                    // console.log("채운 후 boardData: "+boardData[blockI][blockJ]);
                    blockDivs[blockI][blockJ] = createRectangleDivByIndexToBoard(
                        blockI, blockJ, currentBlocks.colorIndex);
                }
                else {
                    // console.log("한 칸 지우기 전 boardData: "+boardData[blockI]);
                    blocksData[blockI] = line.substr(0, blockJ) + '-' + line.substr(blockJ+1);
                    // console.log("한 칸 지운 후 boardData: "+boardData[blockI]);
                    // createBlockView(blockDivs, blockI, blockJ, 0);

                    if (blockDivs[blockI][blockJ] != null) {
                        var board = document.getElementById("board");                    
                        board.removeChild(blockDivs[blockI][blockJ]);
                        blockDivs[blockI][blockJ] = null;
                    }
                }
            }        
        }
    }
}

// 벽이나 다른 돌과의 충돌체크
function checkCollision() {
    var data = currentBlocks.data;
    for (var i=0; i<data.length; i++) {
        for (var j=0; j<data[i].length; j++) {
            
            if (data[i][j]=="*") {
                var blockI = blockLocation.i + i;
                var blockJ = blockLocation.j + j;                
                
                if (blockI >= 0) {
                    if (blockJ < 0 || cols <= blockJ ||
                        rows <= blockI || 
                        blocksData[blockI][blockJ] == "*")
                    {
                        return true;
                    }
                }
            }
        }
    }
    return false;
}


function checkFilledAndProcess() {
    var data = currentBlocks.data;

    for (var i=0; i<data.length; i++) {
        for (var j=0; j<data[i].length; j++) {
            
            if (data[i][j]=="*") {
                var blockI = blockLocation.i + i;
                var line = blocksData[blockI];                

                // console.log("line: " + line);
                // console.log("boardData: " + boardData);
                if (line == filledBlocksLine) {
                // 다음 주석 이용해서 벽돌 쌓기 모드 만드는 것도 재밌을 듯
                // if (blockI == rows-1) {
                    eraseLineAndDownUpperBlocks(blockI);
                }
                // *이 속한 줄 검사하면
                // 같은 줄에 다른 블록을
                // 검사할 필요는 없음
                break;
            }
        }
    }
}


function eraseLineAndDownUpperBlocks(blockI)
{
    console.log('eraseLineAndDownUpperBlocks');

    console.log("처리 전");
    printBoardData();
    printBlockDiv();

    // 한 줄을 화면에서 지움
    for (var blockJ=0; blockJ<cols; blockJ++)
    {
        var board = document.getElementById("board");
        // 지금 removeChild가 제대로 안 됨
        if (blockDivs[blockI][blockJ] != null) {
            board.removeChild(blockDivs[blockI][blockJ]);
        }
    }
    
    // printBlockDivStyleTop();
    // 위에 것을 한 줄 씩 내림, 맨 윗줄은 다 비워야함
    for (var i=blockI; i>0; i--)
    {
        blocksData[i] = blocksData[i-1];
        blockDivs[i] = blockDivs[i-1];

        // top을 index를 근거로 다시 계산해서 벽돌이 보이는 위치를
        // 한 줄 내린다.
        for (var j=0; j<cols; j++)
        {
            var blockDiv = blockDivs[i][j];

            if ( blockDiv != null ) {
                var height = boardHeight / innerRows;
                var top = (i-upperRows)*height;
                blockDiv.style.top = parseInt(blockDiv.style.top) + height + "px";
            }
        }
    }

    // 맨 윗줄 데이터 초기화
    blocksData[0] = "----------";
    blockDivs[0] = new Array(cols);
    for (var j=0; j<cols; j++) {
        blockDivs[0][j] = null;
    }

    console.log("처리 후");
    printBoardData();
    printBlockDiv();
    // printBlockDivStyleTop();
    // 보드 데이터는 제대로 적용 되었는데, 보드 뷰가 이상하다.
}