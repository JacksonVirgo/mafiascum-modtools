import React from 'react';
import ReactDOM from 'react-dom/client';
import {DialogContent} from './configParser';


export function mount() {
    const anchor = document.createElement('div');

    // the submit, full editor & preview buttons at quick reply
    const search = document.querySelector('.submit-buttons');
    search?.append(anchor)
    const root = ReactDOM.createRoot(anchor);
    root.render(<DialogContent />);
}