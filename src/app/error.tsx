'use client';

import React, { ReactElement, useEffect } from 'react';
import { Alert, BodyShort, Heading, Link } from '@navikt/ds-react';

type Props = {
    error: Error;
    reset: () => void;
};

function Error({ error }: Props): ReactElement {
    useEffect(() => {
        console.error(error);
    });

    return (
        <Alert variant="warning">
            <Heading size="medium" level="3" spacing>
                En ukjent feil har oppstått.
            </Heading>
            <BodyShort spacing>
                Du kan prøve å <Link href="">laste siden på nytt</Link>.
            </BodyShort>
        </Alert>
    );
}

export default Error;
