const Carts = require("../dao/models/cartsModel.model");
const Products = require("./../dao/models/productsModel.model");

const addNewCart = async (req, res) => {
  try {
    const newCart = new Carts(req.body);
    await newCart.save();

    res.send({ result: "success", payload: newCart });
  } catch (error) {
    console.log("erro", error);
    res.status(500).send("Server Error");
  }
};

const addNewProductToCart = async (req, res) => {
  const { cid, pid } = req.params;

  try {
    const cart = await Carts.findById(cid);
    if (!cart) {
      return res.status(404).json({ error: "Carrinho não encontrado" });
    }

    const product = await Products.findById(pid);
    if (!product) {
      return res.status(404).json({ error: "Produto não encontrado" });
    }

    const existingProductIndex = cart.products.findIndex(
      (p) => p.productId.toString() === pid
    );
    if (existingProductIndex !== -1) {
      cart.products[existingProductIndex].quantity += 1;
    } else {
      cart.products.push({ productId: pid, quantity: 1 });
    }

    await cart.save();
    res.json({
      message: "Produto adicionado ao carrinho com sucesso",
      payload: cart,
    });
  } catch (error) {
    console.log("erro", error);
    res.status(500).json({ error: error.message });
  }
};

const getCarts = async (req, res) => {
  try {
    const carts = await Carts.find().populate("products.productId");
    res.send({ result: "success", payload: carts });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

const getCartById = async (req, res) => {
  try {
    const cart = await Carts.findById(req.params.cid).populate(
      "products.productId"
    );
    if (!cart) {
      return res.status(404).json({ error: "Carrinho não encontrado" });
    }
    res.render("carts", { cart: cart.toObject(), style: "cart.css" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteAllProductsFromCart = async (req, res) => {
  const { cid } = req.params;

  try {
    const cart = await Carts.findById(cid);
    if (!cart) {
      return res.status(404).send({ error: "Carrinho não encontrado" });
    }

    cart.products = [];
    await cart.save();

    res.send("Todos os produtos foram removidos do carrinho com sucesso");
  } catch (error) {
    console.log("erro", error);
    res.status(500).json({ error: error.message });
  }
};

const updateCart = async (req, res) => {
  try {
    const { cid } = req.params;
    const { products } = req.body;

    const cart = await Carts.findById(cid);
    if (!cart) {
      return res.status(404).send({ error: "Carrinho não encontrado" });
    }

    const productIds = products.map((p) => p.productId);
    const existingProducts = await Products.find({ _id: { $in: productIds } });
    const existingProductIds = existingProducts.map((p) => p._id.toString());

    const validProducts = products.filter((p) =>
      existingProductIds.includes(p.productId.toString())
    );

    cart.products = validProducts;
    await cart.save();

    const updatedCart = await Carts.findById(cid).populate(
      "products.productId"
    );
    res.send({ result: "success", payload: updatedCart });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

const updateProductQuantityInCart = async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    if (typeof quantity !== "number" || quantity < 0) {
      return res.status(400).send({ error: "Quantidade inválida fornecida" });
    }

    const cart = await Carts.findById(cid);
    if (!cart) {
      return res.status(404).json({ error: "Carrinho não encontrado" });
    }

    const product = await Products.findById(pid);
    if (!product) {
      return res.status(404).json({ error: "Produto não encontrado" });
    }

    const productIndex = cart.products.findIndex(
      (p) => p.productId.toString() === pid
    );
    if (productIndex === -1) {
      return res
        .status(404)
        .json({ error: "Produto não encontrado no carrinho" });
    }

    cart.products[productIndex].quantity = quantity;

    await cart.save();

    const updatedCart = await Carts.findById(cid).populate(
      "products.productId"
    );
    res.json({ result: "success", payload: updatedCart });
  } catch (error) {
    console.error(error);
    res.status(500).json("Server Error");
  }
};

module.exports = {
  addNewCart,
  addNewProductToCart,
  getCartById,
  getCarts,
  deleteAllProductsFromCart,
  updateCart,
  updateProductQuantityInCart,
};
