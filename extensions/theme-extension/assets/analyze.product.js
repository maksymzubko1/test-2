document.addEventListener("DOMContentLoaded", (event) => {
    const location = window.location;
    if(location.hostname.includes('shopifypreview.com'))
        return;

    if(!shopId || !productId)
        return;

    // TODO: remove hardcode
    const URL = `https://german-motivation-consisting-neil.trycloudflare.com`;

    const addToCartForms = [...document.getElementsByTagName('form')]
        .filter(f=>f.action.includes('/cart/add'));

    const buyButton = document.getElementsByClassName('shopify-payment-button').item(0);

    fetch(`${URL}/api/analyze`, {
        method: 'POST',
        body: JSON.stringify({shop: shopId ?? "", itemId: productId ?? "", type: 'product', event: 'product_opened'}),
        headers: {'Content-Type':'application/json'},
    });

    if(addToCartForms && addToCartForms.length){
        addToCartForms.forEach(f=>{
            f.addEventListener('submit', () => {
                fetch(`${URL}/api/analyze`, {
                    method: 'POST',
                    body: JSON.stringify({shop: shopId ?? "", itemId: productId ?? "", type: 'product', event: 'product_added_to_cart'}),
                    headers: {'Content-Type':'application/json'},
                });
            })
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