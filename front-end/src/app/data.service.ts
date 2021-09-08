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

  connectToDatahub(nodeId,credentialKey,apiUrl) {
    return this.http.post<any>('http://127.0.0.1:3600/connectDatahub',
     { NodeId: nodeId,CredentialKey:credentialKey,ApiUrl:apiUrl});
  }

  getDataFromAPI() {
    console.log('abcd')
    return this.http.get("http://smart.cpc.vn/etl/api/getInfoMeter?MA_DIEMDO=S1.01_AN&TU_NGAY=8/22/2021 6:41:12&DEN_NGAY=8/24/2021 6:41:12&TOKEN=vkRzNEVOtB4UsqrDOI3VEQY4/IQhg9r73hc7IOhfsgEsPjDjaGIrc0jr/n3cXUAzX17AlRr5wojLJb846vuQPckHeZbZh4sh7xOF3wx6I9F6snPS/U6jHNCEKePQN0W1lKy1UU1/fr0OXbg/pq6D4vjCKZldTxEMlQ2aifA=",{ 'headers': this.headers });
  }

}
