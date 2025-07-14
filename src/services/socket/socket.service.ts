import { Injectable } from '@angular/core';
import * as Rx from 'rxjs';
import { GetUserByEmailResponse, UserService } from '../user/user.service';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private subject: Rx.Subject<MessageEvent> | undefined;
  private conectadoState = new Rx.Subject<any>();

  intervalId: any;
  isLoggedInWS: boolean = false;
  connectadConfirmed$ = this.conectadoState;

  private userMessageSubject: Rx.Subject<any> | null = null;

  setUserMessageSubject(subject: Rx.Subject<any>) {
    this.userMessageSubject = subject;
  }

  public connect(url: string): Rx.Subject<MessageEvent> {
    if (!this.subject) {
      this.subject = this.create(url);
    }
    return this.subject;
  }

  private create(url: string): Rx.Subject<MessageEvent> {
    const ws = new WebSocket(url);
    const observable = new Rx.Observable((obs: Rx.Observer<MessageEvent>) => {
      ws.onmessage = obs.next.bind(obs);
      ws.onerror = obs.error.bind(obs);
      ws.onclose = obs.complete.bind(obs);
      return () => ws.close();
    });

    ws.onopen = () => {
      this.conectadoState.next('conectado');
      const user = JSON.parse(localStorage.getItem("userEDUCACIONIA")!);
      this.getWebsocketID(user.user_id);
    };

    const observer = {
      next: (data: { action: string; data: string }) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(data));
        }
      },
    };

    return Rx.Subject.create(observer, observable);
  }

  async startWSConnection() {
    const user = {
  "user_id": 71,
  "user_national_id": "21054344-9",
  "user_fullname": "Rolando García",
  "user_email": "rgarcia@nexia.cl",
  "user_active": true,
  "user_phone": "912345678",
  "user_custom_avatar_key": null,
  "avatar_id": null,
  "user_created_at": "2025-07-14T20:42:51.772Z",
  "user_updated_at": "2025-07-14T20:42:51.772Z",
  "mood_id": null,
  "insti_id": null,
  "subject_id": null,
  "speciality_id": null,
  "profile_id": 1,
  "ed_users_section": []
}
    const minutos = 5;

    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    this.getWebsocketID(user?.user_id as number);

    this.intervalId = setInterval(() => {
      this.getWebsocketID(user?.user_id as number);
    }, !this.isLoggedInWS ? 10000 : minutos * 60 * 1000);

    return this.isLoggedInWS;
  }


  getWebsocketID(userId: number) {
    if (!this.userMessageSubject) return;

    const data = {
      type: 'onKnow',
      userId,
      roomId: 1,
      isLoggedin: this.isLoggedInWS,
    };
    const payload = { action: 'onKnow', message: JSON.stringify(data) };
    this.userMessageSubject.next(payload);
  }
}
