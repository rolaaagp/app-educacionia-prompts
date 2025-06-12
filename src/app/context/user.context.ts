import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class UserContextService {
  private _user: any | null = null;

  get currentUser(): { user: any | null } {
    return { user: this._user };
  }

  set currentUser(data: { user: any }) {
    this._user = data.user;
  }

  clear(): void {
    this._user = null;
  }
}
