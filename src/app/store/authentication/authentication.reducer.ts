import { createReducer, on } from '@ngrx/store';
import {
  login,
  loginFailure,
  loginSuccess,
  logout,
} from './authentication.actions';
import type { User } from './auth.model';

export type AuthenticationState = {
  isLoggedIn: boolean;
  user: User | null;
  error: string | null;
};

const initialState: AuthenticationState = {
  isLoggedIn: false,
  user: null,
  error: null,
};

export const authenticationReducer = createReducer(
  initialState,
  
  // Login işlemi başladığında hata mesajını temizle
  on(login, (state) => ({ ...state, error: null })),
  
  // Başarılı girişte kullanıcıyı set et ve loggedIn yap
  on(loginSuccess, (state, { user }) => ({
    ...state,
    isLoggedIn: true,
    user,
    error: null,
  })),
  
  // Hata durumunda error mesajını set et (user null kalsın)
  on(loginFailure, (state, { error }) => ({ 
    ...state, 
    error,
    isLoggedIn: false, // Garanti olsun diye false çekiyoruz
    user: null
  })),

  // Logout olduğunda her şeyi sıfırla
  on(logout, (state) => ({
    ...state,
    isLoggedIn: false, // <--- BU KISIM EKSİKTİ
    user: null,
    error: null
  }))
);