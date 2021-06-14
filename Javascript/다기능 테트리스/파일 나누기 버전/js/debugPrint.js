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