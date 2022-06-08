import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, Redirect } from "react-router-dom";
import { Formik } from "formik";
import { useAuth } from "../../../context/authContext";
import { useTranslation } from "react-i18next";
import { t } from "i18next";
export default function LoginADMIN() {
  const { t } = useTranslation()
  const [redirect, setRedirect] = useState(false);
  const { login } = useAuth();
  const handleLogin = async (values) => {
    
    try {
      const userCredentials = await login(values.email, values.password);

      if (userCredentials.user.uid) {
        const idAdmin = userCredentials.user.uid;
        const admin = await axios.post(
          `${process.env.REACT_APP_DOMAIN}/admin/getAdmin`,
          {
            id: idAdmin,
          }
        );

        if (admin.data.isAdmin === true) {
          localStorage.setItem("myAdmin", JSON.stringify(admin));
          setRedirect(true);
        } else {
          alert("WRONG CREDENTIALS");
        }
      }
    } catch (err) {
      alert(err);
    }
  };
  useEffect(() => {
    localStorage.clear();
  }, []);
  return (
    <div className="container-login">
      <Formik
        initialValues={{
          email: "",
          password: "",
        }}
        validate={(values) => {
          const errors = {};
          if (!values.email) {
            errors.email = "Required email";
          } else if (
            !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)
          ) {
            errors.email = "Invalid email";
          }
          if (!values.password) {
            errors.password = "Password required.";
          } else if (
            !/^(?=\w*\d)(?=\w*[A-Z])(?=\w*[a-z])\S{8,16}$/.test(values.password)
          ) {
            errors.password =
              "Your password must be 8 to 16 characters long and must contain both uppercase and lowercase letters, and at least one number.";
          }

          return errors;
        }}
        onSubmit={(values, { setErrors }) => {
          return handleLogin(values).catch(() => {
            setErrors("email", "This email is not valid");
          });
        }}
      >
        {({ errors, handleSubmit, handleChange, isSubmitting, touched }) => (
          <div className="loginCard">
            {redirect ? (
              <Redirect
                push
                to="/CC7E389029C4B7768A0C89DC75F304059EF9ECBA68FF02FD4BFB7FE740721F4F/admin/home"
              />
            ) : null}
            <h2>{t("loginAdmin.login") }</h2>
            <form
              method="POST"
              action={`${process.env.REACT_APP_DOMAIN}/user/login`}
              onSubmit={handleSubmit}
            >
              <div className="divInputUser">
                <input
                  type="text"
                  required
                  placeholder="Email ..."
                  name="email"
                  onChange={handleChange}
                />
                <small style={{ color: "red" }}>
                  {touched.email && errors.email ? <p>{errors.email}</p> : ""}
                </small>
              </div>
              <div className="divInputUser">
                <input
                  type="password"
                  required
                  placeholder="Password..."
                  name="password"
                  onChange={handleChange}
                />
              </div>
              <small style={{ color: "red" }}>
                {touched.password && errors.password ? (
                  <p>{errors.password}</p>
                ) : (
                  ""
                )}
              </small>

              <div className="btn-login">
                <input
                  disabled={isSubmitting}
                  type="submit"
                  value="Submit"
                  className="input-submit"
                />
              </div>
            </form>
          </div>
        )}
      </Formik>
    </div>
  );
}