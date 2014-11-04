
var selected = [];
var aisles = [];
//prototype for clear the array values.
Array.prototype.clear = function() {
    this.length = 0;
};
var offsetval;
var products = [];
var aisleProducts = [];
var queryStringIndex = -1;
var providerStringIndex = 0;
//add providers here.
var providersList = [
    "asos.com",
    "bluefly.com",
    "etsy.com",
    "foxgown.com",
    "hm.com",
    "igigi.com",
    "justfab.com",
    "moddeals.com",
    "neimanmarcus.com",
    "sammydress.com",
    "shopbop.com",
    "stylesforless.com",
    "talbots.com",
    "target.com",
    "urbanog.com",
    "yoox.com",
    "zappos.com",
    "zulily.com",
    "macys.com",
    "nordstrom.com",
    "express.com"];
var currentProvider;
var selectedProducts = [];
var tag_one;
var tag_two;
var tag_three;
var queryStringArray = [];
var queryString;
var loopCount = 0;
var moveSliderPosition = 0;
var OPTION_ONE = "option_one";
var OPTION_TWO = "option_two";
var OPTION_THREE = "option_three";
var OPTION_FOUR = "option_four";
var current_option;
var requestType;
var FRESH_REQUEST = "fresh_request";
var FETCH_MORE_REQUEST = "fetch_more_request";
var isProductSliderReloaded;
var requestInProgress = false;
var EMPTY_RESPONSE = 3;
var QUERY_STATE = 0;
function getCrawledProducts(tag, pTypeTag, filterTag, offset, limit, option) {
    showGif();
    reInitializeValues();
    current_option = option;
    if (tag !== null && tag !== undefined  ) {
        tag_one =  tag;
    }
    if (pTypeTag !== null && pTypeTag !== undefined)
        tag_two =  pTypeTag;

    if (filterTag !== null && filterTag !== undefined)
        tag_three =  filterTag;
    queryStringMappingPool();
    var url = getUrl();
    getProductsCall(url);
}
function reInitializeValues() {
    products.clear();
    loopCount = 0;
    queryString = null;
    requestType = FRESH_REQUEST;
    providerStringIndex = 0;
    QUERY_STATE = 0;
    currentProvider = null;
    queryStringArray.clear();
    tag_one = null;
    tag_two = null;
    tag_three = null;
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
            requestInProgress = true;
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
        if (request.responseText.length < EMPTY_RESPONSE) {
            
            if (loopCount < providersList.length * queryStringArray.length) {
                //Issue a new request with new provider{(new or old)query string}if the current request has no data.
                getNewQueryString();
            }else {
                hideGif();
               alert("Products are not found"); 
            }
            return;
        }
         console.log("offsetval "+offsetval);
        if (offsetval === '0' || offsetval === 0) {
           
            products.clear();
            isProductSliderReloaded = false;
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
        if (requestType === FETCH_MORE_REQUEST) {

            products.clear();
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
                for (var j = 0; j < products.length; j++) {
                    var id = products[j].id;
                    if (id === productObject.id) {
                        matched = true;
                        break;
                    }
                }
                //make sure that no duplicate products are added.
                if (!matched)
                    products.push(productObject);
            } else {
                console.log("ARCHIVED PRODUCT FILTERED HERE");
            }
            // }
        }
        console.log("PRODUCTS COUNT: "+products.length);
fetchMoreButtonChange(true);
        // prepare the box slider
        if(products.length !== 0){
            hideGif();
        showProductsBxSlider();
    } else {
       getNewQueryString();
    }
    }
    if (request.status !== 200 && request.status !== 304) {
        //alert('HTTP GET error ' + request.status);
        console.log("error response");
        return;
    }
}
function fetchMore() {
    showGif();
    offsetval = 'NOT ZERO';
    loopCount = 0;
    var url = getUrl();
    requestType = FETCH_MORE_REQUEST;
    getProductsCall(url);
    moveSliderPosition = products.length;
    ga('send', 'event', 'button', 'click', 'FETCH_MORE_BUTTON');
    fetchMoreButtonChange(false);
}
function fetchMoreButtonChange(flag){
     var btn = document.getElementById('fetch_more_button_id');
       if (flag) {
                    btn.style.backgroundColor = "white";
                    btn.style.color = "green";
                    btn.style.outline = "solid orange";
                } else {
                    btn.style.backgroundColor = "white";
                    btn.style.color = "black";
                    btn.style.outline = "gray";
                }
}
function getNewQueryString() {
    offsetval = 'NOT ZERO';
    var url = getUrl();
    loopCount++;
    getProductsCall(url);
}
//Load all possible queryString values into Array
function queryStringMappingPool() {
    if (tag_one === undefined) {
        tag_one = null;
    }
    if (tag_two === undefined) {
        tag_two = null;
    }
    if (tag_three === undefined) {
        tag_three = null;
    }
    //separate each charected and add ~
     if(tag_one !== null){
         tag_one = addTilda(tag_one,1);
         console.log("Title OPTIONTHREE: "+tag_one);
     }
     if(tag_two !== null){
         tag_two = addTilda(tag_two,2);
     }
     if(tag_three !== null){
         tag_three = addTilda(tag_three,3);
     }
    if (current_option === OPTION_ONE) {
        optionOneQueries();
    } else if (current_option === OPTION_TWO) {
        optionTwoQueries();
    } else if (current_option === OPTION_THREE) {
        optionThreeQueries();
    }
    for (var j = 0; j < queryStringArray.length; j++) {
        console.log("TOTAL QUERIES: "+queryStringArray[j]);
    }
}
function optionOneQueries() {
    var queryString;
    if (tag_one !== null && tag_three !== null) {
        queryString = tag_one + " AND " + tag_three;
        queryStringArray.push(queryString);
    }
    if (tag_three !== null) {
        queryStringArray.push(tag_three);
    }
    if (tag_one !== null) {
        queryStringArray.push(tag_one);
    }
}
function optionTwoQueries() {
    var queryString;
    //tag_one is a PRIMARY field.
    //
    //first query.  
    if (tag_one !== null && tag_two !== null && tag_three !== null) {
        queryString = tag_one + " AND " + tag_two + " AND " + tag_three;
        queryStringArray.push(queryString);
    } else {
        if (tag_one !== null && tag_two !== null) {
            queryString = tag_one + " AND " + tag_two;
            queryStringArray.push(queryString);
        }
    }
    
    //second query
    if (tag_one !== null && tag_three !== null) {
        queryString = tag_one + " AND " + tag_three;
        queryStringArray.push(queryString);
    }
    
    //Third query
    if (tag_two !== null && tag_three !== null) {
        queryString = tag_two + " AND " + tag_three;
        queryStringArray.push(queryString);
        
        //add 4 th query with filter word.
         queryStringArray.push(tag_three);
    } else {
          if (tag_three !== null) {
            queryString = tag_three;
              queryStringArray.push(queryString);
          } 
            if (tag_two !== null) {
            queryString = tag_two;
             queryStringArray.push(queryString);
        } 
    }
    
    //only one query and that too with primary tag.
    if (tag_two === null && tag_three === null) {
        queryStringArray.push(tag_one);
    }
}
function optionThreeQueries() {
    var queryString;
    //first query     
    if (tag_one !== null && tag_two !== null && tag_three) {
        queryString = tag_one + " AND " + tag_two + " AND " + tag_three;
        queryStringArray.push(queryString);
    }  
    //second query
    if (tag_one !== null && tag_three !== null) {
        queryString = tag_one + " AND " + tag_three;
        queryStringArray.push(queryString);
    }
    //third query
    if (tag_one !== null && tag_two !== null) {
        queryString = tag_one + " AND " + tag_two;
        queryStringArray.push(queryString);
    }
    
    //add query with only filete word
    if(tag_three !== null){
         queryStringArray.push(tag_three);
    }
    //only one query and that too with primary tag.
    if (tag_two === null && tag_three === null) {
        queryStringArray.push(tag_one);
    }
}

