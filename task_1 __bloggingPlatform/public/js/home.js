const searchbox = document.querySelector('#search');
const suggestion_body=document.querySelector('.internal');
searchbox.addEventListener('input', async() => {
  const query=searchbox.value;
  const response=await fetch(`/search?query=${query}`);
  const data=await response.json();
//   console.log(data);
 displaydata(data);
});

function displaydata(data) {
    suggestion_body.innerHTML="";
    data.forEach(element => {
      const div = document.createElement('div');
      div.classList.add('pankaj');
      div.addEventListener('click',()=>{
        searchbox.value=div.textContent;
        suggestion_body.innerHTML="";
      })
      div.textContent = element.f_title;
      suggestion_body.appendChild(div);
    });
  }


  const contact=document.querySelector('#contact');
  contact.onclick=(e)=>{
    e.preventDefault();
   const footer= document.querySelector('footer');
   footer.scrollIntoView({behavior:"smooth"});
  }