class BoardInfo {
    constructor() {
        this.innerRows = 20;
        this.upperRows = 4; // 상단 측면을 초과하는 벽돌을 담는 공간
        this.rows = this.innerRows + this.upperRows;
        this.cols = 10;
    }
}