export default {
  props: ['product'],
  data(){
    return{
      bsModal: '',
      qty: 1,
    }
  },
  methods:{
    addToCart_Modal(product_id, qty){
      this.$emit('addToCart', product_id, qty);
      this.bsModal.hide();
      this.qty = 1;
    }
  },
  mounted(){
    this.bsModal = new bootstrap.Modal(this.$refs.modal);
  },
  template: '#userProductModal'
}