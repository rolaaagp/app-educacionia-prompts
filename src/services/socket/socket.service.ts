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
    const user = JSON.parse(localStorage.getItem("userEDUCACIONIA") as string) as GetUserByEmailResponse["data"];
    const minutos = 5;

    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    this.intervalId = setInterval(() => {
      this.getWebsocketID(user?.user_id as number);
      if (this.intervalId) {
        this.startWSConnection();
      }
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
