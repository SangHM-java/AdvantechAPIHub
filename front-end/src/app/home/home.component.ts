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
  messageForm: FormGroup;
  submitted = false;
  success = false;


  constructor(private data: DataService,private formBuilder: FormBuilder) {}

  // on init the Dataservice getUsers() function supplies a user array object.
  ngOnInit() {
    this.data.getUsers().subscribe(data => {
      this.users = data;
      console.log(this.users);
    });

    this.messageForm = this.formBuilder.group({
      name: ["", Validators.required],
      message: ["", Validators.required],
    });

    

  }

  // onSubmit method called when user submits the form
  onSubmit() {
    this.submitted = true;

    if (this.messageForm.invalid) {
      return;
    }
    this.success = true;
  }

  getDataFromAPI(){
    this.data.getDataFromAPI().subscribe(data => {
      console.log(data);
    });
  }
}
