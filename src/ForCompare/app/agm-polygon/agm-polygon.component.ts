import { RectangleBox, PolygonBox, LatLng, StoreHouse, PolygonStored } from '../model/mapData.model';
import { MapService } from '../../service/map.service';

import { Component, OnInit } from '@angular/core';
import { hasLifecycleHook } from '@angular/compiler/src/lifecycle_reflector';
// import { Console } from 'console';
// import { AnyARecord } from 'dns';
declare const google: any;

@Component({
  selector: 'app-agm-polygon',
  templateUrl: './agm-polygon.component.html',
  styleUrls: ['./agm-polygon.component.css']
})

export class AgmPolygonComponent implements OnInit {

  zoom: number = 14;
  loaderShow = false;
  // initial center position for the map
  lat: number = 51.673858;
  lng: number = 7.815982;
  pointList: { lat: number; lng: number }[] = [];
  drawingManager: any;
  selectedShape: any;
  selectedArea = 0;
  mapEvent: any;
  rectangleBounds: any = [];
  placesMarkerList: any = [];
  all_overLays: any = [];
  marker1Ref: any;
  marker2Ref: any;
  rotateDegree: any = 0;

  //new added
  storeHouse: StoreHouse;


  //   selectedPolygon: PolygonBox; // selected Polygon to rotate and move.
  // selectedPolygonChildren: any =[];

  constructor(public mapServices: MapService) {

  }

