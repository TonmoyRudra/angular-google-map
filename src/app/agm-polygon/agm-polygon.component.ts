import { RectangleBox, PolygonBox, LatLng } from '../model/mapData.model';
import { MapService } from '../../service/map.service';

import { Component, OnInit } from '@angular/core';
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

    this.makeSqareBox(map, 0, lat, lng, height, length, '#000000'); //battalion
    this.getObstacleInRectangleBounds(lat, lng, height, length);


    var company1_lat = lat + 0.0045;
    var company1_lng = lng - 0.008;
    this.makeSqareBox(map, 10000, company1_lat, company1_lng, eachCellHeight * 27, eachCellLength * 13, '#1160f2'); //company-1

    this.makeSqareBox(map, 10100, company1_lat + 0.003, company1_lng, eachCellHeight * 6, eachCellLength * 11, '#cd11f2'); //platoon-1
    this.makeSqareBox(map, 10101, company1_lat + 0.003, company1_lng - 0.004, eachCellHeight * 4, eachCellLength * 3, '#de0034'); //sector-1
    this.makeSqareBox(map, 10102, company1_lat + 0.003, company1_lng, eachCellHeight * 4, eachCellLength * 3, '#de0034'); //sector-2
    this.makeSqareBox(map, 10103, company1_lat + 0.003, company1_lng + 0.004, eachCellHeight * 4, eachCellLength * 3, '#de0034'); //sector-3

    this.makeSqareBox(map, 10200, company1_lat, company1_lng, eachCellHeight * 6, eachCellLength * 11, '#cd11f2'); //platoon-2
    this.makeSqareBox(map, 10201, company1_lat, company1_lng - 0.004, eachCellHeight * 4, eachCellLength * 3, '#de0034'); //sector-1
    this.makeSqareBox(map, 10202, company1_lat, company1_lng, eachCellHeight * 4, eachCellLength * 3, '#de0034'); //sector-2
    this.makeSqareBox(map, 10203, company1_lat, company1_lng + 0.004, eachCellHeight * 4, eachCellLength * 3, '#de0034'); //sector-3

    this.makeSqareBox(map, 10300, company1_lat - 0.003, company1_lng, eachCellHeight * 6, eachCellLength * 11, '#cd11f2'); //platoon-3
    this.makeSqareBox(map, 10301, company1_lat - 0.003, company1_lng - 0.004, eachCellHeight * 4, eachCellLength * 3, '#de0034'); //sector-1
    this.makeSqareBox(map, 10302, company1_lat - 0.003, company1_lng, eachCellHeight * 4, eachCellLength * 3, '#de0034'); //sector-2
    this.makeSqareBox(map, 10303, company1_lat - 0.003, company1_lng + 0.004, eachCellHeight * 4, eachCellLength * 3, '#de0034'); //sector-3

    var company2_lat = lat + 0.0045; // 0.0065
    var company2_lng = lng + 0.008; // 0.011
    this.makeSqareBox(map, 20000, company2_lat, company2_lng, eachCellHeight * 27, eachCellLength * 13, '#1160f2'); //company-2

    this.makeSqareBox(map, 20100, company2_lat + 0.003, company2_lng, eachCellHeight * 6, eachCellLength * 11, '#cd11f2'); //platoon-1
    this.makeSqareBox(map, 20101, company2_lat + 0.003, company2_lng - 0.004, eachCellHeight * 4, eachCellLength * 3, '#de0034'); //sector-1
    this.makeSqareBox(map, 20102, company2_lat + 0.003, company2_lng, eachCellHeight * 4, eachCellLength * 3, '#de0034'); //sector-2
    this.makeSqareBox(map, 20103, company2_lat + 0.003, company2_lng + 0.004, eachCellHeight * 4, eachCellLength * 3, '#de0034'); //sector-3

    this.makeSqareBox(map, 20200, company2_lat, company2_lng, eachCellHeight * 6, eachCellLength * 11, '#cd11f2'); //platoon-2
    this.makeSqareBox(map, 20201, company2_lat, company2_lng - 0.004, eachCellHeight * 4, eachCellLength * 3, '#de0034'); //sector-1
    this.makeSqareBox(map, 20202, company2_lat, company2_lng, eachCellHeight * 4, eachCellLength * 3, '#de0034'); //sector-2
    this.makeSqareBox(map, 20203, company2_lat, company2_lng + 0.004, eachCellHeight * 4, eachCellLength * 3, '#de0034'); //sector-3

    this.makeSqareBox(map, 20300, company2_lat - 0.003, company2_lng, eachCellHeight * 6, eachCellLength * 11, '#cd11f2'); //platoon-3
    this.makeSqareBox(map, 20301, company2_lat - 0.003, company2_lng - 0.004, eachCellHeight * 4, eachCellLength * 3, '#de0034'); //sector-1
    this.makeSqareBox(map, 20302, company2_lat - 0.003, company2_lng, eachCellHeight * 4, eachCellLength * 3, '#de0034'); //sector-2
    this.makeSqareBox(map, 20303, company2_lat - 0.003, company2_lng + 0.004, eachCellHeight * 4, eachCellLength * 3, '#de0034'); //sector-3

    var company3_lat = lat - 0.0045;
    var company3_lng = lng + 0.008;
    this.makeSqareBox(map, 30000, company3_lat, company3_lng, eachCellHeight * 27, eachCellLength * 13, '#1160f2'); //company-3

    this.makeSqareBox(map, 30100, company3_lat + 0.003, company3_lng, eachCellHeight * 6, eachCellLength * 11, '#cd11f2'); //platoon-1
    this.makeSqareBox(map, 30101, company3_lat + 0.003, company3_lng - 0.004, eachCellHeight * 4, eachCellLength * 3, '#de0034'); //sector-1
    this.makeSqareBox(map, 30102, company3_lat + 0.003, company3_lng, eachCellHeight * 4, eachCellLength * 3, '#de0034'); //sector-2
    this.makeSqareBox(map, 30103, company3_lat + 0.003, company3_lng + 0.004, eachCellHeight * 4, eachCellLength * 3, '#de0034'); //sector-3

    this.makeSqareBox(map, 30200, company3_lat, company3_lng, eachCellHeight * 6, eachCellLength * 11, '#cd11f2'); //platoon-2
    this.makeSqareBox(map, 30201, company3_lat, company3_lng - 0.004, eachCellHeight * 4, eachCellLength * 3, '#de0034'); //sector-1
    this.makeSqareBox(map, 30202, company3_lat, company3_lng, eachCellHeight * 4, eachCellLength * 3, '#de0034'); //sector-2
    this.makeSqareBox(map, 30203, company3_lat, company3_lng + 0.004, eachCellHeight * 4, eachCellLength * 3, '#de0034'); //sector-3

    this.makeSqareBox(map, 30300, company3_lat - 0.003, company3_lng, eachCellHeight * 6, eachCellLength * 11, '#cd11f2'); //platoon-3
    this.makeSqareBox(map, 30301, company3_lat - 0.003, company3_lng - 0.004, eachCellHeight * 4, eachCellLength * 3, '#de0034'); //sector-1
    this.makeSqareBox(map, 30302, company3_lat - 0.003, company3_lng, eachCellHeight * 4, eachCellLength * 3, '#de0034'); //sector-2
    this.makeSqareBox(map, 30303, company3_lat - 0.003, company3_lng + 0.004, eachCellHeight * 4, eachCellLength * 3, '#de0034'); //sector-3

    var company4_lat = lat - 0.0045;
    var company4_lng = lng - 0.008;
    this.makeSqareBox(map, 40000, company4_lat, company4_lng, eachCellHeight * 27, eachCellLength * 13, '#1160f2'); //company-4

    this.makeSqareBox(map, 40100, company4_lat + 0.003, company4_lng, eachCellHeight * 6, eachCellLength * 11, '#cd11f2'); //platoon-1
    this.makeSqareBox(map, 40101, company4_lat + 0.003, company4_lng - 0.004, eachCellHeight * 4, eachCellLength * 3, '#de0034'); //sector-1
    this.makeSqareBox(map, 40102, company4_lat + 0.003, company4_lng, eachCellHeight * 4, eachCellLength * 3, '#de0034'); //sector-2
    this.makeSqareBox(map, 40103, company4_lat + 0.003, company4_lng + 0.004, eachCellHeight * 4, eachCellLength * 3, '#de0034'); //sector-3

    this.makeSqareBox(map, 40200, company4_lat, company4_lng, eachCellHeight * 6, eachCellLength * 11, '#cd11f2'); //platoon-2
    this.makeSqareBox(map, 40201, company4_lat, company4_lng - 0.004, eachCellHeight * 4, eachCellLength * 3, '#de0034'); //sector-1
    this.makeSqareBox(map, 40202, company4_lat, company4_lng, eachCellHeight * 4, eachCellLength * 3, '#de0034'); //sector-2
    this.makeSqareBox(map, 40203, company4_lat, company4_lng + 0.004, eachCellHeight * 4, eachCellLength * 3, '#de0034'); //sector-3

    this.makeSqareBox(map, 40300, company4_lat - 0.003, company4_lng, eachCellHeight * 6, eachCellLength * 11, '#cd11f2'); //platoon-3
    this.makeSqareBox(map, 40301, company4_lat - 0.003, company4_lng - 0.004, eachCellHeight * 4, eachCellLength * 3, '#de0034'); //sector-1
    this.makeSqareBox(map, 40302, company4_lat - 0.003, company4_lng, eachCellHeight * 4, eachCellLength * 3, '#de0034'); //sector-2
    this.makeSqareBox(map, 40303, company4_lat - 0.003, company4_lng + 0.004, eachCellHeight * 4, eachCellLength * 3, '#de0034'); //sector-3


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

  DrawPolygon(point: any, r1: any, r2: any, r3: any, r4: any, rotation: any, vertexCount: any, strokeColour: any, strokeWeight: any, Strokepacity: any, fillColour: any, fillOpacity: any, opts: any, tilt: any, idparam: number) {
    var modelPloy: PolygonBox = {
      id: 0,
      latlng:[],
      height: 0,
      length: 0,
      strockColor: '',
      fillColor: '',
      pointLat: 0,
      pointLng: 0
    };
    modelPloy.id = idparam;
    modelPloy.height = r1;
    modelPloy.length = r2;
    modelPloy.strockColor = strokeColour;
    modelPloy.fillColor = fillColour;
    modelPloy.pointLat = point.lat();
    modelPloy.pointLng = point.lng();
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
    for (var i = I1; i <= 360 ; i += step) {
      var r1a = flop ? r1 : r3;
      var r2a = flop ? r2 : r4;
      flop = -1 - flop;
      var y = r1a * Math.cos(i * Math.PI / 180);
      var x = r2a * Math.sin(i * Math.PI / 180);
      var lng = (x * Math.cos(rot) - y * Math.sin(rot)) / lngConv;
      var lat = (y * Math.cos(rot) + x * Math.sin(rot)) / latConv;

      points.push(new google.maps.LatLng(point.lat() + lat, point.lng() + lng));

      modelPloy.latlng.push({lat: point.lat() + lat, lng : point.lng() + lng}); // store local
    }
    console.log(points.length)
    points.forEach(element => {
      console.log('lat', element.lat());
      console.log('lng', element.lng());
      //this.createMarker([{lat: element.lat(), lng: element.lng(), type: 'hospital'}])
    });


    this.mapServices.storeMapData(modelPloy);

    return (new google.maps.Polygon({
      paths: points,
      draggable: true,
      editable: true,
      strokeColor: strokeColour,
      strokeWeight: strokeWeight,
      strokeOpacity: Strokepacity,
      fillColor: fillColour,
      fillOpacity: fillOpacity
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

  drawFromLocalStorage() {
    console.log(this.mapServices.getMapData());
    var mapData = JSON.parse(this.mapServices.getMapData());

    if (mapData.length > 0) {
      mapData.forEach((data: RectangleBox) => {
        this.makeSqareBox(this.mapEvent, data.lat, data.lng, data.height, data.length, data.strockColor, data.fillColor);
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

  rotatePolygon(polygon: any, angle: any) {
    var map = polygon.getMap();
    var prj = map.getProjection();
    var origin = prj.fromLatLngToPoint(polygon.getPath().getAt(0)); //rotate around first point

    var coords = polygon.getPath().getArray().map(function (latLng: any) {
      var point = prj.fromLatLngToPoint(latLng);
      var rotatedLatLng = prj.fromPointToLatLng(rotatePoint(point, origin, angle));
      return { lat: rotatedLatLng.lat(), lng: rotatedLatLng.lng() };
    });

    polygon.setPath(coords);
    function rotatePoint(point: any, origin: any, angle: any) {
      var angleRad = angle * Math.PI / 180.0;
      return {
        x: Math.cos(angleRad) * (point.x - origin.x) - Math.sin(angleRad) * (point.y - origin.y) + origin.x,
        y: Math.sin(angleRad) * (point.x - origin.x) + Math.cos(angleRad) * (point.y - origin.y) + origin.y
      };
    }
  }


  getAngleFrom2Point(point1: any, point2: any, markerEvent: any) {
    // var dx = point1.lng() - point1.lat();
    // var dy = point2.lng() - point2.lat();
    // var ang = Math.atan2(dy, dx) * 180 / Math.PI;

    this.rotateDegree = google.maps.geometry.spherical.computeHeading(point1, point2);
    console.log("marker heading", this.rotateDegree);

    this.processDrawing(markerEvent, this.mapEvent);

  }
}

