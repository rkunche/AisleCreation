
var ul;
var li_items;
var imageNumber = 5;
var imageWidth = 300;
var prev, next;
var currentPostion = 0;
var currentImage = 0;
var selected = [];
var aisles = [];
//prototype for clear the array values.
Array.prototype.clear = function() {
    this.length = 0;
};
var offsetval;
var products = [];
var aisleProducts = [];

var selectedProducts = [];
function getCrawledProducts(tag, offset, limit, productState) {
    offsetval = offset;
    var isProductSliderReloaded;
    //keyword
    if (productState === "NONE") {
        var url = "https://3dot1-dot-vue-server-dev.appspot.com/api/product/search/genericsearch?queryString=" + tag + "&offset=" + offset + "&limit=" + limit + "&randomize=true";
    } else {
        var url = "https://3dot1-dot-vue-server-dev.appspot.com/api/product/search/genericsearch?currentProductState=" + productState + "&queryString=" + tag + "&offset=" + offset + "&limit=" + limit + "&randomize=false";
    }

    //var url ="https://3dot1.vue-server-dev.appspot.com/api/product/search/genericsearch?queryString="+tag+"&limit=20";
    // var url = "https://3dot1.vue-server-dev.appspot.com/api/product/search/tagsearch?tagstring=" + tag + "&limit=30";
    // var url = "https://vue-server-dev.appspot.com/api/product/search?productstate=CURATED_AND_VERIFIED&offset="+offset+"&limit="+limit;

    console.log(url);
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
    if (request.readyState != 4)
        return;
    if (request.status == 200)
    {

        var jsonResponse = JSON.parse(request.responseText);
        //alert('HTTP GET success: ' +jsonResponse.length  );
        //clear the old data in array and populate with new product data.
        //products.clear();

        if (request.responseText.length < 3) {
            alert("No products was found with this tag");
            return;
        }       
        if (offsetval === '0' || offsetval === 0) {      
            products.clear();
            aisleProducts.clear();
            isProductSliderReloaded = false;
            var aisleHolder = document.getElementById('aisle_holder_id');
            var productsCount = document.getElementById('products_id');
           aisleHolder.innerHTML = "";
            productsCount.innerHTML = "Selected Products: 0";
            var imag = document.createElement("img");
            imag.src = "images/aisle_baground.png";
             
     imag.width = 400;
     imag.height = 400;
            aisleHolder.appendChild(imag);
            aisleSldierReload();
        }
        for (var i = 0; i < jsonResponse.length; i++) {
            var jsonTempObject = jsonResponse[i];
            // if (jsonTempObject.currentProductState === "CURATED" || jsonTempObject.currentProductState === "CURATED_AND_VERIFIED") {
            var productObject = {id: jsonTempObject.id, ownerAisleId: jsonTempObject.ownerAisleId, ownerProductListId: jsonTempObject.ownerProductListId,
                creatorId: jsonTempObject.creatorId, curatorId: jsonTempObject.curatorId, title: jsonTempObject.title, description: jsonTempObject.description,
                currentProductState: jsonTempObject.currentProductState, relatedProductIds: jsonTempObject.relatedProductIds, productImages: jsonTempObject.productImages,
                productProviders: jsonTempObject.productProviders, comments: jsonTempObject.comments, productTags: jsonTempObject.productTags, ratings: jsonTempObject.ratings
            };
            products.push(productObject);
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
    if (request.readyState != 4)
        return;
    if (request.status == 200)
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
    if (request.status != 200 && request.status != 304) {
        alert('HTTP GET error ' + request.status);
        return;
    }
}
function crearPorducts() {
    products.clear();
    var table = document.getElementById("product");
    table.innerHTML = "";
    var prodcuHolder = document.getElementById('products_holder_id');
    prodcuHolder.innerHTML = "";
    sliderReload();
    alert("products cleared");
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
        var provider = document.createTextNode(jsonObject.productProviders[0].store);
        textContainer.appendChild(provider);
        var br = document.createElement('br');
        textContainer.appendChild(br);

        var title = document.createTextNode(jsonObject.title);
        textContainer.appendChild(title);
        var br = document.createElement('br');
        textContainer.appendChild(br);


        var state = document.createTextNode(jsonObject.currentProductState);
        textContainer.appendChild(state);
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
            if (buttonText == 'AddToAisle') {
                if (aisleProducts.length >= 1) {
                    var count = 0;
                    for (var k = 0; k < aisleProducts.length; k++) {
                        var porductObject = aisleProducts[k];

                        if (product.productProviders[0].store.trim() === porductObject.productProviders[0].store.trim()) {
                            count = count + 1;
                        }
                    }
                    if (count >= 1) {
                        var r = confirm("Aisle has product from same Provider Do you want Add?");
                        if (r === true) {
                           
                            addToAisle(product, true);
                            button.value = "Remove From Aisle";
                            button.style.color = "orange";
                        } else {

                        }
                    } else {
                        addToAisle(product, true);
                        button.value = "Remove From Aisle";
                        button.style.color = "orange";
                    }
                } else {
                    button.value = 'Remove From Aisle';
                    button.style.color = "orange";
                    addToAisle(product, true);
                }
            } else {

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
    } else {
        //removing from aisle
         ga('send', 'event', 'button', 'clcik', "RemoveFromAisle");
      var index = aisleProducts.indexOf(product);
        if (index > -1) {
            aisleProducts.splice(index, 1);
        }
    }
    var position = products.indexOf(product);
    prepareAisleSlider(aisleHolder,position);
}
function prepareAisleSlider(aisleHolder,index) {
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
        textContainer.appendChild(provider);
        var br = document.createElement('br');
        textContainer.appendChild(br);

        var title = document.createTextNode(tempProduct.title);
        textContainer.appendChild(title);
        var br = document.createElement('br');
        textContainer.appendChild(br);


        var state = document.createTextNode(tempProduct.currentProductState);
        textContainer.appendChild(state);
        var br = document.createElement('br');
        textContainer.appendChild(br);
        createAisleDeleteButton(textContainer, tempProduct);
        aileDiv.appendChild(textContainer);
        aisleHolder.appendChild(aileDiv);
    }
    var aisleSubmitButton = document.getElementById('submit_button');
    aisleSubmitButton
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
        imag.src = "images/aisle_baground.png";
        imag.width = 400;
        imag.height = 400;
        aisleHolder.appendChild(imag);
    }
    aisleSldierReload();
    if(!isProductSliderReloaded){
        isProductSliderReloaded = true;
    sliderReload();
   movePorductsSlider(index);
    }
    
}
function createAisleDeleteButton(div, product) {

    var button = document.createElement("input");
    button.type = "button";

    button.value = "Remove From Aisle";
    button.style.backgroundColor = "white";
    button.style.color = "orange";
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
             ga('send', 'event', 'button', 'clcik', "RemoveFromAisle");
            var aisleHolder = document.getElementById('aisle_holder_id');
            aisleHolder.innerHTML = "";
            prepareAisleSlider(aisleHolder);

            var myButton = document.getElementById(product.id);
            myButton.value = "AddToAisle";
            myButton.style.backgroundColor = "white";
            myButton.style.color = "green";
            myButton.style.outline = "solid orange";
        },
        dude: product.title
    };
    button.addEventListener("click", obj, false);
    div.appendChild(deleteImageDiv);
}
function onImageMouseOver(jsonObject) {
//    console.log("mouse Event: " + jsonObject.id);
//    var prodcutInfoTdEle = document.getElementById('product_info_id');
//    prodcutInfoTdEle.innerHTML = "";
//    var parentDiv = document.createElement("div");
//    parentDiv.style.marginLeft = 16;
//    var divTitle = document.createElement("div");
//    var title = document.createTextNode("TITLE  :   \n" + jsonObject.title);
//    divTitle.appendChild(title);
//    parentDiv.appendChild(divTitle);
//    var br = document.createElement("br");
//    parentDiv.appendChild(br);
//
//    var description = document.createTextNode("DESCRIPTION  : \n    " + jsonObject.description);
//    var divDescription = document.createElement("div");
//    divDescription.appendChild(description);
//    parentDiv.appendChild(divDescription);
//    var br = document.createElement("br");
//    parentDiv.appendChild(br);
//
//
//
//    var divCuratedState = document.createElement("div");
//    var curatedState = document.createTextNode("CURATED_STATE : " + jsonObject.currentProductState);
//    divCuratedState.appendChild(curatedState);
//    parentDiv.appendChild(divCuratedState);
//    var br = document.createElement("br");
//    parentDiv.appendChild(br);
//
//    var divId = document.createElement("div");
//    var id = document.createTextNode("PRODUCT_ID : " + jsonObject.id);
//    divId.appendChild(id);
//    parentDiv.appendChild(divId);
//    var br = document.createElement("br");
//    parentDiv.appendChild(br)
//
//
//    var divProductOwnerAisleId = document.createElement("div");
//    var ownerAisleId = document.createTextNode("OwnerAisleId : " + jsonObject.ownerAisleId);
//    divProductOwnerAisleId.appendChild(ownerAisleId);
//    parentDiv.appendChild(divProductOwnerAisleId);
//
//
//    prodcutInfoTdEle.appendChild(parentDiv);
}
function resize_images(maxht, maxwt, minht, minwt) {
    var imgs = document.getElementsByTagName('img');

    var resize_image = function(img, newht, newwt) {
        img.height = newht;
        img.width = newwt;
    };

    for (var i = 0; i < imgs.length; i++) {
        var img = imgs[i];
        if (img.height > maxht || img.width > maxwt) {
            // Use Ratios to constraint proportions.
            var old_ratio = img.height / img.width;
            var min_ratio = minht / minwt;
            // If it can scale perfectly.
            if (old_ratio === min_ratio) {
                resize_image(img, minht, minwt);
            }
            else {
                var newdim = [img.height, img.width];
                newdim[0] = minht;  // Sort out the height first
                // ratio = ht / wt => wt = ht / ratio.
                newdim[1] = newdim[0] / old_ratio;
                // Do we still have to sort out the width?
                if (newdim[1] > maxwt) {
                    newdim[1] = minwt;
                    newdim[0] = newdim[1] * old_ratio;
                }
                resize_image(img, newdim[0], newdim[1]);
            }
        }
    }
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
window.addEventListener('DOMContentLoaded', function() {
 
});
