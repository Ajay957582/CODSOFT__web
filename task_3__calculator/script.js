let str = "";
const input = document.querySelector("input");
function eventHandler(button) {
  button.addEventListener("click", function (event) {
    if (event.target.textContent === "=") {
      str = eval(str);
      input.value = str;
    } else if (event.target.textContent === "AC") {
      str = "";
      input.value = str;
    } else if (event.target.textContent === "C") {
      // console.log(str.);

      str = str
        .split("")
        .splice(0, str.length - 1)
        .join("");

      input.value = str;
    } else {
      str = str + event.target.textContent;
      input.value = str;
    }
  });
}

const buttons = document.querySelectorAll("button");
buttons.forEach(eventHandler);
