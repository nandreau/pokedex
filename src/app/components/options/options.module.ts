import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OptionsComponent } from './options.component';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';



@NgModule({
  declarations: [OptionsComponent],
  exports: [OptionsComponent],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
  ]
})
export class OptionsModule { }
