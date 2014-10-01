//1. set ul width 
//2. image when click prev/next button
var ul;
var li_items;
var imageNumber = 5;
var imageWidth = 300;
var prev, next;
var currentPostion = 0;
var currentImage = 0;
var selected = [];
var aisles = [];
var dummyImages = ["images/one.jpg", "images/two.jpg", "images/three.jpg", "images/four.jpg", "whitshirt.jpg", "blackshirt.jpg", "whitshirt.jpg", "images.jpg", "ladyshirt.jpg", "blackshirt.jpg", ];
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
    //keyword
    if (productState === "NONE") {
        var url = "https://3dot1.vue-server-dev.appspot.com/api/product/search/genericsearch?queryString=" + tag + "&offset=" + offset + "&limit=" + limit;
    } else {
        var url = "https://3dot1.vue-server-dev.appspot.com/api/product/search/genericsearch?productstate=" + productState + "&queryString=" + tag + "&offset=" + offset + "&limit=" + limit;
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
        if (offsetval === 0) {
            products.clear();
            aisleProducts.clear();
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
    var url = "https://3dot1.vue-server-dev.appspot.com/api/aisles/user/" + id;
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
            imag.width = 400;
            imag.height = 400;
            console.log(jsonObject.productImages[0].externalURL);
        } catch (e) {
            console.log("externalURL null")
        }
        mouseroverEvent(imag, jsonObject);
        container.appendChild(imag);
        var textContainer = document.createElement("div");
        var provider = document.createTextNode("Provider : " + jsonObject.productProviders[0].store);
        textContainer.appendChild(provider);
        var br = document.createElement('br');
        textContainer.appendChild(br);



        createButton(jsonObject, textContainer);


        container.appendChild(textContainer);
        prodcuHolder.appendChild(container);
    }
    sliderReload();
    resize_images(400, 400, 400, 400);
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
    button.value = "AddToAisle";
    button.style.backgroundColor = "white";
    button.style.color = "orange";
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
                            button.style.color = "green";
                        } else {

                        }
                    } else {
                        addToAisle(product, true);
                        button.value = "Remove From Aisle";
                        button.style.color = "green";
                    }
                } else {
                    button.value = 'Remove From Aisle'
                    button.style.color = "green";
                    addToAisle(product, true);
                }
            } else {

                addToAisle(product, false);
                button.value = "AddToAisle";
                button.style.color = "orange";

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
    var productsCount = document.getElementById('products_id');
    aisleHolder.innerHTML = "";
    if (isAddToAisle) {
        aisleProducts.push(product);
        console.log("push to aisle array");
    } else {
        var index = aisleProducts.indexOf(product);
        if (index > -1) {
            aisleProducts.splice(index, 1);
        }
    }
    if(aisleProducts.length < 3){
    productsCount.innerHTML = "Selected Products: " + aisleProducts.length;
     productsCount.style.color = "Black";
} else {
    productsCount.innerHTML = "Selected Products: " + aisleProducts.length + " (Aisle Ready to Upload)";
    productsCount.style.color = "green";
     
}
    console.log("push to aisle sie " + aisleProducts.length);
    if (aisleProducts.length >= 3) {
        changeButton(true, aisleProducts.length);
        //  var instructions = document.getElementById('instruction_id');
        // instructions.style.color = 'green';
        // instructions.innerHTML = "Your Aisle is Ready to Upload";
    } else {
        changeButton(false, aisleProducts.length);
        // document.getElementById('instruction_id').innerHTML = "";
    }
    for (j = 0; j < aisleProducts.length; j++) {
        var tempProduct = aisleProducts[j];
        var imag = document.createElement("img");

        imag.src = tempProduct.productImages[0].externalURL;
        imag.width = 400;
        imag.height = 400;
        mouseroverEvent(imag, tempProduct);
        aisleHolder.appendChild(imag);
    }
    if(aisleProducts.length == 0){
         var imag = document.createElement("img");
        imag.src =  "images/aisle_baground.png";
        imag.width = 400;
        imag.height = 400; 
         aisleHolder.appendChild(imag);
    }
    aisleSldierReload();
}
function onImageMouseOver(jsonObject) {
    console.log("mouse Event: " + jsonObject.id);
    var prodcutInfoTdEle = document.getElementById('product_info_id');
    prodcutInfoTdEle.innerHTML = "";
    var parentDiv = document.createElement("div");
    parentDiv.style.marginLeft = 16;
    var divTitle = document.createElement("div");
    var title = document.createTextNode("TITLE  :   \n" + jsonObject.title);
    divTitle.appendChild(title);
    parentDiv.appendChild(divTitle);
    var br = document.createElement("br");
    parentDiv.appendChild(br);

    var description = document.createTextNode("DESCRIPTION  : \n    " + jsonObject.description);
    var divDescription = document.createElement("div");
    divDescription.appendChild(description);
    parentDiv.appendChild(divDescription);
    var br = document.createElement("br");
    parentDiv.appendChild(br);



    var divCuratedState = document.createElement("div");
    var curatedState = document.createTextNode("CURATED_STATE : " + jsonObject.currentProductState);
    divCuratedState.appendChild(curatedState);
    parentDiv.appendChild(divCuratedState);
    var br = document.createElement("br");
    parentDiv.appendChild(br);

    var divId = document.createElement("div");
    var id = document.createTextNode("PRODUCT_ID : " + jsonObject.id);
    divId.appendChild(id);
    parentDiv.appendChild(divId);
    var br = document.createElement("br");
    parentDiv.appendChild(br)


    var divProductOwnerAisleId = document.createElement("div");
    var ownerAisleId = document.createTextNode("OwnerAisleId : " + jsonObject.ownerAisleId);
    divProductOwnerAisleId.appendChild(ownerAisleId);
    parentDiv.appendChild(divProductOwnerAisleId);


    prodcutInfoTdEle.appendChild(parentDiv);
}
//back up code to create to show the data in table.
function prepare() {

    var table = document.getElementById("product");
    table.innerHTML = "";
    var i = 0;

    for (i = 0; i < products.length; i++) {
        var jsonObject = products[i];
        if (i % 4 == 0) {
            var tr = document.createElement("tr");
            table.appendChild(tr);
        }

        var td1 = document.createElement("td");
        td1.style.width = 500;
        td1.style.height = 500;
        var imag = document.createElement("img");

        try {
            imag.src = jsonObject.productImages[0].externalURL;
        } catch (e) {
            console.log("externalURL null")
        }
        td1.appendChild(imag);

        tr.appendChild(td1);
        var divImage = document.createElement("div");
        divImage.className = "center";
        var divTitle = document.createElement("div");
        var divOccassion = document.createElement("div");
        var divDescription = document.createElement("div");
        var divId = document.createElement("div");
        var productusedCount = document.createElement("div");
        var divCuratedState = document.createElement("div");
        divImage.style.display = 'block'
        var img = document.createElement("img");
        img.src = "images.jpg";

        img.className = "center";
        var br = document.createElement("br");
        divImage.appendChild(img);

        var id = document.createTextNode("ProductId : " + jsonObject.id);
        var title = document.createTextNode("Title : " + jsonObject.title);

        var description = document.createTextNode("Description : " + jsonObject.description);
        var usedCount = document.createTextNode("OwnerAisleId : " + jsonObject.ownerAisleId);
        var curatedState = document.createTextNode("CuratedState : " + jsonObject.currentProductState);


        divTitle.appendChild(title);

        divId.appendChild(id);

        divDescription.appendChild(description);
        productusedCount.appendChild(usedCount);
        divCuratedState.appendChild(curatedState);
        productusedCount.style.color = 'red';


        td1.appendChild(divId);
        td1.appendChild(divTitle);

        td1.appendChild(divDescription);
        td1.appendChild(productusedCount);
        td1.appendChild(divCuratedState);


        var checkbox = document.createElement('input');
        checkbox.type = "checkbox";
        checkbox.name = "name";
        checkbox.value = "value";
        checkbox.id = "id";
        checkbox.value = "orange";
        checkbox.className = "largerCheckbox";

        var label = document.createElement('label')
        label.htmlFor = "id";
        label.appendChild(document.createTextNode('Select'));

        td1.appendChild(checkbox);
        td1.appendChild(label);
        td1.style.border = "thin dotted red";


    }
    resize_images(400, 400, 400, 400);
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
function prepareAisleTable() {
    var table = document.getElementById("product");
    table.innerHTML = "";
    for (i = 0; i < aisles.length; i++) {
        var jsonObject = aisles[i];
        if (i % 4 == 0) {
            var tr = document.createElement("tr");
            table.appendChild(tr);
        }
        var td1 = document.createElement("td");

        var imag = document.createElement("img");

        try {
            imag.src = jsonObject.productList[0].productImages[0].externalURL;
        } catch (e) {
            console.log("externalURL null")
        }
        td1.appendChild(imag);
        tr.appendChild(td1);
        var divImage = document.createElement("div");
        divImage.className = "center";
        var divTitle = document.createElement("div");
        var divOccassion = document.createElement("div");
        var divDescription = document.createElement("div");
        var divId = document.createElement("div");
        var productusedCount = document.createElement("div");
        var divCategory = document.createElement("div");
        var divOccasion = document.createElement("div");
        var divLookingfor = document.createElement("div");
        var divProductsCount = document.createElement("div");
        divImage.style.display = 'block'
        var id = document.createTextNode("AisleId : " + jsonObject.id);
        var title = document.createTextNode("Name : " + jsonObject.name);

        var description = document.createTextNode("Description : " + jsonObject.description);
        var OwnerUserId = document.createTextNode("OwnerUserId : " + jsonObject.ownerUserId);
        var categoryText = document.createTextNode("Category : " + jsonObject.category);
        var occassionText = document.createTextNode("Occasion : " + jsonObject.occassion);
        var lookingForText = document.createTextNode("LookingFor : " + jsonObject.lookingFor);
        var prodcutsCountText = document.createTextNode("ProductsCount : " + jsonObject.productList.length);
        divTitle.appendChild(title);
        divCategory.appendChild(categoryText);
        divOccasion.appendChild(occassionText);
        divLookingfor.appendChild(lookingForText);
        divProductsCount.appendChild(prodcutsCountText);

        divId.appendChild(id);

        divDescription.appendChild(description);
        productusedCount.appendChild(OwnerUserId);
        productusedCount.style.color = 'red';


        td1.appendChild(divId);
        td1.appendChild(divTitle);

        td1.appendChild(divDescription);
        td1.appendChild(divCategory);
        td1.appendChild(divOccasion);
        td1.appendChild(divLookingfor);
        td1.appendChild(divProductsCount);
        td1.appendChild(productusedCount);
    }
}

function initialize(container) {

    ul = document.getElementById('image_slider');
    li_items = ul.children;
    imageNumber = li_items.length;
    imageWidth = li_items[0].children[0].clientWidth;
    ul.style.width = parseInt(imageWidth * imageNumber) + 'px';
    prev = document.getElementById("prev");
    next = document.getElementById("next");
    prev.onclick = function() {
        onClickPrev();
    };
    next.onclick = function() {
        onClickNext();
    };
}

function getSelectedProducts() {
    if (aisleProducts.length < 1) {
        alert("Please select atleast one product");
        return;
    } else if (aisleProducts.length >= 1 && aisleProducts < 3) {
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
//    //alert("upload is clicked");
//    var table = document.getElementById("product");
//// alert("upload is clicked 1 "+table);
//    cells = table.getElementsByTagName('td');
//// alert("upload is clicked 2");
//    for (var i = 0, len = cells.length; i < len; i++) {
//        var childNodes = cells[i].childNodes;
//        for (var j = 0; j < childNodes.length; j++) {
//            if (childNodes[j].tagName == "INPUT") {
//                if (childNodes[j].checked) {
//                    selected[selected.length] = i;
//                    childNodes[j].checked = false;
//                }
//
//            }
//        }
//
//        cells[i].onclick = function() {
//
//        }
//    }
//
//    if (selected.length == 0) {
//        alert("Please select atleast one product");
//    } else {
//        for (var i = 0; i < selected.length; i++) {
//            var j = selected[i];
//            selectedProducts[i] = products[j];
//        }
//        alert("Total Selected products are: " + selected.length);
//    }
}
window.addEventListener('DOMContentLoaded', function() {

    var uploaditem = document.getElementById('uploaditem');


    uploaditem.addEventListener('click', function() {
        //alert("upload is clicked");

        getSelectedProducts();

    });




});
