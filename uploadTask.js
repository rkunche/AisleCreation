
var ul;
var li_items;
var imageNumber = 5;
var imageWidth = 300;
var prev, next;
var currentPostion = 0;
var currentImage = 0;
var selected = [];
var aisles = [];
var clearAisleState;
//prototype for clear the array values.
Array.prototype.clear = function() {
    this.length = 0;
};
var offsetval;
var products = [];
var aisleProducts = [];

var randomize;

var selectedProducts = [];

var tag_one;
var tag_two;
var tag_three;
var queryStringArray = [];
var queryString;
var loopCount = 0;

function getCrawledProducts(tag, pTypeTag, filterTag, offset, limit, productState, clearAisle) {
    queryStringArray.clear();
    tag_one = tag;
    tag_two = pTypeTag;
    tag_three = filterTag;
    loopCount = 0;
    queryString = null;

    clearAisleState = clearAisle;
    offsetval = offset;
    var isProductSliderReloaded;

    if (pTypeTag === null && filterTag === null) {
        randomize = true;
    } else {
        randomize = false;
    }
    var url;
    if (randomize) {
        //only one primay tag request set randomize to true.
        url = "https://vue-server-dev.appspot.com/api/product/search/genericsearch?queryString=" + tag + "&offset=" + offset + "&limit=" + limit + "&randomize=true";
    } else {
        queryStringMappingPool();
        queryString = queryStringArray[0];
        var offset = getRandomInt();
        url = "https://vue-server-dev.appspot.com/api/product/search/genericsearch?queryString=" + queryString + "&offset=" + offset + "&limit=" + limit + "&randomize=false";

    }
    getProductsCall(url);
}
//ajax call to server to fetch products.
function getProductsCall(url) {
    console.log("REQUESTED URL: " + url);
    if (XMLHttpRequest)
    {
        request = new XMLHttpRequest();
        if ("withCredentials" in request)
        {
            // Firefox 3.5 and Safari 4
            request.open('GET', url, true);
            request.onreadystatechange = getHandler;
            request.send();
        }
    }
}
//get result handler
function getHandler() {
    if (request.readyState !== 4)
        return;
    if (request.status === 200)
    {

        var jsonResponse = JSON.parse(request.responseText);
        if (jsonResponse.length < 3) {
            console.log("RESPONSE COUNT: " + jsonResponse.length);
            if (loopCount < queryStringArray.length && randomize === false) {
                //if response is less than three try with other quers strings.
                getNewQueryString();
            }
        }
        //alert('HTTP GET success: ' +jsonResponse.length  );
        //clear the old data in array and populate with new product data.
        //products.clear();

        if (request.responseText.length < 3) {
            //alert("No products was found with this tag");
            return;
        }

        if (offsetval === '0' || offsetval === 0) {
            products.clear();

            isProductSliderReloaded = false;
            if (clearAisleState) {
                aisleProducts.clear();
                var aisleHolder = document.getElementById('aisle_holder_id');
                var productsCount = document.getElementById('products_id');
                aisleHolder.innerHTML = "";
                productsCount.innerHTML = "Selected Products: 0";
                var imag = document.createElement("img");
                imag.src = "images/aislebg.jpg";
                var aisleSubmitButton = document.getElementById('submit_button');
                aisleSubmitButton.style.backgroundColor = "white";
                aisleSubmitButton.style.color = "gray";
                aisleSubmitButton.style.outline = "solid gray";
                var productsCount = document.getElementById('products_id');
                productsCount.style.color = "Black";

                aisleHolder.appendChild(imag);
                aisleSldierReload();
            }
        }
        for (var i = 0; i < jsonResponse.length; i++) {
            var jsonTempObject = jsonResponse[i];
            // if (jsonTempObject.currentProductState === "CURATED" || jsonTempObject.currentProductState === "CURATED_AND_VERIFIED") {
            var productObject = {id: jsonTempObject.id, ownerAisleId: jsonTempObject.ownerAisleId, ownerProductListId: jsonTempObject.ownerProductListId,
                creatorId: jsonTempObject.creatorId, curatorId: jsonTempObject.curatorId, title: jsonTempObject.title, description: jsonTempObject.description,
                currentProductState: jsonTempObject.currentProductState, relatedProductIds: jsonTempObject.relatedProductIds, productImages: jsonTempObject.productImages,
                productProviders: jsonTempObject.productProviders, comments: jsonTempObject.comments, productTags: jsonTempObject.productTags, ratings: jsonTempObject.ratings
            };
            try {
                //dont add product to aisle if provider or image not there in product
                var url = productObject.productImages[0].externalURL;
                var store = productObject.productProviders[0].store;
            } catch (e) {
                continue;
            }
            //remove product in product image starts normal text.
            var startString = productObject.productImages[0].externalURL;
            startString = startString.substr(0, 4);
            if (startString !== "http") {
                continue;
            }
            if (productObject.currentProductState !== "ARCHIVED") {
                var matched = false;
                 for(var j=0;j<products.length;j++){
                     var id = products[j].id;
                     if(id === productObject.id){
                         matched = true;
                         break;
                     }
                 }
                 //make sure that no duplicate products are added.
              if(!matched)
                products.push(productObject);
            } else {
                console.log("ARCHIVED PRODUCT FILTERED HERE");
            }
            // }
        }

        // prepare();
        showProductsBxSlider();
    }
    if (request.status != 200 && request.status != 304) {
        alert('HTTP GET error ' + request.status);
        return;
    }
}
/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt() {
    var min = 1;
    var max = 10;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function fetchMore() {
    offsetval = 'NOT ZERO';
    loopCount = 0;
    var url;
    if (randomize) {
        offset = offset + limit;
        url = "https://vue-server-dev.appspot.com/api/product/search/genericsearch?queryString=" + tag_one + "&offset=" + offset + "&limit=" + limit + "&randomize=true";
    } else {
        offset = offset + limit;
        url = "https://vue-server-dev.appspot.com/api/product/search/genericsearch?queryString=" + queryString + "&offset=" + offset + "&limit=" + limit + "&randomize=false";
    }
    getProductsCall(url);
}

function getNewQueryString() {
    offsetval = 'NOT ZERO';
    var index = queryStringArray.indexOf(queryString);
    if (index === -1) {
        queryString = queryStringArray[0];
    } else {
        for (var j = 0; j < queryStringArray.length; j++) {
            if (queryStringArray[j] !== queryString && j > index) {
                queryString = queryStringArray[j];
                break;
            }
        }
    }
    console.log("queryString is: " + queryString);
    offset = getRandomInt();
    var url = "https://vue-server-dev.appspot.com/api/product/search/genericsearch?queryString=" + queryString + "&offset=" + offset + "&limit=" + limit + "&randomize=false";

    loopCount++;
    getProductsCall(url);
}
//Load all possible queryString values into Array
function queryStringMappingPool() {
    var queryString;

    if (tag_one !== null && tag_two !== null && tag_three !== null) {
        queryString = tag_one + " " + tag_two + " " + tag_three;

        queryStringArray.push(queryString);
    }
    if (tag_one !== null && tag_two !== null) {
        queryString = tag_one + " " + tag_two;

        queryStringArray.push(queryString);
    }
    if (tag_one !== null && tag_three !== null) {
        queryString = tag_one + " " + tag_three;

        queryStringArray.push(queryString);
    }
    if (tag_two !== null && tag_three !== null) {
        queryString = tag_two + " " + tag_three;

        queryStringArray.push(queryString);
    }

    if (tag_one !== null) {
        queryStringArray.push(tag_one);

    }
    if (tag_two !== null) {
        queryStringArray.push(tag_two);

    }
    if (tag_three !== null) {
        queryStringArray.push(tag_three);
    }
}
function clearProducts() {
    //clear aisle hoder
    var aisleHolder = document.getElementById('aisle_holder_id');
    aisleHolder.innerHTML = "";
    var imag = document.createElement("img");
    imag.src = "images/aislebg.jpg";
    aisleHolder.appendChild(imag);

    var productsCount = document.getElementById('products_id');
    productsCount.innerHTML = "Selected Products: 0";
    productsCount.style.color = "Black";
    aisleSldierReload();  
    aisleProducts.clear();
}
function getAllAislesByUser(id) {
    var url = "https://3dot1-dot-vue-server-dev.appspot.com/api/aisles/user/" + id;
    if (XMLHttpRequest)
    {
        request = new XMLHttpRequest();
        if ("withCredentials" in request)
        {
            // Firefox 3.5 and Safari 4
            request.open('GET', url, true);
            request.onreadystatechange = aisleHandler;
            request.send();
        }
    }
}
//get result handler
function aisleHandler() {
    if (request.readyState !== 4)
        return;
    if (request.status === 200)
    {
        aisles.clear();
        var jsonResponse = JSON.parse(request.responseText);
        for (var i = 0; i < jsonResponse.length; i++) {
            if (jsonResponse[i].productList.length !== 0 && jsonResponse[i].currentAisleState !== "DELETED") {
                aisles.push(jsonResponse[i]);
            }
        }

        alert("total aisles: " + aisles.length);
        console.log(request.responseText);
        prepareAisleTable();

    }
    if (request.status !== 200 && request.status !== 304) {
        alert('HTTP GET error ' + request.status);
        return;
    }
}

function showProductsBxSlider() {

    var prodcuHolder = document.getElementById('products_holder_id');
    prodcuHolder.innerHTML = "";

    for (i = 0; i < products.length; i++) {
        var container = document.createElement("div");
        var jsonObject = products[i];
        var imag = document.createElement("img");
        try {
            imag.src = jsonObject.productImages[0].externalURL;

            console.log(jsonObject.productImages[0].externalURL);
        } catch (e) {
            console.log("externalURL null")
        }
        //mouseroverEvent(imag, jsonObject);
        container.appendChild(imag);

        var textContainer = document.createElement("div");
        if (jsonObject.productProviders[0] !== undefined && jsonObject.productProviders[0].store !== undefined) {
            var provider = document.createTextNode(jsonObject.productProviders[0].store);
            var span = document.createElement('span');
            span.style.fontSize = "15px";
            span.style.color = "green";
            span.appendChild(provider);
            textContainer.appendChild(span);

            var br = document.createElement('br');
            textContainer.appendChild(br);
        }
        if (jsonObject.title !== undefined) {
            var title = document.createTextNode(jsonObject.title);

            var span = document.createElement('span');
            span.style.fontSize = "18px";
            span.style.color = "#cf5300";
            span.appendChild(title);
            textContainer.appendChild(span);
            //textContainer.appendChild(title);
            var br = document.createElement('br');
            textContainer.appendChild(br);
        }

        var state = document.createTextNode(jsonObject.currentProductState);
        var span = document.createElement('span');
        span.style.fontSize = "10px";
        span.style.color = "green";
        span.appendChild(state);
        textContainer.appendChild(span);

        var br = document.createElement('br');
        textContainer.appendChild(br);

        var br = document.createElement('br');
        textContainer.appendChild(br);


        createButton(jsonObject, textContainer);


        container.appendChild(textContainer);
        prodcuHolder.appendChild(container);
    }
    sliderReload();
    aisleSldierReload();


    //resize_images(400, 400, 400, 400);
}
function mouseroverEvent(image, product) {
    var localObject = {
        handleEvent: function() {
            onImageMouseOver(product);
        },
        dude: product.title
    };
    image.addEventListener("mouseover", localObject, false);

}
function createButton(product, div) {

    var button = document.createElement("input");
    button.type = "button";
    button.id = product.id;
    button.value = "AddToAisle";
    button.style.backgroundColor = "white";
    button.style.color = "green";
    button.style.outline = "solid orange";
    var obj = {
        handleEvent: function() {
            var buttonText = button.value;
            console.log("button Text:1 " + buttonText);
            if (buttonText === 'AddToAisle') {
                if (aisleProducts.length >= 1) {
                    var count = 0;
                    for (var k = 0; k < aisleProducts.length; k++) {
                        var porductObject = aisleProducts[k];

                        if (product.productProviders[0].store.trim() === porductObject.productProviders[0].store.trim()) {
                            count = count + 1;
                        }
                    }
                    if (count >= 1) {
                        var r = confirm("Aisle has product from same Provider, Do you want to Add?");
                        if (r === true) {

                            addToAisle(product, true);
                            console.log("CHNAGING BUTTON teXT: TO REMOVE FROM AISLE ");
                            button.value = "Remove From Aisle";
                            button.style.color = "#cf5300";
                        } else {

                        }
                    } else {
                        addToAisle(product, true);
                        button.value = "Remove From Aisle";
                        button.style.color = "#cf5300";
                    }
                } else {
                    button.value = 'Remove From Aisle';
                    button.style.color = "#cf5300";
                    addToAisle(product, true);
                }
            } else {
                console.log("button Text: Else Part ");
                addToAisle(product, false);
                button.value = "AddToAisle";
                button.style.color = "green";

            }

        },
        dude: product.title
    };
    button.addEventListener("click", obj, false);
    div.appendChild(button);
}

function addToAisle(product, isAddToAisle) {
    var j;
    var aisleHolder = document.getElementById('aisle_holder_id');
    // var productsCount = document.getElementById('products_id');
    aisleHolder.innerHTML = "";

    if (isAddToAisle) {
        //adding to aisle
        ga('send', 'event', 'button', 'clcik', "AddToAisle");
        aisleProducts.push(product);
        console.log("added product Id: " + product.id);
    } else {
        //removing from aisle
        ga('send', 'event', 'button', 'clcik', "RemoveFromAisle");
        var index = aisleProducts.indexOf(product);
        if (index > -1) {
            aisleProducts.splice(index, 1);
        }
    }
    var position = products.indexOf(product);
    prepareAisleSlider(aisleHolder, position);
}
function prepareAisleSlider(aisleHolder, index) {
    var productsCount = document.getElementById('products_id');
    if (aisleProducts.length < 3) {
        productsCount.innerHTML = "Selected Products: " + aisleProducts.length;
        productsCount.style.color = "Black";
    } else {
        productsCount.innerHTML = "Selected Products: " + aisleProducts.length;
        productsCount.style.color = "green";
    }
    for (j = 0; j < aisleProducts.length; j++) {
        var tempProduct = aisleProducts[j];
        var imag = document.createElement("img");

        imag.src = tempProduct.productImages[0].externalURL;
        var aileDiv = document.createElement("div");
        aileDiv.appendChild(imag);
        // createAisleDeleteButton(aileDiv, tempProduct);
        //aisleHolder.appendChild(aileDiv);

        var textContainer = document.createElement("div");
        var provider = document.createTextNode(tempProduct.productProviders[0].store);

        var span = document.createElement('span');
        span.style.fontSize = "15px";
        span.style.color = "green";
        span.appendChild(provider);
        textContainer.appendChild(span);
        var br = document.createElement('br');
        textContainer.appendChild(br);

        var title = document.createTextNode(tempProduct.title);
        var span = document.createElement('span');
        span.style.fontSize = "18px";
        span.style.color = "#cf5300";
        span.appendChild(title);
        textContainer.appendChild(span);
        //textContainer.appendChild(title);
        var br = document.createElement('br');
        textContainer.appendChild(br);


        var state = document.createTextNode(tempProduct.currentProductState);
        var span = document.createElement('span');
        span.style.fontSize = "10px";
        span.style.color = "green";
        span.appendChild(state);
        textContainer.appendChild(span);
        textContainer.appendChild(span);
        var br = document.createElement('br');
        textContainer.appendChild(br);
        var br = document.createElement('br');
        textContainer.appendChild(br);
        createAisleDeleteButton(textContainer, tempProduct);
        aileDiv.appendChild(textContainer);
        aisleHolder.appendChild(aileDiv);
    }
    var aisleSubmitButton = document.getElementById('submit_button');


    if (aisleProducts.length >= 3) {
        changeButton(true, aisleProducts.length);

        aisleSubmitButton.style.backgroundColor = "white";
        aisleSubmitButton.style.color = "green";
        aisleSubmitButton.style.outline = "solid orange";

    } else {
        changeButton(false, aisleProducts.length);
        aisleSubmitButton.style.backgroundColor = "white";
        aisleSubmitButton.style.color = "gray";
        aisleSubmitButton.style.outline = "solid gray";
    }
    if (aisleProducts.length === 0) {

        var imag = document.createElement("img");
        imag.src = "images/aislebg.jpg";
        aisleHolder.appendChild(imag);
    }
    aisleSldierReload();
    if (!isProductSliderReloaded) {
        isProductSliderReloaded = true;
        sliderReload();
        movePorductsSlider(index);
    }
    moveAisleSlider(aisleProducts.length - 1);
}
function createAisleDeleteButton(div, product) {

    var button = document.createElement("input");
    button.type = "button";

    button.value = "Remove From Aisle";
    button.style.backgroundColor = "white";
    button.style.color = "#cf5300";
    button.style.outline = "solid orange";
    var deleteImageDiv = document.createElement("div");
    deleteImageDiv.setAttribute('align', 'left');
    deleteImageDiv.appendChild(button);

    var obj = {
        handleEvent: function() {
            //removing from aisle
            var index = aisleProducts.indexOf(product);
            if (index > -1) {

                aisleProducts.splice(index, 1);
            }


            var myButton = document.getElementById(product.id);

            myButton.value = "AddToAisle";
            myButton.style.backgroundColor = "white";
            myButton.style.color = "green";
            myButton.style.outline = "solid orange";

            ga('send', 'event', 'button', 'clcik', "RemoveFromAisle");
            var aisleHolder = document.getElementById('aisle_holder_id');
            aisleHolder.innerHTML = "";

            prepareAisleSlider(aisleHolder);

            console.log("deleted product Id: " + product.id);
            console.log("deleted product Id: " + myButton.setAttribute());
        },
        dude: product.title
    };
    button.addEventListener("click", obj, false);
    div.appendChild(deleteImageDiv);
}
function onImageMouseOver(jsonObject) {

}

function getSelectedProducts() {

    if (aisleProducts.length < 1) {
        alert("Please select atleast one product ");
        return;
    } else if (aisleProducts.length >= 1 && aisleProducts.length < 3) {
        var r = confirm("You have selected only Two prodcuts, Do you want continue?");
        if (r === true) {
            selected.clear();
            selectedProducts.clear();
            var index;
            for (index = 0; index < aisleProducts.length; index = index + 1) {
                selectedProducts[index] = aisleProducts[index];
            }
        }
    } else {
        selected.clear();
        selectedProducts.clear();
        var index;
        for (index = 0; index < aisleProducts.length; index = index + 1) {
            selectedProducts[index] = aisleProducts[index];
        }
    }

}
function aisleProductsCount() {
    number_aisle_added = aisleProducts.length;
}
window.addEventListener('DOMContentLoaded', function() {

});
