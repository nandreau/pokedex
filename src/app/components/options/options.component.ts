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
      name: 'idStart',
      type: 'number',
      placeholder: 'Id de début',
      min: 1,
    },
    {
      name: 'idEnd',
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
        if (this.alert === 'types') {
          this.pokemon.downloadTypes();
        } else if (this.alert === 'pokemons' || this.alert === 'species' || this.alert === 'evolutions' || this.alert === 'moves') {
          const idStart: number = Number(value.idStart);
          const idEnd: number = Number(value.idEnd);
          if (idStart > 0 && idEnd > 0 && idStart <= idEnd) {
            let apiEndpoint: string;
            let nameLoader: string;
            switch (this.alert) {
              case 'pokemons':
                apiEndpoint = 'https://pokeapi.co/api/v2/pokemon';
                nameLoader= 'pokemons';
                break;
              case 'species':
                apiEndpoint = 'https://pokeapi.co/api/v2/pokemon-species';
                nameLoader= 'espèces';
                break;
              case 'evolutions':
                apiEndpoint = 'https://pokeapi.co/api/v2/evolution-chain';
                nameLoader= 'évolutions';
                break;
              case 'moves':
                apiEndpoint = 'https://pokeapi.co/api/v2/move';
                nameLoader= 'attaque';
                break;
            }
            this.pokemon.initData(idStart, idEnd, apiEndpoint, this.alert, nameLoader);
          } else {
            this.ctrl.toast("Attention la tranche des ids n'est pas correctement définie", "warning");
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

  ngOnInit() {

  }

  changeAlert(name: string) {
    this.alert = name;
  }

  async changeId() {
    console.log('test')
    this.outputEvent.next(JSON.stringify({idStart:this.idStart,idEnd: this.idEnd}));
  }
}

interface id {
  idEnd: number;
  idStart: number;
}