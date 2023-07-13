import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Firestore, doc, runTransaction, DocumentReference, DocumentSnapshot, getDoc } from '@angular/fire/firestore';
import { setDoc  } from '@firebase/firestore';
import { firstValueFrom } from 'rxjs';
import { Move, Pokemon, PokemonType } from '../models/pokemons-type';
import { ControllerService } from './controller.service';

@Injectable({
  providedIn: 'root'
})
export class PokemonsService {
  constructor(private http: HttpClient,
    private ctrl: ControllerService,
    private firestore: Firestore) {}

  async downloadImage(imageUrl: string, imageName: string) {
    const response = await firstValueFrom(this.http.get(imageUrl, { responseType: 'blob' }));
    
    if (!response) {
      console.log(`Erreur lors du téléchargement de l'image ${imageName}.png`);
      return;
    }
    const blob = new Blob([response], { type: 'image/png' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${imageName}.png`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  async downloadTypes() {
    try {
      const result: PokemonType[] = await firstValueFrom(this.http.get<PokemonType[]>(`https://pokebuildapi.fr/api/v1/types`));
      console.log(result);
      this.ctrl.loader(`0/${result.length} types téléchargés...`);
      for (let count = 0; count < result.length; count++) {
        const { image, englishName } = result[count];
        const imageName = englishName.toLowerCase();
        await this.downloadImage(image, imageName);
        this.ctrl.updateString(`${count+1}/${result.length} types téléchargés...`);
      }
      this.ctrl.dismissLoader();
    } catch (error) {
      console.log('Erreur lors du téléchargement');
      this.ctrl.toast('Erreur lors du téléchargement','warning');
      this.ctrl.dismissLoader();
    }
  }

  async initData(idStart: number, idEnd: number, apiEndpoint: string, collectionName: string, nameLoader: string) {
    const loadingMessage = `0/${idEnd - idStart + 1} ${nameLoader} récupérés...`;
    const errorMessage = `Erreur lors de la récupération des ${nameLoader} avec l'id :`;
  
    this.ctrl.loader(loadingMessage);
    const updates: { ref: DocumentReference, data: any }[] = [];
  
    for (let id = idStart; id <= idEnd; id++) {
      try {
        const result: any = await firstValueFrom(this.http.get<any>(`${apiEndpoint}/${id}`));
        this.ctrl.updateString(`${id - idStart + 1}/${idEnd - idStart + 1} ${nameLoader} récupérés...`);
        const ref = doc(this.firestore, `${collectionName}/${id}`);
        updates.push({ ref, data: result });
      } catch (error) {
        console.log(`${errorMessage} ${id}`);
        this.ctrl.toast(`${errorMessage} ${id}`, 'warning');
        break;
      }
    }
  
    await this.updateDocumentsSimultaneously(updates, nameLoader);
    this.ctrl.dismissLoader();
  }

  async getData(id: number, collection: string) {
    try {
      const ref = doc(this.firestore, `${collection}/${id}`);
      const snapshot: DocumentSnapshot<any> = await getDoc(ref);
      if (snapshot.exists()) {
        const data = snapshot.data();
        return data;
      }
      return null;
    } catch (e) {
      console.error('Erreur lors de la récupération des données: ', e);
      return null;
    }
  }

  async updateDocumentsSimultaneously(updates: { ref: DocumentReference, data: Pokemon }[], nameLoader: string) {
    const promises = updates.map(({ ref, data }) => {
      return runTransaction(this.firestore, async (transaction) => {
        const snapshot = await transaction.get(ref);
  
        if (snapshot.exists()) {
          const newDocData = { ...data, population: snapshot.data()['population'] + 1 };
          transaction.update(ref, newDocData);
        } else {
          transaction.set(ref, data);
        }
      });
    });
  
    const totalCount = promises.length;
    let successCount = 0;
  
    try {
      await Promise.all(
        promises.map(async (promise, index) => {
          try {
            await promise;
            successCount++;
          } catch (error) {
            console.log('Erreur lors de la mise à jour/création du document : ', error);
          } finally {
            this.ctrl.updateString(`${successCount}/${totalCount} ${nameLoader} mis à jour...`);
          }
        })
      );
    
      this.ctrl.toast(`La base de données des  ${nameLoader} a été mise à jour !`, 'success');
    } catch (error) {
      console.log('Erreur lors de la mise à jour/création du document : ', error);
      this.ctrl.toast('Erreur lors de la mise à jour/création du document', 'error');
    }
  }
}