//triggered when modal is about to be shown
$('#productForm').on('show.bs.modal', function(e) {

    //get data-id attribute of the clicked element
    var productID = $(e.relatedTarget).data('product-id');

    //populate the textbox
    $(e.currentTarget).find('input[name="productID"]').val(productID);
});

//triggered when modal is about to be shown
$('#quantityForm').on('show.bs.modal', function(e) {

    //get data-id attribute of the clicked element
    var productID = $(e.relatedTarget).data('orderline-id');

    //populate the textbox
    $(e.currentTarget).find('input[name="orderLineID"]').val(productID);
});