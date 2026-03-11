// import json from "@/example/stack.json";
import json from "@/example/onlyDashboard.json";
import axios from "axios";

const host = "http://localhost:3000";
// const host = "https://wetrack-dashboard.vercel.app";

const testApi = async () => {
  const url = `${host}/api/dashboard`;

  const response = await axios.post(url, json);
  console.log(response.status);
  console.log(response.statusText);
};

testApi();
