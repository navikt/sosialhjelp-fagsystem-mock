import React from 'react';

const uiSchemaSaksStatus = {
    "ui:FieldTemplate": CustomFieldTemplate
};


function CustomFieldTemplate(props: any) {
    // const {id, classNames, label, help, required, description, errors, children} = props;
    const {classNames, errors, children} = props;

    return (
        <div className={classNames}>
            {/*<label htmlFor={id}>{label}{required ? "*" : null}</label>*/}
            {/*{description}*/}
            {children}
            {errors}
        </div>
    );
}

export default uiSchemaSaksStatus;