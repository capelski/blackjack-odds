import React from 'react';
import ReactDOM from 'react-dom';
import Modal from 'react-modal';
import { App } from './app';

const appPlaceholder = document.getElementById('app-placeholder');

Modal.setAppElement(appPlaceholder!);
ReactDOM.render(<App />, appPlaceholder);
