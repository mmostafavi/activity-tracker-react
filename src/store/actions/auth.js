import * as actionTypes from "./actionTypes";
import axios from "axios";
import { initChains } from "./index";
import { initDates, initDatesSucceed } from "./dates";

let API_KEY = "AIzaSyApduN0lRUQC9poX9rNAWSBhf0jtBHhly8";

//fetching time zone
export const fetchTimeZones = timeZones => {
    return {
        type: actionTypes.FETCH_TIME_ZONES,
        timeZones: timeZones
    };
};

export const fetchZones = () => {
    return dispatch => {
        axios
            .get("https://worldtimeapi.org/api/timezone")
            .then(res => dispatch(fetchTimeZones(res.data)))
            .catch(error => console.log(error));
    };
};

//sign up
export const signUpStart = () => {
    return {
        type: actionTypes.SIGN_UP_START
    };
};

export const signUpSucceed = () => {
    return {
        type: actionTypes.SIGN_UP_SUCCEED
    };
};

export const signUpFailed = () => {
    return {
        type: actionTypes.SIGN_UP_FAILED
    };
};

export const registerOnDatabase = ({register: userData, signIn: signInData}) => {
    return dispatch => {
        axios
            .post(
                "https://activity-checker.firebaseio.com/users.json",
                userData
            )
            .then(res => {
                dispatch(signIn(signInData))
            })
            .catch(error => console.log(error));
    };
};

// logout
export const logout = () => {
    localStorage.removeItem("idToken");
    localStorage.removeItem("localId");
    localStorage.removeItem("expiresIn");
    localStorage.removeItem("username");
    localStorage.removeItem("localZone");
    return {
        type: actionTypes.LOGOUT
    };
};
//logout

export const checkAuthTime = time => {
    return dispatch => {
        setTimeout(() => {
            dispatch(logout());
        }, time * 1000);
    };
};

// redirect to home
export const resetRedirect = () => {
    return dispatch => {
        dispatch(redirect());
        setTimeout(() => {
            return dispatch(redirect());
        }, 100);
    };
};

export const redirect = () => {
    return {
        type: actionTypes.REDIRECT
    };
};

export const signUpUser = data => {
    return dispatch => {
        dispatch(signUpStart());
        axios
            .post(
                `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`,
                {
                    email: data.email,
                    password: data.password,
                    returnSecureToken: true
                }
            )
            .then(res => {
                dispatch(
                    registerOnDatabase({
                        register: {
                            userId: res.data.localId,
                            username: data.username,
                            localZone: data.localZone
                        },
                        signIn: {
                            email: data.email,
                            password: data.password
                        }
                    })
                );

                // dispatch(resetRedirect());
                dispatch(signUpSucceed());
            })

            .catch(error => {
                console.log(error);
                dispatch(signUpFailed(error));
            });
    };
};

export const reSignIn = () => {
    return {
        type: actionTypes.RE_SIGN_IN,
        username: localStorage.getItem("username"),
        idToken: localStorage.getItem("idToken"),
        localZone: localStorage.getItem("localZone"),
        localId: localStorage.getItem("localId"),
        firebaseId: localStorage.getItem("firebaseId")
    };
};

export const checkAuthState = isChainsNull => {
    return dispatch => {
        const idToken = localStorage.getItem("idToken");
        if (!idToken) {
            dispatch(logout());
        } else {
            const expiresIn = new Date(localStorage.getItem("expiresIn"));
            if (new Date() < expiresIn) {
                dispatch(
                    checkAuthTime(
                        Math.floor(
                            (expiresIn.getTime() - new Date().getTime()) / 1000
                        )
                    )
                );
                dispatch(reSignIn());

                dispatch(
                    initChains(JSON.parse(localStorage.getItem("chains")))
                );

                dispatch(
                    initDatesSucceed(JSON.parse(localStorage.getItem("dates")))
                );
            } else {
                dispatch(logout());
            }
        }
    };
};

//sign in
export const singInStart = () => {
    return {
        type: actionTypes.SIGN_IN_START
    };
};

export const signInSucceed = userData => {
    localStorage.setItem("localId", userData.localId);
    localStorage.setItem("idToken", userData.idToken);
    if (userData.expiresIn) {
        localStorage.setItem(
            "expiresIn",
            new Date(new Date().getTime() + userData.expiresIn * 1000)
        );
    }

    localStorage.setItem("username", userData.username);
    localStorage.setItem("localZone", userData.localZone);
    localStorage.setItem("firebaseId", userData.firebaseId);

    return {
        type: actionTypes.SIGN_IN_SUCCEED,
        idToken: userData.idToken,
        localId: userData.localId,
        localZone: userData.localZone,
        username: userData.username,
        firebaseId: userData.firebaseId,
        chains: userData.chains
    };
};

export const signInFailed = error => {
    return {
        type: actionTypes.SIGN_IN_FAILED,
        error: error
    };
};

export const fetchUserData = userData => {
    return dispatch => {
        axios
            .get("https://activity-checker.firebaseio.com/users.json")
            .then(res => {
                let user = null;
                let firebaseId = null;
                for (let key in res.data) {
                    if (res.data[key].userId === userData.localId) {
                        user = res.data[key];
                        firebaseId = key;
                    }
                }

                dispatch(
                    signInSucceed({
                        idToken: userData.idToken,
                        localId: userData.localId,
                        expiresIn: userData.expiresIn,
                        username: user.username,
                        localZone: user.localZone,
                        firebaseId: firebaseId
                    })
                );
                if (!(typeof user.chains === "undefined")) {
                    dispatch(initChains(user.chains));
                }
                dispatch(initDates(user.localZone));
            });
    };
};

export const signIn = signInData => {
    return dispatch => {
        dispatch(singInStart());
        axios
            .post(
                `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`,
                {
                    email: signInData.email,
                    password: signInData.password,
                    returnSecureToken: true
                }
            )
            .then(res => {
                dispatch(fetchUserData(res.data));
            })
            .catch(error => {
                dispatch(signInFailed(error));
            });
    };
};

export const clearError = () => {
    return {
        type: actionTypes.CLEAR_ERROR
    };
};