function addTilda(currentTag,val){
      //title splitting.
    var wordsArray = currentTag.split(" ");
    var titleString;
    for (var t = 0; t < wordsArray.length; t++) {
        if (wordsArray[t].trim() !== ''){
            var word = '~'+wordsArray[t]
            if(titleString === undefined){
                titleString =  word;
            } else {
                if(current_option === OPTION_THREE && val === 1 ){
            titleString = titleString + " OR " +word;         
        }else {
            titleString = titleString + " " +word;
        }
        }
        }
    }  
 if(current_option === OPTION_THREE){
      titleString = "("+titleString+")";
 }
    return titleString;
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

    aisleProducts.clear();
    showProductsBxSlider();


    var prodcuHolder = document.getElementById('products_holder_id');
    prodcuHolder.innerHTML = "";
    var container = document.createElement("div");
    var imag = document.createElement("img");
    try {
        imag.src = 'images/aisle_bagroundvue.jpg';

        //console.log(jsonObject.productImages[0].externalURL);
    } catch (e) {
        console.log("externalURL null")
    }
    container.appendChild(imag);
    prodcuHolder.appendChild(container);
    sliderReload();
    aisleSldierReload();
}
function imageNotFound() {
     console.log("IMAGE NOT LOADED THERE IS A PROBLEM");
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
             
           imag.onerror= function () {
  this.src = "images/aislebg.jpg";
}
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
    requestInProgress = false;
    // if(moveSliderPosition !==  0)
    // movePorductsSlider(moveSliderPosition);


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
    var flag = false;
    for (var k = 0; k < aisleProducts.length; k++) {
        if (aisleProducts[k].id === product.id) {
            flag = true;
            break;
        }
    }
    var button = document.createElement("input");
    button.type = "button";
    button.id = product.id;
    if (!flag) {

        button.value = "AddToAisle";
        button.style.backgroundColor = "white";
        button.style.color = "green";
        button.style.outline = "solid orange";
    } else {

        button.value = "Remove From Aisle";
        button.style.backgroundColor = "white";
        button.style.color = "#cf5300";
        button.style.outline = "solid orange";
    }
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
            if (myButton !== null && myButton !== undefined) {
                myButton.value = "AddToAisle";
                myButton.style.backgroundColor = "white";
                myButton.style.color = "green";
                myButton.style.outline = "solid orange";
            }

            ga('send', 'event', 'button', 'clcik', "RemoveFromAisle");
            var aisleHolder = document.getElementById('aisle_holder_id');
            aisleHolder.innerHTML = "";

            prepareAisleSlider(aisleHolder);
        },
        dude: product.title
    };
    button.addEventListener("click", obj, false);
    div.appendChild(deleteImageDiv);
}
function onImageMouseOver(jsonObject) {

}
function showGif(){
   var figImage = document.getElementById('gif_id'); 
   figImage.style.visibility = "visible";
}
function hideGif(){
    var figImage = document.getElementById('gif_id');
     figImage.style.visibility = "hidden";
}
function getSelectedProducts() {

    if (aisleProducts.length < 1) {
        alert("Please select atleast one product ");
        return;
    } else if (aisleProducts.length >= 1 && aisleProducts.length < 3) {
        var message = "You have selected only "+aisleProducts.length+" products, Do you want continue?";
        var r = confirm(message);
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
function getUrl() {
    var providerString = getProvider();
    var queryString = getQueryString();
    var tempQueryString = queryString + " " + providerString +" NOT ARCHIVED";
    console.log("PROVIDER "+tempQueryString);
    url = "https://vue-server-dev.appspot.com/api/product/search/genericsearch?queryString=" + tempQueryString + "&offset=" + offset + "&limit=" + limit + "&randomize=true";
    return url;
}
function getQueryString() {
    if(QUERY_STATE < queryStringArray.length){
    return queryStringArray[QUERY_STATE];
    }else {
        QUERY_STATE = 0;
        return queryStringArray[QUERY_STATE]; 
    }
}
function getProvider() {
    var provider;
    if (providerStringIndex > providersList.length - 1) {
        provider = providersList[0];
        providerStringIndex = 0;
        QUERY_STATE++;       
    } else {
        provider = providersList[providerStringIndex];
          
        providerStringIndex++;
    }
    return provider;
}
function aisleProductsCount() {
    number_aisle_added = aisleProducts.length;
}
function clearAisleProducts(){
 aisleProducts.clear(); 
  selectedProducts.clear();
 fetchMoreButtonChange(false);
 var aisleSubmitButton = document.getElementById('submit_button');
        aisleSubmitButton.style.backgroundColor = "white";
            aisleSubmitButton.style.color = "gray";
            aisleSubmitButton.style.outline = "solid gray";
}
window.addEventListener('DOMContentLoaded', function() {

});
