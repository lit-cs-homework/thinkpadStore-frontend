<template>
    <div class = "TitleBackground">
        <div class = "Logo">
            <img alt="Lenovo Logo" src="@/assets/logo.png">
            <span class="logo-text">联想商店</span>
        </div>
    </div>
</template>
//

<script>
    export default{
        name:'StoreHome',
        setup()
        {
            //console.log(computed(()=> import.meta.env.BASE_URL+'/assets/logo.png'))
            return {}
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