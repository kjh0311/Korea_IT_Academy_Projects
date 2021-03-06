// 1. 초기 데이터 설정
var boardWidth = 300;
var boardHeight = 600;

var innerRows = 20;
var upperRows = 4; // 상단 측면을 초과하는 벽돌을 담는 공간
var rows = innerRows + upperRows;
var cols = 10;

// 유효한 벽돌 상태를 저장 (-과 *로 표시)
var blocksData = new Array(rows);
// 벽돌의 화면 표시를 저장할 배열 선언
var blockDivs = new Array(rows);

for (var i=0; i<rows; i++) {
    blocksData[i] = "";
    blockDivs[i] = new Array(cols);
    for (var j=0; j<cols; j++) {
        blocksData[i] += "-";
        blockDivs[i][j] = null;
    }
}

var filledBlocksLine = "";
for (var i=0; i<cols; i++) {
    filledBlocksLine += "*";
}

// 화면에 표시할 격자를 저장할 배열 선언
var boardGridViewDivs = new Array(rows);
for (var i=0; i<rows; i++) {
    boardGridViewDivs[i] = new Array(cols);
}

// 비어있는 것은 0(흰색)으로 표시
var no_block_color = "white";
var colors = [no_block_color, "darkgray", "red", "orange", "yellow", "green", "blue", "navy", "purple", "lightgray"];

// 색상은 element의 class 이름에 반영
// 빈 칸은 -로,
// 벽돌이 있는 칸은 *로 표현
var blockShapes = [
    [
        "--*-",
        "--*-",
        "--*-",
        "--*-",
    ],
    [
        "----",
        "--*-",
        "-**-",
        "-*--",
    ],
    [
        "----",
        "--*-",
        "***-",
        "----",
    ],
    [
        "----",
        "-*--",
        "-**-",
        "--*-",
    ],
    [
        "----",
        "-*--",
        "-***",
        "----",
    ],
    [
        "----",
        "--*-",
        "-***",
        "----",
    ],
    [
        "----",
        "-**-",
        "-**-",
        "----",
    ]
];

var currentBlocks, nextBlocks;
var currentBlocksColorNumber;
var nextBlocksColorNumber;
var blockLocation = {i:0, j:0};
var blockMovingInterval;

var gameStated = false, gamePaused = false;
/* 
코드 정리하기

요약적으로 보여주기

코드가 한 눈에 보일 수 있도록 코드 배치에 융통성이 필요하다.

아마도 1차적으로 호출되는 함수만 연달아서 배치하는 방식으로 갈 듯


그리고 중요도 순으로 배치할 듯

결국 중요도 순 레벨순회법이 될 듯

요약을 하되, 말이 되게 요약하는 것이 이 정리방법의 원칙이다.
- 자연어 기반 정렬


결과: 결과적으론, 잎사귀(leaf) 기준 레벨 순회법이 되었다.

*/
window.addEventListener("load", ()=>{init();});

// 화면그리기, 블록 모양 보정
function init() {
    // 초기화면 그리기
    // initBoardGridView();

    // 함수 하나 줄이는 편이 차라리 더 나아보임
    for (var i=0; i<rows; i++) {
        for (var j=0; j<cols; j++) {
            // i, j 위치에 무색 사각형을 그리고 boardGridView에 저장
            boardGridViewDivs[i][j] = createRectangleDivByIndex(i, j, 0);
        }
    }
    // 벽돌 모양 보정
    for (var i=0; i<blockShapes.length; i++) {
        blockShapes[i] = packSquareCenterBlockShape(blockShapes[i]);
        // packBlockShape(i);
    }
    window.addEventListener("keydown", (e)=>{onKeyDown(e);});
}


function onKeyDown(event) {
    const ENTER = 13, ESC = 27, SPACE_BAR = 32,
    LEFT = 37, UP = 38, RIGHT = 39, DOWN = 40;
    
    switch (event.keyCode) {
        case ENTER:
        case SPACE_BAR:
            return onEnterSpaceKeyDown(event.keyCode);
        case ESC:
            return onEscKeyDown();
        case LEFT:
        case UP:
        case RIGHT:
        case DOWN:
            return onArrowKeyDown(event.keyCode);
    }
}


/*
    엔터키:
    1. 게임이 시작되지 않은 경우에는 게임을 시작함
    2. 게임이 시작된 경우, 일시정지 중이 아니면 일시정지함
    3. 일시정지 중이면 재개함
*/
function onEnterSpaceKeyDown(key) {
    const ENTER = 13, SPACE_BAR = 32;

    if (gameStated) {
        if (gamePaused) {
            gamePaused = false;
            gameResume();
        }
        else {
            gamePaused = true;
            gamePause();
        }
    }
    else {
        // 가독성을 위해서 else if로 할 수 있는 것을 else와 if로 분리함
        if (key == ENTER) {
            gameStated = true;
            gameStart();
        }
    }    
}


