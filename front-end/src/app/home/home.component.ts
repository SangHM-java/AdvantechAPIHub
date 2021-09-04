import { Component, OnInit } from "@angular/core";
import { DataService } from "../data.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import {FormControl} from '@angular/forms';

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"]
})
export class HomeComponent implements OnInit {
  users: Object;
  datahubForm: FormGroup;
  submitted = false;
  success = false;
  connectedStatus="lightgrey";

  nodeId="c7c3ec15-8247-41b0-bd67-19d69e584bda";
  credentialKey ="9ee1f078e91a8ec2e747460324726ap6";
  apiUrl = "https://api-dccs-ensaas.sa.wise-paas.com/";


  constructor(private data: DataService,private formBuilder: FormBuilder) {}

  // on init the Dataservice getUsers() function supplies a user array object.
  ngOnInit() {
    this.data.getUsers().subscribe(data => {
      this.users = data;
      console.log(this.users);
    });

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

  getDataFromAPI(){
    this.data.getDataFromAPI().subscribe(data => {
      console.log(data);
    });
  }

  connectDatahub(){
    this.data.connectToDatahub(this.nodeId,this.credentialKey,this.apiUrl).subscribe(data => {
      console.log(data);
      this.connectedStatus = "green";
    });
  }
}
