class BrickShapeManager {

    constructor() {
        // 빈 칸은 -로,
        // 벽돌이 있는 칸은 *로 표현
        this.brickShapes = [
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
    }

    copyRandomBrickShape() {
        var len = this.brickShapes.length;
        var i = Math.floor(Math.random() * len);
        var selectedBrickShape = this.brickShapes[i];

        len = selectedBrickShape.length;
        var brickData = new Array(len);
        for (i=0; i<len; i++) {
            brickData[i] = selectedBrickShape[i];
        }
        return brickData;
    }

    correctBrickShape() {
        for (var i=0; i<this.brickShapes.length; i++) {        
            // 단순 최소 크기로 보정 (이 방식은 문제있음)
            // blockShapes[i] = packBlockShape(blockShapes[i]);
            // 정사각 가운데로 보정 (packBlockShape을 개선한 방식)
            this.brickShapes[i] = this.squareCenterBlockShape(this.brickShapes[i]);
        }
    }


    // 정사각 가운데 형태로 보정
    squareCenterBlockShape(brickShape) {
        console.log("\n\n실행 전");
        for (var i=0; i<brickShape.length; i++) {
            console.log(brickShape[i]);
        }
        // min과 max를 구하고 반영
        // Brute Force 알고리즘
        var minJ, maxJ, minI, maxI;
        for (var i=0; i<brickShape.length; i++) {
            for (var j=0; j<brickShape[i].length; j++) {            
                if (brickShape[i][j]=="*"){
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

                if (brickShape[centeredI][centeredJ]=="*") {
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

    // 최소 모양으로
    packBlockShape(brickShape) {
        // console.log("\n\n실행 전");
        // for (var i=0; i<blockShape.length; i++) {
        //     console.log(blockShape);
        // }
        // min과 max를 구하고 반영
        // Brute Force 알고리즘
        var minJ, maxJ, minI, maxI;
        for (var i=0; i<brickShape.length; i++) {
            for (var j=0; j<brickShape[i].length; j++) {            
                if (brickShape[i][j]=="*"){
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
                if (brickShape[i][j]=="*") {
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
}