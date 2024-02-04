class Tetris {
  constructor() {
    this.stageWidth = 10;
    this.stageHeight = 20;
    this.stageCanvas = document.getElementById("stage");
    this.nextCanvas = document.getElementById("next");
    let cellWidth = this.stageCanvas.width / this.stageWidth;
    let cellHeight = this.stageCanvas.height / this.stageHeight;
    this.cellSize = cellWidth < cellHeight ? cellWidth : cellHeight;
    this.stageLeftPadding =
      (this.stageCanvas.width - this.cellSize * this.stageWidth) / 2;
    this.stageTopPadding =
      (this.stageCanvas.height - this.cellSize * this.stageHeight) / 2;
    this.blocks = this.createBlocks();
    this.deletedLines = 0;
    this.holdCanvas = document.getElementById("hold");
    this.holdBlock = null;
    this.canHold = true;
    this.dropSpeed = 700;
    this.mainLoopTimeout = null; // タイマーIDを格納するためのプロパティ
    this.isPaused = false;        // ゲームの一時停止状態を追跡するためのプロパティ
    


    // テンキーによるテトリミノの操作
    window.onkeydown = (e) => {
      if (e.keyCode === 37) {
        this.moveLeft();
      } else if (e.keyCode === 38) {
        this.rotate();
      } else if (e.keyCode === 39) {
        this.moveRight();
      } else if (e.keyCode === 40) {
        this.fall();
      } else if (e.keyCode === 32) {
        // スペースボタン
        this.hold();
      }
    };

    // 画面上のボタンによるテトリミノの操作
    document.getElementById("tetris-move-left-button").onmousedown = (e) => {
      this.moveLeft();
    };
    document.getElementById("tetris-rotate-button").onmousedown = (e) => {
      this.rotate();
    };
    document.getElementById("tetris-move-right-button").onmousedown = (e) => {
      this.moveRight();
    };
    document.getElementById("tetris-fall-button").onmousedown = (e) => {
      this.fall();
    };
    document.getElementById("tetris-hold-button").onmousedown = (e) => {
      this.hold();
    };
    document.getElementById("tetris-retry-button").onclick = (e) => {
      this.retryGame();
    };
    document.getElementById("tetris-pause-button").onclick = (e) => {
      this.pauseGame();
    };
    document.getElementById("tetris-resume-button").onclick = (e) => {
      this.resumeGame();
    };
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
      this.drawBlock(
        this.stageLeftPadding + this.blockX * this.cellSize,
        this.stageTopPadding + this.blockY * this.cellSize,
        this.currentBlock,
        this.blockAngle,
        this.stageCanvas
      );
    }
    this.mainLoopTimeout = setTimeout(this.mainLoop.bind(this), this.dropSpeed);
  }

  // ランダムにブロックのタイプを選択
  getRandomBlock() {
    return Math.floor(Math.random() * 7);
  }

  // 現在のブロックを1セル下に移動. 移動できない場合は、ブロックを固定.
  fallBlock() {
    if (
      this.checkBlockMove(
        this.blockX,
        this.blockY + 1,
        this.currentBlock,
        this.blockAngle
      )
    ) {
      this.blockY++;
    } else {
      this.fixBlock(
        this.blockX,
        this.blockY,
        this.currentBlock,
        this.blockAngle
      );
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
        linesElem.innerText = "" + this.deletedLines * 100;
        // 行が削除されたら速度を更新
        this.changeDropSpeedDependOnDeletedLines();
      } else {
        y--;
      }
    }
  }

  // ユーザーの操作に応じて、現在のブロックを動かす. それぞれの操作可能性をcheckBlockMoveメソッドでチェック.
  moveLeft() {
    if (!this.isPaused) {  // ゲームが一時停止中でない場合のみ処理
      if (
        this.checkBlockMove(
          this.blockX - 1,
          this.blockY,
          this.currentBlock,
          this.blockAngle
        )
      ) {
        this.blockX--;
        this.refreshStage();
      }
    }
  }

  moveRight() {
    if (!this.isPaused) {  // ゲームが一時停止中でない場合のみ処理
      if (
        this.checkBlockMove(
          this.blockX + 1,
          this.blockY,
          this.currentBlock,
          this.blockAngle
        )
      ) {
        this.blockX++;
        this.refreshStage();
      }
    }
  }

  rotate() {
    if (!this.isPaused) {  // ゲームが一時停止中でない場合のみ処理
      let newAngle;
      if (this.blockAngle < 3) {
        // this.blockAngle == 回転角度
        newAngle = this.blockAngle + 1;
      } else {
        newAngle = 0;
      }
      if (
        this.checkBlockMove(this.blockX, this.blockY, this.currentBlock, newAngle)
      ) {
        this.blockAngle = newAngle;
        this.refreshStage();
      }
    }
  }

  fall() {
    if (!this.isPaused) {  // ゲームが一時停止中でない場合のみ処理
      while (
        this.checkBlockMove(
          this.blockX,
          this.blockY + 1,
          this.currentBlock,
          this.blockAngle
        )
      ) {
        this.blockY++;
        this.refreshStage();
      }
    }
  }

  // ステージを更新. ステージをクリアし、現在のステージの状態を再描画.
  refreshStage() {
    this.clear(this.stageCanvas);
    this.drawStage();
    this.drawBlock(
      this.stageLeftPadding + this.blockX * this.cellSize,
      this.stageTopPadding + this.blockY * this.cellSize,
      this.currentBlock,
      this.blockAngle,
      this.stageCanvas
    );
  }

  // 指定されたキャンパスをクリアする. 黒で塗りつぶされる.
  clear(canvas) {
    let context = canvas.getContext("2d");
    context.fillStyle = "rgb(0, 0, 0)";
    context.fillRect(0, 0, canvas.width, canvas.height);
  }

  // テトリスブロックの設定を生成
  createBlocks() {
    let blocks = [
      {
        shape: [
          [
            [-1, 0],
            [0, 0],
            [1, 0],
            [2, 0],
          ],
          [
            [0, -1],
            [0, 0],
            [0, 1],
            [0, 2],
          ],
          [
            [-1, 0],
            [0, 0],
            [1, 0],
            [2, 0],
          ],
          [
            [0, -1],
            [0, 0],
            [0, 1],
            [0, 2],
          ],
        ],
        color: "rgb(0, 255, 255)",
        highlight: "rgb(255, 255, 255)",
        shadow: "rgb(0, 128, 128)",
      },
      {
        shape: [
          [
            [0, 0],
            [1, 0],
            [0, 1],
            [1, 1],
          ],
          [
            [0, 0],
            [1, 0],
            [0, 1],
            [1, 1],
          ],
          [
            [0, 0],
            [1, 0],
            [0, 1],
            [1, 1],
          ],
          [
            [0, 0],
            [1, 0],
            [0, 1],
            [1, 1],
          ],
        ],
        color: "rgb(255, 255, 0)",
        highlight: "rgb(255, 255, 255)",
        shadow: "rgb(128, 128, 0)",
      },
      {
        shape: [
          [
            [0, 0],
            [1, 0],
            [-1, 1],
            [0, 1],
          ],
          [
            [-1, -1],
            [-1, 0],
            [0, 0],
            [0, 1],
          ],
          [
            [0, 0],
            [1, 0],
            [-1, 1],
            [0, 1],
          ],
          [
            [-1, -1],
            [-1, 0],
            [0, 0],
            [0, 1],
          ],
        ],
        color: "rgb(0, 255, 0)",
        highlight: "rgb(255, 255, 255)",
        shadow: "rgb(0, 128, 0)",
      },
      {
        shape: [
          [
            [-1, 0],
            [0, 0],
            [0, 1],
            [1, 1],
          ],
          [
            [0, -1],
            [-1, 0],
            [0, 0],
            [-1, 1],
          ],
          [
            [-1, 0],
            [0, 0],
            [0, 1],
            [1, 1],
          ],
          [
            [0, -1],
            [-1, 0],
            [0, 0],
            [-1, 1],
          ],
        ],
        color: "rgb(255, 0, 0)",
        highlight: "rgb(255, 255, 255)",
        shadow: "rgb(128, 0, 0)",
      },
      {
        shape: [
          [
            [-1, -1],
            [-1, 0],
            [0, 0],
            [1, 0],
          ],
          [
            [0, -1],
            [1, -1],
            [0, 0],
            [0, 1],
          ],
          [
            [-1, 0],
            [0, 0],
            [1, 0],
            [1, 1],
          ],
          [
            [0, -1],
            [0, 0],
            [-1, 1],
            [0, 1],
          ],
        ],
        color: "rgb(0, 0, 255)",
        highlight: "rgb(255, 255, 255)",
        shadow: "rgb(0, 0, 128)",
      },
      {
        shape: [
          [
            [1, -1],
            [-1, 0],
            [0, 0],
            [1, 0],
          ],
          [
            [0, -1],
            [0, 0],
            [0, 1],
            [1, 1],
          ],
          [
            [-1, 0],
            [0, 0],
            [1, 0],
            [-1, 1],
          ],
          [
            [-1, -1],
            [0, -1],
            [0, 0],
            [0, 1],
          ],
        ],
        color: "rgb(255, 165, 0)",
        highlight: "rgb(255, 255, 255)",
        shadow: "rgb(128, 82, 0)",
      },
      {
        shape: [
          [
            [0, -1],
            [-1, 0],
            [0, 0],
            [1, 0],
          ],
          [
            [0, -1],
            [0, 0],
            [1, 0],
            [0, 1],
          ],
          [
            [-1, 0],
            [0, 0],
            [1, 0],
            [0, 1],
          ],
          [
            [0, -1],
            [-1, 0],
            [0, 0],
            [0, 1],
          ],
        ],
        color: "rgb(255, 0, 255)",
        highlight: "rgb(255, 255, 255)",
        shadow: "rgb(128, 0, 128)",
      },
    ];
    return blocks;
  }

  // ブロックを描画
  drawBlock(x, y, type, angle, canvas) {
    let context = canvas.getContext("2d");
    let block = this.blocks[type];
    for (let i = 0; i < block.shape[angle].length; i++) {
      this.drawCell(
        context,
        x + block.shape[angle][i][0] * this.cellSize,
        y + block.shape[angle][i][1] * this.cellSize,
        this.cellSize,
        type
      );
    }
  }
  // セルを描画
  drawCell(context, cellX, cellY, cellSize, type) {
    let block = this.blocks[type];
    let adjustedX = cellX + 0.5;
    let adjustedY = cellY + 0.5;
    let adjustedSize = cellSize - 1;
    context.fillStyle = block.color;
    context.fillRect(adjustedX, adjustedY, adjustedSize, adjustedSize);
    context.strokeStyle = block.highlight;
    context.beginPath();
    context.moveTo(adjustedX, adjustedY + adjustedSize);
    context.lineTo(adjustedX, adjustedY);
    context.lineTo(adjustedX + adjustedSize, adjustedY);
    context.stroke();
    context.strokeStyle = block.shadow;
    context.beginPath();
    context.moveTo(adjustedX, adjustedY + adjustedSize);
    context.lineTo(adjustedX + adjustedSize, adjustedY + adjustedSize);
    context.lineTo(adjustedX + adjustedSize, adjustedY);
    context.stroke();
  }
  // 新しいテトリスブロックを作成
  createNewBlock() {
    this.currentBlock = this.nextBlock;
    this.nextBlock = this.getRandomBlock();
    this.blockX = Math.floor(this.stageWidth / 2 - 2);
    this.blockY = 0;
    this.blockAngle = 0;
    this.drawNextBlock();
    if (
      !this.checkBlockMove(
        this.blockX,
        this.blockY,
        this.currentBlock,
        this.blockAngle
      )
    ) {
      let messageElem = document.getElementById("message");
      messageElem.innerText = "GAME OVER";
      return false;
    }
    this.canHold = true;
    return true;
  }
  // 次のブロックを描画
  drawNextBlock() {
    this.clear(this.nextCanvas);
    this.drawBlock(
      this.cellSize * 2,
      this.cellSize,
      this.nextBlock,
      0,
      this.nextCanvas
    );
  }
  // ステージ全体を描画
  drawStage() {
    this.clear(this.stageCanvas);

    let context = this.stageCanvas.getContext("2d");
    for (let x = 0; x < this.virtualStage.length; x++) {
      for (let y = 0; y < this.virtualStage[x].length; y++) {
        if (this.virtualStage[x][y] != null) {
          this.drawCell(
            context,
            this.stageLeftPadding + x * this.cellSize,
            this.stageTopPadding + y * this.cellSize,
            this.cellSize,
            this.virtualStage[x][y]
          );
        }
      }
    }
  }

  // テトリミノの保存と交換
  hold() {
    if (!this.isPaused) {  // ゲームが一時停止中でない場合のみ処理
      if (this.canHold) {
        // 保存中が空でない場合は、現在のテトリミノと交換
        if (this.holdBlock !== null) {
          // ブロックを交換できるかチェック。壁、床、他のブロックとの衝突を検出。
          if(this.checkBlockMove(this.blockX, this.blockY, this.holdBlock, this.blockAngle)){
            const temp = this.holdBlock;
            this.holdBlock = this.currentBlock;
            this.currentBlock = temp;
            this.blockX; // 0にすると初期位置に交換後ブロックが出現
            this.blockY; // 0にすると初期位置に交換後ブロックが出現
            this.blockAngle;
          }
        } else {
          // 保存中が空の場合は、現在のテトリミノを保存
          this.holdBlock = this.currentBlock;
          this.currentBlock = null;
          this.createNewBlock();
        }

        this.canHold = true; // falseにすると交換は一度しかできなくなる trueは何度でも可能
        this.drawHoldBlock();
        this.refreshStage();
      }
    }
  }

  // 保存中にあるテトリミノを描画
  drawHoldBlock() {
    this.clear(this.holdCanvas);
    if (this.holdBlock !== null) {
      this.drawBlock(
        this.cellSize * 2,
        this.cellSize,
        this.holdBlock,
        0,
        this.holdCanvas
      );
    }
  }

  // スコアに応じてテトリミノの落ちるスピードを変える
  changeDropSpeedDependOnDeletedLines() {
    switch (this.deletedLines) {
      case 3:
        this.dropSpeed = 500;
        break;
      case 5:
        this.dropSpeed = 300;
        break;
      case 7:
        this.dropSpeed = 100;
        break;
    }
  }

  // テトリスゲームの状態を初期化
  retryGame() {
    this.clear(this.holdCanvas);
    this.holdBlock = null;
    this.deletedLines = 0;
    this.dropSpeed = 700;
    this.blockY = 0;
    this.currentBlock = null;
    let linesElem = document.getElementById("lines");
    linesElem.innerText = "0";
    let messageElem = document.getElementById("message");
    messageElem.innerText = "";
    // 現在実行中のmainLoopをキャンセル
    if (this.mainLoopTimeout !== null) {
      clearTimeout(this.mainLoopTimeout);
      this.mainLoopTimeout = null;
    }
    // ゲームを再開
    this.startGame();
  }

  // ゲームの一時停止
  pauseGame() {
    if (!this.isPaused) {
      this.isPaused = true;
      // 現在実行中のmainLoopをキャンセル
      if (this.mainLoopTimeout !== null) {
        clearTimeout(this.mainLoopTimeout);
        this.mainLoopTimeout = null;
      }
      // 一時停止メッセージを表示
      let messageElem = document.getElementById("current-tetris-state");
      messageElem.innerText = "PAUSED";
    }
  }

  // ゲームの再開
  resumeGame() {
    if (this.isPaused) {
      this.isPaused = false;
      let messageElem = document.getElementById("current-tetris-state");
      messageElem.innerText = "";
      this.mainLoop();
    }
  }
}
