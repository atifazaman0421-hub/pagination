const form=document.getElementById("form")


form.addEventListener("submit",async(e)=>{
    e.preventDefault()
    const obj={
        email:e.target.email.value
    }
   try {
    const response=await axios.post(`https://surfer-leggings-lurch.ngrok-free.dev/user/password/forgotpassword`,obj)
    form.reset()
   } catch (error) {
    console.log(error)
   }
})