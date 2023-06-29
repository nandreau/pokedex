import { Component, OnInit, ViewChild } from '@angular/core';
import { Observable, filter, fromEvent, map } from 'rxjs';
 
@Component({
  selector: 'app-key-logger',
  templateUrl: './key-logger.component.html',
  styleUrls: ['./key-logger.component.scss'],
})
export class KeyLoggerComponent implements OnInit {
  keyLogger: string = "";
  keyLogger$: any;
  @ViewChild('keyInput', {static: true}) keyInput: any;

  constructor() {
  }

  ngOnInit(): void {
    this.keyLogger$ = fromEvent(this.keyInput.nativeElement, 'keydown') as Observable<KeyboardEvent>;
    this.keyLogger$ = this.keyLogger$.pipe(
      map((event: KeyboardEvent) => event),
      filter((event: KeyboardEvent) => isNaN(Number(event.key)))
    );
    this.keyLogger$.subscribe((event: KeyboardEvent) => {
      this.keyLogger += event.key;
      console.log(this.keyLogger)
    });
  }
}