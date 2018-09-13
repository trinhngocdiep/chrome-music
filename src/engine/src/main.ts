import { Engine } from './engine';
declare const chrome;

const engine = window['engine'] = new Engine();

initContextMenu();

function initContextMenu() {
  const contextMenus = chrome && chrome.contextMenus;
  if (!contextMenus) {
    return;
  }
  const id = 'playercontrol';
  const contexts = ['browser_action'];
  contextMenus.create({
    id: id,
    title: 'Play all music',
    contexts: contexts,
    onclick: function () {
      engine.playAllMusic();
    }
  });

  engine.musicPlayer.onStatusChange = function () {
    if (engine.musicPlayer.playing) {
      contextMenus.update(id, {
        title: 'Pause',
        onclick: function () {
          engine.musicPlayer.pause();
        }
      });
    } else {
      contextMenus.update(id, {
        title: 'Resume',
        onclick: function () {
          engine.musicPlayer.resume();
        }
      });
    }
  };
}