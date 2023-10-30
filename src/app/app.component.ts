import { Component, ElementRef, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import { CdkDragDrop, CdkDragEnd, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import * as GeoSearch from 'leaflet-geosearch';
import ResultList from 'leaflet-geosearch/dist/resultList';
import { Trip, TripMarker } from './classes/trip';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  
})
export class AppComponent implements AfterViewInit {
  private map: L.Map | any = null;
  private centroid: L.LatLngExpression = [40.7306, -73.9652];
  trip: Trip = new Trip();
  searchResults: ResultList | null = null;
  searchText: string = "";
  searchInput = GeoSearch.GeoSearchControl({
    provider: new GeoSearch.OpenStreetMapProvider(),
  });
  private uploadedFile: JSON | string = "";
  markerInEdit: number | null = null;

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
      let marker = L.marker(event.latlng, {draggable: true})
      this.map.addLayer(marker)
      this.trip.updateMarkers(marker)
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

  removeDay(index: number): void {
    this.trip.days[index].markers!.forEach( (marker: TripMarker) => {
      this.map.removeLayer(marker.markerObject)
    })
    this.trip.removeDay(index);
  }

  searchMap(event: KeyboardEvent): void {
    this.searchInput.autoSearch(event);
    this.searchText.length ? this.searchResults = this.searchInput.resultList : this.searchResults = null;
  }

  selectSearch(selectedQuery: string): void {
    this.searchInput.searchElement.handleSubmit({query: selectedQuery})
    this.setLocationLabel(selectedQuery);
    this.searchText = "";
    this.searchResults = null;
  }

  setLocationLabel(label: string): void {
    let formattedString = label.split(",")[0];
    this.trip.locationLabel = formattedString;
  }

  removeMarker(marker: L.Marker | TripMarker | any, dayIndex: number, markIndex: number): void {
    if(this.map.hasLayer(marker)) {
      this.map.removeLayer(marker);
      this.trip.removeMarker(dayIndex, markIndex)
    }
  }

  drop(event: CdkDragDrop<TripMarker[] | TripMarker[] | any>): void {
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

  readFile(event: Event): void {
    let file = (event.target as HTMLInputElement).files![0];
    const reader = new FileReader();
    reader.readAsText(file, "UTF-8")
    reader.onload = () => {
      this.uploadedFile = JSON.parse(reader.result as string);
      this.readTripFile(this.uploadedFile);
    }
  }

  readTripFile(file: string | JSON): void {
    console.log(file)
  }

  editMarker(markerIndex: number): void {
    this.markerInEdit = markerIndex;
  }

  resetEdit(): void {
    this.markerInEdit = null;
  }
}
