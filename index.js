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
}
