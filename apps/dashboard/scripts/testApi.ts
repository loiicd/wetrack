import json from "@/example/stack.json";
import axios from "axios";

const testApi = async () => {
  const url = "http://localhost:3000/api/dashboard";

  const response = await axios.post(url, json);
  console.log(response.data);
};

testApi();
