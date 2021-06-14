// 1. 초기 데이터 설정
var boardWidth = 300;
var boardHeight = 600;

var nextSpaceWidth = 100;
var nextSpaceHeight = 100;

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
    blockDivs[i] = new Array(cols)
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

// 초기 상태에만 null
var nextBlockDivs = null;

// 비어있는 것은 0(흰색)으로 표시
var no_block_color = "white";
var block_colors = [no_block_color, "darkgray", "red", "orange", "yellow", "green", "blue", "navy", "purple", "lightgray"];

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

/* var currentBlocks, nextBlocks는
data, colorIndex: blockColorIndex로

구성되어 있으며
data는 blockShapes에 정의된 모양을
복사해서 만듬
*/
var currentBlocks, nextBlocks;
var blockLocation = {i:0, j:0};
var blockMovingInterval;

var gameStated = false, gamePaused = false;