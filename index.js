const { createApp } = Vue;
import Pagination from './components/Pagination.js';
import userProductModal from './userProductModal.js';

//加入全部的驗證規則
Object.keys(VeeValidateRules).forEach(rule => {
  if (rule !== 'default') {
    VeeValidate.defineRule(rule, VeeValidateRules[rule]);
  }
});

// 讀取外部的資源
VeeValidateI18n.loadLocaleFromURL('./zh_TW.json');

// Activate the locale
VeeValidate.configure({
  generateMessage: VeeValidateI18n.localize('zh_TW'),
  validateOnInput: true, // 調整為：輸入文字時，就立即進行驗證
});

const app = createApp({
  components: { Pagination, userProductModal,},
  data() {
    return {
      url: 'https://vue3-course-api.hexschool.io/v2', // 請加入站點
      path: 'jasonfu-api-vuetest',// 請加入個人 API Path
      products: [], //產品內容
      productDetail: {},
      pagination: {}, //分頁
      cart: {
        carts:[]
      }, //購物車
      loadingStatus: {
        loadingItem: '',
      },
      loadingComponent: true,
      form:{
        user: { //顧客
          email: '',
          name: '',
          tel: '',
          address: '',
        },
        message: '',
      }
    }
  },
  methods: {
    renderProducts(page = 1) {  //call API get產品資訊  默認頁碼設為1 當頁碼資料被傳入時page會被改變
      axios.get(`${this.url}/api/${this.path}/products?page=${page}`)
        .then(res => {
          this.products = res.data.products;
          this.pagination = res.data.pagination;
          this.loadingComponent = false;
        })
        .catch(err => {
          alert(err.response.data.message);
        })
    },
    viewDetail(id){ //查看更多
      this.loadingStatus.loadingItem = id;
      this.$refs.productModal.qty = 1;
      const existingProduct = this.products.find(item => item.id === id)
      if(existingProduct){
        axios.get(`${this.url}/api/${this.path}/product/${id}`)
          .then(res => {
            this.productDetail = res.data.product;
            this.loadingStatus.loadingItem = '';
            this.$refs.productModal.bsModal.show()
          })
          .catch(err => {
            alert(err.response.data.message);
          })
      }
    },
    addToCart(product_id, qty = 1) { //加入購物車
      this.loadingStatus.loadingItem = product_id;
      const tempCart = {
        product_id,
        qty
      }
      axios.post(`${this.url}/api/${this.path}/cart`, { data: tempCart })
        .then(res => {
          alert(res.data.message);
          this.getCartList();
          this.loadingStatus.loadingItem = '';
        })
        .catch(err => {
          alert(err.response.data.message);
        })
    },
    getCartList() {  //取得購物車清單
      axios.get(`${this.url}/api/${this.path}/cart`)
        .then(res => {
          this.cart = res.data.data;
          console.log(this.cart);
        })
        .catch(err => {
          alert(err.response.data.message);
        })
    },
    updateQty(product_id, qty, id) {  //更改購買數量
      this.loadingStatus.loadingItem = id;
      const existingProduct = this.cart.carts.find(item => item.product_id === product_id)
      if(existingProduct){
        const tempCart = {
          product_id,
          qty
        }
        axios.put(`${this.url}/api/${this.path}/cart/${id}`, {data: tempCart})
          .then( res => {
            this.loadingStatus.loadingItem = '';
            alert(res.data.message);
            this.getCartList();
          })
          .catch(err =>{
            alert(err.response.data.message);
          })
      }
    },
    delProduct(id){  //刪除單一商品
      this.loadingStatus.loadingItem = id;
      const existingProduct = this.cart.carts.find(item => item.id === id)
      if(existingProduct){
        axios.delete(`${this.url}/api/${this.path}/cart/${id}`)
            .then( res => {
              alert(res.data.message);
              this.getCartList();
              this.loadingStatus.loadingItem = '';
            })
            .catch(err =>{
              alert(err.response.data.message);
            })
      }
    },
    delAll(){ // 刪除購物車內全部商品
      this.loadingComponent = true;
      axios.delete(`${this.url}/api/${this.path}/carts`)
            .then( res => {
              alert(res.data.message);
              this.getCartList();
              this.loadingComponent = false;
            })
            .catch(err =>{
              alert(err.response.data.message);
              this.loadingComponent = false;
            })
    },
    isPhone(value) { //驗證電話欄位自訂義規則
      const phoneNumber = /^(09)[0-9]{8}$/
      return phoneNumber.test(value) ? true : '需要正確的台灣電話號碼'
    },
    sendOrder(){  //送出訂單
      const Order = this.form;
      axios.post(`${this.url}/api/${this.path}/order`, {data: Order })
      .then( res => {
            this.getCartList();
            alert(res.data.message);
            this.$refs.form.resetForm();
          })
          .catch(err =>{
            alert(err.response.data.message);
          })
    }
  },
  mounted() {
    this.renderProducts();  //取得商品資料
    this.getCartList(); //取得購物車資料
    
  }
});


app.component('VForm', VeeValidate.Form);
app.component('VField', VeeValidate.Field);
app.component('ErrorMessage', VeeValidate.ErrorMessage);
app.component('loading', VueLoading.Component);
// app.use(VueLoading.LoadingPlugin);

app.mount('#app');