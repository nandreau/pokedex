import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KeyLoggerComponent } from './key-logger.component';



@NgModule({
  declarations: [KeyLoggerComponent],
  exports: [KeyLoggerComponent],
  imports: [
    CommonModule
  ]
})
export class KeyLoggerModule { }
