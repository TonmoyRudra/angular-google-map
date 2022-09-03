export class RectangleBox {
  id?: number;
  lat: number;
  lng: number;
  height: number;
  length: number;
  strockColor: any;
  fillColor: any;
}

export class PolygonBox {
  id: number;
  pointLat: number;
  pointLng: number;
  latlng:LatLng[];
  height: number;
  length: number;
  strockColor: any;
  fillColor: any;
}

export class LatLng {
 lat: number;
 lng: number;
}

export class StoreHouse {
  selectedPolygon: PolygonBox;
  selectedPolygonChildren: any =[];
  selectedPolygonParentID: number;

  constructor() {
    this.selectedPolygon = new PolygonBox();
    this.selectedPolygonParentID = 0;
 }

 }


