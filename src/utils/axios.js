import axios from "axios";

const instance = axios.create({
  baseURL:"https://f3-api.jaqk.in"
   
});

export default instance;
