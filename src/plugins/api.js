import axios from 'axios';

const AxiosInstance = axios.create();

class Api {
  static _request(params) {
    return AxiosInstance.request(params)
      .then(({ data }) => data)
      .catch(console.warn);
  }

  static get({ url, params }) {
    const requestParams = {
      url,
      params,
      method: 'GET',
    };
    return Api._request(requestParams);
  }
}

export default Api;
