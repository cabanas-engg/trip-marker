import { Component, ElementRef, OnInit,AfterViewInit, ViewChild } from '@angular/core';
import * as L from 'leaflet';
import { CdkDragEnd } from '@angular/cdk/drag-drop';

import * as GeoSearch from 'leaflet-geosearch';
import { OpenStreetMapProvider } from 'leaflet-geosearch';
import ResultList from 'leaflet-geosearch/dist/resultList';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  
})
export class AppComponent implements AfterViewInit {
  private map: L.Map | any = null;
  private centroid: L.LatLngExpression = [42.3601, -71.0589];
  days: string[] = [];
  searchResults: ResultList | null = null;
  searchText: string = "";
  searchInput = GeoSearch.GeoSearchControl({
    provider: new GeoSearch.OpenStreetMapProvider(),
  });
  provider = new OpenStreetMapProvider({  
    params: {
      email: 'john@example.com'
    },
  });

  private initMap(): void {
    this.map = L.map('map', {
      center: this.centroid,
      zoom: 13
    });

    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 20,
      minZoom: 5,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    tiles.addTo(this.map);
    this.map.addControl(this.searchInput);
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

  dragEnd(event: CdkDragEnd) {
    this.clickMap(event.dropPoint.x,event.dropPoint.y );
  }

  clickMap(x:number, y: number): void {
    let position = document.elementFromPoint(x,y);
    let event = new MouseEvent("click", { clientX: x, clientY: y, bubbles: true })
    position?.dispatchEvent(event);
  }

  addDay(): void {
    this.days.push(`Day ${this.days.length + 1}`)
  }

  removeDay(index: number): void {
    this.days.splice(index, 1)
  }

  searchMap(event: KeyboardEvent): void {
    this.searchInput.autoSearch(event);
    this.searchText.length ? this.searchResults = this.searchInput.resultList : this.searchResults = null;
  }

}
