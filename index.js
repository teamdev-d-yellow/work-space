document.addEventListener("DOMContentLoaded", (event) => {
  const button = document.getElementById("alertButton");
  button.addEventListener("click", () => {
    alert("ボタンがタップされました！");
  });
});
