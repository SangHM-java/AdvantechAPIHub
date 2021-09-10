import { Component, OnInit } from "@angular/core";
import { DataService } from "../data.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"]
})
export class HomeComponent implements OnInit {
  users: Object;
  apidata: Object;
  datahub_config: any;
  datahubForm: FormGroup;
  submitted = false;
  success = false;
  connectedStatus = "lightgrey";

  displayedColumns: string[] = ['id', 'name', 'description', 'count'];
  dataSource = [];

  nodeId = "c7c3ec15-8247-41b0-bd67-19d69e584bda";
  credentialKey = "9ee1f078e91a8ec2e747460324726ap6";
  apiUrl = "https://api-dccs-ensaas.sa.wise-paas.com/";


  constructor(private dataService: DataService, private formBuilder: FormBuilder, private _snackBar: MatSnackBar) { }

  // on init the Dataservice getUsers() function supplies a user array object.
  ngOnInit() {
    // this.data.getUsers().subscribe(data => {
    //   this.users = data;
    //   console.log(this.users);
    // });

    this.getConfigDatahub();

    this.datahubForm = this.formBuilder.group({
      nodeId: ["", Validators.required],
      credentialKey: ["", Validators.required],
      apiUrl: ["", Validators.required],
    });



  }

  // onSubmit method called when user submits the form
  onSubmit() {
    this.submitted = true;

    if (this.datahubForm.invalid) {
      return;
    }
    this.success = true;
  }

  connectDatahub() {

    //writeJsonFile('datahub_config.json', {nodeId: this.nodeId,credentialKey:this.credentialKey,apiUrl :this.apiUrl});

    this.dataService.connectToDatahub(this.nodeId, this.credentialKey, this.apiUrl).subscribe(data => {
      console.log(data);
      this.connectedStatus = "green";
    });
  }

  getDataFromAPI() {
    this.dataService.getDataFromAPI().subscribe(data => {
      console.log(data);
      this.apidata = data;
    });
  }

  getConfigDatahub() {
    this.dataService.getConfigDatahub().subscribe(data => {
      this.datahub_config = data.config;
      console.log(this.datahub_config);
      this.nodeId = this.datahub_config.NodeId;
      this.credentialKey = this.datahub_config.CredentialKey;
      this.apiUrl = this.datahub_config.ApiUrl;

    });
  }

  sendDataAPIToDatahub() {
    this.dataService.sendDataAPIToDatahub().subscribe(data => {
      console.log(data);
      this.dataSource = data.deviceList ;
      this._snackBar.open("Send data success!","OK");
    });
  }

  disconnectDatahub() {
    this.dataService.disconnectDatahub().subscribe(data => {
      this.connectedStatus = "lightgrey";
      this._snackBar.open("Disconnect success!","OK");
    });
  }
}
