class Tetris {
  constructor() {
      this.stageWidth = 10;
      this.stageHeight = 20;
      this.stageCanvas = document.getElementById("stage");
      this.nextCanvas = document.getElementById("next");
      let cellWidth = this.stageCanvas.width / this.stageWidth;
      let cellHeight = this.stageCanvas.height / this.stageHeight;
      this.cellSize = cellWidth < cellHeight ? cellWidth : cellHeight;
      this.stageLeftPadding = (this.stageCanvas.width - this.cellSize * this.stageWidth) / 2;
      this.stageTopPadding = (this.stageCanvas.height - this.cellSize * this.stageHeight) / 2;
      this.blocks = this.createBlocks();
      this.deletedLines = 0;

      // テンキーのによるテトリミノの操作
      window.onkeydown = (e) => {
          if (e.keyCode === 37) {
              this.moveLeft();
          } else if (e.keyCode === 38) {
              this.rotate();
          } else if (e.keyCode === 39) {
              this.moveRight();
          } else if (e.keyCode === 40) {
              this.fall();
          }
      }

      // 画面上のボタンによるテトリミノの操作
      document.getElementById("tetris-move-left-button").onmousedown = (e) => {
          this.moveLeft();
      }
      document.getElementById("tetris-rotate-button").onmousedown = (e) => {
          this.rotate();
      }
      document.getElementById("tetris-move-right-button").onmousedown = (e) => {
          this.moveRight();
      }
      document.getElementById("tetris-fall-button").onmousedown = (e) => {
          this.fall();
      }
  }
    
    // ゲームを開始. 仮想ステージを初期化し、現在のブロックと次のブロックを設定し、メインゲームループを開始.
    startGame() {
        let virtualStage = new Array(this.stageWidth);
        for (let i = 0; i < this.stageWidth; i++) {
            virtualStage[i] = new Array(this.stageHeight).fill(null);
        }
        this.virtualStage = virtualStage;
        this.currentBlock = null;
        this.nextBlock = this.getRandomBlock();
        this.mainLoop();
    }

    // ゲームのメインループを管理. 新しいブロックの生成、ブロックの落下、ステージの描画を行う. ゲームオーバーの条件をチェック.
    mainLoop() {
        if (this.currentBlock == null) {
            if (!this.createNewBlock()) {
                return;
            }
        } else {
            this.fallBlock();
        }
        this.drawStage();
        if (this.currentBlock != null) {
            this.drawBlock(this.stageLeftPadding + this.blockX * this.cellSize,
                this.stageTopPadding + this.blockY * this.cellSize,
                this.currentBlock, this.blockAngle, this.stageCanvas);
        }
        setTimeout(this.mainLoop.bind(this), 500);
    }

    // ランダムにブロックのタイプを選択
    getRandomBlock() {
        return  Math.floor(Math.random() * 7);
    }

    // 現在のブロックを1セル下に移動. 移動できない場合は、ブロックを固定.
    fallBlock() {
        if (this.checkBlockMove(this.blockX, this.blockY + 1, this.currentBlock, this.blockAngle)) {
            this.blockY++;
        } else {
            this.fixBlock(this.blockX, this.blockY, this.currentBlock, this.blockAngle);
            this.currentBlock = null;
        }
    }

    // 指定された位置、タイプ、角度でブロックを動かせるかどうかをチェック. 壁、床、他のブロックとの衝突を検出.
    checkBlockMove(x, y, type, angle) {
        for (let i = 0; i < this.blocks[type].shape[angle].length; i++) {
            let cellX = x + this.blocks[type].shape[angle][i][0];
            let cellY = y + this.blocks[type].shape[angle][i][1];
            if (cellX < 0 || cellX > this.stageWidth - 1) {
                return false;
            }
            if (cellY > this.stageHeight - 1) {
                return false;
            }
            if (this.virtualStage[cellX][cellY] != null) {
                return false;
            }
        }
        return true;
    }

    // 現在のブロックを仮想ステージに固定し、行が完全に埋まったかどうかをチェックして削除. 削除された行の数を更新.
    fixBlock(x, y, type, angle) {
        for (let i = 0; i < this.blocks[type].shape[angle].length; i++) {
            let cellX = x + this.blocks[type].shape[angle][i][0];
            let cellY = y + this.blocks[type].shape[angle][i][1];
            if (cellY >= 0) {
                this.virtualStage[cellX][cellY] = type;
            }
        }
        for (let y = this.stageHeight - 1; y >= 0; ) {
            let filled = true;
            for (let x = 0; x < this.stageWidth; x++) {
                if (this.virtualStage[x][y] == null) {
                    filled = false;
                    break;
                }
            }
            if (filled) {
                for (let y2 = y; y2 > 0; y2--) {
                    for (let x = 0; x < this.stageWidth; x++) {
                        this.virtualStage[x][y2] = this.virtualStage[x][y2 - 1];
                    }
                }
                for (let x = 0; x < this.stageWidth; x++) {
                    this.virtualStage[x][0] = null;
                }
            let linesElem = document.getElementById("lines");
                this.deletedLines++;
                linesElem.innerText = "" + this.deletedLines;
            } else {
                y--;
            }
        }
    }

    // ユーザーの操作に応じて、現在のブロックを動かす. それぞれの操作可能性をcheckBlockMoveメソッドでチェック.
    moveLeft() {
        if (this.checkBlockMove(this.blockX - 1, this.blockY, this.currentBlock, this.blockAngle)) {
            this.blockX--;
            this.refreshStage();
        }
    }

    moveRight() {
        if (this.checkBlockMove(this.blockX + 1, this.blockY, this.currentBlock, this.blockAngle)) {
            this.blockX++;
            this.refreshStage();
        }
    }

    rotate() {
        let newAngle;
        if (this.blockAngle < 3) {
            newAngle = this.blockAngle + 1;
        } else {
            newAngle = 0;
        }
        if (this.checkBlockMove(this.blockX, this.blockY, this.currentBlock, newAngle)) {
            this.blockAngle = newAngle;
            this.refreshStage();
        }
    }

    fall() {
        while (this.checkBlockMove(this.blockX, this.blockY + 1, this.currentBlock, this.blockAngle)) {
            this.blockY++;
            this.refreshStage();
        }
    }

    // ステージを更新. ステージをクリアし、現在のステージの状態を再描画.
    refreshStage() {
    this.clear(this.stageCanvas);
    this.drawStage();
    this.drawBlock(this.stageLeftPadding + this.blockX * this.cellSize,
                this.stageTopPadding + this.blockY * this.cellSize,
                this.currentBlock, this.blockAngle, this.stageCanvas);
    }

    // 指定されたキャンパスをクリアする. 黒で塗りつぶされる.
    clear(canvas) {
        let context = canvas.getContext("2d");
        context.fillStyle = "rgb(0, 0, 0)";
        context.fillRect(0, 0, canvas.width, canvas.height);
    }
}
