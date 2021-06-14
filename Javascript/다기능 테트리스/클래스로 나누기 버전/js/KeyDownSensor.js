class KeyDownSensor {
    onKeyDown(event) {
        const ENTER = 13, SPACE_BAR = 32, ESC = 27,
            LEFT = 37, UP = 38, RIGHT = 39, DOWN = 40;
        switch (event.keyCode) {
            case ENTER:
            case SPACE_BAR:
                return this.onEnterSpaceKeyDown(event.keyCode);
            case ESC:
                return this.onEscKeyDown();
            case LEFT:
            case UP:
            case RIGHT:
            case DOWN:
                return this.onArrowKeyDown(event.keyCode);
        }
    }
    /*
    엔터키:
    1. 게임이 시작되지 않은 경우에는 게임을 시작함
    2. 게임이 시작된 경우, 일시정지 중이 아니면 일시정지함
    3. 일시정지 중이면 재개함
    */
    onEnterSpaceKeyDown(key) {
        const ENTER = 13, SPACE_BAR = 32;

        if (gameController.gameStarted()) {
            if (gameController.gamePaused()) {
                gameController.gameResume();
            }
            else {
                gameController.gamePause();
            }
        }
        else { // 게임이 시작되지 않은 경우
            if (key == ENTER) { // 엔터키인 경우
                gameController.gameStart();
            }            
        }
        // 가독성을 위해서 else if로 할 수 있는 것을 else와 if로 분리함
    }

    onEscKeyDown() {
        // 떠넘기니까 간결해진 듯
        gameController.gameStop();
    }

    onArrowKeyDown(key) {
        // 게임이 시작되고, 멈춰있지 않을 때만 키 입력을
        // boardBrickController에 넘김
        if (gameController.gameStarted() &&
            !gameController.gamePaused())
        {
            brickBoardController.onArrowKeyDown(key);
        }
    }
}