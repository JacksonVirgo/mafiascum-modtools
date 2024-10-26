import React, { useEffect, useState } from 'react';
import Checkbox from '../../components/form/Checkbox';
import { useInitial } from '../../lib/hooks/useInitial';
import { fetchQuoteHighlighting, saveQuoteHighlighting } from './background/storage';

export default function PopupQuoteHighlighting() {
    const [enabled, setEnabled] = useState<boolean | null>(null);

    useInitial(async () => {
        const quoteHighlight = await fetchQuoteHighlighting();
        setEnabled(quoteHighlight);
    });

    useEffect(() => {
        if (enabled == null) return;
        saveQuoteHighlighting(enabled);
    }, [enabled]);

    return <>
        {enabled == null && <div>...</div>}
        {enabled != null && <Checkbox label='Highlight Quotes' name='quote_highlighting' onChange={setEnabled} checked={enabled} /> }
    </>
}