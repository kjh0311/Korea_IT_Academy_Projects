
class GameController {

    constructor() {
        // 이 파일에서 안 쓰고 다른 파일에서만 사용할 전역변수
        this.started = false;
        this.paused = false;
    }


    gameStarted() {
        return this.started;
    }

    gamePaused() {
        return this.paused;
    }


    gameStart() {
        // 캡슐화를 위한 형식적인 if문
        if (this.started == false) {            
            this.started = true;
            brickBoardController.createAndMoveDownBricks();
        }
    }

    gamePause() {
        if (this.paused == false) {
            this.paused = true;
            brickBoardController.stopBricks();            
        }        
    }

    gameResume() {
        if (this.paused) {            
            this.paused = false;
            brickBoardController.startMoveDownBricks();            
        }
    }


    gameStop() {
        // 캡슐화를 위한 형식적인 if문
        if (this.started) {
            // 모든 것을 초기화함            
            brickBoardController.clearBoardAndNext();
            this.started = false;
            this.paused = false;
        }
    }
}