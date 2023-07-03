import { Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut
} from '@angular/fire/auth';
import { doc, DocumentSnapshot, Firestore } from '@angular/fire/firestore';
import { setDoc, getDoc } from '@firebase/firestore';
import { ControllerService } from './controller.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private auth: Auth,
    private firestore: Firestore,
    private ctrl: ControllerService) {}

  async register({ email, password }: { email: string; password: string }) {
    try {
      const credentials = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      const ref = doc(this.firestore, `users/${credentials.user.uid}`);
      setDoc(ref, { email, idStart:1, idEnd: 150});
      return credentials;
    } catch (e) {
      return null;
    }
  }

  async login({ email, password }: { email: string; password: string }) {
    try {
      const credentials = await signInWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      console.log(credentials)
      return credentials;
    } catch (e) {
      return null;
    }
  }

  resetPw(email: string) {
    return sendPasswordResetEmail(this.auth, email);
  }

  logout() {
    return signOut(this.auth);
  }

  async updateId(idStart: number, idEnd: number) {
    try {
      const user = this.auth.currentUser;
      if (user) {
        const uid = user.uid;
        const ref = doc(this.firestore, `users/${uid}`);
        await setDoc(ref, { idStart, idEnd }, { merge: true });
      }
    } catch (e) {
      console.error('Erreur lors de la mise à jour de la plage des ids : ', e);
      this.ctrl.toast('Erreur lors de la mise à jour de la plage des ids','warning');
    }
  }

  async getIdStartAndEnd(): Promise<{ idStart: number; idEnd: number } | null> {
    try {
      const user = this.auth.currentUser;
      if (user) {
        const uid = user.uid;
        const ref = doc(this.firestore, `users/${uid}`);
        const snapshot: DocumentSnapshot<any> = await getDoc(ref);
        if (snapshot.exists()) {
          const data = snapshot.data();
          return { idStart: data.idStart, idEnd: data.idEnd };
        }
      }
      return null;
    } catch (e) {
      console.error('Error retrieving user ID:', e);
      return null;
    }
  }
}
