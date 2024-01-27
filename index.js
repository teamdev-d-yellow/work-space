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
  // テトリスブロックの設定を生成
  createBlocks() {
      let blocks = [
          {
              shape: [[[-1, 0], [0, 0], [1, 0], [2, 0]],
                      [[0, -1], [0, 0], [0, 1], [0, 2]],
                      [[-1, 0], [0, 0], [1, 0], [2, 0]],
                      [[0, -1], [0, 0], [0, 1], [0, 2]]],
              color: "rgb(0, 255, 255)",
              highlight: "rgb(255, 255, 255)",
              shadow: "rgb(0, 128, 128)"
          },
          {
              shape: [[[0, 0], [1, 0], [0, 1], [1, 1]],
                      [[0, 0], [1, 0], [0, 1], [1, 1]],
                      [[0, 0], [1, 0], [0, 1], [1, 1]],
                      [[0, 0], [1, 0], [0, 1], [1, 1]]],
              color: "rgb(255, 255, 0)",
              highlight: "rgb(255, 255, 255)",
              shadow: "rgb(128, 128, 0)"
          },
          {
              shape: [[[0, 0], [1, 0], [-1, 1], [0, 1]],
                      [[-1, -1], [-1, 0], [0, 0], [0, 1]],
                      [[0, 0], [1, 0], [-1, 1], [0, 1]],
                      [[-1, -1], [-1, 0], [0, 0], [0, 1]]],
              color: "rgb(0, 255, 0)",
              highlight: "rgb(255, 255, 255)",
              shadow: "rgb(0, 128, 0)"
          },
          {
              shape: [[[-1, 0], [0, 0], [0, 1], [1, 1]],
                      [[0, -1], [-1, 0], [0, 0], [-1, 1]],
                      [[-1, 0], [0, 0], [0, 1], [1, 1]],
                      [[0, -1], [-1, 0], [0, 0], [-1, 1]]],
              color: "rgb(255, 0, 0)",
              highlight: "rgb(255, 255, 255)",
              shadow: "rgb(128, 0, 0)"
          },
          {
              shape: [[[-1, -1], [-1, 0], [0, 0], [1, 0]],
                      [[0, -1], [1, -1], [0, 0], [0, 1]],
                      [[-1, 0], [0, 0], [1, 0], [1, 1]],
                      [[0, -1], [0, 0], [-1, 1], [0, 1]]],
              color: "rgb(0, 0, 255)",
              highlight: "rgb(255, 255, 255)",
              shadow: "rgb(0, 0, 128)"
          },
          {
              shape: [[[1, -1], [-1, 0], [0, 0], [1, 0]],
                      [[0, -1], [0, 0], [0, 1], [1, 1]],
                      [[-1, 0], [0, 0], [1, 0], [-1, 1]],
                      [[-1, -1], [0, -1], [0, 0], [0, 1]]],
              color: "rgb(255, 165, 0)",
              highlight: "rgb(255, 255, 255)",
              shadow: "rgb(128, 82, 0)"
          },
          {
              shape: [[[0, -1], [-1, 0], [0, 0], [1, 0]],
                      [[0, -1], [0, 0], [1, 0], [0, 1]],
                      [[-1, 0], [0, 0], [1, 0], [0, 1]],
                      [[0, -1], [-1, 0], [0, 0], [0, 1]]],
              color: "rgb(255, 0, 255)",
              highlight: "rgb(255, 255, 255)",
              shadow: "rgb(128, 0, 128)"
          }
      ];
      return blocks;
  }
  // ブロックを描画
  drawBlock(x, y, type, angle, canvas) {
      let context = canvas.getContext("2d");
      let block = this.blocks[type];
      for (let i = 0; i < block.shape[angle].length; i++) {
          this.drawCell(context,
                  x + (block.shape[angle][i][0] * this.cellSize),
                  y + (block.shape[angle][i][1] * this.cellSize),
                  this.cellSize,
                  type);
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
      if (!this.checkBlockMove(this.blockX, this.blockY, this.currentBlock, this.blockAngle)) {
          let messageElem = document.getElementById("message");
          messageElem.innerText = "GAME OVER";
          return false;
      }
      return true;
  }
  // 次のブロックを描画
  drawNextBlock() {
      this.clear(this.nextCanvas);
      this.drawBlock(this.cellSize * 2, this.cellSize, this.nextBlock,
          0, this.nextCanvas);
  }
  // ステージ全体を描画
  drawStage() {
      this.clear(this.stageCanvas);

      let context = this.stageCanvas.getContext("2d");
      for (let x = 0; x < this.virtualStage.length; x++) {
          for (let y = 0; y < this.virtualStage[x].length; y++) {
              if (this.virtualStage[x][y] != null) {
                  this.drawCell(context,
                      this.stageLeftPadding + (x * this.cellSize),
                      this.stageTopPadding + (y * this.cellSize),
                      this.cellSize,
                      this.virtualStage[x][y]);
              }
          }
      }
  }
}