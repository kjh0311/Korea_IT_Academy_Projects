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

    var blockColorIndex = Math.ceil
        (Math.random() * (block_colors.length-1));

    var newBlocks = {
        data: blockData,
        colorIndex: blockColorIndex
    };
    return newBlocks;
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