import { PolygonBox, RectangleBox } from './../app/model/mapData.model';
import { Injectable } from '@angular/core';
import {
  map,
  catchError,
  flatMap,
  mergeMap,
  toArray,
  tap,
  switchMap,
  concatMap,
} from 'rxjs/operators';
import { Observable, throwError, Subject, BehaviorSubject, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MapService {
  SERVER_URL = 'http://3.145.212.247:8020';

  placeslocationsApiUrl = this.SERVER_URL + '/placeslocations';
  mapDataList: any[] = [];

  constructor(private http: HttpClient) { }


  getPlacesLocations(body: FormData): Observable<any> {

    var headers = new HttpHeaders();
    // headers = headers.append('Content-Type', 'application/json');
    headers = headers.append('Access-Control-Allow-Origin', '*');

    //   return this.http.get('http://3.145.212.247:8020/profile',{headers}).pipe(
    //   map((x: any) => x),
    //   map((x: any) => x),
    //   catchError((error: Response) => {
    //     return throwError(error);
    //   })
    // );

    return this.http.post(this.placeslocationsApiUrl, body, { headers }).pipe(
      map((x: any) => x),
      map((x: any) => x),
      catchError((error: Response) => {
        return throwError(error);
      })
    );

  }

  storeMapData(data: any){
    this.mapDataList.push(data);
    localStorage.setItem('mapData',JSON.stringify(this.mapDataList));
  }


  getMapData(){
    return JSON.parse(JSON.stringify(localStorage.getItem('mapData')));
  }
}
