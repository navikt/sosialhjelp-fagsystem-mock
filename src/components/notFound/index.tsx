import React from 'react'
import {Panel} from "nav-frontend-paneler";

const NotFound = () => {
    return(
        <Panel>
            <div style={{textAlign: "center"}}>
                <p>This is not the web page you are looking for....</p>
                <img src={"404.png"} alt={""} width={"200px"}/>
            </div>
        </Panel>
    )
};

export default NotFound;