function onEscKeyDown() {
    if (gameStated) {
        // gameStarted와 gamePaused를 초기화한다.
        gameStated = false;
        gamePaused = false;
        gameStop();
    }
}


// 다음 네 기능은 gameStated와 gamePaused변수에 아무런 영향을 미치지 않는다.
function gameStart() {
    var firstBlocks = createBlocks();
    nextBlocks = createBlocks();
    // 나중에 nextBlocks에 대해서도 동일한 방법으로 사용
    blockMovingInterval = locateAndMoveDown(firstBlocks);
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
}


function onArrowKeyDown(key) {
    const LEFT = 37, UP = 38, RIGHT = 39, DOWN = 40;
    if (gameStated && !gamePaused) {
    // if (true) {
        switch (key) {
        case LEFT:
            return moveHorizon(-1);
        case UP:
            return spinBlocks(true);
        case RIGHT:
            return moveHorizon(1);
        case DOWN:
            return moveDown();
        }
    }
}


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


function createRectangleDivByIndex(i,j, color) {
    var blockDiv = document.createElement("div");

    var width = boardWidth / cols;
    var height = boardHeight / innerRows;

    var left = j*width;
    var top = (i-upperRows)*height;

    if (j > 0) {
        blockDiv.style.borderLeft = "1px solid black";
    }
    if (i > upperRows) {
        blockDiv.style.borderTop = "1px solid black";
    }
    if (i < upperRows) {
        blockDiv.style.visibility = "hidden";
    }
    // blockDiv.style.border = "1px solid black";

    blockDiv.style.width = width+"px";
    blockDiv.style.height = height+"px";
    blockDiv.style.left = left + "px";
    blockDiv.style.top = top + "px";

    blockDiv.style.display = "inline-block";
    // absolute 속성을 주면 상위 컨테이너에 relative 속성을 명시해야함
    blockDiv.style.position = "absolute";    
    blockDiv.style.boxSizing = "border-box";
    /* blockDiv.style.borderCollapse = "collapse"; */

    blockDiv.style.backgroundColor = colors[color%colors.length];

    var board = document.getElementById("board");
    board.appendChild(blockDiv);

    // 배열에 div를 저장해야 나중에 지울 수 있음
    return blockDiv;
}


function packBlockShape(blockShape) {
    // console.log("\n\n실행 전");
    // for (var i=0; i<blockShape.length; i++) {
    //     console.log(blockShape);
    // }
    // min과 max를 구하고 반영
    // Brute Force 알고리즘
    var minJ, maxJ, minI, maxI;
    for (var i=0; i<blockShape.length; i++) {
        for (var j=0; j<blockShape[i].length; j++) {            
            if (blockShape[i][j]=="*"){
                if (minJ == undefined || j < minJ) {
                    minJ = j;
                    maxJ = j;
                } else if (j > maxJ) {
                    maxJ = j;
                }
                if (minI == undefined || i < minI) {
                    minI = i;
                    maxI = i;
                } else if (i > maxI) {
                    maxI = i;
                }
            }        
        }
    }
    // console.log("최대 최소 인덱스 계산 결과");
    // console.log("minI: "+minI+", maxI: "+maxI+", minJ: "+minJ+", maxJ: "+maxJ+"\n\n\n");
    // 최소의 사각형 박스 안에 내용물 담기
    var lineArray = [];
    for (var i=minI; i<=maxI; i++) {
        var line = "";
        for (var j=minJ; j<=maxJ; j++) {
            if (blockShape[i][j]=="*") {
                line += "*";
            } else {
                line += "-";
            }
        }
        lineArray.push(line);
    }
    // console.log("\n변환 결과");
    // for (var i=0; i<lineArray.length; i++) {
    //     console.log(lineArray[i]);
    // }
    return lineArray;
}


