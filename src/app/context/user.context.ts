import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class UserContextService {
  private _user: any | null = null;

  get currentUser(): { user: any | null } {
    return { user: this._user };
  }

  set currentUser(data: { user: any }) {
    localStorage.setItem("userEDUCACIONIA", JSON.stringify({
      "user_id": 1,
      "user_national_id": "21054344-9",
      "user_fullname": "Rolando Andrés García Pacheco",
      "user_email": "rgarcia@nexia.cl",
      "user_active": true,
      "user_custom_avatar_key": null,
      "avatar_id": null,
      "section_id": null,
      "user_created_at": "2025-06-11T14:10:00.000Z",
      "user_updated_at": "2025-06-11T14:10:00.000Z",
      "mood_id": 1,
      "insti_id": 1
    }))
    this._user = data.user;
  }

  clear(): void {
    this._user = null;
  }
}
