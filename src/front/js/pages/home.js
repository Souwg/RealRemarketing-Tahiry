import React, { useContext } from "react";
import { Context } from "../store/appContext";
import "../../styles/home.css";

export const Home = () => {
  const { store, actions } = useContext(Context);

  return <>
  <div className="d-flex justify-content-center align-items-center vh-50">
      <h1 className="display-1 text-center">HOME</h1>
    </div>
    </>
};
