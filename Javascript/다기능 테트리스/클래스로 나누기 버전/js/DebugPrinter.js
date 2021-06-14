
class DebugPrinter {

    constructor(boardInfo) {
        this.boardInfo = boardInfo;
    }

    printBoardData(boardData) {
        var boardInfo = this.boardInfo;
        for (var i=0; i<boardInfo.rows; i++) {
            console.log(boardData[i]);
        }
    }
    
     printBoardDiv(boardDivs) {
        var boardInfo = this.boardInfo;
        for (var i=0; i<boardInfo.rows; i++) {
            var message = "";
            for (var j=0; j<boardInfo.cols; j++) {
                if (boardDivs[i][j] != null) {
                    message += "X";
                } else {
                    message += "O";
                }            
            }
            console.log(message);
            message = "";
        }
    }
}