class ProductDTO{
    constructor(product){
        this.title = product.title;
        this.description = product.description;
        this.code = product.code;
        this.price = product.price;
        this.category = product.category;
        this.thumbnail = product.thumbnail;
        this.stock = product.stock;
        this.status = product.status ? product.status : true;
    }
}

module.exports = ProductDTO;