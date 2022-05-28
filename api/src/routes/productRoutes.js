const { Product, User, Category, Qa, Review } = require("../db")
const { Router } = require("express")


const router = Router()

// Get all products Filter By Category

router.get('/categoryFilter', async (req, res) => {

  if (req.body.categories) {

    const { categories } = req.body;
    const setCat = new Set(categories)
    const setOfCat = Array.from(setCat);

    let filteredProducts = []
    try {
      for (var i = 0; i < setOfCat.length; i++) {
        filteredProducts.push(await Product.findAll({
          include: {
            model: Category,
            attributes: ['name'],
            through: {
              attributes: []
            },
            where: {
              name: setOfCat[i]
            }
          }
        }))
      }
      res.send(filteredProducts);

    } catch (err) {
      console.log({ msg: err.message });
    }
  }
  try {
    const allProducts = await Product.findAll({
      include: {
        model: Category,
        attributes: ['name'],
        through: {
          attributes: []
        }
      }
    })
    console.log(allProducts)
    res.send(allProducts)
  }
  catch (err) {
    res.status(400).send({ msg: err.message });
  }

})




// CHECK
//WORKING
//Get Product Details
router.get("/:id", async (req, res) => {
  const { id } = req.params
  const product = await Product.findOne({
    include: {
      model: Category,
      attributes: ["name"],
      through: { attributes: [] },
    },
    where: {
      id: id
    }
  })
  if (!product) {
    return res.status(404).send("Product Not Found")
  }
  return res.status(200).send(product)
})


//Create Product
router.post("/", async (req, res) => {

  const { name, price, description, status, image, stock, categories } = req.body

  let exists = await Product.findOne({ where: { name: name } });

  if (!exists) {

    if (!name) return res.status(400).send({ msg: "Please pick a name for you product" });

    if (!image) return res.status(400).send({ msg: "Please choose the picture for you product" });

    if (!description) return res.status(400).send({ msg: "Please send a description of your product" });

    if (stock < 0) {
      return res.status(400).send({ msg: "The stock can't be a negative numbre, you dummy" })

    } else if (stock === 0) status = "inactive";

    if (price < 0) return res.status(400).send({ msg: "The price can't be a negative number" })

    if (!categories) return res.status(400).send({ msg: "You need to choose at least one category." })

    try {
      const newProduct = await Product.create({
        name, price, description, status, image, stock, created: true
      })
      for (var i = 0; i < categories.length; i++) {

        let category = await Category.findOne({ where: { name: categories[i] } })
        console.log(category)
        if (!category) {
          return res.status(400).send({ msg: "This isn't a valid category, you might have misspeled it or you can choose to create a new one" })

        } else await newProduct.addCategory(category)
      }

      res.status(201).send("New Product Created")
    }

    catch (err) {
      res.status(401).send(err)
    }
  }
})

// CHECK
//Delete Product
router.delete("/:id", async (req, res) => {
  const { id } = req.params
  try {
    await Product.destroy({ where: { id: id } })
    res.status(200).send("Product deleted")
  }
  catch (err) {
    res.status(400).send(err)
  }
})


//FUNCIONA 

//In the update form, LOAD ALL THE DATA FOR CHANGING
router.put("/update/:id", async (req, res) => {
  const { id } = req.params
  const { name, price, description, image, stock, categories } = req.body

  if (categories) {
    let product = await Product.findOne({ where: { id: id } })
    product.setCategories([])

    for (let cat of categories) {
      await Category.findOrCreate({ where: { name: cat } })
    }
    for (let cat of categories) {
      const category = await Category.findOne({ where: { name: cat } })
      product.addCategory(category)
    }
  }

  try {
    await Product.update(
      {
        name: name,
        price: price,
        description: description,
        image: image,
        stock: stock,
      },
      {
        where: { id: id }
      });
    res.status(202).send("Product Updated")
  }
  catch (err) {
    res.status(400).send(err)
  }
})

///////////////REEEEVVVVIIIISSSSAAAAARRRRRRRR///////
//Product Bought 
//////////////  VA A LLEGAR EL CARRITO ENTERO /////////////////////



// router.put("/:id/buy", async (req, res) => {
//   const { id } = req.params
//   const { amount } = req.body

//   try {
//     const { stock } = await Product.findOne({ where: { id: id } })
//     if (stock - amount === 0) {
//       await Product.update({ stock: "0", status: "inactive" }, { where: { id: id } })
//     }
//     await Product.update({ stock: (stock - amount) }, { where: { id: id } })
//     return res.status(200).send("Product Bought")
//   }
//   catch (err) {
//     res.status(400).send(err)
//   }
// })

////CHECKEAR ESTO



//Product Restock
router.put("/:id/restock", async (req, res) => {
  const { id } = req.params
  const { amount } = req.body

  try {
    const { stock } = await Product.findOne({ where: { id: id } })
    await Product.update({ stock: (stock + amount), status: "active" }, { where: { id: id } })
    return res.status(200).send("Product Restocked")
  }
  catch (err) {
    res.status(400).send(err)
  }
})


//Add Questions




module.exports = router

