/**
 * Browser Entry Point — Family Zoo v05: Containers & Supporters
 */

import { GameEngine } from '@sharpee/engine';
import { WorldModel, EntityType } from '@sharpee/world-model';
import { Parser } from '@sharpee/parser-en-us';
import { LanguageProvider } from '@sharpee/lang-en-us';
import { PerceptionService } from '@sharpee/stdlib';
import { BrowserClient, ThemeManager } from '@sharpee/platform-browser';
import { story } from './v05.js';

const THEME_STORAGE_KEY = 'familyzoo-05-theme';

ThemeManager.applyEarlyTheme(THEME_STORAGE_KEY);

const config = story.config;
const title = config.title;
const description = config.description || '';
const authors = Array.isArray(config.author)
  ? config.author.join(', ')
  : config.author;

const client = new BrowserClient({
  storagePrefix: 'familyzoo-05-',
  defaultTheme: 'modern-dark',
  themes: [
    { id: 'modern-dark', name: 'Modern Dark' },
    { id: 'dos-classic', name: 'DOS Classic' },
    { id: 'retro-terminal', name: 'Retro Terminal' },
    { id: 'paper', name: 'Paper' },
  ],
  storyInfo: {
    title,
    description,
    authors,
    version: config.version,
    engineVersion: '0.9.111',
    buildDate: new Date().toISOString().slice(0, 10),
  },
  callbacks: {
    handleStoryEvent: (event, client) => {
      if (event.type === 'command.failed') {
        const reason = (event.data as any)?.reason || '';
        if (reason.includes('UNKNOWN_VERB')) {
          client.displayText("I don't know that word.");
        } else if (reason.includes('ENTITY_NOT_FOUND')) {
          client.displayText("You don't see that here.");
        } else {
          client.displayText("I don't understand that.");
        }
        return true;
      }
      return false;
    },
  },
});

async function start(): Promise<void> {
  client.initialize({
    statusLocation: document.getElementById('location-name'),
    statusScore: document.getElementById('score-turns'),
    textContent: document.getElementById('text-content'),
    mainWindow: document.getElementById('main-window'),
    commandInput: document.getElementById('command-input') as HTMLInputElement,
    modalOverlay: document.getElementById('modal-overlay'),
    saveDialog: document.getElementById('save-dialog'),
    restoreDialog: document.getElementById('restore-dialog'),
    startupDialog: document.getElementById('startup-dialog'),
    saveNameInput: document.getElementById('save-name-input') as HTMLInputElement,
    saveSlotsListEl: document.getElementById('save-slots-list'),
    restoreSlotsListEl: document.getElementById('restore-slots-list'),
    noSavesMessage: document.getElementById('no-saves-message'),
    startupSaveInfo: document.getElementById('startup-save-info'),
    menuBar: document.getElementById('menu-bar'),
  });

  const world = new WorldModel();
  const player = world.createEntity('player', EntityType.ACTOR);
  world.setPlayer(player.id);

  const language = new LanguageProvider();
  const parser = new Parser(language);

  if ('extendParser' in story) (story as any).extendParser(parser);
  if ('extendLanguage' in story) (story as any).extendLanguage(language);

  const perceptionService = new PerceptionService();

  const engine = new GameEngine({
    world,
    player,
    parser,
    language,
    perceptionService,
  });

  client.connectEngine(engine, world);
  engine.setStory(story);

  const hooks = client.getSaveRestoreHooks();
  hooks.onRestartRequested = async () => {
    if (confirm('Are you sure you want to restart? All unsaved progress will be lost.')) {
      (client as any).saveManager.clearAutosave();
      window.location.reload();
      return false;
    }
    return false;
  };
  engine.registerSaveRestoreHooks(hooks);

  await client.start();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start);
} else {
  start();
}
