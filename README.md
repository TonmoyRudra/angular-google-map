# Google Map integration in Angular using AGM

# Table of Contents 
<ul>
<li>Introduction </li>
<li>Setting up a basic project structure</li>
<li>Install dependencies </li>
<li>Setting up @NgModule </li>
<li>Extending the app Component</li>
<li>Setup the template</li>
<li>Setup the CSS file</li>
<li>Build and Run your application</li>
<li>Github Repository</li>
<li>Conclusion</li>
</ul>

# Introduction

The google map integration in angular allows developers to show locations on google maps and information about location in the content window when we move the cursor over the marker.

# Setting up a basic project structure
Create an Angular CLI project
We start by creating a project with angular-cli. If you haven’t installed Angular CLI yet, please run the following command first:
<pre>
npm install -g @angular/cli
</pre>
Run the following commands to create a new Angular project with Angular CLI:
<pre>
ng new angular-google-maps
cd angular-google-maps
</pre>
# Install Dependencies
Install Angular Google Maps (short name: AGM) via the Node Package Manager (NPM). Run the following commands to add it to your new project:
<pre>
npm install @agm/core
npm i @types/googlemaps@3.39.13
</pre>
# Setting up @NgModule 
Open src/app/app.module.ts and import the AgmCoreModule. You need to provide a Google Maps API key to be able to see a Map. Get an API key <a href="https://developers.google.com/maps/documentation/javascript/get-api-key?hl=en#key" target="_blank">here</a>.
<pre>
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AgmCoreModule } from '@agm/core';
 
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
 
@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AgmCoreModule.forRoot({
      apiKey: ''
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
 </pre>


# Extending the app Component
Angular CLI already created an app component that we’ll now use to create our first google map. We have added markers array, set zoom level, default latitude, longitude and click marker event in the app component. Open the file src/app/app.component.ts and modify it like below:
<pre>
import { Component } from '@angular/core';
 
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent  {
  // google maps zoom level
  zoom: number = 8;
 
  // initial center position for the map
  lat: number = 51.673858;
  lng: number = 7.815982;
 
  clickedMarker(label: string, index: number) {
    console.log(`clicked the marker: ${label || index}`)
  }
 
  markers = [
      {
          lat: 51.673858,
          lng: 7.815982,
          label: "A",
          draggable: true
      },
      {
          lat: 51.373858,
          lng: 7.215982,
          label: "B",
          draggable: false
      },
      {
          lat: 51.723858,
          lng: 7.895982,
          label: "C",
          draggable: true
      }
  ]
}
</pre>

# Setup the template
use the code which we have shown int the src/app/app.component.html file in the github repository.

# Setup the CSS file
Open the file src/app/app.component.css and paste the following content:
<pre>
agm-map {
    height: 500px;
}
</pre>
# Build and Run your application
Run the below command in the project root folder:
<pre>
npm start
</pre>
Then, open the following URL in your browser: http://localhost:4200

When everything works as expected, you should see your first Google Map created with AGM
