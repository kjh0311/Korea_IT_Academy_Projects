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
    // 게임이 시작되지 않은 경우
    else {
        // 엔터키인 경우        
        if (key == ENTER) {
            gameStated = true;
            gameStart();
        }
        // 가독성을 위해서 else if로 할 수 있는 것을 else와 if로 분리함
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