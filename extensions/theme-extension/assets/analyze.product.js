document.addEventListener("DOMContentLoaded", (event) => {
    const location = window.location;
    if(location.hostname.includes('shopifypreview.com'))
        return;

    // TODO: remove hardcode
    const URL = `https://universal-bridal-education-dv.trycloudflare.com`;

    const addToCartButton = document.getElementsByClassName('product-form__submit').item(0);
    const buyButton = document.getElementsByClassName('shopify-payment-button').item(0);

    fetch(`${URL}/api/analyze`, {
        method: 'POST',
        body: JSON.stringify({shop: shopId ?? "", itemId: productId ?? "", type: 'product', event: 'product_opened'}),
        headers: {'Content-Type':'application/json'},
    });

    if(addToCartButton){
        addToCartButton.addEventListener('click', () => {
            fetch(`${URL}/api/analyze`, {
                method: 'POST',
                body: JSON.stringify({shop: shopId ?? "", itemId: productId ?? "", type: 'product', event: 'product_added_to_cart'}),
                headers: {'Content-Type':'application/json'},
            });
        })
    }

    if(buyButton){
        buyButton.addEventListener('click', () => {
            fetch(`${URL}/api/analyze`, {
                method: 'POST',
                body: JSON.stringify({shop: shopId ?? "", itemId: productId ?? "", type: 'product', event: 'product_buy_button_pressed'}),
                headers: {'Content-Type':'application/json'},
            });
        })
    }
});