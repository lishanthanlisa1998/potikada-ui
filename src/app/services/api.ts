import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class Api {

  private baseUrl = 'https://potikada-api-production.up.railway.app/api';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    });
  }

  // ===== AUTH =====
  register(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/register`, data, {
      headers: this.getHeaders()
    });
  }

  login(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/login`, data, {
      headers: this.getHeaders()
    });
  }

  logout(): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/logout`, {}, {
      headers: this.getHeaders()
    });
  }

  me(): Observable<any> {
    return this.http.get(`${this.baseUrl}/auth/me`, {
      headers: this.getHeaders()
    });
  }

  // ===== PRODUCTS =====
  getProducts(category?: string): Observable<any> {
    const url = category && category !== 'all'
      ? `${this.baseUrl}/products?category=${category}`
      : `${this.baseUrl}/products`;
    return this.http.get(url, { headers: this.getHeaders() });
  }

  getProduct(id: number, ref?: string): Observable<any> {
    const url = ref
      ? `${this.baseUrl}/products/${id}?ref=${ref}`
      : `${this.baseUrl}/products/${id}`;
    return this.http.get(url, { headers: this.getHeaders() });
  }

  // ===== ORDERS =====
  placeOrder(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/orders`, data, {
      headers: this.getHeaders()
    });
  }

  getOrder(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/orders/${id}`, {
      headers: this.getHeaders()
    });
  }

  // ===== AFFILIATE =====
  affiliateRegister(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/affiliate/register`, data, {
      headers: this.getHeaders()
    });
  }

  affiliateDashboard(): Observable<any> {
    return this.http.get(`${this.baseUrl}/affiliate/dashboard`, {
      headers: this.getHeaders()
    });
  }

  affiliateWithdraw(amount: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/affiliate/withdraw`, { amount }, {
      headers: this.getHeaders()
    });
  }
  adminLogin(email: string, password: string): Observable<any> {
  return this.http.post(`${this.baseUrl}/admin/login`, { email, password }, {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  });
}

// Admin specific headers
private getAdminHeaders(): HttpHeaders {
  const token = localStorage.getItem('admin_token');
  return new HttpHeaders({
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  });
}

// Admin API calls
getAdminDashboard(): Observable<any> {
  return this.http.get(`${this.baseUrl}/admin/dashboard`, {
    headers: this.getAdminHeaders()
  });
}

getAdminProducts(): Observable<any> {
  return this.http.get(`${this.baseUrl}/admin/products`, {
    headers: this.getAdminHeaders()
  });
}

createProduct(data: any): Observable<any> {
  return this.http.post(`${this.baseUrl}/admin/products`, data, {
    headers: this.getAdminHeaders()
  });
}

updateProduct(id: number, data: any): Observable<any> {
  return this.http.put(`${this.baseUrl}/admin/products/${id}`, data, {
    headers: this.getAdminHeaders()
  });
}

deleteProduct(id: number): Observable<any> {
  return this.http.delete(`${this.baseUrl}/admin/products/${id}`, {
    headers: this.getAdminHeaders()
  });
}

getAdminOrders(status?: string): Observable<any> {
  const url = status && status !== 'all'
    ? `${this.baseUrl}/admin/orders?status=${status}`
    : `${this.baseUrl}/admin/orders`;
  return this.http.get(url, { headers: this.getAdminHeaders() });
}

updateOrderStatus(id: number, status: string): Observable<any> {
  return this.http.put(`${this.baseUrl}/admin/orders/${id}/status`,
    { status },
    { headers: this.getAdminHeaders() }
  );
}

getAdminAffiliates(): Observable<any> {
  return this.http.get(`${this.baseUrl}/admin/affiliates`, {
    headers: this.getAdminHeaders()
  });
}

getAdminAffiliate(id: number): Observable<any> {
  return this.http.get(`${this.baseUrl}/admin/affiliates/${id}`, {
    headers: this.getAdminHeaders()
  });
}

markAffiliatePayment(affiliateId: number, withdrawalId: number, notes?: string): Observable<any> {
  return this.http.post(
    `${this.baseUrl}/admin/affiliates/${affiliateId}/pay`,
    { withdrawal_id: withdrawalId, notes },
    { headers: this.getAdminHeaders() }
  );
}
// ===== PAYMENT =====
initiatePayment(orderId: number): Observable<any> {
  return this.http.post(`${this.baseUrl}/payment/initiate`,
    { order_id: orderId },
    {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      })
    }
  );
}

checkPaymentStatus(orderId: number): Observable<any> {
  return this.http.get(`${this.baseUrl}/payment/status?order_id=${orderId}`);
}
createOrder(data: any): Observable<any> {
  return this.http.post(`${this.baseUrl}/orders`, data, {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  });
}
}