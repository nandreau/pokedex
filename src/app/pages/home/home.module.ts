import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HomePage } from './home.page';

import { HomePageRoutingModule } from './home-routing.module';
import { KeyLoggerComponent } from 'src/app/components/key-logger/key-logger.component';
import { KeyLoggerModule } from 'src/app/components/key-logger/key-logger.module';
import { HttpClientModule } from '@angular/common/http';
import { OptionsModule } from 'src/app/components/options/options.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule,
    KeyLoggerModule,
    OptionsModule
  ],
  declarations: [HomePage]
})
export class HomePageModule {}
