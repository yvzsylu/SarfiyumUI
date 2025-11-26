import { createAction, props } from '@ngrx/store'
import type { User } from './auth.model'

// login action
export const login = createAction(
  '[Authentication] Login',
  props<{ username: string; password: string , rememberMe: boolean }>()
)
export const loginSuccess = createAction(
  '[Authentication] Login Success',
  props<{ user: User }>()
)
export const loginFailure = createAction(
  '[Authentication] Login Failure',
  props<{ error: string }>()
)
export const loginApiSuccess = createAction(
  '[Auth] Login API Success',
  props<{ user: User }>() // Payload, loginSuccess ile aynıdır
);
// logout action
export const logout = createAction('[Authentication] Logout')

export const logoutSuccess = createAction('[Auth] Logout Success')
