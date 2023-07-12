import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { IonRouterOutlet } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { ControllerService } from 'src/app/services/controller.service';
import { PokemonsService } from 'src/app/services/pokemons.service';

@Component({
  selector: 'app-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.scss'],
})
export class OptionsComponent implements OnInit {
  @Output() outputEvent: EventEmitter<string> = new EventEmitter<string>();
  presentingElement: HTMLIonRouterOutletElement;
  alert: string = "";
  idStart: number = 1;
  idEnd: number = 150;
  public alertInputs = [
    {
      name: 'startId',
      type: 'number',
      placeholder: 'Id de début',
      min: 1,
    },
    {
      name: 'endId',
      type: 'number',
      placeholder: 'Id de fin',
      min: 1,
    },
  ];
  public alertButtons = [
    {
      text: 'Annuler',
      role: 'cancel',
    },
    {
      text: 'Valider',
      role: 'confirm',
      handler: (value: id) => {
        if (this.alert === 'types'){
          this.pokemon.downloadTypes();
        }else if (this.alert === 'pokemons' || this.alert === 'moves'){
          const startId: number = value.startId;
          const endId: number = value.endId;
          if (startId > 0 && endId > 0 && startId <= endId) {
            switch (this.alert) {
              case 'pokemons':
                this.pokemon.initPokemons(startId, endId);
                break;
              case 'moves':
                this.pokemon.initMoves(startId, endId);
                break;
            }
          } else {
            this.ctrl.toast("Attention la tranche des ids n'est pas correctement définit", "warning");
          }
        }
      },
    },
  ];

  constructor(private authService: AuthService,
    private pokemon: PokemonsService,
    private routerOutlet: IonRouterOutlet,
    private ctrl: ControllerService) {
    this.presentingElement = routerOutlet.nativeEl;
  }

  ngOnInit() { }

  changeAlert(name: string) {
    this.alert = name;
  }

  async changeId() {
    console.log('test')
    this.outputEvent.next(JSON.stringify({startId:this.idStart,endId: this.idEnd}));
  }
}

interface id {
  endId: number;
  startId: number;
}