  private setCurrentPosition() {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.lat = position.coords.latitude;
        this.lng = position.coords.longitude;
      });
    }
  }

  ngOnInit(): void {
    this.setCurrentPosition();
    this.storeHouse = new StoreHouse();
  }

  circleAdded(e: any) {
    console.log(e);
  }

  onMapReady(map: any) {
    this.mapEvent = map;
    this.initDrawingManager(map);
  }

  initDrawingManager = (map: google.maps.Map,) => {
    const self = this;
    const options = {
      drawingControl: true,
      drawingControlOptions: {
        drawingModes: ['marker'],
      },
      polygonOptions: {
        draggable: true,
        editable: true,

      },
      polylineOptions: {
        draggable: true,
        editable: true,

      },
      circleOptions: {
        draggable: true,
        editable: true,

      },
      markerOptions: {
        draggable: false,
        editable: true,
        // icon: {
        //   url: '../../assets/images/location.png',
        //   // This marker is 20 pixels wide by 32 pixels high.
        //   scaledSize: new google.maps.Size(20, 20),
        //   // // The origin for this image is (0, 0).
        //   origin: new google.maps.Point(0, 0),
        //   // // The anchor for this image is the base of the flagpole at (0, 32).
        //   anchor: new google.maps.Point(0, 10),
        // }
      },
      rectangleOptions: {
        draggable: true,
        editable: true,
        strokeColor: '#6c6c6c',
        strokeWeight: 3.5,
        fillColor: '#926239',
        fillOpacity: 0.6,
      }
      // whice one is active  on init.
    };
    this.drawingManager = new google.maps.drawing.DrawingManager(options);
    this.drawingManager.setMap(map);

    // this.tillAndRotateMap(map);

    google.maps.event.addListener(
      this.drawingManager,
      'overlaycomplete',
      (event: any) => {
        if (event.type === google.maps.drawing.OverlayType.POLYGON) {
          const paths = event.overlay.getPaths();
          for (let p = 0; p < paths.getLength(); p++) {
            google.maps.event.addListener(
              paths.getAt(p),
              'set_at',
              () => {
                if (!event.overlay.drag) {
                  self.updatePointList(event.overlay.getPath());
                }
              }
            );
            google.maps.event.addListener(
              paths.getAt(p),
              'insert_at',
              () => {
                self.updatePointList(event.overlay.getPath());
              }
            );
            google.maps.event.addListener(
              paths.getAt(p),
              'remove_at',
              () => {
                self.updatePointList(event.overlay.getPath());
              }
            );
          }
          self.updatePointList(event.overlay.getPath());
          this.selectedShape = event.overlay;
          this.selectedShape.type = event.type;
        }
        if (event.type === google.maps.drawing.OverlayType.RECTANGLE) {
          console.log("RECTANGLE Click", event)
          var north = event.overlay.bounds.toJSON().north;
          var south = event.overlay.bounds.toJSON().south;
          var east = event.overlay.bounds.toJSON().east;
          var west = event.overlay.bounds.toJSON().west;
          console.log('north:', north, 'south:', south, 'east: ', east, 'west:', west)
          //this.makeSqareBox(map, lat, lng);
        }

        if (event.type === google.maps.drawing.OverlayType.MARKER) {
          if (this.marker1Ref) {
            this.marker2Ref = event.overlay.position;
            this.getAngleFrom2Point(this.marker1Ref, this.marker2Ref, event);
          } else {
            this.marker1Ref = event.overlay.position;
          }
          //this.makeSqareBox(map, lat, lng);
        }
        if (event.type === google.maps.drawing.OverlayType.RECTANGLE) {
          //this.loaderShow = true;
          this.processDrawing(event, map);
        }
        if (event.type !== google.maps.drawing.OverlayType.MARKER) {
          // Switch back to non-drawing mode after drawing a shape.
          self.drawingManager.setDrawingMode(true);
          // To hide:
          self.drawingManager.setOptions({
            drawingControl: true,
          });
        }
      }
    );
  }

  processDrawing(event: any, map: any) {

    this.all_overLays.push(event.overlay);
    console.log("Marker Click", event)
    var lat = event.overlay.position.lat();
    var lng = event.overlay.position.lng();
    console.log(event.overlay.position.lat(), event.overlay.position.lng());

    const height = 1500; // HALF OF 3000, Because its count from center point. So Height calculate twice from given value
    const length = 2250; // HALF OF 4500, Because its count from center point. So length calculate twice from given value
    const eachCellHeight = 25.5; // Half of 51;
    const eachCellLength = 77.5; // Half of 155;


    // test
    // this.makeSqareBox(map, lat, lng, 3000, 4500,'#000000'); //battalion

    // var company1_lat = lat+0.009;
    // var company1_lng = lng-0.016;

    // this.makeSqareBox(map, lat+0.009, lng-0.016, 51*27, 155*13,'#000000'); //company-1

    // this.makeSqareBox(map, company1_lat+0.006, company1_lng, 51*6, 155*11,'#000000'); //platoon-1
    // this.makeSqareBox(map, company1_lat+0.006, company1_lng-0.008, 51*4, 155*3,'#000000'); //sector-1
    // this.makeSqareBox(map, company1_lat+0.006, company1_lng, 51*4, 155*3,'#000000'); //sector-2
    // this.makeSqareBox(map, company1_lat+0.006, company1_lng+0.008, 51*4, 155*3,'#000000'); //sector-3

    //test

    this.makeSqareBox(map, 1000000, lat, lng, height, length, '#000000'); //battalion
    this.getObstacleInRectangleBounds(lat, lng, height, length);


    var company1_lat = lat + 0.0045;
    var company1_lng = lng - 0.008;
    this.makeSqareBox(map, 1010000, company1_lat, company1_lng, eachCellHeight * 27, eachCellLength * 13, '#1160f2'); //company-1

    this.makeSqareBox(map, 1010100, company1_lat + 0.003, company1_lng, eachCellHeight * 6, eachCellLength * 11, '#cd11f2'); //platoon-1
    this.makeSqareBox(map, 1010101, company1_lat + 0.003, company1_lng - 0.004, eachCellHeight * 4, eachCellLength * 3, '#de0034'); //sector-1
    this.makeSqareBox(map, 1010102, company1_lat + 0.003, company1_lng, eachCellHeight * 4, eachCellLength * 3, '#de0034'); //sector-2
    this.makeSqareBox(map, 1010103, company1_lat + 0.003, company1_lng + 0.004, eachCellHeight * 4, eachCellLength * 3, '#de0034'); //sector-3

    this.makeSqareBox(map, 1010200, company1_lat, company1_lng, eachCellHeight * 6, eachCellLength * 11, '#cd11f2'); //platoon-2
    this.makeSqareBox(map, 1010201, company1_lat, company1_lng - 0.004, eachCellHeight * 4, eachCellLength * 3, '#de0034'); //sector-1
    this.makeSqareBox(map, 1010202, company1_lat, company1_lng, eachCellHeight * 4, eachCellLength * 3, '#de0034'); //sector-2
    this.makeSqareBox(map, 1010203, company1_lat, company1_lng + 0.004, eachCellHeight * 4, eachCellLength * 3, '#de0034'); //sector-3

    this.makeSqareBox(map, 1010300, company1_lat - 0.003, company1_lng, eachCellHeight * 6, eachCellLength * 11, '#cd11f2'); //platoon-3
    this.makeSqareBox(map, 1010301, company1_lat - 0.003, company1_lng - 0.004, eachCellHeight * 4, eachCellLength * 3, '#de0034'); //sector-1
    this.makeSqareBox(map, 1010302, company1_lat - 0.003, company1_lng, eachCellHeight * 4, eachCellLength * 3, '#de0034'); //sector-2
    this.makeSqareBox(map, 1010303, company1_lat - 0.003, company1_lng + 0.004, eachCellHeight * 4, eachCellLength * 3, '#de0034'); //sector-3

    var company2_lat = lat + 0.0045; // 0.0065
    var company2_lng = lng + 0.008; // 0.011
    this.makeSqareBox(map, 1020000, company2_lat, company2_lng, eachCellHeight * 27, eachCellLength * 13, '#1160f2'); //company-2

    this.makeSqareBox(map, 1020100, company2_lat + 0.003, company2_lng, eachCellHeight * 6, eachCellLength * 11, '#cd11f2'); //platoon-1
    this.makeSqareBox(map, 1020101, company2_lat + 0.003, company2_lng - 0.004, eachCellHeight * 4, eachCellLength * 3, '#de0034'); //sector-1
    this.makeSqareBox(map, 1020102, company2_lat + 0.003, company2_lng, eachCellHeight * 4, eachCellLength * 3, '#de0034'); //sector-2
    this.makeSqareBox(map, 1020103, company2_lat + 0.003, company2_lng + 0.004, eachCellHeight * 4, eachCellLength * 3, '#de0034'); //sector-3

    this.makeSqareBox(map, 1020200, company2_lat, company2_lng, eachCellHeight * 6, eachCellLength * 11, '#cd11f2'); //platoon-2
    this.makeSqareBox(map, 1020201, company2_lat, company2_lng - 0.004, eachCellHeight * 4, eachCellLength * 3, '#de0034'); //sector-1
    this.makeSqareBox(map, 1020202, company2_lat, company2_lng, eachCellHeight * 4, eachCellLength * 3, '#de0034'); //sector-2
    this.makeSqareBox(map, 1020203, company2_lat, company2_lng + 0.004, eachCellHeight * 4, eachCellLength * 3, '#de0034'); //sector-3

    this.makeSqareBox(map, 1020300, company2_lat - 0.003, company2_lng, eachCellHeight * 6, eachCellLength * 11, '#cd11f2'); //platoon-3
    this.makeSqareBox(map, 1020301, company2_lat - 0.003, company2_lng - 0.004, eachCellHeight * 4, eachCellLength * 3, '#de0034'); //sector-1
    this.makeSqareBox(map, 1020302, company2_lat - 0.003, company2_lng, eachCellHeight * 4, eachCellLength * 3, '#de0034'); //sector-2
    this.makeSqareBox(map, 1020303, company2_lat - 0.003, company2_lng + 0.004, eachCellHeight * 4, eachCellLength * 3, '#de0034'); //sector-3

    var company3_lat = lat - 0.0045;
    var company3_lng = lng + 0.008;
    this.makeSqareBox(map, 1030000, company3_lat, company3_lng, eachCellHeight * 27, eachCellLength * 13, '#1160f2'); //company-3

    this.makeSqareBox(map, 1030100, company3_lat + 0.003, company3_lng, eachCellHeight * 6, eachCellLength * 11, '#cd11f2'); //platoon-1
    this.makeSqareBox(map, 1030101, company3_lat + 0.003, company3_lng - 0.004, eachCellHeight * 4, eachCellLength * 3, '#de0034'); //sector-1
    this.makeSqareBox(map, 1030102, company3_lat + 0.003, company3_lng, eachCellHeight * 4, eachCellLength * 3, '#de0034'); //sector-2
    this.makeSqareBox(map, 1030103, company3_lat + 0.003, company3_lng + 0.004, eachCellHeight * 4, eachCellLength * 3, '#de0034'); //sector-3

    this.makeSqareBox(map, 1030200, company3_lat, company3_lng, eachCellHeight * 6, eachCellLength * 11, '#cd11f2'); //platoon-2
    this.makeSqareBox(map, 1030201, company3_lat, company3_lng - 0.004, eachCellHeight * 4, eachCellLength * 3, '#de0034'); //sector-1
    this.makeSqareBox(map, 1030202, company3_lat, company3_lng, eachCellHeight * 4, eachCellLength * 3, '#de0034'); //sector-2
    this.makeSqareBox(map, 1030203, company3_lat, company3_lng + 0.004, eachCellHeight * 4, eachCellLength * 3, '#de0034'); //sector-3

    this.makeSqareBox(map, 1030300, company3_lat - 0.003, company3_lng, eachCellHeight * 6, eachCellLength * 11, '#cd11f2'); //platoon-3
    this.makeSqareBox(map, 1030301, company3_lat - 0.003, company3_lng - 0.004, eachCellHeight * 4, eachCellLength * 3, '#de0034'); //sector-1
    this.makeSqareBox(map, 1030302, company3_lat - 0.003, company3_lng, eachCellHeight * 4, eachCellLength * 3, '#de0034'); //sector-2
    this.makeSqareBox(map, 1030303, company3_lat - 0.003, company3_lng + 0.004, eachCellHeight * 4, eachCellLength * 3, '#de0034'); //sector-3

    var company4_lat = lat - 0.0045;
    var company4_lng = lng - 0.008;
    this.makeSqareBox(map, 1040000, company4_lat, company4_lng, eachCellHeight * 27, eachCellLength * 13, '#1160f2'); //company-4

    this.makeSqareBox(map, 1040100, company4_lat + 0.003, company4_lng, eachCellHeight * 6, eachCellLength * 11, '#cd11f2'); //platoon-1
    this.makeSqareBox(map, 1040101, company4_lat + 0.003, company4_lng - 0.004, eachCellHeight * 4, eachCellLength * 3, '#de0034'); //sector-1
    this.makeSqareBox(map, 1040102, company4_lat + 0.003, company4_lng, eachCellHeight * 4, eachCellLength * 3, '#de0034'); //sector-2
    this.makeSqareBox(map, 1040103, company4_lat + 0.003, company4_lng + 0.004, eachCellHeight * 4, eachCellLength * 3, '#de0034'); //sector-3

    this.makeSqareBox(map, 1040200, company4_lat, company4_lng, eachCellHeight * 6, eachCellLength * 11, '#cd11f2'); //platoon-2
    this.makeSqareBox(map, 1040201, company4_lat, company4_lng - 0.004, eachCellHeight * 4, eachCellLength * 3, '#de0034'); //sector-1
    this.makeSqareBox(map, 1040202, company4_lat, company4_lng, eachCellHeight * 4, eachCellLength * 3, '#de0034'); //sector-2
    this.makeSqareBox(map, 1040203, company4_lat, company4_lng + 0.004, eachCellHeight * 4, eachCellLength * 3, '#de0034'); //sector-3

    this.makeSqareBox(map, 1040300, company4_lat - 0.003, company4_lng, eachCellHeight * 6, eachCellLength * 11, '#cd11f2'); //platoon-3
    this.makeSqareBox(map, 1040301, company4_lat - 0.003, company4_lng - 0.004, eachCellHeight * 4, eachCellLength * 3, '#de0034'); //sector-1
    this.makeSqareBox(map, 1040302, company4_lat - 0.003, company4_lng, eachCellHeight * 4, eachCellLength * 3, '#de0034'); //sector-2
    this.makeSqareBox(map, 1040303, company4_lat - 0.003, company4_lng + 0.004, eachCellHeight * 4, eachCellLength * 3, '#de0034'); //sector-3

    // set drawing mode null and restore
    this.drawingManager.setMap(null);
    this.initDrawingManager(this.mapEvent);
  }

  makeSqareBox(map: google.maps.Map, idparam: number, lat: number, lng: number, height: number, length: number, strockColor: any, fillColor: any = "#00000000") {
    // var model: RectangleBox = {
    //   id: 0,
    //   lat: 0,
    //   lng: 0,
    //   height: 0,
    //   length: 0,
    //   strockColor: '',
    //   fillColor: ''
    // };

    // model.id = idparam;
    // model.lat = lat;
    // model.lng = lng;
    // model.height = height;
    // model.length = length;
    // model.strockColor = strockColor;
    // model.fillColor = fillColor;

    // this.mapServices.storeMapData(model);


    var infoWindow: google.maps.InfoWindow;

    //var rectangle: google.maps.Rectangle;
    var rectangle: google.maps.Polygon;

    var point = new google.maps.LatLng(lat, lng);
    this.rotateDegree = 0;
    rectangle = this.DrawPolygon(point, height, length, height, length, this.rotateDegree, 4, strockColor, 2, 1, fillColor, 1, {}, true, idparam);
    //rectangle = this.DrawRectangle(point, height, length, height, length, 0, 4, strockColor, 2, 1,fillColor, 1, {}, true);
    this.all_overLays.push(rectangle); // store all for bulk delete
    rectangle.setMap(map);
    // Define an info window on the map.
    infoWindow = new google.maps.InfoWindow();
    //console.log(this.rectangleBounds);

    // console.log(tiltedRectangle1.getPaths())
    // console.log(tiltedRectangle1.getPath().getArray())
    // Add an event listener on the rectangle.

    rectangle.addListener("bounds_changed", showInfoWindowWithlatLng);
    rectangle.addListener("mouseover", showInfoWindowWithlatLng);
    rectangle.addListener("mouseout", (event: any) => {
      console.log(event);
      infoWindow.close();
    });
    // rectangle.addListener("click", (event: any) => {
    //   console.log(event);
    //   //this.rotatePolygon(rectangle, 35);
    // });
    rectangle.addListener("drag", (event: any) => {
      console.log("drag", event);
      this.dragBox(event);
    });
    //tiltedRectangle2.setMap(map);

    function showInfoWindowWithlatLng(e: any) {
      // const ne = rectangle.get
      // const sw = rectangle.getBounds()!.getSouthWest();

      // const contentString =
      //   "<b>Selected Region:</b><br>" +
      //   "Top right: " +
      //   ne.lat() +
      //   ", " +
      //   ne.lng() +
      //   "<br>" +
      //   "Bottom left: " +
      //   sw.lat() +
      //   ", " +
      //   sw.lng();

      // // Set the info window's content and position.
      // infoWindow.setContent(contentString);
      // infoWindow.setPosition(ne);
      // infoWindow.open(map);

      // const ne = rectangle.getBounds()!.getNorthEast();
      // const sw = rectangle.getBounds()!.getSouthWest();

      // const contentString =
      //   "<b>Selected Region:</b><br>" +
      //   "Top right: " +
      //   ne.lat() +
      //   ", " +
      //   ne.lng() +
      //   "<br>" +
      //   "Bottom left: " +
      //   sw.lat() +
      //   ", " +
      //   sw.lng();

      // // Set the info window's content and position.
      // infoWindow.setContent(contentString);
      // infoWindow.setPosition(ne);
      // infoWindow.open(map);
    }
  }

  dragBox(e: any) {
    console.log()
  }

  // Draw Polygon (1)
  DrawPolygon(point: any, r1: any, r2: any, r3: any, r4: any, rotation: any, vertexCount: any, strokeColour: any, strokeWeight: any, Strokepacity: any,
    fillColour: any, fillOpacity: any, opts: any, tilt: any, idparam: number) {
    var modelPloy: PolygonBox = {
      id: 0,
      latlng: [],
      height: 0,
      length: 0,
      strokeColor: '',
      fillColor: '',
      pointLat: 0,
      pointLng: 0,
      fillOpacity: 0,
      strokeOpacity: 0,
      strokeWeight: 0,
      polygonMap: null
    };

    modelPloy.id = idparam;
    modelPloy.height = r1;
    modelPloy.length = r2;
    modelPloy.strokeColor = strokeColour;
    modelPloy.fillColor = fillColour;
    modelPloy.pointLat = point.lat();
    modelPloy.pointLng = point.lng();
    modelPloy.fillOpacity = fillOpacity;
    modelPloy.strokeOpacity = Strokepacity;
    modelPloy.strokeWeight = strokeWeight;

    // Store Local

    var rot = -rotation * Math.PI / 180;
    var points = [];
    var latConv = google.maps.geometry.spherical.computeDistanceBetween(point, new google.maps.LatLng(point.lat() + 0.1, point.lng())) * 10;
    var lngConv = google.maps.geometry.spherical.computeDistanceBetween(point, new google.maps.LatLng(point.lat(), point.lng() + 0.1)) * 10;
    var step = (360 / vertexCount) || 10;

    var flop = -1;
    if (tilt) {
      var I1 = 180 / vertexCount;
    } else {
      var I1 = 0;
    }
    for (var i = I1; i <= 360; i += step) {
      var r1a = flop ? r1 : r3;
      var r2a = flop ? r2 : r4;
      flop = -1 - flop;
      var y = r1a * Math.cos(i * Math.PI / 180);
      var x = r2a * Math.sin(i * Math.PI / 180);
      var lng = (x * Math.cos(rot) - y * Math.sin(rot)) / lngConv;
      var lat = (y * Math.cos(rot) + x * Math.sin(rot)) / latConv;

      points.push(new google.maps.LatLng(point.lat() + lat, point.lng() + lng));

      modelPloy.latlng.push({ lat: point.lat() + lat, lng: point.lng() + lng }); // store local
    }
    console.log(points.length)
    points.forEach(element => {
      console.log('lat', element.lat());
      console.log('lng', element.lng());
      //this.createMarker([{lat: element.lat(), lng: element.lng(), type: 'hospital'}])
    });

    let poly = new google.maps.Polygon({
      paths: points,
      draggable: true,
      editable: true,
      strokeColor: strokeColour,
      strokeWeight: strokeWeight,
      strokeOpacity: Strokepacity,
      fillColor: fillColour,
      fillOpacity: fillOpacity
    });

    let polygonStored: PolygonStored = {
      id: modelPloy.id,
      polygonMap: poly
    };

    // store at Local storage and Global Variable
    this.mapServices.storeMapData(modelPloy);
    this.storePolygonAtGlobalVariable(polygonStored);

    return (poly)
  }

  // Draw Polygon (2)
  DrawPolygonFromPolygonBoxModel(modelPloy: PolygonBox) {

    // (a) store at local storage for future use.
    this.mapServices.storeMapData(modelPloy);

    // (b) Draw Polygon
    return (new google.maps.Polygon({
      paths: modelPloy.latlng,
      draggable: true,
      editable: true,
      strokeColor: modelPloy.strokeColor,
      strokeWeight: modelPloy.strokeWeight,
      strokeOpacity: modelPloy.strokeOpacity,
      fillColor: modelPloy.fillColor,
      fillOpacity: modelPloy.fillOpacity
    }))

  }

  DrawRectangle(point: any, r1: any, r2: any, r3: any, r4: any, rotation: any, vertexCount: any, strokeColour: any, strokeWeight: any, Strokepacity: any, fillColour: any, fillOpacity: any, opts: any, tilt: any) {

    // var NORTH = 0;
    // var WEST = -90;
    // var SOUTH = 180;
    // var EAST = 90;
    var southWest_LatLng = new google.maps.LatLng(
      google.maps.geometry.spherical.computeOffset(point, r1, 180).lat(),  // South
      google.maps.geometry.spherical.computeOffset(point, r2, -90).lng()); // west);

    var northEast_latlng = new google.maps.LatLng(
      google.maps.geometry.spherical.computeOffset(point, r1, 0).lat(), // North
      google.maps.geometry.spherical.computeOffset(point, r2, 90).lng());// East

    var bounds = new google.maps.LatLngBounds(southWest_LatLng, northEast_latlng);

    return (new google.maps.Rectangle({
      bounds: bounds,
      draggable: true,
      editable: true,
      clickable: true,
      strokeColor: strokeColour,
      strokeWeight: strokeWeight,
      strokeOpacity: Strokepacity,
      fillColor: fillColour,
      fillOpacity: fillOpacity,
    }))
  }

  getObstacleInRectangleBounds(lat: any, lng: any, height: any, length: any) {
    this.loaderShow = true;

    var pointLat = lat;
    var pointLng = lng;

    var point = new google.maps.LatLng(lat, lng);
    var south_Lat = google.maps.geometry.spherical.computeOffset(point, height, 180).lat();
    var south_Lng = google.maps.geometry.spherical.computeOffset(point, height, 180).lng();

    var north_Lat = google.maps.geometry.spherical.computeOffset(point, height, 0).lat();
    var north_Lng = google.maps.geometry.spherical.computeOffset(point, height, 0).lng();

    var west_Lat = google.maps.geometry.spherical.computeOffset(point, length, -90).lat();
    var west_Lng = google.maps.geometry.spherical.computeOffset(point, length, -90).lng();

    var east_Lat = google.maps.geometry.spherical.computeOffset(point, length, 90).lat();
    var east_Lng = google.maps.geometry.spherical.computeOffset(point, length, 90).lng();

    console.log(south_Lat, south_Lng, west_Lat, west_Lng, north_Lat, north_Lng, east_Lat, east_Lng);

    const formData = new FormData();
    formData.append('lat', pointLat);
    formData.append('lng', pointLng);
    formData.append('rightupperpoint_lat', south_Lat);
    formData.append('rightupperpoint_lng', south_Lng);
    formData.append('upperleftpoint_lat', west_Lat);
    formData.append('upperleftpoint_lng', west_Lng);
    formData.append('leftdownpoint_lat', north_Lat);
    formData.append('leftdownpoint_lng', north_Lng);
    formData.append('downrightpoint_lat', east_Lat);
    formData.append('downrightpoint_lng', east_Lng);

    this.mapServices.getPlacesLocations(formData).subscribe((result) => {
      console.log(result);
      this.loaderShow = false;
      if (result.length > 0) {
        this.loaderShow = false;
        this.placesMarkerList = result;
        localStorage.setItem('placesApiCall_Data', JSON.stringify(this.placesMarkerList));
        this.createMarker(this.placesMarkerList);
      }
    }, err => {
      console.log(err)
      this.loaderShow = false;
    });
  }

  createMarker(markerList: any[]) {
    markerList.forEach(marker => {
      var infoWindow: google.maps.InfoWindow;
      infoWindow = new google.maps.InfoWindow();

      var markerView: google.maps.Marker;
      const markerLatLng = { lat: marker.lat, lng: marker.lng };
      var markerIcon = '../../assets/images/location.png';
      if (marker.type == 'school') {
        markerIcon = '../../assets/images/school.png'
      }
      else if (marker.type == 'hospital') {
        markerIcon = '../../assets/images/hospital.png'
      }
      else if (marker.type == 'mosque') {
        markerIcon = '../../assets/images/mosque.png'
      }
      else {
        markerIcon = '../../assets/images/mosque.png'
      }
      const image = {
        url: markerIcon,
        // This marker is 20 pixels wide by 32 pixels high.
        scaledSize: new google.maps.Size(40, 50),
        // // The origin for this image is (0, 0).
        origin: new google.maps.Point(0, 0),
        // // The anchor for this image is the base of the flagpole at (0, 32).
        anchor: new google.maps.Point(0, 32),
      };
      markerView = new google.maps.Marker({
        position: markerLatLng,
        title: marker.locationName,
        icon: image,
      });

      this.all_overLays.push(markerView); // store all for bulk delete
      markerView.setMap(this.mapEvent);
      markerView.addListener("mouseover", (event: any) => {
        infoWindow.setContent(marker.locationName);
        infoWindow.setPosition(markerLatLng);
        //infoWindow.open(this.mapEvent);
      });
      markerView.addListener("mouseout", (event: any) => {
        console.log(event);
        infoWindow.close();
      });

    });

  }

  // Events //-----------------------------------

  selectPolygonTemp() {

    if (this.storeHouse.selectedPolygonParentID === 0) {
      this.storeHouse.selectedPolygonParentID = 1000000;
    }
    // keep selected polygon
    this.storeHouse.selectedPolygon = this.mapServices.getMapDataByID(this.storeHouse.selectedPolygonParentID);

    //select children
    this.selectChildrenPolygonAndKeepAtStoreHouse(this.storeHouse.selectedPolygonParentID);
    this.logNeededData();
  }

  rotateLeft() {
    this.rotatePolygonGroup(this.storeHouse.selectedPolygonParentID, -10, true);
  }

  rotateRight() {
    this.rotatePolygonGroup(this.storeHouse.selectedPolygonParentID, 10, false);
  }


  selectChildrenPolygonAndKeepAtStoreHouse(parentPolygonID: number) {
    console.log('selectChildrenPolygonAndKeepAtStoreHouse: parentPolygonID: ' + parentPolygonID);

    if (parentPolygonID % 1000000 == 0) //(1) is selected Battalion
    {
      console.log('selected Polygon:-- Battalion ');

      let topID = (Math.floor(parentPolygonID / 1000000) * 1000000) + Number(parentPolygonID);
      this.storeHouse.selectedPolygonChildren = this.getChildPolygonBetweenIdRange(parentPolygonID, topID);
    }
    else if (parentPolygonID % 10000 == 0)  //(2) is selected Company
    {
      console.log('selected Polygon:-- Company ');

      let topID = 10000 + Number(parentPolygonID);
      this.storeHouse.selectedPolygonChildren = this.getChildPolygonBetweenIdRange(parentPolygonID, topID);
    }
    else if (parentPolygonID % 100 == 0)  //(3) is selected Platon
    {
      console.log('selected Polygon:-- Platon ');

      let topID = 100 + Number(parentPolygonID);
      this.storeHouse.selectedPolygonChildren = this.getChildPolygonBetweenIdRange(parentPolygonID, topID);
    }
    else   //(4) is selected Section
    {
      console.log('selected Polygon:-- Section ');

      this.storeHouse.selectedPolygonChildren = this.getChildPolygonBetweenIdRange(parentPolygonID, parentPolygonID);
    }

    //debug
    var testChildCount: any = 0;
    this.storeHouse.selectedPolygonChildren.forEach(selectedPolygonChild => {
      testChildCount++;
      console.log('selected Child - ' + testChildCount + ' : ' + selectedPolygonChild.id);
    });

  }

  // Get Children Polygons in between ID range
  getChildPolygonBetweenIdRange(parentPolygonID: number, topID: number) {
    console.log('Get Polygons by ID range: ' + parentPolygonID + ', ' + topID);
    let listPolygonAtLocalStorage = JSON.parse(this.mapServices.getMapData());
    let result = listPolygonAtLocalStorage.filter((polygon: PolygonBox) => polygon.id > parentPolygonID && polygon.id < topID);
    return result;
  }

  deleteSelectedShape() {

    this.drawingManager.setMap(null);
    this.initDrawingManager(this.mapEvent);
  }

  deleteAllShape() {
    for (var i = 0; i < this.all_overLays.length; i++) {
      this.all_overLays[i].setMap(null);
    }
    this.all_overLays = [];
  }

  //********** this is not working as Polygon from rectangle */
  drawFromLocalStorage() {
    console.log(this.mapServices.getMapData());
    var mapData = this.mapServices.getMapData();  // JSON.parse(this.mapServices.getMapData());

    // // // if (mapData.length > 0) {
    // // //   mapData.forEach((data: RectangleBox) => {
    // // //     this.makeSqareBox(this.mapEvent, data.lat, data.lng, data.height, data.length, data.strockColor, data.fillColor);
    // // //   });
    // // // }

    var placesApiReqBody = JSON.parse(localStorage.getItem('placesApiCall_Data')!);
    this.createMarker(placesApiReqBody);
    // this.getObstacleInRectangleBounds(placesApiReqBody.lat, placesApiReqBody.lng, placesApiReqBody.height, placesApiReqBody.length);
  } drawFromLocalStorage2() {


    console.log(this.mapServices.getMapData());
    var mapData = this.mapServices.getMapData();   // JSON.parse(this.mapServices.getMapData());

    if (mapData.length > 0) {
      mapData.forEach((data: PolygonBox) => {
        // this.makeSqareBox(this.mapEvent, data.lat, data.lng, data.height, data.length, data.strockColor, data.fillColor);
      });
    }

    var placesApiReqBody = JSON.parse(localStorage.getItem('placesApiCall_Data')!);
    this.createMarker(placesApiReqBody);
    // this.getObstacleInRectangleBounds(placesApiReqBody.lat, placesApiReqBody.lng, placesApiReqBody.height, placesApiReqBody.length);
  }

  updatePointList(path: any) {
    this.pointList = [];
    const len = path.getLength();
    for (let i = 0; i < len; i++) {
      this.pointList.push(
        path.getAt(i).toJSON()
      );
      console.log(this.pointList);
    }
    this.selectedArea = google.maps.geometry.spherical.computeArea(
      path
    );
  }

  // getcenter(polygon: google.maps.Polygon) {
  //   debugger;

  //   //create bounds
  //   var bounds = new google.maps.LatLngBounds();
  //   var paths = polygon.getPaths();
  //   var path;

  //   for (var p = 0; p < paths.getLength(); p++) {
  //     path = paths.getAt(p);
  //     for (var i = 0; i < path.getLength(); i++) {
  //       bounds.extend(path.getAt(i));
  //     }
  //   }

  //   //get center
  //   let cen = bounds.getCenter();
  //   console.log('Center center: ' + cen);
  // }

  //******************************************************* Move*********************************** */

  moveUp() {
    this.movePolygonGroup(this.storeHouse.selectedPolygonParentID, 0, (-1 * this.storeHouse.moveDisplacementAmount));
  }
  moveLeft() {
    this.movePolygonGroup(this.storeHouse.selectedPolygonParentID, (-1 * this.storeHouse.moveDisplacementAmount), 0);
  }
  moveRight() {
    this.movePolygonGroup(this.storeHouse.selectedPolygonParentID, (1 * this.storeHouse.moveDisplacementAmount), 0);
  }
  moveDown() {
    this.movePolygonGroup(this.storeHouse.selectedPolygonParentID, 0, (1 * this.storeHouse.moveDisplacementAmount));
  }

  movePolygonGroupOnMouseMove(polygonID: number, x1: number, y1: number, x2: number, y2: number) {

    console.log('===================> Moving parent ID: ' + polygonID);
    // (3) Get move displacement
    var xDisplacement: number = x2 - x1;
    var yDisplacement: number = y2 - y1;

    this.movePolygonGroup(polygonID, xDisplacement, yDisplacement);
  }

  movePolygonGroup(polygonID: number, xDisplacement: number, yDisplacement: number) {

    console.log('===================> Moving parent ID: ' + polygonID);
    debugger;

    let polyMapDrawParent: PolygonStored = new PolygonStored();
    polyMapDrawParent.id = 0;
    polyMapDrawParent.polygonMap = new google.maps.Polygon;

    console.log('Calling id: ' + polygonID);
    polyMapDrawParent = this.getPolygonMapDrawed(polygonID);
    console.log('polyMapDrawParent.polygonMap:  with id: ' + polyMapDrawParent.id + ', ' + polyMapDrawParent.polygonMap);

    let map = polyMapDrawParent.polygonMap.getMap();
    var prj = map.getProjection();


    // (2) Get all children
    this.selectChildrenPolygonAndKeepAtStoreHouse(polygonID);

    // (3) Move Parent Polygon
    this.movePolygon(prj, polygonID, xDisplacement, yDisplacement);

    // (4) Move all child Polygons
    this.storeHouse.selectedPolygonChildren.forEach(polygon => {
      this.movePolygon(prj, polygon.id, xDisplacement, yDisplacement);
    });

  }

  movePolygon(prj: any, polygonID: number, xMove: number, yMove: number): any {
    console.log('----> Move single Poly: ' + prj + ',' + polygonID + ', ' + xMove + ', ' + yMove);

    debugger;

    let polyMapDraw: PolygonStored = this.getPolygonMapDrawed(polygonID);

    //(a) Get rotated coordinates
    var coords = polyMapDraw.polygonMap.getPath().getArray().map(function (latLng: any) {
      var point = prj.fromLatLngToPoint(latLng);

      var movedPoints = movePoint(point, xMove, yMove);
      var movedLatLng = prj.fromPointToLatLng(movedPoints);
      return { lat: movedLatLng.lat(), lng: movedLatLng.lng() };
    });

    //(b) Set new coordinates
    console.log('New coords to set: ' + coords.length);

    console.log('New coords to set: ' + coords[0].lat + ', ' + coords[0].lng);
    console.log('New coords to set: ' + coords[1].lat + ', ' + coords[1].lng);
    console.log('New coords to set: ' + coords[2].lat + ', ' + coords[2].lng);
    console.log('New coords to set: ' + coords[3].lat + ', ' + coords[3].lng);

    polyMapDraw.polygonMap.setPath(coords);
    console.log('Move done - single Poly id: ' + polyMapDraw.id);

    //(c) Move : function
    function movePoint(point: any, xMove: number, yMove: number): any {
      return {
        x: point.x + xMove,
        y: point.y + yMove
      };
    }

  }


  //****************************************** Rotation ***************************************** */

  rotatePolygonGroup(polygonID: number, angle: any, rorateLeft: boolean) {

    console.log('===================> Rotating parent ID: ' + polygonID);
    debugger;

    let polyMapDrawParent: PolygonStored = new PolygonStored();
    polyMapDrawParent.id = 0;
    polyMapDrawParent.polygonMap = new google.maps.Polygon;

    console.log('Calling id: ' + polygonID);
    polyMapDrawParent = this.getPolygonMapDrawed(polygonID);
    console.log('polyMapDrawParent.polygonMap:  with id: ' + polyMapDrawParent.id + ', ' + polyMapDrawParent.polygonMap);

    var rotatingCenter: any;
    // var kk = this.getcenter(polyMapDrawParent.polygonMap);

    // var origin = prj.fromLatLngToPoint(polygonParent.getPath().getAt(0)); //rotate around first point
    //var rotatingCenter: any;
    let map = polyMapDrawParent.polygonMap.getMap();
    var prj = map.getProjection();

    //***************jafar : work here */
    //get center
    var rotatingCenterLatLng: google.maps.LatLng = this.getPolygonCenter(polyMapDrawParent.polygonMap)
    rotatingCenter = prj?.fromLatLngToPoint(rotatingCenterLatLng);

    // // (1) rotate left or right
    // if (rorateLeft) {
    //   rotatingCenter = prj?.fromLatLngToPoint(polyMapDrawParent.polygonMap.getPath().getAt(1));
    // }
    // else {
    //   rotatingCenter = prj?.fromLatLngToPoint(polyMapDrawParent.polygonMap.getPath().getAt(0));
    // }

    console.log('rotatingCenter : ' + rotatingCenter);

    // (2) Get all children
    this.selectChildrenPolygonAndKeepAtStoreHouse(polygonID);

    // (3) Rotate Parent Polygon
    this.rotatePolygon(prj, polygonID, rotatingCenter, angle);

    // (4) Rotate all child Polygons
    this.storeHouse.selectedPolygonChildren.forEach(polygon => {
      this.rotatePolygon(prj, polygon.id, rotatingCenter, angle);
    });

  }


  rotatePolygon(prj: any, polygonID: number, centerOfRotate: any, angle: any): any {

    console.log('----> Rotate single Poly: ' + prj + ',' + polygonID + ', ' + centerOfRotate + ', ' + angle);

    debugger;

    let polyMapDraw: PolygonStored = this.getPolygonMapDrawed(polygonID);

    //(a) Get rotated coordinates
    var coords = polyMapDraw.polygonMap.getPath().getArray().map(function (latLng: any) {
      var point = prj.fromLatLngToPoint(latLng);

      var rotatedPoints = rotatePoint(point, centerOfRotate, angle);
      var rotatedLatLng = prj.fromPointToLatLng(rotatedPoints);
      return { lat: rotatedLatLng.lat(), lng: rotatedLatLng.lng() };
    });

    //(b) Set new coordinates
    polyMapDraw.polygonMap.setPath(coords);
    console.log('Rotate done - single Poly id: ' + polyMapDraw.id);

    //(c) Rotate : function
    function rotatePoint(point: any, origin: any, angle: any): any {
      var angleRad = angle * Math.PI / 180.0;
      return {
        x: Math.cos(angleRad) * (point.x - origin.x) - Math.sin(angleRad) * (point.y - origin.y) + origin.x,
        y: Math.sin(angleRad) * (point.x - origin.x) + Math.cos(angleRad) * (point.y - origin.y) + origin.y
      };
    }
  }

  // rotatePolygon(prj: any, polygonID: number, centerOfRotate: google.maps.LatLng, angle: any): any {
  //   console.log('----> Rotate single Poly: ' + prj + ',' + polygonID + ', ' + centerOfRotate + ', ' + angle);

  //   // debugger;

  //   let polyMapDraw: PolygonStored = this.getPolygonMapDrawed(polygonID);

  //   //(a) Get rotated coordinates
  //   var coords = polyMapDraw.polygonMap.getPath().getArray().map(function (latLng: any) {
  //     var point = prj.fromLatLngToPoint(latLng);
  //     debugger;

  //     var rotatedPoints = rotatePoint(point, { x: centerOfRotate.lat(), y: centerOfRotate.lng() }, angle);
  //     var rotatedLatLng = prj.fromPointToLatLng(rotatedPoints);
  //     return { lat: rotatedLatLng.lat(), lng: rotatedLatLng.lng() };
  //   });

  //   //(b) Set new coordinates
  //   polyMapDraw.polygonMap.setPath(coords);
  //   console.log('Rotate done - single Poly id: ' + polyMapDraw.id);

  //   //(c) Rotate : function
  //   function rotatePoint(point: any, center: any, angle: any): any {
  //     console.log('Rotate by center: ' + center.x + ', ' + center.y);
  //     debugger;

  //     var angleRad = angle * Math.PI / 180.0;
  //     return {
  //       x: Math.cos(angleRad) * (point.x - center.x) - Math.sin(angleRad) * (point.y - center.y) + center.x,
  //       y: Math.sin(angleRad) * (point.x - center.x) + Math.cos(angleRad) * (point.y - center.y) + center.y
  //     };
  //   }
  // }

  getAngleFrom2Point(point1: any, point2: any, markerEvent: any) {
    // var dx = point1.lng() - point1.lat();
    // var dy = point2.lng() - point2.lat();
    // var ang = Math.atan2(dy, dx) * 180 / Math.PI;

    this.rotateDegree = google.maps.geometry.spherical.computeHeading(point1, point2);
    console.log("marker heading", this.rotateDegree);

    this.processDrawing(markerEvent, this.mapEvent);
  }

  storePolygonAtGlobalVariable(polygon: PolygonStored) {
    console.log('Save at PolygonStored: ' + polygon.id + ', ' + polygon.polygonMap);

    // (a) Remove first if already exist
    this.storeHouse.polygonStoredList.forEach((item, index) => {
      if (item.id === polygon.id) this.storeHouse.polygonStoredList.splice(index, 1);
    });
    console.log('after remove polygonStoredList: ' + this.storeHouse.polygonStoredList.length);

    // (b) Add model-PolygonStored
    this.storeHouse.polygonStoredList.push(polygon);
    console.log('after add polygonStoredList: ' + this.storeHouse.polygonStoredList.length);
  }

  getPolygonStoredGlobalVariable() {
    return this.storeHouse.polygonStoredList;
  }

  getPolygonMapDrawed(id: number): PolygonStored {

    debugger;

    console.log('getPolygonMapDrawed: id: ' + id);

    let polygonStored: PolygonStored = new PolygonStored();
    polygonStored.id = 0;
    polygonStored.polygonMap = new google.maps.Polygon;

    console.log('polygonStoredList: ' + this.storeHouse.polygonStoredList.length);
    //Duplicate work:
    this.storeHouse.polygonStoredList.forEach((polygonStoredTemp: PolygonStored) => {
      if (polygonStoredTemp.id == id) {
        polygonStored.id = polygonStoredTemp.id;
        polygonStored.polygonMap = polygonStoredTemp.polygonMap;
      }
    });

    // let polygonStoredTempLst = this.storeHouse.polygonStoredList
    //   .filter((poly: PolygonStored) => poly.id === id);

    // console.log('polygonStoredTempLst: ' + polygonStoredTempLst.length);
    // if (polygonStoredTempLst.length > 0) {
    //   polygonStored.id = polygonStoredTempLst[0].id;
    //   polygonStored.polygonMap = polygonStoredTempLst[0].polygonMap;
    // }

    console.log('got poly id: ' + polygonStored.id);
    return polygonStored;
  }

  getPolygonCenter(poly: google.maps.Polygon): google.maps.LatLng {
    console.log('________________________> Polygon center: ');

    console.log('Get Polygon center :' + poly);
    debugger;
    const vertices = poly.getPath();
    let lats: Number[] = [];
    let lngs: Number[] = [];

    for (let i = 0; i < vertices.getLength(); i++) {
      lats.push(vertices.getAt(i).lat());
      lngs.push(vertices.getAt(i).lng());
      console.log('Coordinates of Polygon: ' + vertices.getAt(i).lat() + ', ' + vertices.getAt(i).lng());
    }
    // // put all latitudes and longitudes in arrays
    // const longitudes = new Array(vertices.getLength()).map((_, i) => vertices.getAt(i).lng());
    // const latitudes = new Array(vertices.getLength()).map((_, i) => vertices.getAt(i).lat());

    // sort the arrays low to high
    lats.sort();
    lngs.sort();

    // get the min and max of each
    const lowX = lats[0];
    const highX = lats[lats.length - 1];
    const lowy = lngs[0];
    const highy = lngs[lats.length - 1];

    // center of the polygon is the starting point plus the midpoint
    const centerX = Number(lowX) + ((Number(highX) - Number(lowX)) / 2);
    const centerY = Number(lowy) + ((Number(highy) - Number(lowy)) / 2);
    console.log('Center of Polygon: ' + centerX + ', ' + centerY);

    return (new google.maps.LatLng(centerX, centerY));
  }

  logNeededData() {
    console.log('----------------------------------- show data -----------------------------');
    console.log('this.storeHouse.selectedPolygon.id: ' + this.storeHouse.selectedPolygon.id);
    console.log('this.storeHouse.selectedPolygonChildren.length: ' + this.storeHouse.selectedPolygonChildren.length);
    console.log('this.storeHouse.selectedPolygonParentID: ' + this.storeHouse.selectedPolygonParentID);

    console.log('this.storeHouse.polygonStoredList: ' + this.storeHouse.polygonStoredList.length);
    this.storeHouse.polygonStoredList.forEach(element => {
      console.log('this.storeHouse.polygonStoredList id wise:  ' + element.id);
    });
  }

}