function packSquareCenterBlockShape(blockShape) {
    console.log("\n\n실행 전");
    for (var i=0; i<blockShape.length; i++) {
        console.log(blockShape[i]);
    }
    // min과 max를 구하고 반영
    // Brute Force 알고리즘
    var minJ, maxJ, minI, maxI;
    for (var i=0; i<blockShape.length; i++) {
        for (var j=0; j<blockShape[i].length; j++) {            
            if (blockShape[i][j]=="*"){
                if (minJ == undefined || j < minJ) {
                    minJ = j;
                    maxJ = j;
                } else if (j > maxJ) {
                    maxJ = j;
                }
                if (minI == undefined || i < minI) {
                    minI = i;
                    maxI = i;
                } else if (i > maxI) {
                    maxI = i;
                }
            }        
        }
    }

    // 가운데 보정
    var minIJ = (minI<minJ)?minI:minJ;
    var maxIJ = (maxI>maxJ)?maxI:maxJ;

    var iOffset, jOffset;

    var jLeftMargin = minJ-minIJ;
    var jRightMargin = maxIJ-maxJ;
    var jLeftRightMarginDifference = jLeftMargin - jRightMargin;

    var iTopMargin = minI-minIJ;
    var iBottomMargin = maxIJ-maxI;
    var iTopBottomMarginDifference = iTopMargin - iBottomMargin;

    /* // 차이가 1이거나 0이면 jOffset은 0이 되어야함 */
    // 차이가 -1이거나 0이면 jOffset은 0으로
    if (jLeftRightMarginDifference < 0 ) {
        jOffset = jLeftRightMarginDifference+1;
    } else {
        jOffset = jLeftRightMarginDifference;
    }

    /* // 차이가 1이거나 0이면 iOffset은 0이 되어야함 */
    // 차이가 -1이거나 0이면 iOffset은 0으로
    if (iTopBottomMarginDifference < 0) {
        iOffset = iTopBottomMarginDifference+1;
    } else {
        iOffset = iTopBottomMarginDifference;
    }
    // console.log("최대 최소 인덱스 계산 결과");    
    // console.log(
    //     "minI: "+minI+", maxI: "+maxI+", minJ: "+minJ+", maxJ: "+maxJ+
    //     "\nminIJ: "+minIJ+", maxIJ: "+maxIJ+
    //     "\njLeftMargin: "+jLeftMargin+", jRightMargin: "+jRightMargin+
    //     "\niOffset: "+iOffset+", jOffset: "+jOffset+
    //     "\n\n\n");
    // 최소의 사각형 박스 안에 내용물 담기
    var lineArray = [];
    for (var i=minIJ; i<=maxIJ; i++) {
        var line = "";
        for (var j=minIJ; j<=maxIJ; j++) {

            var centeredI = (i+iOffset)%(maxIJ+1);
            var centeredJ = (j+jOffset)%(maxIJ+1);

            // console.log("centeredI: "+centeredI+", centeredJ: "+centeredJ);

            if (blockShape[centeredI][centeredJ]=="*") {
                line += "*";
            } else {
                line += "-";
            }
        }
        lineArray.push(line);
    }

    console.log("\n변환 결과");
    for (var i=0; i<lineArray.length; i++) {
        console.log(lineArray[i]);
    }

    return lineArray;
}


// const blockShapes에 있는 블록 하나 선택하고 복사해서 만듬
function createBlocks() {
    var len = blockShapes.length;
    var i = Math.floor(Math.random() * len);
    var selectedBlockShape = blockShapes[i];

    len = selectedBlockShape.length;
    var blockData = new Array(len);
    for (i=0; i<len; i++) {
        blockData[i] = selectedBlockShape[i];
    }

    var blockColorNumber = Math.ceil
        (Math.random() * (colors.length-1));
    return {
        data: blockData,
        colorNumber: blockColorNumber
    };
}


// 블록의 위치(blockLocation)를 지정하고 이동시킴
function locateAndMoveDown(blocks) {
    var blocksHeight = 0;

    // 벽돌을 아래에서 부터 찾은 위치를 기준으로 블록의 위치를 지정함
    var data = blocks.data;
    for (var i=data.length-1; i>=0; i--) {
        var found = false;
        for (var j=0; j<data[i].length; j++) {
            if (data[i][j] == "*") {
                blockLocation.i = upperRows-i-1; // 초기에는 0부터 시작해서 1, 2로 증가 가능함
                blockLocation.j = Math.ceil( (cols-data[0].length)/2 );
                found = true;
                break;
            }
        }
        if (found) {
            blocksHeight++;
            break;
        }
    }
    // 호출되는 시점이 다르므로 move();에서 사용할 블록은 전역변수에 저장
    currentBlocks = blocks;
    return setInterval("moveDown()", 1000);
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
                    blockDivs[blockI][blockJ] = createRectangleDivByIndex(
                        blockI, blockJ, currentBlocks.colorNumber);
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
    var filledLineIndex = -1;

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


function printBoardData() {
    for (var i=0; i<rows; i++) {
        console.log(blocksData[i]);
    }
}

function printBlockDiv() {
    for (var i=0; i<rows; i++) {
        var message = "";
        for (var j=0; j<cols; j++) {
            if (blockDivs[i][j] != null) {
                message += "X";
            } else {
                message += "O";
            }            
        }
        console.log(message);
        message = "";
    }
}


// 아래는 테스트 주석

// /*

/*
//ㄴㅇㄴㅇㄹㄴ
*/

// ㅇㄴㄹㄴㅇ /* ㅇㄹ */

