const { Router } = require("express");
const router = Router();
const passport = require("passport");
const { auth } = require("../middlewares/password_utils");
const { genPassword } = require("../middlewares/password_utils");
const { User } = require("../db");

router.get("/findUser", async (req, res) => {
  const { email } = req.body;
  let find = await User.findOne({ where: { email: email } });
  if (find) res.send(find);
  else res.status(404).send({ msg: "This user doesn't exist" });
});

router.post("/register", async (req, res, next) => {
  // const { email, password } = req.body;
  const { name, lastname, email, password, address, image, payment } = req.body;
  if (!password) throw new Error({ msg: "Password is required" });
  try {
    const userExist = await User.findOne({ where: { email: email } });
    // console.log(userExist ? userExist : null, "HERE BE USER");
    if (!userExist) {
      await User.create({
        email: email,
        password: genPassword(password),
        name: name,
        lastname: lastname,
        address: address,
        image: image,
        payment: payment,
        created: true,
      });

      res.send({ msg: "User Registered" });
    } else {
      res.status(401).send("Username is already taken");
    }
  } catch (err) {
    next(err);
  }
});

router.get("/Profile/auth", auth, (req, res, next) => {
  //Create auth
  // console.log("this is REQ SESSION", req.session)
  res.send(req.session);
});

router.get("/fail", (req, res) => {
  try {
    return res.send({ msg: "Something went wrong" });
  } catch (err) {
    console.log(err);
  }
});

router.post("/logout", auth, function (req, res, next) {
  try {
    console.log("AUTHENTICATE BEFORE", req.isAuthenticated());
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
      console.log("AUTHENTICATE BEFORE", req.isAuthenticated());
      // console.log("REQ.USER", req.user)
      res.send({ msg: "Logged out successfully" });
    });
  } catch (err) {
    console.log(err.message);
  }
});

router.post("/findUser", async (req, res) => {
  const { id } = req.body;
  let userInfo = await User.findOne({ where: { id: id } });
  if (userInfo) res.send(userInfo);
  else res.status(404).send({ msg: "This user doesn't exist" });
});

router.get("/findAll", async (req, res) => {
  const all = await User.findAll();
  try {
    return res.send(all);
  } catch (err) {
    console.log(err);
  }
});

router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/user/fail",
    successRedirect: "/user/Profile/auth",
  })
);

///////////////// GOOGLE ///////////////////

require("../middlewares/googleauth");

router.get(
  "/login/google",
  passport.authenticate("google", {
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
    session: true,
    failureRedirect: "/login",
    failureMessage: true,
  })
);

router.get("/googleAuth", passport.authenticate("google"), function (req, res) {
  res.redirect(
    `${process.env.REACT_APP_DOMAIN_GOOGLE_LOGIN}/login?id=${req.session.passport.user}`
  );
});

/*-------------------------------------------------------------- */
/*-------------------------Emails------------------------------- */

/*-------------------------------------------------------------- */
/*-------------------------UserInfo------------------------------- */

// Get User
router.get("/details/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findOne({
      where: { id: id },
      include: { all: true },
    });
    if (!user) {
      return res.status(404).send("User Not Found");
    }
    return res.status(200).send(user);
  } catch (error) {
    console.log("error:", error);
    res.status(404).send(error);
  }
});

// Update User
router.put("/details/:id", async (req, res) => {
  const { id } = req.params;
  const { name, lastname, email, password, address, image, payment } = req.body;

  let errors = validateInputUser(name, lastname, email, password);
  if (errors.length) return res.status(400).send({ msg: errors });

  try {
    const updatedUser = await User.update(
      {
        name: name,
        lastname: lastname,
        email: email,
        password: password,
        address: address,
        image: image,
        payment: payment,
      },
      { where: { id: id } }
    );
    return res.status(202).send(updatedUser);
  } catch (error) {
    res.status(400).send(error);
  }
});

/*-------------------------------------------------------------- */
/*-------------------------Favorites-----------------------------*/

router.post("/addFavorite", async (req, res) => {
  const { idUser, idProduct } = req.body;
  try {
    const user = await User.findOne({ where: { id: idUser } });
    const favoriteProduct = await Product.findOne({ where: { id: idProduct } });
    const favorite = await user.addProduct(favoriteProduct);
    return res.status(200).send(favorite);
  } catch (error) {
    console.log("error:", error);
    return res.status(404).send({ msg: error });
  }
});

router.delete("/removeFavorite", async (req, res) => {
  const { idUser, idProduct } = req.body;
  try {
    const user = await User.findOne({ where: { id: idUser } });
    const favoriteProduct = await Product.findOne({ where: { id: idProduct } });
    await user.removeProduct(favoriteProduct);
    return res.status(200).send("Favorite removed");
  } catch (error) {
    return res.status(404).send({ msg: error });
  }
});

// Get User's favorites
router.get("/favorite/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const userFavorites = await User.findOne({
      include: {
        model: Product,
        through: {
          attributes: [],
        },
      },
      where: { id: id },
    });
    if (!userFavorites) {
      return res.status(404).send("User Not Found");
    }
    return res.status(200).send(userFavorites.products);
  } catch (error) {
    // console.log("error:",error)
    return res.status(404).send(error);
  }
});

module.exports = router;