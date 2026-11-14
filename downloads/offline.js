'use strict';

const siteRoot = new URL('../', location.href);
const download = document.getElementById('download');
const statusMessage = document.getElementById('status');

async function getFile(path) {
 const response = await fetch(new URL(path, siteRoot));
 if (!response.ok) throw Error(`Could not load ${path} (${response.status}).`);
 return response;
}

async function asDataURL(response, type) {
 const blob = new Blob([await response.arrayBuffer()], {type});
 return new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = () => reject(reader.error);
  reader.readAsDataURL(blob);
 });
}

download.onclick = async () => {
 download.disabled = true;
 statusMessage.textContent = 'Preparing the offline map…';
 try {
  const [html, css, app, survey, terrain] = await Promise.all([
   getFile('index.html').then(response => response.text()),
   getFile('style.css?v=4').then(response => response.text()),
   getFile('app.js?v=4').then(response => response.text()),
   getFile('data/resource-gradients.json.gz').then(response => asDataURL(response, 'application/gzip')),
   getFile('assets/bluemap-world.webp').then(response => asDataURL(response, 'image/webp'))
  ]);
  const map = new DOMParser().parseFromString(html, 'text/html');
  const style = map.createElement('style');
  style.textContent = css;
  map.querySelector('link[rel="stylesheet"]').replaceWith(style);

  const inlineData = map.createElement('script');
  inlineData.textContent = [
   `window.IRONFALL_INLINE_DATA = ${JSON.stringify(survey.split(',')[1])};`,
   `window.IRONFALL_INLINE_BASEMAP = ${JSON.stringify(terrain)};`
  ].join('\n');
  const script = map.createElement('script');
  script.textContent = app;
  map.querySelector('script[src]').replaceWith(inlineData, script);
  const metadata = map.querySelector('a[href="assets/bluemap-metadata.json"]');
  metadata.href = new URL(metadata.getAttribute('href'), siteRoot);

  const blob = new Blob(['<!doctype html>\n', map.documentElement.outerHTML], {type: 'text/html'});
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'ironfall-resource-atlas.html';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  statusMessage.textContent = 'Offline map ready.';
 } catch (error) {
  statusMessage.textContent = error.message;
 } finally {
  download.disabled = false;
 }
};
