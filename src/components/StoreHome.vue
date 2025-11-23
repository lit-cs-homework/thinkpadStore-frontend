<template>
    <div class = "TitleBackground">
        <div class = "Logo">
            <img alt="Lenovo Logo" src="@/assets/logo.png">
            <span class="logo-text">联想商店</span>
        </div>
    </div>
    <div v-for="product in products" :key="product.id">
      <h2>{{ product.name }}</h2>
      <p>型号: {{ product.model }}</p>
      <p>价格: {{ product.price }}</p>
      <p>描述: {{ product.description }}</p>
      <p>库存: {{ product.stock }}</p>
      <img :src="product.image" alt="产品图片" class="product-image" />
    </div>
</template>
//

<script>
    import { ref,onMounted} from 'vue';

    export default{
        name:'StoreHome',
        setup()
        {
            const products = ref([]);

            const fetchData = async () => {
            try {
                const response = await fetch('http://ouc.it.srv.thinkpadstore.lighilit.top/product/');
                if (!response.ok) {
                    console.log(1)
                throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                console.log("数据输入", data);
                products.value = data;
            } catch (e) {
                console.error('Error fetching data:', e);
            }
            };
            console.log(products.value)

            onMounted(fetchData);
            return {products}
        }
    }
</script>

<style scoped>
    .TitleBackground {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 60px;
    background-color: #f8f8f8;
    z-index: 999;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    }

    .Logo {
    display: flex;
    align-items: center;
    }

    .Logo img {
    max-width: 100px;
    height: auto;
    margin-right: 10px;
    }

    .logo-text {
    font-size: 18px;
    font-weight: bold;
    color: #333;
    }

    .product-image {
        width: 100px;
        height: auto;
        margin: 10px 0;
    }

    @media (max-width: 768px) {
    .Logo {
        padding: 5px 10px; 
    }
    .Logo img {
        max-width: 80px;
        margin-right: 5px;
    }
    .logo-text {
        font-size: 16px;
        font-style: italic;
    }
}
    
</style>