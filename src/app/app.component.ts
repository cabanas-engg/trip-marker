import { Component, ElementRef, OnInit,AfterViewInit, ViewChild } from '@angular/core';
import * as L from 'leaflet';
import { CdkDragDrop, CdkDragEnd, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

import * as GeoSearch from 'leaflet-geosearch';
import { OpenStreetMapProvider } from 'leaflet-geosearch';
import ResultList from 'leaflet-geosearch/dist/resultList';

interface marker {
  markerObject: L.Marker,
  label: string,
  order?: number,
  description?: string 
}

interface day {
  name: string, 
  markers?: marker[]
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  
})
export class AppComponent implements AfterViewInit {
  private map: L.Map | any = null;
  private centroid: L.LatLngExpression = [40.7306, -73.9652];
  days: day[] = [];
  unorderedDay: day = {name: 'Unordered', markers: []};
  searchResults: ResultList | null = null;
  searchText: string = "";
  markers: marker[] = [];
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
    this.map.on('click',(event: L.LocationEvent) => {
      let marker =  L.marker(event.latlng, {draggable: true})
      this.markers.push({markerObject: marker, label: `${this.markers.length + 1} Marker`})
      this.map.addLayer(marker)
      this.updateMarkers(marker)
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

  addDay(): number {
    return this.days.push({name: `Day ${this.days.length + 1}`, markers: []})
  }

  removeDay(index: number): void {
    this.days.splice(index, 1)
  }

  searchMap(event: KeyboardEvent): void {
    this.searchInput.autoSearch(event);
    this.searchText.length ? this.searchResults = this.searchInput.resultList : this.searchResults = null;
  }

  selectSearch(selectedQuery: string): void {
    this.searchInput.searchElement.handleSubmit({query: selectedQuery})
  }

  removeMarker(marker: L.Marker, dayIndex: number, markIndex: number): void {
    if(this.map.hasLayer(marker)) {
      this.map.removeLayer(marker)
      this.days[dayIndex].markers?.splice(markIndex, 1);
    }
  }

  updateMarkers(marker: L.Marker): void {
    if(this.days.length === 0) this.addDay(); 
    this.days[0].markers?.push({markerObject: marker, label: `Marker ${this.days[0].markers!.length + 1}`});
    // this.unorderedDay.markers?.push({markerObject: marker, label: `Marker ${this.unorderedDay.markers.length + 1}`})
  }

  drop(event: CdkDragDrop<marker[] | any>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
  }

}
