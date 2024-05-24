import { apiClient } from './apiClient';

class HttpClient {
  #endPoint;
  constructor(endPoint) {
    this.#endPoint = endPoint;
  }

  getAll() {
    return apiClient.get(this.#endPoint + "/list");
  }

  getOne(id) {
    return apiClient.get(this.#endPoint + "/" + id);
  }

  add(payload) {
    return apiClient.post(this.#endPoint + "/add", payload);
  }

  delete(id) {
    return apiClient.put(this.#endPoint + "/delete" + "/" + id);
  }

  update(id, payload) {
    return apiClient.put(this.#endPoint + "/edit" + "/" + id, payload);
  }
}
const create = (endPoint) => {
  return new HttpClient(endPoint);
};
export default create;
