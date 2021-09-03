import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class DataService {
  constructor(private http: HttpClient) {}

  getUsers() {
    return this.http.get("http://smart.cpc.vn/etl/api/getInfoMeter?MA_DIEMDO=S1.01_AN&TU_NGAY=8/22/2021 6:41:12&DEN_NGAY=8/24/2021 6:41:12&TOKEN=cH1a4IwPgAF8TLbQiR3qAaZFHkoPubMKtK3JjYBVS2v1dn38rqFElShwlQGW0f6SZ4td80kfUTcqbsQRijz8k9KEh1i2HRHCnU181cCuPOmN5UeQkvqocsxAixEQTQCHGh5HVAJ1Aj/YkYcKzXeOYEI7uevRZZEb86VRrSnOB8=");
  }

  connectToDatahub() {
    return this.http.get("https://reqres.in/api/users");
  }

  getDataFromAPI() {
    console.log('abcd')
    return this.http.get("https://127.0.0.1:3600/getData");
  }

}
