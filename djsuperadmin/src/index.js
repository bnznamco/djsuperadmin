import styles from './scss/styles.scss?inline';
import './js/djsuperadmin.core';

// The bundle is injected on its own, so inject the compiled styles too.
const style = document.createElement('style');
style.textContent = styles;
document.head.appendChild(style);
