const  imageButton = document.querySelector("#imgButton");
const img = document.querySelector("#imagelagao");
imageButton.onclick=()=>{
    const  url = document.querySelector("#url").value;
  img.setAttribute("src",url);
}
