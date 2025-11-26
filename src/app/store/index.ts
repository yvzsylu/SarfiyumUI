import { ActionReducerMap } from '@ngrx/store'
import { LayoutState, layoutReducer } from './layout/layout-reducers'
import { calendarReducer, type CalendarState } from './calendar/calendar.reducer'
// 1. IMPORT EKLE: Authentication reducer ve state'ini çağır
import { authenticationReducer, AuthenticationState } from './authentication/authentication.reducer'

export interface RootReducerState {
  layout: LayoutState,
  Calendar: CalendarState,
  // 2. STATE TİPİNİ EKLE
  authentication: AuthenticationState 
}

export const rootReducer: ActionReducerMap<RootReducerState> = {
  layout: layoutReducer,
  Calendar: calendarReducer,
  // 3. REDUCER'I HARİTAYA EKLE (İsim 'authentication' olmak ZORUNDA)
  // Çünkü selector dosyan ('authentication') anahtarını arıyor.
  authentication: authenticationReducer 
}