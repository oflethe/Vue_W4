import { createApp } from 'https://cdnjs.cloudflare.com/ajax/libs/vue/3.0.9/vue.esm-browser.js';


const site ='https://vue3-course-api.hexschool.io/v2' ;


const app = createApp({

//登入資料
data(){
return{
    user: {
        username:'',
        password:'',
    }

}

},

methods: {
login() {
    const url =`${site}/admin/signin`;


//發送api
    axios.post(url, this.user)

//正確接收    
    .then(res => {
        const { token , expired } = res.data;
        console.log(token, expired);
        //將cookie儲存到hexToken名稱的token裡面
        document.cookie = `hexToken=${token}; expires=${new Date(expired)};`;
        //驗證成功則會自動跳轉至該頁面
        window.location = './products.html';
      


    })
//錯誤接收
    .catch((err) =>{
        console.log(err);
    } )

}

}




});

app.mount('#app');