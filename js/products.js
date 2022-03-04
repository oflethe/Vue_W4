import { createApp } from 'https://cdnjs.cloudflare.com/ajax/libs/vue/3.0.9/vue.esm-browser.js';
import pagination from './pagination.js';


const site ='https://vue3-course-api.hexschool.io/v2' ;
const api_path = 'oflethe';

let productModal = {};
let delProductModal={};


const app = createApp({

    //區域註冊
components: {
    pagination
},

data(){
return{

   products : [],
   
   //點選查看細節時將產品暫存到此
   tempProducts : {
       imagesUrl:[],
    },

   isNew: false,//新增一個變數判斷是否為新增產品，若是新增就跳到新增產品的方法，否則則就跳另一個方法
   pagination: {},
     }

},

methods: {

//登入驗證
checkLogin() {
        //自定義Token取出來到token
        const token = document.cookie.replace(/(?:(?:^|.*;\s*)hexToken\s*\=\s*([^;]*).*$)|^.*$/, "$1");
        //每次發送請求都自動把token加到這裡面
        //defaults如果刪掉的話每次都需要重新帶，不會自動全部發送
        axios.defaults.headers.common['Authorization'] = token;
        console.log(token);
    
        const url =`${site}/api/user/check`;
        //發送api
        axios.post(url)
        //正確
        .then ( () => {
            this.getProducts();
        });
    

},

//左方列表取出
getProducts(page = 1) {//參數預設值

const url = `${site}/api/${api_path}/admin/products/?page=${page}`;
axios.get(url)
    .then( res=> {
        this.products = res.data.products;
        this.pagination = res.data.pagination;

        
    });
   
},
// 這裡是打開modal的功能，依照狀態(新增或是編輯原有產品)，另外再判斷是否有帶入當前產品去判斷是新增產品還是編輯原有產品或是刪除產品
openModal(status, product){


if (status === 'isNew'){
//由於是新增的狀態，因此設定此處的tempProducts圖片是一個空陣列
this.tempProducts = {
    imagesUrl: [],
}
productModal.show();
this.isNew =true; 

//判斷為編輯狀態
}else if (status === 'edit'){
    this.tempProducts = { ...product }; 
    //先把指向該物件的，做JS淺拷貝(有些深層圖片或內容淺拷貝會受到影響)
   
    this.tempProducts.imagesUrl = this.tempProducts.imagesUrl ? this.tempProducts.imagesUrl : []
    productModal.show();
    this.isNew = false;
    
//判斷為刪除狀態
}else if (status === 'delete'){
    delProductModal.show();
    this.tempProducts = { ...product}; //把品項也帶過來，刪除的時候就可以在提示視窗中帶入產品名稱||

}



},


updateProduct(){
//新增產品使用post的方法   
let url = `${site}/api/${api_path}/admin/product`;
let method = 'post';

//修改編輯若非為新增產品的話,就將上面兩行連結與方法給替換掉
//有加驚嘆號為反轉，因此這裡是false所以是非新增產品的意思
if (!this.isNew){//跟73~83行呼應

    //編輯產品使用put的方法這裡不用再使用let
    url = `${site}/api/${api_path}/admin/product/${this.tempProducts.id}`;
    method = 'put';

}

//method使用中括號帶變數的方式，讓方法可以根據條件判斷去變更看是要使用新增的post還是編輯的put方法
axios[method](url, { data: this.tempProducts})
    .then( res=> {
      
        
        this.getProducts();
        productModal.hide();
    });

},

delProduct (){//刪除不用帶上任何參數
    let url = `${site}/api/${api_path}/admin/product/${this.tempProducts.id}`;
    
    axios.delete(url)
        .then( res=> {
          
            console.log(res);
            this.getProducts();
            delProductModal.hide();
        });
    


}

},

mounted() {
this.checkLogin();
  
productModal = new bootstrap.Modal(document.getElementById('productModal') );

delProductModal = new bootstrap.Modal(document.getElementById('delProductModal') );


}


});

app.component ('productModal',{
props:['tempProducts','isNew'],
template: '#templateForProductModal',

data(){
    return{
        apiUrl:  'https://vue3-course-api.hexschool.io/v2',
        apiPath: 'oflethe',



    }
},

methods:{
    updateProduct(){
        let url =`${this.apiUrl}/api/${this.apiPath}/admin/product`;
        let method = 'post';
      
        if(!this.isNew){//如果不是新增就替換url跟method
            url = `${this.apiUrl}/api/${this.apiPath}/admin/product/${this.tempProducts.id}`;
            method = 'put';}

    axios [method](url,{data:this.tempProducts})
    .then ( res => {
        //顯示已建立產品
        alert(res.data.message);
        //重新取的新資料並渲染
        this.$emit('get-products')
        productModal.hide();
    })
    .catch((err)=> {
        alert(err.data.message);
    })
        },
    },

})


app.mount('#app');