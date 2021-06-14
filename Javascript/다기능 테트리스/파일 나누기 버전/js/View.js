function createRectangleDivByIndexToBoard(i,j, colorIndex) {
    var blockDiv = document.createElement("div");

    var width = boardWidth / cols;
    var height = boardHeight / innerRows;

    var left = j*width;
    var top = (i-upperRows)*height;

    // blockDiv.style.border = "1px solid black";
    return createRectangleDiv("board", blockDiv, left, top, width, height, colorIndex);
}


// createBlocks에 blocksAreNext이 true일 때 호출되는 메서드
function showNextBlocks(newBlocks) {
    var blockWidth = boardWidth / cols;
    var blockHeight = boardHeight / innerRows;    

    // 버려졌던 packBlockShape 함수가 여기서 사용
    // 이 결과를 기준으로 정가운데에 배치
    var packedNextBlockData = packBlockShape(newBlocks.data);

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
    if (totalNextBlockWidth > nextSpaceWidth) {
        // 곱하면 비율로 작아지는 것으로 함
        shrinkFactor = nextSpaceWidth / totalNextBlockWidth;
    }
    if (totalNextBlockHeight * shrinkFactor > nextSpaceHeight) {
        // 곱하면 비율로 작아지는 것으로 함
        shrinkFactor = nextSpaceHeight / (totalNextBlockHeight * shrinkFactor );
    }

    totalNextBlockWidth *= shrinkFactor;
    totalNextBlockHeight *= shrinkFactor;

    blockWidth *= shrinkFactor;
    blockHeight *= shrinkFactor;



    var baseLeft = (nextSpaceWidth - totalNextBlockWidth) / 2;
    var baseTop = (nextSpaceHeight - totalNextBlockHeight) / 2;

    nextBlockDivs = new Array(packedNextRows);

    for (var i=0; i<packedNextBlockData.length; i++) {
        nextBlockDivs[i] = new Array(packedNextCols);
        for (var j=0; j<packedNextBlockData[i].length; j++) {
            var blockDiv = document.createElement("div");

            var left = baseLeft + j*blockWidth;
            var top = baseTop + i*blockHeight;
            var colorIndex = newBlocks.colorIndex;

            if (packedNextBlockData[i][j] == "*") {
                nextBlockDivs[i][j] = createRectangleDiv("next",
                    blockDiv, left, top, blockWidth, blockHeight,
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
    return nextBlockDivs;
}


function eraseNextBlockDivs(nextBlockDivs) {
    var next = document.getElementById("next");
    for (var i=0; i<nextBlockDivs.length; i++) {
        for (var j=0; j<nextBlockDivs[i].length; j++) {
            var nextBlockDiv = nextBlockDivs[i][j];
            if (nextBlockDiv != null) {
                next.removeChild(nextBlockDiv);
            }
        }
    }
    return null;
}



function createRectangleDiv(containerId, blockDiv, left, top, width, height, colorIndex) {
    blockDiv.style.width = width+"px";
    blockDiv.style.height = height+"px";
    blockDiv.style.left = left + "px";
    blockDiv.style.top = top + "px";

    blockDiv.style.display = "inline-block";
    // absolute 속성을 주면 상위 컨테이너에 relative 속성을 명시해야함
    blockDiv.style.position = "absolute";    
    blockDiv.style.boxSizing = "border-box";
    blockDiv.style.backgroundColor = block_colors [ colorIndex % block_colors.length] ;

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


