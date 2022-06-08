import React, { useState,useEffect } from "react";
import { useStore } from "../../../context/store";
import { Link, useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import FilterCategories from "../../FilterCategories/FilterCategories";
import { getFavorites } from "../../../redux/actions/actions.js";
import SearchBar from "../../SearchBar/SearchBar";
import "./LoggedNavBar.css";
import { useAuth } from "../../../context/authContext";
import logo from "../../../media/logonavbar.png";
import { totalCount } from "../../../redux/actions/actions.js";


export default function LoggedNavBar() {
  const { t } = useTranslation()
  const [state, dispatch] = useStore();
  let myUser = JSON.parse(localStorage.getItem("myUser"));
  let myCart = JSON.parse(localStorage.getItem(myUser));

  useEffect(() => {
    let myUser = JSON.parse(localStorage.getItem("myUser"));
    // console.log(myCart.length)
    if (myUser) {
      getFavorites(dispatch, myUser);
    }
  }, [state.favorites.length]);
  
  useEffect(()=>{
    if(myCart){
      totalCount(dispatch)
    }
  }, [dispatch, state.countCart])

  const { logout } = useAuth();
  const history = useHistory();

  const logoutSesion = async () => {
    // let user = JSON.parse(localStorage.getItem("myUser"))
    await logout;
    localStorage.removeItem("myUser");
    history.push("/");
  };

  return (
    <nav
      className="navbar navbar-expand-lg navbar-light  fixed-top"
      style={{ backgroundColor: "black" }}
    >
      <div className="container-fluid">
        <a className="navbar-brand">
          <img src={logo} alt="" height="80" />
        </a>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>{" "}
        <div className="collapse navbar-collapse " id="navbarSupportedContent">
          <ul className="navbar-nav  justify-content-center ">
            <li className="nav-item white-text-nav">
              <Link to="/">{t("loggedNavBar.home") }</Link>
            </li>
            <li className="nav-item dropdown  white-text-nav">
              <Link
                to=""
                className="dropdown-toggle"
                id="dropdownMenuClickableInside"
                data-bs-toggle="dropdown"
                data-bs-auto-close="outside"
                aria-expanded="false"
              >
                {t("loggedNavBar.categories") }
              </Link>
              <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
                <FilterCategories />
              </ul>
            </li>

            <li className="nav-item dropdown white-text-nav">
              <Link
                to=""
                className="dropdown-toggle "
                id="dropdownMenuClickableInside"
                data-bs-toggle="dropdown"
                data-bs-auto-close="outside"
                aria-expanded="false"
              >
               {t("loggedNavBar.profile") }
              </Link>
              <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
                <li className="dropdown-item category-list-item">
                  <Link to="/accountDetails"> {t("loggedNavBar.accountDetails") } </Link>
                </li>
                <li className="dropdown-item category-list-item">
                  <Link to="/favorites">{t("loggedNavBar.favorites") }</Link>
                </li>
                <li className="dropdown-item category-list-item log-out">
                  <a onClick={logoutSesion}>{t("loggedNavBar.logOut") }</a>
                </li>
              </ul>
            </li>
            <li className="nav-item white-text-nav">
              <Link className="" to="/cart">
                Cart
                {state.countCart?<span>{state.countCart}</span>:""}
              </Link>
            </li>
          </ul>
        </div>
        <SearchBar />
      </div>
    </nav>
  );
}
