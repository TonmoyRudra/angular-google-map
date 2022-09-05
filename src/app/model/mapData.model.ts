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
  name: any;
  pointLat: number;
  pointLng: number;
  latlng: LatLng[];
  height: number;
  length: number;
  strockColor: any;
  fillColor: any;
  fillOpacity: any;
  strokeOpacity: any;
  strokeWeight: any;
  polygonMap: any;
}

export class PolygonStored {
  id: number;
  polygonMap: google.maps.Polygon;
}

export class LatLng {
  lat: number;
  lng: number;
}

export class StoreHouse {
  selectedPolygon: PolygonBox;
  selectedPolygonChildren: PolygonBox[] = [];
  selectedPolygonParentID: number;

  moveDisplacementAmount: number;
  rotateAmount: number;
  polygonStoredList: PolygonStored[] = [];


  constructor() {
    this.selectedPolygon = new PolygonBox();
    this.selectedPolygonParentID = 0;
    this.moveDisplacementAmount = 0.001;
    this.rotateAmount = 10;
  }

}


