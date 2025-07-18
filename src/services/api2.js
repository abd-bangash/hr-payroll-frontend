import axios from "axios";

const addEmployee = async (data) => {
  await axios
    .post("http://localhost:5000/api/employees", data)
    .then((res) => alert(res))
    .catch((error) => alert(error));
};

export default addEmployee;
