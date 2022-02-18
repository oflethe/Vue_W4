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
console.log(status, product );

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

     //問題點：有點不太確定是否是因為在html那邊撰寫的區塊因為js報錯，在物件屬性後方加上了?讓物件轉為undefined的狀況導致的 ，目前還不太了解為什麼沒有定義到該屬性，導致一開始跳出編輯視窗會有空白報錯，接著是沒有定義讓物件變成undefined狀態導致沒有辦法在編輯狀態新增圖片
     
    /*有跳出UNDEFINEDE錯誤，原因是因為沒有定義imagesUrl的屬性，導致系統讀取的時候發現沒有該屬性，因此跳出undefined錯誤，並且導致modal編輯產品視窗內的品項無法新增圖片，助教建議加上此行。
    此行為三元運算子，是［條件?(判斷) 值1:值2，若判斷為ture則傳回值1，否則回傳值2］
    理解的意思為 edit區域內的暫存區圖片如果確定為有值(ture)，則會回傳該屬性的原本值，否則會回傳定義他為一個陣列*/
   
    this.tempProducts.imagesUrl = this.tempProducts.imagesUrl ? this.tempProducts.imagesUrl : []
    productModal.show();
    this.isNew = false;
    
//判斷為刪除狀態
}else if (status === 'delete'){
    delProductModal.show();
    this.tempProducts = { ...product}; //把品項也帶過來，刪除的時候就可以在提示視窗中帶入產品名稱||先把指向該物件的，做JS淺拷貝(有些深層圖片或內容淺拷貝會受到影響)

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
      
        console.log(res);
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
props:['tempProducts'],
template: '#templateForProductModal',
methods:{
    updateProduct(){
        let url =`${site}/api/${api_path}/admin/product`;
        let method = 'post';
        if(!this.isNew){
            url = `${site}/api/${api_path}/admin/product/${this.tempProducts.id}`;
            method = 'put';

    axios [method](url,{data:this.tempProducts})
    .then ( res => {
        console.log(res);
        this.$emit('get-products')
        productModal.hide();
    });
        }
    },
}
})


app.mount('#app');