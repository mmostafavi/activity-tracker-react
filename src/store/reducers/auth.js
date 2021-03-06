import * as actionTypes from "../actions/actionTypes";

const initialState = {
    error: null,
    localZone: null,
    timeZones: null,
    idToken: null,
    localId: null,
    username: null,
    firebaseId: null,
    chains: null,
    showSpinner: false,
    redirect: false
};

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case actionTypes.CLEAR_ERROR:
            return {
                ...state,
                error: null
            };

        case actionTypes.FETCH_TIME_ZONES:
            return {
                ...state,
                timeZones: action.timeZones
            };

        case actionTypes.REDIRECT:
            return {
                ...state,
                redirect: !state.redirect
            };
        case actionTypes.SIGN_UP_START:
            return {
                ...state,
                showSpinner: true,
                error: null
            };

        case actionTypes.SIGN_UP_SUCCEED:
            return {
                ...state,
                showSpinner: false
            };

        case actionTypes.SIGN_UP_FAILED:
            return {
                ...state,
                showSpinner: false,
                error: action.error
            };

        case actionTypes.SIGN_IN_START:
            return {
                ...state,
                showSpinner: true,
                error: null
            };
        case actionTypes.SIGN_IN_SUCCEED:
            return {
                ...state,
                localZone: action.localZone,
                idToken: action.idToken,
                localId: action.localId,
                username: action.username,
                firebaseId: action.firebaseId,
                chains: action.chains,
                showSpinner: false
            };

        case actionTypes.SIGN_IN_FAILED:
            return {
                ...state,
                showSpinner: false,
                error: action.error
            };

        case actionTypes.RE_SIGN_IN:
            return {
                ...state,
                localZone: action.localZone,
                idToken: action.idToken,
                localId: action.localId,
                username: action.username,
                firebaseId: action.firebaseId
            };
        case actionTypes.LOGOUT:
            return {
                ...state,
                idToken: null,
                localId: null,
                username: null,
                localZone: null,
                firebaseId: null
            };
        default:
            return state;
    }
};

export default reducer;
