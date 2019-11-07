import * as React from 'react';
import {useEffect, useState} from "react";

interface State {
    showSplashScreen: boolean
}

const initialState = {
    showSplashScreen: true //seconds
};

const SplashScreen: React.FC<{}> = ( {children}) => {

    const [state, setState] = useState(initialState as State);
    const slutterMedSlash = window.location.href.endsWith('/');

    useEffect(() => {
        setTimeout(() => {
            setState({...state, showSplashScreen: false})
        }, 4000);
    });


    if (state.showSplashScreen){
        return (
            <div className={"splashscreen splashscreen-wrapper"}>
                <div className={"splashscreen-content"}>
                    <div className={'splashscreen-img'}>
                        <img src={slutterMedSlash ? 'img/image3.png' : '/img/image3.png'} alt={''}/>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div>
            {children}
        </div>
    )
};

export default SplashScreen;