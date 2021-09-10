import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: "root",
})
export class DataService {
  constructor(private http: HttpClient) {}


  headers= new HttpHeaders()
  .set('content-type', 'application/json')
  .set('Access-Control-Allow-Origin', '*');

  getUsers() {
    return this.http.get("http://smart.cpc.vn/etl/api/getInfoMeter?MA_DIEMDO=S1.01_AN&TU_NGAY=8/22/2021 6:41:12&DEN_NGAY=8/24/2021 6:41:12&TOKEN=cH1a4IwPgAF8TLbQiR3qAaZFHkoPubMKtK3JjYBVS2v1dn38rqFElShwlQGW0f6SZ4td80kfUTcqbsQRijz8k9KEh1i2HRHCnU181cCuPOmN5UeQkvqocsxAixEQTQCHGh5HVAJ1Aj/YkYcKzXeOYEI7uevRZZEb86VRrSnOB8=");
  }

  getConfigDatahub() {
    return this.http.get<any>('http://127.0.0.1:8080/getConfigDatahub');

  }

  connectToDatahub(nodeId,credentialKey,apiUrl) {
    return this.http.post<any>('http://127.0.0.1:8080/connectDatahub',
     { NodeId: nodeId,CredentialKey:credentialKey,ApiUrl:apiUrl});
  }

  disconnectDatahub() {
    return this.http.get('http://127.0.0.1:8080/disconnectDatahub');
  }

  getDataFromAPI() {
    return this.http.get<any>('http://127.0.0.1:8080/getDataFromAPI');

  }
  sendDataAPIToDatahub(){
    return this.http.get<any>('http://127.0.0.1:8080/sendDataAPIToDatahub');
  }
}
