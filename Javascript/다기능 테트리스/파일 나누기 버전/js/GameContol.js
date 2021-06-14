// 다음 네 기능은 gameStated와 gamePaused변수에 아무런 영향을 미치지 않는다.
function gameStart() {
    var firstBlocks = createBlocks();
    nextBlocks = createBlocks();    
    // 나중에 nextBlocks에 대해서도 동일한 방법으로 사용
    blockMovingInterval = locateAndMoveDown(firstBlocks);
    nextBlockDivs = showNextBlocks(nextBlocks);
}


function gamePause() {
    clearInterval(blockMovingInterval);
}


function gameResume() {
    blockMovingInterval = setInterval("moveDown()", 1000);
}


function gameStop() {
    // 일시 정지하되, 일시정지 상태는 아니게끔 함    
    gamePause();
    eraseAllBlocksData();
    if (nextBlockDivs != null) {
        nextBlockDivs = eraseNextBlockDivs(nextBlockDivs);
    }
}


function eraseAllBlocksData() {
    var board = document.getElementById("board");
    for (var i=0; i<rows; i++) {
        blocksData[i] = "";
        for (var j=0; j<cols; j++) {
            blocksData[i] += "-";            
            if (blockDivs[i][j] != null) {
                console.log();
                board.removeChild(blockDivs[i][j]);
            }
            blockDivs[i][j] = null;
        }
    }
}