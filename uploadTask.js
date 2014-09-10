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
var dummyImages = ["whitshirt.jpg", "girlshirt.jpg", "ladyshirt.jpg", "blackshirt.jpg", "whitshirt.jpg", "blackshirt.jpg", "whitshirt.jpg", "images.jpg", "ladyshirt.jpg", "blackshirt.jpg", ];
//prototype for clear the array values.
Array.prototype.clear = function() {
    this.length = 0;
};

var products = [];
var selectedProducts = [];
function getCrawledProducts(tag) {
 
   var url = "https://3dot1.vue-server-dev.appspot.com/api/product/search/tagsearch?tagstring="+tag+"&limit=30";
   // var url = "https://vue-server-dev.appspot.com/api/product/search?productstate=CURATED_AND_VERIFIED&limit=50";
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
      
          if(request.responseText.length < 3){
              alert("No products was found with this tag");
              return;
          }
          products.clear();
        for (var i = 0; i < jsonResponse.length; i++) {
            var jsonTempObject = jsonResponse[i];

            var productObject = {id: jsonTempObject.id, ownerAisleId: jsonTempObject.ownerAisleId, ownerProductListId: jsonTempObject.ownerProductListId,
                creatorId: jsonTempObject.creatorId, curatorId: jsonTempObject.curatorId, title: jsonTempObject.title, description: jsonTempObject.description,
                currentProductState: jsonTempObject.currentProductState, relatedProductIds: jsonTempObject.relatedProductIds, productImages: jsonTempObject.productImages,
                productProviders: jsonTempObject.productProviders, comments: jsonTempObject.comments, productTags: jsonTempObject.productTags, ratings: jsonTempObject.ratings};
            products.push(productObject);
        }

        prepare();
    }
    if (request.status != 200 && request.status != 304) {
        alert('HTTP GET error ' + request.status);
        return;
    }
}

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


        divTitle.appendChild(title);

        divId.appendChild(id);

        divDescription.appendChild(description);
        productusedCount.appendChild(usedCount);
        productusedCount.style.color = 'red';


        td1.appendChild(divId);
        td1.appendChild(divTitle);

        td1.appendChild(divDescription);
        td1.appendChild(productusedCount);


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
    selected.clear();
    selectedProducts.clear();
    //alert("upload is clicked");
    var table = document.getElementById("product");
// alert("upload is clicked 1 "+table);
    cells = table.getElementsByTagName('td');
// alert("upload is clicked 2");
    for (var i = 0, len = cells.length; i < len; i++) {
        var childNodes = cells[i].childNodes;
        for (var j = 0; j < childNodes.length; j++) {
            if (childNodes[j].tagName == "INPUT") {
                if (childNodes[j].checked) {
                    selected[selected.length] = i;
                    childNodes[j].checked = false;
                }

            }
        }

        cells[i].onclick = function() {

        }
    }

    if (selected.length == 0) {
        alert("Please select atleast one product");
    } else {
        for (var i = 0; i < selected.length; i++) {
            var j = selected[i];
            selectedProducts[i] = products[j];
        }
        alert("Total Selected products are: " + selected.length);
    }
}
window.addEventListener('DOMContentLoaded', function() {

    var uploaditem = document.getElementById('uploaditem');


    uploaditem.addEventListener('click', function() {
        //alert("upload is clicked");

        getSelectedProducts();

    });




});
