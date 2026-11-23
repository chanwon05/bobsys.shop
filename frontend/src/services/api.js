const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

export const getToken = () => sessionStorage.getItem("bobsys.adminToken") || "";
export const setToken = (token) => {
  if (token) sessionStorage.setItem("bobsys.adminToken", token);
  else sessionStorage.removeItem("bobsys.adminToken");
  window.dispatchEvent(new Event("bobsys-auth"));
};

export async function request(path, options = {}) {
  const protectedRequest = path.startsWith("/admin/") || path === "/auth/me";
  const token = protectedRequest ? getToken() : "";
  let response;
  try {
    response = await fetch(API_BASE + path, {
      ...options,
      headers: {...(options.body instanceof FormData ? {} : {"Content-Type": "application/json"}),
        ...(token ? {Authorization: `Bearer ${token}`} : {}), ...options.headers},
    });
  } catch {
    throw new Error("서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.");
  }
  if (response.status === 204) return null;
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    if (protectedRequest && [401, 403].includes(response.status)) {
      setToken("");
      throw new Error("관리자 로그인이 필요합니다. 다시 로그인해 주세요.");
    }
    throw new Error(body?.message || "요청을 처리하지 못했습니다. 다시 시도해 주세요.");
  }
  if (body === null) throw new Error("서버 응답을 확인할 수 없습니다.");
  return body;
}

export const saveProduct = (id, data) => request(id ? `/admin/products/${id}` : "/admin/products", {
  method: id ? "PUT" : "POST", body: JSON.stringify(data),
});
export const saveCategory = (id, data) => request(id ? `/admin/categories/${id}` : "/admin/categories", {
  method: id ? "PUT" : "POST", body: JSON.stringify(data),
});
export const deleteProduct = (id) => request(`/admin/products/${id}`, {method: "DELETE"});
export const deleteCategory = (id) => request(`/admin/categories/${id}`, {method: "DELETE"});

export const uploadImage = (file) => {
  const data = new FormData();
  data.append("file", file);
  return request("/admin/images", {method: "POST", body: data});
};

export const imageSource = (url) => url?.startsWith("/api/images/")
  ? API_BASE.replace(/\/$/, "") + url.slice(4)
  : url;
