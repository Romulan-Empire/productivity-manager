import { SET_USER, GET_USER, SET_TOKEN, GET_TOKEN, SET_JWT } from '../actions/types';

const initialState = {
  user: '',
  jwt: '',
  token: ''
};

const user = (state = initialState, action) => {
  switch (action.type) {
    case SET_USER:
      return {
        ...state,
        user: action.payload
      }
    case SET_TOKEN:
      return {
        ...state,
        token: action.payload
      }
    case SET_JWT:
      return {
        ...state,
        jwt: action.payload
      }
    case GET_TOKEN:
      return state.token;
    default:
      return state;
  }
}

export default user;