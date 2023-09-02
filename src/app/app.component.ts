import { Component, ElementRef, OnInit,AfterViewInit } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
  private map: L.Map | any = '';
  private centroid: L.LatLngExpression = [42.3601, -71.0589]; //

  private initMap(): void {
    this.map = L.map('map', {
      center: this.centroid,
      zoom: 13
    });

    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 20,
      minZoom: 10,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    tiles.addTo(this.map);

}

  placeMarkup(e: any): void {
    if(this.map.loaded) {
      L.marker([e.latlng.lat, e.latlng.lng]).addTo(this.map);
    }
    
  }

  constructor(private elementRef:ElementRef) { }

  ngAfterViewInit(): void {
    this.initMap();
    this.map.on('click',(e: any) => {
      L.marker([e.latlng.lat, e.latlng.lng]).addTo(this.map).on("click", (e:any) => {
        alert("hi. you clicked the marker at " + e.latlng);
      });
      
    });
  }

}
