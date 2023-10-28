const content = document.querySelectorAll('.content');
content.forEach((e)=>{
const p = e.innerHTML;
const parray=p.split(" ");
const final=parray.slice(0,50).join(" ")+"....( click READ button for full blog)";
e.innerHTML=final;
})