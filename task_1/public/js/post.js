const  imageButton = document.querySelector("#photo_button");
const img = document.querySelector("#imagelagao");
imageButton.onclick=()=>{
    const  url = document.querySelector("#img_url").value;
  img.setAttribute("src",url);
}
