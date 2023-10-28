const srol = function () {
  var sectionArray = document.querySelectorAll(".section");

  for (const element of sectionArray) {
    let contentPos = element.getBoundingClientRect().top;
    console.log(contentPos);
    // console.log(window.innerHeight);
    if (window.innerHeight - 200 > contentPos) {
      // content.classList.add("fade");
      element.classList.remove("fade");
    }
  }

  // var contentPosition = content.getBoundingClientRect().top;
  // //   console.log(content.getBoundingClientRect());
  // console.log(contentPosition);
  // // console.log(window.innerHeight);
  // if (window.innerHeight - 200 > contentPosition) {
  //   // content.classList.add("fade");
  //   content.classList.remove("fade");
  // }
};
window.addEventListener("scroll", srol);
