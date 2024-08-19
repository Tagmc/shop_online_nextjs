import axios from "axios";
import { CONFIG_API } from "src/configs/api";
import { TLoginAuth } from "src/types/auth";

export const loginAuth = async (data: TLoginAuth) => {
  try {
    const res = await axios.post(CONFIG_API.AUTH.INDEX, data);
    return res.data;
  } catch (error) {
    return null;
  }
}