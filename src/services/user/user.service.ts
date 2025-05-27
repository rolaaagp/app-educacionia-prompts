import { HttpClient } from "@angular/common/http";
import { Observable, Subject } from "rxjs";
import { SocketService } from "../socket/socket.service";
import { Injectable } from "@angular/core";

export interface GetUserByEmailResponse {
  statusCode: number;
  message: string;
  status: string;
  data: {
    user_id: number;
    user_type_id: number;
    user_national_id: string;
    user_fullname: string;
    user_email: string;
    user_active: boolean;
    user_custom_avatar_key: any;
    avatar_id: any;
    section_id: number;
    user_created_at: any;
    user_updated_at: any;
    mood_id: number;
  } | null;
};

@Injectable({
  providedIn: 'root'
})
export class UserService {
  public message: Subject<any>;
  public conexion: Subject<any>;

  private readonly SOC_DOMAIN = "wss://soc-api-educacion.csff.cl/websocket";
  private readonly DOMAIN = "https://api-educacion.csff.cl";

  constructor(private readonly http: HttpClient, private readonly _socketService: SocketService) {
    this.message = _socketService.connect(this.SOC_DOMAIN);
    this._socketService.setUserMessageSubject(this.message); // se pasa el subject, no el servicio entero
    this.conexion = _socketService.connectadConfirmed$ as Subject<any>;
  }

  getByEmail(email: string): Observable<GetUserByEmailResponse> {
    const headers = { 'Content-Type': 'application/json' };
    return this.http.get<GetUserByEmailResponse>(`${this.DOMAIN}/management-api/users/email?e=${email}`, { headers });
  }
}
